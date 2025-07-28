import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Link } from "wouter";
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
  Plus,
  Minus,
  BarChart3,
  Building,
  User,
  Receipt,
  Eye,
  ExternalLink,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import AdminBalanceResetCard from "@/components/ui/AdminBalanceResetCard";

// Types for PM dashboard data
interface FinancialOverview {
  totalCommissionEarnings: number;
  propertyBreakdown: PropertyBreakdown[];
  monthlyTrend: MonthlyTrend[];
  pendingBalance: number;
}

interface PropertyBreakdown {
  propertyId: number;
  propertyName: string;
  totalRevenue: number;
  commissionEarned: number;
  bookingCount: number;
}

interface MonthlyTrend {
  period: string;
  earnings: number;
}

interface CommissionBalance {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  lastPayoutDate?: string;
}

interface PayoutRequest {
  id: number;
  amount: number;
  currency: string;
  requestNotes?: string;
  adminNotes?: string;
  status: string;
  receiptUrl?: string;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
}

interface TaskLog {
  id: number;
  taskTitle: string;
  department: string;
  staffAssigned?: string;
  status: string;
  completedAt?: string;
  evidencePhotos?: string[];
  receipts?: string[];
  result?: string;
  notes?: string;
  propertyName?: string;
  createdAt: string;
}

interface PMNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  actionRequired: boolean;
  isRead: boolean;
  createdAt: string;
  relatedType?: string;
  relatedId?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  receiverName: string;
  invoiceType: string;
  description: string;
  totalAmount: number;
  status: string;
  dueDate?: string;
  createdAt: string;
}

// Form schemas
const payoutRequestSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  requestNotes: z.string().optional(),
});

const invoiceLineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
});

