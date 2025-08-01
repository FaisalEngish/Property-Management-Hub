import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  ShieldCheck, 
  Calendar, 
  Brain, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  FileText,
  Zap,
  Settings,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Activity,
  Target,
  Gauge
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schemas
const maintenanceLogSchema = z.object({
  propertyId: z.number(),
  issueTitle: z.string().min(1, "Issue title is required"),
  issueDescription: z.string().min(1, "Issue description is required"),
  issueType: z.enum(["repair", "maintenance", "installation", "inspection"]),
  category: z.enum(["hvac", "pool", "garden", "electrical", "plumbing", "cleaning", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  estimatedCost: z.number().min(0).optional(),
  currency: z.string().default("THB"),
  vendorUsed: z.string().optional(),
  vendorContact: z.string().optional(),
  warrantyInfo: z.string().optional(),
  notes: z.string().optional()
});

const warrantySchema = z.object({
  propertyId: z.number(),
  itemName: z.string().min(1, "Item name is required"),
  itemType: z.enum(["appliance", "equipment", "systems", "furniture", "electronics"]),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyType: z.enum(["manufacturer", "extended", "third_party"]),
  warrantyProvider: z.string().min(1, "Warranty provider is required"),
  warrantyPeriod: z.string().min(1, "Warranty period is required"),
  warrantyStartDate: z.string(),
  warrantyEndDate: z.string(),
  coverageDetails: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  purchaseDate: z.string().optional(),
  alertDaysBefore: z.number().min(1).default(30),
  notes: z.string().optional()
});

type MaintenanceLog = {
  id: number;
  propertyId: number;
  issueTitle: string;
  issueDescription: string;
  issueType: string;
  category: string;
  priority: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  reportedBy: string;
  reportedByName: string;
  status: string;
  workStartedAt?: Date;
  workCompletedAt?: Date;
  estimatedCost?: number;
  actualCost?: number;
  currency: string;
  attachmentUrls?: string[];
  warrantyInfo?: string;
  vendorUsed?: string;
  vendorContact?: string;
  notes?: string;
  completionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
};

type WarrantyTracker = {
  id: number;
  propertyId: number;
  maintenanceLogId?: number;
  itemName: string;
  itemType: string;
  manufacturer: string;
  model?: string;
  serialNumber?: string;
  warrantyType: string;
  warrantyProvider: string;
  warrantyPeriod: string;
  warrantyStartDate: Date;
  warrantyEndDate: Date;
  status: string;
  coverageDetails?: string;
  claimHistory?: string[];
  documentUrls?: string[];
  purchasePrice?: number;
  purchaseDate?: Date;
  alertDaysBefore: number;
  lastAlertSent?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

type AiRecommendation = {
  id: number;
  propertyId: number;
  recommendationType: string;
  serviceType: string;
  serviceName: string;
  category: string;
  aiConfidence: number;
  basedOnPattern: string;
  triggerSource: string;
  suggestedDate: Date;
  priority: string;
  estimatedCost?: number;
  status: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  convertedToTaskId?: number;
  convertedAt?: Date;
  aiExplanation: string;
  supportingData: any;
  createdAt: Date;
  updatedAt: Date;
};

type DashboardSummary = {
  totalJobs: number;
  completedJobs: number;
  overdueJobs: number;
  emergencyJobs: number;
  totalCost: number;
  averageCostPerJob: number;
  categoryBreakdown: any;
  recentActivity: MaintenanceLog[];
  expiringWarranties: WarrantyTracker[];
  aiRecommendations: AiRecommendation[];
  overdueSchedules: any[];
};

export default function MaintenanceServiceTracking() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Dialog states
  const [isCreateLogOpen, setIsCreateLogOpen] = useState(false);
  const [isCreateWarrantyOpen, setIsCreateWarrantyOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AiRecommendation | null>(null);

  // Forms
  const maintenanceForm = useForm({
    resolver: zodResolver(maintenanceLogSchema),
    defaultValues: {
      propertyId: 0,
      issueTitle: "",
      issueDescription: "",
      issueType: "repair" as const,
      category: "general" as const,
      priority: "medium" as const,
      estimatedCost: undefined,
      currency: "THB",
      vendorUsed: "",
      vendorContact: "",
      warrantyInfo: "",
      notes: ""
    }
  });

  const warrantyForm = useForm({
    resolver: zodResolver(warrantySchema),
    defaultValues: {
      propertyId: 0,
      itemName: "",
      itemType: "appliance" as const,
      manufacturer: "",
      model: "",
      serialNumber: "",
      warrantyType: "manufacturer" as const,
      warrantyProvider: "",
      warrantyPeriod: "",
      warrantyStartDate: "",
      warrantyEndDate: "",
      coverageDetails: "",
      purchasePrice: undefined,
      purchaseDate: "",
      alertDaysBefore: 30,
      notes: ""
    }
  });

  // Check user authentication and permissions
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/auth/demo-login";
      }, 500);
      return;
    }
  }, [isAuthLoading, user, toast]);

  // Query: Properties
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user
  });

  // Query: Dashboard Summary
  const { data: dashboardSummary, isLoading: isDashboardLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/maintenance/dashboard-summary", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append("propertyId", selectedProperty);
      
      const response = await apiRequest("GET", `/api/maintenance/dashboard-summary?${params}`);
      return response.json();
    },
    enabled: !!user
  });

  // Query: Maintenance Logs
  const { data: maintenanceLogs = [], isLoading: isLogsLoading } = useQuery<MaintenanceLog[]>({
    queryKey: ["/api/maintenance/logs", selectedProperty, statusFilter, priorityFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append("propertyId", selectedProperty);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      
      const response = await apiRequest("GET", `/api/maintenance/logs?${params}`);
      return response.json();
    },
    enabled: !!user
  });

  // Query: Warranty Trackers
  const { data: warranties = [], isLoading: isWarrantiesLoading } = useQuery<WarrantyTracker[]>({
    queryKey: ["/api/maintenance/warranties", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append("propertyId", selectedProperty);
      
      const response = await apiRequest("GET", `/api/maintenance/warranties?${params}`);
      return response.json();
    },
    enabled: !!user
  });

  // Query: AI Recommendations
  const { data: aiRecommendations = [], isLoading: isRecommendationsLoading } = useQuery<AiRecommendation[]>({
    queryKey: ["/api/maintenance/ai-recommendations", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append("propertyId", selectedProperty);
      
      const response = await apiRequest("GET", `/api/maintenance/ai-recommendations?${params}`);
      return response.json();
    },
    enabled: !!user
  });

  // Mutation: Create Maintenance Log
  const createLogMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/maintenance/logs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Maintenance log created successfully",
      });
      setIsCreateLogOpen(false);
      maintenanceForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/dashboard-summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create maintenance log",
        variant: "destructive",
      });
    }
  });

  // Mutation: Complete Maintenance Log
  const completeLogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("POST", `/api/maintenance/logs/${id}/complete`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Maintenance job completed successfully",
      });
      setSelectedLog(null);
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/dashboard-summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete maintenance job",
        variant: "destructive",
      });
    }
  });

  // Mutation: Create Warranty
  const createWarrantyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/maintenance/warranties", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Warranty tracker created successfully",
      });
      setIsCreateWarrantyOpen(false);
      warrantyForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/warranties"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create warranty tracker",
        variant: "destructive",
      });
    }
  });

  // Mutation: Approve AI Recommendation
  const approveRecommendationMutation = useMutation({
    mutationFn: async ({ id, reviewNotes }: { id: number; reviewNotes?: string }) => {
      const response = await apiRequest("POST", `/api/maintenance/ai-recommendations/${id}/approve`, { reviewNotes });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI recommendation approved successfully",
      });
      setSelectedRecommendation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/ai-recommendations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve AI recommendation",
        variant: "destructive",
      });
    }
  });

  // Mutation: Convert AI Recommendation to Task
  const convertRecommendationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/maintenance/ai-recommendations/${id}/convert-to-task`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI recommendation converted to maintenance task successfully",
      });
      setSelectedRecommendation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/ai-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/logs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert AI recommendation",
        variant: "destructive",
      });
    }
  });

  // Handle form submissions
  const onCreateLog = async (data: any) => {
    createLogMutation.mutate(data);
  };

  const onCreateWarranty = async (data: any) => {
    const warrantyData = {
      ...data,
      warrantyStartDate: new Date(data.warrantyStartDate),
      warrantyEndDate: new Date(data.warrantyEndDate),
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined
    };
    createWarrantyMutation.mutate(warrantyData);
  };

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "secondary";
      case "medium": return "default";
      case "low": return "outline";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "awaiting_parts": return "outline";
      case "open": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in_progress": return Clock;
      case "awaiting_parts": return AlertTriangle;
      case "open": return AlertCircle;
      default: return Activity;
    }
  };

  const formatCurrency = (amount: number, currency: string = "THB") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Loading states
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance & Service Tracking</h1>
          <p className="text-muted-foreground">
            Comprehensive maintenance management with AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Property Selector */}
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Properties</SelectItem>
              {properties.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Create Actions */}
          {['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role) && (
            <Dialog open={isCreateLogOpen} onOpenChange={setIsCreateLogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Maintenance Log</DialogTitle>
                  <DialogDescription>
                    Report a new maintenance issue or schedule routine maintenance
                  </DialogDescription>
                </DialogHeader>
                <Form {...maintenanceForm}>
                  <form onSubmit={maintenanceForm.handleSubmit(onCreateLog)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={maintenanceForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
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
                        control={maintenanceForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                          <FormLabel>Issue Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Detailed description of the issue and any relevant context" />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="installation">Installation</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={maintenanceForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hvac">HVAC</SelectItem>
                                <SelectItem value="pool">Pool</SelectItem>
                                <SelectItem value="garden">Garden</SelectItem>
                                <SelectItem value="electrical">Electrical</SelectItem>
                                <SelectItem value="plumbing">Plumbing</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={maintenanceForm.control}
                        name="estimatedCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Cost (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="0.00" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={maintenanceForm.control}
                        name="vendorUsed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vendor (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Preferred vendor or contractor" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={maintenanceForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Any additional information or special instructions" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateLogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createLogMutation.isPending}>
                        {createLogMutation.isPending ? "Creating..." : "Create Log"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center space-x-2">
            <Wrench className="w-4 h-4" />
            <span>Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="warranties" className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Warranties</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Predictive</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isDashboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardSummary?.totalJobs || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardSummary?.completedJobs || 0} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue Jobs</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {dashboardSummary?.overdueJobs || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Require immediate attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emergency Jobs</CardTitle>
                    <Zap className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">
                      {dashboardSummary?.emergencyJobs || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Urgent priority items
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(dashboardSummary?.totalCost || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg: {formatCurrency(dashboardSummary?.averageCostPerJob || 0)} per job
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Maintenance Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {dashboardSummary?.recentActivity?.map((log) => {
                          const StatusIcon = getStatusIcon(log.status);
                          return (
                            <div key={log.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                              <StatusIcon className="w-5 h-5 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{log.issueTitle}</p>
                                <p className="text-sm text-muted-foreground">
                                  {log.category} • {formatDate(log.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getPriorityColor(log.priority)}>
                                  {log.priority}
                                </Badge>
                                <Badge variant={getStatusColor(log.status)}>
                                  {log.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Expiring Warranties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Expiring Warranties</CardTitle>
                    <CardDescription>Next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {dashboardSummary?.expiringWarranties?.map((warranty) => {
                          const daysUntil = getDaysUntilExpiry(warranty.warrantyEndDate);
                          return (
                            <div key={warranty.id} className="p-3 border rounded-lg">
                              <p className="text-sm font-medium">{warranty.itemName}</p>
                              <p className="text-xs text-muted-foreground">{warranty.manufacturer}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(warranty.warrantyEndDate)}
                                </span>
                                <Badge variant={daysUntil <= 7 ? "destructive" : "secondary"}>
                                  {daysUntil} days
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* AI Recommendations */}
              {dashboardSummary?.aiRecommendations?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Maintenance Recommendations</CardTitle>
                    <CardDescription>Pending review and approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {dashboardSummary.aiRecommendations.slice(0, 3).map((recommendation) => (
                        <div key={recommendation.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{recommendation.category}</Badge>
                            <Badge variant="secondary">
                              {Math.round(recommendation.aiConfidence * 100)}% confidence
                            </Badge>
                          </div>
                          <h4 className="font-medium">{recommendation.serviceName}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {recommendation.aiExplanation}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-medium">
                              {formatCurrency(recommendation.estimatedCost || 0)}
                            </span>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedRecommendation(recommendation)}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Maintenance Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="pool">Pool</SelectItem>
                      <SelectItem value="garden">Garden</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStatusFilter("");
                      setPriorityFilter("");
                      setCategoryFilter("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Logs List */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Logs</CardTitle>
              <CardDescription>
                {isLogsLoading ? "Loading..." : `${maintenanceLogs.length} maintenance jobs`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLogsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceLogs.map((log) => {
                    const StatusIcon = getStatusIcon(log.status);
                    return (
                      <Card key={log.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <StatusIcon className="w-5 h-5 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium">{log.issueTitle}</h4>
                                <Badge variant={getPriorityColor(log.priority)}>
                                  {log.priority}
                                </Badge>
                                <Badge variant={getStatusColor(log.status)}>
                                  {log.status.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline">{log.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {log.issueDescription}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Reported by {log.reportedByName}</span>
                                <span>•</span>
                                <span>{formatDate(log.createdAt)}</span>
                                {log.assignedStaffName && (
                                  <>
                                    <span>•</span>
                                    <span>Assigned to {log.assignedStaffName}</span>
                                  </>
                                )}
                                {log.estimatedCost && (
                                  <>
                                    <span>•</span>
                                    <span>Est. {formatCurrency(log.estimatedCost, log.currency)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            {log.status !== "completed" && ['admin', 'portfolio-manager', 'staff'].includes(user?.role) && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                Update
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warranties Tab */}
        <TabsContent value="warranties" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Warranty Tracker</h3>
              <p className="text-sm text-muted-foreground">
                Monitor warranty coverage and expiration dates
              </p>
            </div>
            {['admin', 'portfolio-manager'].includes(user?.role) && (
              <Dialog open={isCreateWarrantyOpen} onOpenChange={setIsCreateWarrantyOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Warranty
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Warranty Tracker</DialogTitle>
                    <DialogDescription>
                      Register a new item under warranty coverage
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...warrantyForm}>
                    <form onSubmit={warrantyForm.handleSubmit(onCreateWarranty)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={warrantyForm.control}
                          name="propertyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
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
                          control={warrantyForm.control}
                          name="itemType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="appliance">Appliance</SelectItem>
                                  <SelectItem value="equipment">Equipment</SelectItem>
                                  <SelectItem value="systems">Systems</SelectItem>
                                  <SelectItem value="furniture">Furniture</SelectItem>
                                  <SelectItem value="electronics">Electronics</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={warrantyForm.control}
                        name="itemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Name of the item under warranty" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={warrantyForm.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manufacturer</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Brand or manufacturer" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={warrantyForm.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Model number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={warrantyForm.control}
                          name="warrantyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Warranty Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                                  <SelectItem value="extended">Extended</SelectItem>
                                  <SelectItem value="third_party">Third Party</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={warrantyForm.control}
                          name="warrantyProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Warranty Provider</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Company providing warranty" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={warrantyForm.control}
                          name="warrantyPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Warranty Period</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 2 years" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={warrantyForm.control}
                          name="warrantyStartDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={warrantyForm.control}
                          name="warrantyEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={warrantyForm.control}
                        name="coverageDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coverage Details (optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="What is covered under this warranty" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateWarrantyOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createWarrantyMutation.isPending}>
                          {createWarrantyMutation.isPending ? "Creating..." : "Add Warranty"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Warranties List */}
          <Card>
            <CardContent className="p-6">
              {isWarrantiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {warranties.map((warranty) => {
                    const daysUntil = getDaysUntilExpiry(warranty.warrantyEndDate);
                    const isExpiring = daysUntil <= 30;
                    const isExpired = daysUntil <= 0;
                    
                    return (
                      <Card key={warranty.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <ShieldCheck className={`w-5 h-5 mt-1 ${isExpired ? 'text-destructive' : isExpiring ? 'text-orange-500' : 'text-green-500'}`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium">{warranty.itemName}</h4>
                                <Badge variant="outline">{warranty.itemType}</Badge>
                                <Badge variant={isExpired ? "destructive" : isExpiring ? "secondary" : "default"}>
                                  {warranty.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {warranty.manufacturer} {warranty.model && `• ${warranty.model}`}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{warranty.warrantyType} warranty</span>
                                <span>•</span>
                                <span>Provider: {warranty.warrantyProvider}</span>
                                <span>•</span>
                                <span>
                                  {formatDate(warranty.warrantyStartDate)} - {formatDate(warranty.warrantyEndDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={isExpired ? "destructive" : isExpiring ? "secondary" : "default"}>
                              {isExpired ? "Expired" : `${daysUntil} days left`}
                            </Badge>
                            {warranty.purchasePrice && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatCurrency(warranty.purchasePrice)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Maintenance Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Maintenance Schedules</CardTitle>
              <CardDescription>
                Automated maintenance scheduling based on usage patterns and manufacturer recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Predictive Maintenance</h3>
                <p className="text-muted-foreground">
                  This feature will be available in the next update. It will provide automated maintenance scheduling
                  based on equipment usage patterns, manufacturer recommendations, and historical data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Maintenance Recommendations</CardTitle>
              <CardDescription>
                AI-powered insights and recommendations based on historical data and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRecommendationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {aiRecommendations.map((recommendation) => (
                    <Card key={recommendation.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Brain className="w-5 h-5 mt-1 text-blue-500" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{recommendation.serviceName}</h4>
                              <Badge variant="outline">{recommendation.category}</Badge>
                              <Badge variant={getPriorityColor(recommendation.priority)}>
                                {recommendation.priority}
                              </Badge>
                              <Badge variant="secondary">
                                {Math.round(recommendation.aiConfidence * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {recommendation.aiExplanation}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Trigger: {recommendation.triggerSource}</span>
                              <span>•</span>
                              <span>Suggested: {formatDate(recommendation.suggestedDate)}</span>
                              {recommendation.estimatedCost && (
                                <>
                                  <span>•</span>
                                  <span>Est. {formatCurrency(recommendation.estimatedCost)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {recommendation.status === "pending" && ['admin', 'portfolio-manager'].includes(user?.role) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveRecommendationMutation.mutate({ 
                                  id: recommendation.id, 
                                  reviewNotes: "Approved via dashboard" 
                                })}
                                disabled={approveRecommendationMutation.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => convertRecommendationMutation.mutate(recommendation.id)}
                                disabled={convertRecommendationMutation.isPending}
                              >
                                Convert to Task
                              </Button>
                            </>
                          )}
                          {recommendation.status !== "pending" && (
                            <Badge variant="default">{recommendation.status.replace("_", " ")}</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Timeline</CardTitle>
              <CardDescription>
                Visual timeline of all maintenance activities and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Timeline View</h3>
                <p className="text-muted-foreground">
                  This feature will provide a visual timeline of all maintenance activities, 
                  including past work, current jobs, and future scheduled maintenance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      
      {/* Log Detail Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Maintenance Log Details</DialogTitle>
              <DialogDescription>
                {selectedLog.issueTitle}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusColor(selectedLog.status)} className="ml-2">
                    {selectedLog.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={getPriorityColor(selectedLog.priority)} className="ml-2">
                    {selectedLog.priority}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedLog.issueDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reported By</Label>
                  <p className="text-sm mt-1">{selectedLog.reportedByName}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm mt-1">{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>

              {selectedLog.estimatedCost && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estimated Cost</Label>
                    <p className="text-sm mt-1">{formatCurrency(selectedLog.estimatedCost, selectedLog.currency)}</p>
                  </div>
                  {selectedLog.actualCost && (
                    <div>
                      <Label>Actual Cost</Label>
                      <p className="text-sm mt-1">{formatCurrency(selectedLog.actualCost, selectedLog.currency)}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedLog.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm mt-1">{selectedLog.notes}</p>
                </div>
              )}

              {selectedLog.completionNotes && (
                <div>
                  <Label>Completion Notes</Label>
                  <p className="text-sm mt-1">{selectedLog.completionNotes}</p>
                </div>
              )}

              {selectedLog.status !== "completed" && ['admin', 'portfolio-manager', 'staff'].includes(user?.role) && (
                <div className="border-t pt-4">
                  <Label>Complete This Job</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input 
                      type="number" 
                      placeholder="Final cost" 
                      step="0.01"
                      id="actual-cost"
                    />
                    <Button 
                      onClick={() => {
                        const costInput = document.getElementById("actual-cost") as HTMLInputElement;
                        const notesInput = document.getElementById("completion-notes") as HTMLTextAreaElement;
                        
                        completeLogMutation.mutate({
                          id: selectedLog.id,
                          data: {
                            actualCost: costInput?.value ? parseFloat(costInput.value) : undefined,
                            completionNotes: notesInput?.value || "Job completed via dashboard"
                          }
                        });
                      }}
                      disabled={completeLogMutation.isPending}
                    >
                      {completeLogMutation.isPending ? "Completing..." : "Mark Complete"}
                    </Button>
                  </div>
                  <Textarea 
                    className="mt-2" 
                    placeholder="Completion notes..." 
                    id="completion-notes"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Recommendation Detail Dialog */}
      {selectedRecommendation && (
        <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>AI Recommendation Details</DialogTitle>
              <DialogDescription>
                {selectedRecommendation.serviceName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Confidence Level</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={selectedRecommendation.aiConfidence * 100} className="flex-1" />
                    <span className="text-sm">{Math.round(selectedRecommendation.aiConfidence * 100)}%</span>
                  </div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={getPriorityColor(selectedRecommendation.priority)} className="ml-2">
                    {selectedRecommendation.priority}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>AI Explanation</Label>
                <p className="text-sm mt-1">{selectedRecommendation.aiExplanation}</p>
              </div>

              <div>
                <Label>Based on Pattern</Label>
                <p className="text-sm mt-1">{selectedRecommendation.basedOnPattern}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trigger Source</Label>
                  <p className="text-sm mt-1">{selectedRecommendation.triggerSource}</p>
                </div>
                <div>
                  <Label>Suggested Date</Label>
                  <p className="text-sm mt-1">{formatDate(selectedRecommendation.suggestedDate)}</p>
                </div>
              </div>

              {selectedRecommendation.estimatedCost && (
                <div>
                  <Label>Estimated Cost</Label>
                  <p className="text-sm mt-1">{formatCurrency(selectedRecommendation.estimatedCost)}</p>
                </div>
              )}

              {selectedRecommendation.supportingData && (
                <div>
                  <Label>Supporting Data</Label>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedRecommendation.supportingData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedRecommendation.status === "pending" && ['admin', 'portfolio-manager'].includes(user?.role) && (
                <div className="border-t pt-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => approveRecommendationMutation.mutate({ 
                      id: selectedRecommendation.id, 
                      reviewNotes: "Approved via detail view" 
                    })}
                    disabled={approveRecommendationMutation.isPending}
                  >
                    {approveRecommendationMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  <Button 
                    onClick={() => convertRecommendationMutation.mutate(selectedRecommendation.id)}
                    disabled={convertRecommendationMutation.isPending}
                  >
                    {convertRecommendationMutation.isPending ? "Converting..." : "Convert to Task"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}