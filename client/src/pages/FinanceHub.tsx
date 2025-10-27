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
  X,
  CheckCircle2
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
  bookingMonthlyRevenue?: number;
}

interface FinanceTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  propertyId?: number | string;
  attachments?: string[];
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

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings"]
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

  // Filter transactions based on ALL selected criteria (property, category, date range)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Property filter - compare as strings to handle both numeric and string IDs
      if (propertyFilter !== "all" && String(transaction.propertyId) !== String(propertyFilter)) {
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

  // Calculate analytics based on filtered transactions
  // Date range, property filter, and category filter ALL affect these stats
  const filteredAnalytics = useMemo(() => {
    // Calculate booking-based revenue (matches Property Dashboard)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Filter bookings for selected property and date range
    const propertyBookings = bookings.filter((b: any) => {
      if (propertyFilter !== "all" && String(b.propertyId) !== String(propertyFilter)) {
        return false;
      }
      return b.status !== 'cancelled';
    });
    
    // Calculate booking revenue (matches Property Dashboard logic)
    const bookingMonthlyRevenue = propertyBookings
      .filter((b: any) => {
        const checkIn = new Date(b.checkIn);
        return checkIn >= startOfMonth && checkIn <= endOfMonth;
      })
      .reduce((sum: number, b: any) => sum + parseFloat(String(b.platformPayout || b.totalAmount) || '0'), 0);
    
    // Calculate totals from FILTERED transactions (affected by property, category, AND date range)
    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(String(t.amount) || '0')), 0);
    
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
      .reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(String(t.amount) || '0')), 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: filteredTransactions.length,
      averageTransaction: filteredTransactions.length > 0 ? 
        (totalRevenue + totalExpenses) / filteredTransactions.length : 0,
      monthlyRevenue,
      monthlyExpenses,
      bookingMonthlyRevenue
    };
  }, [filteredTransactions, bookings, propertyFilter]);

  const recentTransactions = filteredTransactions.slice(0, 10);

  // Get property name for filtered view - compare as strings to handle both numeric and string IDs
  const selectedProperty = properties.find(p => String(p.id) === String(propertyFilter));
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
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Property Filter */}
              <div className="space-y-2">
                <Label htmlFor="property-filter">Property</Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger id="property-filter" data-testid="select-property-filter">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={String(property.id)}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter" data-testid="select-category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
            </div>
            
            {/* Active Filters and Clear Button */}
            {(propertyFilter !== "all" || categoryFilter !== "all" || dateFrom || dateTo) && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  {propertyFilter !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Property: {selectedProperty?.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setPropertyFilter("all")} />
                    </Badge>
                  )}
                  {categoryFilter !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {categoryFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("all")} />
                    </Badge>
                  )}
                  {dateFrom && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      From: {dateFrom}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFrom("")} />
                    </Badge>
                  )}
                  {dateTo && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      To: {dateTo}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setDateTo("")} />
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
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
                    <span>{dateFrom || dateTo ? 'Filtered period' : 'All time'}</span>
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
                    <span>{dateFrom || dateTo ? 'Filtered period' : 'All time'}</span>
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
                  <div className={`text-2xl font-bold ${filteredAnalytics.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {formatCurrency(filteredAnalytics.netProfit)}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                    <Receipt className="h-3 w-3" />
                    <span>Margin: {filteredAnalytics.profitMargin.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {formatNumber(filteredAnalytics.transactionCount)}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                    <DollarSign className="h-3 w-3" />
                    <span>Avg: {formatCurrency(filteredAnalytics.averageTransaction)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Monthly Revenue (Current Month)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(filteredAnalytics.monthlyRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Monthly Expenses (Current Month)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(filteredAnalytics.monthlyExpenses)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Booking Revenue (Current Month)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(filteredAnalytics.bookingMonthlyRevenue || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">From bookings table</div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found matching your filters
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const property = properties.find(p => p.id === transaction.propertyId);
                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                          ) : (
                            <ArrowDownRight className={`h-4 w-4 text-red-600`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                            {property && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{property.name}</span>
                              </>
                            )}
                            <span className="text-gray-300">•</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                            {transaction.attachments && transaction.attachments.length > 0 && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 ml-1" title="Evidence attached" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  );
                })}
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
