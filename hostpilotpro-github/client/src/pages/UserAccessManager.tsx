import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Settings, 
  Shield, 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Home,
  Clock,
  Wrench,
  Zap,
  UserCheck,
  Lock,
  Unlock
} from "lucide-react";

interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  permissions?: UserPermissions;
  listingsAccess?: number[];
}

interface UserPermissions {
  listings: ModulePermission;
  reservations: ModulePermission;
  calendar: ModulePermission;
  financials: ModulePermission;
  ownerStatements: ModulePermission;
  tasks: ModulePermission;
  utilities: ModulePermission;
  adminAccess: boolean;
  financialDataAccess: boolean;
  otaPayoutDataOnly: boolean;
}

interface ModulePermission {
  view: boolean;
  edit: boolean;
  create: boolean;
  delete: boolean;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  listings: { view: false, edit: false, create: false, delete: false },
  reservations: { view: false, edit: false, create: false, delete: false },
  calendar: { view: false, edit: false, create: false, delete: false },
  financials: { view: false, edit: false, create: false, delete: false },
  ownerStatements: { view: false, edit: false, create: false, delete: false },
  tasks: { view: false, edit: false, create: false, delete: false },
  utilities: { view: false, edit: false, create: false, delete: false },
  adminAccess: false,
  financialDataAccess: false,
  otaPayoutDataOnly: false,
};

const ROLE_TEMPLATES: Record<string, Partial<UserPermissions>> = {
  admin: {
    listings: { view: true, edit: true, create: true, delete: true },
    reservations: { view: true, edit: true, create: true, delete: true },
    calendar: { view: true, edit: true, create: true, delete: true },
    financials: { view: true, edit: true, create: true, delete: true },
    ownerStatements: { view: true, edit: true, create: true, delete: true },
    tasks: { view: true, edit: true, create: true, delete: true },
    utilities: { view: true, edit: true, create: true, delete: true },
    adminAccess: true,
    financialDataAccess: true,
    otaPayoutDataOnly: false,
  },
  "portfolio-manager": {
    listings: { view: true, edit: true, create: true, delete: false },
    reservations: { view: true, edit: true, create: true, delete: false },
    calendar: { view: true, edit: true, create: true, delete: false },
    financials: { view: true, edit: false, create: false, delete: false },
    ownerStatements: { view: true, edit: false, create: false, delete: false },
    tasks: { view: true, edit: true, create: true, delete: false },
    utilities: { view: true, edit: true, create: false, delete: false },
    adminAccess: false,
    financialDataAccess: true,
    otaPayoutDataOnly: false,
  },
  owner: {
    listings: { view: true, edit: false, create: false, delete: false },
    reservations: { view: true, edit: false, create: false, delete: false },
    calendar: { view: true, edit: false, create: false, delete: false },
    financials: { view: true, edit: false, create: false, delete: false },
    ownerStatements: { view: true, edit: false, create: false, delete: false },
    tasks: { view: true, edit: false, create: false, delete: false },
    utilities: { view: true, edit: false, create: false, delete: false },
    adminAccess: false,
    financialDataAccess: true,
    otaPayoutDataOnly: true,
  },
  staff: {
    listings: { view: true, edit: false, create: false, delete: false },
    reservations: { view: true, edit: true, create: false, delete: false },
    calendar: { view: true, edit: false, create: false, delete: false },
    financials: { view: false, edit: false, create: false, delete: false },
    ownerStatements: { view: false, edit: false, create: false, delete: false },
    tasks: { view: true, edit: true, create: true, delete: false },
    utilities: { view: true, edit: true, create: false, delete: false },
    adminAccess: false,
    financialDataAccess: false,
    otaPayoutDataOnly: false,
  },
  "retail-agent": {
    listings: { view: true, edit: false, create: false, delete: false },
    reservations: { view: true, edit: false, create: true, delete: false },
    calendar: { view: true, edit: false, create: false, delete: false },
    financials: { view: true, edit: false, create: false, delete: false },
    ownerStatements: { view: false, edit: false, create: false, delete: false },
    tasks: { view: false, edit: false, create: false, delete: false },
    utilities: { view: false, edit: false, create: false, delete: false },
    adminAccess: false,
    financialDataAccess: false,
    otaPayoutDataOnly: true,
  },
  "referral-agent": {
    listings: { view: true, edit: false, create: false, delete: false },
    reservations: { view: true, edit: false, create: false, delete: false },
    calendar: { view: true, edit: false, create: false, delete: false },
    financials: { view: true, edit: false, create: false, delete: false },
    ownerStatements: { view: false, edit: false, create: false, delete: false },
    tasks: { view: false, edit: false, create: false, delete: false },
    utilities: { view: false, edit: false, create: false, delete: false },
    adminAccess: false,
    financialDataAccess: false,
    otaPayoutDataOnly: true,
  },
};

