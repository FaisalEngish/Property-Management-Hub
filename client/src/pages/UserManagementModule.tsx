import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Settings, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  UserCheck,
  Building,
  Activity,
  Mail,
  Phone,
  AlertTriangle,
  Star,
  TrendingUp,
  MapPin,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  userRole?: {
    primaryRole: string;
    subRole?: string;
  };
  userPermissions?: {
    moduleAccess: Record<string, boolean>;
  };
  propertyAssignments?: Array<{
    propertyId: number;
    assignmentType: string;
    property?: {
      name: string;
    };
  }>;
  performanceMetrics?: {
    tasksCompleted: number;
    averageRating: number;
    totalEarnings: number;
  };
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface FreelancerTaskRequest {
  id: number;
  taskTitle: string;
  taskDescription: string;
  serviceCategory: string;
  proposedDate: string;
  proposedTimeStart: string;
  proposedTimeEnd: string;
  status: string;
  estimatedCost: number;
  property: {
    name: string;
  };
  requestedBy: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "portfolio-manager", label: "Portfolio Manager" },
  { value: "owner", label: "Owner" },
  { value: "retail-agent", label: "Retail Agent" },
  { value: "referral-agent", label: "Referral Agent" },
  { value: "staff", label: "Staff" },
  { value: "freelancer", label: "Freelancer" },
];

const STAFF_SUB_ROLES = [
  { value: "housekeeping", label: "Housekeeping" },
  { value: "host", label: "Host" },
  { value: "supervisor", label: "Supervisor" },
  { value: "gardener", label: "Gardener" },
  { value: "handyman", label: "Handyman" },
  { value: "pool", label: "Pool Maintenance" },
  { value: "pest", label: "Pest Control" },
];

const FREELANCER_CATEGORIES = [
  { value: "electrician", label: "Electrician" },
  { value: "contractor", label: "Contractor" },
  { value: "plumber", label: "Plumber" },
  { value: "pest", label: "Pest Control" },
  { value: "chef", label: "Private Chef" },
  { value: "spa", label: "Spa Therapist" },
  { value: "nanny", label: "Nanny" },
  { value: "maid", label: "External Maid" },
];

const MODULE_PERMISSIONS = [
  { key: "bookingsView", label: "Bookings View", description: "View booking information and calendar" },
  { key: "financialReports", label: "Financial Reports", description: "Access financial data and reports" },
  { key: "taskAccess", label: "Task Access & Checklists", description: "View and manage tasks" },
  { key: "guestChat", label: "Guest Chat Module", description: "Chat with guests and handle requests" },
  { key: "utilitiesView", label: "Utilities & Bills View/Edit", description: "Manage utility bills and accounts" },
  { key: "propertyEditor", label: "Property Description Editor", description: "Edit property descriptions and details" },
  { key: "documentsModule", label: "Documents Module", description: "Access and manage documents" },
  { key: "calendarAccess", label: "Calendar/Schedule Access", description: "View and manage schedules" },
  { key: "salaryVisibility", label: "Salary/Commission Visibility", description: "View salary and commission information" },
  { key: "photoSubmission", label: "Submit Photo/Tasks", description: "Upload photos and submit task evidence" },
  { key: "maintenanceLogs", label: "View Maintenance Logs", description: "Access maintenance history and logs" },
  { key: "fileUpload", label: "Upload/Download Files", description: "File management capabilities" },
  { key: "notifications", label: "Notifications Module", description: "Receive and manage notifications" },
  { key: "reservationNotes", label: "Reservation Notes & Add-ons", description: "Manage reservation notes and add-ons" },
  { key: "chatWall", label: "Chat/Comment Wall Visibility", description: "Participate in team communications" },
];

