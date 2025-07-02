import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, Settings, FileText, Bell, Download, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Types for owner dashboard data
interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  upcomingBookings: number;
  completedTasks: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  properties: any[];
}

interface FinancialSummary {
  rentalIncome: number;
  managementFees: number;
  addonRevenue: number;
  utilityDeductions: number;
  serviceDeductions: number;
  netBalance: number;
  breakdown: any[];
}

interface ActivityItem {
  id: number;
  activityType: string;
  title: string;
  description?: string;
  propertyName?: string;
  createdAt: string;
  metadata?: any;
}

interface Booking {
  id: number;
  guestName: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  status: string;
  source: string;
  revenue: number;
}

interface PayoutRequest {
  id: number;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  requestNotes?: string;
  adminNotes?: string;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceType: string;
  title: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  propertyName?: string;
  pdfUrl?: string;
}

interface OwnerPreferences {
  taskApprovalRequired: boolean;
  maintenanceAlerts: boolean;
  guestAddonNotifications: boolean;
  financialNotifications: boolean;
  weeklyReports: boolean;
  preferredCurrency: string;
  notificationEmail?: string;
}

// Schema for payout request form
const payoutRequestSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  periodStart: z.string().min(1, "Start date is required"),
  periodEnd: z.string().min(1, "End date is required"),
  requestNotes: z.string().optional(),
});

// Schema for preferences form
const preferencesSchema = z.object({
  taskApprovalRequired: z.boolean(),
  maintenanceAlerts: z.boolean(),
  guestAddonNotifications: z.boolean(),
  financialNotifications: z.boolean(),
  weeklyReports: z.boolean(),
  preferredCurrency: z.string(),
  notificationEmail: z.string().email().optional(),
});

