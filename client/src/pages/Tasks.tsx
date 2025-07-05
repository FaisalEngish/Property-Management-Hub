import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TaskTable from "@/components/TaskTable";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import GlobalFilters, { useGlobalFilters, applyGlobalFilters } from "@/components/GlobalFilters";

// [MERGED] This module has been consolidated into MaintenanceTaskSystem.tsx
// Basic task functionality is now available in the comprehensive task management system
export default function Tasks() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [globalFilters, setGlobalFilters] = useGlobalFilters("tasks-filters");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
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
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar 
          title="Task Management" 
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          }
        />
        
        <main className="flex-1 overflow-auto p-6">
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
