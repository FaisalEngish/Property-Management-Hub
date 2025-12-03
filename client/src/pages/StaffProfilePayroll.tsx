import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, DollarSign, Clock, Calendar, Phone, Mail, MapPin, Edit, Plus, FileText, CreditCard } from "lucide-react";

export default function StaffProfilePayroll() {
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("current");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const staffProfiles = [
    {
      id: 1,
      name: "Somchai Jaidee",
      role: "Maintenance Supervisor",
      department: "Maintenance",
      email: "somchai@hostpilotpro.com",
      phone: "+66 81 234 5678",
      address: "123 Soi Sukhumvit 42, Bangkok 10110",
      startDate: "2023-03-15",
      baseSalary: 35000,
      status: "active",
      avatar: "/avatars/somchai.jpg",
      skills: ["HVAC", "Plumbing", "Electrical", "Pool Maintenance"],
      certifications: ["Thai Electrical License", "Pool Chemical Handler"],
      emergencyContact: {
        name: "Malee Jaidee",
        relationship: "Spouse",
        phone: "+66 89 765 4321"
      }
    },
    {
      id: 2,
      name: "Niran Thepsiri",
      role: "Housekeeping Manager",
      department: "Housekeeping",
      email: "niran@hostpilotpro.com",
      phone: "+66 82 345 6789",
      address: "456 Thanon Phra Ram 4, Bangkok 10110",
      startDate: "2022-11-20",
      baseSalary: 32000,
      status: "active",
      avatar: "/avatars/niran.jpg",
      skills: ["Team Leadership", "Quality Control", "Inventory Management"],
      certifications: ["Hospitality Management Certificate"],
      emergencyContact: {
        name: "Preecha Thepsiri",
        relationship: "Father",
        phone: "+66 81 876 5432"
      }
    },
    {
      id: 3,
      name: "Apinya Khamchong",
      role: "Guest Services Coordinator",
      department: "Guest Services",
      email: "apinya@hostpilotpro.com",
      phone: "+66 83 456 7890",
      address: "789 Soi Thonglor 15, Bangkok 10110",
      startDate: "2023-08-10",
      baseSalary: 28000,
      status: "active",
      avatar: "/avatars/apinya.jpg",
      skills: ["Customer Service", "English/Thai Translation", "Concierge Services"],
      certifications: ["Tourism Authority License", "First Aid Certificate"],
      emergencyContact: {
        name: "Siriporn Khamchong",
        relationship: "Mother",
        phone: "+66 84 567 8901"
      }
    },
    {
      id: 4,
      name: "Wichai Suwanapong",
      role: "Security Officer",
      department: "Security",
      email: "wichai@hostpilotpro.com",
      phone: "+66 85 567 8901",
      address: "321 Soi Asoke 12, Bangkok 10110",
      startDate: "2024-01-05",
      baseSalary: 26000,
      status: "active",
      avatar: "/avatars/wichai.jpg",
      skills: ["Security Protocols", "Emergency Response", "CCTV Operations"],
      certifications: ["Security Guard License", "CPR Certification"],
      emergencyContact: {
        name: "Chanida Suwanapong",
        relationship: "Sister",
        phone: "+66 86 678 9012"
      }
    }
  ];

  const payrollRecords = [
    {
      id: 1,
      staffId: 1,
      payPeriod: "January 2025",
      baseSalary: 35000,
      overtime: 2800,
      bonus: 5000,
      deductions: 1200,
      netPay: 41600,
      payDate: "2025-01-31",
      status: "paid",
      workingDays: 22,
      overtimeHours: 14
    },
    {
      id: 2,
      staffId: 2,
      payPeriod: "January 2025",
      baseSalary: 32000,
      overtime: 1600,
      bonus: 3000,
      deductions: 1000,
      netPay: 35600,
      payDate: "2025-01-31",
      status: "paid",
      workingDays: 22,
      overtimeHours: 8
    },
    {
      id: 3,
      staffId: 3,
      payPeriod: "January 2025",
      baseSalary: 28000,
      overtime: 1200,
      bonus: 2000,
      deductions: 800,
      netPay: 30400,
      payDate: "2025-01-31",
      status: "paid",
      workingDays: 22,
      overtimeHours: 6
    },
    {
      id: 4,
      staffId: 4,
      payPeriod: "January 2025",
      baseSalary: 26000,
      overtime: 2400,
      bonus: 1500,
      deductions: 700,
      netPay: 29200,
      payDate: "2025-01-31",
      status: "paid",
      workingDays: 22,
      overtimeHours: 12
    }
  ];

  const attendanceRecords = [
    {
      staffId: 1,
      date: "2025-01-22",
      checkIn: "08:00",
      checkOut: "17:00",
      status: "present",
      hoursWorked: 8,
      overtime: 1
    },
    {
      staffId: 1,
      date: "2025-01-21",
      checkIn: "08:00",
      checkOut: "18:30",
      status: "present",
      hoursWorked: 8,
      overtime: 2.5
    },
    {
      staffId: 2,
      date: "2025-01-22",
      checkIn: "07:30",
      checkOut: "16:30",
      status: "present",
      hoursWorked: 8,
      overtime: 0
    },
    {
      staffId: 3,
      date: "2025-01-22",
      checkIn: "09:00",
      checkOut: "18:00",
      status: "present",
      hoursWorked: 8,
      overtime: 0
    }
  ];

  const formatWithConversion = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "on_leave": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPayrollStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Maintenance": return "bg-orange-100 text-orange-800";
      case "Housekeeping": return "bg-purple-100 text-purple-800";
      case "Guest Services": return "bg-blue-100 text-blue-800";
      case "Security": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const summaryStats = {
    totalStaff: staffProfiles.length,
    activeStaff: staffProfiles.filter(s => s.status === "active").length,
    monthlyPayroll: payrollRecords.reduce((sum, p) => sum + p.netPay, 0),
    totalOvertime: payrollRecords.reduce((sum, p) => sum + p.overtime, 0)
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Staff Profile & Payroll
          </h1>
          <p className="text-gray-600">Manage staff profiles, payroll processing, and attendance tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Payroll
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profiles">Staff Profiles</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Management</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
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
                    <p className="text-sm text-gray-600">Active Staff</p>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.activeStaff}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Payroll</p>
                    <p className="text-2xl font-bold text-purple-600">{formatWithConversion(summaryStats.monthlyPayroll)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Overtime</p>
                    <p className="text-2xl font-bold text-orange-600">{formatWithConversion(summaryStats.totalOvertime)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="guest-services">Guest Services</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>

                <Input placeholder="Search staff..." />
                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Staff Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staffProfiles.map((staff) => (
              <Card key={staff.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={staff.avatar} alt={staff.name} />
                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{staff.name}</h3>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                        <Badge className={getDepartmentColor(staff.department)}>
                          {staff.department}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(staff.status)}>
                        {staff.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{staff.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Started: {staff.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{formatWithConversion(staff.baseSalary)}/month</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Skills</p>
                    <div className="flex gap-1 flex-wrap">
                      {staff.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {staff.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{staff.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
                    <p className="text-sm">{staff.emergencyContact.name} ({staff.emergencyContact.relationship})</p>
                    <p className="text-xs text-gray-600">{staff.emergencyContact.phone}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
                    <Button variant="outline" size="sm" className="flex-1">Payroll History</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          {/* Payroll Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pay Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">January 2025</SelectItem>
                    <SelectItem value="previous">December 2024</SelectItem>
                    <SelectItem value="november">November 2024</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staffProfiles.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>

                <Button>Generate Payroll</Button>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Records */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll Records - January 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollRecords.map((record) => {
                  const staff = staffProfiles.find(s => s.id === record.staffId);
                  return (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{staff?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{staff?.name}</h4>
                            <p className="text-sm text-gray-600">{staff?.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPayrollStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                          <span className="font-bold text-green-600">{formatWithConversion(record.netPay)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Base Salary</p>
                          <p className="font-medium">{formatWithConversion(record.baseSalary)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Overtime</p>
                          <p className="font-medium text-blue-600">{formatWithConversion(record.overtime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Bonus</p>
                          <p className="font-medium text-green-600">{formatWithConversion(record.bonus)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Deductions</p>
                          <p className="font-medium text-red-600">-{formatWithConversion(record.deductions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Working Days</p>
                          <p className="font-medium">{record.workingDays} days</p>
                        </div>
                        <div>
                          <p className="text-gray-500">OT Hours</p>
                          <p className="font-medium">{record.overtimeHours}h</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-500">
                          Pay Date: {record.payDate}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Payslip
                          </Button>
                          <Button variant="outline" size="sm">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance - January 22, 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceRecords.map((record, index) => {
                  const staff = staffProfiles.find(s => s.id === record.staffId);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{staff?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff?.name}</p>
                          <p className="text-sm text-gray-600">{staff?.department}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center text-sm">
                        <div>
                          <p className="text-gray-500">Check In</p>
                          <p className="font-medium">{record.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Check Out</p>
                          <p className="font-medium">{record.checkOut}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Hours</p>
                          <p className="font-medium">{record.hoursWorked}h</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Overtime</p>
                          <p className="font-medium text-blue-600">{record.overtime}h</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {record.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Cost by Department</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Maintenance</span>
                  <span className="font-bold">{formatWithConversion(41600)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Housekeeping</span>
                  <span className="font-bold">{formatWithConversion(35600)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Guest Services</span>
                  <span className="font-bold">{formatWithConversion(30400)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Security</span>
                  <span className="font-bold">{formatWithConversion(29200)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overtime by Staff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Somchai (14h)</span>
                  <span className="text-sm font-medium">{formatWithConversion(2800)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Wichai (12h)</span>
                  <span className="text-sm font-medium">{formatWithConversion(2400)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Niran (8h)</span>
                  <span className="text-sm font-medium">{formatWithConversion(1600)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Apinya (6h)</span>
                  <span className="text-sm font-medium">{formatWithConversion(1200)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Pay Period Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Pay frequency</label>
                      <Select defaultValue="monthly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Pay day</label>
                      <Input type="number" defaultValue="31" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Overtime Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Overtime rate multiplier</label>
                      <Input type="number" step="0.1" defaultValue="1.5" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Standard hours per day</label>
                      <Input type="number" defaultValue="8" />
                    </div>
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