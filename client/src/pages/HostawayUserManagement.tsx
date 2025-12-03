import { useState } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  Search,
  ChevronDown,
  Upload,
  Save,
  X
} from "lucide-react";

// Mock data for users
const mockUsers = [
  {
    id: 1,
    avatar: "/api/placeholder/40/40",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    title: "Property Manager",
    userGroups: ["Property Managers", "Administrators"],
    lastLogin: "2 hours ago",
    phone: "+66 123 456 789",
    preferredContact: "Email",
    address: "123 Sukhumvit Road, Bangkok",
    permissions: {
      canViewReports: true,
      canManageBookings: true,
      canManageUsers: false,
      canAccessFinance: true
    },
    notifications: {
      dashboard: true,
      mobile: false,
      email: true,
      sms: false
    },
    listingsAccess: [1, 2, 3]
  },
  {
    id: 2,
    avatar: "/api/placeholder/40/40",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    title: "Villa Coordinator",
    userGroups: ["Staff"],
    lastLogin: "1 day ago",
    phone: "+66 987 654 321",
    preferredContact: "Phone",
    address: "456 Patong Beach, Phuket",
    permissions: {
      canViewReports: true,
      canManageBookings: true,
      canManageUsers: false,
      canAccessFinance: false
    },
    notifications: {
      dashboard: true,
      mobile: true,
      email: true,
      sms: true
    },
    listingsAccess: [1, 4]
  },
  {
    id: 3,
    avatar: "/api/placeholder/40/40",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@example.com",
    title: "Operations Manager",
    userGroups: ["Property Managers"],
    lastLogin: "3 hours ago",
    phone: "+66 555 123 456",
    preferredContact: "Email",
    address: "789 Chaweng Beach, Koh Samui",
    permissions: {
      canViewReports: true,
      canManageBookings: true,
      canManageUsers: true,
      canAccessFinance: true
    },
    notifications: {
      dashboard: true,
      mobile: false,
      email: true,
      sms: false
    },
    listingsAccess: [2, 3, 4]
  }
];

// Listings/properties will be fetched from API - no hardcoded data
const mockListings: { id: number; name: string; image: string }[] = [];

function UserTable({ users, onEditUser }: { users: any[], onEditUser: (user: any) => void }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with search and actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="text-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add new
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-32 grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* User table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Groups
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.userGroups.map((group: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserEditPage({ user, onSave, onCancel }: { 
  user: any, 
  onSave: (user: any) => void, 
  onCancel: () => void 
}) {
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleSave = () => {
    onSave(editedUser);
  };

  const updateField = (field: string, value: any) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setEditedUser(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit User: {editedUser.firstName} {editedUser.lastName}
          </h2>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="permissions">Access Permissions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="listings">Listings Access</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={editedUser.avatar} />
                  <AvatarFallback className="text-lg">
                    {editedUser.firstName[0]}{editedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              {/* Basic Info Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    value={editedUser.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    value={editedUser.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    value={editedUser.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    value={editedUser.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    value={editedUser.preferredContact}
                    onChange={(e) => updateField('preferredContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={editedUser.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Access Permissions</h3>
              <div className="space-y-3">
                {Object.entries(editedUser.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={key}
                      checked={value as boolean}
                      onChange={(e) => updateNestedField('permissions', key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={key} className="ml-3 text-sm text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              <div className="space-y-3">
                {Object.entries(editedUser.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                    </label>
                    <button
                      type="button"
                      onClick={() => updateNestedField('notifications', key, !value)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Listings Access</h3>
                <Button variant="outline" size="sm">
                  Select All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {mockListings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      editedUser.listingsAccess.includes(listing.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      const newAccess = editedUser.listingsAccess.includes(listing.id)
                        ? editedUser.listingsAccess.filter((id: number) => id !== listing.id)
                        : [...editedUser.listingsAccess, listing.id];
                      updateField('listingsAccess', newAccess);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={listing.image}
                        alt={listing.name}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{listing.name}</h4>
                        <p className="text-sm text-gray-500">Villa Property</p>
                      </div>
                      <div className="ml-auto">
                        <input
                          type="checkbox"
                          checked={editedUser.listingsAccess.includes(listing.id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function HostawayUserManagement() {
  const [location, setLocation] = useLocation();
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setLocation('/user-management/edit');
  };

  const handleSaveUser = (updatedUser: any) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setLocation('/user-management');
    setSelectedUser(null);
  };

  const handleCancelEdit = () => {
    setLocation('/user-management');
    setSelectedUser(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Switch>
        <Route path="/user-management/edit">
          {selectedUser && (
            <UserEditPage
              user={selectedUser}
              onSave={handleSaveUser}
              onCancel={handleCancelEdit}
            />
          )}
        </Route>
        <Route>
          <UserTable users={users} onEditUser={handleEditUser} />
        </Route>
      </Switch>
    </div>
  );
}