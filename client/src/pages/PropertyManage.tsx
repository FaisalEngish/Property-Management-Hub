import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Edit, User, UserCheck, MapPin, DollarSign, Home } from "lucide-react";

export default function PropertyManage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    pricePerNight: "",
    portfolioManagerId: "",
    ownerId: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id
  });

  // Update form data when property loads
  React.useEffect(() => {
    if (property) {
      setFormData({
        name: property?.name || "",
        description: property?.description || "",
        address: property?.address || "",
        pricePerNight: property?.pricePerNight?.toString() || "",
        portfolioManagerId: property?.portfolioManagerId || "",
        ownerId: property?.ownerId || ""
      });
    }
  }, [property]);

  // Fetch users for dropdowns
  const { data: users } = useQuery({
    queryKey: ["/api/users"]
  });

  // Get portfolio managers and owners
  const portfolioManagers = users?.filter((user: any) => user.role === 'portfolio-manager') || [];
  const owners = users?.filter((user: any) => user.role === 'owner') || [];

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: (updateData: any) => 
      apiRequest(`/api/properties/${id}`, "PATCH", updateData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update property",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    const updateData = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      pricePerNight: parseFloat(formData.pricePerNight) || 0,
      portfolioManagerId: formData.portfolioManagerId || null,
      ownerId: formData.ownerId || null
    };

    updatePropertyMutation.mutate(updateData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
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
      <div className="max-w-4xl mx-auto px-4">
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
              <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="text-gray-600">Edit property details and assignments</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
              {property.status}
            </Badge>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={updatePropertyMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updatePropertyMutation.isPending}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updatePropertyMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Property Name</label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter property name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{property.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter property description"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{property.description || "No description available"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter property address"
                  />
                ) : (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-gray-700">{property.address}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price per Night</label>
                {isEditing ? (
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      value={formData.pricePerNight}
                      onChange={(e) => handleInputChange('pricePerNight', e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-gray-900 font-medium">
                      ฿{property.pricePerNight?.toLocaleString() || '0'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Staff Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Portfolio Manager</label>
                {isEditing ? (
                  <Select 
                    value={formData.portfolioManagerId} 
                    onValueChange={(value) => handleInputChange('portfolioManagerId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select portfolio manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No assignment</SelectItem>
                      {portfolioManagers.map((manager: any) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name} ({manager.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {property.portfolioManagerId ? (
                      <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                        <UserCheck className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-blue-800 font-medium">
                          {portfolioManagers.find((m: any) => m.id === property.portfolioManagerId)?.name || 'Unknown Manager'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No portfolio manager assigned</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property Owner</label>
                {isEditing ? (
                  <Select 
                    value={formData.ownerId} 
                    onValueChange={(value) => handleInputChange('ownerId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No assignment</SelectItem>
                      {owners.map((owner: any) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name} ({owner.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {property.ownerId ? (
                      <div className="flex items-center p-2 bg-green-50 rounded-lg">
                        <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">
                          {owners.find((o: any) => o.id === property.ownerId)?.name || 'Unknown Owner'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No owner assigned</p>
                    )}
                  </div>
                )}
              </div>

              {/* Property Stats */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Property Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Bedrooms:</span>
                    <span className="ml-2 font-medium">{property.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bathrooms:</span>
                    <span className="ml-2 font-medium">{property.bathrooms}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Guests:</span>
                    <span className="ml-2 font-medium">{property.maxGuests}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Currency:</span>
                    <span className="ml-2 font-medium">{property.currency}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}