import { useState, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Car, ChefHat, Plane, Waves, Coffee, Zap, MapPin, Clock, DollarSign, Users, ShoppingCart, Star } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AddonService {
  id: number;
  serviceName: string;
  description: string;
  category: string;
  pricingType: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
  requiresTimeSlot: boolean;
  maxAdvanceBookingDays: number;
  cancellationPolicyHours: number;
}

interface BookingRequest {
  serviceId: number;
  propertyId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  serviceDate: Date;
  specialRequests: string;
  totalAmount: string;
  quantity: number;
}

const categoryIcons: Record<string, any> = {
  transport: Car,
  chef: ChefHat,
  breakfast: Coffee,
  massage: Zap,
  rental: Car,
  activities: Waves,
  other: Star,
};

const categoryColors: Record<string, string> = {
  transport: "bg-blue-100 text-blue-800",
  chef: "bg-purple-100 text-purple-800", 
  breakfast: "bg-orange-100 text-orange-800",
  massage: "bg-green-100 text-green-800",
  rental: "bg-gray-100 text-gray-800",
  activities: "bg-cyan-100 text-cyan-800",
  other: "bg-yellow-100 text-yellow-800",
};

export default function GuestAddonBooking() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<AddonService | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: ""
  });

  // Fetch available services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/guest-addon-services"],
  });

  // Fetch properties for selection
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingRequest) => {
      return apiRequest("POST", "/api/guest-addon-bookings", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Submitted",
        description: "Your add-on service request has been sent for approval.",
      });
      setSelectedService(null);
      setBookingDate(undefined);
      setBookingTime("");
      setQuantity(1);
      setGuestDetails({ name: "", email: "", phone: "", specialRequests: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-addon-bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Services", count: services.length },
    { value: "transport", label: "Transport", count: services.filter((s: AddonService) => s.category === "transport").length },
    { value: "chef", label: "Private Chef", count: services.filter((s: AddonService) => s.category === "chef").length },
    { value: "breakfast", label: "Breakfast", count: services.filter((s: AddonService) => s.category === "breakfast").length },
    { value: "massage", label: "Massages", count: services.filter((s: AddonService) => s.category === "massage").length },
    { value: "rental", label: "Vehicle Rentals", count: services.filter((s: AddonService) => s.category === "rental").length },
    { value: "activities", label: "Activities", count: services.filter((s: AddonService) => s.category === "activities").length },
    { value: "other", label: "Other", count: services.filter((s: AddonService) => s.category === "other").length },
  ];

  const filteredServices = services.filter((service: AddonService) => 
    selectedCategory === "all" || service.category === selectedCategory
  );

  const handleBookingSubmit = () => {
    if (!selectedService || !selectedProperty || !bookingDate || !guestDetails.name || !guestDetails.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const bookingDateTime = new Date(bookingDate);
    if (bookingTime) {
      const [hours, minutes] = bookingTime.split(':');
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
    }

    const totalAmount = (parseFloat(selectedService.basePrice) * quantity).toFixed(2);

    createBookingMutation.mutate({
      serviceId: selectedService.id,
      propertyId: selectedProperty,
      guestName: guestDetails.name,
      guestEmail: guestDetails.email,
      guestPhone: guestDetails.phone,
      serviceDate: bookingDateTime,
      specialRequests: guestDetails.specialRequests,
      totalAmount,
      quantity,
    });
  };

  if (servicesLoading || propertiesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add-On Services & Activities</h1>
        <p className="text-gray-600">Book additional services to enhance your stay</p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className="flex items-center gap-2"
            >
              {category.value !== "all" && categoryIcons[category.value] && (
                <span className="w-4 h-4">
                  {React.createElement(categoryIcons[category.value])}
                </span>
              )}
              {category.label}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service: AddonService) => {
          const IconComponent = categoryIcons[service.category] || Star;
          
          return (
            <Card key={service.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      categoryColors[service.category] || "bg-gray-100 text-gray-800"
                    )}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {service.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-3">
                  {service.description}
                </CardDescription>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-gray-900">
                      {service.basePrice} {service.currency}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {service.pricingType}
                    </span>
                  </div>
                  
                  {service.requiresTimeSlot && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Time slot required</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Book up to {service.maxAdvanceBookingDays} days ahead</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedService(service)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Request Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Book {service.serviceName}</DialogTitle>
                      <DialogDescription>
                        Fill in your details to request this service
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      {/* Property Selection */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="property" className="text-right">Property</Label>
                        <div className="col-span-3">
                          <Select value={selectedProperty?.toString()} onValueChange={(value) => setSelectedProperty(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property: any) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                  {property.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Guest Details */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guestName" className="text-right">Name *</Label>
                        <Input
                          id="guestName"
                          value={guestDetails.name}
                          onChange={(e) => setGuestDetails(prev => ({ ...prev, name: e.target.value }))}
                          className="col-span-3"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guestEmail" className="text-right">Email *</Label>
                        <Input
                          id="guestEmail"
                          type="email"
                          value={guestDetails.email}
                          onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                          className="col-span-3"
                          placeholder="your@email.com"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guestPhone" className="text-right">Phone</Label>
                        <Input
                          id="guestPhone"
                          value={guestDetails.phone}
                          onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                          className="col-span-3"
                          placeholder="+66 XXX XXX XXX"
                        />
                      </div>

                      {/* Date Selection */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Date *</Label>
                        <div className="col-span-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !bookingDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={bookingDate}
                                onSelect={setBookingDate}
                                initialFocus
                                disabled={(date) => 
                                  date < new Date() || 
                                  date > new Date(Date.now() + service.maxAdvanceBookingDays * 24 * 60 * 60 * 1000)
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Time Selection (if required) */}
                      {service.requiresTimeSlot && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bookingTime" className="text-right">Time</Label>
                          <Input
                            id="bookingTime"
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      )}

                      {/* Quantity */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max="10"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="col-span-3"
                        />
                      </div>

                      {/* Special Requests */}
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="specialRequests" className="text-right mt-2">Requests</Label>
                        <Textarea
                          id="specialRequests"
                          value={guestDetails.specialRequests}
                          onChange={(e) => setGuestDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                          className="col-span-3"
                          placeholder="Any special requests or notes..."
                          rows={3}
                        />
                      </div>

                      {/* Price Summary */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Amount:</span>
                          <span className="text-xl font-bold">
                            {(parseFloat(service.basePrice) * quantity).toFixed(2)} {service.currency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Subject to approval and final billing
                        </p>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleBookingSubmit}
                        disabled={createBookingMutation.isPending}
                        className="w-full"
                      >
                        {createBookingMutation.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services available
            </h3>
            <p className="text-gray-500">
              {selectedCategory === "all" 
                ? "No add-on services are currently available." 
                : `No services available in the ${selectedCategory} category.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}