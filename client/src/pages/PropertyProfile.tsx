import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Users, Bed, Bath, Home, Star, DollarSign, Calendar, ClipboardList, TrendingUp, FileText, Settings, AlertCircle, ExternalLink, Plus, Edit, Camera, Video, Globe } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from "react";

const bookingSourceData = [
  { name: 'Airbnb', value: 70 },
  { name: 'Booking.com', value: 15 },
  { name: 'Direct', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#00bcd4', '#ff9800', '#4caf50', '#9e9e9e'];

export default function PropertyProfile() {
  const [, params] = useRoute("/property-profile/:id");
  const [, setLocation] = useLocation();
  const propertyId = params?.id;

  // State for editing dialogs
  const [otaPlatforms, setOtaPlatforms] = useState([
    { id: 'airbnb', name: 'Airbnb', url: 'https://airbnb.com/rooms/12345678', color: 'bg-red-500', abbreviation: 'Ab' },
    { id: 'booking', name: 'Booking.com', url: 'https://booking.com/hotel/th/villa-aruna.html', color: 'bg-blue-600', abbreviation: 'B' },
    { id: 'vrbo', name: 'VRBO', url: 'https://vrbo.com/2345678', color: 'bg-yellow-500', abbreviation: 'V' },
    { id: 'website', name: 'Our Website', url: 'https://oursite.com/villa-aruna', color: 'bg-green-600', abbreviation: 'W' }
  ]);

  const [mediaLinks, setMediaLinks] = useState([
    { id: 'photos', name: 'Property Photos', url: 'https://dropbox.com/villa-aruna-photos', description: 'Dropbox folder with high-resolution images', icon: Camera, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'videos', name: 'Property Videos', url: 'https://dropbox.com/villa-aruna-videos', description: 'Marketing videos and walkthrough footage', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'tour', name: '360° Virtual Tour', url: 'https://matterport.com/villa-aruna-tour', description: 'Interactive 360-degree property tour', icon: Globe, color: 'text-green-600', bg: 'bg-green-50' }
  ]);

  const [editingOta, setEditingOta] = useState<any>(null);
  const [editingMedia, setEditingMedia] = useState<any>(null);

  const handleEditOta = (platform: any) => {
    setEditingOta(platform);
  };

  const handleSaveOta = (updatedPlatform: any) => {
    setOtaPlatforms(platforms => 
      platforms.map(p => p.id === updatedPlatform.id ? updatedPlatform : p)
    );
    setEditingOta(null);
  };

  const handleEditMedia = (media: any) => {
    setEditingMedia(media);
  };

  const handleSaveMedia = (updatedMedia: any) => {
    setMediaLinks(links => 
      links.map(l => l.id === updatedMedia.id ? updatedMedia : l)
    );
    setEditingMedia(null);
  };

  const { data: property, isLoading, error } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });

  // Debug logging
  console.log('PropertyProfile Debug:', { propertyId, property, isLoading, error });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <Button onClick={() => setLocation('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const statusColor = property.status === 'active' ? 'default' : 
                     property.status === 'maintenance' ? 'secondary' : 'destructive';

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation('/properties')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Button>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <Badge variant={statusColor}>
            {property.status}
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            Demo Mode
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image Placeholder */}
            <Card>
              <CardContent className="p-0">
                <div className="h-96 bg-gray-200 flex items-center justify-center rounded-t-lg">
                  <div className="text-center">
                    <Home className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <span className="text-gray-400 text-lg">Property Image Placeholder</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-muted-foreground" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-muted-foreground" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span>{property.maxGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <span>{formatCurrency(property.pricePerNight)}/night</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{property.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Descriptions (Synced via Hostaway) */}
            <Card>
              <CardHeader>
                <CardTitle>Descriptions (Synced via Hostaway)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-gray-700">📄 <span className="font-medium">General Description:</span> <span className="italic text-muted-foreground">Synced content from Hostaway</span></p>
                  <p className="text-gray-700">🏠 <span className="font-medium">Space Description:</span> <span className="italic text-muted-foreground">Synced content from Hostaway</span></p>
                  <p className="text-gray-700">🤝 <span className="font-medium">Interaction Description:</span> <span className="italic text-muted-foreground">Synced content from Hostaway</span></p>
                  <p className="text-gray-700">🌍 <span className="font-medium">Neighborhood:</span> <span className="italic text-muted-foreground">Synced content from Hostaway</span></p>
                  <p className="text-gray-700">📝 <span className="font-medium">Things to Note:</span> <span className="italic text-muted-foreground">Synced content from Hostaway</span></p>
                  <p className="text-gray-700">🚗 <span className="font-medium">Transit:</span> <span className="italic text-muted-foreground">Synced content from Hostaway</span></p>
                </div>
              </CardContent>
            </Card>

            {/* OTA Platform Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  OTA Platform Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  {otaPlatforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{platform.abbreviation}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">{platform.url}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3"
                          onClick={() => window.open(platform.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-3"
                              onClick={() => setEditingOta({ ...platform })}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit {platform.name} Link</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="platform-url">Platform URL</Label>
                                <Input
                                  id="platform-url"
                                  value={editingOta?.url || platform.url}
                                  placeholder="Enter platform URL"
                                  onChange={(e) => setEditingOta({ ...platform, url: e.target.value })}
                                />
                              </div>
                              <Button 
                                onClick={() => {
                                  if (editingOta) {
                                    handleSaveOta(editingOta);
                                  }
                                }}
                                className="w-full"
                              >
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Platform
                </Button>
              </CardContent>
            </Card>

            {/* Property Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Property Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {mediaLinks.map((media) => {
                    const IconComponent = media.icon;
                    return (
                      <div key={media.id} className={`flex items-center justify-between p-3 border rounded-lg ${media.bg}`}>
                        <div className="flex items-center gap-3">
                          <IconComponent className={`w-5 h-5 ${media.color}`} />
                          <div>
                            <p className="font-medium text-sm">{media.name}</p>
                            <p className="text-xs text-muted-foreground">{media.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-3"
                            onClick={() => window.open(media.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {media.id === 'tour' ? 'View' : 'Open'}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-3"
                                onClick={() => setEditingMedia({ ...media })}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit {media.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="media-url">Media URL</Label>
                                  <Input
                                    id="media-url"
                                    value={editingMedia?.url || media.url}
                                    placeholder="Enter media URL"
                                    onChange={(e) => setEditingMedia({ ...media, url: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="media-description">Description</Label>
                                  <Input
                                    id="media-description"
                                    value={editingMedia?.description || media.description}
                                    placeholder="Enter description"
                                    onChange={(e) => setEditingMedia({ 
                                      ...(editingMedia || media), 
                                      description: e.target.value 
                                    })}
                                  />
                                </div>
                                <Button 
                                  onClick={() => {
                                    if (editingMedia) {
                                      handleSaveMedia(editingMedia);
                                    }
                                  }}
                                  className="w-full"
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Media Link
                </Button>
              </CardContent>
            </Card>

            {/* Booking Source Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Booking Source Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingSourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {bookingSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Stats + Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Property ID:</span>
                  <span className="font-mono font-semibold">#{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={statusColor}>
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Nightly Rate:</span>
                  <span className="font-semibold">{formatCurrency(property.pricePerNight)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span>{property.maxGuests} guests</span>
                </div>
              </CardContent>
            </Card>

            {/* Primary Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => setLocation(`/tasks?propertyId=${property.id}`)}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View Tasks
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setLocation(`/bookings?propertyId=${property.id}`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Bookings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/properties')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Property
                </Button>
              </CardContent>
            </Card>

            {/* Additional Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Utilities
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Accounting
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  View Important Info
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Average Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Total Reviews:</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy Rate:</span>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}