import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateBookingDialog({ open, onOpenChange }: CreateBookingDialogProps) {
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

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking created successfully",
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
        specialRequests: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      propertyId: parseInt(formData.propertyId),
      guests: parseInt(formData.guests),
      totalAmount: formData.totalAmount || "0",
    };

    createMutation.mutate(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <Select value={formData.propertyId} onValueChange={(value) => handleChange("propertyId", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(properties) ? properties.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  )) : []}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
