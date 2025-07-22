import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Users, Bed, Bath, Home, Star, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function PropertyDetailView() {
  const [, params] = useRoute("/property/:id");
  const [, setLocation] = useLocation();
  const propertyId = params?.id;

  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image Placeholder */}
            <Card>
              <CardContent className="p-0">
                <div className="h-96 bg-gray-200 flex items-center justify-center rounded-t-lg">
                  <Home className="w-24 h-24 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
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

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Property ID:</span>
                  <span className="font-mono">#{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={statusColor} className="ml-2">
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

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => setLocation(`/tasks?propertyId=${property.id}`)}
                >
                  View Tasks
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation(`/bookings?propertyId=${property.id}`)}
                >
                  View Bookings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/properties')}
                >
                  Edit Property
                </Button>
              </CardContent>
            </Card>

            {/* Property Performance */}
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
                    <span>4.8</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Total Reviews:</span>
                  <span>127</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy Rate:</span>
                  <span>85%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}