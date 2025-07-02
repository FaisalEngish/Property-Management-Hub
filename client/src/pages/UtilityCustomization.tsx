import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  Building,
  Zap,
  Wifi,
  Droplets,
  ShieldCheck,
  TreePine,
  Bug,
  Search
} from "lucide-react";

interface UtilityProvider {
  id: number;
  organizationId: string;
  utilityType: string;
  providerName: string;
  country: string;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomExpenseCategory {
  id: number;
  organizationId: string;
  categoryName: string;
  description: string;
  billingCycle: string;
  defaultAmount: string;
  currency: string;
  displayOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const utilityTypeIcons = {
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  gas: Building,
};

const categoryIcons = {
  'Gas': Building,
  'Pest Control': Bug,
  'Residence Fee': Building,
  'Security Service': ShieldCheck,
  'Landscaping': TreePine,
};

export default function UtilityCustomization() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("providers");
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<UtilityProvider | null>(null);
  const [editingCategory, setEditingCategory] = useState<CustomExpenseCategory | null>(null);
  
  // Search and filter states
  const [providerSearch, setProviderSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [utilityTypeFilter, setUtilityTypeFilter] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Provider form state
  const [providerForm, setProviderForm] = useState({
    utilityType: "",
    providerName: "",
    country: "Thailand",
    isDefault: false,
    displayOrder: 1,
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    description: "",
    billingCycle: "monthly",
    defaultAmount: "",
    currency: "THB",
    displayOrder: 1,
  });

  // Fetch utility providers
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/utility-providers"],
  });

