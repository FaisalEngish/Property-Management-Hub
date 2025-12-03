import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, 
  Edit, 
  Crown, 
  Shield, 
  Users, 
  Search, 
  Plus,
  Settings,
  BarChart3,
  DollarSign,
  Luggage,
  Wrench,
  Clock,
  FileText,
  UserCheck,
  Brain,
  Target,
  Home,
  Building,
  CheckSquare,
  Calendar,
  Server
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ElementType;
}

interface Permission {
  id: string;
  module: string;
  feature: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  canView: boolean;
  canEdit: boolean;
}

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

const ROLES: Role[] = [
  { id: 'admin', name: 'Admin', description: 'Full system access', color: 'bg-red-500', icon: Crown },
  { id: 'portfolio-manager', name: 'Portfolio Manager', description: 'Manages multiple properties', color: 'bg-purple-500', icon: BarChart3 },
  { id: 'owner', name: 'Owner', description: 'Property owner access', color: 'bg-blue-500', icon: Building },
  { id: 'retail-agent', name: 'Retail Agent', description: 'Books properties for guests', color: 'bg-green-500', icon: UserCheck },
  { id: 'referral-agent', name: 'Referral Agent', description: 'Refers properties to guests', color: 'bg-yellow-500', icon: Users },
  { id: 'staff', name: 'Staff', description: 'Property maintenance staff', color: 'bg-gray-500', icon: Wrench },
  { id: 'guest', name: 'Guest', description: 'Property guest access', color: 'bg-pink-500', icon: Luggage }
];

const PERMISSIONS: Permission[] = [
  // Core Dashboard
  { id: 'dashboard-view', module: 'Dashboard', feature: 'View Dashboard', description: 'Access main dashboard', icon: Home, category: 'Core' },
  { id: 'dashboard-edit', module: 'Dashboard', feature: 'Edit Dashboard', description: 'Customize dashboard layout', icon: Settings, category: 'Core' },
  
  // Property Management
  { id: 'properties-view', module: 'Properties', feature: 'View Properties', description: 'View property listings', icon: Building, category: 'Property' },
  { id: 'properties-edit', module: 'Properties', feature: 'Edit Properties', description: 'Modify property details', icon: Edit, category: 'Property' },
  { id: 'checkin-tracker', module: 'Check-in Tracker', feature: 'Guest Check-in', description: 'Track guest arrivals', icon: Luggage, category: 'Property' },
  { id: 'maintenance-system', module: 'Maintenance', feature: 'Maintenance System', description: 'Manage property maintenance', icon: Wrench, category: 'Property' },
  
  // Financial
  { id: 'finances-view', module: 'Finances', feature: 'View Finances', description: 'View financial reports', icon: DollarSign, category: 'Financial' },
  { id: 'finances-edit', module: 'Finances', feature: 'Edit Finances', description: 'Modify financial records', icon: Edit, category: 'Financial' },
  { id: 'booking-income', module: 'Booking Income', feature: 'Booking Revenue', description: 'Track booking income', icon: BarChart3, category: 'Financial' },
  { id: 'payouts', module: 'Payouts', feature: 'Process Payouts', description: 'Handle commission payouts', icon: DollarSign, category: 'Financial' },
  
  // Task Management
  { id: 'tasks-view', module: 'Tasks', feature: 'View Tasks', description: 'View task assignments', icon: CheckSquare, category: 'Tasks' },
  { id: 'tasks-edit', module: 'Tasks', feature: 'Edit Tasks', description: 'Create and modify tasks', icon: Edit, category: 'Tasks' },
  { id: 'auto-scheduling', module: 'Auto Scheduling', feature: 'Automated Rules', description: 'Manage recurring tasks', icon: Clock, category: 'Tasks' },
  
  // Administration
  { id: 'user-management', module: 'User Management', feature: 'Manage Users', description: 'Create and manage users', icon: Users, category: 'Admin' },
  { id: 'system-settings', module: 'System Settings', feature: 'System Config', description: 'Configure system settings', icon: Settings, category: 'Admin' },
  { id: 'ai-notifications', module: 'AI Notifications', feature: 'Smart Alerts', description: 'AI-powered notifications', icon: Brain, category: 'Admin' },
  { id: 'activity-logs', module: 'Activity Logs', feature: 'Audit Trail', description: 'View system activity', icon: FileText, category: 'Admin' },
  
  // Advanced Features
  { id: 'smart-pricing', module: 'Smart Pricing', feature: 'AI Pricing', description: 'Dynamic pricing tools', icon: Target, category: 'Advanced' },
  { id: 'performance-toolkit', module: 'Performance', feature: 'Analytics', description: 'Performance insights', icon: BarChart3, category: 'Advanced' },
  { id: 'inventory-management', module: 'Inventory', feature: 'Stock Management', description: 'Track inventory items', icon: Server, category: 'Advanced' }
];