const invoiceSchema = z.object({
  receiverType: z.enum(["user", "organization", "external"]),
  receiverId: z.string().optional(),
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverAddress: z.string().optional(),
  invoiceType: z.string().min(1, "Invoice type is required"),
  description: z.string().min(1, "Description is required"),
  lineItems: z.array(invoiceLineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export default function PortfolioManagerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedPortfolioManager, setSelectedPortfolioManager] = useState<string>(""); // For admin to select PM
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [taskFilters, setTaskFilters] = useState({
    department: "all",
    status: "all",
    search: "",
  });

  // Check if current user is admin
  const isAdmin = (user as any)?.role === 'admin';
  
  // Portfolio Managers Query (for admin dropdown)
  const { data: portfolioManagers = [] } = useQuery({
    queryKey: ["/api/users", "portfolio-manager"],
    queryFn: () => apiRequest("GET", "/api/users?role=portfolio-manager"),
    enabled: isAdmin,
  });

  // Set default selected PM for admin (first PM in list) or current user for PM
  useEffect(() => {
    if (isAdmin && portfolioManagers.length > 0 && !selectedPortfolioManager) {
      setSelectedPortfolioManager(portfolioManagers[0]?.id);
    } else if (!isAdmin && (user as any)?.id) {
      setSelectedPortfolioManager((user as any)?.id);
    }
  }, [isAdmin, portfolioManagers, user, selectedPortfolioManager]);

  // Financial Overview Query
  const { data: financialOverview, isLoading: financialLoading } = useQuery<FinancialOverview>({
    queryKey: ["/api/pm/dashboard/financial-overview", dateRange.startDate, dateRange.endDate, selectedProperty, selectedPortfolioManager],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
        ...(selectedPortfolioManager && { portfolioManagerId: selectedPortfolioManager }),
      });
      return apiRequest("GET", `/api/pm/dashboard/financial-overview?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Commission Balance Query
  const { data: balance, isLoading: balanceLoading } = useQuery<CommissionBalance>({
    queryKey: ["/api/pm/dashboard/balance", selectedPortfolioManager],
    queryFn: () => {
      const params = new URLSearchParams({
        ...(selectedPortfolioManager && { portfolioManagerId: selectedPortfolioManager }),
      });
      return apiRequest("GET", `/api/pm/dashboard/balance?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Payout Requests Query
  const { data: payouts, isLoading: payoutsLoading } = useQuery<PayoutRequest[]>({
    queryKey: ["/api/pm/dashboard/payouts", selectedPortfolioManager],
    queryFn: () => {
      const params = new URLSearchParams({
        ...(selectedPortfolioManager && { portfolioManagerId: selectedPortfolioManager }),
      });
      return apiRequest("GET", `/api/pm/dashboard/payouts?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Task Logs Query
  const { data: taskLogs, isLoading: taskLogsLoading } = useQuery<TaskLog[]>({
    queryKey: ["/api/pm/dashboard/task-logs", taskFilters.department, taskFilters.status, dateRange.startDate, dateRange.endDate, selectedPortfolioManager],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: "100",
        ...(taskFilters.department !== "all" && { department: taskFilters.department }),
        ...(taskFilters.status !== "all" && { status: taskFilters.status }),
        ...(selectedPortfolioManager && { portfolioManagerId: selectedPortfolioManager }),
      });
      return apiRequest("GET", `/api/pm/dashboard/task-logs?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Portfolio Properties Query
  const { data: portfolioProperties = [] } = useQuery({
    queryKey: ["/api/pm/dashboard/portfolio", selectedPortfolioManager],
    queryFn: () => {
      const params = new URLSearchParams({
        ...(selectedPortfolioManager && { portfolioManagerId: selectedPortfolioManager }),
      });
      return apiRequest("GET", `/api/pm/dashboard/portfolio?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // PM Notifications Query
  const { data: notifications, isLoading: notificationsLoading } = useQuery<PMNotification[]>({
    queryKey: ["/api/pm/dashboard/notifications", selectedPortfolioManager],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: "20",
        ...(selectedPortfolioManager && { portfolioManagerId: selectedPortfolioManager }),
      });
      return apiRequest("GET", `/api/pm/dashboard/notifications?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Invoices Query
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/pm/dashboard/invoices"],
    queryFn: () => apiRequest("GET", "/api/pm/dashboard/invoices"),
  });

  // Payout Request Mutation
  const payoutMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/pm/dashboard/payouts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/balance"] });
      toast({ title: "Payout Request Submitted", description: "Your payout request has been submitted for approval." });
      setShowPayoutDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Payment Received Mutation
  const paymentReceivedMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/pm/dashboard/payouts/${id}/received`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/balance"] });
      toast({ title: "Payment Confirmed", description: "Payment receipt confirmed successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Invoice Creation Mutation
  const invoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/pm/dashboard/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/invoices"] });
      toast({ title: "Invoice Created", description: "Invoice has been created successfully." });
      setShowInvoiceDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mark Notification as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/pm/dashboard/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/notifications"] });
    },
  });

  // Forms
  const payoutForm = useForm({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      amount: "",
      requestNotes: "",
    },
  });

  const invoiceForm = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      receiverType: "organization" as const,
      receiverId: "",
      receiverName: "",
      receiverAddress: "",
      invoiceType: "management_commission",
      description: "",
      lineItems: [{ description: "", quantity: "1", unitPrice: "", referenceId: "", referenceType: "" }],
      taxRate: "10",
      notes: "",
      dueDate: "",
      referenceNumber: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: invoiceForm.control,
    name: "lineItems",
  });

  const onPayoutSubmit = (data: any) => {
    payoutMutation.mutate(data);
  };

  const onInvoiceSubmit = (data: any) => {
    invoiceMutation.mutate(data);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  // Department color mapping
  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      cleaning: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      gardening: "bg-green-100 text-green-800",
      pool: "bg-cyan-100 text-cyan-800",
      security: "bg-red-100 text-red-800",
      inspection: "bg-purple-100 text-purple-800",
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  // Severity icons
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (financialLoading || balanceLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Manager Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              {isAdmin ? "Viewing data for:" : "Manage your portfolio, track commissions, and create invoices"}
            </p>
            {isAdmin && selectedPortfolioManager && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <User className="h-3 w-3 mr-1" />
                {portfolioManagers.find(pm => pm.id === selectedPortfolioManager)?.name || "Portfolio Manager"}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4">
          {/* Portfolio Manager Selection (Admin Only) */}
          {isAdmin && (
            <Select value={selectedPortfolioManager} onValueChange={setSelectedPortfolioManager}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select Portfolio Manager">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {portfolioManagers.find(pm => pm.id === selectedPortfolioManager)?.name || "Select Portfolio Manager"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {portfolioManagers.map((pm: any) => (
                  <SelectItem key={pm.id} value={pm.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {pm.name} ({pm.email})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
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
              {(portfolioProperties && Array.isArray(portfolioProperties) ? portfolioProperties : [])?.map((property: any) => (
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
            <CardTitle className="text-sm font-medium">Total Commission Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialOverview?.totalCommissionEarnings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              From management fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(portfolioProperties && Array.isArray(portfolioProperties) ? portfolioProperties.length : 0) || 0}</div>
            <p className="text-xs text-muted-foreground">
              Under management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balance?.currentBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(notifications && Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="tasks">Task Logs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Portfolio Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Management</CardTitle>
              <CardDescription>Quick access to property management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/portfolio/property-access">
                    <Building className="h-6 w-6 mb-2" />
                    <span className="text-sm">Property Access</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/portfolio/documents">
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">Document Center</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/portfolio/maintenance">
                    <Settings className="h-6 w-6 mb-2" />
                    <span className="text-sm">Maintenance</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/portfolio/service-tracker">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span className="text-sm">Service Tracker</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/portfolio/invoices">
                    <Receipt className="h-6 w-6 mb-2" />
                    <span className="text-sm">Invoices</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Property Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
                <CardDescription>Commission earnings by property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(financialOverview?.propertyBreakdown && Array.isArray(financialOverview.propertyBreakdown) ? financialOverview.propertyBreakdown : []).map((property) => (
                  <div key={property.propertyId} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{property.propertyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.bookingCount} bookings
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${property.commissionEarned?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Revenue: ${property.totalRevenue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-muted-foreground">
                    No properties in portfolio
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Earnings Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Trend</CardTitle>
                <CardDescription>Commission earnings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(financialOverview?.monthlyTrend && Array.isArray(financialOverview.monthlyTrend) ? financialOverview.monthlyTrend : []).map((month) => (
                    <div key={month.period} className="flex justify-between items-center">
                      <span className="text-sm">{month.period}</span>
                      <span className="font-semibold">${month.earnings?.toLocaleString()}</span>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-muted-foreground">
                      No earnings data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Commission Balance</h3>
              <p className="text-sm text-muted-foreground">
                Track your earnings and request payouts
              </p>
            </div>
            
            <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
              <DialogTrigger asChild>
                <Button disabled={!balance?.currentBalance || balance.currentBalance <= 0}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Commission Payout</DialogTitle>
                  <DialogDescription>
                    Submit a payout request for your earned commissions
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...payoutForm}>
                  <form onSubmit={payoutForm.handleSubmit(onPayoutSubmit)} className="space-y-4">
                    <FormField
                      control={payoutForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (Max: ${balance?.currentBalance?.toLocaleString()})</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter amount" {...field} />
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

          <div className="grid gap-4 md:grid-cols-2">
            {/* Balance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Earned</span>
                  <span className="font-semibold text-green-600">
                    ${balance?.totalEarned?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid</span>
                  <span className="font-semibold text-red-600">
                    ${balance?.totalPaid?.toLocaleString() || '0'}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Current Balance</span>
                  <span className="text-green-600">
                    ${balance?.currentBalance?.toLocaleString() || '0'}
                  </span>
                </div>
                {balance?.lastPayoutDate && (
                  <p className="text-xs text-muted-foreground">
                    Last payout: {format(parseISO(balance.lastPayoutDate), 'MMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Admin Balance Reset Card - Only visible to admin users */}
            {user && (
              <AdminBalanceResetCard
                userId={user.id}
                userRole="portfolio-manager"
                userEmail={user.email || ""}
                userName={`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || ""}
                currentBalance={balance?.currentBalance}
                onBalanceReset={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard"] });
                }}
              />
            )}

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {(payouts && Array.isArray(payouts) ? payouts.slice(0, 5) : []).map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="space-y-1">
                          <p className="font-medium">${payout.amount?.toLocaleString()} {payout.currency}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {format(parseISO(payout.requestedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <StatusBadge status={payout.status} />
                          {payout.status === 'approved' && payout.receiptUrl && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => paymentReceivedMutation.mutate(payout.id)}
                              disabled={paymentReceivedMutation.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Payment Received
                            </Button>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-muted-foreground">
                        No payout requests found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Invoice Builder</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage invoices for commissions and services
              </p>
            </div>
            
            <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a professional invoice for commissions or services
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...invoiceForm}>
                  <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={invoiceForm.control}
                        name="receiverType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receiver Type</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="organization">Organization</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="external">External Party</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceForm.control}
                        name="receiverName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receiver Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Company or person name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={invoiceForm.control}
                        name="invoiceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Type</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="management_commission">Management Commission</SelectItem>
                                  <SelectItem value="booking_commission">Booking Commission</SelectItem>
                                  <SelectItem value="service_fee">Service Fee</SelectItem>
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                  <SelectItem value="maintenance">Maintenance Charge</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={invoiceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Invoice description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Line Items */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Line Items</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ description: "", quantity: "1", unitPrice: "", referenceId: "", referenceType: "" })}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-6 gap-2 items-end">
                          <div className="col-span-2">
                            <FormField
                              control={invoiceForm.control}
                              name={`lineItems.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Description" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={invoiceForm.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Qty" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={invoiceForm.control}
                            name={`lineItems.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Price" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={invoiceForm.control}
                            name={`lineItems.${index}.referenceId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Reference" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={invoiceForm.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input placeholder="10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceForm.control}
                        name="referenceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Booking ID, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={invoiceForm.control}
                      name="notes"
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
                      <Button type="button" variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={invoiceMutation.isPending}>
                        {invoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {invoicesLoading ? (
                <div className="text-center py-8">Loading invoices...</div>
              ) : (
                <div className="space-y-4">
                  {(invoices && Array.isArray(invoices) ? invoices : [])?.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.receiverName}</p>
                        <p className="text-sm">{invoice.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {format(parseISO(invoice.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <p className="font-semibold">${invoice.totalAmount?.toLocaleString()}</p>
                        <StatusBadge status={invoice.status} />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Logs Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Task & Portfolio Logs</h3>
              <p className="text-sm text-muted-foreground">
                Track tasks completed across your portfolio properties
              </p>
            </div>
            
            {/* Task Filters */}
            <div className="flex gap-2">
              <Select value={taskFilters.department} onValueChange={(value) => setTaskFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="gardening">Gardening</SelectItem>
                  <SelectItem value="pool">Pool</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={taskFilters.status} onValueChange={(value) => setTaskFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              {taskLogsLoading ? (
                <div className="text-center py-8">Loading task logs...</div>
              ) : (
                <div className="space-y-4">
                  {(taskLogs && Array.isArray(taskLogs) ? taskLogs : [])?.map((task) => (
                    <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{task.taskTitle}</p>
                          <Badge className={getDepartmentColor(task.department)}>
                            {task.department}
                          </Badge>
                          <StatusBadge status={task.status} />
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Property: {task.propertyName}</p>
                          {task.staffAssigned && <p>Staff: {task.staffAssigned}</p>}
                          <p>Created: {format(parseISO(task.createdAt), 'MMM d, yyyy HH:mm')}</p>
                          {task.completedAt && (
                            <p>Completed: {format(parseISO(task.completedAt), 'MMM d, yyyy HH:mm')}</p>
                          )}
                        </div>
                        
                        {task.result && (
                          <p className="text-sm">{task.result}</p>
                        )}
                        
                        {task.notes && (
                          <p className="text-sm text-muted-foreground">Notes: {task.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {task.evidencePhotos && task.evidencePhotos.length > 0 && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Photos ({task.evidencePhotos.length})
                          </Button>
                        )}
                        {task.receipts && task.receipts.length > 0 && (
                          <Button size="sm" variant="outline">
                            <Receipt className="h-3 w-3 mr-1" />
                            Receipts ({task.receipts.length})
                          </Button>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No task logs found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Notifications & Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Stay updated on guest issues, approvals, and system suggestions
              </p>
            </div>
            
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/notifications"] })}>
              <Bell className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {notificationsLoading ? (
                <div className="text-center py-8">Loading notifications...</div>
              ) : (
                <div className="space-y-4">
                  {(notifications && Array.isArray(notifications) ? notifications : [])?.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => !notification.isRead && markReadMutation.mutate(notification.id)}
                    >
                      <div className="mt-1">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(notification.createdAt), 'MMM d, HH:mm')}
                          </p>
                        </div>
                        
                        <p className="text-sm">{notification.message}</p>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{notification.type}</Badge>
                          <Badge className={`text-xs ${
                            notification.severity === 'urgent' ? 'bg-red-100 text-red-800' :
                            notification.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.severity}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge className="bg-orange-100 text-orange-800">Action Required</Badge>
                          )}
                        </div>
                      </div>
                      
                      {notification.relatedType && notification.relatedId && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No notifications found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Portfolio Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Performance insights and AI-powered suggestions (Coming Soon)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced analytics coming soon</p>
                  <p className="text-xs">AI-powered property performance insights</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Smart recommendations coming soon</p>
                  <p className="text-xs">Automated guest satisfaction analysis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}