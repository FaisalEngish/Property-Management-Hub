import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Shield, 
  Settings2, 
  Copy, 
  Save, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  X,
  Plus,
  UserCheck,
  UserX,
  Clock,
  Building,
  User,
  Crown,
  Star
} from "lucide-react";

// Permission levels
type PermissionLevel = "none" | "view" | "edit";

// User with permissions interface
interface UserWithPermissions {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  subRole: string | null;
  status: "active" | "suspended";
  assignedProperties: Array<{
    id: number;
    name: string;
    assignmentType: string;
  }>;
  permissions: Record<string, Record<string, PermissionLevel>>;
  demoMode: boolean;
}

// Module categories
const MODULE_CATEGORIES = {
  financials: {
    name: "Financials",
    modules: [
      { key: "invoices", name: "Invoices" },
      { key: "payouts", name: "Payouts" },
      { key: "commissions", name: "Commissions" },
      { key: "booking-income", name: "Booking Income" },
      { key: "owner-balances", name: "Owner Balances" },
      { key: "agent-earnings", name: "Agent Earnings" }
    ]
  },
  maintenance: {
    name: "Maintenance",
    modules: [
      { key: "tasks", name: "Tasks" },
      { key: "logs", name: "Logs" },
      { key: "utilities", name: "Utilities" },
      { key: "property-maintenance", name: "Property Maintenance" },
      { key: "warranty-tracker", name: "Warranty Tracker" },
      { key: "recurring-tasks", name: "Recurring Tasks" }
    ]
  },
  bookings: {
    name: "Bookings",
    modules: [
      { key: "calendar", name: "Calendar" },
      { key: "guest-info", name: "Guest Info" },
      { key: "extras", name: "Extras" },
      { key: "check-in-checkout", name: "Check-in/Out" },
      { key: "guest-portal", name: "Guest Portal" },
      { key: "service-timeline", name: "Service Timeline" }
    ]
  },
  documents: {
    name: "Documents",
    modules: [
      { key: "upload", name: "Upload" },
      { key: "licenses", name: "Licenses" },
      { key: "contracts", name: "Contracts" },
      { key: "owner-documents", name: "Owner Documents" },
      { key: "property-documents", name: "Property Documents" },
      { key: "compliance", name: "Compliance" }
    ]
  },
  addons: {
    name: "Add-ons",
    modules: [
      { key: "service-requests", name: "Service Requests" },
      { key: "chat", name: "Chat" },
      { key: "feedback", name: "Feedback" },
      { key: "smart-requests", name: "Smart Requests" },
      { key: "ai-recommendations", name: "AI Recommendations" },
      { key: "guest-surveys", name: "Guest Surveys" }
    ]
  }
} as const;

// Role colors
const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "portfolio-manager": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    owner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    staff: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "retail-agent": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "referral-agent": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    freelancer: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    guest: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  };
  return colors[role] || colors.guest;
};

// Permission level colors
const getPermissionColor = (level: PermissionLevel) => {
  const colors: Record<PermissionLevel, string> = {
    none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    view: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    edit: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
  };
  return colors[level];
};

// Permission level icons
const getPermissionIcon = (level: PermissionLevel) => {
  const icons: Record<PermissionLevel, React.ReactNode> = {
    none: <X className="w-3 h-3" />,
    view: <Eye className="w-3 h-3" />,
    edit: <Edit3 className="w-3 h-3" />
  };
  return icons[level];
};

