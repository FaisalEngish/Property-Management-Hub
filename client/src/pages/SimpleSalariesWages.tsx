import React, { useState } from 'react';

// Simple demo data
const demoStaff = [
  {
    id: 1,
    employeeId: 'EMP001',
    name: 'Sarah Johnson',
    position: 'Property Manager',
    department: 'Operations',
    salary: 45000,
    status: 'Active'
  },
  {
    id: 2,
    employeeId: 'EMP002', 
    name: 'Mike Chen',
    position: 'Maintenance Technician',
    department: 'Maintenance',
    salary: 35000,
    status: 'Active'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    name: 'Emily Rodriguez',
    position: 'Guest Services',
    department: 'Customer Service',
    salary: 32000,
    status: 'Active'
  }
];

const demoPayroll = [
  {
    id: 1,
    staffId: 1,
    period: 'Jan 2025',
    baseSalary: 45000,
    overtime: 0,
    bonus: 2000,
    gross: 47000,
    net: 38000,
    status: 'Paid'
  },
  {
    id: 2,
    staffId: 2,
    period: 'Jan 2025', 
    baseSalary: 35000,
    overtime: 150,
    bonus: 0,
    gross: 35150,
    net: 28500,
    status: 'Pending'
  }
];

export default function SimpleSalariesWages() {
  const [activeTab, setActiveTab] = useState('staff');

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' || status === 'Paid' 
      ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
      : 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs';
  };

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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          ➕ Add Staff Member
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="text-blue-600">👥</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Payroll</p>
              <p className="text-2xl font-bold">฿112,000</p>
            </div>
            <div className="text-green-600">💰</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Salary</p>
              <p className="text-2xl font-bold">฿37,333</p>
            </div>
            <div className="text-purple-600">📊</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold">1</p>
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
                    {demoStaff.map((staff) => (
                      <tr key={staff.id}>
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
                            <button className="text-blue-600 hover:text-blue-900">👁️</button>
                            <button className="text-yellow-600 hover:text-yellow-900">✏️</button>
                            <button className="text-red-600 hover:text-red-900">🗑️</button>
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
                      const staff = demoStaff.find(s => s.id === record.staffId);
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
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Salary:</span>
                      <span className="font-medium">฿45,000</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">Maintenance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Staff Count:</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Salary:</span>
                      <span className="font-medium">฿35,000</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">Customer Service</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Staff Count:</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Salary:</span>
                      <span className="font-medium">฿32,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}