import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek } from "date-fns";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Settings, 
  FileText, 
  Bell, 
  Download, 
  Upload, 
  Eye,
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
  Search,
  Lightbulb,
  Wrench,
  BarChart3,
  MessageCircle,
  Building,
  CreditCard,
  Receipt,
  CalendarDays,
  Activity,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Home,
  Sparkles,
  Droplets,
  TreePine,
  Heart,
  ExternalLink,
  CircleDollarSign,
  Banknote,
  Percent,
  PieChart,
  LineChart,
  BarChart,
  Timer,
  UserCheck,
  UserX,
  Bed,
  Bath,
  Car,
  Shield,
  Zap,
  Smartphone,
  Coffee,
  Utensils
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { RoleBackButton } from "@/components/BackButton";
import { OwnerStatementExport } from "@/components/OwnerStatementExport";
import { DualOtaPricing, DualOtaPricingCompact } from "@/components/DualOtaPricing";

// Enhanced types for comprehensive owner dashboard
interface EarningsOverview {
  averageNightlyRate: number;
  totalEarnings: {
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    lastMonth: number;
    customPeriod: number;
  };
  occupancyRate: {
    thisMonth: number;
    thisYear: number;
    trend: 'up' | 'down' | 'stable';
  };
  platformSplit: {
    airbnb: { bookings: number; revenue: number; percentage: number; };
    vrbo: { bookings: number; revenue: number; percentage: number; };
    bookingCom: { bookings: number; revenue: number; percentage: number; };
    direct: { bookings: number; revenue: number; percentage: number; };
    marriott: { bookings: number; revenue: number; percentage: number; };
  };
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    bookings: number;
    occupancy: number;
  }>;
}

interface BalanceSummary {
  propertyBalances: Array<{
    propertyId: number;
    propertyName: string;
    currentBalance: number;
    pendingPayouts: number;
    lastPayoutDate: string;
    totalRevenue: number;
    expenses: {
      management: number;
      utilities: number;
      maintenance: number;
      addons: number;
      welcomePacks: number;
    };
    breakdown: Array<{
      date: string;
      type: string;
      description: string;
      amount: number;
      category: string;
    }>;
  }>;
  totalBalance: number;
  pendingPayoutRequests: Array<{
    id: number;
    propertyId: number;
    amount: number;
    requestDate: string;
    status: 'pending' | 'approved' | 'processing' | 'completed';
    notes?: string;
  }>;
}

interface AiSuggestion {
  id: number;
  propertyId: number;
  propertyName: string;
  category: 'maintenance' | 'amenity' | 'experience' | 'safety' | 'communication';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestion: string;
  reason: string;
  sourceReview: {
    guestName: string;
    rating: number;
    excerpt: string;
    date: string;
    platform: string;
  };
  estimatedCost: number;
  estimatedImpact: 'low' | 'medium' | 'high';
  status: 'new' | 'acknowledged' | 'implemented' | 'dismissed';
  implementationDate?: string;
  createdAt: string;
}

interface TimelineActivity {
  id: number;
  propertyId: number;
  type: 'guest' | 'staff' | 'maintenance' | 'note' | 'expense' | 'booking';
  category: 'checkin' | 'checkout' | 'cleaning' | 'pool' | 'garden' | 'maintenance' | 'note' | 'expense' | 'booking' | 'repair';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  status?: string;
  priority?: string;
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
  }>;
  metadata?: {
    taskId?: number;
    amount?: number;
    guestName?: string;
    rating?: number;
    platform?: string;
  };
}

const PERIOD_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Period' }
];

