import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Zap, 
  Droplets, 
  Wifi, 
  Clock, 
  MapPin, 
  Package,
  DollarSign,
  Shield,
  Edit3,
  Save,
  AlertCircle
} from "lucide-react";

const propertySettingsSchema = z.object({
  propertyName: z.string().min(1, "Property name is required"),
  description: z.string().min(1, "Description is required"),
  electricityRate: z.number().min(0, "Rate must be positive"),
  waterRate: z.number().min(0, "Rate must be positive"),
  internetProvider: z.string().min(1, "Internet provider is required"),
  includeElectricityInRate: z.boolean(),
  includeWaterInRate: z.boolean(),
  includeInternetInRate: z.boolean(),
  checkInTime: z.string().min(1, "Check-in time is required"),
  checkOutTime: z.string().min(1, "Check-out time is required"),
  gpsLatitude: z.string().optional(),
  gpsLongitude: z.string().optional(),
  welcomePackType: z.string().optional(),
  gasRate: z.number().optional(),
  hoaFee: z.number().optional(),
  includeGasInRate: z.boolean().optional(),
  includeHoaInRate: z.boolean().optional()
});

const welcomePackOptions = [
  { value: "basic", label: "Basic Package (Water, Towels, Soap)" },
  { value: "standard", label: "Standard Package (Basic + Coffee, Tea, Snacks)" },
  { value: "premium", label: "Premium Package (Standard + Welcome Drinks, Local Treats)" },
  { value: "luxury", label: "Luxury Package (Premium + Spa Items, Premium Amenities)" },
  { value: "custom", label: "Custom Package (Owner Defined)" },
  { value: "none", label: "No Welcome Package" }
];

export default function OwnerPropertySettings() {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ["/api/owner/properties"],
  });

  const { data: propertySettings, isLoading } = useQuery({
    queryKey: ["/api/owner/property-settings", selectedProperty],
    enabled: !!selectedProperty,
  });

  const { data: permissions } = useQuery({
    queryKey: ["/api/owner/property-permissions", selectedProperty],
    enabled: !!selectedProperty,
  });

  const form = useForm({
    resolver: zodResolver(propertySettingsSchema),
    defaultValues: propertySettings || {}
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/owner/property-settings/${selectedProperty}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated successfully",
        description: "Your property settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/property-settings", selectedProperty] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: any) => {
    updateSettingsMutation.mutate(data);
  };

  const isOwnerEditable = permissions?.canEditProperty || false;
  const canEditUtilities = permissions?.canEditUtilities || false;
  const canEditRates = permissions?.canEditRates || false;

  if (!selectedProperty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Property Settings</h1>
          <p className="text-muted-foreground">
            Manage and configure your property settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Property</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a property to configure" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Settings</h1>
          <p className="text-muted-foreground">
            Configure settings for {properties?.find((p: any) => p.id.toString() === selectedProperty)?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setSelectedProperty("")}
          >
            Change Property
          </Button>
          {isOwnerEditable && (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "secondary" : "default"}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel Edit" : "Edit Settings"}
            </Button>
          )}
        </div>
      </div>

      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Permission Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Edit Property Details</span>
              <Badge variant={isOwnerEditable ? "default" : "secondary"}>
                {isOwnerEditable ? "Allowed" : "Restricted"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Edit Utility Settings</span>
              <Badge variant={canEditUtilities ? "default" : "secondary"}>
                {canEditUtilities ? "Allowed" : "Restricted"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Edit Rates</span>
              <Badge variant={canEditRates ? "default" : "secondary"}>
                {canEditRates ? "Allowed" : "Restricted"}
              </Badge>
            </div>
          </div>
          {!isOwnerEditable && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Limited Editing Access</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Some settings are managed by your property manager. Contact them to request changes.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="propertyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditing || !isOwnerEditable} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest-Facing Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        disabled={!isEditing || !isOwnerEditable}
                        rows={4}
                        placeholder="Describe your property for guests..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Utility Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Utility Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Electricity */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-medium">Electricity</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="electricityRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate per kWh (THB)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={!isEditing || !canEditRates}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="includeElectricityInRate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Include in Guest Rate</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            Bill electricity to guest rate instead of separately
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditing || !canEditUtilities}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Water */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Water</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="waterRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate per Unit (THB)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={!isEditing || !canEditRates}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="includeWaterInRate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Include in Guest Rate</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            Bill water to guest rate instead of separately
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditing || !canEditUtilities}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Internet */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Internet</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="internetProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internet Provider</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!isEditing || !canEditUtilities}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">True Internet</SelectItem>
                            <SelectItem value="ais">AIS Fibre</SelectItem>
                            <SelectItem value="3bb">3BB</SelectItem>
                            <SelectItem value="tot">TOT Fibre</SelectItem>
                            <SelectItem value="nt">NT</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="includeInternetInRate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Include in Guest Rate</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            Include internet cost in guest rate
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditing || !canEditUtilities}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Utilities */}
              <div className="space-y-3">
                <h4 className="font-medium">Additional Utilities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gasRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gas Rate per Unit (THB)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={!isEditing || !canEditRates}
                            placeholder="Optional"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hoaFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HOA Fee (THB/month)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={!isEditing || !canEditRates}
                            placeholder="Optional"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check-in/Check-out Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Check-in/Check-out Times</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          disabled={!isEditing || !isOwnerEditable}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          disabled={!isEditing || !isOwnerEditable}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* GPS Coordinates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>GPS Coordinates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gpsLatitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing || !isOwnerEditable}
                          placeholder="e.g., 13.7563"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gpsLongitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing || !isOwnerEditable}
                          placeholder="e.g., 100.5018"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                GPS coordinates help staff and guests locate your property precisely.
              </p>
            </CardContent>
          </Card>

          {/* Welcome Pack Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Welcome Pack Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="welcomePackType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Pack Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!isEditing || !isOwnerEditable}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select welcome pack type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {welcomePackOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {isEditing && isOwnerEditable && (
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}