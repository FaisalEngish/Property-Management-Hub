import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, AlertTriangle, Wrench, Home, Filter, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Zap, Droplets, Wifi, Bug, Flame, Building, Settings, FileText, Upload, Eye, RotateCcw, Hammer, AirVent, Trash2, TreePalm, Waves, Shield, Bell, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Enhanced schemas for property utilities and maintenance
const utilityAccountEnhancedSchema = z.object({
  propertyId: z.coerce.number(),
  utilityType: z.string(),
  customUtilityName: z.string().optional(),
  providerName: z.string(),
  accountNumber: z.string(),
  monthlyCostEstimate: z.coerce.number(),
  customerServicePhone: z.string().optional(),
  notes: z.string().optional(),
  autoRemindersEnabled: z.boolean().default(true),
  reminderDaysAfterDue: z.coerce.number().default(4),
  paymentFrequency: z.string().default("monthly"),
  defaultDueDate: z.coerce.number().default(15),
  predictiveRemindersEnabled: z.boolean().default(false),
});

const utilityBillEnhancedSchema = z.object({
  utilityAccountId: z.coerce.number(),
  propertyId: z.coerce.number(),
  billingMonth: z.string(),
  billAmount: z.string(),
  currency: z.string().default("THB"),
  paymentStatus: z.string().default("pending"),
  responsibleParty: z.string().default("owner"),
  billScanUrl: z.string().optional(),
  receiptScanUrl: z.string().optional(),
  ocrText: z.string().optional(),
  notes: z.string().optional(),
});

const maintenanceServiceRecordSchema = z.object({
  propertyId: z.coerce.number(),
  serviceType: z.string(), // renovation, ac_clean, septic_pump, pool_deep_clean, garden_overhaul, pest_spray, roof_inspection
  serviceName: z.string().optional(),
  serviceDate: z.string(),
  serviceProvider: z.string(),
  serviceNotes: z.string().optional(),
  serviceCost: z.string().optional(),
  nextRecommendedDate: z.string().optional(),
  intervalMonths: z.coerce.number().default(6),
  receiptUrl: z.string().optional(),
  completionPhotos: z.string().optional(),
});

