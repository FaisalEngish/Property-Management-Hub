import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Users,
  Building,
  ClipboardList,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays, subDays } from "date-fns";
import { BackButton } from "@/components/BackButton";

interface DailyOperationsSummary {
  id: number;
  organizationId: string;
  operationDate: string;
  cleaningTasks: number;
  cleaningCompleted: number;
  poolTasks: number;
  poolCompleted: number;
  gardenTasks: number;
  gardenCompleted: number;
  maintenanceTasks: number;
  maintenanceCompleted: number;
  generalTasks: number;
  generalCompleted: number;
  overdueTasks: number;
  tasksWithoutProof: number;
  uncleanedCheckinProperties: number;
  unassignedTasks: number;
  totalStaffScheduled: number;
  totalTasksAssigned: number;
  lastUpdated: string;
  createdAt: string;
}

interface DailyStaffAssignments {
  id: number;
  organizationId: string;
  staffId: string;
  operationDate: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  isAvailable: boolean;
  unavailableReason: string | null;
  totalTasksAssigned: number;
  totalTasksCompleted: number;
  departmentFocus: string | null;
  avgTaskCompletionTime: number | null;
  taskCompletionRate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DailyPropertyOperations {
  id: number;
  organizationId: string;
  propertyId: number;
  operationDate: string;
  hasCheckin: boolean;
  checkinTime: string | null;
  hasCheckout: boolean;
  checkoutTime: string | null;
  needsCleaning: boolean;
  cleaningCompleted: boolean;
  cleaningCompletedAt: string | null;
  cleaningStaffId: string | null;
  maintenanceTasks: number;
  maintenanceCompleted: number;
  maintenanceOverdue: number;
  recurringServices: number;
  recurringCompleted: number;
  isUrgent: boolean;
  urgencyReason: string | null;
  operationStatus: string;
  statusNotes: string | null;
  lastUpdated: string;
  createdAt: string;
  propertyName?: string;
  propertyAddress?: string;
}

interface OperationsTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  department: string | null;
  propertyId: number | null;
  assignedTo: string | null;
  dueDate: string | null;
  evidencePhotos: any[] | null;
  createdAt: string;
  propertyName: string | null;
  assignedUserName: string | null;
  isOverdue: boolean;
  hasProof: boolean;
}