export default function UserManagementModule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isFreelancerDialogOpen, setIsFreelancerDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/user-management/users", { search: searchTerm, role: roleFilter, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('isActive', statusFilter);
      
      const response = await apiRequest("GET", `/api/user-management/users?${params.toString()}`);
      return response.json();
    },
  });

  // Fetch properties for assignments
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/properties");
      return response.json();
    },
  });

  // Fetch freelancer task requests
  const { data: freelancerRequests = [] } = useQuery({
    queryKey: ["/api/user-management/freelancer-requests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-management/freelancer-requests");
      return response.json();
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; primaryRole: string; subRole?: string }) => {
      const response = await apiRequest("PUT", `/api/user-management/users/${data.userId}/role`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-management/users"] });
      toast({ title: "Success", description: "User role updated successfully" });
      setIsRoleDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    },
  });

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: { userId: string; moduleAccess: Record<string, boolean> }) => {
      const response = await apiRequest("PUT", `/api/user-management/users/${data.userId}/permissions`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-management/users"] });
      toast({ title: "Success", description: "User permissions updated successfully" });
      setIsPermissionDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user permissions", variant: "destructive" });
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (data: { userId: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/user-management/users/${data.userId}/status`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-management/users"] });
      toast({ title: "Success", description: "User status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    },
  });

  // Assign property mutation
  const assignPropertyMutation = useMutation({
    mutationFn: async (data: { userId: string; propertyId: number; assignmentType: string }) => {
      const response = await apiRequest("POST", `/api/user-management/users/${data.userId}/properties`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-management/users"] });
      toast({ title: "Success", description: "Property assigned successfully" });
      setIsPropertyDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign property", variant: "destructive" });
    },
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      roleAssignment: string;
      subRoleAssignment?: string;
      propertyAssignments?: number[];
      expiresAt?: string;
    }) => {
      const response = await apiRequest("POST", "/api/user-management/invitations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Invitation sent successfully" });
      setIsInviteDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send invitation", variant: "destructive" });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "portfolio-manager": return "bg-blue-100 text-blue-800";
      case "owner": return "bg-green-100 text-green-800";
      case "staff": return "bg-yellow-100 text-yellow-800";
      case "retail-agent": return "bg-purple-100 text-purple-800";
      case "referral-agent": return "bg-pink-100 text-pink-800";
      case "freelancer": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || roleFilter === "all" || user.userRole?.primaryRole === roleFilter;
    const matchesStatus = !statusFilter || statusFilter === "all" || user.isActive.toString() === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage users, roles, permissions, and freelancers</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription>
                    Send an invitation to a new user with specific role and property assignments.
                  </DialogDescription>
                </DialogHeader>
                <InviteUserForm 
                  properties={properties}
                  onSubmit={(data) => sendInvitationMutation.mutate(data)}
                  isLoading={sendInvitationMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Master User List</TabsTrigger>
            <TabsTrigger value="freelancers">Freelancer Dashboard</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Master User List Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Users</Label>
                    <Input
                      id="search"
                      placeholder="Name, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-filter">Filter by Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        {ROLE_OPTIONS.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setRoleFilter("");
                        setStatusFilter("");
                      }}
                      className="mt-1"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Users ({filteredUsers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={getRoleBadgeColor(user.userRole?.primaryRole || "guest")}>
                                {user.userRole?.primaryRole || "No Role"}
                              </Badge>
                              {user.userRole?.subRole && (
                                <Badge variant="outline" className="text-xs">
                                  {user.userRole.subRole}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {user.propertyAssignments?.map((assignment, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Building className="h-3 w-3 mr-1" />
                                  {assignment.property?.name}
                                </Badge>
                              ))}
                              {!user.propertyAssignments?.length && (
                                <span className="text-gray-400 text-sm">No assignments</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={(checked) => 
                                  toggleStatusMutation.mutate({ userId: user.id, isActive: checked })
                                }
                                className="scale-75"
                              />
                              <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.lastLoginAt ? (
                              <span className="text-sm text-gray-600">
                                {format(new Date(user.lastLoginAt), "MMM d, yyyy")}
                              </span>
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.performanceMetrics ? (
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {user.performanceMetrics.averageRating?.toFixed(1) || "N/A"}
                                </div>
                                <div className="text-gray-500">
                                  {user.performanceMetrics.tasksCompleted} tasks
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">No data</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsRoleDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsPermissionDialogOpen(true);
                                }}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsPropertyDialogOpen(true);
                                }}
                              >
                                <Building className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Freelancer Dashboard Tab */}
          <TabsContent value="freelancers" className="space-y-6">
            <FreelancerDashboard 
              freelancers={users.filter(u => u.userRole?.primaryRole === "freelancer")}
              requests={freelancerRequests}
            />
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
        </Tabs>

        {/* Role Assignment Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
              <DialogDescription>
                Update the role and sub-role for {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <RoleAssignmentForm
                user={selectedUser}
                onSubmit={(data) => updateRoleMutation.mutate({ userId: selectedUser.id, ...data })}
                isLoading={updateRoleMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Permission Dialog */}
        <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Access Permissions</DialogTitle>
              <DialogDescription>
                Configure module access for {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <PermissionManagementForm
                user={selectedUser}
                onSubmit={(moduleAccess) => updatePermissionsMutation.mutate({ 
                  userId: selectedUser.id, 
                  moduleAccess 
                })}
                isLoading={updatePermissionsMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Property Assignment Dialog */}
        <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Properties</DialogTitle>
              <DialogDescription>
                Assign properties to {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <PropertyAssignmentForm
                user={selectedUser}
                properties={properties}
                onSubmit={(data) => assignPropertyMutation.mutate({ userId: selectedUser.id, ...data })}
                isLoading={assignPropertyMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Sub-components for forms
function RoleAssignmentForm({ user, onSubmit, isLoading }: {
  user: User;
  onSubmit: (data: { primaryRole: string; subRole?: string }) => void;
  isLoading: boolean;
}) {
  const [primaryRole, setPrimaryRole] = useState(user.userRole?.primaryRole || "");
  const [subRole, setSubRole] = useState(user.userRole?.subRole || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ primaryRole, subRole: subRole || undefined });
  };

  const showSubRoles = primaryRole === "staff" || primaryRole === "freelancer";
  const subRoleOptions = primaryRole === "staff" ? STAFF_SUB_ROLES : FREELANCER_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="primaryRole">Primary Role</Label>
        <Select value={primaryRole} onValueChange={setPrimaryRole}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map(role => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showSubRoles && (
        <div>
          <Label htmlFor="subRole">
            {primaryRole === "staff" ? "Staff Sub-Role" : "Freelancer Category"}
          </Label>
          <Select value={subRole} onValueChange={setSubRole}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {subRoleOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter>
        <Button type="submit" disabled={isLoading || !primaryRole}>
          {isLoading ? "Updating..." : "Update Role"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PermissionManagementForm({ user, onSubmit, isLoading }: {
  user: User;
  onSubmit: (moduleAccess: Record<string, boolean>) => void;
  isLoading: boolean;
}) {
  const [permissions, setPermissions] = useState(
    user.userPermissions?.moduleAccess || {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(permissions);
  };

  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {MODULE_PERMISSIONS.map(permission => (
          <div key={permission.key} className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id={permission.key}
              checked={permissions[permission.key] || false}
              onCheckedChange={() => togglePermission(permission.key)}
            />
            <div className="flex-1">
              <Label htmlFor={permission.key} className="font-medium">
                {permission.label}
              </Label>
              <p className="text-sm text-gray-500">{permission.description}</p>
            </div>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Permissions"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PropertyAssignmentForm({ user, properties, onSubmit, isLoading }: {
  user: User;
  properties: Property[];
  onSubmit: (data: { propertyId: number; assignmentType: string }) => void;
  isLoading: boolean;
}) {
  const [propertyId, setPropertyId] = useState<number>(0);
  const [assignmentType, setAssignmentType] = useState("permanent");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (propertyId) {
      onSubmit({ propertyId, assignmentType });
    }
  };

  const assignedPropertyIds = user.propertyAssignments?.map(pa => pa.propertyId) || [];
  const availableProperties = properties.filter(p => !assignedPropertyIds.includes(p.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="property">Property</Label>
        <Select value={propertyId.toString()} onValueChange={(value) => setPropertyId(parseInt(value))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {availableProperties.map(property => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assignmentType">Assignment Type</Label>
        <Select value={assignmentType} onValueChange={setAssignmentType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="permanent">Permanent</SelectItem>
            <SelectItem value="temporary">Temporary</SelectItem>
            <SelectItem value="project-based">Project-based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading || !propertyId}>
          {isLoading ? "Assigning..." : "Assign Property"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function InviteUserForm({ properties, onSubmit, isLoading }: {
  properties: Property[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    email: "",
    roleAssignment: "",
    subRoleAssignment: "",
    propertyAssignments: [] as number[],
    expiresAt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="user@example.com"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="role">Role Assignment</Label>
        <Select value={formData.roleAssignment} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, roleAssignment: value }))
        }>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map(role => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading || !formData.email || !formData.roleAssignment}>
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FreelancerDashboard({ freelancers, requests }: {
  freelancers: User[];
  requests: FreelancerTaskRequest[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Freelancer Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{freelancers.length}</div>
              <div className="text-sm text-gray-600">Active Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Freelancer Task Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Proposed Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.taskTitle}</div>
                      <div className="text-sm text-gray-500">{request.taskDescription}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.serviceCategory}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.proposedDate), "MMM d, yyyy")}
                    <div className="text-sm text-gray-500">
                      {request.proposedTimeStart} - {request.proposedTimeEnd}
                    </div>
                  </TableCell>
                  <TableCell>
                    ${request.estimatedCost}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={request.status === 'completed' ? 'default' : 
                               request.status === 'pending' ? 'secondary' : 'outline'}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}