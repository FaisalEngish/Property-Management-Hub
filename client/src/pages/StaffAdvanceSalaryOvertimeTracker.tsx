import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock3, 
  Moon,
  FileText,
  Users,
  BarChart3,
  Plus,
  Timer,
  CalendarDays,
  Banknote,
  TrendingUp,
  Settings,
  PlayCircle,
  PauseCircle,
  User,
  Bell
} from "lucide-react";

interface OvertimeSession {
  id: number;
  sessionDate: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  taskDescription?: string;
  workLocation?: string;
  workType: string;
  isEmergency: boolean;
  isAfterHours: boolean;
  status: string;
  compensationType?: string;
  compensationAmount?: number;
  staffNotes?: string;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

interface AdvanceRequest {
  id: number;
  requestDate: string;
  requestedAmount: number;
  currency: string;
  reason: string;
  urgencyLevel: string;
  status: string;
  reviewedBy?: string;
  approvedBy?: string;
  paymentDate?: string;
  paymentMethod?: string;
  deductionStartMonth?: string;
  deductionMonths: number;
  monthlyDeductionAmount?: number;
  remainingBalance?: number;
  staffNotes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface MonthlySummary {
  summaryMonth: string;
  regularHours: number;
  overtimeHours: number;
  emergencyHours: number;
  afterHoursCount: number;
  totalOvertimePay: number;
  totalCompensationTime: number;
  advanceRequestsCount: number;
  totalAdvanceAmount: number;
  advanceRepaymentAmount: number;
  tasksCompleted: number;
  reliabilityScore: number;
}

export default function StaffAdvanceSalaryOvertimeTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false);
  const [isAdvanceRequestDialogOpen, setIsAdvanceRequestDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<OvertimeSession | null>(null);
  const [selectedAdvanceRequest, setSelectedAdvanceRequest] = useState<AdvanceRequest | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalType, setApprovalType] = useState<'overtime' | 'advance'>('overtime');
  const [currentTime, setCurrentTime] = useState(new Date());

  const userRole = (user as any)?.role || "staff";
  const isAdmin = userRole === "admin" || userRole === "portfolio-manager";
  const staffId = (user as any)?.id || "demo-staff";

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch overtime sessions
  const { data: overtimeSessions = [], isLoading: overtimeLoading } = useQuery({
    queryKey: [`/api/staff-overtime-sessions${isAdmin ? '' : `?staffId=${staffId}`}`],
    enabled: !!user,
  });

  // Fetch advance requests
  const { data: advanceRequests = [], isLoading: advanceLoading } = useQuery({
    queryKey: [`/api/staff-advance-requests${isAdmin ? '' : `?staffId=${staffId}`}`],
    enabled: !!user,
  });

  // Fetch monthly summary
  const { data: monthlySummary } = useQuery({
    queryKey: [`/api/staff-monthly-summary?staffId=${staffId}&month=${new Date().toISOString().slice(0, 7)}`],
    enabled: !!user,
  });

