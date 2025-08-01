import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Users, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  Copy,
  Calendar,
  Building,
  ClipboardList,
  DollarSign,
  FileText,
  Wrench,
  LogIn,
  UserCheck,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Types for role management
interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isCustom: boolean;
  permissions: RolePermissions;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RolePermissions {
  [moduleKey: string]: {
    visible: boolean;
    access: 'read' | 'write' | 'admin';
    description: string;
  };
}

interface ModuleDefinition {
  key: string;
  name: string;
  description: string;
  icon: any;
  category: 'core' | 'property' | 'financial' | 'guest' | 'operations';
  defaultRoles: string[];
}

// Form schemas
const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().min(1, "Description is required"),
  cloneFromRole: z.string().optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

// Module definitions
const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // Core modules
  { key: 'dashboard', name: 'Dashboard', description: 'Main dashboard access', icon: Building, category: 'core', defaultRoles: ['admin', 'portfolio-manager', 'owner', 'staff'] },
  { key: 'user-management', name: 'User Management', description: 'Manage users and roles', icon: Users, category: 'core', defaultRoles: ['admin'] },
  { key: 'settings', name: 'Settings', description: 'System and account settings', icon: Settings, category: 'core', defaultRoles: ['admin', 'portfolio-manager'] },
  
  // Property modules
  { key: 'properties', name: 'Properties', description: 'Property management and details', icon: Building, category: 'property', defaultRoles: ['admin', 'portfolio-manager', 'owner', 'staff'] },
  { key: 'maintenance', name: 'Maintenance', description: 'Maintenance tracking and requests', icon: Wrench, category: 'property', defaultRoles: ['admin', 'portfolio-manager', 'staff'] },
  { key: 'utilities', name: 'Utilities', description: 'Utility billing and management', icon: Settings, category: 'property', defaultRoles: ['admin', 'portfolio-manager', 'owner'] },
  { key: 'documents', name: 'Documents', description: 'Document storage and management', icon: FileText, category: 'property', defaultRoles: ['admin', 'portfolio-manager', 'owner'] },
  
  // Guest modules
  { key: 'checkin-checkout', name: 'Check-in/Check-out', description: 'Guest arrival and departure', icon: LogIn, category: 'guest', defaultRoles: ['admin', 'portfolio-manager', 'staff'] },
  { key: 'guest-info', name: 'Guest Information', description: 'Guest profiles and preferences', icon: UserCheck, category: 'guest', defaultRoles: ['admin', 'portfolio-manager', 'staff'] },
  { key: 'booking', name: 'Booking Management', description: 'Reservation and booking system', icon: BookOpen, category: 'guest', defaultRoles: ['admin', 'portfolio-manager', 'retail-agent', 'referral-agent'] },
  
  // Financial modules
  { key: 'finances', name: 'Financial Management', description: 'Revenue, expenses, and reporting', icon: DollarSign, category: 'financial', defaultRoles: ['admin', 'portfolio-manager', 'owner'] },
  { key: 'invoices', name: 'Invoices', description: 'Invoice generation and management', icon: FileText, category: 'financial', defaultRoles: ['admin', 'portfolio-manager'] },
  { key: 'commissions', name: 'Commissions', description: 'Agent commission tracking', icon: DollarSign, category: 'financial', defaultRoles: ['admin', 'portfolio-manager', 'retail-agent', 'referral-agent'] },
  
  // Operations modules
  { key: 'tasks', name: 'Task Management', description: 'Task creation and tracking', icon: ClipboardList, category: 'operations', defaultRoles: ['admin', 'portfolio-manager', 'staff'] },
  { key: 'services', name: 'Service Scheduling', description: 'Service provider scheduling', icon: Calendar, category: 'operations', defaultRoles: ['admin', 'portfolio-manager', 'staff'] },
  { key: 'timeline', name: 'Timeline Tracking', description: 'Property timeline and history', icon: Clock, category: 'operations', defaultRoles: ['admin', 'portfolio-manager'] },
];

// Predefined roles
const PREDEFINED_ROLES = [
  { id: 'admin', name: 'admin', displayName: 'Administrator', description: 'Full system access and control' },
  { id: 'portfolio-manager', name: 'portfolio-manager', displayName: 'Portfolio Manager', description: 'Manages property portfolios and commissions' },
  { id: 'owner', name: 'owner', displayName: 'Property Owner', description: 'Owns properties and receives financial reports' },
  { id: 'staff', name: 'staff', displayName: 'Staff Member', description: 'Handles day-to-day operations and tasks' },
  { id: 'retail-agent', name: 'retail-agent', displayName: 'Retail Agent', description: 'Sells bookings and earns commissions' },
  { id: 'referral-agent', name: 'referral-agent', displayName: 'Referral Agent', description: 'Refers guests and earns commissions' },
  { id: 'electrician', name: 'electrician', displayName: 'Electrician', description: 'Electrical maintenance and repairs' },
  { id: 'pest-control', name: 'pest-control', displayName: 'Pest Control', description: 'Pest management services' },
  { id: 'plumber', name: 'plumber', displayName: 'Plumber', description: 'Plumbing maintenance and repairs' },
  { id: 'chef', name: 'chef', displayName: 'Private Chef', description: 'Cooking and meal preparation services' },
  { id: 'nanny', name: 'nanny', displayName: 'Nanny/Babysitter', description: 'Childcare services for guests' },
];

