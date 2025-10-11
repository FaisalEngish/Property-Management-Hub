import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Bed
} from "lucide-react";

interface BookingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number | null;
}

export default function BookingDetailModal({ open, onOpenChange, bookingId }: BookingDetailModalProps) {
  const [newStatus, setNewStatus] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      return response.json();
    },
    enabled: !!bookingId && open,
  });

  // Fetch property details
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const property = properties.find((p: any) => p.id === booking?.propertyId);

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/bookings/${bookingId}`, { status });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update booking status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"], exact: false });
      
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

  const handleStatusUpdate = () => {
    if (newStatus && newStatus !== booking?.status) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  const handleGenerateInvoice = () => {
    window.open(`/api/bookings/${bookingId}/invoice`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked-out':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateNights = () => {
    if (!booking?.checkIn || !booking?.checkOut) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!bookingId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading booking details...</div>
        ) : !booking ? (
          <div className="py-8 text-center text-muted-foreground">Booking not found</div>
        ) : (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 text-sm px-3 py-1`}>
                {getStatusIcon(booking.status)}
                {booking.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Booking ID: #{booking.id}
              </span>
            </div>

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
                  <p className="font-medium">{booking.guestName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">{booking.guests || 1} guest{booking.guests > 1 ? 's' : ''}</p>
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
                <p className="font-medium">{property?.name || 'Unknown Property'}</p>
                <p className="text-sm text-muted-foreground">{property?.address || 'N/A'}</p>
                {property?.bedrooms && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}</span>
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
                {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
              </p>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">
                    {booking.currency || '฿'}{parseFloat(booking.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium">{booking.bookingPlatform || 'Direct'}</p>
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Special Requests
                  </h3>
                  <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Status Update */}
            <div className="space-y-3">
              <h3 className="font-semibold">Update Status</h3>
              <div className="flex gap-3">
                <Select value={newStatus || booking.status} onValueChange={setNewStatus}>
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
                  disabled={!newStatus || newStatus === booking.status || updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
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
