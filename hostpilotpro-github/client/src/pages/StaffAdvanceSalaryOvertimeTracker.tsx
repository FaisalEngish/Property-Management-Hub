import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle, Plus } from "lucide-react";

export default function StaffAdvanceSalaryOvertimeTracker() {
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const staffMembers = [
    {
      id: 1,
      name: "Niran Thaksin",
      position: "Head Housekeeper",
      baseSalary: 25000,
      overtimeRate: 150,
      currentAdvance: 5000,
      totalOvertime: 32.5,
      overtimeEarnings: 4875,
      status: "active",
      department: "housekeeping"
    },
    {
      id: 2,
      name: "Somchai Patel",
      position: "Pool Maintenance",
      baseSalary: 22000,
      overtimeRate: 135,
      currentAdvance: 0,
      totalOvertime: 15.0,
      overtimeEarnings: 2025,
      status: "active",
      department: "maintenance"
    },
    {
      id: 3,
      name: "Malee Kasem",
      position: "Guest Relations",
      baseSalary: 28000,
      overtimeRate: 170,
      currentAdvance: 8000,
      totalOvertime: 28.0,
      overtimeEarnings: 4760,
      status: "active",
      department: "guest_services"
    },
    {
      id: 4,
      name: "Kamon Saetang",
      position: "Security Guard",
      baseSalary: 20000,
      overtimeRate: 120,
      currentAdvance: 3000,
      totalOvertime: 45.0,
      overtimeEarnings: 5400,
      status: "active",
      department: "security"
    },
    {
      id: 5,
      name: "Ploy Chamnong",
      position: "Chef Assistant",
      baseSalary: 18000,
      overtimeRate: 110,
      currentAdvance: 2000,
      totalOvertime: 12.0,
      overtimeEarnings: 1320,
      status: "active",
      department: "kitchen"
    }
  ];

  const overtimeRecords = [
    {
      id: 1,
      staffName: "Niran Thaksin",
      date: "2025-01-20",
      regularHours: 8,
      overtimeHours: 4,
      reason: "Guest checkout deep cleaning",
      approvedBy: "Jane Manager",
      amount: 600,
      status: "approved"
    },
    {
      id: 2,
      staffName: "Malee Kasem",
      date: "2025-01-19",
      regularHours: 8,
      overtimeHours: 3,
      reason: "Late guest check-in assistance",
      approvedBy: "Pending",
      amount: 510,
      status: "pending"
    },
    {
      id: 3,
      staffName: "Kamon Saetang",
      date: "2025-01-18",
      regularHours: 8,
      overtimeHours: 6,
      reason: "Night security coverage",
      approvedBy: "John Admin",
      amount: 720,
      status: "approved"
    },
    {
      id: 4,
      staffName: "Somchai Patel",
      date: "2025-01-17",
      regularHours: 8,
      overtimeHours: 2,
      reason: "Emergency pool repair",
      approvedBy: "Jane Manager",
      amount: 270,
      status: "approved"
    }
  ];

  const salaryAdvances = [
    {
      id: 1,
      staffName: "Malee Kasem",
      requestDate: "2025-01-10",
      amount: 8000,
      reason: "Medical emergency for family member",
      approvedBy: "John Admin",
      repaymentPlan: "4 months",
      remainingBalance: 6000,
      status: "active"
    },
    {
      id: 2,
      staffName: "Niran Thaksin",
      requestDate: "2025-01-05",
      amount: 5000,
      reason: "Children school fees",
      approvedBy: "Jane Manager",
      repaymentPlan: "3 months",
      remainingBalance: 3333,
      status: "active"
    },
    {
      id: 3,
      staffName: "Kamon Saetang",
      requestDate: "2024-12-20",
      amount: 3000,
      reason: "Home renovation",
      approvedBy: "John Admin",
      repaymentPlan: "2 months",
      remainingBalance: 1500,
      status: "active"
    },
    {
      id: 4,
      staffName: "Ploy Chamnong",
      requestDate: "2024-12-15",
      amount: 2000,
      reason: "Motorbike repair",
      approvedBy: "Jane Manager",
      repaymentPlan: "2 months",
      remainingBalance: 1000,
      status: "active"
    }
  ];

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case "housekeeping": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-orange-100 text-orange-800";
      case "guest_services": return "bg-green-100 text-green-800";
      case "security": return "bg-red-100 text-red-800";
      case "kitchen": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "active": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const summaryStats = {
    totalStaff: staffMembers.length,
    totalOvertimeHours: overtimeRecords.reduce((sum, record) => sum + record.overtimeHours, 0),
    totalOvertimePay: overtimeRecords.reduce((sum, record) => sum + record.amount, 0),
    totalAdvances: salaryAdvances.reduce((sum, advance) => sum + advance.remainingBalance, 0),
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="w-8 h-8" />
            Staff Advance & Overtime Tracker
          </h1>
          <p className="text-gray-600">Track salary advances, overtime hours, and additional compensation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Staff Overview</TabsTrigger>
          <TabsTrigger value="overtime">Overtime Records</TabsTrigger>
          <TabsTrigger value="advances">Salary Advances</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Summary</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Staff</p>
                    <p className="text-2xl font-bold">{summaryStats.totalStaff}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overtime Hours</p>
                    <p className="text-2xl font-bold text-orange-600">{summaryStats.totalOvertimeHours}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overtime Pay</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalOvertimePay)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Advances</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalAdvances)}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="This Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Staff Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMembers.map((staff) => (
                  <div key={staff.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-gray-500 mt-1" />
                        <div>
                          <h4 className="font-medium">{staff.name}</h4>
                          <p className="text-sm text-gray-600">{staff.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDepartmentColor(staff.department)}>
                          {staff.department.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(staff.status)}>
                          {staff.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Base Salary</p>
                        <p className="font-medium">{formatCurrency(staff.baseSalary)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Overtime Rate</p>
                        <p className="font-medium">{formatCurrency(staff.overtimeRate)}/hr</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Overtime</p>
                        <p className="font-medium text-orange-600">{staff.totalOvertime} hrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Overtime Earnings</p>
                        <p className="font-medium text-green-600">{formatCurrency(staff.overtimeEarnings)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Advance</p>
                        <p className="font-medium text-red-600">{formatCurrency(staff.currentAdvance)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Net Earnings</p>
                        <p className="font-medium text-blue-600">
                          {formatCurrency(staff.baseSalary + staff.overtimeEarnings - staff.currentAdvance)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Department: {staff.department.replace('_', ' ')} • Position: {staff.position}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overtime Records</span>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Overtime
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overtimeRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="font-medium">{record.staffName}</p>
                        <p className="text-sm text-gray-600">{record.reason}</p>
                        <p className="text-xs text-gray-500">
                          {record.date} • {record.regularHours}h regular + {record.overtimeHours}h overtime
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(record.amount)}</p>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {record.status === "approved" ? `by ${record.approvedBy}` : "Pending approval"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Salary Advances</span>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Advance
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaryAdvances.map((advance) => (
                  <div key={advance.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-red-500 mt-1" />
                        <div>
                          <h4 className="font-medium">{advance.staffName}</h4>
                          <p className="text-sm text-gray-600">{advance.reason}</p>
                          <p className="text-xs text-gray-500">
                            Requested: {advance.requestDate} • Approved by: {advance.approvedBy}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(advance.status)}>
                        {advance.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Original Amount</p>
                        <p className="font-medium">{formatCurrency(advance.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Remaining Balance</p>
                        <p className="font-medium text-red-600">{formatCurrency(advance.remainingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Repayment Plan</p>
                        <p className="font-medium">{advance.repaymentPlan}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{
                              width: `${((advance.amount - advance.remainingBalance) / advance.amount) * 100}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {(((advance.amount - advance.remainingBalance) / advance.amount) * 100).toFixed(1)}% repaid
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Monthly deduction: {formatCurrency(advance.remainingBalance / parseInt(advance.repaymentPlan))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Adjust Plan</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMembers.map((staff) => (
                  <div key={staff.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{staff.name}</h4>
                        <p className="text-sm text-gray-600">{staff.position}</p>
                      </div>
                      <Badge className={getDepartmentColor(staff.department)}>
                        {staff.department.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Base Salary</p>
                        <p className="font-medium">{formatCurrency(staff.baseSalary)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Overtime Pay</p>
                        <p className="font-medium text-green-600">+{formatCurrency(staff.overtimeEarnings)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Advance Deduction</p>
                        <p className="font-medium text-red-600">-{formatCurrency(staff.currentAdvance / 3)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Net Pay</p>
                        <p className="font-bold text-blue-600">
                          {formatCurrency(staff.baseSalary + staff.overtimeEarnings - (staff.currentAdvance / 3))}
                        </p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="w-full">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Process Pay
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Base Salaries</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(staffMembers.reduce((sum, s) => sum + s.baseSalary, 0))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Overtime Pay</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(staffMembers.reduce((sum, s) => sum + s.overtimeEarnings, 0))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Advance Deductions</p>
                    <p className="text-lg font-bold text-red-600">
                      -{formatCurrency(staffMembers.reduce((sum, s) => sum + (s.currentAdvance / 3), 0))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Net Payroll</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(staffMembers.reduce((sum, s) => sum + s.baseSalary + s.overtimeEarnings - (s.currentAdvance / 3), 0))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Overtime Configuration</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Standard Overtime Multiplier</label>
                      <Input type="number" defaultValue="1.5" step="0.1" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Holiday Overtime Multiplier</label>
                      <Input type="number" defaultValue="2.0" step="0.1" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Daily Overtime Threshold (hours)</label>
                      <Input type="number" defaultValue="8" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Advance Policy</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Maximum Advance (% of salary)</label>
                      <Input type="number" defaultValue="50" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Default Repayment Period (months)</label>
                      <Input type="number" defaultValue="3" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Minimum Service Period (months)</label>
                      <Input type="number" defaultValue="6" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Approval Workflow</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Require manager approval for overtime</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Require admin approval for advances</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-approve overtime under 2 hours</span>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Send notifications for pending approvals</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}