import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Plus, Eye, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface StaffMember {
  id: number;
  organizationId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  monthlySalary: string;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
  dateJoined?: string;
}

export default function SimpleSalariesWages() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('staff');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Form state for add
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    position: '',
    department: '',
    monthlySalary: '',
    contactEmail: '',
    contactPhone: ''
  });

  // Form state for edit
  const [editStaff, setEditStaff] = useState({
    firstName: '',
    lastName: '',
    position: '',
    department: '',
    monthlySalary: '',
    contactEmail: '',
    contactPhone: ''
  });

  // Fetch staff members from database
  const { data: staffList = [], isLoading, refetch } = useQuery<StaffMember[]>({
    queryKey: ['/api/staff-members'],
    queryFn: async () => {
      const response = await fetch('/api/staff-members?organizationId=default-org');
      if (!response.ok) throw new Error('Failed to fetch staff members');
      return response.json();
    }
  });

  // Create staff member mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/staff-members', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-members'] });
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
      setIsAddDialogOpen(false);
      setNewStaff({ firstName: '', lastName: '', position: '', department: '', monthlySalary: '', contactEmail: '', contactPhone: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    }
  });

  // Update staff member mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/staff-members/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-members'] });
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    }
  });

  // Delete staff member mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/staff-members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-members'] });
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `฿${num.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
      : 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs';
  };

  const handleAddStaff = () => {
    if (!newStaff.firstName || !newStaff.lastName || !newStaff.position || !newStaff.department || !newStaff.monthlySalary) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      organizationId: 'default-org',
      firstName: newStaff.firstName,
      lastName: newStaff.lastName,
      position: newStaff.position,
      department: newStaff.department,
      monthlySalary: newStaff.monthlySalary,
      status: 'active',
      contactEmail: newStaff.contactEmail || null,
      contactPhone: newStaff.contactPhone || null,
      dateJoined: new Date().toISOString().split('T')[0]
    });
  };

  const handleViewStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditStaff({
      firstName: staff.firstName,
      lastName: staff.lastName,
      position: staff.position,
      department: staff.department,
      monthlySalary: staff.monthlySalary,
      contactEmail: staff.contactEmail || '',
      contactPhone: staff.contactPhone || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedStaff || !editStaff.firstName || !editStaff.lastName || !editStaff.position || !editStaff.department || !editStaff.monthlySalary) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      id: selectedStaff.id,
      data: {
        firstName: editStaff.firstName,
        lastName: editStaff.lastName,
        position: editStaff.position,
        department: editStaff.department,
        monthlySalary: editStaff.monthlySalary,
        contactEmail: editStaff.contactEmail || null,
        contactPhone: editStaff.contactPhone || null,
      }
    });
  };

  const handleDeleteClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedStaff) return;
    deleteMutation.mutate(selectedStaff.id);
  };

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Refreshed",
      description: "Staff data has been updated",
    });
  };

  // Calculate statistics
  const totalStaff = staffList.length;
  const monthlyPayroll = staffList.reduce((sum, s) => sum + parseFloat(s.monthlySalary || '0'), 0);
  const averageSalary = totalStaff > 0 ? Math.round(monthlyPayroll / totalStaff) : 0;
  const pendingPayments = 0; // Payroll records will be added later

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Salaries & Wages</h1>
          <p className="text-gray-600 mt-1">
            Admin-only staff salary and wage management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            data-testid="button-refresh-staff"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            data-testid="button-add-staff"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border" data-testid="card-total-staff">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold" data-testid="text-total-staff">{totalStaff}</p>
            </div>
            <div className="text-blue-600">👥</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border" data-testid="card-monthly-payroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Payroll</p>
              <p className="text-2xl font-bold" data-testid="text-monthly-payroll">{formatCurrency(monthlyPayroll)}</p>
            </div>
            <div className="text-green-600">💰</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border" data-testid="card-average-salary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Salary</p>
              <p className="text-2xl font-bold" data-testid="text-average-salary">{formatCurrency(averageSalary)}</p>
            </div>
            <div className="text-purple-600">📊</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border" data-testid="card-pending-payments">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold" data-testid="text-pending-payments">{pendingPayments}</p>
            </div>
            <div className="text-orange-600">⏰</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'staff' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('staff')}
              data-testid="tab-staff-members"
            >
              Staff Members
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payroll' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('payroll')}
              data-testid="tab-payroll-records"
            >
              Payroll Records
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'departments' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('departments')}
              data-testid="tab-departments"
            >
              Departments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'staff' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Staff Members</h3>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : staffList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No staff members found</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Add Staff Member" to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffList.map((staff) => (
                        <tr key={staff.id} data-testid={`row-staff-${staff.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.employeeId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.firstName} {staff.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(staff.monthlySalary)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusColor(staff.status)}>{staff.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <button 
                                className="text-blue-600 hover:text-blue-900 p-1"
                                onClick={() => handleViewStaff(staff)}
                                data-testid={`button-view-${staff.id}`}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                onClick={() => handleEditClick(staff)}
                                data-testid={`button-edit-${staff.id}`}
                                title="Edit Staff"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 p-1"
                                onClick={() => handleDeleteClick(staff)}
                                data-testid={`button-delete-${staff.id}`}
                                title="Delete Staff"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payroll' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Payroll Records</h3>
              <div className="text-center py-8">
                <p className="text-gray-500">Payroll records feature coming soon</p>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Department Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Operations', 'Maintenance', 'Customer Service', 'Finance', 'Management', 'IT'].map((dept) => {
                  const deptStaff = staffList.filter(s => s.department === dept);
                  const deptTotal = deptStaff.reduce((sum, s) => sum + parseFloat(s.monthlySalary || '0'), 0);
                  
                  return (
                    <div key={dept} className="bg-white border rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">{dept}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Staff Count:</span>
                          <span className="font-medium">{deptStaff.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Salary:</span>
                          <span className="font-medium">{formatCurrency(deptTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-first-name">First Name *</Label>
                <Input
                  id="add-first-name"
                  placeholder="Enter first name"
                  value={newStaff.firstName}
                  onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                  data-testid="input-add-first-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-last-name">Last Name *</Label>
                <Input
                  id="add-last-name"
                  placeholder="Enter last name"
                  value={newStaff.lastName}
                  onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                  data-testid="input-add-last-name"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="add-position">Position *</Label>
              <Input
                id="add-position"
                placeholder="Enter position"
                value={newStaff.position}
                onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                data-testid="input-add-position"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="add-department">Department *</Label>
              <Select value={newStaff.department} onValueChange={(value) => setNewStaff({...newStaff, department: value})}>
                <SelectTrigger data-testid="select-add-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="add-salary">Monthly Salary (฿) *</Label>
              <Input
                id="add-salary"
                type="number"
                placeholder="Enter salary amount"
                value={newStaff.monthlySalary}
                onChange={(e) => setNewStaff({...newStaff, monthlySalary: e.target.value})}
                data-testid="input-add-salary"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-email">Email (Optional)</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="staff@example.com"
                value={newStaff.contactEmail}
                onChange={(e) => setNewStaff({...newStaff, contactEmail: e.target.value})}
                data-testid="input-add-email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-phone">Phone (Optional)</Label>
              <Input
                id="add-phone"
                type="tel"
                placeholder="+66 XX XXX XXXX"
                value={newStaff.contactPhone}
                onChange={(e) => setNewStaff({...newStaff, contactPhone: e.target.value})}
                data-testid="input-add-phone"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)} 
              data-testid="button-cancel-add"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddStaff} 
              className="bg-blue-600 hover:bg-blue-700" 
              data-testid="button-confirm-add"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Adding...' : 'Add Staff Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Staff Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Staff Member Details</DialogTitle>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Employee ID</Label>
                  <p className="font-medium" data-testid="view-employee-id">{selectedStaff.employeeId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <p className="font-medium" data-testid="view-status">{selectedStaff.status}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Full Name</Label>
                <p className="font-medium" data-testid="view-name">{selectedStaff.firstName} {selectedStaff.lastName}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Position</Label>
                <p className="font-medium" data-testid="view-position">{selectedStaff.position}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Department</Label>
                <p className="font-medium" data-testid="view-department">{selectedStaff.department}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Monthly Salary</Label>
                <p className="font-medium text-lg" data-testid="view-salary">{formatCurrency(selectedStaff.monthlySalary)}</p>
              </div>

              {selectedStaff.contactEmail && (
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="font-medium">{selectedStaff.contactEmail}</p>
                </div>
              )}

              {selectedStaff.contactPhone && (
                <div>
                  <Label className="text-sm text-gray-500">Phone</Label>
                  <p className="font-medium">{selectedStaff.contactPhone}</p>
                </div>
              )}

              {selectedStaff.dateJoined && (
                <div>
                  <Label className="text-sm text-gray-500">Date Joined</Label>
                  <p className="font-medium">{new Date(selectedStaff.dateJoined).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)} data-testid="button-close-view">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-first-name">First Name *</Label>
                <Input
                  id="edit-first-name"
                  value={editStaff.firstName}
                  onChange={(e) => setEditStaff({...editStaff, firstName: e.target.value})}
                  data-testid="input-edit-first-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-last-name">Last Name *</Label>
                <Input
                  id="edit-last-name"
                  value={editStaff.lastName}
                  onChange={(e) => setEditStaff({...editStaff, lastName: e.target.value})}
                  data-testid="input-edit-last-name"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position *</Label>
              <Input
                id="edit-position"
                value={editStaff.position}
                onChange={(e) => setEditStaff({...editStaff, position: e.target.value})}
                data-testid="input-edit-position"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department *</Label>
              <Select value={editStaff.department} onValueChange={(value) => setEditStaff({...editStaff, department: value})}>
                <SelectTrigger data-testid="select-edit-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-salary">Monthly Salary (฿) *</Label>
              <Input
                id="edit-salary"
                type="number"
                value={editStaff.monthlySalary}
                onChange={(e) => setEditStaff({...editStaff, monthlySalary: e.target.value})}
                data-testid="input-edit-salary"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                value={editStaff.contactEmail}
                onChange={(e) => setEditStaff({...editStaff, contactEmail: e.target.value})}
                data-testid="input-edit-email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone (Optional)</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editStaff.contactPhone}
                onChange={(e) => setEditStaff({...editStaff, contactPhone: e.target.value})}
                data-testid="input-edit-phone"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)} 
              data-testid="button-cancel-edit"
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              className="bg-blue-600 hover:bg-blue-700" 
              data-testid="button-confirm-edit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the staff member{selectedStaff && `: ${selectedStaff.firstName} ${selectedStaff.lastName}`}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
