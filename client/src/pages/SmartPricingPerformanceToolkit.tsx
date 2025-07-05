import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  DollarSign, 
  BarChart3, 
  Brain, 
  Target,
  MapPin,
  Clock,
  Star,
  Users,
  Zap,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Download,
  RefreshCw,
  MessageSquare,
  Minus
} from "lucide-react";

interface DashboardData {
  totalProperties: number;
  activeAlerts: number;
  avgOccupancyRate: number;
  priceOptimizationOpportunities: number;
  recentPerformanceGrade: string;
  yearOverYearGrowth: number;
}

interface YearOnYearPerformance {
  id: number;
  propertyId: number;
  year: number;
  month: number;
  totalBookings: number;
  totalRevenue: string;
  averageDailyRate: string;
  occupancyRate: string;
  averageLeadTime: number;
}

interface HolidayEvent {
  id: number;
  eventDate: string;
  eventName: string;
  eventType: string;
  country?: string;
  region?: string;
  demandImpact: string;
  pricingMultiplier: string;
  isActive: boolean;
  source?: string;
}

interface PriceDeviationAnalysis {
  id: number;
  propertyId: number;
  analysisDate: string;
  currentPrice: string;
  marketAverage?: string;
  portfolioAverage?: string;
  deviationPercentage?: string;
  isUnderpriced: boolean;
  isOverpriced: boolean;
  recommendedPrice?: string;
  confidence?: string;
  notes?: string;
  propertyName?: string;
}

interface BookingGap {
  id: number;
  propertyId: number;
  gapStartDate: string;
  gapEndDate: string;
  gapDuration: number;
  gapType: string;
  surroundingRates?: any;
  recommendedAction?: string;
  estimatedRevenueLoss?: string;
  isResolved: boolean;
  propertyName?: string;
}

interface SmartAlert {
  id: number;
  propertyId?: number;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  data?: any;
  recommendedAction?: string;
  isRead: boolean;
  isResolved: boolean;
  propertyName?: string;
  createdAt: string;
}

interface AIPerformanceSummary {
  id: number;
  propertyId?: number;
  summaryDate: string;
  periodType: string;
  summaryData: any;
  aiSuggestions: string[];
  confidenceScore: string;
  keyInsights?: string;
  actionItems?: any[];
  performanceGrade?: string;
  propertyName?: string;
}

interface DirectBookingOptimization {
  id: number;
  propertyId: number;
  analysisDate: string;
  currentDirectRate: string;
  otaGuestRate?: string;
  otaNetPayout?: string;
  otaCommissionRate?: string;
  recommendedDirectRate?: string;
  competitiveAdvantage?: string;
  suggestedPerks?: string[];
  conversionPotential?: string;
  propertyName?: string;
}