export default function OwnerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  // Dashboard stats query
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/owner/dashboard/stats", dateRange.startDate, dateRange.endDate, selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/stats?${params}`);
    },
  });

  // Financial summary query
  const { data: financialSummary, isLoading: financialLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/owner/dashboard/financial-summary", dateRange.startDate, dateRange.endDate, selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/financial-summary?${params}`);
    },
  });

  // Activity timeline query
  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/owner/dashboard/activity", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "20",
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/activity?${params}`);
    },
  });

  // Bookings query
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/owner/dashboard/bookings", dateRange.startDate, dateRange.endDate, selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/bookings?${params}`);
    },
  });

  // Payout requests query
  const { data: payouts, isLoading: payoutsLoading } = useQuery<PayoutRequest[]>({
    queryKey: ["/api/owner/dashboard/payouts"],
    queryFn: () => apiRequest("GET", "/api/owner/dashboard/payouts"),
  });

  // Invoices query
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/owner/dashboard/invoices", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/invoices?${params}`);
    },
  });

  // Preferences query
  const { data: preferences } = useQuery<OwnerPreferences>({
    queryKey: ["/api/owner/dashboard/preferences"],
    queryFn: () => apiRequest("GET", "/api/owner/dashboard/preferences"),
  });

  // Payout request mutation
  const payoutMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/owner/dashboard/payouts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/dashboard/payouts"] });
      toast({ title: "Payout Request Submitted", description: "Your payout request has been submitted for approval." });
      setShowPayoutDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Preferences mutation
  const preferencesMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/owner/dashboard/preferences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/dashboard/preferences"] });
      toast({ title: "Preferences Updated", description: "Your notification preferences have been saved." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Payout request form
  const payoutForm = useForm({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      amount: "",
      periodStart: dateRange.startDate,
      periodEnd: dateRange.endDate,
      requestNotes: "",
    },
  });

  // Preferences form
  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferences || {
      taskApprovalRequired: false,
      maintenanceAlerts: true,
      guestAddonNotifications: true,
      financialNotifications: true,
      weeklyReports: true,
      preferredCurrency: "AUD",
      notificationEmail: "",
    },
  });

  // Update preferences form when data loads
  useEffect(() => {
    if (preferences) {
      preferencesForm.reset(preferences);
    }
  }, [preferences, preferencesForm]);

  const onPayoutSubmit = (data: any) => {
    payoutMutation.mutate(data);
  };

  const onPreferencesSubmit = (data: any) => {
    preferencesMutation.mutate(data);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      "checked-in": "bg-blue-100 text-blue-800",
      "checked-out": "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  // Activity type icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check_in':
      case 'check_out':
        return <Calendar className="h-4 w-4" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'guest_feedback':
        return <Bell className="h-4 w-4" />;
      case 'addon_booking':
        return <TrendingUp className="h-4 w-4" />;
      case 'bill_uploaded':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (statsLoading || financialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your properties, view financial reports, and track activity
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-40"
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-40"
            />
          </div>
          
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {stats?.properties?.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialSummary?.netBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Net balance after fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.upcomingBookings || 0} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingPayouts || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.pendingPayoutAmount?.toLocaleString() || '0'} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="timeline">Activity</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Revenue breakdown for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Rental Income</span>
                  <span className="font-semibold text-green-600">
                    +${financialSummary?.rentalIncome?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Add-on Revenue</span>
                  <span className="font-semibold text-green-600">
                    +${financialSummary?.addonRevenue?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Management Fees</span>
                  <span className="font-semibold text-red-600">
                    -${financialSummary?.managementFees?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Utility Deductions</span>
                  <span className="font-semibold text-red-600">
                    -${financialSummary?.utilityDeductions?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Deductions</span>
                  <span className="font-semibold text-red-600">
                    -${financialSummary?.serviceDeductions?.toLocaleString() || '0'}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Balance</span>
                  <span className={financialSummary?.netBalance >= 0 ? "text-green-600" : "text-red-600"}>
                    ${financialSummary?.netBalance?.toLocaleString() || '0'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest property activity and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activitiesLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : activities?.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.propertyName && (
                          <p className="text-xs text-muted-foreground">{activity.propertyName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(activity.createdAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Overview</CardTitle>
              <CardDescription>All bookings for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : (
                <div className="space-y-4">
                  {bookings?.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">{booking.propertyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(booking.startDate), 'MMM d')} - {format(parseISO(booking.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <p className="font-semibold">${booking.revenue?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{booking.source}</p>
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No bookings found for the selected period
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Chronological activity across all properties</CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="text-center py-8">Loading activity...</div>
              ) : (
                <div className="space-y-4">
                  {activities?.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="mt-1">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(activity.createdAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        
                        {activity.propertyName && (
                          <p className="text-sm text-muted-foreground">{activity.propertyName}</p>
                        )}
                        
                        {activity.description && (
                          <p className="text-sm">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Detailed Financial Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
                <CardDescription>Financial transactions by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialSummary?.breakdown?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {item.category?.replace('_', ' ') || item.source}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.count} transaction(s)
                        </p>
                      </div>
                      <span className={`font-semibold ${
                        item.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.type === 'income' ? '+' : '-'}${item.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Financial Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Monthly summaries and service charges</CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="text-center py-4">Loading invoices...</div>
                ) : (
                  <div className="space-y-3">
                    {invoices?.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{invoice.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(invoice.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <p className="font-semibold">${invoice.amount?.toLocaleString()}</p>
                          <StatusBadge status={invoice.status} />
                          {invoice.pdfUrl && (
                            <Button size="sm" variant="outline" className="ml-2">
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-muted-foreground">
                        No invoices available
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Payout Requests</h3>
              <p className="text-sm text-muted-foreground">
                Request payouts and track payment status
              </p>
            </div>
            
            <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
              <DialogTrigger asChild>
                <Button>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                  <DialogDescription>
                    Submit a payout request for approval by the management team
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...payoutForm}>
                  <form onSubmit={payoutForm.handleSubmit(onPayoutSubmit)} className="space-y-4">
                    <FormField
                      control={payoutForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={payoutForm.control}
                        name="periodStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Period Start</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={payoutForm.control}
                        name="periodEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Period End</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={payoutForm.control}
                      name="requestNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional details..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowPayoutDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={payoutMutation.isPending}>
                        {payoutMutation.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {payoutsLoading ? (
                <div className="text-center py-8">Loading payout requests...</div>
              ) : (
                <div className="space-y-4">
                  {payouts?.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">${payout.amount?.toLocaleString()} {payout.currency}</p>
                        <p className="text-sm text-muted-foreground">
                          Period: {format(parseISO(payout.periodStart), 'MMM d')} - {format(parseISO(payout.periodEnd), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested: {format(parseISO(payout.requestedAt), 'MMM d, yyyy')}
                        </p>
                        {payout.requestNotes && (
                          <p className="text-xs text-muted-foreground">
                            Notes: {payout.requestNotes}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right space-y-2">
                        <StatusBadge status={payout.status} />
                        {payout.paymentMethod && (
                          <p className="text-xs text-muted-foreground">
                            {payout.paymentMethod}
                            {payout.paymentReference && ` - ${payout.paymentReference}`}
                          </p>
                        )}
                        {payout.status === 'completed' && payout.completedAt && (
                          <p className="text-xs text-muted-foreground">
                            Completed: {format(parseISO(payout.completedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No payout requests found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...preferencesForm}>
                <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="taskApprovalRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Task Approval Required</FormLabel>
                            <FormDescription>
                              Require your approval before tasks are marked as complete
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="maintenanceAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Maintenance Alerts</FormLabel>
                            <FormDescription>
                              Receive notifications about maintenance suggestions and issues
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="guestAddonNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Guest Add-on Notifications</FormLabel>
                            <FormDescription>
                              Get notified when guests book additional services
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="financialNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Financial Notifications</FormLabel>
                            <FormDescription>
                              Receive updates about payments, invoices, and financial summaries
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="weeklyReports"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Reports</FormLabel>
                            <FormDescription>
                              Get weekly summary reports of property performance
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="preferredCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Currency</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AUD">AUD (Australian Dollar)</SelectItem>
                                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                                <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="notificationEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Alternative email for receiving notifications (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={preferencesMutation.isPending}>
                    {preferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}