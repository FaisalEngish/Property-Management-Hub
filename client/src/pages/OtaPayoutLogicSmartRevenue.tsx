import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Edit3, 
  Shield,
  Building2,
  Calendar,
  PieChart,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  Zap,
  Target,
  Filter,
  Search
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface OtaBookingPayout {
  id: number;
  organizationId: string;
  propertyId: number;
  reservationCode: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  otaPlatform: string;
  guestPaidAmount: string;
  netPayoutAmount: string;
  otaCommissionAmount: string;
  otaCommissionRate: string;
  currency: string;
  payoutStatus: string;
  payoutConfirmedAt: Date | null;
  payoutConfirmedBy: string | null;
  hostawaySync: boolean;
  emailParsed: boolean;
  manualOverride: boolean;
  overrideReason: string | null;
  overrideBy: string | null;
  overrideAt: Date | null;
  notes: string | null;
  alertGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  propertyName?: string;
}

interface OtaPayoutAlert {
  id: number;
  organizationId: string;
  bookingPayoutId: number | null;
  alertType: string;
  alertMessage: string;
  severity: string;
  isResolved: boolean;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  resolutionNotes: string | null;
  createdAt: Date;
  booking?: OtaBookingPayout;
  propertyName?: string;
}

interface RevenueAnalytics {
  totalGrossRevenue: number;
  totalNetPayout: number;
  totalOtaCommissions: number;
  totalBookings: number;
  averageOtaCommissionRate: number;
  platformBreakdown: Array<{
    platform: string;
    bookingCount: number;
    totalGuestPayments: number;
    totalNetPayouts: number;
    averageCommissionRate: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    guestPayments: number;
    netPayouts: number;
    otaCommissions: number;
  }>;
  payoutStatusBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
}

