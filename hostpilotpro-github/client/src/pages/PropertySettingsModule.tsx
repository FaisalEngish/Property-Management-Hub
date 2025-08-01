import { useState, useEffect } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Edit, Save, X, Check, Building, Droplets, Wifi, Zap, DollarSign, Shield, Users, Clock, MapPin, Image, Target, Wrench, Plus, TrendingUp, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const propertySettingsSchema = z.object({
  // Basic Details
  description: z.string().optional(),
  marketingDescription: z.string().optional(),
  
  // Utility Settings
  electricityRate: z.coerce.number().min(0),
  waterRate: z.coerce.number().min(0),
  internetRate: z.coerce.number().min(0),
  gasRate: z.coerce.number().min(0),
  
  // Deposit & Charges
  securityDeposit: z.coerce.number().min(0),
  cleaningFee: z.coerce.number().min(0),
  poolMaintenanceFee: z.coerce.number().min(0),
  pestControlFee: z.coerce.number().min(0),
  
  // Location & Access
  gpsLatitude: z.coerce.number().optional(),
  gpsLongitude: z.coerce.number().optional(),
  accessInstructions: z.string().optional(),
  
  // Guest Rules
  maxGuests: z.coerce.number().min(1),
  allowPets: z.boolean(),
  allowSmoking: z.boolean(),
  allowParties: z.boolean(),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  guestRules: z.string().optional(),
  
  // Service Availability
  massageService: z.boolean(),
  chefService: z.boolean(),
  housekeepingService: z.boolean(),
  laundryService: z.boolean(),
  carRentalService: z.boolean(),
  airportTransfer: z.boolean(),
});

const AMENITIES = [
  { id: "wifi", name: "WiFi", icon: Wifi },
  { id: "pool", name: "Swimming Pool", icon: Droplets },
  { id: "aircon", name: "Air Conditioning", icon: Zap },
  { id: "kitchen", name: "Full Kitchen", icon: Building },
  { id: "parking", name: "Free Parking", icon: Building },
  { id: "tv", name: "Smart TV", icon: Building },
  { id: "washer", name: "Washing Machine", icon: Building },
  { id: "balcony", name: "Balcony/Terrace", icon: Building },
  { id: "garden", name: "Garden", icon: Building },
  { id: "gym", name: "Gym/Fitness", icon: Building },
];

