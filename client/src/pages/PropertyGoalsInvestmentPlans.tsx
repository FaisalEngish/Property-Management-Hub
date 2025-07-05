import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import React from "react";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Building, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  FileText,
  BarChart3,
  Filter,
  Download
} from "lucide-react";

interface PropertyGoal {
  id: number;
  organizationId: string;
  propertyId: number;
  propertyName?: string;
  goalTitle: string;
  goalDescription: string | null;
  upgradeType: string;
  estimatedCost: string;
  currency: string;
  priority: string;
  triggerType: string;
  targetDate: string | null;
  revenueTarget: string | null;
  occupancyTarget: string | null;
  occupancyDuration: number | null;
  customTrigger: string | null;
  status: string;
  completionDate: string | null;
  actualCost: string | null;
  proposedBy: string;
  approvedBy: string | null;
  approvedDate: string | null;
  requiresApproval: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GoalAnalytics {
  summary: {
    totalGoals: number;
    notStartedGoals: number;
    inProgressGoals: number;
    completedGoals: number;
    cancelledGoals: number;
    completionRate: number;
    totalEstimatedCost: number;
    completedActualCost: number;
    costVariance: number;
  };
  upgradeTypeBreakdown: Array<{
    upgradeType: string;
    totalGoals: number;
    completedGoals: number;
    totalEstimatedCost: number;
    totalActualCost: number;
  }>;
  triggerTypeBreakdown: Array<{
    triggerType: string;
    totalGoals: number;
    completedGoals: number;
    averageCompletionDays: number;
  }>;
}

// Priority colors
const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// Status colors
const statusColors = {
  not_started: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// Utility functions
const formatCurrency = (amount: number, currency: string = "THB") => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Upgrade type icons
const upgradeTypeIcons = {
  Furniture: Building,
  Electronics: TrendingUp,
  Maintenance: Target,
  Decor: Eye,
  Other: FileText,
};

export default function PropertyGoalsInvestmentPlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("goals");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    upgradeType: "all",
    triggerType: "all",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PropertyGoal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch property goals
  const { data: goalsResponse = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/property-goals", filters],
  });

