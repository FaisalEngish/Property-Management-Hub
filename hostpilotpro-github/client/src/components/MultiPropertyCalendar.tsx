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
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Eye, 
  FileText,
  User
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
}

export function MultiPropertyCalendar({ properties, bookings }: MultiPropertyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

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

  const getBookingsForDate = (date: Date | null) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const checkIn = booking.checkIn.split('T')[0];
      const checkOut = booking.checkOut.split('T')[0];
      return dateString >= checkIn && dateString <= checkOut;
    }).filter(booking => 
      selectedProperty === 'all' || booking.propertyId.toString() === selectedProperty
    );
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
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
              
              return (
                <div 
                  key={index} 
                  className={`min-h-[120px] p-2 border rounded-lg ${
                    day ? 'bg-white hover:bg-slate-50' : 'bg-slate-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map(booking => (
                          <div key={booking.id} className="group">
                            <div className={`text-xs p-1 rounded border cursor-pointer transition-all ${getStatusColor(booking.status)}`}>
                              <div className="font-medium truncate">
                                {booking.guestName}
                              </div>
                              <div className="truncate opacity-75">
                                {booking.propertyName}
                              </div>
                            </div>
                            
                            {/* Quick Action Buttons (shown on hover) */}
                            <div className="invisible group-hover:visible flex gap-1 mt-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-1 text-xs"
                                title="View Guest Profile"
                              >
                                <User className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-1 text-xs"
                                title="View Invoice"
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-1 text-xs"
                                title="View Details"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-slate-500 text-center py-1">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
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