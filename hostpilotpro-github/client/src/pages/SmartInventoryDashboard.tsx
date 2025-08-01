import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  Factory, 
  BarChart3, 
  Search, 
  Plus, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Warehouse,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown
} from "lucide-react";

export default function SmartInventoryDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<"item" | "supplier" | "order">("item");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: inventoryItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/smart-inventory/items", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/smart-inventory/items${selectedProperty ? `?propertyId=${selectedProperty}` : ""}`),
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/smart-inventory/suppliers"],
    queryFn: () => apiRequest("GET", "/api/smart-inventory/suppliers"),
  });

  const { data: purchaseOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/smart-inventory/purchase-orders"],
    queryFn: () => apiRequest("GET", "/api/smart-inventory/purchase-orders"),
  });

  const { data: stockMovements, isLoading: movementsLoading } = useQuery({
    queryKey: ["/api/smart-inventory/stock-movements"],
    queryFn: () => apiRequest("GET", "/api/smart-inventory/stock-movements"),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/smart-inventory/analytics"],
    queryFn: () => apiRequest("GET", "/api/smart-inventory/analytics"),
  });

  const { data: lowStockAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/smart-inventory/alerts/low-stock"],
    queryFn: () => apiRequest("GET", "/api/smart-inventory/alerts/low-stock"),
  });

  const { data: demandForecast, isLoading: forecastLoading } = useQuery({
    queryKey: ["/api/smart-inventory/demand-forecast"],
    queryFn: () => apiRequest("GET", "/api/smart-inventory/demand-forecast"),
  });

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/smart-inventory/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smart-inventory/items"] });
      toast({ title: "Success", description: "Inventory item created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create inventory item", variant: "destructive" });
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/smart-inventory/suppliers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smart-inventory/suppliers"] });
      toast({ title: "Success", description: "Supplier created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create supplier", variant: "destructive" });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/smart-inventory/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smart-inventory/purchase-orders"] });
      toast({ title: "Success", description: "Purchase order created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create purchase order", variant: "destructive" });
    },
  });

  const createMovementMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/smart-inventory/stock-movements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smart-inventory/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/smart-inventory/items"] });
      toast({ title: "Success", description: "Stock movement recorded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record stock movement", variant: "destructive" });
    },
  });

  // Filtered items based on search and category
  const filteredItems = inventoryItems?.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "linens", label: "Linens & Bedding" },
    { value: "food_beverage", label: "Food & Beverages" },
    { value: "cleaning", label: "Cleaning Supplies" },
    { value: "toiletries", label: "Toiletries" },
    { value: "maintenance", label: "Maintenance" },
    { value: "electronics", label: "Electronics" },
    { value: "welcome_packs", label: "Welcome Packs" },
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    in_stock: "bg-green-100 text-green-800",
    low_stock: "bg-orange-100 text-orange-800",
    out_of_stock: "bg-red-100 text-red-800",
    critical: "bg-red-100 text-red-800",
    active: "bg-green-100 text-green-800",
  };

  const openCreateDialog = (type: "item" | "supplier" | "order") => {
    setCreateDialogType(type);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Inventory & Supply Chain</h1>
          <p className="text-gray-600 mt-1">
            Advanced inventory management with AI-powered demand forecasting and automated supplier coordination
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => openCreateDialog("item")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button onClick={() => openCreateDialog("supplier")} variant="outline">
            <Factory className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
          <Button onClick={() => openCreateDialog("order")} variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{analytics?.totalValue?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalItems || 0} items across {analytics?.topCategories?.length || 0} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockAlerts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.expiringSoon || 0} items expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers?.filter((s: any) => s.isActive)?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg delivery: {analytics?.averageDeliveryTime || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders?.filter((o: any) => o.status === 'pending')?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.predictedRestockDate?.criticalItems || 0} critical restocks needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center space-x-2">
            <Factory className="h-4 w-4" />
            <span>Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4" />
            <span>Movements</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Critical Alerts */}
          {lowStockAlerts && lowStockAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Critical Stock Alerts</span>
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">{alert.itemName}</div>
                          <div className="text-sm text-gray-600">
                            Current: {alert.currentStock} | Minimum: {alert.minimumStock} | Days until stockout: {alert.daysUntilStockout}
                          </div>
                        </div>
                      </div>
                      <Badge className={statusColors[alert.severity as keyof typeof statusColors]}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Inventory value distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics?.topCategories?.map((category: any, index: number) => (
                  <div key={category.category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{category.category.replace('_', ' ')}</span>
                      <Badge variant="secondary">{category.percentage.toFixed(1)}%</Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ฿{category.value.toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Latest inventory transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockMovements?.slice(0, 5).map((movement: any) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {movement.movementType === 'stock_in' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{movement.itemName}</div>
                        <div className="text-sm text-gray-600">
                          {movement.movementType === 'stock_in' ? '+' : ''}{movement.quantity} units • {movement.reason}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ฿{Math.abs(movement.totalValue).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(movement.movementDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items by name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item: any) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge 
                      className={
                        item.currentStock <= item.minimumStock 
                          ? statusColors.low_stock 
                          : statusColors.in_stock
                      }
                    >
                      {item.currentStock <= item.minimumStock ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">SKU:</span>
                      <span className="font-medium">{item.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Stock:</span>
                      <span className="font-medium">{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unit Cost:</span>
                      <span className="font-medium">฿{item.unitCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{item.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Restocked:</span>
                      <span className="font-medium">
                        {new Date(item.lastRestocked).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Stock Level Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stock Level</span>
                      <span>{item.currentStock}/{item.maximumStock}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.currentStock <= item.minimumStock 
                            ? 'bg-red-500' 
                            : item.currentStock <= item.minimumStock * 1.5 
                            ? 'bg-orange-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${(item.currentStock / item.maximumStock) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && !itemsLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  No inventory items found matching your criteria.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers?.map((supplier: any) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <Badge className={supplier.isActive ? statusColors.active : statusColors.cancelled}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{supplier.supplierType} supplier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contact:</span>
                      <span className="font-medium">{supplier.contactPerson}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium text-sm">{supplier.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="font-medium">{supplier.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment Terms:</span>
                      <span className="font-medium">{supplier.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Time:</span>
                      <span className="font-medium">{supplier.deliveryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Min Order:</span>
                      <span className="font-medium">฿{supplier.minimumOrder.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="font-medium">{supplier.rating}/5 ⭐</span>
                    </div>
                  </div>
                  
                  {/* Categories */}
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Categories:</div>
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories.map((category: string) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="space-y-4">
            {purchaseOrders?.map((order: any) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <CardDescription>{order.supplierName}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {order.status}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        {order.priority}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Order Date</div>
                      <div className="font-medium">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Expected Delivery</div>
                      <div className="font-medium">
                        {new Date(order.expectedDelivery).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                      <div className="font-medium text-lg">
                        ฿{order.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Payment Status</div>
                      <Badge className={statusColors[order.paymentStatus as keyof typeof statusColors]}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Order Items:</div>
                    <div className="space-y-2">
                      {order.orderItems.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity} @ ฿{item.unitCost}
                            </div>
                          </div>
                          <div className="font-medium">
                            ฿{item.totalCost.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-1">Notes:</div>
                      <div className="text-sm">{order.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <div className="space-y-3">
            {stockMovements?.map((movement: any) => (
              <Card key={movement.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {movement.movementType === 'stock_in' ? (
                        <div className="p-2 bg-green-100 rounded-full">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 rounded-full">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{movement.itemName}</div>
                        <div className="text-sm text-gray-600">
                          {movement.movementType === 'stock_in' ? 'Stock In' : 'Stock Out'} • 
                          {movement.movementType === 'stock_in' ? '+' : ''}{movement.quantity} units
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg">
                        ฿{Math.abs(movement.totalValue).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(movement.movementDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">From:</span>
                      <div className="font-medium">{movement.fromLocation}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">To:</span>
                      <div className="font-medium">{movement.toLocation}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Reason:</span>
                      <div className="font-medium">{movement.reason}</div>
                    </div>
                  </div>
                  
                  {movement.notes && (
                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">Notes:</span>
                      <div className="text-sm mt-1">{movement.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stock Turnover Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics?.stockTurnoverRate?.toFixed(2) || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Times per year
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supplier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">On-time Delivery:</span>
                    <span className="font-medium">
                      {analytics?.supplierPerformance?.onTimeDelivery || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Rating:</span>
                    <span className="font-medium">
                      {analytics?.supplierPerformance?.qualityRating || 0}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time:</span>
                    <span className="font-medium">
                      {analytics?.supplierPerformance?.averageResponseTime || 0} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Usage Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Month:</span>
                    <span className="font-medium">
                      ฿{analytics?.monthlyUsage?.currentMonth?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Previous Month:</span>
                    <span className="font-medium">
                      ฿{analytics?.monthlyUsage?.previousMonth?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Trend:</span>
                    {analytics?.monthlyUsage?.trend === 'increasing' ? (
                      <Badge className="bg-green-100 text-green-800">Increasing</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Decreasing</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demand Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>AI Demand Forecast (30 Days)</CardTitle>
              <CardDescription>Predictive analytics for inventory planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandForecast?.map((forecast: any) => (
                  <div key={forecast.itemId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{forecast.itemName}</div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {forecast.confidence}% Confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current Stock:</span>
                        <div className="font-medium">{forecast.currentStock}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Predicted Usage:</span>
                        <div className="font-medium">{forecast.predictedUsage}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Recommended Reorder:</span>
                        <div className="font-medium">{forecast.recommendedReorder}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Historical Accuracy:</span>
                        <div className="font-medium">{forecast.historicalAccuracy}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog (placeholder for now) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {createDialogType === 'item' ? 'Inventory Item' : 
                         createDialogType === 'supplier' ? 'Supplier' : 'Purchase Order'}
            </DialogTitle>
            <DialogDescription>
              {createDialogType === 'item' && 'Add a new item to your inventory system'}
              {createDialogType === 'supplier' && 'Register a new supplier for procurement'}
              {createDialogType === 'order' && 'Create a new purchase order for restocking'}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-gray-500">
            Create {createDialogType} form coming soon...
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}