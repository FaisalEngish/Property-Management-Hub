import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Users, Shield, Clock, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffPermission {
  id: number;
  organizationId: string;
  staffUserId: string;
  canCreateTasks: boolean;
  canEditOwnTasks: boolean;
  canDeleteOwnTasks: boolean;
  canViewAllTasks: boolean;
  maxTasksPerDay: number;
  allowedDepartments: string[];
  requiresApproval: boolean;
  grantedBy: string;
  reason: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StaffPermissionManagement() {
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all staff permissions
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["/api/admin/staff-permissions"],
  });

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: async (data: {
      staffId: string;
      reason: string;
      departments: string[];
      maxTasksPerDay: number;
      expiresAt?: string;
    }) => {
      return apiRequest(`/api/admin/staff-permissions/${data.staffId}/grant-task-creation`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Permission Granted",
        description: "Task creation permission has been granted to the staff member.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff-permissions"] });
      setIsGrantDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grant permission",
        variant: "destructive",
      });
    },
  });

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: async (data: { staffId: string; reason: string }) => {
      return apiRequest(`/api/admin/staff-permissions/${data.staffId}/revoke-task-creation`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Permission Revoked",
        description: "Task creation permission has been revoked from the staff member.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff-permissions"] });
      setIsRevokeDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke permission",
        variant: "destructive",
      });
    },
  });

  const handleGrantPermission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data = {
      staffId: formData.get("staffId") as string,
      reason: formData.get("reason") as string,
      departments: (formData.get("departments") as string).split(",").map(d => d.trim()),
      maxTasksPerDay: parseInt(formData.get("maxTasksPerDay") as string),
      expiresAt: formData.get("expiresAt") as string || undefined,
    };

    grantPermissionMutation.mutate(data);
  };

  const handleRevokePermission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data = {
      staffId: formData.get("staffId") as string,
      reason: formData.get("reason") as string,
    };

    revokePermissionMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Staff Permission Management</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading staff permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Staff Permission Management</h1>
            <p className="text-gray-600">Manage task creation permissions for staff members</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <UserCheck className="w-4 h-4 mr-2" />
                Grant Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Grant Task Creation Permission</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleGrantPermission} className="space-y-4">
                <div>
                  <Label htmlFor="staffId">Staff User ID</Label>
                  <Input name="staffId" placeholder="staff-pool" required />
                </div>
                <div>
                  <Label htmlFor="reason">Reason for granting permission</Label>
                  <Textarea name="reason" placeholder="e.g., Experienced staff member needs to create maintenance tasks" required />
                </div>
                <div>
                  <Label htmlFor="departments">Allowed Departments (comma-separated)</Label>
                  <Input name="departments" placeholder="cleaning, maintenance, general" defaultValue="general" required />
                </div>
                <div>
                  <Label htmlFor="maxTasksPerDay">Maximum Tasks Per Day</Label>
                  <Input name="maxTasksPerDay" type="number" defaultValue="3" min="1" max="10" required />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
                  <Input name="expiresAt" type="date" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setIsGrantDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={grantPermissionMutation.isPending}>
                    {grantPermissionMutation.isPending ? "Granting..." : "Grant Permission"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <UserX className="w-4 h-4 mr-2" />
                Revoke Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Revoke Task Creation Permission</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRevokePermission} className="space-y-4">
                <div>
                  <Label htmlFor="staffId">Staff User ID</Label>
                  <Input name="staffId" placeholder="staff-pool" required />
                </div>
                <div>
                  <Label htmlFor="reason">Reason for revoking permission</Label>
                  <Textarea name="reason" placeholder="e.g., Staff member no longer needs task creation access" required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setIsRevokeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" disabled={revokePermissionMutation.isPending}>
                    {revokePermissionMutation.isPending ? "Revoking..." : "Revoke Permission"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Permission Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Can Create Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.filter((p: StaffPermission) => p.canCreateTasks && p.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No pending requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Permissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Staff Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No staff permissions configured</p>
              <p className="text-sm">Grant permissions to staff members to allow task creation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {permissions.map((permission: StaffPermission) => (
                <div key={permission.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        permission.canCreateTasks && permission.isActive 
                          ? 'bg-green-100' 
                          : 'bg-gray-100'
                      }`}>
                        {permission.canCreateTasks && permission.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Staff ID: {permission.staffUserId}</div>
                        <div className="text-sm text-gray-600">
                          Max tasks: {permission.maxTasksPerDay}/day • 
                          Departments: {permission.allowedDepartments.join(", ")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Granted by: {permission.grantedBy} • {permission.reason}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={permission.canCreateTasks && permission.isActive ? "default" : "secondary"}>
                        {permission.canCreateTasks && permission.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {permission.expiresAt && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Expires: {new Date(permission.expiresAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <strong>Default Behavior:</strong> Staff members cannot create tasks unless explicitly granted permission by an administrator.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <strong>Daily Limits:</strong> Staff can only create a limited number of tasks per day to prevent system overload.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <strong>Department Restrictions:</strong> Staff can only create tasks for departments they are authorized to work with.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <strong>Approval Process:</strong> Staff-created tasks may require admin approval before being executed.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}