const maintenanceRecordSchema = z.object({
  propertyId: z.coerce.number(),
  serviceType: z.string(),
  serviceName: z.string(),
  serviceDate: z.string(),
  serviceProvider: z.string(),
  cost: z.string(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const maintenanceIntervalSchema = z.object({
  propertyId: z.coerce.number(),
  serviceType: z.string(),
  serviceName: z.string(),
  intervalDays: z.coerce.number(),
  lastServiceDate: z.string().optional(),
  serviceProvider: z.string().optional(),
  estimatedCost: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

type UtilityAccountEnhanced = z.infer<typeof utilityAccountEnhancedSchema>;
type UtilityBillEnhanced = z.infer<typeof utilityBillEnhancedSchema>;
type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>;
type MaintenanceInterval = z.infer<typeof maintenanceIntervalSchema>;

// Utility type icons mapping
const utilityTypeIcons = {
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  pest_control: Bug,
  gas: Flame,
  hoa_fee: Building,
  other: Settings,
};

const maintenanceServiceIcons = {
  renovation: Hammer,
  ac_clean: AirVent,
  septic_pump: Trash2,
  pool_deep_clean: Waves,
  garden_overhaul: TreePalm,
  pest_spray: Bug,
  roof_inspection: Shield,
};

export default function PropertyUtilitiesMaintenanceTracker() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [isUtilityAccountDialogOpen, setIsUtilityAccountDialogOpen] = useState(false);
  const [isUtilityBillDialogOpen, setIsUtilityBillDialogOpen] = useState(false);
  const [isMaintenanceRecordDialogOpen, setIsMaintenanceRecordDialogOpen] = useState(false);
  const [isMaintenanceIntervalDialogOpen, setIsMaintenanceIntervalDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Demo authentication middleware check
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/demo-user"],
    retry: false,
  });

  // Fetch properties
  const { data: properties, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  // Fetch utility accounts enhanced
  const { data: utilityAccounts, isLoading: isUtilityAccountsLoading } = useQuery({
    queryKey: ["/api/property-utilities-enhanced"],
    enabled: !!user,
  });

  // Fetch utility bills enhanced
  const { data: utilityBills, isLoading: isUtilityBillsLoading } = useQuery({
    queryKey: ["/api/utility-bills-enhanced"],
    enabled: !!user,
  });

  // Fetch maintenance history
  const { data: maintenanceHistory, isLoading: isMaintenanceHistoryLoading } = useQuery({
    queryKey: ["/api/property-maintenance-history"],
    enabled: !!user,
  });

  // Fetch maintenance intervals
  const { data: maintenanceIntervals, isLoading: isMaintenanceIntervalsLoading } = useQuery({
    queryKey: ["/api/maintenance-service-intervals"],
    enabled: !!user,
  });

  // Fetch property alerts
  const { data: propertyAlerts, isLoading: isPropertyAlertsLoading } = useQuery({
    queryKey: ["/api/property-alerts"],
    enabled: !!user,
  });

  // Forms
  const utilityAccountForm = useForm<UtilityAccountEnhanced>({
    resolver: zodResolver(utilityAccountEnhancedSchema),
    defaultValues: {
      autoRemindersEnabled: true,
      reminderDaysAfterDue: 4,
      paymentFrequency: "monthly",
      defaultDueDate: 15,
      predictiveRemindersEnabled: false,
    },
  });

  const utilityBillForm = useForm<UtilityBillEnhanced>({
    resolver: zodResolver(utilityBillEnhancedSchema),
    defaultValues: {
      currency: "THB",
      paymentStatus: "pending",
      responsibleParty: "owner",
    },
  });

  const maintenanceRecordForm = useForm<MaintenanceRecord>({
    resolver: zodResolver(maintenanceRecordSchema),
  });

  const maintenanceIntervalForm = useForm<MaintenanceInterval>({
    resolver: zodResolver(maintenanceIntervalSchema),
    defaultValues: {
      isActive: true,
    },
  });

  // Mutations
  const createUtilityAccountMutation = useMutation({
    mutationFn: (data: UtilityAccountEnhanced) =>
      apiRequest("POST", "/api/property-utilities-enhanced", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-utilities-enhanced"] });
      toast({ title: "Success", description: "Utility account created successfully" });
      setIsUtilityAccountDialogOpen(false);
      utilityAccountForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create utility account", variant: "destructive" });
    },
  });

  const createUtilityBillMutation = useMutation({
    mutationFn: (data: UtilityBillEnhanced) =>
      apiRequest("POST", "/api/utility-bills-enhanced", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills-enhanced"] });
      toast({ title: "Success", description: "Utility bill created successfully" });
      setIsUtilityBillDialogOpen(false);
      utilityBillForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create utility bill", variant: "destructive" });
    },
  });

  const createMaintenanceRecordMutation = useMutation({
    mutationFn: (data: MaintenanceRecord) =>
      apiRequest("POST", "/api/property-maintenance-history", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-maintenance-history"] });
      toast({ title: "Success", description: "Maintenance record created successfully" });
      setIsMaintenanceRecordDialogOpen(false);
      maintenanceRecordForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create maintenance record", variant: "destructive" });
    },
  });

  const createMaintenanceIntervalMutation = useMutation({
    mutationFn: (data: MaintenanceInterval) =>
      apiRequest("POST", "/api/maintenance-service-intervals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-service-intervals"] });
      toast({ title: "Success", description: "Maintenance interval created successfully" });
      setIsMaintenanceIntervalDialogOpen(false);
      maintenanceIntervalForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create maintenance interval", variant: "destructive" });
    },
  });

  // Loading states
  if (isUserLoading || isPropertiesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Access control check
  if (!user || !['admin', 'portfolio-manager', 'staff'].includes(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the Property Utilities & Maintenance Tracker.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProperties = user.role === 'staff' 
    ? (properties as any[])?.filter((p: any) => p.id === user.assignedPropertyId) 
    : properties;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Utilities & Maintenance Tracker</h1>
        <p className="text-muted-foreground">
          Comprehensive utility billing automation and maintenance cycle tracking
        </p>
      </div>

      {/* Property Selector */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Home className="h-5 w-5 text-primary" />
              <Select 
                value={selectedProperty?.toString() || ""} 
                onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {(filteredProperties as any[])?.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="utility-accounts" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Utility Accounts
          </TabsTrigger>
          <TabsTrigger value="utility-bills" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Utility Bills
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utility Accounts</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(utilityAccounts as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active accounts managed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(utilityBills as any[])?.filter((bill: any) => bill.paymentStatus === 'pending')?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Bills awaiting payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Records</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(maintenanceHistory as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Service records logged
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(propertyAlerts as any[])?.filter((alert: any) => alert.status === 'active')?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Alerts requiring attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest utility and maintenance updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Demo activity items */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Electricity bill uploaded</p>
                    <p className="text-xs text-muted-foreground">Villa Samui Breeze - 2,450 THB</p>
                  </div>
                  <Badge variant="outline">2 hours ago</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Wrench className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pool maintenance completed</p>
                    <p className="text-xs text-muted-foreground">Villa Sunset Paradise - Weekly cleaning</p>
                  </div>
                  <Badge variant="outline">1 day ago</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Internet bill overdue alert</p>
                    <p className="text-xs text-muted-foreground">Villa Ocean View - 4 days past due</p>
                  </div>
                  <Badge variant="destructive">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Utility Accounts Tab */}
        <TabsContent value="utility-accounts" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Utility Accounts</h2>
              <p className="text-muted-foreground">Manage property utility provider accounts</p>
            </div>
            <Dialog open={isUtilityAccountDialogOpen} onOpenChange={setIsUtilityAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Utility Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Utility Account</DialogTitle>
                  <DialogDescription>
                    Set up a new utility provider account for property billing automation
                  </DialogDescription>
                </DialogHeader>
                <Form {...utilityAccountForm}>
                  <form 
                    onSubmit={utilityAccountForm.handleSubmit((data) => createUtilityAccountMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={utilityAccountForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(filteredProperties as any[])?.map((property: any) => (
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
                        control={utilityAccountForm.control}
                        name="utilityType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Utility Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select utility type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="electricity">Electricity</SelectItem>
                                <SelectItem value="water">Water</SelectItem>
                                <SelectItem value="internet">Internet</SelectItem>
                                <SelectItem value="pest_control">Pest Control</SelectItem>
                                <SelectItem value="gas">Gas</SelectItem>
                                <SelectItem value="hoa_fee">HOA Fee</SelectItem>
                                <SelectItem value="other">Other (Custom)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {utilityAccountForm.watch("utilityType") === "other" && (
                      <FormField
                        control={utilityAccountForm.control}
                        name="customUtilityName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Utility Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter custom utility name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={utilityAccountForm.control}
                        name="providerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., PEA, CAT, AIS, True" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={utilityAccountForm.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={utilityAccountForm.control}
                        name="monthlyCostEstimate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Cost Estimate (THB)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={utilityAccountForm.control}
                        name="customerServicePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Service Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={utilityAccountForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes or instructions" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Automation Settings</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={utilityAccountForm.control}
                          name="paymentFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Frequency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="annually">Annually</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={utilityAccountForm.control}
                          name="defaultDueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Due Date (Day of Month)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="31" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={utilityAccountForm.control}
                          name="autoRemindersEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Auto Reminders</FormLabel>
                                <div className="text-xs text-muted-foreground">
                                  Send automatic bill reminders
                                </div>
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

                        <FormField
                          control={utilityAccountForm.control}
                          name="reminderDaysAfterDue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reminder Days After Due</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="30" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={utilityAccountForm.control}
                        name="predictiveRemindersEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Predictive Reminders</FormLabel>
                              <div className="text-xs text-muted-foreground">
                                AI-powered bill prediction alerts
                              </div>
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
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsUtilityAccountDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createUtilityAccountMutation.isPending}>
                        {createUtilityAccountMutation.isPending ? "Creating..." : "Create Account"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Utility Accounts List */}
          <div className="grid gap-4">
            {isUtilityAccountsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (utilityAccounts as any[])?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Utility Accounts</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first utility account to start tracking bills and automating reminders.
                  </p>
                  <Button onClick={() => setIsUtilityAccountDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Utility Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              (utilityAccounts as any[])?.map((account: any) => {
                const IconComponent = utilityTypeIcons[account.utilityType as keyof typeof utilityTypeIcons] || Settings;
                
                return (
                  <Card key={account.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {account.customUtilityName || account.utilityType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </h3>
                            <p className="text-muted-foreground">{account.providerName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Account: {account.accountNumber}</span>
                              <span>Est. {account.monthlyCostEstimate} THB/month</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {account.autoRemindersEnabled && (
                            <Badge variant="secondary">Auto Reminders</Badge>
                          )}
                          {account.predictiveRemindersEnabled && (
                            <Badge variant="outline">AI Predictions</Badge>
                          )}
                        </div>
                      </div>
                      
                      {account.notes && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{account.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Utility Bills Tab */}
        <TabsContent value="utility-bills" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Utility Bills</h2>
              <p className="text-muted-foreground">Track and manage utility bill payments</p>
            </div>
            <Dialog open={isUtilityBillDialogOpen} onOpenChange={setIsUtilityBillDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Utility Bill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Utility Bill</DialogTitle>
                  <DialogDescription>
                    Record a new utility bill for processing
                  </DialogDescription>
                </DialogHeader>
                <Form {...utilityBillForm}>
                  <form 
                    onSubmit={utilityBillForm.handleSubmit((data) => createUtilityBillMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={utilityBillForm.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(filteredProperties as any[])?.map((property: any) => (
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
                      control={utilityBillForm.control}
                      name="utilityAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Utility Account</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select utility account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(utilityAccounts as any[])?.map((account: any) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.providerName} - {account.utilityType}
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
                        control={utilityBillForm.control}
                        name="billingMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Month</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={utilityBillForm.control}
                        name="billAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bill Amount</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={utilityBillForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="THB">THB</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={utilityBillForm.control}
                        name="responsibleParty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsible Party</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="guest">Guest</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Receipt Upload Section */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="text-sm font-medium">📑 Bill & Receipt Documentation</h4>
                      
                      <FormField
                        control={utilityBillForm.control}
                        name="billScanUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Upload Bill Scan
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    field.onChange(`/uploads/bills/${file.name}`);
                                    // Simulate OCR extraction
                                    utilityBillForm.setValue("ocrText", `Extracted from ${file.name}: Bill amount detected, due date identified`);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={utilityBillForm.control}
                        name="receiptScanUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Upload Payment Receipt
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    field.onChange(`/uploads/receipts/${file.name}`);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={utilityBillForm.control}
                        name="ocrText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              OCR Extracted Text (Auto-filled)
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Text extracted from bill scan will appear here..."
                                className="bg-muted text-sm"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={utilityBillForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes about this bill" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsUtilityBillDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createUtilityBillMutation.isPending}>
                        {createUtilityBillMutation.isPending ? "Creating..." : "Create Bill"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Utility Bills List */}
          <div className="grid gap-4">
            {isUtilityBillsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (utilityBills as any[])?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Utility Bills</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first utility bill to start tracking payments.
                  </p>
                  <Button onClick={() => setIsUtilityBillDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Utility Bill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              (utilityBills as any[])?.map((bill: any) => (
                <Card key={bill.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{bill.billingMonth}</h3>
                          <p className="text-muted-foreground">Account ID: {bill.utilityAccountId}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{bill.billAmount} {bill.currency}</span>
                            <span>Responsible: {bill.responsibleParty}</span>
                          </div>
                          
                          {/* Receipt Upload Status */}
                          <div className="flex items-center gap-4 mt-3">
                            {bill.billScanUrl && (
                              <div className="flex items-center gap-1 text-xs">
                                <FileText className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Bill Scan</span>
                              </div>
                            )}
                            {bill.receiptScanUrl && (
                              <div className="flex items-center gap-1 text-xs">
                                <Upload className="h-3 w-3 text-blue-500" />
                                <span className="text-blue-600">Receipt</span>
                              </div>
                            )}
                            {bill.ocrText && (
                              <div className="flex items-center gap-1 text-xs">
                                <Eye className="h-3 w-3 text-purple-500" />
                                <span className="text-purple-600">OCR Data</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          bill.paymentStatus === 'paid' ? 'default' : 
                          bill.paymentStatus === 'overdue' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {bill.paymentStatus}
                      </Badge>
                    </div>
                    
                    {bill.notes && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{bill.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Maintenance Management</h2>
              <p className="text-muted-foreground">Track maintenance history and service intervals</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isMaintenanceRecordDialogOpen} onOpenChange={setIsMaintenanceRecordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Maintenance Record</DialogTitle>
                    <DialogDescription>
                      Record a completed maintenance service
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...maintenanceRecordForm}>
                    <form 
                      onSubmit={maintenanceRecordForm.handleSubmit((data) => createMaintenanceRecordMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <FormField
                        control={maintenanceRecordForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(filteredProperties as any[])?.map((property: any) => (
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={maintenanceRecordForm.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pool_maintenance">Pool Maintenance</SelectItem>
                                  <SelectItem value="garden_maintenance">Garden Maintenance</SelectItem>
                                  <SelectItem value="hvac_service">HVAC Service</SelectItem>
                                  <SelectItem value="plumbing">Plumbing</SelectItem>
                                  <SelectItem value="electrical">Electrical</SelectItem>
                                  <SelectItem value="pest_control">Pest Control</SelectItem>
                                  <SelectItem value="cleaning">Deep Cleaning</SelectItem>
                                  <SelectItem value="general_repair">General Repair</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={maintenanceRecordForm.control}
                          name="serviceName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Weekly pool cleaning" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={maintenanceRecordForm.control}
                          name="serviceDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={maintenanceRecordForm.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost (THB)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={maintenanceRecordForm.control}
                        name="serviceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Provider</FormLabel>
                            <FormControl>
                              <Input placeholder="Company or person name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={maintenanceRecordForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe what was done" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsMaintenanceRecordDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createMaintenanceRecordMutation.isPending}>
                          {createMaintenanceRecordMutation.isPending ? "Creating..." : "Create Record"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog open={isMaintenanceIntervalDialogOpen} onOpenChange={setIsMaintenanceIntervalDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interval
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Maintenance Interval</DialogTitle>
                    <DialogDescription>
                      Set up recurring maintenance schedule
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...maintenanceIntervalForm}>
                    <form 
                      onSubmit={maintenanceIntervalForm.handleSubmit((data) => createMaintenanceIntervalMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <FormField
                        control={maintenanceIntervalForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(filteredProperties as any[])?.map((property: any) => (
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={maintenanceIntervalForm.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pool_maintenance">Pool Maintenance</SelectItem>
                                  <SelectItem value="garden_maintenance">Garden Maintenance</SelectItem>
                                  <SelectItem value="hvac_service">HVAC Service</SelectItem>
                                  <SelectItem value="pest_control">Pest Control</SelectItem>
                                  <SelectItem value="deep_cleaning">Deep Cleaning</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={maintenanceIntervalForm.control}
                          name="serviceName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Weekly pool cleaning" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={maintenanceIntervalForm.control}
                          name="intervalDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interval (Days)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" placeholder="e.g., 7 for weekly" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={maintenanceIntervalForm.control}
                          name="estimatedCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Cost (THB)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={maintenanceIntervalForm.control}
                        name="serviceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Service Provider</FormLabel>
                            <FormControl>
                              <Input placeholder="Company or person name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={maintenanceIntervalForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Special instructions or requirements" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsMaintenanceIntervalDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createMaintenanceIntervalMutation.isPending}>
                          {createMaintenanceIntervalMutation.isPending ? "Creating..." : "Create Interval"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Maintenance History */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Recent Maintenance History</h3>
            {isMaintenanceHistoryLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (maintenanceHistory as any[])?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Maintenance Records</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first maintenance record to start tracking service history.
                  </p>
                  <Button onClick={() => setIsMaintenanceRecordDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Maintenance Record
                  </Button>
                </CardContent>
              </Card>
            ) : (
              (maintenanceHistory as any[])?.slice(0, 5).map((record: any) => (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Wrench className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{record.serviceName}</h3>
                          <p className="text-muted-foreground">{record.serviceProvider}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{record.serviceDate}</span>
                            <span>{record.cost} THB</span>
                            <span>{record.serviceType.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    
                    {record.description && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{record.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Maintenance Intervals */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Service Intervals</h3>
            {isMaintenanceIntervalsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (maintenanceIntervals as any[])?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Service Intervals</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up recurring maintenance schedules to automate service reminders.
                  </p>
                  <Button onClick={() => setIsMaintenanceIntervalDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service Interval
                  </Button>
                </CardContent>
              </Card>
            ) : (
              (maintenanceIntervals as any[])?.map((interval: any) => (
                <Card key={interval.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{interval.serviceName}</h3>
                          <p className="text-muted-foreground">{interval.serviceProvider}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Every {interval.intervalDays} days</span>
                            <span>~{interval.estimatedCost} THB</span>
                            <span>{interval.serviceType.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={interval.isActive ? "success" : "secondary"}>
                        {interval.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    {interval.notes && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{interval.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🚨 AI Alert & Monitoring Center</h2>
              <p className="text-muted-foreground">Automated monitoring, predictive alerts, and smart reminders</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Alert Settings
              </Button>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                AI Configure
              </Button>
            </div>
          </div>

          {/* AI Alert Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-700 flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {(propertyAlerts as any[])?.filter((alert: any) => alert.severity === 'critical' && alert.status === 'active')?.length || 2}
                </div>
                <p className="text-xs text-red-600">Overdue bills, urgent maintenance</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-700 flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Predictive Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">
                  {(propertyAlerts as any[])?.filter((alert: any) => alert.severity === 'high' && alert.status === 'active')?.length || 5}
                </div>
                <p className="text-xs text-amber-600">AI-detected patterns, upcoming issues</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-700 flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4" />
                  Smart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {(propertyAlerts as any[])?.filter((alert: any) => alert.severity === 'medium' && alert.status === 'active')?.length || 3}
                </div>
                <p className="text-xs text-blue-600">Routine checks, maintenance schedules</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700 flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {(propertyAlerts as any[])?.filter((alert: any) => alert.alertCategory === 'financial' && alert.status === 'active')?.length || 7}
                </div>
                <p className="text-xs text-green-600">Cost optimization, pattern analysis</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts List */}
          <div className="grid gap-4">
            {isPropertyAlertsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (propertyAlerts as any[])?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">
                    All property utilities and maintenance are up to date.
                  </p>
                </CardContent>
              </Card>
            ) : (
              (propertyAlerts as any[])?.map((alert: any) => {
                const isOverdue = alert.alertType === 'utility_overdue';
                const isMaintenance = alert.alertType === 'maintenance_due';
                
                return (
                  <Card key={alert.id} className={isOverdue ? "border-red-200" : isMaintenance ? "border-amber-200" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            isOverdue ? "bg-red-100" : 
                            isMaintenance ? "bg-amber-100" : 
                            "bg-primary/10"
                          }`}>
                            {isOverdue ? (
                              <XCircle className="h-6 w-6 text-red-600" />
                            ) : isMaintenance ? (
                              <AlertTriangle className="h-6 w-6 text-amber-600" />
                            ) : (
                              <AlertCircle className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <p className="text-muted-foreground">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                              <span>Priority: {alert.priority}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge 
                            variant={
                              alert.status === 'resolved' ? 'success' : 
                              alert.status === 'acknowledged' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}