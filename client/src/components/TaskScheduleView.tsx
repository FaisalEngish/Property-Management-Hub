import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar as CalendarIcon, 
  List, 
  Grid3X3, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Camera,
  FileText,
  Building,
  Users,
  Target
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addDays, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  title: string;
  description: string;
  department: 'housekeeping' | 'garden' | 'pool' | 'pest' | 'host' | 'maintenance' | 'admin';
  taskType: string;
  property: string;
  propertyId: number;
  assignedTo: string;
  assignedToId: string;
  priority: 'urgent' | 'routine' | 'recurring';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'overdue';
  scheduledDate: Date;
  scheduledTime: string;
  estimatedDuration: number; // minutes
  completedAt?: Date;
  photos?: string[];
  notes?: string;
  confirmReceived?: boolean;
  createdBy: string;
  attachments?: string[];
}

interface TaskScheduleViewProps {
  userRole: 'admin' | 'portfolio-manager' | 'staff';
  staffDepartment?: string;
  onTaskUpdate?: (taskId: number, updates: Partial<Task>) => void;
  onExportTasks?: (tasks: Task[]) => void;
}

// Tasks will be fetched from API - no mock data with hardcoded properties
const mockTasks: Task[] = [];

const departmentColors = {
  housekeeping: 'bg-blue-100 text-blue-800 border-blue-200',
  garden: 'bg-green-100 text-green-800 border-green-200',
  pool: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  pest: 'bg-orange-100 text-orange-800 border-orange-200',
  host: 'bg-purple-100 text-purple-800 border-purple-200',
  maintenance: 'bg-red-100 text-red-800 border-red-200',
  admin: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  routine: 'bg-blue-100 text-blue-800 border-blue-200',
  recurring: 'bg-green-100 text-green-800 border-green-200'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200'
};

