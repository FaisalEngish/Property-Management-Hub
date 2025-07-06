import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isThisWeek, differenceInDays } from "date-fns";
import UnifiedTopBar from "@/components/UnifiedTopBar";
import LocalEmergencyContacts from "@/components/LocalEmergencyContacts";
import {
  Home,
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
  Wifi,
  Star,
  Clock,
  Utensils,
  Camera,
  Car,
  Waves,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Heart,
  MessageCircle,
  MessageSquare,
  Shield,
  Gift,
  Coffee,
  Sparkles,
  Navigation,
  CalendarDays,
  Filter,
  ChevronRight,
  ExternalLink,
  LogOut,
  CreditCard,
} from "lucide-react";

// Filter options for service timeline
type TimelineFilter = "today" | "this_week" | "full_stay";

interface GuestBooking {
  id: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: string;
  totalAmount?: number;
  currency: string;
  depositPaid?: number;
  depositStatus: string;
  emergencyContact?: string;
  specialRequests?: string;
  wifiCode?: string;
  welcomePackInclusions?: any;
  managerContact?: string;
  houseRules?: string;
  checkInInstructions?: string;
  checkOutInstructions?: string;
  propertyInfo?: any;
  property?: {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
  };
}

interface AiRecommendation {
  id: number;
  recommendationType: string;
  title: string;
  description?: string;
  location?: string;
  distance?: string;
  rating?: number;
  priceRange?: string;
  operatingHours?: string;
  website?: string;
  phone?: string;
  imageUrl?: string;
  category?: string;
  weatherData?: any;
}

interface ServiceTimeline {
  id: number;
  serviceType: string;
  serviceName: string;
  scheduledDate: string;
  estimatedTime?: string;
  serviceProvider?: string;
  status: string;
  notes?: string;
}

interface PropertyAmenity {
  id: number;
  amenityName: string;
  amenityType: string;
  description?: string;
  instructions?: string;
  wifiCode?: string;
  emergencyInfo?: string;
}

