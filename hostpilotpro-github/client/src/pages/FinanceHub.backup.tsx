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
  ArrowLeft
} from "lucide-react";
import TopBar from "@/components/TopBar";

// Lazy load all Finance modules - only load when user clicks
const FinancesPage = lazy(() => import("./Finances"));
const InvoiceGenerator = lazy(() => import("./InvoiceGenerator"));
const UtilityTracker = lazy(() => import("./UtilityTracker"));
const FinanceEngine = lazy(() => import("./FinanceEngine"));
const SmartPricingPerformanceToolkit = lazy(() => import("./SmartPricingPerformanceToolkit"));
const OtaPayoutLogicSmartRevenue = lazy(() => import("./OtaPayoutLogicSmartRevenue"));
const SimpleFilteredFinancialDashboard = lazy(() => import("./SimpleFilteredFinancialDashboard"));
const OwnerInvoicingPayouts = lazy(() => import("./OwnerInvoicingPayouts"));

export default function FinanceHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Finance Hub" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Finance Hub</h1>
              <p className="text-gray-600">
                Complete financial management suite for revenue tracking, billing, and analytics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financeItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.color}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <IconComponent className="h-6 w-6 text-gray-700" />
                            </div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}