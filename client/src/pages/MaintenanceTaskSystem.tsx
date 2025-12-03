import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Camera, 
  Wrench, 
  Droplets, 
  TreePine, 
  Sparkles, 
  FileText,
  Brain,
  Archive,
  Download,
  Plus,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  AlertCircle,
  User,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  BookOpen,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  Star,
  Target,
  BarChart3,
  RefreshCw,
  Building,
  History,
  Settings,
  Users,
  Timer,
  Search,
  ChevronDown,
  ExternalLink
} from "lucide-react";

// Enhanced Department Configuration
const DEPARTMENTS = [
  { 
    value: "cleaning", 
    label: "🧹 Cleaning", 
    icon: Sparkles, 
    color: "bg-blue-50 border-blue-200 text-blue-800",
    description: "Housekeeping, sanitization, and cleanliness tasks"
  },
  { 
    value: "maintenance", 
    label: "🔧 Maintenance", 
    icon: Wrench, 
    color: "bg-orange-50 border-orange-200 text-orange-800",
    description: "Repairs, equipment fixes, and system maintenance"
  },
  { 
    value: "pool", 
    label: "🏊 Pool", 
    icon: Droplets, 
    color: "bg-cyan-50 border-cyan-200 text-cyan-800",
    description: "Pool cleaning, chemical balancing, and equipment"
  },
  { 
    value: "garden", 
    label: "🏝 Garden", 
    icon: TreePine, 
    color: "bg-green-50 border-green-200 text-green-800",
    description: "Landscaping, plant care, and outdoor maintenance"
  },
  { 
    value: "general", 
    label: "🗂 General", 
    icon: FileText, 
    color: "bg-gray-50 border-gray-200 text-gray-800",
    description: "Administrative and miscellaneous tasks"
  }
];

// Enhanced Task Types
const TASK_TYPES = [
  { value: "recurring", label: "🔁 Recurring", color: "bg-purple-100 text-purple-800" },
  { value: "ai-suggested", label: "🧠 AI-Suggested", color: "bg-indigo-100 text-indigo-800" },
  { value: "booking-based", label: "📅 Booking-based", color: "bg-yellow-100 text-yellow-800" },
  { value: "manual", label: "✍️ Manual", color: "bg-gray-100 text-gray-800" },
  { value: "emergency", label: "🚨 Emergency", color: "bg-red-100 text-red-800" }
];

// Enhanced Status Configuration
const TASK_STATUS = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Play },
  { value: "pending-review", label: "Pending Review", color: "bg-purple-100 text-purple-800", icon: Eye },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  { value: "reopened", label: "Reopened", color: "bg-orange-100 text-orange-800", icon: RotateCcw },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800", icon: Archive }
];

// Priority levels
const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-600" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-600" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-600" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-600" }
];

interface Task {
  id: number;
  title: string;
  description?: string;
  type: string;
  department: string;
  status: string;
  priority: string;
  propertyId?: number;
  assignedTo?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  evidencePhotos?: string[];
  issuesFound?: string[];
  completionNotes?: string;
  expenses?: TaskExpense[];
  checklist?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  property?: { name: string };
  assignedUser?: { firstName: string; lastName: string };
  createdBy?: { firstName: string; lastName: string };
  estimatedDuration?: number;
  actualDuration?: number;
  isRecurring?: boolean;
  recurringSchedule?: string;
}

interface TaskExpense {
  id: number;
  taskId: number;
  description: string;
  amount: number;
  category: string;
  receiptUrl?: string;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
}

interface TaskChecklist {
  id: number;
  taskType: string;
  department: string;
  checklistName: string;
  checklistItems: ChecklistItem[];
  isDefault: boolean;
  propertyId?: number;
  safetyNotes?: string;
  estimatedTime?: number;
  requiredTools?: string[];
}

interface PropertyGuide {
  id: number;
  propertyId: number;
  guideName: string;
  guideContent: string;
  category: string;
  department?: string;
  attachments?: string[];
  lastUpdated: string;
  createdBy: string;
}

interface AiSuggestion {
  id: number;
  propertyId: number;
  suggestedTaskType: string;
  department: string;
  priority: string;
  reason: string;
  status: string;
  suggestedDate?: string;
  triggerSource: string;
  confidence: number;
  estimatedDuration?: number;
}

