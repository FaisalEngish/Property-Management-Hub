import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { 
  Droplets, 
  Truck, 
  Building, 
  Factory, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Phone,
  MapPin,
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Timer,
  Zap,
  FileText,
  Star,
  Users,
  BarChart3
} from "lucide-react";

interface WaterSource {
  id: number;
  organizationId: string;
  propertyId: number;
  sourceType: string;
  sourceName: string;
  isActive: boolean;
  isPrimary: boolean;
  billingCycle?: string;
  accountNumber?: string;
  supplierName?: string;
  contactNumber?: string;
  averageCostPerLiter: string;
  currency: string;
  setupDate?: string;
  notes?: string;
  propertyName?: string;
}

interface ConsumptionEntry {
  id: number;
  organizationId: string;
  propertyId: number;
  sourceId: number;
  entryType: string;
  entryDate: string;
  volumeLiters?: number;
  totalCost: string;
  costPerLiter?: string;
  currency: string;
  billDate?: string;
  dueDate?: string;
  billNumber?: string;
  units?: string;
  unitRate?: string;
  supplierName?: string;
  deliveryType?: string;
  driverName?: string;
  truckLicensePlate?: string;
  paidBy?: string;
  paymentStatus: string;
  paidAt?: string;
  isEmergency: boolean;
  urgencyLevel?: string;
  emergencyReason?: string;
  receiptUrl?: string;
  proofOfDeliveryUrl?: string;
  notes?: string;
  propertyName?: string;
  sourceName?: string;
}

interface WaterAlert {
  id: number;
  organizationId: string;
  propertyId: number;
  alertType: string;
  alertMessage: string;
  severity: string;
  triggerCount?: number;
  triggerPeriodDays: number;
  daysSinceLastEntry?: number;
  sourceType?: string;
  recommendations?: string;
  aiGenerated: boolean;
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  notes?: string;
  propertyName?: string;
}

interface WaterSupplier {
  id: number;
  organizationId: string;
  supplierName: string;
  contactPerson?: string;
  phoneNumber?: string;
  alternatePhone?: string;
  email?: string;
  serviceAreas?: string;
  vehicleTypes?: string;
  minimumOrder?: number;
  maximumCapacity?: number;
  pricePerLiter: string;
  emergencyUpcharge?: string;
  currency: string;
  averageResponseTime?: number;
  reliabilityRating?: string;
  totalDeliveries: number;
  isActive: boolean;
  isPreferred: boolean;
  notes?: string;
}

interface WaterSummary {
  totalEntries: number;
  emergencyDeliveries: number;
  totalCost: number;
  averageCostPerLiter: number;
  monthlyBreakdown: Array<{
    month: string;
    totalCost: number;
    totalVolume: number;
    emergencyCount: number;
  }>;
  sourceTypeBreakdown: Array<{
    sourceType: string;
    totalCost: number;
    totalVolume: number;
    entryCount: number;
  }>;
}