const PLATFORM_COLORS = {
  airbnb: 'bg-red-100 text-red-800 border-red-200',
  vrbo: 'bg-blue-100 text-blue-800 border-blue-200',
  bookingCom: 'bg-purple-100 text-purple-800 border-purple-200',
  direct: 'bg-green-100 text-green-800 border-green-200',
  marriott: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const CATEGORY_ICONS = {
  maintenance: Wrench,
  amenity: Star,
  experience: Heart,
  safety: Shield,
  communication: MessageCircle
};

const ACTIVITY_ICONS = {
  checkin: UserCheck,
  checkout: UserX,
  cleaning: Sparkles,
  pool: Droplets,
  garden: TreePine,
  maintenance: Wrench,
  note: MessageSquare,
  expense: DollarSign,
  booking: Calendar,
  repair: Settings
};

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("earnings");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [timelineFilter, setTimelineFilter] = useState("all");
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showFinanceDialog, setShowFinanceDialog] = useState(false);
  const [selectedPropertyBalance, setSelectedPropertyBalance] = useState<any>(null);
  
  // Form states
  const [payoutRequest, setPayoutRequest] = useState({
    propertyId: "",
    amount: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Data queries
  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ["/api/owner/earnings", selectedPeriod, selectedProperty],
    enabled: !!user && user.role === 'owner',
  });

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/owner/balance"],
    enabled: !!user && user.role === 'owner',
  });

  const { data: aiSuggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/owner/ai-suggestions"],
    enabled: !!user && user.role === 'owner',
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["/api/owner/timeline", selectedProperty, timelineFilter],
    enabled: !!user && user.role === 'owner',
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  // Mutations
  const requestPayout = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/owner/payout-request", data),
    onSuccess: () => {
      toast({ title: "Payout request submitted successfully" });
      setShowPayoutDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/owner/balance"] });
      setPayoutRequest({ propertyId: "", amount: "", notes: "" });
    },
    onError: (error) => {
      toast({ title: "Error submitting payout request", description: error.message, variant: "destructive" });
    },
  });

  const acknowledgeSuggestion = useMutation({
    mutationFn: async (suggestionId: number) => apiRequest("POST", `/api/owner/ai-suggestions/${suggestionId}/acknowledge`),
    onSuccess: () => {
      toast({ title: "Suggestion acknowledged" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-suggestions"] });
    },
  });

  const dismissSuggestion = useMutation({
    mutationFn: async (suggestionId: number) => apiRequest("POST", `/api/owner/ai-suggestions/${suggestionId}/dismiss`),
    onSuccess: () => {
      toast({ title: "Suggestion dismissed" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-suggestions"] });
    },
  });

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold">Owner Access Required</h3>
              <p className="text-gray-600">This dashboard is only available for property owners.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Earnings Overview Component
  const EarningsOverview = () => (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Earnings Overview
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-48">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {earningsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Average Nightly Rate */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Avg Nightly Rate</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(earningsData?.averageNightlyRate || 0)}
                    </p>
                  </div>
                  <Bed className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              {/* Total Earnings */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(earningsData?.totalEarnings?.[selectedPeriod] || 0)}
                    </p>
                  </div>
                  <CircleDollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>

              {/* Occupancy Rate */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Occupancy Rate</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-purple-800">
                        {formatPercentage(earningsData?.occupancyRate?.thisMonth || 0)}
                      </p>
                      {earningsData?.occupancyRate?.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : earningsData?.occupancyRate?.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              {/* Total Properties */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Total Properties</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {properties?.length || 0}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Split */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-orange-500" />
            Platform Revenue Split
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">OTA Commission Information</p>
                <p className="text-amber-700">Platform revenue shown reflects actual payout received after OTA commissions. Hover over amounts for guest price details.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {earningsData?.platformSplit && Object.entries(earningsData.platformSplit).map(([platform, data]: [string, any]) => (
              <div key={platform} className={`p-4 rounded-lg border ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]}`}>
                <div className="text-center">
                  <h4 className="font-semibold capitalize">
                    {platform === 'bookingCom' ? 'Booking.com' : platform}
                  </h4>
                  <p className="text-2xl font-bold">{formatPercentage(data.percentage)}</p>
                  
                  {/* Show dual pricing for OTA platforms */}
                  {platform !== 'direct' && data.guestTotalPrice && data.otaCommissionAmount ? (
                    <div className="space-y-1">
                      <DualOtaPricingCompact
                        guestTotalPrice={data.guestTotalPrice}
                        platformPayout={data.revenue}
                        otaCommissionAmount={data.otaCommissionAmount}
                        currency="THB"
                        platform={platform}
                        size="sm"
                      />
                    </div>
                  ) : (
                    <p className="text-sm">{formatCurrency(data.revenue)}</p>
                  )}
                  
                  <p className="text-xs">{data.bookings} bookings</p>
                  
                  {/* Commission rate indicator for OTA platforms */}
                  {platform !== 'direct' && data.otaCommissionRate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.otaCommissionRate}% OTA fee
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-indigo-500" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earningsData?.monthlyTrend?.map((month: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="font-medium">{month.month}</div>
                  <Badge variant="outline">{month.bookings} bookings</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(month.revenue)}</div>
                    <div className="text-sm text-gray-600">{formatPercentage(month.occupancy)} occupancy</div>
                  </div>
                  <Progress value={month.occupancy} className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Balance Summary Component
  const BalanceSummaryTab = () => (
    <div className="space-y-6">
      {/* Total Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-500" />
            Balance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center">
              <h3 className="text-green-600 font-medium mb-2">Total Available Balance</h3>
              <p className="text-3xl font-bold text-green-800">
                {formatCurrency(balanceData?.totalBalance || 0)}
              </p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <h3 className="text-blue-600 font-medium mb-2">Pending Payouts</h3>
              <p className="text-3xl font-bold text-blue-800">
                {balanceData?.pendingPayoutRequests?.length || 0}
              </p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <h3 className="text-purple-600 font-medium mb-2">Properties</h3>
              <p className="text-3xl font-bold text-purple-800">
                {balanceData?.propertyBalances?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Balances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Property Balances
            </CardTitle>
            <Button onClick={() => setShowPayoutDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {balanceData?.propertyBalances?.map((property: any) => (
              <Card key={property.propertyId} className="border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{property.propertyName}</h3>
                      <p className="text-sm text-gray-600">Property ID: {property.propertyId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(property.currentBalance)}
                      </p>
                      <p className="text-sm text-gray-600">Available Balance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-blue-600 text-sm">Total Revenue</p>
                      <p className="font-semibold">{formatCurrency(property.totalRevenue)}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <p className="text-red-600 text-sm">Management</p>
                      <p className="font-semibold">{formatCurrency(property.expenses.management)}</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <p className="text-yellow-600 text-sm">Utilities</p>
                      <p className="font-semibold">{formatCurrency(property.expenses.utilities)}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <p className="text-purple-600 text-sm">Maintenance</p>
                      <p className="font-semibold">{formatCurrency(property.expenses.maintenance)}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-green-600 text-sm">Add-ons</p>
                      <p className="font-semibold">{formatCurrency(property.expenses.addons)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedPropertyBalance(property);
                        setShowFinanceDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      See Finances
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setPayoutRequest({
                          ...payoutRequest,
                          propertyId: property.propertyId.toString(),
                          amount: property.currentBalance.toString()
                        });
                        setShowPayoutDialog(true);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Request Payout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Payout Requests */}
      {balanceData?.pendingPayoutRequests?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Payout Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {balanceData.pendingPayoutRequests.map((request: any) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Property ID: {request.propertyId}</h4>
                    <p className="text-sm text-gray-600">
                      Requested: {format(parseISO(request.requestDate), 'MMM d, yyyy')}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-700 mt-1">{request.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(request.amount)}</p>
                    <Badge className={
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // AI Suggestions Component
  const AiSuggestionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI-Powered Review Suggestions
          </CardTitle>
          <CardDescription>
            Automatic analysis of guest reviews to extract improvement suggestions and maintenance needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {aiSuggestions?.map((suggestion: AiSuggestion) => {
                const CategoryIcon = CATEGORY_ICONS[suggestion.category];
                return (
                  <Card key={suggestion.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <CategoryIcon className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{suggestion.suggestion}</h3>
                            <p className="text-sm text-gray-600">{suggestion.propertyName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">AI Analysis</h4>
                        <p className="text-sm text-gray-700">{suggestion.reason}</p>
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Source Review</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{suggestion.sourceReview.guestName}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < suggestion.sourceReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {suggestion.sourceReview.platform} • {format(parseISO(suggestion.sourceReview.date), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 italic">"{suggestion.sourceReview.excerpt}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Estimated Cost:</span>
                          <br />
                          <span className="font-medium">{formatCurrency(suggestion.estimatedCost)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Expected Impact:</span>
                          <br />
                          <Badge variant="outline" className={
                            suggestion.estimatedImpact === 'high' ? 'bg-green-100 text-green-800' :
                            suggestion.estimatedImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {suggestion.estimatedImpact} impact
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {suggestion.status === 'new' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => acknowledgeSuggestion.mutate(suggestion.id)}
                              disabled={acknowledgeSuggestion.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => dismissSuggestion.mutate(suggestion.id)}
                              disabled={dismissSuggestion.isPending}
                            >
                              Dismiss
                            </Button>
                          </>
                        )}
                        {suggestion.status === 'acknowledged' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                        )}
                        {suggestion.status === 'implemented' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Implemented on {format(parseISO(suggestion.implementationDate!), 'MMM d')}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {aiSuggestions?.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold">No AI Suggestions Yet</h3>
                  <p className="text-gray-600">
                    AI will analyze guest reviews and suggest improvements automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Timeline Activity Component
  const TimelineTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Property Timeline Activity
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-48">
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
              <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="guest">Guest Activities</SelectItem>
                  <SelectItem value="staff">Staff Activities</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {timelineLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {timelineData?.map((activity: TimelineActivity, index: number) => {
                const ActivityIcon = ACTIVITY_ICONS[activity.category];
                return (
                  <div key={activity.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'guest' ? 'bg-blue-100' :
                        activity.type === 'staff' ? 'bg-green-100' :
                        activity.type === 'maintenance' ? 'bg-orange-100' :
                        'bg-purple-100'
                      }`}>
                        <ActivityIcon className={`h-4 w-4 ${
                          activity.type === 'guest' ? 'text-blue-600' :
                          activity.type === 'staff' ? 'text-green-600' :
                          activity.type === 'maintenance' ? 'text-orange-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          
                          {activity.metadata?.guestName && (
                            <div className="flex items-center gap-2 mt-2">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">Guest: {activity.metadata.guestName}</span>
                              {activity.metadata.rating && (
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < activity.metadata!.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activity.metadata?.amount && (
                            <div className="flex items-center gap-1 mt-2">
                              <DollarSign className="h-3 w-3 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                {formatCurrency(activity.metadata.amount)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {activity.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">{activity.user.name}</span>
                          </div>
                        </div>
                      </div>

                      {activity.status && (
                        <Badge 
                          className={`mt-2 ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                            activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {activity.status}
                        </Badge>
                      )}

                      {activity.attachments && activity.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {activity.attachments.map((attachment, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              {attachment.type === 'image' ? (
                                <Camera className="h-3 w-3 mr-1" />
                              ) : (
                                <FileText className="h-3 w-3 mr-1" />
                              )}
                              {attachment.name}
                            </Button>
                          ))}
                        </div>
                      )}

                      {activity.metadata?.taskId && (
                        <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Task Details
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {timelineData?.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold">No Activity Yet</h3>
                  <p className="text-gray-600">
                    Property activity will appear here as staff complete tasks and guests interact with your properties.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <RoleBackButton role="owner" className="mb-4" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8 text-blue-500" />
            Owner Dashboard
          </h1>
          <p className="text-muted-foreground">
            Complete property performance overview with earnings, balance management, AI suggestions, and activity timeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            📊 Earnings Overview
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            🧾 Balance & Withdrawals
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            💡 AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            📋 Timeline Feed
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            📄 Financial Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <EarningsOverview />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceSummaryTab />
        </TabsContent>

        <TabsContent value="suggestions">
          <AiSuggestionsTab />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab />
        </TabsContent>

        <TabsContent value="finance">
          <OwnerStatementExport />
        </TabsContent>
      </Tabs>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Balance Payout</DialogTitle>
            <DialogDescription>
              Submit a payout request for your property balance. Your assigned PM will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Property</Label>
              <Select value={payoutRequest.propertyId} onValueChange={(value) => setPayoutRequest({...payoutRequest, propertyId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {balanceData?.propertyBalances?.map((property: any) => (
                    <SelectItem key={property.propertyId} value={property.propertyId.toString()}>
                      {property.propertyName} - {formatCurrency(property.currentBalance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={payoutRequest.amount}
                onChange={(e) => setPayoutRequest({...payoutRequest, amount: e.target.value})}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={payoutRequest.notes}
                onChange={(e) => setPayoutRequest({...payoutRequest, notes: e.target.value})}
                placeholder="Add any notes for the payout request..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => requestPayout.mutate(payoutRequest)}
              disabled={requestPayout.isPending || !payoutRequest.propertyId || !payoutRequest.amount}
            >
              {requestPayout.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finance Details Dialog */}
      <Dialog open={showFinanceDialog} onOpenChange={setShowFinanceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Financial Details - {selectedPropertyBalance?.propertyName}</DialogTitle>
            <DialogDescription>
              Detailed breakdown of income, expenses, and transactions for this property.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPropertyBalance && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border">
                  <h4 className="text-green-600 font-medium">Total Revenue</h4>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(selectedPropertyBalance.totalRevenue)}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border">
                  <h4 className="text-red-600 font-medium">Total Expenses</h4>
                  <p className="text-2xl font-bold text-red-800">
                    {formatCurrency(
                      Object.values(selectedPropertyBalance.expenses).reduce((sum: number, val: any) => sum + val, 0)
                    )}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <h4 className="text-blue-600 font-medium">Current Balance</h4>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(selectedPropertyBalance.currentBalance)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border">
                  <h4 className="text-purple-600 font-medium">Pending</h4>
                  <p className="text-2xl font-bold text-purple-800">
                    {formatCurrency(selectedPropertyBalance.pendingPayouts)}
                  </p>
                </div>
              </div>

              {/* Transaction Breakdown */}
              <div>
                <h4 className="font-semibold mb-4">Recent Transactions</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedPropertyBalance.breakdown?.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(transaction.date), 'MMM d, yyyy')} • {transaction.category}
                        </p>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinanceDialog(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}