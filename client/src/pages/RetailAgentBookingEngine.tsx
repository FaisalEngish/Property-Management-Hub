import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, MapPin, Bed, Users, DollarSign, Calendar, Phone, Mail, Send, Eye, BookOpen, Star, Wifi, Car, Utensils, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays } from "date-fns";

interface PropertySearchResult {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyDescription: string;
  shortDescription: string;
  province: string;
  zone: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  baseNightlyRate: string;
  standardCommissionRate: string;
  primaryImageUrl: string;
  imageGallery: string[];
  amenities: string[];
  specialFeatures: string[];
  averageReviewScore: string;
  averageOccupancyRate: string;
  propertyFactSheetUrl: string;
  virtualTourUrl: string;
  instantBookingEnabled: boolean;
  minimumBookingNotice: number;
}

interface BookingEnquiry {
  id: number;
  enquiryReference: string;
  propertyId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  guestCount: number;
  quotedPrice: string;
  calculatedCommission: string;
  enquiryStatus: string;
  specialRequests: string;
  createdAt: string;
}

interface AgentPreferences {
  preferredLocations: string[];
  preferredBedroomRange: { min: number; max: number };
  preferredPriceRange: { min: number; max: number };
  preferredAmenities: string[];
  showCommissionUpfront: boolean;
}

const enquiryFormSchema = z.object({
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().min(10, "Valid phone number is required"),
  guestNationality: z.string().optional(),
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkOutDate: z.string().min(1, "Check-out date is required"),
  guestCount: z.number().min(1, "At least 1 guest is required"),
  specialRequests: z.string().optional(),
});

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  kitchen: Utensils,
  pool: Waves,
};

const locations = [
  { value: "phuket", label: "Phuket" },
  { value: "bangkok", label: "Bangkok" },
  { value: "chiang-mai", label: "Chiang Mai" },
  { value: "koh-samui", label: "Koh Samui" },
  { value: "pattaya", label: "Pattaya" },
];

const zones = {
  phuket: ["Patong", "Kata", "Karon", "Kamala", "Surin", "Bang Tao"],
  bangkok: ["Sukhumvit", "Silom", "Khao San", "Chatuchak", "Thonglor"],
  "chiang-mai": ["Old City", "Nimman", "Riverside", "Airport Area"],
  "koh-samui": ["Chaweng", "Lamai", "Bophut", "Maenam"],
  pattaya: ["Central Pattaya", "North Pattaya", "Jomtien", "Naklua"],
};

const commonAmenities = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "pool", label: "Swimming Pool", icon: Waves },
  { id: "aircon", label: "Air Conditioning" },
  { id: "balcony", label: "Balcony" },
  { id: "gym", label: "Gym" },
  { id: "beach", label: "Beach Access" },
];

