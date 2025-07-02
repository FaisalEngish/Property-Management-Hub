import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  BarChart3, 
  Download,
  Filter,
  Calendar,
  Building,
  User,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import TopBar from "@/components/TopBar";
import { addDays, format } from "date-fns";

interface InventoryStats {
  totalItems: number;
  totalUsage: number;
  totalCost: number;
  lowStockAlerts: number;
  topUsedItems: Array<{
    itemName: string;
    category: string;
    totalUsed: number;
    totalCost: number;
  }>;
  topProperties: Array<{
    propertyName: string;
    totalUsage: number;
    totalCost: number;
  }>;
  monthlyUsage: Array<{
    month: string;
    totalUsage: number;
    totalCost: number;
  }>;
  staffUsage: Array<{
    staffName: string;
    totalUsage: number;
    totalCost: number;
  }>;
}

interface WelcomePackItem {
  id: number;
  organizationId: string;
  name: string;
  category: string;
  unitCost: string;
  currency: string;
  supplier: string | null;
  restockThreshold: number;
  currentStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WelcomePackUsage {
  id: number;
  organizationId: string;
  propertyId: number;
  bookingId: number | null;
  itemId: number;
  quantityUsed: number;
  unitCost: string;
  totalCost: string;
  billingOption: string;
  processedBy: string | null;
  usageDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  itemName?: string;
  propertyName?: string;
  staffName?: string;
}

export default function InventoryDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Fetch inventory stats
  const { data: stats = {
    totalItems: 0,
    totalUsage: 0,
    totalCost: 0,
    lowStockAlerts: 0,
    topUsedItems: [],
    topProperties: [],
    monthlyUsage: [],
    staffUsage: []
  } as InventoryStats, isLoading: statsLoading } = useQuery<InventoryStats>({
    queryKey: ["/api/inventory/stats", selectedProperty, selectedStaff, dateRange],
  });

  // Fetch welcome pack items for stock levels
  const { data: items = [], isLoading: itemsLoading } = useQuery<WelcomePackItem[]>({
    queryKey: ["/api/welcome-pack-items"],
  });

  // Fetch usage details
  const { data: usageDetails = [], isLoading: usageLoading } = useQuery<WelcomePackUsage[]>({
    queryKey: ["/api/welcome-pack-usage/detailed", selectedProperty, selectedStaff, dateRange],
  });

  // Fetch properties for filter
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch users for staff filter
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const exportToCsv = () => {
    const csvData = usageDetails.map(usage => ({
      Date: format(new Date(usage.usageDate), 'yyyy-MM-dd'),
      Property: usage.propertyName || 'Unknown',
      Item: usage.itemName || 'Unknown',
      Quantity: usage.quantityUsed,
      UnitCost: usage.unitCost,
      TotalCost: usage.totalCost,
      ProcessedBy: usage.staffName || 'System',
      Notes: usage.notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-usage-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockStatusColor = (current: number, threshold: number) => {
    if (current <= threshold) return "destructive";
    if (current <= threshold * 1.5) return "secondary";
    return "default";
  };

  const getStockStatusText = (current: number, threshold: number) => {
    if (current <= threshold) return "Critical";
    if (current <= threshold * 1.5) return "Low";
    return "Good";
  };

  return (
    <div className="container mx-auto p-6">
      <TopBar title="Inventory Dashboard" />
      
      <div className="flex flex-col gap-6 mt-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Property</label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Properties</SelectItem>
                    {Array.isArray(properties) && properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Staff Member</label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Staff</SelectItem>
                    {Array.isArray(staff) && staff.map((member: any) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <DatePickerWithRange
                  from={dateRange.from}
                  to={dateRange.to}
                  onSelect={(range: any) => range && setDateRange(range)}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={exportToCsv} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Active inventory items</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">Items used in period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCost}</div>
              <p className="text-xs text-muted-foreground">Period expense</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.lowStockAlerts}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Top Items
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Top Properties
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stock Levels
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Staff Usage
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Usage Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Used Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topUsedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.category} • {item.totalUsed} units used
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.totalCost}</div>
                        <div className="text-sm text-muted-foreground">Total cost</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Properties by Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topProperties.map((property, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{property.propertyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.totalUsage} items used
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${property.totalCost}</div>
                        <div className="text-sm text-muted-foreground">Total cost</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => {
                    const stockPercentage = (item.currentStock / (item.restockThreshold * 2)) * 100;
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStockStatusColor(item.currentStock, item.restockThreshold)}>
                              {getStockStatusText(item.currentStock, item.restockThreshold)}
                            </Badge>
                            <span className="text-sm">
                              {item.currentStock} / {item.restockThreshold * 2}
                            </span>
                          </div>
                        </div>
                        <Progress value={Math.min(stockPercentage, 100)} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.staffUsage.map((staff, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{staff.staffName}</div>
                        <div className="text-sm text-muted-foreground">
                          {staff.totalUsage} items processed
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${staff.totalCost}</div>
                        <div className="text-sm text-muted-foreground">Total cost</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Usage Log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageDetails.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>
                          {format(new Date(usage.usageDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{usage.propertyName || 'Unknown'}</TableCell>
                        <TableCell>{usage.itemName || 'Unknown'}</TableCell>
                        <TableCell>{usage.quantityUsed}</TableCell>
                        <TableCell>${usage.unitCost}</TableCell>
                        <TableCell>${usage.totalCost}</TableCell>
                        <TableCell>{usage.staffName || 'System'}</TableCell>
                        <TableCell>{usage.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}