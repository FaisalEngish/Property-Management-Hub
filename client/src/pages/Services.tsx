import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import TopBar from "@/components/TopBar";
import CreateAddonBookingDialog from "@/components/CreateAddonBookingDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Utensils, Heart, Car, MapPin, Users, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Services() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("addon-services");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number>();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>();
  
  // New booking form state
  const [newBooking, setNewBooking] = useState({
    serviceId: "",
    propertyId: "",
    guestName: "",
    guestEmail: "",
    scheduledDate: "",
    billingType: "auto_guest",
    price: "",
    dateDue: "",
    notes: "",
  });

  const { data: addonServices = [] } = useQuery({
    queryKey: ["/api/addon-services"],
  });

  const { data: addonBookings = [] } = useQuery({
    queryKey: ["/api/addon-bookings"],
  });

  const { data: serviceBookingsData } = useQuery({
    queryKey: ["/api/service-bookings"],
  });
  
  const serviceBookings = Array.isArray(serviceBookingsData?.bookings) 
    ? serviceBookingsData.bookings 
    : [];

  const { data: utilityBills = [] } = useQuery({
    queryKey: ["/api/utility-bills"],
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/service-bookings", bookingData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Service Booked Successfully",
        description: "The service booking has been created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addon-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finances"] });
      // Reset form
      setNewBooking({
        serviceId: "",
        propertyId: "",
        guestName: "",
        guestEmail: "",
        scheduledDate: "",
        billingType: "auto_guest",
        price: "",
        dateDue: "",
        notes: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Booking",
        description: error.message || "Failed to create service booking",
        variant: "destructive",
      });
    },
  });

  const handleCreateBooking = () => {
    if (!newBooking.serviceId || !newBooking.propertyId || !newBooking.guestName || !newBooking.scheduledDate) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Service, Property, Guest Name, and Scheduled Date",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      addon_service_id: parseInt(newBooking.serviceId),
      property_id: parseInt(newBooking.propertyId),
      guest_name: newBooking.guestName,
      guest_email: newBooking.guestEmail || null,
      billing_type: newBooking.billingType,
      price: newBooking.price ? newBooking.price : null,
      date_due: newBooking.dateDue || null,
      scheduled_date: new Date(newBooking.scheduledDate).toISOString(),
      notes: newBooking.notes || null,
    };

    createBookingMutation.mutate(bookingData);
  };

  const formatPrice = (cents: number | null | undefined): string => {
    if (cents === null || cents === undefined) return "$0.00";
    const dollars = cents / 100;
    const currency = systemSettings?.defaultCurrency || 'AUD';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(dollars);
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'chef': return <Utensils className="w-5 h-5" />;
      case 'massage': return <Heart className="w-5 h-5" />;
      case 'transportation': return <Car className="w-5 h-5" />;
      case 'activities': return <MapPin className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'completed': return 'outline';
      case 'paid': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar 
          title="Services & Utilities" 
          action={
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                setSelectedServiceId(undefined);
                setShowBookingDialog(true);
              }}
              data-testid="button-add-service"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          }
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === "addon-services" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("addon-services")}
            >
              Add-on Services
            </Button>
            <Button
              variant={activeTab === "service-bookings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("service-bookings")}
            >
              Service Bookings
            </Button>
            <Button
              variant={activeTab === "utility-bills" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("utility-bills")}
            >
              Utility Bills
            </Button>
          </div>

          {/* Add-on Services Tab */}
          {activeTab === "addon-services" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addonServices.map((service: any) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            {getServiceIcon(service.category)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <p className="text-sm text-gray-500 capitalize">{service.category}</p>
                          </div>
                        </div>
                        <Badge variant={service.isActive ? 'default' : 'secondary'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-lg font-semibold text-primary">
                            {service.pricingModel === 'complimentary' ? 'Complimentary' : 
                             service.pricingModel === 'variable' ? 
                               (service.hourlyRate ? `$${Number(service.hourlyRate).toFixed(2)}/hr` : '$0.00/hr') :
                               service.defaultPriceCents != null ? `$${(service.defaultPriceCents / 100).toFixed(2)}` :
                               service.basePrice != null ? `$${Number(service.basePrice).toFixed(2)}` :
                               '$0.00'}
                          </span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {service.pricingModel}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setShowBookingDialog(true);
                        }}
                        className="w-full"
                        size="sm"
                        disabled={!service.isActive}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Service
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {addonServices.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Add-on Services</h3>
                    <p className="text-gray-500 mb-4">Start by adding services like cleaning, massage, or chef services.</p>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Service
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Service Bookings Tab */}
          {activeTab === "service-bookings" && (
            <div className="space-y-6">
              {/* Add New Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Service Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Service *</Label>
                      <Select value={newBooking.serviceId} onValueChange={(value) => setNewBooking({...newBooking, serviceId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {addonServices.map((service: any) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Property *</Label>
                      <Select value={newBooking.propertyId} onValueChange={(value) => setNewBooking({...newBooking, propertyId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property: any) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name || `Property ${property.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Guest Name *</Label>
                      <Input 
                        value={newBooking.guestName} 
                        onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})}
                        placeholder="Enter guest name"
                      />
                    </div>
                    
                    <div>
                      <Label>Guest Email</Label>
                      <Input 
                        type="email"
                        value={newBooking.guestEmail} 
                        onChange={(e) => setNewBooking({...newBooking, guestEmail: e.target.value})}
                        placeholder="guest@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Scheduled Date & Time *</Label>
                      <Input 
                        type="datetime-local"
                        value={newBooking.scheduledDate} 
                        onChange={(e) => setNewBooking({...newBooking, scheduledDate: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Billing Type</Label>
                      <Select value={newBooking.billingType} onValueChange={(value) => setNewBooking({...newBooking, billingType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto_guest">Auto Bill Guest</SelectItem>
                          <SelectItem value="auto_owner">Auto Bill Owner</SelectItem>
                          <SelectItem value="owner_gift">Owner Gift</SelectItem>
                          <SelectItem value="company_gift">Company Gift</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Price ($)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={newBooking.price} 
                        onChange={(e) => setNewBooking({...newBooking, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label>Due Date</Label>
                      <Input 
                        type="date"
                        value={newBooking.dateDue} 
                        onChange={(e) => setNewBooking({...newBooking, dateDue: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <Label>Notes</Label>
                      <Input 
                        value={newBooking.notes} 
                        onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateBooking}
                    disabled={createBookingMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Bookings Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No service bookings found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Scheduled Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Billing Type</TableHead>
                            <TableHead>Due Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceBookings.map((booking: any) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-mono text-xs">{booking.bookingIdRef || 'N/A'}</TableCell>
                              <TableCell>{booking.serviceName || 'Unknown'}</TableCell>
                              <TableCell>{booking.guestName}</TableCell>
                              <TableCell>Property {booking.propertyId}</TableCell>
                              <TableCell>{new Date(booking.scheduledDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {booking.priceCents ? formatPrice(booking.priceCents) : (
                                  <Badge variant="secondary">Complimentary</Badge>
                                )}
                              </TableCell>
                              <TableCell className="capitalize">
                                {booking.billingType?.replace('_', ' ') || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {booking.dateDue ? new Date(booking.dateDue).toLocaleDateString() : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Utility Bills Tab */}
          {activeTab === "utility-bills" && (
            <div className="space-y-6">
              {/* Filter Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Properties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Properties</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="electricity">Electricity</SelectItem>
                          <SelectItem value="water">Water</SelectItem>
                          <SelectItem value="gas">Gas</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="uploaded">Uploaded</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button variant="outline" className="w-full">
                        Upload Receipt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Utility Bills Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Utility Bills & Recurring Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  {utilityBills.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No utility bills found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {utilityBills.map((bill: any) => (
                            <TableRow key={bill.id}>
                              <TableCell className="capitalize">{bill.type}</TableCell>
                              <TableCell>{bill.provider}</TableCell>
                              <TableCell>Property {bill.propertyId}</TableCell>
                              <TableCell>${bill.amount}</TableCell>
                              <TableCell>
                                <span className={`${
                                  new Date(bill.dueDate) < new Date() && bill.status !== 'paid' 
                                    ? 'text-red-600 font-medium' 
                                    : 'text-gray-900'
                                }`}>
                                  {new Date(bill.dueDate).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(bill.status)}>
                                  {bill.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    Upload
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Mark Paid
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Add-on Booking Dialog */}
      <CreateAddonBookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        selectedServiceId={selectedServiceId}
        selectedPropertyId={selectedPropertyId}
        bookerRole="manager"
      />
    </div>
  );
}