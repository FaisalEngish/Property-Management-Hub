import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Building, 
  CreditCard,
  PiggyBank,
  Eye,
  EyeOff,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  Target
} from "lucide-react";
import { z } from "zod";

// Zod schemas for form validation
const bookingRevenueFormSchema = z.object({
  propertyId: z.number(),
  guestBookingPrice: z.number().min(0),
  otaPlatformFee: z.number().min(0),
  finalPayout: z.number().min(0),
  reservationCode: z.string().min(1),
  guestName: z.string().min(1),
  guestEmail: z.string().email().optional(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  bookingType: z.enum(["direct", "ota"]),
  otaName: z.string().optional(),
  paymentStatus: z.enum(["pending", "processing", "completed", "failed"]),
  currency: z.string().default("USD"),
  commissionRate: z.number().min(0).max(1),
  notes: z.string().optional(),
});

type BookingRevenueForm = z.infer<typeof bookingRevenueFormSchema>;

// Types for data display
interface BookingRevenue {
  id: number;
  propertyId: number;
  propertyName: string;
  guestBookingPrice: number;
  otaPlatformFee: number;
  finalPayout: number;
  reservationCode: string;
  guestName: string;
  guestEmail?: string;
  checkInDate: string;
  checkOutDate: string;
  bookingType: "direct" | "ota";
  otaName?: string;
  paymentStatus: "pending" | "processing" | "completed" | "failed";
  currency: string;
  commissionRate: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
}

interface BookingCommission {
  id: number;
  bookingId: number;
  userType: string;
  userId: string;
  userName: string;
  commissionAmount: number;
  commissionRate: number;
  status: "pending" | "approved" | "paid";
  calculatedAt: string;
}

interface RevenueAnalytics {
  totalBookings: number;
  totalGuestPayments: number;
  totalOtaFees: number;
  totalActualPayouts: number;
  averageOtaCommissionRate: number;
  monthlyTrends: Array<{
    month: string;
    guestPayments: number;
    actualPayouts: number;
    otaFees: number;
  }>;
  platformBreakdown: Array<{
    platform: string;
    bookingCount: number;
    totalGuestPayments: number;
    totalPayouts: number;
    averageCommissionRate: number;
  }>;
}

interface OtaPlatformSetting {
  id: number;
  propertyId?: number;
  propertyName?: string;
  otaName: string;
  defaultCommissionRate: number;
  isActive: boolean;
  currency: string;
  notes?: string;
}

export default function BookingRevenueTransparency() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPlatformSettingsDialog, setShowPlatformSettingsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRevenue | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [filters, setFilters] = useState({
    propertyId: "",
    otaName: "",
    bookingType: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  // Queries
  const { data: bookingRevenues = [], isLoading: loadingRevenues } = useQuery({
    queryKey: ["/api/booking-revenue", filters],
    enabled: true,
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<RevenueAnalytics>({
    queryKey: ["/api/booking-revenue/analytics"],
    enabled: true,
  });

  const { data: otaSettings = [], isLoading: loadingOtaSettings } = useQuery<OtaPlatformSetting[]>({
    queryKey: ["/api/ota-platform-settings"],
    enabled: true,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    enabled: true,
  });

  // Form setup
  const form = useForm<BookingRevenueForm>({
    resolver: zodResolver(bookingRevenueFormSchema),
    defaultValues: {
      propertyId: 0,
      guestBookingPrice: 0,
      otaPlatformFee: 0,
      finalPayout: 0,
      reservationCode: "",
      guestName: "",
      guestEmail: "",
      checkInDate: "",
      checkOutDate: "",
      bookingType: "direct",
      otaName: "",
      paymentStatus: "pending",
      currency: "USD",
      commissionRate: 0.15,
      notes: "",
    },
  });

  // Mutations
  const createBookingRevenueMutation = useMutation({
    mutationFn: async (data: BookingRevenueForm) => {
      return apiRequest("POST", "/api/booking-revenue", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-revenue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/booking-revenue/analytics"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Success",
        description: "Booking revenue record created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateCommissionsMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest("POST", `/api/booking-revenue/${bookingId}/calculate-commissions`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-revenue"] });
      toast({
        title: "Success",
        description: "Commissions calculated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case "direct": return "bg-green-100 text-green-800";
      case "ota": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const onSubmit = (data: BookingRevenueForm) => {
    createBookingRevenueMutation.mutate(data);
  };

  const handleCalculateCommissions = (bookingId: number) => {
    calculateCommissionsMutation.mutate(bookingId);
  };

  if (loadingRevenues && loadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Booking Revenue & Payout Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive OTA commission transparency and revenue management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Booking Revenue
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPlatformSettingsDialog(true)}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Platform Settings
          </Button>
        </div>
      </div>

      {/* Critical Revenue Warning Banner */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Revenue Calculation Notice:</strong> All internal calculations (fees, commissions, splits) are based on net received payout amounts only. 
          OTA platform commissions are deducted before revenue distribution and are not part of your earnings.
        </AlertDescription>
      </Alert>

      {/* Analytics Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBookings}</div>
              <p className="text-xs text-muted-foreground">Active reservations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guest Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalGuestPayments)}</div>
              <p className="text-xs text-muted-foreground">Total charged to guests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OTA Commission Fees</CardTitle>
              <Banknote className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(analytics.totalOtaFees)}</div>
              <p className="text-xs text-muted-foreground">Deducted by OTA platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actual Payouts Received</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalActualPayouts)}</div>
              <p className="text-xs text-muted-foreground">Net revenue for distribution</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="bookings">Booking Records</TabsTrigger>
          <TabsTrigger value="commissions">Commission Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
        </TabsList>

        {/* Revenue Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Platform Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.platformBreakdown.map((platform) => (
                  <div key={platform.platform} className="mb-4 p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{platform.platform}</span>
                      <Badge variant="outline">{platform.bookingCount} bookings</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guest Payments:</span>
                        <span>{formatCurrency(platform.totalGuestPayments)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actual Payouts:</span>
                        <span className="text-green-600 font-medium">{formatCurrency(platform.totalPayouts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Commission:</span>
                        <span className="text-red-600">{(platform.averageCommissionRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Trends Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.monthlyTrends.map((month) => (
                    <div key={month.month} className="border-b pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{month.month}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Guest Payments</div>
                          <div className="font-medium">{formatCurrency(month.guestPayments)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">OTA Fees</div>
                          <div className="text-red-600">{formatCurrency(month.otaFees)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Net Payouts</div>
                          <div className="text-green-600 font-medium">{formatCurrency(month.actualPayouts)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Booking Records Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Booking Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="propertyFilter">Property</Label>
                  <Select value={filters.propertyId} onValueChange={(value) => setFilters({...filters, propertyId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Properties</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="otaFilter">OTA Platform</Label>
                  <Select value={filters.otaName} onValueChange={(value) => setFilters({...filters, otaName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Platforms</SelectItem>
                      <SelectItem value="Airbnb">Airbnb</SelectItem>
                      <SelectItem value="VRBO">VRBO</SelectItem>
                      <SelectItem value="Booking.com">Booking.com</SelectItem>
                      <SelectItem value="Direct">Direct Booking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="typeFilter">Booking Type</Label>
                  <Select value={filters.bookingType} onValueChange={(value) => setFilters({...filters, bookingType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="ota">OTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="statusFilter">Payment Status</Label>
                  <Select value={filters.paymentStatus} onValueChange={(value) => setFilters({...filters, paymentStatus: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Records List */}
          <div className="space-y-4">
            {bookingRevenues.map((booking: BookingRevenue) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{booking.reservationCode}</h3>
                        <Badge className={getBookingTypeColor(booking.bookingType)}>
                          {booking.bookingType === "ota" ? booking.otaName : "Direct"}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus}
                        </Badge>
                        {booking.isVerified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.guestName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.propertyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailedView(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalculateCommissions(booking.id)}
                        disabled={calculateCommissionsMutation.isPending}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Revenue Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Guest Total Payment</div>
                      <div className="text-lg font-semibold">{formatCurrency(booking.guestBookingPrice, booking.currency)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">OTA Platform Fee</div>
                      <div className="text-lg font-semibold text-red-600">
                        -{formatCurrency(booking.otaPlatformFee, booking.currency)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Actual Payout Received</div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(booking.finalPayout, booking.currency)}
                      </div>
                    </div>
                  </div>

                  {booking.bookingType === "ota" && (
                    <Alert className="mt-4 border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>OTA Commission Notice:</strong> This booking was sold for {formatCurrency(booking.guestBookingPrice, booking.currency)} 
                        but actual payout is {formatCurrency(booking.finalPayout, booking.currency)}. 
                        The difference of {formatCurrency(booking.otaPlatformFee, booking.currency)} is the {booking.otaName} platform commission.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Commission Tracking Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                All commission calculations are based on net payout amounts received after OTA deductions
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Commission tracking details will be displayed here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a booking to calculate and view commission breakdowns
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{(analytics.averageOtaCommissionRate * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Average OTA Commission Rate</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {((analytics.totalActualPayouts / analytics.totalGuestPayments) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Net Revenue Retention Rate</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency((analytics.totalOtaFees / analytics.totalBookings))}
                      </div>
                      <div className="text-sm text-muted-foreground">Average OTA Fee per Booking</div>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Revenue Report
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Commission Report
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Booking Revenue Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Booking Revenue Record</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="reservationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reservation Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reservation code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter guest email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkInDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOutDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select booking type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="direct">Direct Booking</SelectItem>
                          <SelectItem value="ota">OTA Platform</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("bookingType") === "ota" && (
                  <FormField
                    control={form.control}
                    name="otaName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTA Platform</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select OTA platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Airbnb">Airbnb</SelectItem>
                            <SelectItem value="VRBO">VRBO</SelectItem>
                            <SelectItem value="Booking.com">Booking.com</SelectItem>
                            <SelectItem value="Expedia">Expedia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="guestBookingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Total Payment</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otaPlatformFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OTA Platform Fee</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalPayout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Payout Received</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="THB">THB</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Rate</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="1" 
                          placeholder="0.15" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBookingRevenueMutation.isPending}>
                  {createBookingRevenueMutation.isPending ? "Creating..." : "Create Booking Revenue"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detailed Booking View Dialog */}
      {selectedBooking && (
        <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Booking Revenue Details - {selectedBooking.reservationCode}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Guest & Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Guest Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedBooking.guestName}</span>
                    </div>
                    {selectedBooking.guestEmail && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedBooking.guestEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property:</span>
                      <span className="font-medium">{selectedBooking.propertyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <Badge className={getBookingTypeColor(selectedBooking.bookingType)}>
                        {selectedBooking.bookingType === "ota" ? selectedBooking.otaName : "Direct"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">{selectedBooking.currency}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Guest Total Payment</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedBooking.guestBookingPrice, selectedBooking.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Amount charged to guest</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">OTA Platform Fee</div>
                      <div className="text-2xl font-bold text-red-600">
                        -{formatCurrency(selectedBooking.otaPlatformFee, selectedBooking.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {((selectedBooking.otaPlatformFee / selectedBooking.guestBookingPrice) * 100).toFixed(1)}% commission
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Final Payout Received</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedBooking.finalPayout, selectedBooking.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Net revenue for distribution</div>
                    </div>
                  </div>

                  {selectedBooking.bookingType === "ota" && (
                    <Alert className="mt-4 border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>Commission Calculation Notice:</strong> All internal calculations (management fees, commissions, owner splits) 
                        will be based on the final payout amount of {formatCurrency(selectedBooking.finalPayout, selectedBooking.currency)} only. 
                        The {formatCurrency(selectedBooking.otaPlatformFee, selectedBooking.currency)} {selectedBooking.otaName} commission 
                        is not part of distributable revenue.
                      </AlertDescription>
                    </Alert>
                  )}

                  {selectedBooking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Notes:</div>
                      <div className="text-sm text-muted-foreground">{selectedBooking.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailedView(false)}>
                  Close
                </Button>
                <Button onClick={() => handleCalculateCommissions(selectedBooking.id)}>
                  Calculate Commissions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}