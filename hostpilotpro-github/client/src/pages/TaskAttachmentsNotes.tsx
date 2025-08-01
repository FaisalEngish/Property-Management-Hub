import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, FileImage, FileText, Play, Eye, Plus, Edit, Trash2, Pin, AlertTriangle, Info, HelpCircle, Building, MapPin, Lightbulb, BookOpen, FileIcon, ExternalLink } from "lucide-react";

interface TaskAttachment {
  id: number;
  taskId: number;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'video' | 'document';
  title?: string;
  description?: string;
  category: 'guide' | 'reference' | 'safety' | 'procedure';
  department: 'cleaning' | 'maintenance' | 'pool' | 'garden' | 'general';
  sortOrder: number;
  isRequired: boolean;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

interface PropertyNote {
  id: number;
  propertyId: number;
  title: string;
  content: string;
  noteType: 'appliance' | 'fragile' | 'preference' | 'warning' | 'instruction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isPinned: boolean;
  applicableDepartments: string[];
  isVisible: boolean;
  visibleToStaff: boolean;
  attachmentUrl?: string;
  createdBy: string;
  createdByName: string;
  lastModifiedBy?: string;
  lastModifiedByName?: string;
  createdAt: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface Task {
  id: number;
  title: string;
  propertyId: number;
  propertyName: string;
  department: string;
  status: string;
}

const DEPARTMENTS = [
  { value: 'cleaning', label: '🧹 Cleaning' },
  { value: 'maintenance', label: '🔧 Maintenance' },
  { value: 'pool', label: '🏊 Pool' },
  { value: 'garden', label: '🏝 Garden' },
  { value: 'general', label: '🗂 General' }
];

const NOTE_TYPES = [
  { value: 'appliance', label: '⚡ Appliance Info', color: 'bg-blue-100 text-blue-800' },
  { value: 'fragile', label: '🔒 Fragile Items', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'preference', label: '❤️ Owner Preference', color: 'bg-purple-100 text-purple-800' },
  { value: 'warning', label: '⚠️ Warning', color: 'bg-red-100 text-red-800' },
  { value: 'instruction', label: '📋 Instructions', color: 'bg-green-100 text-green-800' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' }
];

const FILE_TYPES = [
  { value: 'image', label: 'Image', icon: FileImage },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'video', label: 'Video', icon: Play },
  { value: 'document', label: 'Document', icon: FileIcon }
];

const ATTACHMENT_CATEGORIES = [
  { value: 'guide', label: 'Step-by-step Guide' },
  { value: 'reference', label: 'Reference Material' },
  { value: 'safety', label: 'Safety Instructions' },
  { value: 'procedure', label: 'Standard Procedure' }
];

// [MERGED] This module has been consolidated into MaintenanceTaskSystem.tsx
// Task attachments and property notes functionality is now available in the Attachments & Notes tab
export default function TaskAttachmentsNotes() {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<TaskAttachment | null>(null);
  const [editingNote, setEditingNote] = useState<PropertyNote | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch tasks for selected property
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", selectedProperty],
    enabled: !!selectedProperty,
  });

  // Fetch task attachments for selected task
  const { data: taskAttachments = [] } = useQuery<TaskAttachment[]>({
    queryKey: ["/api/tasks", selectedTask, "attachments"],
    enabled: !!selectedTask,
  });

  // Fetch property notes for selected property
  const { data: propertyNotes = [] } = useQuery<PropertyNote[]>({
    queryKey: ["/api/properties", selectedProperty, "notes"],
    enabled: !!selectedProperty,
  });

  // Filter notes by department if selected
  const filteredNotes = selectedDepartment 
    ? propertyNotes.filter(note => note.applicableDepartments.includes(selectedDepartment))
    : propertyNotes;

