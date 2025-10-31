import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, DollarSign, Gift, User, Building2, CreditCard, Car, Utensils, Home, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CreateAddonBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPropertyId?: number;
  selectedServiceId?: number;
  bookerRole?: "manager" | "guest" | "staff";
}

// Billing types with descriptions
const billingTypes = [
  {
    value: "auto-bill-guest",
    label: "Auto-Bill Guest",
    icon: CreditCard,
    description: "Charge automatically to guest bill",
    color: "text-blue-600",
  },
  {
    value: "auto-bill-owner",
    label: "Auto-Bill Owner", 
    icon: User,
    description: "Charge to property owner account",
    color: "text-green-600",
  },
  {
    value: "owner-gift",
    label: "Owner Gift",
    icon: Gift,
    description: "Complimentary from property owner",
    color: "text-purple-600",
  },
  {
    value: "company-gift", 
    label: "Company Gift",
    icon: Building2,
    description: "Complimentary from management company",
    color: "text-orange-600",
  },
];

// Service categories with icons
const serviceIcons = {
  transportation: Car,
  massage: UserCheck,
  chef: Utensils,
  cleaning: Home,
  activities: Calendar,
  concierge: User,
};

const bookingFormSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  propertyId: z.string().min(1, "Please select a property"),
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  guestPhone: z.string().optional(),
  scheduledDate: z.string().min(1, "Date and time required"),
  duration: z.string().optional(),
  quantity: z.string().default("1"),
  billingType: z.enum(["auto-bill-guest", "auto-bill-owner", "owner-gift", "company-gift"]),
  price: z.string().optional(), // Price input
  dateDue: z.string().optional(), // Optional due date
  giftReason: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
}).refine((data) => {
  // Price is required for non-gift billing types
  if (data.billingType === "owner-gift" || data.billingType === "company-gift") {
    return true; // Gift bookings can have empty price
  }
  return data.price && data.price.trim().length > 0;
}, {
  message: "Price is required",
  path: ["price"],
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function CreateAddonBookingDialog({ 
  open, 
  onOpenChange, 
  selectedPropertyId, 
  selectedServiceId,
  bookerRole = "manager" 
}: CreateAddonBookingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceId: selectedServiceId?.toString() || "",
      propertyId: selectedPropertyId?.toString() || "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      scheduledDate: "",
      duration: "",
      quantity: "1",
      billingType: "auto-bill-guest",
      price: "",
      dateDue: "",
      giftReason: "",
      notes: "",
      internalNotes: "",
    },
  });

  // Fetch services
  const { data: services } = useQuery({
    queryKey: ["/api/addon-services"],
  });

  // Fetch properties
  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Watch form values for price calculation
  const watchedServiceId = form.watch("serviceId");
  const watchedDuration = form.watch("duration");
  const watchedQuantity = form.watch("quantity");
  const watchedBillingType = form.watch("billingType");
  const watchedPrice = form.watch("price");

  // Calculate price when service or inputs change
  useState(() => {
    if (services && watchedServiceId) {
      const service = (services as any[]).find((s: any) => s.id.toString() === watchedServiceId);
      if (service) {
        setSelectedService(service);
        
        let price = 0;
        const quantity = parseInt(watchedQuantity) || 1;
        
        if (service.pricingModel === "fixed") {
          price = parseFloat(service.basePrice || "0") * quantity;
        } else if (service.pricingModel === "variable" && watchedDuration) {
          const duration = parseInt(watchedDuration) || 0;
          const hourlyRate = parseFloat(service.hourlyRate || "0");
          const minimumCharge = parseFloat(service.minimumCharge || "0");
          price = Math.max((duration / 60) * hourlyRate * quantity, minimumCharge);
        } else if (service.pricingModel === "complimentary") {
          price = 0;
        }
        
        setCalculatedPrice(price);
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      // Map billing types to new format
      const billingTypeMap: Record<string, string> = {
        "auto-bill-guest": "auto_guest",
        "auto-bill-owner": "auto_owner",
        "owner-gift": "owner_gift",
        "company-gift": "company_gift",
      };

      const bookingData = {
        service_id: parseInt(data.serviceId),
        property_id: parseInt(data.propertyId),
        guest_name: data.guestName,
        guest_email: data.guestEmail || null,
        guest_phone: data.guestPhone || null,
        billing_type: billingTypeMap[data.billingType],
        price: data.price || (calculatedPrice > 0 ? calculatedPrice.toString() : null),
        date_due: data.dateDue || null,
        scheduled_date: new Date(data.scheduledDate).toISOString(),
      };

      return await apiRequest("POST", "/api/service-bookings", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Service Booked Successfully",
        description: `${selectedService?.name} has been scheduled for ${form.getValues("guestName")}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addon-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finances"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BookingFormData) => {
    console.log("✅ Form submitted with data:", data);
    
    // Validate gift reason for gift bookings
    if ((data.billingType === "owner-gift" || data.billingType === "company-gift") && !data.giftReason) {
      form.setError("giftReason", { message: "Gift reason is required for complimentary services" });
      toast({
        title: "Missing Information",
        description: "Please provide a reason for the complimentary service",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate(data);
  };

  // Fetch system settings for currency
  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
  });

  const formatCurrency = (amount: number) => {
    const currency = systemSettings?.defaultCurrency || 'AUD';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get final price to display (custom price or calculated price)
  const finalPrice = watchedPrice && parseFloat(watchedPrice) > 0 
    ? parseFloat(watchedPrice) 
    : calculatedPrice;

  const isGiftBooking = watchedBillingType === "owner-gift" || watchedBillingType === "company-gift";
  const selectedBillingType = billingTypes.find(type => type.value === watchedBillingType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book Add-on Service
          </DialogTitle>
          <DialogDescription>
            Schedule an add-on service with flexible pricing and billing options
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Service Selection */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(services as any[])?.map((service: any) => {
                            const IconComponent = serviceIcons[service.category as keyof typeof serviceIcons] || User;
                            return (
                              <SelectItem key={service.id} value={service.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4" />
                                  <span>{service.name}</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {service.pricingModel}
                                  </Badge>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(properties as any[])?.map((property: any) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Guest Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Guest full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="guest@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+61 400 000 000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            {selectedService && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = serviceIcons[selectedService.category as keyof typeof serviceIcons] || User;
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                    {selectedService.name}
                    <Badge variant="outline">{selectedService.pricingModel}</Badge>
                  </CardTitle>
                  <CardDescription>{selectedService.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600">Date & Time *</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              value={field.value} 
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              required 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedService.pricingModel === "variable" && (
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="60" />
                            </FormControl>
                            <FormDescription>
                              Rate: {formatCurrency(selectedService.hourlyRate || 0)}/hour
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Billing & Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="billingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How should this be billed?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          {billingTypes.map((type) => {
                            const IconComponent = type.icon;
                            return (
                              <div key={type.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={type.value} id={type.value} />
                                <Label 
                                  htmlFor={type.value} 
                                  className="flex items-center gap-2 cursor-pointer flex-1 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <IconComponent className={`w-4 h-4 ${type.color}`} />
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-gray-500">{type.description}</div>
                                  </div>
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isGiftBooking && (
                  <FormField
                    control={form.control}
                    name="giftReason"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Gift Reason</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Welcome gift, Apology for inconvenience" />
                        </FormControl>
                        <FormDescription>
                          Explain why this service is being provided complimentary
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Price Input - required for non-gift bookings */}
                {!isGiftBooking && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            placeholder={calculatedPrice > 0 ? formatCurrency(calculatedPrice) : "0.00"} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Date Due - optional for all bookings */}
                <FormField
                  control={form.control}
                  name="dateDue"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Payment Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormDescription>
                        When should this payment be due?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Display */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Price:</span>
                    <span className="text-xl font-bold text-green-600">
                      {isGiftBooking ? "Complimentary" : formatCurrency(finalPrice)}
                    </span>
                  </div>
                  {selectedBillingType && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <selectedBillingType.icon className={`w-4 h-4 ${selectedBillingType.color}`} />
                      <span>{selectedBillingType.description}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Special requests or instructions" />
                    </FormControl>
                    <FormDescription>Visible to guest and staff</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(bookerRole === "manager" || bookerRole === "staff") && (
                <FormField
                  control={form.control}
                  name="internalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Staff-only notes" />
                      </FormControl>
                      <FormDescription>Only visible to staff and management</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Booking..." : "Book Service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}