export default function UserAccessVisibilityControls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core']));

  // Form for creating new roles
  const createRoleForm = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      cloneFromRole: "",
    },
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading } = useQuery({
    queryKey: ["/api/admin/role-permissions"],
    retry: false,
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ roleId, moduleKey, updates }: { 
      roleId: string; 
      moduleKey: string; 
      updates: Partial<RolePermissions[string]> 
    }) => {
      return apiRequest("PATCH", `/api/admin/role-permissions/${roleId}/${moduleKey}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-permissions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive",
      });
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleFormData) => {
      return apiRequest("POST", "/api/admin/roles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-permissions"] });
      setShowCreateDialog(false);
      createRoleForm.reset();
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Handle permission toggle
  const handlePermissionToggle = (roleId: string, moduleKey: string, visible: boolean) => {
    updatePermissionMutation.mutate({
      roleId,
      moduleKey,
      updates: { visible }
    });
  };

  // Handle access level change
  const handleAccessLevelChange = (roleId: string, moduleKey: string, access: 'read' | 'write' | 'admin') => {
    updatePermissionMutation.mutate({
      roleId,
      moduleKey,
      updates: { access }
    });
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return Settings;
      case 'property': return Building;
      case 'financial': return DollarSign;
      case 'guest': return UserCheck;
      case 'operations': return ClipboardList;
      default: return Settings;
    }
  };

  // Get access level badge
  const getAccessBadge = (access: string) => {
    switch (access) {
      case 'read':
        return <Badge variant="secondary">Read Only</Badge>;
      case 'write':
        return <Badge variant="default">Read/Write</Badge>;
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  // Submit create role form
  const onCreateRoleSubmit = (data: CreateRoleFormData) => {
    createRoleMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const groupedModules = MODULE_DEFINITIONS.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleDefinition[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Access & Visibility Controls</h1>
          <p className="text-muted-foreground">
            Manage user roles and module access permissions across the platform
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new user role with custom permissions
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createRoleForm}>
              <form onSubmit={createRoleForm.handleSubmit(onCreateRoleSubmit)} className="space-y-4">
                <FormField
                  control={createRoleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name (ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., custom-agent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createRoleForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Custom Agent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createRoleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe this role's purpose and responsibilities" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createRoleForm.control}
                  name="cloneFromRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clone Permissions From (Optional)</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Start with blank permissions" />
                          </SelectTrigger>
                          <SelectContent>
                            {PREDEFINED_ROLES.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRoleMutation.isPending}>
                    {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Role to Configure</CardTitle>
          <CardDescription>Choose a role to view and modify its permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {PREDEFINED_ROLES.map((role) => (
              <Button
                key={role.id}
                variant={selectedRole === role.id ? "default" : "outline"}
                className="h-20 flex-col justify-center"
                onClick={() => setSelectedRole(role.id)}
              >
                <Shield className="h-5 w-5 mb-2" />
                <span className="text-sm font-medium">{role.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {rolePermissions?.[role.id]?.userCount || 0} users
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Permissions Grid */}
      <div className="space-y-4">
        {Object.entries(groupedModules).map(([category, modules]) => {
          const CategoryIcon = getCategoryIcon(category);
          const isExpanded = expandedCategories.has(category);
          
          return (
            <Card key={category}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-5 w-5" />
                    <CardTitle className="capitalize">{category} Modules</CardTitle>
                  </div>
                  {isExpanded ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    {modules.map((module) => {
                      const ModuleIcon = module.icon;
                      const rolePermission = rolePermissions?.[selectedRole]?.permissions?.[module.key];
                      
                      return (
                        <div key={module.key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <ModuleIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{module.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {module.description}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {/* Access Level */}
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Access:</Label>
                              <Select
                                value={rolePermission?.access || 'read'}
                                onValueChange={(value: 'read' | 'write' | 'admin') => 
                                  handleAccessLevelChange(selectedRole, module.key, value)
                                }
                                disabled={!rolePermission?.visible}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="read">Read Only</SelectItem>
                                  <SelectItem value="write">Read/Write</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Visibility Toggle */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <Label className="text-sm">Visible:</Label>
                                  <Switch
                                    checked={rolePermission?.visible || false}
                                    onCheckedChange={(checked) => 
                                      handlePermissionToggle(selectedRole, module.key, checked)
                                    }
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Toggle module visibility for this role</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Freelancer Availability Section (for freelancer roles) */}
      {['electrician', 'pest-control', 'plumber', 'chef', 'nanny'].includes(selectedRole) && (
        <Card>
          <CardHeader>
            <CardTitle>Freelancer Settings</CardTitle>
            <CardDescription>Configure availability and job acceptance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Accept New Jobs</div>
                <div className="text-sm text-muted-foreground">
                  Allow new job assignments and bookings
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Availability Calendar</div>
                <div className="text-sm text-muted-foreground">
                  Manage blocked dates and available time slots
                </div>
              </div>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Calendar
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Auto-Accept Rules</div>
                <div className="text-sm text-muted-foreground">
                  Automatically accept jobs based on criteria
                </div>
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Role Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Role Summary</CardTitle>
          <CardDescription>
            Overview of {PREDEFINED_ROLES.find(r => r.id === selectedRole)?.displayName} permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(rolePermissions?.[selectedRole]?.permissions || {})
                  .filter(p => p.visible).length}
              </div>
              <div className="text-sm text-muted-foreground">Visible Modules</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(rolePermissions?.[selectedRole]?.permissions || {})
                  .filter(p => p.visible && p.access === 'write').length}
              </div>
              <div className="text-sm text-muted-foreground">Write Access</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(rolePermissions?.[selectedRole]?.permissions || {})
                  .filter(p => p.visible && p.access === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">Admin Access</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}