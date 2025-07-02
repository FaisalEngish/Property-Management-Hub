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
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Settings, 
  FileText, 
  Bell, 
  Download, 
  Upload, 
  X,
  Eye,
  EyeOff,
  Camera,
  MessageSquare,
  Star,
  MapPin,
  Users,
  Wifi,
  Bot,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Edit,
  Trash,
  Search,
  MoreHorizontal,
  ExternalLink,
  Lightbulb,
  Wrench,
  BarChart3,
  MessageCircle,
  Building,
  CreditCard,
  Receipt,
  CalendarDays,
  Activity,
  WifiOff,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Enhanced types for comprehensive owner dashboard
interface DashboardStats {
  currentBalance: number;
  averageNightlyRate: number;
  totalEarnings: {
    thisMonth: number;
    thisYear: number;
    customPeriod: number;
  };
  upcomingBookings: number;
  bookingSources: {
    airbnb: number;
    vrbo: number;
    bookingCom: number;
    direct: number;
    marriott: number;
  };
  properties: any[];
}

interface FinancialSummary {
  rentalIncome: number;
  managementFees: number;
  addonRevenue: number;
  utilityDeductions: number;
  serviceDeductions: number;
  welcomePackCosts: number;
  netBalance: number;
  breakdown: any[];
}

interface ActivityItem {
  id: number;
  activityType: 'check_in' | 'check_out' | 'task_completed' | 'maintenance_suggestion' | 'ai_suggestion' | 'guest_feedback';
  title: string;
  description?: string;
  propertyName?: string;
  createdAt: string;
  metadata?: {
    photos?: string[];
    guestName?: string;
    taskId?: number;
    cost?: number;
    aiConfidence?: number;
    reviewSource?: string;
  };
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

// Enhanced schemas
const aiSuggestionSchema = z.object({
  suggestion: z.string().min(1, "Suggestion is required"),
  estimatedCost: z.number().min(0, "Cost must be positive"),
  priority: z.enum(["low", "medium", "high"]),
  reason: z.string().min(1, "Reason is required"),
});

const invoiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0, "Amount must be positive"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  recipientType: z.enum(["from_owner", "to_owner", "to_manager", "to_vendor"]),
});