  // Fetch custom expense categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/custom-expense-categories"],
  });

  // Create provider mutation
  const createProviderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/utility-providers", data),
    onSuccess: () => {
      toast({
        title: "Provider Added",
        description: "Utility provider has been created successfully.",
      });
      setIsProviderDialogOpen(false);
      setProviderForm({ utilityType: "", providerName: "", country: "Thailand", isDefault: false, displayOrder: 1 });
      queryClient.invalidateQueries({ queryKey: ["/api/utility-providers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create provider",
        variant: "destructive",
      });
    },
  });

  // Update provider mutation
  const updateProviderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/utility-providers/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Provider Updated",
        description: "Utility provider has been updated successfully.",
      });
      setIsProviderDialogOpen(false);
      setEditingProvider(null);
      queryClient.invalidateQueries({ queryKey: ["/api/utility-providers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update provider",
        variant: "destructive",
      });
    },
  });

  // Delete provider mutation
  const deleteProviderMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/utility-providers/${id}`),
    onSuccess: () => {
      toast({
        title: "Provider Deleted",
        description: "Utility provider has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/utility-providers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete provider",
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/custom-expense-categories", data),
    onSuccess: () => {
      toast({
        title: "Category Added",
        description: "Custom expense category has been created successfully.",
      });
      setIsCategoryDialogOpen(false);
      setCategoryForm({ categoryName: "", description: "", billingCycle: "monthly", defaultAmount: "", currency: "THB", displayOrder: 1 });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-expense-categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/custom-expense-categories/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Category Updated",
        description: "Custom expense category has been updated successfully.",
      });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ["/api/custom-expense-categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/custom-expense-categories/${id}`),
    onSuccess: () => {
      toast({
        title: "Category Deleted",
        description: "Custom expense category has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-expense-categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleCreateProvider = () => {
    if (!providerForm.utilityType || !providerForm.providerName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createProviderMutation.mutate(providerForm);
  };

  const handleUpdateProvider = () => {
    if (!editingProvider) return;
    updateProviderMutation.mutate({ id: editingProvider.id, data: providerForm });
  };

  const handleEditProvider = (provider: UtilityProvider) => {
    setEditingProvider(provider);
    setProviderForm({
      utilityType: provider.utilityType,
      providerName: provider.providerName,
      country: provider.country,
      isDefault: provider.isDefault,
      displayOrder: provider.displayOrder,
    });
    setIsProviderDialogOpen(true);
  };

  const handleDeleteProvider = (id: number) => {
    deleteProviderMutation.mutate(id);
  };

  const handleCreateCategory = () => {
    if (!categoryForm.categoryName) {
      toast({
        title: "Validation Error",
        description: "Please fill in the category name.",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(categoryForm);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryForm });
  };

  const handleEditCategory = (category: CustomExpenseCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      categoryName: category.categoryName,
      description: category.description,
      billingCycle: category.billingCycle,
      defaultAmount: category.defaultAmount,
      currency: category.currency,
      displayOrder: category.displayOrder,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategoryMutation.mutate(id);
  };

  const resetProviderForm = () => {
    setProviderForm({ utilityType: "", providerName: "", country: "Thailand", isDefault: false, displayOrder: 1 });
    setEditingProvider(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ categoryName: "", description: "", billingCycle: "monthly", defaultAmount: "", currency: "THB", displayOrder: 1 });
    setEditingCategory(null);
  };

  // Filter and group providers by utility type
  const filteredProviders = (providers as UtilityProvider[]).filter(provider => {
    const matchesSearch = providerSearch === "" || 
      provider.providerName.toLowerCase().includes(providerSearch.toLowerCase()) ||
      provider.country.toLowerCase().includes(providerSearch.toLowerCase());
    
    const matchesCountry = countryFilter === "" || provider.country === countryFilter;
    const matchesType = utilityTypeFilter === "" || provider.utilityType === utilityTypeFilter;
    
    return matchesSearch && matchesCountry && matchesType;
  });

  const groupedProviders = filteredProviders.reduce((acc: any, provider: UtilityProvider) => {
    if (!acc[provider.utilityType]) {
      acc[provider.utilityType] = [];
    }
    acc[provider.utilityType].push(provider);
    return acc;
  }, {});

  if (providersLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading utility settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utility & Expense Customization</h1>
          <p className="text-muted-foreground">
            Manage utility providers and custom expense categories for your organization.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Utility Providers</TabsTrigger>
          <TabsTrigger value="categories">Custom Expense Categories</TabsTrigger>
        </TabsList>

        {/* Utility Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Utility Providers</h2>
              <p className="text-sm text-muted-foreground">
                Manage electricity, water, internet, and other utility providers by country.
              </p>
            </div>
            <Dialog 
              open={isProviderDialogOpen} 
              onOpenChange={(open) => {
                setIsProviderDialogOpen(open);
                if (!open) resetProviderForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProvider ? "Edit Utility Provider" : "Add New Utility Provider"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProvider 
                      ? "Update the utility provider information."
                      : "Add a new utility provider for your organization."
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="utilityType">Utility Type *</Label>
                    <Select 
                      value={providerForm.utilityType} 
                      onValueChange={(value) => setProviderForm({ ...providerForm, utilityType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select utility type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">⚡ Electricity</SelectItem>
                        <SelectItem value="water">💧 Water</SelectItem>
                        <SelectItem value="internet">📶 Internet</SelectItem>
                        <SelectItem value="gas">🔥 Gas</SelectItem>
                        <SelectItem value="cable-tv">📺 Cable TV</SelectItem>
                        <SelectItem value="trash-collection">🗑️ Trash Collection</SelectItem>
                        <SelectItem value="other">🔧 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="providerName">Provider Name *</Label>
                    <Input
                      id="providerName"
                      value={providerForm.providerName}
                      onChange={(e) => setProviderForm({ ...providerForm, providerName: e.target.value })}
                      placeholder="Enter provider name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={providerForm.country} 
                      onValueChange={(value) => setProviderForm({ ...providerForm, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Thailand">🇹🇭 Thailand</SelectItem>
                        <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                        <SelectItem value="Vietnam">🇻🇳 Vietnam</SelectItem>
                        <SelectItem value="Indonesia">🇮🇩 Indonesia</SelectItem>
                        <SelectItem value="Malaysia">🇲🇾 Malaysia</SelectItem>
                        <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
                        <SelectItem value="United States">🇺🇸 United States</SelectItem>
                        <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
                        <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                        <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                        <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                        <SelectItem value="France">🇫🇷 France</SelectItem>
                        <SelectItem value="Japan">🇯🇵 Japan</SelectItem>
                        <SelectItem value="South Korea">🇰🇷 South Korea</SelectItem>
                        <SelectItem value="China">🇨🇳 China</SelectItem>
                        <SelectItem value="India">🇮🇳 India</SelectItem>
                        <SelectItem value="Other">🌍 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={providerForm.displayOrder}
                      onChange={(e) => setProviderForm({ ...providerForm, displayOrder: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={providerForm.isDefault}
                      onChange={(e) => setProviderForm({ ...providerForm, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault">Set as default provider for this utility type</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsProviderDialogOpen(false);
                      resetProviderForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingProvider ? handleUpdateProvider : handleCreateProvider}
                    disabled={createProviderMutation.isPending || updateProviderMutation.isPending}
                  >
                    {editingProvider ? "Update" : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search providers..."
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                <SelectItem value="Thailand">🇹🇭 Thailand</SelectItem>
                <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                <SelectItem value="Vietnam">🇻🇳 Vietnam</SelectItem>
                <SelectItem value="Malaysia">🇲🇾 Malaysia</SelectItem>
                <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
              </SelectContent>
            </Select>
            <Select value={utilityTypeFilter} onValueChange={setUtilityTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="electricity">⚡ Electricity</SelectItem>
                <SelectItem value="water">💧 Water</SelectItem>
                <SelectItem value="internet">📶 Internet</SelectItem>
                <SelectItem value="gas">🔥 Gas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Providers Grid */}
          <div className="grid gap-6">
            {Object.entries(groupedProviders).map(([utilityType, typeProviders]: [string, any]) => {
              const IconComponent = utilityTypeIcons[utilityType as keyof typeof utilityTypeIcons] || Settings;
              
              return (
                <Card key={utilityType}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <IconComponent className="h-5 w-5" />
                      {utilityType} Providers
                    </CardTitle>
                    <CardDescription>
                      {typeProviders.length} provider{typeProviders.length !== 1 ? 's' : ''} configured
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {typeProviders
                        .sort((a: UtilityProvider, b: UtilityProvider) => a.displayOrder - b.displayOrder)
                        .map((provider: UtilityProvider) => (
                        <div
                          key={provider.id}
                          className="p-3 border rounded-lg flex items-center justify-between hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{provider.providerName}</h4>
                              {provider.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{provider.country}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProvider(provider)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Utility Provider</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{provider.providerName}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProvider(provider.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Custom Expense Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Custom Expense Categories</h2>
              <p className="text-sm text-muted-foreground">
                Define recurring expense categories with default amounts and billing cycles.
              </p>
            </div>
            <Dialog 
              open={isCategoryDialogOpen} 
              onOpenChange={(open) => {
                setIsCategoryDialogOpen(open);
                if (!open) resetCategoryForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Expense Category" : "Add New Expense Category"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory 
                      ? "Update the custom expense category information."
                      : "Create a new custom expense category for your organization."
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.categoryName}
                      onChange={(e) => setCategoryForm({ ...categoryForm, categoryName: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCycle">Billing Cycle</Label>
                      <Select 
                        value={categoryForm.billingCycle} 
                        onValueChange={(value) => setCategoryForm({ ...categoryForm, billingCycle: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={categoryForm.currency} 
                        onValueChange={(value) => setCategoryForm({ ...categoryForm, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="THB">THB (฿)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultAmount">Default Amount</Label>
                      <Input
                        id="defaultAmount"
                        value={categoryForm.defaultAmount}
                        onChange={(e) => setCategoryForm({ ...categoryForm, defaultAmount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={categoryForm.displayOrder}
                        onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCategoryDialogOpen(false);
                      resetCategoryForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  >
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .sort((a: CustomExpenseCategory, b: CustomExpenseCategory) => a.displayOrder - b.displayOrder)
              .map((category: CustomExpenseCategory) => {
                const IconComponent = categoryIcons[category.categoryName as keyof typeof categoryIcons] || Building;
                
                return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {category.categoryName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Expense Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.categoryName}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Default Amount:</span>
                        <span className="font-medium">
                          {category.defaultAmount} {category.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Billing:</span>
                        <Badge variant="outline" className="capitalize">
                          {category.billingCycle}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}