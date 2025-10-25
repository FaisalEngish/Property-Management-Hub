import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Wallet,
  Plus,
  X
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { queryClient } from "../lib/queryClient";
import CreateFinanceDialog from "../components/CreateFinanceDialog";

interface FinanceAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  transactionCount: number;
  averageTransaction: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

interface FinanceTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  propertyId?: number;
}

export default function FinanceHub() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Filter states
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: analytics, isLoading: analyticsLoading } = useQuery<FinanceAnalytics>({
    queryKey: ["/api/finance/analytics"]
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<FinanceTransaction[]>({
    queryKey: ["/api/finance"]
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"]
  });

  // Handle URL parameters for property-specific filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('propertyId');
    
    if (propertyId) {
      setPropertyFilter(propertyId);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/finance/analytics"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/finance"] })
    ]);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["/api/finance/analytics"] }),
      queryClient.refetchQueries({ queryKey: ["/api/finance"] })
    ]);
    
    toast({
      title: "Financial data refreshed",
      description: "Latest financial information loaded successfully"
    });
    
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg">Loading financial data...</span>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Filter transactions based on selected criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Property filter
      if (propertyFilter !== "all" && transaction.propertyId !== parseInt(propertyFilter)) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && transaction.category !== categoryFilter) {
        return false;
      }

      // Date range filter
      if (dateFrom && new Date(transaction.date) < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && new Date(transaction.date) > new Date(dateTo)) {
        return false;
      }

      return true;
    });
  }, [transactions, propertyFilter, categoryFilter, dateFrom, dateTo]);

  // Recalculate analytics based on filtered transactions
  const filteredAnalytics = useMemo(() => {
    if (!filteredTransactions.length) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        transactionCount: 0,
        averageTransaction: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0
      };
    }

    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate monthly values for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTransactions = filteredTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: filteredTransactions.length,
      averageTransaction: filteredTransactions.length > 0 ? 
        (totalRevenue + totalExpenses) / filteredTransactions.length : 0,
      monthlyRevenue,
      monthlyExpenses
    };
  }, [filteredTransactions]);

  const recentTransactions = filteredTransactions.slice(0, 10);

  // Get property name for filtered view
  const selectedProperty = properties.find(p => p.id === parseInt(propertyFilter));
  const pageTitle = selectedProperty 
    ? `Finance Hub - ${selectedProperty.name}` 
    : "Finance Hub";

  // Clear all filters
  const clearFilters = () => {
    setPropertyFilter("all");
    setCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              {pageTitle}
            </h1>
            <p className="text-gray-600 mt-1">
              {selectedProperty 
                ? `Viewing financial data for ${selectedProperty.name}` 
                : "Financial management and analytics"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
              data-testid="button-create-transaction"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">Property</Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger data-testid="select-property-filter">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="booking-payment">Booking Payment</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">Date From</Label>
                <Input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">Date To</Label>
                <Input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(propertyFilter !== "all" || categoryFilter !== "all" || dateFrom || dateTo) && (
              <div className="mt-4">
                <Button 
                  onClick={clearFilters} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="button-clear-filters"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        {filteredAnalytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(filteredAnalytics.totalRevenue)}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>All time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">
                    {formatCurrency(filteredAnalytics.totalExpenses)}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>All time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Net Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(filteredAnalytics.netProfit)}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Margin: {filteredAnalytics.profitMargin.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {formatNumber(filteredAnalytics.transactionCount)}
                  </div>
                  <div className="text-xs text-purple-600 mt-2">
                    Avg: {formatCurrency(filteredAnalytics.averageTransaction)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Monthly Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {formatCurrency(filteredAnalytics.monthlyRevenue)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Current month income</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Monthly Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700">
                    {formatCurrency(filteredAnalytics.monthlyExpenses)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Current month costs</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center">No financial data available</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Recent Transactions
              <Badge variant="secondary" className="ml-2">
                {filteredTransactions.length} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className={`h-5 w-5 text-green-600`} />
                        ) : (
                          <ArrowDownRight className={`h-5 w-5 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No transactions found</p>
                <p className="text-sm mt-1">Financial transactions will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Finance Dialog */}
      <CreateFinanceDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}