export default function UserPermissionControlPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Fetch users with permissions
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["/api/user-permissions/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-permissions/users");
      return (await response.json()) as UserWithPermissions[];
    }
  });

  // Fetch permission presets
  const { data: presets = [] } = useQuery({
    queryKey: ["/api/user-permissions/presets"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-permissions/presets");
      return await response.json();
    }
  });

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: any[] }) => {
      await apiRequest("PATCH", `/api/user-permissions/users/${userId}`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-permissions/users"] });
      toast({ title: "Success", description: "User permissions updated successfully" });
      setShowPermissionDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Toggle demo mode mutation
  const toggleDemoModeMutation = useMutation({
    mutationFn: async ({ userId, demoMode }: { userId: string; demoMode: boolean }) => {
      await apiRequest("PATCH", `/api/user-permissions/users/${userId}/demo-mode`, { demoMode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-permissions/users"] });
      toast({ title: "Success", description: "Demo mode updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/user-permissions/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-permissions/users"] });
      toast({ title: "Success", description: "User status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Clone permissions mutation
  const clonePermissionsMutation = useMutation({
    mutationFn: async ({ fromUserId, toUserId }: { fromUserId: string; toUserId: string }) => {
      await apiRequest("POST", `/api/user-permissions/users/${toUserId}/clone-from/${fromUserId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-permissions/users"] });
      toast({ title: "Success", description: "Permissions cloned successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get role statistics
  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load user permissions. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            User Permission Control Panel
          </h1>
          <p className="text-muted-foreground">
            Manage user access permissions and role-based module controls
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {users.length} Total Users
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active: {users.filter(u => u.status === "active").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admin || 0}</div>
            <p className="text-xs text-muted-foreground">Full access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Managers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats["portfolio-manager"] || 0}</div>
            <p className="text-xs text-muted-foreground">Property oversight</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demo Mode</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.demoMode).length}</div>
            <p className="text-xs text-muted-foreground">Demo access enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="retail-agent">Retail Agent</SelectItem>
                <SelectItem value="referral-agent">Referral Agent</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Click on a user to manage their permissions and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Demo Mode</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowPermissionDialog(true);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    {user.subRole && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        {user.subRole}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status === "active" ? (
                        <UserCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <UserX className="w-3 h-3 mr-1" />
                      )}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.assignedProperties.length > 0 ? (
                        <div>
                          {user.assignedProperties.slice(0, 2).map(prop => (
                            <div key={prop.id} className="text-xs text-muted-foreground">
                              {prop.name}
                            </div>
                          ))}
                          {user.assignedProperties.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{user.assignedProperties.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No assignments</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.demoMode ? "secondary" : "outline"}>
                      {user.demoMode ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDemoModeMutation.mutate({
                            userId: user.id,
                            demoMode: !user.demoMode
                          });
                        }}
                      >
                        <Clock className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({
                            userId: user.id,
                            isActive: user.status !== "active"
                          });
                        }}
                      >
                        {user.status === "active" ? (
                          <UserX className="w-3 h-3" />
                        ) : (
                          <UserCheck className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permission Management Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Manage Permissions: {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              Configure module-level access permissions for this user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <User className="h-10 w-10 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                      {selectedUser.status}
                    </Badge>
                    {selectedUser.demoMode && (
                      <Badge variant="secondary">Demo Mode</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="space-y-6">
                {Object.entries(MODULE_CATEGORIES).map(([categoryKey, category]) => (
                  <Card key={categoryKey}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.modules.map((module) => {
                          const currentLevel = selectedUser.permissions[categoryKey]?.[module.key] || "none";
                          return (
                            <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="font-medium text-sm">{module.name}</span>
                              <Select
                                value={currentLevel}
                                onValueChange={(value: PermissionLevel) => {
                                  // Update local state
                                  setSelectedUser(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      permissions: {
                                        ...prev.permissions,
                                        [categoryKey]: {
                                          ...prev.permissions[categoryKey],
                                          [module.key]: value
                                        }
                                      }
                                    };
                                  });
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    <div className="flex items-center gap-2">
                                      <X className="w-3 h-3" />
                                      None
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="view">
                                    <div className="flex items-center gap-2">
                                      <Eye className="w-3 h-3" />
                                      View
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="edit">
                                    <div className="flex items-center gap-2">
                                      <Edit3 className="w-3 h-3" />
                                      Edit
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Clone permissions functionality would go here
                      // For now, just show a toast
                      toast({ title: "Feature Coming Soon", description: "Permission cloning will be available soon" });
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Clone From User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPresetDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Apply Preset
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPermissionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Convert permissions to the expected format
                      const permissionUpdates: any[] = [];
                      Object.entries(selectedUser.permissions).forEach(([categoryKey, modules]) => {
                        Object.entries(modules).forEach(([moduleKey, level]) => {
                          if (level !== "none") {
                            permissionUpdates.push({
                              moduleCategory: categoryKey,
                              moduleName: moduleKey,
                              permission: level,
                              isOverride: true
                            });
                          }
                        });
                      });

                      updatePermissionsMutation.mutate({
                        userId: selectedUser.id,
                        permissions: permissionUpdates
                      });
                    }}
                    disabled={updatePermissionsMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updatePermissionsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}