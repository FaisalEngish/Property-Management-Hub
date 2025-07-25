import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Building, DollarSign, Users, Star, Calendar, TrendingUp, FileText, Eye } from "lucide-react";

const ReferralAgentServiceOverview = () => {
  // Simple state-based tab management - no URL complications
  const [activeTab, setActiveTab] = useState('services');

  // Initialize tab from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') || 'services';
    setActiveTab(tab);

    // Listen for custom tab change events from sidebar
    const handleTabChange = (event: CustomEvent) => {
      console.log('Received tab change event:', event.detail.tab);
      setActiveTab(event.detail.tab);
    };

    window.addEventListener('changeReferralTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeReferralTab', handleTabChange as EventListener);
  }, []);

  const handleTabChange = (tab: string) => {
    console.log('Changing to tab:', tab);
    setActiveTab(tab);
  };

  // Sample data for referred properties
  const referredProperties = [
    {
      id: 1,
      name: "Villa Samui Breeze",
      referralDate: "2024-01-15",
      client: "Johnson Family",
      monthlyRevenue: 85000, // THB
      occupancyRate: 78,
      totalBookings: 12,
      averageRating: 4.8,
      commission: 8500, // 10% of management fee
      status: "Active"
    },
    {
      id: 2,
      name: "Villa Tropical Paradise",
      referralDate: "2024-03-20",
      client: "Thompson Estate",
      monthlyRevenue: 120000,
      occupancyRate: 85,
      totalBookings: 15,
      averageRating: 4.9,
      commission: 12000,
      status: "Active"
    }
  ];

  // Available properties for browsing (limited info)
  const availableProperties = [
    {
      id: 1,
      name: "Villa Ocean View",
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      location: "Koh Samui",
      priceRange: "฿6,500 - ฿8,500/night",
      amenities: ["Pool", "WiFi", "AC", "Kitchen"]
    },
    {
      id: 2,
      name: "Villa Aruna Premium",
      bedrooms: 5,
      bathrooms: 4,
      maxGuests: 10,
      location: "Koh Samui",
      priceRange: "฿18,000 - ฿25,000/night",
      amenities: ["Private Pool", "Chef Service", "WiFi", "AC", "Gym"]
    },
    {
      id: 3,
      name: "Villa Beachfront Elite",
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      location: "Koh Samui",
      priceRange: "฿12,000 - ฿16,000/night",
      amenities: ["Beach Access", "Pool", "WiFi", "AC", "BBQ"]
    }
  ];

  const managementServices = [
    {
      title: "Guest Management",
      description: "Complete guest experience from check-in to check-out",
      features: ["24/7 guest support", "Check-in/out coordination", "Concierge services", "Issue resolution"]
    },
    {
      title: "Property Maintenance",
      description: "Regular upkeep and maintenance of properties",
      features: ["Scheduled cleaning", "Pool maintenance", "Garden care", "Repairs & fixes"]
    },
    {
      title: "Revenue Optimization",
      description: "Maximize booking income through smart pricing",
      features: ["Dynamic pricing", "Multi-platform listing", "Revenue analytics", "Booking optimization"]
    },
    {
      title: "Financial Management",
      description: "Complete financial oversight and reporting",
      features: ["Monthly statements", "Expense tracking", "Tax preparation", "Owner payouts"]
    }
  ];

  const downloadPDF = () => {
    // This would trigger a PDF download of the management services brochure
    console.log("Downloading management services PDF...");
    alert("Management Services PDF would be downloaded here");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pt-20 lg:pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Referral Agent Portal</h1>
          <p className="text-muted-foreground">Property Management Services & Referral Tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            <Users className="w-3 h-3 mr-1" />
            Real Estate Agent
          </Badge>
        </div>
      </div>

      {/* Manual tab navigation buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={activeTab === 'services' ? 'default' : 'outline'}
          onClick={() => handleTabChange('services')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Service Overview
        </Button>
        <Button 
          variant={activeTab === 'properties' ? 'default' : 'outline'}
          onClick={() => handleTabChange('properties')}
          className="flex items-center gap-2"
        >
          <Building className="h-4 w-4" />
          Property Browse
        </Button>
        <Button 
          variant={activeTab === 'referred' ? 'default' : 'outline'}
          onClick={() => handleTabChange('referred')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          My Referrals
        </Button>
        <Button 
          variant={activeTab === 'finances' ? 'default' : 'outline'}
          onClick={() => handleTabChange('finances')}
          className="flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Commission Tracking
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="services">Service Overview</TabsTrigger>
          <TabsTrigger value="properties">Property Browse</TabsTrigger>
          <TabsTrigger value="referred">My Referrals</TabsTrigger>
          <TabsTrigger value="finances">Commission Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Property Management Services
                  </CardTitle>
                  <CardDescription>
                    Comprehensive villa management services for property owners
                  </CardDescription>
                </div>
                <Button onClick={downloadPDF} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF Brochure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {managementServices.map((service, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Referral Commission Structure</h3>
                <p className="text-blue-800 text-sm">
                  As a referral partner, you receive <strong>10% of our monthly management commission</strong> for every property you refer to our management services. This provides you with ongoing passive income for successful referrals.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Available Properties Portfolio
              </CardTitle>
              <CardDescription>
                Browse our managed properties (limited information for referral purposes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProperties.map((property) => (
                  <Card key={property.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        {property.location}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{property.bedrooms}</div>
                          <div className="text-muted-foreground">Bedrooms</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{property.bathrooms}</div>
                          <div className="text-muted-foreground">Bathrooms</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{property.maxGuests}</div>
                          <div className="text-muted-foreground">Guests</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-semibold text-green-600">{property.priceRange}</div>
                        <div className="text-xs text-muted-foreground">Nightly rate range</div>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {property.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{property.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referred" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Referred Properties
              </CardTitle>
              <CardDescription>
                Properties you've referred and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referredProperties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No referrals yet. Start referring clients to earn 10% monthly commissions!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referredProperties.map((property) => (
                    <Card key={property.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{property.name}</CardTitle>
                            <CardDescription>
                              Referred: {new Date(property.referralDate).toLocaleDateString()} | Client: {property.client}
                            </CardDescription>
                          </div>
                          <Badge variant={property.status === "Active" ? "default" : "secondary"}>
                            {property.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{formatCurrency(property.monthlyRevenue)}</div>
                            <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{property.occupancyRate}%</div>
                            <div className="text-xs text-muted-foreground">Occupancy</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{property.totalBookings}</div>
                            <div className="text-xs text-muted-foreground">Bookings</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-yellow-600 flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {property.averageRating}
                            </div>
                            <div className="text-xs text-muted-foreground">Rating</div>
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

        <TabsContent value="finances" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Monthly Commission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(referredProperties.reduce((sum, prop) => sum + prop.commission, 0))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {referredProperties.length} active referrals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {referredProperties.length > 0 
                    ? Math.round(referredProperties.reduce((sum, prop) => sum + prop.occupancyRate, 0) / referredProperties.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all referrals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{referredProperties.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active referrals
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Commission Details
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your 10% referral commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referredProperties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No commission data available yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Property</th>
                        <th className="text-left py-2">Monthly Revenue</th>
                        <th className="text-left py-2">Management Fee (Base)</th>
                        <th className="text-left py-2">Your Commission (10%)</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referredProperties.map((property) => (
                        <tr key={property.id} className="border-b">
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{property.name}</div>
                              <div className="text-sm text-muted-foreground">{property.client}</div>
                            </div>
                          </td>
                          <td className="py-3">{formatCurrency(property.monthlyRevenue)}</td>
                          <td className="py-3">{formatCurrency(property.commission * 10)}</td>
                          <td className="py-3 font-semibold text-green-600">{formatCurrency(property.commission)}</td>
                          <td className="py-3">
                            <Badge variant={property.status === "Active" ? "default" : "secondary"}>
                              {property.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralAgentServiceOverview;