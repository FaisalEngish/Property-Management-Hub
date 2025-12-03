import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Search,
  Plus,
  Filter,
  Users,
  DollarSign,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  TrendingUp,
  CreditCard,
  CalendarDays,
  Building2,
  ArrowUpDown,
  ChevronDown,
  Download,
} from "lucide-react";
import { queryKeys, invalidateBookingQueries } from "@/lib/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { BackButton } from "@/components/BackButton";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import BookingDetailModal from "@/components/BookingDetailModal";
import { format, parseISO, isAfter, isBefore, isToday, addDays } from "date-fns";

interface Booking {
  id: number;
  organizationId: string;
  externalId?: string;
  source: string;
  bookingReference?: string;
  propertyId?: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestTotalPrice?: string;
  platformPayout?: string;
  otaCommissionAmount?: string;
  bookingPlatform?: string;
  totalAmount?: string;
  paymentStatus?: string;
  amountPaid?: string;
  amountDue?: string;
  currency?: string;
  status: string;
  hostawayId?: string;
  specialRequests?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Property {
  id: number;
  name: string;
  source?: string;
}

export default function BookingsCentral() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [sortField, setSortField] = useState<string>("checkIn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { formatWithConversion, displayCurrency } = useCurrency();

  const { data: bookingsData = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: queryKeys.bookings.all(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: propertiesData = [] } = useQuery<Property[]>({
    queryKey: queryKeys.properties.all(),
    staleTime: 30000,
  });

  const bookings = Array.isArray(bookingsData) ? bookingsData : [];
  const properties = Array.isArray(propertiesData) ? propertiesData : [];

  const getPropertyName = (propertyId?: number) => {
    if (!propertyId) return "Unassigned";
    const property = properties.find(p => p.id === propertyId);
    return property?.name || `Property #${propertyId}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      confirmed: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
      "checked-in": { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Home },
      "checked-out": { color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    const statusConfig: Record<string, string> = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      partial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    const color = statusConfig[paymentStatus?.toLowerCase() || "pending"] || statusConfig.pending;
    return (
      <Badge className={color}>
        {paymentStatus?.charAt(0).toUpperCase() + (paymentStatus?.slice(1) || "Pending")}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    return source === "HOSTAWAY" ? (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200">
        Hostaway
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200">
        Local
      </Badge>
    );
  };

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.guestName?.toLowerCase().includes(query) ||
        b.guestEmail?.toLowerCase().includes(query) ||
        b.bookingReference?.toLowerCase().includes(query) ||
        getPropertyName(b.propertyId).toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(b => b.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter(b => b.paymentStatus?.toLowerCase() === paymentFilter.toLowerCase());
    }

    if (propertyFilter !== "all") {
      filtered = filtered.filter(b => b.propertyId?.toString() === propertyFilter);
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter(b => b.source === sourceFilter);
    }

    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(b => {
        const checkIn = parseISO(b.checkIn);
        const checkOut = parseISO(b.checkOut);
        
        switch (dateFilter) {
          case "today":
            return isToday(checkIn) || isToday(checkOut) || 
                   (isBefore(checkIn, today) && isAfter(checkOut, today));
          case "upcoming":
            return isAfter(checkIn, today);
          case "past":
            return isBefore(checkOut, today);
          case "this-week":
            const weekEnd = addDays(today, 7);
            return (isAfter(checkIn, today) || isToday(checkIn)) && isBefore(checkIn, weekEnd);
          default:
            return true;
        }
      });
    }

    if (activeTab !== "all") {
      filtered = filtered.filter(b => b.status?.toLowerCase() === activeTab.toLowerCase());
    }

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case "checkIn":
          aVal = new Date(a.checkIn).getTime();
          bVal = new Date(b.checkIn).getTime();
          break;
        case "checkOut":
          aVal = new Date(a.checkOut).getTime();
          bVal = new Date(b.checkOut).getTime();
          break;
        case "guestName":
          aVal = a.guestName?.toLowerCase() || "";
          bVal = b.guestName?.toLowerCase() || "";
          break;
        case "totalAmount":
          aVal = parseFloat(a.totalAmount || "0");
          bVal = parseFloat(b.totalAmount || "0");
          break;
        case "createdAt":
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [bookings, searchQuery, statusFilter, paymentFilter, propertyFilter, sourceFilter, dateFilter, activeTab, sortField, sortDirection]);

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status?.toLowerCase() === "confirmed").length;
    const pendingBookings = bookings.filter(b => b.status?.toLowerCase() === "pending").length;
    const checkedInBookings = bookings.filter(b => b.status?.toLowerCase() === "checked-in").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);
    const paidRevenue = bookings
      .filter(b => b.paymentStatus?.toLowerCase() === "paid")
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);
    const pendingPayments = bookings
      .filter(b => b.paymentStatus?.toLowerCase() !== "paid")
      .reduce((sum, b) => sum + parseFloat(b.amountDue || b.totalAmount || "0"), 0);
    
    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      checkedInBookings,
      totalRevenue,
      paidRevenue,
      pendingPayments,
    };
  }, [bookings]);

  const handleRefresh = async () => {
    await refetchBookings();
    invalidateBookingQueries(queryClient);
    toast({
      title: "Refreshed",
      description: "Booking data has been synchronized",
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleViewBooking = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    try {
      const start = parseISO(checkIn);
      const end = parseISO(checkOut);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarDays className="h-8 w-8 text-primary" />
                Bookings Central
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage and track all property bookings across the system
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={bookingsLoading}
              data-testid="btn-refresh-bookings"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${bookingsLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="btn-create-booking"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-green-600">{stats.confirmedBookings} confirmed</Badge>
                <Badge variant="outline" className="text-yellow-600">{stats.pendingBookings} pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Currently Checked-In</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.checkedInBookings}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Home className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Active guests on property</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatWithConversion(stats.totalRevenue)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <p className="mt-2 text-sm text-green-600">{formatWithConversion(stats.paidRevenue)} collected</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</p>
                  <p className="text-3xl font-bold text-orange-600">{formatWithConversion(stats.pendingPayments)}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by guest, email, property..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-bookings"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-property-filter">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked-in">Checked In</SelectItem>
                    <SelectItem value="checked-out">Checked Out</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-payment-filter">
                    <SelectValue placeholder="All Payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="select-source-filter">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="LOCAL">Local</SelectItem>
                    <SelectItem value="HOSTAWAY">Hostaway</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-date-filter">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all" data-testid="tab-all">
                  All ({bookings.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" data-testid="tab-confirmed">
                  Confirmed ({stats.confirmedBookings})
                </TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({stats.pendingBookings})
                </TabsTrigger>
                <TabsTrigger value="checked-in" data-testid="tab-checked-in">
                  Checked In ({stats.checkedInBookings})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-gray-500">Loading bookings...</span>
                  </div>
                ) : filteredAndSortedBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No bookings found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchQuery || statusFilter !== "all" || paymentFilter !== "all" || propertyFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first booking to get started"}
                    </p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="mt-4"
                      data-testid="btn-create-first-booking"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Booking
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="font-semibold">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort("guestName")}
                              className="gap-1 -ml-3"
                            >
                              Guest
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold">Property</TableHead>
                          <TableHead className="font-semibold">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort("checkIn")}
                              className="gap-1 -ml-3"
                            >
                              Check-In
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort("checkOut")}
                              className="gap-1 -ml-3"
                            >
                              Check-Out
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-center">Nights</TableHead>
                          <TableHead className="font-semibold text-center">Guests</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Payment</TableHead>
                          <TableHead className="font-semibold text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort("totalAmount")}
                              className="gap-1"
                            >
                              Amount
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold">Source</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedBookings.map((booking) => (
                          <TableRow
                            key={booking.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => handleViewBooking(booking.id)}
                            data-testid={`booking-row-${booking.id}`}
                          >
                            <TableCell>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {booking.guestName}
                              </div>
                              {booking.guestEmail && (
                                <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{getPropertyName(booking.propertyId)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(booking.checkIn)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(booking.checkOut)}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {calculateNights(booking.checkIn, booking.checkOut)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Users className="h-4 w-4 text-gray-400" />
                                {booking.guests}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatWithConversion(parseFloat(booking.totalAmount || "0"))}
                            </TableCell>
                            <TableCell>{getSourceBadge(booking.source)}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewBooking(booking.id);
                                }}
                                data-testid={`btn-view-booking-${booking.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {!bookingsLoading && filteredAndSortedBookings.length > 0 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <p className="text-sm text-gray-500">
                      Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
                    </p>
                    <p className="text-sm text-gray-500">
                      Currency: {displayCurrency}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <CreateBookingDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />

        <BookingDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          bookingId={selectedBookingId}
        />
      </div>
    </div>
  );
}
