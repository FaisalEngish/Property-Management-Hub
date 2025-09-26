import React, { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  CheckCircle
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
  const { user } = useFastAuth();

  const financeItems = [
    {
      title: "Enhanced Financial Analytics",
      description: "Advanced revenue and payout analysis with multi-dimensional filtering by property, department, time frame, and business intelligence",
      key: "enhanced-finances",
      icon: TrendingUp,
      badge: "Advanced",
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      component: EnhancedFinances
    },
    {
      title: "Revenue & Payouts",
      description: "Track property revenue, owner payouts, and commission calculations",
      key: "finances",
      icon: DollarSign,
      badge: "Core",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      component: FinancesPage
    },
    {
      title: "Invoices & Income", 
      description: "Generate invoices, track payments, and manage income streams",
      key: "invoice-generator",
      icon: FileText,
      badge: "Billing",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: InvoiceGenerator
    },
    {
      title: "Utility Tracker",
      description: "Monitor utility bills, track usage, and manage property expenses",
      key: "utility-tracker",
      icon: Zap,
      badge: "Utilities",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
      component: UtilityTracker
    },
    {
      title: "Finance Engine",
      description: "Advanced financial analytics, reporting, and performance metrics",
      key: "finance-engine",
      icon: Calculator,
      badge: "Analytics",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      component: FinanceEngine
    },
    {
      title: "Smart Pricing",
      description: "AI-powered pricing optimization and market analysis tools",
      key: "smart-pricing-performance-toolkit",
      icon: TrendingUp,
      badge: "AI",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
      component: SmartPricingPerformanceToolkit
    },
    {
      title: "OTA Payout Logic",
      description: "Online travel agency commission tracking and payout calculations",
      key: "ota-payout-logic-smart-revenue",
      icon: ArrowUpDown,
      badge: "OTA",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      component: OtaPayoutLogicSmartRevenue
    },
    {
      title: "Financial Admin Cockpit",
      description: "Comprehensive financial overview with charts and key metrics",
      key: "simple-filtered-financial-dashboard",
      icon: PieChart,
      badge: "Overview",
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200",
      component: SimpleFilteredFinancialDashboard
    },
    {
      title: "Owner Invoicing & Payouts",
      description: "Manage owner payments, invoicing, and payout requests",
      key: "owner-invoicing-payouts",
      icon: CreditCard,
      badge: "Owners",
      color: "bg-teal-50 hover:bg-teal-100 border-teal-200",
      component: OwnerInvoicingPayouts
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
      adminOnly: true
    },
    {
      title: "Salaries & Wages",
      description: "Manage staff salaries, wages, and payroll information",
      key: "salaries-wages",
      icon: Users,
      badge: "Admin Only",
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      component: SalariesWages,
      adminOnly: true
    },
    {
      title: "Currency & Tax Management",
      description: "Configure currency settings, tax rates, and financial compliance options",
      key: "currency-tax-management",
      icon: Calculator,
      badge: "Admin Only",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: CurrencyTaxManagement,
      adminOnly: true
    },
    {
      title: "OTA Revenue Calculator",
      description: "Advanced OTA commission calculations and revenue optimization tools",
      key: "ota-revenue-calculator",
      icon: TrendingUp,
      badge: "Admin Only",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      component: OtaRevenueNetPayoutCalculation,
      adminOnly: true
    },
    {
      title: "Staff Expense Management",
      description: "Track staff expenses, reimbursements, and operational cost management",
      key: "staff-expense-management",
      icon: Receipt,
      badge: "Admin Only",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      component: StaffExpenseManagement,
      adminOnly: true
    }
  ];

  // Combine items based on user role
  const allFinanceItems = user?.role === "admin" 
    ? [...financeItems, ...adminOnlyItems]
    : financeItems;

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
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Finance Hub</h1>
                  <p className="text-gray-600">
                    Complete financial management suite for revenue tracking, billing, and analytics
                  </p>
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

            {/* Admin Access Pill Badge */}
            {user?.role === "admin" && (
              <div className="mb-6 flex justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 text-emerald-800 border-emerald-300/60 shadow-lg backdrop-blur-sm px-4 py-2 text-sm font-medium hover:shadow-emerald-200/80 transition-all duration-300">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Access Active
                        <span className="ml-2 bg-emerald-200/50 px-2 py-1 rounded-full text-xs">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFinanceItems.map((item) => {
                const IconComponent = item.icon;
                
                // Enhanced badge configurations with colors and tooltips
                const getBadgeConfig = (badge: string) => {
                  const configs = {
                    "Core": { 
                      color: "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-300", 
                      icon: "🏢", 
                      tooltip: "Essential finance functionality" 
                    },
                    "Advanced": { 
                      color: "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-300", 
                      icon: "⚡", 
                      tooltip: "Enhanced analytics and insights" 
                    },
                    "Billing": { 
                      color: "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border-purple-300", 
                      icon: "📄", 
                      tooltip: "Invoice and payment management" 
                    },
                    "Utilities": { 
                      color: "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-300", 
                      icon: "⚡", 
                      tooltip: "Utility bills and expenses" 
                    },
                    "Analytics": { 
                      color: "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-800 border-indigo-300", 
                      icon: "📊", 
                      tooltip: "Financial reporting and metrics" 
                    },
                    "AI": { 
                      color: "bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 border-pink-300", 
                      icon: "🤖", 
                      tooltip: "AI-powered insights and automation" 
                    },
                    "OTA": { 
                      color: "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-300", 
                      icon: "🌐", 
                      tooltip: "Online travel agency integrations" 
                    },
                    "Overview": { 
                      color: "bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 border-teal-300", 
                      icon: "👁️", 
                      tooltip: "Executive dashboard and overview" 
                    },
                    "Owners": { 
                      color: "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-300", 
                      icon: "👥", 
                      tooltip: "Property owner management" 
                    },
                    "Admin Only": { 
                      color: "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-300", 
                      icon: "🔒", 
                      tooltip: "Administrator access required" 
                    },
                    "AI Intelligence": { 
                      color: "bg-gradient-to-r from-violet-100 to-violet-50 text-violet-800 border-violet-300", 
                      icon: "🧠", 
                      tooltip: "Advanced AI-powered intelligence" 
                    }
                  };
                  return configs[badge as keyof typeof configs] || { 
                    color: "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-300", 
                    icon: "💼", 
                    tooltip: "Finance module" 
                  };
                };

                const badgeConfig = getBadgeConfig(item.badge);
                
                return (
                  <Card
                    key={item.key}
                    className="group cursor-pointer transition-all duration-500 ease-in-out bg-gradient-to-br from-white via-slate-50/40 to-emerald-50/20 backdrop-blur-sm border border-slate-200/60 hover:border-emerald-300/50 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.05] hover:-translate-y-2 relative overflow-hidden"
                    onClick={() => handleModuleClick(item.key)}
                  >
                    {/* Enhanced Glassmorphism overlay with glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-emerald-50/30 to-white/40 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gradient-to-br from-emerald-100/80 via-emerald-50/60 to-white/40 backdrop-blur-sm rounded-xl shadow-xl border border-emerald-200/50 group-hover:shadow-emerald-300/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">
                            <IconComponent className="h-6 w-6 text-emerald-700 group-hover:text-emerald-800 transition-colors duration-300" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors duration-300">
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
                      
                      {/* Quick Action Icons */}
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-700 transition-colors duration-200"
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
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
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
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 transition-colors duration-200"
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
                      <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Footer Stats Bar */}
            <div className="mt-12">
              <Card className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 backdrop-blur-sm border border-emerald-200/50">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-12 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg shadow-lg">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="text-center">
                          <p className="text-emerald-800 font-semibold">Active Invoices</p>
                          <p className="text-2xl font-bold text-emerald-900">24</p>
                        </div>
                      </div>
                      
                      <div className="text-emerald-300">|</div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg shadow-lg">
                          <Clock className="h-5 w-5 text-orange-700" />
                        </div>
                        <div className="text-center">
                          <p className="text-emerald-800 font-semibold">Pending Payouts</p>
                          <p className="text-2xl font-bold text-emerald-900">7</p>
                        </div>
                      </div>
                      
                      <div className="text-emerald-300">|</div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg shadow-lg">
                          <BarChart3 className="h-5 w-5 text-green-700" />
                        </div>
                        <div className="text-center">
                          <p className="text-emerald-800 font-semibold">Total Revenue</p>
                          <p className="text-2xl font-bold text-emerald-900">$534.6K</p>
                        </div>
                      </div>
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