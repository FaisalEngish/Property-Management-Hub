import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function PropertyEdit() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${id}`],
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    pricePerNight: "",
    status: "active",
    ownerId: "",
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        address: property.address || "",
        description: property.description || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        maxGuests: property.maxGuests?.toString() || "",
        pricePerNight: property.pricePerNight?.toString() || "",
        status: property.status || "active",
        ownerId: property.ownerId?.toString() || "",
      });
    }
  }, [property]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/properties/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${id}`] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      navigate(`/property/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      address: formData.address,
      description: formData.description,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      maxGuests: parseInt(formData.maxGuests) || 0,
      pricePerNight: parseFloat(formData.pricePerNight) || 0,
      status: formData.status,
      ownerId: formData.ownerId ? parseInt(formData.ownerId) : null,
    };

    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <Button onClick={() => navigate("/properties")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/property/${id}`)}
            className="!p-2 !rounded-md bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property Details
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Property: {property.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    data-testid="input-property-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                    data-testid="input-property-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                    min="0"
                    data-testid="input-property-bedrooms"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                    min="0"
                    step="0.5"
                    data-testid="input-property-bathrooms"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    value={formData.maxGuests}
                    onChange={(e) =>
                      setFormData({ ...formData, maxGuests: e.target.value })
                    }
                    min="0"
                    data-testid="input-property-maxGuests"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerNight">Price Per Night</Label>
                  <Input
                    id="pricePerNight"
                    type="number"
                    value={formData.pricePerNight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerNight: e.target.value,
                      })
                    }
                    min="0"
                    step="0.01"
                    data-testid="input-property-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger data-testid="select-property-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  data-testid="textarea-property-description"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/property/${id}`)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-property"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
