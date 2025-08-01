import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Building,
  DollarSign,
  TrendingUp,
  Shield,
  Users,
  Home,
  History,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  Percent,
  ArrowLeftRight,
  Eye,
  Save,
  RefreshCw,
  FileText,
  Clock
} from "lucide-react";

// Platform routing rule form schema
const platformRuleSchema = z.object({
  platformName: z.string().min(1, "Platform name is required"),
  platformDisplayName: z.string().min(1, "Display name is required"),
  defaultOwnerPercentage: z.string().min(1, "Owner percentage is required"),
  defaultManagementPercentage: z.string().min(1, "Management percentage is required"),
  routingType: z.string().min(1, "Routing type is required"),
  paymentMethod: z.string().optional(),
  supportsSplitPayout: z.boolean().default(false),
  platformFeePercentage: z.string().default("0.00"),
  adminNotes: z.string().optional(),
});

// Property rule override schema
const propertyRuleSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  platformRuleId: z.string().min(1, "Platform rule is required"),
  overrideOwnerPercentage: z.string().optional(),
  overrideManagementPercentage: z.string().optional(),
  overrideRoutingType: z.string().optional(),
  specialInstructions: z.string().optional(),
});

// Booking override schema
const bookingOverrideSchema = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  actualOwnerPercentage: z.string().min(1, "Owner percentage is required"),
  actualManagementPercentage: z.string().min(1, "Management percentage is required"),
  actualRoutingType: z.string().min(1, "Routing type is required"),
  overrideReason: z.string().min(1, "Override reason is required"),
});

type PlatformRuleData = z.infer<typeof platformRuleSchema>;
type PropertyRuleData = z.infer<typeof propertyRuleSchema>;
type BookingOverrideData = z.infer<typeof bookingOverrideSchema>;

