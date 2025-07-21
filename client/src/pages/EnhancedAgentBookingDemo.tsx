import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  CalendarDays, 
  Search, 
  Filter, 
  DollarSign, 
  Users, 
  Bed, 
  MapPin, 
  ExternalLink, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  LogOut,
  Star,
  Bath,
  Home,
  Briefcase,
  Target,
  Award,
  Download,
  FileText
} from "lucide-react";

// Demo Properties Data (replacing Hostaway API for now)
const DEMO_PROPERTIES = [
  {
    id: 1,
    name: "Villa Samui Breeze",
    location: "Koh Samui, Thailand",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 350,
    currency: "USD",
    amenities: ["Pool", "WiFi", "Air Conditioning", "Kitchen", "Beachfront"],
    rating: 4.8,
    reviews: 156,
    description: "Stunning beachfront villa with panoramic ocean views",
    image: "/api/placeholder/400/300",
    available: true,
    commission: 10,
  },
  {
    id: 2,
    name: "Villa Tropical Paradise",
    location: "Phuket, Thailand", 
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 10,
    pricePerNight: 450,
    currency: "USD",
    amenities: ["Pool", "WiFi", "Air Conditioning", "Kitchen", "Garden"],
    rating: 4.9,
    reviews: 203,
    description: "Luxury villa with private pool and tropical gardens",
    image: "/api/placeholder/400/300",
    available: true,
    commission: 10,
  },
  {
    id: 3,
    name: "Villa Balinese Charm",
    location: "Canggu, Bali",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 280,
    currency: "USD",
    amenities: ["Pool", "WiFi", "Air Conditioning", "Kitchen", "Rice Field View"],
    rating: 4.7,
    reviews: 98,
    description: "Traditional Balinese villa with modern amenities",
    image: "/api/placeholder/400/300",
    available: true,
    commission: 10,
  },
  {
    id: 4,
    name: "Villa Gala",
    location: "Seminyak, Bali",
    bedrooms: 6,
    bathrooms: 5,
    maxGuests: 12,
    pricePerNight: 600,
    currency: "USD",
    amenities: ["Pool", "WiFi", "Air Conditioning", "Kitchen", "Staff", "Spa"],
    rating: 5.0,
    reviews: 87,
    description: "Ultra-luxury villa with full staff and spa services",
    image: "/api/placeholder/400/300",
    available: true,
    commission: 15,
  }
];

