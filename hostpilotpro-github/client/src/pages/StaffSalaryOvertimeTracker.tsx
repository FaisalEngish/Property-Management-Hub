import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, DollarSign, Users, FileText, Timer, AlertTriangle, CalendarClock, Calculator, CreditCard, Send, CheckCircle, XCircle, Pause } from "lucide-react";

export default function StaffSalaryOvertimeTracker() {
  const { toast } = useToast();
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  // Queries
  const { data: staffList, isLoading: loadingStaff } = useQuery({
    queryKey: ["/api/staff-salary/staff-list"],
  });

  const { data: salarySettings, isLoading: loadingSettings } = useQuery({
    queryKey: ["/api/staff-salary/settings", selectedStaff],
    enabled: !!selectedStaff,
  });

  const { data: clockLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["/api/staff-salary/clock-logs", selectedMonth],
  });

  const { data: payrollSummary, isLoading: loadingPayroll } = useQuery({
    queryKey: ["/api/staff-salary/payroll-summary", selectedMonth],
  });

  // Advance Request Queries
  const { data: advanceRequests, isLoading: loadingAdvances } = useQuery({
    queryKey: ["/api/staff-salary/advance-requests"],
  });

  // Overtime Requests Query
  const { data: overtimeRequests, isLoading: loadingOvertimeRequests } = useQuery({
    queryKey: ["/api/staff-salary/overtime-requests"],
  });

  // Clock In/Out Mutation
  const clockMutation = useMutation({
    mutationFn: async (data: { action: "in" | "out"; reason: string; notes?: string }) => {
      return await apiRequest("POST", "/api/staff-salary/clock", data);
    },
    onSuccess: () => {
      toast({ title: "Clock action recorded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/clock-logs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record clock action",
        variant: "destructive",
      });
    },
  });

  // Emergency Task Bonus Mutation
  const bonusMutation = useMutation({
    mutationFn: async (data: { taskId: number; bonusAmount: number; emergencyType: string; notes?: string }) => {
      return await apiRequest("POST", "/api/staff-salary/emergency-bonus", data);
    },
    onSuccess: () => {
      toast({ title: "Emergency bonus recorded" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/payroll-summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record bonus",
        variant: "destructive",
      });
    },
  });

  // Advance Request Mutation
  const advanceRequestMutation = useMutation({
    mutationFn: async (data: { amount: number; reason: string; requestedDate: string }) => {
      return await apiRequest("POST", "/api/staff-salary/advance-request", data);
    },
    onSuccess: () => {
      toast({ title: "Advance request submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/advance-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit advance request",
        variant: "destructive",
      });
    },
  });

  // Overtime Request Mutation
  const overtimeRequestMutation = useMutation({
    mutationFn: async (data: { taskId: number; hoursWorked: number; requestType: "pay" | "time_off"; notes?: string }) => {
      return await apiRequest("POST", "/api/staff-salary/overtime-request", data);
    },
    onSuccess: () => {
      toast({ title: "Overtime request submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/overtime-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit overtime request",
        variant: "destructive",
      });
    },
  });

  // Admin Approval Mutations
  const approveAdvanceMutation = useMutation({
    mutationFn: async (data: { requestId: number; action: "approve" | "reject" | "pending"; notes?: string }) => {
      return await apiRequest("POST", "/api/staff-salary/approve-advance", data);
    },
    onSuccess: () => {
      toast({ title: "Advance request updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/advance-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update advance request",
        variant: "destructive",
      });
    },
  });

  const approveOvertimeMutation = useMutation({
    mutationFn: async (data: { requestId: number; action: "approve" | "reject"; notes?: string }) => {
      return await apiRequest("POST", "/api/staff-salary/approve-overtime", data);
    },
    onSuccess: () => {
      toast({ title: "Overtime request updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/overtime-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update overtime request",
        variant: "destructive",
      });
    },
  });

  // Get current user role (simplified)
  const userRole = "admin"; // This would come from authentication context

  const handleClockAction = (action: "in" | "out", reason: string, notes?: string) => {
    clockMutation.mutate({ action, reason, notes });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)}h`;
  };

  if (loadingStaff) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Salary & Overtime Tracker</h1>
          <p className="text-muted-foreground">
            Manage staff salaries, overtime, and emergency task bonuses
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = date.toISOString().slice(0, 7);
                const label = date.toLocaleDateString("en-AU", { year: "numeric", month: "long" });
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="advance">💸 Advance Requests</TabsTrigger>
          <TabsTrigger value="overtime">⏱ Overtime Tracker</TabsTrigger>
          <TabsTrigger value="clock">🕒 Clock In/Out</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          <TabsTrigger value="emergency">🚨 Emergency Tasks</TabsTrigger>
          <TabsTrigger value="payroll">💰 Payroll</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollSummary?.totalStaff || 0}</div>
                <p className="text-xs text-muted-foreground">Active employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollSummary?.totalPayroll ? formatCurrency(payrollSummary.totalPayroll) : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollSummary?.averageOvertimeHours ? formatHours(payrollSummary.averageOvertimeHours) : "0h"}
                </div>
                <p className="text-xs text-muted-foreground">Average per staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Tasks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollSummary?.emergencyTasksCount || 0}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Clock Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Clock Logs</CardTitle>
              <CardDescription>Latest staff clock in/out activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clockLogs?.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{log.staffName}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.clockInReason} • {new Date(log.clockInTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {log.totalHours && (
                        <p className="font-medium">{formatHours(log.totalHours)}</p>
                      )}
                      {log.overtimeHours > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{formatHours(log.overtimeHours)} OT
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {(!clockLogs || clockLogs.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No clock logs found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advance Request Tab */}
        <TabsContent value="advance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Request Advance Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Request Salary Advance
                </CardTitle>
                <CardDescription>
                  Request an advance on your monthly salary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="advance-amount">Amount (AUD)</Label>
                  <Input
                    id="advance-amount"
                    type="number"
                    placeholder="Enter amount"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advance-reason">Reason</Label>
                  <Textarea
                    id="advance-reason"
                    placeholder="Explain why you need this advance"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advance-date">Date Needed</Label>
                  <Input
                    id="advance-date"
                    type="date"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    const amount = (document.getElementById("advance-amount") as HTMLInputElement)?.value;
                    const reason = (document.getElementById("advance-reason") as HTMLTextAreaElement)?.value;
                    const date = (document.getElementById("advance-date") as HTMLInputElement)?.value;
                    
                    if (amount && reason && date) {
                      advanceRequestMutation.mutate({
                        amount: parseFloat(amount),
                        reason,
                        requestedDate: date
                      });
                    }
                  }}
                  disabled={advanceRequestMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </CardContent>
            </Card>

            {/* Advance Request History */}
            <Card>
              <CardHeader>
                <CardTitle>Your Advance Requests</CardTitle>
                <CardDescription>
                  View your advance request history and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advanceRequests?.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatCurrency(request.amount)}</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested: {new Date(request.requestedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            request.status === "approved" ? "default" :
                            request.status === "rejected" ? "destructive" : "secondary"
                          }
                        >
                          {request.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {request.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {request.status === "pending" && <Pause className="h-3 w-3 mr-1" />}
                          {request.status}
                        </Badge>
                        {userRole === "admin" && request.status === "pending" && (
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveAdvanceMutation.mutate({ 
                                requestId: request.id, 
                                action: "approve" 
                              })}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveAdvanceMutation.mutate({ 
                                requestId: request.id, 
                                action: "reject" 
                              })}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!advanceRequests || advanceRequests.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No advance requests found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overtime Tracker Tab */}
        <TabsContent value="overtime" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overtime Request Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Request Overtime Compensation
                </CardTitle>
                <CardDescription>
                  Request compensation for overtime work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="overtime-task">Task ID</Label>
                  <Input
                    id="overtime-task"
                    type="number"
                    placeholder="Enter task ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime-hours">Hours Worked</Label>
                  <Input
                    id="overtime-hours"
                    type="number"
                    placeholder="Enter hours"
                    step="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime-type">Compensation Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select compensation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pay">Overtime Pay</SelectItem>
                      <SelectItem value="time_off">Compensatory Time Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime-notes">Notes</Label>
                  <Textarea
                    id="overtime-notes"
                    placeholder="Additional details about the overtime work"
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    const taskId = (document.getElementById("overtime-task") as HTMLInputElement)?.value;
                    const hours = (document.getElementById("overtime-hours") as HTMLInputElement)?.value;
                    const notes = (document.getElementById("overtime-notes") as HTMLTextAreaElement)?.value;
                    
                    if (taskId && hours) {
                      overtimeRequestMutation.mutate({
                        taskId: parseInt(taskId),
                        hoursWorked: parseFloat(hours),
                        requestType: "pay", // This should come from the select
                        notes
                      });
                    }
                  }}
                  disabled={overtimeRequestMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </CardContent>
            </Card>

            {/* Overtime Request History */}
            <Card>
              <CardHeader>
                <CardTitle>Overtime Requests</CardTitle>
                <CardDescription>
                  Track your overtime compensation requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overtimeRequests?.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Task #{request.taskId}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatHours(request.hoursWorked)} • {request.requestType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            request.status === "approved" ? "default" :
                            request.status === "rejected" ? "destructive" : "secondary"
                          }
                        >
                          {request.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {request.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {request.status === "pending" && <Pause className="h-3 w-3 mr-1" />}
                          {request.status}
                        </Badge>
                        {userRole === "admin" && request.status === "pending" && (
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveOvertimeMutation.mutate({ 
                                requestId: request.id, 
                                action: "approve" 
                              })}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveOvertimeMutation.mutate({ 
                                requestId: request.id, 
                                action: "reject" 
                              })}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!overtimeRequests || overtimeRequests.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No overtime requests found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clock In/Out Tab */}
        <TabsContent value="clock" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Clock In */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Clock In
                </CardTitle>
                <CardDescription>Record start of work shift</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clockInReason">Reason</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular_shift">Regular Shift</SelectItem>
                      <SelectItem value="overtime_requested">Overtime Requested</SelectItem>
                      <SelectItem value="emergency_call">Emergency Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clockInNotes">Notes (optional)</Label>
                  <Textarea
                    id="clockInNotes"
                    placeholder="Additional notes..."
                    className="resize-none"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleClockAction("in", "regular_shift")}
                  disabled={clockMutation.isPending}
                >
                  Clock In
                </Button>
              </CardContent>
            </Card>

            {/* Clock Out */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Clock Out
                </CardTitle>
                <CardDescription>Record end of work shift</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clockOutReason">Reason</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shift_end">Shift End</SelectItem>
                      <SelectItem value="overtime_complete">Overtime Complete</SelectItem>
                      <SelectItem value="emergency_complete">Emergency Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clockOutNotes">Notes (optional)</Label>
                  <Textarea
                    id="clockOutNotes"
                    placeholder="Additional notes..."
                    className="resize-none"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleClockAction("out", "shift_end")}
                  disabled={clockMutation.isPending}
                >
                  Clock Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Clock Log History */}
          <Card>
            <CardHeader>
              <CardTitle>Clock Log History</CardTitle>
              <CardDescription>Your clock in/out history for {selectedMonth}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clockLogs?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.overtimeApprovalStatus === "approved" ? "default" : "secondary"}>
                          {log.clockInReason}
                        </Badge>
                        {log.overtimeHours > 0 && (
                          <Badge variant="outline">Overtime</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.clockInTime).toLocaleString()} - {" "}
                        {log.clockOutTime ? new Date(log.clockOutTime).toLocaleString() : "Active"}
                      </p>
                    </div>
                    <div className="text-right">
                      {log.totalHours && (
                        <p className="font-medium">{formatHours(log.totalHours)}</p>
                      )}
                      {log.overtimeHours > 0 && (
                        <p className="text-sm text-orange-600">+{formatHours(log.overtimeHours)} OT</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!clockLogs || clockLogs.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No clock logs for this month</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salary Settings</CardTitle>
              <CardDescription>Configure staff salary and overtime rates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Settings configuration will be available for admin users
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Tasks Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Task Bonuses</CardTitle>
              <CardDescription>Manage emergency task bonuses and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Emergency task bonus management coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Payroll Summary - {new Date(selectedMonth + "-01").toLocaleDateString("en-AU", { year: "numeric", month: "long" })}
              </CardTitle>
              <CardDescription>Monthly payroll breakdown and reports</CardDescription>
            </CardHeader>
            <CardContent>
              {payrollSummary ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Fixed Salaries</p>
                      <p className="text-2xl font-bold">{formatCurrency(payrollSummary.totalFixedSalaries)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Overtime Pay</p>
                      <p className="text-2xl font-bold">{formatCurrency(payrollSummary.totalOvertimePay)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Emergency Bonuses</p>
                      <p className="text-2xl font-bold">{formatCurrency(payrollSummary.totalEmergencyBonuses)}</p>
                    </div>
                  </div>

                  {/* Department Breakdown */}
                  {payrollSummary.departmentBreakdown && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Department Breakdown</h3>
                      <div className="space-y-2">
                        {Object.entries(payrollSummary.departmentBreakdown).map(([dept, amount]: [string, any]) => (
                          <div key={dept} className="flex justify-between items-center p-2 border rounded">
                            <span className="capitalize">{dept}</span>
                            <span className="font-medium">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No payroll data for this month</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}