import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Eye, 
  Settings, 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Edit,
  UserCheck,
  Building,
  Crown,
  Lock,
  Unlock,
  Save,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyAccessControl {
  id: number;
  userId: string;
  propertyId: number;
  canView: boolean;
  canManage: boolean;
  canReceiveTasks: boolean;
  hasFinancialAccess: boolean;
  hasMaintenanceAccess: boolean;
  hasGuestBookingAccess: boolean;
  hasUtilitiesAccess: boolean;
  hasPropertyInfoAccess: boolean;
  hasServiceOrderAccess: boolean;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  propertyName?: string;
}

interface PropertyVisibilityMatrix {
  id: number;
  userId: string;
  propertiesLinked: string; // JSON string
  accessLevel: string;
  lastUpdated: string;
  hasFullAccess: boolean;
  hasRestrictedAccess: boolean;
  requiresReview: boolean;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  lastLoginAt?: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  primaryRole: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export default function PropertyVisibilityControl() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [accessSettings, setAccessSettings] = useState({
    canView: false,
    canManage: false,
    canReceiveTasks: false,
    hasFinancialAccess: true,
    hasMaintenanceAccess: true,
    hasGuestBookingAccess: true,
    hasUtilitiesAccess: true,
    hasPropertyInfoAccess: true,
    hasServiceOrderAccess: true,
  });

  // Fetch visibility matrix data (using demo data for now)
  const { data: visibilityMatrix = [], isLoading: isLoadingMatrix } = useQuery({
    queryKey: ["/api/property-visibility/demo/visibility-matrix"],
  });

  // Fetch property access data (using demo data for now)
  const { data: accessMatrix = [], isLoading: isLoadingAccess } = useQuery({
    queryKey: ["/api/property-visibility/demo/access-matrix"],
  });

