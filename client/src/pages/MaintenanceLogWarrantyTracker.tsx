import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap,
  Brain,
  Shield,
  Camera,
  FileText,
  Building,
  Cpu,
  Droplets,
  Flower,
  Wind,
  Bug,
  Lightbulb,
  Hammer,
  Snowflake,
  Scissors
} from "lucide-react";

// Department icons mapping
const getDepartmentIcon = (department: string) => {
  switch (department.toLowerCase()) {
    case 'maintenance': return <Wrench className="h-4 w-4" />;
    case 'pool': return <Droplets className="h-4 w-4" />;
    case 'garden': return <Flower className="h-4 w-4" />;
    case 'ac': return <Wind className="h-4 w-4" />;
    case 'pest': return <Bug className="h-4 w-4" />;
    case 'electrical': return <Lightbulb className="h-4 w-4" />;
    case 'plumbing': return <Droplets className="h-4 w-4" />;
    case 'hvac': return <Snowflake className="h-4 w-4" />;
    case 'landscaping': return <Scissors className="h-4 w-4" />;
    default: return <Hammer className="h-4 w-4" />;
  }
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'finished': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'awaiting_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

interface MaintenanceLog {
  id: number;
  organizationId: string;
  propertyId: number;
  taskTitle: string;
  repairDate: string;
  department: string;
  itemArea: string;
  issueDescription: string;
  actionTaken: string;
  technicianAssigned?: string;
  technicianName?: string;
  cost: string;
  currency: string;
  invoiceUrl?: string;
  status: string;
  priority: string;
  linkedImages: string[];
  notes?: string;
  hasWarranty: boolean;
  warrantyDuration?: number;
  warrantyExpirationDate?: string;
  warrantyReceiptUrl?: string;
  warrantyContactInfo?: string;
  warrantyClaimStatus: string;
  isRecurringService: boolean;
  serviceCycleMonths?: number;
  nextServiceDate?: string;
  lastServiceDate?: string;
  createdBy: string;
  completedBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  approvedAt?: string;
}

interface WarrantyAlert {
  id: number;
  organizationId: string;
  maintenanceLogId: number;
  propertyId: number;
  alertType: string;
  alertMessage: string;
  daysUntilExpiration?: number;
  isActive: boolean;
  isSent: boolean;
  sentAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  scheduledFor: string;
  createdAt: string;
}

interface AiServicePrediction {
  id: number;
  organizationId: string;
  propertyId: number;
  department: string;
  itemArea: string;
  averageCycleMonths?: string;
  lastServiceDates?: any;
  predictedNextServiceDate?: string;
  confidenceScore?: string;
  basedOnHistoricalCount: number;
  suggestionStatus: string;
  suggestedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  convertedToTaskId?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MaintenanceLogWarrantyTracker() {
  const [selectedProperty, setSelectedProperty] = useState<number | undefined>();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [isCreateLogOpen, setIsCreateLogOpen] = useState(false);
  const [newLogForm, setNewLogForm] = useState({
    propertyId: "",
    taskTitle: "",
    repairDate: "",
    department: "",
    itemArea: "",
    issueDescription: "",
    actionTaken: "",
    technicianName: "",
    cost: "",
    priority: "normal",
    hasWarranty: false,
    warrantyDuration: "",
    warrantyExpirationDate: "",
    warrantyContactInfo: "",
    isRecurringService: false,
    serviceCycleMonths: "",
    nextServiceDate: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch maintenance logs
  const { data: maintenanceLogs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['/api/maintenance-logs', selectedProperty, selectedDepartment, selectedStatus, selectedPriority],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('propertyId', selectedProperty.toString());
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPriority) params.append('priority', selectedPriority);
      
      return apiRequest('GET', `/api/maintenance-logs?${params.toString()}`);
    }
  });

  // Fetch warranty alerts
  const { data: warrantyAlerts = [], isLoading: isAlertsLoading } = useQuery({
    queryKey: ['/api/warranty-alerts', selectedProperty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('propertyId', selectedProperty.toString());
      params.append('isActive', 'true');
      
      return apiRequest('GET', `/api/warranty-alerts?${params.toString()}`);
    }
  });

  // Fetch AI service predictions
  const { data: aiPredictions = [], isLoading: isPredictionsLoading } = useQuery({
    queryKey: ['/api/ai-service-predictions', selectedProperty, selectedDepartment],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('propertyId', selectedProperty.toString());
      if (selectedDepartment) params.append('department', selectedDepartment);
      params.append('suggestionStatus', 'pending');
      
      return apiRequest('GET', `/api/ai-service-predictions?${params.toString()}`);
    }
  });

  // Fetch dashboard analytics
  const { data: dashboardAnalytics } = useQuery({
    queryKey: ['/api/maintenance-dashboard-analytics', selectedProperty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('propertyId', selectedProperty.toString());
      
      return apiRequest('GET', `/api/maintenance-dashboard-analytics?${params.toString()}`);
    }
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => apiRequest('GET', '/api/properties')
  });

  // Create maintenance log mutation
  const createLogMutation = useMutation({
    mutationFn: (logData: any) => apiRequest('POST', '/api/maintenance-logs', logData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Maintenance log created successfully",
      });
      setIsCreateLogOpen(false);
      setNewLogForm({
        propertyId: "",
        taskTitle: "",
        repairDate: "",
        department: "",
        itemArea: "",
        issueDescription: "",
        actionTaken: "",
        technicianName: "",
        cost: "",
        priority: "normal",
        hasWarranty: false,
        warrantyDuration: "",
        warrantyExpirationDate: "",
        warrantyContactInfo: "",
        isRecurringService: false,
        serviceCycleMonths: "",
        nextServiceDate: "",
        notes: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-dashboard-analytics'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create maintenance log",
        variant: "destructive",
      });
    }
  });

  // Acknowledge warranty alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest('PUT', `/api/warranty-alerts/${alertId}/acknowledge`, {}),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Warranty alert acknowledged",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/warranty-alerts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge warranty alert",
        variant: "destructive",
      });
    }
  });

  // Review AI suggestion mutation
  const reviewAiSuggestionMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest('PUT', `/api/ai-service-predictions/${id}/review`, { suggestionStatus: status }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI suggestion reviewed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-service-predictions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to review AI suggestion",
        variant: "destructive",
      });
    }
  });

  const handleCreateLog = () => {
    const logData = {
      ...newLogForm,
      propertyId: parseInt(newLogForm.propertyId),
      cost: parseFloat(newLogForm.cost) || 0,
      warrantyDuration: newLogForm.warrantyDuration ? parseInt(newLogForm.warrantyDuration) : null,
      serviceCycleMonths: newLogForm.serviceCycleMonths ? parseInt(newLogForm.serviceCycleMonths) : null,
      linkedImages: [],
      currency: "THB"
    };

    createLogMutation.mutate(logData);
  };

  const handleAcknowledgeAlert = (alertId: number) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  const handleReviewAiSuggestion = (id: number, status: string) => {
    reviewAiSuggestionMutation.mutate({ id, status });
  };

  const formatCurrency = (amount: string, currency: string = 'THB') => {
    const value = parseFloat(amount);
    return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const timeDiff = expDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">🛠️ Maintenance Log, Warranty Tracker & AI Repair Cycle Alerts</h2>
          <p className="text-muted-foreground">
            Track maintenance jobs, warranties, and get AI-powered service cycle predictions
          </p>
        </div>
        <Dialog open={isCreateLogOpen} onOpenChange={setIsCreateLogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Wrench className="mr-2 h-4 w-4" />
              Create Maintenance Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Maintenance Log</DialogTitle>
              <DialogDescription>
                Log a maintenance job with warranty tracking and AI cycle predictions
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select value={newLogForm.propertyId} onValueChange={(value) => 
                  setNewLogForm(prev => ({ ...prev, propertyId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={newLogForm.taskTitle}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, taskTitle: e.target.value }))}
                  placeholder="e.g., Pool pump repair"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repairDate">Repair Date</Label>
                <Input
                  id="repairDate"
                  type="date"
                  value={newLogForm.repairDate}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, repairDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={newLogForm.department} onValueChange={(value) => 
                  setNewLogForm(prev => ({ ...prev, department: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                    <SelectItem value="pool">💧 Pool</SelectItem>
                    <SelectItem value="garden">🌸 Garden</SelectItem>
                    <SelectItem value="ac">🌀 AC/HVAC</SelectItem>
                    <SelectItem value="pest">🐛 Pest Control</SelectItem>
                    <SelectItem value="electrical">💡 Electrical</SelectItem>
                    <SelectItem value="plumbing">🚿 Plumbing</SelectItem>
                    <SelectItem value="landscaping">✂️ Landscaping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemArea">Item/Area Repaired</Label>
                <Input
                  id="itemArea"
                  value={newLogForm.itemArea}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, itemArea: e.target.value }))}
                  placeholder="e.g., Pool motor, AC unit bedroom 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicianName">Technician Name</Label>
                <Input
                  id="technicianName"
                  value={newLogForm.technicianName}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, technicianName: e.target.value }))}
                  placeholder="e.g., John Smith, ABC Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost (THB)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newLogForm.cost}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newLogForm.priority} onValueChange={(value) => 
                  setNewLogForm(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="issueDescription">Issue Description</Label>
                <Textarea
                  id="issueDescription"
                  value={newLogForm.issueDescription}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, issueDescription: e.target.value }))}
                  placeholder="Describe the issue that needed repair..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Textarea
                  id="actionTaken"
                  value={newLogForm.actionTaken}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                  placeholder="Describe what was done to fix the issue..."
                  rows={3}
                />
              </div>

              {/* Warranty Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasWarranty"
                    checked={newLogForm.hasWarranty}
                    onCheckedChange={(checked) => 
                      setNewLogForm(prev => ({ ...prev, hasWarranty: checked as boolean }))
                    }
                  />
                  <Label htmlFor="hasWarranty" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    This repair/item has warranty
                  </Label>
                </div>

                {newLogForm.hasWarranty && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="warrantyDuration">Warranty Duration (months)</Label>
                      <Input
                        id="warrantyDuration"
                        type="number"
                        value={newLogForm.warrantyDuration}
                        onChange={(e) => setNewLogForm(prev => ({ ...prev, warrantyDuration: e.target.value }))}
                        placeholder="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warrantyExpirationDate">Warranty Expiration Date</Label>
                      <Input
                        id="warrantyExpirationDate"
                        type="date"
                        value={newLogForm.warrantyExpirationDate}
                        onChange={(e) => setNewLogForm(prev => ({ ...prev, warrantyExpirationDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warrantyContactInfo">Warranty Contact Info</Label>
                      <Input
                        id="warrantyContactInfo"
                        value={newLogForm.warrantyContactInfo}
                        onChange={(e) => setNewLogForm(prev => ({ ...prev, warrantyContactInfo: e.target.value }))}
                        placeholder="Phone/Email for warranty claims"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* AI Service Cycle Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurringService"
                    checked={newLogForm.isRecurringService}
                    onCheckedChange={(checked) => 
                      setNewLogForm(prev => ({ ...prev, isRecurringService: checked as boolean }))
                    }
                  />
                  <Label htmlFor="isRecurringService" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    This is a recurring service (AI will learn patterns)
                  </Label>
                </div>

                {newLogForm.isRecurringService && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="serviceCycleMonths">Service Cycle (months)</Label>
                      <Input
                        id="serviceCycleMonths"
                        type="number"
                        value={newLogForm.serviceCycleMonths}
                        onChange={(e) => setNewLogForm(prev => ({ ...prev, serviceCycleMonths: e.target.value }))}
                        placeholder="4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextServiceDate">Next Service Date</Label>
                      <Input
                        id="nextServiceDate"
                        type="date"
                        value={newLogForm.nextServiceDate}
                        onChange={(e) => setNewLogForm(prev => ({ ...prev, nextServiceDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newLogForm.notes}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this maintenance job..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateLogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateLog} 
                disabled={createLogMutation.isPending}
              >
                {createLogMutation.isPending ? "Creating..." : "Create Log"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedProperty?.toString() || ""} onValueChange={(value) => 
          setSelectedProperty(value ? parseInt(value) : undefined)
        }>
          <SelectTrigger className="w-48">
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

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
            <SelectItem value="pool">💧 Pool</SelectItem>
            <SelectItem value="garden">🌸 Garden</SelectItem>
            <SelectItem value="ac">🌀 AC/HVAC</SelectItem>
            <SelectItem value="pest">🐛 Pest Control</SelectItem>
            <SelectItem value="electrical">💡 Electrical</SelectItem>
            <SelectItem value="plumbing">🚿 Plumbing</SelectItem>
            <SelectItem value="landscaping">✂️ Landscaping</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="logs">🔧 Maintenance Logs</TabsTrigger>
          <TabsTrigger value="warranty">🛡️ Warranty Tracker</TabsTrigger>
          <TabsTrigger value="ai-predictions">🧠 AI Predictions</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Dashboard Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Maintenance Logs</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.totalMaintenanceLogs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time maintenance records
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Warranty Alerts</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.activeWarrantyAlerts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending AI Suggestions</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.pendingAiSuggestions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Service cycle predictions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboardAnalytics?.thisMonthCost?.toString() || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total maintenance costs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{dashboardAnalytics?.activeJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  In progress & scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardAnalytics?.completedJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Recently finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Jobs</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardAnalytics?.urgentJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring immediate attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Maintenance Logs</CardTitle>
              <CardDescription>Latest maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardAnalytics?.recentLogs?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardAnalytics.recentLogs.map((log: MaintenanceLog) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getDepartmentIcon(log.department)}
                          <span className="font-medium">{log.taskTitle}</span>
                        </div>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(log.priority)}>
                          {log.priority}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(log.cost, log.currency)}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(log.repairDate)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent maintenance logs</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid gap-4">
            {isLogsLoading ? (
              <div className="text-center py-8">Loading maintenance logs...</div>
            ) : maintenanceLogs.length > 0 ? (
              maintenanceLogs.map((log: MaintenanceLog) => (
                <Card key={log.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getDepartmentIcon(log.department)}
                          <CardTitle className="text-lg">{log.taskTitle}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(log.priority)}>
                          {log.priority}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(log.cost, log.currency)}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(log.repairDate)}</div>
                      </div>
                    </div>
                    <CardDescription>
                      {log.itemArea} • {log.technicianName || 'Internal Staff'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Issue Description</h4>
                          <p className="text-sm text-muted-foreground">{log.issueDescription}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Action Taken</h4>
                          <p className="text-sm text-muted-foreground">{log.actionTaken}</p>
                        </div>
                        {log.notes && (
                          <div>
                            <h4 className="font-medium mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{log.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {log.hasWarranty && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Shield className="h-4 w-4 text-green-500" />
                              <h4 className="font-medium">Warranty Information</h4>
                            </div>
                            <div className="text-sm space-y-1">
                              {log.warrantyDuration && (
                                <p>Duration: {log.warrantyDuration} months</p>
                              )}
                              {log.warrantyExpirationDate && (
                                <p>Expires: {formatDate(log.warrantyExpirationDate)}</p>
                              )}
                              {log.warrantyContactInfo && (
                                <p>Contact: {log.warrantyContactInfo}</p>
                              )}
                              <Badge className={
                                log.warrantyClaimStatus === 'none' ? 'bg-gray-100 text-gray-800' :
                                log.warrantyClaimStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                log.warrantyClaimStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {log.warrantyClaimStatus}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {log.isRecurringService && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Brain className="h-4 w-4 text-blue-500" />
                              <h4 className="font-medium">Recurring Service</h4>
                            </div>
                            <div className="text-sm space-y-1">
                              {log.serviceCycleMonths && (
                                <p>Cycle: Every {log.serviceCycleMonths} months</p>
                              )}
                              {log.nextServiceDate && (
                                <p>Next Service: {formatDate(log.nextServiceDate)}</p>
                              )}
                              {log.lastServiceDate && (
                                <p>Last Service: {formatDate(log.lastServiceDate)}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No maintenance logs found</p>
                  <p className="text-sm text-muted-foreground">Create your first maintenance log to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <div className="grid gap-4">
            {isAlertsLoading ? (
              <div className="text-center py-8">Loading warranty alerts...</div>
            ) : warrantyAlerts.length > 0 ? (
              warrantyAlerts.map((alert: WarrantyAlert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Shield className="h-5 w-5 text-orange-500" />
                        <CardTitle className="text-lg">Warranty Alert</CardTitle>
                        <Badge className={
                          alert.alertType === 'warranty_expiring' ? 'bg-yellow-100 text-yellow-800' :
                          alert.alertType === 'warranty_expired' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {alert.alertType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.daysUntilExpiration && (
                          <span className="text-sm font-medium">
                            {alert.daysUntilExpiration} days left
                          </span>
                        )}
                        {!alert.acknowledgedBy && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            disabled={acknowledgeAlertMutation.isPending}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{alert.alertMessage}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Scheduled For:</span> {formatDate(alert.scheduledFor)}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(alert.createdAt)}
                      </div>
                      {alert.acknowledgedBy && (
                        <>
                          <div>
                            <span className="font-medium">Acknowledged By:</span> {alert.acknowledgedBy}
                          </div>
                          <div>
                            <span className="font-medium">Acknowledged At:</span> {alert.acknowledgedAt ? formatDate(alert.acknowledgedAt) : 'N/A'}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active warranty alerts</p>
                  <p className="text-sm text-muted-foreground">All warranties are up to date</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-predictions" className="space-y-4">
          <div className="grid gap-4">
            {isPredictionsLoading ? (
              <div className="text-center py-8">Loading AI predictions...</div>
            ) : aiPredictions.length > 0 ? (
              aiPredictions.map((prediction: AiServicePrediction) => (
                <Card key={prediction.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <div>
                          <CardTitle className="text-lg">
                            {prediction.itemArea} - {prediction.department}
                          </CardTitle>
                          <CardDescription>
                            Based on {prediction.basedOnHistoricalCount} historical records
                          </CardDescription>
                        </div>
                        <Badge className={
                          prediction.suggestionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          prediction.suggestionStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                          prediction.suggestionStatus === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {prediction.suggestionStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {prediction.confidenceScore && (
                          <span className="text-sm font-medium">
                            {(parseFloat(prediction.confidenceScore) * 100).toFixed(0)}% confidence
                          </span>
                        )}
                        {prediction.suggestionStatus === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReviewAiSuggestion(prediction.id, 'dismissed')}
                              disabled={reviewAiSuggestionMutation.isPending}
                            >
                              Dismiss
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleReviewAiSuggestion(prediction.id, 'accepted')}
                              disabled={reviewAiSuggestionMutation.isPending}
                            >
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Prediction Details</h4>
                        <div className="text-sm space-y-1">
                          {prediction.averageCycleMonths && (
                            <p>Average Cycle: {parseFloat(prediction.averageCycleMonths).toFixed(1)} months</p>
                          )}
                          {prediction.predictedNextServiceDate && (
                            <p>Predicted Next Service: {formatDate(prediction.predictedNextServiceDate)}</p>
                          )}
                          <p>Suggested By: {prediction.suggestedBy}</p>
                        </div>
                      </div>
                      {prediction.reviewedBy && (
                        <div>
                          <h4 className="font-medium mb-2">Review Information</h4>
                          <div className="text-sm space-y-1">
                            <p>Reviewed By: {prediction.reviewedBy}</p>
                            {prediction.reviewedAt && (
                              <p>Reviewed At: {formatDate(prediction.reviewedAt)}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No AI predictions available</p>
                  <p className="text-sm text-muted-foreground">AI will learn from maintenance patterns to suggest service cycles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Department Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Top Department Costs</CardTitle>
                <CardDescription>Breakdown by maintenance category</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardAnalytics?.topDepartmentCosts?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardAnalytics.topDepartmentCosts.map((dept: any) => (
                      <div key={dept.department} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getDepartmentIcon(dept.department)}
                          <span className="capitalize">{dept.department}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(dept.cost.toString())}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No cost data available</p>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Job Duration</span>
                    <span className="font-medium">{dashboardAnalytics?.averageJobDuration || 0} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Jobs This Month</span>
                    <span className="font-medium">{dashboardAnalytics?.totalMaintenanceLogs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Warranties</span>
                    <span className="font-medium">{dashboardAnalytics?.activeWarrantyAlerts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI Suggestions Pending</span>
                    <span className="font-medium">{dashboardAnalytics?.pendingAiSuggestions || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}