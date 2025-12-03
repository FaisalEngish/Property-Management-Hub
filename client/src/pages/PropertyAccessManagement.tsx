import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Key, Wifi, Shield, Calendar, QrCode, Camera, Eye, EyeOff, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for creating/updating access credentials
const accessCredentialSchema = z.object({
  propertyId: z.number().min(1, "Property is required"),
  itemName: z.string().min(1, "Item name is required"),
  itemType: z.enum(["door_lock", "safe_box", "wifi", "smart_lock", "alarm_system", "gate_access", "parking_pass", "other"]),
  credential: z.string().min(1, "Credential is required"),
  credentialType: z.enum(["code", "pin", "password", "key_location", "link", "token", "qr_code"]),
  description: z.string().optional(),
  location: z.string().optional(),
  visibleTo: z.array(z.string()).min(1, "Must be visible to at least one role"),
  isActive: z.boolean().default(true),
  rotationRequired: z.boolean().default(false),
  rotationDays: z.number().optional(),
  smartLockApiUrl: z.string().optional(),
  notes: z.string().optional()
});

type AccessCredentialForm = z.infer<typeof accessCredentialSchema>;

const accessItemIcons = {
  door_lock: Key,
  safe_box: Shield,
  wifi: Wifi,
  smart_lock: Key,
  alarm_system: Shield,
  gate_access: Key,
  parking_pass: Key,
  other: Key
};

const credentialTypeIcons = {
  code: "🔢",
  pin: "📱", 
  password: "🔒",
  key_location: "🗝️",
  link: "🔗",
  token: "🎫",
  qr_code: "📱"
};