export default function DailyOperationsDashboard() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [refreshing, setRefreshing] = useState(false);

  // Fetch daily operations summary (prioritized - loads first)
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery<DailyOperationsSummary>({
    queryKey: ["/api/daily-operations/summary", selectedDate],
    enabled: !!selectedDate,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch staff assignments (lazy load after summary)
  const { data: staffAssignments, isLoading: staffLoading } = useQuery<
    DailyStaffAssignments[]
  >({
    queryKey: ["/api/daily-operations/staff", selectedDate],
    enabled: !!selectedDate && !!summary,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch property operations (lazy load after summary)
  const { data: propertyOps, isLoading: propertyLoading } = useQuery<
    DailyPropertyOperations[]
  >({
    queryKey: ["/api/daily-operations/properties", selectedDate],
    enabled: !!selectedDate && !!summary,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch tasks (lazy load after summary)
  const { data: tasks, isLoading: tasksLoading } = useQuery<OperationsTask[]>({
    queryKey: ["/api/daily-operations/tasks", selectedDate],
    enabled: !!selectedDate && !!summary,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Refresh data mutation
  const refreshMutation = useMutation({
    mutationFn: async (date: string) => {
      return await apiRequest("POST", `/api/daily-operations/refresh/${date}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-operations"] });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMutation.mutateAsync(selectedDate);
    } finally {
      setRefreshing(false);
    }
  };

  const getDateNavigation = () => {
    const prevDate = format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd");
    const nextDate = format(addDays(new Date(selectedDate), 1), "yyyy-MM-dd");

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(prevDate)}
        >
          Previous Day
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(nextDate)}
        >
          Next Day
        </Button>
      </div>
    );
  };

  const getDepartmentIcon = (department: string) => {
    switch (department?.toLowerCase()) {
      case "cleaning":
        return "🧹";
      case "pool":
        return "🏊";
      case "garden":
        return "🌿";
      case "maintenance":
        return "🔧";
      default:
        return "📋";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      completed: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: { [key: string]: string } = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={variants[priority] || "bg-gray-100 text-gray-800"}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  // Improved loading states
  const isInitialLoading = summaryLoading;
  const isDataLoading = staffLoading || propertyLoading || tasksLoading;

  if (isInitialLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-3 left-0 z-50">
        <BackButton
          fallbackRoute="/dashboard-hub"
          variant="ghost"
          className="!p-2 !rounded-md bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm"
        >
          <span className="hidden sm:inline text-sm">Back to Dashboard</span>
        </BackButton>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center pt-12">
        <div className="mt-3">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-8 w-8" />
            Daily Operations Dashboard
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(selectedDate), "EEEE, MMMM do, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getDateNavigation()}
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalTasksAssigned}
              </div>
              <p className="text-xs text-muted-foreground">
                Assigned across all departments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Staff Scheduled
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalStaffScheduled}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for operations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Urgency Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.overdueTasks +
                  summary.uncleanedCheckinProperties +
                  summary.unassignedTasks}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Properties Active
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {propertyOps?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                With scheduled operations
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tasks">Task Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Department Breakdown</CardTitle>
                <CardDescription>Task completion by department</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        🧹 Cleaning
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {summary.cleaningCompleted}/{summary.cleaningTasks}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${summary.cleaningTasks > 0 ? (summary.cleaningCompleted / summary.cleaningTasks) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">🏊 Pool</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {summary.poolCompleted}/{summary.poolTasks}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-cyan-600 h-2 rounded-full"
                            style={{
                              width: `${summary.poolTasks > 0 ? (summary.poolCompleted / summary.poolTasks) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">🌿 Garden</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {summary.gardenCompleted}/{summary.gardenTasks}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${summary.gardenTasks > 0 ? (summary.gardenCompleted / summary.gardenTasks) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        🔧 Maintenance
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {summary.maintenanceCompleted}/
                          {summary.maintenanceTasks}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${summary.maintenanceTasks > 0 ? (summary.maintenanceCompleted / summary.maintenanceTasks) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        📋 General
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {summary.generalCompleted}/{summary.generalTasks}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-600 h-2 rounded-full"
                            style={{
                              width: `${summary.generalTasks > 0 ? (summary.generalCompleted / summary.generalTasks) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Urgency Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Urgency Alerts
                </CardTitle>
                <CardDescription>
                  Items requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary && (
                  <>
                    {summary.overdueTasks > 0 && (
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-red-800">Overdue Tasks</span>
                        <Badge className="bg-red-100 text-red-800">
                          {summary.overdueTasks}
                        </Badge>
                      </div>
                    )}
                    {summary.uncleanedCheckinProperties > 0 && (
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-800">
                          Uncleaned Check-ins
                        </span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {summary.uncleanedCheckinProperties}
                        </Badge>
                      </div>
                    )}
                    {summary.unassignedTasks > 0 && (
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-800">
                          Unassigned Tasks
                        </span>
                        <Badge className="bg-orange-100 text-orange-800">
                          {summary.unassignedTasks}
                        </Badge>
                      </div>
                    )}
                    {summary.tasksWithoutProof > 0 && (
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-800">
                          Tasks Missing Proof
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {summary.tasksWithoutProof}
                        </Badge>
                      </div>
                    )}
                    {summary.overdueTasks === 0 &&
                      summary.uncleanedCheckinProperties === 0 &&
                      summary.unassignedTasks === 0 &&
                      summary.tasksWithoutProof === 0 && (
                        <div className="flex items-center justify-center p-4 text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          All operations on track
                        </div>
                      )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🧹 Cleaning Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tasks:</span>
                        <span className="font-semibold">
                          {summary.cleaningTasks}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-semibold text-green-600">
                          {summary.cleaningCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span className="font-semibold">
                          {summary.cleaningTasks > 0
                            ? Math.round(
                                (summary.cleaningCompleted /
                                  summary.cleaningTasks) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🔧 Maintenance Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tasks:</span>
                        <span className="font-semibold">
                          {summary.maintenanceTasks}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-semibold text-green-600">
                          {summary.maintenanceCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span className="font-semibold">
                          {summary.maintenanceTasks > 0
                            ? Math.round(
                                (summary.maintenanceCompleted /
                                  summary.maintenanceTasks) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🏊 Pool Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tasks:</span>
                        <span className="font-semibold">
                          {summary.poolTasks}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-semibold text-green-600">
                          {summary.poolCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span className="font-semibold">
                          {summary.poolTasks > 0
                            ? Math.round(
                                (summary.poolCompleted / summary.poolTasks) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Assignments</CardTitle>
              <CardDescription>
                Daily staff scheduling and workload
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : staffAssignments && staffAssignments.length > 0 ? (
                <div className="space-y-4">
                  {staffAssignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">
                          Staff Member #{assignment.staffId}
                        </h4>
                        <Badge
                          className={
                            assignment.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {assignment.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Shift:</span>
                          <p>
                            {assignment.shiftStart && assignment.shiftEnd
                              ? `${assignment.shiftStart} - ${assignment.shiftEnd}`
                              : "Not set"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Tasks Assigned:
                          </span>
                          <p className="font-semibold">
                            {assignment.totalTasksAssigned}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Tasks Completed:
                          </span>
                          <p className="font-semibold text-green-600">
                            {assignment.totalTasksCompleted}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Department Focus:
                          </span>
                          <p>{assignment.departmentFocus || "General"}</p>
                        </div>
                      </div>
                      {assignment.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="text-muted-foreground">Notes:</span>{" "}
                          {assignment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No staff assignments found for this date
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Operations</CardTitle>
              <CardDescription>
                Daily property status and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertyLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : propertyOps && propertyOps.length > 0 ? (
                <div className="space-y-4">
                  {propertyOps.map((property) => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {property.propertyName ||
                              `Property #${property.propertyId}`}
                          </h4>
                          {property.propertyAddress && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.propertyAddress}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(property.operationStatus)}
                          {property.isUrgent && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Check-in/out:
                          </span>
                          <div className="flex gap-2">
                            {property.hasCheckin && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Check-in
                              </Badge>
                            )}
                            {property.hasCheckout && (
                              <Badge className="bg-purple-100 text-purple-800">
                                Check-out
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Cleaning:
                          </span>
                          <p
                            className={
                              property.cleaningCompleted
                                ? "text-green-600 font-semibold"
                                : property.needsCleaning
                                  ? "text-red-600 font-semibold"
                                  : ""
                            }
                          >
                            {property.cleaningCompleted
                              ? "Completed"
                              : property.needsCleaning
                                ? "Required"
                                : "Not needed"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Maintenance:
                          </span>
                          <p>
                            {property.maintenanceCompleted}/
                            {property.maintenanceTasks}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Services:
                          </span>
                          <p>
                            {property.recurringCompleted}/
                            {property.recurringServices}
                          </p>
                        </div>
                      </div>

                      {property.urgencyReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                          <span className="text-red-800 font-semibold">
                            Urgency:
                          </span>{" "}
                          {property.urgencyReason.replace("_", " ")}
                        </div>
                      )}

                      {property.statusNotes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="text-muted-foreground">Notes:</span>{" "}
                          {property.statusNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No property operations found for this date
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                All tasks scheduled for this date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {getDepartmentIcon(task.department || "general")}{" "}
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                          {task.isOverdue && (
                            <Badge className="bg-red-100 text-red-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Property:
                          </span>
                          <p>{task.propertyName || "Unassigned"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Assigned to:
                          </span>
                          <p>{task.assignedUserName || "Unassigned"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Due Date:
                          </span>
                          <p>
                            {task.dueDate
                              ? format(new Date(task.dueDate), "MMM dd, HH:mm")
                              : "No deadline"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Proof Photos:
                          </span>
                          <p
                            className={
                              task.hasProof ? "text-green-600" : "text-red-600"
                            }
                          >
                            {task.hasProof ? "Available" : "Missing"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found for this date
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
