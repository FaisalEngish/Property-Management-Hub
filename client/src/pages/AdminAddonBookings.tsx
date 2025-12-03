import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Gift, 
  Building, 
  CreditCard,
  FileText,
  Download,
  Filter
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AddonBooking {
  id: number;
  serviceName: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingDate: string;
  serviceDate: string;
  status: string;
  totalAmount: string;
  currency: string;
  billingRoute: string;
  complimentaryType: string | null;
  specialRequests: string;
  internalNotes: string;
  bookedBy: string;
  confirmedBy: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
}

interface BookingUpdate {
  status: string;
  billingRoute: string;
  complimentaryType?: string;
  internalNotes?: string;
  cancellationReason?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const billingRouteColors: Record<string, string> = {
  "guest-bill": "bg-blue-100 text-blue-800",
  "owner-bill": "bg-purple-100 text-purple-800",
  "company-expense": "bg-gray-100 text-gray-800",
  "owner-gift": "bg-green-100 text-green-800",
  "company-gift": "bg-yellow-100 text-yellow-800",
};

export default function AdminAddonBookings() {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<AddonBooking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [billingFilter, setBillingFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const [updateData, setUpdateData] = useState<BookingUpdate>({
    status: "",
    billingRoute: "",
    complimentaryType: "",
    internalNotes: "",
    cancellationReason: "",
  });

  // Fetch all addon bookings
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/addon-bookings"],
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: number; updateData: BookingUpdate }) => {
      return apiRequest("PUT", `/api/admin/addon-bookings/${id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Updated",
        description: "The booking has been successfully updated.",
      });
      setSelectedBooking(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/addon-bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Export bookings mutation
  const exportBookingsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/addon-bookings/export", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `addon-bookings-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Complete",
        description: "Booking data has been exported successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredBookings = bookings.filter((booking: AddonBooking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesBilling = billingFilter === "all" || booking.billingRoute === billingFilter;
    const matchesSearch = searchTerm === "" || 
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateRange !== "all") {
      const bookingDate = new Date(booking.serviceDate);
      const now = new Date();
      
      switch (dateRange) {
        case "today":
          matchesDate = bookingDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = bookingDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = bookingDate >= monthAgo;
          break;
      }
    }
    
    return matchesStatus && matchesBilling && matchesSearch && matchesDate;
  });

  const handleApprove = (booking: AddonBooking) => {
    setSelectedBooking(booking);
    setUpdateData({
      status: "confirmed",
      billingRoute: "guest-bill",
      complimentaryType: "",
      internalNotes: "",
      cancellationReason: "",
    });
  };

  const handleDecline = (booking: AddonBooking) => {
    setSelectedBooking(booking);
    setUpdateData({
      status: "cancelled",
      billingRoute: booking.billingRoute,
      complimentaryType: "",
      internalNotes: "",
      cancellationReason: "",
    });
  };

  const handleSubmitUpdate = () => {
    if (!selectedBooking) return;
    
    updateBookingMutation.mutate({
      id: selectedBooking.id,
      updateData,
    });
  };

  const pendingCount = bookings.filter((b: AddonBooking) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b: AddonBooking) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b: AddonBooking) => b.status === "completed").length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add-On Service Bookings</h1>
        <p className="text-gray-600">Manage guest service requests and billing assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{confirmedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Guest, service, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="billing">Billing Route</Label>
              <Select value={billingFilter} onValueChange={setBillingFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  <SelectItem value="guest-bill">Guest Bill</SelectItem>
                  <SelectItem value="owner-bill">Owner Bill</SelectItem>
                  <SelectItem value="company-expense">Company Expense</SelectItem>
                  <SelectItem value="owner-gift">Owner Gift</SelectItem>
                  <SelectItem value="company-gift">Company Gift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => exportBookingsMutation.mutate()}
                disabled={exportBookingsMutation.isPending}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking: AddonBooking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-sm text-gray-500">{booking.guestEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{booking.serviceName}</p>
                  </TableCell>
                  <TableCell>
                    <p>{booking.propertyName}</p>
                  </TableCell>
                  <TableCell>
                    <p>{format(new Date(booking.serviceDate), "MMM dd, yyyy")}</p>
                    <p className="text-sm text-gray-500">{format(new Date(booking.serviceDate), "h:mm a")}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{booking.totalAmount} {booking.currency}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[booking.status] || "bg-gray-100 text-gray-800"}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={billingRouteColors[booking.billingRoute] || "bg-gray-100 text-gray-800"}>
                      {booking.billingRoute.replace("-", " ")}
                    </Badge>
                    {booking.complimentaryType && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Gift className="w-3 h-3 mr-1" />
                          {booking.complimentaryType}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(booking)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecline(booking)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                              {booking.serviceName} - {booking.guestName}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Guest Details</Label>
                                <div className="mt-1 space-y-1">
                                  <p className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {booking.guestName}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {booking.guestEmail}
                                  </p>
                                  {booking.guestPhone && (
                                    <p className="flex items-center gap-2">
                                      <Phone className="w-4 h-4" />
                                      {booking.guestPhone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Service Details</Label>
                                <div className="mt-1 space-y-1">
                                  <p className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {booking.propertyName}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(booking.serviceDate), "PPp")}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    {booking.totalAmount} {booking.currency}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {booking.specialRequests && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Special Requests</Label>
                                <p className="mt-1 text-sm">{booking.specialRequests}</p>
                              </div>
                            )}
                            
                            {booking.internalNotes && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Internal Notes</Label>
                                <p className="mt-1 text-sm">{booking.internalNotes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">No bookings match your current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Booking Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {updateData.status === "confirmed" ? "Approve Booking" : "Update Booking"}
              </DialogTitle>
              <DialogDescription>
                {selectedBooking.serviceName} - {selectedBooking.guestName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={updateData.status} onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="billing">Billing Route</Label>
                <Select value={updateData.billingRoute} onValueChange={(value) => setUpdateData(prev => ({ ...prev, billingRoute: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest-bill">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Guest Bill (added to stay invoice)
                      </div>
                    </SelectItem>
                    <SelectItem value="owner-bill">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Owner Bill (goes to owner financial log)
                      </div>
                    </SelectItem>
                    <SelectItem value="company-expense">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company Expense (tracked internally)
                      </div>
                    </SelectItem>
                    <SelectItem value="owner-gift">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Owner Gift (complimentary)
                      </div>
                    </SelectItem>
                    <SelectItem value="company-gift">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Company Gift (complimentary)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(updateData.billingRoute === "owner-gift" || updateData.billingRoute === "company-gift") && (
                <div>
                  <Label htmlFor="complimentaryType">Gift Type</Label>
                  <Input
                    id="complimentaryType"
                    value={updateData.complimentaryType || ""}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, complimentaryType: e.target.value }))}
                    placeholder="e.g., Welcome gift, Birthday surprise..."
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea
                  id="internalNotes"
                  value={updateData.internalNotes || ""}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, internalNotes: e.target.value }))}
                  placeholder="Add any internal notes..."
                  rows={3}
                />
              </div>
              
              {updateData.status === "cancelled" && (
                <div>
                  <Label htmlFor="cancellationReason">Cancellation Reason</Label>
                  <Textarea
                    id="cancellationReason"
                    value={updateData.cancellationReason || ""}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, cancellationReason: e.target.value }))}
                    placeholder="Reason for cancellation..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitUpdate}
                disabled={updateBookingMutation.isPending}
              >
                {updateBookingMutation.isPending ? "Updating..." : "Update Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}