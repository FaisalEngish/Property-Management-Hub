import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { useFastAuth } from '@/lib/fastAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import CreateTaskDialog from "../components/CreateTaskDialog";
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench,
  Calendar,
  User,
  MapPin,
  RefreshCw,
  Trash2,
  Upload,
  X
} from 'lucide-react';

// Ultra-fast demo tasks data - no API calls, instant loading
const ULTRA_FAST_TASKS = [
  {
    id: 1,
    title: "Pool cleaning and chemical balancing",
    description: "Weekly pool maintenance and water quality check",
    type: "maintenance",
    status: "pending",
    priority: "high",
    propertyId: 1,
    propertyName: "Villa Samui Breeze",
    assigneeId: "staff-1",
    assigneeName: "Somchai Pattaya",
    dueDate: "2025-01-31",
    createdAt: "2025-01-28",
    estimatedHours: 2,
    category: "Property Maintenance"
  },
  {
    id: 2,
    title: "AC system inspection and filter replacement",
    description: "Quarterly AC maintenance for all units",
    type: "maintenance",
    status: "in-progress",
    priority: "medium",
    propertyId: 2,
    propertyName: "Villa Ocean View",
    assigneeId: "staff-2",
    assigneeName: "Niran Koh",
    dueDate: "2025-02-02",
    createdAt: "2025-01-25",
    estimatedHours: 4,
    category: "Property Maintenance"
  },
  {
    id: 3,
    title: "Guest check-in preparation",
    description: "Prepare villa for incoming guests - cleaning and setup",
    type: "cleaning",
    status: "completed",
    priority: "high",
    propertyId: 4,
    propertyName: "Villa Aruna Demo",
    assigneeId: "staff-3",
    assigneeName: "Malee Chiang",
    dueDate: "2025-01-30",
    createdAt: "2025-01-29",
    estimatedHours: 3,
    category: "Guest Services"
  },
  {
    id: 4,
    title: "Garden maintenance and landscaping",
    description: "Monthly garden care and plant maintenance",
    type: "landscaping",
    status: "pending",
    priority: "low",
    propertyId: 3,
    propertyName: "Villa Tropical Paradise",
    assigneeId: "staff-4",
    assigneeName: "Boon Rayong",
    dueDate: "2025-02-05",
    createdAt: "2025-01-27",
    estimatedHours: 6,
    category: "Property Maintenance"
  },
  {
    id: 5,
    title: "WiFi system upgrade and testing",
    description: "Install new WiFi equipment and test connectivity",
    type: "technology",
    status: "pending",
    priority: "medium",
    propertyId: 1,
    propertyName: "Villa Samui Breeze",
    assigneeId: "staff-5",
    assigneeName: "Tech Support",
    dueDate: "2025-02-01",
    createdAt: "2025-01-26",
    estimatedHours: 4,
    category: "Technology"
  },
  {
    id: 6,
    title: "Security system check",
    description: "Monthly security system inspection and battery check",
    type: "security",
    status: "in-progress",
    priority: "high",
    propertyId: 2,
    propertyName: "Villa Ocean View",
    assigneeId: "staff-1",
    assigneeName: "Somchai Pattaya",
    dueDate: "2025-01-31",
    createdAt: "2025-01-28",
    estimatedHours: 1,
    category: "Security"
  }
];

const SUMMARY_STATS = {
  totalTasks: 6,
  pendingTasks: 3,
  inProgressTasks: 2,
  completedTasks: 1,
  overdueTasks: 0,
  highPriorityTasks: 3
};

