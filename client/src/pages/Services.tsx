import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import TopBar from "@/components/TopBar";
import CreateAddonBookingDialog from "@/components/CreateAddonBookingDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Utensils, Heart, Car, MapPin, Users, Calendar } from "lucide-react";

export default function Services() {
  const [activeTab, setActiveTab] = useState("addon-services");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number>();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>();

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