const OtaPayoutLogicSmartRevenue = () => {
  const { formatWithConversion } = useCurrency();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayout, setSelectedPayout] = useState<OtaBookingPayout | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<OtaPayoutAlert | null>(null);
  const [filters, setFilters] = useState({
    otaPlatform: "",
    payoutStatus: "",
    dateRange: ""
  });

  const queryClient = useQueryClient();

  // Fetch OTA booking payouts with proper array safety
  const { data: payoutsRaw, isLoading: payoutsLoading } = useQuery({
    queryKey: ["/api/ota-payout/bookings", filters],
    queryFn: () => apiRequest('GET', '/api/ota-payout/bookings'),
    retry: false,
  });

  const payouts = Array.isArray(payoutsRaw) ? payoutsRaw : [];

  // Fetch OTA payout alerts with proper array safety
  const { data: alertsRaw, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/ota-payout/alerts"],
    queryFn: () => apiRequest('GET', '/api/ota-payout/alerts'),
    retry: false,
  });

  const alerts = Array.isArray(alertsRaw) ? alertsRaw : [];

  // Fetch revenue analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/ota-payout/analytics"],
    queryFn: () => apiRequest('GET', '/api/ota-payout/analytics'),
    retry: false,
  });

  // Payout confirmation mutation
  const confirmPayoutMutation = useMutation({
    mutationFn: (payoutId: number) => 
      apiRequest(`/api/ota-payout/bookings/${payoutId}/confirm`, {
        method: "PUT"
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ota-payout/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ota-payout/analytics"] });
    }
  });

  // Payout override mutation
  const overridePayoutMutation = useMutation({
    mutationFn: ({ payoutId, data }: { payoutId: number; data: any }) => 
      apiRequest(`/api/ota-payout/bookings/${payoutId}/override`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ota-payout/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ota-payout/analytics"] });
      setOverrideDialogOpen(false);
      setSelectedPayout(null);
    }
  });

  // Alert resolution mutation
  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, resolutionNotes }: { alertId: number; resolutionNotes: string }) => 
      apiRequest(`/api/ota-payout/alerts/${alertId}/resolve`, {
        method: "PUT",
        body: JSON.stringify({ resolutionNotes }),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ota-payout/alerts"] });
      setAlertDialogOpen(false);
      setSelectedAlert(null);
    }
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "airbnb": return "🏠";
      case "booking_com": return "🏨";
      case "vrbo": return "🏖️";
      case "direct": return "🎯";
      default: return "🌐";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "received": return "bg-blue-100 text-blue-800";
      case "discrepancy": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const OverviewContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Critical Revenue Warning Banner */}
      <div className="col-span-full">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Revenue Calculation Notice</AlertTitle>
          <AlertDescription className="text-orange-700">
            All internal calculations (fees, commissions, splits) are based on net received payout. 
            OTA commissions are not part of your earnings.
          </AlertDescription>
        </Alert>
      </div>

      {/* Key Metrics Cards */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Net Payout</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics && analytics.totalNetPayout != null ? formatWithConversion(analytics.totalNetPayout, "THB") : "฿0"}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Actual revenue after OTA commissions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">OTA Commissions</p>
              <p className="text-2xl font-bold text-red-600">
                {analytics && analytics.totalOtaCommissions != null ? formatWithConversion(analytics.totalOtaCommissions, "THB") : "฿0"}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total platform fees deducted
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Commission Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics && analytics.averageOtaCommissionRate != null ? `${analytics.averageOtaCommissionRate.toFixed(1)}%` : "0.0%"}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Across all platforms
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics && analytics.totalBookings != null ? analytics.totalBookings : "0"}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All tracked reservations
          </p>
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <div className="col-span-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Revenue Breakdown
            </CardTitle>
            <CardDescription>
              Revenue distribution by OTA platform showing guest payments vs net payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics?.platformBreakdown && Array.isArray(analytics.platformBreakdown) ? analytics.platformBreakdown.map((platform) => (
                <div key={platform.platform} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center gap-2">
                      <span>{getPlatformIcon(platform.platform)}</span>
                      {platform.platform.replace("_", ".")}
                    </span>
                    <Badge variant="outline">{platform.bookingCount} bookings</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guest Paid:</span>
                      <span className="font-medium">{platform.totalGuestPayments != null ? formatWithConversion(platform.totalGuestPayments, "THB") : "฿0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Payout:</span>
                      <span className="font-medium text-green-600">{platform.totalNetPayouts != null ? formatWithConversion(platform.totalNetPayouts, "THB") : "฿0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission:</span>
                      <span className="font-medium text-red-600">{platform.averageCommissionRate != null ? platform.averageCommissionRate.toFixed(1) : "0.0"}%</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No platform data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const PayoutsContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Booking Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="platform-filter">OTA Platform</Label>
              <Select value={filters.otaPlatform} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, otaPlatform: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All platforms</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="booking_com">Booking.com</SelectItem>
                  <SelectItem value="vrbo">VRBO</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Payout Status</Label>
              <Select value={filters.payoutStatus} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, payoutStatus: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="discrepancy">Discrepancy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ otaPlatform: "", payoutStatus: "", dateRange: "" })}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Booking Payouts
            </span>
            <Badge variant="outline">{payouts.length} records</Badge>
          </CardTitle>
          <CardDescription>
            Track all booking payouts with transparent OTA commission deductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payoutsLoading ? (
              <div className="text-center py-8">Loading payouts...</div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No payouts found</div>
            ) : (
              payouts.map((payout: OtaBookingPayout) => (
                <div key={payout.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlatformIcon(payout.otaPlatform)}</span>
                        <div>
                          <h3 className="font-semibold">{payout.guestName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {payout.reservationCode} • {payout.propertyName}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Guest Paid:</span>
                          <p className="font-medium">{payout.guestPaidAmount ? formatWithConversion(parseFloat(payout.guestPaidAmount), payout.currency) : "฿0"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">OTA Commission:</span>
                          <p className="font-medium text-red-600">
                            -{payout.otaCommissionAmount ? formatWithConversion(parseFloat(payout.otaCommissionAmount), payout.currency) : "฿0"} 
                            ({payout.otaCommissionRate}%)
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Payout:</span>
                          <p className="font-semibold text-green-600">
                            {payout.netPayoutAmount ? formatWithConversion(parseFloat(payout.netPayoutAmount), payout.currency) : "฿0"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={getStatusColor(payout.payoutStatus)}>
                            {payout.payoutStatus}
                          </Badge>
                        </div>
                      </div>
                      {payout.manualOverride && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Shield className="h-4 w-4" />
                          <span>Manual override applied: {payout.overrideReason}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {payout.payoutStatus === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => confirmPayoutMutation.mutate(payout.id)}
                          disabled={confirmPayoutMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPayout(payout);
                          setOverrideDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Override
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AlertsContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Payout Alerts & Issues
          </CardTitle>
          <CardDescription>
            Monitor payout discrepancies and manual review requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertsLoading ? (
              <div className="text-center py-8">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No alerts found</div>
            ) : (
              alerts.map((alert: OtaPayoutAlert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.alertType}</Badge>
                        {alert.isResolved && (
                          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                        )}
                      </div>
                      <p className="font-medium">{alert.alertMessage}</p>
                      {alert.booking && (
                        <p className="text-sm text-muted-foreground">
                          Related to: {alert.booking.guestName} ({alert.booking.reservationCode})
                        </p>
                      )}
                      {alert.isResolved && alert.resolutionNotes && (
                        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                          <p className="font-medium text-green-800">Resolution:</p>
                          <p className="text-green-700">{alert.resolutionNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.isResolved && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setAlertDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsContent = () => (
    <div className="space-y-6">
      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Revenue Trends
          </CardTitle>
          <CardDescription>
            Track guest payments vs net payouts over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.monthlyTrends && Array.isArray(analytics.monthlyTrends) ? analytics.monthlyTrends.map((trend) => (
              <div key={trend.month} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{trend.month}</h3>
                  <div className="text-sm text-muted-foreground">
                    Commission Impact: {trend.otaCommissions != null ? formatWithConversion(trend.otaCommissions, "THB") : "฿0"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Guest Payments:</span>
                    <p className="font-medium">{trend.guestPayments != null ? formatWithConversion(trend.guestPayments, "THB") : "฿0"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Net Payouts:</span>
                    <p className="font-medium text-green-600">{trend.netPayouts != null ? formatWithConversion(trend.netPayouts, "THB") : "฿0"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loss Ratio:</span>
                    <p className="font-medium text-red-600">
                      {trend.otaCommissions != null && trend.guestPayments != null && trend.guestPayments > 0 ? ((trend.otaCommissions / trend.guestPayments) * 100).toFixed(1) : "0.0"}%
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                No trend data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Payout Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics?.payoutStatusBreakdown && Array.isArray(analytics.payoutStatusBreakdown) ? analytics.payoutStatusBreakdown.map((status) => (
              <div key={status.status} className="border rounded-lg p-4 text-center">
                <Badge className={getStatusColor(status.status)} variant="outline">
                  {status.status}
                </Badge>
                <p className="font-semibold text-lg mt-2">{status.count}</p>
                <p className="text-sm text-muted-foreground">
                  {status.totalAmount != null ? formatWithConversion(status.totalAmount, "THB") : "฿0"}
                </p>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                No status breakdown data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-600" />
                OTA Payout Logic — Smart Revenue Tracking
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Comprehensive revenue transparency with dual pricing logic for accurate financial reporting
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure Rules
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewContent />
          </TabsContent>

          <TabsContent value="payouts">
            <PayoutsContent />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsContent />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsContent />
          </TabsContent>
        </Tabs>

        {/* Payout Override Dialog */}
        <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Override Payout Calculation</DialogTitle>
              <DialogDescription>
                Manually adjust payout amounts for booking {selectedPayout?.reservationCode}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="net-payout">Net Payout Amount (THB)</Label>
                <Input
                  id="net-payout"
                  type="number"
                  defaultValue={selectedPayout?.netPayoutAmount}
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="commission-amount">OTA Commission Amount (THB)</Label>
                <Input
                  id="commission-amount"
                  type="number"
                  defaultValue={selectedPayout?.otaCommissionAmount}
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="commission-rate">OTA Commission Rate (%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  defaultValue={selectedPayout?.otaCommissionRate}
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="override-reason">Override Reason</Label>
                <Textarea
                  id="override-reason"
                  placeholder="Explain why this override is necessary..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>
                  Apply Override
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Resolution Dialog */}
        <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Resolve Alert</DialogTitle>
              <DialogDescription>
                Mark this alert as resolved and add resolution notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 border rounded p-3">
                <p className="font-medium">{selectedAlert?.alertMessage}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Type: {selectedAlert?.alertType} • Severity: {selectedAlert?.severity}
                </p>
              </div>
              <div>
                <Label htmlFor="resolution-notes">Resolution Notes</Label>
                <Textarea
                  id="resolution-notes"
                  placeholder="Describe how this issue was resolved..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedAlert) {
                      const resolutionNotes = (document.getElementById("resolution-notes") as HTMLTextAreaElement)?.value;
                      resolveAlertMutation.mutate({
                        alertId: selectedAlert.id,
                        resolutionNotes
                      });
                    }
                  }}
                  disabled={resolveAlertMutation.isPending}
                >
                  {resolveAlertMutation.isPending ? "Resolving..." : "Mark Resolved"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OtaPayoutLogicSmartRevenue;