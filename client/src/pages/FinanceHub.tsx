import React, { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Brain
} from "lucide-react";
import TopBar from "@/components/TopBar";
import RefreshDataButton from "@/components/RefreshDataButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useFastAuth } from "@/lib/fastAuth";

// Lazy load all Finance modules
const FinancesPage = lazy(() => import("./CachedFinances"));
const InvoiceGenerator = lazy(() => import("./CachedInvoiceGenerator"));
const UtilityTracker = lazy(() => import("./CachedUtilityTracker"));
const FinanceEngine = lazy(() => import("./FinanceEngine"));
const SmartPricingPerformanceToolkit = lazy(() => import("./SmartPricingPerformanceToolkit"));
const OtaPayoutLogicSmartRevenue = lazy(() => import("./OtaPayoutLogicSmartRevenue"));
const SimpleFilteredFinancialDashboard = lazy(() => import("./SimpleFilteredFinancialDashboard"));
const OwnerInvoicingPayouts = lazy(() => import("./OwnerInvoicingPayouts"));
const SalariesWages = lazy(() => import("./SalariesWages"));
const FinanceIntelligenceModule = lazy(() => import("./FinanceIntelligenceModule"));

export default function FinanceHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { user } = useFastAuth();

  const financeItems = [
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading {selectedItem.title}...</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFinanceItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card
                    key={item.key}
                    className={`h-full ${item.color} border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-opacity-60 cursor-pointer group`}
                    onClick={() => handleModuleClick(item.key)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white/50">
                            <IconComponent className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${item.badge === "Admin Only" ? "bg-red-100 text-red-700 border-red-300" : "bg-white/70 text-gray-700 border border-gray-300"}`}
                        >
                          {item.badge === "Admin Only" && <Shield className="h-3 w-3 mr-1" />}
                          {item.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}