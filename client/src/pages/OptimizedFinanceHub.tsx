import React, { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Zap,
  BarChart3,
  ArrowLeft,
  Loader2
} from "lucide-react";

import PaginatedTable from "@/components/PaginatedTable";
import LazyChart from "@/components/LazyChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiRequest } from "@/lib/queryClient";

// Lazy load detailed components only when clicked
const DetailedRevenue = lazy(() => import("./CachedFinances"));
const DetailedInvoices = lazy(() => import("./CachedInvoiceGenerator"));
const DetailedUtilities = lazy(() => import("./CachedUtilityTracker"));

interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyGrowth: number;
  transactionCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function OptimizedFinanceHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Single API call for finance hub summary
  const { data: financeData, isLoading, error } = useQuery({
    queryKey: ['/api/finance-hub/summary', currentPage, pageLimit],
    queryFn: () => 
      fetch(`/api/finance-hub/summary?page=${currentPage}&limit=${pageLimit}`, {
        credentials: 'include'
      }).then(res => res.json()),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "฿0";
    return `฿${amount.toLocaleString()}`;
  };

  // If a detailed module is selected, render it
  if (selectedModule) {
    const moduleComponents = {
      'revenue': DetailedRevenue,
      'invoices': DetailedInvoices,
      'utilities': DetailedUtilities
    };

    const Component = moduleComponents[selectedModule as keyof typeof moduleComponents];
    
    if (Component) {
      return (
        <div>
          <div className="p-4 border-b bg-white">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Finance Hub
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)} Details
              </h1>
            </div>
          </div>
              
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-2">Loading detailed view...</p>
              </div>
            </div>
          }>
            <Component />
          </Suspense>
        </div>
      );
    }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Hub</h1>
          <p className="text-gray-600 mt-1">
            Complete financial management with server-side pagination and on-demand loading
          </p>
        </div>
      </div>

      {/* Summary Cards - Always visible */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-20">
                  <LoadingSpinner size="md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Failed to load finance summary</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : financeData?.summary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financeData.summary.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financeData.summary.totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(financeData.summary.netProfit)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {financeData.summary.transactionCount.toLocaleString()}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Tabs for different views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Analytics</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setSelectedModule('revenue')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Detailed Revenue
                </Button>
                <Button
                  onClick={() => setSelectedModule('invoices')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Invoices
                </Button>
                <Button
                  onClick={() => setSelectedModule('utilities')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Track Utilities
                </Button>
              </CardContent>
            </Card>

                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {financeData?.summary && (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Monthly Growth:</span>
                            <Badge variant={financeData.summary.monthlyGrowth >= 0 ? "default" : "destructive"}>
                              {financeData.summary.monthlyGrowth >= 0 ? '+' : ''}{financeData.summary.monthlyGrowth}%
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Profit Margin:</span>
                            <Badge variant="outline">
                              {financeData.summary.totalRevenue > 0 
                                ? ((financeData.summary.netProfit / financeData.summary.totalRevenue) * 100).toFixed(1)
                                : 0}%
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Transactions Tab - Paginated */}
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {financeData?.transactions && financeData?.pagination ? (
                      <PaginatedTable
                        pagination={financeData.pagination}
                        onPageChange={setCurrentPage}
                        onLimitChange={setPageLimit}
                        isLoading={isLoading}
                      >
                        <div className="space-y-3">
                          {financeData.transactions.map((transaction: any) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h3 className="font-semibold">{transaction.type || 'Transaction'}</h3>
                                <p className="text-sm text-gray-600">{transaction.description || 'No description'}</p>
                                <p className="text-xs text-gray-500">{transaction.date || 'No date'}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${
                                  transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(transaction.amount)}
                                </p>
                                <Badge variant="outline">{transaction.category || 'General'}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </PaginatedTable>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No transaction data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Charts Tab - Lazy loaded */}
              <TabsContent value="charts" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LazyChart
                    title="Revenue Trends"
                    description="7-day revenue performance"
                    endpoint="/api/charts/finance-trends?period=7d"
                    chartType="line"
                    height={300}
                  />
                  
                  <LazyChart
                    title="Expense Categories"
                    description="Monthly expense breakdown"
                    endpoint="/api/charts/finance-trends?period=30d"
                    chartType="pie"
                    height={300}
                  />
                </div>
              </TabsContent>

              {/* Modules Tab */}
              <TabsContent value="modules">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedModule('revenue')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Revenue Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Detailed revenue tracking and payout calculations
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Open Module
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedModule('invoices')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Invoice Generator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Create and manage invoices with automated tracking
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Open Module
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedModule('utilities')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Utility Tracker
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Monitor utility bills and track property expenses
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Open Module
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
        </Tabs>
      </div>
    </>
  );
}