export default function UserAccessManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  // Fetch properties for listing access
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/properties");
      return response.json();
    },
  });

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: { userId: string; permissions: UserPermissions; listingsAccess: number[] }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${data.userId}/permissions`, {
        permissions: data.permissions,
        listingsAccess: data.listingsAccess,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissions Updated",
        description: "User permissions have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsPermissionDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const openPermissionDialog = (user: User) => {
    setSelectedUser(user);
    setPermissions(user.permissions || DEFAULT_PERMISSIONS);
    setSelectedProperties(user.listingsAccess || []);
    setIsPermissionDialogOpen(true);
  };

  const applyRoleTemplate = (role: string) => {
    const template = ROLE_TEMPLATES[role];
    if (template) {
      setPermissions({ ...DEFAULT_PERMISSIONS, ...template });
    }
  };

  const handlePermissionChange = (module: keyof UserPermissions, permission: string, value: boolean) => {
    if (module === 'adminAccess' || module === 'financialDataAccess' || module === 'otaPayoutDataOnly') {
      setPermissions(prev => ({ ...prev, [module]: value }));
    } else {
      setPermissions(prev => ({
        ...prev,
        [module]: {
          ...prev[module] as ModulePermission,
          [permission]: value
        }
      }));
    }
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    
    updatePermissionsMutation.mutate({
      userId: selectedUser.id,
      permissions,
      listingsAccess: selectedProperties,
    });
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Never";
    return new Date(lastLogin).toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'portfolio-manager': return 'bg-blue-100 text-blue-800';
      case 'owner': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-yellow-100 text-yellow-800';
      case 'retail-agent': return 'bg-purple-100 text-purple-800';
      case 'referral-agent': return 'bg-pink-100 text-pink-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ModulePermissionRow = ({ 
    icon, 
    label, 
    module, 
    permissions 
  }: { 
    icon: React.ReactNode;
    label: string;
    module: keyof UserPermissions;
    permissions: ModulePermission;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex gap-4">
        {(['view', 'edit', 'create', 'delete'] as const).map((permission) => (
          <div key={permission} className="flex items-center gap-2">
            <Checkbox
              checked={permissions[permission]}
              onCheckedChange={(checked) => 
                handlePermissionChange(module, permission, !!checked)
              }
            />
            <Label className="text-sm capitalize">{permission}</Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Access Manager</h1>
          <p className="text-gray-600">Manage user permissions and property access</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Shield className="w-4 h-4 mr-1" />
            Admin Only
          </Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="retail-agent">Retail Agent</SelectItem>
                  <SelectItem value="referral-agent">Referral Agent</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatLastLogin(user.lastLoginAt)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPermissionDialog(user)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Manage Access
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permission Management Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Manage Access: {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Role Template Selector */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Apply Role Template</Label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(ROLE_TEMPLATES).map((role) => (
                  <Button
                    key={role}
                    variant="outline"
                    size="sm"
                    onClick={() => applyRoleTemplate(role)}
                    className="text-sm"
                  >
                    {role.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="permissions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="permissions">Module Permissions</TabsTrigger>
                <TabsTrigger value="properties">Property Access</TabsTrigger>
                <TabsTrigger value="special">Special Access</TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-2">
                  <ModulePermissionRow
                    icon={<Home className="w-4 h-4 text-blue-500" />}
                    label="Listings"
                    module="listings"
                    permissions={permissions.listings}
                  />
                  <ModulePermissionRow
                    icon={<Calendar className="w-4 h-4 text-green-500" />}
                    label="Reservations"
                    module="reservations"
                    permissions={permissions.reservations}
                  />
                  <ModulePermissionRow
                    icon={<Clock className="w-4 h-4 text-purple-500" />}
                    label="Calendar"
                    module="calendar"
                    permissions={permissions.calendar}
                  />
                  <ModulePermissionRow
                    icon={<DollarSign className="w-4 h-4 text-yellow-500" />}
                    label="Financials"
                    module="financials"
                    permissions={permissions.financials}
                  />
                  <ModulePermissionRow
                    icon={<FileText className="w-4 h-4 text-indigo-500" />}
                    label="Owner Statements"
                    module="ownerStatements"
                    permissions={permissions.ownerStatements}
                  />
                  <ModulePermissionRow
                    icon={<Wrench className="w-4 h-4 text-orange-500" />}
                    label="Tasks & Maintenance"
                    module="tasks"
                    permissions={permissions.tasks}
                  />
                  <ModulePermissionRow
                    icon={<Zap className="w-4 h-4 text-red-500" />}
                    label="Utilities"
                    module="utilities"
                    permissions={permissions.utilities}
                  />
                </div>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Property Access</Label>
                  <p className="text-sm text-gray-600">
                    Select which properties this user can access. Leave empty for all properties.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedProperties.includes(property.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProperties(prev => [...prev, property.id]);
                            } else {
                              setSelectedProperties(prev => prev.filter(id => id !== property.id));
                            }
                          }}
                        />
                        <Label className="text-sm flex-1">
                          {property.name}
                          <span className="text-gray-500 block text-xs">{property.address}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="special" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-500" />
                      <div>
                        <span className="font-medium">Admin-level Access</span>
                        <p className="text-sm text-gray-600">Full system access and user management</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={permissions.adminAccess}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('adminAccess', '', !!checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <div>
                        <span className="font-medium">Financial Data Access</span>
                        <p className="text-sm text-gray-600">Access to detailed financial reports and data</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={permissions.financialDataAccess}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('financialDataAccess', '', !!checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <div>
                        <span className="font-medium">OTA Payout Data Only</span>
                        <p className="text-sm text-gray-600">See platform payouts only, not guest total prices</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={permissions.otaPayoutDataOnly}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('otaPayoutDataOnly', '', !!checked)
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsPermissionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePermissions}
                disabled={updatePermissionsMutation.isPending}
                className="flex items-center gap-2"
              >
                {updatePermissionsMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}