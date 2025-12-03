import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Shield, Eye, Building, UserPlus, Search, Filter, Settings, ChevronDown, Lock, Unlock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "portfolio-manager", "staff", "owner", "guest"]),
  status: z.enum(["active", "inactive"]),
});

const addUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "portfolio-manager", "staff", "owner", "guest"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type EditUserForm = z.infer<typeof editUserSchema>;
type AddUserForm = z.infer<typeof addUserSchema>;

// Comprehensive module permissions structure
const MODULE_PERMISSIONS = {
  "Core Dashboard": {
    "Admin Dashboard": { view: true, edit: true, create: false, delete: false },
    "Portfolio Manager Dashboard": { view: true, edit: false, create: false, delete: false },
    "Owner Dashboard": { view: true, edit: false, create: false, delete: false },
    "Staff Dashboard": { view: true, edit: false, create: false, delete: false },
    "Retail Agent Hub": { view: true, edit: false, create: false, delete: false },
  },
  "Property Management": {
    "Property CRUD": { view: true, edit: true, create: true, delete: true },
    "Property Settings": { view: true, edit: true, create: false, delete: false },
    "Property Goals": { view: true, edit: true, create: true, delete: false },
    "Property Hub": { view: true, edit: false, create: false, delete: false },
    "Property Overview": { view: true, edit: false, create: false, delete: false },
  },
  "Task Management": {
    "Task CRUD": { view: true, edit: true, create: true, delete: true },
    "Task Templates": { view: true, edit: true, create: true, delete: false },
    "Task Automation": { view: true, edit: true, create: false, delete: false },
    "Daily Operations": { view: true, edit: false, create: false, delete: false },
    "Maintenance Tracking": { view: true, edit: true, create: true, delete: false },
  },
  "Booking & Guest Services": {
    "Booking CRUD": { view: true, edit: true, create: true, delete: false },
    "Guest Portal": { view: true, edit: false, create: false, delete: false },
    "Check-in/Check-out": { view: true, edit: true, create: false, delete: false },
    "Guest Communication": { view: true, edit: true, create: true, delete: false },
    "Guest Services": { view: true, edit: false, create: false, delete: false },
  },
  "Financial Management": {
    "Finance CRUD": { view: true, edit: true, create: true, delete: true },
    "Invoice Generator": { view: true, edit: true, create: true, delete: false },
    "Finance Engine": { view: true, edit: true, create: false, delete: false },
    "Smart Pricing": { view: true, edit: true, create: false, delete: false },
    "OTA Payout Logic": { view: true, edit: false, create: false, delete: false },
    "Owner Invoicing": { view: true, edit: true, create: true, delete: false },
    "Commission System": { view: true, edit: true, create: false, delete: false },
  },
  "Utilities & Maintenance": {
    "Utility Tracker": { view: true, edit: true, create: true, delete: false },
    "Water Management": { view: true, edit: true, create: true, delete: false },
    "Maintenance System": { view: true, edit: true, create: true, delete: false },
    "Vendor Management": { view: true, edit: true, create: true, delete: true },
    "Supply Orders": { view: true, edit: true, create: true, delete: false },
  },
  "Staff & Operations": {
    "Staff Management": { view: true, edit: true, create: true, delete: false },
    "Staff Permissions": { view: true, edit: true, create: false, delete: false },
    "Staff Workload": { view: true, edit: false, create: false, delete: false },
    "Staff Skills": { view: true, edit: true, create: true, delete: false },
    "Operational Efficiency": { view: true, edit: false, create: false, delete: false },
  },
  "Reports & Analytics": {
    "Financial Reports": { view: true, edit: false, create: false, delete: false },
    "Performance Analytics": { view: true, edit: false, create: false, delete: false },
    "Portfolio Health": { view: true, edit: false, create: false, delete: false },
    "Sustainability Metrics": { view: true, edit: false, create: false, delete: false },
    "Revenue Forecasting": { view: true, edit: false, create: false, delete: false },
  },
  "AI & Automation": {
    "Captain Cortex AI": { view: true, edit: false, create: false, delete: false },
    "AI Notifications": { view: true, edit: true, create: false, delete: false },
    "AI Task Automation": { view: true, edit: true, create: false, delete: false },
    "Smart Suggestions": { view: true, edit: false, create: false, delete: false },
  },
  "System Administration": {
    "User Management": { view: true, edit: true, create: true, delete: true },
    "System Settings": { view: true, edit: true, create: false, delete: false },
    "API Connections": { view: true, edit: true, create: false, delete: false },
    "Sandbox Testing": { view: true, edit: true, create: false, delete: false },
    "System Integrity": { view: true, edit: false, create: false, delete: false },
  }
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users from API
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
      status: "active",
    },
  });

  const addForm = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
      password: "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: EditUserForm & { id: string }) => {
      const { id, ...updateData } = data;
      return apiRequest("PATCH", `/api/users/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: AddUserForm) => {
      return apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: user.role,
      status: user.status || "active",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmitEdit = (data: EditUserForm) => {
    if (editingUser) {
      updateUserMutation.mutate({ ...data, id: editingUser.id });
    }
  };

  const onSubmitAdd = (data: AddUserForm) => {
    createUserMutation.mutate(data);
  };

  const handleManagePermissions = (user: any) => {
    setSelectedUserForPermissions(user);
    // Initialize user permissions with defaults based on role
    const defaultPermissions: any = {};
    Object.keys(MODULE_PERMISSIONS).forEach(category => {
      defaultPermissions[category] = {};
      Object.keys(MODULE_PERMISSIONS[category as keyof typeof MODULE_PERMISSIONS]).forEach(module => {
        // Set default permissions based on user role
        const isAdmin = user.role === 'admin';
        const isManager = user.role === 'portfolio-manager';
        const isStaff = user.role === 'staff';
        const isOwner = user.role === 'owner';
        
        defaultPermissions[category][module] = {
          view: true, // Most users can view
          edit: isAdmin || (isManager && !category.includes('System')),
          create: isAdmin || (isManager && !category.includes('System')),
          delete: isAdmin
        };
        
        // Special restrictions
        if (category === 'System Administration' && !isAdmin) {
          defaultPermissions[category][module] = { view: false, edit: false, create: false, delete: false };
        }
        if (category === 'Financial Management' && isStaff) {
          defaultPermissions[category][module].edit = false;
          defaultPermissions[category][module].create = false;
        }
      });
    });
    setUserPermissions(defaultPermissions);
    setIsPermissionDialogOpen(true);
  };

  const updatePermission = (category: string, module: string, permission: string, value: boolean) => {
    setUserPermissions((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [module]: {
          ...prev[category][module],
          [permission]: value
        }
      }
    }));
  };

  const toggleModuleExpansion = (category: string) => {
    setExpandedModules(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const savePermissions = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Success",
      description: `Permissions updated for ${selectedUserForPermissions?.name || selectedUserForPermissions?.email}`,
    });
    setIsPermissionDialogOpen(false);
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    admin: "bg-red-100 text-red-800",
    "portfolio-manager": "bg-blue-100 text-blue-800", 
    staff: "bg-green-100 text-green-800",
    owner: "bg-purple-100 text-purple-800",
    guest: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage users, permissions, and access controls</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* User Permissions Management Dialog */}
        <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Manage Permissions: {selectedUserForPermissions?.name || selectedUserForPermissions?.email}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge className={roleColors[selectedUserForPermissions?.role as keyof typeof roleColors]}>
                    {selectedUserForPermissions?.role}
                  </Badge>
                  <span className="text-sm text-gray-600">{selectedUserForPermissions?.email}</span>
                </div>
                <div className="ml-auto text-xs text-gray-500">
                  Configure granular permissions for each module and operation
                </div>
              </div>

              <div className="space-y-3">
                {Object.keys(MODULE_PERMISSIONS).map(category => (
                  <div key={category} className="border rounded-lg">
                    <Collapsible>
                      <CollapsibleTrigger 
                        className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
                        onClick={() => toggleModuleExpansion(category)}
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedModules.includes(category) ? 'rotate-180' : ''}`} />
                          <h3 className="font-semibold">{category}</h3>
                          <Badge variant="outline">
                            {Object.keys(MODULE_PERMISSIONS[category as keyof typeof MODULE_PERMISSIONS]).length} modules
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 border-t space-y-3">
                          {Object.keys(MODULE_PERMISSIONS[category as keyof typeof MODULE_PERMISSIONS]).map(module => (
                            <div key={module} className="flex items-center justify-between p-2 border rounded">
                              <div className="font-medium text-sm">{module}</div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs">View</span>
                                  <Switch
                                    checked={userPermissions[category]?.[module]?.view || false}
                                    onCheckedChange={(checked) => updatePermission(category, module, 'view', checked)}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Settings className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs">Edit</span>
                                  <Switch
                                    checked={userPermissions[category]?.[module]?.edit || false}
                                    onCheckedChange={(checked) => updatePermission(category, module, 'edit', checked)}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <UserPlus className="h-3 w-3 text-green-500" />
                                  <span className="text-xs">Create</span>
                                  <Switch
                                    checked={userPermissions[category]?.[module]?.create || false}
                                    onCheckedChange={(checked) => updatePermission(category, module, 'create', checked)}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Filter className="h-3 w-3 text-red-500" />
                                  <span className="text-xs">Delete</span>
                                  <Switch
                                    checked={userPermissions[category]?.[module]?.delete || false}
                                    onCheckedChange={(checked) => updatePermission(category, module, 'delete', checked)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsPermissionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={savePermissions}>
                  Save Permissions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="visibility" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Property Visibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-300 rounded"></div>
                          <div className="h-3 w-48 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                        <div className="h-8 w-16 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user: any) => {
                    const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium">{displayName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">Role: {user.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                            {user.role}
                          </Badge>
                          <Badge variant={(user.status || 'active') === 'active' ? 'default' : 'secondary'}>
                            {user.status || 'active'}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleManagePermissions(user)}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Permissions
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredUsers.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                      No users found matching your filters.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Global Permission Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">How to Manage Permissions</h3>
                  <p className="text-blue-800 text-sm">
                    Click the "Permissions" button next to any user in the Users tab to configure their detailed module access.
                    Each user can have granular permissions for View, Edit, Create, and Delete operations across all platform modules.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Admin Role</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Full system access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>User management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>System settings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>All CRUD operations</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">Portfolio Manager</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Property management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Financial oversight</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Limited staff management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>No system admin</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">Staff Role</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Task management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Guest services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Basic financial view</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>No financial edit</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">Owner Role</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Own properties view</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Financial reports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Payout requests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>No management access</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Total Platform Modules Coverage</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.keys(MODULE_PERMISSIONS).map(category => (
                      <div key={category} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{category}</div>
                        <div className="text-xs text-gray-600">
                          {Object.keys(MODULE_PERMISSIONS[category as keyof typeof MODULE_PERMISSIONS]).length} modules
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                User Access & Visibility Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Dashboard Access</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Admin Dashboard</span>
                        <Badge className="bg-red-100 text-red-800">Admin Only</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Financial Dashboard</span>
                        <Badge className="bg-blue-100 text-blue-800">Admin/PM</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Staff Dashboard</span>
                        <Badge className="bg-green-100 text-green-800">Staff</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Feature Access</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>User Management</span>
                        <Badge className="bg-red-100 text-red-800">Admin Only</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Property CRUD</span>
                        <Badge className="bg-blue-100 text-blue-800">Admin/PM</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Task Creation</span>
                        <Badge className="bg-green-100 text-green-800">All Staff</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Data Visibility</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>All Properties</span>
                        <Badge className="bg-red-100 text-red-800">Admin</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Assigned Properties</span>
                        <Badge className="bg-blue-100 text-blue-800">PM/Staff</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Own Properties</span>
                        <Badge className="bg-purple-100 text-purple-800">Owner</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Access Control Matrix</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Feature</th>
                          <th className="text-center p-2">Admin</th>
                          <th className="text-center p-2">PM</th>
                          <th className="text-center p-2">Staff</th>
                          <th className="text-center p-2">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">User Management</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Financial Reports</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-yellow-600">Limited</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Property Management</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-yellow-600">Limited</td>
                          <td className="text-center p-2 text-yellow-600">View Only</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Property Visibility Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Property Assignment</h4>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Villa Samui Breeze</span>
                          <Badge className="bg-blue-100 text-blue-800">PM: Jane</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Owner: Alice Owner</p>
                          <p>Staff Access: Bob Staff, Carol Manager</p>
                        </div>
                      </div>
                      
                      <div className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Villa Aruna</span>
                          <Badge className="bg-blue-100 text-blue-800">PM: Jane</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Owner: Alice Owner</p>
                          <p>Staff Access: Bob Staff</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Visibility Rules</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Admin Global Access</p>
                          <p className="text-sm text-gray-600">Can view all properties</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">PM Property Assignment</p>
                          <p className="text-sm text-gray-600">Only assigned properties</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Owner Property Restriction</p>
                          <p className="text-sm text-gray-600">Only owned properties</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Current Property Access Matrix</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Property</th>
                          <th className="text-center p-2">Admin</th>
                          <th className="text-center p-2">PM Jane</th>
                          <th className="text-center p-2">Staff Bob</th>
                          <th className="text-center p-2">Owner Alice</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">Villa Samui Breeze</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Villa Aruna</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Villa Paradise</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}