import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload,
  Plus,
  Eye,
  Settings,
  Zap,
  Droplets,
  Wifi,
  Bug,
  Flame,
  Building,
  FileText,
  Camera,
  DollarSign,
  TrendingUp,
  Bell,
  Filter,
  Search,
  Edit,
  Trash2,
  Star,
  MapPin,
  Phone,
  Globe,
  Receipt,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Activity,
  BarChart3,
  Target
} from "lucide-react";

// Schemas for forms
const maintenanceIssueSchema = z.object({
  issueTitle: z.string().min(1, "Title is required"),
  issueDescription: z.string().min(1, "Description is required"),
  issueType: z.string().min(1, "Issue type is required"),
  urgencyLevel: z.string().min(1, "Urgency level is required"),
  assignedTo: z.string().optional(),
  dueDateEstimate: z.string().optional(),
  estimatedCost: z.string().optional(),
});

const serviceHistorySchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  serviceName: z.string().min(1, "Service name is required"),
  serviceDescription: z.string().optional(),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceProvider: z.string().optional(),
  providerContact: z.string().optional(),
  serviceCategory: z.string().min(1, "Service category is required"),
  serviceCost: z.string().optional(),
  qualityRating: z.string().optional(),
  nextServiceDue: z.string().optional(),
});

