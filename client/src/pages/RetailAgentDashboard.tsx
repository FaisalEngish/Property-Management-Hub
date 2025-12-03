import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Coffee, 
  Utensils,
  Star,
  DollarSign,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Eye,
  ExternalLink,
  Phone,
  Mail,
  User,
  CreditCard,
  Receipt,
  FileText,
  Building,
  Camera,
  MessageSquare,
  Banknote,
  TrendingUp,
  BarChart3,
  PieChart,
  CalendarDays,
  Target,
  Briefcase,
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Activity,
  Globe,
  Shield,
  Zap,
  Heart,
  Award,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Types for retail agent dashboard
interface PropertyAvailability {
  id: number;
  name: string;
  address: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  images: string[];
  availability: boolean;
  minStay: number;
  commissionRate: number;
  hostawayId?: string;
  mediaLinks?: {
    googleDrive?: string;
    photoGallery?: string;
    virtualTour?: string;
  };
  rules: string[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
}

interface BookingQuote {
  propertyId: number;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  baseRate: number;
  fees: number;
  taxes: number;
  commissionRate: number;
  commissionAmount: number;
  availability: boolean;
}

interface AgentBooking {
  id: number;
  propertyId: number;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  bookingStatus: string;
  commissionStatus: string;
  hostawayBookingId?: string;
  createdAt: string;
}

interface CommissionSummary {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  pendingCommissions: number;
  totalBookings: number;
  totalPayouts: number;
  avgCommissionPerBooking: number;
}

interface AgentPayout {
  id: number;
  amount: number;
  payoutStatus: string;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
  receiptUrl?: string;
  notes?: string;
}

const AMENITY_ICONS = {
  wifi: Wifi,
  parking: Car,
  kitchen: Utensils,
  pool: Sparkles,
  gym: Activity,
  spa: Heart,
  security: Shield,
  cleaning: Sparkles,
  concierge: User,
  restaurant: Coffee,
  beach: Globe,
  garden: Globe,
  balcony: Home,
  aircon: Zap,
  heating: Zap,
  laundry: Settings,
  pets: Heart,
  smoking: XCircle,
  events: Star,
  business: Briefcase
};

const BOOKING_STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const COMMISSION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

export default function RetailAgentDashboard() {
  const [activeTab, setActiveTab] = useState("booking");
  const [searchFilters, setSearchFilters] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    bedrooms: 0,
    priceMin: 0,
    priceMax: 1000,
    location: "",
    amenities: [] as string[]
  });
  const [selectedProperty, setSelectedProperty] = useState<PropertyAvailability | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: ""
  });
  const [payoutRequest, setPayoutRequest] = useState({
    amount: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Data queries
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/agent/properties", searchFilters],
    enabled: !!(searchFilters.checkIn && searchFilters.checkOut),
  });

  const { data: bookingQuote, isLoading: quoteLoading } = useQuery({
    queryKey: ["/api/agent/quote", selectedProperty?.id, searchFilters.checkIn, searchFilters.checkOut],
    enabled: !!(selectedProperty && searchFilters.checkIn && searchFilters.checkOut),
  });

  const { data: agentBookings = [] } = useQuery({
    queryKey: ["/api/agent/bookings"],
    enabled: !!user && user.role === 'retail-agent',
  });

  const { data: commissionSummary } = useQuery({
    queryKey: ["/api/agent/commission-summary"],
    enabled: !!user && user.role === 'retail-agent',
  });

  const { data: agentPayouts = [] } = useQuery({
    queryKey: ["/api/agent/payouts"],
    enabled: !!user && user.role === 'retail-agent',
  });

  // Mutations
  const createBooking = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/agent/bookings", data),
    onSuccess: () => {
      toast({ title: "Booking request submitted successfully" });
      setShowBookingDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/agent/bookings"] });
      setBookingDetails({ guestName: "", guestEmail: "", guestPhone: "", specialRequests: "" });
      setSelectedProperty(null);
    },
    onError: (error) => {
      toast({ title: "Error submitting booking", description: error.message, variant: "destructive" });
    },
  });

  const requestPayout = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/agent/payouts", data),
    onSuccess: () => {
      toast({ title: "Payout request submitted successfully" });
      setShowPayoutDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/agent/payouts"] });
      setPayoutRequest({ amount: "", notes: "" });
    },
    onError: (error) => {
      toast({ title: "Error submitting payout request", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions
  const formatWithConversion = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSearchProperties = () => {
    if (!searchFilters.checkIn || !searchFilters.checkOut) {
      toast({ title: "Please select check-in and check-out dates", variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["/api/agent/properties"] });
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== 'retail-agent') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold">Retail Agent Access Required</h3>
              <p className="text-gray-600">This dashboard is only available for retail agents.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Live Booking Engine Component
  const BookingEngineTab = () => (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Property Search & Booking Engine
          </CardTitle>
          <CardDescription>
            Search available properties and create bookings with live Hostaway integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-In Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={searchFilters.checkIn}
                onChange={(e) => setSearchFilters({...searchFilters, checkIn: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-Out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={searchFilters.checkOut}
                onChange={(e) => setSearchFilters({...searchFilters, checkOut: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Select value={searchFilters.guests.toString()} onValueChange={(value) => setSearchFilters({...searchFilters, guests: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} Guest{num > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select value={searchFilters.bedrooms.toString()} onValueChange={(value) => setSearchFilters({...searchFilters, bedrooms: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  {[1,2,3,4,5,6].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} Bedroom{num > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, area, or property name"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMin">Min Price (per night)</Label>
              <Input
                id="priceMin"
                type="number"
                placeholder="0"
                value={searchFilters.priceMin}
                onChange={(e) => setSearchFilters({...searchFilters, priceMin: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax">Max Price (per night)</Label>
              <Input
                id="priceMax"
                type="number"
                placeholder="1000"
                value={searchFilters.priceMax}
                onChange={(e) => setSearchFilters({...searchFilters, priceMax: parseInt(e.target.value) || 1000})}
              />
            </div>
          </div>

          <Button onClick={handleSearchProperties} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Search Available Properties
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {(searchFilters.checkIn && searchFilters.checkOut) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-500" />
              Available Properties ({properties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property: PropertyAvailability) => (
                  <Card key={property.id} className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedProperty(property)}>
                    <CardContent className="p-0">
                      {property.images?.[0] && (
                        <img 
                          src={property.images[0]} 
                          alt={property.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}
                        </p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Up to {property.maxGuests}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {property.amenities?.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {property.amenities?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{property.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">{formatWithConversion(property.pricePerNight)}</p>
                            <p className="text-sm text-gray-600">per night</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              {property.commissionRate}% commission
                            </p>
                            <p className="text-xs text-gray-500">
                              ~{formatWithConversion(property.pricePerNight * property.commissionRate / 100)}
                            </p>
                          </div>
                        </div>

                        {property.mediaLinks && (
                          <div className="flex gap-2 mt-3">
                            {property.mediaLinks.googleDrive && (
                              <Button variant="outline" size="sm">
                                <Camera className="h-3 w-3 mr-1" />
                                Photos
                              </Button>
                            )}
                            {property.mediaLinks.virtualTour && (
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Tour
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {properties.length === 0 && !propertiesLoading && (
              <div className="text-center py-8">
                <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold">No Properties Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria to find available properties.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Villa Details & Media Component
  const VillaDetailsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-500" />
            Villa Descriptions & Media Library
          </CardTitle>
          <CardDescription>
            Access detailed property information, media files, and booking specifications synced from Hostaway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: PropertyAvailability) => (
              <Card key={property.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{property.name}</h3>
                    {property.hostawayId && (
                      <Badge variant="outline">
                        <Globe className="h-3 w-3 mr-1" />
                        Hostaway
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{property.description}</p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Property Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {property.bedrooms} Bedrooms
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          {property.bathrooms} Bathrooms
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Max {property.maxGuests} guests
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {property.minStay} nights min
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Check-in/out Times</h4>
                      <div className="text-sm text-gray-600">
                        <p>Check-in: {property.checkInTime}</p>
                        <p>Check-out: {property.checkOutTime}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {property.amenities?.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">House Rules</h4>
                      <ul className="text-xs text-gray-600">
                        {property.rules?.map((rule, index) => (
                          <li key={index} className="mb-1">• {rule}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Media Access</h4>
                      <div className="flex gap-2">
                        {property.mediaLinks?.googleDrive && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={property.mediaLinks.googleDrive} target="_blank" rel="noopener noreferrer">
                              <Camera className="h-3 w-3 mr-1" />
                              Photos
                            </a>
                          </Button>
                        )}
                        {property.mediaLinks?.virtualTour && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={property.mediaLinks.virtualTour} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" />
                              Virtual Tour
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          Fact Sheet
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{formatWithConversion(property.pricePerNight)}/night</p>
                          <p className="text-xs text-gray-600">{property.cancellationPolicy}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {property.commissionRate}% commission
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Finance Tab Component
  const FinanceTab = () => (
    <div className="space-y-6">
      {/* Commission Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-500" />
            Commission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <h3 className="text-green-600 font-medium mb-2">Total Earned</h3>
              <p className="text-2xl font-bold text-green-800">
                {formatWithConversion(commissionSummary?.totalEarned || 0)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <h3 className="text-blue-600 font-medium mb-2">Current Balance</h3>
              <p className="text-2xl font-bold text-blue-800">
                {formatWithConversion(commissionSummary?.currentBalance || 0)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
              <h3 className="text-yellow-600 font-medium mb-2">Pending</h3>
              <p className="text-2xl font-bold text-yellow-800">
                {formatWithConversion(commissionSummary?.pendingCommissions || 0)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <h3 className="text-purple-600 font-medium mb-2">Total Bookings</h3>
              <p className="text-2xl font-bold text-purple-800">
                {commissionSummary?.totalBookings || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings & Commissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              Commission Log
            </CardTitle>
            <Button onClick={() => setShowPayoutDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentBookings?.map((booking: AgentBooking) => (
              <Card key={booking.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{booking.propertyName}</h4>
                      <p className="text-sm text-gray-600">Guest: {booking.guestName}</p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(booking.checkIn), 'MMM d')} - {format(parseISO(booking.checkOut), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatWithConversion(booking.totalAmount)}</p>
                      <p className="text-sm text-green-600 font-medium">
                        Commission: {formatWithConversion(booking.commissionAmount)} ({booking.commissionRate}%)
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={BOOKING_STATUS_COLORS[booking.bookingStatus as keyof typeof BOOKING_STATUS_COLORS]}>
                          {booking.bookingStatus}
                        </Badge>
                        <Badge className={COMMISSION_STATUS_COLORS[booking.commissionStatus as keyof typeof COMMISSION_STATUS_COLORS]}>
                          {booking.commissionStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {agentBookings?.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold">No Bookings Yet</h3>
                <p className="text-gray-600">
                  Start booking properties to earn commissions.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agentPayouts?.map((payout: AgentPayout) => (
              <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{formatWithConversion(payout.amount)}</p>
                  <p className="text-sm text-gray-600">
                    Requested: {format(parseISO(payout.requestedAt), 'MMM d, yyyy')}
                  </p>
                  {payout.notes && (
                    <p className="text-sm text-gray-700 mt-1">{payout.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={
                    payout.payoutStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payout.payoutStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
                    payout.payoutStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {payout.payoutStatus}
                  </Badge>
                  {payout.receiptUrl && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <Eye className="h-3 w-3 mr-1" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {agentPayouts?.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold">No Payouts Yet</h3>
                <p className="text-gray-600">
                  Payout requests will appear here once submitted.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-500" />
            Retail Agent Dashboard
          </h1>
          <p className="text-muted-foreground">
            Live booking engine with Hostaway integration, commission tracking, and property media access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            🔍 Live Booking Engine
          </TabsTrigger>
          <TabsTrigger value="villas" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            📄 Villa Descriptions & Media
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            💰 Finance & Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="booking">
          <BookingEngineTab />
        </TabsContent>

        <TabsContent value="villas">
          <VillaDetailsTab />
        </TabsContent>

        <TabsContent value="finance">
          <FinanceTab />
        </TabsContent>
      </Tabs>

      {/* Property Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Booking - {selectedProperty?.name}</DialogTitle>
            <DialogDescription>
              Submit a booking request for this property. Commission will be calculated automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {bookingQuote && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Booking Quote</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>Check-in: {searchFilters.checkIn}</p>
                      <p>Check-out: {searchFilters.checkOut}</p>
                      <p>Nights: {calculateNights(searchFilters.checkIn, searchFilters.checkOut)}</p>
                    </div>
                    <div>
                      <p>Total Amount: {formatWithConversion(bookingQuote.totalAmount)}</p>
                      <p>Commission Rate: {bookingQuote.commissionRate}%</p>
                      <p className="font-semibold text-green-600">
                        Your Commission: {formatWithConversion(bookingQuote.commissionAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Guest Name</Label>
                <Input
                  id="guestName"
                  value={bookingDetails.guestName}
                  onChange={(e) => setBookingDetails({...bookingDetails, guestName: e.target.value})}
                  placeholder="Enter guest full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={bookingDetails.guestEmail}
                  onChange={(e) => setBookingDetails({...bookingDetails, guestEmail: e.target.value})}
                  placeholder="guest@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone">Guest Phone</Label>
              <Input
                id="guestPhone"
                value={bookingDetails.guestPhone}
                onChange={(e) => setBookingDetails({...bookingDetails, guestPhone: e.target.value})}
                placeholder="Enter guest phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={bookingDetails.specialRequests}
                onChange={(e) => setBookingDetails({...bookingDetails, specialRequests: e.target.value})}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createBooking.mutate({
                ...bookingDetails,
                propertyId: selectedProperty?.id,
                checkIn: searchFilters.checkIn,
                checkOut: searchFilters.checkOut,
                totalAmount: bookingQuote?.totalAmount || 0,
                commissionRate: selectedProperty?.commissionRate || 10,
                commissionAmount: bookingQuote?.commissionAmount || 0
              })}
              disabled={createBooking.isPending || !bookingDetails.guestName || !bookingDetails.guestEmail}
            >
              {createBooking.isPending ? "Submitting..." : "Submit Booking Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Commission Payout</DialogTitle>
            <DialogDescription>
              Submit a request to receive your available commission balance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Available Balance</h4>
              <p className="text-2xl font-bold text-green-800">
                {formatWithConversion(commissionSummary?.currentBalance || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payoutAmount">Payout Amount</Label>
              <Input
                id="payoutAmount"
                type="number"
                step="0.01"
                value={payoutRequest.amount}
                onChange={(e) => setPayoutRequest({...payoutRequest, amount: e.target.value})}
                placeholder="Enter amount to request"
                max={commissionSummary?.currentBalance || 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payoutNotes">Notes (Optional)</Label>
              <Textarea
                id="payoutNotes"
                value={payoutRequest.notes}
                onChange={(e) => setPayoutRequest({...payoutRequest, notes: e.target.value})}
                placeholder="Add any notes for the payout request..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => requestPayout.mutate(payoutRequest)}
              disabled={requestPayout.isPending || !payoutRequest.amount || parseFloat(payoutRequest.amount) <= 0}
            >
              {requestPayout.isPending ? "Submitting..." : "Submit Payout Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}