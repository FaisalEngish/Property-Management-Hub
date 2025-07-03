import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon,
  Search, 
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  User,
  MapPin,
  Filter
} from "lucide-react";
import { format } from "date-fns";

const taskTypes = [
  { value: "cleaning", label: "Cleaning", icon: "🧹", color: "bg-blue-100 text-blue-800" },
  { value: "maintenance", label: "Maintenance", icon: "🔧", color: "bg-orange-100 text-orange-800" },
  { value: "pool", label: "Pool Service", icon: "🏊", color: "bg-cyan-100 text-cyan-800" },
  { value: "garden", label: "Garden Care", icon: "🌿", color: "bg-green-100 text-green-800" },
  { value: "hosting", label: "Guest Services", icon: "🏠", color: "bg-purple-100 text-purple-800" },
  { value: "inspection", label: "Inspection", icon: "🔍", color: "bg-gray-100 text-gray-800" }
];

const statusIcons = {
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  "in_progress": <Clock className="h-4 w-4 text-blue-500" />,
  pending: <AlertTriangle className="h-4 w-4 text-yellow-500" />
};

export default function OwnerTaskHistory() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewingTask, setViewingTask] = useState<any>(null);

  const { data: properties } = useQuery({
    queryKey: ["/api/owner/properties"],
  });

  const { data: taskHistory, isLoading } = useQuery({
    queryKey: ["/api/owner/task-history", {
      property: selectedProperty,
      type: selectedType,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      search: searchKeyword
    }],
  });

  const filteredTasks = taskHistory?.filter((task: any) => {
    const propertyMatch = selectedProperty === "all" || task.propertyId.toString() === selectedProperty;
    const typeMatch = selectedType === "all" || task.type === selectedType;
    const keywordMatch = searchKeyword === "" || 
      task.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchKeyword.toLowerCase());
    
    let dateMatch = true;
    if (dateFrom && dateTo) {
      const taskDate = new Date(task.completedAt || task.createdAt);
      dateMatch = taskDate >= dateFrom && taskDate <= dateTo;
    }
    
    return propertyMatch && typeMatch && keywordMatch && dateMatch;
  }) || [];

  const getTaskStats = () => {
    if (!taskHistory) return { total: 0, completed: 0, thisMonth: 0 };
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return taskHistory.reduce((acc: any, task: any) => {
      acc.total++;
      if (task.status === 'completed') acc.completed++;
      if (new Date(task.createdAt) >= thisMonth) acc.thisMonth++;
      return acc;
    }, { total: 0, completed: 0, thisMonth: 0 });
  };

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task History</h1>
        <p className="text-muted-foreground">
          View all tasks and activities performed on your properties
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties?.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "MMM dd") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "MMM dd") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task History List */}
      <Card>
        <CardHeader>
          <CardTitle>Task History ({filteredTasks.length} tasks)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">No tasks match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task: any) => {
                const taskType = taskTypes.find(t => t.value === task.type);
                const property = properties?.find((p: any) => p.id === task.propertyId);
                
                return (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">{taskType?.icon || "📋"}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{task.title}</h4>
                            {statusIcons[task.status as keyof typeof statusIcons]}
                            <Badge className={taskType?.color}>
                              {taskType?.label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {task.description || "No description provided"}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{property?.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>By: {task.assignedTo || task.completedBy || "Unassigned"}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>
                                {task.completedAt 
                                  ? `Completed: ${new Date(task.completedAt).toLocaleDateString()}`
                                  : `Created: ${new Date(task.createdAt).toLocaleDateString()}`
                                }
                              </span>
                            </div>
                            {task.evidencePhotos?.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <ImageIcon className="h-3 w-3" />
                                <span>{task.evidencePhotos.length} photos</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Task Details - {task.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Task Overview */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Property</label>
                                <p className="mt-1">{property?.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Type</label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span>{taskType?.icon}</span>
                                  <span>{taskType?.label}</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="flex items-center space-x-2 mt-1">
                                  {statusIcons[task.status as keyof typeof statusIcons]}
                                  <span className="capitalize">{task.status.replace('_', ' ')}</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Assigned To</label>
                                <p className="mt-1">{task.assignedTo || "Unassigned"}</p>
                              </div>
                            </div>
                            
                            {/* Description */}
                            {task.description && (
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="mt-1 text-gray-600">{task.description}</p>
                              </div>
                            )}
                            
                            {/* Timeline */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Created</label>
                                <p className="mt-1">{new Date(task.createdAt).toLocaleString()}</p>
                              </div>
                              {task.completedAt && (
                                <div>
                                  <label className="text-sm font-medium">Completed</label>
                                  <p className="mt-1">{new Date(task.completedAt).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Evidence Photos */}
                            {task.evidencePhotos && task.evidencePhotos.length > 0 && (
                              <div>
                                <label className="text-sm font-medium">Evidence Photos</label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {task.evidencePhotos.map((photo: any, index: number) => (
                                    <img 
                                      key={index}
                                      src={photo.url || photo} 
                                      alt={`Evidence ${index + 1}`}
                                      className="rounded border w-full h-24 object-cover cursor-pointer hover:opacity-80"
                                      onClick={() => window.open(photo.url || photo, '_blank')}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Completion Notes */}
                            {task.completionNotes && (
                              <div>
                                <label className="text-sm font-medium">Completion Notes</label>
                                <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded">
                                  {task.completionNotes}
                                </p>
                              </div>
                            )}
                            
                            {/* Issues Found */}
                            {task.issuesFound && task.issuesFound.length > 0 && (
                              <div>
                                <label className="text-sm font-medium">Issues Found</label>
                                <div className="mt-1 space-y-1">
                                  {task.issuesFound.map((issue: string, index: number) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                                      <AlertTriangle className="h-4 w-4" />
                                      <span>{issue}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}