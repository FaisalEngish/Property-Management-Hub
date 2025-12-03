import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Home, Users, TrendingUp, RefreshCw, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopBar from "@/components/TopBar";

interface HostawayProperty {
  id: number;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  isActive: boolean;
}

interface HostawayBooking {
  id: number;
  propertyId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  commission: number;
  platformFee: number;
}

interface HostawayCalendar {
  propertyId: number;
  date: string;
  isAvailable: boolean;
  price: number;
  minStay: number;
}

interface HostawayEarnings {
  totalRevenue: number;
  totalCommission: number;
  totalPlatformFees: number;
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
    commission: number;
    platformFees: number;
  }>;
}

export default function Hostaway() {
  const { toast } = useToast();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // Fetch Hostaway data
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<HostawayProperty[]>({
    queryKey: ['/api/hostaway/properties'],
    retry: false,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<HostawayBooking[]>({
    queryKey: ['/api/hostaway/bookings'],
    retry: false,
  });

  const { data: calendar = [], isLoading: calendarLoading } = useQuery<HostawayCalendar[]>({
    queryKey: ['/api/hostaway/calendar'],
    retry: false,
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery<HostawayEarnings>({
    queryKey: ['/api/hostaway/earnings'],
    retry: false,
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: () => apiRequest('/api/hostaway/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }),
    onSuccess: (data) => {
      toast({
        title: "Sync Completed",
        description: `Properties: ${data.propertiesSync}, Bookings: ${data.bookingsSync}, Finances: ${data.financesSync}`,
      });
      // Invalidate all Hostaway queries
      queryClient.invalidateQueries({ queryKey: ['/api/hostaway'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatWithConversion = (amount: number, currency = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderCalendar = () => {
    if (!selectedPropertyId) {
      return (
        <div className="text-center text-muted-foreground py-8">
          Select a property to view availability calendar
        </div>
      );
    }

    const propertyCalendar = calendar.filter(c => c.propertyId === selectedPropertyId);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-sm">
            {day}
          </div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentYear, currentMonth, day);
          const dateString = date.toISOString().split('T')[0];
          const dayData = propertyCalendar.find(c => c.date === dateString);
          
          return (
            <div
              key={day}
              className={`
                p-2 text-center text-sm border rounded-md
                ${dayData?.isAvailable 
                  ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                  : 'bg-red-50 border-red-200'
                }
                ${date < today ? 'opacity-50' : ''}
              `}
            >
              <div className="font-medium">{day}</div>
              {dayData && (
                <div className="text-xs">
                  {formatWithConversion(dayData.price)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <TopBar
        title="Hostaway Integration"
        subtitle="Property synchronization and booking management"
        action={
          <Button 
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{properties.length}</div>
                <p className="text-xs text-muted-foreground">
                  {properties.filter(p => p.isActive).length} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-xs text-muted-foreground">
                  {bookings.filter(b => b.status === 'confirmed').length} confirmed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {earnings ? formatWithConversion(earnings.totalRevenue) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  From confirmed bookings
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {earnings ? formatWithConversion(earnings.totalCommission + earnings.totalPlatformFees) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Commission + fees
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                Properties synced from Hostaway platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesLoading ? (
                <div className="text-center py-8">Loading properties...</div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-medium">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{property.bedrooms} beds</span>
                          <span>{property.bathrooms} baths</span>
                          <span>Max {property.maxGuests} guests</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">
                          {formatWithConversion(property.pricePerNight)}/night
                        </div>
                        <Badge variant={property.isActive ? "default" : "secondary"}>
                          {property.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Latest bookings from Hostaway
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const property = properties.find(p => p.id === booking.propertyId);
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h3 className="font-medium">{booking.guestName}</h3>
                          <p className="text-sm text-muted-foreground">{property?.name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(booking.checkIn)}</span>
                            <span>→</span>
                            <span>{formatDate(booking.checkOut)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-medium">
                            {formatWithConversion(booking.totalAmount)}
                          </div>
                          <Badge 
                            variant={
                              booking.status === 'confirmed' ? "default" : 
                              booking.status === 'pending' ? "secondary" : 
                              "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Commission: {formatWithConversion(booking.commission)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Select Property</CardTitle>
                <CardDescription>
                  Choose a property to view availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {properties.map((property) => (
                    <button
                      key={property.id}
                      onClick={() => setSelectedPropertyId(property.id)}
                      className={`
                        w-full text-left p-3 rounded-lg border transition-colors
                        ${selectedPropertyId === property.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="font-medium">{property.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatWithConversion(property.pricePerNight)}/night
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability Calendar
                </CardTitle>
                <CardDescription>
                  {selectedPropertyId 
                    ? `Showing availability for ${properties.find(p => p.id === selectedPropertyId)?.name}`
                    : 'Select a property to view calendar'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calendarLoading ? (
                  <div className="text-center py-8">Loading calendar...</div>
                ) : (
                  renderCalendar()
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>
                  Total earnings from confirmed bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {earningsLoading ? (
                  <div className="text-center py-8">Loading earnings...</div>
                ) : earnings ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-lg font-bold">{formatWithConversion(earnings.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Platform Commission</span>
                      <span className="text-lg font-bold text-red-600">-{formatWithConversion(earnings.totalCommission)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Platform Fees</span>
                      <span className="text-lg font-bold text-red-600">-{formatWithConversion(earnings.totalPlatformFees)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Net Revenue</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatWithConversion(earnings.totalRevenue - earnings.totalCommission - earnings.totalPlatformFees)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">No earnings data available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
                <CardDescription>
                  Revenue by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {earningsLoading ? (
                  <div className="text-center py-8">Loading breakdown...</div>
                ) : earnings?.monthlyBreakdown ? (
                  <div className="space-y-3">
                    {earnings.monthlyBreakdown.map((month) => (
                      <div key={month.month} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{month.month}</div>
                          <div className="text-xs text-muted-foreground">
                            Commission: {formatWithConversion(month.commission)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatWithConversion(month.revenue)}</div>
                          <div className="text-xs text-green-600">
                            Net: {formatWithConversion(month.revenue - month.commission - month.platformFees)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">No monthly data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}