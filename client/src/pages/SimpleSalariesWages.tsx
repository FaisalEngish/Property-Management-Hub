import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  DollarSign, 
  BarChart3, 
  Clock,
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  FileText,
  Search,
  Filter,
  Building,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useUsersData } from '@/hooks/useDashboardData';
import { useQuery } from '@tanstack/react-query';
import TopBar from '@/components/TopBar';

// Live staff data from API endpoints
const useStaffData = () => {
  return useQuery({
    queryKey: ['/api/staff/list'],
    select: (data: any) => data?.staff || []
  });
};

const usePendingPayroll = () => {
  return useQuery({
    queryKey: ['/api/staff/pending'],
    select: (data: any) => data?.pending || []
  });
};

export default function SimpleSalariesWages() {
  const [activeTab, setActiveTab] = useState('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // User data for role-based permissions
  const { data: users = [] } = useUsersData();
  const currentUser = (users || []).find(user => user.role === 'admin') || { role: 'guest' };
  
  // Check if user has admin or HR manager permissions
  const hasWriteAccess = currentUser.role === 'admin' || currentUser.role === 'portfolio-manager';
  const hasExportAccess = hasWriteAccess || currentUser.role === 'staff';

  // Fetch live staff and payroll data
  const { data: staffData = [], isLoading: isStaffLoading, error: staffError } = useStaffData();
  const { data: pendingPayroll = [], isLoading: isPendingLoading, error: pendingError } = usePendingPayroll();

  // Filter staff data based on search and filters
  const filteredStaff = useMemo(() => {
    if (!staffData.length) return [];
    
    return staffData.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          staff.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || staff.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [staffData, searchTerm, departmentFilter, statusFilter]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    if (!staffData.length) return [];
    return [...new Set(staffData.map(staff => staff.department))];
  }, [staffData]);

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'Paid': 'bg-green-100 text-green-800 border-green-300', 
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Inactive': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300'} border transition-colors duration-200`}>
        {status}
      </Badge>
    );
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!hasExportAccess) {
      alert('You do not have permission to export data.');
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [headers, ...data.map(row => Object.values(row).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async (filename: string) => {
    if (!hasExportAccess) {
      alert('You do not have permission to export data.');
      return;
    }
    
    // Simple PDF export simulation - in real app would use jsPDF or similar
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${filename} Report</title></head>
          <body>
            <h1>Staff Salaries Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>This would contain the formatted staff data for PDF export.</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Role breakdown for tooltip
  const getRoleBreakdown = () => {
    if (!staffData.length) return [];
    const roleCounts = staffData.reduce((acc: Record<string, number>, staff) => {
      acc[staff.position] = (acc[staff.position] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(roleCounts).map(([position, count]) => ({ position, count }));
  };

  // Calculate live statistics
  const totalStaff = staffData.length;
  const totalPayroll = staffData.reduce((sum, staff) => sum + (staff.salary || 0), 0);
  const averageSalary = totalStaff > 0 ? Math.floor(totalPayroll / totalStaff) : 0;
  const pendingPayments = pendingPayroll.length;

  // Show loading state
  if (isStaffLoading || isPendingLoading) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex flex-col lg:ml-0">
          <TopBar title="Staff Salaries & Wages" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading staff data...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (staffError || pendingError) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex flex-col lg:ml-0">
          <TopBar title="Staff Salaries & Wages" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-600 mb-2">Error loading staff data</p>
                  <p className="text-gray-600">Please try refreshing the page</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Staff Salaries & Wages" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Salaries & Wages</h1>
                  <p className="text-gray-600">
                    Admin-only staff salary and wage management system
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Export Buttons */}
                  {hasExportAccess && (
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportToCSV(filteredStaff, 'staff-data')}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              CSV
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Export staff data as CSV</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportToPDF('staff-report')}
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              PDF
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Export staff report as PDF</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  
                  {hasWriteAccess && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Staff Member
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Staff Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="cursor-help transition-all duration-300 backdrop-blur-sm border hover:scale-105 bg-gradient-to-br from-blue-50/80 via-blue-100/60 to-blue-50/80 border-blue-200/60 hover:border-blue-300/60">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700">Total Staff</p>
                            <p className="text-3xl font-bold text-blue-900">{totalStaff}</p>
                          </div>
                          <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
                            <Users className="h-8 w-8 text-blue-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm p-3 bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-900">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Staff Breakdown
                      </p>
                      <div className="space-y-1 text-xs">
                        {getRoleBreakdown().map(({ position, count }, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{position}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Monthly Payroll Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="cursor-help transition-all duration-300 backdrop-blur-sm border hover:scale-105 bg-gradient-to-br from-green-50/80 via-green-100/60 to-green-50/80 border-green-200/60 hover:border-green-300/60">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Monthly Payroll</p>
                            <p className="text-3xl font-bold text-green-900">฿{totalPayroll.toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-green-100 to-green-200">
                            <DollarSign className="h-8 w-8 text-green-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm p-3 bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-900">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Payroll Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Base Salaries:</span>
                          <span className="font-medium">฿110,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bonuses:</span>
                          <span className="font-medium">฿2,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Benefits:</span>
                          <span className="font-medium">฿15,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deductions:</span>
                          <span className="font-medium">-฿15,000</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Average Salary Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="cursor-help transition-all duration-300 backdrop-blur-sm border hover:scale-105 bg-gradient-to-br from-purple-50/80 via-purple-100/60 to-purple-50/80 border-purple-200/60 hover:border-purple-300/60">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-700">Average Salary</p>
                            <p className="text-3xl font-bold text-purple-900">฿{averageSalary.toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
                            <BarChart3 className="h-8 w-8 text-purple-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm p-3 bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-900">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Salary Distribution
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Highest:</span>
                          <span className="font-medium">฿45,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lowest:</span>
                          <span className="font-medium">฿32,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Median:</span>
                          <span className="font-medium">฿35,000</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Pending Payments Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="cursor-help transition-all duration-300 backdrop-blur-sm border hover:scale-105 bg-gradient-to-br from-orange-50/80 via-orange-100/60 to-orange-50/80 border-orange-200/60 hover:border-orange-300/60">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-700">Pending Payments</p>
                            <p className="text-3xl font-bold text-orange-900">{pendingPayments}</p>
                          </div>
                          <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-orange-100 to-orange-200">
                            <Clock className="h-8 w-8 text-orange-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm p-3 bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-900">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Payment Status
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Pending:</span>
                          <span className="font-medium text-orange-600">1 payment</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-medium">฿35,150</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due Date:</span>
                          <span className="font-medium">Jan 31, 2025</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Search & Filter Bar */}
            <div className="mb-6 p-4 rounded-lg border bg-slate-50 border-slate-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search staff by name, position, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-48 pl-10">
                        <SelectValue placeholder="Filter by department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <div className="border-b border-slate-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'staff' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('staff')}
                  >
                    Staff Members
                  </button>
                  <button
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'payroll' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('payroll')}
                  >
                    Payroll Records
                  </button>
                  <button
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'departments' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('departments')}
                  >
                    Departments
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <CardContent className="p-6">
                {activeTab === 'staff' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">Staff Members</h3>
                      <div className="text-sm text-slate-600">
                        Showing {filteredStaff.length} of {totalStaff} staff members
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/80 divide-y divide-slate-200">
                          {filteredStaff.map((staff) => (
                            <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{staff.employeeId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{staff.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{staff.position}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{staff.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{formatCurrency(staff.salary)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(staff.status)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                <div className="flex gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>View Details</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  {hasWriteAccess && (
                                    <>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-700">
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Edit Staff Member</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Delete Staff Member</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredStaff.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                <div className="flex flex-col items-center">
                                  <Users className="h-8 w-8 text-slate-400 mb-2" />
                                  <span>No staff members found matching your criteria</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'payroll' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Payroll Records</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Staff Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Base Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Overtime</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bonus</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Pay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Pay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/80 divide-y divide-slate-200">
                          {pendingPayroll.map((record) => {
                            const staff = staffData.find(s => s.id === record.staffId);
                            return (
                              <tr key={record.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{record.period}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{staff?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(record.baseSalary)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(record.overtime)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(record.bonus)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatCurrency(record.gross)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{formatCurrency(record.net)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'departments' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Department Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-blue-800">Operations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Staff Count:</span>
                              <span className="font-medium text-blue-700">1</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Total Salary:</span>
                              <span className="font-medium text-blue-700">฿45,000</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-green-800">Maintenance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Staff Count:</span>
                              <span className="font-medium text-green-700">1</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Total Salary:</span>
                              <span className="font-medium text-green-700">฿35,000</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-purple-800">Customer Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Staff Count:</span>
                              <span className="font-medium text-purple-700">1</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Total Salary:</span>
                              <span className="font-medium text-purple-700">฿32,000</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}