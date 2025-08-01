import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench, Calendar, AlertTriangle, DollarSign, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const applianceSchema = z.object({
  propertyId: z.number(),
  applianceType: z.string().min(1, "Appliance type is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  installDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  notes: z.string().optional(),
});

const repairSchema = z.object({
  applianceId: z.number(),
  issueReported: z.string().min(1, "Issue description is required"),
  fixDescription: z.string().optional(),
  technicianName: z.string().optional(),
  repairCost: z.number().optional(),
  receiptUrl: z.string().optional(),
  repairedAt: z.string().optional(),
});

export default function PropertyAppliancesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [showApplianceDialog, setShowApplianceDialog] = useState(false);
  const [showRepairDialog, setShowRepairDialog] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<any>(null);
  const [editingRepair, setEditingRepair] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real API queries
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: appliances = [], isLoading: appliancesLoading } = useQuery({
    queryKey: ["/api/property-appliances"],
  });

  const { data: repairs = [], isLoading: repairsLoading } = useQuery({
    queryKey: ["/api/appliance-repairs"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/property-appliances/analytics"],
  });

  // Forms
  const applianceForm = useForm({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      propertyId: 0,
      applianceType: "",
      brand: "",
      model: "",
      serialNumber: "",
      installDate: "",
      warrantyExpiry: "",
      notes: "",
    },
  });

  const repairForm = useForm({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      applianceId: 0,
      issueReported: "",
      fixDescription: "",
      technicianName: "",
      repairCost: 0,
      receiptUrl: "",
      repairedAt: "",
    },
  });

  // Mutations
  const createApplianceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/property-appliances", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-appliances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-appliances/analytics"] });
      setShowApplianceDialog(false);
      applianceForm.reset();
      toast({ title: "Success", description: "Appliance added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add appliance", variant: "destructive" });
    },
  });

  const updateApplianceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/property-appliances/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-appliances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-appliances/analytics"] });
      setShowApplianceDialog(false);
      setEditingAppliance(null);
      applianceForm.reset();
      toast({ title: "Success", description: "Appliance updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update appliance", variant: "destructive" });
    },
  });

  const deleteApplianceMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/property-appliances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-appliances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-appliances/analytics"] });
      toast({ title: "Success", description: "Appliance deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete appliance", variant: "destructive" });
    },
  });

  const createRepairMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/appliance-repairs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appliance-repairs"] });
      setShowRepairDialog(false);
      repairForm.reset();
      toast({ title: "Success", description: "Repair record added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add repair record", variant: "destructive" });
    },
  });

  const updateRepairMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/appliance-repairs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appliance-repairs"] });
      setShowRepairDialog(false);
      setEditingRepair(null);
      repairForm.reset();
      toast({ title: "Success", description: "Repair record updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update repair record", variant: "destructive" });
    },
  });

  const deleteRepairMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/appliance-repairs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appliance-repairs"] });
      toast({ title: "Success", description: "Repair record deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete repair record", variant: "destructive" });
    },
  });

  // Handlers
  const handleAddAppliance = () => {
    setEditingAppliance(null);
    applianceForm.reset();
    setShowApplianceDialog(true);
  };

  const handleEditAppliance = (appliance: any) => {
    setEditingAppliance(appliance);
    applianceForm.reset({
      propertyId: appliance.propertyId,
      applianceType: appliance.applianceType,
      brand: appliance.brand || "",
      model: appliance.model || "",
      serialNumber: appliance.serialNumber || "",
      installDate: appliance.installDate || "",
      warrantyExpiry: appliance.warrantyExpiry || "",
      notes: appliance.notes || "",
    });
    setShowApplianceDialog(true);
  };

  const handleDeleteAppliance = (id: number) => {
    if (confirm("Are you sure you want to delete this appliance?")) {
      deleteApplianceMutation.mutate(id);
    }
  };

  const handleAddRepair = () => {
    setEditingRepair(null);
    repairForm.reset();
    setShowRepairDialog(true);
  };

  const handleEditRepair = (repair: any) => {
    setEditingRepair(repair);
    repairForm.reset({
      applianceId: repair.applianceId,
      issueReported: repair.issueReported,
      fixDescription: repair.fixDescription || "",
      technicianName: repair.technicianName || "",
      repairCost: parseFloat(repair.repairCost || "0"),
      receiptUrl: repair.receiptUrl || "",
      repairedAt: repair.repairedAt || "",
    });
    setShowRepairDialog(true);
  };

  const handleDeleteRepair = (id: number) => {
    if (confirm("Are you sure you want to delete this repair record?")) {
      deleteRepairMutation.mutate(id);
    }
  };

  const onSubmitAppliance = (data: any) => {
    if (editingAppliance) {
      updateApplianceMutation.mutate({ id: editingAppliance.id, data });
    } else {
      createApplianceMutation.mutate(data);
    }
  };

  const onSubmitRepair = (data: any) => {
    if (editingRepair) {
      updateRepairMutation.mutate({ id: editingRepair.id, data });
    } else {
      createRepairMutation.mutate(data);
    }
  };

  // Show loading state
  if (propertiesLoading || appliancesLoading || repairsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter appliances
  const filteredAppliances = appliances.filter((appliance: any) => {
    const matchesSearch = appliance.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appliance.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appliance.applianceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProperty = selectedProperty === "all" || appliance.propertyId?.toString() === selectedProperty;
    
    return matchesSearch && matchesProperty;
  });

  // Get property name
  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  // Get appliance name for repairs table
  const getApplianceName = (applianceId: number) => {
    const appliance = appliances.find((a: any) => a.id === applianceId);
    if (!appliance) return "Unknown Appliance";
    return `${appliance.applianceType} - ${appliance.brand} ${appliance.model}`;
  };

  // Get warranty status
  const getWarrantyStatus = (warrantyExpiry: string | null) => {
    if (!warrantyExpiry) return null;
    
    const now = new Date();
    const expiry = new Date(warrantyExpiry);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "expired", days: Math.abs(diffDays) };
    } else if (diffDays <= 30) {
      return { status: "expiring", days: diffDays };
    } else {
      return { status: "active", days: diffDays };
    }
  };

  // Calculate stats
  const totalAppliances = appliances.length;
  const totalCost = repairs.reduce((sum: number, repair: any) => sum + (repair.repairCost || 0), 0);
  const warrantyExpiring = appliances.filter((a: any) => {
    const status = getWarrantyStatus(a.warrantyExpiry);
    return status && (status.status === "expiring" || status.status === "expired");
  }).length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Appliances Management</h1>
          <p className="text-gray-600 mt-1">Track appliances, warranties, and repair history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddAppliance} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Appliance
          </Button>
          <Button onClick={handleAddRepair} variant="outline">
            <Wrench className="w-4 h-4 mr-2" />
            Add Repair
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appliances">Appliances</TabsTrigger>
          <TabsTrigger value="repairs">Repair History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appliances</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAppliances}</div>
                <p className="text-xs text-muted-foreground">Across all properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Repair Costs</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
                <p className="text-xs text-muted-foreground">All-time repair expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warranty Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warrantyExpiring}</div>
                <p className="text-xs text-muted-foreground">Expired or expiring soon</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest appliance installations and repairs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairs.slice(0, 3).map((repair: any) => (
                  <div key={repair.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Wrench className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{getApplianceName(repair.applianceId)}</p>
                        <p className="text-sm text-gray-600">{repair.issueReported}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(repair.repairCost)}</p>
                      <p className="text-sm text-gray-600">{repair.repairedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appliances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appliances</CardTitle>
              <CardDescription>Manage property appliances and warranties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search appliances..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Properties</option>
                  {properties.map((property: any) => (
                    <option key={property.id} value={property.id.toString()}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appliance</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Brand & Model</TableHead>
                      <TableHead>Warranty Status</TableHead>
                      <TableHead>Install Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppliances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <Wrench className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                            <p>No appliances found</p>
                            <p className="text-sm">Add appliances to start tracking them</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppliances.map((appliance: any) => {
                        const warrantyStatus = getWarrantyStatus(appliance.warrantyExpiry);
                        return (
                          <TableRow key={appliance.id}>
                            <TableCell className="font-medium">{appliance.applianceType}</TableCell>
                            <TableCell>{getPropertyName(appliance.propertyId)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{appliance.brand}</p>
                                <p className="text-sm text-gray-600">{appliance.model}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {warrantyStatus ? (
                                <Badge
                                  variant={
                                    warrantyStatus.status === "expired" ? "destructive" :
                                    warrantyStatus.status === "expiring" ? "secondary" : "default"
                                  }
                                >
                                  {warrantyStatus.status === "expired" ? "Expired" :
                                   warrantyStatus.status === "expiring" ? `Expires in ${warrantyStatus.days} days` :
                                   "Active"}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">No warranty</span>
                              )}
                            </TableCell>
                            <TableCell>{appliance.installDate || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditAppliance(appliance)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteAppliance(appliance.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repairs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repair History</CardTitle>
              <CardDescription>Track maintenance and repair records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appliance</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repairs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <Calendar className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                            <p>No repair records found</p>
                            <p className="text-sm">Repair history will appear here</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      repairs.map((repair: any) => (
                        <TableRow key={repair.id}>
                          <TableCell className="font-medium">
                            {getApplianceName(repair.applianceId)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{repair.issueReported}</p>
                              {repair.fixDescription && (
                                <p className="text-sm text-gray-600">{repair.fixDescription}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{repair.technicianName || "N/A"}</TableCell>
                          <TableCell className="font-medium">
                            {repair.repairCost ? formatCurrency(repair.repairCost) : "N/A"}
                          </TableCell>
                          <TableCell>{repair.repairedAt || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditRepair(repair)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteRepair(repair.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appliance Types</CardTitle>
                <CardDescription>Distribution by appliance type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(appliances.map((a: any) => a.applianceType))).map((type) => {
                    const count = appliances.filter((a: any) => a.applianceType === type).length;
                    const percentage = (count / appliances.length) * 100;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repair Costs by Property</CardTitle>
                <CardDescription>Total repair expenses per property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.map((property: any) => {
                    const propertyAppliances = appliances.filter((a: any) => a.propertyId === property.id);
                    const propertyRepairs = repairs.filter((r: any) => 
                      propertyAppliances.some((a: any) => a.id === r.applianceId)
                    );
                    const totalCost = propertyRepairs.reduce((sum: number, r: any) => sum + (r.repairCost || 0), 0);
                    
                    return (
                      <div key={property.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{property.name}</span>
                        <span className="text-sm font-medium">{formatCurrency(totalCost)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Appliance Dialog */}
      <Dialog open={showApplianceDialog} onOpenChange={setShowApplianceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAppliance ? "Edit Appliance" : "Add New Appliance"}
            </DialogTitle>
          </DialogHeader>
          <Form {...applianceForm}>
            <form onSubmit={applianceForm.handleSubmit(onSubmitAppliance)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={applianceForm.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
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
                  control={applianceForm.control}
                  name="applianceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appliance Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Air Conditioner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={applianceForm.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Daikin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={applianceForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., FTXS25K" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={applianceForm.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., DAI-2024-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={applianceForm.control}
                  name="installDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Install Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={applianceForm.control}
                name="warrantyExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Expiry</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={applianceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowApplianceDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createApplianceMutation.isPending || updateApplianceMutation.isPending}>
                  {createApplianceMutation.isPending || updateApplianceMutation.isPending ? "Saving..." : 
                   editingAppliance ? "Update Appliance" : "Add Appliance"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Repair Dialog */}
      <Dialog open={showRepairDialog} onOpenChange={setShowRepairDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRepair ? "Edit Repair Record" : "Add New Repair Record"}
            </DialogTitle>
          </DialogHeader>
          <Form {...repairForm}>
            <form onSubmit={repairForm.handleSubmit(onSubmitRepair)} className="space-y-4">
              <FormField
                control={repairForm.control}
                name="applianceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appliance</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select appliance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appliances.map((appliance: any) => (
                          <SelectItem key={appliance.id} value={appliance.id.toString()}>
                            {appliance.applianceType} - {appliance.brand} {appliance.model} ({getPropertyName(appliance.propertyId)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={repairForm.control}
                name="issueReported"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Reported</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe the issue..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={repairForm.control}
                name="fixDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fix Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe what was done to fix the issue..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={repairForm.control}
                  name="technicianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technician Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Somchai Repair Service" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={repairForm.control}
                  name="repairCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repair Cost (THB)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={repairForm.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Link to receipt/invoice" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={repairForm.control}
                  name="repairedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repair Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowRepairDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRepairMutation.isPending || updateRepairMutation.isPending}>
                  {createRepairMutation.isPending || updateRepairMutation.isPending ? "Saving..." : 
                   editingRepair ? "Update Repair" : "Add Repair"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}