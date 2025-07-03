import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Utensils,
  Star,
  Calendar,
  DollarSign,
  Camera,
  ClipboardList,
  Wrench,
  Home
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function PropertyDetailView() {
  const [, params] = useRoute("/property/:id");
  const [, setLocation] = useLocation();
  const propertyId = params?.id;

  // Mock property data for demo purposes
  const mockPropertyDetail = {
    id: propertyId,
    name: "Luxury Beachfront Villa Phuket",
    address: "123 Beach Road, Patong, Phuket 83150, Thailand",
    description: "Stunning beachfront villa with panoramic ocean views. This luxury property features modern amenities, private pool, and direct beach access. Perfect for families or groups seeking an unforgettable tropical getaway.",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 280,
    status: "active",
    images: [
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600"
    ],
    amenities: [
      "Private Pool",
      "Ocean View", 
      "WiFi",
      "Air Conditioning",
      "Kitchen",
      "Parking",
      "Beach Access",
      "BBQ Area",
      "Garden",
      "Security"
    ],
    houseRules: [
      "Check-in: 3:00 PM",
      "Check-out: 11:00 AM", 
      "No smoking",
      "No pets",
      "No parties/events",
      "Quiet hours: 10 PM - 7 AM"
    ],
    location: {
      latitude: 7.8804,
      longitude: 98.3923,
      nearbyAttractions: [
        "Patong Beach - 50m",
        "Bangla Road - 500m", 
        "Jungceylon Shopping Center - 800m",
        "Phuket FantaSea - 2km"
      ]
    },
    reviews: {
      averageRating: 4.8,
      totalReviews: 127,
      recentReviews: [
        {
          guest: "Sarah M.",
          rating: 5,
          date: "2024-12-15",
          comment: "Absolutely stunning villa! The ocean view is breathtaking and the amenities exceeded our expectations."
        },
        {
          guest: "James K.",
          rating: 5,
          date: "2024-12-10", 
          comment: "Perfect location, beautiful property, and excellent host communication. Highly recommended!"
        }
      ]
    },
    calendar: {
      currentBookings: [
        { checkIn: "2025-01-15", checkOut: "2025-01-20", guest: "Thompson Family" },
        { checkIn: "2025-02-01", checkOut: "2025-02-07", guest: "Miller Group" }
      ],
      blockedDates: ["2025-01-25", "2025-01-26", "2025-01-27"]
    },
    financials: {
      monthlyRevenue: 8400,
      occupancyRate: 78,
      averageBookingValue: 1680
    },
    tasks: [
      { id: 1, title: "Pool cleaning", department: "maintenance", status: "completed", date: "2025-01-02" },
      { id: 2, title: "Garden maintenance", department: "garden", status: "pending", date: "2025-01-03" },
      { id: 3, title: "Deep cleaning", department: "housekeeping", status: "in-progress", date: "2025-01-03" }
    ]
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? mockPropertyDetail.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === mockPropertyDetail.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => setLocation("/properties")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Properties
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">{mockPropertyDetail.name}</h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{mockPropertyDetail.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  View Photos
                </Button>
                <Button>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Manage Tasks
                </Button>
              </div>
            </div>

            {/* Image Carousel */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 overflow-hidden rounded-lg">
                  <img 
                    src={mockPropertyDetail.images[currentImageIndex]}
                    alt={`${mockPropertyDetail.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Navigation buttons */}
                  <button 
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ←
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    →
                  </button>
                  
                  {/* Image indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {mockPropertyDetail.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Info Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Property Details */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{mockPropertyDetail.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <Bed className="h-5 w-5 text-primary" />
                            <span>{mockPropertyDetail.bedrooms} Bedrooms</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Bath className="h-5 w-5 text-primary" />
                            <span>{mockPropertyDetail.bathrooms} Bathrooms</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-primary" />
                            <span>Max {mockPropertyDetail.maxGuests} Guests</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span>${mockPropertyDetail.pricePerNight}/night</span>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-semibold mb-3">House Rules</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {mockPropertyDetail.houseRules.map((rule, index) => (
                              <li key={index}>• {rule}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Location & Nearby</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Nearby Attractions</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {mockPropertyDetail.location.nearbyAttractions.map((attraction, index) => (
                              <li key={index}>• {attraction}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <Badge variant={mockPropertyDetail.status === 'active' ? 'default' : 'secondary'}>
                            {mockPropertyDetail.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Occupancy Rate</span>
                          <span className="font-semibold">{mockPropertyDetail.financials.occupancyRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Monthly Revenue</span>
                          <span className="font-semibold">${mockPropertyDetail.financials.monthlyRevenue}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          Guest Reviews
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{mockPropertyDetail.reviews.averageRating}</div>
                          <div className="text-sm text-muted-foreground">
                            Based on {mockPropertyDetail.reviews.totalReviews} reviews
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          {mockPropertyDetail.reviews.recentReviews.map((review, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{review.guest}</span>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs ml-1">{review.rating}</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mockPropertyDetail.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Home className="h-4 w-4 text-primary" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Upcoming Bookings</h4>
                      {mockPropertyDetail.calendar.currentBookings.map((booking, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{booking.guest}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.checkIn} to {booking.checkOut}
                            </div>
                          </div>
                          <Badge variant="outline">Confirmed</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPropertyDetail.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Wrench className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-muted-foreground">{task.date}</div>
                            </div>
                          </div>
                          <Badge 
                            variant={task.status === 'completed' ? 'default' : 
                                   task.status === 'in-progress' ? 'secondary' : 'outline'}
                          >
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${mockPropertyDetail.financials.monthlyRevenue}
                        </div>
                        <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {mockPropertyDetail.financials.occupancyRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Occupancy Rate</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          ${mockPropertyDetail.financials.averageBookingValue}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Booking Value</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}