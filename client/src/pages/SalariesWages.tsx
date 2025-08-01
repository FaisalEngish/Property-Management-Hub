import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  FileText, 
  Upload, 
  Download, 
  Search,
  Filter,
  Calendar,
  Building,
  Phone,
  Mail,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  BarChart3,
  TrendingUp,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFastAuth } from "@/lib/fastAuth";

interface StaffMember {
  id: number;
  organizationId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  department: string;
  position: string;
  startDate: string;
  endDate?: string;
  status: string;
  salaryType: string;
  monthlySalary?: number;
  hourlyRate?: number;
  commissionRate?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  preferredDayOff?: string;
  workingHours?: string;
  notes?: string;
  performanceNotes?: string;
}

interface DepartmentSummary {
  department: string;
  staffCount: number;
  totalMonthlySalary: number;
  activeStaff: number;
  inactiveStaff: number;
}

const DEPARTMENTS = [
  "housekeeping",
  "pool",
  "garden",
  "manager",
  "supervisor", 
  "admin",
  "maintenance",
  "reception",
  "security",
  "kitchen"
];

const SALARY_TYPES = [
  { value: "monthly", label: "Monthly Salary" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "commission", label: "Commission" },
  { value: "daily", label: "Daily Rate" }
];

export default function SalariesWages() {
  const { user } = useFastAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);

  // Check admin access
  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              This section is restricted to administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for demonstration - replace with real API calls
  const mockStaffData: StaffMember[] = [
    {
      id: 1,
      organizationId: "default-org",
      employeeId: "EMP001",
      firstName: "Maria",
      lastName: "Santos",
      phoneNumber: "+66-81-234-5678",
      email: "maria.santos@hostpilotpro.com",
      department: "housekeeping",
      position: "Head Housekeeper",
      startDate: "2023-01-15",
      status: "active",
      salaryType: "monthly",
      monthlySalary: 25000,
      bankName: "Bangkok Bank",
      accountNumber: "123-4-56789-0",
      preferredDayOff: "sunday"
    },
    {
      id: 2,
      organizationId: "default-org",
      employeeId: "EMP002",
      firstName: "Somchai",
      lastName: "Phuket",
      phoneNumber: "+66-82-345-6789",
      email: "somchai.pool@hostpilotpro.com",
      department: "pool",
      position: "Pool Maintenance",
      startDate: "2023-03-01",
      status: "active",
      salaryType: "monthly",
      monthlySalary: 18000,
      bankName: "Kasikorn Bank",
      accountNumber: "234-5-67890-1",
      preferredDayOff: "monday"
    },
    {
      id: 3,
      organizationId: "default-org",
      employeeId: "EMP003",
      firstName: "Niran",
      lastName: "Garden",
      phoneNumber: "+66-83-456-7890",
      department: "garden",
      position: "Gardener",
      startDate: "2023-02-10",
      status: "active",
      salaryType: "hourly",
      hourlyRate: 150,
      bankName: "SCB Bank",
      accountNumber: "345-6-78901-2",
      preferredDayOff: "tuesday"
    },
    {
      id: 4,
      organizationId: "default-org",
      employeeId: "EMP004",
      firstName: "John",
      lastName: "Manager",
      phoneNumber: "+66-84-567-8901",
      email: "john.manager@hostpilotpro.com",
      department: "manager",
      position: "Portfolio Manager",
      startDate: "2022-11-01",
      status: "active",
      salaryType: "monthly",
      monthlySalary: 55000,
      bankName: "Bangkok Bank",
      accountNumber: "456-7-89012-3",
      preferredDayOff: "saturday"
    }
  ];

  // Filter staff based on search and filters
  const filteredStaff = useMemo(() => {
    return mockStaffData.filter(staff => {
      const matchesSearch = searchTerm === "" || 
        staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment;
      const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [mockStaffData, searchTerm, selectedDepartment, statusFilter]);

  // Calculate department summaries
  const departmentSummaries = useMemo(() => {
    const summaries: Record<string, DepartmentSummary> = {};
    
    mockStaffData.forEach(staff => {
      if (!summaries[staff.department]) {
        summaries[staff.department] = {
          department: staff.department,
          staffCount: 0,
          totalMonthlySalary: 0,
          activeStaff: 0,
          inactiveStaff: 0
        };
      }
      
      const summary = summaries[staff.department];
      summary.staffCount++;
      
      if (staff.status === "active") {
        summary.activeStaff++;
        // Add to total salary (convert hourly to monthly estimate)
        if (staff.salaryType === "monthly" && staff.monthlySalary) {
          summary.totalMonthlySalary += staff.monthlySalary;
        } else if (staff.salaryType === "hourly" && staff.hourlyRate) {
          summary.totalMonthlySalary += staff.hourlyRate * 8 * 26; // 8 hours * 26 days
        }
      } else {
        summary.inactiveStaff++;
      }
    });
    
    return Object.values(summaries);
  }, [mockStaffData]);

  const formatSalary = (staff: StaffMember) => {
    if (staff.salaryType === "monthly" && staff.monthlySalary) {
      return `฿${staff.monthlySalary.toLocaleString()}/month`;
    } else if (staff.salaryType === "hourly" && staff.hourlyRate) {
      return `฿${staff.hourlyRate}/hour`;
    } else if (staff.salaryType === "commission" && staff.commissionRate) {
      return `${staff.commissionRate}% commission`;
    }
    return "Not set";
  };

  const StaffTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Management
            </CardTitle>
            <CardDescription>
              Manage staff members, salaries, and employment details
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddStaff(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Staff Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Employee</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Start Date</th>
                  <th className="text-left p-4 font-medium">Salary</th>
                  <th className="text-left p-4 font-medium">Bank Details</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium">Day Off</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="border-t hover:bg-muted/25">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{staff.firstName} {staff.lastName}</div>
                        <div className="text-sm text-muted-foreground">{staff.employeeId}</div>
                        <div className="text-xs text-muted-foreground">{staff.position}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {staff.department.charAt(0).toUpperCase() + staff.department.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                        {staff.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(staff.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{formatSalary(staff)}</div>
                    </td>
                    <td className="p-4">
                      {staff.bankName && staff.accountNumber ? (
                        <div className="text-sm">
                          <div>{staff.bankName}</div>
                          <div className="text-muted-foreground">
                            ***{staff.accountNumber.slice(-4)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        {staff.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {staff.phoneNumber}
                          </div>
                        )}
                        {staff.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {staff.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {staff.preferredDayOff ? 
                        staff.preferredDayOff.charAt(0).toUpperCase() + staff.preferredDayOff.slice(1) 
                        : "Not set"
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedStaff(staff)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No staff members found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );

  const DepartmentOverview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Department Overview
        </CardTitle>
        <CardDescription>
          Salary totals and staff count by department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentSummaries.map((summary) => (
            <Card key={summary.department}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium capitalize">{summary.department}</h3>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Staff:</span>
                    <span className="font-medium">{summary.staffCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active:</span>
                    <span className="text-green-600 font-medium">{summary.activeStaff}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Total:</span>
                    <span className="font-medium">฿{summary.totalMonthlySalary.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockStaffData.filter(s => s.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Total Active Staff</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ฿{departmentSummaries.reduce((sum, dept) => sum + dept.totalMonthlySalary, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Payroll</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ฿{(departmentSummaries.reduce((sum, dept) => sum + dept.totalMonthlySalary, 0) * 12).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Annual Payroll</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Salaries & Wages
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff salaries, wages, and payroll information
          </p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="staff" className="space-y-6">
        <TabsList>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="overview">Department Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <StaffTable />
        </TabsContent>

        <TabsContent value="overview">
          <DepartmentOverview />
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
              <CardDescription>
                Manage payroll processing and payment records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Payroll records functionality coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Salary Reports</CardTitle>
              <CardDescription>
                Generate and export salary reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Reporting functionality coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedStaff.firstName} {selectedStaff.lastName} - Staff Profile
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="space-y-2">
                  <div><strong>Employee ID:</strong> {selectedStaff.employeeId}</div>
                  <div><strong>Department:</strong> {selectedStaff.department}</div>
                  <div><strong>Position:</strong> {selectedStaff.position}</div>
                  <div><strong>Start Date:</strong> {new Date(selectedStaff.startDate).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> 
                    <Badge className="ml-2" variant={selectedStaff.status === "active" ? "default" : "secondary"}>
                      {selectedStaff.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Compensation</h3>
                <div className="space-y-2">
                  <div><strong>Salary Type:</strong> {selectedStaff.salaryType}</div>
                  <div><strong>Compensation:</strong> {formatSalary(selectedStaff)}</div>
                  <div><strong>Preferred Day Off:</strong> {selectedStaff.preferredDayOff || "Not set"}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="space-y-2">
                  <div><strong>Phone:</strong> {selectedStaff.phoneNumber || "Not provided"}</div>
                  <div><strong>Email:</strong> {selectedStaff.email || "Not provided"}</div>
                  <div><strong>Address:</strong> {selectedStaff.address || "Not provided"}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Banking Details</h3>
                <div className="space-y-2">
                  <div><strong>Bank:</strong> {selectedStaff.bankName || "Not provided"}</div>
                  <div><strong>Account:</strong> {selectedStaff.accountNumber || "Not provided"}</div>
                  <div><strong>Account Holder:</strong> {selectedStaff.accountHolderName || "Not provided"}</div>
                </div>
              </div>
            </div>
            
            {selectedStaff.notes && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm bg-muted p-3 rounded">{selectedStaff.notes}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}