  // Fetch properties
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/user-management/users"],
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ userId, propertyIds, accessData }: { 
      userId: string; 
      propertyIds: number[]; 
      accessData: any;
    }) => {
      const response = await fetch(`/api/property-visibility/users/${userId}/bulk-access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyIds, accessData }),
      });
      if (!response.ok) throw new Error("Failed to update access");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-visibility"] });
      toast({ title: "Access Updated", description: "Property access has been updated successfully." });
      setIsEditDialogOpen(false);
      setEditingUserId(null);
    },
    onError: () => {
      toast({ 
        title: "Update Failed", 
        description: "Failed to update property access.", 
        variant: "destructive" 
      });
    },
  });

  // Filter visibility matrix based on search and filters
  const filteredMatrix = visibilityMatrix.filter((user: PropertyVisibilityMatrix) => {
    const matchesSearch = user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.userRole === selectedRole;
    const matchesAccessLevel = selectedAccessLevel === "all" || user.accessLevel === selectedAccessLevel;
    
    return matchesSearch && matchesRole && matchesAccessLevel;
  });

  // Handle edit access for a user
  const handleEditAccess = (userId: string) => {
    setEditingUserId(userId);
    
    // Get current access for this user
    const userAccess = accessMatrix.filter((access: PropertyAccessControl) => access.userId === userId);
    
    if (userAccess.length > 0) {
      const firstAccess = userAccess[0];
      setAccessSettings({
        canView: firstAccess.canView,
        canManage: firstAccess.canManage,
        canReceiveTasks: firstAccess.canReceiveTasks,
        hasFinancialAccess: firstAccess.hasFinancialAccess,
        hasMaintenanceAccess: firstAccess.hasMaintenanceAccess,
        hasGuestBookingAccess: firstAccess.hasGuestBookingAccess,
        hasUtilitiesAccess: firstAccess.hasUtilitiesAccess,
        hasPropertyInfoAccess: firstAccess.hasPropertyInfoAccess,
        hasServiceOrderAccess: firstAccess.hasServiceOrderAccess,
      });
      
      // Set selected properties
      setSelectedProperties(userAccess.map(access => access.propertyId));
    } else {
      // Reset to defaults
      setAccessSettings({
        canView: false,
        canManage: false,
        canReceiveTasks: false,
        hasFinancialAccess: true,
        hasMaintenanceAccess: true,
        hasGuestBookingAccess: true,
        hasUtilitiesAccess: true,
        hasPropertyInfoAccess: true,
        hasServiceOrderAccess: true,
      });
      setSelectedProperties([]);
    }
    
    setIsEditDialogOpen(true);
  };

  // Handle save access changes
  const handleSaveAccess = () => {
    if (!editingUserId || selectedProperties.length === 0) {
      toast({ 
        title: "Validation Error", 
        description: "Please select at least one property.", 
        variant: "destructive" 
      });
      return;
    }

    bulkUpdateMutation.mutate({
      userId: editingUserId,
      propertyIds: selectedProperties,
      accessData: accessSettings,
    });
  };

  // Get property names for a user
  const getPropertyNames = (propertiesLinked: string) => {
    try {
      const propertyIds = JSON.parse(propertiesLinked) as number[];
      return propertyIds.map(id => {
        const property = properties.find(p => p.id === id);
        return property?.name || `Property ${id}`;
      }).join(", ");
    } catch {
      return "No properties";
    }
  };

  // Get access level badge
  const getAccessLevelBadge = (level: string, hasRestricted: boolean) => {
    if (level === "full" && !hasRestricted) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Full Access</Badge>;
    } else if (level === "partial" || hasRestricted) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Partial Access</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Read Only</Badge>;
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { icon: Crown, color: "bg-purple-100 text-purple-800 border-purple-300" },
      "portfolio-manager": { icon: Building, color: "bg-blue-100 text-blue-800 border-blue-300" },
      owner: { icon: Key, color: "bg-green-100 text-green-800 border-green-300" },
      staff: { icon: Users, color: "bg-gray-100 text-gray-800 border-gray-300" },
      "retail-agent": { icon: UserCheck, color: "bg-orange-100 text-orange-800 border-orange-300" },
      "referral-agent": { icon: UserCheck, color: "bg-pink-100 text-pink-800 border-pink-300" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.staff;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {role.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Visibility Control</h1>
          <p className="text-muted-foreground">
            Manage granular property access permissions and user visibility controls
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync Permissions
        </Button>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visibility Matrix
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Visibility Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role Filter</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-40">
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="access">Access Level</Label>
                  <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="full">Full Access</SelectItem>
                      <SelectItem value="partial">Partial Access</SelectItem>
                      <SelectItem value="read-only">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Matrix Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Access Matrix
              </CardTitle>
              <CardDescription>
                Overview of user property access levels and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMatrix ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Properties Linked</TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMatrix.map((user: PropertyVisibilityMatrix) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.userName}</div>
                              <div className="text-sm text-muted-foreground">{user.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(user.userRole || "")}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {getPropertyNames(user.propertiesLinked)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAccessLevelBadge(user.accessLevel, user.hasRestrictedAccess)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {user.lastLoginAt 
                                  ? new Date(user.lastLoginAt).toLocaleDateString()
                                  : "Never"
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAccess(user.userId)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit Access
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View As User
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Detailed Access Control
              </CardTitle>
              <CardDescription>
                Granular property access permissions by user and property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccess ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Manage</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Financial</TableHead>
                        <TableHead>Maintenance</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Utilities</TableHead>
                        <TableHead>Services</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessMatrix.map((access: PropertyAccessControl) => (
                        <TableRow key={`${access.userId}-${access.propertyId}`}>
                          <TableCell>
                            <div className="text-sm font-medium">{access.userName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{access.propertyName}</div>
                          </TableCell>
                          <TableCell>
                            {access.canView ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {access.canManage ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {access.canReceiveTasks ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {access.hasFinancialAccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {access.hasMaintenanceAccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {access.hasGuestBookingAccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {access.hasUtilitiesAccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {access.hasServiceOrderAccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Access Templates
              </CardTitle>
              <CardDescription>
                Pre-configured permission templates for different roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Owner Default</CardTitle>
                    <CardDescription>Standard permissions for property owners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Full property management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Financial access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-500" />
                        <span className="text-sm">No task assignments</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Staff Standard</CardTitle>
                    <CardDescription>Standard permissions for staff members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">View properties</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Receive tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Limited financial access</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Access Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Property Access</DialogTitle>
            <DialogDescription>
              Configure property access and permissions for this user
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Property Selection */}
              <div>
                <Label className="text-base font-medium">Property Selection</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {properties.map((property) => (
                    <div key={property.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${property.id}`}
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProperties([...selectedProperties, property.id]);
                          } else {
                            setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`property-${property.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {property.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Access Levels */}
              <div>
                <Label className="text-base font-medium">Access Levels</Label>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canView">Can View Properties</Label>
                      <p className="text-sm text-muted-foreground">Basic read access to property information</p>
                    </div>
                    <Switch
                      id="canView"
                      checked={accessSettings.canView}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, canView: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canManage">Can Manage Properties</Label>
                      <p className="text-sm text-muted-foreground">Edit property details and settings</p>
                    </div>
                    <Switch
                      id="canManage"
                      checked={accessSettings.canManage}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, canManage: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canReceiveTasks">Can Receive Tasks</Label>
                      <p className="text-sm text-muted-foreground">Be assigned tasks for these properties</p>
                    </div>
                    <Switch
                      id="canReceiveTasks"
                      checked={accessSettings.canReceiveTasks}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, canReceiveTasks: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Module Permissions */}
              <div>
                <Label className="text-base font-medium">Module Permissions</Label>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hasFinancialAccess">Financial Access</Label>
                      <p className="text-sm text-muted-foreground">View revenue, costs, and financial reports</p>
                    </div>
                    <Switch
                      id="hasFinancialAccess"
                      checked={accessSettings.hasFinancialAccess}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, hasFinancialAccess: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hasMaintenanceAccess">Maintenance Access</Label>
                      <p className="text-sm text-muted-foreground">Access maintenance logs and requests</p>
                    </div>
                    <Switch
                      id="hasMaintenanceAccess"
                      checked={accessSettings.hasMaintenanceAccess}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, hasMaintenanceAccess: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hasGuestBookingAccess">Guest Booking Access</Label>
                      <p className="text-sm text-muted-foreground">View and manage guest bookings</p>
                    </div>
                    <Switch
                      id="hasGuestBookingAccess"
                      checked={accessSettings.hasGuestBookingAccess}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, hasGuestBookingAccess: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hasUtilitiesAccess">Utilities Access</Label>
                      <p className="text-sm text-muted-foreground">Access utility bills and settings</p>
                    </div>
                    <Switch
                      id="hasUtilitiesAccess"
                      checked={accessSettings.hasUtilitiesAccess}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, hasUtilitiesAccess: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hasPropertyInfoAccess">Property Info Access</Label>
                      <p className="text-sm text-muted-foreground">Access property details and amenities</p>
                    </div>
                    <Switch
                      id="hasPropertyInfoAccess"
                      checked={accessSettings.hasPropertyInfoAccess}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, hasPropertyInfoAccess: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hasServiceOrderAccess">Service Order Access</Label>
                      <p className="text-sm text-muted-foreground">Manage add-on services and orders</p>
                    </div>
                    <Switch
                      id="hasServiceOrderAccess"
                      checked={accessSettings.hasServiceOrderAccess}
                      onCheckedChange={(checked) => 
                        setAccessSettings({ ...accessSettings, hasServiceOrderAccess: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAccess}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}