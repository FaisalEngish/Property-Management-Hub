import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Filter, Plus, Users, MapPin, DollarSign, Clock, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LiveBooking {
  id: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  nightCount: number;
  guestCount: number;
  totalAmount: string;
  currency: string;
  bookingStatus: string;
  bookingSource: string;
  propertyId: number;
  ownerSplit: string;
  managementSplit: string;
  agentCommissionApplicable: boolean;
  agentCommissionAmount: string;
  specialRequests: string;
  internalNotes: string;
  createdAt: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
}

interface BookingAnalytics {
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageStayDuration: number;
  platformBreakdown: { platform: string; bookings: number; revenue: number }[];
}

const platformColors: Record<string, string> = {
  airbnb: "bg-red-100 text-red-700 border-red-200",
  vrbo: "bg-blue-100 text-blue-700 border-blue-200",
  booking: "bg-green-100 text-green-700 border-green-200",
  direct: "bg-purple-100 text-purple-700 border-purple-200",
  agoda: "bg-orange-100 text-orange-700 border-orange-200",
  expedia: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  "no-show": "bg-gray-100 text-gray-700 border-gray-200",
};

export default function LiveBookingCalendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [calendarView, setCalendarView] = useState<"month" | "list">("month");
  const [selectedBooking, setSelectedBooking] = useState<LiveBooking | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // Get properties for filter
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000,
  });

  // Get booking calendar data
  const { data: bookings = [], isLoading } = useQuery<LiveBooking[]>({
    queryKey: [
      "/api/booking-calendar",
      selectedProperty !== "all" ? selectedProperty : undefined,
      format(startOfMonth(currentDate), "yyyy-MM-dd"),
      format(endOfMonth(currentDate), "yyyy-MM-dd"),
      selectedStatus !== "all" ? selectedStatus : undefined,
      selectedSource !== "all" ? selectedSource : undefined,
    ],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Get booking analytics
  const { data: analytics } = useQuery<BookingAnalytics>({
    queryKey: [
      "/api/booking-analytics",
      selectedProperty !== "all" ? selectedProperty : undefined,
    ],
    staleTime: 2 * 60 * 1000,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return date >= checkIn && date < checkOut;
    });
  };

  const formatCurrency = (amount: string, currency: string = "THB") => {
    const symbol = currency === "THB" ? "฿" : currency === "USD" ? "$" : currency;
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleBookingClick = (booking: LiveBooking) => {
    setSelectedBooking(booking);
    setIsBookingDialogOpen(true);
  };

  const CalendarGrid = () => (
    <div className="grid grid-cols-7 gap-2">
      {/* Week headers */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
        <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {daysInMonth.map(date => {
        const dayBookings = getBookingsForDate(date);
        const isCurrentDay = isToday(date);
        
        return (
          <div
            key={date.toISOString()}
            className={`min-h-24 p-1 border rounded-lg relative ${
              isCurrentDay ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
            }`}
          >
            <div className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-blue-600" : "text-gray-900"}`}>
              {format(date, "d")}
            </div>
            
            <div className="space-y-1">
              {dayBookings.slice(0, 2).map(booking => (
                <div
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className={`text-xs p-1 rounded cursor-pointer truncate ${
                    platformColors[booking.bookingSource] || "bg-gray-100 text-gray-700"
                  }`}
                  title={`${booking.guestName} - ${booking.bookingSource.toUpperCase()}`}
                >
                  {booking.guestName.split(' ')[0]}
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className="text-xs text-gray-500 pl-1">
                  +{dayBookings.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const BookingsList = () => (
    <div className="space-y-3">
      {bookings.map(booking => (
        <Card
          key={booking.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleBookingClick(booking)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{booking.guestName}</h3>
                  <Badge className={platformColors[booking.bookingSource] || "bg-gray-100"}>
                    {booking.bookingSource.toUpperCase()}
                  </Badge>
                  <Badge className={statusColors[booking.bookingStatus] || "bg-gray-100"}>
                    {booking.bookingStatus.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.checkInDate), "MMM d")} - {format(new Date(booking.checkOutDate), "MMM d")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {booking.nightCount} night{booking.nightCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {booking.agentCommissionApplicable && (
                  <Badge variant="outline" className="text-green-600">
                    Agent Commission
                  </Badge>
                )}
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Booking Calendar</h1>
          <p className="text-gray-600">Real-time booking data with API connectivity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{analytics.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.confirmedBookings}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">฿{analytics.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.occupancyRate.toFixed(1)}%</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Stay</p>
                  <p className="text-2xl font-bold">{analytics.averageStayDuration.toFixed(1)} nights</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Label htmlFor="property-filter">Property:</Label>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48" id="property-filter">
              <SelectValue placeholder="All Properties" />
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
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="source-filter">Source:</Label>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-40" id="source-filter">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="airbnb">Airbnb</SelectItem>
              <SelectItem value="vrbo">VRBO</SelectItem>
              <SelectItem value="booking">Booking.com</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="agoda">Agoda</SelectItem>
              <SelectItem value="expedia">Expedia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter">Status:</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40" id="status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={calendarView === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setCalendarView("month")}
          >
            Month View
          </Button>
          <Button
            variant={calendarView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setCalendarView("list")}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} this month
        </div>
      </div>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : calendarView === "month" ? (
            <CalendarGrid />
          ) : (
            <BookingsList />
          )}
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      {analytics && analytics.platformBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {analytics.platformBreakdown.map(platform => (
                <div key={platform.platform} className="text-center">
                  <div className={`p-3 rounded-lg ${platformColors[platform.platform] || "bg-gray-100"}`}>
                    <p className="font-semibold capitalize">{platform.platform}</p>
                    <p className="text-sm">{platform.bookings} booking{platform.bookings !== 1 ? 's' : ''}</p>
                    <p className="text-xs">฿{platform.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Detail Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="guest">Guest Info</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Booking Reference</Label>
                    <p className="font-mono text-sm">{selectedBooking.bookingReference}</p>
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Badge className={platformColors[selectedBooking.bookingSource]}>
                      {selectedBooking.bookingSource.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label>Check-in</Label>
                    <p>{format(new Date(selectedBooking.checkInDate), "PPP")}</p>
                  </div>
                  <div>
                    <Label>Check-out</Label>
                    <p>{format(new Date(selectedBooking.checkOutDate), "PPP")}</p>
                  </div>
                  <div>
                    <Label>Nights</Label>
                    <p>{selectedBooking.nightCount}</p>
                  </div>
                  <div>
                    <Label>Guests</Label>
                    <p>{selectedBooking.guestCount}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="guest" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Guest Name</Label>
                    <p className="font-semibold">{selectedBooking.guestName}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-blue-600">{selectedBooking.guestEmail}</p>
                  </div>
                  {selectedBooking.guestPhone && (
                    <div>
                      <Label>Phone</Label>
                      <p>{selectedBooking.guestPhone}</p>
                    </div>
                  )}
                  {selectedBooking.specialRequests && (
                    <div>
                      <Label>Special Requests</Label>
                      <p className="text-sm text-gray-600">{selectedBooking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedBooking.totalAmount, selectedBooking.currency)}
                    </p>
                  </div>
                  <div>
                    <Label>Revenue Split</Label>
                    <div className="text-sm">
                      <p>Owner: {selectedBooking.ownerSplit}%</p>
                      <p>Management: {selectedBooking.managementSplit}%</p>
                    </div>
                  </div>
                  {selectedBooking.agentCommissionApplicable && (
                    <div>
                      <Label>Agent Commission</Label>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(selectedBooking.agentCommissionAmount, selectedBooking.currency)}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                {selectedBooking.internalNotes && (
                  <div>
                    <Label>Internal Notes</Label>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedBooking.internalNotes}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}