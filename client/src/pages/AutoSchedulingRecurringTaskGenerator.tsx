import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  Settings, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart,
  History,
  Bell,
  Filter,
  Search,
  Users,
  MapPin,
  Wrench,
  Droplets,
  TreePine,
  Sparkles,
  Info
} from "lucide-react";

// Department icons mapping
const departmentIcons: Record<string, any> = {
  'Cleaning': Sparkles,
  'Pool': Droplets, 
  'Garden': TreePine,
  'Maintenance': Wrench,
  'General': Settings
};

// Zod schemas for forms
const taskSchedulingRuleSchema = z.object({
  ruleName: z.string().min(1, "Rule name is required"),
  taskTitle: z.string().min(1, "Task title is required"), 
  taskDescription: z.string().min(1, "Task description is required"),
  department: z.string().min(1, "Department is required"),
  assignedTo: z.string().min(1, "Assigned staff is required"),
  propertyId: z.number().min(1, "Property is required"),
  triggerType: z.literal("recurring"),
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
  priority: z.enum(["low", "medium", "high"]),
  estimatedDuration: z.number().min(1, "Duration is required"),
  requirements: z.array(z.string()).optional(),
  recurringSettings: z.object({
    time: z.string().min(1, "Time is required"),
    dayOfWeek: z.number().optional(),
    dayOfMonth: z.number().optional()
  }),
  isActive: z.boolean().default(true)
});

type TaskSchedulingRuleForm = z.infer<typeof taskSchedulingRuleSchema>;

const taskGenerationSchema = z.object({
  targetDate: z.string().min(1, "Target date is required")
});

type TaskGenerationForm = z.infer<typeof taskGenerationSchema>;

export default function AutoSchedulingRecurringTaskGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("rules");
  const [selectedProperty, setSelectedProperty] = useState<number | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);

  // Check if user has admin/PM permissions
  const canManageRules = user?.role === 'admin' || user?.role === 'portfolio-manager';

  // Fetch data
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/task-scheduling-rules', selectedProperty === "all" ? undefined : selectedProperty],
    enabled: true
  });

  const { data: recurringTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/recurring-tasks', {
      propertyId: selectedProperty === "all" ? undefined : selectedProperty,
      department: selectedDepartment === "all" ? undefined : selectedDepartment,
      status: selectedStatus === "all" ? undefined : selectedStatus
    }],
    enabled: true
  });

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/recurring-task-analytics', {
      propertyId: selectedProperty === "all" ? undefined : selectedProperty,
      department: selectedDepartment === "all" ? undefined : selectedDepartment,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    }],
    enabled: true
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/task-scheduling-alerts', {
      propertyId: selectedProperty === "all" ? undefined : selectedProperty,
      status: "active"
    }],
    enabled: true
  });

  const { data: generationLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/task-generation-logs'],
    enabled: true
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    enabled: true
  });

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: (data: TaskSchedulingRuleForm) => apiRequest("POST", "/api/task-scheduling-rules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-scheduling-rules'] });
      setIsRuleDialogOpen(false);
      setEditingRule(null);
      toast({ title: "Success", description: "Task scheduling rule created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create rule", variant: "destructive" });
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskSchedulingRuleForm> }) => 
      apiRequest("PUT", `/api/task-scheduling-rules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-scheduling-rules'] });
      setIsRuleDialogOpen(false);
      setEditingRule(null);
      toast({ title: "Success", description: "Task scheduling rule updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update rule", variant: "destructive" });
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/task-scheduling-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-scheduling-rules'] });
      toast({ title: "Success", description: "Task scheduling rule deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete rule", variant: "destructive" });
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      apiRequest("PATCH", `/api/task-scheduling-rules/${id}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-scheduling-rules'] });
      toast({ title: "Success", description: "Rule status updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update rule status", variant: "destructive" });
    }
  });

  const generateTasksMutation = useMutation({
    mutationFn: (data: TaskGenerationForm) => apiRequest("POST", "/api/generate-recurring-tasks", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/task-generation-logs'] });
      setIsGenerationDialogOpen(false);
      toast({ 
        title: "Success", 
        description: `Generated ${data.tasksGenerated} tasks from ${data.rulesProcessed} rules` 
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to generate tasks", variant: "destructive" });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("POST", `/api/recurring-tasks/${id}/complete`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-tasks'] });
      toast({ title: "Success", description: "Task completed successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to complete task", variant: "destructive" });
    }
  });

  const skipTaskMutation = useMutation({
    mutationFn: ({ id, skipReason }: { id: number; skipReason: string }) => 
      apiRequest("POST", `/api/recurring-tasks/${id}/skip`, { skipReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-tasks'] });
      toast({ title: "Success", description: "Task skipped successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to skip task", variant: "destructive" });
    }
  });

  // Form setup
  const ruleForm = useForm<TaskSchedulingRuleForm>({
    resolver: zodResolver(taskSchedulingRuleSchema),
    defaultValues: {
      triggerType: "recurring",
      frequency: "daily",
      priority: "medium",
      estimatedDuration: 60,
      requirements: [],
      recurringSettings: {
        time: "09:00"
      },
      isActive: true
    }
  });

  const generationForm = useForm<TaskGenerationForm>({
    resolver: zodResolver(taskGenerationSchema),
    defaultValues: {
      targetDate: new Date().toISOString().split('T')[0]
    }
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingRule) {
      ruleForm.reset({
        ...editingRule,
        requirements: editingRule.requirements || []
      });
      setIsRuleDialogOpen(true);
    }
  }, [editingRule, ruleForm]);

  // Filter functions
  const filteredRules = rules.filter((rule: any) => {
    const matchesProperty = selectedProperty === "all" || rule.propertyId === selectedProperty;
    const matchesDepartment = selectedDepartment === "all" || rule.department === selectedDepartment;
    const matchesSearch = searchTerm === "" || 
      rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.taskTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesDepartment && matchesSearch;
  });

  const filteredTasks = recurringTasks.filter((task: any) => {
    const matchesSearch = searchTerm === "" || 
      task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Submit handlers
  const handleRuleSubmit = (data: TaskSchedulingRuleForm) => {
    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, data });
    } else {
      createRuleMutation.mutate(data);
    }
  };

  const handleGenerateTasksSubmit = (data: TaskGenerationForm) => {
    generateTasksMutation.mutate(data);
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      'pending': { variant: 'secondary', label: 'Pending' },
      'in_progress': { variant: 'default', label: 'In Progress' },
      'completed': { variant: 'secondary', label: 'Completed' },
      'skipped': { variant: 'outline', label: 'Skipped' },
      'overdue': { variant: 'destructive', label: 'Overdue' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { variant: any; label: string }> = {
      'low': { variant: 'outline', label: 'Low' },
      'medium': { variant: 'secondary', label: 'Medium' },
      'high': { variant: 'destructive', label: 'High' }
    };
    
    const config = priorityConfig[priority] || { variant: 'secondary', label: priority };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDepartmentIcon = (department: string) => {
    const IconComponent = departmentIcons[department] || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!canManageRules && activeTab === "rules") {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Auto-Scheduling & Recurring Tasks</h1>
          <p className="text-muted-foreground">Staff can view assigned tasks only</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Only administrators and portfolio managers can manage scheduling rules. 
              Staff can view their assigned tasks in the Tasks tab.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Auto-Scheduling & Recurring Tasks</h1>
          <p className="text-muted-foreground">
            Automated task generation based on preset rules and schedules
          </p>
        </div>
        
        {canManageRules && (
          <div className="flex gap-2">
            <Dialog open={isGenerationDialogOpen} onOpenChange={setIsGenerationDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Tasks
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Recurring Tasks</DialogTitle>
                  <DialogDescription>
                    Generate tasks for a specific date based on active scheduling rules
                  </DialogDescription>
                </DialogHeader>
                <Form {...generationForm}>
                  <form onSubmit={generationForm.handleSubmit(handleGenerateTasksSubmit)} className="space-y-4">
                    <FormField
                      control={generationForm.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Date for which to generate tasks
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={generateTasksMutation.isPending}
                        className="w-full"
                      >
                        {generateTasksMutation.isPending ? "Generating..." : "Generate Tasks"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? "Edit Scheduling Rule" : "Create Scheduling Rule"}
                  </DialogTitle>
                  <DialogDescription>
                    Define automated task generation rules for recurring maintenance and operations
                  </DialogDescription>
                </DialogHeader>
                <Form {...ruleForm}>
                  <form onSubmit={ruleForm.handleSubmit(handleRuleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={ruleForm.control}
                        name="ruleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rule Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Weekly Pool Cleaning" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ruleForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value?.toString()}
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
                    </div>

                    <FormField
                      control={ruleForm.control}
                      name="taskTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Pool Maintenance & Chemical Balance" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ruleForm.control}
                      name="taskDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of the task to be performed..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={ruleForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cleaning">🧹 Cleaning</SelectItem>
                                <SelectItem value="Pool">🏊 Pool</SelectItem>
                                <SelectItem value="Garden">🏝 Garden</SelectItem>
                                <SelectItem value="Maintenance">🔧 Maintenance</SelectItem>
                                <SelectItem value="General">🗂 General</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={ruleForm.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                            <FormControl>
                              <Input placeholder="Staff member ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={ruleForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={ruleForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={ruleForm.control}
                        name="estimatedDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={ruleForm.control}
                        name="recurringSettings.time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schedule Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {ruleForm.watch("frequency") === "weekly" && (
                        <FormField
                          control={ruleForm.control}
                          name="recurringSettings.dayOfWeek"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Day of Week</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">Sunday</SelectItem>
                                  <SelectItem value="1">Monday</SelectItem>
                                  <SelectItem value="2">Tuesday</SelectItem>
                                  <SelectItem value="3">Wednesday</SelectItem>
                                  <SelectItem value="4">Thursday</SelectItem>
                                  <SelectItem value="5">Friday</SelectItem>
                                  <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {ruleForm.watch("frequency") === "monthly" && (
                        <FormField
                          control={ruleForm.control}
                          name="recurringSettings.dayOfMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Day of Month</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="31" 
                                  placeholder="15"
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
                      control={ruleForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Rule</FormLabel>
                            <FormDescription>
                              Enable this rule to generate tasks automatically
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
                        className="w-full"
                      >
                        {createRuleMutation.isPending || updateRuleMutation.isPending 
                          ? "Saving..." 
                          : editingRule ? "Update Rule" : "Create Rule"
                        }
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="property-filter">Property</Label>
              <Select value={selectedProperty.toString()} onValueChange={(value) => setSelectedProperty(value === "all" ? "all" : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
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

            <div>
              <Label htmlFor="department-filter">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Cleaning">🧹 Cleaning</SelectItem>
                  <SelectItem value="Pool">🏊 Pool</SelectItem>
                  <SelectItem value="Garden">🏝 Garden</SelectItem>
                  <SelectItem value="Maintenance">🔧 Maintenance</SelectItem>
                  <SelectItem value="General">🗂 General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search rules or tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {canManageRules && (
            <TabsTrigger value="rules">
              <Settings className="h-4 w-4 mr-2" />
              Rules ({filteredRules.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="tasks">
            <CheckCircle className="h-4 w-4 mr-2" />
            Tasks ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alerts ({alerts.filter((a: any) => a.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            <History className="h-4 w-4 mr-2" />
            Generation Logs
          </TabsTrigger>
        </TabsList>

        {/* Scheduling Rules Tab */}
        {canManageRules && (
          <TabsContent value="rules">
            <div className="space-y-4">
              {rulesLoading ? (
                <div className="text-center py-8">Loading rules...</div>
              ) : filteredRules.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Scheduling Rules Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first automated task scheduling rule to get started.
                    </p>
                    <Button onClick={() => setIsRuleDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Rule
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredRules.map((rule: any) => (
                    <Card key={rule.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {getDepartmentIcon(rule.department)}
                            <div>
                              <CardTitle className="text-lg">{rule.ruleName}</CardTitle>
                              <CardDescription>{rule.taskTitle}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(rule.priority)}
                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {canManageRules && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingRule(rule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRuleMutation.mutate({ id: rule.id, isActive: !rule.isActive })}
                                >
                                  {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteRuleMutation.mutate(rule.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Department</Label>
                            <p className="font-medium">{rule.department}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Frequency</Label>
                            <p className="font-medium capitalize">{rule.frequency}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Duration</Label>
                            <p className="font-medium">{formatDuration(rule.estimatedDuration)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Assigned To</Label>
                            <p className="font-medium">{rule.assignedTo}</p>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Task Description</Label>
                          <p className="text-sm">{rule.taskDescription}</p>
                        </div>

                        {rule.requirements && rule.requirements.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-xs text-muted-foreground">Requirements</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rule.requirements.map((req: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div>
                            <Label className="text-xs text-muted-foreground">Schedule</Label>
                            <p className="font-medium">
                              {rule.frequency === 'daily' && `Daily at ${rule.recurringSettings?.time || '09:00'}`}
                              {rule.frequency === 'weekly' && `Weekly on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rule.recurringSettings?.dayOfWeek || 0]} at ${rule.recurringSettings?.time || '09:00'}`}
                              {rule.frequency === 'monthly' && `Monthly on day ${rule.recurringSettings?.dayOfMonth || 1} at ${rule.recurringSettings?.time || '09:00'}`}
                              {rule.frequency === 'custom' && `Custom schedule at ${rule.recurringSettings?.time || '09:00'}`}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Created</Label>
                            <p className="font-medium">
                              {new Date(rule.createdAt).toLocaleDateString()} by {rule.createdBy}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Recurring Tasks Tab */}
        <TabsContent value="tasks">
          <div className="space-y-4">
            {tasksLoading ? (
              <div className="text-center py-8">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recurring Tasks Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Tasks will appear here once generated from scheduling rules.
                  </p>
                  {canManageRules && (
                    <Button onClick={() => setIsGenerationDialogOpen(true)}>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Tasks
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map((task: any) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {getDepartmentIcon(task.department)}
                          <div>
                            <CardTitle className="text-lg">{task.taskTitle}</CardTitle>
                            <CardDescription>
                              Scheduled for {new Date(task.scheduledDate).toLocaleDateString()} at {task.scheduledTime}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Department</Label>
                          <p className="font-medium">{task.department}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Assigned To</Label>
                          <p className="font-medium">{task.assignedTo}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Duration</Label>
                          <p className="font-medium">{formatDuration(task.estimatedDuration)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <p className="font-medium capitalize">{task.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <p className="text-sm">{task.taskDescription}</p>
                      </div>

                      {task.requirements && task.requirements.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-xs text-muted-foreground">Requirements</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.requirements.map((req: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.completionNotes && (
                        <div className="mt-4">
                          <Label className="text-xs text-muted-foreground">Completion Notes</Label>
                          <p className="text-sm">{task.completionNotes}</p>
                        </div>
                      )}

                      {task.evidencePhotos && task.evidencePhotos.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-xs text-muted-foreground">Evidence Photos</Label>
                          <div className="flex gap-2 mt-1">
                            {task.evidencePhotos.map((photo: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                📷 {photo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.status === 'pending' && (user?.role === 'staff' || canManageRules) && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => completeTaskMutation.mutate({ 
                              id: task.id, 
                              data: { completionNotes: "Task completed" } 
                            })}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => skipTaskMutation.mutate({ 
                              id: task.id, 
                              skipReason: "Staff unavailable" 
                            })}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Skip
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="text-center py-8">Loading analytics...</div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Tasks Scheduled</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.reduce((sum: number, dept: any) => sum + dept.totalTasksScheduled, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.length > 0 
                          ? Math.round(analytics.reduce((sum: number, dept: any) => sum + dept.completionRate, 0) / analytics.length)
                          : 0
                        }%
                      </div>
                      <p className="text-xs text-muted-foreground">Average across departments</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.length > 0 
                          ? Math.round(analytics.reduce((sum: number, dept: any) => sum + dept.onTimeCompletionRate, 0) / analytics.length)
                          : 0
                        }%
                      </div>
                      <p className="text-xs text-muted-foreground">Tasks completed on time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.length > 0 
                          ? formatDuration(Math.round(analytics.reduce((sum: number, dept: any) => sum + dept.averageCompletionTime, 0) / analytics.length))
                          : "0m"
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Average across all tasks</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Department Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Department Performance</CardTitle>
                    <CardDescription>Breakdown by department for current month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.map((dept: any) => (
                        <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getDepartmentIcon(dept.department)}
                            <div>
                              <p className="font-medium">{dept.department}</p>
                              <p className="text-sm text-muted-foreground">
                                {dept.totalTasksScheduled} tasks scheduled
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Completion</p>
                                <p className="font-medium">{dept.completionRate}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">On-time</p>
                                <p className="font-medium">{dept.onTimeCompletionRate}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Avg Time</p>
                                <p className="font-medium">{formatDuration(dept.averageCompletionTime)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <div className="space-y-4">
            {alertsLoading ? (
              <div className="text-center py-8">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">
                    System alerts for scheduling issues will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert: any) => (
                  <Card key={alert.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {alert.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                          {alert.severity === 'medium' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          {alert.severity === 'low' && <Info className="h-5 w-5 text-blue-500" />}
                          <div>
                            <CardTitle className="text-lg">{alert.title}</CardTitle>
                            <CardDescription>{alert.message}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            alert.severity === 'high' ? 'destructive' : 
                            alert.severity === 'medium' ? 'default' : 
                            'secondary'
                          }>
                            {alert.severity} priority
                          </Badge>
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Acknowledge alert mutation would go here
                                toast({ title: "Alert acknowledged" });
                              }}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Alert Type</Label>
                          <p className="font-medium capitalize">{alert.alertType.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Created</Label>
                          <p className="font-medium">{new Date(alert.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <p className="font-medium capitalize">{alert.status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Generation Logs Tab */}
        <TabsContent value="logs">
          <div className="space-y-4">
            {logsLoading ? (
              <div className="text-center py-8">Loading logs...</div>
            ) : generationLogs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Generation Logs</h3>
                  <p className="text-muted-foreground">
                    Task generation history will appear here after running automated generation.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {generationLogs.map((log: any) => (
                  <Card key={log.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Task Generation - {new Date(log.targetDate).toLocaleDateString()}
                          </CardTitle>
                          <CardDescription>
                            Generated {log.tasksGenerated} tasks from {log.rulesProcessed} active rules
                          </CardDescription>
                        </div>
                        <Badge variant={log.errors && log.errors.length > 0 ? "destructive" : "secondary"}>
                          {log.errors && log.errors.length > 0 ? "With Errors" : "Success"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Target Date</Label>
                          <p className="font-medium">{new Date(log.targetDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Rules Processed</Label>
                          <p className="font-medium">{log.rulesProcessed}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Tasks Generated</Label>
                          <p className="font-medium">{log.tasksGenerated}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Generated At</Label>
                          <p className="font-medium">{new Date(log.generatedAt).toLocaleString()}</p>
                        </div>
                      </div>

                      {log.generatedTaskIds && log.generatedTaskIds.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-xs text-muted-foreground">Generated Task IDs</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {log.generatedTaskIds.map((taskId: number) => (
                              <Badge key={taskId} variant="outline" className="text-xs">
                                #{taskId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.errors && log.errors.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-xs text-muted-foreground">Errors</Label>
                          <div className="space-y-1 mt-1">
                            {log.errors.map((error: string, index: number) => (
                              <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {error}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}