const DEMO_USERS: DemoUser[] = [
  { id: 'demo-admin', name: 'Admin User', email: 'admin@test.com', role: 'admin', lastLogin: '2025-01-28 17:30', status: 'active' },
  { id: 'demo-pm', name: 'Portfolio Manager', email: 'manager@test.com', role: 'portfolio-manager', lastLogin: '2025-01-28 16:45', status: 'active' },
  { id: 'demo-owner', name: 'Property Owner', email: 'owner@test.com', role: 'owner', lastLogin: '2025-01-28 15:20', status: 'active' },
  { id: 'demo-staff', name: 'Staff Member', email: 'staff@test.com', role: 'staff', lastLogin: '2025-01-28 14:15', status: 'active' },
  { id: 'demo-retail-agent', name: 'Retail Agent', email: 'retail@test.com', role: 'retail-agent', lastLogin: '2025-01-28 13:30', status: 'active' },
  { id: 'demo-referral-agent', name: 'Referral Agent', email: 'referral@test.com', role: 'referral-agent', lastLogin: '2025-01-28 12:45', status: 'active' }
];

export default function AdminGodModeRoleManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewMode, setPreviewMode] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([
    // Default permissions for demonstration
    { roleId: 'admin', permissionId: 'dashboard-view', canView: true, canEdit: true },
    { roleId: 'admin', permissionId: 'properties-view', canView: true, canEdit: true },
    { roleId: 'admin', permissionId: 'finances-view', canView: true, canEdit: true },
    { roleId: 'portfolio-manager', permissionId: 'dashboard-view', canView: true, canEdit: false },
    { roleId: 'portfolio-manager', permissionId: 'properties-view', canView: true, canEdit: true },
    { roleId: 'portfolio-manager', permissionId: 'finances-view', canView: true, canEdit: false },
    { roleId: 'owner', permissionId: 'dashboard-view', canView: true, canEdit: false },
    { roleId: 'owner', permissionId: 'properties-view', canView: true, canEdit: false },
    { roleId: 'owner', permissionId: 'finances-view', canView: true, canEdit: false }
  ]);

  // Fetch users from API
  const { data: users = DEMO_USERS, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/user-management/users'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/user-management/users");
        return response.json();
      } catch (error) {
        console.error("Failed to fetch users:", error);
        return DEMO_USERS; // Fallback to demo data
      }
    }
  });

  // Fetch user statistics
  const { data: userStats = { totalUsers: 0, activeUsers: 0, byRole: {} } } = useQuery({
    queryKey: ['/api/user-management/stats'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/user-management/stats");
        return response.json();
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
        return {
          totalUsers: DEMO_USERS.length,
          activeUsers: DEMO_USERS.filter(u => u.status === 'active').length,
          byRole: DEMO_USERS.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
      }
    }
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PUT", `/api/user-management/users/${userId}/role`, {
        primaryRole: role
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-management/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-management/stats'] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully"
      });
    },
    onError: (error) => {
      console.error("Failed to update user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  });

  const categories = ['All', ...Array.from(new Set(PERMISSIONS.map(p => p.category)))];

  const filteredPermissions = PERMISSIONS.filter(permission => {
    const matchesSearch = permission.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || permission.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPermission = (roleId: string, permissionId: string) => {
    return rolePermissions.find(rp => rp.roleId === roleId && rp.permissionId === permissionId);
  };

  const updatePermission = (roleId: string, permissionId: string, type: 'view' | 'edit', value: boolean) => {
    setRolePermissions(prev => {
      const existing = prev.find(rp => rp.roleId === roleId && rp.permissionId === permissionId);
      if (existing) {
        return prev.map(rp => 
          rp.roleId === roleId && rp.permissionId === permissionId
            ? { ...rp, [type === 'view' ? 'canView' : 'canEdit']: value }
            : rp
        );
      } else {
        return [...prev, {
          roleId,
          permissionId,
          canView: type === 'view' ? value : false,
          canEdit: type === 'edit' ? value : false
        }];
      }
    });

    toast({
      title: "Permission Updated",
      description: `${type === 'view' ? 'View' : 'Edit'} access ${value ? 'granted' : 'revoked'} for ${ROLES.find(r => r.id === roleId)?.name}`,
    });
  };

  const previewAsRole = (roleId: string) => {
    setPreviewMode(roleId);
    toast({
      title: "Preview Mode Active",
      description: `Now previewing as ${ROLES.find(r => r.id === roleId)?.name}`,
      variant: "default"
    });
  };

  const exitPreview = () => {
    setPreviewMode(null);
    toast({
      title: "Preview Mode Disabled",
      description: "Returned to Admin view",
    });
  };

  const previewUser = (user: DemoUser) => {
    previewAsRole(user.role);
  };

  const getRoleIcon = (roleId: string) => {
    const role = ROLES.find(r => r.id === roleId);
    return role?.icon || Users;
  };

  const getRoleColor = (roleId: string) => {
    const role = ROLES.find(r => r.id === roleId);
    return role?.color || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Preview Mode */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            God Mode & Role Manager
          </h1>
          <p className="text-muted-foreground">
            Complete admin control over user roles and permissions
          </p>
        </div>
        
        {previewMode && (
          <Card className="border-2 border-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Preview Mode Active</p>
                  <p className="text-sm text-muted-foreground">
                    Viewing as: {ROLES.find(r => r.id === previewMode)?.name}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={exitPreview}>
                  Exit Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
          <TabsTrigger value="preview">Preview Roles</TabsTrigger>
          <TabsTrigger value="users">Demo Users</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Access Control Panel
              </CardTitle>
              <CardDescription>
                Manage view and edit permissions for each role across all system modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search">Search Permissions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search modules or features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Feature</TableHead>
                      {ROLES.map(role => (
                        <TableHead key={role.id} className="text-center min-w-[120px]">
                          <div className="flex items-center justify-center gap-2">
                            <role.icon className="h-4 w-4" />
                            <span className="text-xs">{role.name}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <permission.icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{permission.feature}</p>
                              <p className="text-xs text-muted-foreground">{permission.module}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {permission.category}
                            </Badge>
                          </div>
                        </TableCell>
                        {ROLES.map(role => {
                          const perm = getPermission(role.id, permission.id);
                          return (
                            <TableCell key={role.id} className="text-center">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <Switch
                                    checked={perm?.canView || false}
                                    onCheckedChange={(value) => updatePermission(role.id, permission.id, 'view', value)}
                                  />
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <Edit className="h-3 w-3" />
                                  <Switch
                                    checked={perm?.canEdit || false}
                                    onCheckedChange={(value) => updatePermission(role.id, permission.id, 'edit', value)}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Role Preview System
              </CardTitle>
              <CardDescription>
                Preview the system interface from any role's perspective
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROLES.map(role => {
                  const RoleIcon = role.icon;
                  return (
                    <Card key={role.id} className={`cursor-pointer transition-all hover:shadow-lg ${previewMode === role.id ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${role.color} text-white`}>
                            <RoleIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{role.name}</h3>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium">Accessible Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {PERMISSIONS.slice(0, 6).map(permission => {
                              const perm = getPermission(role.id, permission.id);
                              return perm?.canView ? (
                                <Badge key={permission.id} variant="secondary" className="text-xs">
                                  {permission.module}
                                </Badge>
                              ) : null;
                            })}
                            <Badge variant="outline" className="text-xs">
                              +{PERMISSIONS.filter(p => getPermission(role.id, p.id)?.canView).length - 6} more
                            </Badge>
                          </div>
                        </div>

                        <Button 
                          className="w-full" 
                          variant={previewMode === role.id ? "default" : "outline"}
                          onClick={() => previewMode === role.id ? exitPreview() : previewAsRole(role.id)}
                        >
                          {previewMode === role.id ? 'Exit Preview' : 'Preview Role'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management System
                {usersLoading && (
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                )}
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions with real-time API integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">{userStats.activeUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Roles Configured</p>
                        <p className="text-2xl font-bold">{Object.keys(userStats.byRole || {}).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Demo User
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      // Loading state
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                              <div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      users.map((user: any) => {
                        const RoleIcon = getRoleIcon(user.primaryRole || user.role);
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImageUrl} />
                                  <AvatarFallback>
                                    {user.firstName && user.lastName 
                                      ? `${user.firstName[0]}${user.lastName[0]}`
                                      : user.email?.[0]?.toUpperCase() || '?'
                                    }
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {user.firstName && user.lastName 
                                      ? `${user.firstName} ${user.lastName}`
                                      : user.email
                                    }
                                  </p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${getRoleColor(user.primaryRole || user.role)} text-white`}>
                                  <RoleIcon className="h-3 w-3" />
                                </div>
                                <span className="capitalize">
                                  {(user.primaryRole || user.role)?.replace('-', ' ') || 'No Role'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.lastLogin || 'Never'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isActive !== false ? 'default' : 'secondary'}>
                                {user.isActive !== false ? 'active' : 'inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => previewUser({ 
                                    id: user.id, 
                                    name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
                                    email: user.email,
                                    role: user.primaryRole || user.role,
                                    lastLogin: user.lastLogin || 'Never',
                                    status: user.isActive !== false ? 'active' : 'inactive'
                                  })}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  Preview
                                </Button>
                                <Select
                                  value={user.primaryRole || user.role || ''}
                                  onValueChange={(newRole) => updateUserRoleMutation.mutate({ userId: user.id, role: newRole })}
                                  disabled={updateUserRoleMutation.isPending}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map(role => (
                                      <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}