export default function MaintenanceTaskSystem() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showTaskDetailDialog, setShowTaskDetailDialog] = useState(false);
  const [showCreateChecklistDialog, setShowCreateChecklistDialog] = useState(false);
  const [showCreateGuideDialog, setShowCreateGuideDialog] = useState(false);
  const [showStartTaskDialog, setShowStartTaskDialog] = useState(false);
  const [showCompleteTaskDialog, setShowCompleteTaskDialog] = useState(false);
  const [showReviewTaskDialog, setShowReviewTaskDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  // Selected items
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AiSuggestion | null>(null);
  
  // Form states
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "manual",
    department: "",
    priority: "medium",
    propertyId: "",
    assignedTo: "",
    dueDate: "",
    isRecurring: false,
    recurringSchedule: "",
    estimatedDuration: ""
  });

  const [newChecklist, setNewChecklist] = useState({
    taskType: "",
    department: "",
    checklistName: "",
    checklistItems: [""],
    isDefault: true,
    propertyId: "",
    safetyNotes: "",
    estimatedTime: "",
    requiredTools: [""]
  });

  const [newGuide, setNewGuide] = useState({
    propertyId: "",
    guideName: "",
    guideContent: "",
    category: "",
    department: "",
    attachments: [""]
  });

  const [completionData, setCompletionData] = useState({
    completionNotes: "",
    evidencePhotos: [""],
    issuesFound: [""],
    actualDuration: ""
  });

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    receiptUrl: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Role-based access control
  const isAdmin = user?.role === 'admin';
  const isPortfolioManager = user?.role === 'portfolio-manager';
  const isStaff = user?.role === 'staff';
  const isOwner = user?.role === 'owner';
  const canManageTasks = isAdmin || isPortfolioManager;
  const canExecuteTasks = isAdmin || isPortfolioManager || isStaff;
  const canCreateTasks = isAdmin || isPortfolioManager || isStaff;

  // Data queries
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks", selectedDepartment, selectedStatus, selectedProperty],
    enabled: !!user,
  });

  const { data: checklists, isLoading: checklistsLoading } = useQuery({
    queryKey: ["/api/task-checklists"],
    enabled: !!user,
  });

  const { data: propertyGuides, isLoading: guidesLoading } = useQuery({
    queryKey: ["/api/property-guides"],
    enabled: !!user,
  });

  const { data: aiSuggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/ai-suggestions"],
    enabled: !!user,
  });

  const { data: archivedTasks, isLoading: archiveLoading } = useQuery({
    queryKey: ["/api/tasks/archived"],
    enabled: !!user && activeTab === "archive",
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && canManageTasks,
  });

  // Mutations
  const createTask = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/tasks", data),
    onSuccess: async () => {
      toast({ title: "Task created successfully" });
      setShowCreateTaskDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      resetNewTask();
      
      // Invalidate achievement cache - backend recalculates on GET request
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/achievements/definitions"] });
      }
    },
    onError: (error) => {
      toast({ title: "Error creating task", description: error.message, variant: "destructive" });
    },
  });

  const startTask = useMutation({
    mutationFn: async (taskId: number) => apiRequest("POST", `/api/tasks/${taskId}/start`),
    onSuccess: () => {
      toast({ title: "Task started successfully" });
      setShowStartTaskDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const completeTask = useMutation({
    mutationFn: async ({ taskId, data }: any) => apiRequest("POST", `/api/tasks/${taskId}/complete`, data),
    onSuccess: async () => {
      toast({ title: "Task completed successfully" });
      setShowCompleteTaskDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      // Invalidate achievement cache - backend recalculates on GET request
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/achievements/definitions"] });
      }
    },
  });

  const acceptAiSuggestion = useMutation({
    mutationFn: async (suggestionId: number) => apiRequest("POST", `/api/ai-suggestions/${suggestionId}/accept`),
    onSuccess: () => {
      toast({ title: "AI suggestion accepted and task created" });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const createChecklist = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/task-checklists", data),
    onSuccess: () => {
      toast({ title: "Checklist created successfully" });
      setShowCreateChecklistDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/task-checklists"] });
      resetNewChecklist();
    },
  });

  const createGuide = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/property-guides", data),
    onSuccess: () => {
      toast({ title: "Property guide created successfully" });
      setShowCreateGuideDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/property-guides"] });
      resetNewGuide();
    },
  });

  const exportTasksPdf = useMutation({
    mutationFn: async (month: string) => apiRequest("POST", "/api/tasks/export-pdf", { month }),
    onSuccess: () => {
      toast({ title: "PDF export initiated", description: "Report will be available shortly" });
    },
  });

  const addTaskExpense = useMutation({
    mutationFn: async ({ taskId, data }: any) => apiRequest("POST", `/api/tasks/${taskId}/expenses`, data),
    onSuccess: () => {
      toast({ title: "Expense added successfully" });
      setShowExpenseDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewExpense({ description: "", amount: "", category: "", receiptUrl: "" });
    },
  });

  // Helper functions
  const resetNewTask = () => {
    setNewTask({
      title: "",
      description: "",
      type: "manual",
      department: "",
      priority: "medium",
      propertyId: "",
      assignedTo: "",
      dueDate: "",
      isRecurring: false,
      recurringSchedule: "",
      estimatedDuration: ""
    });
  };

  const resetNewChecklist = () => {
    setNewChecklist({
      taskType: "",
      department: "",
      checklistName: "",
      checklistItems: [""],
      isDefault: true,
      propertyId: "",
      safetyNotes: "",
      estimatedTime: "",
      requiredTools: [""]
    });
  };

  const resetNewGuide = () => {
    setNewGuide({
      propertyId: "",
      guideName: "",
      guideContent: "",
      category: "",
      department: "",
      attachments: [""]
    });
  };

  const getDepartmentConfig = (department: string) => {
    return DEPARTMENTS.find(d => d.value === department) || DEPARTMENTS[0];
  };

  const getStatusConfig = (status: string) => {
    return TASK_STATUS.find(s => s.value === status) || TASK_STATUS[0];
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority) || PRIORITY_LEVELS[0];
  };

  const getTaskTypeConfig = (type: string) => {
    return TASK_TYPES.find(t => t.value === type) || TASK_TYPES[0];
  };

  const filteredTasks = (tasks || []).filter((task: Task) => {
    const matchesDepartment = !selectedDepartment || task.department === selectedDepartment;
    const matchesStatus = !selectedStatus || task.status === selectedStatus;
    const matchesProperty = !selectedProperty || task.propertyId?.toString() === selectedProperty;
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDepartment && matchesStatus && matchesProperty && matchesSearch;
  }) || [];

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold">Access Required</h3>
              <p className="text-gray-600">Please log in to access the Maintenance & Task System.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Task Card Component
  const TaskCard = ({ task }: { task: Task }) => {
    const departmentConfig = getDepartmentConfig(task.department);
    const statusConfig = getStatusConfig(task.status);
    const priorityConfig = getPriorityConfig(task.priority);
    const typeConfig = getTaskTypeConfig(task.type);
    const IconComponent = departmentConfig.icon;
    const StatusIcon = statusConfig.icon;

    return (
      <Card className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${departmentConfig.color.split(' ')[1]}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${departmentConfig.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.property?.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusConfig.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={typeConfig.color}>
                {typeConfig.label}
              </Badge>
              {task.assignedUser && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {task.assignedUser.firstName} {task.assignedUser.lastName}
                </div>
              )}
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {task.evidencePhotos && task.evidencePhotos.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Camera className="h-3 w-3" />
              {task.evidencePhotos.length} proof photo(s)
            </div>
          )}

          {task.expenses && task.expenses.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <DollarSign className="h-3 w-3" />
              ${task.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)} expenses
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedTask(task);
                setShowTaskDetailDialog(true);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            
            {canExecuteTasks && task.status === 'pending' && (
              <Button 
                size="sm"
                onClick={() => {
                  setSelectedTask(task);
                  setShowStartTaskDialog(true);
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Start Task
              </Button>
            )}
            
            {canExecuteTasks && task.status === 'in-progress' && (
              <Button 
                size="sm"
                onClick={() => {
                  setSelectedTask(task);
                  setShowCompleteTaskDialog(true);
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}

            {canManageTasks && task.status === 'pending-review' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedTask(task);
                  setShowReviewTaskDialog(true);
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex bg-background">

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Maintenance & Task System" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-blue-500" />
            Maintenance & Task System
          </h1>
          <p className="text-muted-foreground">
            Smart task management with departments, proof tracking, AI suggestions & archiving
          </p>
        </div>
        {canCreateTasks && (
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateTaskDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
            <Button variant="outline" onClick={() => exportTasksPdf.mutate(new Date().toISOString().slice(0, 7))}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search Tasks</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {TASK_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="All properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All properties</SelectItem>
                  {properties?.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Tasks ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Property Guides
          </TabsTrigger>
          <TabsTrigger value="ai-suggestions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(filteredTasks || []).map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {(filteredTasks || []).length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold">No Tasks Found</h3>
                        <p className="text-gray-600 mb-4">
                          {searchQuery || selectedDepartment || selectedStatus || selectedProperty 
                            ? "No tasks match your current filters."
                            : "No tasks have been created yet."}
                        </p>
                        {canCreateTasks && (
                          <Button onClick={() => setShowCreateTaskDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Task
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Task Checklists & Templates</h3>
            {canManageTasks && (
              <Button onClick={() => setShowCreateChecklistDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Checklist
              </Button>
            )}
          </div>

          {checklistsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-4">
              {(checklists || []).map((checklist: TaskChecklist) => (
                <Card key={checklist.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{checklist.checklistName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getDepartmentConfig(checklist.department).label} • {checklist.taskType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {checklist.isDefault && (
                          <Badge variant="secondary">Default Template</Badge>
                        )}
                        {checklist.estimatedTime && (
                          <Badge variant="outline">
                            <Timer className="h-3 w-3 mr-1" />
                            {checklist.estimatedTime} min
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Checklist Items ({(checklist.checklistItems || []).length})</h4>
                        <ul className="space-y-1">
                          {(checklist.checklistItems || []).slice(0, 3).map((item: ChecklistItem, idx: number) => (
                            <li key={item.id} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-gray-400" />
                              {item.text}
                            </li>
                          ))}
                          {checklist.checklistItems.length > 3 && (
                            <li className="text-sm text-muted-foreground">
                              ... and {checklist.checklistItems.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>

                      {checklist.requiredTools && checklist.requiredTools.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Required Tools</h4>
                          <div className="flex flex-wrap gap-1">
                            {checklist.requiredTools.map((tool: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {checklist.safetyNotes && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Safety Notes
                          </h4>
                          <p className="text-sm text-yellow-700">{checklist.safetyNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Property Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Property-Specific Guides</h3>
            {canManageTasks && (
              <Button onClick={() => setShowCreateGuideDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Guide
              </Button>
            )}
          </div>

          {guidesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-4">
              {(propertyGuides || []).map((guide: PropertyGuide) => (
                <Card key={guide.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{guide.guideName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Property ID: {guide.propertyId} • {guide.category}
                          {guide.department && ` • ${getDepartmentConfig(guide.department).label}`}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {new Date(guide.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Guide Content</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{guide.guideContent}</p>
                      </div>

                      {guide.attachments && guide.attachments.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Attachments</h4>
                          <div className="flex flex-wrap gap-2">
                            {guide.attachments.map((attachment: string, idx: number) => (
                              <Button key={idx} variant="outline" size="sm">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Attachment {idx + 1}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View Full Guide
                        </Button>
                        {canManageTasks && (
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai-suggestions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI Task Suggestions</h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Suggestions
            </Button>
          </div>

          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-4">
              {(aiSuggestions || []).map((suggestion: AiSuggestion) => (
                <Card key={suggestion.id} className="border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-indigo-500" />
                          {suggestion.suggestedTaskType.replace('-', ' ').toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Property ID: {suggestion.propertyId} • {getDepartmentConfig(suggestion.department).label}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityConfig(suggestion.priority).color}>
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">
                          <Target className="h-3 w-3 mr-1" />
                          {Math.round(suggestion.confidence)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">AI Reasoning</h4>
                        <p className="text-sm text-gray-600">{suggestion.reason}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Trigger Source:</span>
                          <br />
                          <span className="font-medium">{suggestion.triggerSource}</span>
                        </div>
                        {suggestion.suggestedDate && (
                          <div>
                            <span className="text-muted-foreground">Suggested Date:</span>
                            <br />
                            <span className="font-medium">{new Date(suggestion.suggestedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {suggestion.estimatedDuration && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          Estimated duration: {suggestion.estimatedDuration} minutes
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {canCreateTasks && suggestion.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => acceptAiSuggestion.mutate(suggestion.id)}
                              disabled={acceptAiSuggestion.isPending}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept & Create Task
                            </Button>
                            <Button variant="outline" size="sm">
                              <X className="h-3 w-3 mr-1" />
                              Dismiss
                            </Button>
                          </>
                        )}
                        {suggestion.status === 'accepted' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Task Created
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {aiSuggestions?.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold">No AI Suggestions</h3>
                      <p className="text-gray-600">
                        AI will analyze guest feedback and property usage to suggest maintenance tasks.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Archived Tasks</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportTasksPdf.mutate("2024-12")}>
                <Download className="h-4 w-4 mr-2" />
                Export December 2024
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportTasksPdf.mutate("2024-11")}>
                <Download className="h-4 w-4 mr-2" />
                Export November 2024
              </Button>
            </div>
          </div>

          {archiveLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold">Task Archive</h3>
                    <p className="text-gray-600 mb-4">
                      Tasks older than 30 days are automatically archived. Export monthly PDF reports for record keeping.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800">This Month</h4>
                        <p className="text-2xl font-bold text-blue-600">23</p>
                        <p className="text-blue-600">Completed Tasks</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800">Last Month</h4>
                        <p className="text-2xl font-bold text-green-600">18</p>
                        <p className="text-green-600">Archived Tasks</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-800">Total</h4>
                        <p className="text-2xl font-bold text-purple-600">156</p>
                        <p className="text-purple-600">All Time Tasks</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a new maintenance task with department assignment and scheduling.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g., Clean pool and check chemicals"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={newTask.department} onValueChange={(value) => setNewTask({...newTask, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Detailed description of the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Task Type</Label>
                <Select value={newTask.type} onValueChange={(value) => setNewTask({...newTask, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Duration (min)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={newTask.estimatedDuration}
                  onChange={(e) => setNewTask({...newTask, estimatedDuration: e.target.value})}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select value={newTask.propertyId} onValueChange={(value) => setNewTask({...newTask, propertyId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {(properties || []).map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {(users || []).filter((u: any) => ['staff', 'admin', 'portfolio-manager'].includes(u.role)).map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTask.isRecurring}
                    onChange={(e) => setNewTask({...newTask, isRecurring: e.target.checked})}
                  />
                  Recurring Task
                </Label>
                {newTask.isRecurring && (
                  <Select value={newTask.recurringSchedule} onValueChange={(value) => setNewTask({...newTask, recurringSchedule: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createTask.mutate(newTask)}
              disabled={createTask.isPending || !newTask.title || !newTask.department}
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={showCompleteTaskDialog} onOpenChange={setShowCompleteTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Add completion notes, evidence photos, and any issues found.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">{selectedTask.title}</h4>
                <p className="text-sm text-blue-600">{selectedTask.description}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="completionNotes">Completion Notes</Label>
                <Textarea
                  id="completionNotes"
                  value={completionData.completionNotes}
                  onChange={(e) => setCompletionData({...completionData, completionNotes: e.target.value})}
                  placeholder="Describe what was completed and any observations..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Evidence Photos (URLs)</Label>
                {completionData.evidencePhotos.map((photo, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={photo}
                      onChange={(e) => {
                        const newPhotos = [...completionData.evidencePhotos];
                        newPhotos[index] = e.target.value;
                        setCompletionData({...completionData, evidencePhotos: newPhotos});
                      }}
                      placeholder="Photo URL"
                    />
                    {index === completionData.evidencePhotos.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCompletionData({
                          ...completionData, 
                          evidencePhotos: [...completionData.evidencePhotos, ""]
                        })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Issues Found</Label>
                {completionData.issuesFound.map((issue, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={issue}
                      onChange={(e) => {
                        const newIssues = [...completionData.issuesFound];
                        newIssues[index] = e.target.value;
                        setCompletionData({...completionData, issuesFound: newIssues});
                      }}
                      placeholder="Describe any issues found"
                    />
                    {index === completionData.issuesFound.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCompletionData({
                          ...completionData, 
                          issuesFound: [...completionData.issuesFound, ""]
                        })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualDuration">Actual Duration (minutes)</Label>
                <Input
                  id="actualDuration"
                  type="number"
                  value={completionData.actualDuration}
                  onChange={(e) => setCompletionData({...completionData, actualDuration: e.target.value})}
                  placeholder="How long did this task take?"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedTask(null);
                    setShowExpenseDialog(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Add Expense
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteTaskDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTask) {
                  completeTask.mutate({
                    taskId: selectedTask.id,
                    data: completionData
                  });
                }
              }}
              disabled={completeTask.isPending}
            >
              {completeTask.isPending ? "Completing..." : "Complete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task Expense</DialogTitle>
            <DialogDescription>
              Record expenses related to this task (materials, supplies, etc.)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expenseDescription">Description</Label>
              <Input
                id="expenseDescription"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="e.g., Pool chemicals, cleaning supplies"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptUrl">Receipt URL (optional)</Label>
              <Input
                id="receiptUrl"
                value={newExpense.receiptUrl}
                onChange={(e) => setNewExpense({...newExpense, receiptUrl: e.target.value})}
                placeholder="Link to receipt image or document"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTask) {
                  addTaskExpense.mutate({
                    taskId: selectedTask.id,
                    data: newExpense
                  });
                }
              }}
              disabled={addTaskExpense.isPending || !newExpense.description || !newExpense.amount}
            >
              {addTaskExpense.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}