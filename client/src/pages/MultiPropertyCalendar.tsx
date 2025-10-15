import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Bed, User, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { format, addDays, startOfDay, differenceInDays, isSameDay, isWithinInterval } from "date-fns";

interface Property {
  id: number;
  name: string;
  bedrooms?: number;
  location?: string;
}

interface Booking {
  id: number;
  propertyId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface BookingSpan {
  booking: Booking;
  startIndex: number;
  span: number;
}

export default function MultiPropertyCalendar() {
  const [search, setSearch] = useState('');
  const [filterProperty, setFilterProperty] = useState('all');
  const [startDate, setStartDate] = useState(new Date());

  // Fetch properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Generate dates for horizontal scroll (30 days from start date)
  const dates = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  // Filter properties
  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterProperty === 'all' || p.id.toString() === filterProperty)
  );

  // Calculate booking spans for timeline rendering
  const getBookingSpans = (propertyId: number): BookingSpan[] => {
    const propertyBookings = bookings.filter(b => b.propertyId === propertyId);
    const spans: BookingSpan[] = [];
    
    const rangeStart = startOfDay(dates[0]);
    // Range end is exclusive (one day after the last visible date)
    const rangeEnd = addDays(startOfDay(dates[dates.length - 1]), 1);

    propertyBookings.forEach(booking => {
      const checkIn = startOfDay(new Date(booking.checkIn));
      const checkOut = startOfDay(new Date(booking.checkOut));
      
      // Check if booking overlaps with our visible date range
      const overlaps = checkIn < rangeEnd && checkOut > rangeStart;
      
      if (overlaps) {
        // Calculate the visible portion of the booking
        const visibleStart = checkIn < rangeStart ? rangeStart : checkIn;
        const visibleEnd = checkOut > rangeEnd ? rangeEnd : checkOut;
        
        // Find the start index in our dates array
        const startIndex = dates.findIndex(date => 
          isSameDay(startOfDay(date), visibleStart)
        );
        
        if (startIndex >= 0) {
          // Calculate how many days the booking spans in visible range
          const span = differenceInDays(visibleEnd, visibleStart);
          
          if (span > 0) {
            spans.push({
              booking,
              startIndex,
              span
            });
          }
        }
      }
    });

    return spans;
  };

  // Check if a cell is occupied by a booking
  const isCellOccupied = (propertyId: number, dateIndex: number, spans: BookingSpan[]): boolean => {
    return spans.some(span => 
      dateIndex >= span.startIndex && dateIndex < span.startIndex + span.span
    );
  };

  // Get booking for a specific cell
  const getBookingAtCell = (propertyId: number, dateIndex: number, spans: BookingSpan[]): BookingSpan | null => {
    return spans.find(span => span.startIndex === dateIndex) || null;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'pending':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  const handlePreviousDays = () => {
    setStartDate(addDays(startDate, -7));
  };

  const handleNextDays = () => {
    setStartDate(addDays(startDate, 7));
  };

  const handleToday = () => {
    setStartDate(new Date());
  };

  const isLoading = propertiesLoading || bookingsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Multi-Property Calendar</h1>
              <p className="text-sm text-muted-foreground">Horizontal timeline with live booking data</p>
            </div>
            <Badge variant="outline" className="text-blue-600">
              Timeline View
            </Badge>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousDays} data-testid="button-prev-week">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday} data-testid="button-today">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextDays} data-testid="button-next-week">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Property</label>
                <Input
                  type="text"
                  placeholder="Search property name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search-property"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Property</label>
                <Select value={filterProperty} onValueChange={setFilterProperty}>
                  <SelectTrigger data-testid="select-filter-property">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horizontal Timeline Calendar */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading calendar data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Date Header */}
                  <div className="flex border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <div className="w-64 flex-shrink-0 border-r p-4 font-semibold bg-gray-50 dark:bg-gray-800">
                      Property
                    </div>
                    {dates.map((date, i) => {
                      const isToday = isSameDay(date, new Date());
                      return (
                        <div
                          key={i}
                          className={`w-32 flex-shrink-0 border-r p-2 text-center text-sm ${
                            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className={`font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                            {format(date, 'EEE')}
                          </div>
                          <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>
                            {format(date, 'MMM d')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Property Rows */}
                  {filteredProperties.length === 0 ? (
                    <div className="p-12 text-center">
                      <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">No properties found</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  ) : (
                    filteredProperties.map((property) => {
                      const bookingSpans = getBookingSpans(property.id);
                      
                      return (
                        <div key={property.id} className="flex border-b hover:bg-muted/30 transition-colors">
                          {/* Property Info */}
                          <div className="w-64 flex-shrink-0 border-r p-4 bg-gray-50 dark:bg-gray-800">
                            <div className="font-medium text-sm mb-1">{property.name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              {property.bedrooms && (
                                <div className="flex items-center gap-1">
                                  <Bed className="w-3 h-3" />
                                  <span>{property.bedrooms} BR</span>
                                </div>
                              )}
                              {property.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{property.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Date Cells with Booking Spans */}
                          <div className="flex relative">
                            {dates.map((date, dateIndex) => {
                              const bookingAtCell = getBookingAtCell(property.id, dateIndex, bookingSpans);
                              const isOccupied = isCellOccupied(property.id, dateIndex, bookingSpans);
                              
                              return (
                                <div
                                  key={dateIndex}
                                  className="w-32 flex-shrink-0 border-r p-1 relative"
                                  data-testid={`cell-${property.id}-${dateIndex}`}
                                >
                                  {bookingAtCell ? (
                                    // Render booking block that spans multiple cells
                                    <div
                                      className={`absolute top-1 left-1 h-[calc(100%-8px)] rounded px-2 py-1 text-white text-xs cursor-pointer transition-colors ${getStatusColor(
                                        bookingAtCell.booking.status
                                      )}`}
                                      style={{
                                        width: `calc(${bookingAtCell.span * 128}px - 8px)`,
                                        zIndex: 5
                                      }}
                                      title={`${bookingAtCell.booking.guestName}\n${bookingAtCell.booking.checkIn} - ${bookingAtCell.booking.checkOut}\nStatus: ${bookingAtCell.booking.status}`}
                                    >
                                      <div className="font-medium truncate">{bookingAtCell.booking.guestName}</div>
                                      <div className="text-[10px] opacity-90">{bookingAtCell.booking.status}</div>
                                      <div className="text-[10px] opacity-75">
                                        {bookingAtCell.span} {bookingAtCell.span === 1 ? 'day' : 'days'}
                                      </div>
                                    </div>
                                  ) : (
                                    // Empty cell (only show if not occupied by a booking)
                                    !isOccupied && (
                                      <div className="h-full bg-gray-100 dark:bg-gray-700/30 rounded opacity-50 hover:opacity-75 transition-opacity"></div>
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <span className="font-medium">Status Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500"></div>
                <span>Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span>Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-4">
              <span>Showing {filteredProperties.length} of {properties.length} properties</span>
              <span>Total bookings: {bookings.length}</span>
              <span>
                {format(dates[0], 'MMM d, yyyy')} - {format(dates[dates.length - 1], 'MMM d, yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
