import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Wrench, Calendar, AlertTriangle, DollarSign, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { SPEED_QUERY_OPTIONS } from "@/lib/speedOptimizer";

// Mock data for demo purposes while backend is being set up
const mockAppliances = [
  {
    id: 1,
    propertyId: 1,
    applianceType: "Air Conditioner",
    brand: "Daikin",
    model: "FTXS25K",
    serialNumber: "DAI-2024-001",
    installDate: "2024-01-15",
    warrantyExpiry: "2027-01-15",
    notes: "Main living room AC unit"
  },
  {
    id: 2,
    propertyId: 1,
    applianceType: "Refrigerator",
    brand: "Samsung",
    model: "RT32K5032S8",
    serialNumber: "SAM-2024-002",
    installDate: "2024-02-10",
    warrantyExpiry: "2026-02-10",
    notes: "Kitchen refrigerator"
  },
  {
    id: 3,
    propertyId: 2,
    applianceType: "Washing Machine",
    brand: "LG",
    model: "T2108VSAM",
    serialNumber: "LG-2024-003",
    installDate: "2024-03-05",
    warrantyExpiry: "2025-03-05",
    notes: "Utility room washing machine"
  }
];

const mockRepairs = [
  {
    id: 1,
    applianceId: 1,
    issueReported: "AC not cooling properly",
    fixDescription: "Cleaned filters and recharged refrigerant",
    technicianName: "Somchai Repair Service",
    repairCost: 2500,
    receiptUrl: "",
    repairedAt: "2024-06-15"
  },
  {
    id: 2,
    applianceId: 2,
    issueReported: "Refrigerator making noise",
    fixDescription: "Replaced compressor motor",
    technicianName: "Bangkok Appliance Fix",
    repairCost: 4500,
    receiptUrl: "",
    repairedAt: "2024-05-20"
  }
];

const mockProperties = [
  { id: 1, name: "Villa Samui Breeze" },
  { id: 2, name: "Villa Ocean View" },
  { id: 3, name: "Villa Aruna Demo" },
  { id: 4, name: "Villa Tropical Paradise" }
];

export default function PropertyAppliancesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use mock data while backend endpoints are being set up
  const { data: properties = mockProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    ...SPEED_QUERY_OPTIONS,
  });

  const { data: appliances = mockAppliances, isLoading: appliancesLoading } = useQuery({
    queryKey: ["/api/appliances"],
    queryFn: () => mockAppliances, // Use mock data for now
    ...SPEED_QUERY_OPTIONS,
  });

  const { data: repairs = mockRepairs, isLoading: repairsLoading } = useQuery({
    queryKey: ["/api/appliance-repairs"],
    queryFn: () => mockRepairs, // Use mock data for now
    ...SPEED_QUERY_OPTIONS,
  });

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

  // Get appliance name
  const getApplianceName = (applianceId: number) => {
    const appliance = appliances.find((a: any) => a.id === applianceId);
    return appliance ? `${appliance.applianceType} - ${appliance.brand || "Unknown Brand"}` : "Unknown Appliance";
  };

  // Check warranty status
  const getWarrantyStatus = (warrantyExpiry: string) => {
    if (!warrantyExpiry) return null;
    const now = new Date();
    const expiry = new Date(warrantyExpiry);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: "expired", days: Math.abs(diffDays) };
    if (diffDays <= 30) return { status: "expiring", days: diffDays };
    return { status: "active", days: diffDays };
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
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Appliance
          </Button>
          <Button variant="outline">
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
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button variant="ghost" size="sm">Delete</Button>
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
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="sm">Delete</Button>
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
    </div>
  );
}