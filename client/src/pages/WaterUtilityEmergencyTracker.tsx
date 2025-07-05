import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Droplets, Truck, AlertTriangle, Calendar, DollarSign, Settings, TrendingUp, Filter, Plus } from "lucide-react";
import { format } from "date-fns";

// Form schema for emergency water delivery
const deliveryFormSchema = z.object({
  propertyId: z.number().min(1, "Property is required"),
  supplierName: z.string().optional(),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  volumeLiters: z.number().min(1, "Volume must be greater than 0"),
  costTHB: z.string().min(1, "Cost is required"),
  notes: z.string().optional(),
  deliveryType: z.enum(["unexpected", "preventable", "planned"]).default("unexpected"),
  billingType: z.enum(["owner_billable", "company_expense", "guest_billable"]).default("owner_billable"),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

interface EmergencyWaterDelivery {
  id: number;
  organizationId: string;
  propertyId: number;
  propertyName?: string;
  supplierName: string | null;
  deliveryDate: string;
  volumeLiters: number;
  costTHB: string;
  costPerLiter: string;
  receiptUrl: string | null;
  notes: string | null;
  linkedGuestBooking: string | null;
  linkedEvent: string | null;
  deliveryType: string;
  billingType: string;
  processedBy: string | null;
  approvedBy: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WaterUtilityAlert {
  id: number;
  organizationId: string;
  propertyId: number;
  propertyName?: string;
  alertType: string;
  alertDate: Date;
  expectedBillDate: string | null;
  daysSinceLastBill: number | null;
  alertMessage: string;
  isActive: boolean;
  dismissedBy: string | null;
  dismissedAt: Date | null;
  actionTaken: string | null;
  notes: string | null;
  createdAt: Date;
}

interface WaterUtilityAnalytics {
  emergencyDeliveries: {
    totalDeliveries: number;
    totalLiters: number;
    totalCost: number;
    averageCostPerLiter: number;
  };
  alerts: {
    activeAlerts: number;
  };
  billing: {
    totalBills: number;
    overdueBills: number;
    paidBills: number;
  };
}

export default function WaterUtilityEmergencyTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);

  // Fetch emergency water deliveries
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery<EmergencyWaterDelivery[]>({
    queryKey: ["/api/water-utility/emergency-deliveries"],
  });

  // Fetch water utility alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery<WaterUtilityAlert[]>({
    queryKey: ["/api/water-utility/alerts"],
  });

  // Fetch water utility analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<WaterUtilityAnalytics>({
    queryKey: ["/api/water-utility/analytics"],
  });

  // Form for creating delivery
  const deliveryForm = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      propertyId: 1,
      deliveryDate: format(new Date(), "yyyy-MM-dd"),
      deliveryType: "unexpected",
      billingType: "owner_billable",
    },
  });

  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async (data: DeliveryFormData) => {
      return await apiRequest("POST", "/api/water-utility/emergency-deliveries", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Emergency water delivery logged successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/water-utility/emergency-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-utility/analytics"] });
      setIsDeliveryDialogOpen(false);
      deliveryForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log emergency delivery",
        variant: "destructive",
      });
    },
  });

  // Dismiss alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: async ({ alertId, actionTaken }: { alertId: number; actionTaken?: string }) => {
      return await apiRequest("PATCH", `/api/water-utility/alerts/${alertId}/dismiss`, { actionTaken });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alert dismissed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/water-utility/alerts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to dismiss alert",
        variant: "destructive",
      });
    },
  });

  const handleCreateDelivery = (data: DeliveryFormData) => {
    createDeliveryMutation.mutate(data);
  };

  const handleDismissAlert = (alertId: number, actionTaken?: string) => {
    dismissAlertMutation.mutate({ alertId, actionTaken });
  };

  const getDeliveryTypeBadge = (type: string) => {
    const variants = {
      unexpected: "destructive",
      preventable: "default",
      planned: "secondary",
    } as const;
    return <Badge variant={variants[type as keyof typeof variants] || "default"}>{type}</Badge>;
  };

  const getBillingTypeBadge = (type: string) => {
    const variants = {
      owner_billable: "default",
      company_expense: "secondary",
      guest_billable: "outline",
    } as const;
    return <Badge variant={variants[type as keyof typeof variants] || "default"}>{type.replace('_', ' ')}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "default",
      approved: "secondary",
      completed: "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>;
  };

  const getAlertTypeBadge = (type: string) => {
    const variants = {
      missing_bill: "destructive",
      overdue_payment: "default",
      emergency_prompt: "secondary",
    } as const;
    return <Badge variant={variants[type as keyof typeof variants] || "default"}>{type.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            Water Utility & Emergency Supply Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track emergency water deliveries, utility bills, and automated AI notifications
          </p>
        </div>
        <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Log Emergency Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Log Emergency Water Delivery</DialogTitle>
              <DialogDescription>
                Record details of emergency water truck delivery for property tracking and billing.
              </DialogDescription>
            </DialogHeader>
            <Form {...deliveryForm}>
              <form onSubmit={deliveryForm.handleSubmit(handleCreateDelivery)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={deliveryForm.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Villa Samui Breeze</SelectItem>
                            <SelectItem value="2">Villa Tropical Paradise</SelectItem>
                            <SelectItem value="3">Villa Balinese Charm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deliveryForm.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={deliveryForm.control}
                    name="supplierName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Samui Water Express" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deliveryForm.control}
                    name="volumeLiters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume (Liters)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 5000" 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={deliveryForm.control}
                    name="costTHB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Cost (THB)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 750.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deliveryForm.control}
                    name="deliveryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unexpected">Unexpected</SelectItem>
                            <SelectItem value="preventable">Preventable</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={deliveryForm.control}
                  name="billingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner_billable">Owner Billable</SelectItem>
                          <SelectItem value="company_expense">Company Expense</SelectItem>
                          <SelectItem value="guest_billable">Guest Billable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={deliveryForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about the delivery..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDeliveryMutation.isPending}>
                    {createDeliveryMutation.isPending ? "Logging..." : "Log Delivery"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Bills
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Deliveries</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.emergencyDeliveries.totalDeliveries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.emergencyDeliveries.totalLiters || 0} liters total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₿{analytics?.emergencyDeliveries.totalCost || 0}</div>
                <p className="text-xs text-muted-foreground">
                  ₿{analytics?.emergencyDeliveries.averageCostPerLiter.toFixed(3) || 0} per liter
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.alerts.activeAlerts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Emergency Deliveries</CardTitle>
              <CardDescription>Latest emergency water truck deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveries.slice(0, 3).map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Truck className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium">{delivery.propertyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {delivery.volumeLiters} liters • {format(new Date(delivery.deliveryDate), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₿{delivery.costTHB}</div>
                      <div className="flex gap-2">
                        {getDeliveryTypeBadge(delivery.deliveryType)}
                        {getStatusBadge(delivery.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Water Deliveries</CardTitle>
              <CardDescription>Complete log of emergency water truck deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div key={delivery.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{delivery.propertyName}</h3>
                        {getDeliveryTypeBadge(delivery.deliveryType)}
                        {getBillingTypeBadge(delivery.billingType)}
                        {getStatusBadge(delivery.status)}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₿{delivery.costTHB}</div>
                        <div className="text-sm text-muted-foreground">
                          ₿{delivery.costPerLiter} per liter
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span> {format(new Date(delivery.deliveryDate), "MMM dd, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume:</span> {delivery.volumeLiters} liters
                      </div>
                      <div>
                        <span className="text-muted-foreground">Supplier:</span> {delivery.supplierName || "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Processed by:</span> {delivery.processedBy || "N/A"}
                      </div>
                    </div>
                    {delivery.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {delivery.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Utility Alerts</CardTitle>
              <CardDescription>AI-generated notifications for missing bills and delivery prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${alert.isActive ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${alert.isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                        <h3 className="font-medium">{alert.propertyName}</h3>
                        {getAlertTypeBadge(alert.alertType)}
                        {!alert.isActive && <Badge variant="outline">Dismissed</Badge>}
                      </div>
                      {alert.isActive && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDismissAlert(alert.id, "reviewed")}
                          disabled={dismissAlertMutation.isPending}
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                    <div className="text-sm mb-2">{alert.alertMessage}</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Alert Date:</span> {format(new Date(alert.alertDate), "MMM dd, yyyy")}
                      </div>
                      {alert.expectedBillDate && (
                        <div>
                          <span className="font-medium">Expected Bill:</span> {format(new Date(alert.expectedBillDate), "MMM dd, yyyy")}
                        </div>
                      )}
                      {alert.daysSinceLastBill && (
                        <div>
                          <span className="font-medium">Days Since Last Bill:</span> {alert.daysSinceLastBill}
                        </div>
                      )}
                    </div>
                    {alert.actionTaken && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Action Taken:</span> {alert.actionTaken}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Utility Bills</CardTitle>
              <CardDescription>Regular water bills and emergency delivery billing records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Water utility bills feature coming soon...</p>
                <p className="text-sm">Will include government water bills, emergency delivery invoices, and payment tracking</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Water Settings</CardTitle>
              <CardDescription>Configure water sources, billing cycles, and emergency supplier contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Property water settings feature coming soon...</p>
                <p className="text-sm">Will include water source configuration, billing cycle settings, and emergency contact management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}