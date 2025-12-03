import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import {
  invalidateBookingQueries,
  invalidateFinanceQueries,
} from "@/lib/queryKeys";
import {
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Bed,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface BookingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number | null;
}

export default function BookingDetailModal({
  open,
  onOpenChange,
  bookingId,
}: BookingDetailModalProps) {
  const [newStatus, setNewStatus] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { formatWithConversion, displayCurrency } = useCurrency();

  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking");
      }
      return response.json();
    },
    enabled: !!bookingId && open,
  });

  // Fetch property details based on booking's propertyId
  const { data: property } = useQuery({
    queryKey: ["/api/properties", booking?.propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${booking?.propertyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch property");
      }
      return response.json();
    },
    enabled: !!booking?.propertyId && open,
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        status,
      });
    },
    onSuccess: () => {
      // Use centralized invalidation helper to update all related queries
      invalidateBookingQueries(queryClient);
      
      setNewStatus(""); // Clear the status after successful update

      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        amountPaid: amount.toString(),
        paymentStatus:
          amount >= parseFloat(booking?.totalAmount || "0")
            ? "paid"
            : "partial",
      });
    },
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
      invalidateFinanceQueries(queryClient);
      setPaymentAmount("");

      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = () => {
    if (!newStatus || newStatus === booking?.status) return;
    
    // Validation: Prevent check-out if there are outstanding payments
    if (newStatus.toLowerCase() === "checked-out") {
      const amountDue = parseFloat(booking?.amountDue || "0");
      if (amountDue > 0) {
        toast({
          title: "Payment Required",
          description: `Please clear all outstanding payments (${formatCurrencyLocal(amountDue)}) before checking out the guest.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    updateStatusMutation.mutate(newStatus);
  };

  const handleMarkAsPaid = (fullPaid: boolean = false) => {
    if (!booking) return;

    let amountToApply: number;

    if (fullPaid) {
      // Mark as fully paid
      amountToApply = parseFloat(booking.totalAmount || "0");
    } else {
      // Custom amount
      amountToApply = parseFloat(paymentAmount);

      if (isNaN(amountToApply) || amountToApply <= 0) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid payment amount",
          variant: "destructive",
        });
        return;
      }

      const currentPaid = parseFloat(booking.amountPaid || "0");
      const totalDue = parseFloat(booking.totalAmount || "0");
      const newTotalPaid = currentPaid + amountToApply;

      if (newTotalPaid > totalDue) {
        toast({
          title: "Validation Error",
          description: "Payment amount cannot exceed the total due",
          variant: "destructive",
        });
        return;
      }

      amountToApply = newTotalPaid;
    }

    markAsPaidMutation.mutate(amountToApply);
  };

  const handleGenerateInvoice = () => {
    window.open(`/api/bookings/${bookingId}/invoice`, "_blank");
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrencyLocal = (amount: string | number) => {
    return formatWithConversion(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "checked-in":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "checked-out":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateNights = () => {
    if (!booking?.checkIn || !booking?.checkOut) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  if (!bookingId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading booking details...
          </div>
        ) : !booking ? (
          <div className="py-8 text-center text-muted-foreground">
            Booking not found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getStatusColor(booking.status)} flex items-center gap-1 text-sm px-3 py-1`}
                >
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </Badge>
                {/* Special indicator for pre-paid bookings not checked in */}
                {(booking.status?.toLowerCase() === "pending" || 
                  booking.status?.toLowerCase() === "confirmed") &&
                  (booking.paymentStatus === "paid" || booking.paymentStatus === "partial") && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 text-sm px-3 py-1">
                    <CreditCard className="w-3 h-3" />
                    {booking.paymentStatus === "paid" ? "Pre-Paid" : "Partial Pre-Paid"}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                Booking ID: #{booking.id}
              </span>
            </div>

            {/* Alert for pre-paid bookings awaiting check-in */}
            {(booking.status?.toLowerCase() === "pending" || 
              booking.status?.toLowerCase() === "confirmed") &&
              (booking.paymentStatus === "paid" || booking.paymentStatus === "partial") && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Payment Received - Awaiting Check-in
                  </p>
                  <p className="text-sm text-blue-700">
                    {booking.paymentStatus === "paid" 
                      ? `Full payment of ${formatCurrencyLocal(booking.amountPaid || 0)} has been received.`
                      : `Partial payment of ${formatCurrencyLocal(booking.amountPaid || 0)} received. ${formatCurrencyLocal(booking.amountDue || 0)} still due.`
                    } Guest has not checked in yet.
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Guest Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Guest Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{booking.guestName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">
                    {booking.guests || 1} guest{booking.guests > 1 ? "s" : ""}
                  </p>
                </div>
                {booking.guestEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{booking.guestEmail}</p>
                  </div>
                )}
                {booking.guestPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{booking.guestPhone}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Property Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Property Information
              </h3>
              <div className="space-y-2">
                <p className="font-medium">
                  {property?.name || "Unknown Property"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {property?.address || "N/A"}
                </p>
                {property?.bedrooms && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="w-4 h-4" />
                    <span>
                      {property.bedrooms} Bedroom
                      {property.bedrooms > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Booking Dates */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Dates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">{formatDate(booking.checkOut)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {calculateNights()} night{calculateNights() > 1 ? "s" : ""}
              </p>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </h3>

              {/* Payment Status Badge */}
              {booking.paymentStatus && (
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getPaymentStatusColor(booking.paymentStatus)} flex items-center gap-1 px-3 py-1`}
                  >
                    <CreditCard className="w-3 h-3" />
                    {booking.paymentStatus.charAt(0).toUpperCase() +
                      booking.paymentStatus.slice(1)}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">
                    {formatCurrencyLocal(booking.totalAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrencyLocal(booking.amountPaid || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrencyLocal(booking.amountDue || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium">
                    {booking.bookingPlatform || "Direct"}
                  </p>
                </div>
              </div>

              {/* Show payment alert if checked-in with outstanding balance */}
              {booking.status?.toLowerCase() === "checked-in" &&
                parseFloat(booking.amountDue || "0") > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Outstanding Payment
                      </p>
                      <p className="text-sm text-amber-700">
                        Guest has checked in with {formatCurrencyLocal(booking.amountDue || 0)} still due
                      </p>
                    </div>
                  </div>
                )}

              {/* Payment Action Section */}
              {parseFloat(booking.amountDue || "0") > 0 && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                  <Label className="text-sm font-medium">Record Payment</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      max={booking.amountDue}
                      className="flex-1"
                      data-testid="input-payment-amount"
                    />
                    <Button
                      onClick={() => handleMarkAsPaid(false)}
                      disabled={!paymentAmount || markAsPaidMutation.isPending}
                      size="sm"
                      data-testid="button-add-payment"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      {markAsPaidMutation.isPending
                        ? "Processing..."
                        : "Add Payment"}
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleMarkAsPaid(true)}
                    disabled={markAsPaidMutation.isPending}
                    className="w-full"
                    variant="default"
                    data-testid="button-mark-fully-paid"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {markAsPaidMutation.isPending
                      ? "Processing..."
                      : "Mark as Fully Paid"}
                  </Button>
                </div>
              )}

              {parseFloat(booking.amountDue || "0") === 0 &&
                booking.paymentStatus === "paid" && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-900">
                      Payment Completed
                    </p>
                  </div>
                )}
            </div>

            {booking.specialRequests && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Special Requests
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.specialRequests}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Status Update */}
            <div className="space-y-3">
              <h3 className="font-semibold">Update Status</h3>
              <div className="flex gap-3">
                <Select
                  value={newStatus || booking.status}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked-in">Checked-in</SelectItem>
                    <SelectItem value="checked-out">Checked-out</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={
                    !newStatus ||
                    newStatus === booking.status ||
                    updateStatusMutation.isPending
                  }
                >
                  {updateStatusMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button className="flex-1" onClick={handleGenerateInvoice}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
