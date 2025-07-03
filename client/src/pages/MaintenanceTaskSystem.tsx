import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
  Calendar
} from "lucide-react";

const DEPARTMENTS = [
  { value: "cleaning", label: "🧹 Cleaning", icon: Sparkles },
  { value: "maintenance", label: "🔧 Maintenance", icon: Wrench },
  { value: "pool", label: "🏊 Pool", icon: Droplets },
  { value: "garden", label: "🏝 Garden", icon: TreePine },
  { value: "general", label: "🗂 General", icon: FileText }
];

const TASK_TYPES = [
  "cleaning", "maintenance", "pool-service", "garden", "inspection", "recurring", "ai-suggested", "booking-based"
];

const TASK_STATUS = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  { value: "skipped", label: "Skipped", color: "bg-gray-100 text-gray-800" },
  { value: "rescheduled", label: "Rescheduled", color: "bg-purple-100 text-purple-800" }
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
];

interface Task {
  id: number;
  title: string;
  description?: string;
  type: string;
  department?: string;
  status: string;
  priority: string;
  propertyId?: number;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  evidencePhotos?: string[];
  issuesFound?: string[];
  completionNotes?: string;
  createdAt: string;
  property?: { name: string };
  assignedUser?: { firstName: string; lastName: string };
}

interface TaskChecklist {
  id: number;
  taskType: string;
  department: string;
  checklistName: string;
  checklistItems: string[];
  isDefault: boolean;
  propertyId?: number;
}

interface PropertyGuide {
  id: number;
  propertyId: number;
  guideName: string;
  guideContent: string;
  category: string;
  department?: string;
  attachments?: string[];
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
}

