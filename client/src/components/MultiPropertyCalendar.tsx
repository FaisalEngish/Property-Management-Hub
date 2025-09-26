import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useToast } from '../hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Eye, 
  FileText,
  User,
  Move
} from 'lucide-react';

interface Booking {
  id: number;
  propertyId: number;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'completed';
  totalAmount: number;
  invoiceId?: string;
  guestId?: string;
}

interface Property {
  id: number;
  name: string;
  color: string;
}

interface MultiPropertyCalendarProps {
  properties: Property[];
  bookings: Booking[];
  onBookingReschedule?: (bookingId: number, newCheckIn: string, newCheckOut: string) => void;
}

export function MultiPropertyCalendar({ properties, bookings, onBookingReschedule }: MultiPropertyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state to track optimistic updates
  const [optimisticBookings, setOptimisticBookings] = useState<Booking[]>(bookings);
  
  // Update local state when props change
  React.useEffect(() => {
    setOptimisticBookings(bookings);
  }, [bookings]);
  
  // Mutation for rescheduling bookings with optimistic updates
  const rescheduleBookingMutation = useMutation({
    mutationFn: async ({ bookingId, newCheckIn, newCheckOut }: { bookingId: number, newCheckIn: string, newCheckOut: string }) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        checkIn: newCheckIn,
        checkOut: newCheckOut
      });
    },
    onMutate: async ({ bookingId, newCheckIn, newCheckOut }) => {
      // Optimistically update the UI immediately
      const previousBookings = optimisticBookings;
      
      const updatedBookings = optimisticBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, checkIn: newCheckIn, checkOut: newCheckOut }
          : booking
      );
      
      setOptimisticBookings(updatedBookings);
      
      // Call parent callback if provided
      onBookingReschedule?.(bookingId, newCheckIn, newCheckOut);
      
      // Return rollback data
      return { previousBookings };
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch bookings to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "✅ Booking Rescheduled",
        description: `Successfully moved booking to new dates`,
        variant: "default",
      });
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousBookings) {
        setOptimisticBookings(context.previousBookings);
      }
      
      console.error('Error rescheduling booking:', error);
      toast({
        title: "❌ Rescheduling Failed",
        description: "Unable to reschedule booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), day));
    }
    
    return days;
  };

  // Helper function for safe date comparison without timezone issues
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getBookingsForDate = (date: Date | null) => {
    if (!date) return [];
    
    const dateString = formatDateString(date);
    return optimisticBookings.filter(booking => {
      const checkIn = booking.checkIn.split('T')[0];
      const checkOut = booking.checkOut.split('T')[0];
      // Treat checkout as exclusive (standard hospitality practice)
      return dateString >= checkIn && dateString < checkOut;
    }).filter(booking => 
      selectedProperty === 'all' || booking.propertyId.toString() === selectedProperty
    );
  };
  
  // Check for booking conflicts when rescheduling
  const hasConflict = (targetDate: Date, draggedBookingData: Booking) => {
    const originalCheckIn = new Date(draggedBookingData.checkIn);
    const originalCheckOut = new Date(draggedBookingData.checkOut);
    const stayDuration = Math.ceil((originalCheckOut.getTime() - originalCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const newCheckOut = new Date(targetDate);
    newCheckOut.setDate(newCheckOut.getDate() + stayDuration);
    
    // Check if any other booking conflicts with the new dates (use optimistic bookings)
    return optimisticBookings.some(booking => {
      if (booking.id === draggedBookingData.id) return false; // Skip the dragged booking itself
      if (booking.propertyId !== draggedBookingData.propertyId) return false; // Different property
      
      const existingCheckIn = new Date(booking.checkIn);
      const existingCheckOut = new Date(booking.checkOut);
      
      // Check for date overlap (exclusive checkout)
      return (
        (targetDate >= existingCheckIn && targetDate < existingCheckOut) ||
        (newCheckOut > existingCheckIn && newCheckOut <= existingCheckOut) ||
        (targetDate <= existingCheckIn && newCheckOut >= existingCheckOut)
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'checked-in': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'checked-in': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedBooking && targetDate) {
      // Validate business rules first
      if (draggedBooking.status === 'checked-in' || draggedBooking.status === 'completed') {
        toast({
          title: "❌ Cannot Reschedule",
          description: "Bookings that are checked-in or completed cannot be rescheduled.",
          variant: "destructive",
        });
        setDraggedBooking(null);
        setDragOverDate(null);
        return;
      }
      
      // Check for conflicts
      if (hasConflict(targetDate, draggedBooking)) {
        toast({
          title: "❌ Scheduling Conflict",
          description: "These dates conflict with an existing booking for this property.",
          variant: "destructive",
        });
        setDraggedBooking(null);
        setDragOverDate(null);
        return;
      }
      
      // Calculate new dates
      const originalCheckIn = new Date(draggedBooking.checkIn);
      const originalCheckOut = new Date(draggedBooking.checkOut);
      const stayDuration = Math.ceil((originalCheckOut.getTime() - originalCheckIn.getTime()) / (1000 * 60 * 60 * 24));
      
      const newCheckIn = new Date(targetDate);
      const newCheckOut = new Date(targetDate);
      newCheckOut.setDate(newCheckOut.getDate() + stayDuration);
      
      // Prevent scheduling in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newCheckIn < today) {
        toast({
          title: "❌ Invalid Date",
          description: "Cannot schedule bookings in the past.",
          variant: "destructive",
        });
        setDraggedBooking(null);
        setDragOverDate(null);
        return;
      }
      
      // Execute the rescheduling
      rescheduleBookingMutation.mutate({
        bookingId: draggedBooking.id,
        newCheckIn: newCheckIn.toISOString(),
        newCheckOut: newCheckOut.toISOString()
      });
    }
    setDraggedBooking(null);
    setDragOverDate(null);
  };

  const getBookingTooltipContent = (booking: Booking) => {
    return (
      <div className="p-2 space-y-1">
        <div className="font-semibold text-sm">{booking.guestName}</div>
        <div className="text-xs text-slate-600">{booking.propertyName}</div>
        <div className="text-xs font-medium text-emerald-600">{formatCurrency(booking.totalAmount)}</div>
        <div className="text-xs text-slate-500">Click to view details</div>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount?.toLocaleString() || '0'}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentDate);
  const filteredProperties = selectedProperty === 'all' 
    ? properties 
    : properties.filter(p => p.id.toString() === selectedProperty);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Multi-Property Calendar
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties ({properties.length})</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {draggedBooking && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200 animate-pulse">
                🔄 Rescheduling {draggedBooking.guestName}...
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[140px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-slate-600 bg-slate-50 rounded">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayBookings = getBookingsForDate(day);
              const isToday = day ? day.toDateString() === new Date().toDateString() : false;
              const isDragOver = dragOverDate && day && dragOverDate.toDateString() === day.toDateString();
              
              return (
                <TooltipProvider key={index}>
                  <div 
                    className={`min-h-[120px] p-2 border rounded-lg transition-all ${
                      day ? 'bg-white hover:bg-slate-50' : 'bg-slate-50'
                    } ${isToday ? 'ring-2 ring-emerald-500' : ''} ${
                      isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                    }`}
                    onDragOver={day ? (e) => handleDragOver(e, day) : undefined}
                    onDragLeave={handleDragLeave}
                    onDrop={day ? (e) => handleDrop(e, day) : undefined}
                  >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-sm font-medium ${
                          isToday ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {day.getDate()}
                        </div>
                        
                        {/* Status Indicator Dots */}
                        {dayBookings.length > 0 && (
                          <div className="flex gap-1">
                            {Array.from(new Set(dayBookings.map(b => b.status))).slice(0, 3).map((status, idx) => (
                              <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                  <div 
                                    className={`w-2 h-2 rounded-full ${getStatusDotColor(status)} cursor-help hover:scale-125 transition-transform`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    {status.charAt(0).toUpperCase() + status.slice(1)} ({dayBookings.filter(b => b.status === status).length})
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {dayBookings.length > 3 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-2 h-2 rounded-full bg-slate-400 cursor-help hover:scale-125 transition-transform" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">{dayBookings.length} total bookings</div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map(booking => (
                          <Tooltip key={booking.id}>
                            <TooltipTrigger asChild>
                              <div 
                                className="group cursor-pointer"
                                draggable
                                onDragStart={(e) => handleDragStart(e, booking)}
                              >
                                <div className={`text-xs p-1 rounded border transition-all hover:shadow-md group-hover:shadow-emerald-200 ${getStatusColor(booking.status)} ${draggedBooking?.id === booking.id ? 'opacity-50 scale-95' : ''}`}>
                                  <div className="font-medium truncate flex items-center gap-1">
                                    <Move className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600" />
                                    {booking.guestName}
                                  </div>
                                  <div className="truncate opacity-75">
                                    {booking.propertyName}
                                  </div>
                                  <div className="text-[10px] font-medium text-emerald-600">
                                    {formatCurrency(booking.totalAmount)}
                                  </div>
                                </div>
                                
                                {/* Quick Action Buttons (shown on hover) */}
                                <div className="invisible group-hover:visible flex gap-1 mt-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 px-1 text-xs hover:bg-emerald-100"
                                    title="View Guest Profile"
                                  >
                                    <User className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 px-1 text-xs hover:bg-emerald-100"
                                    title="View Invoice"
                                  >
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 px-1 text-xs hover:bg-emerald-100"
                                    title="View Details"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="p-0">
                              {getBookingTooltipContent(booking)}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        
                        {dayBookings.length > 2 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-slate-500 text-center py-1 hover:text-slate-700 cursor-pointer rounded hover:bg-slate-100">
                                +{dayBookings.length - 2} more
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="p-2 space-y-1">
                                <div className="font-semibold text-sm">Additional Bookings</div>
                                {dayBookings.slice(2).map(booking => (
                                  <div key={booking.id} className="text-xs">
                                    {booking.guestName} - {booking.propertyName}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </>
                  )}
                  </div>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Legend & Drag Instructions */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Booking Status Legend</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-xs">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-xs">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-xs">Checked-in</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-xs">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-xs">Cancelled</span>
              </div>
            </div>
          </div>
          
          {/* Enterprise Features Guide */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="text-sm font-medium mb-2 text-emerald-800">Enterprise Features</h4>
            <div className="text-xs text-emerald-700 space-y-1">
              <div className="flex items-center gap-2">
                <Move className="h-3 w-3" />
                <span>Drag bookings to reschedule dates instantly</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>Hover over bookings for detailed revenue & guest info</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Status dots show booking states at a glance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-800">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-xs text-blue-600">Confirmed Bookings</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-800">
              {bookings.filter(b => b.status === 'checked-in').length}
            </div>
            <div className="text-xs text-green-600">Currently Checked-in</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-800">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-xs text-yellow-600">Pending Confirmation</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-800">
              {formatCurrency(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))}
            </div>
            <div className="text-xs text-purple-600">Total Revenue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiPropertyCalendar;