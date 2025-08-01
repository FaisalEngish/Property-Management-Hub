import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Circle,
  AlertCircle,
  Camera,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns";

interface Task {
  id: number;
  reservationId: string;
  taskType: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  assignedRole: string;
  assignedTo: string;
  property: string;
  propertyId: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "critical";
  evidenceRequired: boolean;
  guestVisible?: boolean;
  requiresPhotoUpload?: boolean;
  photoFields?: string[];
  checkInDetails?: any;
  checkOutDetails?: any;
}

interface ScheduleTabProps {
  userRole: string;
  userId?: string;
  propertyFilter?: number;
  guestView?: boolean;
  reservationId?: string;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const statusColors = {
  scheduled: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800"
};

const statusIcons = {
  scheduled: Circle,
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: AlertCircle
};

const taskTypeIcons = {
  housekeeping: "🧹",
  pool: "🏊",
  garden: "🌿",
  "pest-control": "🐛",
  host: "🏠",
  catering: "👨‍🍳",
  maintenance: "🔧",
  inspection: "🔍"
};

export default function ScheduleTab({ userRole, userId, propertyFilter, guestView = false, reservationId }: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch tasks from comprehensive scheduling API
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks/scheduled", userRole, propertyFilter, format(selectedDate, 'yyyy-MM-dd'), reservationId, viewMode],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add role-based filtering
      if (userRole && userRole !== 'admin' && userRole !== 'portfolio-manager') {
        params.append("assignedRole", userRole);
      }
      
      // Add property filter
      if (propertyFilter) {
        params.append("propertyId", propertyFilter.toString());
      }
      
      // Add reservation filter for guest view
      if (reservationId) {
        params.append("reservationId", reservationId);
      }
      
      // Add guest visibility filter
      if (guestView) {
        params.append("guestVisible", "true");
      }
      
      // Add date range based on view mode
      if (viewMode === "day") {
        params.append("date", format(selectedDate, 'yyyy-MM-dd'));
      } else if (viewMode === "week") {
        params.append("startDate", format(startOfWeek(selectedDate), 'yyyy-MM-dd'));
        params.append("endDate", format(endOfWeek(selectedDate), 'yyyy-MM-dd'));
      } else if (viewMode === "month") {
        params.append("startDate", format(startOfMonth(selectedDate), 'yyyy-MM-dd'));
        params.append("endDate", format(endOfMonth(selectedDate), 'yyyy-MM-dd'));
      }

      const response = await fetch(`/api/tasks/scheduled?${params}`);
      if (!response.ok) {
        console.error('Failed to fetch tasks');
        return [];
      }
      return response.json();
    }
  });

  // Filter tasks based on view mode and selected date
  const getFilteredTasks = () => {
    let filtered = tasks as Task[];

    // Role-based filtering
    if (guestView && reservationId) {
      filtered = filtered.filter(task => 
        task.reservationId === reservationId && task.guestVisible === true
      );
    } else {
      // Apply role-based visibility
      filtered = filtered.filter(task => {
        if (userRole === 'admin' || userRole === 'host') return true;
        if (userRole === 'portfolio-manager') return true;
        if (userRole === 'staff') return ['housekeeping', 'pool-staff', 'garden', 'pest-control', 'maintenance'].includes(task.assignedRole);
        if (userRole === 'housekeeping') return task.assignedRole === 'housekeeping';
        if (userRole === 'pool-staff') return task.assignedRole === 'pool-staff';
        if (userRole === 'garden') return task.assignedRole === 'garden';
        if (userRole === 'pest-control') return task.assignedRole === 'pest-control';
        return false;
      });
    }

    // Property filter
    if (propertyFilter) {
      filtered = filtered.filter(task => task.propertyId === propertyFilter);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Date filtering based on view mode
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    switch (viewMode) {
      case "day":
        filtered = filtered.filter(task => task.scheduledDate === selectedDateStr);
        break;
      case "week":
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.scheduledDate);
          return taskDate >= weekStart && taskDate <= weekEnd;
        });
        break;
      case "month":
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.scheduledDate);
          return taskDate >= monthStart && taskDate <= monthEnd;
        });
        break;
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const filteredTasks = getFilteredTasks();

  // Navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    switch (viewMode) {
      case "day":
        setSelectedDate(prev => addDays(prev, direction === "next" ? 1 : -1));
        break;
      case "week":
        setSelectedDate(prev => addDays(prev, direction === "next" ? 7 : -7));
        break;
      case "month":
        setSelectedDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
          return newDate;
        });
        break;
    }
  };

  const getDateRangeText = () => {
    switch (viewMode) {
      case "day":
        return format(selectedDate, "EEEE, MMMM d, yyyy");
      case "week":
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(selectedDate, "MMMM yyyy");
    }
  };

  const renderTaskCard = (task: Task) => {
    const StatusIcon = statusIcons[task.status];
    const taskIcon = taskTypeIcons[task.taskType as keyof typeof taskTypeIcons] || "📋";

    return (
      <Card key={task.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{taskIcon}</span>
              <div>
                <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                <CardDescription className="text-xs">
                  {task.property} • {task.assignedTo}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{task.scheduledTime} ({task.duration})</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{task.property}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{task.assignedTo}</span>
            </div>
            {task.description && (
              <p className="text-xs text-gray-500 mt-2">{task.description}</p>
            )}
          </div>

          {/* Task Details */}
          {(task.checkInDetails || task.checkOutDetails) && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
              {task.checkInDetails && (
                <div>
                  <strong>Check-in:</strong> {task.checkInDetails.guestName} • 
                  {task.checkInDetails.numberOfGuests} guests • 
                  {task.checkInDetails.depositAmount} {task.checkInDetails.depositCurrency}
                </div>
              )}
              {task.checkOutDetails && (
                <div>
                  <strong>Check-out:</strong> {task.checkOutDetails.guestName} • 
                  {task.checkOutDetails.checkOutTime}
                </div>
              )}
            </div>
          )}

          {/* Evidence/Photo Upload */}
          {(task.evidenceRequired || task.requiresPhotoUpload) && !guestView && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Camera className="w-4 h-4" />
                <span>
                  {task.requiresPhotoUpload ? 
                    `Photo required: ${task.photoFields?.join(', ')}` : 
                    'Evidence required'
                  }
                </span>
              </div>
              {task.status === 'in_progress' && (
                <Button size="sm" variant="outline">
                  Upload Evidence
                </Button>
              )}
            </div>
          )}

          {/* Guest View - Simpler display */}
          {guestView && (
            <div className="mt-2 text-xs text-blue-600">
              Service scheduled during your stay
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Schedule</h2>
          <p className="text-sm text-gray-500">
            {guestView ? "Upcoming services during your stay" : "Task schedule and assignments"}
          </p>
        </div>

        {!guestView && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterStatus(filterStatus === "all" ? "scheduled" : "all")}
            >
              <Filter className="w-4 h-4 mr-2" />
              {filterStatus === "all" ? "All Tasks" : "Scheduled Only"}
            </Button>
          </div>
        )}
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h3 className="text-lg font-medium">{getDateRangeText()}</h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Task Content */}
        <TabsContent value="day" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p>No tasks scheduled for {format(selectedDate, "MMMM d, yyyy")}</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map(renderTaskCard)
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p>No tasks scheduled for this week</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Group tasks by day */}
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(startOfWeek(selectedDate), i);
                const dayTasks = filteredTasks.filter(task => 
                  task.scheduledDate === format(date, 'yyyy-MM-dd')
                );
                
                if (dayTasks.length === 0) return null;
                
                return (
                  <div key={i}>
                    <h4 className="font-medium text-gray-700 mb-2">
                      {format(date, "EEEE, MMM d")}
                    </h4>
                    {dayTasks.map(renderTaskCard)}
                  </div>
                );
              })}
            </>
          )}
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p>No tasks scheduled for {format(selectedDate, "MMMM yyyy")}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Group tasks by date */}
              {Object.entries(
                filteredTasks.reduce((groups, task) => {
                  const date = task.scheduledDate;
                  if (!groups[date]) groups[date] = [];
                  groups[date].push(task);
                  return groups;
                }, {} as Record<string, Task[]>)
              ).map(([date, dayTasks]) => (
                <div key={date}>
                  <h4 className="font-medium text-gray-700 mb-2">
                    {format(new Date(date), "EEEE, MMM d")}
                  </h4>
                  {dayTasks.map(renderTaskCard)}
                </div>
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats for non-guest views */}
      {!guestView && filteredTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold">{filteredTasks.length}</div>
                <div className="text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-600">
                  {filteredTasks.filter(t => t.status === 'scheduled').length}
                </div>
                <div className="text-gray-500">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {filteredTasks.filter(t => t.status === 'in_progress').length}
                </div>
                <div className="text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-gray-500">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}