export default function SmartPricingPerformanceToolkit() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<SmartAlert | null>(null);
  const [resolveAction, setResolveAction] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dashboard Overview
  const { data: dashboard, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/smart-pricing/dashboard", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/dashboard${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Year-on-Year Performance
  const { data: yearOnYear, isLoading: yearOnYearLoading } = useQuery<YearOnYearPerformance[]>({
    queryKey: ["/api/smart-pricing/year-on-year", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/year-on-year${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Holiday Events
  const { data: holidays, isLoading: holidaysLoading } = useQuery<HolidayEvent[]>({
    queryKey: ["/api/smart-pricing/holidays"],
    queryFn: () => apiRequest("GET", "/api/smart-pricing/holidays"),
  });

  // Price Deviation Analysis
  const { data: priceDeviations, isLoading: priceDeviationsLoading } = useQuery<PriceDeviationAnalysis[]>({
    queryKey: ["/api/smart-pricing/price-deviation", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/price-deviation${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Booking Gaps
  const { data: bookingGaps, isLoading: bookingGapsLoading } = useQuery<BookingGap[]>({
    queryKey: ["/api/smart-pricing/booking-gaps", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/booking-gaps${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Smart Alerts
  const { data: smartAlerts, isLoading: smartAlertsLoading } = useQuery<SmartAlert[]>({
    queryKey: ["/api/smart-pricing/alerts", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/alerts${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // AI Performance Summary
  const { data: aiSummary, isLoading: aiSummaryLoading } = useQuery<AIPerformanceSummary[]>({
    queryKey: ["/api/smart-pricing/ai-summary", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/ai-summary${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Direct Booking Optimization
  const { data: directBooking, isLoading: directBookingLoading } = useQuery<DirectBookingOptimization[]>({
    queryKey: ["/api/smart-pricing/direct-booking", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/direct-booking${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Holiday Heatmap Calendar
  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ["/api/smart-pricing/heatmap", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/heatmap${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Historical Patterns
  const { data: historicalPatterns, isLoading: historicalPatternsLoading } = useQuery({
    queryKey: ["/api/smart-pricing/historical-patterns", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-pricing/historical-patterns${selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Mark alert as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/smart-pricing/alerts/${alertId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smart-pricing/alerts"] });
      toast({ title: "Alert marked as read" });
    },
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, actionTaken }: { alertId: number; actionTaken: string }) =>
      apiRequest("PATCH", `/api/smart-pricing/alerts/${alertId}/resolve`, { actionTaken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smart-pricing/alerts"] });
      setSelectedAlert(null);
      setResolveAction("");
      toast({ title: "Alert resolved successfully" });
    },
  });

  // Resolve booking gap mutation
  const resolveGapMutation = useMutation({
    mutationFn: ({ gapId, actionTaken }: { gapId: number; actionTaken: string }) =>
      apiRequest("PATCH", `/api/smart-pricing/booking-gaps/${gapId}/resolve`, { actionTaken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smart-pricing/booking-gaps"] });
      toast({ title: "Booking gap resolved" });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case "high": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "low": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const getPerformanceGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 dark:text-green-400";
    if (grade.startsWith("B")) return "text-blue-600 dark:text-blue-400";
    if (grade.startsWith("C")) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (dashboardLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Smart Pricing Toolkit...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Pricing & Performance Toolkit</h1>
          <p className="text-muted-foreground">
            AI-powered pricing optimization and performance insights for your property portfolio
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="999">Villa Demo12345</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalProperties || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboard?.activeAlerts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.avgOccupancyRate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Opportunities</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboard?.priceOptimizationOpportunities || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Grade</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceGradeColor(dashboard?.recentPerformanceGrade || "C")}`}>
              {dashboard?.recentPerformanceGrade || "C"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YoY Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{dashboard?.yearOverYearGrowth || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="performance">📈 Performance</TabsTrigger>
          <TabsTrigger value="holidays">🌍 Holidays</TabsTrigger>
          <TabsTrigger value="pricing">💸 Pricing</TabsTrigger>
          <TabsTrigger value="gaps">🔍 Gaps</TabsTrigger>
          <TabsTrigger value="ai-insights">🧠 AI Insights</TabsTrigger>
          <TabsTrigger value="direct-booking">🔁 Direct Booking</TabsTrigger>
          <TabsTrigger value="alerts">🔔 Alerts</TabsTrigger>
          <TabsTrigger value="calendar">📅 Calendar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Alerts Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {smartAlertsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(Array.isArray(smartAlerts) ? smartAlerts : [])?.filter(alert => alert.severity === "critical" || alert.severity === "high").slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${alert.severity === "critical" ? "text-red-500" : "text-orange-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <Badge className={`text-xs mt-1 ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(!smartAlerts || smartAlerts.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No critical alerts</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {yearOnYearLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {yearOnYear && yearOnYear.length >= 2 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                          <div className="text-right">
                            <div className="font-medium">฿{Number(yearOnYear[0]?.totalRevenue || 0).toLocaleString()}</div>
                            <div className="text-xs text-green-600">
                              +{(((Number(yearOnYear[0]?.totalRevenue || 0) - Number(yearOnYear[1]?.totalRevenue || 0)) / Number(yearOnYear[1]?.totalRevenue || 1)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                          <div className="text-right">
                            <div className="font-medium">{yearOnYear[0]?.occupancyRate || 0}%</div>
                            <div className="text-xs text-green-600">
                              +{(Number(yearOnYear[0]?.occupancyRate || 0) - Number(yearOnYear[1]?.occupancyRate || 0)).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Daily Rate</span>
                          <div className="text-right">
                            <div className="font-medium">฿{Number(yearOnYear[0]?.averageDailyRate || 0).toLocaleString()}</div>
                            <div className="text-xs text-green-600">
                              +{(((Number(yearOnYear[0]?.averageDailyRate || 0) - Number(yearOnYear[1]?.averageDailyRate || 0)) / Number(yearOnYear[1]?.averageDailyRate || 1)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-purple-500" />
                Recent AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSummaryLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {aiSummary?.slice(0, 1).map((summary) => (
                    <div key={summary.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Performance Grade: </span>
                        <Badge className={`${getPerformanceGradeColor(summary.performanceGrade || "C")}`}>
                          {summary.performanceGrade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{summary.keyInsights}</p>
                      <div className="space-y-2">
                        <span className="text-sm font-medium">AI Suggestions:</span>
                        <ul className="space-y-1">
                          {summary.aiSuggestions?.slice(0, 3).map((suggestion, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <Zap className="h-3 w-3 mt-1 mr-2 text-yellow-500 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {(!aiSummary || aiSummary.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No AI insights available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Year-on-Year Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Year-on-Year Performance Tracker
              </CardTitle>
              <CardDescription>
                Compare current performance with the same period last year
              </CardDescription>
            </CardHeader>
            <CardContent>
              {yearOnYearLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {yearOnYear && yearOnYear.length >= 2 ? (
                    <>
                      {/* Comparison Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Total Revenue</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">฿{Number(yearOnYear[0]?.totalRevenue || 0).toLocaleString()}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                              +{(((Number(yearOnYear[0]?.totalRevenue || 0) - Number(yearOnYear[1]?.totalRevenue || 0)) / Number(yearOnYear[1]?.totalRevenue || 1)) * 100).toFixed(1)}% vs last year
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Occupancy Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{yearOnYear[0]?.occupancyRate || 0}%</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                              +{(Number(yearOnYear[0]?.occupancyRate || 0) - Number(yearOnYear[1]?.occupancyRate || 0)).toFixed(1)}% vs last year
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Average Daily Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">฿{Number(yearOnYear[0]?.averageDailyRate || 0).toLocaleString()}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                              +{(((Number(yearOnYear[0]?.averageDailyRate || 0) - Number(yearOnYear[1]?.averageDailyRate || 0)) / Number(yearOnYear[1]?.averageDailyRate || 1)) * 100).toFixed(1)}% vs last year
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Average Lead Time</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{yearOnYear[0]?.averageLeadTime || 0} days</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                              {(Number(yearOnYear[0]?.averageLeadTime || 0) - Number(yearOnYear[1]?.averageLeadTime || 0))} days vs last year
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Performance Alert */}
                      {Number(yearOnYear[0]?.totalRevenue || 0) < Number(yearOnYear[1]?.totalRevenue || 0) && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Revenue is down {(((Number(yearOnYear[1]?.totalRevenue || 0) - Number(yearOnYear[0]?.totalRevenue || 0)) / Number(yearOnYear[1]?.totalRevenue || 1)) * 100).toFixed(1)}% compared to the same month last year. Consider reviewing pricing strategy and marketing efforts.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No performance data available for comparison</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Holiday & Event Awareness Tab */}
        <TabsContent value="holidays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Global Holiday & Event Awareness
              </CardTitle>
              <CardDescription>
                Track international holidays and events that impact demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              {holidaysLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {holidays && holidays.length > 0 ? (
                    <div className="grid gap-4">
                      {holidays.map((holiday) => (
                        <Card key={holiday.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium">{holiday.eventName}</h4>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(holiday.eventDate).toLocaleDateString()}
                                  </span>
                                  <span>{holiday.country || holiday.region}</span>
                                  <Badge className={getDemandColor(holiday.demandImpact)}>
                                    {holiday.demandImpact} demand
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {Number(holiday.pricingMultiplier).toFixed(2)}x
                                </div>
                                <div className="text-xs text-muted-foreground">Pricing multiplier</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No upcoming holidays or events</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal Price Deviation Checker Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Internal Price Deviation Checker
              </CardTitle>
              <CardDescription>
                Identify underpriced and overpriced properties in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {priceDeviationsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {priceDeviations && priceDeviations.length > 0 ? (
                    <div className="grid gap-4">
                      {priceDeviations.map((analysis) => (
                        <Card key={analysis.id} className={`border-l-4 ${analysis.isUnderpriced ? 'border-l-orange-500' : analysis.isOverpriced ? 'border-l-red-500' : 'border-l-green-500'}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <h4 className="font-medium">{analysis.propertyName}</h4>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>Current: ฿{Number(analysis.currentPrice).toLocaleString()}</span>
                                  {analysis.marketAverage && (
                                    <span>Market Avg: ฿{Number(analysis.marketAverage).toLocaleString()}</span>
                                  )}
                                  {analysis.portfolioAverage && (
                                    <span>Portfolio Avg: ฿{Number(analysis.portfolioAverage).toLocaleString()}</span>
                                  )}
                                </div>
                                {analysis.deviationPercentage && (
                                  <Badge className={analysis.isUnderpriced ? 'bg-orange-100 text-orange-800' : analysis.isOverpriced ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                    {Number(analysis.deviationPercentage) > 0 ? '+' : ''}{Number(analysis.deviationPercentage).toFixed(1)}% deviation
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                {analysis.recommendedPrice && (
                                  <>
                                    <div className="text-lg font-bold text-green-600">
                                      ฿{Number(analysis.recommendedPrice).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Recommended</div>
                                    {analysis.confidence && (
                                      <div className="text-xs text-muted-foreground">
                                        {(Number(analysis.confidence) * 100).toFixed(0)}% confidence
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {analysis.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{analysis.notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No price deviation analysis available</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Gap & Undervalued Dates Detector Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Booking Gap & Undervalued Dates Detector
              </CardTitle>
              <CardDescription>
                Identify and resolve booking gaps to maximize revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingGapsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingGaps && bookingGaps.length > 0 ? (
                    <div className="grid gap-4">
                      {bookingGaps.map((gap) => (
                        <Card key={gap.id} className={`border-l-4 ${gap.isResolved ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{gap.propertyName}</h4>
                                  <Badge variant={gap.isResolved ? "default" : "secondary"}>
                                    {gap.isResolved ? "Resolved" : "Active"}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(gap.gapStartDate).toLocaleDateString()} - {new Date(gap.gapEndDate).toLocaleDateString()}
                                  </span>
                                  <span>{gap.gapDuration} nights</span>
                                  <Badge className="text-xs">
                                    {gap.gapType.replace('_', ' ')}
                                  </Badge>
                                </div>
                                {gap.recommendedAction && (
                                  <p className="text-sm text-blue-600">
                                    💡 {gap.recommendedAction.replace('_', ' ')}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                {gap.estimatedRevenueLoss && (
                                  <>
                                    <div className="text-lg font-bold text-red-600">
                                      -฿{Number(gap.estimatedRevenueLoss).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Estimated loss</div>
                                  </>
                                )}
                                {!gap.isResolved && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                      const action = prompt("Enter action taken to resolve this gap:");
                                      if (action) {
                                        resolveGapMutation.mutate({ gapId: gap.id, actionTaken: action });
                                      }
                                    }}
                                  >
                                    Mark Resolved
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No booking gaps detected</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI-Powered Weekly Performance Summary Tab */}
        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI-Powered Performance Summary
              </CardTitle>
              <CardDescription>
                Comprehensive AI analysis of your property performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiSummaryLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {aiSummary && aiSummary.length > 0 ? (
                    aiSummary.map((summary) => (
                      <div key={summary.id} className="space-y-4">
                        {/* Performance Grade & Confidence */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Performance Grade</span>
                              <div className={`text-3xl font-bold ${getPerformanceGradeColor(summary.performanceGrade || "C")}`}>
                                {summary.performanceGrade}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">AI Confidence</span>
                              <div className="text-xl font-bold">
                                {(Number(summary.confidenceScore) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">Report Date</span>
                            <div className="font-medium">
                              {new Date(summary.summaryDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Key Insights */}
                        {summary.keyInsights && (
                          <Alert>
                            <Brain className="h-4 w-4" />
                            <AlertDescription>{summary.keyInsights}</AlertDescription>
                          </Alert>
                        )}

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-2xl font-bold">{summary.summaryData?.totalBookings || 0}</div>
                              <div className="text-xs text-muted-foreground">Total Bookings</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-2xl font-bold">{summary.summaryData?.averageOccupancy || 0}%</div>
                              <div className="text-xs text-muted-foreground">Avg Occupancy</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-2xl font-bold">฿{summary.summaryData?.averageRate || 0}</div>
                              <div className="text-xs text-muted-foreground">Average Rate</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-2xl font-bold">{summary.summaryData?.leadTime || 0} days</div>
                              <div className="text-xs text-muted-foreground">Lead Time</div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* AI Suggestions */}
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center">
                            <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                            AI Suggestions
                          </h4>
                          <div className="grid gap-2">
                            {summary.aiSuggestions?.map((suggestion, index) => (
                              <Card key={index}>
                                <CardContent className="pt-3">
                                  <p className="text-sm">{suggestion}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Action Items */}
                        {summary.actionItems && summary.actionItems.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center">
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Recommended Actions
                            </h4>
                            <div className="grid gap-2">
                              {summary.actionItems.map((item: any, index: number) => (
                                <Card key={index}>
                                  <CardContent className="pt-3">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">{item.action}</p>
                                        <p className="text-xs text-muted-foreground">{item.estimatedImpact}</p>
                                      </div>
                                      <Badge className={item.priority === 'high' ? 'bg-red-100 text-red-800' : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                        {item.priority}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No AI performance summary available</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Direct Booking Price Optimizer Tab */}
        <TabsContent value="direct-booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Minus className="mr-2 h-5 w-5" />
                Direct Booking Price Optimizer
              </CardTitle>
              <CardDescription>
                Optimize direct booking rates to compete with OTA platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {directBookingLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {directBooking && directBooking.length > 0 ? (
                    <div className="grid gap-4">
                      {directBooking.map((optimization) => (
                        <Card key={optimization.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{optimization.propertyName}</h4>
                                <Badge className={optimization.conversionPotential === 'high' ? 'bg-green-100 text-green-800' : optimization.conversionPotential === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                                  {optimization.conversionPotential} conversion potential
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <span className="text-sm text-muted-foreground">Current Direct Rate</span>
                                  <div className="text-xl font-bold">฿{Number(optimization.currentDirectRate).toLocaleString()}</div>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-sm text-muted-foreground">OTA Guest Rate</span>
                                  <div className="text-xl font-bold text-blue-600">
                                    ฿{Number(optimization.otaGuestRate || 0).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Net payout: ฿{Number(optimization.otaNetPayout || 0).toLocaleString()}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-sm text-muted-foreground">Recommended Direct Rate</span>
                                  <div className="text-xl font-bold text-green-600">
                                    ฿{Number(optimization.recommendedDirectRate || 0).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-green-600">
                                    ฿{Number(optimization.competitiveAdvantage || 0).toLocaleString()} savings vs OTA
                                  </div>
                                </div>
                              </div>

                              {optimization.suggestedPerks && optimization.suggestedPerks.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-sm font-medium">Suggested Perks to Add Value:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {optimization.suggestedPerks.map((perk, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {perk}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {optimization.otaCommissionRate && (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    By pricing direct bookings at ฿{Number(optimization.recommendedDirectRate || 0).toLocaleString()}, 
                                    guests save ฿{Number(optimization.competitiveAdvantage || 0).toLocaleString()} 
                                    while you avoid the {Number(optimization.otaCommissionRate).toFixed(1)}% OTA commission.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Minus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No direct booking optimization data available</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Alert System Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Smart Alert System
              </CardTitle>
              <CardDescription>
                Real-time alerts for pricing opportunities and performance issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {smartAlertsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {smartAlerts && smartAlerts.length > 0 ? (
                    <div className="grid gap-4">
                      {smartAlerts.map((alert) => (
                        <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : alert.severity === 'high' ? 'border-l-orange-500' : alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{alert.title}</h4>
                                  <Badge className={getSeverityColor(alert.severity)}>
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                  {!alert.isRead && (
                                    <Badge variant="secondary" className="text-xs">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{alert.message}</p>
                                {alert.propertyName && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {alert.propertyName}
                                  </div>
                                )}
                                {alert.recommendedAction && (
                                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                      💡 <strong>Recommended Action:</strong> {alert.recommendedAction}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col space-y-2 ml-4">
                                {!alert.isRead && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsReadMutation.mutate(alert.id)}
                                    disabled={markAsReadMutation.isPending}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                                {!alert.isResolved && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedAlert(alert)}
                                  >
                                    Resolve
                                  </Button>
                                )}
                                {alert.isResolved && (
                                  <Badge variant="default" className="text-xs">
                                    Resolved
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No active alerts</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolve Alert Dialog */}
          {selectedAlert && (
            <Card>
              <CardHeader>
                <CardTitle>Resolve Alert: {selectedAlert.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="action">Action Taken</Label>
                  <Textarea
                    id="action"
                    placeholder="Describe the action you took to resolve this alert..."
                    value={resolveAction}
                    onChange={(e) => setResolveAction(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (resolveAction.trim()) {
                        resolveAlertMutation.mutate({
                          alertId: selectedAlert.id,
                          actionTaken: resolveAction,
                        });
                      }
                    }}
                    disabled={!resolveAction.trim() || resolveAlertMutation.isPending}
                  >
                    {resolveAlertMutation.isPending ? "Resolving..." : "Resolve Alert"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Holiday Heatmap Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Holiday Heatmap Calendar View
              </CardTitle>
              <CardDescription>
                Color-coded calendar for strategic pricing decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {heatmapLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex items-center space-x-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">High Demand - Increase Price</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Normal - Maintain Price</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">Low Demand - Promote/Reduce</span>
                    </div>
                  </div>

                  {heatmapData && heatmapData.length > 0 ? (
                    <div className="grid grid-cols-7 gap-2">
                      {/* Calendar Headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {heatmapData.slice(0, 28).map((day: any) => {
                        const date = new Date(day.date);
                        const dayOfWeek = date.getDay();
                        
                        return (
                          <Card 
                            key={day.id} 
                            className={`p-2 cursor-pointer transition-all hover:scale-105 ${
                              day.colorCode === 'green' ? 'bg-green-100 border-green-300' :
                              day.colorCode === 'yellow' ? 'bg-yellow-100 border-yellow-300' :
                              'bg-red-100 border-red-300'
                            }`}
                          >
                            <CardContent className="p-0 space-y-1">
                              <div className="text-sm font-bold text-center">
                                {date.getDate()}
                              </div>
                              <div className="text-xs text-center">
                                ฿{Number(day.recommendedRate).toLocaleString()}
                              </div>
                              <div className="text-xs text-center text-muted-foreground">
                                {Math.round(day.historicalOccupancy)}%
                              </div>
                              {day.events && day.events.length > 0 && (
                                <div className="text-xs text-center font-medium">
                                  🎉
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No heatmap data available</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}