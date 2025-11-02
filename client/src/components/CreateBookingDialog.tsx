// import React, { useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { apiRequest } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { useFastAuth } from "@/lib/fastAuth";
// import { invalidateBookingQueries } from "@/lib/queryKeys";

// interface CreateBookingDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export default function CreateBookingDialog({ open, onOpenChange }: CreateBookingDialogProps) {
//   const [formData, setFormData] = useState({
//     propertyId: "",
//     guestName: "",
//     guestEmail: "",
//     guestPhone: "",
//     checkIn: "",
//     checkOut: "",
//     guests: "",
//     totalAmount: "",
//     specialRequests: "",
//   });

//   const queryClient = useQueryClient();
//   const { toast } = useToast();
//   const { user } = useFastAuth();

//   const { data: properties = [] } = useQuery({
//     queryKey: ["/api/properties"],
//   });

//   const createMutation = useMutation({
//     mutationFn: async (data: any) => {
//       const response = await apiRequest("POST", "/api/bookings", data);
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to create booking");
//       }
//       return response.json();
//     },
//     onSuccess: async (newBooking) => {
//       console.log("✅ Booking created successfully:", newBooking);

//       // Use centralized invalidation helper to update all related queries
//       invalidateBookingQueries(queryClient);

//       // Invalidate achievement cache - backend recalculates on GET request
//       if (user?.id) {
//         queryClient.invalidateQueries({ queryKey: [`/api/achievements/user/${user.id}`] });
//         queryClient.invalidateQueries({ queryKey: ["/api/achievements/definitions"] });
//       }

//       toast({
//         title: "Success",
//         description: `Booking created successfully for ${newBooking.guestName}`,
//       });

//       // Reset form and close dialog
//       onOpenChange(false);
//       setFormData({
//         propertyId: "",
//         guestName: "",
//         guestEmail: "",
//         guestPhone: "",
//         checkIn: "",
//         checkOut: "",
//         guests: "",
//         totalAmount: "",
//         specialRequests: "",
//       });
//     },
//     onError: (error: any) => {
//       console.error("Booking creation error:", error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create booking",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate required fields
//     if (!formData.propertyId) {
//       toast({
//         title: "Validation Error",
//         description: "Please select a property",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!formData.guestName) {
//       toast({
//         title: "Validation Error",
//         description: "Guest name is required",
//         variant: "destructive",
//       });
//       return;
//     }

//     const data = {
//       propertyId: parseInt(formData.propertyId),
//       guestName: formData.guestName,
//       guestEmail: formData.guestEmail || null,
//       guestPhone: formData.guestPhone || null,
//       checkIn: formData.checkIn,
//       checkOut: formData.checkOut,
//       guests: parseInt(formData.guests) || 1,
//       totalAmount: formData.totalAmount || "0", // Keep as string for decimal field
//       specialRequests: formData.specialRequests || null,
//     };

//     createMutation.mutate(data);
//   };

//   const handleChange = (field: string, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Create New Booking</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="propertyId">Property</Label>
//               <Select value={formData.propertyId} onValueChange={(value) => handleChange("propertyId", value)} required>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select property" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Array.isArray(properties) ? properties.map((property: any) => (
//                     <SelectItem key={property.id} value={property.id.toString()}>
//                       {property.name}
//                     </SelectItem>
//                   )) : []}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="guests">Number of Guests</Label>
//               <Input
//                 id="guests"
//                 type="number"
//                 value={formData.guests}
//                 onChange={(e) => handleChange("guests", e.target.value)}
//                 placeholder="1"
//                 min="1"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <Label htmlFor="guestName">Guest Name</Label>
//               <Input
//                 id="guestName"
//                 value={formData.guestName}
//                 onChange={(e) => handleChange("guestName", e.target.value)}
//                 placeholder="Full name"
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="guestEmail">Guest Email</Label>
//               <Input
//                 id="guestEmail"
//                 type="email"
//                 value={formData.guestEmail}
//                 onChange={(e) => handleChange("guestEmail", e.target.value)}
//                 placeholder="email@example.com"
//               />
//             </div>

//             <div>
//               <Label htmlFor="guestPhone">Guest Phone</Label>
//               <Input
//                 id="guestPhone"
//                 value={formData.guestPhone}
//                 onChange={(e) => handleChange("guestPhone", e.target.value)}
//                 placeholder="+1234567890"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <Label htmlFor="checkIn">Check-in Date</Label>
//               <Input
//                 id="checkIn"
//                 type="date"
//                 value={formData.checkIn}
//                 onChange={(e) => handleChange("checkIn", e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="checkOut">Check-out Date</Label>
//               <Input
//                 id="checkOut"
//                 type="date"
//                 value={formData.checkOut}
//                 onChange={(e) => handleChange("checkOut", e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="totalAmount">Total Amount</Label>
//               <Input
//                 id="totalAmount"
//                 type="number"
//                 step="0.01"
//                 value={formData.totalAmount}
//                 onChange={(e) => handleChange("totalAmount", e.target.value)}
//                 placeholder="0.00"
//                 min="0"
//               />
//             </div>
//           </div>

//           <div>
//             <Label htmlFor="specialRequests">Special Requests</Label>
//             <Textarea
//               id="specialRequests"
//               value={formData.specialRequests}
//               onChange={(e) => handleChange("specialRequests", e.target.value)}
//               placeholder="Any special requests or notes..."
//               rows={3}
//             />
//           </div>

