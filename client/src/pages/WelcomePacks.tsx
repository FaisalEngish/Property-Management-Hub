import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, ClipboardList, History, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

interface WelcomePackTemplate {
  id: number;
  organizationId: string;
  propertyId: number;
  itemId: number;
  defaultQuantity: number;
  isComplimentary: boolean;
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
}

export default function WelcomePacks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  // Fetch welcome pack items
  const { data: items = [], isLoading: itemsLoading } = useQuery<WelcomePackItem[]>({
    queryKey: ["/api/welcome-pack-items"],
  });

  // Fetch welcome pack templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<WelcomePackTemplate[]>({
    queryKey: ["/api/welcome-pack-templates"],
  });

  // Fetch welcome pack usage
  const { data: usage = [], isLoading: usageLoading } = useQuery<WelcomePackUsage[]>({
    queryKey: ["/api/welcome-pack-usage"],
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome Pack Inventory</h1>
          <p className="text-muted-foreground">
            Manage welcome pack items, templates, and track usage across properties
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Property Templates
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Usage History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {itemsLoading ? (
            <div className="text-center py-8">Loading inventory items...</div>
          ) : (
            <div className="grid gap-4">
              {items.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No welcome pack items found</p>
                  </CardContent>
                </Card>
              ) : (
                items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant="secondary">{item.category}</Badge>
                            {!item.isActive && <Badge variant="destructive">Inactive</Badge>}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Unit Cost:</span>
                              <p className="font-medium">${item.unitCost} {item.currency}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Stock:</span>
                              <p className="font-medium">{item.currentStock}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Restock Threshold:</span>
                              <p className="font-medium">{item.restockThreshold}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Supplier:</span>
                              <p className="font-medium">{item.supplier || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                      {item.currentStock <= item.restockThreshold && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-orange-800 text-sm font-medium">
                            Low Stock Alert: Current stock ({item.currentStock}) is at or below restock threshold ({item.restockThreshold})
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Property Templates</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {templatesLoading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : (
            <div className="grid gap-4">
              {templates.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No welcome pack templates found</p>
                  </CardContent>
                </Card>
              ) : (
                // Group templates by property
                Object.entries(
                  templates.reduce((acc, template) => {
                    if (!acc[template.propertyId]) {
                      acc[template.propertyId] = [];
                    }
                    acc[template.propertyId].push(template);
                    return acc;
                  }, {} as Record<number, WelcomePackTemplate[]>)
                ).map(([propertyId, propertyTemplates]) => (
                  <Card key={propertyId}>
                    <CardHeader>
                      <CardTitle>Property ID: {propertyId}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {propertyTemplates.map((template) => {
                        const item = items.find(i => i.id === template.itemId);
                        return (
                          <div key={template.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{item?.name || `Item ID: ${template.itemId}`}</span>
                              <Badge variant="outline">Qty: {template.defaultQuantity}</Badge>
                              {template.isComplimentary && (
                                <Badge variant="secondary">Complimentary</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item && `$${(Number(item.unitCost) * template.defaultQuantity).toFixed(2)} ${item.currency}`}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Usage History</h2>
          </div>

          {usageLoading ? (
            <div className="text-center py-8">Loading usage history...</div>
          ) : (
            <div className="grid gap-4">
              {usage.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No welcome pack usage recorded</p>
                  </CardContent>
                </Card>
              ) : (
                usage.map((record) => {
                  const item = items.find(i => i.id === record.itemId);
                  return (
                    <Card key={record.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{item?.name || `Item ID: ${record.itemId}`}</h3>
                              <Badge variant="outline">Property ID: {record.propertyId}</Badge>
                              {record.bookingId && (
                                <Badge variant="secondary">Booking ID: {record.bookingId}</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Quantity Used:</span>
                                <p className="font-medium">{record.quantityUsed}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Unit Cost:</span>
                                <p className="font-medium">${record.unitCost}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total Cost:</span>
                                <p className="font-medium">${record.totalCost}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Billing:</span>
                                <p className="font-medium capitalize">{record.billingOption.replace('_', ' ')}</p>
                              </div>
                            </div>
                            {record.notes && (
                              <div className="mt-2">
                                <span className="text-muted-foreground text-sm">Notes:</span>
                                <p className="text-sm">{record.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{new Date(record.usageDate).toLocaleDateString()}</p>
                            {record.processedBy && <p>By: {record.processedBy}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}