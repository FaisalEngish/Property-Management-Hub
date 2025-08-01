import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    department: "",
    priority: "medium",
    propertyId: "",
    dueDate: "",
    estimatedCost: "",
    isRecurring: false,
    recurringType: "",
    recurringInterval: "1",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Check staff permissions for task creation
  const { data: taskPermissionCheck } = useQuery({
    queryKey: ["/api/staff/can-create-tasks"],
    enabled: (user as any)?.role === 'staff',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/can-create-tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        type: "",
        department: "",
        priority: "medium",
        propertyId: "",
        dueDate: "",
        estimatedCost: "",
        isRecurring: false,
        recurringType: "",
        recurringInterval: "1",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check permissions for staff users
    if ((user as any)?.role === 'staff' && !taskPermissionCheck?.canCreateTasks) {
      toast({
        title: "Permission Denied",
        description: taskPermissionCheck?.reason || "You do not have permission to create tasks",
        variant: "destructive",
      });
      return;
    }
    
    const data = {
      organizationId: "default-org", // Add organizationId 
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      department: formData.department || null,
      priority: formData.priority,
      propertyId: formData.propertyId ? parseInt(formData.propertyId) : null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
      isRecurring: formData.isRecurring || false,
      recurringType: formData.isRecurring ? formData.recurringType : null,
      recurringInterval: formData.isRecurring ? parseInt(formData.recurringInterval) : null,
    };

    createMutation.mutate(data);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        {/* Permission Warning for Staff */}
        {(user as any)?.role === 'staff' && !taskPermissionCheck?.canCreateTasks && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Permission Required:</strong> You need permission from an administrator to create tasks.
              {taskPermissionCheck?.reason && ` Reason: ${taskPermissionCheck.reason}`}
              <br />
              <span className="text-sm">Contact your administrator to request task creation permissions.</span>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Daily Limit Warning for Staff */}
        {(user as any)?.role === 'staff' && taskPermissionCheck?.hasPermission && !taskPermissionCheck?.withinDailyLimit && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Daily Limit Reached:</strong> You have reached your daily task creation limit of {taskPermissionCheck.maxTasksPerDay} tasks.
              <br />
              <span className="text-sm">Try again tomorrow or contact your administrator for additional permissions.</span>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Task Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="pool-service">Pool Service</SelectItem>
                  <SelectItem value="garden">Garden</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="pool">Pool Services</SelectItem>
                  <SelectItem value="guest-services">Guest Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the task..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyId">Property</Label>
              <Select value={formData.propertyId} onValueChange={(value) => handleChange("propertyId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(properties) ? properties.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  )) : []}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => handleChange("estimatedCost", e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange("isRecurring", e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isRecurring">Recurring Task</Label>
            </div>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="recurringType">Recurrence Pattern</Label>
                <Select value={formData.recurringType} onValueChange={(value) => handleChange("recurringType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recurringInterval">Every</Label>
                <Input
                  id="recurringInterval"
                  type="number"
                  min="1"
                  value={formData.recurringInterval}
                  onChange={(e) => handleChange("recurringInterval", e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
          )}



          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                createMutation.isPending || 
                ((user as any)?.role === 'staff' && !taskPermissionCheck?.canCreateTasks)
              }
            >
              {createMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