function PlatformRoutingRules() {
  const [selectedTab, setSelectedTab] = useState("platform-rules");
  const [isPlatformRuleDialogOpen, setIsPlatformRuleDialogOpen] = useState(false);
  const [isPropertyRuleDialogOpen, setIsPropertyRuleDialogOpen] = useState(false);
  const [isBookingOverrideDialogOpen, setIsBookingOverrideDialogOpen] = useState(false);
  const [editingPlatformRule, setEditingPlatformRule] = useState<any>(null);
  const [editingPropertyRule, setEditingPropertyRule] = useState<any>(null);
  const { toast } = useToast();

  // Platform rules form
  const platformRuleForm = useForm<PlatformRuleData>({
    resolver: zodResolver(platformRuleSchema),
    defaultValues: {
      platformName: "",
      platformDisplayName: "",
      defaultOwnerPercentage: "70.00",
      defaultManagementPercentage: "30.00",
      routingType: "split_payout",
      paymentMethod: "automatic",
      supportsSplitPayout: false,
      platformFeePercentage: "0.00",
      adminNotes: "",
    },
  });

  // Property rules form
  const propertyRuleForm = useForm<PropertyRuleData>({
    resolver: zodResolver(propertyRuleSchema),
    defaultValues: {
      propertyId: "",
      platformRuleId: "",
      overrideOwnerPercentage: "",
      overrideManagementPercentage: "",
      overrideRoutingType: "",
      specialInstructions: "",
    },
  });

  // Booking override form
  const bookingOverrideForm = useForm<BookingOverrideData>({
    resolver: zodResolver(bookingOverrideSchema),
    defaultValues: {
      bookingId: "",
      actualOwnerPercentage: "",
      actualManagementPercentage: "",
      actualRoutingType: "split_payout",
      overrideReason: "",
    },
  });

  // Fetch platform rules
  const { data: platformRules = [], isLoading: isLoadingPlatformRules } = useQuery({
    queryKey: ["/api/platform-routing-rules"],
  });

  // Fetch property rules
  const { data: propertyRules = [], isLoading: isLoadingPropertyRules } = useQuery({
    queryKey: ["/api/property-platform-rules"],
  });

  // Fetch booking routing
  const { data: bookingRouting = [], isLoading: isLoadingBookingRouting } = useQuery({
    queryKey: ["/api/booking-platform-routing"],
  });

  // Fetch properties for dropdowns
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch bookings for overrides
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Fetch routing audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["/api/routing-audit-logs"],
  });

  // Create platform rule mutation
  const createPlatformRuleMutation = useMutation({
    mutationFn: async (data: PlatformRuleData) => {
      return apiRequest("POST", "/api/platform-routing-rules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-routing-rules"] });
      setIsPlatformRuleDialogOpen(false);
      platformRuleForm.reset();
      toast({
        title: "Platform rule created",
        description: "Revenue routing rule has been set up successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating platform rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update platform rule mutation
  const updatePlatformRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PlatformRuleData }) => {
      return apiRequest("PUT", `/api/platform-routing-rules/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-routing-rules"] });
      setIsPlatformRuleDialogOpen(false);
      setEditingPlatformRule(null);
      platformRuleForm.reset();
      toast({
        title: "Platform rule updated",
        description: "Revenue routing rule has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating platform rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create property rule mutation
  const createPropertyRuleMutation = useMutation({
    mutationFn: async (data: PropertyRuleData) => {
      return apiRequest("POST", "/api/property-platform-rules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-platform-rules"] });
      setIsPropertyRuleDialogOpen(false);
      propertyRuleForm.reset();
      toast({
        title: "Property rule created",
        description: "Property-specific routing rule has been set up.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating property rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create booking override mutation
  const createBookingOverrideMutation = useMutation({
    mutationFn: async (data: BookingOverrideData) => {
      return apiRequest("POST", "/api/booking-platform-routing", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-platform-routing"] });
      setIsBookingOverrideDialogOpen(false);
      bookingOverrideForm.reset();
      toast({
        title: "Booking override applied",
        description: "Special routing arrangement has been set for this booking.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error applying booking override",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreatePlatformRule = (data: PlatformRuleData) => {
    if (editingPlatformRule) {
      updatePlatformRuleMutation.mutate({ id: editingPlatformRule.id, data });
    } else {
      createPlatformRuleMutation.mutate(data);
    }
  };

  const onCreatePropertyRule = (data: PropertyRuleData) => {
    createPropertyRuleMutation.mutate(data);
  };

  const onCreateBookingOverride = (data: BookingOverrideData) => {
    createBookingOverrideMutation.mutate(data);
  };

  const openEditPlatformRule = (rule: any) => {
    setEditingPlatformRule(rule);
    platformRuleForm.reset({
      platformName: rule.platformName,
      platformDisplayName: rule.platformDisplayName,
      defaultOwnerPercentage: rule.defaultOwnerPercentage,
      defaultManagementPercentage: rule.defaultManagementPercentage,
      routingType: rule.routingType,
      paymentMethod: rule.paymentMethod,
      supportsSplitPayout: rule.supportsSplitPayout,
      platformFeePercentage: rule.platformFeePercentage,
      adminNotes: rule.adminNotes || "",
    });
    setIsPlatformRuleDialogOpen(true);
  };

  const getRoutingTypeColor = (type: string) => {
    switch (type) {
      case "split_payout": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "full_to_owner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "full_to_management": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoutingTypeLabel = (type: string) => {
    switch (type) {
      case "split_payout": return "Split Payout";
      case "full_to_owner": return "Full to Owner";
      case "full_to_management": return "Full to Management";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ArrowLeftRight className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Platform Revenue Routing Rules
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Automate income distribution from booking platforms with customizable routing rules
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platform-rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Platform Rules
            </TabsTrigger>
            <TabsTrigger value="property-overrides" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Overrides
            </TabsTrigger>
            <TabsTrigger value="booking-overrides" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Booking Overrides
            </TabsTrigger>
            <TabsTrigger value="audit-trail" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Platform Rules Tab */}
          <TabsContent value="platform-rules" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Default Platform Rules
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure default revenue splitting rules for each booking platform
                </p>
              </div>
              <Dialog open={isPlatformRuleDialogOpen} onOpenChange={setIsPlatformRuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingPlatformRule(null);
                    platformRuleForm.reset();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Platform Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPlatformRule ? "Edit Platform Rule" : "Create Platform Rule"}
                    </DialogTitle>
                    <DialogDescription>
                      Set up default revenue routing rules for this booking platform
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...platformRuleForm}>
                    <form onSubmit={platformRuleForm.handleSubmit(onCreatePlatformRule)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={platformRuleForm.control}
                          name="platformName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform Name</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="airbnb">airbnb</SelectItem>
                                  <SelectItem value="booking_com">booking_com</SelectItem>
                                  <SelectItem value="vrbo">vrbo</SelectItem>
                                  <SelectItem value="direct_stripe">direct_stripe</SelectItem>
                                  <SelectItem value="marriott">marriott</SelectItem>
                                  <SelectItem value="expedia">expedia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={platformRuleForm.control}
                          name="platformDisplayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Airbnb" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={platformRuleForm.control}
                          name="defaultOwnerPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Percentage</FormLabel>
                              <FormControl>
                                <Input placeholder="70.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={platformRuleForm.control}
                          name="defaultManagementPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Management Percentage</FormLabel>
                              <FormControl>
                                <Input placeholder="30.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={platformRuleForm.control}
                          name="routingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Routing Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select routing type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="split_payout">Split Payout</SelectItem>
                                  <SelectItem value="full_to_owner">Full to Owner</SelectItem>
                                  <SelectItem value="full_to_management">Full to Management</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={platformRuleForm.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="automatic">Automatic</SelectItem>
                                  <SelectItem value="manual_invoice">Manual Invoice</SelectItem>
                                  <SelectItem value="direct_transfer">Direct Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={platformRuleForm.control}
                          name="platformFeePercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform Fee (%)</FormLabel>
                              <FormControl>
                                <Input placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center space-x-2 pt-6">
                          <FormField
                            control={platformRuleForm.control}
                            name="supportsSplitPayout"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="rounded border-gray-300"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Supports Split Payout
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={platformRuleForm.control}
                        name="adminNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Optional notes about this platform rule..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsPlatformRuleDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPlatformRuleMutation.isPending || updatePlatformRuleMutation.isPending}
                        >
                          {editingPlatformRule ? "Update Rule" : "Create Rule"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {isLoadingPlatformRules ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : platformRules.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Platform Rules
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                      Set up your first platform routing rule to automate revenue distribution
                    </p>
                  </CardContent>
                </Card>
              ) : (
                platformRules.map((rule: any) => (
                  <Card key={rule.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {rule.platformDisplayName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rule.platformName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoutingTypeColor(rule.routingType)}>
                            {getRoutingTypeLabel(rule.routingType)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditPlatformRule(rule)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Owner Share
                          </div>
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {rule.defaultOwnerPercentage}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Management Share
                          </div>
                          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {rule.defaultManagementPercentage}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Platform Fee
                          </div>
                          <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                            {rule.platformFeePercentage}%
                          </div>
                        </div>
                      </div>

                      {rule.adminNotes && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Admin Notes: {rule.adminNotes}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Property Overrides Tab */}
          <TabsContent value="property-overrides" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Property-Specific Overrides
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Custom routing rules for specific properties
                </p>
              </div>
              <Dialog open={isPropertyRuleDialogOpen} onOpenChange={setIsPropertyRuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property Override
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Property Override</DialogTitle>
                    <DialogDescription>
                      Set custom routing rules for a specific property
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...propertyRuleForm}>
                    <form onSubmit={propertyRuleForm.handleSubmit(onCreatePropertyRule)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={propertyRuleForm.control}
                          name="propertyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
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
                          control={propertyRuleForm.control}
                          name="platformRuleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform Rule</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform rule" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {platformRules.map((rule: any) => (
                                    <SelectItem key={rule.id} value={rule.id.toString()}>
                                      {rule.platformDisplayName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={propertyRuleForm.control}
                          name="overrideOwnerPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Override Owner %</FormLabel>
                              <FormControl>
                                <Input placeholder="Leave empty to use default" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={propertyRuleForm.control}
                          name="overrideManagementPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Override Management %</FormLabel>
                              <FormControl>
                                <Input placeholder="Leave empty to use default" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={propertyRuleForm.control}
                        name="overrideRoutingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Override Routing Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Leave empty to use default" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="split_payout">Split Payout</SelectItem>
                                <SelectItem value="full_to_owner">Full to Owner</SelectItem>
                                <SelectItem value="full_to_management">Full to Management</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={propertyRuleForm.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Optional special instructions for this property..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsPropertyRuleDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPropertyRuleMutation.isPending}
                        >
                          Create Override
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {isLoadingPropertyRules ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : propertyRules.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Property Overrides
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                      Create property-specific routing rules when default platform rules need customization
                    </p>
                  </CardContent>
                </Card>
              ) : (
                propertyRules.map((rule: any) => (
                  <Card key={rule.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {rule.propertyName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Platform: {rule.platformDisplayName}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Override Active</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Owner Share
                          </div>
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {rule.overrideOwnerPercentage || rule.defaultOwnerPercentage}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Management Share
                          </div>
                          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {rule.overrideManagementPercentage || rule.defaultManagementPercentage}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Routing Type
                          </div>
                          <Badge className={getRoutingTypeColor(rule.overrideRoutingType || rule.routingType)}>
                            {getRoutingTypeLabel(rule.overrideRoutingType || rule.routingType)}
                          </Badge>
                        </div>
                      </div>

                      {rule.specialInstructions && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Special Instructions: {rule.specialInstructions}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Booking Overrides Tab */}
          <TabsContent value="booking-overrides" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Booking-Specific Overrides
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Special arrangements for individual bookings
                </p>
              </div>
              <Dialog open={isBookingOverrideDialogOpen} onOpenChange={setIsBookingOverrideDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Booking Override
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Booking Override</DialogTitle>
                    <DialogDescription>
                      Apply special routing arrangement for a specific booking
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...bookingOverrideForm}>
                    <form onSubmit={bookingOverrideForm.handleSubmit(onCreateBookingOverride)} className="space-y-4">
                      <FormField
                        control={bookingOverrideForm.control}
                        name="bookingId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Booking</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select booking" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bookings.map((booking: any) => (
                                  <SelectItem key={booking.id} value={booking.id.toString()}>
                                    {booking.guestName} - {booking.propertyName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={bookingOverrideForm.control}
                          name="actualOwnerPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Percentage</FormLabel>
                              <FormControl>
                                <Input placeholder="70.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingOverrideForm.control}
                          name="actualManagementPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Management Percentage</FormLabel>
                              <FormControl>
                                <Input placeholder="30.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={bookingOverrideForm.control}
                        name="actualRoutingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Routing Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select routing type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="split_payout">Split Payout</SelectItem>
                                <SelectItem value="full_to_owner">Full to Owner</SelectItem>
                                <SelectItem value="full_to_management">Full to Management</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bookingOverrideForm.control}
                        name="overrideReason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Override Reason</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Explain why this booking needs special routing..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsBookingOverrideDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createBookingOverrideMutation.isPending}
                        >
                          Apply Override
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {isLoadingBookingRouting ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : bookingRouting.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Booking Overrides
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                      Apply special routing arrangements when individual bookings need different treatment
                    </p>
                  </CardContent>
                </Card>
              ) : (
                bookingRouting.map((routing: any) => (
                  <Card key={routing.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {routing.guestName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {routing.propertyName} • ${routing.totalBookingAmount}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Override</Badge>
                          <Badge className={getRoutingTypeColor(routing.actualRoutingType)}>
                            {getRoutingTypeLabel(routing.actualRoutingType)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Owner Amount
                          </div>
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ${routing.ownerAmount} ({routing.actualOwnerPercentage}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Management Amount
                          </div>
                          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            ${routing.managementAmount} ({routing.actualManagementPercentage}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Platform Fee
                          </div>
                          <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                            ${routing.platformFeeAmount}
                          </div>
                        </div>
                      </div>

                      {routing.overrideReason && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Override Reason
                              </div>
                              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                {routing.overrideReason}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit-trail" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Routing Audit Trail
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete history of all routing rule changes and applications
              </p>
            </div>

            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <History className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Audit Logs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      Audit trail will appear here as routing rules are created and modified
                    </p>
                  </CardContent>
                </Card>
              ) : (
                auditLogs.map((log: any) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {log.actionType} - {log.relatedType}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {log.changeReason}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(log.performedAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            by {log.performedBy}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PlatformRoutingRules;