import React, { useState, useEffect } from "react";
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
  const [timeFilter, setTimeFilter] = useState("all"); // New: Time-based filter
  const [globalFilters, setGlobalFilters] = useGlobalFilters("tasks-filters");
  const { user } = useAuth();

  // Handle URL parameters for property filtering and maintenance tasks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('property');
    const filterType = urlParams.get('filter');
    
    if (propertyId) {
      // Set global filters to filter by specific property
      setGlobalFilters(prev => ({
        ...prev,
        propertyFilter: [parseInt(propertyId)]
      }));
    }
    
    if (filterType === 'maintenance') {
      // Set type filter to maintenance tasks
      setTypeFilter('maintenance');
    }
  }, [setGlobalFilters]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
    
    // Time-based filtering
    let timeMatch = true;
    if (timeFilter !== "all" && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      
      if (timeFilter === "today") {
        timeMatch = taskDate >= today && taskDate < tomorrow;
      } else if (timeFilter === "this-week") {
        timeMatch = taskDate >= today && taskDate <= endOfWeek;
      } else if (timeFilter === "upcoming") {
        timeMatch = taskDate > endOfWeek;
      }
    } else if (timeFilter !== "all" && !task.dueDate) {
      timeMatch = false; // Exclude tasks without due dates when time filter is active
    }
    
    return statusMatch && typeMatch && timeMatch;
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
        
        <main className="flex-1 overflow-auto p-3 sm:p-6 overflow-x-hidden">
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
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">Due Date</Label>
                  <Select value={timeFilter} onValueChange={setTimeFilter} data-testid="select-time-filter">
                    <SelectTrigger>
                      <SelectValue placeholder="All Tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="today">Due Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
