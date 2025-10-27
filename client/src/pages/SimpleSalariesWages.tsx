import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

// Simple demo data - cleared for production
const initialStaff: any[] = [];

const demoPayroll: any[] = [];

interface Staff {
  id: number;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  status: string;
}

export default function SimpleSalariesWages() {
  const [activeTab, setActiveTab] = useState('staff');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState(initialStaff);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // Form state for add
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    department: '',
    salary: ''
  });

  // Form state for edit
  const [editStaff, setEditStaff] = useState({
    name: '',
    position: '',
    department: '',
    salary: ''
  });

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' || status === 'Paid' 
      ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
      : 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs';
  };

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.position || !newStaff.department || !newStaff.salary) {
      alert('Please fill in all fields');
      return;
    }

    const nextId = Math.max(...staffList.map(s => s.id)) + 1;
    const nextEmpId = `EMP${String(nextId).padStart(3, '0')}`;
    
    const staff = {
      id: nextId,
      employeeId: nextEmpId,
      name: newStaff.name,
      position: newStaff.position,
      department: newStaff.department,
      salary: parseInt(newStaff.salary),
      status: 'Active'
    };

    // Update staff list - this will trigger automatic re-render of metrics
    setStaffList(prevList => [...prevList, staff]);
    setIsAddDialogOpen(false);
    setNewStaff({ name: '', position: '', department: '', salary: '' });
  };

  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setEditStaff({
      name: staff.name,
      position: staff.position,
      department: staff.department,
      salary: staff.salary.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedStaff || !editStaff.name || !editStaff.position || !editStaff.department || !editStaff.salary) {
      alert('Please fill in all fields');
      return;
    }

    // Update the staff member
    setStaffList(prevList => 
      prevList.map(s => 
        s.id === selectedStaff.id 
          ? {
              ...s,
              name: editStaff.name,
              position: editStaff.position,
              department: editStaff.department,
              salary: parseInt(editStaff.salary)
            }
          : s
      )
    );

    setIsEditDialogOpen(false);
    setSelectedStaff(null);
    setEditStaff({ name: '', position: '', department: '', salary: '' });
  };

  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedStaff) return;

    // Remove the staff member
    setStaffList(prevList => prevList.filter(s => s.id !== selectedStaff.id));
    setIsDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  // Calculate statistics - these will automatically update when staffList changes
  const totalStaff = staffList.length;
  const monthlyPayroll = staffList.reduce((sum, s) => sum + s.salary, 0);
  const averageSalary = totalStaff > 0 ? Math.round(monthlyPayroll / totalStaff) : 0;
  const pendingPayments = demoPayroll.filter(p => p.status === 'Pending').length;

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
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          data-testid="button-add-staff"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(staff.salary)}</td>
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
            </div>
          )}

          {activeTab === 'payroll' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Payroll Records</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {demoPayroll.map((record) => {
                      const staff = staffList.find(s => s.id === record.staffId);
                      return (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.period}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(record.baseSalary)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(record.overtime)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(record.bonus)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(record.gross)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(record.net)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusColor(record.status)}>{record.status}</span>
                          </td>
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
              <h3 className="text-lg font-semibold mb-4">Department Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">Operations</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Staff Count:</span>
                      <span className="font-medium">{staffList.filter(s => s.department === 'Operations').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Salary:</span>
                      <span className="font-medium">{formatCurrency(staffList.filter(s => s.department === 'Operations').reduce((sum, s) => sum + s.salary, 0))}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">Maintenance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Staff Count:</span>
                      <span className="font-medium">{staffList.filter(s => s.department === 'Maintenance').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Salary:</span>
                      <span className="font-medium">{formatCurrency(staffList.filter(s => s.department === 'Maintenance').reduce((sum, s) => sum + s.salary, 0))}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">Customer Service</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Staff Count:</span>
                      <span className="font-medium">{staffList.filter(s => s.department === 'Customer Service').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Salary:</span>
                      <span className="font-medium">{formatCurrency(staffList.filter(s => s.department === 'Customer Service').reduce((sum, s) => sum + s.salary, 0))}</span>
                    </div>
                  </div>
                </div>
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
            <div className="grid gap-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                placeholder="Enter staff name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                data-testid="input-add-name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="add-position">Position</Label>
              <Input
                id="add-position"
                placeholder="Enter position"
                value={newStaff.position}
                onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                data-testid="input-add-position"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="add-department">Department</Label>
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
              <Label htmlFor="add-salary">Monthly Salary (฿)</Label>
              <Input
                id="add-salary"
                type="number"
                placeholder="Enter salary amount"
                value={newStaff.salary}
                onChange={(e) => setNewStaff({...newStaff, salary: e.target.value})}
                data-testid="input-add-salary"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel-add">
              Cancel
            </Button>
            <Button onClick={handleAddStaff} className="bg-blue-600 hover:bg-blue-700" data-testid="button-confirm-add">
              Add Staff Member
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
                <p className="font-medium" data-testid="view-name">{selectedStaff.name}</p>
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
                <p className="font-medium text-lg" data-testid="view-salary">{formatCurrency(selectedStaff.salary)}</p>
              </div>
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
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter staff name"
                value={editStaff.name}
                onChange={(e) => setEditStaff({...editStaff, name: e.target.value})}
                data-testid="input-edit-name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position</Label>
              <Input
                id="edit-position"
                placeholder="Enter position"
                value={editStaff.position}
                onChange={(e) => setEditStaff({...editStaff, position: e.target.value})}
                data-testid="input-edit-position"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select value={editStaff.department} onValueChange={(value) => setEditStaff({...editStaff, department: value})}>
                <SelectTrigger data-testid="select-edit-department">
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
              <Label htmlFor="edit-salary">Monthly Salary (฿)</Label>
              <Input
                id="edit-salary"
                type="number"
                placeholder="Enter salary amount"
                value={editStaff.salary}
                onChange={(e) => setEditStaff({...editStaff, salary: e.target.value})}
                data-testid="input-edit-salary"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-edit">
              Save Changes
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
              This will permanently delete <strong>{selectedStaff?.name}</strong> ({selectedStaff?.employeeId}) from the staff database.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