export default function TaskScheduleView({ 
  userRole, 
  staffDepartment, 
  onTaskUpdate,
  onExportTasks 
}: TaskScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter tasks based on current filters and user role
  const filteredTasks = useMemo(() => {
    let tasks = mockTasks;

    // Role-based filtering
    if (userRole === 'staff' && staffDepartment) {
      tasks = tasks.filter(task => task.department === staffDepartment);
    }

    // Date filtering
    const now = new Date();
    if (timeFilter === 'today') {
      tasks = tasks.filter(task => isSameDay(task.scheduledDate, now));
    } else if (timeFilter === 'week') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      tasks = tasks.filter(task => 
        task.scheduledDate >= weekStart && task.scheduledDate <= weekEnd
      );
    } else if (timeFilter === 'month') {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      tasks = tasks.filter(task => 
        task.scheduledDate >= monthStart && task.scheduledDate <= monthEnd
      );
    }

    // Other filters
    if (searchTerm) {
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      tasks = tasks.filter(task => task.department === departmentFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        tasks = tasks.filter(task => !['completed'].includes(task.status));
      } else {
        tasks = tasks.filter(task => task.status === statusFilter);
      }
    }

    if (priorityFilter !== 'all') {
      tasks = tasks.filter(task => task.priority === priorityFilter);
    }

    if (propertyFilter !== 'all') {
      tasks = tasks.filter(task => task.property === propertyFilter);
    }

    // Show/hide completed based on toggle
    if (!showCompleted) {
      tasks = tasks.filter(task => task.status !== 'completed');
    }

    return tasks;
  }, [timeFilter, searchTerm, departmentFilter, statusFilter, priorityFilter, propertyFilter, userRole, staffDepartment, showCompleted]);

  const handleTaskAction = (taskId: number, action: 'confirm' | 'start' | 'complete', additionalData?: any) => {
    const updates: Partial<Task> = {};
    
    switch (action) {
      case 'confirm':
        updates.status = 'confirmed';
        updates.confirmReceived = true;
        break;
      case 'start':
        updates.status = 'in_progress';
        break;
      case 'complete':
        updates.status = 'completed';
        updates.completedAt = new Date();
        if (additionalData?.photos) updates.photos = additionalData.photos;
        if (additionalData?.notes) updates.notes = additionalData.notes;
        break;
    }

    onTaskUpdate?.(taskId, updates);
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm">{task.title}</h3>
              <Badge className={cn("text-xs", departmentColors[task.department])}>
                {task.department}
              </Badge>
              <Badge className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              <Badge className={cn("text-xs", statusColors[task.status])}>
                {task.status}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.scheduledTime} ({task.estimatedDuration}min)
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {task.property}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.assignedTo}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 ml-4">
            {userRole === 'staff' && task.status === 'pending' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleTaskAction(task.id, 'confirm')}
              >
                Confirm
              </Button>
            )}
            
            {userRole === 'staff' && task.status === 'confirmed' && (
              <Button 
                size="sm"
                onClick={() => handleTaskAction(task.id, 'start')}
              >
                Start
              </Button>
            )}
            
            {userRole === 'staff' && task.status === 'in_progress' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="default">
                    Complete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Task</DialogTitle>
                  </DialogHeader>
                  <TaskCompletionForm 
                    task={task} 
                    onComplete={(data) => handleTaskAction(task.id, 'complete', data)}
                  />
                </DialogContent>
              </Dialog>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Task Details</DialogTitle>
                </DialogHeader>
                <TaskDetailsView task={task} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {task.confirmReceived && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Confirmed by staff
          </div>
        )}
        
        {task.completedAt && (
          <div className="mt-2 p-2 bg-green-50 rounded text-xs">
            <div className="flex items-center gap-1 text-green-700 mb-1">
              <CheckCircle className="h-3 w-3" />
              Completed at {format(task.completedAt, 'MMM dd, HH:mm')}
            </div>
            {task.notes && <p className="text-green-600">{task.notes}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CalendarView = () => (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfWeek(new Date()), i);
        const dayTasks = filteredTasks.filter(task => isSameDay(task.scheduledDate, date));
        
        return (
          <Card key={i} className={cn("p-3", isToday(date) && "border-primary")}>
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm">
                {format(date, 'EEE dd')}
                {isToday(date) && <Badge className="ml-2 text-xs">Today</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              {dayTasks.map(task => (
                <div 
                  key={task.id}
                  className={cn(
                    "p-2 rounded text-xs cursor-pointer",
                    departmentColors[task.department]
                  )}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="font-medium">{task.scheduledTime}</div>
                  <div className="truncate">{task.title}</div>
                  <div className="text-xs opacity-75">{task.property}</div>
                </div>
              ))}
              {dayTasks.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No tasks</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Schedule</h2>
          <p className="text-muted-foreground">
            {userRole === 'staff' ? `Your ${staffDepartment} tasks` : 'Team task overview'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          
          {onExportTasks && (
            <Button variant="outline" size="sm" onClick={() => onExportTasks(filteredTasks)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Time Filter Tabs */}
      <Tabs value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {userRole !== 'staff' && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="garden">Garden</SelectItem>
                  <SelectItem value="pool">Pool</SelectItem>
                  <SelectItem value="pest">Pest Control</SelectItem>
                  <SelectItem value="host">Host Services</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCompleted"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showCompleted" className="text-sm">Show Completed</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{filteredTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">
                  {filteredTasks.filter(t => t.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {filteredTasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main View */}
      {viewMode === 'list' ? (
        <ScrollArea className="h-[600px] pr-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or time range.
              </p>
            </div>
          )}
        </ScrollArea>
      ) : (
        <CalendarView />
      )}

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            <TaskDetailsView task={selectedTask} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Task Completion Form Component
function TaskCompletionForm({ task, onComplete }: { task: Task; onComplete: (data: any) => void }) {
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = () => {
    onComplete({ notes, photos });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Completion Notes</label>
        <textarea
          className="w-full mt-1 p-2 border rounded"
          placeholder="Add any notes about the task completion..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Photo Evidence</label>
        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Upload completion photos</p>
          <Button variant="outline" size="sm" className="mt-2">
            Select Photos
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onComplete({})}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Mark Complete
        </Button>
      </div>
    </div>
  );
}

// Task Details View Component
function TaskDetailsView({ task }: { task: Task }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Department</label>
          <Badge className={cn("mt-1", departmentColors[task.department])}>
            {task.department}
          </Badge>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Priority</label>
          <Badge className={cn("mt-1", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-muted-foreground">Description</label>
        <p className="mt-1">{task.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Property</label>
          <p className="mt-1">{task.property}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
          <p className="mt-1">{task.assignedTo}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Scheduled Time</label>
          <p className="mt-1">{task.scheduledTime}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Duration</label>
          <p className="mt-1">{task.estimatedDuration} minutes</p>
        </div>
      </div>
      
      {task.attachments && task.attachments.length > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Attachments</label>
          <div className="mt-1 space-y-1">
            {task.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                {attachment}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {task.completedAt && (
        <>
          <Separator />
          <div>
            <label className="text-sm font-medium text-muted-foreground">Completion Details</label>
            <p className="mt-1 text-sm">Completed on {format(task.completedAt, 'MMM dd, yyyy HH:mm')}</p>
            {task.notes && <p className="mt-2">{task.notes}</p>}
          </div>
          
          {task.photos && task.photos.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Photos</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {task.photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}