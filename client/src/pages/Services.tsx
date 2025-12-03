import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import TopBar from "@/components/TopBar";
import CreateAddonBookingDialog from "@/components/CreateAddonBookingDialog";
import UploadReceiptModal from "@/components/UploadReceiptModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Utensils,
  Heart,
  Car,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Services() {
  const [activeTab, setActiveTab] = useState("addon-services");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number>();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>();
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Utility Bills filters
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  const { toast } = useToast();

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

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
  });

  // Update bill status mutation
  const updateBillStatusMutation = useMutation({
    mutationFn: async ({
      billId,
      status,
    }: {
      billId: number;
      status: string;
    }) => {
      return await apiRequest("PATCH", `/api/utility-bills/${billId}`, {
        status,
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/utility-bills"] });
      toast({
        title: "Status Updated",
        description: "Bill status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update bill status.",
        variant: "destructive",
      });
    },
  });

  // Delete bill mutation
  const deleteBillMutation = useMutation({
    mutationFn: async (billId: number) => {
      return await apiRequest("DELETE", `/api/utility-bills/${billId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      toast({
        title: "Bill Deleted",
        description: "Utility bill has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete bill.",
        variant: "destructive",
      });
    },
  });

  // Filtered utility bills based on all filters
  const filteredUtilityBills = useMemo(() => {
    return utilityBills.filter((bill: any) => {
      // Property filter
      if (
        filterProperty !== "all" &&
        bill.propertyId !== parseInt(filterProperty)
      ) {
        return false;
      }

      // Type filter
      if (filterType !== "all" && bill.type !== filterType) {
        return false;
      }

      // Status filter
      if (filterStatus !== "all" && bill.status !== filterStatus) {
        return false;
      }

      // Date range filter
      const billDate = new Date(bill.dueDate);
      if (filterDateFrom && new Date(filterDateFrom) > billDate) {
        return false;
      }
      if (filterDateTo && new Date(filterDateTo) < billDate) {
        return false;
      }

      return true;
    });
  }, [
    utilityBills,
    filterProperty,
    filterType,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  const formatPrice = (cents: number | null | undefined): string => {
    if (cents === null || cents === undefined) return "$0.00";
    const dollars = cents / 100;
    const currency = systemSettings?.defaultCurrency || "AUD";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency,
    }).format(dollars);
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case "chef":
        return <Utensils className="w-5 h-5" />;
      case "massage":
        return <Heart className="w-5 h-5" />;
      case "transportation":
        return <Car className="w-5 h-5" />;
      case "activities":
        return <MapPin className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "completed":
        return "outline";
      case "paid":
        return "outline";
      case "overdue":
        return "destructive";
      default:
        return "secondary";
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
                            <CardTitle className="text-lg">
                              {service.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500 capitalize">
                              {service.category}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={service.isActive ? "default" : "secondary"}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {service.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          {/* <span className="text-lg font-semibold text-primary">
                            {service.pricingModel === 'complimentary' ? 'Complimentary' : 
                             service.pricingModel === 'variable' ? 
                               (service.hourlyRate ? `$${Number(service.hourlyRate).toFixed(2)}/hr` : '$0.00/hr') :
                               service.defaultPriceCents != null ? `$${(service.defaultPriceCents / 100).toFixed(2)}` :
                               service.basePrice != null ? `$${Number(service.basePrice).toFixed(2)}` :
                               '$0.00'}
                          </span> */}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Add-on Services
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by adding services like cleaning, massage, or chef
                      services.
                    </p>
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
                            <TableCell className="font-mono text-xs">
                              {booking.bookingIdRef || "N/A"}
                            </TableCell>
                            <TableCell>
                              {booking.serviceName || "Unknown"}
                            </TableCell>
                            <TableCell>{booking.guestName}</TableCell>
                            <TableCell>
                              {booking.propertyName ||
                                `Property ${booking.propertyId}`}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                booking.scheduledDate,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {booking.priceCents ? (
                                formatPrice(booking.priceCents)
                              ) : (
                                <Badge variant="secondary">Complimentary</Badge>
                              )}
                            </TableCell>
                            <TableCell className="capitalize">
                              {booking.billingType?.replace("_", " ") || "N/A"}
                            </TableCell>
                            <TableCell>
                              {booking.dateDue
                                ? new Date(booking.dateDue).toLocaleDateString()
                                : "-"}
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Property
                      </label>
                      <Select
                        value={filterProperty}
                        onValueChange={setFilterProperty}
                      >
                        <SelectTrigger data-testid="select-filter-property">
                          <SelectValue placeholder="All Properties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Properties</SelectItem>
                          {(properties as any[]).map((property: any) => (
                            <SelectItem
                              key={property.id}
                              value={property.id.toString()}
                            >
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Type
                      </label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger data-testid="select-filter-type">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="electricity">
                            Electricity
                          </SelectItem>
                          <SelectItem value="water">Water</SelectItem>
                          <SelectItem value="gas">Gas</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Status
                      </label>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger data-testid="select-filter-status">
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
                      <label className="text-sm font-medium mb-1 block">
                        Date From
                      </label>
                      <Input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        data-testid="input-filter-date-from"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Date To
                      </label>
                      <Input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        data-testid="input-filter-date-to"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {filteredUtilityBills.length} of{" "}
                      {utilityBills.length} bills
                    </div>
                    <Button
                      variant="default"
                      onClick={() => setShowUploadModal(true)}
                      data-testid="button-upload-receipt"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Utility Bills Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Utility Bills & Recurring Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredUtilityBills.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {utilityBills.length === 0
                          ? "No utility bills found"
                          : "No bills match the current filters"}
                      </p>
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
                          {filteredUtilityBills.map((bill: any) => (
                            <TableRow key={bill.id}>
                              <TableCell className="capitalize">
                                {bill.type}
                              </TableCell>
                              <TableCell>{bill.provider || "-"}</TableCell>
                              <TableCell>
                                {bill.propertyName ||
                                  `Property ${bill.propertyId}`}
                              </TableCell>
                              <TableCell>
                                {bill.amount
                                  ? `$${Number(bill.amount).toFixed(2)}`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`${
                                    new Date(bill.dueDate) < new Date() &&
                                    bill.status !== "paid"
                                      ? "text-red-600 font-medium"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {new Date(bill.dueDate).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={bill.status}
                                  onValueChange={(newStatus) => {
                                    updateBillStatusMutation.mutate({
                                      billId: bill.id,
                                      status: newStatus,
                                    });
                                  }}
                                  disabled={updateBillStatusMutation.isPending}
                                >
                                  <SelectTrigger
                                    className="w-[120px]"
                                    data-testid={`select-status-${bill.id}`}
                                  >
                                    <SelectValue>
                                      <Badge
                                        variant={getStatusColor(bill.status)}
                                        className="cursor-pointer"
                                      >
                                        {bill.status}
                                      </Badge>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="uploaded">
                                      Uploaded
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">
                                      Overdue
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {bill.receiptUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        window.open(bill.receiptUrl, "_blank")
                                      }
                                      data-testid={`button-view-receipt-${bill.id}`}
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete this utility bill?",
                                        )
                                      ) {
                                        deleteBillMutation.mutate(bill.id);
                                      }
                                    }}
                                    disabled={deleteBillMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    data-testid={`button-delete-${bill.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
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

      {/* Upload Receipt Modal */}
      <UploadReceiptModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
}
