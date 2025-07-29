import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, User, Calendar, Home, FileText, Wrench } from "lucide-react";

export default function PropertyDetailView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id
  });

  // Fetch related data
  const { data: bookings } = useQuery({
    queryKey: [`/api/bookings`],
    enabled: !!id
  });

  const { data: tasks } = useQuery({
    queryKey: [`/api/tasks`],
    enabled: !!id
  });

  const propertyBookings = bookings?.filter((booking: any) => booking.propertyId === parseInt(id!)) || [];
  const propertyTasks = tasks?.filter((task: any) => task.propertyId === parseInt(id!)) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/property-hub")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/property-hub")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hub
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <p>{property.address}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
              {property.status}
            </Badge>
            <Button onClick={() => setLocation(`/property-manage/${property.id}`)}>
              Edit Property
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="text-2xl font-bold text-blue-600">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="text-2xl font-bold text-green-600">{property.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max Guests</p>
                    <p className="text-2xl font-bold text-purple-600">{property.maxGuests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price/Night</p>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                      <p className="text-2xl font-bold text-orange-600">
                        ฿{property.pricePerNight?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {property.description && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-700">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Bookings ({propertyBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {propertyBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings found for this property</p>
                ) : (
                  <div className="space-y-3">
                    {propertyBookings.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">฿{booking.totalAmount?.toLocaleString()}</p>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Property Tasks ({propertyTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {propertyTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks found for this property</p>
                ) : (
                  <div className="space-y-3">
                    {propertyTasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {task.priority}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{task.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation(`/property-manage/${property.id}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Manage Property
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation(`/property-documents/${property.id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation(`/bookings?property=${property.id}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation(`/tasks?property=${property.id}`)}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-medium">{propertyBookings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Tasks</span>
                    <span className="font-medium">{propertyTasks.filter((t: any) => t.status !== 'completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">{new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium">{property.currency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}