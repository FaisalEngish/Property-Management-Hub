import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

import TopBar from "@/components/TopBar";
import TaskTable from "@/components/TaskTable";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle, Shield } from "lucide-react";
import GlobalFilters, { useGlobalFilters, applyGlobalFilters } from "@/components/GlobalFilters";

// [MERGED] This module has been consolidated into MaintenanceTaskSystem.tsx
// Basic task functionality is now available in the comprehensive task management system
export default function Tasks() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [globalFilters, setGlobalFilters] = useGlobalFilters("tasks-filters");
  const { user } = useAuth();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Check staff permissions for task creation
  const { data: taskPermissionCheck } = useQuery({
    queryKey: ["/api/staff/can-create-tasks"],
    enabled: (user as any)?.role === 'staff',
  });

  // Apply global filters first, then local filters
  const globalFilteredTasks = applyGlobalFilters(tasks, globalFilters, {
    propertyIdField: "propertyId",
    searchFields: ["title", "description", "type"],
  });

  const filteredTasks = globalFilteredTasks.filter((task: any) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const typeMatch = typeFilter === "all" || task.type === typeFilter;
    return statusMatch && typeMatch;
  });

  return (
    <div className="min-h-screen flex bg-background">

      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar 
          title="Task Management" 
          action={
            (user as any)?.role !== 'staff' || taskPermissionCheck?.canCreateTasks ? (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            ) : (
              <Button 
                variant="outline" 
                disabled
                className="text-gray-400 border-gray-300"
              >
                <Shield className="w-4 h-4 mr-2" />
                Permission Required
              </Button>
            )
          }
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Permission Warning for Staff */}
          {(user as any)?.role === 'staff' && !taskPermissionCheck?.canCreateTasks && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Task Creation Restricted:</strong> You need permission from an administrator to create new tasks.
                {taskPermissionCheck?.reason && ` ${taskPermissionCheck.reason}`}
                <br />
                <span className="text-sm">Contact your administrator to request task creation permissions.</span>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Daily Limit Warning for Staff */}
          {(user as any)?.role === 'staff' && taskPermissionCheck?.hasPermission && !taskPermissionCheck?.withinDailyLimit && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Daily Limit Reached:</strong> You have reached your daily task creation limit of {taskPermissionCheck.maxTasksPerDay} tasks.
                <br />
                <span className="text-sm">Try again tomorrow or contact your administrator for additional permissions.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Global Filters */}
          <GlobalFilters
            filters={globalFilters}
            onFiltersChange={setGlobalFilters}
            placeholder="Search tasks..."
            showFilters={{
              property: true,
              owner: true,
              portfolioManager: true,
              area: true,
              bedrooms: false,
              status: false,
              search: true,
            }}
          />
          
          {/* Local Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="pool-service">Pool Service</SelectItem>
                      <SelectItem value="garden">Garden</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">Property</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">Assignee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Table */}
          <TaskTable tasks={filteredTasks} isLoading={isLoading} />
        </main>
      </div>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
