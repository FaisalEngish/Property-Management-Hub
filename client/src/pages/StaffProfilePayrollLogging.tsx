import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  TrendingUp,
  ChevronRight,
  Plus,
  Edit,
  Download,
  Star,
  MapPin,
  Phone,
  Mail,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface StaffProfile {
  id: number;
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  position: string;
  baseSalary: number;
  hourlyRate?: number;
  commissionRate?: number;
  hireDate: string;
  isActive: boolean;
  profilePicture?: string;
  emergencyContact?: string;
  bankAccount?: string;
  averageRating?: number;
  totalHoursWorked?: number;
  totalEarnings?: number;
  totalTasks?: number;
  completedTasks?: number;
}

interface PayrollRecord {
  id: number;
  staffId: string;
  payrollPeriod: string;
  baseSalary: number;
  overtimePay: number;
  commissions: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: string;
  paidDate?: string;
  createdBy: string;
}

interface TaskPerformanceLog {
  id: number;
  staffId: string;
  taskId: number;
  propertyId: number;
  taskType: string;
  timeSpentMinutes: number;
  qualityRating: number;
  feedback?: string;
  completedAt: string;
}

interface AttendanceRecord {
  id: number;
  staffId: string;
  workDate: string;
  clockIn?: string;
  clockOut?: string;
  totalHours: number;
  status: string;
  notes?: string;
}

interface LeaveRequest {
  id: number;
  staffId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approvedBy?: string;
  requestedAt: string;
}

const DEPARTMENTS = ['Cleaning', 'Pool', 'Maintenance', 'Garden', 'Office'];

