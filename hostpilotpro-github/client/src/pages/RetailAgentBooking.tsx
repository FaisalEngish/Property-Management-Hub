import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdminBalanceResetCard from "@/components/ui/AdminBalanceResetCard";
import { CalendarDays, Search, Filter, DollarSign, Users, Bed, MapPin, ExternalLink, Phone, Mail, Clock, CheckCircle, AlertCircle, TrendingUp, LogOut, Info, FileText } from "lucide-react";

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
  
  // Enhanced Commission Fields
  commissionType: z.enum(["fixed_percentage", "custom_topup"]).default("fixed_percentage"),
  netPrice: z.number().optional(),
  topupAmount: z.number().optional(),
  
  // Booking Policy & Payment Fields
  bookingPolicy: z.enum(["standard", "non_refundable"]).default("standard"),
  paymentMethod: z.enum(["stripe_instant", "bank_transfer", "cash", "other"]).default("stripe_instant"),
  paymentAmount: z.number().min(1, "Payment amount required"),
  dueDate: z.string().optional(),
  
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
  const [readMeDialogOpen, setReadMeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("booking-engine");
  
  const [location] = useLocation();
  
  // Check URL parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      commissionType: "fixed_percentage",
      netPrice: 0,
      topupAmount: 0,
      bookingPolicy: "standard",
      paymentMethod: "stripe_instant",
      paymentAmount: 0,
      dueDate: "",
    },
  });

  // Payout form
  const payoutForm = useForm<PayoutRequestForm>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      payoutMethod: "bank_transfer",
    },
  });

  // Fetch available properties with enhanced error handling
  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useQuery({
    queryKey: ["/api/agent/properties", searchParams],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn);
        if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut);
        if (searchParams.guests) params.append('guests', searchParams.guests.toString());
        if (searchParams.bedrooms) params.append('bedrooms', searchParams.bedrooms.toString());
        if (searchParams.priceMin) params.append('priceMin', searchParams.priceMin.toString());
        if (searchParams.priceMax) params.append('priceMax', searchParams.priceMax.toString());
        
        const result = await apiRequest("GET", `/api/agent/properties?${params.toString()}`);
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        return []; // Return empty array on error
      }
    },
    enabled: !!(searchParams.checkIn && searchParams.checkOut),
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  // Fetch agent bookings with enhanced error handling
  const { data: agentBookings = [], error: bookingsError } = useQuery({
    queryKey: ["/api/agent/bookings"],
    queryFn: async () => {
      try {
        const result = await apiRequest("GET", "/api/agent/bookings");
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 60000, // 1 minute
  });

  // Fetch commission summary with enhanced error handling
  const { data: commissionSummary, error: commissionError } = useQuery({
    queryKey: ["/api/agent/commission-summary"],
    queryFn: async () => {
      try {
        const result = await apiRequest("GET", "/api/agent/commission-summary");
        return result || {
          totalCommissionEarned: 0,
          totalCommissionPaid: 0,
          pendingCommission: 0,
          totalBookings: 0,
          thisMonthCommission: 0,
          thisMonthBookings: 0,
          lastMonthCommission: 0,
          lastMonthBookings: 0,
          averageCommissionPerBooking: 0,
          commissionRate: 15.0,
          currency: "THB"
        };
      } catch (error) {
        console.error("Failed to fetch commission summary:", error);
        return {
          totalCommissionEarned: 0,
          totalCommissionPaid: 0,
          pendingCommission: 0,
          totalBookings: 0,
          thisMonthCommission: 0,
          thisMonthBookings: 0,
          lastMonthCommission: 0,
          lastMonthBookings: 0,
          averageCommissionPerBooking: 0,
          commissionRate: 15.0,
          currency: "THB"
        };
      }
    },
    retry: 2,
    staleTime: 60000,
  });

  // Fetch agent payouts with enhanced error handling
  const { data: agentPayouts = [], error: payoutsError } = useQuery({
    queryKey: ["/api/agent/payouts"],
    queryFn: async () => {
      try {
        const result = await apiRequest("GET", "/api/agent/payouts");
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("Failed to fetch payouts:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 60000,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingForm) => {
      // Calculate commission based on selected type
      let finalCommissionAmount = 0;
      let finalCommissionRate = 10.00; // Default 10%
      
      if (data.commissionType === "fixed_percentage") {
        finalCommissionAmount = data.totalAmount * 0.1; // 10% of total
      } else if (data.commissionType === "custom_topup" && data.netPrice && data.totalAmount) {
        finalCommissionAmount = data.totalAmount - data.netPrice; // Top-up amount
        finalCommissionRate = (finalCommissionAmount / data.totalAmount) * 100; // Calculate effective rate
      }

      const enhancedData = {
        ...data,
        propertyId: selectedProperty?.id || 0,
        commissionAmount: finalCommissionAmount,
        commissionRate: finalCommissionRate,
      };

      return apiRequest("POST", "/api/agent/bookings", enhancedData);
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Booking created successfully with commission calculated!" 
      });
      setBookingDialogOpen(false);
      bookingForm.reset();
      setSelectedProperty(null);
      queryClient.invalidateQueries({ queryKey: ["/api/agent/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agent/commission-summary"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to create booking", 
        variant: "destructive" 
      });
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
    
    // Calculate commission amount and payment
    const nights = new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime();
    const nightsCount = Math.ceil(nights / (1000 * 60 * 60 * 24));
    const totalAmount = parseFloat(property.pricePerNight) * nightsCount;
    bookingForm.setValue("totalAmount", totalAmount);
    
    // Set default payment amount based on current policy
    const currentPolicy = bookingForm.getValues("bookingPolicy") || "standard";
    const paymentAmount = currentPolicy === "non_refundable" ? totalAmount : totalAmount * 0.3;
    bookingForm.setValue("paymentAmount", paymentAmount);
    
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Retail Agent Booking Engine</h1>
          <p className="text-muted-foreground">Live property booking system with commission tracking</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {commissionSummary && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <p className="text-lg font-semibold">{commissionSummary.currency || "THB"} {commissionSummary.totalCommissionEarned || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Commission</p>
                      <p className="text-lg font-semibold">{commissionSummary.currency || "THB"} {commissionSummary.pendingCommission || 0}</p>
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
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/api/auth/demo-logout'}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Error Display Section */}
      {(propertiesError || bookingsError || commissionError || payoutsError) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">API Connection Notice</p>
                <p className="text-sm text-yellow-700">
                  Some data may be temporarily unavailable. The system is using fallback data to ensure continued operation.
                  {propertiesError && " Properties data may be limited."}
                  {bookingsError && " Booking history may be incomplete."}
                  {commissionError && " Commission data may be delayed."}
                  {payoutsError && " Payout information may be outdated."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="booking-engine">Live Booking Engine</TabsTrigger>
          <TabsTrigger value="my-bookings">My Reservations</TabsTrigger>
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
                          <p className="text-lg font-semibold">
                            {property.currency || "THB"} {parseFloat(property.pricePerNight || 0).toLocaleString()}/night
                          </p>
                          {searchParams.checkIn && searchParams.checkOut && (
                            <p className="text-sm text-blue-600 font-medium">
                              Total: {property.currency || "THB"} {(
                                parseFloat(property.pricePerNight || 0) * 
                                Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                              ).toLocaleString()} for {Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                            </p>
                          )}
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
              <CardTitle>My Reservations</CardTitle>
              <CardDescription>Track all your agent reservations and their status</CardDescription>
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
                            <p className="font-medium">฿{booking.totalAmount}</p>
                            <p className="text-sm text-green-600">Commission: ฿{booking.commissionAmount}</p>
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
                    <p className="text-2xl font-bold">฿{commissionSummary?.totalEarned || commissionSummary?.totalCommissionEarned || 0}</p>
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
                    <p className="text-2xl font-bold">฿{commissionSummary?.totalPaid || commissionSummary?.totalCommissionPaid || 0}</p>
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
                    <p className="text-2xl font-bold">฿{commissionSummary?.currentBalance || (commissionSummary?.totalCommissionEarned || 0) - (commissionSummary?.totalCommissionPaid || 0)}</p>
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
                    <p className="text-2xl font-bold">฿{commissionSummary?.pendingCommissions || commissionSummary?.pendingCommission || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Balance Reset Card - Only visible to admin users */}
          {user && (
            <AdminBalanceResetCard
              userId={user.id}
              userRole="retail-agent"
              userEmail={user.email || ""}
              userName={`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || ""}
              currentBalance={commissionSummary?.currentBalance}
              onBalanceReset={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/agent/commission-summary"] });
                queryClient.invalidateQueries({ queryKey: ["/api/agent/payouts"] });
              }}
            />
          )}
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
                      <FormLabel>Guest Total Amount</FormLabel>
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

              {/* Commission Configuration Section */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Commission Configuration
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={bookingForm.control}
                    name="commissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select commission type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed_percentage">Fixed 10% Commission</SelectItem>
                            <SelectItem value="custom_topup">Custom Top-up Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {bookingForm.watch("commissionType") === "custom_topup" && (
                    <>
                      {/* Read Me Notice for Top-up Commission */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">Important: Top-up Commission Guidelines</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setReadMeDialogOpen(true)}
                            className="flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-100"
                          >
                            <FileText className="h-3 w-3" />
                            Read Me
                          </Button>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          Please read our guidelines before setting custom margins to ensure optimal customer experience.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="netPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Net Price (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="1050.00"
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                  // Auto-calculate commission when net price changes
                                  const netPrice = parseFloat(e.target.value) || 0;
                                  const totalAmount = bookingForm.getValues("totalAmount") || 0;
                                  if (netPrice && totalAmount > netPrice) {
                                    const commission = totalAmount - netPrice;
                                    bookingForm.setValue("topupAmount", commission);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bookingForm.control}
                        name="topupAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Commission (Auto-calculated)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                readOnly
                                className="bg-gray-100"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Total Amount - Net Price = Your Commission
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                    </>
                  )}

                  {bookingForm.watch("commissionType") === "fixed_percentage" && (
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fixed 10% Commission:</strong> You'll earn 10% of the total booking amount as commission.
                      </p>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        Commission: ${((bookingForm.watch("totalAmount") || 0) * 0.1).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {bookingForm.watch("commissionType") === "custom_topup" && bookingForm.watch("netPrice") && bookingForm.watch("totalAmount") && (
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-sm space-y-1">
                        <p><strong>Net Price:</strong> ${bookingForm.watch("netPrice")}</p>
                        <p><strong>Guest Pays:</strong> ${bookingForm.watch("totalAmount")}</p>
                        <p><strong>Your Commission:</strong> <span className="text-green-600 font-medium">${((bookingForm.watch("totalAmount") || 0) - (bookingForm.watch("netPrice") || 0)).toFixed(2)}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Booking Policy & Payment Section */}
              <Card className="p-4 bg-green-50 border-green-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Booking Policy & Payment
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={bookingForm.control}
                    name="bookingPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Policy</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-calculate payment amount based on policy
                          const totalAmount = bookingForm.getValues("totalAmount") || 0;
                          if (value === "non_refundable") {
                            bookingForm.setValue("paymentAmount", totalAmount);
                          } else {
                            bookingForm.setValue("paymentAmount", totalAmount * 0.3);
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select booking policy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard - 30% Deposit Required</SelectItem>
                            <SelectItem value="non_refundable">Non-Refundable - Full Payment Required</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bookingForm.control}
                    name="paymentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount (฿)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {bookingForm.watch("bookingPolicy") === "non_refundable" 
                            ? "Non-refundable: Full payment required upfront" 
                            : "Standard: 30% deposit required, remaining balance due at check-in"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bookingForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          // Set due date for non-instant payments
                          if (value !== "stripe_instant") {
                            const dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + 3); // 3 days from now
                            bookingForm.setValue("dueDate", dueDate.toISOString().split('T')[0]);
                          } else {
                            bookingForm.setValue("dueDate", "");
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stripe_instant">💳 Stripe - Instant Payment</SelectItem>
                            <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                            <SelectItem value="cash">💵 Cash Payment</SelectItem>
                            <SelectItem value="other">📄 Other (Manual Invoice)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {bookingForm.watch("paymentMethod") !== "stripe_instant" && (
                    <FormField
                      control={bookingForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Invoice will be generated with this due date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Payment Summary */}
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Total Booking Amount:</span>
                        <span className="font-medium">฿{bookingForm.watch("totalAmount") || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Required Now:</span>
                        <span className="font-medium text-green-600">฿{bookingForm.watch("paymentAmount") || 0}</span>
                      </div>
                      {bookingForm.watch("bookingPolicy") === "standard" && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Remaining Balance:</span>
                          <span>฿{((bookingForm.watch("totalAmount") || 0) - (bookingForm.watch("paymentAmount") || 0)).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between">
                          <span>Your Commission:</span>
                          <span className="font-medium text-blue-600">
                            ฿{bookingForm.watch("commissionType") === "fixed_percentage" 
                              ? ((bookingForm.watch("totalAmount") || 0) * 0.1).toFixed(2)
                              : ((bookingForm.watch("totalAmount") || 0) - (bookingForm.watch("netPrice") || 0)).toFixed(2)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
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
                {bookingForm.watch("paymentMethod") === "stripe_instant" ? (
                  <Button type="submit" disabled={createBookingMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
                    {createBookingMutation.isPending ? "Processing..." : "💳 Pay Now with Stripe"}
                  </Button>
                ) : (
                  <Button type="submit" disabled={createBookingMutation.isPending}>
                    {createBookingMutation.isPending ? "Creating..." : "Create Booking & Generate Invoice"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Read Me Dialog for Top-up Commission Guidelines */}
      <Dialog open={readMeDialogOpen} onOpenChange={setReadMeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Top-up Commission Guidelines
            </DialogTitle>
            <DialogDescription>
              Important information about setting custom margins for bookings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Market-Based Pricing Policy</h3>
              <p className="text-blue-700 text-sm">
                Our rates are calculated according to current market conditions and are close to real market values. 
                This ensures fair pricing for both guests and property owners while maintaining competitive positioning.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Warning: Excessive Margins
              </h3>
              <p className="text-amber-700 text-sm mb-2">
                <strong>Setting excessive margins may negatively impact customer experience.</strong>
              </p>
              <ul className="text-amber-700 text-sm space-y-1 list-disc list-inside">
                <li>Higher prices create elevated guest expectations</li>
                <li>Guests may expect premium services that exceed actual property offerings</li>
                <li>This disconnect can lead to negative reviews and customer dissatisfaction</li>
                <li>Poor reviews affect property reputation and future bookings</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Recommended Practice</h3>
              <ul className="text-green-700 text-sm space-y-1 list-disc list-inside">
                <li>Keep margins reasonable (typically 10-15% above net price)</li>
                <li>Consider property amenities and market positioning</li>
                <li>Ensure guest expectations align with actual offerings</li>
                <li>Focus on long-term customer satisfaction over short-term profits</li>
                <li>Use the fixed 10% commission option for standard bookings</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Example Scenarios</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">✓ Reasonable:</span>
                  <span>Net $1000 → Guest Pays $1150 (15% margin)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">✗ Excessive:</span>
                  <span>Net $1000 → Guest Pays $1400 (40% margin)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setReadMeDialogOpen(false)}>
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}