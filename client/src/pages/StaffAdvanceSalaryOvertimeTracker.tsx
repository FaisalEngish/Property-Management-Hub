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
  Users
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

  // Form states
  const [advanceForm, setAdvanceForm] = useState({
    requestAmount: "",
    requestReason: "",
    proofAttachment: ""
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Clock In/Out System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Clock In/Out Feature
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This feature allows staff to clock in and out for their shifts, 
                  automatically tracking regular hours and detecting overtime.
                </p>
                <div className="flex justify-center gap-4">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Users className="w-5 h-5 mr-2" />
                    Clock In
                  </Button>
                  <Button size="lg" variant="outline">
                    <Users className="w-5 h-5 mr-2" />
                    Clock Out
                  </Button>
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
    </div>
  );
}