export default function OwnerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Enhanced state management
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [earningsPeriod, setEarningsPeriod] = useState<'month' | 'year' | 'custom'>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showAiSuggestionDialog, setShowAiSuggestionDialog] = useState(false);
  const [selectedAiSuggestion, setSelectedAiSuggestion] = useState<any>(null);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  // Enhanced queries for comprehensive dashboard data
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

  // Financial summary with enhanced breakdown
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

  // AI suggestions for property improvements
  const { data: aiSuggestions, isLoading: aiLoading } = useQuery({
    queryKey: ["/api/owner/dashboard/ai-suggestions", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/ai-suggestions?${params}`);
    },
  });

  // Enhanced activity timeline with photos and AI insights
  const { data: activityTimeline, isLoading: activityLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/owner/dashboard/activity-timeline", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
        days: "7", // Last 7 days
      });
      return apiRequest("GET", `/api/owner/dashboard/activity-timeline?${params}`);
    },
  });

  // Recent bookings with enhanced details
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/owner/dashboard/recent-bookings", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
        limit: "10",
      });
      return apiRequest("GET", `/api/owner/dashboard/recent-bookings?${params}`);
    },
  });

  // Booking insights with OTA sync status
  const { data: bookingInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/owner/dashboard/booking-insights", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/booking-insights?${params}`);
    },
  });

  // Payout requests and financial history
  const { data: payoutRequests, isLoading: payoutsLoading } = useQuery<PayoutRequest[]>({
    queryKey: ["/api/owner/dashboard/payout-requests"],
    queryFn: () => apiRequest("GET", "/api/owner/dashboard/payout-requests"),
  });

  // Invoice history with enhanced filtering
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/owner/dashboard/invoices", selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
      });
      return apiRequest("GET", `/api/owner/dashboard/invoices?${params}`);
    },
  });

  // Owner preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<OwnerPreferences>({
    queryKey: ["/api/owner/dashboard/preferences"],
    queryFn: () => apiRequest("GET", "/api/owner/dashboard/preferences"),
  });

  // Properties for filtering
  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => apiRequest("GET", "/api/properties"),
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Villa Logbook</h1>
          <p className="text-gray-500 mt-1">Comprehensive property management dashboard</p>
        </div>
        
        {/* Date Range and Property Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-[200px]">
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
          
          <div className="flex gap-2">
            <Button
              variant={earningsPeriod === 'month' ? 'default' : 'outline'}
              onClick={() => setEarningsPeriod('month')}
              size="sm"
            >
              This Month
            </Button>
            <Button
              variant={earningsPeriod === 'year' ? 'default' : 'outline'}
              onClick={() => setEarningsPeriod('year')}
              size="sm"
            >
              This Year
            </Button>
          </div>
        </div>
      </div>

      {/* Key Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats?.currentBalance?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Nightly Rate</p>
                <p className="text-2xl font-bold">
                  ${stats?.averageNightlyRate?.toFixed(0) || '0'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Bookings</p>
                <p className="text-2xl font-bold">
                  {stats?.upcomingBookings || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Properties</p>
                <p className="text-2xl font-bold">
                  {stats?.properties?.length || 0}
                </p>
              </div>
              <Building className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="villa-logbook">Villa Logbook</TabsTrigger>
          <TabsTrigger value="ai-companion">AI Companion</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
                <CardDescription>
                  Revenue breakdown for {earningsPeriod === 'month' ? 'this month' : 'this year'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Rental Income</span>
                    <span className="font-medium text-green-600">
                      +${financialSummary?.rentalIncome?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Add-on Revenue</span>
                    <span className="font-medium text-green-600">
                      +${financialSummary?.addonRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Management Fees</span>
                    <span className="font-medium text-red-600">
                      -${financialSummary?.managementFees?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Service Deductions</span>
                    <span className="font-medium text-red-600">
                      -${financialSummary?.serviceDeductions?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Balance</span>
                      <span className="font-bold text-lg">
                        ${financialSummary?.netBalance?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Request Payout
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Payout</DialogTitle>
                        <DialogDescription>
                          Submit a payout request for your available balance
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
                          <FormField
                            control={payoutForm.control}
                            name="requestNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Additional notes..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={payoutMutation.isPending}
                            >
                              {payoutMutation.isPending ? "Submitting..." : "Submit Request"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Booking Sources Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Booking Sources
                </CardTitle>
                <CardDescription>
                  Revenue distribution by platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {stats?.bookingSources && Object.entries(stats.bookingSources).map(([source, count]: [string, any]) => (
                    <div key={source} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{count} bookings</span>
                        <Badge variant="outline">{((count / Object.values(stats.bookingSources).reduce((a: any, b: any) => a + b, 0)) * 100).toFixed(0)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityTimeline?.slice(0, 5).map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.title}</p>
                        <time className="text-sm text-gray-500">
                          {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                        </time>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      {activity.propertyName && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {activity.propertyName}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {activityTimeline?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Villa Logbook Tab */}
        <TabsContent value="villa-logbook" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Activity Timeline with Photos */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Guest Activity Timeline
                  </CardTitle>
                  <CardDescription>
                    Real-time updates with photos and guest interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityTimeline?.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.activityType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <time className="text-sm text-gray-500">
                                {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                              </time>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            
                            {activity.propertyName && (
                              <Badge variant="secondary" className="mt-2">
                                {activity.propertyName}
                              </Badge>
                            )}

                            {/* Enhanced metadata display */}
                            {activity.metadata && (
                              <div className="mt-3 space-y-2">
                                {activity.metadata.photos && (
                                  <div className="grid grid-cols-3 gap-2">
                                    {activity.metadata.photos.map((photo, index) => (
                                      <div key={index} className="relative group cursor-pointer">
                                        <img 
                                          src={photo}
                                          alt={`Activity photo ${index + 1}`}
                                          className="w-full h-20 object-cover rounded border"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                                          <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {activity.metadata.guestName && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4" />
                                    <span>{activity.metadata.guestName}</span>
                                  </div>
                                )}

                                {activity.metadata.cost && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${activity.metadata.cost}</span>
                                  </div>
                                )}

                                {activity.metadata.aiConfidence && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Bot className="h-4 w-4" />
                                    <span>AI Confidence: {(activity.metadata.aiConfidence * 100).toFixed(0)}%</span>
                                  </div>
                                )}

                                {activity.metadata.reviewSource && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Star className="h-4 w-4" />
                                    <span>Review from {activity.metadata.reviewSource}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Expandable details */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-8"
                              onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                            >
                              {expandedActivity === activity.id ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Show More
                                </>
                              )}
                            </Button>

                            {expandedActivity === activity.id && (
                              <div className="mt-3 p-3 bg-gray-50 rounded border">
                                <p className="text-sm text-gray-700">
                                  Extended details about this activity would be shown here, including 
                                  full guest communications, task progress, or maintenance reports.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property Quick Stats & Insights */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Property Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Occupancy Rate</span>
                      <span className="font-medium">{bookingInsights?.occupancyRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{bookingInsights?.averageRating || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Response Rate</span>
                      <span className="font-medium">{bookingInsights?.responseRate || 0}%</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">OTA Sync Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Hostaway</span>
                        <Badge variant={bookingInsights?.otaConnectionStatus?.hostaway === 'connected' ? 'default' : 'destructive'}>
                          {bookingInsights?.otaConnectionStatus?.hostaway || 'Disconnected'}
                        </Badge>
                      </div>
                      {bookingInsights?.otaConnectionStatus?.lastSync && (
                        <p className="text-xs text-gray-500">
                          Last sync: {format(new Date(bookingInsights.otaConnectionStatus.lastSync), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Revenue Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookingInsights?.sources && Object.entries(bookingInsights.sources).map(([source, data]: [string, any]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm capitalize">{source}</span>
                          <Badge variant="outline" className="text-xs">
                            {data.syncStatus}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${data.revenue?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{data.bookings} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI Companion Tab */}
        <TabsContent value="ai-companion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Property Companion
              </CardTitle>
              <CardDescription>
                Intelligent insights and suggestions based on guest feedback and property data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Suggestions */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Smart Suggestions
                  </h3>
                  
                  {aiSuggestions?.map((suggestion: any) => (
                    <div key={suggestion.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}>
                              {suggestion.priority} priority
                            </Badge>
                            <Badge variant="outline">
                              {(suggestion.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>Est. Cost: ${suggestion.estimatedCost}</span>
                            <span>Source: {suggestion.sourceCount} guest reviews</span>
                          </div>
                          
                          {suggestion.aiAnalysis && (
                            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                              <strong>AI Analysis:</strong> {suggestion.aiAnalysis}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Get Quote
                        </Button>
                        <Button size="sm" variant="ghost">
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!aiSuggestions || aiSuggestions.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No AI suggestions at the moment</p>
                      <p className="text-sm">I'm analyzing guest feedback to provide insights</p>
                    </div>
                  )}
                </div>

                {/* Guest Review Analysis */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Guest Sentiment Analysis
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Recent Review Sentiment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Positive Mentions</span>
                          <span className="font-medium text-green-600">87%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Neutral Feedback</span>
                          <span className="font-medium text-gray-600">10%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Issues Identified</span>
                          <span className="font-medium text-red-600">3%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Trending Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Clean', 'Beautiful View', 'Great Location', 'Pool', 'WiFi Slow', 'Comfortable'].map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Improvement Areas</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-red-500" />
                          <span>Internet speed mentioned in 3 reviews</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-yellow-500" />
                          <span>Pool maintenance noted by 2 guests</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Detailed breakdown of your property income and expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Total Revenue</span>
                    <span className="font-bold text-green-600 text-lg">
                      ${(financialSummary?.rentalIncome || 0) + (financialSummary?.addonRevenue || 0)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Income</span>
                      <span className="font-medium">${financialSummary?.rentalIncome || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Add-on Services</span>
                      <span className="font-medium">${financialSummary?.addonRevenue || 0}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-medium text-red-600">Deductions</h4>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Management Fees</span>
                      <span className="text-red-600">-${financialSummary?.managementFees || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Charges</span>
                      <span className="text-red-600">-${financialSummary?.serviceDeductions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utility Costs</span>
                      <span className="text-red-600">-${financialSummary?.utilityDeductions || 0}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-bold">Net Balance</span>
                      <span className="font-bold text-lg">
                        ${financialSummary?.netBalance || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Requests</CardTitle>
                <CardDescription>Track your payout requests and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutRequests?.slice(0, 5).map((payout) => (
                    <div key={payout.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">${payout.amount} {payout.currency}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(payout.periodStart), 'MMM d')} - {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Requested {format(new Date(payout.requestedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <StatusBadge status={payout.status} />
                      </div>
                      
                      {payout.requestNotes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{payout.requestNotes}"
                        </p>
                      )}
                      
                      {payout.adminNotes && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <strong>Admin Note:</strong> {payout.adminNotes}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!payoutRequests || payoutRequests.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No payout requests yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and download your property-related invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices?.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium">{invoice.title}</h4>
                          <p className="text-sm text-gray-500">
                            {invoice.invoiceNumber} • {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                          </p>
                          {invoice.propertyName && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {invoice.propertyName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount} {invoice.currency}</p>
                        <StatusBadge status={invoice.status} />
                      </div>
                      
                      {invoice.pdfUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!invoices || invoices.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize how you receive updates about your properties
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
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Task Approval Required</FormLabel>
                            <FormDescription>
                              Require your approval before staff can complete high-cost maintenance tasks
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
                      control={preferencesForm.control}
                      name="maintenanceAlerts"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Maintenance Alerts</FormLabel>
                            <FormDescription>
                              Get notified when maintenance issues are reported or completed
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
                      control={preferencesForm.control}
                      name="guestAddonNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Guest Add-on Notifications</FormLabel>
                            <FormDescription>
                              Receive updates when guests book additional services
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
                      control={preferencesForm.control}
                      name="financialNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Financial Notifications</FormLabel>
                            <FormDescription>
                              Get notified about payments, payouts, and financial summaries
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
                      control={preferencesForm.control}
                      name="weeklyReports"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Weekly Reports</FormLabel>
                            <FormDescription>
                              Receive weekly property performance and financial summaries
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

                  <div className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="preferredCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
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
                            Alternative email for important notifications (optional)
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