  // Check for active session
  const activeSession = overtimeSessions.find((session: OvertimeSession) => 
    !session.clockOutTime && session.staffId === staffId
  );

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/staff-overtime-sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-overtime-sessions"] });
      setIsClockInDialogOpen(false);
      toast({
        title: "Clocked In",
        description: "Your overtime session has been started.",
      });
    },
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return apiRequest("PUT", `/api/staff-overtime-sessions/${sessionId}/clock-out`, {
        clockOutTime: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-overtime-sessions"] });
      toast({
        title: "Clocked Out",
        description: "Your overtime session has been completed.",
      });
    },
  });

  // Advance request mutation
  const advanceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/staff-advance-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-advance-requests"] });
      setIsAdvanceRequestDialogOpen(false);
      toast({
        title: "Request Submitted",
        description: "Your advance salary request has been submitted for review.",
      });
    },
  });

  // Approval mutation (admin only)
  const approvalMutation = useMutation({
    mutationFn: async ({ type, id, action, data }: any) => {
      const endpoint = type === 'overtime' 
        ? `/api/staff-overtime-sessions/${id}/${action}`
        : `/api/staff-advance-requests/${id}/${action}`;
      return apiRequest("PUT", endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-overtime-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-advance-requests"] });
      setIsApprovalDialogOpen(false);
      toast({
        title: "Action Completed",
        description: "The request has been processed successfully.",
      });
    },
  });

  const handleClockIn = (data: any) => {
    const now = new Date();
    const isAfterHours = now.getHours() >= 20; // After 8 PM

    clockInMutation.mutate({
      organizationId: "default",
      staffId,
      sessionDate: now.toISOString().split('T')[0],
      clockInTime: now.toISOString(),
      isAfterHours,
      ...data,
    });
  };

  const handleClockOut = () => {
    if (activeSession) {
      clockOutMutation.mutate(activeSession.id);
    }
  };

  const handleAdvanceRequest = (data: any) => {
    advanceRequestMutation.mutate({
      organizationId: "default",
      staffId,
      requestedBy: staffId,
      requestDate: new Date().toISOString().split('T')[0],
      ...data,
    });
  };

  const handleApproval = (item: any, action: string, type: 'overtime' | 'advance') => {
    setApprovalType(type);
    if (type === 'overtime') {
      setSelectedSession(item);
    } else {
      setSelectedAdvanceRequest(item);
    }
    setIsApprovalDialogOpen(true);
  };

  const submitApproval = (data: any) => {
    const item = approvalType === 'overtime' ? selectedSession : selectedAdvanceRequest;
    if (!item) return;

    approvalMutation.mutate({
      type: approvalType,
      id: item.id,
      action: data.action,
      data: {
        approvedBy: (user as any)?.id,
        approvedAt: new Date().toISOString(),
        ...data,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatCurrency = (amount: number, currency = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-7 h-7 text-blue-600" />
                Staff Advance Salary & Overtime Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                {isAdmin ? "Manage staff overtime and advance salary requests" : "Track your overtime hours and manage advance salary requests"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
              {!isAdmin && (
                <div className="flex gap-2">
                  {activeSession ? (
                    <Button 
                      onClick={handleClockOut}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <PauseCircle className="w-4 h-4" />
                      Clock Out
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setIsClockInDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Clock In
                    </Button>
                  )}
                  <Button 
                    onClick={() => setIsAdvanceRequestDialogOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Request Advance
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Active Session Alert */}
          {activeSession && !isAdmin && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Active Overtime Session</p>
                    <p className="text-blue-700 text-sm">
                      Started: {new Date(activeSession.clockInTime).toLocaleString()}
                      {activeSession.taskDescription && ` | ${activeSession.taskDescription}`}
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {activeSession.isAfterHours && <Moon className="w-3 h-3 mr-1" />}
                  {activeSession.isEmergency ? 'Emergency' : 'Overtime'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {monthlySummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Clock3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatHours(monthlySummary.overtimeHours)}
                </div>
                <p className="text-xs text-gray-600">
                  Overtime hours worked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Tasks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {monthlySummary.afterHoursCount}
                </div>
                <p className="text-xs text-gray-600">
                  After-hours responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compensation</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlySummary.totalOvertimePay)}
                </div>
                <p className="text-xs text-gray-600">
                  Overtime earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Advance Requests</CardTitle>
                <Banknote className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {monthlySummary.advanceRequestsCount}
                </div>
                <p className="text-xs text-gray-600">
                  Total: {formatCurrency(monthlySummary.totalAdvanceAmount)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
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
              <Timer className="w-4 h-4" />
              Clock In/Out
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="emergency-tasks" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Tasks
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Payroll
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Your work summary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {monthlySummary ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Regular Hours</span>
                        <span className="font-semibold">{formatHours(monthlySummary.regularHours)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Overtime Hours</span>
                        <span className="font-semibold text-blue-600">{formatHours(monthlySummary.overtimeHours)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Emergency Hours</span>
                        <span className="font-semibold text-orange-600">{formatHours(monthlySummary.emergencyHours)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tasks Completed</span>
                        <span className="font-semibold">{monthlySummary.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reliability Score</span>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          {monthlySummary.reliabilityScore}/100
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No data available for this month</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest overtime sessions and requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...overtimeSessions.slice(0, 3), ...advanceRequests.slice(0, 2)]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((item: any, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.clockInTime ? (
                              <Clock className="w-4 h-4 text-blue-600" />
                            ) : (
                              <DollarSign className="w-4 h-4 text-green-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {item.clockInTime ? 'Overtime Session' : 'Advance Request'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      ))}
                    {overtimeSessions.length === 0 && advanceRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  System Benefits
                </CardTitle>
                <CardDescription>
                  How the Staff Advance Salary & Overtime Tracker helps you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Transparent Tracking</h4>
                    <p className="text-blue-700 text-sm">
                      Clear visibility of all overtime hours, emergency tasks, and compensation earned.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Fair Compensation</h4>
                    <p className="text-green-700 text-sm">
                      Automatic calculation of overtime pay and time-off compensation based on approved rates.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Advance Access</h4>
                    <p className="text-purple-700 text-sm">
                      Request salary advances with structured repayment plans and admin approval workflow.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Emergency Response</h4>
                    <p className="text-orange-700 text-sm">
                      Special recognition and compensation for after-hours emergency tasks.
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-2">Performance Analytics</h4>
                    <p className="text-indigo-700 text-sm">
                      Monthly reports showing reliability scores and performance metrics.
                    </p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">Financial Planning</h4>
                    <p className="text-teal-700 text-sm">
                      Clear deduction schedules and repayment tracking for advance salary requests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advance Requests Tab */}
          <TabsContent value="advance-requests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Advance Salary Requests
                    </CardTitle>
                    <CardDescription>
                      {isAdmin ? "Review and approve staff advance salary requests" : "Manage your advance salary requests"}
                    </CardDescription>
                  </div>
                  {!isAdmin && (
                    <Button onClick={() => setIsAdvanceRequestDialogOpen(true)} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      New Request
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Repayment</TableHead>
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {advanceRequests.map((request: AdvanceRequest) => (
                        <TableRow key={request.id}>
                          <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(request.requestedAmount, request.currency)}
                          </TableCell>
                          <TableCell className="max-w-48 truncate">{request.reason}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getUrgencyColor(request.urgencyLevel)}>
                              {request.urgencyLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-sm">
                            {request.deductionMonths ? (
                              <span>{request.deductionMonths} months</span>
                            ) : (
                              <span className="text-gray-400">Not set</span>
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              {request.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproval(request, 'approve', 'advance')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproval(request, 'reject', 'advance')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {advanceRequests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-500">
                            No advance requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overtime Tracker Tab */}
          <TabsContent value="overtime-tracker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Overtime Sessions
                </CardTitle>
                <CardDescription>
                  {isAdmin ? "Monitor staff overtime sessions and approve compensation" : "Track your overtime work sessions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Compensation</TableHead>
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overtimeSessions.map((session: OvertimeSession) => (
                        <TableRow key={session.id}>
                          <TableCell>{new Date(session.sessionDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {session.totalHours ? formatHours(session.totalHours) : (
                              session.clockOutTime ? 'Calculating...' : 'In Progress'
                            )}
                          </TableCell>
                          <TableCell className="max-w-48 truncate">
                            {session.taskDescription || 'No description'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {session.isEmergency && <AlertTriangle className="w-4 h-4 text-red-500" />}
                              {session.isAfterHours && <Moon className="w-4 h-4 text-blue-500" />}
                              <span className="capitalize">{session.workType}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                          <TableCell>
                            {session.compensationAmount ? (
                              <span className="text-green-600 font-medium">
                                {formatCurrency(session.compensationAmount)}
                              </span>
                            ) : (
                              <span className="text-gray-400">Pending</span>
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              {session.status === 'pending' && session.clockOutTime && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproval(session, 'approve', 'overtime')}
                                >
                                  Approve
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {overtimeSessions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-500">
                            No overtime sessions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clock In/Out Tab */}
          <TabsContent value="clock-in-out" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-blue-600" />
                    Current Session
                  </CardTitle>
                  <CardDescription>
                    Clock in for overtime or emergency work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeSession ? (
                    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">Active Session</h4>
                        <Badge className="bg-blue-100 text-blue-800">
                          {activeSession.isEmergency ? 'Emergency' : 'Overtime'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Started:</span>
                          <span className="font-medium">{new Date(activeSession.clockInTime).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Task:</span>
                          <span className="font-medium">{activeSession.taskDescription || 'No description'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Location:</span>
                          <span className="font-medium">{activeSession.workLocation || 'Not specified'}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={handleClockOut}
                        variant="destructive"
                        className="w-full mt-4"
                      >
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Clock Out
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg">
                      <p className="text-gray-600 mb-4">No active session. Click below to start overtime work.</p>
                      <Button 
                        onClick={() => setIsClockInDialogOpen(true)}
                        className="w-full"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Clock In for Overtime
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-green-600" />
                    Today's Summary
                  </CardTitle>
                  <CardDescription>
                    Your work hours for today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Today's sessions summary would go here */}
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Today's summary will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Notification settings will be available here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Tasks Tab */}
          <TabsContent value="emergency-tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Emergency Tasks
                </CardTitle>
                <CardDescription>
                  After-hours and emergency work sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overtimeSessions.filter((session: OvertimeSession) => session.isEmergency || session.isAfterHours).length > 0 ? (
                    <div className="space-y-3">
                      {overtimeSessions
                        .filter((session: OvertimeSession) => session.isEmergency || session.isAfterHours)
                        .map((session: OvertimeSession) => (
                          <div key={session.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-orange-900">
                                  {session.isEmergency ? 'Emergency Task' : 'After-Hours Work'}
                                </span>
                              </div>
                              {getStatusBadge(session.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-orange-700">Date:</span>
                                <span className="ml-2 font-medium">{new Date(session.sessionDate).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-orange-700">Duration:</span>
                                <span className="ml-2 font-medium">
                                  {session.totalHours ? formatHours(session.totalHours) : 'In Progress'}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-orange-700">Task:</span>
                                <span className="ml-2 font-medium">{session.taskDescription || 'No description'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No emergency tasks recorded</p>
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
                  <FileText className="w-5 h-5 text-purple-600" />
                  Payroll & Reports
                </CardTitle>
                <CardDescription>
                  Monthly reports and payroll information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Payroll reports and export features will be available here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Clock In Dialog */}
      <Dialog open={isClockInDialogOpen} onOpenChange={setIsClockInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock In for Overtime</DialogTitle>
            <DialogDescription>
              Please provide details about your overtime work session.
            </DialogDescription>
          </DialogHeader>
          <ClockInForm onSubmit={handleClockIn} onCancel={() => setIsClockInDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Advance Request Dialog */}
      <Dialog open={isAdvanceRequestDialogOpen} onOpenChange={setIsAdvanceRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Advance Salary</DialogTitle>
            <DialogDescription>
              Submit a request for advance salary payment.
            </DialogDescription>
          </DialogHeader>
          <AdvanceRequestForm onSubmit={handleAdvanceRequest} onCancel={() => setIsAdvanceRequestDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalType === 'overtime' ? 'Approve Overtime Session' : 'Review Advance Request'}
            </DialogTitle>
            <DialogDescription>
              Review and process this {approvalType === 'overtime' ? 'overtime session' : 'advance salary request'}.
            </DialogDescription>
          </DialogHeader>
          <ApprovalForm 
            type={approvalType}
            item={approvalType === 'overtime' ? selectedSession : selectedAdvanceRequest}
            onSubmit={submitApproval} 
            onCancel={() => setIsApprovalDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Clock In Form Component
function ClockInForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    taskDescription: '',
    workLocation: '',
    workType: 'overtime',
    isEmergency: false,
    emergencyReason: '',
    staffNotes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="taskDescription">Task Description</Label>
        <Input
          id="taskDescription"
          value={formData.taskDescription}
          onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
          placeholder="e.g., Pump repair at Villa Sunset"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="workLocation">Work Location</Label>
        <Input
          id="workLocation"
          value={formData.workLocation}
          onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
          placeholder="e.g., Villa Sunset, Pool Area"
          required
        />
      </div>

      <div>
        <Label htmlFor="workType">Work Type</Label>
        <Select 
          value={formData.workType} 
          onValueChange={(value) => setFormData({ ...formData, workType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overtime">Regular Overtime</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="special_project">Special Project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isEmergency"
          checked={formData.isEmergency}
          onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isEmergency">This is an emergency task</Label>
      </div>

      {formData.isEmergency && (
        <div>
          <Label htmlFor="emergencyReason">Emergency Reason</Label>
          <Textarea
            id="emergencyReason"
            value={formData.emergencyReason}
            onChange={(e) => setFormData({ ...formData, emergencyReason: e.target.value })}
            placeholder="Explain the emergency situation..."
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="staffNotes">Additional Notes</Label>
        <Textarea
          id="staffNotes"
          value={formData.staffNotes}
          onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
          placeholder="Any additional information..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <PlayCircle className="w-4 h-4 mr-2" />
          Clock In
        </Button>
      </DialogFooter>
    </form>
  );
}

// Advance Request Form Component
function AdvanceRequestForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    requestedAmount: '',
    currency: 'THB',
    reason: '',
    urgencyLevel: 'normal',
    deductionMonths: 1,
    staffNotes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      requestedAmount: parseFloat(formData.requestedAmount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requestedAmount">Amount Requested</Label>
          <Input
            id="requestedAmount"
            type="number"
            value={formData.requestedAmount}
            onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
            placeholder="5000"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THB">THB (฿)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Advance</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Please explain why you need this advance..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="urgencyLevel">Urgency Level</Label>
          <Select 
            value={formData.urgencyLevel} 
            onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="deductionMonths">Repayment Period</Label>
          <Select 
            value={formData.deductionMonths.toString()} 
            onValueChange={(value) => setFormData({ ...formData, deductionMonths: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Month</SelectItem>
              <SelectItem value="2">2 Months</SelectItem>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="4">4 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="staffNotes">Additional Information</Label>
        <Textarea
          id="staffNotes"
          value={formData.staffNotes}
          onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
          placeholder="Any additional details that might help with approval..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <DollarSign className="w-4 h-4 mr-2" />
          Submit Request
        </Button>
      </DialogFooter>
    </form>
  );
}

// Approval Form Component
function ApprovalForm({ 
  type, 
  item, 
  onSubmit, 
  onCancel 
}: { 
  type: 'overtime' | 'advance'; 
  item: any; 
  onSubmit: (data: any) => void; 
  onCancel: () => void 
}) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [formData, setFormData] = useState({
    compensationType: 'paid',
    compensationAmount: '',
    compensationRate: '150',
    paymentMethod: 'bank_transfer',
    deductionStartMonth: new Date().toISOString().slice(0, 7),
    adminNotes: '',
    rejectionReason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      action,
      ...formData,
      compensationAmount: formData.compensationAmount ? parseFloat(formData.compensationAmount) : undefined,
      compensationRate: parseFloat(formData.compensationRate),
    });
  };

  if (!item) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">
          {type === 'overtime' ? 'Overtime Session Details' : 'Advance Request Details'}
        </h4>
        {type === 'overtime' ? (
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Date:</span> {new Date(item.sessionDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Duration:</span> {item.totalHours ? `${item.totalHours}h` : 'In Progress'}</p>
            <p><span className="font-medium">Task:</span> {item.taskDescription || 'No description'}</p>
            <p><span className="font-medium">Location:</span> {item.workLocation || 'Not specified'}</p>
            {item.isEmergency && <p className="text-red-600 font-medium">⚠️ Emergency Task</p>}
            {item.isAfterHours && <p className="text-blue-600 font-medium">🌙 After Hours</p>}
          </div>
        ) : (
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Amount:</span> {new Intl.NumberFormat('th-TH', { style: 'currency', currency: item.currency }).format(item.requestedAmount)}</p>
            <p><span className="font-medium">Reason:</span> {item.reason}</p>
            <p><span className="font-medium">Urgency:</span> {item.urgencyLevel}</p>
            <p><span className="font-medium">Repayment:</span> {item.deductionMonths} months</p>
          </div>
        )}
      </div>

      <div>
        <Label>Action</Label>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="approve"
              checked={action === 'approve'}
              onChange={() => setAction('approve')}
              className="text-green-600"
            />
            <Label htmlFor="approve" className="text-green-600 font-medium">Approve</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="reject"
              checked={action === 'reject'}
              onChange={() => setAction('reject')}
              className="text-red-600"
            />
            <Label htmlFor="reject" className="text-red-600 font-medium">Reject</Label>
          </div>
        </div>
      </div>

      {action === 'approve' && (
        <>
          {type === 'overtime' && (
            <>
              <div>
                <Label htmlFor="compensationType">Compensation Type</Label>
                <Select 
                  value={formData.compensationType} 
                  onValueChange={(value) => setFormData({ ...formData, compensationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Overtime Pay</SelectItem>
                    <SelectItem value="time_off">Compensatory Time Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.compensationType === 'paid' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="compensationRate">Hourly Rate (THB)</Label>
                    <Input
                      id="compensationRate"
                      type="number"
                      value={formData.compensationRate}
                      onChange={(e) => setFormData({ ...formData, compensationRate: e.target.value })}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="compensationAmount">Total Amount (THB)</Label>
                    <Input
                      id="compensationAmount"
                      type="number"
                      value={formData.compensationAmount}
                      onChange={(e) => setFormData({ ...formData, compensationAmount: e.target.value })}
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {type === 'advance' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="salary_deduction">Next Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deductionStartMonth">Deduction Start</Label>
                <Input
                  id="deductionStartMonth"
                  type="month"
                  value={formData.deductionStartMonth}
                  onChange={(e) => setFormData({ ...formData, deductionStartMonth: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              placeholder="Additional notes or instructions..."
            />
          </div>
        </>
      )}

      {action === 'reject' && (
        <div>
          <Label htmlFor="rejectionReason">Rejection Reason</Label>
          <Textarea
            id="rejectionReason"
            value={formData.rejectionReason}
            onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
            placeholder="Please explain the reason for rejection..."
            required
          />
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant={action === 'approve' ? 'default' : 'destructive'}>
          {action === 'approve' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}