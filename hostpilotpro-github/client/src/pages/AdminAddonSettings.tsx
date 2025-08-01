import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2,
  Settings,
  DollarSign,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import type { GuestAddonService, Property } from "@shared/schema";

const serviceFormSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  pricingType: z.enum(["fixed", "variable", "hourly"]),
  basePrice: z.string().min(1, "Base price is required"),
  currency: z.string().default("AUD"),
  isActive: z.boolean().default(true),
  requiresTimeSlot: z.boolean().default(false),
  maxAdvanceBookingDays: z.number().min(1).max(365).default(30),
  cancellationPolicyHours: z.number().min(1).max(168).default(24),
  autoCreateTask: z.boolean().default(true),
  taskType: z.string().optional(),
  taskPriority: z.enum(["high", "medium", "low"]).default("medium"),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function AdminAddonSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedService, setSelectedService] = useState<GuestAddonService | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/guest-addon-services"],
  });

  // Fetch properties for property-specific overrides
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Form for creating/editing services
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceName: "",
      description: "",
      category: "",
      pricingType: "fixed",
      basePrice: "",
      currency: "AUD",
      isActive: true,
      requiresTimeSlot: false,
      maxAdvanceBookingDays: 30,
      cancellationPolicyHours: 24,
      autoCreateTask: true,
      taskType: "",
      taskPriority: "medium",
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: ServiceFormData) => {
      return apiRequest("POST", "/api/guest-addon-services", {
        ...serviceData,
        createdBy: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Service Created",
        description: "New add-on service has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-addon-services"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ServiceFormData> }) => {
      return apiRequest("PATCH", `/api/guest-addon-services/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Service Updated",
        description: "Add-on service has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-addon-services"] });
      setIsEditDialogOpen(false);
      setSelectedService(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/guest-addon-services/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Service Deleted",
        description: "Add-on service has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-addon-services"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateService = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  const handleUpdateService = (data: ServiceFormData) => {
    if (selectedService) {
      updateServiceMutation.mutate({
        id: selectedService.id,
        data,
      });
    }
  };

  const handleEditService = (service: GuestAddonService) => {
    setSelectedService(service);
    form.reset({
      serviceName: service.serviceName,
      description: service.description || "",
      category: service.category,
      pricingType: service.pricingType as "fixed" | "variable" | "hourly",
      basePrice: service.basePrice,
      currency: service.currency || "AUD",
      isActive: service.isActive || true,
      requiresTimeSlot: service.requiresTimeSlot || false,
      maxAdvanceBookingDays: service.maxAdvanceBookingDays || 30,
      cancellationPolicyHours: service.cancellationPolicyHours || 24,
      autoCreateTask: service.autoCreateTask || true,
      taskType: service.taskType || "",
      taskPriority: (service.taskPriority as "high" | "medium" | "low") || "medium",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteService = (service: GuestAddonService) => {
    if (confirm(`Are you sure you want to delete "${service.serviceName}"? This action cannot be undone.`)) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const categories = [
    { value: "wellness", label: "Wellness & Spa" },
    { value: "transport", label: "Transportation" },
    { value: "cleaning", label: "Cleaning Services" },
    { value: "catering", label: "Catering & Food" },
    { value: "entertainment", label: "Entertainment" },
    { value: "concierge", label: "Concierge Services" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Other" },
  ];

  const taskTypes = [
    { value: "cleaning", label: "Cleaning" },
    { value: "transport", label: "Transport" },
    { value: "catering", label: "Catering" },
    { value: "maintenance", label: "Maintenance" },
    { value: "wellness", label: "Wellness" },
    { value: "concierge", label: "Concierge" },
    { value: "addon_service", label: "Add-on Service" },
  ];

  const ServiceFormContent = ({ onSubmit }: { onSubmit: (data: ServiceFormData) => void }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., House Cleaning" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the service and what's included..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="pricingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="variable">Variable Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                  <Input placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxAdvanceBookingDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Advance Booking (Days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="365"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  How far in advance guests can book this service
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cancellationPolicyHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancellation Policy (Hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="168"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Minimum hours before service to allow cancellation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Service Active</FormLabel>
                  <FormDescription>
                    Allow guests to book this service
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiresTimeSlot"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Requires Time Slot</FormLabel>
                  <FormDescription>
                    Service requires specific time slot booking
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoCreateTask"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Auto-Create Task</FormLabel>
                  <FormDescription>
                    Automatically create a task when booking is confirmed
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {form.watch("autoCreateTask") && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taskType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="taskPriority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <DialogFooter>
          <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
            {selectedService ? "Update Service" : "Create Service"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  if (servicesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Add-On Service Settings</h1>
          <p className="text-muted-foreground">Configure available add-on services for guests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => form.reset()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new add-on service that guests can book during their stay
              </DialogDescription>
            </DialogHeader>
            <ServiceFormContent onSubmit={handleCreateService} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Services</CardTitle>
          <CardDescription>
            Manage all add-on services available for guest booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Settings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service: GuestAddonService) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.serviceName}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.description || "No description"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${service.basePrice} {service.currency}</div>
                      <div className="text-sm text-muted-foreground capitalize">{service.pricingType}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.isActive ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {service.requiresTimeSlot && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Time Slot
                        </Badge>
                      )}
                      {service.autoCreateTask && (
                        <Badge variant="outline" className="text-xs">
                          <Settings className="h-3 w-3 mr-1" />
                          Auto Task
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {service.maxAdvanceBookingDays}d advance | {service.cancellationPolicyHours}h cancel
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service)}
                        disabled={deleteServiceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {services.length === 0 && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Services Configured</h3>
              <p className="text-muted-foreground mb-4">Create your first add-on service to get started.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the settings for {selectedService?.serviceName}
            </DialogDescription>
          </DialogHeader>
          <ServiceFormContent onSubmit={handleUpdateService} />
        </DialogContent>
      </Dialog>
    </div>
  );
}