import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, CalendarContent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Droplets, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Building,
  User,
  Phone,
  Zap
} from "lucide-react";

interface EmergencyWaterRefill {
  id: number;
  propertyId: number;
  propertyName: string;
  deliveryDate: string;
  litersDelivered: number;
  costAmount: number;
  costPerLiter: number;
  supplierName?: string;
  supplierContact?: string;
  waterType: string;
  billingRoute: string;
  notes?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface RefillAnalytics {
  totalRefills: number;
  totalLiters: number;
  totalCost: number;
  averageCostPerLiter: number;
  monthlyUsage: Array<{
    month: string;
    liters: number;
    cost: number;
    refillCount: number;
  }>;
  alertsTriggered: number;
  propertyBreakdown: Array<{
    propertyId: number;
    propertyName: string;
    refillCount: number;
    totalLiters: number;
    totalCost: number;
    averageCostPerLiter: number;
  }>;
}

interface RefillAlert {
  id: number;
  propertyId: number;
  propertyName: string;
  alertType: string;
  alertMessage: string;
  triggerCount: number;
  severity: string;
  recommendations: string;
  isAcknowledged: boolean;
  createdAt: string;
}

const refillSchema = z.object({
  propertyId: z.number().min(1, "Property is required"),
  deliveryDate: z.date(),
  litersDelivered: z.number().min(1, "Liters delivered must be greater than 0"),
  costAmount: z.number().min(0, "Cost must be non-negative"),
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  waterType: z.enum(["government", "deepwell", "emergency_truck"], {
    required_error: "Water type is required",
  }),
  billingRoute: z.enum(["guest_billable", "owner_billable", "company_expense"], {
    required_error: "Billing route is required",
  }),
  notes: z.string().optional(),
});

type RefillFormData = z.infer<typeof refillSchema>;

export default function WaterUtilityEmergencyTruckRefillLog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState<EmergencyWaterRefill | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userRole = (user as any)?.role || "guest";
  const canManage = ["admin", "portfolio-manager"].includes(userRole);
  const canView = ["admin", "portfolio-manager", "owner"].includes(userRole);

  // Form setup
  const form = useForm<RefillFormData>({
    resolver: zodResolver(refillSchema),
    defaultValues: {
      deliveryDate: new Date(),
      litersDelivered: 0,
      costAmount: 0,
      waterType: "emergency_truck",
      billingRoute: "company_expense",
    },
  });

  // Queries
  const { data: refills = [], isLoading: refillsLoading } = useQuery({
    queryKey: ["/api/water-refills", selectedProperty, dateRange],
    enabled: canView,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/water-refills/analytics", selectedProperty, dateRange],
    enabled: canView,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/water-refills/alerts", selectedProperty],
    enabled: canView,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    enabled: canView,
  });

  // Mutations
  const createRefillMutation = useMutation({
    mutationFn: async (data: RefillFormData) => {
      const costPerLiter = data.costAmount / data.litersDelivered;
      return apiRequest("POST", "/api/water-refills", {
        ...data,
        costPerLiter,
        status: "delivered",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills/alerts"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Emergency water refill logged successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log water refill",
        variant: "destructive",
      });
    },
  });

