import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Camera, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  MapPin,
  User,
  PlayCircle,
  XCircle,
  RotateCcw,
  FileText,
  Eye,
  Camera as CameraIcon,
  Upload,
  Tag
} from "lucide-react";

const taskCompletionSchema = z.object({
  notes: z.string().optional(),
  evidencePhotos: z.array(z.string()).default([]),
  issuesFound: z.array(z.string()).default([]),
});

const skipTaskSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

const rescheduleTaskSchema = z.object({
  newDate: z.string().min(1, "New date is required"),
  reason: z.string().min(1, "Reason is required"),
});

// [MERGED] This module has been consolidated into MaintenanceTaskSystem.tsx
// Staff task execution functionality is now available in the Staff tab of comprehensive task management
export default function StaffTasks() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isSkipDialogOpen, setIsSkipDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newIssue, setNewIssue] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", { assignedTo: user?.id }],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: taskHistory = [] } = useQuery({
    queryKey: ["/api/tasks", selectedTask?.id, "history"],
    enabled: !!selectedTask?.id && isHistoryDialogOpen,
  });

  const startTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest(`/api/tasks/${taskId}/start`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Started",
        description: "You have started working on this task.",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskCompletionSchema> & { taskId: number }) => {
      const response = await apiRequest(`/api/tasks/${data.taskId}/complete`, {
        method: "PATCH",
        body: JSON.stringify({
          notes: data.notes,
          evidencePhotos: data.evidencePhotos,
          issuesFound: data.issuesFound,
        }),
        headers: { "Content-Type": "application/json" },
      });

      // Auto-log inventory usage for checkout cleaning tasks
      if (selectedTask?.type === 'cleaning' && selectedTask?.department === 'checkout') {
        try {
          await apiRequest('/api/welcome-pack-usage/checkout', {
            method: 'POST',
            body: JSON.stringify({
              bookingId: selectedTask.bookingId,
              propertyId: selectedTask.propertyId,
            }),
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.warn('Failed to auto-log inventory usage:', error);
        }
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/welcome-pack-usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      setIsCompletionDialogOpen(false);
      setUploadedPhotos([]);
      setSelectedIssues([]);
      completionForm.reset();
      
      const isCheckoutCleaning = selectedTask?.type === 'cleaning' && selectedTask?.department === 'checkout';
      toast({
        title: "Task Completed",
        description: isCheckoutCleaning 
          ? "Task completed and welcome pack inventory automatically logged."
          : "Task has been marked as completed with evidence recorded.",
      });
    },
  });

  const skipTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof skipTaskSchema> & { taskId: number }) => {
      return await apiRequest(`/api/tasks/${data.taskId}/skip`, {
        method: "PATCH",
        body: JSON.stringify({ reason: data.reason }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsSkipDialogOpen(false);
      skipForm.reset();
      toast({
        title: "Task Skipped",
        description: "Task has been skipped with reason recorded.",
      });
    },
  });

  const rescheduleTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof rescheduleTaskSchema> & { taskId: number }) => {
      return await apiRequest(`/api/tasks/${data.taskId}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({
          newDate: data.newDate,
          reason: data.reason,
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsRescheduleDialogOpen(false);
      rescheduleForm.reset();
      toast({
        title: "Task Rescheduled",
        description: "Task has been rescheduled to the new date.",
      });
    },
  });

  const completionForm = useForm<z.infer<typeof taskCompletionSchema>>({
    resolver: zodResolver(taskCompletionSchema),
    defaultValues: {
      notes: "",
      evidencePhotos: [],
      issuesFound: [],
    },
  });

  const skipForm = useForm<z.infer<typeof skipTaskSchema>>({
    resolver: zodResolver(skipTaskSchema),
    defaultValues: {
      reason: "",
    },
  });

  const rescheduleForm = useForm<z.infer<typeof rescheduleTaskSchema>>({
    resolver: zodResolver(rescheduleTaskSchema),
    defaultValues: {
      newDate: "",
      reason: "",
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedPhotos(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddIssue = () => {
    if (newIssue.trim() && !selectedIssues.includes(newIssue.trim())) {
      setSelectedIssues([...selectedIssues, newIssue.trim()]);
      setNewIssue("");
    }
  };

  const handleRemoveIssue = (issue: string) => {
    setSelectedIssues(selectedIssues.filter(i => i !== issue));
  };

  const onCompleteTask = (data: z.infer<typeof taskCompletionSchema>) => {
    if (!selectedTask) return;
    completeTaskMutation.mutate({
      ...data,
      taskId: selectedTask.id,
      evidencePhotos: uploadedPhotos,
      issuesFound: selectedIssues,
    });
  };

  const onSkipTask = (data: z.infer<typeof skipTaskSchema>) => {
    if (!selectedTask) return;
    skipTaskMutation.mutate({
      ...data,
      taskId: selectedTask.id,
    });
  };

  const onRescheduleTask = (data: z.infer<typeof rescheduleTaskSchema>) => {
    if (!selectedTask) return;
    rescheduleTaskMutation.mutate({
      ...data,
      taskId: selectedTask.id,
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      "in-progress": { variant: "default" as const, icon: PlayCircle, label: "In Progress" },
      completed: { variant: "default" as const, icon: CheckCircle, label: "Completed" },
      skipped: { variant: "destructive" as const, icon: XCircle, label: "Skipped" },
      rescheduled: { variant: "outline" as const, icon: RotateCcw, label: "Rescheduled" },
    };

    const taskConfig = config[status as keyof typeof config] || config.pending;
    const Icon = taskConfig.icon;

    return (
      <Badge variant={taskConfig.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {taskConfig.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { variant: "outline" as const, label: "Low" },
      medium: { variant: "secondary" as const, label: "Medium" },
      high: { variant: "default" as const, label: "High" },
      urgent: { variant: "destructive" as const, label: "Urgent" },
    };

    const priorityConfig = config[priority as keyof typeof config] || config.medium;

    return (
      <Badge variant={priorityConfig.variant}>
        {priorityConfig.label}
      </Badge>
    );
  };

  const filteredTasks = tasks.filter((task: any) => {
    const matchesProperty = !selectedProperty || task.propertyId?.toString() === selectedProperty;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesProperty && matchesStatus;
  });

  const commonIssues = [
    "Broken furniture",
    "Stains on carpet/upholstery", 
    "Missing amenities",
    "Cleaning supplies needed",
    "Maintenance required",
    "Damaged fixtures",
    "WiFi issues",
    "Plumbing problems",
    "Electrical issues",
    "Air conditioning problems"
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Staff Tasks" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All properties</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Table */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500">
                          No tasks found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task: any) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {properties.find((p: any) => p.id === task.propertyId)?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{task.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(task.priority)}
                          </TableCell>
                          <TableCell>
                            {task.dueDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            ) : (
                              'No due date'
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(task.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {task.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => startTaskMutation.mutate(task.id)}
                                  disabled={startTaskMutation.isPending}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                              
                              {task.status === 'in-progress' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setIsCompletionDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setIsSkipDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Skip
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setIsRescheduleDialogOpen(true);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Reschedule
                                  </Button>
                                </>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsHistoryDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                History
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Complete Task Dialog */}
      <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complete Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <Form {...completionForm}>
            <form onSubmit={completionForm.handleSubmit(onCompleteTask)} className="space-y-6">
              <Tabs defaultValue="evidence" className="w-full">
                <TabsList>
                  <TabsTrigger value="evidence">Photo Evidence</TabsTrigger>
                  <TabsTrigger value="issues">Issues Found</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="evidence" className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Upload Photo Evidence</h4>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photos
                    </Button>
                  </div>
                  
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="issues" className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Report Issues Found</h4>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add custom issue..."
                        value={newIssue}
                        onChange={(e) => setNewIssue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIssue())}
                      />
                      <Button type="button" onClick={handleAddIssue}>
                        <Tag className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Common Issues:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {commonIssues.map((issue) => (
                          <div key={issue} className="flex items-center space-x-2">
                            <Checkbox
                              id={issue}
                              checked={selectedIssues.includes(issue)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedIssues([...selectedIssues, issue]);
                                } else {
                                  setSelectedIssues(selectedIssues.filter(i => i !== issue));
                                }
                              }}
                            />
                            <label htmlFor={issue} className="text-sm">{issue}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedIssues.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Selected Issues:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedIssues.map((issue) => (
                            <Badge key={issue} variant="destructive" className="cursor-pointer" onClick={() => handleRemoveIssue(issue)}>
                              {issue} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes">
                  <FormField
                    control={completionForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completion Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes about the task completion..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCompletionDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={completeTaskMutation.isPending}
                  className="flex-1"
                >
                  {completeTaskMutation.isPending ? "Completing..." : "Complete Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Skip Task Dialog */}
      <Dialog open={isSkipDialogOpen} onOpenChange={setIsSkipDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Skip Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <Form {...skipForm}>
            <form onSubmit={skipForm.handleSubmit(onSkipTask)} className="space-y-4">
              <FormField
                control={skipForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Skipping</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide a reason for skipping this task..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSkipDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={skipTaskMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  {skipTaskMutation.isPending ? "Skipping..." : "Skip Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reschedule Task Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <Form {...rescheduleForm}>
            <form onSubmit={rescheduleForm.handleSubmit(onRescheduleTask)} className="space-y-4">
              <FormField
                control={rescheduleForm.control}
                name="newDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Due Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rescheduleForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Rescheduling</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide a reason for rescheduling this task..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRescheduleDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={rescheduleTaskMutation.isPending}
                  className="flex-1"
                >
                  {rescheduleTaskMutation.isPending ? "Rescheduling..." : "Reschedule Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Task History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Task History: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {taskHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No history available</p>
            ) : (
              <div className="space-y-4">
                {taskHistory.map((entry: any) => (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{entry.action}</Badge>
                        {entry.previousStatus && entry.newStatus && (
                          <span className="text-sm text-gray-500">
                            {entry.previousStatus} → {entry.newStatus}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm text-gray-700">{entry.notes}</p>
                    )}
                    
                    {entry.evidencePhotos && entry.evidencePhotos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Evidence Photos:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {entry.evidencePhotos.map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {entry.issuesFound && entry.issuesFound.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Issues Found:</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.issuesFound.map((issue: string, index: number) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}