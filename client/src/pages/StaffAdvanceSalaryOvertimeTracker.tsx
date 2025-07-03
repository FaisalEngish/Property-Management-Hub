import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  PlusCircle,
  Settings,
  FileText,
  Camera,
  Banknote,
  TrendingUp,
  Users,
  MapPin,
  Play,
  Square,
  Timer,
  History,
  Award,
  Calculator,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface StaffAdvanceRequest {
  id: number;
  staffId: string;
  requestAmount: string;
  requestReason: string;
  requestDate: string;
  proofAttachment?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  paymentStatus: string;
  paidAmount?: string;
  paidDate?: string;
  remainingBalance?: string;
}

interface ClockEntry {
  id: number;
  staffId: string;
  taskId?: number;
  propertyId?: number;
  clockInTime: string;
  clockOutTime?: string;
  taskDescription: string;
  isOvertime: boolean;
  overtimeHours?: number;
  gpsLocation?: string;
  photoEvidence?: string;
  status: "active" | "completed" | "emergency";
  emergencyReason?: string;
  supervisorApproved?: boolean;
  createdAt: string;
}

interface OvertimeSettings {
  standardStartTime: string; // e.g., "08:00"
  standardEndTime: string;   // e.g., "18:00"
  overtimeThreshold: string; // e.g., "20:00" - when overtime becomes significant
  emergencyTaskMultiplier: number; // e.g., 1.5 for emergency tasks
  autoDeductAdvances: boolean;
  requirePhotoEvidence: boolean;
  requireGpsTracking: boolean;
}

interface StaffOvertimeLog {
  id: number;
  staffId: string;
  propertyId?: number;
  workDate: string;
  timeIn: string;
  timeOut: string;
  totalHours: string;
  taskType: string;
  taskDescription: string;
  isEmergency: boolean;
  photoEvidence?: string[];
  guestSignature?: string;
  additionalNotes?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  compensationType?: string;
  compensationAmount?: string;
  timeOffHours?: string;
  paymentStatus: string;
}

interface StaffMonthlySummary {
  totalAdvanceRequests: number;
  approvedAdvances: string;
  pendingAdvances: string;
  remainingAdvanceBalance: string;
  totalOvertimeHours: string;
  approvedOvertimeHours: string;
  pendingOvertimeHours: string;
  overtimeEarnings: string;
  timeOffCredits: string;
  emergencyTasks: number;
  afterHoursTasks: number;
}

export default function StaffAdvanceSalaryOvertimeTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [overtimeDialogOpen, setOvertimeDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [clockInDialogOpen, setClockInDialogOpen] = useState(false);
  
  // GPS and Clock In State
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [activeTimer, setActiveTimer] = useState<ClockEntry | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form states
  const [advanceForm, setAdvanceForm] = useState({
    requestAmount: "",
    requestReason: "",
    proofAttachment: ""
  });

  const [clockInForm, setClockInForm] = useState({
    taskDescription: "",
    propertyId: "",
    isEmergency: false,
    emergencyReason: "",
    photoEvidence: "",
  });

  const [overtimeForm, setOvertimeForm] = useState({
    workDate: format(new Date(), "yyyy-MM-dd"),
    timeIn: "",
    timeOut: "",
    taskType: "",
    taskDescription: "",
    isEmergency: false,
    propertyId: "",
    photoEvidence: [] as string[],
    guestSignature: "",
    additionalNotes: "",
    compensationType: "overtime_pay"
  });

  // Data queries
  const { data: advanceRequests = [], isLoading: advanceLoading } = useQuery({
    queryKey: ["/api/staff-advance-requests"],
  });

  const { data: overtimeLogs = [], isLoading: overtimeLoading } = useQuery({
    queryKey: ["/api/staff-overtime-logs"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: advanceOverview } = useQuery({
    queryKey: ["/api/staff-advance-overview"],
  });

  const { data: overtimeOverview } = useQuery({
    queryKey: ["/api/staff-overtime-overview"],
  });

  const { data: monthlySummary } = useQuery({
    queryKey: [`/api/staff-monthly-summary/current/${selectedPeriod}`],
  });

  const { data: overtimeSettings = [] } = useQuery({
    queryKey: ["/api/staff-overtime-settings"],
  });

  const { data: clockEntries = [] } = useQuery({
    queryKey: ["/api/staff-clock-entries"],
  });

  // GPS and location effects
  useEffect(() => {
    // Update current time every second for active timer display
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Get user's current location for GPS tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("GPS error:", error);
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setLocationError("GPS not supported by this device");
    }
  }, []);

  // Check for active clock entry on component mount
  useEffect(() => {
    const activeEntry = clockEntries.find((entry: ClockEntry) => 
      entry.status === "active" && !entry.clockOutTime
    );
    setActiveTimer(activeEntry || null);
  }, [clockEntries]);

  // Utility functions
  const getCurrentTimeString = () => {
    return format(currentTime, "HH:mm:ss");
  };

  const isOvertimeHour = (timeString: string) => {
    const hour = parseInt(timeString.split(':')[0]);
    const standardEndHour = parseInt(overtimeSettings[0]?.standardEndTime?.split(':')[0] || "18");
    const overtimeThresholdHour = parseInt(overtimeSettings[0]?.overtimeThreshold?.split(':')[0] || "20");
    
    return hour >= standardEndHour;
  };

  const isSignificantOvertime = (timeString: string) => {
    const hour = parseInt(timeString.split(':')[0]);
    const overtimeThresholdHour = parseInt(overtimeSettings[0]?.overtimeThreshold?.split(':')[0] || "20");
    
    return hour >= overtimeThresholdHour;
  };

  const calculateWorkDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  const getLocationDisplay = () => {
    if (locationError) {
      return `GPS Error: ${locationError}`;
    }
    if (!currentLocation) {
      return "Getting location...";
    }
    return `Lat: ${currentLocation.lat.toFixed(6)}, Lng: ${currentLocation.lng.toFixed(6)} (±${currentLocation.accuracy}m)`;
  };

  // Clock In/Out Mutations
  const clockInMutation = useMutation({
    mutationFn: async (clockData: any) => {
      const gpsLocation = currentLocation ? 
        `${currentLocation.lat},${currentLocation.lng}` : 
        "GPS not available";
      
      return await apiRequest("POST", "/api/staff-clock-in", {
        ...clockData,
        gpsLocation,
        clockInTime: getCurrentTimeString(),
        isOvertime: isOvertimeHour(getCurrentTimeString()),
      });
    },
    onSuccess: () => {
      toast({
        title: "Clocked In Successfully",
        description: `Started work at ${getCurrentTimeString()}${isOvertimeHour(getCurrentTimeString()) ? ' (Overtime)' : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-clock-entries"] });
      setClockInDialogOpen(false);
      setClockInForm({
        taskDescription: "",
        propertyId: "",
        isEmergency: false,
        emergencyReason: "",
        photoEvidence: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clock In Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (clockEntryId: number) => {
      const gpsLocation = currentLocation ? 
        `${currentLocation.lat},${currentLocation.lng}` : 
        "GPS not available";
        
      return await apiRequest("PUT", `/api/staff-clock-out/${clockEntryId}`, {
        clockOutTime: getCurrentTimeString(),
        gpsLocationOut: gpsLocation,
      });
    },
    onSuccess: (data: any) => {
      const duration = data.duration || "0";
      const overtimeHours = data.overtimeHours || "0";
      
      toast({
        title: "Clocked Out Successfully",
        description: `Work completed. Duration: ${duration}h${overtimeHours > 0 ? `, Overtime: ${overtimeHours}h` : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-clock-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-overtime-logs"] });
      setActiveTimer(null);
    },
    onError: (error: any) => {
      toast({
        title: "Clock Out Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutations
  const createAdvanceRequest = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-advance-requests", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Advance request submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-advance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-advance-overview"] });
      setAdvanceDialogOpen(false);
      setAdvanceForm({ requestAmount: "", requestReason: "", proofAttachment: "" });
    },
  });

  const createOvertimeLog = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-overtime-logs", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Overtime log submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-overtime-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-overtime-overview"] });
      setOvertimeDialogOpen(false);
      setOvertimeForm({
        workDate: format(new Date(), "yyyy-MM-dd"),
        timeIn: "",
        timeOut: "",
        taskType: "",
        taskDescription: "",
        isEmergency: false,
        propertyId: "",
        photoEvidence: [],
        guestSignature: "",
        additionalNotes: "",
        compensationType: "overtime_pay"
      });
    },
  });

  // Calculate total hours for overtime form
  const calculateHours = () => {
    if (!overtimeForm.timeIn || !overtimeForm.timeOut) return "0.00";
    
    const timeIn = new Date(`${overtimeForm.workDate}T${overtimeForm.timeIn}`);
    const timeOut = new Date(`${overtimeForm.workDate}T${overtimeForm.timeOut}`);
    
    if (timeOut <= timeIn) return "0.00";
    
    const diffMs = timeOut.getTime() - timeIn.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const handleAdvanceSubmit = () => {
    if (!advanceForm.requestAmount || !advanceForm.requestReason) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createAdvanceRequest.mutate(advanceForm);
  };

  const handleOvertimeSubmit = () => {
    if (!overtimeForm.timeIn || !overtimeForm.timeOut || !overtimeForm.taskType || !overtimeForm.taskDescription) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const totalHours = calculateHours();
    createOvertimeLog.mutate({
      ...overtimeForm,
      totalHours,
      propertyId: overtimeForm.propertyId ? parseInt(overtimeForm.propertyId) : null,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", label: "Pending" },
      approved: { color: "bg-green-500", label: "Approved" },
      rejected: { color: "bg-red-500", label: "Rejected" },
      paid: { color: "bg-blue-500", label: "Paid" },
      not_paid: { color: "bg-gray-500", label: "Not Paid" },
      credited: { color: "bg-purple-500", label: "Credited" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", label: status };
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const taskTypes = [
    "emergency_pool_fix",
    "late_check_in",
    "urgent_maintenance",
    "guest_emergency",
    "security_issue",
    "after_hours_cleaning",
    "weekend_maintenance",
    "holiday_coverage",
    "other"
  ];

  if (advanceLoading || overtimeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            💸 Staff Salary Advance & Overtime Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Request salary advances and log overtime hours with approval workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = format(date, "yyyy-MM");
                const label = format(date, "MMMM yyyy");
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="advance-requests" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Advance Requests
          </TabsTrigger>
          <TabsTrigger value="overtime-tracker" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Overtime Tracker
          </TabsTrigger>
          <TabsTrigger value="clock-in-out" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Clock In/Out
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="emergency-tasks" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Emergency Tasks
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Payroll
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Advances</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {advanceOverview?.totalPendingRequests || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  ฿{parseFloat(advanceOverview?.totalApprovedAmount || "0").toLocaleString()}
                  {" "} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{parseFloat(advanceOverview?.totalRemainingBalance || "0").toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  To be deducted from salary
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseFloat(overtimeOverview?.totalApprovedHours || "0").toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {parseFloat(overtimeOverview?.totalPendingHours || "0").toFixed(1)} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overtime Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{parseFloat(overtimeOverview?.totalOvertimeEarnings || "0").toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {parseFloat(overtimeOverview?.totalTimeOffCredits || "0").toFixed(1)} hours credited
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Summary */}
          {monthlySummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Summary - {format(new Date(selectedPeriod + "-01"), "MMMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {monthlySummary.totalAdvanceRequests}
                    </div>
                    <div className="text-sm text-gray-600">Advance Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {parseFloat(monthlySummary.totalOvertimeHours).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Overtime Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {monthlySummary.emergencyTasks}
                    </div>
                    <div className="text-sm text-gray-600">Emergency Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ฿{parseFloat(monthlySummary.overtimeEarnings).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Overtime Earnings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...advanceRequests.slice(0, 3), ...overtimeLogs.slice(0, 3)]
                  .sort((a, b) => new Date(b.requestDate || b.workDate).getTime() - new Date(a.requestDate || a.workDate).getTime())
                  .slice(0, 5)
                  .map((item: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.requestAmount ? (
                          <DollarSign className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            {item.requestAmount ? 
                              `Advance Request - ฿${parseFloat(item.requestAmount).toLocaleString()}` :
                              `Overtime - ${item.totalHours}h (${item.taskType.replace('_', ' ')})`
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(item.requestDate || item.workDate), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advance Requests Tab */}
        <TabsContent value="advance-requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Salary Advance Requests</h2>
            <Dialog open={advanceDialogOpen} onOpenChange={setAdvanceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Request Advance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Salary Advance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Request Amount (฿)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={advanceForm.requestAmount}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, requestAmount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Request</Label>
                    <Textarea
                      id="reason"
                      value={advanceForm.requestReason}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, requestReason: e.target.value })}
                      placeholder="Explain why you need this advance"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="proof">Proof/Documentation (optional)</Label>
                    <Input
                      id="proof"
                      type="url"
                      value={advanceForm.proofAttachment}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, proofAttachment: e.target.value })}
                      placeholder="Link to supporting document"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAdvanceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdvanceSubmit} disabled={createAdvanceRequest.isPending}>
                      {createAdvanceRequest.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advanceRequests.map((request: StaffAdvanceRequest) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {format(new Date(request.requestDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        ฿{parseFloat(request.requestAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.requestReason}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        {request.remainingBalance && parseFloat(request.remainingBalance) > 0 ? (
                          <span className="text-red-600 font-medium">
                            ฿{parseFloat(request.remainingBalance).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overtime Tracker Tab */}
        <TabsContent value="overtime-tracker" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Overtime & Emergency Tasks</h2>
            <Dialog open={overtimeDialogOpen} onOpenChange={setOvertimeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Log Overtime
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log Overtime/Emergency Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workDate">Work Date</Label>
                      <Input
                        id="workDate"
                        type="date"
                        value={overtimeForm.workDate}
                        onChange={(e) => setOvertimeForm({ ...overtimeForm, workDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="property">Property (optional)</Label>
                      <Select 
                        value={overtimeForm.propertyId} 
                        onValueChange={(value) => setOvertimeForm({ ...overtimeForm, propertyId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No specific property</SelectItem>
                          {properties.map((property: any) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="timeIn">Time In</Label>
                      <Input
                        id="timeIn"
                        type="time"
                        value={overtimeForm.timeIn}
                        onChange={(e) => setOvertimeForm({ ...overtimeForm, timeIn: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeOut">Time Out</Label>
                      <Input
                        id="timeOut"
                        type="time"
                        value={overtimeForm.timeOut}
                        onChange={(e) => setOvertimeForm({ ...overtimeForm, timeOut: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Total Hours</Label>
                      <Input value={calculateHours()} disabled />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select 
                      value={overtimeForm.taskType} 
                      onValueChange={(value) => setOvertimeForm({ ...overtimeForm, taskType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="taskDescription">Task Description</Label>
                    <Textarea
                      id="taskDescription"
                      value={overtimeForm.taskDescription}
                      onChange={(e) => setOvertimeForm({ ...overtimeForm, taskDescription: e.target.value })}
                      placeholder="Describe the work performed"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isEmergency"
                      checked={overtimeForm.isEmergency}
                      onChange={(e) => setOvertimeForm({ ...overtimeForm, isEmergency: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isEmergency">Emergency Task (2x rate)</Label>
                  </div>

                  <div>
                    <Label htmlFor="compensationType">Preferred Compensation</Label>
                    <Select 
                      value={overtimeForm.compensationType} 
                      onValueChange={(value) => setOvertimeForm({ ...overtimeForm, compensationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overtime_pay">💵 Overtime Pay</SelectItem>
                        <SelectItem value="time_off_credit">⬇️ Time-off Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
                    <Textarea
                      id="additionalNotes"
                      value={overtimeForm.additionalNotes}
                      onChange={(e) => setOvertimeForm({ ...overtimeForm, additionalNotes: e.target.value })}
                      placeholder="Any additional information"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOvertimeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleOvertimeSubmit} disabled={createOvertimeLog.isPending}>
                      {createOvertimeLog.isPending ? "Submitting..." : "Submit Log"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Emergency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compensation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overtimeLogs.map((log: StaffOvertimeLog) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.workDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {log.timeIn} - {log.timeOut}
                      </TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(log.totalHours).toFixed(2)}h
                      </TableCell>
                      <TableCell>
                        {log.taskType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        {log.isEmergency ? (
                          <Badge className="bg-red-500 text-white">Emergency</Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell>
                        {log.compensationType === "overtime_pay" ? (
                          <span className="text-green-600">
                            ฿{log.compensationAmount ? parseFloat(log.compensationAmount).toLocaleString() : "TBD"}
                          </span>
                        ) : log.compensationType === "time_off_credit" ? (
                          <span className="text-blue-600">
                            {log.timeOffHours ? parseFloat(log.timeOffHours).toFixed(1) + "h" : "TBD"}
                          </span>
                        ) : (
                          <span className="text-gray-500">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clock In/Out Tab */}
        <TabsContent value="clock-in-out" className="space-y-6">
          {/* Active Timer Card */}
          {activeTimer && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
                  <Timer className="w-5 h-5 animate-pulse" />
                  Active Work Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Started</Label>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300">
                      {activeTimer.clockInTime}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activeTimer.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Time</Label>
                    <div className="text-xl font-bold">
                      {getCurrentTimeString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isOvertimeHour(getCurrentTimeString()) ? "Overtime Hours" : "Regular Hours"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <div className="text-xl font-bold">
                      {calculateWorkDuration(activeTimer.clockInTime, getCurrentTimeString())}h
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Task: {activeTimer.taskDescription}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <Button 
                    onClick={() => clockOutMutation.mutate(activeTimer.id)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={clockOutMutation.isPending}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
                  </Button>
                  {isSignificantOvertime(getCurrentTimeString()) && (
                    <Badge variant="destructive" className="px-3 py-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Significant Overtime ({getCurrentTimeString()})
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clock In/Out Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clock In Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-600" />
                  Clock In System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {getCurrentTimeString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(currentTime, "EEEE, MMMM dd, yyyy")}
                  </p>
                  {isOvertimeHour(getCurrentTimeString()) && (
                    <Badge variant="secondary" className="mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      Overtime Period
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">GPS Location</Label>
                    <div className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {getLocationDisplay()}
                    </div>
                  </div>
                  
                  {!activeTimer ? (
                    <Button 
                      onClick={() => setClockInDialogOpen(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!currentLocation && !locationError}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Clock In to Start Work
                    </Button>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground">
                      Already clocked in. Use the active timer above to clock out.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Clock Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Work Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clockEntries.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clockEntries.slice(0, 5).map((entry: ClockEntry) => (
                      <div key={entry.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium text-sm">
                            {format(new Date(entry.createdAt), "MMM dd")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.clockInTime} - {entry.clockOutTime || "Active"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.taskDescription}
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.clockOutTime && (
                            <div className="text-sm font-medium">
                              {calculateWorkDuration(entry.clockInTime, entry.clockOutTime)}h
                            </div>
                          )}
                          <Badge variant={entry.status === "completed" ? "default" : entry.status === "emergency" ? "destructive" : "secondary"}>
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No clock entries yet. Clock in to start tracking your work.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Work Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Today's Work Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {clockEntries.filter((entry: ClockEntry) => 
                      format(new Date(entry.createdAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    ).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Work Sessions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {clockEntries
                      .filter((entry: ClockEntry) => 
                        format(new Date(entry.createdAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && 
                        entry.clockOutTime
                      )
                      .reduce((total, entry) => 
                        total + parseFloat(calculateWorkDuration(entry.clockInTime, entry.clockOutTime!)), 0
                      )
                      .toFixed(1)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {clockEntries
                      .filter((entry: ClockEntry) => 
                        format(new Date(entry.createdAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && 
                        entry.isOvertime
                      )
                      .reduce((total, entry) => 
                        total + (entry.overtimeHours || 0), 0
                      )
                      .toFixed(1)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Overtime Hours</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {clockEntries
                      .filter((entry: ClockEntry) => 
                        format(new Date(entry.createdAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && 
                        entry.status === "emergency"
                      ).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Emergency Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Overtime Settings & Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overtimeSettings.length > 0 ? (
                <div className="space-y-4">
                  {overtimeSettings.map((setting: any) => (
                    <div key={setting.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Regular Rate</Label>
                          <div className="text-lg">฿{setting.regularHourlyRate}/hour</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Overtime Multiplier</Label>
                          <div className="text-lg">{setting.overtimeMultiplier}x</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Emergency Multiplier</Label>
                          <div className="text-lg">{setting.emergencyMultiplier}x</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">After Hours Threshold</Label>
                          <div className="text-lg">{setting.afterHoursThreshold}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Settings Configured
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Contact your administrator to set up overtime rates and policies.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Tasks Tab */}
        <TabsContent value="emergency-tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Emergency Task Bonus Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overtimeLogs.filter((log: StaffOvertimeLog) => log.isEmergency).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Bonus Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overtimeLogs
                        .filter((log: StaffOvertimeLog) => log.isEmergency)
                        .map((log: StaffOvertimeLog) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {format(new Date(log.workDate), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              {log.taskType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </TableCell>
                            <TableCell>{parseFloat(log.totalHours).toFixed(2)}h</TableCell>
                            <TableCell>
                              <Badge className="bg-red-500 text-white">2x Rate</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                            <TableCell>
                              {log.compensationAmount ? (
                                <span className="text-green-600 font-medium">
                                  ฿{parseFloat(log.compensationAmount).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-500">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Emergency Tasks
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Emergency tasks marked with 2x compensation rate will appear here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Payroll Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Payroll Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Overtime hours and advance deductions automatically reflect in your monthly payslip.
                  View detailed breakdowns and download pay statements.
                </p>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Current Payslip
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clock In Dialog */}
      <Dialog open={clockInDialogOpen} onOpenChange={setClockInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Clock In to Start Work
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Time and GPS Info */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {getCurrentTimeString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(currentTime, "EEEE, MMMM dd, yyyy")}
                </p>
                {isOvertimeHour(getCurrentTimeString()) && (
                  <Badge variant="secondary" className="mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Starting in Overtime Period
                  </Badge>
                )}
              </div>
            </div>

            {/* GPS Location Display */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                GPS Location
              </Label>
              <div className="text-xs p-3 bg-gray-50 dark:bg-gray-800 rounded border mt-1">
                {getLocationDisplay()}
              </div>
              {locationError && (
                <p className="text-xs text-red-600 mt-1">
                  GPS is required for clock in. Please enable location services.
                </p>
              )}
            </div>

            {/* Task Description */}
            <div>
              <Label htmlFor="task-description">Task Description *</Label>
              <Textarea
                id="task-description"
                placeholder="Describe the work you're about to start..."
                value={clockInForm.taskDescription}
                onChange={(e) => setClockInForm(prev => ({ ...prev, taskDescription: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Property Selection */}
            <div>
              <Label htmlFor="property-select">Property (Optional)</Label>
              <Select 
                value={clockInForm.propertyId} 
                onValueChange={(value) => setClockInForm(prev => ({ ...prev, propertyId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a property..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific property</SelectItem>
                  {properties.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Emergency Task Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="emergency-task"
                checked={clockInForm.isEmergency}
                onCheckedChange={(checked) => setClockInForm(prev => ({ ...prev, isEmergency: checked }))}
              />
              <Label htmlFor="emergency-task" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Emergency Task (2x Rate)
              </Label>
            </div>

            {/* Emergency Reason */}
            {clockInForm.isEmergency && (
              <div>
                <Label htmlFor="emergency-reason">Emergency Reason *</Label>
                <Textarea
                  id="emergency-reason"
                  placeholder="Explain why this is an emergency task..."
                  value={clockInForm.emergencyReason}
                  onChange={(e) => setClockInForm(prev => ({ ...prev, emergencyReason: e.target.value }))}
                  className="mt-1"
                />
              </div>
            )}

            {/* Photo Evidence Upload */}
            <div>
              <Label htmlFor="photo-evidence">Photo Evidence (Optional)</Label>
              <Input
                id="photo-evidence"
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setClockInForm(prev => ({ 
                        ...prev, 
                        photoEvidence: e.target?.result as string 
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setClockInDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => clockInMutation.mutate(clockInForm)}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={
                  !clockInForm.taskDescription || 
                  (clockInForm.isEmergency && !clockInForm.emergencyReason) ||
                  (!currentLocation && !locationError) ||
                  clockInMutation.isPending
                }
              >
                <Play className="w-4 h-4 mr-2" />
                {clockInMutation.isPending ? "Clocking In..." : "Start Work"}
              </Button>
            </div>

            {/* Notice */}
            <div className="text-xs text-muted-foreground text-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <Clock className="w-4 h-4 inline mr-1" />
              Your work session will be tracked with GPS timestamps. 
              {isOvertimeHour(getCurrentTimeString()) ? " Starting in overtime period." : " Regular hours until 18:00."}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}