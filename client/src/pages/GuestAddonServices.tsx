import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Car,
  Utensils,
  Heart,
} from "lucide-react";

const serviceSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  pricingType: z.string().min(1, "Pricing type is required"),
  basePrice: z.string().min(1, "Base price is required"),
  currency: z.string().default("AUD"),
  isActive: z.boolean().default(true),
  requiresTimeSlot: z.boolean().default(false),
  maxAdvanceBookingDays: z.number().min(1).max(365).default(30),
  cancellationPolicyHours: z.number().min(0).default(24),
  autoCreateTask: z.boolean().default(true),
  taskType: z.string().optional(),
  taskPriority: z.string().default("medium"),
});

const bookingSchema = z.object({
  serviceId: z.number(),
  propertyId: z.number(),
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().optional(),
  serviceDate: z.string().min(1, "Service date is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
  billingRoute: z.string().min(1, "Billing route is required"),
  complimentaryType: z.string().optional(),
  specialRequests: z.string().optional(),
  internalNotes: z.string().optional(),
});

type Service = {
  id: number;
  serviceName: string;
  description?: string;
  category: string;
  pricingType: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
  requiresTimeSlot: boolean;
  maxAdvanceBookingDays: number;
  cancellationPolicyHours: number;
  autoCreateTask: boolean;
  taskType?: string;
  taskPriority: string;
  createdAt: string;
  updatedAt: string;
};

type Booking = {
  id: number;
  serviceId: number;
  propertyId: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  bookingDate: string;
  serviceDate: string;
  status: string;
  totalAmount: string;
  currency: string;
  billingRoute: string;
  complimentaryType?: string;
  paymentStatus: string;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  specialRequests?: string;
  internalNotes?: string;
  assignedTaskId?: number;
};

const categoryIcons = {
  wellness: Heart,
  transport: Car,
  cleaning: Package,
  catering: Utensils,
};

const getCategoryIcon = (category: string) => {
  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Package;
  return <Icon className="h-4 w-4" />;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getBillingRouteColor = (route: string) => {
  switch (route) {
    case "guest_billable":
      return "bg-blue-100 text-blue-800";
    case "owner_billable":
      return "bg-purple-100 text-purple-800";
    case "company_expense":
      return "bg-orange-100 text-orange-800";
    case "complimentary":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function GuestAddonServices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("services");
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/guest-addon-services"],
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/guest-addon-bookings"],
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const serviceForm = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceName: "",
      description: "",
      category: "",
      pricingType: "fixed",
      basePrice: "",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: false,
      maxAdvanceBookingDays: 30,
      cancellationPolicyHours: 24,
      autoCreateTask: true,
      taskType: "",
      taskPriority: "medium",
    },
  });

  const bookingForm = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: 0,
      propertyId: 0,
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      serviceDate: "",
      totalAmount: "",
      billingRoute: "guest_billable",
      complimentaryType: "",
      specialRequests: "",
      internalNotes: "",
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceSchema>) => {
      return await apiRequest("POST", "/api/guest-addon-services", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/guest-addon-services"],
      });
      setIsServiceDialogOpen(false);
      serviceForm.reset();
      toast({
        title: "Success",
        description: "Guest add-on service created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create guest add-on service",
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<z.infer<typeof serviceSchema>>;
    }) => {
      return await apiRequest("PUT", `/api/guest-addon-services/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/guest-addon-services"],
      });
      setIsServiceDialogOpen(false);
      serviceForm.reset();
      setEditingService(null);
      toast({
        title: "Success",
        description: "Guest add-on service updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update guest add-on service",
        variant: "destructive",
      });
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bookingSchema>) => {
      return await apiRequest("POST", "/api/guest-addon-bookings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/guest-addon-bookings"],
      });
      setIsBookingDialogOpen(false);
      bookingForm.reset();
      toast({
        title: "Success",
        description: "Guest add-on booking created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create guest add-on booking",
        variant: "destructive",
      });
    },
  });

  const handleServiceSubmit = (data: z.infer<typeof serviceSchema>) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const handleBookingSubmit = (data: z.infer<typeof bookingSchema>) => {
    createBookingMutation.mutate(data);
  };

  const openServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      serviceForm.reset({
        serviceName: service.serviceName,
        description: service.description || "",
        category: service.category,
        pricingType: service.pricingType,
        basePrice: service.basePrice,
        currency: service.currency,
        isActive: service.isActive,
        requiresTimeSlot: service.requiresTimeSlot,
        maxAdvanceBookingDays: service.maxAdvanceBookingDays,
        cancellationPolicyHours: service.cancellationPolicyHours,
        autoCreateTask: service.autoCreateTask,
        taskType: service.taskType || "",
        taskPriority: service.taskPriority,
      });
    } else {
      setEditingService(null);
      serviceForm.reset();
    }
    setIsServiceDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Guest Add-On Services
          </h1>
          <p className="text-muted-foreground">
            Manage guest add-on services and bookings with flexible billing
            options
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Add-On Services</h2>
            <Dialog
              open={isServiceDialogOpen}
              onOpenChange={setIsServiceDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => openServiceDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Edit Service" : "Create New Service"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure guest add-on service details and pricing.
                  </DialogDescription>
                </DialogHeader>
                <Form {...serviceForm}>
                  <form
                    onSubmit={serviceForm.handleSubmit(handleServiceSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={serviceForm.control}
                        name="serviceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., In-Room Massage"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={serviceForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="wellness">
                                  Wellness
                                </SelectItem>
                                <SelectItem value="transport">
                                  Transport
                                </SelectItem>
                                <SelectItem value="cleaning">
                                  Cleaning
                                </SelectItem>
                                <SelectItem value="catering">
                                  Catering
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={serviceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Service description..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={serviceForm.control}
                        name="pricingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pricing Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pricing" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed</SelectItem>
                                <SelectItem value="variable">
                                  Variable
                                </SelectItem>
                                <SelectItem value="hourly">Hourly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={serviceForm.control}
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
                        control={serviceForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AUD">AUD</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-6">
                      <Button
                        type="submit"
                        disabled={
                          createServiceMutation.isPending ||
                          updateServiceMutation.isPending
                        }
                      >
                        {editingService ? "Update Service" : "Create Service"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsServiceDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service: Service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(service.category)}
                        {service.serviceName}
                      </div>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {service.description || `${service.category} service`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Price:
                        </span>
                        <span className="font-medium">
                          {service.currency} ${service.basePrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Pricing:
                        </span>
                        <Badge variant="outline">{service.pricingType}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Auto Task:
                        </span>
                        <Badge
                          variant={
                            service.autoCreateTask ? "default" : "secondary"
                          }
                        >
                          {service.autoCreateTask ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openServiceDialog(service)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Service Bookings</h2>
            <Dialog
              open={isBookingDialogOpen}
              onOpenChange={setIsBookingDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Booking</DialogTitle>
                  <DialogDescription>
                    Book a guest add-on service with flexible billing options.
                  </DialogDescription>
                </DialogHeader>
                <Form {...bookingForm}>
                  <form
                    onSubmit={bookingForm.handleSubmit(handleBookingSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map((service: Service) => (
                                  <SelectItem
                                    key={service.id}
                                    value={service.id.toString()}
                                  >
                                    {service.serviceName} - ${service.basePrice}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookingForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties.map((property: any) => (
                                  <SelectItem
                                    key={property.id}
                                    value={property.id.toString()}
                                  >
                                    {property.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="guestName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guest Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Guest full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookingForm.control}
                        name="guestEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guest Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="guest@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="serviceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Date</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookingForm.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount</FormLabel>
                            <FormControl>
                              <Input placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="billingRoute"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Route</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select billing route" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="guest_billable">
                                  Guest Billable
                                </SelectItem>
                                <SelectItem value="owner_billable">
                                  Owner Billable
                                </SelectItem>
                                <SelectItem value="company_expense">
                                  Company Expense
                                </SelectItem>
                                <SelectItem value="complimentary">
                                  Complimentary
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {bookingForm.watch("billingRoute") ===
                        "complimentary" && (
                        <FormField
                          control={bookingForm.control}
                          name="complimentaryType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complimentary Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="owner_gift">
                                    Owner Gift
                                  </SelectItem>
                                  <SelectItem value="company_gift">
                                    Company Gift
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <FormField
                      control={bookingForm.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requirements..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-6">
                      <Button
                        type="submit"
                        disabled={createBookingMutation.isPending}
                      >
                        Create Booking
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBookingDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first guest add-on service booking to get started.
                </p>
                <Button onClick={() => setIsBookingDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Booking
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: Booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{booking.guestName}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Badge
                            className={getBillingRouteColor(
                              booking.billingRoute,
                            )}
                          >
                            {booking.billingRoute.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Service Date:{" "}
                          {new Date(booking.serviceDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Email: {booking.guestEmail}
                        </p>
                        {booking.specialRequests && (
                          <p className="text-sm text-muted-foreground">
                            Special Requests: {booking.specialRequests}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {booking.currency} ${booking.totalAmount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Payment: {booking.paymentStatus}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Coming Soon</CardTitle>
              <CardDescription>
                Service booking analytics and revenue insights will be available
                here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold">$0</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Total Bookings
                      </p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Active Services
                      </p>
                      <p className="text-2xl font-bold">
                        {services.filter((s: Service) => s.isActive).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
