import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Globe, 
  Navigation,
  Heart,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Utensils,
  Waves,
  Mountain,
  Sparkles,
  ShoppingBag,
  Camera,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ActivityRecommendation {
  id: number;
  category: string;
  title: string;
  description: string;
  shortDescription: string;
  address: string;
  googleMapsLink: string;
  websiteUrl?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  bookingUrl?: string;
  estimatedPrice: string;
  priceCategory: string;
  operatingHours: string;
  bestTimeToVisit: string;
  durationNeeded: string;
  suitableFor: string[];
  ageGroup: string;
  activityLevel: string;
  requiresAdvanceBooking: boolean;
  tags: string[];
  imageUrl?: string;
  isFeatured: boolean;
}

interface GuestPreferences {
  preferredCategories: string[];
  travelStyle: string;
  budgetPreference: string;
  activityLevel: string;
  groupSize: number;
  hasChildren: boolean;
  specialInterests: string[];
}

const categoryIcons = {
  restaurant: Utensils,
  beach: Waves,
  viewpoint: Mountain,
  spa: Sparkles,
  market: ShoppingBag,
  tour: Camera
};

const categoryColors = {
  restaurant: "bg-orange-100 text-orange-800",
  beach: "bg-blue-100 text-blue-800",
  viewpoint: "bg-green-100 text-green-800",
  spa: "bg-purple-100 text-purple-800",
  market: "bg-yellow-100 text-yellow-800",
  tour: "bg-red-100 text-red-800"
};

