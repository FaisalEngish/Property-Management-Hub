import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hireDate: string;
  salaryType: "monthly" | "hourly";
  monthlySalary?: number;
  hourlyRate?: number;
  status: "active" | "inactive" | "terminated";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  notes?: string;
}

interface PayrollRecord {
  id: number;
  staffMemberId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  bonus: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  taxDeduction: number;
  socialSecurity: number;
  status: "pending" | "approved" | "paid";
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
}

interface StaffAnalytics {
  totalStaff: number;
  activeStaff: number;
  totalMonthlyPayroll: number;
  departmentBreakdown: Array<{
    department: string;
    count: number;
    totalSalary: number;
  }>;
  upcomingPayments: number;
  averageSalary: number;
}

export default function SalariesWages() {
  const { toast } = useToast();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [payrollFormData, setPayrollFormData] = useState<Partial<PayrollRecord>>({});

  // Fetch staff members
  const { data: staffMembers = [], isLoading: staffLoading } = useQuery<
    StaffMember[]
  >({
    queryKey: ["/api/staff-members"],
    queryFn: () => apiRequest("/api/staff-members?organizationId=default-org"),
  });

  // Fetch payroll records
  const { data: payrollRecords = [], isLoading: payrollLoading } = useQuery<
    PayrollRecord[]
  >({
    queryKey: ["/api/payroll-records"],
    queryFn: () =>
      apiRequest("/api/payroll-records?organizationId=default-org"),
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<StaffAnalytics>({
      queryKey: ["/api/staff-analytics"],
      queryFn: () =>
        apiRequest("/api/staff-analytics?organizationId=default-org"),
    });

  // Update payroll record mutation
  const updatePayrollMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<PayrollRecord> }) => {
      return await apiRequest("PUT", `/api/payroll-records/${data.id}`, data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll record updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll-records"] });
      setEditingPayroll(null);
      setPayrollFormData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payroll record",
        variant: "destructive",
      });
    },
  });

  const handleEditPayroll = (record: PayrollRecord) => {
    setEditingPayroll(record);
    setPayrollFormData(record);
  };

  const handleSavePayroll = () => {
    if (editingPayroll && payrollFormData) {
      updatePayrollMutation.mutate({
        id: editingPayroll.id,
        updates: payrollFormData,
      });
    }
  };

  const formatWithConversion = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      terminated: "bg-red-100 text-red-800",
      pending: "bg-blue-100 text-blue-800",
      approved: "bg-purple-100 text-purple-800",
      paid: "bg-green-100 text-green-800",
    };
    return (
      <Badge
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (staffLoading || payrollLoading || analyticsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading staff management system...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salaries & Wages</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff payroll, documents, and salary information
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeStaff} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Payroll
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatWithConversion(analytics.totalMonthlyPayroll)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total monthly cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Salary
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatWithConversion(analytics.averageSalary)}
              </div>
              <p className="text-xs text-muted-foreground">Per staff member</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.upcomingPayments}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        {/* Staff Members Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                Manage employee profiles, salary information, and employment
                status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        {staff.employeeId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {staff.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>
                        {staff.salaryType === "monthly"
                          ? formatWithConversion(staff.monthlySalary || 0)
                          : `${formatWithConversion(staff.hourlyRate || 0)}/hr`}
                      </TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog
                            open={viewDetailsOpen}
                            onOpenChange={setViewDetailsOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStaff(staff);
                                  setViewDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Staff Member Details</DialogTitle>
                              </DialogHeader>
                              {selectedStaff && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">
                                        Personal Information
                                      </h4>
                                      <div className="mt-2 space-y-1 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Name:
                                          </span>{" "}
                                          {selectedStaff.firstName}{" "}
                                          {selectedStaff.lastName}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Email:
                                          </span>{" "}
                                          {selectedStaff.email}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Phone:
                                          </span>{" "}
                                          {selectedStaff.phone || "N/A"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Address:
                                          </span>{" "}
                                          {selectedStaff.address || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Employment Details
                                      </h4>
                                      <div className="mt-2 space-y-1 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Employee ID:
                                          </span>{" "}
                                          {selectedStaff.employeeId}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Position:
                                          </span>{" "}
                                          {selectedStaff.position}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Department:
                                          </span>{" "}
                                          {selectedStaff.department}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Hire Date:
                                          </span>{" "}
                                          {formatDate(selectedStaff.hireDate)}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Status:
                                          </span>{" "}
                                          {getStatusBadge(selectedStaff.status)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">
                                      Salary Information
                                    </h4>
                                    <div className="mt-2 space-y-1 text-sm">
                                      <p>
                                        <span className="font-medium">
                                          Salary Type:
                                        </span>{" "}
                                        {selectedStaff.salaryType}
                                      </p>
                                      {selectedStaff.salaryType ===
                                      "monthly" ? (
                                        <p>
                                          <span className="font-medium">
                                            Monthly Salary:
                                          </span>{" "}
                                          {formatWithConversion(
                                            selectedStaff.monthlySalary || 0,
                                          )}
                                        </p>
                                      ) : (
                                        <p>
                                          <span className="font-medium">
                                            Hourly Rate:
                                          </span>{" "}
                                          {formatWithConversion(
                                            selectedStaff.hourlyRate || 0,
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {(selectedStaff.emergencyContactName ||
                                    selectedStaff.emergencyContactPhone) && (
                                    <div>
                                      <h4 className="font-semibold">
                                        Emergency Contact
                                      </h4>
                                      <div className="mt-2 space-y-1 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Name:
                                          </span>{" "}
                                          {selectedStaff.emergencyContactName ||
                                            "N/A"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Phone:
                                          </span>{" "}
                                          {selectedStaff.emergencyContactPhone ||
                                            "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {selectedStaff.notes && (
                                    <div>
                                      <h4 className="font-semibold">Notes</h4>
                                      <p className="mt-2 text-sm">
                                        {selectedStaff.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Records Tab */}
        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
              <CardDescription>
                Track salary payments, bonuses, and deductions for all staff
                members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => {
                    const staff = staffMembers.find(
                      (s) => s.id === record.staffMemberId,
                    );
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(record.payPeriodStart)}</div>
                            <div className="text-muted-foreground">
                              to {formatDate(record.payPeriodEnd)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {staff
                            ? `${staff.firstName} ${staff.lastName}`
                            : "Unknown"}
                        </TableCell>
                        <TableCell>
                          {formatWithConversion(record.baseSalary)}
                        </TableCell>
                        <TableCell>
                          {record.overtimeHours > 0 ? (
                            <div className="text-sm">
                              <div>{record.overtimeHours}h</div>
                              <div className="text-muted-foreground">
                                @ {formatWithConversion(record.overtimeRate)}/h
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {record.bonus > 0
                            ? formatWithConversion(record.bonus)
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatWithConversion(record.grossPay)}
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatWithConversion(record.netPay)}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPayroll(record)}
                            data-testid={`button-edit-payroll-${record.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>
                View staff distribution and payroll costs by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.departmentBreakdown && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.departmentBreakdown.map((dept) => (
                    <Card key={dept.department}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {dept.department}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Staff Count:
                            </span>
                            <span className="font-medium">{dept.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Total Salary:
                            </span>
                            <span className="font-medium">
                              {formatWithConversion(dept.totalSalary)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Avg. Salary:
                            </span>
                            <span className="font-medium">
                              {formatWithConversion(dept.totalSalary / dept.count)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Payroll Record Dialog */}
      <Dialog open={!!editingPayroll} onOpenChange={() => {
        setEditingPayroll(null);
        setPayrollFormData({});
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payroll Record</DialogTitle>
          </DialogHeader>
          {editingPayroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payPeriodStart">Pay Period Start</Label>
                  <Input
                    id="payPeriodStart"
                    type="date"
                    value={payrollFormData.payPeriodStart || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        payPeriodStart: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="payPeriodEnd">Pay Period End</Label>
                  <Input
                    id="payPeriodEnd"
                    type="date"
                    value={payrollFormData.payPeriodEnd || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        payPeriodEnd: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseSalary">Base Salary</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={payrollFormData.baseSalary || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        baseSalary: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={payrollFormData.bonus || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        bonus: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="overtimeHours">Overtime Hours</Label>
                  <Input
                    id="overtimeHours"
                    type="number"
                    value={payrollFormData.overtimeHours || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        overtimeHours: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="overtimeRate">Overtime Rate</Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    value={payrollFormData.overtimeRate || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        overtimeRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={payrollFormData.deductions || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        deductions: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxDeduction">Tax Deduction</Label>
                  <Input
                    id="taxDeduction"
                    type="number"
                    value={payrollFormData.taxDeduction || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        taxDeduction: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="socialSecurity">Social Security</Label>
                  <Input
                    id="socialSecurity"
                    type="number"
                    value={payrollFormData.socialSecurity || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        socialSecurity: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grossPay">Gross Pay</Label>
                  <Input
                    id="grossPay"
                    type="number"
                    value={payrollFormData.grossPay || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        grossPay: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="netPay">Net Pay</Label>
                  <Input
                    id="netPay"
                    type="number"
                    value={payrollFormData.netPay || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        netPay: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={payrollFormData.status || "pending"}
                    onValueChange={(value: "pending" | "approved" | "paid") =>
                      setPayrollFormData({ ...payrollFormData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={payrollFormData.paymentDate || ""}
                    onChange={(e) =>
                      setPayrollFormData({
                        ...payrollFormData,
                        paymentDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  value={payrollFormData.paymentMethod || ""}
                  onChange={(e) =>
                    setPayrollFormData({
                      ...payrollFormData,
                      paymentMethod: e.target.value,
                    })
                  }
                  placeholder="e.g., Bank Transfer, Cash"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={payrollFormData.notes || ""}
                  onChange={(e) =>
                    setPayrollFormData({
                      ...payrollFormData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPayroll(null);
                    setPayrollFormData({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePayroll}
                  disabled={updatePayrollMutation.isPending}
                  data-testid="button-save-payroll"
                >
                  {updatePayrollMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