export default function UltraFastTasks() {
  const { user } = useFastAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to calculate date ranges
  const getDateRange = (filter: string) => {
    const today = new Date();
    const from = new Date();
    const to = new Date();

    switch (filter) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'this-week':
        from.setDate(today.getDate() - today.getDay());
        from.setHours(0, 0, 0, 0);
        to.setDate(from.getDate() + 6);
        to.setHours(23, 59, 59, 999);
        break;
      case 'next-7-days':
        from.setHours(0, 0, 0, 0);
        to.setDate(today.getDate() + 7);
        to.setHours(23, 59, 59, 999);
        break;
      case 'next-30-days':
        from.setHours(0, 0, 0, 0);
        to.setDate(today.getDate() + 30);
        to.setHours(23, 59, 59, 999);
        break;
      case 'next-90-days':
        from.setHours(0, 0, 0, 0);
        to.setDate(today.getDate() + 90);
        to.setHours(23, 59, 59, 999);
        break;
      default:
        return null;
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };

  // Handle date filter change
  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    if (filter === 'all') {
      setDateRange(null);
    } else if (filter === 'custom') {
      // Custom range will be set separately
      return;
    } else {
      const range = getDateRange(filter);
      setDateRange(range);
    }
  };

  // Build query parameters for tasks API
  const tasksQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('due_from', dateRange.from);
      params.append('due_to', dateRange.to);
    }
    return params.toString();
  }, [dateRange]);

  // Fetch actual tasks from database with date filtering
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['/api/tasks', tasksQueryParams],
    queryFn: async () => {
      const url = `/api/tasks${tasksQueryParams ? `?${tasksQueryParams}` : ''}`;
      const response = await fetch(url);
      return response.json();
    },
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache (replaces cacheTime in newer versions)
  });

  // Debug log to see if tasks are loading
  const tasksArray = Array.isArray(tasks) ? tasks : [];
  console.log('UltraFastTasks - Tasks loaded:', tasksArray.length, 'tasks');

  // Fetch properties for property names
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  // Fetch users for assignee names
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Type safe arrays
  const propertiesArray = Array.isArray(properties) ? properties : [];
  const usersArray = Array.isArray(users) ? users : [];

  // Create property lookup map
  const propertyMap = useMemo(() => {
    const map = new Map();
    propertiesArray.forEach((prop: any) => {
      map.set(prop.id, prop.name);
    });
    return map;
  }, [propertiesArray]);

  // Create user lookup map
  const userMap = useMemo(() => {
    const map = new Map();
    usersArray.forEach((user: any) => {
      map.set(user.id, user.name);
    });
    return map;
  }, [usersArray]);

  // Enhanced tasks with property and user names
  const enhancedTasks = useMemo(() => {
    return tasksArray.map((task: any) => ({
      ...task,
      propertyName: propertyMap.get(task.propertyId) || `Property ${task.propertyId}`,
      assigneeName: task.assignedTo ? (userMap.get(task.assignedTo) || 'Unknown User') : 'Unassigned',
    }));
  }, [tasksArray, propertyMap, userMap]);

  // Real-time filtering with actual data
  const filteredTasks = useMemo(() => {
    return enhancedTasks.filter((task: any) => {
      const matchesSearch = searchTerm === "" || 
        (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.propertyName && task.propertyName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesType = typeFilter === "all" || task.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [enhancedTasks, searchTerm, statusFilter, priorityFilter, typeFilter]);

  // Calculate real statistics
  const stats = useMemo(() => {
    return {
      totalTasks: enhancedTasks.length,
      pendingTasks: enhancedTasks.filter((t: any) => t.status === 'pending').length,
      inProgressTasks: enhancedTasks.filter((t: any) => t.status === 'in-progress').length,
      completedTasks: enhancedTasks.filter((t: any) => t.status === 'completed').length,
      overdueTasks: enhancedTasks.filter((t: any) => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date() && t.status !== 'completed';
      }).length,
      highPriorityTasks: enhancedTasks.filter((t: any) => t.priority === 'high' || t.priority === 'urgent').length,
    };
  }, [enhancedTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "in-progress": return <Wrench className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Task completion mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest('PUT', `/api/tasks/${taskId}`, { status: 'completed' });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      await queryClient.refetchQueries({ queryKey: ['/api/tasks'] });
      
      // Invalidate and refetch achievement cache
      if (user?.id) {
        console.log('🎮 Task completed! Invalidating achievement cache for user:', user.id);
        await queryClient.invalidateQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
        await queryClient.invalidateQueries({ queryKey: ["/api/achievements/definitions"] });
        await queryClient.refetchQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
      }
      
      toast({
        title: 'Success',
        description: 'Task completed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete task',
        variant: 'destructive',
      });
    },
  });

  // Task update mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest('PUT', `/api/tasks/${id}`, data);
    },
    onSuccess: async (response: any, variables: { id: number; data: any }) => {
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      await queryClient.refetchQueries({ queryKey: ['/api/tasks'] });
      
      // Invalidate and refetch achievement cache if task status changed to completed or approved
      if ((variables.data.status === 'completed' || variables.data.status === 'approved') && user?.id) {
        console.log('🎮 Task status updated! Invalidating achievement cache for user:', user.id, 'status:', variables.data.status);
        await queryClient.invalidateQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
        await queryClient.invalidateQueries({ queryKey: ["/api/achievements/definitions"] });
        await queryClient.refetchQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
      }
      
      setIsEditDialogOpen(false);
      setEditingTask(null);
      setEditForm({});
      setEvidencePhotos([]);
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    },
  });

  // Refresh tasks mutation
  const refreshTasksMutation = useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      return 'refreshed';
    },
    onSuccess: () => {
      toast({
        title: 'Tasks Refreshed',
        description: 'Task list updated with latest data',
      });
    },
  });

  // Bulk delete mutations
  const deleteExpiredMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/tasks/bulk-delete/expired');
      return response;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Expired tasks deleted",
        description: `Successfully deleted ${result?.deletedCount || 0} expired tasks`,
      });
      setIsBulkDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting expired tasks",
        description: error.message || 'Failed to delete expired tasks',
        variant: "destructive",
      });
    },
  });

  const deleteCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/tasks/bulk-delete/completed');
      return response;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Completed tasks deleted",
        description: `Successfully deleted ${result?.deletedCount || 0} completed tasks`,
      });
      setIsBulkDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting completed tasks",
        description: error.message || 'Failed to delete completed tasks',
        variant: "destructive",
      });
    },
  });

  const deleteOldMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/tasks/bulk-delete/old');
      return response;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Old tasks deleted",
        description: `Successfully deleted ${result?.deletedCount || 0} old tasks`,
      });
      setIsBulkDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting old tasks",
        description: error.message || 'Failed to delete old tasks',
        variant: "destructive",
      });
    },
  });

  const handleCompleteTask = (taskId: number) => {
    console.log("✅ Complete task button clicked! Task ID:", taskId);
    completeTaskMutation.mutate(taskId);
  };

  const handleEditTask = (taskId: number) => {
    console.log("🔧 Edit task button clicked! Task ID:", taskId);
    const task = enhancedTasks.find((t: any) => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setEditForm({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'maintenance',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        propertyId: task.propertyId || '',
      });
      setEvidencePhotos(task.evidencePhotos || []);
      setIsEditDialogOpen(true);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const MAX_PHOTOS = 6;
    const MAX_WIDTH = 1920; // Full HD width
    const MAX_HEIGHT = 1080; // Full HD height

    // Check if adding these files would exceed max photos
    if (evidencePhotos.length + files.length > MAX_PHOTOS) {
      toast({
        title: "Too many photos",
        description: `You can upload a maximum of ${MAX_PHOTOS} photos per task. Currently have ${evidencePhotos.length} photo(s).`,
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only .jpg and .png files are allowed",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const img = new Image();
          img.onload = () => {
            // Check dimensions (max Full HD: 1920 x 1080)
            if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
              toast({
                title: "Photo too large",
                description: `Photo dimensions must not exceed ${MAX_WIDTH}×${MAX_HEIGHT} pixels (Full HD). This photo is ${img.width}×${img.height} pixels.`,
                variant: "destructive",
              });
              return;
            }

            setEvidencePhotos(prev => [...prev, reader.result as string]);
          };
          img.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  const removePhoto = (index: number) => {
    setEvidencePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTask = () => {
    if (editingTask) {
      // Clean up the update data - convert dates and remove undefined values
      const updateData: any = {};
      
      if (editForm.title) updateData.title = editForm.title;
      if (editForm.description) updateData.description = editForm.description;
      if (editForm.type) updateData.type = editForm.type;
      if (editForm.priority) updateData.priority = editForm.priority;
      if (editForm.status) updateData.status = editForm.status;
      if (editForm.assignedTo) updateData.assignedTo = editForm.assignedTo;
      if (editForm.propertyId) updateData.propertyId = editForm.propertyId;
      if (editForm.dueDate) {
        // Convert date string to Date object
        updateData.dueDate = new Date(editForm.dueDate);
      }
      
      // Always include evidencePhotos to support deletions
      updateData.evidencePhotos = evidencePhotos;
      
      console.log('Sending update data:', updateData);
      
      updateTaskMutation.mutate({
        id: editingTask.id,
        data: updateData
      });
    }
  };

  const handleRefresh = () => {
    refreshTasksMutation.mutate();
  };

  const handleDeleteExpiredTasks = () => {
    deleteExpiredMutation.mutate();
  };

  const handleDeleteCompletedTasks = () => {
    deleteCompletedMutation.mutate();
  };

  const handleDeleteOldTasks = () => {
    deleteOldMutation.mutate();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Track and manage all property maintenance and operational tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshTasksMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshTasksMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log('Create Task button clicked');
                setIsCreateDialogOpen(true);
                console.log('Dialog state should be:', true);
              }}
              className="gap-2"
              data-testid="button-create-task"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
            <Button 
              onClick={() => setIsBulkDialogOpen(true)}
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Bulk Actions
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Recently finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriorityTasks}</div>
            <p className="text-xs text-muted-foreground">
              Urgent attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title, description, or property..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-44">
                <Calendar className="h-4 w-4 mr-2" />
                {dateFilter === 'all' && 'All Dates'}
                {dateFilter === 'today' && 'Today'}
                {dateFilter === 'this-week' && 'This Week'}
                {dateFilter === 'next-7-days' && 'Next 7 Days'}
                {dateFilter === 'next-30-days' && 'Next 30 Days'}
                {dateFilter === 'next-90-days' && 'Next 90 Days'}
                {dateFilter === 'custom' && 'Custom Range'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDateFilterChange('all')}>
                All Dates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange('this-week')}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange('next-7-days')}>
                Next 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange('next-30-days')}>
                Next 30 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange('next-90-days')}>
                Next 90 Days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="landscaping">Landscaping</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>
            Manage all property tasks and assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or create a new task.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{task.title || 'Untitled Task'}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {task.description || 'No description'}
                          </div>
                          {task.estimatedCost && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>฿{parseFloat(task.estimatedCost || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{task.propertyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{task.assigneeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {(task.type || '').replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority || 'medium')}>
                          {task.priority || 'medium'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status || 'pending')}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(task.status || 'pending')}
                            {(task.status || 'pending').replace('-', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTask(task.id)}
                          >
                            Edit
                          </Button>
                          {task.status !== 'completed' && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={completeTaskMutation.isPending}
                            >
                              {completeTaskMutation.isPending ? 'Completing...' : 'Complete'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <CreateTaskDialog 
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Bulk Actions Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Task Management</DialogTitle>
            <DialogDescription>
              Clean up old tasks to improve performance. We currently have {tasksArray.length} tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3">
              <Button 
                onClick={handleDeleteExpiredTasks}
                variant="destructive"
                className="w-full"
                disabled={deleteExpiredMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteExpiredMutation.isPending ? 'Deleting...' : 'Delete Expired Tasks (30+ days old)'}
              </Button>
              
              <Button 
                onClick={handleDeleteCompletedTasks}
                variant="outline"
                className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                disabled={deleteCompletedMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {deleteCompletedMutation.isPending ? 'Deleting...' : 'Delete All Completed Tasks'}
              </Button>
              
              <Button 
                onClick={handleDeleteOldTasks}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                disabled={deleteOldMutation.isPending}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {deleteOldMutation.isPending ? 'Deleting...' : 'Delete Tasks Older Than 90 Days'}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>• Expired tasks: Tasks older than 30 days</p>
              <p>• Completed tasks: All tasks marked as completed</p>
              <p>• Old tasks: All tasks older than 90 days regardless of status</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and save changes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right font-medium">
                Title
              </label>
              <Input
                id="title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right font-medium">
                Description
              </label>
              <Input
                id="description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="type" className="text-right font-medium">
                Type
              </label>
              <Select
                value={editForm.type || 'maintenance'}
                onValueChange={(value) => setEditForm({ ...editForm, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="setup">Setup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="priority" className="text-right font-medium">
                Priority
              </label>
              <Select
                value={editForm.priority || 'medium'}
                onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right font-medium">
                Status
              </label>
              <Select
                value={editForm.status || 'pending'}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="assignedTo" className="text-right font-medium">
                Assignee
              </label>
              <Select
                value={editForm.assignedTo || ''}
                onValueChange={(value) => setEditForm({ ...editForm, assignedTo: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {usersArray.filter((user: any) => user.role === 'staff' || user.role === 'admin').map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="dueDate" className="text-right font-medium">
                Due Date
              </label>
              <Input
                id="dueDate"
                type="date"
                value={editForm.dueDate || ''}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="propertyId" className="text-right font-medium">
                Property
              </label>
              <Select
                value={editForm.propertyId?.toString() || ''}
                onValueChange={(value) => setEditForm({ ...editForm, propertyId: parseInt(value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {propertiesArray.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Evidence Photos Upload Section */}
            {evidencePhotos.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right font-medium pt-2">
                  Evidence Photos
                </label>
                <div className="col-span-3">
                  <div className="grid grid-cols-3 gap-2">
                    {evidencePhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-photo-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="evidence-upload"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-evidence-upload"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('evidence-upload')?.click()}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={evidencePhotos.length >= 6}
                data-testid="button-upload-evidence"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Evidence
              </Button>
              <span className="text-xs text-gray-500">
                {evidencePhotos.length}/6 photos
              </span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEvidencePhotos([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTask}
                disabled={updateTaskMutation.isPending}
              >
                {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}