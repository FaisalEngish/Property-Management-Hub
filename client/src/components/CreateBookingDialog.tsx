import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFastAuth } from "@/lib/fastAuth";
import { invalidateBookingQueries, queryKeys } from "@/lib/queryKeys";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string | null; // Pre-populate property selection
}

export default function CreateBookingDialog({
  open,
  onOpenChange,
  propertyId,
}: CreateBookingDialogProps) {
  const [formData, setFormData] = useState({
    propertyId: propertyId || "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    totalAmount: "",
    paymentStatus: "pending",
    amountPaid: "",
    specialRequests: "",
    skipHostawaySync: false, // Flag to skip Hostaway API for local-only bookings
  });

  // Update propertyId when prop changes
  React.useEffect(() => {
    if (propertyId && open) {
      setFormData(prev => ({ ...prev, propertyId }));
    }
  }, [propertyId, open]);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useFastAuth();

  // Properties list (LOCAL + HOSTAWAY – backend should include source on each)
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const createMutation = useMutation({
    // 🔹 IMPORTANT: point to the new Hostaway-aware route
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/booking-revenue", data);
    },

    onMutate: async (newBooking) => {
      // cancel outgoing queries
      try {
        await queryClient.cancelQueries(queryKeys.bookings.all());
      } catch {}
      await queryClient.cancelQueries({ queryKey: ["/api/bookings"] });

      // snapshot
      const previousAll = queryClient.getQueryData(queryKeys.bookings.all());
      const previousApi = queryClient.getQueryData(["/api/bookings"]);
      const previousByProp = newBooking?.propertyId
        ? queryClient.getQueryData(
            queryKeys.bookings.withSource(String(newBooking.propertyId)),
          )
        : null;

      // optimistic booking object (used just in UI)
      const optimistic = {
        id: -Date.now(),
        ...newBooking,
        totalAmount: String(newBooking.guestBookingPrice ?? "0"),
        createdAt: new Date().toISOString(),
      };

      // patch caches
      try {
        queryClient.setQueryData(
          queryKeys.bookings.all(),
          (old: any[] | undefined) =>
            old ? [optimistic, ...old] : [optimistic],
        );
      } catch {
        queryClient.setQueryData(["/api/bookings"], (old: any[] | undefined) =>
          old ? [optimistic, ...old] : [optimistic],
        );
      }

      if (newBooking?.propertyId) {
        try {
          queryClient.setQueryData(
            queryKeys.bookings.withSource(String(newBooking.propertyId)),
            (old: any[] | undefined) =>
              old ? [optimistic, ...old] : [optimistic],
          );
        } catch {}
      }

      return { previousAll, previousApi, previousByProp };
    },

    onError: (err: any, _newBooking: any, context: any) => {
      console.error("Booking creation error:", err);

      if (context?.previousAll !== undefined) {
        try {
          queryClient.setQueryData(
            queryKeys.bookings.all(),
            context.previousAll,
          );
        } catch {
          queryClient.setQueryData(["/api/bookings"], context.previousApi);
        }
      } else if (context?.previousApi !== undefined) {
        queryClient.setQueryData(["/api/bookings"], context.previousApi);
      }

      if (context?.previousByProp !== undefined && _newBooking?.propertyId) {
        try {
          queryClient.setQueryData(
            queryKeys.bookings.withSource(String(_newBooking.propertyId)),
            context.previousByProp,
          );
        } catch {}
      }

      toast({
        title: "Error",
        description: err?.message || "Failed to create booking",
        variant: "destructive",
      });
    },

    onSuccess: async (response: any) => {
      // Backend returns { booking: {...} }
      const newBooking = response?.booking || response;
      
      // replace optimistic entry with server entry
      try {
        queryClient.setQueryData(
          queryKeys.bookings.all(),
          (old: any[] | undefined) => {
            if (!old) return [newBooking];
            const filtered = old.filter(
              (b: any) => !(typeof b.id === "number" && b.id < 0),
            );
            return [newBooking, ...filtered];
          },
        );
      } catch {
        queryClient.setQueryData(
          ["/api/bookings"],
          (old: any[] | undefined) => {
            if (!old) return [newBooking];
            const filtered = old.filter(
              (b: any) => !(typeof b.id === "number" && b.id < 0),
            );
            return [newBooking, ...filtered];
          },
        );
      }

      invalidateBookingQueries(queryClient);

      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: [`/api/achievements/user/${user.id}`],
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/achievements/definitions"],
        });
      }

      toast({
        title: "Success",
        description: `Booking created successfully for ${newBooking.guestName}`,
      });

      onOpenChange(false);
      setFormData({
        propertyId: "",
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        checkIn: "",
        checkOut: "",
        guests: "",
        totalAmount: "",
        paymentStatus: "pending",
        amountPaid: "",
        specialRequests: "",
        skipHostawaySync: false,
      });
    },

    onSettled: () => {
      try {
        invalidateBookingQueries(queryClient);
      } catch {
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission while mutation is in flight
    if (createMutation.isPending) {
      return;
    }

    // Auth gate: ensure user is logged in before allowing booking creation
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a booking. Redirecting to login...",
        variant: "destructive",
      });
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }

    if (!formData.propertyId) {
      toast({
        title: "Validation Error",
        description: "Please select a property",
        variant: "destructive",
      });
      return;
    }
    if (!formData.guestName) {
      toast({
        title: "Validation Error",
        description: "Guest name is required",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount || "0");
    const amountPaid = parseFloat(formData.amountPaid || "0");

    // Validate numeric values
    if (isNaN(totalAmount) || !isFinite(totalAmount)) {
      toast({
        title: "Validation Error",
        description: "Total amount must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(amountPaid) || !isFinite(amountPaid)) {
      toast({
        title: "Validation Error",
        description: "Amount paid must be a valid number",
        variant: "destructive",
      });
      return;
    }

    // Validate payment amounts are non-negative
    if (totalAmount < 0) {
      toast({
        title: "Validation Error",
        description: "Total amount cannot be negative",
        variant: "destructive",
      });
      return;
    }

    if (amountPaid < 0) {
      toast({
        title: "Validation Error",
        description: "Amount paid cannot be negative",
        variant: "destructive",
      });
      return;
    }

    // Validate payment amounts
    if (amountPaid > totalAmount) {
      toast({
        title: "Validation Error",
        description: "Amount paid cannot exceed total amount",
        variant: "destructive",
      });
      return;
    }

    const amountDue = Math.max(0, totalAmount - amountPaid);

    // 🔹 Map UI fields → booking_revenue schema fields
    const data = {
      propertyId: parseInt(formData.propertyId, 10),
      guestName: formData.guestName,
      guestEmail: formData.guestEmail || null,
      guestPhone: formData.guestPhone || null,

      // backend expects these names
      checkInDate: formData.checkIn,
      checkOutDate: formData.checkOut,
      numberOfGuests: parseInt(formData.guests || "1", 10),

      // treat totalAmount as the amount guest pays, and net payout (no OTA fee yet)
      guestBookingPrice: formData.totalAmount || "0",
      otaPlatformFee: "0",
      finalPayoutAmount: formData.totalAmount || "0",

      currency: "THB", // or later pull from property.currency
      paymentStatus: formData.paymentStatus,
      payoutDate:
        formData.paymentStatus === "paid" ? new Date().toISOString() : null,

      // we can track amountPaid / amountDue via notes or extend schema later
      notes:
        formData.specialRequests ||
        `Amount paid: ${amountPaid.toFixed(
          2,
        )}, Amount due: ${amountDue.toFixed(2)}`,
      
      // Skip Hostaway sync for local-only bookings
      skipHostawaySync: formData.skipHostawaySync,
    };

    createMutation.mutate(data);
  };

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* limit width and prevent overall overflow */}
      <DialogContent className="w-[95vw] max-w-2xl p-0 overflow-y-auto max-h-[90vh]">
        {/* sticky header */}
        <DialogHeader className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur px-6 py-4">
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>

        {/* form = column layout: scrollable body + sticky buttons */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyId">Property</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(v) => handleChange("propertyId", v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(properties)
                      ? properties.map((p: any) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))
                      : []}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  value={formData.guests}
                  onChange={(e) => handleChange("guests", e.target.value)}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="guestName">Guest Name</Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => handleChange("guestName", e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => handleChange("guestEmail", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="guestPhone">Guest Phone</Label>
                <Input
                  id="guestPhone"
                  value={formData.guestPhone}
                  onChange={(e) => handleChange("guestPhone", e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => handleChange("checkIn", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => handleChange("checkOut", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  placeholder="0.00"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(v) => handleChange("paymentStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Payment Pending</SelectItem>
                    <SelectItem value="partial">Partial Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={(e) => handleChange("amountPaid", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={formData.totalAmount || undefined}
                />
              </div>

              <div>
                <Label htmlFor="amountDue">Amount Due</Label>
                <Input
                  id="amountDue"
                  type="number"
                  step="0.01"
                  value={
                    (parseFloat(formData.totalAmount) || 0) -
                    (parseFloat(formData.amountPaid) || 0)
                  }
                  readOnly
                  className="bg-muted"
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-calculated: Total - Paid
                </p>
              </div>
            </div>

            {/* Show "Local Only" checkbox for Hostaway properties */}
            {(() => {
              const selectedProperty = Array.isArray(properties)
                ? properties.find((p: any) => p.id?.toString() === formData.propertyId)
                : null;
              const isHostaway = selectedProperty?.source === "HOSTAWAY";

              if (!isHostaway) return null;

              return (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="skipHostawaySync"
                      checked={formData.skipHostawaySync}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          skipHostawaySync: checked === true,
                        }))
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="skipHostawaySync"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Local Only (Skip Hostaway Sync)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create booking in local database only, without syncing to Hostaway.
                        Useful for manual bookings or when dates are blocked.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) =>
                  handleChange("specialRequests", e.target.value)
                }
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>
          </div>

          {/* sticky actions (no DialogFooter used) */}
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-white/90 backdrop-blur px-6 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