  // Fetch analytics
  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/property-goals/analytics"],
  });

  const goals = Array.isArray(goalsResponse) ? goalsResponse : [];
  const analytics = analyticsResponse || { 
    summary: {
      totalGoals: 0,
      notStartedGoals: 0,
      inProgressGoals: 0,
      completedGoals: 0,
      cancelledGoals: 0,
      completionRate: 0,
      totalEstimatedCost: 0,
      completedActualCost: 0,
      costVariance: 0
    }, 
    upgradeTypeBreakdown: [], 
    triggerTypeBreakdown: [] 
  };

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/property-goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-goals/analytics"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Property goal created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property goal",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/property-goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-goals/analytics"] });
      toast({
        title: "Success",
        description: "Property goal updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property goal",
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/property-goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-goals/analytics"] });
      toast({
        title: "Success",
        description: "Property goal deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property goal",
        variant: "destructive",
      });
    },
  });

  const handleCreateGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    createGoalMutation.mutate(data);
  };

  const handleStatusUpdate = (goalId: number, status: string) => {
    updateGoalMutation.mutate({
      id: goalId,
      data: { status },
    });
  };

  const getTriggerDisplay = (goal: PropertyGoal) => {
    switch (goal.triggerType) {
      case "revenue":
        return `Revenue: ${formatCurrency(parseFloat(goal.revenueTarget || "0"), goal.currency)}`;
      case "occupancy":
        return `Occupancy: ${goal.occupancyTarget}% for ${goal.occupancyDuration} months`;
      case "date":
        return `Date: ${goal.targetDate ? formatDate(goal.targetDate) : "Not set"}`;
      case "custom":
        return `Custom: ${goal.customTrigger || "Not specified"}`;
      default:
        return "No trigger set";
    }
  };

  const getProgressPercentage = (goal: PropertyGoal) => {
    switch (goal.status) {
      case "not_started":
        return 0;
      case "in_progress":
        return 50;
      case "completed":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const filteredGoals = goals.filter((goal: PropertyGoal) => {
    return (
      (filters.status === "all" || goal.status === filters.status) &&
      (filters.priority === "all" || goal.priority === filters.priority) &&
      (filters.upgradeType === "all" || goal.upgradeType === filters.upgradeType) &&
      (filters.triggerType === "all" || goal.triggerType === filters.triggerType)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Property Goals & Investment Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Strategic property improvement planning with revenue and occupancy-based triggers
          </p>
          
          {/* Warning Banner */}
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                All financial calculations use net payout amounts only. OTA commissions are not part of internal calculations.
              </span>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Planning
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.upgradeType} onValueChange={(value) => setFilters(prev => ({ ...prev, upgradeType: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Decor">Decor</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ status: "all", priority: "all", upgradeType: "all", triggerType: "all" })}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Property Goal</DialogTitle>
                    <DialogDescription>
                      Define a new property improvement goal with trigger conditions
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Property</label>
                        <Select name="propertyId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Villa Samui Breeze</SelectItem>
                            <SelectItem value="2">Villa Tropical Paradise</SelectItem>
                            <SelectItem value="3">Villa Aruna</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select name="priority" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Goal Title</label>
                      <Input name="goalTitle" placeholder="e.g., Outdoor Furniture Upgrade" required />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea name="goalDescription" placeholder="Detailed description of the improvement..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Upgrade Type</label>
                        <Select name="upgradeType" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Decor">Decor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Estimated Cost (THB)</label>
                        <Input name="estimatedCost" type="number" placeholder="0" required />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Trigger Type</label>
                      <Select name="triggerType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue Target</SelectItem>
                          <SelectItem value="occupancy">Occupancy Rate</SelectItem>
                          <SelectItem value="date">Target Date</SelectItem>
                          <SelectItem value="custom">Custom Trigger</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea name="notes" placeholder="Additional notes or conditions..." />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createGoalMutation.isPending}>
                        {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Goals Grid */}
            {goalsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGoals.map((goal: PropertyGoal) => {
                  const IconComponent = upgradeTypeIcons[goal.upgradeType as keyof typeof upgradeTypeIcons] || FileText;
                  return (
                    <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-lg">{goal.goalTitle}</CardTitle>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedGoal(goal);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building className="h-4 w-4" />
                          {goal.propertyName}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${priorityColors[goal.priority as keyof typeof priorityColors]}`}>
                            {goal.priority}
                          </Badge>
                          <Badge className={`${statusColors[goal.status as keyof typeof statusColors]}`}>
                            {goal.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {goal.goalDescription && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {goal.goalDescription}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">{getProgressPercentage(goal)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(goal)} className="h-2" />
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                            <span className="font-medium">
                              {formatCurrency(parseFloat(goal.estimatedCost), goal.currency)}
                            </span>
                          </div>
                          <div className="flex items-start justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Trigger:</span>
                            <span className="font-medium text-right text-xs">
                              {getTriggerDisplay(goal)}
                            </span>
                          </div>
                        </div>

                        {goal.status === "not_started" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleStatusUpdate(goal.id, "in_progress")}
                          >
                            Start Goal
                          </Button>
                        )}

                        {goal.status === "in_progress" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleStatusUpdate(goal.id, "completed")}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredGoals.length === 0 && !goalsLoading && (
              <Card className="text-center py-12">
                <CardContent>
                  <Target className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No property goals found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first property improvement goal to get started.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : analytics ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary.totalGoals}</div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.summary.completedGoals} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary.completionRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.summary.inProgressGoals} in progress
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(analytics.summary.totalEstimatedCost, "THB")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Estimated total cost
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cost Variance</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(analytics.summary.costVariance, "THB")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.summary.costVariance >= 0 ? "Over budget" : "Under budget"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Breakdown Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Goals by Upgrade Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.upgradeTypeBreakdown.map((item) => (
                          <div key={item.upgradeType} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.upgradeType}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.completedGoals}/{item.totalGoals} completed
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(item.totalEstimatedCost, "THB")}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Est. cost
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Goals by Trigger Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.triggerTypeBreakdown.map((item) => (
                          <div key={item.triggerType} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium capitalize">{item.triggerType}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.completedGoals}/{item.totalGoals} completed
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {item.averageCompletionDays > 0 ? `${item.averageCompletionDays} days` : "N/A"}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Avg. completion
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Planning</CardTitle>
                <CardDescription>
                  Plan future property improvements based on performance triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Strategic Planning Tools
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Advanced planning features will be available in future updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Reports</CardTitle>
                <CardDescription>
                  Generate detailed reports on property investment performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Investment Reports
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Comprehensive reporting features coming soon.
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Goal Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedGoal && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {React.createElement(upgradeTypeIcons[selectedGoal.upgradeType as keyof typeof upgradeTypeIcons] || FileText, { className: "h-5 w-5" })}
                    {selectedGoal.goalTitle}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedGoal.propertyName} • Created {formatDate(selectedGoal.createdAt)}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge className={`${priorityColors[selectedGoal.priority as keyof typeof priorityColors]}`}>
                      {selectedGoal.priority}
                    </Badge>
                    <Badge className={`${statusColors[selectedGoal.status as keyof typeof statusColors]}`}>
                      {selectedGoal.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {selectedGoal.goalDescription && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedGoal.goalDescription}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Financial Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Estimated Cost:</span>
                          <span className="font-medium">
                            {formatCurrency(parseFloat(selectedGoal.estimatedCost), selectedGoal.currency)}
                          </span>
                        </div>
                        {selectedGoal.actualCost && (
                          <div className="flex justify-between">
                            <span>Actual Cost:</span>
                            <span className="font-medium">
                              {formatCurrency(parseFloat(selectedGoal.actualCost), selectedGoal.currency)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Trigger Condition</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getTriggerDisplay(selectedGoal)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Progress</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion</span>
                        <span className="font-medium">{getProgressPercentage(selectedGoal)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(selectedGoal)} className="h-2" />
                    </div>
                  </div>

                  {selectedGoal.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedGoal.notes}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Approval Status</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Proposed by:</span>
                        <span>{selectedGoal.proposedBy}</span>
                      </div>
                      {selectedGoal.approvedBy && (
                        <>
                          <div className="flex justify-between">
                            <span>Approved by:</span>
                            <span>{selectedGoal.approvedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Approval date:</span>
                            <span>{selectedGoal.approvedDate ? formatDate(selectedGoal.approvedDate) : "Not approved"}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}