export default function EnhancedGuestDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>("this_week");

  // Proper logout function with comprehensive session cleanup
  const handleLogout = async () => {
    try {
      // Call the proper logout endpoint
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      
      // Clear all local storage and session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear React Query cache to remove any cached user data
      queryClient.clear();
      
      // Force reload to completely reset application state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, clear local state
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();
      window.location.href = "/";
    }
  };

  // Fetch current guest booking
  const { data: guestBooking, isLoading: loadingBooking } = useQuery<GuestBooking>({
    queryKey: ["/api/guest-dashboard/current-booking"],
    retry: 2,
  });

  // Fetch property amenities
  const { data: propertyAmenities = [], isLoading: loadingAmenities } = useQuery<PropertyAmenity[]>({
    queryKey: ["/api/guest-dashboard/property-amenities", guestBooking?.property?.id],
    enabled: !!guestBooking?.property?.id,
    retry: 2,
  });

  // Fetch AI recommendations
  const { data: aiRecommendations = [], isLoading: loadingRecommendations } = useQuery<AiRecommendation[]>({
    queryKey: ["/api/guest-dashboard/ai-recommendations", guestBooking?.property?.id],
    enabled: !!guestBooking?.property?.id,
    retry: 2,
  });

  // Fetch service timeline
  const { data: serviceTimeline = [], isLoading: loadingTimeline } = useQuery<ServiceTimeline[]>({
    queryKey: ["/api/guest-dashboard/service-timeline", guestBooking?.property?.id],
    enabled: !!guestBooking?.property?.id,
    retry: 2,
  });

  // Fetch extended modules data
  const { data: bookingOverview, isLoading: loadingBookingOverview } = useQuery({
    queryKey: ["/api/guest-dashboard/booking-overview", guestBooking?.id],
    enabled: !!guestBooking?.id,
    retry: 2,
  });

  const { data: servicesOrdered = [], isLoading: loadingServicesOrdered } = useQuery({
    queryKey: ["/api/guest-dashboard/services-ordered", guestBooking?.id],
    enabled: !!guestBooking?.id,
    retry: 2,
  });

  const { data: electricityBilling, isLoading: loadingElectricityBilling } = useQuery({
    queryKey: [`/api/guest-dashboard/electricity-billing/${guestBooking?.id}`],
    enabled: !!guestBooking?.id,
    retry: 2,
  });

  const { data: depositOverview, isLoading: loadingDepositOverview } = useQuery({
    queryKey: [`/api/guest-dashboard/deposit-overview/${guestBooking?.id}`],
    enabled: !!guestBooking?.id,
    retry: 2,
  });

  // Helper functions
  const formatStayDuration = () => {
    if (!guestBooking) return "N/A";
    const days = differenceInDays(new Date(guestBooking.checkOutDate), new Date(guestBooking.checkInDate));
    return `${days} night${days > 1 ? 's' : ''}`;
  };

  // Filter service timeline based on selected filter
  const filteredTimeline = serviceTimeline.filter((service) => {
    const serviceDate = new Date(service.scheduledDate);
    const checkInDate = guestBooking ? new Date(guestBooking.checkInDate) : new Date();
    const checkOutDate = guestBooking ? new Date(guestBooking.checkOutDate) : new Date();

    switch (activeFilter) {
      case "today":
        return isToday(serviceDate);
      case "this_week":
        return isThisWeek(serviceDate);
      case "full_stay":
        return serviceDate >= checkInDate && serviceDate <= checkOutDate;
      default:
        return true;
    }
  });

  // Group recommendations by type
  const groupedRecommendations = aiRecommendations.reduce((acc, rec) => {
    if (!acc[rec.recommendationType]) {
      acc[rec.recommendationType] = [];
    }
    acc[rec.recommendationType].push(rec);
    return acc;
  }, {} as Record<string, AiRecommendation[]>);

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "checked_in": return <Home className="h-4 w-4 text-blue-600" />;
      case "scheduled": return <Clock className="h-4 w-4 text-orange-600" />;
      case "in_progress": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "cleaning": return <Sparkles className="h-5 w-5 text-blue-600" />;
      case "pool": return <Waves className="h-5 w-5 text-cyan-600" />;
      case "garden": return <Sun className="h-5 w-5 text-green-600" />;
      case "pest_control": return <Shield className="h-5 w-5 text-red-600" />;
      case "maintenance": return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };



  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "restaurant": return <Utensils className="h-5 w-5 text-orange-600" />;
      case "attraction": return <Camera className="h-5 w-5 text-purple-600" />;
      case "tour": return <Navigation className="h-5 w-5 text-blue-600" />;
      case "weather": return <Cloud className="h-5 w-5 text-gray-600" />;
      case "service": return <Coffee className="h-5 w-5 text-brown-600" />;
      default: return <Star className="h-5 w-5 text-yellow-600" />;
    }
  };



  const getWifiCode = () => {
    return guestBooking?.wifiCode || 
           propertyAmenities.find(a => a.amenityType === "wifi")?.wifiCode || 
           "Contact manager for WiFi code";
  };

  if (loadingBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your guest dashboard...</p>
        </div>
      </div>
    );
  }

  if (!guestBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Home className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold">No Active Booking</h2>
            <p className="text-muted-foreground">
              We couldn't find an active booking for your account. Please contact your property manager if you believe this is an error.
            </p>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <UnifiedTopBar 
        title={`${guestBooking.property?.name} - Guest Portal`}
        showBackButton={false}
        roleBasedActions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600">
              Demo1234 - Liam Andersen
            </Badge>
            <Badge variant="secondary">
              {formatStayDuration()}
            </Badge>
          </div>
        }
      />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">Welcome back, {guestBooking.guestName}! 🎉</h1>
                  <p className="text-blue-100 text-lg">
                    {format(new Date(guestBooking.checkInDate), "MMM d")} - {format(new Date(guestBooking.checkOutDate), "MMM d, yyyy")} • {formatStayDuration()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5" />
                    <span className="font-medium">{guestBooking.property?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>{guestBooking.property?.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{guestBooking.numberOfGuests} guest{guestBooking.numberOfGuests !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {guestBooking.managerContact && (
                  <Button 
                    variant="secondary" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Manager
                  </Button>
                )}
              </div>

              {guestBooking.property?.imageUrl && (
                <div className="hidden md:block">
                  <img 
                    src={guestBooking.property.imageUrl} 
                    alt={guestBooking.property.name}
                    className="w-32 h-24 object-cover rounded-lg border-2 border-white/20"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="booking-overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 text-xs">
            <TabsTrigger value="booking-overview" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Booking
            </TabsTrigger>
            <TabsTrigger value="services-ordered" className="flex items-center gap-1">
              <Coffee className="h-3 w-3" />
              Services
            </TabsTrigger>
            <TabsTrigger value="electricity-billing" className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              Electricity
            </TabsTrigger>
            <TabsTrigger value="deposit-overview" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="hostaway-info" className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Property Info
            </TabsTrigger>
            <TabsTrigger value="ai-recommendations" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="service-timeline" className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Service Timeline
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex items-center gap-1">
              <Gift className="h-3 w-3" />
              Amenities & Codes
            </TabsTrigger>
          </TabsList>

          {/* Booking Overview Tab */}
          <TabsContent value="booking-overview" className="space-y-6">
            {loadingBookingOverview ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stay Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Stay Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Check-in:</span>
                      <span className="text-sm font-medium">{format(new Date(guestBooking.checkInDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Check-out:</span>
                      <span className="text-sm font-medium">{format(new Date(guestBooking.checkOutDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm font-medium">{formatStayDuration()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Guests:</span>
                      <span className="text-sm font-medium">{guestBooking.numberOfGuests}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      Payment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount:</span>
                      <span className="text-sm font-medium">{guestBooking.currency} {guestBooking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Deposit Paid:</span>
                      <span className="text-sm font-medium">{guestBooking.currency} {guestBooking.depositPaid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Platform:</span>
                      <span className="text-sm font-medium">{guestBooking.platform || "Direct Booking"}</span>
                    </div>
                    <Badge variant={guestBooking.bookingStatus === "confirmed" ? "default" : "secondary"}>
                      {guestBooking.bookingStatus}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Special Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      Special Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {guestBooking.specialRequests ? (
                      <p className="text-sm">{guestBooking.specialRequests}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No special requests</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Services Ordered Tab */}
          <TabsContent value="services-ordered" className="space-y-6">
            {loadingServicesOrdered ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : servicesOrdered.length > 0 ? (
              <div className="space-y-4">
                {servicesOrdered.map((service: any) => (
                  <Card key={service.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-orange-600" />
                            {service.serviceName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(service.serviceDate), "MMM d, yyyy")} at {service.serviceTime}
                          </p>
                          <Badge variant={service.serviceCategory === "massage" ? "default" : "secondary"}>
                            {service.serviceCategory}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{service.currency} {service.totalCost}</p>
                          <Badge variant={service.status === "confirmed" ? "default" : "secondary"}>
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                      {service.guestNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm">{service.guestNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Services Ordered</h3>
                  <p className="text-muted-foreground">You haven't ordered any additional services yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Electricity Billing Tab */}
          <TabsContent value="electricity-billing" className="space-y-6">
            {loadingElectricityBilling ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ) : electricityBilling && electricityBilling.hasData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in Reading */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-blue-600" />
                      Check-in Reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reading:</span>
                      <span className="text-sm font-medium">{electricityBilling.checkIn?.checkInReading} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Method:</span>
                      <Badge variant="secondary">{electricityBilling.checkIn?.checkInMethod}</Badge>
                    </div>
                    {electricityBilling.checkIn?.checkInPhoto && (
                      <img 
                        src={electricityBilling.checkIn.checkInPhoto} 
                        alt="Check-in meter reading"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Check-out Reading & Billing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-red-600" />
                      Check-out & Billing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {electricityBilling.checkOut ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Final Reading:</span>
                          <span className="text-sm font-medium">{electricityBilling.checkOut.checkOutReading} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Usage:</span>
                          <span className="text-sm font-medium">{electricityBilling.checkOut.electricityUsed} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Rate:</span>
                          <span className="text-sm font-medium">฿{electricityBilling.checkOut.ratePerKwh}/kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Charge:</span>
                          <span className="text-sm font-bold">฿{electricityBilling.checkOut.totalCharge}</span>
                        </div>
                        <Badge variant={electricityBilling.checkOut.paymentStatus === "paid" ? "default" : "secondary"}>
                          {electricityBilling.checkOut.paymentStatus}
                        </Badge>
                        {electricityBilling.checkOut?.checkOutPhoto && (
                          <img 
                            src={electricityBilling.checkOut.checkOutPhoto} 
                            alt="Check-out meter reading"
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Check-out reading will be taken during departure.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Electricity Data</h3>
                  <p className="text-muted-foreground">Electricity meter readings will be recorded during check-in.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deposit Overview Tab */}
          <TabsContent value="deposit-overview" className="space-y-6">
            {loadingDepositOverview ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ) : depositOverview ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deposit Paid */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Deposit Paid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="text-sm font-medium">{depositOverview.depositCurrency} {depositOverview.depositAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant={depositOverview.depositType === "cash" ? "secondary" : "default"}>
                        {depositOverview.depositType}
                      </Badge>
                    </div>
                    {depositOverview.depositReceiptPhoto && (
                      <img 
                        src={depositOverview.depositReceiptPhoto} 
                        alt="Deposit receipt"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Deposit Status & Refund */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Refund Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {depositOverview.refundStatus ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Refund Amount:</span>
                          <span className="text-sm font-medium">{depositOverview.refundCurrency} {depositOverview.refundAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Method:</span>
                          <span className="text-sm font-medium">{depositOverview.refundMethod}</span>
                        </div>
                        {depositOverview.discountAmount && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Discount:</span>
                            <span className="text-sm font-medium">-{depositOverview.refundCurrency} {depositOverview.discountAmount}</span>
                          </div>
                        )}
                        <Badge variant={depositOverview.refundStatus === "completed" ? "default" : "secondary"}>
                          {depositOverview.refundStatus}
                        </Badge>
                        {depositOverview.refundReceiptPhoto && (
                          <img 
                            src={depositOverview.refundReceiptPhoto} 
                            alt="Refund receipt"
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Deposit refund will be processed during check-out.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Deposit Information</h3>
                  <p className="text-muted-foreground">Deposit information will be available after check-in.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Property Info Tab */}
          <TabsContent value="hostaway-info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* House Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    House Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guestBooking.houseRules ? (
                    <div className="prose prose-sm max-w-none">
                      {guestBooking.houseRules.split('\n').map((rule, index) => (
                        <p key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {rule}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Please follow standard property guidelines and respect other guests.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Check-in/Check-out Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Check-in/out Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">Check-in Instructions:</p>
                    <p className="text-sm text-muted-foreground">
                      {guestBooking.checkInInstructions || "Standard check-in is at 3:00 PM. Please contact the manager for specific instructions."}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm">Check-out Instructions:</p>
                    <p className="text-sm text-muted-foreground">
                      {guestBooking.checkOutInstructions || "Check-out is at 11:00 AM. Please leave keys at reception or as instructed."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Deposit & Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Deposit Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Deposit Amount:</span>
                    <span className="font-medium">
                      {guestBooking.depositPaid ? `${guestBooking.currency} ${guestBooking.depositPaid}` : "No deposit required"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    <Badge variant={guestBooking.depositStatus === "paid" ? "default" : "secondary"}>
                      {guestBooking.depositStatus || "pending"}
                    </Badge>
                  </div>
                  {guestBooking.welcomePackInclusions && (
                    <div>
                      <p className="text-sm font-medium mb-2">Welcome Pack Includes:</p>
                      <div className="space-y-1">
                        {Array.isArray(guestBooking.welcomePackInclusions) ? 
                          guestBooking.welcomePackInclusions.map((item: any, index: number) => (
                            <p key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Gift className="h-3 w-3" />
                              {typeof item === 'object' ? item.name : item}
                            </p>
                          )) : 
                          <p className="text-sm text-muted-foreground">Welcome amenities included</p>
                        }
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contact */}
            {guestBooking.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-red-600" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{guestBooking.emergencyContact}</p>
                  <p className="text-sm text-muted-foreground">Available 24/7 for urgent matters</p>
                </CardContent>
              </Card>
            )}

            {/* Local & Emergency Contacts */}
            <LocalEmergencyContacts propertyId={guestBooking.propertyId} />
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="ai-recommendations" className="space-y-6">
            {loadingRecommendations ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading personalized recommendations...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top Restaurants */}
                {groupedRecommendations.restaurant && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-orange-600" />
                        Top 3 Restaurants Nearby
                      </CardTitle>
                      <CardDescription>AI-curated dining recommendations based on your location</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {groupedRecommendations.restaurant.slice(0, 3).map((restaurant) => (
                          <div key={restaurant.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{restaurant.title}</h4>
                                <p className="text-sm text-muted-foreground">{restaurant.category}</p>
                              </div>
                              {restaurant.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">{restaurant.rating}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm">{restaurant.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {restaurant.distance}
                              </span>
                              <span>{restaurant.priceRange}</span>
                            </div>
                            {restaurant.website && (
                              <Button size="sm" variant="outline" className="w-full">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Visit Website
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Attractions */}
                {groupedRecommendations.attraction && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-purple-600" />
                        Nearby Beaches & Attractions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupedRecommendations.attraction.map((attraction) => (
                          <div key={attraction.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium">{attraction.title}</h4>
                              {attraction.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm">{attraction.rating}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{attraction.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {attraction.distance}
                              </span>
                              {attraction.operatingHours && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {attraction.operatingHours}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Weather Forecast */}
                {groupedRecommendations.weather && groupedRecommendations.weather[0]?.weatherData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-gray-600" />
                        Weather Forecast During Your Stay
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Mock weather data for demo */}
                        <div className="text-center p-4 border rounded-lg">
                          <Sun className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="font-medium">Today</p>
                          <p className="text-2xl font-bold">32°C</p>
                          <p className="text-sm text-muted-foreground">Sunny</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Cloud className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                          <p className="font-medium">Tomorrow</p>
                          <p className="text-2xl font-bold">29°C</p>
                          <p className="text-sm text-muted-foreground">Partly Cloudy</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <CloudRain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="font-medium">Day 3</p>
                          <p className="text-2xl font-bold">26°C</p>
                          <p className="text-sm text-muted-foreground">Light Rain</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tours & Services */}
                {groupedRecommendations.tour && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-blue-600" />
                        Suggested Tours & Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {groupedRecommendations.tour.map((tour) => (
                          <div key={tour.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                            <Navigation className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-medium">{tour.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{tour.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{tour.priceRange}</span>
                                <span>{tour.distance}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              Book Now
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Service Timeline Tab */}
          <TabsContent value="service-timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                      Upcoming Service Timeline
                    </CardTitle>
                    <CardDescription>See when services are scheduled at your property</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <div className="flex rounded-md overflow-hidden border">
                      {(["today", "this_week", "full_stay"] as TimelineFilter[]).map((filter) => (
                        <Button
                          key={filter}
                          size="sm"
                          variant={activeFilter === filter ? "default" : "ghost"}
                          className="rounded-none border-0"
                          onClick={() => setActiveFilter(filter)}
                        >
                          {filter === "today" && "Today"}
                          {filter === "this_week" && "This Week"}
                          {filter === "full_stay" && "Full Stay"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTimeline ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading service schedule...</p>
                  </div>
                ) : filteredTimeline.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTimeline.map((service) => (
                      <div key={service.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {getServiceIcon(service.serviceType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{service.serviceName}</h4>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(service.status)}
                              <Badge variant="outline">{service.status}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(service.scheduledDate), "MMM d, yyyy")}
                            </span>
                            {service.estimatedTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.estimatedTime}
                              </span>
                            )}
                            {service.serviceProvider && (
                              <span>by {service.serviceProvider}</span>
                            )}
                          </div>
                          {service.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{service.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Services Scheduled</h3>
                    <p className="text-muted-foreground">
                      {activeFilter === "today" && "No services scheduled for today."}
                      {activeFilter === "this_week" && "No services scheduled for this week."}
                      {activeFilter === "full_stay" && "No services scheduled during your stay."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amenities & Codes Tab */}
          <TabsContent value="amenities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WiFi Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-blue-600" />
                    WiFi Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">WiFi Code:</p>
                    <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                      {getWifiCode()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect to the network and use this password. If you experience any connectivity issues, please contact the property manager.
                  </p>
                </CardContent>
              </Card>

              {/* Property Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-600" />
                    Property Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAmenities ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading amenities...</p>
                    </div>
                  ) : propertyAmenities.length > 0 ? (
                    <div className="space-y-3">
                      {propertyAmenities.map((amenity) => (
                        <div key={amenity.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {amenity.amenityName}
                          </h4>
                          {amenity.description && (
                            <p className="text-sm text-muted-foreground mt-1">{amenity.description}</p>
                          )}
                          {amenity.instructions && (
                            <p className="text-sm text-blue-600 mt-1">
                              <Info className="h-3 w-3 inline mr-1" />
                              {amenity.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Home className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Amenity information will be updated soon.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Special Requests */}
            {guestBooking.specialRequests && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    Your Special Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{guestBooking.specialRequests}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Our team is working to accommodate your requests. Please contact the manager if you have any questions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Personalized Activity Recommendations
                </CardTitle>
                <CardDescription>
                  Discover amazing local experiences curated for your stay at {guestBooking?.property?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 space-y-4">
                  <Heart className="h-12 w-12 text-pink-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We're preparing personalized activity recommendations just for you.
                    </p>
                    <Button 
                      onClick={() => window.open('/guest-activity-recommendations', '_blank')}
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      Preview Full Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sign Out Button */}
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}