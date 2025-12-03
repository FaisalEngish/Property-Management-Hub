import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Play, 
  Square, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  User, 
  DollarSign,
  FileText,
  CheckCircle,
  Timer,
  Clock3,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface StaffWorkHours {
  id: number;
  organizationId: string;
  staffId: string;
  staffName: string;
  workDays: string[];
  normalStartTime: string;
  normalEndTime: string;
  baseMonthlySalary: string;
  overtimeRate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TaskTimeTracking {
  id: number;
  organizationId: string;
  staffId: string;
  taskId: number;
  taskName: string;
  location: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isOutsideNormalHours: boolean;
  isEmergencyTask: boolean;
  emergencyReason?: string;
  taskNotes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OvertimeHoursSummary {
  id: number;
  organizationId: string;
  staffId: string;
  staffName: string;
  monthYear: string;
  totalOvertimeMinutes: number;
  totalEmergencyTasks: number;
  totalRegularTasks: number;
  estimatedOvertimePay: string;
  status: string;
  approvedOvertimeMinutes?: number;
  unpaidOvertimeMinutes?: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffCommissionBonus {
  id: number;
  organizationId: string;
  staffId: string;
  staffName: string;
  monthYear: string;
  bonusType: string;
  amount: string;
  description: string;
  status: string;
  awardedBy: string;
  awardedAt?: string;
  createdAt: string;
}

interface EmergencyTaskReason {
  id: number;
  organizationId: string;
  category: string;
  reason: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function StaffOverhoursTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTimer, setActiveTimer] = useState<TaskTimeTracking | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [selectedTrackingId, setSelectedTrackingId] = useState<number | null>(null);

  // Current user data query
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Get active timer for current staff member
  const { data: timeTracking = [], refetch: refetchTimeTracking } = useQuery({
    queryKey: ["/api/staff-overhours/time-tracking"],
    enabled: !!user,
  });

  // Find active timer
  useEffect(() => {
    const active = timeTracking.find((timer: TaskTimeTracking) => timer.status === 'active');
    setActiveTimer(active || null);
  }, [timeTracking]);

  // Get overtime summary
  const { data: overtimeSummary = [] } = useQuery({
    queryKey: ["/api/staff-overhours/overtime-summary", { monthYear: selectedMonth }],
    enabled: !!user,
  });

  // Get commission bonuses
  const { data: commissionBonuses = [] } = useQuery({
    queryKey: ["/api/staff-overhours/commission-bonuses"],
    enabled: !!user,
  });

  // Get emergency task reasons
  const { data: emergencyReasons = [] } = useQuery({
    queryKey: ["/api/staff-overhours/emergency-reasons"],
    enabled: !!user,
  });

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async (data: { taskName: string; location: string }) => {
      return apiRequest("POST", "/api/staff-overhours/start-timer", data);
    },
    onSuccess: () => {
      toast({
        title: "Timer Started",
        description: "Task timer has been started successfully.",
      });
      refetchTimeTracking();
      setIsTimerDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start timer",
        variant: "destructive",
      });
    },
  });

  // End timer mutation
  const endTimerMutation = useMutation({
    mutationFn: async (data: { trackingId: number; taskNotes?: string }) => {
      return apiRequest("PATCH", `/api/staff-overhours/end-timer/${data.trackingId}`, {
        taskNotes: data.taskNotes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Timer Stopped",
        description: "Task has been completed and logged.",
      });
      refetchTimeTracking();
      queryClient.invalidateQueries({ queryKey: ["/api/staff-overhours/overtime-summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to stop timer",
        variant: "destructive",
      });
    },
  });

  // Mark as emergency mutation
  const markEmergencyMutation = useMutation({
    mutationFn: async (data: { trackingId: number; emergencyReason: string }) => {
      return apiRequest("PATCH", `/api/staff-overhours/mark-emergency/${data.trackingId}`, {
        emergencyReason: data.emergencyReason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Task Marked as Emergency",
        description: "Task has been flagged as emergency by management.",
      });
      refetchTimeTracking();
      setIsEmergencyDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark as emergency",
        variant: "destructive",
      });
    },
  });

  const handleStartTimer = (data: { taskName: string; location: string }) => {
    startTimerMutation.mutate(data);
  };

  const handleEndTimer = (taskNotes?: string) => {
    if (activeTimer) {
      endTimerMutation.mutate({ trackingId: activeTimer.id, taskNotes });
    }
  };

  const handleMarkEmergency = (emergencyReason: string) => {
    if (selectedTrackingId) {
      markEmergencyMutation.mutate({ trackingId: selectedTrackingId, emergencyReason });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimerDuration = () => {
    if (!activeTimer) return "00:00";
    const now = new Date();
    const start = new Date(activeTimer.startTime);
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return formatDuration(diffMinutes);
  };

  const filteredTimeTracking = timeTracking.filter((record: TaskTimeTracking) => {
    return record.startTime.startsWith(selectedMonth);
  });

  const overtimeMinutes = filteredTimeTracking
    .filter((record: TaskTimeTracking) => record.isOutsideNormalHours && record.duration)
    .reduce((sum: number, record: TaskTimeTracking) => sum + (record.duration || 0), 0);

  const emergencyTasks = filteredTimeTracking.filter((record: TaskTimeTracking) => record.isEmergencyTask).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Overhours & Emergency Task Tracker</h1>
          <p className="text-muted-foreground">Track your working hours and emergency tasks</p>
        </div>
        
        {/* Active Timer Display */}
        {activeTimer && (
          <Card className="w-72">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-red-500 animate-pulse" />
                  <div>
                    <p className="font-medium text-sm">{activeTimer.taskName}</p>
                    <p className="text-xs text-muted-foreground">{getTimerDuration()}</p>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Task</DialogTitle>
                      <DialogDescription>
                        Add any completion notes for "{activeTimer.taskName}"
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      const taskNotes = formData.get("taskNotes") as string;
                      handleEndTimer(taskNotes);
                    }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="taskNotes">Completion Notes (Optional)</Label>
                          <Textarea
                            id="taskNotes"
                            name="taskNotes"
                            placeholder="Any notes about the task completion..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <Button type="submit" disabled={endTimerMutation.isPending}>
                            {endTimerMutation.isPending ? "Stopping..." : "Complete Task"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="timer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer">⏱️ Timer</TabsTrigger>
          <TabsTrigger value="history">📋 History</TabsTrigger>
          <TabsTrigger value="overtime">💰 Overtime</TabsTrigger>
          <TabsTrigger value="bonuses">🎁 Bonuses</TabsTrigger>
        </TabsList>

        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Month Overtime:</span>
                  <span className="font-medium">{formatDuration(overtimeMinutes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Emergency Tasks:</span>
                  <span className="font-medium">{emergencyTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Tasks:</span>
                  <span className="font-medium">{filteredTimeTracking.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTimer ? (
                  <div className="space-y-2">
                    <Badge variant="destructive" className="animate-pulse">
                      Timer Active
                    </Badge>
                    <p className="text-sm">{activeTimer.taskName}</p>
                    <p className="text-xs text-muted-foreground">
                      Started: {format(new Date(activeTimer.startTime), 'HH:mm')}
                    </p>
                    {activeTimer.isOutsideNormalHours && (
                      <Badge variant="secondary">Outside Normal Hours</Badge>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="secondary">No Active Timer</Badge>
                    <p className="text-sm text-muted-foreground">Ready to start a new task</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Start Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={isTimerDialogOpen} onOpenChange={setIsTimerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={!!activeTimer || startTimerMutation.isPending}
                    >
                      {activeTimer ? "Timer Already Active" : "Start New Task"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Task Timer</DialogTitle>
                      <DialogDescription>
                        Enter task details to begin time tracking
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      const taskName = formData.get("taskName") as string;
                      const location = formData.get("location") as string;
                      handleStartTimer({ taskName, location });
                    }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="taskName">Task Name *</Label>
                          <Input
                            id="taskName"
                            name="taskName"
                            placeholder="e.g., Maintenance repair, Emergency cleaning"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            name="location"
                            placeholder="e.g., Villa A, Pool area, Main office"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" type="button" onClick={() => setIsTimerDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={startTimerMutation.isPending}>
                            {startTimerMutation.isPending ? "Starting..." : "Start Timer"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Task History</h3>
            <div className="flex items-center space-x-2">
              <Label htmlFor="monthFilter">Month:</Label>
              <Input
                id="monthFilter"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredTimeTracking.map((record: TaskTimeTracking) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{record.taskName}</h4>
                        {record.status === 'active' && (
                          <Badge variant="destructive" className="animate-pulse">Active</Badge>
                        )}
                        {record.status === 'completed' && (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                        {record.isEmergencyTask && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                        {record.isOutsideNormalHours && (
                          <Badge variant="outline">Overtime</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Location:</strong> {record.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Started:</strong> {format(new Date(record.startTime), 'MMM dd, yyyy HH:mm')}
                        {record.endTime && (
                          <span> | <strong>Ended:</strong> {format(new Date(record.endTime), 'HH:mm')}</span>
                        )}
                      </p>
                      {record.duration && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Duration:</strong> {formatDuration(record.duration)}
                        </p>
                      )}
                      {record.emergencyReason && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Emergency Reason:</strong> {record.emergencyReason}
                        </p>
                      )}
                      {record.taskNotes && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {record.taskNotes}
                        </p>
                      )}
                    </div>
                    
                    {user?.role !== 'staff' && record.status === 'completed' && !record.isEmergencyTask && (
                      <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedTrackingId(record.id)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Mark Emergency
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Mark Task as Emergency</DialogTitle>
                            <DialogDescription>
                              Select the reason why this task should be classified as emergency
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            const emergencyReason = formData.get("emergencyReason") as string;
                            handleMarkEmergency(emergencyReason);
                          }}>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="emergencyReason">Emergency Reason *</Label>
                                <Select name="emergencyReason" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select emergency reason" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {emergencyReasons.map((reason: EmergencyTaskReason) => (
                                      <SelectItem key={reason.id} value={reason.reason}>
                                        {reason.reason} ({reason.category})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => setIsEmergencyDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={markEmergencyMutation.isPending}>
                                  {markEmergencyMutation.isPending ? "Marking..." : "Mark as Emergency"}
                                </Button>
                              </div>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTimeTracking.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks recorded</h3>
                  <p className="text-muted-foreground">
                    No task records found for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Overtime Tab */}
        <TabsContent value="overtime" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Overtime Summary</h3>
          </div>

          <div className="space-y-4">
            {overtimeSummary.map((summary: OvertimeHoursSummary) => (
              <Card key={summary.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        {format(new Date(summary.monthYear + '-01'), 'MMMM yyyy')}
                      </h4>
                      <Badge variant={summary.status === 'approved' ? 'default' : 'secondary'}>
                        {summary.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Overtime Hours</p>
                      <p className="text-lg font-medium">
                        {formatDuration(summary.totalOvertimeMinutes)}
                      </p>
                      {summary.approvedOvertimeMinutes && (
                        <p className="text-sm text-green-600">
                          Approved: {formatDuration(summary.approvedOvertimeMinutes)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Tasks</p>
                      <p className="text-lg font-medium">
                        {summary.totalEmergencyTasks + summary.totalRegularTasks}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {summary.totalEmergencyTasks} emergency
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Pay</p>
                      <p className="text-lg font-medium text-green-600">
                        ฿{parseFloat(summary.estimatedOvertimePay).toLocaleString()}
                      </p>
                      {summary.approvedAt && (
                        <p className="text-xs text-muted-foreground">
                          Approved by {summary.approvedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {overtimeSummary.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No overtime recorded</h3>
                  <p className="text-muted-foreground">
                    No overtime hours found. Complete tasks outside normal hours to see overtime tracking.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bonuses Tab */}
        <TabsContent value="bonuses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Commission Bonuses</h3>
          </div>

          <div className="space-y-4">
            {commissionBonuses.map((bonus: StaffCommissionBonus) => (
              <Card key={bonus.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{bonus.bonusType}</h4>
                        <Badge variant={bonus.status === 'approved' ? 'default' : 'secondary'}>
                          {bonus.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{bonus.description}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Month:</strong> {format(new Date(bonus.monthYear + '-01'), 'MMMM yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Awarded by:</strong> {bonus.awardedBy}
                      </p>
                      {bonus.awardedAt && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Date:</strong> {format(new Date(bonus.awardedAt), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ฿{parseFloat(bonus.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {commissionBonuses.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bonuses awarded</h3>
                  <p className="text-muted-foreground">
                    Commission bonuses will appear here when awarded by management.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}