  const updateRefillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RefillFormData> }) => {
      const costPerLiter = data.costAmount && data.litersDelivered 
        ? data.costAmount / data.litersDelivered 
        : undefined;
      return apiRequest("PUT", `/api/water-refills/${id}`, {
        ...data,
        ...(costPerLiter && { costPerLiter }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills/analytics"] });
      setSelectedRefill(null);
      toast({
        title: "Success",
        description: "Water refill updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update water refill",
        variant: "destructive",
      });
    },
  });

  const deleteRefillMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/water-refills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills/analytics"] });
      toast({
        title: "Success",
        description: "Water refill deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete water refill",
        variant: "destructive",
      });
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return apiRequest("PUT", `/api/water-refills/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-refills/alerts"] });
      toast({
        title: "Success",
        description: "Alert acknowledged",
      });
    },
  });

  const onSubmit = (data: RefillFormData) => {
    if (selectedRefill) {
      updateRefillMutation.mutate({ id: selectedRefill.id, data });
    } else {
      createRefillMutation.mutate(data);
    }
  };

  const handleEdit = (refill: EmergencyWaterRefill) => {
    setSelectedRefill(refill);
    form.reset({
      propertyId: refill.propertyId,
      deliveryDate: new Date(refill.deliveryDate),
      litersDelivered: refill.litersDelivered,
      costAmount: refill.costAmount,
      supplierName: refill.supplierName,
      supplierContact: refill.supplierContact,
      waterType: refill.waterType as any,
      billingRoute: refill.billingRoute as any,
      notes: refill.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this water refill record?")) {
      deleteRefillMutation.mutate(id);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await apiRequest("GET", "/api/water-refills/export", {
        propertyId: selectedProperty,
        ...dateRange,
      });
      const data = await response.json();
      
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `water-refills-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access water utility management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Water Utility - Emergency Truck Refill Log</h1>
          <p className="text-muted-foreground">Track emergency water deliveries and billing</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Emergency Refill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedRefill ? "Edit" : "Add"} Emergency Water Refill
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties.map((property: any) => (
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

                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Delivery Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="litersDelivered"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Liters Delivered</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="costAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Cost (THB)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="2500.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="waterType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Water Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="government">Government Water</SelectItem>
                                <SelectItem value="deepwell">Deepwell</SelectItem>
                                <SelectItem value="emergency_truck">Emergency Truck Delivery</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="billingRoute"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Route</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="guest_billable">Guest Billable</SelectItem>
                                <SelectItem value="owner_billable">Owner Billable</SelectItem>
                                <SelectItem value="company_expense">Company Expense</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="supplierName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Water Co. Ltd." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="supplierContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier Contact (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="02-123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about the delivery..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedRefill(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createRefillMutation.isPending || updateRefillMutation.isPending}
                      >
                        {selectedRefill ? "Update" : "Add"} Refill
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Alerts</h2>
          {alerts.map((alert: RefillAlert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.severity === "high" ? "border-l-red-500" : 
              alert.severity === "medium" ? "border-l-yellow-500" : "border-l-blue-500"
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.alertMessage}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Property: {alert.propertyName} | {alert.triggerCount} refills detected
                    </p>
                    {alert.recommendations && (
                      <p className="text-sm mt-2 p-2 bg-blue-50 rounded">
                        <strong>AI Recommendation:</strong> {alert.recommendations}
                      </p>
                    )}
                  </div>
                  {canManage && !alert.isAcknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="refills">Refill Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Refills</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : analytics?.totalRefills || 0}
                </div>
                <p className="text-xs text-muted-foreground">Emergency deliveries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Liters</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : (analytics?.totalLiters || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Delivered this period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : `฿${(analytics?.totalCost || 0).toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">Emergency water costs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Cost/Liter</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : `฿${(analytics?.averageCostPerLiter || 0).toFixed(2)}`}
                </div>
                <p className="text-xs text-muted-foreground">Average rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Property Breakdown */}
          {analytics?.propertyBreakdown && analytics.propertyBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Refills</TableHead>
                      <TableHead>Total Liters</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Avg Cost/L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.propertyBreakdown.map((property) => (
                      <TableRow key={property.propertyId}>
                        <TableCell className="font-medium">{property.propertyName}</TableCell>
                        <TableCell>{property.refillCount}</TableCell>
                        <TableCell>{property.totalLiters.toLocaleString()}</TableCell>
                        <TableCell>฿{property.totalCost.toLocaleString()}</TableCell>
                        <TableCell>฿{property.averageCostPerLiter.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="refills" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <Select
              value={selectedProperty?.toString() || ""}
              onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Properties</SelectItem>
                {properties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refills Table */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Water Refills</CardTitle>
            </CardHeader>
            <CardContent>
              {refillsLoading ? (
                <div className="text-center py-8">Loading refills...</div>
              ) : refills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No emergency water refills recorded yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Liters</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Cost/L</TableHead>
                      <TableHead>Water Type</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Supplier</TableHead>
                      {canManage && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refills.map((refill: EmergencyWaterRefill) => (
                      <TableRow key={refill.id}>
                        <TableCell>
                          {format(new Date(refill.deliveryDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">{refill.propertyName}</TableCell>
                        <TableCell>{refill.litersDelivered.toLocaleString()}L</TableCell>
                        <TableCell>฿{refill.costAmount.toLocaleString()}</TableCell>
                        <TableCell>฿{refill.costPerLiter.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            refill.waterType === "emergency_truck" ? "destructive" :
                            refill.waterType === "government" ? "default" : "secondary"
                          }>
                            {refill.waterType === "emergency_truck" ? "Emergency" :
                             refill.waterType === "government" ? "Government" : "Deepwell"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            refill.billingRoute === "guest_billable" ? "default" :
                            refill.billingRoute === "owner_billable" ? "secondary" : "outline"
                          }>
                            {refill.billingRoute === "guest_billable" ? "Guest" :
                             refill.billingRoute === "owner_billable" ? "Owner" : "Company"}
                          </Badge>
                        </TableCell>
                        <TableCell>{refill.supplierName || "—"}</TableCell>
                        {canManage && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(refill)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(refill.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Monthly Usage Chart */}
          {analytics?.monthlyUsage && analytics.monthlyUsage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Refills</TableHead>
                      <TableHead>Liters</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Avg Cost/L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.monthlyUsage.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell>{month.refillCount}</TableCell>
                        <TableCell>{month.liters.toLocaleString()}L</TableCell>
                        <TableCell>฿{month.cost.toLocaleString()}</TableCell>
                        <TableCell>
                          ฿{month.liters > 0 ? (month.cost / month.liters).toFixed(2) : "0.00"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cost Analysis:</strong> Your average cost per liter is ฿
                  {(analytics?.averageCostPerLiter || 0).toFixed(2)}. Government water typically 
                  costs ฿0.15-0.25/L, while emergency deliveries range ฿2.50-4.00/L.
                </AlertDescription>
              </Alert>

              {analytics?.alertsTriggered > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Frequency Alert:</strong> {analytics.alertsTriggered} properties have 
                    triggered emergency refill alerts. Consider water system inspections for 
                    properties requiring frequent emergency deliveries.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Suggestion:</strong> Properties with 3+ emergency refills in 60 days 
                  should have their water pumps, tanks, and piping inspected. Consider deepwell 
                  upgrades for consistently high-usage properties.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}