import { useState, useMemo, useEffect } from "react";
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
  Wrench,
  ChevronDown,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useCurrency } from "../hooks/useCurrency";
import { queryClient } from "../lib/queryClient";
import { queryKeys } from "../lib/queryKeys";
import CreateFinanceDialog from "../components/CreateFinanceDialog";
import { BackButton } from "@/components/BackButton";

interface FinanceAnalytics {
  currency: string;  // Base currency of all amounts (THB)
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
  id: number | string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  propertyId?: number | string;
  attachments?: string[];
  referenceNumber?: string;
  currency?: string;
  createdAt?: string;  // Track creation date for chronological sorting
}

export default function FinanceHub() {
  const { toast } = useToast();
  const { formatWithConversion, formatCurrency, currencySymbol, baseCurrency, displayCurrency, convertAmount } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [outstandingVisibleCount, setOutstandingVisibleCount] = useState(10);
  const [transactionsVisibleCount, setTransactionsVisibleCount] = useState(10);

  // Filter states
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<FinanceAnalytics>({
      queryKey:
        propertyFilter !== "all"
          ? queryKeys.finance.analytics(propertyFilter)
          : queryKeys.finance.analytics(),
    });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<
    FinanceTransaction[]
  >({
    queryKey:
      propertyFilter !== "all"
        ? [`/api/finance?propertyId=${propertyFilter}`]
        : queryKeys.finance.all(),
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: queryKeys.properties.all(),
  });

  // Fetch bookings with outstanding payments (using with-source to include HOSTAWAY + LOCAL)
  const { data: bookings = [] } = useQuery<any[]>({
    queryKey:
      propertyFilter !== "all"
        ? queryKeys.bookings.withSource(propertyFilter)
        : queryKeys.bookings.withSource(),
  });

  // Fetch booking revenue records for Recent Transactions
  const { data: bookingRevenue = [] } = useQuery<any[]>({
    queryKey:
      propertyFilter !== "all"
        ? [`/api/booking-revenue?propertyId=${propertyFilter}`]
        : ["/api/booking-revenue"],
  });

  // Fetch service bookings (addon services) for Recent Transactions
  const { data: serviceBookingsData } = useQuery<any>({
    queryKey:
      propertyFilter !== "all"
        ? [`/api/service-bookings?propertyId=${propertyFilter}`]
        : ["/api/service-bookings"],
  });
  const serviceBookings = Array.isArray(serviceBookingsData?.bookings) 
    ? serviceBookingsData.bookings 
    : [];

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
        // Refetch finance queries including property-filtered ones
        queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === "string" && key.includes("/api/finance");
          },
        }),
        queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === "string" && key.includes("/api/booking-revenue");
          },
        }),
        queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === "string" && key.includes("/api/service-bookings");
          },
        }),
        queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === "string" && key.includes("/api/bookings");
          },
        }),
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


  // Helper function to normalize source string for consistent deduplication
  const normalizeSource = (source: string | null | undefined): string => {
    if (!source) return 'BOOKING';
    const upper = source.toUpperCase().trim();
    // Normalize various Hostaway labels to consistent 'HOSTAWAY'
    if (upper.includes('HOSTAWAY')) return 'HOSTAWAY';
    if (upper.includes('LOCAL')) return 'LOCAL';
    if (upper.includes('DIRECT')) return 'DIRECT';
    if (upper.includes('RETAIL')) return 'RETAIL';
    return upper || 'BOOKING';
  };

  // Filtered transactions based on filters (includes booking revenue, confirmed bookings, and service bookings)
  const filteredTransactions = useMemo(() => {
    // Convert booking revenue to transaction format (from booking_revenue table - paid bookings)
    const bookingRevenueTransactions: FinanceTransaction[] = bookingRevenue
      .filter((booking: any) => {
        // Only show paid bookings as revenue transactions
        const status = (booking.paymentStatus || '').toLowerCase();
        return status === 'paid';
      })
      .map((booking: any) => {
        const amount = parseFloat(booking.finalPayoutAmount || booking.guestBookingPrice || '0');
        const normalizedSource = normalizeSource(booking.otaName);
        // Create unique identifier using reservationCode or normalized source-id fallback
        const uniqueKey = booking.reservationCode || `${normalizedSource}-${booking.id}`;
        const rawDate = booking.checkInDate || booking.createdAt;
        const normalizedDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();
        return {
          id: `booking-revenue-${booking.id}`,
          date: normalizedDate,
          description: `Booking: ${booking.guestName} (${booking.reservationCode || 'N/A'})`,
          amount: amount,
          type: "income" as const,
          category: "Booking Revenue",
          propertyId: booking.propertyId,
          referenceNumber: uniqueKey,
          currency: booking.currency || 'THB',
          createdAt: booking.createdAt || normalizedDate,
        };
      });

    // Convert confirmed bookings from bookings table (HOSTAWAY + LOCAL) to transaction format
    // These are confirmed/checked-in/checked-out bookings that represent revenue
    const confirmedBookingTransactions: FinanceTransaction[] = bookings
      .filter((booking: any) => {
        const status = (booking.status || '').toLowerCase();
        // Use normalizeSource to handle all Hostaway variants (Hostaway, HOSTAWAY, Hostaway PMS, etc.)
        const normalizedSource = normalizeSource(booking.source);
        // Include confirmed/checked-in/checked-out bookings from HOSTAWAY and LOCAL sources
        const isConfirmedStatus = ['confirmed', 'checked-in', 'checked-out'].includes(status);
        const isFromBookingsTable = ['HOSTAWAY', 'LOCAL', 'DIRECT', 'RETAIL'].includes(normalizedSource);
        return isConfirmedStatus && isFromBookingsTable;
      })
      .map((booking: any) => {
        const amount = parseFloat(booking.totalAmount || '0');
        const normalizedSource = normalizeSource(booking.source);
        // Use checkIn (legacy) or checkInDate (from getBookingsWithSource) for date
        const rawCheckInDate = booking.checkIn || booking.checkInDate || booking.createdAt;
        // Normalize date to ISO string for consistent filtering/sorting
        const checkInDate = rawCheckInDate ? new Date(rawCheckInDate).toISOString() : new Date().toISOString();
        // Create unique identifier using normalized source and id as fallback when reservationCode is missing
        const uniqueKey = booking.reservationCode || `${normalizedSource}-${booking.id}`;
        return {
          id: `booking-${booking.id}`,
          date: checkInDate,
          description: `${normalizedSource}: ${booking.guestName} (${booking.reservationCode || 'N/A'})`,
          amount: amount,
          type: "income" as const,
          category: "Booking Revenue",
          propertyId: booking.propertyId,
          referenceNumber: uniqueKey,
          currency: booking.currency || 'THB',
          createdAt: booking.createdAt || checkInDate,
        };
      });

    // Deduplicate: remove bookingRevenue entries that match existing booking entries
    // Use Set of unique keys (reservationCode or source-id fallback) from confirmed bookings
    const confirmedUniqueKeys = new Set(
      confirmedBookingTransactions.map(t => t.referenceNumber).filter(Boolean)
    );
    const uniqueBookingRevenueTransactions = bookingRevenueTransactions.filter(t => {
      // For bookingRevenue, check if its reservationCode matches any confirmed booking
      if (!t.referenceNumber) return true; // Keep if no reference
      return !confirmedUniqueKeys.has(t.referenceNumber);
    });

    // Combine all booking transactions - confirmed bookings take priority
    const bookingTransactions = [...confirmedBookingTransactions, ...uniqueBookingRevenueTransactions];

    // Convert service bookings to transaction format (add-on services revenue)
    // Show ALL billable service bookings (pending, paid, completed) for visibility
    const serviceTransactions: FinanceTransaction[] = serviceBookings
      .filter((booking: any) => {
        const billingType = booking.billingType || '';
        const isBillable = ['auto_guest', 'auto_owner'].includes(billingType);
        return booking.priceCents && booking.priceCents > 0 && isBillable;
      })
      .map((booking: any) => {
        const amount = booking.priceCents ? booking.priceCents / 100 : 0;
        const status = (booking.status || 'pending').toLowerCase();
        const statusLabel = status === 'pending' ? ' (Pending)' : status === 'completed' ? ' (Completed)' : '';
        return {
          id: `service-${booking.id}`,
          date: booking.scheduledDate || booking.createdAt,
          description: `Service: ${booking.serviceName || 'Add-on Service'} - ${booking.guestName}${statusLabel}`,
          amount: amount,
          type: "income" as const,
          category: "Service Revenue",
          propertyId: booking.propertyId,
          referenceNumber: booking.bookingIdRef || undefined,
          currency: booking.currency || 'THB',
          createdAt: booking.createdAt,  // Use record creation date
        };
      });

    // Merge finance transactions, booking revenue, and service bookings
    let filtered = [...transactions, ...bookingTransactions, ...serviceTransactions];

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

    // Sort by creation date (newest first) for chronological ordering
    return filtered.sort((a, b) => {
      const aCreatedAt = a.createdAt || a.date;
      const bCreatedAt = b.createdAt || b.date;
      return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();
    });
  }, [transactions, bookingRevenue, bookings, serviceBookings, propertyFilter, categoryFilter, dateFrom, dateTo]);

  // Get unique categories for filter (include service and booking categories)
  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map((t) => t.category));
    // Add booking and service categories
    uniqueCategories.add("Booking Revenue");
    uniqueCategories.add("Service Revenue");
    return Array.from(uniqueCategories).sort();
  }, [transactions]);

  // Get recent transactions based on visible count
  const recentTransactions = useMemo(() => {
    return filteredTransactions.slice(0, transactionsVisibleCount);
  }, [filteredTransactions, transactionsVisibleCount]);

  // Calculate outstanding payments from bookings (sorted by creation date, newest first)
  // Exclude pending bookings to avoid double-counting with pendingPayments from analytics
  const outstandingBookings = useMemo(() => {
    return bookings
      .filter((booking: any) => {
        const amountDue = parseFloat(booking.amountDue || "0");
        const status = (booking.status || '').toLowerCase();
        // Only include non-pending bookings with outstanding amounts
        const isPending = status === 'pending' || status === 'pending_payment' || status === 'awaiting_payment';
        return amountDue > 0 && !isPending;
      })
      .sort((a: any, b: any) => {
        const aCreatedAt = a.createdAt || a.checkIn || a.id;
        const bCreatedAt = b.createdAt || b.checkIn || b.id;
        // Sort by creation date descending (newest first)
        return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();
      });
  }, [bookings]);

  const totalOutstanding = useMemo(() => {
    return outstandingBookings.reduce((sum: number, booking: any) => {
      const amountDue = parseFloat(booking.amountDue || "0");
      const bookingCurrency = booking.currency || 'USD';
      // Convert to THB (display currency) before summing
      const amountInTHB = convertAmount(amountDue, bookingCurrency);
      return sum + amountInTHB;
    }, 0);
  }, [outstandingBookings, convertAmount]);

  const clearFilters = () => {
    setPropertyFilter("all");
    setCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="max-w-7xl mx-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Back to Dashboard Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = "/dashboard-hub"}
          className="!p-2 !rounded-md bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm"
        >
          <ArrowUpRight className="h-4 w-4 mr-2 rotate-[-135deg]" />
          <span className="hidden sm:inline text-sm">Back to Dashboard</span>
          <span className="sm:hidden text-sm">Dashboard</span>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="min-w-0 flex-1">
          {urlPropertyId && selectedProperty ? (
            <>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Finance Hub - {selectedProperty.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Financial data for this property
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Finance Hub</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Comprehensive financial management and analytics
              </p>
            </>
          )}
        </div>
        <div className="flex gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
          {urlPropertyId && (
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/finance-hub")}
              data-testid="button-view-all-finances"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              <span className="hidden sm:inline">View All Finances</span>
              <span className="sm:hidden">All</span>
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            data-testid="button-refresh-finance"
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            <RefreshCw
              className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="button-create-finance"
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
              {formatWithConversion(analytics?.totalRevenue || 0, analytics?.currency || 'THB')}
            </div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
              From {analytics?.confirmedBookingsCount || 0} confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Expenses
            </CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-red-600 truncate">
              {formatWithConversion(analytics?.totalExpenses || 0, analytics?.currency || 'THB')}
            </div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
              From {filteredTransactions.filter((t) => t.type === "expense").length}{" "}
              expense transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div
              className={`text-lg sm:text-2xl font-bold truncate ${(analytics?.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatWithConversion(analytics?.netProfit || 0, analytics?.currency || 'THB')}
            </div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
              {analytics?.profitMargin?.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Pending
            </CardTitle>
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-600 truncate">
              {/* Convert pendingPayments from THB to display currency, then add already-converted totalOutstanding */}
              {formatCurrency(convertAmount(analytics?.pendingPayments || 0, 'THB') + totalOutstanding)}
            </div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
              {analytics?.pendingBookingsCount || 0} pending + {outstandingBookings.length} outstanding
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
                <Select
                  value={propertyFilter}
                  onValueChange={setPropertyFilter}
                >
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
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
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
                  const isTaskExpense =
                    transaction.referenceNumber?.startsWith("TASK-");

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
                            {isTaskExpense && (
                              <Wrench
                                className="h-4 w-4 text-blue-600 ml-1"
                                title="Task expense"
                                data-testid={`task-indicator-${transaction.id}`}
                              />
                            )}
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
                        {formatWithConversion(Math.abs(transaction.amount), transaction.currency)}
                      </div>
                    </div>
                  );
                })}
                
                {/* Show More Button - Progressive loading: 10 -> 30 -> 50 */}
                {transactionsVisibleCount < filteredTransactions.length && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setTransactionsVisibleCount(prev => {
                        if (prev === 10) return 30;
                        if (prev === 30) return 50;
                        return Math.min(prev + 20, filteredTransactions.length);
                      })}
                      className="flex items-center gap-2"
                      data-testid="button-show-more-transactions"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Show More ({filteredTransactions.length - transactionsVisibleCount} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Payments from Bookings */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  Outstanding Payments
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Payments due from bookings
                </p>
              </div>
              {totalOutstanding > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatWithConversion(totalOutstanding, 'THB')}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {outstandingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-900 font-medium">
                  All Payments Up to Date
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  No outstanding payments from bookings
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {outstandingBookings.slice(0, outstandingVisibleCount).map((booking: any) => {
                  const property = properties.find(
                    (p) => p.id === booking.propertyId,
                  );
                  const amountDue = parseFloat(booking.amountDue || "0");
                  const totalAmount = parseFloat(booking.totalAmount || "0");
                  const amountPaid = parseFloat(booking.amountPaid || "0");
                  const percentagePaid =
                    totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0;

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50"
                      data-testid={`outstanding-booking-${booking.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {booking.guestName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {property && (
                            <>
                              <span className="text-sm text-gray-600">
                                {property.name}
                              </span>
                              <span className="text-gray-300">•</span>
                            </>
                          )}
                          <span className="text-sm text-gray-600">
                            Check-in:{" "}
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </span>
                          <span className="text-gray-300">•</span>
                          <Badge
                            className={`${booking.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"} text-xs`}
                          >
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${percentagePaid}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatWithConversion(amountPaid, booking.currency || 'THB')} / {formatWithConversion(totalAmount, booking.currency || 'THB')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-500">Amount Due</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatWithConversion(amountDue, booking.currency || 'THB')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {outstandingBookings.length > outstandingVisibleCount && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOutstandingVisibleCount(prev => {
                          if (prev <= 10) return 20;
                          if (prev <= 20) return 40;
                          if (prev <= 40) return 50;
                          return outstandingBookings.length;
                        });
                      }}
                      className="gap-2"
                      data-testid="show-more-outstanding"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Show More ({outstandingBookings.length - outstandingVisibleCount} remaining)
                    </Button>
                  </div>
                )}
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
