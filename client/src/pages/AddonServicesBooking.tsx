import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { 
  ShoppingCart, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Plus,
  Star,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  Package,
  Settings
} from "lucide-react";

// Booking form schema
const bookingFormSchema = z.object({
  serviceId: z.number().min(1, "Please select a service"),
  propertyId: z.number().min(1, "Please select a property"),
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Valid email required").optional(),
  guestPhone: z.string().min(1, "Phone number is required"),
  guestCount: z.number().min(1, "At least 1 guest required"),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceTime: z.string().min(1, "Service time is required"),
  billingRule: z.string().min(1, "Billing rule is required"),
  specialRequests: z.string().optional(),
});

// Service catalog form schema
const serviceFormSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.string().regex(/^\d+(\.\d{2})?$/, "Valid price required"),
  currency: z.string().default("THB"),
  duration: z.number().min(1, "Duration is required"),
  maxGuests: z.number().min(1, "Max guests is required"),
  advanceBookingHours: z.number().min(1, "Advance booking hours required"),
  providerName: z.string().min(1, "Provider name is required"),
  providerContact: z.string().min(1, "Provider contact is required"),
  commissionRate: z.string().regex(/^\d+(\.\d{2})?$/, "Valid commission rate required"),
  imageUrl: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;
type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function AddonServicesBooking() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBillingRule, setSelectedBillingRule] = useState<string>("all");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: serviceCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/addon-service-categories"],
  });

  const { data: serviceCatalog = [], isLoading: catalogLoading } = useQuery({
    queryKey: ["/api/addon-service-catalog", { category: selectedCategory }],
  });

  const { data: serviceBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/addon-service-bookings", { 
      status: selectedStatus === "all" ? undefined : selectedStatus,
      billingRule: selectedBillingRule === "all" ? undefined : selectedBillingRule,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    }],
  });

  const { data: serviceCommissions = [], isLoading: commissionsLoading } = useQuery({
    queryKey: ["/api/addon-service-commissions"],
  });

  const { data: serviceReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/addon-service-reports"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Forms
  const bookingForm = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceId: 0,
      propertyId: 0,
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      guestCount: 1,
      serviceDate: "",
      serviceTime: "",
      billingRule: "guest_charged",
      specialRequests: "",
    },
  });

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceName: "",
      category: "tours",
      description: "",
      basePrice: "",
      currency: "THB",
      duration: 60,
      maxGuests: 1,
      advanceBookingHours: 2,
      providerName: "",
      providerContact: "",
      commissionRate: "15.00",
      imageUrl: "",
    },
  });

  // Mutations
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const service = serviceCatalog.find((s: any) => s.id === data.serviceId);
      const totalAmount = (parseFloat(service.basePrice) * data.guestCount).toFixed(2);
      const commissionAmount = (parseFloat(totalAmount) * parseFloat(service.commissionRate) / 100).toFixed(2);
      
      return await apiRequest("POST", "/api/addon-service-bookings", {
        ...data,
        totalAmount,
        commissionAmount,
        status: "pending",
        paymentStatus: "pending",
        bookedBy: "demo-staff", // This would come from auth context
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addon-service-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addon-service-commissions"] });
      setIsBookingDialogOpen(false);
      bookingForm.reset();
      toast({
        title: "Booking Created",
        description: "Service booking has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return await apiRequest("POST", "/api/addon-service-catalog", {
        ...data,
        organizationId: "default",
        isActive: true,
        createdBy: "demo-admin",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addon-service-catalog"] });
      setIsServiceDialogOpen(false);
      serviceForm.reset();
      toast({
        title: "Service Added",
        description: "New service has been added to catalog successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add service",
        variant: "destructive",
      });
    },
  });

  const confirmBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return await apiRequest("PUT", `/api/addon-service-bookings/${bookingId}/confirm`, {
        confirmedBy: "demo-admin",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addon-service-bookings"] });
      toast({
        title: "Booking Confirmed",
        description: "Service booking has been confirmed successfully.",
      });
    },
  });

  const completeBookingMutation = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: number; notes: string }) => {
      return await apiRequest("PUT", `/api/addon-service-bookings/${bookingId}/complete`, {
        completedAt: new Date().toISOString(),
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addon-service-bookings"] });
      toast({
        title: "Booking Completed",
        description: "Service booking has been marked as completed.",
      });
    },
  });

  // Utility functions
  const getBillingRuleColor = (rule: string) => {
    switch (rule) {
      case "guest_charged": return "bg-blue-100 text-blue-800";
      case "owner_charged": return "bg-orange-100 text-orange-800";
      case "complimentary": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      tours: "🏝️",
      chef: "👨‍🍳",
      transport: "🚗",
      massage: "💆‍♀️",
      rental: "🏊‍♂️",
      grocery: "🛒",
      baby: "👶",
      photography: "📸",
      airport: "✈️",
      events: "🎉",
    };
    return iconMap[category] || "🔧";
  };

  // Calculate summary metrics
  const totalBookings = serviceBookings.length;
  const totalRevenue = serviceBookings.reduce((sum: number, booking: any) => 
    sum + parseFloat(booking.totalAmount || "0"), 0
  );
  const totalCommissions = serviceBookings.reduce((sum: number, booking: any) => 
    sum + parseFloat(booking.commissionAmount || "0"), 0
  );
  const pendingBookings = serviceBookings.filter((b: any) => b.status === "pending").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add-On Services Engine</h1>
          <p className="text-gray-600">Comprehensive service booking and billing management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsServiceDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
          <Button 
            onClick={() => setIsBookingDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Service Catalog
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commissions
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingBookings} pending approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{totalCommissions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Staff earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serviceCatalog.length}</div>
                <p className="text-xs text-muted-foreground">
                  In catalog
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue breakdown by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {serviceCategories.map((category: any) => {
                  const categoryBookings = serviceBookings.filter((b: any) => 
                    serviceCatalog.find((s: any) => s.id === b.serviceId)?.category === category.categoryName
                  );
                  const categoryRevenue = categoryBookings.reduce((sum: number, booking: any) => 
                    sum + parseFloat(booking.totalAmount || "0"), 0
                  );
                  
                  return (
                    <div key={category.id} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl mb-2">{getCategoryIcon(category.categoryName)}</div>
                      <div className="font-semibold capitalize">{category.categoryName}</div>
                      <div className="text-sm text-gray-600">{categoryBookings.length} bookings</div>
                      <div className="text-lg font-bold text-green-600">฿{categoryRevenue.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest service bookings requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceBookings.slice(0, 5).map((booking: any) => {
                  const service = serviceCatalog.find((s: any) => s.id === booking.serviceId);
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getCategoryIcon(service?.category || "")}</div>
                        <div>
                          <div className="font-semibold">{service?.serviceName}</div>
                          <div className="text-sm text-gray-600">{booking.guestName} • {booking.serviceDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getBillingRuleColor(booking.billingRule)}>
                          {booking.billingRule.replace("_", " ")}
                        </Badge>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold">฿{parseFloat(booking.totalAmount).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{booking.guestCount} guests</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Catalog Tab */}
        <TabsContent value="catalog" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {serviceCategories.map((category: any) => (
                    <SelectItem key={category.id} value={category.categoryName}>
                      {getCategoryIcon(category.categoryName)} {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              {serviceCatalog.length} services available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600 mt-2">Loading services...</p>
              </div>
            ) : (
              serviceCatalog.map((service: any) => (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                        <div>
                          <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                          <CardDescription className="capitalize">{service.category}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">฿{parseFloat(service.basePrice).toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{service.commissionRate}% commission</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration} mins
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Max {service.maxGuests}
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {service.advanceBookingHours}h advance
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {service.providerName}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          bookingForm.setValue("serviceId", service.id);
                          setIsBookingDialogOpen(true);
                        }}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Book
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedService(service);
                          serviceForm.reset(service);
                          setIsServiceDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
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
            <div className="flex items-center gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBillingRule} onValueChange={setSelectedBillingRule}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by billing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Billing</SelectItem>
                  <SelectItem value="guest_charged">Guest Charged</SelectItem>
                  <SelectItem value="owner_charged">Owner Charged</SelectItem>
                  <SelectItem value="complimentary">Complimentary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              {serviceBookings.length} bookings found
            </div>
          </div>

          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600 mt-2">Loading bookings...</p>
              </div>
            ) : (
              serviceBookings.map((booking: any) => {
                const service = serviceCatalog.find((s: any) => s.id === booking.serviceId);
                const property = properties.find((p: any) => p.id === booking.propertyId);
                
                return (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{getCategoryIcon(service?.category || "")}</div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{service?.serviceName}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <Badge className={getBillingRuleColor(booking.billingRule)}>
                                {booking.billingRule.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {booking.guestName} ({booking.guestCount} guests)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {booking.guestEmail}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.guestPhone}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {booking.serviceDate} at {booking.serviceTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {property?.name}
                                </span>
                              </div>
                              {booking.specialRequests && (
                                <div className="flex items-start gap-1">
                                  <AlertCircle className="h-3 w-3 mt-0.5" />
                                  <span className="text-xs">{booking.specialRequests}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              ฿{parseFloat(booking.totalAmount).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              Commission: ฿{parseFloat(booking.commissionAmount).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === "pending" && (
                              <Button 
                                size="sm"
                                onClick={() => confirmBookingMutation.mutate(booking.id)}
                                disabled={confirmBookingMutation.isPending}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                            {booking.status === "confirmed" && (
                              <Button 
                                size="sm"
                                onClick={() => completeBookingMutation.mutate({
                                  bookingId: booking.id,
                                  notes: "Service completed successfully"
                                })}
                                disabled={completeBookingMutation.isPending}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Tracking</CardTitle>
              <CardDescription>Staff earnings from service bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-600 mt-2">Loading commissions...</p>
                  </div>
                ) : (
                  serviceCommissions.map((commission: any) => {
                    const booking = serviceBookings.find((b: any) => b.id === commission.bookingId);
                    const service = serviceCatalog.find((s: any) => s.id === commission.serviceId);
                    
                    return (
                      <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getCategoryIcon(commission.category)}</div>
                          <div>
                            <div className="font-semibold">{service?.serviceName}</div>
                            <div className="text-sm text-gray-600">
                              Staff: {commission.staffId} • {commission.commissionRate}% rate
                            </div>
                            <div className="text-sm text-gray-600">
                              Booking: {booking?.guestName} on {booking?.serviceDate}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ฿{parseFloat(commission.commissionAmount).toLocaleString()}
                          </div>
                          <Badge className={commission.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {commission.paymentStatus}
                          </Badge>
                          {commission.paymentDate && (
                            <div className="text-xs text-gray-600 mt-1">
                              Paid: {new Date(commission.paymentDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Service Reports</CardTitle>
              <CardDescription>Performance analytics by category and month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-600 mt-2">Loading reports...</p>
                  </div>
                ) : (
                  serviceReports.map((report: any) => (
                    <div key={`${report.reportMonth}-${report.category}`} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                          <div>
                            <h3 className="font-semibold capitalize">{report.category} Services</h3>
                            <p className="text-sm text-gray-600">Report for {report.reportMonth}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            ฿{parseFloat(report.totalRevenue).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="font-semibold">{report.totalBookings}</div>
                          <div className="text-gray-600">Total Bookings</div>
                        </div>
                        <div>
                          <div className="font-semibold">฿{parseFloat(report.totalCommissions).toLocaleString()}</div>
                          <div className="text-gray-600">Commissions</div>
                        </div>
                        <div>
                          <div className="font-semibold">฿{parseFloat(report.averageBookingValue).toLocaleString()}</div>
                          <div className="text-gray-600">Avg. Booking</div>
                        </div>
                        <div>
                          <div className="font-semibold">{report.topService}</div>
                          <div className="text-gray-600">Top Service</div>
                        </div>
                        <div>
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="font-medium">Guest:</span> ฿{parseFloat(report.guestChargedRevenue).toLocaleString()}
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Owner:</span> ฿{parseFloat(report.ownerChargedRevenue).toLocaleString()}
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Comp:</span> ฿{parseFloat(report.complimentaryAmount).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Manage service categories and default settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceCategories.map((category: any) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(category.categoryName)}</span>
                      <div>
                        <h3 className="font-semibold capitalize">{category.categoryName}</h3>
                        <p className="text-xs text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Default Billing: <Badge className={getBillingRuleColor(category.defaultBillingRule)}>
                        {category.defaultBillingRule.replace("_", " ")}
                      </Badge></div>
                      <div>Commission Rate: {category.defaultCommissionRate}%</div>
                      <div>Display Order: {category.displayOrder}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Service Booking</DialogTitle>
            <DialogDescription>
              Book a service for a guest with flexible billing options
            </DialogDescription>
          </DialogHeader>
          <Form {...bookingForm}>
            <form onSubmit={bookingForm.handleSubmit((data) => createBookingMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bookingForm.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceCatalog.map((service: any) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {getCategoryIcon(service.category)} {service.serviceName} (฿{service.basePrice})
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
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property: any) => (
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bookingForm.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter guest name" {...field} />
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
                        <Input type="email" placeholder="guest@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bookingForm.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+66 XX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookingForm.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Count</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookingForm.control}
                  name="serviceTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Time</FormLabel>
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
                name="billingRule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Rule</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing rule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="guest_charged">Guest Charged - Guest pays for service</SelectItem>
                        <SelectItem value="owner_charged">Owner Charged - Owner covers service cost</SelectItem>
                        <SelectItem value="complimentary">Complimentary - Company gift</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bookingForm.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special requirements or requests..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBookingMutation.isPending}>
                  {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {selectedService ? "Update service details" : "Add a new service to the catalog"}
            </DialogDescription>
          </DialogHeader>
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit((data) => createServiceMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="serviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter service name" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceCategories.map((category: any) => (
                            <SelectItem key={category.id} value={category.categoryName}>
                              {getCategoryIcon(category.categoryName)} {category.categoryName}
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
                control={serviceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the service..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (THB)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={serviceForm.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="15.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={serviceForm.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={serviceForm.control}
                  name="advanceBookingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Booking (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Service provider name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={serviceForm.control}
                  name="providerContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone or email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={serviceForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createServiceMutation.isPending}>
                  {createServiceMutation.isPending ? "Saving..." : selectedService ? "Update Service" : "Add Service"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}