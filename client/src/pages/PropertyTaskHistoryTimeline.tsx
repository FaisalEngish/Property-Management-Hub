import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Filter, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle, Wrench, Palette, Droplets, TreePalm, Home, Building, Search, Calendar, User, Tag, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TASK_TYPES = [
  { id: "all", name: "All Tasks", icon: Home },
  { id: "cleaning", name: "Cleaning", icon: Palette, color: "bg-blue-100 text-blue-700" },
  { id: "maintenance", name: "Maintenance", icon: Wrench, color: "bg-orange-100 text-orange-700" },
  { id: "garden", name: "Garden", icon: TreePalm, color: "bg-green-100 text-green-700" },
  { id: "pool", name: "Pool", icon: Droplets, color: "bg-cyan-100 text-cyan-700" },
  { id: "hosting", name: "Hosting", icon: Home, color: "bg-purple-100 text-purple-700" },
];

const TASK_STATUS = [
  { id: "all", name: "All Status", color: "" },
  { id: "completed", name: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
  { id: "overdue", name: "Overdue", color: "bg-red-100 text-red-700", icon: XCircle },
  { id: "in_progress", name: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  { id: "upcoming", name: "Upcoming", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
];

export default function PropertyTaskHistoryTimeline() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  
  const { toast } = useToast();

  // Check user permissions
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/demo-user"],
    retry: false,
  });

  const userRole = (user as any)?.role;
  const canViewAll = ['admin', 'portfolio-manager'].includes(userRole);
  const canViewOwn = ['owner'].includes(userRole);
  const canViewDepartment = ['staff'].includes(userRole);

  // Fetch properties
  const { data: properties, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  // Fetch task history
  const { data: taskHistory, isLoading: isTaskHistoryLoading } = useQuery({
    queryKey: [
      "/api/property-task-history", 
      selectedProperty, 
      selectedTaskType, 
      selectedStatus,
      dateFrom?.toISOString(),
      dateTo?.toISOString()
    ],
    enabled: !!selectedProperty,
  });

  // Export to PDF/CSV
  const exportData = async (format: "pdf" | "csv") => {
    try {
      const response = await apiRequest("POST", "/api/property-task-history/export", {
        propertyId: selectedProperty,
        taskType: selectedTaskType,
        status: selectedStatus,
        dateFrom: dateFrom?.toISOString(),
        dateTo: dateTo?.toISOString(),
        format,
        searchTerm,
      });
      
      toast({
        title: `Export ${format.toUpperCase()} Generated`,
        description: `Task history has been exported to ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredTasks = (taskHistory as any[])?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const getStatusIcon = (status: string) => {
    const statusInfo = TASK_STATUS.find(s => s.id === status);
    if (statusInfo?.icon) {
      const IconComponent = statusInfo.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getTaskTypeIcon = (type: string) => {
    const typeInfo = TASK_TYPES.find(t => t.id === type);
    if (typeInfo?.icon) {
      const IconComponent = typeInfo.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Home className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const statusInfo = TASK_STATUS.find(s => s.id === status);
    return statusInfo?.color || "bg-gray-100 text-gray-700";
  };

  const getTaskTypeColor = (type: string) => {
    const typeInfo = TASK_TYPES.find(t => t.id === type);
    return typeInfo?.color || "bg-gray-100 text-gray-700";
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canViewAll && !canViewOwn && !canViewDepartment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Task History is not accessible for your user role.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🕓 Task History & Timeline</h1>
          <p className="text-muted-foreground">
            View past and upcoming tasks with filtering and export capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData("csv")}>
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Permission Notice for Staff */}
      {userRole === 'staff' && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Department View</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              You can only view tasks assigned to your department.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
          <CardDescription>Choose a property to view its task history</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProperty?.toString()} onValueChange={(value) => setSelectedProperty(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property..." />
            </SelectTrigger>
            <SelectContent>
              {(properties as any[])?.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name} - {property.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProperty && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Tasks</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by title, description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Task Type</label>
                  <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUS.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">View Mode</label>
                  <Select value={viewMode} onValueChange={(value: "list" | "timeline") => setViewMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="timeline">Timeline View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date From</label>
                  <Input
                    type="date"
                    value={dateFrom?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date To</label>
                  <Input
                    type="date"
                    value={dateTo?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {TASK_STATUS.filter(s => s.id !== 'all').map((status) => {
              const count = filteredTasks.filter(task => task.status === status.id).length;
              const StatusIcon = status.icon;
              
              return (
                <Card key={status.id}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${status.color} flex items-center justify-center mx-auto mb-2`}>
                      <StatusIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">{status.name}</h3>
                    <p className="text-2xl font-bold text-primary">{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Task History Content */}
          <Tabs value={viewMode} onValueChange={(value: "list" | "timeline") => setViewMode(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>

            {/* List View */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Task History
                  </CardTitle>
                  <CardDescription>
                    {filteredTasks.length} tasks found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTaskHistoryLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Tasks Found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or date range.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${getTaskTypeColor(task.type)}`}>
                              {getTaskTypeIcon(task.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{task.title}</h3>
                                <Badge className={getStatusColor(task.status)}>
                                  {getStatusIcon(task.status)}
                                  <span className="ml-1">{task.status.replace('_', ' ')}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{task.assignedTo}</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(task.dueDate || task.createdAt).toLocaleDateString()}</span>
                                {task.completedAt && (
                                  <>
                                    <span>•</span>
                                    <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              )}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.map((tag: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      <Tag className="h-2 w-2 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.evidencePhotos && task.evidencePhotos.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                📷 {task.evidencePhotos.length} photos
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline View */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline View
                  </CardTitle>
                  <CardDescription>
                    Chronological task timeline with accountability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTaskHistoryLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Timeline Data</h3>
                      <p className="text-muted-foreground">
                        No tasks match your current filters.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      <div className="space-y-6">
                        {filteredTasks
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((task: any, index: number) => (
                          <div key={task.id} className="relative flex items-start gap-6">
                            {/* Timeline Dot */}
                            <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'overdue' ? 'bg-red-500' :
                              task.status === 'in_progress' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            
                            {/* Timeline Content */}
                            <div className="flex-1 pb-6">
                              <div className="bg-white border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`p-1 rounded ${getTaskTypeColor(task.type)}`}>
                                        {getTaskTypeIcon(task.type)}
                                      </div>
                                      <h3 className="font-medium">{task.title}</h3>
                                      <Badge className={getStatusColor(task.status)}>
                                        {getStatusIcon(task.status)}
                                        <span className="ml-1">{task.status.replace('_', ' ')}</span>
                                      </Badge>
                                    </div>
                                    
                                    <div className="text-sm text-muted-foreground mb-2">
                                      <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          {task.assignedTo}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(task.createdAt).toLocaleDateString()}
                                        </span>
                                        {task.completedAt && (
                                          <span className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            Completed {new Date(task.completedAt).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {task.description && (
                                      <p className="text-sm mb-2">{task.description}</p>
                                    )}
                                    
                                    {task.notes && (
                                      <div className="text-sm bg-gray-50 p-2 rounded mb-2">
                                        <span className="font-medium">Notes:</span> {task.notes}
                                      </div>
                                    )}
                                    
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {task.tags.map((tag: string, index: number) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(task.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}