  // Create/update task attachment mutation
  const attachmentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingAttachment) {
        return await apiRequest("PUT", `/api/task-attachments/${editingAttachment.id}`, data);
      } else {
        return await apiRequest("POST", `/api/tasks/${selectedTask}/attachments`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedTask, "attachments"] });
      setAttachmentDialogOpen(false);
      setEditingAttachment(null);
      toast({
        title: "Success",
        description: editingAttachment ? "Attachment updated successfully" : "Attachment created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save attachment",
        variant: "destructive",
      });
    }
  });

  // Create/update property note mutation
  const noteMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingNote) {
        return await apiRequest("PUT", `/api/property-notes/${editingNote.id}`, data);
      } else {
        return await apiRequest("POST", `/api/properties/${selectedProperty}/notes`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", selectedProperty, "notes"] });
      setNoteDialogOpen(false);
      setEditingNote(null);
      toast({
        title: "Success",
        description: editingNote ? "Note updated successfully" : "Note created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  });

  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/task-attachments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedTask, "attachments"] });
      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/property-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", selectedProperty, "notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  });

  const handleAttachmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      fileName: formData.get('fileName') as string,
      fileUrl: formData.get('fileUrl') as string,
      fileType: formData.get('fileType') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      department: formData.get('department') as string,
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      isRequired: formData.get('isRequired') === 'on',
    };

    attachmentMutation.mutate(data);
  };

  const handleNoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedDepts = Array.from(formData.getAll('departments') as string[]);
    
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      noteType: formData.get('noteType') as string,
      priority: formData.get('priority') as string,
      isPinned: formData.get('isPinned') === 'on',
      applicableDepartments: selectedDepts,
      isVisible: formData.get('isVisible') === 'on',
      visibleToStaff: formData.get('visibleToStaff') === 'on',
      attachmentUrl: formData.get('attachmentUrl') as string,
    };

    noteMutation.mutate(data);
  };

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
  };

  const getFileTypeIcon = (fileType: string) => {
    const typeConfig = FILE_TYPES.find(t => t.value === fileType);
    const Icon = typeConfig?.icon || FileIcon;
    return <Icon className="h-4 w-4" />;
  };

  const getNoteTypeColor = (noteType: string) => {
    const typeConfig = NOTE_TYPES.find(t => t.value === noteType);
    return typeConfig?.color || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityConfig?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Paperclip className="h-8 w-8 text-blue-600" />
              Task Attachments & Property Notes
            </h1>
            <p className="text-gray-600 mt-2">
              Visual guides and property-specific notes for enhanced task execution
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property: Property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task">Task (for attachments)</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task: Task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department Filter</Label>
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
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">📋 Overview</TabsTrigger>
            <TabsTrigger value="attachments">📎 Task Attachments</TabsTrigger>
            <TabsTrigger value="notes">📝 Property Notes</TabsTrigger>
            <TabsTrigger value="management">⚙️ Management</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Quick Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Task Attachments</span>
                    <Badge variant="outline">{taskAttachments.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Property Notes</span>
                    <Badge variant="outline">{propertyNotes.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pinned Notes</span>
                    <Badge variant="outline">{propertyNotes.filter(n => n.isPinned).length}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm">Reduces human error with visual guides</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-blue-600 mt-1" />
                    <span className="text-sm">Easier staff training and onboarding</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-4 w-4 text-purple-600 mt-1" />
                    <span className="text-sm">Better owner service with preferences</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Items Preview */}
            {selectedProperty && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {taskAttachments.slice(0, 3).map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-3 p-2 border-b last:border-b-0">
                        {getFileTypeIcon(attachment.fileType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.title || attachment.fileName}</p>
                          <p className="text-xs text-gray-500">{attachment.category}</p>
                        </div>
                      </div>
                    ))}
                    {taskAttachments.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No attachments yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pinned Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredNotes.filter(n => n.isPinned).slice(0, 3).map((note) => (
                      <div key={note.id} className="flex items-start gap-3 p-2 border-b last:border-b-0">
                        <Pin className="h-4 w-4 text-blue-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{note.title}</p>
                          <Badge className={`text-xs ${getNoteTypeColor(note.noteType)}`}>
                            {NOTE_TYPES.find(t => t.value === note.noteType)?.label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {filteredNotes.filter(n => n.isPinned).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No pinned notes</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Task Attachments Tab */}
          <TabsContent value="attachments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Task Attachments
                    </CardTitle>
                    <CardDescription>
                      Visual guides and documents for specific tasks
                    </CardDescription>
                  </div>
                  {selectedTask && (
                    <Dialog open={attachmentDialogOpen} onOpenChange={setAttachmentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingAttachment(null)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Attachment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingAttachment ? 'Edit' : 'Add'} Task Attachment
                          </DialogTitle>
                          <DialogDescription>
                            Upload guides, images, or documents for this task
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAttachmentSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fileName">File Name</Label>
                              <Input
                                id="fileName"
                                name="fileName"
                                defaultValue={editingAttachment?.fileName}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fileType">File Type</Label>
                              <Select name="fileType" defaultValue={editingAttachment?.fileType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FILE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fileUrl">File URL</Label>
                            <Input
                              id="fileUrl"
                              name="fileUrl"
                              type="url"
                              placeholder="https://..."
                              defaultValue={editingAttachment?.fileUrl}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="title">Title (Optional)</Label>
                            <Input
                              id="title"
                              name="title"
                              defaultValue={editingAttachment?.title}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              defaultValue={editingAttachment?.description}
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <Select name="category" defaultValue={editingAttachment?.category}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ATTACHMENT_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="department">Department</Label>
                              <Select name="department" defaultValue={editingAttachment?.department}>
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

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="sortOrder">Sort Order</Label>
                              <Input
                                id="sortOrder"
                                name="sortOrder"
                                type="number"
                                defaultValue={editingAttachment?.sortOrder || 0}
                              />
                            </div>
                            <div className="flex items-center space-x-2 mt-8">
                              <Switch
                                id="isRequired"
                                name="isRequired"
                                defaultChecked={editingAttachment?.isRequired}
                              />
                              <Label htmlFor="isRequired">Required viewing</Label>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setAttachmentDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={attachmentMutation.isPending}>
                              {attachmentMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedTask ? (
                  <div className="text-center py-8">
                    <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a task to view and manage attachments</p>
                  </div>
                ) : taskAttachments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No attachments for this task yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {taskAttachments.map((attachment) => (
                      <Card key={attachment.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getFileTypeIcon(attachment.fileType)}
                              <div>
                                <h4 className="font-medium text-sm">{attachment.title || attachment.fileName}</h4>
                                <p className="text-xs text-gray-500">{attachment.category}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => openPreview(attachment.fileUrl, attachment.title || attachment.fileName)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingAttachment(attachment);
                                  setAttachmentDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {attachment.description && (
                            <p className="text-xs text-gray-600 mb-2">{attachment.description}</p>
                          )}
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <Badge variant="outline" className={`text-xs ${attachment.isRequired ? 'bg-red-100 text-red-700' : ''}`}>
                              {attachment.isRequired ? 'Required' : 'Optional'}
                            </Badge>
                            <span>{attachment.uploadedByName}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Property Notes
                    </CardTitle>
                    <CardDescription>
                      Important property-specific information for staff
                    </CardDescription>
                  </div>
                  {selectedProperty && (
                    <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingNote(null)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingNote ? 'Edit' : 'Add'} Property Note
                          </DialogTitle>
                          <DialogDescription>
                            Add important property-specific information for staff
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleNoteSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              name="title"
                              defaultValue={editingNote?.title}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                              id="content"
                              name="content"
                              defaultValue={editingNote?.content}
                              rows={4}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="noteType">Note Type</Label>
                              <Select name="noteType" defaultValue={editingNote?.noteType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {NOTE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="priority">Priority</Label>
                              <Select name="priority" defaultValue={editingNote?.priority}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRIORITY_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Applicable Departments</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {DEPARTMENTS.map((dept) => (
                                <div key={dept.value} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`dept-${dept.value}`}
                                    name="departments"
                                    value={dept.value}
                                    defaultChecked={editingNote?.applicableDepartments.includes(dept.value)}
                                    className="rounded"
                                  />
                                  <Label htmlFor={`dept-${dept.value}`} className="text-sm">
                                    {dept.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="attachmentUrl">Attachment URL (Optional)</Label>
                            <Input
                              id="attachmentUrl"
                              name="attachmentUrl"
                              type="url"
                              placeholder="https://..."
                              defaultValue={editingNote?.attachmentUrl}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isPinned"
                                name="isPinned"
                                defaultChecked={editingNote?.isPinned}
                              />
                              <Label htmlFor="isPinned">Pin to top</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isVisible"
                                name="isVisible"
                                defaultChecked={editingNote?.isVisible !== false}
                              />
                              <Label htmlFor="isVisible">Visible</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="visibleToStaff"
                                name="visibleToStaff"
                                defaultChecked={editingNote?.visibleToStaff !== false}
                              />
                              <Label htmlFor="visibleToStaff">Staff can see</Label>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setNoteDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={noteMutation.isPending}>
                              {noteMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedProperty ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a property to view and manage notes</p>
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {selectedDepartment ? 'No notes for this department' : 'No notes for this property yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Pinned notes first */}
                    {filteredNotes.filter(note => note.isPinned).map((note) => (
                      <Card key={note.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Pin className="h-4 w-4 text-blue-600 mt-1" />
                              <div>
                                <h4 className="font-medium">{note.title}</h4>
                                <div className="flex gap-2 mt-1">
                                  <Badge className={`text-xs ${getNoteTypeColor(note.noteType)}`}>
                                    {NOTE_TYPES.find(t => t.value === note.noteType)?.label}
                                  </Badge>
                                  <Badge className={`text-xs ${getPriorityColor(note.priority)}`}>
                                    {PRIORITY_LEVELS.find(p => p.value === note.priority)?.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {note.attachmentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.open(note.attachmentUrl, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingNote(note);
                                  setNoteDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => deleteNoteMutation.mutate(note.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700 mb-3">{note.content}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex gap-2">
                              {note.applicableDepartments.map(dept => (
                                <Badge key={dept} variant="outline" className="text-xs">
                                  {DEPARTMENTS.find(d => d.value === dept)?.label}
                                </Badge>
                              ))}
                            </div>
                            <span>by {note.createdByName}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Regular notes */}
                    {filteredNotes.filter(note => !note.isPinned).map((note) => (
                      <Card key={note.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{note.title}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge className={`text-xs ${getNoteTypeColor(note.noteType)}`}>
                                  {NOTE_TYPES.find(t => t.value === note.noteType)?.label}
                                </Badge>
                                <Badge className={`text-xs ${getPriorityColor(note.priority)}`}>
                                  {PRIORITY_LEVELS.find(p => p.value === note.priority)?.label}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {note.attachmentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.open(note.attachmentUrl, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingNote(note);
                                  setNoteDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => deleteNoteMutation.mutate(note.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700 mb-3">{note.content}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex gap-2">
                              {note.applicableDepartments.map(dept => (
                                <Badge key={dept} variant="outline" className="text-xs">
                                  {DEPARTMENTS.find(d => d.value === dept)?.label}
                                </Badge>
                              ))}
                            </div>
                            <span>by {note.createdByName}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Template Management
                  </CardTitle>
                  <CardDescription>
                    Create reusable guides and templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Coming soon: Global template system for creating reusable task guides across properties.
                  </p>
                  <Button variant="outline" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Access Analytics
                  </CardTitle>
                  <CardDescription>
                    Track attachment and note usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    View which attachments and notes are accessed most frequently by staff.
                  </p>
                  <Button variant="outline" disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        {previewUrl && (
          <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl("")}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{previewTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                {previewUrl.toLowerCase().includes('.pdf') ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-96"
                    title="PDF Preview"
                  />
                ) : previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                  <img
                    src={previewUrl}
                    alt={previewTitle}
                    className="max-w-full h-auto"
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Preview not available for this file type</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.open(previewUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in new tab
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}