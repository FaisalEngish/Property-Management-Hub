import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Settings,
  CheckCircle,
  Clock,
  TrendingUp,
  Download
} from "lucide-react";

// Form schemas
const usageLogSchema = z.object({
  propertyId: z.number(),
  taskId: z.number().optional(),
  bookingId: z.number().optional(),
  guestCount: z.number().min(1),
  stayNights: z.number().min(1),
  checkoutDate: z.string(),
  billingRule: z.enum(['owner', 'guest', 'company', 'complimentary']),
  billingReason: z.string().optional(),
  notes: z.string().optional(),
});

const inventoryItemSchema = z.object({
  categoryId: z.number(),
  itemName: z.string().min(1),
  description: z.string().optional(),
  unitType: z.string().min(1),
  defaultQuantityPerBedroom: z.number().min(0),
  costPerUnit: z.string(),
});

const categorySchema = z.object({
  categoryName: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().min(0),
});

const configSchema = z.object({
  propertyId: z.number(),
  oneBrCost: z.string(),
  twoBrCost: z.string(),
  threePlusBrCost: z.string(),
  defaultBillingRule: z.enum(['owner', 'guest', 'company', 'complimentary']),
});

type UsageLogFormData = z.infer<typeof usageLogSchema>;
type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type ConfigFormData = z.infer<typeof configSchema>;

export default function InventoryWelcomePackTracker() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedUsageLog, setSelectedUsageLog] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("this_month");
  const [filterBillingRule, setFilterBillingRule] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/inventory/categories"],
  });

  const { data: items = [] } = useQuery({
    queryKey: ["/api/inventory/items"],
  });

  const { data: usageLogs = [] } = useQuery({
    queryKey: ["/api/inventory/usage-logs", { 
      propertyId: selectedProperty,
      period: filterPeriod,
      billingRule: filterBillingRule !== "all" ? filterBillingRule : undefined 
    }],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/inventory/analytics", { 
      propertyId: selectedProperty,
      period: filterPeriod 
    }],
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ["/api/inventory/stock-levels"],
  });

  const { data: billingSummaries = [] } = useQuery({
    queryKey: ["/api/inventory/billing-summaries", { 
      propertyId: selectedProperty 
    }],
  });

  // Mutations
  const createUsageLogMutation = useMutation({
    mutationFn: async (data: UsageLogFormData) => {
      return apiRequest("POST", "/api/inventory/usage-logs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/usage-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/analytics"] });
      setIsUsageDialogOpen(false);
      toast({
        title: "Usage log created",
        description: "Inventory usage has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InventoryItemFormData) => {
      return apiRequest("POST", "/api/inventory/items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setIsItemDialogOpen(false);
      toast({
        title: "Item created",
        description: "Inventory item has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return apiRequest("POST", "/api/inventory/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/categories"] });
      setIsCategoryDialogOpen(false);
      toast({
        title: "Category created",
        description: "Inventory category has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processUsageLogMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/inventory/usage-logs/${id}/process`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/usage-logs"] });
      toast({
        title: "Usage log processed",
        description: "The usage log has been marked as processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Forms
  const usageForm = useForm<UsageLogFormData>({
    resolver: zodResolver(usageLogSchema),
    defaultValues: {
      guestCount: 2,
      stayNights: 2,
      billingRule: "owner",
    },
  });

  const itemForm = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      defaultQuantityPerBedroom: 1,
      costPerUnit: "0.00",
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      sortOrder: 0,
    },
  });

  // Helper functions
  const getBillingRuleBadge = (rule: string) => {
    switch (rule) {
      case "owner":
        return <Badge variant="default" className="bg-blue-500">Owner Paid</Badge>;
      case "guest":
        return <Badge variant="default" className="bg-green-500">Guest Paid</Badge>;
      case "company":
        return <Badge variant="default" className="bg-orange-500">Company Expense</Badge>;
      case "complimentary":
        return <Badge variant="default" className="bg-purple-500">Complimentary</Badge>;
      default:
        return <Badge variant="secondary">{rule}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const lowStockItems = stockLevels.filter((item: any) => item.isLowStock);

  // Dashboard Tab
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Usage Logs</p>
                <p className="text-2xl font-bold">{usageLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total Cost</p>
                <p className="text-2xl font-bold">
                  {analytics?.totalStats?.totalCost ? 
                    formatCurrency(parseFloat(analytics.totalStats.totalCost)) : 
                    formatCurrency(0)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedProperty?.toString() || "all"} onValueChange={(value) => setSelectedProperty(value === "all" ? null : parseInt(value))}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property: any) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBillingRule} onValueChange={setFilterBillingRule}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by billing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Billing</SelectItem>
            <SelectItem value="owner">Owner Paid</SelectItem>
            <SelectItem value="guest">Guest Paid</SelectItem>
            <SelectItem value="company">Company Expense</SelectItem>
            <SelectItem value="complimentary">Complimentary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Usage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Inventory Usage</DialogTitle>
              <DialogDescription>
                Record inventory consumption for a guest checkout.
              </DialogDescription>
            </DialogHeader>
            <Form {...usageForm}>
              <form onSubmit={usageForm.handleSubmit((data) => createUsageLogMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={usageForm.control}
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={usageForm.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Count</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={usageForm.control}
                    name="stayNights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stay Nights</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={usageForm.control}
                  name="checkoutDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checkout Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={usageForm.control}
                  name="billingRule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Rule</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Owner Pays</SelectItem>
                          <SelectItem value="guest">Guest Pays</SelectItem>
                          <SelectItem value="company">Company Expense</SelectItem>
                          <SelectItem value="complimentary">Complimentary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={usageForm.control}
                  name="billingReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Reason (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., VIP guest complimentary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={usageForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createUsageLogMutation.isPending}>
                  {createUsageLogMutation.isPending ? "Creating..." : "Create Usage Log"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Recent Usage Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage Logs</CardTitle>
          <CardDescription>
            Latest inventory consumption records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageLogs.slice(0, 10).map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.propertyName}</TableCell>
                  <TableCell>{new Date(log.checkoutDate).toLocaleDateString()}</TableCell>
                  <TableCell>{log.guestCount} guests, {log.stayNights} nights</TableCell>
                  <TableCell>{formatCurrency(parseFloat(log.totalPackCost))}</TableCell>
                  <TableCell>{getBillingRuleBadge(log.billingRule)}</TableCell>
                  <TableCell>
                    {log.isProcessed ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Processed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!log.isProcessed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => processUsageLogMutation.mutate(log.id)}
                      >
                        Process
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">
              <AlertTriangle className="h-5 w-5 inline mr-2" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Items that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.itemName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.currentStock} {item.unitType} | Minimum: {item.minimumStock}
                    </p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory & Welcome Pack Tracker</h1>
          <p className="text-muted-foreground">
            Track consumables, manage welcome packs, and handle billing per guest stay
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="usage-logs">Usage Logs</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="usage-logs">
          <Card>
            <CardHeader>
              <CardTitle>All Usage Logs</CardTitle>
              <CardDescription>
                Complete history of inventory consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Usage logs implementation goes here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Manage categories and items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Inventory management implementation goes here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock-levels">
          <Card>
            <CardHeader>
              <CardTitle>Stock Level Management</CardTitle>
              <CardDescription>
                Monitor and update stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Stock levels implementation goes here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Monthly reports and cost analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports implementation goes here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Property Configuration</CardTitle>
              <CardDescription>
                Configure welcome pack costs per property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings implementation goes here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}