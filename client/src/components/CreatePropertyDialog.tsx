import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Loader2 } from "lucide-react";

// Add debugging for property creation issues
console.log("🏠 Property Dialog component loaded");

interface CreatePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePropertyDialog({ open, onOpenChange }: CreatePropertyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    pricePerNight: "",
    status: "active",
  });

  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("🚀 Frontend: Submitting property data:", data);
      const response = await apiRequest("POST", "/api/properties", data);
      const result = await response.json();
      console.log("✅ Frontend: Property created successfully:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("🎉 Frontend: Property creation successful, invalidating cache");
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      // Force refresh by clearing all property-related cache
      queryClient.removeQueries({ queryKey: ["/api/properties"] });
      
      toast({
        title: "Success", 
        description: `Property "${data.name}" created successfully! (ID: ${data.id})`,
      });
      onOpenChange(false);
      setFormData({
        name: "",
        address: "",
        description: "",
        bedrooms: "",
        bathrooms: "",
        maxGuests: "",
        pricePerNight: "",
        status: "active",
      });
      
      // Force page refresh to show new property
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      console.error("❌ Frontend: Property creation error:", error);
      let errorMessage = "Failed to create property";
      
      // Try to extract more detailed error information
      if (error.message) {
        errorMessage = error.message;
      } else if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.map((e: any) => e.message || e.path?.join('.') + ': ' + e.message).join(", ");
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔄 Frontend: Form submitted with data:", formData);
    
    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Property name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.address.trim()) {
      toast({
        title: "Validation Error", 
        description: "Property address is required",
        variant: "destructive",
      });
      return;
    }
    
    const data = {
      organizationId: 'default-org', // Default organization for demo
      name: formData.name.trim(),
      address: formData.address.trim(),
      description: formData.description?.trim() || "",
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      maxGuests: formData.maxGuests ? parseInt(formData.maxGuests) : null,
      pricePerNight: formData.pricePerNight ? parseFloat(formData.pricePerNight) : null,
      currency: "THB", // Thai Baht for consistency
      status: formData.status,
    };

    console.log("🚀 Frontend: Final property data being submitted:", data);
    createMutation.mutate(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAirbnbImport = async () => {
    if (!airbnbUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an Airbnb URL",
        variant: "destructive",
      });
      return;
    }

    // Validate Airbnb URL format
    if (!airbnbUrl.includes('airbnb.com') && !airbnbUrl.includes('abnb.me')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Airbnb listing URL",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await apiRequest("POST", "/api/properties/import/airbnb", {
        url: airbnbUrl.trim()
      });
      
      const importedData = await response.json();
      
      if (importedData.success) {
        // Pre-fill form with imported data
        setFormData({
          name: importedData.property.name || "",
          address: importedData.property.address || "",
          description: importedData.property.description || "",
          bedrooms: importedData.property.bedrooms?.toString() || "",
          bathrooms: importedData.property.bathrooms?.toString() || "",
          maxGuests: importedData.property.maxGuests?.toString() || "",
          pricePerNight: importedData.property.pricePerNight?.toString() || "",
          status: "active",
        });
        
        toast({
          title: "Import Successful",
          description: "Property data imported from Airbnb. Please review and save.",
        });
        
        setAirbnbUrl("");
      } else {
        throw new Error(importedData.message || "Failed to import property data");
      }
    } catch (error: any) {
      console.error("Airbnb import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Could not import from Airbnb. Please enter property details manually.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Plus className="h-4 w-4 mr-2" />
              Create from Scratch
            </TabsTrigger>
            <TabsTrigger value="airbnb">
              <ExternalLink className="h-4 w-4 mr-2" />
              Import from Airbnb
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="airbnb" className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Import from Airbnb</h3>
              <p className="text-sm text-blue-700 mb-4">
                Enter an Airbnb listing URL to automatically import property details, photos, and amenities.
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="airbnb-url">Airbnb Listing URL</Label>
                  <Input
                    id="airbnb-url"
                    value={airbnbUrl}
                    onChange={(e) => setAirbnbUrl(e.target.value)}
                    placeholder="https://www.airbnb.com/rooms/12345678"
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  type="button"
                  onClick={handleAirbnbImport}
                  disabled={isImporting || !airbnbUrl.trim()}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing from Airbnb...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Import Property Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter property name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
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

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter full address"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the property..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleChange("bedrooms", e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleChange("bathrooms", e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="maxGuests">Max Guests</Label>
              <Input
                id="maxGuests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => handleChange("maxGuests", e.target.value)}
                placeholder="0"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="pricePerNight">Price/Night</Label>
              <Input
                id="pricePerNight"
                type="number"
                step="0.01"
                value={formData.pricePerNight}
                onChange={(e) => handleChange("pricePerNight", e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </form>
        </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