//           <div className="flex justify-end space-x-2 pt-4">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={createMutation.isPending}>
//               {createMutation.isPending ? "Creating..." : "Create Booking"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFastAuth } from "@/lib/fastAuth";
import { invalidateBookingQueries, queryKeys } from "@/lib/queryKeys";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateBookingDialog({
  open,
  onOpenChange,
}: CreateBookingDialogProps) {
  const [formData, setFormData] = useState({
    propertyId: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    totalAmount: "",
    specialRequests: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useFastAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  /**
   * Mutation with optimistic update:
   * - onMutate: cancel relevant queries, snapshot previous data, add optimistic booking
   * - onError: rollback to previous snapshot
   * - onSettled / onSuccess: invalidate queries (server is source of truth)
   */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create booking");
      }
      return response.json();
    },

    // Optimistic update
    onMutate: async (newBooking) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      try {
        await queryClient.cancelQueries(queryKeys.bookings.all());
      } catch (err) {
        // ignore if queryKeys shape differs
      }
      await queryClient.cancelQueries({ queryKey: ["/api/bookings"] });

      // Snapshot previous data
      const previousAllBookings = queryClient.getQueryData(
        queryKeys.bookings.all(),
      );
      const previousApiBookings = queryClient.getQueryData(["/api/bookings"]);
      const previousPropertyBookings = newBooking?.propertyId
        ? queryClient.getQueryData(
            queryKeys.bookings.withSource(String(newBooking.propertyId)),
          )
        : null;

      // Create an optimistic booking (temp id negative to avoid clash)
      const optimisticBooking = {
        id: -Date.now(), // temp id
        ...newBooking,
        guestName: newBooking.guestName,
        totalAmount: String(newBooking.totalAmount ?? "0"),
        createdAt: new Date().toISOString(),
        // any other defaults your UI expects
      };

      // Update "all bookings" cache if present
      try {
        queryClient.setQueryData(
          queryKeys.bookings.all(),
          (old: any[] | undefined) => {
            if (!old) return [optimisticBooking];
            return [optimisticBooking, ...old];
          },
        );
      } catch (err) {
        // fallback: try generic key
        queryClient.setQueryData(
          ["/api/bookings"],
          (old: any[] | undefined) => {
            if (!old) return [optimisticBooking];
            return [optimisticBooking, ...old];
          },
        );
      }

      // Update property-specific cache if present
      if (newBooking?.propertyId) {
        try {
          queryClient.setQueryData(
            queryKeys.bookings.withSource(String(newBooking.propertyId)),
            (old: any[] | undefined) => {
              if (!old) return [optimisticBooking];
              return [optimisticBooking, ...old];
            },
          );
        } catch {
          // ignore if key not present
        }
      }

      // Return context for rollback
      return {
        previousAllBookings,
        previousApiBookings,
        previousPropertyBookings,
      };
    },

    // If the mutation fails, rollback
    onError: (err: any, _newBooking: any, context: any) => {
      console.error("Booking creation error:", err);
      // Rollback caches if we have snapshots
      if (context?.previousAllBookings !== undefined) {
        try {
          queryClient.setQueryData(
            queryKeys.bookings.all(),
            context.previousAllBookings,
          );
        } catch {
          queryClient.setQueryData(
            ["/api/bookings"],
            context.previousApiBookings,
          );
        }
      } else if (context?.previousApiBookings !== undefined) {
        queryClient.setQueryData(
          ["/api/bookings"],
          context.previousApiBookings,
        );
      }

      // rollback property specific if present
      if (
        context?.previousPropertyBookings !== undefined &&
        _newBooking?.propertyId
      ) {
        try {
          queryClient.setQueryData(
            queryKeys.bookings.withSource(String(_newBooking.propertyId)),
            context.previousPropertyBookings,
          );
        } catch {
          // ignore
        }
      }

      toast({
        title: "Error",
        description: err?.message || "Failed to create booking",
        variant: "destructive",
      });
    },

    // On success, replace optimistic data with server response and invalidate queries
    onSuccess: async (newBooking: any) => {
      console.log("✅ Booking created successfully:", newBooking);

      // Optionally replace optimistic entry in the cache with the returned booking
      try {
        queryClient.setQueryData(
          queryKeys.bookings.all(),
          (old: any[] | undefined) => {
            if (!old) return [newBooking];
            // remove optimistic entry (negative id) and prepend server booking
            const filtered = old.filter(
              (b: any) => !(typeof b.id === "number" && b.id < 0),
            );
            return [newBooking, ...filtered];
          },
        );
      } catch {
        // fallback generic key
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

      // Invalidate queries via centralized helper so all related caches refresh
      invalidateBookingQueries(queryClient);

      // Invalidate achievement cache if applicable
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

      // Reset form & close modal
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
        specialRequests: "",
      });
    },

    // Always ensure queries are valid after mutation settles
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

    // Validate required fields
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

    const data = {
      propertyId: parseInt(formData.propertyId),
      guestName: formData.guestName,
      guestEmail: formData.guestEmail || null,
      guestPhone: formData.guestPhone || null,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: parseInt(formData.guests) || 1,
      totalAmount: formData.totalAmount || "0", // Keep as string for decimal field
      specialRequests: formData.specialRequests || null,
    };

    createMutation.mutate(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyId">Property</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) => handleChange("propertyId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(properties)
                    ? properties.map((property: any) => (
                        <SelectItem
                          key={property.id}
                          value={property.id.toString()}
                        >
                          {property.name}
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

          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleChange("specialRequests", e.target.value)}
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >in 
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
