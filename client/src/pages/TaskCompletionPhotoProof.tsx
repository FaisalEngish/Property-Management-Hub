import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Camera, 
  Upload, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download,
  Archive,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  FileDown
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  propertyName: string;
  assignedUserName: string;
  dueDate: string;
  createdAt: string;
}

interface TaskCompletionPhoto {
  id: number;
  taskId: number;
  photoUrl: string;
  description: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TaskCompletionNote {
  id: number;
  taskId: number;
  noteText: string;
  noteType: string;
  addedBy: string;
  addedAt: string;
}

interface TaskCompletionExpense {
  id: number;
  taskId: number;
  description: string;
  amount: number;
  category: string;
  receiptUrl: string;
  vendor: string;
  addedBy: string;
  addedAt: string;
}

interface TaskApproval {
  id: number;
  taskId: number;
  status: string;
  submittedBy: string;
  submittedAt: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewNotes: string;
}

interface PdfArchive {
  id: number;
  title: string;
  description: string;
  taskCount: number;
  pdfUrl: string;
  generatedAt: string;
  archiveStatus: string;
  propertyName: string;
}

// [MERGED] This module has been consolidated into MaintenanceTaskSystem.tsx
// Photo proof and task completion functionality is now integrated into the task workflow
export default function TaskCompletionPhotoProof() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("active-tasks");
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [selectedArchiveTasks, setSelectedArchiveTasks] = useState<number[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get active tasks (for staff)
  const { data: activeTasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["/api/staff/tasks"],
    enabled: activeTab === "active-tasks",
  });

  // Get pending task approvals (for PM/Admin)
  const { data: pendingApprovals, isLoading: loadingApprovals } = useQuery({
    queryKey: ["/api/task-approvals/pending"],
    enabled: activeTab === "approvals",
  });

  // Get tasks ready for archive (for Admin)
  const { data: archiveTasks, isLoading: loadingArchive } = useQuery({
    queryKey: ["/api/tasks/ready-for-archive"],
    enabled: activeTab === "archive",
  });

  // Get PDF archives
  const { data: pdfArchives, isLoading: loadingPdfArchives } = useQuery({
    queryKey: ["/api/task-pdf-archives"],
    enabled: activeTab === "pdf-archives",
  });

