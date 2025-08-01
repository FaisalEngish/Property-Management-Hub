import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, TrendingUp, AlertTriangle, Search, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface InventoryItem {
  id: number;
  organizationId: string;
  itemName: string;
  itemType: string | null;
  unit: string;
  defaultPrice: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

interface InventoryUsageLog {
  id: number;
  organizationId: string;
  taskId: number | null;
  propertyId: number | null;
  itemId: number | null;
  quantityUsed: number;
  costTotal: string | null;
  usedBy: string | null;
  usageType: string | null;
  createdAt: Date | null;
}

const ITEM_TYPES = [
  { value: "linens", label: "🛏️ Linens", color: "bg-blue-100 text-blue-800" },
  { value: "cleaning-supplies", label: "🧽 Cleaning Supplies", color: "bg-green-100 text-green-800" },
  { value: "toiletries", label: "🧴 Toiletries", color: "bg-purple-100 text-purple-800" },
  { value: "food-beverage", label: "🍸 Food & Beverage", color: "bg-orange-100 text-orange-800" },
  { value: "maintenance", label: "🔧 Maintenance", color: "bg-gray-100 text-gray-800" },
  { value: "electronics", label: "📱 Electronics", color: "bg-indigo-100 text-indigo-800" },
  { value: "welcome-packs", label: "🎁 Welcome Packs", color: "bg-pink-100 text-pink-800" },
];

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: itemsLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/items/active"],
  });

  // Fetch usage logs
  const { data: usageLogs = [], isLoading: logsLoading } = useQuery<InventoryUsageLog[]>({
    queryKey: ["/api/inventory/usage-logs"],
  });

  // Create inventory item mutation
  const createItemMutation = useMutation({
    mutationFn: async (newItem: any) => {
      return await apiRequest("/api/inventory/items", {
        method: "POST",
        body: JSON.stringify(newItem),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });

  // Update inventory item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return await apiRequest(`/api/inventory/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });

  // Delete inventory item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/inventory/items/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });

  // Filter items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.itemType === selectedType;
    return matchesSearch && matchesType && item.isActive;
  });

  // Calculate statistics
  const totalItems = inventoryItems.filter(item => item.isActive).length;
  const totalValue = inventoryItems
    .filter(item => item.isActive)
    .reduce((sum, item) => sum + (parseFloat(item.defaultPrice || "0")), 0);

  const recentUsage = usageLogs
    .slice(0, 10)
    .reduce((sum, log) => sum + (parseFloat(log.costTotal || "0")), 0);

  const lowStockItems = Math.floor(totalItems * 0.15); // Simulated low stock

  const getTypeInfo = (type: string | null) => {
    return ITEM_TYPES.find(t => t.value === type) || { 
      label: type || "Unknown", 
      color: "bg-gray-100 text-gray-800" 
    };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      itemName: formData.get("itemName") as string,
      itemType: formData.get("itemType") as string,
      unit: formData.get("unit") as string,
      defaultPrice: formData.get("defaultPrice") as string,
      isActive: true,
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, updates: itemData });
    } else {
      createItemMutation.mutate(itemData);
    }
  };

  if (itemsLoading || logsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage property inventory items</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  defaultValue={editingItem?.itemName || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="itemType">Category</Label>
                <Select name="itemType" defaultValue={editingItem?.itemType || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  defaultValue={editingItem?.unit || ""}
                  placeholder="piece, bottle, kg, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="defaultPrice">Default Price (THB)</Label>
                <Input
                  id="defaultPrice"
                  name="defaultPrice"
                  type="number"
                  step="0.01"
                  defaultValue={editingItem?.defaultPrice || ""}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createItemMutation.isPending || updateItemMutation.isPending}>
                  {editingItem ? "Update" : "Create"} Item
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setEditingItem(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(recentUsage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search inventory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ITEM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const typeInfo = getTypeInfo(item.itemType);
              return (
                <Card key={item.id} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.itemName}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingItem(item);
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteItemMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Badge className={`${typeInfo.color} mb-2`}>
                      {typeInfo.label}
                    </Badge>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>Unit: {item.unit}</p>
                      <p>Price: {formatCurrency(parseFloat(item.defaultPrice || "0"))}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No inventory items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}