export default function GuestActivityRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPreferenceSetup, setShowPreferenceSetup] = useState(false);
  const [preferences, setPreferences] = useState<Partial<GuestPreferences>>({
    preferredCategories: [],
    travelStyle: "romantic",
    budgetPreference: "luxury",
    activityLevel: "relaxing",
    groupSize: 2,
    hasChildren: false,
    specialInterests: []
  });

  // Demo data for current guest - using Demo1234 reservation
  const currentGuest = {
    reservationId: "Demo1234",
    guestId: "guest-liam-andersen",
    propertyId: 1,
    guestName: "Liam Andersen",
    checkInDate: "2025-07-05",
    checkOutDate: "2025-07-10",
    property: {
      name: "Villa Aruna",
      location: "Koh Samui, Thailand"
    }
  };

  // Fetch activity recommendations
  const { data: recommendations = [], isLoading: loadingRecommendations } = useQuery({
    queryKey: ["/api/guest-activity-recommendations", currentGuest.propertyId, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      params.append("isFeatured", "true");
      return apiRequest("GET", `/api/guest-activity-recommendations/${currentGuest.propertyId}?${params}`);
    }
  });

  // Fetch guest preferences
  const { data: guestPreferences } = useQuery({
    queryKey: ["/api/guest-activity-preferences", currentGuest.reservationId],
    queryFn: () => apiRequest("GET", `/api/guest-activity-preferences/${currentGuest.reservationId}`)
  });

  // Track interaction mutation
  const trackInteractionMutation = useMutation({
    mutationFn: (interactionData: any) => 
      apiRequest("POST", "/api/guest-recommendation-interactions", interactionData),
    onSuccess: () => {
      // Optionally refresh analytics or update UI
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefData: any) => {
      if (guestPreferences) {
        return apiRequest("PUT", `/api/guest-activity-preferences/${currentGuest.reservationId}`, prefData);
      } else {
        return apiRequest("POST", "/api/guest-activity-preferences", {
          ...prefData,
          organizationId: "default-org",
          reservationId: currentGuest.reservationId,
          guestId: currentGuest.guestId,
          propertyId: currentGuest.propertyId
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your activity preferences have been saved. We'll show you more personalized recommendations!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-activity-preferences"] });
      setShowPreferenceSetup(false);
    }
  });

  const handleInteraction = (recommendation: ActivityRecommendation, interactionType: string, clickedElement?: string) => {
    trackInteractionMutation.mutate({
      organizationId: "default-org",
      reservationId: currentGuest.reservationId,
      guestId: currentGuest.guestId,
      recommendationId: recommendation.id,
      interactionType,
      sessionId: `session-${Date.now()}`,
      deviceType: "desktop",
      clickedElement,
      viewDuration: interactionType === "view" ? 30 : undefined
    });
  };

  const handlePreferenceSubmit = () => {
    updatePreferencesMutation.mutate({
      preferredCategories: preferences.preferredCategories,
      travelStyle: preferences.travelStyle,
      budgetPreference: preferences.budgetPreference,
      activityLevel: preferences.activityLevel,
      groupSize: preferences.groupSize,
      hasChildren: preferences.hasChildren,
      specialInterests: preferences.specialInterests,
      preferencesSetBy: "guest"
    });
  };

  const categories = [
    { value: "all", label: "All Recommendations" },
    { value: "restaurant", label: "Restaurants" },
    { value: "beach", label: "Beaches" },
    { value: "tour", label: "Tours & Activities" },
    { value: "spa", label: "Spa & Wellness" },
    { value: "viewpoint", label: "Viewpoints" },
    { value: "market", label: "Markets & Shopping" }
  ];

  const filteredRecommendations = selectedCategory === "all" 
    ? recommendations 
    : recommendations.filter((rec: ActivityRecommendation) => rec.category === selectedCategory);

  // Check if guest can access (3 days before check-in and during stay)
  const canAccess = () => {
    const now = new Date();
    const checkIn = new Date(currentGuest.checkInDate);
    const checkOut = new Date(currentGuest.checkOutDate);
    const threeDaysBefore = new Date(checkIn);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
    
    return now >= threeDaysBefore && now <= checkOut;
  };

  if (!canAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Activity Recommendations</CardTitle>
              <CardDescription>
                Activity recommendations will be available 3 days before your check-in date.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg mb-2">Check-in: {new Date(currentGuest.checkInDate).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">
                Recommendations available from: {new Date(new Date(currentGuest.checkInDate).getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Discover {currentGuest.property.location}
                </h1>
                <p className="text-gray-600 mt-2">
                  Welcome {currentGuest.guestName}! Here are personalized recommendations for your stay at {currentGuest.property.name}
                </p>
              </div>
              <Button 
                onClick={() => setShowPreferenceSetup(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Customize Preferences
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        {loadingRecommendations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((recommendation: ActivityRecommendation) => {
              const IconComponent = categoryIcons[recommendation.category as keyof typeof categoryIcons] || MapPin;
              
              return (
                <Card 
                  key={recommendation.id} 
                  className="hover:shadow-xl transition-all duration-300 bg-white"
                  onMouseEnter={() => handleInteraction(recommendation, "view")}
                >
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <IconComponent className="h-12 w-12 text-white" />
                    </div>
                    {recommendation.isFeatured && (
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
                        Featured
                      </Badge>
                    )}
                    <Badge className={`absolute top-3 left-3 ${categoryColors[recommendation.category as keyof typeof categoryColors]}`}>
                      {recommendation.category}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{recommendation.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {recommendation.shortDescription}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{recommendation.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{recommendation.operatingHours}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-600">{recommendation.estimatedPrice}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recommendation.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {recommendation.googleMapsLink && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            handleInteraction(recommendation, "click", "maps");
                            window.open(recommendation.googleMapsLink, '_blank');
                          }}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Maps
                        </Button>
                      )}
                      
                      {recommendation.websiteUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            handleInteraction(recommendation, "click", "website");
                            window.open(recommendation.websiteUrl, '_blank');
                          }}
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Website
                        </Button>
                      )}
                      
                      {recommendation.phoneNumber && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            handleInteraction(recommendation, "click", "phone");
                            window.open(`tel:${recommendation.phoneNumber}`, '_blank');
                          }}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>

                    {recommendation.bookingUrl && (
                      <Button 
                        className="w-full mt-3" 
                        onClick={() => {
                          handleInteraction(recommendation, "click", "booking");
                          window.open(recommendation.bookingUrl, '_blank');
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredRecommendations.length === 0 && !loadingRecommendations && (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
              <p className="text-gray-600">Try selecting a different category or customize your preferences.</p>
            </CardContent>
          </Card>
        )}

        {/* Preference Setup Modal */}
        {showPreferenceSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Customize Your Preferences</CardTitle>
                <CardDescription>
                  Tell us about your interests to get more personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferred Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(1).map((category) => (
                      <Button
                        key={category.value}
                        size="sm"
                        variant={preferences.preferredCategories?.includes(category.value) ? "default" : "outline"}
                        onClick={() => {
                          const current = preferences.preferredCategories || [];
                          if (current.includes(category.value)) {
                            setPreferences({
                              ...preferences,
                              preferredCategories: current.filter(c => c !== category.value)
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredCategories: [...current, category.value]
                            });
                          }
                        }}
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Travel Style</label>
                  <div className="flex flex-wrap gap-2">
                    {["romantic", "family", "adventure", "relaxation", "cultural"].map((style) => (
                      <Button
                        key={style}
                        size="sm"
                        variant={preferences.travelStyle === style ? "default" : "outline"}
                        onClick={() => setPreferences({ ...preferences, travelStyle: style })}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Preference</label>
                  <div className="flex flex-wrap gap-2">
                    {["budget", "moderate", "luxury"].map((budget) => (
                      <Button
                        key={budget}
                        size="sm"
                        variant={preferences.budgetPreference === budget ? "default" : "outline"}
                        onClick={() => setPreferences({ ...preferences, budgetPreference: budget })}
                      >
                        {budget.charAt(0).toUpperCase() + budget.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Activity Level</label>
                  <div className="flex flex-wrap gap-2">
                    {["relaxing", "moderate", "active"].map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={preferences.activityLevel === level ? "default" : "outline"}
                        onClick={() => setPreferences({ ...preferences, activityLevel: level })}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handlePreferenceSubmit}
                    disabled={updatePreferencesMutation.isPending}
                    className="flex-1"
                  >
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreferenceSetup(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}