import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Filter,
  Calendar,
  Upload,
  FileText,
  Zap,
  Droplets,
  Wind,
  Flame,
  Home
} from "lucide-react";

const maintenanceRequestSchema = z.object({
  propertyId: z.number().min(1, "Property is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.string().min(1, "Priority is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  urgency: z.string().min(1, "Urgency level is required")
});

const categories = [
  { value: "ac", label: "Air Conditioning", icon: Wind },
  { value: "pool", label: "Pool & Spa", icon: Droplets },
  { value: "plumbing", label: "Plumbing", icon: Droplets },
  { value: "electrical", label: "Electrical", icon: Zap },
  { value: "appliances", label: "Appliances", icon: Home },
  { value: "hvac", label: "HVAC", icon: Wind },
  { value: "general", label: "General Maintenance", icon: Wrench }
];

const priorities = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
];

const statusIcons = {
  open: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  "in_progress": <Clock className="h-4 w-4 text-blue-500" />,
  resolved: <CheckCircle className="h-4 w-4 text-green-500" />
};

export default function OwnerMaintenanceModule() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ["/api/owner/properties"],
  });

  const { data: maintenanceRequests, isLoading } = useQuery({
    queryKey: ["/api/owner/maintenance-requests", { 
      category: selectedCategory, 
      status: selectedStatus, 
      property: selectedProperty 
    }],
  });

  const form = useForm({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      category: "",
      priority: "",
      title: "",
      description: "",
      urgency: ""
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'photos') {
          formData.append(key, data[key]);
        }
      });
      
      if (data.photos) {
        Array.from(data.photos).forEach((file: any, index) => {
          formData.append(`photo${index}`, file);
        });
      }
      
      return fetch("/api/owner/maintenance-requests", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Maintenance request submitted",
        description: "Your request has been sent to the property management team.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/maintenance-requests"] });
      setIsNewRequestOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Request failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: any) => {
    createRequestMutation.mutate(data);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      form.setValue('photos', files);
    }
  };

  const filteredRequests = maintenanceRequests?.filter((request: any) => {
    const categoryMatch = selectedCategory === "all" || request.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || request.status === selectedStatus;
    const propertyMatch = selectedProperty === "all" || request.propertyId.toString() === selectedProperty;
    return categoryMatch && statusMatch && propertyMatch;
  }) || [];

  const getRequestStats = () => {
    if (!maintenanceRequests) return { total: 0, open: 0, inProgress: 0, resolved: 0 };
    
    return maintenanceRequests.reduce((acc: any, request: any) => {
      acc.total++;
      if (request.status === 'open') acc.open++;
      else if (request.status === 'in_progress') acc.inProgress++;
      else if (request.status === 'resolved') acc.resolved++;
      return acc;
    }, { total: 0, open: 0, inProgress: 0, resolved: 0 });
  };

  const stats = getRequestStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-muted-foreground">
            Submit and track maintenance requests for your properties
          </p>
        </div>
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Maintenance Request</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties?.map((property: any) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Brief description of the issue" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          placeholder="Provide detailed information about the issue, including when it started, what seems to be causing it, and any relevant details..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How urgent is this?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency (immediate attention needed)</SelectItem>
                          <SelectItem value="urgent">Urgent (within 24 hours)</SelectItem>
                          <SelectItem value="normal">Normal (within a few days)</SelectItem>
                          <SelectItem value="low">Low (when convenient)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Attach Photos</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-500"
                    >
                      Click to upload photos
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload photos to help illustrate the issue
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewRequestOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createRequestMutation.isPending}
                  >
                    {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
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
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests</h3>
              <p className="text-gray-500 mb-4">You haven't submitted any maintenance requests yet.</p>
              <Button onClick={() => setIsNewRequestOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request: any) => {
                const category = categories.find(c => c.value === request.category);
                const CategoryIcon = category?.icon || Wrench;
                const priority = priorities.find(p => p.value === request.priority);
                
                return (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <CategoryIcon className="h-5 w-5 text-gray-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{request.title}</h4>
                            {statusIcons[request.status as keyof typeof statusIcons]}
                            <Badge variant="outline" className={priority?.color}>
                              {priority?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>#{request.id}</span>
                            <span>{category?.label}</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            {request.assignedTo && (
                              <span>Assigned to: {request.assignedTo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Request #{request.id} - {request.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {statusIcons[request.status as keyof typeof statusIcons]}
                                    <span className="capitalize">{request.status.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Priority</label>
                                  <div className="mt-1">
                                    <Badge className={priority?.color}>{priority?.label}</Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Category</label>
                                  <p className="mt-1">{category?.label}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Created</label>
                                  <p className="mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="mt-1 text-gray-600">{request.description}</p>
                              </div>
                              
                              {request.attachments && request.attachments.length > 0 && (
                                <div>
                                  <label className="text-sm font-medium">Attachments</label>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {request.attachments.map((attachment: any, index: number) => (
                                      <img 
                                        key={index}
                                        src={attachment.url} 
                                        alt={`Attachment ${index + 1}`}
                                        className="rounded border"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {request.resolution && (
                                <div>
                                  <label className="text-sm font-medium">Resolution</label>
                                  <p className="mt-1 text-gray-600">{request.resolution}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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