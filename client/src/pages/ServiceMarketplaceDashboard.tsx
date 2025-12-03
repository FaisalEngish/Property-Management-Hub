import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ShoppingCart, 
  Star, 
  Calendar, 
  DollarSign, 
  Building2, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  TrendingUp,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

// Form schemas
const vendorSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(1, "Address is required"),
  businessType: z.string().min(1, "Business type is required"),
  servicesOffered: z.string().min(1, "Services offered is required"),
  operatingHours: z.string().min(1, "Operating hours is required"),
  priceRange: z.string().min(1, "Price range is required"),
  description: z.string().optional(),
});

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  iconName: z.string().optional(),
});

const serviceSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  vendorId: z.coerce.number().min(1, "Vendor is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.coerce.number().min(0, "Base price must be positive"),
  currency: z.string().default("THB"),
  duration: z.string().min(1, "Duration is required"),
  availability: z.string().min(1, "Availability is required"),
  requirements: z.string().optional(),
});

const bookingSchema = z.object({
  serviceId: z.coerce.number().min(1, "Service is required"),
  propertyId: z.coerce.number().min(1, "Property is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  scheduledTime: z.string().min(1, "Scheduled time is required"),
  notes: z.string().optional(),
  totalAmount: z.coerce.number().min(0, "Amount must be positive"),
});

const reviewSchema = z.object({
  serviceId: z.coerce.number().min(1, "Service is required"),
  vendorId: z.coerce.number().min(1, "Vendor is required"),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1-5"),
  comment: z.string().min(1, "Comment is required"),
});

export default function ServiceMarketplaceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const queryClient = useQueryClient();

  // Data queries
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/service-dashboard-stats"],
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/service-vendors"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/service-categories"],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/marketplace-services"],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/service-bookings"],
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/service-reviews"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Mutation hooks
  const createVendorMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/service-vendors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-dashboard-stats"] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/service-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-categories"] });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/marketplace-services", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace-services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-dashboard-stats"] });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/service-bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-dashboard-stats"] });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/service-reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-reviews"] });
    },
  });

  const approveBookingMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/service-bookings/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
    },
  });

  const completeBookingMutation = useMutation({
    mutationFn: ({ id, notes, photos }: { id: number; notes?: string; photos?: string[] }) => 
      apiRequest("PATCH", `/api/service-bookings/${id}/complete`, { notes, photos }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
    },
  });

  // Form instances
  const vendorForm = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessName: "",
      contactPerson: "",
      phoneNumber: "",
      email: "",
      address: "",
      businessType: "",
      servicesOffered: "",
      operatingHours: "",
      priceRange: "",
      description: "",
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      iconName: "",
    },
  });

  const serviceForm = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceName: "",
      categoryId: 0,
      vendorId: 0,
      description: "",
      basePrice: 0,
      currency: "THB",
      duration: "",
      availability: "",
      requirements: "",
    },
  });

  const bookingForm = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: 0,
      propertyId: 0,
      scheduledDate: "",
      scheduledTime: "",
      notes: "",
      totalAmount: 0,
    },
  });

  const reviewForm = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      serviceId: 0,
      vendorId: 0,
      rating: 5,
      comment: "",
    },
  });

  // Handler functions
  const handleCreateVendor = (data: any) => {
    createVendorMutation.mutate(data);
    vendorForm.reset();
  };

  const handleCreateCategory = (data: any) => {
    createCategoryMutation.mutate(data);
    categoryForm.reset();
  };

  const handleCreateService = (data: any) => {
    createServiceMutation.mutate(data);
    serviceForm.reset();
  };

  const handleCreateBooking = (data: any) => {
    createBookingMutation.mutate(data);
    bookingForm.reset();
  };

  const handleCreateReview = (data: any) => {
    createReviewMutation.mutate(data);
    reviewForm.reset();
  };

  // Filter functions
  const filteredServices = services.filter((service: any) => {
    const matchesSearch = service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || service.categoryId === parseInt(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const filteredBookings = bookings.filter((booking: any) => {
    return !statusFilter || booking.status === statusFilter;
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-blue-100 text-blue-800';
        case 'confirmed': return 'bg-green-100 text-green-800';
        case 'completed': return 'bg-emerald-100 text-emerald-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <Badge className={getStatusColor(status)}>
        {status}
      </Badge>
    );
  };

  // Rating stars component
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Marketplace</h1>
          <p className="text-muted-foreground">Manage vendors, services, and bookings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{dashboardStats?.totalBookings || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{dashboardStats?.completedBookings || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{dashboardStats?.totalRevenue?.toLocaleString() || 0}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                      <p className="text-2xl font-bold">{vendors.length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats?.topServices?.map((service: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.bookings} bookings</p>
                      </div>
                      <p className="font-medium">₹{service.revenue?.toLocaleString()}</p>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Vendors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats?.topVendors?.map((vendor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={Math.round(vendor.rating)} />
                          <span className="text-sm text-muted-foreground">
                            ({vendor.bookings} bookings)
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Service Vendors</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Vendor</DialogTitle>
                </DialogHeader>
                <Form {...vendorForm}>
                  <form onSubmit={vendorForm.handleSubmit(handleCreateVendor)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={vendorForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={vendorForm.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={vendorForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={vendorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={vendorForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={vendorForm.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="individual">Individual</SelectItem>
                                  <SelectItem value="company">Company</SelectItem>
                                  <SelectItem value="partnership">Partnership</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={vendorForm.control}
                        name="priceRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Range</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select price range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="budget">Budget (₹0-500)</SelectItem>
                                  <SelectItem value="standard">Standard (₹500-2000)</SelectItem>
                                  <SelectItem value="premium">Premium (₹2000+)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={vendorForm.control}
                      name="servicesOffered"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Services Offered</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Describe the services offered" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="operatingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operating Hours</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Mon-Fri 9AM-6PM" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="submit" disabled={createVendorMutation.isPending}>
                        {createVendorMutation.isPending ? "Adding..." : "Add Vendor"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorsLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              vendors.map((vendor: any) => (
                <Card key={vendor.id}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{vendor.businessName}</h3>
                          <p className="text-sm text-muted-foreground">{vendor.businessType}</p>
                        </div>
                        <Badge variant="outline">{vendor.priceRange}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {vendor.contactPerson}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {vendor.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {vendor.address}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm font-medium mb-1">Services Offered:</p>
                        <p className="text-sm text-muted-foreground">{vendor.servicesOffered}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {vendor.operatingHours}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Marketplace Services</h2>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Service Category</DialogTitle>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(handleCreateCategory)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="categoryName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="iconName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon Name (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., wrench, car, home" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={createCategoryMutation.isPending}>
                          {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <Form {...serviceForm}>
                    <form onSubmit={serviceForm.handleSubmit(handleCreateService)} className="space-y-4">
                      <FormField
                        control={serviceForm.control}
                        name="serviceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={serviceForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.categoryName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={serviceForm.control}
                          name="vendorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors.map((vendor: any) => (
                                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                        {vendor.businessName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
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
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={serviceForm.control}
                          name="basePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base Price</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
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
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="THB">THB</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={serviceForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 2 hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={serviceForm.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Availability</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Mon-Fri 9AM-5PM" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={serviceForm.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requirements (Optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={createServiceMutation.isPending}>
                          {createServiceMutation.isPending ? "Adding..." : "Add Service"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredServices.map((service: any) => (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold">{service.serviceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {categories.find((cat: any) => cat.id === service.categoryId)?.categoryName}
                        </p>
                      </div>
                      
                      <p className="text-sm">{service.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold">
                            {service.currency} {service.basePrice}
                          </p>
                          <p className="text-sm text-muted-foreground">{service.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {vendors.find((vendor: any) => vendor.id === service.vendorId)?.businessName}
                          </p>
                          <p className="text-sm text-muted-foreground">{service.availability}</p>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedService(service)}
                      >
                        Book Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Service Bookings</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Service Booking</DialogTitle>
                </DialogHeader>
                <Form {...bookingForm}>
                  <form onSubmit={bookingForm.handleSubmit(handleCreateBooking)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services.map((service: any) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                      {service.serviceName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
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
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                                <SelectContent>
                                  {properties.map((property: any) => (
                                    <SelectItem key={property.id} value={property.id.toString()}>
                                      {property.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookingForm.control}
                        name="scheduledTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={bookingForm.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookingForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="submit" disabled={createBookingMutation.isPending}>
                        {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Status Filter */}
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {bookingsLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredBookings.map((booking: any) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {services.find((s: any) => s.id === booking.serviceId)?.serviceName}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Property: {properties.find((p: any) => p.id === booking.propertyId)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vendor: {vendors.find((v: any) => v.id === booking.vendorId)?.businessName}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {booking.scheduledDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.scheduledTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ₹{booking.totalAmount}
                          </div>
                        </div>
                        {booking.notes && (
                          <p className="text-sm bg-gray-50 p-2 rounded">{booking.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => approveBookingMutation.mutate(booking.id)}
                            disabled={approveBookingMutation.isPending}
                          >
                            Approve
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => completeBookingMutation.mutate({ id: booking.id })}
                            disabled={completeBookingMutation.isPending}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Service Reviews</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Service Review</DialogTitle>
                </DialogHeader>
                <Form {...reviewForm}>
                  <form onSubmit={reviewForm.handleSubmit(handleCreateReview)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={reviewForm.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services.map((service: any) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                      {service.serviceName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={reviewForm.control}
                        name="vendorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vendor</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vendors.map((vendor: any) => (
                                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                      {vendor.businessName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={reviewForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating (1-5 stars)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reviewForm.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comment</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="submit" disabled={createReviewMutation.isPending}>
                        {createReviewMutation.isPending ? "Adding..." : "Add Review"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {reviewsLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">
                            {services.find((s: any) => s.id === review.serviceId)?.serviceName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {vendors.find((v: any) => v.id === review.vendorId)?.businessName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} />
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Service Analytics</h2>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analytics data will be populated as more bookings and reviews are added to the system.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Chart placeholder - Booking trends over time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Chart placeholder - Revenue breakdown by service category
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Chart placeholder - Vendor ratings and booking counts
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Popularity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Chart placeholder - Most booked services
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}