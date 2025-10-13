import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Edit, User } from "lucide-react";

interface TaskTableProps {
  tasks: any[];
  isLoading: boolean;
}

export default function TaskTable({ tasks, isLoading }: TaskTableProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Get current user for achievement checks
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Get staff members for assignee dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/tasks/${id}`, data);
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTask(null);
      setEditForm({});
      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      // Trigger achievement check if task was marked completed or approved
      if ((data.status === 'completed' || data.status === 'approved') && user?.id) {
        try {
          await apiRequest("POST", "/api/achievements/check", { userId: user.id });
          queryClient.invalidateQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
          queryClient.invalidateQueries({ queryKey: ["/api/achievements/definitions"] });
        } catch (error) {
          console.error("Achievement check failed:", error);
        }
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const approveTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/tasks/${id}`, { status: 'approved' });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Approved",
        description: "Task has been approved and can now be started",
      });

      // Trigger achievement check for task approval
      if (user?.id) {
        try {
          await apiRequest("POST", "/api/achievements/check", { userId: user.id });
          queryClient.invalidateQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
          queryClient.invalidateQueries({ queryKey: ["/api/achievements/definitions"] });
        } catch (error) {
          console.error("Achievement check failed:", error);
        }
      }
    },
  });

  const rejectTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/tasks/${id}`, { status: 'rejected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Rejected",
        description: "Task has been rejected",
        variant: "destructive",
      });
    },
  });

  const handleEditTask = (task: any) => {
    console.log("🔧 Edit task clicked:", task.id, task.title);
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
  };

  const handleSaveTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        data: editForm
      });
    }
  };

  const handleAssigneeChange = (taskId: number, assignedTo: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { assignedTo }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const assignedUser = users.find((user: any) => user.id === task.assignedTo);
                  const staffMembers = users.filter((user: any) => user.role === 'staff' || user.role === 'admin');
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-2 w-2 rounded-full mr-3 ${getStatusDot(task.status)}`} />
                          <div>
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-left"
                              data-testid={`button-edit-task-${task.id}`}
                            >
                              {task.title}
                            </button>
                            <div className="text-sm text-gray-500">{task.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        Property {task.propertyId}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 capitalize">
                        {task.type.replace('-', ' ')}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.assignedTo || ''}
                          onValueChange={(value) => handleAssigneeChange(task.id, value)}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-assignee-${task.id}`}>
                            <SelectValue>
                              <div className="flex items-center">
                                <Avatar className="h-5 w-5 mr-2">
                                  <AvatarFallback className="text-xs">
                                    {assignedUser ? assignedUser.firstName?.[0] : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {assignedUser ? assignedUser.firstName : 'Unassigned'}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {staffMembers.map((user: any) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center">
                                  <Avatar className="h-5 w-5 mr-2">
                                    <AvatarFallback className="text-xs">
                                      {user.firstName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.firstName} {user.lastName}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {task.status === 'pending' && (
                            <>
                              <Button 
                                variant="default"
                                size="sm"
                                onClick={() => approveTaskMutation.mutate(task.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => rejectTaskMutation.mutate(task.id)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          
                          {(task.status === 'approved' || task.status === 'in_progress') && task.status !== 'completed' && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                console.log("✅ Complete task clicked:", task.id, task.title);
                                updateTaskMutation.mutate({ id: task.id, data: { status: 'completed' } });
                              }}
                              data-testid={`button-complete-task-${task.id}`}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Task Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editForm.type || ''}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editForm.priority || ''}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={editForm.assignedTo || ''}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, assignedTo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.filter((user: any) => user.role === 'staff' || user.role === 'admin').map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={editForm.dueDate || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} disabled={updateTaskMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