export default function WaterUtilityEnhanced() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<WaterSource | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<WaterSupplier | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Demo data queries
  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ["/api/water/sources/demo"],
  });

  const { data: consumptionEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/water/consumption/demo"],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/water/alerts/demo"],
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/water/suppliers/demo"],
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/water/summary"],
    enabled: false, // Use demo data for now
  });

  // Create demo summary from data
  const demoSummary: WaterSummary = {
    totalEntries: consumptionEntries.length || 0,
    emergencyDeliveries: consumptionEntries.filter((entry: ConsumptionEntry) => entry.isEmergency).length || 0,
    totalCost: consumptionEntries.reduce((sum: number, entry: ConsumptionEntry) => sum + parseFloat(entry.totalCost || "0"), 0),
    averageCostPerLiter: 0.052,
    monthlyBreakdown: [
      { month: "2024-12", totalCost: 485.50, totalVolume: 2000, emergencyCount: 0 },
      { month: "2024-11", totalCost: 685.75, totalVolume: 6500, emergencyCount: 3 },
    ],
    sourceTypeBreakdown: [
      { sourceType: "government", totalCost: 485.50, totalVolume: 0, entryCount: 1 },
      { sourceType: "emergency_truck", totalCost: 365.00, totalVolume: 6500, entryCount: 3 },
      { sourceType: "deepwell", totalCost: 320.75, totalVolume: 0, entryCount: 1 },
    ],
  };

  // Forms
  const sourceForm = useForm();
  const entryForm = useForm();
  const supplierForm = useForm();

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'government': return <Building className="h-4 w-4" />;
      case 'deepwell': return <Zap className="h-4 w-4" />;
      case 'emergency_truck': return <Truck className="h-4 w-4" />;
      default: return <Droplets className="h-4 w-4" />;
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'government': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'deepwell': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'emergency_truck': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (sourcesLoading || entriesLoading || alertsLoading || suppliersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Water Utility Management</h1>
          <p className="text-muted-foreground">
            Comprehensive water source tracking, emergency delivery management, and AI-powered alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSourceDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Water Source
          </Button>
          <Button onClick={() => setShowEntryDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Water Sources
          </TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Consumption
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoSummary.totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Deliveries</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{demoSummary.emergencyDeliveries}</div>
                <p className="text-xs text-muted-foreground">
                  🚨 3 in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₿{demoSummary.totalCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +₿200.25 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Cost/Liter</CardTitle>
                <Droplets className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₿{demoSummary.averageCostPerLiter.toFixed(3)}</div>
                <p className="text-xs text-muted-foreground">
                  Mixed sources pricing
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Active Alerts
              </CardTitle>
              <CardDescription>
                Current water utility alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.filter((alert: WaterAlert) => alert.isActive).map((alert: WaterAlert) => (
                <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{alert.alertMessage}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span>• {alert.propertyName}</span>
                          {alert.aiGenerated && <span>• 🤖 AI Generated</span>}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Acknowledge
                      </Button>
                    </div>
                    {alert.recommendations && (
                      <p className="text-sm text-muted-foreground mt-2">
                        💡 {alert.recommendations}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>

          {/* Source Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Water Source Distribution</CardTitle>
              <CardDescription>
                Cost and usage breakdown by source type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoSummary.sourceTypeBreakdown.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getSourceTypeIcon(source.sourceType)}
                      <div>
                        <p className="font-medium capitalize">{source.sourceType.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {source.entryCount} entries
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₿{source.totalCost.toFixed(2)}</p>
                      {source.totalVolume > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {source.totalVolume.toLocaleString()}L
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Water Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source: WaterSource) => (
              <Card key={source.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSourceTypeIcon(source.sourceType)}
                      <div>
                        <CardTitle className="text-lg">{source.sourceName}</CardTitle>
                        <CardDescription>{source.propertyName}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {source.isPrimary && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Primary
                        </Badge>
                      )}
                      <Badge className={getSourceTypeColor(source.sourceType)}>
                        {source.sourceType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Cost/Liter</Label>
                      <p className="font-medium">₿{source.averageCostPerLiter}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${source.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium">{source.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {source.accountNumber && (
                    <div>
                      <Label className="text-muted-foreground">Account Number</Label>
                      <p className="font-medium text-sm">{source.accountNumber}</p>
                    </div>
                  )}
                  
                  {source.contactNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{source.contactNumber}</span>
                    </div>
                  )}
                  
                  {source.billingCycle && (
                    <div>
                      <Label className="text-muted-foreground">Billing Cycle</Label>
                      <p className="font-medium text-sm capitalize">{source.billingCycle}</p>
                    </div>
                  )}
                  
                  {source.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm text-muted-foreground">{source.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSource(source);
                        setShowSourceDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Consumption Tab */}
        <TabsContent value="consumption" className="space-y-6">
          <div className="space-y-4">
            {consumptionEntries.map((entry: ConsumptionEntry) => (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {entry.isEmergency ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      ) : entry.entryType === 'bill' ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Truck className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {entry.entryType === 'bill' ? `Bill - ${entry.billNumber || 'N/A'}` : 
                           entry.entryType === 'emergency_delivery' ? '🚨 Emergency Delivery' :
                           'Water Delivery'}
                        </CardTitle>
                        <CardDescription>
                          {entry.propertyName} • {entry.sourceName}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.isEmergency && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Emergency
                        </Badge>
                      )}
                      <Badge className={getPaymentStatusColor(entry.paymentStatus)}>
                        {entry.paymentStatus}
                      </Badge>
                      {entry.urgencyLevel && (
                        <Badge className={getSeverityColor(entry.urgencyLevel)}>
                          {entry.urgencyLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <p className="font-medium">
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Cost</Label>
                      <p className="font-medium text-lg">₿{entry.totalCost}</p>
                    </div>
                    {entry.volumeLiters && (
                      <div>
                        <Label className="text-muted-foreground">Volume</Label>
                        <p className="font-medium">{entry.volumeLiters.toLocaleString()}L</p>
                      </div>
                    )}
                    {entry.costPerLiter && (
                      <div>
                        <Label className="text-muted-foreground">Cost/Liter</Label>
                        <p className="font-medium">₿{entry.costPerLiter}</p>
                      </div>
                    )}
                  </div>

                  {entry.entryType.includes('delivery') && (
                    <div className="space-y-2">
                      <Label className="font-medium">Delivery Details</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {entry.supplierName && (
                          <div>
                            <Label className="text-muted-foreground">Supplier</Label>
                            <p className="font-medium">{entry.supplierName}</p>
                          </div>
                        )}
                        {entry.driverName && (
                          <div>
                            <Label className="text-muted-foreground">Driver</Label>
                            <p className="font-medium">{entry.driverName}</p>
                          </div>
                        )}
                        {entry.truckLicensePlate && (
                          <div>
                            <Label className="text-muted-foreground">License Plate</Label>
                            <p className="font-medium">{entry.truckLicensePlate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {entry.paidBy && (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Paid By</Label>
                        <p className="font-medium capitalize">{entry.paidBy}</p>
                      </div>
                      {entry.paidAt && (
                        <div>
                          <Label className="text-muted-foreground">Paid On</Label>
                          <p className="font-medium">
                            {new Date(entry.paidAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {entry.emergencyReason && (
                    <Alert className="border-l-4 border-l-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Emergency Reason:</strong> {entry.emergencyReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {entry.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm">{entry.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    {entry.receiptUrl && (
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    )}
                    {entry.proofOfDeliveryUrl && (
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Proof
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map((alert: WaterAlert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div>
                        <CardTitle className="text-lg">{alert.alertType.replace('_', ' ')}</CardTitle>
                        <CardDescription>{alert.propertyName}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.aiGenerated && (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          🤖 AI
                        </Badge>
                      )}
                      {!alert.isActive && (
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{alert.alertMessage}</p>
                  
                  {alert.recommendations && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Recommendations:</strong> {alert.recommendations}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {alert.triggerCount && (
                      <div>
                        <Label className="text-muted-foreground">Trigger Count</Label>
                        <p className="font-medium">{alert.triggerCount}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Period</Label>
                      <p className="font-medium">{alert.triggerPeriodDays} days</p>
                    </div>
                    {alert.daysSinceLastEntry && (
                      <div>
                        <Label className="text-muted-foreground">Days Since Entry</Label>
                        <p className="font-medium">{alert.daysSinceLastEntry}</p>
                      </div>
                    )}
                    {alert.sourceType && (
                      <div>
                        <Label className="text-muted-foreground">Source Type</Label>
                        <p className="font-medium capitalize">{alert.sourceType.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>

                  {alert.acknowledgedBy && alert.acknowledgedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>
                        Acknowledged by {alert.acknowledgedBy} on{' '}
                        {new Date(alert.acknowledgedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    {alert.isActive && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowSupplierDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier: WaterSupplier) => (
              <Card key={supplier.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-lg">{supplier.supplierName}</CardTitle>
                        <CardDescription>{supplier.contactPerson}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {supplier.isPreferred && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Star className="h-3 w-3 mr-1" />
                          Preferred
                        </Badge>
                      )}
                      <div className={`w-2 h-2 rounded-full ${supplier.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Price/Liter</Label>
                      <p className="font-medium">₿{supplier.pricePerLiter}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Emergency Upcharge</Label>
                      <p className="font-medium">{supplier.emergencyUpcharge || '0'}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Response Time</Label>
                      <p className="font-medium">{supplier.averageResponseTime || 'N/A'} hrs</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Rating</Label>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{supplier.reliabilityRating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Min Order</Label>
                      <p className="font-medium">{supplier.minimumOrder?.toLocaleString() || 'N/A'}L</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Max Capacity</Label>
                      <p className="font-medium">{supplier.maximumCapacity?.toLocaleString() || 'N/A'}L</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Total Deliveries</Label>
                    <p className="font-medium">{supplier.totalDeliveries}</p>
                  </div>

                  {supplier.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.phoneNumber}</span>
                    </div>
                  )}

                  {supplier.serviceAreas && (
                    <div>
                      <Label className="text-muted-foreground">Service Areas</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {JSON.parse(supplier.serviceAreas).slice(0, 3).map((area: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {supplier.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm text-muted-foreground">{supplier.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSupplier(supplier);
                        setShowSupplierDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Water Consumption</CardTitle>
                <CardDescription>
                  Last 6 months cost and volume trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoSummary.monthlyBreakdown.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">
                          {month.totalVolume.toLocaleString()}L delivered
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₿{month.totalCost.toFixed(2)}</p>
                        {month.emergencyCount > 0 && (
                          <p className="text-sm text-orange-600">
                            🚨 {month.emergencyCount} emergency
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>
                  Water source cost comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">₿0.009</div>
                      <p className="text-muted-foreground">Government</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₿0.005</div>
                      <p className="text-muted-foreground">Deep Well</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">₿0.055</div>
                      <p className="text-muted-foreground">Emergency</p>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Emergency deliveries cost <strong>11x more</strong> than deep well water. 
                      Consider investing in backup systems to reduce emergency dependency.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>
                Automated analysis of water consumption patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-l-4 border-l-orange-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High Emergency Usage Detected:</strong> Villa Samui Breeze has had 3 emergency water deliveries in the last 30 days, 
                  costing ₿365. This suggests potential issues with the primary municipal water supply.
                </AlertDescription>
              </Alert>
              
              <Alert className="border-l-4 border-l-blue-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cost Optimization Opportunity:</strong> Deep well systems show 45% lower costs than government water. 
                  Consider expanding deep well capacity for properties with high consumption.
                </AlertDescription>
              </Alert>
              
              <Alert className="border-l-4 border-l-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Supplier Performance:</strong> Samui Water Express maintains excellent response times (2 hours average) 
                  and has completed 47 deliveries with 4.5-star rating.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}