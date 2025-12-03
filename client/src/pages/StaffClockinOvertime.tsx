import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Timer, Calendar, Settings, Download, FileText, AlertTriangle, CheckCircle, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface StaffWorkClock {
  id: number;
  organizationId: string;
  userId: string;
  clockInTime: string;
  clockOutTime?: string;
  clockType: string;
  propertyId?: number;
  taskId?: number;
  clockInNotes?: string;
  clockOutNotes?: string;
  isEmergencyVisit: boolean;
  isAfterHours: boolean;
  gpsLocation?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffClockSettings {
  id?: number;
  organizationId: string;
  dailyHoursLimit: number;
  weeklyHoursLimit: number;
  overtimeMultiplier: number;
  defaultHourlyRate: number;
  requireGpsLocation: boolean;
  allowAfterHoursClocking: boolean;
  emergencyVisitApprovalRequired: boolean;
  autoClockOutHours: number;
  createdAt?: string;
  updatedAt?: string;
}

interface OvertimeCalculation {
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  emergencyVisits: number;
  afterHoursTotal: number;
}

interface TimeReport {
  reportPeriod: string;
  staffReports: Array<{
    userId: string;
    userName: string;
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
    emergencyVisits: number;
    afterHoursTotal: number;
    estimatedPay: number;
  }>;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalEstimatedPay: number;
}

export default function StaffClockinOvertime() {
  const [activeTab, setActiveTab] = useState("clock");
  const [clockInDialogOpen, setClockInDialogOpen] = useState(false);
  const [clockOutDialogOpen, setClockOutDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("this-week");
  const [targetUserId, setTargetUserId] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user role for access control
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin';
  const isPM = user?.role === 'portfolio-manager';
  const canManage = isAdmin || isPM;

  // Active clock session
  const { data: activeClock, isLoading: activeClockLoading } = useQuery({
    queryKey: ["/api/staff/active-clock"],
    enabled: isStaff,
  });

  // Clock history
  const { data: clockHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/staff/clock-history", selectedPeriod, targetUserId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedPeriod === "this-week") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay());
        params.set("startDate", startDate.toISOString());
      } else if (selectedPeriod === "this-month") {
        const startDate = new Date();
        startDate.setDate(1);
        params.set("startDate", startDate.toISOString());
      }
      if (targetUserId && canManage) {
        params.set("targetUserId", targetUserId);
      }
      return apiRequest(`/api/staff/clock-history?${params.toString()}`);
    },
  });

  // Clock settings (admin/PM only)
  const { data: clockSettings } = useQuery({
    queryKey: ["/api/staff/clock-settings"],
    enabled: canManage,
  });

  // Overtime calculation
  const { data: overtimeCalc } = useQuery({
    queryKey: ["/api/staff/overtime-calculation", selectedPeriod, targetUserId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedPeriod === "this-week") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date();
        params.set("startDate", startDate.toISOString());
        params.set("endDate", endDate.toISOString());
      } else if (selectedPeriod === "this-month") {
        const startDate = new Date();
        startDate.setDate(1);
        const endDate = new Date();
        params.set("startDate", startDate.toISOString());
        params.set("endDate", endDate.toISOString());
      }
      if (targetUserId && canManage) {
        params.set("targetUserId", targetUserId);
      }
      return apiRequest(`/api/staff/overtime-calculation?${params.toString()}`);
    },
  });

  // Time report (admin/PM only)
  const { data: timeReport } = useQuery({
    queryKey: ["/api/staff/time-report", selectedPeriod],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedPeriod === "this-week") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date();
        params.set("startDate", startDate.toISOString());
        params.set("endDate", endDate.toISOString());
      } else if (selectedPeriod === "this-month") {
        const startDate = new Date();
        startDate.setDate(1);
        const endDate = new Date();
        params.set("startDate", startDate.toISOString());
        params.set("endDate", endDate.toISOString());
      }
      params.set("format", selectedPeriod === "this-week" ? "weekly" : "monthly");
      return apiRequest(`/api/staff/time-report?${params.toString()}`);
    },
    enabled: canManage,
  });

  // Mutations
  const clockInMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/staff/clock-in", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/active-clock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/clock-history"] });
      setClockInDialogOpen(false);
      toast({
        title: "Clocked In",
        description: "Successfully clocked in for your shift",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clock In Failed",
        description: error.message || "Failed to clock in",
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/staff/clock-out", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/active-clock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/clock-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/overtime-calculation"] });
      setClockOutDialogOpen(false);
      toast({
        title: "Clocked Out",
        description: "Successfully clocked out",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clock Out Failed",
        description: error.message || "Failed to clock out",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/staff/clock-settings", "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/clock-settings"] });
      setSettingsDialogOpen(false);
      toast({
        title: "Settings Updated",
        description: "Clock settings have been updated successfully",
      });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      if (selectedPeriod === "this-week") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date();
        params.set("startDate", startDate.toISOString());
        params.set("endDate", endDate.toISOString());
      } else if (selectedPeriod === "this-month") {
        const startDate = new Date();
        startDate.setDate(1);
        const endDate = new Date();
        params.set("startDate", startDate.toISOString());
        params.set("endDate", endDate.toISOString());
      }
      params.set("format", selectedPeriod === "this-week" ? "weekly" : "monthly");
      
      const response = await fetch(`/api/staff/time-report/export?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "text/csv",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to export report");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `staff-time-report-${selectedPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Report Exported",
        description: "Time report has been downloaded as CSV",
      });
    },
  });

  const ClockInForm = () => {
    const [clockType, setClockType] = useState("workday");
    const [propertyId, setPropertyId] = useState("");
    const [taskId, setTaskId] = useState("");
    const [notes, setNotes] = useState("");
    const [isEmergency, setIsEmergency] = useState(false);
    const [isAfterHours, setIsAfterHours] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clockInMutation.mutate({
        clockType,
        propertyId: propertyId ? parseInt(propertyId) : null,
        taskId: taskId ? parseInt(taskId) : null,
        clockInNotes: notes,
        isEmergencyVisit: isEmergency,
        isAfterHours: isAfterHours,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clockType">Clock Type</Label>
          <Select value={clockType} onValueChange={setClockType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workday">Regular Workday</SelectItem>
              <SelectItem value="task-specific">Task-Specific</SelectItem>
              <SelectItem value="emergency">Emergency Visit</SelectItem>
              <SelectItem value="maintenance">Maintenance Call</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {clockType === "task-specific" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property ID (Optional)</Label>
              <Input
                id="propertyId"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Enter property ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskId">Task ID (Optional)</Label>
              <Input
                id="taskId"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Enter task ID"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this clock-in..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="emergency"
            checked={isEmergency}
            onCheckedChange={setIsEmergency}
          />
          <Label htmlFor="emergency">Emergency Visit</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="afterHours"
            checked={isAfterHours}
            onCheckedChange={setIsAfterHours}
          />
          <Label htmlFor="afterHours">After Hours</Label>
        </div>

        <Button type="submit" disabled={clockInMutation.isPending} className="w-full">
          {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
        </Button>
      </form>
    );
  };

  const ClockOutForm = () => {
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clockOutMutation.mutate({
        clockOutNotes: notes,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clockOutNotes">Clock Out Notes (Optional)</Label>
          <Textarea
            id="clockOutNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about your shift completion..."
          />
        </div>

        <Button type="submit" disabled={clockOutMutation.isPending} className="w-full">
          {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
        </Button>
      </form>
    );
  };

  const SettingsForm = () => {
    const [settings, setSettings] = useState<StaffClockSettings>({
      organizationId: "",
      dailyHoursLimit: clockSettings?.dailyHoursLimit || 8,
      weeklyHoursLimit: clockSettings?.weeklyHoursLimit || 40,
      overtimeMultiplier: clockSettings?.overtimeMultiplier || 1.5,
      defaultHourlyRate: clockSettings?.defaultHourlyRate || 25,
      requireGpsLocation: clockSettings?.requireGpsLocation || false,
      allowAfterHoursClocking: clockSettings?.allowAfterHoursClocking || true,
      emergencyVisitApprovalRequired: clockSettings?.emergencyVisitApprovalRequired || false,
      autoClockOutHours: clockSettings?.autoClockOutHours || 12,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateSettingsMutation.mutate(settings);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dailyHoursLimit">Daily Hours Limit</Label>
            <Input
              id="dailyHoursLimit"
              type="number"
              value={settings.dailyHoursLimit}
              onChange={(e) => setSettings({ ...settings, dailyHoursLimit: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weeklyHoursLimit">Weekly Hours Limit</Label>
            <Input
              id="weeklyHoursLimit"
              type="number"
              value={settings.weeklyHoursLimit}
              onChange={(e) => setSettings({ ...settings, weeklyHoursLimit: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="overtimeMultiplier">Overtime Multiplier</Label>
            <Input
              id="overtimeMultiplier"
              type="number"
              step="0.1"
              value={settings.overtimeMultiplier}
              onChange={(e) => setSettings({ ...settings, overtimeMultiplier: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultHourlyRate">Default Hourly Rate ($)</Label>
            <Input
              id="defaultHourlyRate"
              type="number"
              value={settings.defaultHourlyRate}
              onChange={(e) => setSettings({ ...settings, defaultHourlyRate: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="requireGps"
              checked={settings.requireGpsLocation}
              onCheckedChange={(checked) => setSettings({ ...settings, requireGpsLocation: checked })}
            />
            <Label htmlFor="requireGps">Require GPS Location</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allowAfterHours"
              checked={settings.allowAfterHoursClocking}
              onCheckedChange={(checked) => setSettings({ ...settings, allowAfterHoursClocking: checked })}
            />
            <Label htmlFor="allowAfterHours">Allow After Hours Clocking</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="emergencyApproval"
              checked={settings.emergencyVisitApprovalRequired}
              onCheckedChange={(checked) => setSettings({ ...settings, emergencyVisitApprovalRequired: checked })}
            />
            <Label htmlFor="emergencyApproval">Emergency Visit Approval Required</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="autoClockOut">Auto Clock Out (hours)</Label>
          <Input
            id="autoClockOut"
            type="number"
            value={settings.autoClockOutHours}
            onChange={(e) => setSettings({ ...settings, autoClockOutHours: parseInt(e.target.value) })}
          />
        </div>

        <Button type="submit" disabled={updateSettingsMutation.isPending} className="w-full">
          {updateSettingsMutation.isPending ? "Updating..." : "Update Settings"}
        </Button>
      </form>
    );
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return "In Progress";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getClockTypeBadgeColor = (type: string) => {
    switch (type) {
      case "emergency": return "bg-red-100 text-red-800";
      case "after-hours": return "bg-orange-100 text-orange-800";
      case "task-specific": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Clock-In & Overtime Tracker</h1>
          <p className="text-muted-foreground">
            {isStaff ? "Track your work hours and manage your schedule" : "Manage staff time tracking and overtime"}
          </p>
        </div>
        
        {canManage && (
          <div className="flex gap-2">
            <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Clock Settings</DialogTitle>
                </DialogHeader>
                <SettingsForm />
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              onClick={() => exportReportMutation.mutate()}
              disabled={exportReportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
          <TabsTrigger value="history">Time History</TabsTrigger>
          <TabsTrigger value="overtime">Overtime</TabsTrigger>
          {canManage && <TabsTrigger value="reports">Staff Reports</TabsTrigger>}
        </TabsList>

        <TabsContent value="clock" className="space-y-4">
          {isStaff && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeClockLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : activeClock ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Currently Clocked In</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Started:</strong> {new Date(activeClock.clockInTime).toLocaleString()}</p>
                        <p><strong>Duration:</strong> {formatDistanceToNow(new Date(activeClock.clockInTime))}</p>
                        <p><strong>Type:</strong> <Badge className={getClockTypeBadgeColor(activeClock.clockType)}>{activeClock.clockType}</Badge></p>
                        {activeClock.isEmergencyVisit && <Badge variant="destructive">Emergency</Badge>}
                        {activeClock.isAfterHours && <Badge variant="secondary">After Hours</Badge>}
                      </div>
                      <Dialog open={clockOutDialogOpen} onOpenChange={setClockOutDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full" variant="destructive">
                            Clock Out
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Clock Out</DialogTitle>
                          </DialogHeader>
                          <ClockOutForm />
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="font-medium">Not Clocked In</span>
                      </div>
                      <Dialog open={clockInDialogOpen} onOpenChange={setClockInDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            Clock In
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Clock In</DialogTitle>
                          </DialogHeader>
                          <ClockInForm />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {overtimeCalc ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Regular Hours:</span>
                        <span className="font-medium">{overtimeCalc.regularHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime Hours:</span>
                        <span className="font-medium text-orange-600">{overtimeCalc.overtimeHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Hours:</span>
                        <span className="font-medium">{overtimeCalc.totalHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency Visits:</span>
                        <span className="font-medium text-red-600">{overtimeCalc.emergencyVisits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>After Hours:</span>
                        <span className="font-medium text-purple-600">{overtimeCalc.afterHoursTotal.toFixed(1)}h</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!isStaff && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Staff Clock Management</h3>
                  <p className="text-muted-foreground">
                    View staff time tracking in the History and Reports tabs
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            {canManage && (
              <Input
                placeholder="User ID (optional)"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-48"
              />
            )}

            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/staff/clock-history"] })}
            >
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {historyLoading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">Loading time history...</div>
                </CardContent>
              </Card>
            ) : clockHistory && clockHistory.length > 0 ? (
              clockHistory.map((clock: StaffWorkClock) => (
                <Card key={clock.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getClockTypeBadgeColor(clock.clockType)}>
                            {clock.clockType}
                          </Badge>
                          {clock.isEmergencyVisit && <Badge variant="destructive" className="text-xs">Emergency</Badge>}
                          {clock.isAfterHours && <Badge variant="secondary" className="text-xs">After Hours</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(clock.clockInTime).toLocaleString()} - {clock.clockOutTime ? new Date(clock.clockOutTime).toLocaleString() : "In Progress"}
                        </p>
                        {clock.clockInNotes && (
                          <p className="text-sm"><strong>Notes:</strong> {clock.clockInNotes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDuration(clock.clockInTime, clock.clockOutTime)}</p>
                        {clock.clockOutTime ? (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
                        ) : (
                          <Timer className="h-4 w-4 text-orange-500 ml-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    No time entries found for the selected period
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overtime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Regular Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overtimeCalc?.regularHours.toFixed(1) || "0.0"}h</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{overtimeCalc?.overtimeHours.toFixed(1) || "0.0"}h</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overtimeCalc?.totalHours.toFixed(1) || "0.0"}h</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Emergency Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overtimeCalc?.emergencyVisits || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">After Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{overtimeCalc?.afterHoursTotal.toFixed(1) || "0.0"}h</div>
              </CardContent>
            </Card>
          </div>

          {overtimeCalc && (
            <Card>
              <CardHeader>
                <CardTitle>Overtime Calculation Details</CardTitle>
                <CardDescription>Based on current organization settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Regular Rate:</span>
                    <span>${clockSettings?.defaultHourlyRate || 25}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Rate:</span>
                    <span>${((clockSettings?.defaultHourlyRate || 25) * (clockSettings?.overtimeMultiplier || 1.5)).toFixed(2)}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Limit:</span>
                    <span>{clockSettings?.weeklyHoursLimit || 40} hours</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Estimated Pay:</span>
                    <span>
                      ${(
                        (overtimeCalc.regularHours * (clockSettings?.defaultHourlyRate || 25)) +
                        (overtimeCalc.overtimeHours * (clockSettings?.defaultHourlyRate || 25) * (clockSettings?.overtimeMultiplier || 1.5))
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {canManage && (
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Staff Time Report
                </CardTitle>
                <CardDescription>Overview of all staff time tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {timeReport ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{timeReport.totalRegularHours.toFixed(1)}h</div>
                            <div className="text-sm text-muted-foreground">Total Regular Hours</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{timeReport.totalOvertimeHours.toFixed(1)}h</div>
                            <div className="text-sm text-muted-foreground">Total Overtime Hours</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">${timeReport.totalEstimatedPay.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Total Estimated Pay</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Individual Staff Reports</h4>
                      {timeReport.staffReports.map((staff, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{staff.userName}</h5>
                                <p className="text-sm text-muted-foreground">ID: {staff.userId}</p>
                              </div>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="font-medium">{staff.regularHours.toFixed(1)}h</div>
                                  <div className="text-muted-foreground">Regular</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-orange-600">{staff.overtimeHours.toFixed(1)}h</div>
                                  <div className="text-muted-foreground">Overtime</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-red-600">{staff.emergencyVisits}</div>
                                  <div className="text-muted-foreground">Emergency</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-green-600">${staff.estimatedPay.toFixed(2)}</div>
                                  <div className="text-muted-foreground">Est. Pay</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No report data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}