export default function StaffProfilePayrollLogging() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staff profiles
  const { data: staffProfiles = [], isLoading: profilesLoading } = useQuery<StaffProfile[]>({
    queryKey: ["/api/staff-profiles", selectedDepartment],
    queryFn: () => apiRequest("GET", `/api/staff-profiles?${selectedDepartment ? `department=${selectedDepartment}` : ''}`),
  });

  // Fetch payroll records
  const { data: payrollRecords = [], isLoading: payrollLoading } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll-records", selectedStaff],
    queryFn: () => apiRequest("GET", `/api/payroll-records?${selectedStaff ? `staffId=${selectedStaff}` : ''}`),
  });

  // Fetch task performance
  const { data: taskPerformance = [], isLoading: performanceLoading } = useQuery<TaskPerformanceLog[]>({
    queryKey: ["/api/task-performance", selectedStaff],
    queryFn: () => apiRequest("GET", `/api/task-performance?${selectedStaff ? `staffId=${selectedStaff}` : ''}`),
  });

  // Fetch attendance records
  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance", selectedStaff],
    queryFn: () => apiRequest("GET", `/api/attendance?${selectedStaff ? `staffId=${selectedStaff}` : ''}`),
  });

  // Fetch leave requests
  const { data: leaveRequests = [], isLoading: leaveLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests", selectedStaff],
    queryFn: () => apiRequest("GET", `/api/leave-requests?${selectedStaff ? `staffId=${selectedStaff}` : ''}`),
  });

  // Create staff profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-profiles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-profiles"] });
      setShowCreateProfile(false);
      toast({ title: "Success", description: "Staff profile created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create staff profile", variant: "destructive" });
    }
  });

  // Create payroll record mutation
  const createPayrollMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/payroll-records", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll-records"] });
      setShowPayrollDialog(false);
      toast({ title: "Success", description: "Payroll record created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create payroll record", variant: "destructive" });
    }
  });

  // Create leave request mutation
  const createLeaveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/leave-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      setShowLeaveDialog(false);
      toast({ title: "Success", description: "Leave request submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit leave request", variant: "destructive" });
    }
  });

  // Get analytics data
  const totalStaff = staffProfiles.length;
  const activeStaff = staffProfiles.filter(s => s.isActive).length;
  const avgRating = staffProfiles.reduce((acc, s) => acc + (s.averageRating || 0), 0) / totalStaff || 0;
  const totalHours = staffProfiles.reduce((acc, s) => acc + (s.totalHoursWorked || 0), 0);

  const handleCreateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      staffId: formData.get('staffId'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phoneNumber: formData.get('phoneNumber'),
      department: formData.get('department'),
      position: formData.get('position'),
      baseSalary: Number(formData.get('baseSalary')),
      hourlyRate: Number(formData.get('hourlyRate')) || null,
      commissionRate: Number(formData.get('commissionRate')) || null,
      hireDate: formData.get('hireDate'),
      emergencyContact: formData.get('emergencyContact'),
      bankAccount: formData.get('bankAccount'),
      isActive: true
    };
    createProfileMutation.mutate(data);
  };

  const handleCreatePayroll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      staffId: formData.get('staffId'),
      payrollPeriod: formData.get('payrollPeriod'),
      baseSalary: Number(formData.get('baseSalary')),
      overtimePay: Number(formData.get('overtimePay')) || 0,
      commissions: Number(formData.get('commissions')) || 0,
      bonuses: Number(formData.get('bonuses')) || 0,
      deductions: Number(formData.get('deductions')) || 0,
      status: 'pending'
    };
    data.netPay = data.baseSalary + data.overtimePay + data.commissions + data.bonuses - data.deductions;
    createPayrollMutation.mutate(data);
  };

  const handleCreateLeave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      leaveType: formData.get('leaveType'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      reason: formData.get('reason')
    };
    createLeaveMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'secondary',
      'approved': 'default',
      'rejected': 'destructive',
      'paid': 'default',
      'present': 'default',
      'absent': 'destructive',
      'late': 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Profile & Payroll Logging</h1>
          <p className="text-muted-foreground">Comprehensive staff management and payroll tracking</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Staff Profile</DialogTitle>
                <DialogDescription>Add a new staff member to the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input id="staffId" name="staffId" required />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select name="department" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" name="phoneNumber" />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" name="position" required />
                  </div>
                  <div>
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input id="hireDate" name="hireDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="baseSalary">Base Salary (THB)</Label>
                    <Input id="baseSalary" name="baseSalary" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (THB)</Label>
                    <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input id="commissionRate" name="commissionRate" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input id="emergencyContact" name="emergencyContact" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bankAccount">Bank Account Details</Label>
                  <Textarea id="bankAccount" name="bankAccount" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateProfile(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProfileMutation.isPending}>
                    {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              {activeStaff} active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Performance score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Hours worked this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{DEPARTMENTS.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">📊 Staff Overview</TabsTrigger>
          <TabsTrigger value="payroll">💰 Monthly Payroll</TabsTrigger>
          <TabsTrigger value="performance">📈 Task Performance</TabsTrigger>
          <TabsTrigger value="attendance">⏰ Attendance & Leave</TabsTrigger>
          <TabsTrigger value="reports">📋 Pay Slips & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {profilesLoading ? (
              <div className="col-span-3 text-center py-8">Loading staff profiles...</div>
            ) : staffProfiles.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Staff Found</h3>
                <p className="text-muted-foreground">Add staff members to get started</p>
              </div>
            ) : (
              staffProfiles.map((staff) => (
                <Card key={staff.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedStaff(staff.staffId)}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {staff.firstName[0]}{staff.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{staff.firstName} {staff.lastName}</CardTitle>
                        <CardDescription>{staff.position} • {staff.department}</CardDescription>
                      </div>
                      <Badge variant={staff.isActive ? "default" : "secondary"}>
                        {staff.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Base Salary</span>
                        <span className="font-medium">฿{staff.baseSalary?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{staff.averageRating?.toFixed(1) || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tasks Completed</span>
                        <span className="font-medium">{staff.completedTasks || 0}/{staff.totalTasks || 0}</span>
                      </div>
                      <Progress 
                        value={staff.totalTasks ? (staff.completedTasks / staff.totalTasks) * 100 : 0} 
                        className="h-2"
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {staff.email}
                      </div>
                      {staff.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {staff.phoneNumber}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Staff</SelectItem>
                  {staffProfiles.map(staff => (
                    <SelectItem key={staff.staffId} value={staff.staffId}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Payroll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Monthly Payroll</DialogTitle>
                  <DialogDescription>Create payroll record for staff member</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePayroll} className="space-y-4">
                  <div>
                    <Label htmlFor="staffId">Staff Member</Label>
                    <Select name="staffId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffProfiles.map(staff => (
                          <SelectItem key={staff.staffId} value={staff.staffId}>
                            {staff.firstName} {staff.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payrollPeriod">Payroll Period</Label>
                    <Input id="payrollPeriod" name="payrollPeriod" type="month" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="baseSalary">Base Salary (THB)</Label>
                      <Input id="baseSalary" name="baseSalary" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="overtimePay">Overtime Pay (THB)</Label>
                      <Input id="overtimePay" name="overtimePay" type="number" defaultValue="0" />
                    </div>
                    <div>
                      <Label htmlFor="commissions">Commissions (THB)</Label>
                      <Input id="commissions" name="commissions" type="number" defaultValue="0" />
                    </div>
                    <div>
                      <Label htmlFor="bonuses">Bonuses (THB)</Label>
                      <Input id="bonuses" name="bonuses" type="number" defaultValue="0" />
                    </div>
                    <div>
                      <Label htmlFor="deductions">Deductions (THB)</Label>
                      <Input id="deductions" name="deductions" type="number" defaultValue="0" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowPayrollDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPayrollMutation.isPending}>
                      {createPayrollMutation.isPending ? "Generating..." : "Generate Payroll"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {payrollLoading ? (
              <div className="text-center py-8">Loading payroll records...</div>
            ) : payrollRecords.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Payroll Records</h3>
                <p className="text-muted-foreground">Generate payroll records to track payments</p>
              </div>
            ) : (
              payrollRecords.map((record) => {
                const staff = staffProfiles.find(s => s.staffId === record.staffId);
                return (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{staff?.firstName} {staff?.lastName}</CardTitle>
                          <CardDescription>{record.payrollPeriod} • {staff?.department}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">฿{record.netPay.toLocaleString()}</div>
                          {getStatusBadge(record.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Base Salary</div>
                          <div className="font-medium">฿{record.baseSalary.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Overtime</div>
                          <div className="font-medium">฿{record.overtimePay.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Commissions</div>
                          <div className="font-medium">฿{record.commissions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Bonuses</div>
                          <div className="font-medium">฿{record.bonuses.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Deductions</div>
                          <div className="font-medium text-red-600">-฿{record.deductions.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Staff</SelectItem>
                {staffProfiles.map(staff => (
                  <SelectItem key={staff.staffId} value={staff.staffId}>
                    {staff.firstName} {staff.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {performanceLoading ? (
              <div className="text-center py-8">Loading performance data...</div>
            ) : taskPerformance.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Performance Data</h3>
                <p className="text-muted-foreground">Task completion data will appear here</p>
              </div>
            ) : (
              taskPerformance.map((log) => {
                const staff = staffProfiles.find(s => s.staffId === log.staffId);
                return (
                  <Card key={log.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {staff?.firstName[0]}{staff?.lastName[0]}
                          </div>
                          <div>
                            <h4 className="font-medium">{staff?.firstName} {staff?.lastName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {log.taskType} • {log.timeSpentMinutes} minutes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{log.qualityRating}/5</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {log.feedback && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{log.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Staff</SelectItem>
                  {staffProfiles.map(staff => (
                    <SelectItem key={staff.staffId} value={staff.staffId}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Leave Request</DialogTitle>
                  <DialogDescription>Request time off from work</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateLeave} className="space-y-4">
                  <div>
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select name="leaveType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" name="endDate" type="date" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea id="reason" name="reason" placeholder="Optional reason for leave request" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowLeaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLeaveMutation.isPending}>
                      {createLeaveMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Records */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Clock in/out records</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div className="text-center py-4">Loading attendance...</div>
                ) : attendance.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No attendance records found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendance.slice(0, 5).map((record) => {
                      const staff = staffProfiles.find(s => s.staffId === record.staffId);
                      return (
                        <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{staff?.firstName} {staff?.lastName}</div>
                            <div className="text-sm text-muted-foreground">{record.workDate}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              {record.clockIn && record.clockOut 
                                ? `${record.clockIn} - ${record.clockOut}`
                                : record.clockIn 
                                  ? `In: ${record.clockIn}`
                                  : 'Not clocked in'
                              }
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(record.status)}
                              <span className="text-sm text-muted-foreground">
                                {record.totalHours}h
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Pending and approved requests</CardDescription>
              </CardHeader>
              <CardContent>
                {leaveLoading ? (
                  <div className="text-center py-4">Loading leave requests...</div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No leave requests found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaveRequests.slice(0, 5).map((request) => {
                      const staff = staffProfiles.find(s => s.staffId === request.staffId);
                      return (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{staff?.firstName} {staff?.lastName}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.leaveType} • {request.startDate} to {request.endDate}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(request.status)}
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Pay Slips & Reports</h3>
            <p className="text-muted-foreground mb-4">
              Download individual pay slips and generate comprehensive staff reports
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Pay Slip
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}