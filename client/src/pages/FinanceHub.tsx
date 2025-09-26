import React, { lazy, Suspense, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { 
  DollarSign, 
  FileText, 
  Zap,
  TrendingUp,
  Calculator,
  ArrowUpDown,
  PieChart,
  CreditCard,
  ArrowLeft,
  Users,
  Shield,
  Brain,
  Receipt,
  Eye,
  Settings,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Download,
  Share2,
  Sparkles
} from "lucide-react";
import TopBar from "@/components/TopBar";
import RefreshDataButton from "@/components/RefreshDataButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useFastAuth } from "@/lib/fastAuth";

// Lazy load all Finance modules
const FinancesPage = lazy(() => import("./CachedFinances"));
const InvoiceGenerator = lazy(() => import("./CachedInvoiceGenerator"));
const UtilityTracker = lazy(() => import("./UltraSimpleUtilityTracker"));
const FinanceEngine = lazy(() => import("./FinanceEngine"));
const SmartPricingPerformanceToolkit = lazy(() => import("./SmartPricingPerformanceToolkit"));
const OtaPayoutLogicSmartRevenue = lazy(() => import("./OtaPayoutLogicSmartRevenue"));
const SimpleFilteredFinancialDashboard = lazy(() => import("./SimpleFilteredFinancialDashboard"));
const OwnerInvoicingPayouts = lazy(() => import("./OwnerInvoicingPayouts"));
const SalariesWages = lazy(() => import("./SalariesWages"));
const FinanceIntelligenceModule = lazy(() => import("./FinanceIntelligenceModule"));
const CurrencyTaxManagement = lazy(() => import("./CurrencyTaxManagement"));
const OtaRevenueNetPayoutCalculation = lazy(() => import("./OtaRevenueNetPayoutCalculation"));
const StaffExpenseManagement = lazy(() => import("./StaffExpenseManagement"));
const EnhancedFinances = lazy(() => import("./EnhancedFinances"));

export default function FinanceHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBadge, setFilterBadge] = useState("all");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Core Modules": true,
    "Analytics & AI": true,
    "Admin Only": true
  });
  const { user } = useFastAuth();

  const financeItems = [
    {
      title: "Enhanced Financial Analytics",
      description: "Advanced revenue and payout analysis with multi-dimensional filtering by property, department, time frame, and business intelligence",
      key: "enhanced-finances",
      icon: TrendingUp,
      badge: "Advanced",
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      component: EnhancedFinances,
      category: "Analytics & AI",
      liveMetrics: { value: "$127.3K", label: "Monthly Revenue", trend: "+12%" },
      hasAI: true
    },
    {
      title: "Revenue & Payouts",
      description: "Track property revenue, owner payouts, and commission calculations",
      key: "finances",
      icon: DollarSign,
      badge: "Core",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      component: FinancesPage,
      category: "Core Modules",
      liveMetrics: { value: "$534.6K", label: "Total Revenue", trend: "+8%" }
    },
    {
      title: "Invoices & Income", 
      description: "Generate invoices, track payments, and manage income streams",
      key: "invoice-generator",
      icon: FileText,
      badge: "Billing",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: InvoiceGenerator,
      category: "Core Modules",
      liveMetrics: { value: "24", label: "Active Invoices", trend: "+3" }
    },
    {
      title: "Utility Tracker",
      description: "Monitor utility bills, track usage, and manage property expenses",
      key: "utility-tracker",
      icon: Zap,
      badge: "Utilities",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
      component: UtilityTracker,
      category: "Core Modules",
      liveMetrics: { value: "$8.2K", label: "Monthly Utilities", trend: "-5%" }
    },
    {
      title: "Finance Engine",
      description: "Advanced financial analytics, reporting, and performance metrics",
      key: "finance-engine",
      icon: Calculator,
      badge: "Analytics",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      component: FinanceEngine,
      category: "Analytics & AI",
      liveMetrics: { value: "94%", label: "Profit Margin", trend: "+2%" }
    },
    {
      title: "Smart Pricing",
      description: "AI-powered pricing optimization and market analysis tools",
      key: "smart-pricing-performance-toolkit",
      icon: TrendingUp,
      badge: "AI",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
      component: SmartPricingPerformanceToolkit,
      category: "Analytics & AI",
      liveMetrics: { value: "$156", label: "Avg Nightly Rate", trend: "+15%" },
      hasAI: true
    },
    {
      title: "OTA Payout Logic",
      description: "Online travel agency commission tracking and payout calculations",
      key: "ota-payout-logic-smart-revenue",
      icon: ArrowUpDown,
      badge: "OTA",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      component: OtaPayoutLogicSmartRevenue,
      category: "Core Modules",
      liveMetrics: { value: "18%", label: "Commission Rate", trend: "0%" }
    },
    {
      title: "Financial Admin Cockpit",
      description: "Comprehensive financial overview with charts and key metrics",
      key: "simple-filtered-financial-dashboard",
      icon: PieChart,
      badge: "Overview",
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200",
      component: SimpleFilteredFinancialDashboard,
      category: "Analytics & AI",
      liveMetrics: { value: "12", label: "Active Reports", trend: "+2" }
    },
    {
      title: "Owner Invoicing & Payouts",
      description: "Manage owner payments, invoicing, and payout requests",
      key: "owner-invoicing-payouts",
      icon: CreditCard,
      badge: "Owners",
      color: "bg-teal-50 hover:bg-teal-100 border-teal-200",
      component: OwnerInvoicingPayouts,
      category: "Core Modules",
      liveMetrics: { value: "$42.1K", label: "Pending Payouts", trend: "+7%" }
    }
  ];

  // Add admin-only items
  const adminOnlyItems = [
    {
      title: "Finance Intelligence",
      description: "AI-powered financial analysis, insights, and business intelligence",
      key: "finance-intelligence",
      icon: Brain,
      badge: "AI Intelligence",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      component: FinanceIntelligenceModule,
      adminOnly: true,
      category: "Admin Only",
      liveMetrics: { value: "89%", label: "AI Accuracy", trend: "+4%" },
      hasAI: true
    },
    {
      title: "Salaries & Wages",
      description: "Manage staff salaries, wages, and payroll information",
      key: "salaries-wages",
      icon: Users,
      badge: "Admin Only",
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      component: SalariesWages,
      adminOnly: true,
      category: "Admin Only",
      liveMetrics: { value: "$28.5K", label: "Monthly Payroll", trend: "+2%" }
    },
    {
      title: "Currency & Tax Management",
      description: "Configure currency settings, tax rates, and financial compliance options",
      key: "currency-tax-management",
      icon: Calculator,
      badge: "Admin Only",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: CurrencyTaxManagement,
      adminOnly: true,
      category: "Admin Only",
      liveMetrics: { value: "7%", label: "Tax Rate", trend: "0%" }
    },
    {
      title: "OTA Revenue Calculator",
      description: "Advanced OTA commission calculations and revenue optimization tools",
      key: "ota-revenue-calculator",
      icon: TrendingUp,
      badge: "Admin Only",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      component: OtaRevenueNetPayoutCalculation,
      adminOnly: true,
      category: "Admin Only",
      liveMetrics: { value: "$96.2K", label: "OTA Revenue", trend: "+11%" }
    },
    {
      title: "Staff Expense Management",
      description: "Track staff expenses, reimbursements, and operational cost management",
      key: "staff-expense-management",
      icon: Receipt,
      badge: "Admin Only",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      component: StaffExpenseManagement,
      adminOnly: true,
      category: "Admin Only",
      liveMetrics: { value: "$5.8K", label: "Monthly Expenses", trend: "-3%" }
    }
  ];

  // Combine items based on user role
  const allFinanceItems = user?.role === "admin" 
    ? [...financeItems, ...adminOnlyItems]
    : financeItems;

  // Filter and group items based on search and filter criteria
  const filteredAndGroupedItems = useMemo(() => {
    let filtered = allFinanceItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBadge === "all" || item.badge === filterBadge;
      return matchesSearch && matchesFilter;
    });

    // Group by category
    const grouped = filtered.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof filtered>);

    return grouped;
  }, [allFinanceItems, searchTerm, filterBadge]);

  // Get unique badge types for filter
  const uniqueBadges = useMemo(() => {
    const badges = [...new Set(allFinanceItems.map(item => item.badge))];
    return badges.sort();
  }, [allFinanceItems]);

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Export functionality
  const handleExport = (format: 'csv' | 'pdf') => {
    // Export implementation would go here
    console.log(`Exporting finance data as ${format.toUpperCase()}`);
  };

  const handleModuleClick = (key: string) => {
    setSelectedModule(key);
  };

  const selectedItem = allFinanceItems.find(item => item.key === selectedModule);

  // If a module is selected, render it lazily
  if (selectedModule && selectedItem) {
    const Component = selectedItem.component;
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex flex-col lg:ml-0">
          <TopBar title={selectedItem.title} />
          
          <main className="flex-1 overflow-auto">
            <div className="p-4 border-b bg-white">
              <Button
                variant="outline"
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Finance Hub
              </Button>
            </div>
            
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading {selectedItem.title}...</p>
                </div>
              </div>
            }>
              <Component />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Default hub view with cards
  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Finance Hub" />
        
        <main className={`flex-1 overflow-auto p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-background'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Finance Hub</h1>
                  <p className={`transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    Complete financial management suite for revenue tracking, billing, and analytics
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <Sun className={`h-4 w-4 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-yellow-500'}`} />
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                      className="data-[state=checked]:bg-slate-600"
                    />
                    <Moon className={`h-4 w-4 transition-colors duration-300 ${isDarkMode ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <RefreshDataButton
                    endpoints={['/api/finance', '/api/finance/analytics']}
                    variant="outline"
                    size="sm"
                    showStats={true}
                    showLastUpdate={true}
                  />
                </div>
              </div>
            </div>


            {/* Sticky Header Container */}
            <div className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-all duration-300 mb-6 ${
              isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
            }`}>
              {/* Admin Access Pill Badge */}
              {user?.role === "admin" && (
                <div className="py-4 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`transition-all duration-300 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-emerald-100 border-emerald-600' 
                            : 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 text-emerald-800 border-emerald-300/60'
                        }`}>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Access Active
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            isDarkMode ? 'bg-emerald-600/50' : 'bg-emerald-200/50'
                          }`}>
                            {allFinanceItems.length} modules
                          </span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border border-slate-600 shadow-xl">
                        <div className="text-center">
                          <p className="font-semibold text-sm">Administrator Privileges</p>
                          <p className="text-xs text-slate-300 mt-1">Access to all {allFinanceItems.length} finance modules</p>
                          <p className="text-xs text-emerald-300 mt-1">Including restricted admin-only features</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {/* Advanced Filters Row */}
              <div className={`px-4 pb-4 ${user?.role === "admin" ? '' : 'pt-4'}`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Timeframe Filter */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Timeframe:
                    </span>
                    <Select defaultValue="monthly">
                      <SelectTrigger className={`w-32 transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                        <SelectItem value="weekly" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Weekly</SelectItem>
                        <SelectItem value="monthly" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Monthly</SelectItem>
                        <SelectItem value="quarterly" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Quarterly</SelectItem>
                        <SelectItem value="yearly" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department Filter */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Department:
                    </span>
                    <Select defaultValue="all">
                      <SelectTrigger className={`w-40 transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                        <SelectItem value="all" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>All Departments</SelectItem>
                        <SelectItem value="properties" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Properties</SelectItem>
                        <SelectItem value="owners" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Owners</SelectItem>
                        <SelectItem value="utilities" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Utilities</SelectItem>
                        <SelectItem value="ota" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>OTA</SelectItem>
                        <SelectItem value="admin" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Global Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search finance modules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : ''
                      }`}
                    />
                  </div>

                  {/* Badge Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Select value={filterBadge} onValueChange={setFilterBadge}>
                      <SelectTrigger className={`w-48 pl-10 transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
                      }`}>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                        <SelectItem value="all" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>All Modules</SelectItem>
                        {uniqueBadges.map(badge => (
                          <SelectItem key={badge} value={badge} className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>
                            {badge}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Module Groups */}
            <div className="space-y-6">
              {Object.entries(filteredAndGroupedItems).map(([groupName, items]) => {
                const isExpanded = expandedGroups[groupName];
                return (
                  <Collapsible key={groupName} open={isExpanded} onOpenChange={() => toggleGroup(groupName)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`w-full justify-between text-left p-4 h-auto transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-slate-800/50 hover:bg-slate-700/50 text-white border border-slate-700' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold">{groupName}</h2>
                          <Badge className={`px-2 py-1 text-xs ${
                            isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-300 text-slate-700'
                          }`}>
                            {items.length} modules
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                        {items.map((item) => {
                          const IconComponent = item.icon;
                          
                          // Enhanced badge configurations with colors and tooltips
                          const getBadgeConfig = (badge: string) => {
                            const configs = {
                              "Core": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-blue-800 to-blue-700 text-blue-100 border-blue-600" 
                                  : "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-300", 
                                icon: "🏢", 
                                tooltip: "Essential finance functionality" 
                              },
                              "Advanced": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-emerald-800 to-emerald-700 text-emerald-100 border-emerald-600" 
                                  : "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-300", 
                                icon: "⚡", 
                                tooltip: "Enhanced analytics and insights" 
                              },
                              "Billing": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 border-purple-600" 
                                  : "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border-purple-300", 
                                icon: "📄", 
                                tooltip: "Invoice and payment management" 
                              },
                              "Utilities": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-yellow-800 to-yellow-700 text-yellow-100 border-yellow-600" 
                                  : "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-300", 
                                icon: "⚡", 
                                tooltip: "Utility bills and expenses" 
                              },
                              "Analytics": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-indigo-800 to-indigo-700 text-indigo-100 border-indigo-600" 
                                  : "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-800 border-indigo-300", 
                                icon: "📊", 
                                tooltip: "Financial reporting and metrics" 
                              },
                              "AI": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-pink-800 to-pink-700 text-pink-100 border-pink-600" 
                                  : "bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 border-pink-300", 
                                icon: "🤖", 
                                tooltip: "AI-powered insights and automation" 
                              },
                              "OTA": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-orange-800 to-orange-700 text-orange-100 border-orange-600" 
                                  : "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-300", 
                                icon: "🌐", 
                                tooltip: "Online travel agency integrations" 
                              },
                              "Overview": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-teal-800 to-teal-700 text-teal-100 border-teal-600" 
                                  : "bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 border-teal-300", 
                                icon: "👁️", 
                                tooltip: "Executive dashboard and overview" 
                              },
                              "Owners": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-green-800 to-green-700 text-green-100 border-green-600" 
                                  : "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-300", 
                                icon: "👥", 
                                tooltip: "Property owner management" 
                              },
                              "Admin Only": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-red-800 to-red-700 text-red-100 border-red-600" 
                                  : "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-300", 
                                icon: "🔒", 
                                tooltip: "Administrator access required" 
                              },
                              "AI Intelligence": { 
                                color: isDarkMode 
                                  ? "bg-gradient-to-r from-violet-800 to-violet-700 text-violet-100 border-violet-600" 
                                  : "bg-gradient-to-r from-violet-100 to-violet-50 text-violet-800 border-violet-300", 
                                icon: "🧠", 
                                tooltip: "Advanced AI-powered intelligence" 
                              }
                            };
                            return configs[badge as keyof typeof configs] || { 
                              color: isDarkMode 
                                ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 border-gray-600" 
                                : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-300", 
                              icon: "💼", 
                              tooltip: "Finance module" 
                            };
                          };

                          const badgeConfig = getBadgeConfig(item.badge);
                          
                          return (
                            <Card
                              key={item.key}
                              className={`group cursor-pointer transition-all duration-500 ease-in-out backdrop-blur-sm border hover:scale-[1.05] hover:-translate-y-2 relative overflow-hidden ${
                                isDarkMode 
                                  ? 'bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-700/80 border-slate-600/60 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-400/20' 
                                  : 'bg-gradient-to-br from-white via-slate-50/40 to-emerald-50/20 border-slate-200/60 hover:border-emerald-300/50 hover:shadow-2xl hover:shadow-emerald-500/30'
                              }`}
                              onClick={() => handleModuleClick(item.key)}
                            >
                              {/* Enhanced Glassmorphism overlay with glow effect */}
                              <div className={`absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                                isDarkMode 
                                  ? 'bg-gradient-to-br from-slate-700/70 via-emerald-900/30 to-slate-700/40' 
                                  : 'bg-gradient-to-br from-white/70 via-emerald-50/30 to-white/40'
                              }`} />
                              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                                isDarkMode 
                                  ? 'bg-gradient-to-t from-emerald-400/10 via-transparent to-transparent' 
                                  : 'bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent'
                              }`} />
                              
                              {/* AI Insight Badge */}
                              {item.hasAI && (
                                <div className="absolute top-2 left-2 z-10">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge className={`px-2 py-1 text-xs shadow-lg backdrop-blur-sm ${
                                          isDarkMode 
                                            ? 'bg-gradient-to-r from-violet-700 to-violet-600 text-violet-100 border-violet-500' 
                                            : 'bg-gradient-to-r from-violet-100 to-violet-50 text-violet-800 border-violet-300'
                                        }`}>
                                          <Sparkles className="h-3 w-3 mr-1" />
                                          AI Insight
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">⚡ AI Insight Available</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                              
                              <CardHeader className="pb-3 relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-3 backdrop-blur-sm rounded-xl shadow-xl border group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out ${
                                      isDarkMode 
                                        ? 'bg-gradient-to-br from-emerald-700/80 via-emerald-600/60 to-slate-700/40 border-emerald-500/50 group-hover:shadow-emerald-400/60' 
                                        : 'bg-gradient-to-br from-emerald-100/80 via-emerald-50/60 to-white/40 border-emerald-200/50 group-hover:shadow-emerald-300/60'
                                    }`}>
                                      <IconComponent className={`h-6 w-6 transition-colors duration-300 ${
                                        isDarkMode 
                                          ? 'text-emerald-200 group-hover:text-emerald-100' 
                                          : 'text-emerald-700 group-hover:text-emerald-800'
                                      }`} />
                                    </div>
                                    <CardTitle className={`text-lg font-semibold transition-colors duration-300 ${
                                      isDarkMode 
                                        ? 'text-slate-100 group-hover:text-white' 
                                        : 'text-slate-800 group-hover:text-slate-900'
                                    }`}>
                                      {item.title}
                                    </CardTitle>
                                  </div>
                                  
                                  {/* Enhanced Color-Coded Badge with Tooltip */}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge className={`${badgeConfig.color} shadow-lg backdrop-blur-sm group-hover:shadow-lg transition-all duration-300 px-3 py-1`}>
                                          <span className="mr-1">{badgeConfig.icon}</span>
                                          {item.badge}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border border-slate-600 shadow-xl">
                                        <p className="text-xs">{badgeConfig.tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                
                                {/* Live Metrics on Hover */}
                                <div className={`transition-all duration-300 rounded-lg p-3 border group-hover:scale-105 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-r from-slate-700/80 via-slate-600/60 to-slate-700/80 border-slate-600/60 group-hover:border-emerald-500/60 group-hover:bg-gradient-to-r group-hover:from-emerald-800/40 group-hover:via-slate-600/70 group-hover:to-emerald-800/40' 
                                    : 'bg-gradient-to-r from-slate-50/80 via-white/60 to-slate-50/80 border-slate-200/60 group-hover:border-emerald-200/60 group-hover:bg-gradient-to-r group-hover:from-emerald-50/40 group-hover:via-white/70 group-hover:to-emerald-50/40'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className={`text-sm font-medium transition-colors duration-300 ${
                                        isDarkMode 
                                          ? 'text-slate-300 group-hover:text-emerald-200' 
                                          : 'text-slate-700 group-hover:text-emerald-800'
                                      }`}>
                                        {item.liveMetrics?.label}
                                      </p>
                                      <p className={`text-xl font-bold transition-colors duration-300 ${
                                        isDarkMode 
                                          ? 'text-slate-100 group-hover:text-white' 
                                          : 'text-slate-900 group-hover:text-emerald-900'
                                      }`}>
                                        {item.liveMetrics?.value}
                                      </p>
                                    </div>
                                    <Badge className={`text-xs ${
                                      item.liveMetrics?.trend?.startsWith('+') 
                                        ? isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                                        : item.liveMetrics?.trend?.startsWith('-') 
                                        ? isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800'
                                        : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {item.liveMetrics?.trend}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {/* Quick Action Icons */}
                                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-8 w-8 p-0 transition-colors duration-200 ${
                                            isDarkMode 
                                              ? 'hover:bg-emerald-700 hover:text-emerald-100' 
                                              : 'hover:bg-emerald-100 hover:text-emerald-700'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleModuleClick(item.key);
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">View Report</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-8 w-8 p-0 transition-colors duration-200 ${
                                            isDarkMode 
                                              ? 'hover:bg-blue-700 hover:text-blue-100' 
                                              : 'hover:bg-blue-100 hover:text-blue-700'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Configure action
                                          }}
                                        >
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">Configure</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-8 w-8 p-0 transition-colors duration-200 ${
                                            isDarkMode 
                                              ? 'hover:bg-green-700 hover:text-green-100' 
                                              : 'hover:bg-green-100 hover:text-green-700'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Add new action
                                          }}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">Add New</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-4 relative z-10">
                                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'text-slate-300 group-hover:text-slate-200' 
                                    : 'text-slate-600 group-hover:text-slate-700'
                                }`}>
                                  {item.description}
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>


            {/* Enhanced Footer Stats Bar with Export */}
            <div className="mt-12">
              <Card className={`backdrop-blur-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-emerald-900/50 via-emerald-800/50 to-emerald-900/50 border-emerald-700/50' 
                  : 'bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 border-emerald-200/50'
              }`}>
                <CardContent className="py-6">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Stats Display */}
                    <div className="flex items-center gap-8 lg:gap-12 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shadow-lg transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-blue-800 to-blue-700' 
                            : 'bg-gradient-to-br from-blue-100 to-blue-50'
                        }`}>
                          <FileText className={`h-5 w-5 ${
                            isDarkMode ? 'text-blue-200' : 'text-blue-700'
                          }`} />
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold transition-colors duration-300 ${
                            isDarkMode ? 'text-emerald-200' : 'text-emerald-800'
                          }`}>
                            Active Invoices
                          </p>
                          <p className={`text-2xl font-bold transition-colors duration-300 ${
                            isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
                          }`}>
                            24
                          </p>
                        </div>
                      </div>
                      
                      <div className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-emerald-600' : 'text-emerald-300'
                      }`}>|</div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shadow-lg transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-orange-800 to-orange-700' 
                            : 'bg-gradient-to-br from-orange-100 to-orange-50'
                        }`}>
                          <Clock className={`h-5 w-5 ${
                            isDarkMode ? 'text-orange-200' : 'text-orange-700'
                          }`} />
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold transition-colors duration-300 ${
                            isDarkMode ? 'text-emerald-200' : 'text-emerald-800'
                          }`}>
                            Pending Payouts
                          </p>
                          <p className={`text-2xl font-bold transition-colors duration-300 ${
                            isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
                          }`}>
                            7
                          </p>
                        </div>
                      </div>
                      
                      <div className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-emerald-600' : 'text-emerald-300'
                      }`}>|</div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shadow-lg transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-green-800 to-green-700' 
                            : 'bg-gradient-to-br from-green-100 to-green-50'
                        }`}>
                          <BarChart3 className={`h-5 w-5 ${
                            isDarkMode ? 'text-green-200' : 'text-green-700'
                          }`} />
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold transition-colors duration-300 ${
                            isDarkMode ? 'text-emerald-200' : 'text-emerald-800'
                          }`}>
                            Total Revenue
                          </p>
                          <p className={`text-2xl font-bold transition-colors duration-300 ${
                            isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
                          }`}>
                            $534.6K
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Export & Share Options */}
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleExport('csv')}
                              size="sm"
                              className={`transition-all duration-300 shadow-lg ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-blue-100 border-blue-500' 
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-400'
                              }`}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              CSV
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">Export financial data as CSV</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleExport('pdf')}
                              size="sm"
                              className={`transition-all duration-300 shadow-lg ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-red-100 border-red-500' 
                                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-400'
                              }`}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">Export financial report as PDF</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => {
                                // Share functionality
                                navigator.clipboard.writeText(`Finance Hub Summary: 24 Active Invoices, 7 Pending Payouts, $534.6K Total Revenue`);
                              }}
                              size="sm"
                              variant="outline"
                              className={`transition-all duration-300 shadow-lg ${
                                isDarkMode 
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-500' 
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">Copy summary to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}