// Form schemas
const bookingSearchSchema = z.object({
  checkIn: z.string().min(1, "Check-in date required"),
  checkOut: z.string().min(1, "Check-out date required"),
  guests: z.number().min(1, "At least 1 guest required"),
  bedrooms: z.number().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  location: z.string().optional(),
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
  commissionRate: z.number().min(0).max(100, "Commission rate must be between 0-100%"),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

type BookingSearchForm = z.infer<typeof bookingSearchSchema>;
type BookingForm = z.infer<typeof bookingFormSchema>;

export default function EnhancedAgentBookingDemo() {
  const [searchParams, setSearchParams] = useState<BookingSearchForm>({
    checkIn: "",
    checkOut: "",
    guests: 2,
  });
  const [filteredProperties, setFilteredProperties] = useState(DEMO_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("retail-agent");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Set user role based on actual user data
  useEffect(() => {
    if (user?.role) {
      setCurrentUserRole(user.role);
    }
  }, [user]);

  // Search form
  const searchForm = useForm<BookingSearchForm>({
    resolver: zodResolver(bookingSearchSchema),
    defaultValues: searchParams,
  });

  // Booking form with editable commission for retail agents
  const bookingForm = useForm<BookingForm>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guests: 2,
      totalAmount: 0,
      commissionRate: 10, // Default 10% commission
    },
  });

  // Filter properties based on search criteria
  useEffect(() => {
    let filtered = DEMO_PROPERTIES;

    if (searchParams.bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= searchParams.bedrooms!);
    }
    if (searchParams.guests) {
      filtered = filtered.filter(p => p.maxGuests >= searchParams.guests);
    }
    if (searchParams.priceMin) {
      filtered = filtered.filter(p => p.pricePerNight >= searchParams.priceMin!);
    }
    if (searchParams.priceMax) {
      filtered = filtered.filter(p => p.pricePerNight <= searchParams.priceMax!);
    }
    if (searchParams.location) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(searchParams.location!.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  }, [searchParams]);

  // Demo commission summary for agents
  const getDemoCommissionSummary = () => {
    if (currentUserRole === "retail-agent") {
      return {
        totalCommissionEarned: 15750,
        totalCommissionPaid: 12500,
        pendingCommission: 3250,
        totalBookings: 42,
        thisMonthCommission: 2850,
        thisMonthBookings: 8,
        lastMonthCommission: 3100,
        lastMonthBookings: 9,
        averageCommissionPerBooking: 375,
        commissionRate: 10.0,
        currency: "USD"
      };
    }
    return null;
  };

  // Demo referral stats for referral agents
  const getDemoReferralStats = () => {
    if (currentUserRole === "referral-agent") {
      return {
        linkedVillas: ["Villa Gala", "Villa Balinese Charm"],
        totalEarnings: 8750,
        pendingEarnings: 1250,
        thisMonthEarnings: 950,
        bookingConversionRate: 15.5,
        totalReferrals: 28,
        successfulBookings: 22,
        averageBookingValue: 2400,
        topPerformingVilla: "Villa Gala",
        marketingKitAccess: true,
      };
    }
    return null;
  };

  const handleSearch = (data: BookingSearchForm) => {
    setSearchParams(data);
  };

  const handleBookProperty = (property: any) => {
    setSelectedProperty(property);
    bookingForm.setValue("propertyId", property.id);
    bookingForm.setValue("checkIn", searchParams.checkIn);
    bookingForm.setValue("checkOut", searchParams.checkOut);
    bookingForm.setValue("guests", searchParams.guests);
    bookingForm.setValue("commissionRate", property.commission);
    
    // Calculate total amount
    const nights = searchParams.checkIn && searchParams.checkOut ? 
      Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const totalAmount = property.pricePerNight * nights;
    bookingForm.setValue("totalAmount", totalAmount);
    
    setBookingDialogOpen(true);
  };

  const createBookingMutation = useMutation({
    mutationFn: (data: BookingForm) => {
      // Simulate API call - replace with actual endpoint
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, bookingId: Math.random() }), 1000);
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Demo booking created successfully!" });
      setBookingDialogOpen(false);
      bookingForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" });
    },
  });

  const calculateCommission = (totalAmount: number, commissionRate: number) => {
    return (totalAmount * commissionRate) / 100;
  };

  const handleLogout = () => {
    window.location.href = "/api/auth/demo-logout";
  };

  const commissionSummary = getDemoCommissionSummary();
  const referralStats = getDemoReferralStats();

  // Retail Agent Dashboard
  if (currentUserRole === "retail-agent") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Booking Engine</h1>
              <p className="text-gray-600">Search and book properties with live commission tracking</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="booking" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="booking" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Live Booking Engine
              </TabsTrigger>
              <TabsTrigger value="descriptions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Villa Descriptions & Media
              </TabsTrigger>
              <TabsTrigger value="finance" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Finance & Commissions
              </TabsTrigger>
            </TabsList>

            {/* Live Booking Engine Tab */}
            <TabsContent value="booking">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Filters */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Search Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...searchForm}>
                      <form onSubmit={searchForm.handleSubmit(handleSearch)} className="space-y-4">
                        <FormField
                          control={searchForm.control}
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
                          control={searchForm.control}
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
                                  min="1" 
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
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Koh Samui, Phuket" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={searchForm.control}
                            name="priceMin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Min"
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
                                <FormLabel>Max Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Max"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Search Properties
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Available Properties */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Available Properties ({filteredProperties.length})</h3>
                    <Badge variant="secondary">Commission Visible</Badge>
                  </div>
                  
                  {filteredProperties.map((property) => (
                    <Card key={property.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-xl font-semibold">{property.name}</h4>
                              <Badge className="bg-green-100 text-green-800">
                                {property.commission}% Commission
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {property.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bed className="h-4 w-4" />
                                {property.bedrooms} bed
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="h-4 w-4" />
                                {property.bathrooms} bath
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {property.maxGuests} guests
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{property.rating}</span>
                              </div>
                              <span className="text-gray-500">({property.reviews} reviews)</span>
                            </div>
                            <p className="text-gray-700 mb-3">{property.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {property.amenities.map((amenity) => (
                                <Badge key={amenity} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-blue-600">
                              ${property.pricePerNight}
                            </div>
                            <div className="text-gray-500">per night</div>
                            {searchParams.checkIn && searchParams.checkOut && (
                              <div className="mt-2 p-2 bg-green-50 rounded">
                                <div className="text-sm text-gray-600">Your Commission</div>
                                <div className="font-semibold text-green-600">
                                  ${calculateCommission(
                                    property.pricePerNight * Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
                                    property.commission
                                  ).toFixed(2)}
                                </div>
                              </div>
                            )}
                            <Button 
                              className="mt-3 w-full" 
                              onClick={() => handleBookProperty(property)}
                              disabled={!searchParams.checkIn || !searchParams.checkOut}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Villa Descriptions & Media Tab */}
            <TabsContent value="descriptions">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {DEMO_PROPERTIES.map((property) => (
                  <Card key={property.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {property.name}
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Media Access
                        </Button>
                      </CardTitle>
                      <CardDescription>{property.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">Property Image Placeholder</span>
                        </div>
                        <p>{property.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Bedrooms:</strong> {property.bedrooms}
                          </div>
                          <div>
                            <strong>Bathrooms:</strong> {property.bathrooms}
                          </div>
                          <div>
                            <strong>Max Guests:</strong> {property.maxGuests}
                          </div>
                          <div>
                            <strong>Price:</strong> ${property.pricePerNight}/night
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Fact Sheet
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Google Drive
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Finance & Commissions Tab */}
            <TabsContent value="finance">
              {commissionSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${commissionSummary.totalCommissionEarned.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">All-time commission earnings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${commissionSummary.pendingCommission.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Awaiting payment</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${commissionSummary.thisMonthCommission.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average per Booking</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${commissionSummary.averageCommissionPerBooking}</div>
                      <p className="text-xs text-muted-foreground">Commission per booking</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Commission Logs & Payout Tracking</CardTitle>
                  <CardDescription>Track your commission payments and request payouts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Booking #2024-001</h4>
                        <p className="text-sm text-gray-600">Villa Samui Breeze - Jan 15-22, 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$315.00</div>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Booking #2024-002</h4>
                        <p className="text-sm text-gray-600">Villa Tropical Paradise - Jan 20-27, 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$450.00</div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </div>
                    <Button className="w-full">
                      Request Payout
                    </Button>
                  </div>
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
                  Complete the booking details. Commission rate is editable.
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
                            <Input {...field} />
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
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bookingForm.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={bookingForm.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookingForm.control}
                      name="commissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col justify-end">
                      <Label className="text-sm">Your Commission</Label>
                      <div className="text-lg font-bold text-green-600">
                        ${calculateCommission(
                          bookingForm.watch("totalAmount") || 0,
                          bookingForm.watch("commissionRate") || 0
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <FormField
                    control={bookingForm.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
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
      </div>
    );
  }

  // Referral Agent Dashboard
  if (currentUserRole === "referral-agent") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referral Agent Dashboard</h1>
              <p className="text-gray-600">Track your villa assignments and performance</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="villas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="villas" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Assigned Villas
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Commission Tracking
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Assigned Villas Tab */}
            <TabsContent value="villas">
              {referralStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${referralStats.totalEarnings.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">10% of management revenue</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{referralStats.bookingConversionRate}%</div>
                      <p className="text-xs text-muted-foreground">Referral to booking rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${referralStats.thisMonthEarnings}</div>
                      <p className="text-xs text-muted-foreground">Current month earnings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">{referralStats.topPerformingVilla}</div>
                      <p className="text-xs text-muted-foreground">Best converting property</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {referralStats?.linkedVillas.map((villaName) => {
                  const villa = DEMO_PROPERTIES.find(p => p.name === villaName);
                  if (!villa) return null;
                  
                  return (
                    <Card key={villa.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {villa.name}
                          <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>
                        </CardTitle>
                        <CardDescription>{villa.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-600">Monthly Performance</Label>
                              <div className="text-lg font-semibold">85%</div>
                              <Progress value={85} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Occupancy Rate</Label>
                              <div className="text-lg font-semibold">78%</div>
                              <Progress value={78} className="mt-1" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-600">Avg Guest Rating</Label>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{villa.rating}</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Your Commission Cut</Label>
                              <div className="font-semibold text-green-600">10%</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Marketing Kit
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="h-4 w-4 mr-2" />
                              Fact Sheet
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Commission Tracking Tab */}
            <TabsContent value="commissions">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Commission Breakdown</CardTitle>
                  <CardDescription>Track your earnings month by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">January 2024</h4>
                        <p className="text-sm text-gray-600">Villa Gala: 8 bookings</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$650.00</div>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">February 2024</h4>
                        <p className="text-sm text-gray-600">Villa Balinese Charm: 6 bookings</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$480.00</div>
                        <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Statement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Updates</CardTitle>
                  <CardDescription>Stay updated with bookings, reviews, and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">New Booking Confirmed</h4>
                        <p className="text-sm text-gray-600">Villa Gala - March 15-22, 2024</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">New 5-Star Review</h4>
                        <p className="text-sm text-gray-600">Villa Balinese Charm received excellent feedback</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Commission Payment Processed</h4>
                        <p className="text-sm text-gray-600">$650 deposited to your account</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Default fallback for other roles
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>This demo is only available for retail and referral agents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Logout and Switch User
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}