export default function PropertyAccessManagement() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [showCredential, setShowCredential] = useState<{ [key: number]: boolean }>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch property access credentials 
  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ["/api/property-access/credentials/filtered", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/property-access/credentials/filtered${selectedProperty ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Fetch rotation schedules
  const { data: rotationSchedules = [] } = useQuery({
    queryKey: ["/api/property-access/rotation-schedules", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/property-access/rotation-schedules${selectedProperty ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Create credential mutation
  const createCredentialMutation = useMutation({
    mutationFn: (data: AccessCredentialForm) => apiRequest("POST", "/api/property-access/credentials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-access/credentials/filtered"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Property access credential created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property access credential",
        variant: "destructive",
      });
    },
  });

  // Update credential mutation
  const updateCredentialMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AccessCredentialForm> }) =>
      apiRequest("PUT", `/api/property-access/credentials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-access/credentials/filtered"] });
      setEditingCredential(null);
      toast({
        title: "Success",
        description: "Property access credential updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property access credential",
        variant: "destructive",
      });
    },
  });

  // Delete credential mutation
  const deleteCredentialMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/property-access/credentials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-access/credentials/filtered"] });
      toast({
        title: "Success",
        description: "Property access credential deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property access credential",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AccessCredentialForm>({
    resolver: zodResolver(accessCredentialSchema),
    defaultValues: {
      propertyId: selectedProperty || 0,
      itemName: "",
      itemType: "door_lock",
      credential: "",
      credentialType: "code",
      description: "",
      location: "",
      visibleTo: ["admin"],
      isActive: true,
      rotationRequired: false,
      rotationDays: 90,
      smartLockApiUrl: "",
      notes: ""
    },
  });

  const handleSubmit = (data: AccessCredentialForm) => {
    if (editingCredential) {
      updateCredentialMutation.mutate({ id: editingCredential.id, data });
    } else {
      createCredentialMutation.mutate(data);
    }
  };

  const toggleCredentialVisibility = (credentialId: number) => {
    setShowCredential(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const getVisibilityBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "portfolio-manager": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      staff: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      guest: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const openCreateDialog = () => {
    form.reset({
      propertyId: selectedProperty || 0,
      itemName: "",
      itemType: "door_lock",
      credential: "",
      credentialType: "code",
      description: "",
      location: "",
      visibleTo: ["admin"],
      isActive: true,
      rotationRequired: false,
      rotationDays: 90,
      smartLockApiUrl: "",
      notes: ""
    });
    setEditingCredential(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (credential: any) => {
    form.reset({
      propertyId: credential.propertyId,
      itemName: credential.itemName,
      itemType: credential.itemType,
      credential: credential.credential,
      credentialType: credential.credentialType,
      description: credential.description || "",
      location: credential.location || "",
      visibleTo: credential.visibleTo || ["admin"],
      isActive: credential.isActive,
      rotationRequired: credential.rotationRequired || false,
      rotationDays: credential.rotationDays || 90,
      smartLockApiUrl: credential.smartLockApiUrl || "",
      notes: credential.notes || ""
    });
    setEditingCredential(credential);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Property Access Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage door codes, safe combinations, WiFi passwords, and smart lock credentials with role-based access control
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Access Credential
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCredential ? "Edit" : "Add"} Access Credential
                  </DialogTitle>
                  <DialogDescription>
                    {editingCredential ? "Update the" : "Create a new"} property access credential with role-based visibility controls
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties.map((property: any) => (
                                  <SelectItem key={property.id} value={property.id.toString()}>
                                    {property.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="itemType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="door_lock">🚪 Door Lock</SelectItem>
                                <SelectItem value="safe_box">🔒 Safe Box</SelectItem>
                                <SelectItem value="wifi">📶 WiFi Network</SelectItem>
                                <SelectItem value="smart_lock">🔐 Smart Lock</SelectItem>
                                <SelectItem value="alarm_system">🚨 Alarm System</SelectItem>
                                <SelectItem value="gate_access">🚪 Gate Access</SelectItem>
                                <SelectItem value="parking_pass">🅿️ Parking Pass</SelectItem>
                                <SelectItem value="other">❓ Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="itemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Front Door, Main Safe, Guest WiFi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="credentialType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credential Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="code">🔢 Numeric Code</SelectItem>
                                <SelectItem value="pin">📱 PIN</SelectItem>
                                <SelectItem value="password">🔒 Password</SelectItem>
                                <SelectItem value="key_location">🗝️ Key Location</SelectItem>
                                <SelectItem value="link">🔗 Link/URL</SelectItem>
                                <SelectItem value="token">🎫 Token</SelectItem>
                                <SelectItem value="qr_code">📱 QR Code</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="credential"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credential/Code/Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the access code, password, or credential"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This sensitive information will be encrypted and role-restricted
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Main entrance, Master bedroom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smartLockApiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Smart Lock API URL (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://api.smartlock.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional details about this access credential" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visibleTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visible To (Roles)</FormLabel>
                          <div className="grid grid-cols-3 gap-4">
                            {["admin", "portfolio-manager", "staff", "owner", "guest"].map((role) => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={role}
                                  checked={field.value?.includes(role)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, role]);
                                    } else {
                                      field.onChange(field.value?.filter((r) => r !== role));
                                    }
                                  }}
                                />
                                <label htmlFor={role} className="text-sm font-medium capitalize">
                                  {role.replace("-", " ")}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormDescription>
                            Select which user roles can view this credential
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rotationRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Code Rotation</FormLabel>
                              <FormDescription>
                                Require periodic code changes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {form.watch("rotationRequired") && (
                        <FormField
                          control={form.control}
                          name="rotationDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rotation Interval (days)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="90"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Internal Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Internal notes for staff/management" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCredentialMutation.isPending || updateCredentialMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {editingCredential ? "Update" : "Create"} Credential
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Property Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Select
              value={selectedProperty?.toString() || "all"}
              onValueChange={(value) => setSelectedProperty(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="credentials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Access Credentials
            </TabsTrigger>
            <TabsTrigger value="guest-access" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Guest Access
            </TabsTrigger>
            <TabsTrigger value="rotation" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Code Rotation
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos & Guides
            </TabsTrigger>
          </TabsList>

          {/* Access Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : credentials.length === 0 ? (
              <Card className="p-12 text-center">
                <Key className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Access Credentials
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  {selectedProperty
                    ? "No access credentials found for the selected property"
                    : "Get started by adding your first property access credential"}
                </p>
                <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Credential
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credentials.map((credential: any) => {
                  const IconComponent = accessItemIcons[credential.itemType as keyof typeof accessItemIcons];
                  const isVisible = showCredential[credential.id];
                  
                  return (
                    <Card key={credential.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-lg">{credential.itemName}</CardTitle>
                          </div>
                          <Badge variant={credential.isActive ? "default" : "secondary"}>
                            {credential.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {credential.itemType.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} 
                          {credential.location && ` • ${credential.location}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Credential Display */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {credentialTypeIcons[credential.credentialType as keyof typeof credentialTypeIcons]} 
                              {credential.credentialType.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCredentialVisibility(credential.id)}
                              className="h-6 w-6 p-0"
                            >
                              {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm">
                            {isVisible ? credential.credential : "••••••••"}
                          </div>
                        </div>

                        {/* Description */}
                        {credential.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{credential.description}</p>
                        )}

                        {/* Visibility Badges */}
                        <div className="flex flex-wrap gap-1">
                          {credential.visibleTo?.map((role: string) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className={`text-xs ${getVisibilityBadgeColor(role)}`}
                            >
                              {role.replace("-", " ")}
                            </Badge>
                          ))}
                        </div>

                        {/* Rotation Status */}
                        {credential.rotationRequired && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-orange-600 dark:text-orange-400">
                              Rotates every {credential.rotationDays} days
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(credential)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCredentialMutation.mutate(credential.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Guest Access Tab */}
          <TabsContent value="guest-access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Guest Access Tokens
                </CardTitle>
                <CardDescription>
                  Generate temporary access tokens for guests during their stay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Guest Access Management
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Guest access token generation and QR code management coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Rotation Tab */}
          <TabsContent value="rotation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Code Rotation Schedule
                </CardTitle>
                <CardDescription>
                  Automated reminders and tracking for credential updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rotationSchedules.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Rotation Schedules
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Enable rotation on credentials to see automatic update reminders here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rotationSchedules.map((schedule: any) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{schedule.credentialName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Next rotation: {new Date(schedule.nextRotationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {new Date(schedule.nextRotationDate) <= new Date() ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Due
                            </Badge>
                          ) : (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos & Guides Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Access Location Photos & Guides
                </CardTitle>
                <CardDescription>
                  Visual guides and photos to help locate access points and keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Photo Management
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Photo upload and visual guide management coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}