export default function PropertySettingsModule() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check user permissions
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const userRole = (user as any)?.role || (user as any)?.primaryRole;
  const canEdit = ['admin', 'portfolio-manager'].includes(userRole);
  const canView = ['admin', 'portfolio-manager', 'owner'].includes(userRole);
  
  // Check if owner has edit permissions (would be a setting)
  const ownerCanEdit = userRole === 'owner' && false; // This would come from a setting

  // Fetch properties
  const { data: properties, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  // Fetch property settings
  const { data: propertySettings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["/api/property-settings", selectedProperty],
    enabled: !!selectedProperty,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/property-settings/${selectedProperty}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Property settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-settings"] });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(propertySettingsSchema),
    defaultValues: {
      description: "",
      marketingDescription: "",
      electricityRate: 7,
      waterRate: 25,
      internetRate: 800,
      gasRate: 30,
      securityDeposit: 5000,
      cleaningFee: 2000,
      poolMaintenanceFee: 1000,
      pestControlFee: 500,
      gpsLatitude: 0,
      gpsLongitude: 0,
      accessInstructions: "",
      maxGuests: 4,
      allowPets: false,
      allowSmoking: false,
      allowParties: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      guestRules: "",
      massageService: true,
      chefService: false,
      housekeepingService: true,
      laundryService: true,
      carRentalService: false,
      airportTransfer: true,
    },
  });

  // Update form when settings load
  React.useEffect(() => {
    if (propertySettings) {
      form.reset(propertySettings);
    }
  }, [propertySettings, form]);

  const onSubmit = (data: any) => {
    updateMutation.mutate({
      ...data,
      updatedBy: (user as any)?.id,
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Property Settings are only accessible to Admin, Portfolio Manager, and Owner roles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Property Settings</h1>
          <p className="text-muted-foreground">
            Configure property details, utilities, amenities, and guest rules
          </p>
        </div>
        {(canEdit || ownerCanEdit) && selectedProperty && (
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Permission Notice */}
      {userRole === 'owner' && !ownerCanEdit && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">View-Only Mode</span>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Settings are in view-only mode. Contact your property manager to request edit permissions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
          <CardDescription>Choose a property to view and edit its settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProperty?.toString()} onValueChange={(value) => setSelectedProperty(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property..." />
            </SelectTrigger>
            <SelectContent>
              {(properties as any[])?.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name} - {property.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProperty && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="utilities">Utilities</TabsTrigger>
                <TabsTrigger value="charges">Fees & Charges</TabsTrigger>
                <TabsTrigger value="rules">Guest Rules</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="goals">Goals & Plan</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Property Description
                    </CardTitle>
                    <CardDescription>
                      Internal description and marketing content for the property
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Internal Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Internal notes and description for staff..."
                              disabled={!editMode}
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Internal description for staff and management use
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="marketingDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marketing Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Marketing description for guests and booking platforms..."
                              disabled={!editMode}
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            Public description used for marketing and booking platforms
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location & Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gpsLatitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GPS Latitude</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="any" disabled={!editMode} />
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
                            <FormLabel>GPS Longitude</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="any" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="accessInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Detailed access instructions for guests..."
                              disabled={!editMode}
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Instructions for guests on how to access the property
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                    <CardDescription>Available amenities and features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {AMENITIES.map((amenity) => {
                        const AmenityIcon = amenity.icon;
                        return (
                          <div key={amenity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <AmenityIcon className="h-5 w-5 text-primary" />
                            <span className="flex-1">{amenity.name}</span>
                            <Switch disabled={!editMode} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Utilities Tab */}
              <TabsContent value="utilities" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Utility Rates
                    </CardTitle>
                    <CardDescription>
                      Set utility rates charged to guests (THB)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="electricityRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Electricity Rate (THB/kWh)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="waterRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Droplets className="h-4 w-4" />
                              Water Rate (THB/m³)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="internetRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Wifi className="h-4 w-4" />
                              Internet Rate (THB/month)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="number" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gasRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Gas Rate (THB/kg)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Charges Tab */}
              <TabsContent value="charges" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Fees & Charges
                    </CardTitle>
                    <CardDescription>
                      Standard fees and charges for guests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="securityDeposit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Deposit (THB)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cleaningFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cleaning Fee (THB)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="poolMaintenanceFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pool Maintenance (THB)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pestControlFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pest Control (THB)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Guest Rules Tab */}
              <TabsContent value="rules" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Guest Policies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Guests</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" disabled={!editMode} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="allowPets"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Pets</FormLabel>
                              <FormDescription>
                                Whether pets are allowed in the property
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowSmoking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Smoking</FormLabel>
                              <FormDescription>
                                Whether smoking is allowed in the property
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowParties"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Parties</FormLabel>
                              <FormDescription>
                                Whether parties and events are allowed
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quietHoursStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Quiet Hours Start
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="time" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quietHoursEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Quiet Hours End
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="time" disabled={!editMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="guestRules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Guest Rules</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Additional rules and guidelines for guests..."
                              disabled={!editMode}
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            Any additional rules or guidelines for guests
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Availability</CardTitle>
                    <CardDescription>
                      Configure which services are available for guests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="massageService"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Massage Service</FormLabel>
                              <FormDescription>
                                Professional massage service available
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chefService"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Chef Service</FormLabel>
                              <FormDescription>
                                Private chef service available
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="housekeepingService"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Housekeeping</FormLabel>
                              <FormDescription>
                                Daily housekeeping service
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="laundryService"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Laundry Service</FormLabel>
                              <FormDescription>
                                Professional laundry service
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="carRentalService"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Car Rental</FormLabel>
                              <FormDescription>
                                Car rental service available
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="airportTransfer"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Airport Transfer</FormLabel>
                              <FormDescription>
                                Airport pickup and drop-off service
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!editMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Goals & Plan Tab */}
              <TabsContent value="goals" className="space-y-6">
                <GoalsAndPlanModule 
                  propertyId={selectedProperty} 
                  canEdit={canEdit || ownerCanEdit}
                  editMode={editMode}
                />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
    </div>
  );
}

// Goals & Improvement Plan Component
function GoalsAndPlanModule({ 
  propertyId, 
  canEdit, 
  editMode 
}: { 
  propertyId: number, 
  canEdit: boolean, 
  editMode: boolean 
}) {
  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Create a separate form for Goals & Plan module
  const goalsForm = useForm({
    resolver: zodResolver(z.object({
      revenueTargetType: z.string().optional(),
      revenueTargetAmount: z.string().optional(),
      rewardCondition: z.string().optional(),
    })),
    defaultValues: {
      revenueTargetType: "monthly",
      revenueTargetAmount: "150000",
      rewardCondition: "If revenue exceeds target, purchase new outdoor furniture set",
    },
  });

  return (
    <Form {...goalsForm}>
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">📊 Overview</TabsTrigger>
        <TabsTrigger value="goals">🎯 Revenue Goals</TabsTrigger>
        <TabsTrigger value="upgrades">🏗️ Planned Upgrades</TabsTrigger>
        <TabsTrigger value="notes">📝 Notes & Comments</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Current Goals Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Active Goals
              </CardTitle>
              <CardDescription>Current revenue targets and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Monthly Target:</span>
                  <span className="font-semibold">150,000 THB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Progress:</span>
                  <span className="text-green-600 font-semibold">125,000 THB (83%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target reward: New outdoor sofa set
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Upgrades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Planned Upgrades
              </CardTitle>
              <CardDescription>Upcoming property improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pool Renovation</span>
                  <Badge variant="outline">High Priority</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Kitchen Upgrade</span>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Garden Landscaping</span>
                  <Badge variant="secondary">Low</Badge>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Total Budget: 350,000 THB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Goal Updated</div>
                  <div className="text-muted-foreground text-xs">2 days ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">New Upgrade Added</div>
                  <div className="text-muted-foreground text-xs">1 week ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Note Added</div>
                  <div className="text-muted-foreground text-xs">2 weeks ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Revenue Goals Tab */}
      <TabsContent value="goals" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Revenue Goals & Rewards
            </CardTitle>
            <CardDescription>
              Set revenue targets and reward conditions for achieving goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormField
                  control={goalsForm.control}
                  name="revenueTargetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Period</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || "monthly"}
                          onValueChange={field.onChange}
                          disabled={!editMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={goalsForm.control}
                  name="revenueTargetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount (THB)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="150,000"
                          disabled={!editMode}
                          type="number"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the revenue target for the selected period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={goalsForm.control}
                  name="rewardCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Condition</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="If revenue exceeds target, purchase new outdoor furniture set"
                          disabled={!editMode}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what reward/upgrade will be triggered when goal is achieved
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    Current Progress
                  </div>
                  <div className="mt-2 text-sm text-green-600">
                    125,000 THB of 150,000 THB target (83% complete)
                  </div>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Planned Upgrades Tab */}
      <TabsContent value="upgrades" className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Property Upgrades & Improvements</h3>
            <p className="text-muted-foreground">Plan and track property enhancement projects</p>
          </div>
          {canEdit && editMode && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Upgrade
            </Button>
          )}
        </div>

        {/* Upgrades List */}
        <div className="space-y-4">
          {/* Sample Upgrade Item */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Pool Renovation Project</CardTitle>
                  <CardDescription>Complete pool resurfacing and equipment upgrade</CardDescription>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  High Priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium">Budget</div>
                  <div className="text-lg font-semibold text-blue-600">200,000 THB</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Target Date</div>
                  <div className="text-sm">Q2 2025</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <Badge variant="secondary">Pending Approval</Badge>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Condition Trigger</div>
                <div className="text-sm text-muted-foreground bg-amber-50 p-3 rounded border">
                  ⚠️ Only proceed if monthly revenue exceeds 180,000 THB for 3 consecutive months
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Another Sample Item */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Kitchen Appliance Upgrade</CardTitle>
                  <CardDescription>Replace refrigerator and install new dishwasher</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Medium Priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium">Budget</div>
                  <div className="text-lg font-semibold text-blue-600">80,000 THB</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Target Date</div>
                  <div className="text-sm">Q3 2025</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <Badge variant="secondary">Planning</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Notes & Comments Tab */}
      <TabsContent value="notes" className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Notes & Communications</h3>
            <p className="text-muted-foreground">Internal notes and stakeholder comments</p>
          </div>
          {canEdit && editMode && (
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {/* Sample Note */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>PM</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Portfolio Manager</div>
                    <div className="text-sm text-muted-foreground">2 days ago</div>
                  </div>
                </div>
                <Badge variant="outline">General</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Revenue target for this month is looking achievable. Guest feedback has been 
                consistently positive about the property condition. The pool renovation should 
                be our next priority once we hit the target threshold.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>Visible to: Owner, Staff</span>
              </div>
            </CardContent>
          </Card>

          {/* Another Sample Note */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>OW</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Property Owner</div>
                    <div className="text-sm text-muted-foreground">1 week ago</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Milestone
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Approved the budget for kitchen upgrades. Let's prioritize the dishwasher 
                installation as guests have mentioned this in several reviews. The refrigerator 
                can wait until next quarter.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>Visible to: Owner, Staff</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      </Tabs>
    </Form>
  );
}