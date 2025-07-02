import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Search, Filter, DollarSign, Users, Bed, MapPin, ExternalLink, Phone, Mail, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

// Form schemas
const bookingSearchSchema = z.object({
  checkIn: z.string().min(1, "Check-in date required"),
  checkOut: z.string().min(1, "Check-out date required"),
  guests: z.number().min(1, "At least 1 guest required"),
  bedrooms: z.number().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
});

const bookingFormSchema = z.object({
  propertyId: z.number(),
  guestName: z.string().min(1, "Guest name required"),
  guestEmail: z.string().email("Valid email required"),
  guestPhone: z.string().min(1, "Phone number required"),
  guestCountry: z.string().optional(),
  checkIn: z.string().min(1, "Check-in date required"),
  checkOut: z.string().min(1, "Check-out date required"),
  guests: z.number().min(1, "At least 1 guest required"),
  totalAmount: z.number().min(1, "Amount required"),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

const payoutRequestSchema = z.object({
  payoutAmount: z.number().min(1, "Amount required"),
  payoutMethod: z.string().min(1, "Payment method required"),
  requestNotes: z.string().optional(),
  agentBankDetails: z.string().min(1, "Bank details required"),
});

type BookingSearchForm = z.infer<typeof bookingSearchSchema>;
type BookingForm = z.infer<typeof bookingFormSchema>;
type PayoutRequestForm = z.infer<typeof payoutRequestSchema>;

export default function RetailAgentBooking() {
  const [searchParams, setSearchParams] = useState<BookingSearchForm>({
    checkIn: "",
    checkOut: "",
    guests: 2,
  });
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search form
  const searchForm = useForm<BookingSearchForm>({
    resolver: zodResolver(bookingSearchSchema),
    defaultValues: searchParams,
  });

  // Booking form
  const bookingForm = useForm<BookingForm>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guests: 2,
      totalAmount: 0,
    },
  });

  // Payout form
  const payoutForm = useForm<PayoutRequestForm>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      payoutMethod: "bank_transfer",
    },
  });

  // Fetch available properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/agent/properties", searchParams],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn);
      if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut);
      if (searchParams.guests) params.append('guests', searchParams.guests.toString());
      if (searchParams.bedrooms) params.append('bedrooms', searchParams.bedrooms.toString());
      if (searchParams.priceMin) params.append('priceMin', searchParams.priceMin.toString());
      if (searchParams.priceMax) params.append('priceMax', searchParams.priceMax.toString());
      
      return apiRequest("GET", `/api/agent/properties?${params.toString()}`);
    },
    enabled: !!(searchParams.checkIn && searchParams.checkOut),
  });

  // Fetch agent bookings
  const { data: agentBookings = [] } = useQuery({
    queryKey: ["/api/agent/bookings"],
    queryFn: () => apiRequest("GET", "/api/agent/bookings"),
  });

  // Fetch commission summary
  const { data: commissionSummary } = useQuery({
    queryKey: ["/api/agent/commission-summary"],
    queryFn: () => apiRequest("GET", "/api/agent/commission-summary"),
  });

  // Fetch agent payouts
  const { data: agentPayouts = [] } = useQuery({
    queryKey: ["/api/agent/payouts"],
    queryFn: () => apiRequest("GET", "/api/agent/payouts"),
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingForm) => apiRequest("POST", "/api/agent/bookings", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Booking created successfully!" });
      setBookingDialogOpen(false);
      bookingForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/agent/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agent/commission-summary"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" });
    },
  });

  // Request payout mutation
  const requestPayoutMutation = useMutation({
    mutationFn: (data: PayoutRequestForm) => apiRequest("POST", "/api/agent/payouts", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Payout request submitted!" });
      setPayoutDialogOpen(false);
      payoutForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/agent/payouts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit payout request", variant: "destructive" });
    },
  });

  const handleSearch = (data: BookingSearchForm) => {
    setSearchParams(data);
  };

  const handleBookProperty = (property: any) => {
    setSelectedProperty(property);
    bookingForm.setValue("propertyId", property.id);
    bookingForm.setValue("checkIn", searchParams.checkIn);
    bookingForm.setValue("checkOut", searchParams.checkOut);
    bookingForm.setValue("guests", searchParams.guests);
    
    // Calculate commission amount
    const nights = new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime();
    const nightsCount = Math.ceil(nights / (1000 * 60 * 60 * 24));
    const totalAmount = parseFloat(property.pricePerNight) * nightsCount;
    bookingForm.setValue("totalAmount", totalAmount);
    
    setBookingDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved': return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Retail Agent Booking Engine</h1>
          <p className="text-muted-foreground">Live property booking system with commission tracking</p>
        </div>
        
        {commissionSummary && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-lg font-semibold">${commissionSummary.totalEarned || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-lg font-semibold">${commissionSummary.currentBalance || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-lg font-semibold">{commissionSummary.totalBookings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="booking-engine" className="space-y-4">
        <TabsList>
          <TabsTrigger value="booking-engine">Live Booking Engine</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="commission-tracker">Commission Tracker</TabsTrigger>
          <TabsTrigger value="payout-requests">Payout Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="booking-engine" className="space-y-6">
          {/* Property Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Property Search</span>
              </CardTitle>
              <CardDescription>Search available properties with live availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...searchForm}>
                <form onSubmit={searchForm.handleSubmit(handleSearch)} className="grid grid-cols-6 gap-4">
                  <FormField
                    control={searchForm.control}
                    name="checkIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={searchForm.control}
                    name="checkOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={searchForm.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guests</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={searchForm.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Bedrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="Any"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={searchForm.control}
                    name="priceMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Price/Night</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="Any"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-end">
                    <Button type="submit" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Available Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-2 text-muted-foreground">Searching properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchParams.checkIn && searchParams.checkOut 
                    ? "No available properties found for your search criteria"
                    : "Enter search criteria to see available properties"
                  }
                </p>
              </div>
            ) : (
              properties.map((property: any) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MapPin className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{property.address}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{property.maxGuests} guests</span>
                          </div>
                        </div>
                        
                        {property.isAvailable ? (
                          <Badge className="bg-green-100 text-green-800">Available</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-lg font-semibold">${property.pricePerNight}/night</p>
                          {property.commission && (
                            <p className="text-sm text-green-600">
                              {property.commission}% commission
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleBookProperty(property)}
                          disabled={!property.isAvailable || !searchParams.checkIn || !searchParams.checkOut}
                          size="sm"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Track all your agent bookings and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {agentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentBookings.map((booking: any) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="font-semibold">{booking.propertyName}</p>
                            <p className="text-sm text-muted-foreground">{booking.guestName}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">{booking.guestEmail}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Dates</p>
                            <p className="font-medium">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                            <p className="text-sm">{booking.guests} guests</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Amount & Commission</p>
                            <p className="font-medium">${booking.totalAmount}</p>
                            <p className="text-sm text-green-600">Commission: ${booking.commissionAmount}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              {getStatusBadge(booking.bookingStatus)}
                              <p className="text-xs mt-1">
                                Commission: {getStatusBadge(booking.commissionStatus)}
                              </p>
                            </div>
                            
                            {booking.hostawayBookingId && (
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission-tracker" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold">${commissionSummary?.totalEarned || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold">${commissionSummary?.totalPaid || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">${commissionSummary?.currentBalance || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">${commissionSummary?.pendingCommissions || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payout-requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Payout Requests</h2>
              <p className="text-muted-foreground">Request payouts for your earned commissions</p>
            </div>
            
            <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
              <DialogTrigger asChild>
                <Button>Request Payout</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Commission Payout</DialogTitle>
                  <DialogDescription>
                    Request a payout for your earned commissions
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...payoutForm}>
                  <form onSubmit={payoutForm.handleSubmit((data) => requestPayoutMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={payoutForm.control}
                      name="payoutAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payout Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={payoutForm.control}
                      name="payoutMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={payoutForm.control}
                      name="agentBankDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your bank account details..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={payoutForm.control}
                      name="requestNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional notes..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={requestPayoutMutation.isPending}>
                        {requestPayoutMutation.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-4">
              {agentPayouts.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payout requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentPayouts.map((payout: any) => (
                    <Card key={payout.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">${payout.payoutAmount}</p>
                            <p className="text-sm text-muted-foreground">
                              Requested on {new Date(payout.requestedAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm">Method: {payout.payoutMethod}</p>
                          </div>
                          
                          <div className="text-right">
                            {getPayoutStatusBadge(payout.payoutStatus)}
                            {payout.paidAt && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Paid on {new Date(payout.paidAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Booking - {selectedProperty?.name}</DialogTitle>
            <DialogDescription>
              Complete the booking details for your client
            </DialogDescription>
          </DialogHeader>
          
          <Form {...bookingForm}>
            <form onSubmit={bookingForm.handleSubmit((data) => createBookingMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bookingForm.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="guestCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={bookingForm.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requests from the guest..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bookingForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Internal notes about this booking..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setBookingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBookingMutation.isPending}>
                  {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}