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

// Demo Properties Data for Retail Agents
const DEMO_PROPERTIES = [
  {
    id: 1,
    name: "Villa Samui Breeze",
    location: "Koh Samui, Thailand",
    area: "Bophut Beach",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 350,
    currency: "USD",
    commission: 10,
    coordinates: { lat: 9.5312, lng: 100.0647 },
    googleMapsLink: "https://maps.google.com/?q=9.5312,100.0647",
    otaConnected: true,
    hostawayId: "SAM001",
    lastUpdated: "2025-01-23 17:30",
    amenities: ["Private Pool", "WiFi", "Air Conditioning", "Full Kitchen", "Beachfront Access", "Daily Housekeeping", "24/7 Security"],
    rating: 4.8,
    reviews: 156,
    description: "Stunning beachfront villa with panoramic ocean views. Perfect for families seeking luxury and tranquility. Features modern amenities, private beach access, and breathtaking sunset views.",
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    minStay: 3,
    image: "/api/placeholder/400/300",
    available: true,
    mediaLinks: {
      photos: "https://dropbox.com/villa-samui-breeze-photos",
      brochure: "https://dropbox.com/villa-samui-breeze-brochure.pdf",
      floorPlan: "https://dropbox.com/villa-samui-breeze-floorplan.pdf"
    },
    policies: ["No smoking", "No pets", "No parties/events"],
  },
  {
    id: 2,
    name: "Villa Tropical Paradise",
    location: "Phuket, Thailand",
    area: "Patong Beach", 
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 10,
    pricePerNight: 450,
    currency: "USD",
    commission: 12,
    coordinates: { lat: 7.8804, lng: 98.2967 },
    googleMapsLink: "https://maps.google.com/?q=7.8804,98.2967",
    otaConnected: true,
    hostawayId: "PHU002",
    lastUpdated: "2025-01-23 16:45",
    amenities: ["Infinity Pool", "WiFi", "Air Conditioning", "Full Kitchen", "Tropical Garden", "BBQ Area", "Fitness Room"],
    rating: 4.9,
    reviews: 203,
    description: "Luxurious villa surrounded by lush tropical gardens. Modern design meets tropical elegance with spacious living areas and premium amenities.",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    minStay: 2,
    image: "/api/placeholder/400/300",
    available: true,
    mediaLinks: {
      photos: "https://dropbox.com/villa-tropical-paradise-photos",
      brochure: "https://dropbox.com/villa-tropical-paradise-brochure.pdf",
      floorPlan: "https://dropbox.com/villa-tropical-paradise-floorplan.pdf"
    },
    policies: ["No smoking", "No pets allowed", "Quiet hours 10 PM - 8 AM"],
  },
  {
    id: 3,
    name: "Villa Balinese Charm",
    location: "Canggu, Bali",
    area: "Rice Field District",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 280,
    currency: "USD",
    commission: 10,
    coordinates: { lat: -8.6481, lng: 115.1376 },
    googleMapsLink: "https://maps.google.com/?q=-8.6481,115.1376",
    otaConnected: true,
    hostawayId: "BAL003",
    lastUpdated: "2025-01-23 15:20",
    amenities: ["Private Pool", "WiFi", "Air Conditioning", "Full Kitchen", "Rice Field Views", "Yoga Deck", "Garden"],
    rating: 4.7,
    reviews: 98,
    description: "Traditional Balinese villa with modern amenities. Peaceful retreat surrounded by emerald rice fields with authentic local experiences.",
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    minStay: 2,
    image: "/api/placeholder/400/300",
    available: true,
    mediaLinks: {
      photos: "https://dropbox.com/villa-balinese-charm-photos",
      brochure: "https://dropbox.com/villa-balinese-charm-brochure.pdf",
      floorPlan: "https://dropbox.com/villa-balinese-charm-floorplan.pdf"
    },
    policies: ["No smoking", "Pets welcome with fee", "Respectful of local culture"],
  },
  {
    id: 4,
    name: "Villa Gala",
    location: "Seminyak, Bali",
    area: "Seminyak Beach",
    bedrooms: 6,
    bathrooms: 5,
    maxGuests: 12,
    pricePerNight: 600,
    currency: "USD",
    commission: 15,
    coordinates: { lat: -8.6905, lng: 115.1635 },
    googleMapsLink: "https://maps.google.com/?q=-8.6905,115.1635",
    otaConnected: true,
    hostawayId: "BAL004",
    lastUpdated: "2025-01-23 18:10",
    amenities: ["Infinity Pool", "WiFi", "Air Conditioning", "Full Kitchen", "Private Staff", "In-Villa Spa", "Butler Service"],
    rating: 5.0,
    reviews: 87,
    description: "Ultra-luxury villa with full staff and spa services. Experience the pinnacle of Balinese hospitality with personalized service and world-class amenities.",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    minStay: 3,
    image: "/api/placeholder/400/300",
    available: true,
    mediaLinks: {
      photos: "https://dropbox.com/villa-gala-photos",
      brochure: "https://dropbox.com/villa-gala-brochure.pdf",
      floorPlan: "https://dropbox.com/villa-gala-floorplan.pdf"
    },
    policies: ["No smoking", "No pets", "Formal dress for dinner service"],
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
    defaultValues: {
      checkIn: "",
      checkOut: "",
      guests: 2,
      bedrooms: undefined,
      priceMin: undefined,
      priceMax: undefined,
      location: "",
    },
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
    console.log("Search form submitted:", data);
    setSearchParams(data);
    toast({ 
      title: "Search Updated", 
      description: `Searching for properties...` 
    });
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
              <h1 className="text-3xl font-bold text-gray-900">Property Booking Portal</h1>
              <p className="text-gray-600">Browse properties, access media, and create client bookings</p>
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
                Property Search
              </TabsTrigger>
              <TabsTrigger value="descriptions" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property Details & Info
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Media & Resources
              </TabsTrigger>
            </TabsList>

            {/* Property Search Tab */}
            <TabsContent value="booking">
              {/* Modern Search Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl mb-8">
                <h2 className="text-3xl font-bold mb-2">Find Your Perfect Property</h2>
                <p className="text-blue-100 mb-6">Discover luxury vacation rentals with transparent commission rates</p>
                
                {/* Compact Search Bar */}
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-4">
                    <Form {...searchForm}>
                      <form onSubmit={searchForm.handleSubmit(handleSearch)}>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <FormField
                            control={searchForm.control}
                            name="checkIn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm font-medium">Check-in</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-200" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={searchForm.control}
                            name="checkOut"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm font-medium">Check-out</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-200" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={searchForm.control}
                            name="guests"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm font-medium">Guests</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-200" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={searchForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm font-medium">Location</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Thailand, Bali..." 
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-200" />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="bg-white text-blue-600 hover:bg-gray-100 font-medium h-10">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Filters */}
              <div className="mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Filters:</span>
                      <div className="flex gap-3">
                        <FormField
                          control={searchForm.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Bedrooms:</label>
                              <Input 
                                type="number" 
                                min="1" 
                                placeholder="Any"
                                className="w-20 h-8"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </div>
                          )}
                        />
                        <FormField
                          control={searchForm.control}
                          name="priceMin"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Min Price:</label>
                              <Input 
                                type="number" 
                                placeholder="$0"
                                className="w-20 h-8"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </div>
                          )}
                        />
                        <FormField
                          control={searchForm.control}
                          name="priceMax"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Max Price:</label>
                              <Input 
                                type="number" 
                                placeholder="$1000+"
                                className="w-20 h-8"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modern Property Grid */}
              <div className="space-y-6">

                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {filteredProperties.length} Properties Available
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Commission Visible
                    </Badge>
                    <Badge variant="outline">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                      Live Pricing
                    </Badge>
                  </div>
                </div>
                  
                {/* Modern Card Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                      {/* Property Image */}
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Premium Property Photo</span>
                        </div>
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-green-500/90 text-white backdrop-blur">
                            {property.commission}% Commission
                          </Badge>
                          {property.otaConnected && (
                            <Badge className="bg-blue-500/90 text-white backdrop-blur">
                              <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                              Live Data
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/90 backdrop-blur h-8 px-2"
                            onClick={() => window.open(property.googleMapsLink, '_blank')}
                          >
                            <MapPin className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{property.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Property Title & Location */}
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{property.name}</h4>
                          <p className="text-gray-600 text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.location} • {property.area}
                          </p>
                        </div>

                        {/* Property Details */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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

                        {/* Top Amenities */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {property.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {property.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{property.amenities.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Pricing & Commission */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                ${property.pricePerNight}
                              </div>
                              <div className="text-sm text-gray-500">per night</div>
                            </div>
                            {searchParams.checkIn && searchParams.checkOut && (
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Your Commission</div>
                                <div className="text-lg font-semibold text-green-600">
                                  ${calculateCommission(
                                    property.pricePerNight * Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
                                    property.commission
                                  ).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            className="w-full group-hover:bg-blue-700 transition-colors" 
                            onClick={() => handleBookProperty(property)}
                            disabled={!searchParams.checkIn || !searchParams.checkOut}
                          >
                            {!searchParams.checkIn || !searchParams.checkOut ? 'Select Dates to Book' : 'Book Now'}
                          </Button>
                          
                          <div className="text-xs text-gray-400 mt-2 text-center">
                            Updated: {property.lastUpdated}
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
                        <div className="flex items-center gap-2">
                          {property.name}
                          {property.otaConnected && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              API Synced
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(property.googleMapsLink, '_blank')}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Map
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Media Access
                          </Button>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {property.location} • {property.area}
                        {property.lastUpdated && (
                          <span className="block text-xs text-gray-400 mt-1">
                            Last updated: {property.lastUpdated}
                          </span>
                        )}
                      </CardDescription>
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
                          <div>
                            <strong>Your Commission:</strong> <span className="text-green-600 font-semibold">{property.commission}%</span>
                          </div>
                          {property.checkInTime && (
                            <div>
                              <strong>Check-in:</strong> {property.checkInTime}
                            </div>
                          )}
                          {property.checkOutTime && (
                            <div>
                              <strong>Check-out:</strong> {property.checkOutTime}
                            </div>
                          )}
                          {property.minStay && (
                            <div>
                              <strong>Min Stay:</strong> {property.minStay} nights
                            </div>
                          )}
                          <div>
                            <strong>Rating:</strong> {property.rating}/5.0
                          </div>
                        </div>
                        
                        {/* Amenities */}
                        <div>
                          <strong className="text-sm">Amenities:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {property.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Policies */}
                        {property.policies && (
                          <div>
                            <strong className="text-sm">Property Policies:</strong>
                            <ul className="text-sm text-gray-600 mt-1">
                              {property.policies.map((policy, index) => (
                                <li key={index} className="flex items-center">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                  {policy}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(property.mediaLinks.brochure, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Fact Sheet
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(property.mediaLinks.photos, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Photo Gallery
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Finance & Commissions Tab */}
            <TabsContent value="media">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Property Media Downloads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Property Media Downloads
                    </CardTitle>
                    <CardDescription>
                      Access high-quality photos, brochures, and floor plans for client presentations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {DEMO_PROPERTIES.map((property) => (
                        <div key={property.id} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{property.name}</h4>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start"
                              onClick={() => window.open(property.mediaLinks.photos, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Photos (Dropbox)
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start"
                              onClick={() => window.open(property.mediaLinks.brochure, '_blank')}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Property Brochure (PDF)
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start"
                              onClick={() => window.open(property.mediaLinks.floorPlan, '_blank')}
                            >
                              <Home className="h-4 w-4 mr-2" />
                              Floor Plan (PDF)
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Client Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Client Resources & Support
                    </CardTitle>
                    <CardDescription>
                      Professional materials and support for client communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Company Booking Terms & Conditions
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Agent Presentation Template
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Templates for Clients
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Emergency Contact Directory
                      </Button>
                      <Separator />
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <strong>Agent Support:</strong><br />
                        Phone: +66 77 123 456<br />
                        Email: agents@hostpilotpro.com<br />
                        WhatsApp: +66 91 234 5678<br />
                        Hours: 24/7 Support Available
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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