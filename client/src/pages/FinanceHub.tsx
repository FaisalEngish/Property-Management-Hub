import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  CheckCircle2,
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
  pendingPayments: number;
  confirmedBookingsCount: number;
  pendingBookingsCount: number;
}

interface FinanceTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
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

  const analyticsUrl = propertyFilter !== "all" 
    ? `/api/finance/analytics?propertyId=${propertyFilter}`
    : "/api/finance/analytics";

  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<FinanceAnalytics>({
      queryKey: [analyticsUrl],
    });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<
    FinanceTransaction[]
  >({
    queryKey: ["/api/finance"],
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  // Get propertyId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlPropertyId = urlParams.get("propertyId");

  // Handle URL parameters for property-specific filtering
  useEffect(() => {
    if (urlPropertyId) {
      setPropertyFilter(urlPropertyId);
    }
  }, [urlPropertyId]);

  // Find selected property for display
  const selectedProperty = urlPropertyId 
    ? properties.find((p: any) => p.id === parseInt(urlPropertyId))
    : null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/finance"] }),
        queryClient.refetchQueries({ queryKey: ["/api/finance/analytics"] }),
      ]);
      toast({
        title: "Refreshed",
        description: "Finance data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh finance data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  // Filtered transactions based on filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (propertyFilter !== "all") {
      filtered = filtered.filter(
        (t) => String(t.propertyId) === propertyFilter,
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter((t) => new Date(t.date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter((t) => new Date(t.date) <= new Date(dateTo));
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, propertyFilter, categoryFilter, dateFrom, dateTo]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map((t) => t.category));
    return Array.from(uniqueCategories).sort();
  }, [transactions]);

  // Get recent transactions (top 10)
  const recentTransactions = useMemo(() => {
    return filteredTransactions.slice(0, 10);
  }, [filteredTransactions]);

  const clearFilters = () => {
    setPropertyFilter("all");
    setCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          {urlPropertyId && selectedProperty ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Finance Hub - {selectedProperty.name}</h1>
              <p className="text-gray-500 mt-1">
                Financial data for this property
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Finance Hub</h1>
              <p className="text-gray-500 mt-1">
                Comprehensive financial management and analytics
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {urlPropertyId && (
            <Button
              variant="outline"
              onClick={() => window.location.href = '/finance-hub'}
              data-testid="button-view-all-finances"
            >
              View All Finances
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            data-testid="button-refresh-finance"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="button-create-finance"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {analytics?.confirmedBookingsCount || 0} confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {transactions.filter((t) => t.type === "expense").length}{" "}
              expense transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(analytics?.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(analytics?.netProfit || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics?.profitMargin?.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(analytics?.pendingPayments || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {analytics?.pendingBookingsCount || 0} pending bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Hide when viewing property-specific finances */}
      {!urlPropertyId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              {(propertyFilter !== "all" ||
                categoryFilter !== "all" ||
                dateFrom ||
                dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-filter">Property</Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger
                    id="property-filter"
                    data-testid="select-property-filter"
                  >
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={String(property.id)}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger
                    id="category-filter"
                    data-testid="select-category-filter"
                  >
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-gray-500">
              Showing {recentTransactions.length} of{" "}
              {filteredTransactions.length} transactions
            </p>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or add a new transaction
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const property = properties.find(
                    (p) => p.id === transaction.propertyId,
                  );
                  const hasEvidence =
                    transaction.attachments &&
                    transaction.attachments.length > 0;

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight
                              className={`h-4 w-4 text-green-600`}
                            />
                          ) : (
                            <ArrowDownRight
                              className={`h-4 w-4 text-red-600`}
                            />
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
                                <span className="text-sm text-gray-500">
                                  {property.name}
                                </span>
                              </>
                            )}
                            <span className="text-gray-300">•</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                            {hasEvidence && (
                              <CheckCircle2
                                className="h-4 w-4 text-green-600 ml-1"
                                title={`${transaction.attachments?.length} evidence photo(s) attached`}
                                data-testid={`evidence-indicator-${transaction.id}`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
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