const propertyUtilitySchema = z.object({
  utilityType: z.string().min(1, "Utility type is required"),
  customUtilityName: z.string().optional(),
  provider: z.string().min(1, "Provider is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  billingCycle: z.string().min(1, "Billing cycle is required"),
  averageBillAmount: z.string().optional(),
  expectedBillDate: z.string().optional(),
  alertDaysAfter: z.string().optional(),
  providerContact: z.string().optional(),
  onlinePortal: z.string().optional(),
});

const utilityBillSchema = z.object({
  billingMonth: z.string().min(1, "Billing month is required"),
  billAmount: z.string().min(1, "Bill amount is required"),
  billDueDate: z.string().optional(),
  billReceivedDate: z.string().optional(),
  paymentStatus: z.string().min(1, "Payment status is required"),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
});

// Utility type icons
const utilityIcons = {
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  pest_control: Bug,
  gas: Flame,
  hoa_fee: Building,
  custom: Settings,
};

// Issue type icons
const issueTypeIcons = {
  AC: Zap,
  Electrical: Zap,
  Plumbing: Droplets,
  Pool: Droplets,
  Garden: MapPin,
  General: Wrench,
};

// Urgency level colors
const urgencyColors = {
  Low: "bg-green-100 text-green-800",
  Normal: "bg-yellow-100 text-yellow-800",
  Urgent: "bg-red-100 text-red-800",
};

// Status colors
const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

export default function MaintenanceUtilitiesRenovationTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("maintenance");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data
  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user
  });

  const { data: maintenanceIssues } = useQuery({
    queryKey: ["/api/maintenance-tracker/issues", selectedProperty],
    enabled: !!selectedProperty
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ["/api/maintenance-tracker/service-history", selectedProperty],
    enabled: !!selectedProperty
  });

  const { data: taskSuggestions } = useQuery({
    queryKey: ["/api/maintenance-tracker/task-suggestions", selectedProperty],
    enabled: !!selectedProperty
  });

  const { data: propertyUtilities } = useQuery({
    queryKey: ["/api/maintenance-tracker/utilities", selectedProperty],
    enabled: !!selectedProperty
  });

  const { data: utilityBills } = useQuery({
    queryKey: ["/api/maintenance-tracker/utility-bills", selectedProperty],
    enabled: !!selectedProperty
  });

  const { data: utilityAlerts } = useQuery({
    queryKey: ["/api/maintenance-tracker/utility-alerts", selectedProperty],
    enabled: !!selectedProperty
  });

  const { data: propertyInfo } = useQuery({
    queryKey: ["/api/maintenance-tracker/property-info", selectedProperty],
    enabled: !!selectedProperty
  });

  // Forms
  const maintenanceForm = useForm({
    resolver: zodResolver(maintenanceIssueSchema),
    defaultValues: {
      issueTitle: "",
      issueDescription: "",
      issueType: "",
      urgencyLevel: "",
      assignedTo: "",
      dueDateEstimate: "",
      estimatedCost: "",
    }
  });

  const serviceForm = useForm({
    resolver: zodResolver(serviceHistorySchema),
    defaultValues: {
      serviceType: "",
      serviceName: "",
      serviceDescription: "",
      serviceDate: "",
      serviceProvider: "",
      providerContact: "",
      serviceCategory: "",
      serviceCost: "",
      qualityRating: "",
      nextServiceDue: "",
    }
  });

  const utilityForm = useForm({
    resolver: zodResolver(propertyUtilitySchema),
    defaultValues: {
      utilityType: "",
      customUtilityName: "",
      provider: "",
      accountNumber: "",
      billingCycle: "",
      averageBillAmount: "",
      expectedBillDate: "",
      alertDaysAfter: "4",
      providerContact: "",
      onlinePortal: "",
    }
  });

  const billForm = useForm({
    resolver: zodResolver(utilityBillSchema),
    defaultValues: {
      billingMonth: "",
      billAmount: "",
      billDueDate: "",
      billReceivedDate: "",
      paymentStatus: "",
      paidDate: "",
      notes: "",
    }
  });

  // Mutations
  const createMaintenanceIssue = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/maintenance-tracker/issues", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-tracker/issues"] });
      toast({ title: "Success", description: "Maintenance issue created successfully" });
      maintenanceForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create maintenance issue", variant: "destructive" });
    }
  });

  const createServiceHistory = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/maintenance-tracker/service-history", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-tracker/service-history"] });
      toast({ title: "Success", description: "Service record created successfully" });
      serviceForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create service record", variant: "destructive" });
    }
  });

  const createPropertyUtility = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/maintenance-tracker/utilities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-tracker/utilities"] });
      toast({ title: "Success", description: "Utility account created successfully" });
      utilityForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create utility account", variant: "destructive" });
    }
  });

  const createUtilityBill = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/maintenance-tracker/utility-bills", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-tracker/utility-bills"] });
      toast({ title: "Success", description: "Utility bill added successfully" });
      billForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add utility bill", variant: "destructive" });
    }
  });

  const approveSuggestion = useMutation({
    mutationFn: (suggestionId: number) => apiRequest("POST", `/api/maintenance-tracker/task-suggestions/${suggestionId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-tracker/task-suggestions"] });
      toast({ title: "Success", description: "Task suggestion approved and created" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve suggestion", variant: "destructive" });
    }
  });

  const dismissSuggestion = useMutation({
    mutationFn: ({ suggestionId, reason }: { suggestionId: number, reason: string }) => 
      apiRequest("POST", `/api/maintenance-tracker/task-suggestions/${suggestionId}/dismiss`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-tracker/task-suggestions"] });
      toast({ title: "Success", description: "Task suggestion dismissed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to dismiss suggestion", variant: "destructive" });
    }
  });

  // Set default property if user is owner
  useEffect(() => {
    if (properties && properties.length > 0 && !selectedProperty) {
      if (user?.role === 'owner') {
        // For owners, select their first property
        const userProperties = properties.filter((p: any) => p.ownerId === user.id);
        if (userProperties.length > 0) {
          setSelectedProperty(userProperties[0].id);
        }
      } else {
        // For admin/PM, select first property
        setSelectedProperty(properties[0].id);
      }
    }
  }, [properties, user, selectedProperty]);

  // Filter maintenance issues
  const filteredMaintenanceIssues = maintenanceIssues?.filter((issue: any) => {
    const matchesStatus = filterStatus === "all" || issue.currentStatus === filterStatus;
    const matchesSearch = issue.issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.issueDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  // Property selection for admin/PM
  const selectedPropertyData = properties?.find((p: any) => p.id === selectedProperty);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🛠️ Maintenance, Utilities & Renovation Tracker</h1>
          <p className="text-muted-foreground">
            Comprehensive property maintenance and utilities management
          </p>
        </div>
        
        {/* Property Selector */}
        {(user?.role === 'admin' || user?.role === 'portfolio-manager') && (
          <div className="w-64">
            <Label>Select Property</Label>
            <Select value={selectedProperty?.toString() || ""} onValueChange={(value) => setSelectedProperty(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose property..." />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedProperty ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Property</h3>
              <p className="text-muted-foreground">Choose a property to view maintenance and utility information</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Property Info Sidebar */}
          {propertyInfo && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {selectedPropertyData?.name} - Quick Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{propertyInfo.totalUtilities || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Utilities</div>
                    {propertyInfo.utilitiesWithOverdueBills > 0 && (
                      <Badge variant="destructive" className="mt-1">
                        {propertyInfo.utilitiesWithOverdueBills} Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{propertyInfo.openMaintenanceIssues || 0}</div>
                    <div className="text-sm text-muted-foreground">Open Issues</div>
                    {propertyInfo.urgentMaintenanceIssues > 0 && (
                      <Badge variant="destructive" className="mt-1">
                        {propertyInfo.urgentMaintenanceIssues} Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{propertyInfo.activeSuggestions || 0}</div>
                    <div className="text-sm text-muted-foreground">AI Suggestions</div>
                    {propertyInfo.urgentSuggestions > 0 && (
                      <Badge variant="secondary" className="mt-1">
                        {propertyInfo.urgentSuggestions} Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ฿{propertyInfo.totalMonthlyUtilityCost || '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Utilities</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="maintenance">🔧 Maintenance Log</TabsTrigger>
              <TabsTrigger value="timeline">📆 Service Timeline</TabsTrigger>
              <TabsTrigger value="suggestions">💡 AI Suggestions</TabsTrigger>
              <TabsTrigger value="utilities">📋 Utilities</TabsTrigger>
              <TabsTrigger value="alerts">⚠️ Alerts</TabsTrigger>
            </TabsList>

            {/* Maintenance Log Tab */}
            <TabsContent value="maintenance" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Maintenance Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Maintenance Issue</DialogTitle>
                      <DialogDescription>
                        Report a new maintenance issue for this property
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...maintenanceForm}>
                      <form onSubmit={maintenanceForm.handleSubmit((data) => {
                        createMaintenanceIssue.mutate({
                          ...data,
                          propertyId: selectedProperty,
                          reportedBy: user?.id,
                          reportedByName: user?.firstName + ' ' + user?.lastName,
                        });
                      })} className="space-y-4">
                        <FormField
                          control={maintenanceForm.control}
                          name="issueTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Issue Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Brief description of the issue" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={maintenanceForm.control}
                          name="issueDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Detailed Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Provide detailed information about the issue" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={maintenanceForm.control}
                            name="issueType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Issue Type</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AC">AC/Climate Control</SelectItem>
                                      <SelectItem value="Electrical">Electrical</SelectItem>
                                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                                      <SelectItem value="Pool">Pool/Spa</SelectItem>
                                      <SelectItem value="Garden">Garden/Landscaping</SelectItem>
                                      <SelectItem value="General">General/Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={maintenanceForm.control}
                            name="urgencyLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Urgency Level</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select urgency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Low">Low</SelectItem>
                                      <SelectItem value="Normal">Normal</SelectItem>
                                      <SelectItem value="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={maintenanceForm.control}
                            name="dueDateEstimate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date Estimate</FormLabel>
                                <FormControl>
                                  <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={maintenanceForm.control}
                            name="estimatedCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Cost (THB)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="0.00" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="submit" disabled={createMaintenanceIssue.isPending}>
                            {createMaintenanceIssue.isPending ? "Creating..." : "Create Issue"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Maintenance Issues Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Issues</CardTitle>
                  <CardDescription>
                    Current and historical maintenance issues for this property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredMaintenanceIssues.length === 0 ? (
                    <div className="text-center py-8">
                      <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Maintenance Issues</h3>
                      <p className="text-muted-foreground">No maintenance issues found for the current filters</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Issue</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Urgency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMaintenanceIssues.map((issue: any) => {
                          const IssueIcon = issueTypeIcons[issue.issueType as keyof typeof issueTypeIcons] || Wrench;
                          return (
                            <TableRow key={issue.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <IssueIcon className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{issue.issueTitle}</div>
                                    <div className="text-sm text-muted-foreground truncate max-w-48">
                                      {issue.issueDescription}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{issue.issueType}</TableCell>
                              <TableCell>
                                <Badge className={urgencyColors[issue.urgencyLevel as keyof typeof urgencyColors]}>
                                  {issue.urgencyLevel}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={statusColors[issue.currentStatus as keyof typeof statusColors]}>
                                  {issue.currentStatus.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{issue.assignedToName || "Unassigned"}</TableCell>
                              <TableCell>
                                {issue.actualCost ? `฿${issue.actualCost}` : 
                                 issue.estimatedCost ? `~฿${issue.estimatedCost}` : "—"}
                              </TableCell>
                              <TableCell>
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Service & Renovation Timeline</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Service Record</DialogTitle>
                      <DialogDescription>
                        Record a maintenance service or renovation
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...serviceForm}>
                      <form onSubmit={serviceForm.handleSubmit((data) => {
                        createServiceHistory.mutate({
                          ...data,
                          propertyId: selectedProperty,
                          createdBy: user?.id,
                          createdByName: user?.firstName + ' ' + user?.lastName,
                        });
                      })} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={serviceForm.control}
                            name="serviceType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Type</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="renovation">Major Renovation</SelectItem>
                                      <SelectItem value="ac_service">AC Servicing</SelectItem>
                                      <SelectItem value="pest_control">Pest Control</SelectItem>
                                      <SelectItem value="deep_clean">Deep Clean/Steam Clean</SelectItem>
                                      <SelectItem value="pool_inspection">Pool System Inspection</SelectItem>
                                      <SelectItem value="septic_service">Septic Tank Service</SelectItem>
                                      <SelectItem value="landscaping">Garden Landscaping</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="serviceCategory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Category</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="major_renovation">Major Renovation</SelectItem>
                                      <SelectItem value="routine_maintenance">Routine Maintenance</SelectItem>
                                      <SelectItem value="emergency_repair">Emergency Repair</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={serviceForm.control}
                          name="serviceName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Brief description of service performed" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={serviceForm.control}
                          name="serviceDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Detailed description of work performed" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={serviceForm.control}
                            name="serviceDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Date</FormLabel>
                                <FormControl>
                                  <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="nextServiceDue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Next Service Due</FormLabel>
                                <FormControl>
                                  <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={serviceForm.control}
                            name="serviceProvider"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Provider</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Company or person who performed service" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="providerContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Provider Contact</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Phone number or email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={serviceForm.control}
                            name="serviceCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Cost (THB)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="0.00" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="qualityRating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quality Rating</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Rate service quality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 Star - Poor</SelectItem>
                                      <SelectItem value="2">2 Stars - Fair</SelectItem>
                                      <SelectItem value="3">3 Stars - Good</SelectItem>
                                      <SelectItem value="4">4 Stars - Very Good</SelectItem>
                                      <SelectItem value="5">5 Stars - Excellent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="submit" disabled={createServiceHistory.isPending}>
                            {createServiceHistory.isPending ? "Adding..." : "Add Service Record"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Service History Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Service History</CardTitle>
                  <CardDescription>
                    Chronological record of all services and renovations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!serviceHistory || serviceHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Service History</h3>
                      <p className="text-muted-foreground">No service records found for this property</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {serviceHistory.map((service: any) => (
                        <div key={service.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{service.serviceName}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{service.serviceType.replace('_', ' ')}</Badge>
                                {service.qualityRating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="text-sm">{service.qualityRating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {new Date(service.serviceDate).toLocaleDateString()} • {service.serviceProvider}
                            </div>
                            {service.serviceDescription && (
                              <p className="text-sm mb-2">{service.serviceDescription}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              {service.serviceCost && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ฿{service.serviceCost}
                                </div>
                              )}
                              {service.nextServiceDue && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Next due: {new Date(service.nextServiceDue).toLocaleDateString()}
                                </div>
                              )}
                              {service.providerContact && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {service.providerContact}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">AI-Driven Task Suggestions</h2>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {taskSuggestions?.length || 0} Active Suggestions
                </Badge>
              </div>

              {!taskSuggestions || taskSuggestions.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No AI Suggestions</h3>
                      <p className="text-muted-foreground">No maintenance suggestions available at this time</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {taskSuggestions.map((suggestion: any) => (
                    <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            {suggestion.suggestionTitle}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                suggestion.priorityLevel === 'urgent' ? 'bg-red-100 text-red-800' :
                                suggestion.priorityLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                suggestion.priorityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {suggestion.priorityLevel} priority
                            </Badge>
                            <Badge variant="outline">
                              {suggestion.aiConfidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{suggestion.suggestionDescription}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {suggestion.daysSinceLastService}
                            </div>
                            <div className="text-sm text-muted-foreground">Days Since Last</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {suggestion.recommendedInterval}
                            </div>
                            <div className="text-sm text-muted-foreground">Recommended Interval</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ฿{suggestion.estimatedCost || '—'}
                            </div>
                            <div className="text-sm text-muted-foreground">Estimated Cost</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Based on: {suggestion.basedOnData.replace('_', ' ')}
                            {suggestion.lastServiceDate && (
                              <span> • Last service: {new Date(suggestion.lastServiceDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Dismiss
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Dismiss Suggestion</DialogTitle>
                                  <DialogDescription>
                                    Why are you dismissing this suggestion?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea placeholder="Reason for dismissal (optional)..." />
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button 
                                      onClick={() => dismissSuggestion.mutate({ 
                                        suggestionId: suggestion.id, 
                                        reason: "Dismissed by user" 
                                      })}
                                      disabled={dismissSuggestion.isPending}
                                    >
                                      Dismiss
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              size="sm"
                              onClick={() => approveSuggestion.mutate(suggestion.id)}
                              disabled={approveSuggestion.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Create Task
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Utilities Tab */}
            <TabsContent value="utilities" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Utilities Tracking</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Utility Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Utility Account</DialogTitle>
                      <DialogDescription>
                        Set up tracking for a utility service
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...utilityForm}>
                      <form onSubmit={utilityForm.handleSubmit((data) => {
                        createPropertyUtility.mutate({
                          ...data,
                          propertyId: selectedProperty,
                        });
                      })} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={utilityForm.control}
                            name="utilityType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Utility Type</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select utility type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="electricity">Electricity</SelectItem>
                                      <SelectItem value="water">Water</SelectItem>
                                      <SelectItem value="internet">Internet</SelectItem>
                                      <SelectItem value="pest_control">Pest Control</SelectItem>
                                      <SelectItem value="gas">Gas</SelectItem>
                                      <SelectItem value="hoa_fee">HOA Fee</SelectItem>
                                      <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {utilityForm.watch("utilityType") === "custom" && (
                            <FormField
                              control={utilityForm.control}
                              name="customUtilityName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Custom Utility Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter utility name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={utilityForm.control}
                            name="provider"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Provider</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Utility company name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={utilityForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Account/meter number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={utilityForm.control}
                            name="billingCycle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Billing Cycle</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select cycle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="quarterly">Quarterly</SelectItem>
                                      <SelectItem value="annually">Annually</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={utilityForm.control}
                            name="expectedBillDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expected Bill Date</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="1" max="31" placeholder="Day of month" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={utilityForm.control}
                            name="alertDaysAfter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Alert Days After</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="4" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={utilityForm.control}
                            name="averageBillAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Average Bill Amount (THB)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="0.00" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={utilityForm.control}
                            name="providerContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Provider Contact</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Phone or email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={utilityForm.control}
                          name="onlinePortal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Online Portal URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="submit" disabled={createPropertyUtility.isPending}>
                            {createPropertyUtility.isPending ? "Adding..." : "Add Utility Account"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Utilities Grid */}
              <div className="grid gap-6">
                {!propertyUtilities || propertyUtilities.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Utilities Configured</h3>
                        <p className="text-muted-foreground">Add utility accounts to start tracking bills and alerts</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  propertyUtilities.map((utility: any) => {
                    const UtilityIcon = utilityIcons[utility.utilityType as keyof typeof utilityIcons] || Settings;
                    const relatedBills = utilityBills?.filter((bill: any) => bill.utilityId === utility.id) || [];
                    const unpaidBills = relatedBills.filter((bill: any) => bill.paymentStatus === 'pending').length;
                    const overdueBills = relatedBills.filter((bill: any) => bill.paymentStatus === 'overdue').length;
                    
                    return (
                      <Card key={utility.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <UtilityIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-lg">
                                {utility.customUtilityName || utility.utilityType.replace('_', ' ')}
                              </div>
                              <div className="text-sm text-muted-foreground font-normal">
                                {utility.provider} • {utility.accountNumber}
                              </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              {overdueBills > 0 && (
                                <Badge variant="destructive">{overdueBills} Overdue</Badge>
                              )}
                              {unpaidBills > 0 && (
                                <Badge variant="secondary">{unpaidBills} Pending</Badge>
                              )}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                ฿{utility.averageBillAmount || '—'}
                              </div>
                              <div className="text-sm text-muted-foreground">Average Bill</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {utility.expectedBillDate || '—'}
                              </div>
                              <div className="text-sm text-muted-foreground">Expected Bill Date</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {utility.billingCycle}
                              </div>
                              <div className="text-sm text-muted-foreground">Billing Cycle</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {utility.providerContact && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {utility.providerContact}
                                </div>
                              )}
                              {utility.onlinePortal && (
                                <div className="flex items-center gap-1">
                                  <Globe className="h-4 w-4" />
                                  Portal
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Receipt className="h-4 w-4 mr-1" />
                                    Add Bill
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Utility Bill</DialogTitle>
                                    <DialogDescription>
                                      Record a new bill for {utility.customUtilityName || utility.utilityType.replace('_', ' ')}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Form {...billForm}>
                                    <form onSubmit={billForm.handleSubmit((data) => {
                                      createUtilityBill.mutate({
                                        ...data,
                                        propertyId: selectedProperty,
                                        utilityId: utility.id,
                                      });
                                    })} className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={billForm.control}
                                          name="billingMonth"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Billing Month</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="month" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={billForm.control}
                                          name="billAmount"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Bill Amount (THB)</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="number" placeholder="0.00" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={billForm.control}
                                          name="billDueDate"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Due Date</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="date" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={billForm.control}
                                          name="billReceivedDate"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Received Date</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="date" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      <FormField
                                        control={billForm.control}
                                        name="paymentStatus"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Payment Status</FormLabel>
                                            <FormControl>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select payment status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="pending">Pending</SelectItem>
                                                  <SelectItem value="paid">Paid</SelectItem>
                                                  <SelectItem value="overdue">Overdue</SelectItem>
                                                  <SelectItem value="disputed">Disputed</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      {billForm.watch("paymentStatus") === "paid" && (
                                        <FormField
                                          control={billForm.control}
                                          name="paidDate"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Paid Date</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="date" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      )}
                                      <FormField
                                        control={billForm.control}
                                        name="notes"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Additional notes..." />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button type="submit" disabled={createUtilityBill.isPending}>
                                          {createUtilityBill.isPending ? "Adding..." : "Add Bill"}
                                        </Button>
                                      </div>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                              
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View Bills
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Utility Bill Alerts</h2>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  {utilityAlerts?.filter((alert: any) => alert.alertStatus === 'active').length || 0} Active Alerts
                </Badge>
              </div>

              {!utilityAlerts || utilityAlerts.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
                      <p className="text-muted-foreground">No utility bill alerts at this time</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {utilityAlerts.map((alert: any) => (
                    <Card key={alert.id} className={`border-l-4 ${
                      alert.alertSeverity === 'urgent' ? 'border-l-red-500 bg-red-50' :
                      alert.alertSeverity === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className={`h-5 w-5 ${
                              alert.alertSeverity === 'urgent' ? 'text-red-600' :
                              alert.alertSeverity === 'warning' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                            {alert.alertTitle}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                alert.alertSeverity === 'urgent' ? 'bg-red-100 text-red-800' :
                                alert.alertSeverity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }
                            >
                              {alert.alertSeverity}
                            </Badge>
                            <Badge variant={alert.alertStatus === 'active' ? 'default' : 'secondary'}>
                              {alert.alertStatus}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{alert.alertMessage}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Created: {new Date(alert.createdAt).toLocaleDateString()}
                            {alert.acknowledgedAt && (
                              <span> • Acknowledged: {new Date(alert.acknowledgedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          {alert.alertStatus === 'active' && (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Acknowledge
                              </Button>
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}