  // Get task completion details
  const { data: taskDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["/api/tasks", selectedTask?.id, "completion-details"],
    enabled: !!selectedTask,
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (data: { taskId: number; photoUrl: string; description: string; category: string }) => {
      return apiRequest("POST", `/api/tasks/${data.taskId}/photos`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedTask?.id, "completion-details"] });
      setShowPhotoDialog(false);
      toast({ title: "Photo uploaded successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (data: { taskId: number; noteText: string; noteType: string }) => {
      return apiRequest("POST", `/api/tasks/${data.taskId}/notes`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedTask?.id, "completion-details"] });
      setShowNoteDialog(false);
      toast({ title: "Note added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (data: { taskId: number; description: string; amount: number; category: string; receiptUrl?: string; vendor?: string }) => {
      return apiRequest("POST", `/api/tasks/${data.taskId}/expenses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedTask?.id, "completion-details"] });
      setShowExpenseDialog(false);
      toast({ title: "Expense added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit for approval mutation
  const submitApprovalMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/tasks/${taskId}/submit-for-approval`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedTask?.id, "completion-details"] });
      toast({ title: "Task submitted for approval" });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve task mutation
  const approveTaskMutation = useMutation({
    mutationFn: async (data: { taskId: number; reviewNotes?: string }) => {
      return apiRequest("POST", `/api/tasks/${data.taskId}/approve`, { reviewNotes: data.reviewNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-approvals/pending"] });
      setShowApprovalDialog(false);
      toast({ title: "Task approved successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Request redo mutation
  const requestRedoMutation = useMutation({
    mutationFn: async (data: { taskId: number; reviewNotes: string }) => {
      return apiRequest("POST", `/api/tasks/${data.taskId}/request-redo`, { reviewNotes: data.reviewNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-approvals/pending"] });
      setShowApprovalDialog(false);
      toast({ title: "Redo requested successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Redo request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate PDF archive mutation
  const generateArchiveMutation = useMutation({
    mutationFn: async (data: { taskIds: number[]; archiveTitle: string; archiveDescription: string }) => {
      return apiRequest("POST", "/api/tasks/generate-pdf-archive", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/ready-for-archive"] });
      queryClient.invalidateQueries({ queryKey: ["/api/task-pdf-archives"] });
      setShowArchiveDialog(false);
      setSelectedArchiveTasks([]);
      toast({ title: "PDF archive generated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Archive generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedTask) return;

    uploadPhotoMutation.mutate({
      taskId: selectedTask.id,
      photoUrl: formData.get("photoUrl") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
    });
  };

  const handleAddNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedTask) return;

    addNoteMutation.mutate({
      taskId: selectedTask.id,
      noteText: formData.get("noteText") as string,
      noteType: formData.get("noteType") as string,
    });
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedTask) return;

    addExpenseMutation.mutate({
      taskId: selectedTask.id,
      description: formData.get("description") as string,
      amount: parseFloat(formData.get("amount") as string),
      category: formData.get("category") as string,
      receiptUrl: formData.get("receiptUrl") as string,
      vendor: formData.get("vendor") as string,
    });
  };

  const handleApproveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedTask) return;

    approveTaskMutation.mutate({
      taskId: selectedTask.id,
      reviewNotes: formData.get("reviewNotes") as string,
    });
  };

  const handleRequestRedo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedTask) return;

    requestRedoMutation.mutate({
      taskId: selectedTask.id,
      reviewNotes: formData.get("reviewNotes") as string,
    });
  };

  const handleGenerateArchive = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    generateArchiveMutation.mutate({
      taskIds: selectedArchiveTasks,
      archiveTitle: formData.get("archiveTitle") as string,
      archiveDescription: formData.get("archiveDescription") as string,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Task Completion Photo Proof & PDF Archive System</h1>
        <p className="text-gray-600">Document task completion with photos, comments, and expenses. 30-day live storage with automated PDF archiving.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active-tasks" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Active Tasks
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Pending Approvals
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Ready for Archive
          </TabsTrigger>
          <TabsTrigger value="pdf-archives" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            PDF Archives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active-tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Active Tasks - Photo Documentation
              </CardTitle>
              <CardDescription>
                Click on a task to add photos, notes, and expenses. Submit for approval when complete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeTasks?.map((task: Task) => (
                    <Card 
                      key={task.id} 
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedTask?.id === task.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{task.propertyName}</span>
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedTask && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Task Documentation: {selectedTask.title}</span>
                  <div className="flex gap-2">
                    <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Photo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handlePhotoUpload}>
                          <DialogHeader>
                            <DialogTitle>Upload Task Photo</DialogTitle>
                            <DialogDescription>
                              Upload a photo to document task completion
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="photoUrl">Photo URL</Label>
                              <Input id="photoUrl" name="photoUrl" required />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea id="description" name="description" placeholder="Describe what this photo shows..." />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="category">Category</Label>
                              <Select name="category" defaultValue="general">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="before">Before</SelectItem>
                                  <SelectItem value="after">After</SelectItem>
                                  <SelectItem value="issue">Issue Found</SelectItem>
                                  <SelectItem value="progress">Work in Progress</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={uploadPhotoMutation.isPending}>
                              {uploadPhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleAddNote}>
                          <DialogHeader>
                            <DialogTitle>Add Task Note</DialogTitle>
                            <DialogDescription>
                              Add additional notes about the task completion
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="noteText">Note</Label>
                              <Textarea id="noteText" name="noteText" required placeholder="Enter your note..." />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="noteType">Type</Label>
                              <Select name="noteType" defaultValue="general">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="issue">Issue</SelectItem>
                                  <SelectItem value="solution">Solution</SelectItem>
                                  <SelectItem value="recommendation">Recommendation</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={addNoteMutation.isPending}>
                              {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleAddExpense}>
                          <DialogHeader>
                            <DialogTitle>Add Task Expense</DialogTitle>
                            <DialogDescription>
                              Record expenses incurred during task completion
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="description">Description</Label>
                              <Input id="description" name="description" required placeholder="Expense description..." />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="amount">Amount (THB)</Label>
                              <Input id="amount" name="amount" type="number" step="0.01" required />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="category">Category</Label>
                              <Select name="category" defaultValue="general">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="materials">Materials</SelectItem>
                                  <SelectItem value="tools">Tools</SelectItem>
                                  <SelectItem value="transport">Transport</SelectItem>
                                  <SelectItem value="supplies">Supplies</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="vendor">Vendor</Label>
                              <Input id="vendor" name="vendor" placeholder="Vendor name..." />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="receiptUrl">Receipt URL</Label>
                              <Input id="receiptUrl" name="receiptUrl" placeholder="Link to receipt image..." />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={addExpenseMutation.isPending}>
                              {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => submitApprovalMutation.mutate(selectedTask.id)}
                      disabled={submitApprovalMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDetails ? (
                  <div className="text-center py-8">Loading task details...</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Photos */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Photos ({taskDetails?.photos?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {taskDetails?.photos?.map((photo: TaskCompletionPhoto) => (
                          <div key={photo.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{photo.category}</Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(photo.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <img src={photo.photoUrl} alt={photo.description} className="w-full h-32 object-cover rounded mb-2" />
                            <p className="text-sm">{photo.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes ({taskDetails?.notes?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {taskDetails?.notes?.map((note: TaskCompletionNote) => (
                          <div key={note.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{note.noteType}</Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(note.addedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{note.noteText}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expenses */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Expenses ({taskDetails?.expenses?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {taskDetails?.expenses?.map((expense: TaskCompletionExpense) => (
                          <div key={expense.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{expense.category}</Badge>
                              <span className="font-semibold">฿{expense.amount.toFixed(2)}</span>
                            </div>
                            <p className="text-sm font-medium">{expense.description}</p>
                            {expense.vendor && (
                              <p className="text-xs text-gray-600">Vendor: {expense.vendor}</p>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(expense.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Pending Task Approvals
              </CardTitle>
              <CardDescription>
                Review and approve task completions submitted by staff members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingApprovals ? (
                <div className="text-center py-8">Loading pending approvals...</div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals?.map((approval: any) => (
                    <Card key={approval.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{approval.taskTitle}</h3>
                          <p className="text-sm text-gray-600">{approval.taskDescription}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Property: {approval.propertyName}</span>
                            <span>Submitted by: {approval.submitterName}</span>
                            <span>Date: {new Date(approval.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTask(approval);
                              setActiveTab("active-tasks");
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setSelectedTask(approval)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Task Completion</DialogTitle>
                                <DialogDescription>
                                  Approve the task or request a redo with feedback
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <h4 className="font-medium">{approval.taskTitle}</h4>
                                  <p className="text-sm text-gray-600">{approval.taskDescription}</p>
                                </div>
                                <form onSubmit={handleApproveTask}>
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                                      <Textarea id="reviewNotes" name="reviewNotes" placeholder="Add feedback or comments..." />
                                    </div>
                                  </div>
                                  <DialogFooter className="mt-4">
                                    <Button 
                                      type="button" 
                                      variant="outline"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget.closest('form') as HTMLFormElement;
                                        handleRequestRedo(e as any);
                                      }}
                                      disabled={requestRedoMutation.isPending}
                                    >
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Request Redo
                                    </Button>
                                    <Button type="submit" disabled={approveTaskMutation.isPending}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve Task
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Tasks Ready for Archive
                </span>
                <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                  <DialogTrigger asChild>
                    <Button disabled={selectedArchiveTasks.length === 0}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Generate PDF Archive ({selectedArchiveTasks.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleGenerateArchive}>
                      <DialogHeader>
                        <DialogTitle>Generate PDF Archive</DialogTitle>
                        <DialogDescription>
                          Create a PDF archive for {selectedArchiveTasks.length} completed tasks older than 30 days
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="archiveTitle">Archive Title</Label>
                          <Input 
                            id="archiveTitle" 
                            name="archiveTitle" 
                            defaultValue={`Task Archive ${new Date().toISOString().split('T')[0]}`}
                            required 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="archiveDescription">Description</Label>
                          <Textarea 
                            id="archiveDescription" 
                            name="archiveDescription" 
                            defaultValue="Automated 30-day task archive with photo documentation"
                            placeholder="Describe this archive..." 
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={generateArchiveMutation.isPending}>
                          {generateArchiveMutation.isPending ? "Generating..." : "Generate Archive"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Tasks completed more than 30 days ago are ready for PDF archiving. Photos will be deleted after archiving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingArchive ? (
                <div className="text-center py-8">Loading archive candidates...</div>
              ) : (
                <div className="space-y-4">
                  {archiveTasks?.map((task: any) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedArchiveTasks.includes(task.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedArchiveTasks(prev => [...prev, task.id]);
                              } else {
                                setSelectedArchiveTasks(prev => prev.filter(id => id !== task.id));
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <div className="space-y-1">
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Property: {task.propertyName}</span>
                              <span>Completed: {new Date(task.updatedAt).toLocaleDateString()}</span>
                              <span>Photos: {task.photosCount}</span>
                              <span>Notes: {task.notesCount}</span>
                              <span>Expenses: {task.expensesCount}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf-archives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                PDF Archives
              </CardTitle>
              <CardDescription>
                Generated PDF archives containing task documentation and photos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPdfArchives ? (
                <div className="text-center py-8">Loading PDF archives...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pdfArchives?.map((archive: PdfArchive) => (
                    <Card key={archive.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{archive.title}</h3>
                          <Badge 
                            className={archive.archiveStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {archive.archiveStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{archive.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{archive.taskCount} tasks</span>
                          <span>{new Date(archive.generatedAt).toLocaleDateString()}</span>
                        </div>
                        {archive.propertyName && (
                          <p className="text-xs text-gray-500">Property: {archive.propertyName}</p>
                        )}
                        <Button size="sm" className="w-full" asChild>
                          <a href={archive.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}