export default function MaintenanceTaskSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks", departmentFilter, statusFilter, showArchived],
    queryFn: () => apiRequest("GET", `/api/tasks?department=${departmentFilter}&status=${statusFilter}&archived=${showArchived}`)
  });
  
  const tasks = Array.isArray(tasksData) ? tasksData : [];

  // Fetch checklists
  const { data: checklists = [] } = useQuery({
    queryKey: ["/api/task-checklists"],
    queryFn: () => apiRequest("GET", "/api/task-checklists")
  });

  // Fetch property guides
  const { data: propertyGuides = [] } = useQuery({
    queryKey: ["/api/property-guides"],
    queryFn: () => apiRequest("GET", "/api/property-guides")
  });

  // Fetch AI suggestions
  const { data: aiSuggestions = [] } = useQuery({
    queryKey: ["/api/ai-task-suggestions"],
    queryFn: () => apiRequest("GET", "/api/ai-task-suggestions")
  });

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => apiRequest("GET", "/api/properties")
  });

  // Start task mutation
  const startTaskMutation = useMutation({
    mutationFn: (taskId: number) => apiRequest("POST", `/api/tasks/${taskId}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task started successfully" });
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: (data: { taskId: number; completionNotes?: string; evidencePhotos?: string[]; issuesFound?: string[] }) =>
      apiRequest("POST", `/api/tasks/${data.taskId}/complete`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task completed successfully" });
      setSelectedTask(null);
    }
  });

  // Accept AI suggestion mutation
  const acceptAiSuggestionMutation = useMutation({
    mutationFn: (suggestionId: number) => apiRequest("POST", `/api/ai-suggestions/${suggestionId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-task-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "AI suggestion accepted and task created" });
    }
  });

  // Export monthly PDF mutation
  const exportPdfMutation = useMutation({
    mutationFn: (month: string) => apiRequest("POST", `/api/tasks/export-pdf`, { month }),
    onSuccess: () => {
      toast({ title: "PDF export initiated", description: "Your monthly task report will be generated." });
    }
  });

  const getDepartmentIcon = (department: string) => {
    const dept = DEPARTMENTS.find(d => d.value === department);
    return dept ? dept.icon : FileText;
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = TASK_STATUS.find(s => s.value === status);
    return (
      <Badge className={statusInfo?.color || "bg-gray-100 text-gray-800"}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityInfo = PRIORITY_LEVELS.find(p => p.value === priority);
    return (
      <Badge variant="outline" className={priorityInfo?.color || "bg-gray-100 text-gray-800"}>
        {priorityInfo?.label || priority}
      </Badge>
    );
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const IconComponent = getDepartmentIcon(task.department || "general");
    
    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTask(task)}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <h3 className="font-semibold">{task.title}</h3>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{task.property?.name || "All Properties"}</span>
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
            <Calendar className="h-3 w-3" />
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </Card>
    );
  };

  const TaskDetailsDialog = () => {
    if (!selectedTask) return null;
    
    const checklist = checklists.find(c => 
      c.taskType === selectedTask.type && 
      c.department === selectedTask.department &&
      (c.propertyId === selectedTask.propertyId || c.isDefault)
    );
    
    const guide = propertyGuides.find(g => 
      g.propertyId === selectedTask.propertyId && 
      g.department === selectedTask.department
    );

    return (
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getDepartmentIcon(selectedTask.department || "general")({ className: "h-5 w-5" })}
              {selectedTask.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Details */}
            <div>
              <h3 className="font-semibold mb-3">Task Details</h3>
              <div className="space-y-2 text-sm">
                <div>Status: {getStatusBadge(selectedTask.status)}</div>
                <div>Priority: {getPriorityBadge(selectedTask.priority)}</div>
                <div>Property: {selectedTask.property?.name || "All Properties"}</div>
                <div>Assigned to: {selectedTask.assignedUser?.firstName} {selectedTask.assignedUser?.lastName}</div>
                {selectedTask.dueDate && (
                  <div>Due Date: {new Date(selectedTask.dueDate).toLocaleDateString()}</div>
                )}
              </div>
              
              {selectedTask.description && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedTask.description}</p>
                </div>
              )}
              
              {/* Task Actions */}
              {selectedTask.status === "pending" && (
                <Button 
                  onClick={() => startTaskMutation.mutate(selectedTask.id)}
                  className="mt-4 w-full"
                  disabled={startTaskMutation.isPending}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Task
                </Button>
              )}
              
              {selectedTask.status === "in-progress" && (
                <Button 
                  onClick={() => completeTaskMutation.mutate({ taskId: selectedTask.id })}
                  className="mt-4 w-full"
                  disabled={completeTaskMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
              )}
            </div>
            
            {/* Checklist & Guide */}
            <div>
              {checklist && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Checklist: {checklist.checklistName}
                  </h3>
                  <div className="space-y-2">
                    {checklist.checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {guide && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Property Guide: {guide.guideName}
                  </h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {guide.guideContent}
                  </div>
                  
                  {guide.attachments && guide.attachments.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-2">Attachments</h4>
                      <div className="flex gap-2">
                        {guide.attachments.map((attachment, index) => (
                          <Button key={index} variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Evidence Photos */}
          {selectedTask.evidencePhotos && selectedTask.evidencePhotos.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Evidence Photos
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedTask.evidencePhotos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Evidence ${index + 1}`} className="rounded border h-20 object-cover" />
                ))}
              </div>
            </div>
          )}
          
          {/* Completion Notes */}
          {selectedTask.completionNotes && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Completion Notes</h3>
              <p className="text-sm text-gray-600">{selectedTask.completionNotes}</p>
            </div>
          )}
          
          {/* Issues Found */}
          {selectedTask.issuesFound && selectedTask.issuesFound.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Issues Found</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedTask.issuesFound.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧰 Maintenance & Task System</h1>
          <p className="text-gray-600">Comprehensive task management with AI suggestions and proof tracking</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportPdfMutation.mutate(new Date().toISOString().slice(0, 7))}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks">📋 Tasks</TabsTrigger>
          <TabsTrigger value="checklists">✅ Checklists</TabsTrigger>
          <TabsTrigger value="guides">📘 Guides</TabsTrigger>
          <TabsTrigger value="ai-suggestions">🧠 AI Suggestions</TabsTrigger>
          <TabsTrigger value="archive">📦 Archive</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Label>Filters:</Label>
                </div>
                
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {TASK_STATUS.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Task Grid */}
          {tasksLoading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklists.map((checklist: TaskChecklist) => (
              <Card key={checklist.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getDepartmentIcon(checklist.department)({ className: "h-4 w-4" })}
                    {checklist.checklistName}
                    {checklist.isDefault && <Badge variant="secondary">Default</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {checklist.checklistItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-sm">• {item}</div>
                    ))}
                    {checklist.checklistItems.length > 3 && (
                      <div className="text-sm text-gray-500">
                        ... and {checklist.checklistItems.length - 3} more items
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Property Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertyGuides.map((guide: PropertyGuide) => (
              <Card key={guide.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {guide.guideName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{guide.category}</Badge>
                    <p className="text-sm text-gray-600 line-clamp-3">{guide.guideContent}</p>
                    {guide.attachments && guide.attachments.length > 0 && (
                      <div className="text-xs text-gray-500">
                        📎 {guide.attachments.length} attachment(s)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai-suggestions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSuggestions.map((suggestion: AiSuggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Suggested: {suggestion.suggestedTaskType}
                    {getPriorityBadge(suggestion.priority)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">{suggestion.reason}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{suggestion.department}</Badge>
                      {suggestion.status === "pending" && (
                        <Button 
                          size="sm" 
                          onClick={() => acceptAiSuggestionMutation.mutate(suggestion.id)}
                          disabled={acceptAiSuggestionMutation.isPending}
                        >
                          Accept
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Task Archive & PDF Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tasks older than 30 days are automatically archived. Export monthly PDF reports for record keeping.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 6 }, (_, i) => {
                  const month = new Date();
                  month.setMonth(month.getMonth() - i);
                  const monthStr = month.toISOString().slice(0, 7);
                  
                  return (
                    <Button
                      key={monthStr}
                      variant="outline"
                      onClick={() => exportPdfMutation.mutate(monthStr)}
                      disabled={exportPdfMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {month.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TaskDetailsDialog />
    </div>
  );
}