export default function RetailAgentBookingEngine() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Search filters state
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    zone: "",
    checkIn: "",
    checkOut: "",
    guestCount: 2,
    minBedrooms: 1,
    maxBedrooms: 10,
    priceRange: [1000, 10000],
    selectedAmenities: [] as string[],
  });

  const [selectedProperty, setSelectedProperty] = useState<PropertySearchResult | null>(null);
  const [isEnquiryDialogOpen, setIsEnquiryDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Forms
  const enquiryForm = useForm<z.infer<typeof enquiryFormSchema>>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      guestCount: 2,
      checkInDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      checkOutDate: format(addDays(new Date(), 10), "yyyy-MM-dd"),
    },
  });

  // Get agent preferences
  const { data: preferences } = useQuery<AgentPreferences>({
    queryKey: ["/api/agent/search-preferences"],
  });

  // Search properties
  const { data: properties = [], isLoading: isSearching } = useQuery<PropertySearchResult[]>({
    queryKey: [
      "/api/agent/search-properties",
      searchFilters.location || undefined,
      searchFilters.zone || undefined,
      searchFilters.minBedrooms,
      searchFilters.maxBedrooms,
      searchFilters.priceRange[0],
      searchFilters.priceRange[1],
      searchFilters.selectedAmenities.length > 0 ? JSON.stringify(searchFilters.selectedAmenities) : undefined,
      searchFilters.checkIn || undefined,
      searchFilters.checkOut || undefined,
      searchFilters.guestCount,
    ],
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });

  // Get agent enquiries
  const { data: enquiries = [] } = useQuery<BookingEnquiry[]>({
    queryKey: ["/api/agent/booking-enquiries"],
    refetchInterval: 30000,
  });

  // Create enquiry mutation
  const createEnquiryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/agent/booking-enquiry", data),
    onSuccess: () => {
      toast({
        title: "Enquiry Submitted",
        description: "Your booking enquiry has been submitted successfully!",
      });
      setIsEnquiryDialogOpen(false);
      enquiryForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/agent/booking-enquiries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit enquiry",
        variant: "destructive",
      });
    },
  });

  const calculateCommission = (price: number) => {
    return (price * 0.10).toFixed(2);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const onSubmitEnquiry = (data: z.infer<typeof enquiryFormSchema>) => {
    if (!selectedProperty) return;

    const nights = calculateNights(data.checkInDate, data.checkOutDate);
    const totalPrice = parseFloat(selectedProperty.baseNightlyRate) * nights;
    const commission = calculateCommission(totalPrice);

    const enquiryData = {
      ...data,
      propertyId: selectedProperty.propertyId,
      enquiryType: "booking_request",
      requestedCheckIn: data.checkInDate,
      requestedCheckOut: data.checkOutDate,
      quotedPrice: totalPrice.toString(),
      calculatedCommission: commission,
    };

    createEnquiryMutation.mutate(enquiryData);
  };

  const handlePropertySelect = (property: PropertySearchResult) => {
    setSelectedProperty(property);
    setIsPropertyDialogOpen(true);
  };

  const openEnquiryDialog = (property: PropertySearchResult) => {
    setSelectedProperty(property);
    enquiryForm.setValue("checkInDate", searchFilters.checkIn || format(addDays(new Date(), 7), "yyyy-MM-dd"));
    enquiryForm.setValue("checkOutDate", searchFilters.checkOut || format(addDays(new Date(), 10), "yyyy-MM-dd"));
    enquiryForm.setValue("guestCount", searchFilters.guestCount);
    setIsEnquiryDialogOpen(true);
  };

  const formatWithConversion = (amount: string) => {
    return `฿${parseFloat(amount).toLocaleString()}`;
  };

  const PropertyCard = ({ property }: { property: PropertySearchResult }) => {
    const nightlyRate = parseFloat(property.baseNightlyRate);
    const commission = parseFloat(property.standardCommissionRate);
    const commissionAmount = nightlyRate * (commission / 100);

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-200">
          {property.primaryImageUrl ? (
            <img
              src={property.primaryImageUrl}
              alt={property.propertyTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {property.zone}
            </Badge>
          </div>
          {property.averageReviewScore && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                <Star className="h-3 w-3" />
                {parseFloat(property.averageReviewScore).toFixed(1)}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">{property.propertyTitle}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{property.shortDescription}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Max {property.maxGuests}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.province}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 4).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 4} more
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-lg">{formatWithConversion(property.baseNightlyRate)}</span>
                  <span className="text-sm text-gray-500">/night</span>
                </div>
                {preferences?.showCommissionUpfront && (
                  <div className="text-sm text-green-600">
                    Commission: {formatWithConversion(commissionAmount.toString())} ({commission}%)
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePropertySelect(property)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => openEnquiryDialog(property)}>
                  <Send className="h-4 w-4 mr-1" />
                  Enquire
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Search & Booking Engine</h1>
          <p className="text-gray-600">Find available properties and submit booking enquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              <div>
                <Label>Location</Label>
                <Select value={searchFilters.location} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, location: value, zone: "" }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zone */}
              {searchFilters.location && (
                <div>
                  <Label>Zone</Label>
                  <Select value={searchFilters.zone} onValueChange={(value) => 
                    setSearchFilters(prev => ({ ...prev, zone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Zones</SelectItem>
                      {zones[searchFilters.location as keyof typeof zones]?.map(zone => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Check-in/out dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Check-in</Label>
                  <Input
                    type="date"
                    value={searchFilters.checkIn}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input
                    type="date"
                    value={searchFilters.checkOut}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, checkOut: e.target.value }))}
                  />
                </div>
              </div>

              {/* Guest count */}
              <div>
                <Label>Guests</Label>
                <Select value={searchFilters.guestCount.toString()} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, guestCount: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} guest{count !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div>
                <Label>Bedrooms</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={searchFilters.minBedrooms.toString()} onValueChange={(value) => 
                    setSearchFilters(prev => ({ ...prev, minBedrooms: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={searchFilters.maxBedrooms.toString()} onValueChange={(value) => 
                    setSearchFilters(prev => ({ ...prev, maxBedrooms: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price range */}
              <div>
                <Label>Price Range (per night)</Label>
                <div className="space-y-2">
                  <Slider
                    value={searchFilters.priceRange}
                    onValueChange={(value) => setSearchFilters(prev => ({ ...prev, priceRange: value }))}
                    max={20000}
                    min={500}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>฿{searchFilters.priceRange[0].toLocaleString()}</span>
                    <span>฿{searchFilters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <Label>Amenities</Label>
                <div className="space-y-2">
                  {commonAmenities.map(amenity => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={searchFilters.selectedAmenities.includes(amenity.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSearchFilters(prev => ({
                              ...prev,
                              selectedAmenities: [...prev.selectedAmenities, amenity.id]
                            }));
                          } else {
                            setSearchFilters(prev => ({
                              ...prev,
                              selectedAmenities: prev.selectedAmenities.filter(id => id !== amenity.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={amenity.id} className="text-sm flex items-center gap-1">
                        {amenity.icon && <amenity.icon className="h-4 w-4" />}
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Enquiries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Enquiries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {enquiries.slice(0, 5).map(enquiry => (
                <div key={enquiry.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs">{enquiry.enquiryReference}</span>
                    <Badge 
                      variant={enquiry.enquiryStatus === 'confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {enquiry.enquiryStatus}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{enquiry.guestName}</p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(enquiry.requestedCheckIn), "MMM d")} - {format(new Date(enquiry.requestedCheckOut), "MMM d")}
                  </p>
                  {enquiry.quotedPrice && (
                    <p className="text-sm text-green-600">
                      Commission: ฿{parseFloat(enquiry.calculatedCommission).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              {isSearching ? "Searching..." : `${properties.length} properties found`}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>🟢 Available properties only</span>
            </div>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16" />
                      <div className="h-6 bg-gray-200 rounded w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p>No properties found for your search criteria</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Property Detail Dialog */}
      <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProperty?.propertyTitle}</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedProperty.primaryImageUrl || "/placeholder.jpg"}
                      alt={selectedProperty.propertyTitle}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-600">{selectedProperty.propertyDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Bedrooms</Label>
                        <p className="font-semibold">{selectedProperty.bedrooms}</p>
                      </div>
                      <div>
                        <Label>Bathrooms</Label>
                        <p className="font-semibold">{selectedProperty.bathrooms}</p>
                      </div>
                      <div>
                        <Label>Max Guests</Label>
                        <p className="font-semibold">{selectedProperty.maxGuests}</p>
                      </div>
                      <div>
                        <Label>Review Score</Label>
                        <p className="font-semibold">
                          {selectedProperty.averageReviewScore ? 
                            `${parseFloat(selectedProperty.averageReviewScore).toFixed(1)}/5` : 
                            "No reviews yet"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="amenities" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
                {selectedProperty.specialFeatures.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Special Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedProperty.specialFeatures.map((feature, index) => (
                        <Badge key={index} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="location" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Province</Label>
                    <p className="font-semibold">{selectedProperty.province}</p>
                  </div>
                  <div>
                    <Label>Zone</Label>
                    <p className="font-semibold">{selectedProperty.zone}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nightly Rate</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatWithConversion(selectedProperty.baseNightlyRate)}
                    </p>
                  </div>
                  <div>
                    <Label>Your Commission ({selectedProperty.standardCommissionRate}%)</Label>
                    <p className="text-xl font-semibold text-blue-600">
                      {formatWithConversion((parseFloat(selectedProperty.baseNightlyRate) * parseFloat(selectedProperty.standardCommissionRate) / 100).toString())}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  {selectedProperty.propertyFactSheetUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedProperty.propertyFactSheetUrl} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Fact Sheet
                      </a>
                    </Button>
                  )}
                  <Button onClick={() => openEnquiryDialog(selectedProperty)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Enquiry
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Enquiry Dialog */}
      <Dialog open={isEnquiryDialogOpen} onOpenChange={setIsEnquiryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Booking Enquiry</DialogTitle>
          </DialogHeader>
          <Form {...enquiryForm}>
            <form onSubmit={enquiryForm.handleSubmit(onSubmitEnquiry)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={enquiryForm.control}
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
                  control={enquiryForm.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                  control={enquiryForm.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={enquiryForm.control}
                  name="guestNationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality (Optional)</FormLabel>
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
                  control={enquiryForm.control}
                  name="checkInDate"
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
                  control={enquiryForm.control}
                  name="checkOutDate"
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
                  control={enquiryForm.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={enquiryForm.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProperty && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Property:</span>
                      <p className="font-medium">{selectedProperty.propertyTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">{selectedProperty.zone}, {selectedProperty.province}</p>
                    </div>
                    {enquiryForm.watch("checkInDate") && enquiryForm.watch("checkOutDate") && (
                      <>
                        <div>
                          <span className="text-gray-600">Nights:</span>
                          <p className="font-medium">
                            {calculateNights(enquiryForm.watch("checkInDate"), enquiryForm.watch("checkOutDate"))}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Estimated Total:</span>
                          <p className="font-medium text-green-600">
                            {formatWithConversion((
                              parseFloat(selectedProperty.baseNightlyRate) * 
                              calculateNights(enquiryForm.watch("checkInDate"), enquiryForm.watch("checkOutDate"))
                            ).toString())}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Your Commission:</span>
                          <p className="font-medium text-blue-600">
                            {formatWithConversion(calculateCommission(
                              parseFloat(selectedProperty.baseNightlyRate) * 
                              calculateNights(enquiryForm.watch("checkInDate"), enquiryForm.watch("checkOutDate"))
                            ))}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEnquiryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEnquiryMutation.isPending}>
                  {createEnquiryMutation.isPending ? "Submitting..." : "Submit Enquiry"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}