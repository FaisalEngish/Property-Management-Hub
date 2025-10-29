import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Edit, Trash2, Loader2, Clock, Bell, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface Automation {
  id: number;
  organizationId: string;
  name: string;
  description?: string;
  trigger: string;
  triggerCondition?: any;
  action: string;
  actionConfig?: any;
  schedule?: string;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AutomationAlerts() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "",
    action: "",
    schedule: "",
  });

  // Fetch automations
  const { data: automations = [], isLoading } = useQuery<Automation[]>({
    queryKey: ["/api/automations"],
    refetchOnWindowFocus: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Create automation mutation
  const createAutomationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/automations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Automation Created",
        description: "Your automation rule has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create automation",
        variant: "destructive",
      });
    }
  });

  // Update automation mutation
  const updateAutomationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/automations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      setIsEditDialogOpen(false);
      setSelectedAutomation(null);
      resetForm();
      toast({
        title: "Automation Updated",
        description: "Your automation rule has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update automation",
        variant: "destructive",
      });
    }
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/automations/${id}/toggle`, { isActive });
    },
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/automations"] });
      
      // Snapshot the previous value
      const previousAutomations = queryClient.getQueryData(["/api/automations"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["/api/automations"], (old: any) => {
        if (!old) return old;
        return old.map((automation: Automation) => 
          automation.id === id ? { ...automation, isActive } : automation
        );
      });
      
      // Return a context object with the snapshotted value
      return { previousAutomations };
    },
    onSuccess: (updatedAutomation: Automation) => {
      // Update cache with the actual server response
      queryClient.setQueryData(["/api/automations"], (old: any) => {
        if (!old) return old;
        return old.map((automation: Automation) => 
          automation.id === updatedAutomation.id ? updatedAutomation : automation
        );
      });
      toast({
        title: "Automation Updated",
        description: "Automation status has been updated",
      });
    },
    onError: (error: any, variables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["/api/automations"], context?.previousAutomations);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle automation",
        variant: "destructive",
      });
    }
  });

  // Delete automation mutation
  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Automation Deleted",
        description: "Automation rule has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete automation",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      trigger: "",
      action: "",
      schedule: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.trigger || !formData.action) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createAutomationMutation.mutate(formData);
  };

  const handleEdit = (automation: Automation) => {
    setSelectedAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description || "",
      trigger: automation.trigger,
      action: automation.action,
      schedule: automation.schedule || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedAutomation) return;

    updateAutomationMutation.mutate({
      id: selectedAutomation.id,
      data: formData
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      deleteAutomationMutation.mutate(id);
    }
  };

  const handleToggle = (id: number, isActive: boolean) => {
    toggleAutomationMutation.mutate({ id, isActive });
  };

  const triggerTypes = [
    { value: "booking_due", label: "Booking Check-in Due", icon: Clock },
    { value: "task_overdue", label: "Task Overdue", icon: Bell },
    { value: "payment_pending", label: "Payment Pending", icon: Mail },
    { value: "utility_threshold", label: "Utility Threshold Exceeded", icon: Zap },
  ];

  const actionTypes = [
    { value: "send_email", label: "Send Email", icon: Mail },
    { value: "send_sms", label: "Send SMS", icon: MessageSquare },
    { value: "create_task", label: "Create Task", icon: CheckCircle2 },
    { value: "send_notification", label: "Send Notification", icon: Bell },
  ];

  const getTriggerIcon = (trigger: string) => {
    const triggerType = triggerTypes.find(t => t.value === trigger);
    const Icon = triggerType?.icon || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getActionIcon = (action: string) => {
    const actionType = actionTypes.find(a => a.value === action);
    const Icon = actionType?.icon || Bell;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-automation">
            Automation & Alerts
          </h1>
          <p className="text-muted-foreground">
            Smart reminders, AI insights, and automated property management workflows
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-automation">
              <Plus className="mr-2 h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Automation</DialogTitle>
              <DialogDescription>
                Set up a new automation rule for your property management
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Send check-in reminder"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-automation-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this automation does"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-automation-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger *</Label>
                <Select value={formData.trigger} onValueChange={(value) => setFormData({ ...formData, trigger: value })}>
                  <SelectTrigger data-testid="select-trigger">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action *</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                  <SelectTrigger data-testid="select-action">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Optional)</Label>
                <Input
                  id="schedule"
                  placeholder="e.g., daily, weekly, or cron expression"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  data-testid="input-schedule"
                />
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={createAutomationMutation.isPending} data-testid="button-submit-create">
                {createAutomationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Automation"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {automations.filter(a => a.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">
              {automations.filter(a => !a.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.reduce((sum, a) => sum + a.triggerCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
          <CardDescription>
            Manage your automated workflows and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : automations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No automation rules created yet</p>
              <p className="text-sm">Create your first automation to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Triggered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((automation) => (
                  <TableRow key={automation.id} data-testid={`row-automation-${automation.id}`}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{automation.name}</div>
                        {automation.description && (
                          <div className="text-sm text-muted-foreground">{automation.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTriggerIcon(automation.trigger)}
                        <span className="text-sm">
                          {triggerTypes.find(t => t.value === automation.trigger)?.label || automation.trigger}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(automation.action)}
                        <span className="text-sm">
                          {actionTypes.find(a => a.value === automation.action)?.label || automation.action}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{automation.triggerCount} times</div>
                        {automation.lastTriggered && (
                          <div className="text-muted-foreground">
                            Last: {format(new Date(automation.lastTriggered), 'MMM dd, HH:mm')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={automation.isActive}
                          onCheckedChange={(checked) => handleToggle(automation.id, checked)}
                          data-testid={`switch-active-${automation.id}`}
                        />
                        <Badge variant={automation.isActive ? "default" : "secondary"}>
                          {automation.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(automation)}
                        data-testid={`button-edit-${automation.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(automation.id)}
                        data-testid={`button-delete-${automation.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Automation</DialogTitle>
            <DialogDescription>
              Update your automation rule settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-edit-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-trigger">Trigger *</Label>
              <Select value={formData.trigger} onValueChange={(value) => setFormData({ ...formData, trigger: value })}>
                <SelectTrigger data-testid="select-edit-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-action">Action *</Label>
              <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                <SelectTrigger data-testid="select-edit-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-schedule">Schedule (Optional)</Label>
              <Input
                id="edit-schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                data-testid="input-edit-schedule"
              />
            </div>

            <Button onClick={handleUpdate} className="w-full" disabled={updateAutomationMutation.isPending} data-testid="button-submit-update">
              {updateAutomationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Automation"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

}
