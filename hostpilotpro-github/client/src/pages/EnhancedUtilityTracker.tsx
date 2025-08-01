import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Plus, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Bell,
  Filter,
  Download,
  Eye,
  Home,
  Building,
  Receipt,
  CreditCard,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

// Enhanced schemas
const propertyUtilitySettingSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  utilityType: z.enum(["electricity", "water", "internet", "gas", "custom"]),
  provider: z.string().min(1, "Provider is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  contractPackage: z.string().optional(),
  billArrivalDay: z.number().min(1).max(31),
  customTitle: z.string().optional(),
  customType: z.string().optional(),
  isActive: z.boolean().default(true),
});

const billUploadSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  utilityAccountId: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("THB"),
  dueDate: z.string().min(1, "Due date is required"),
  billPeriodStart: z.string().optional(),
  billPeriodEnd: z.string().optional(),
  notes: z.string().optional(),
  responsibleParty: z.enum(["owner", "company"]).default("owner"),
});

const paymentConfirmationSchema = z.object({
  billId: z.string().min(1, "Bill ID is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PropertyUtilitySettingData = z.infer<typeof propertyUtilitySettingSchema>;
type BillUploadData = z.infer<typeof billUploadSchema>;
type PaymentConfirmationData = z.infer<typeof paymentConfirmationSchema>;

// Utility provider options by country
const utilityProviders = {
  TH: {
    electricity: ["PEA (Provincial Electricity Authority)", "MEA (Metropolitan Electricity Authority)", "EGAT", "Other"],
    water: ["Deepwell", "Local Authority", "Water Authority", "Private Well", "Other"],
    internet: ["AIS", "True", "3BB", "NT", "CAT", "TOT", "Dtac", "Other"],
    gas: ["PTT Gas", "OR Gas", "Shell Gas", "Local Provider", "Other"],
  },
  AU: {
    electricity: ["AGL", "Origin Energy", "EnergyAustralia", "Red Energy", "Other"],
    water: ["Sydney Water", "Melbourne Water", "SA Water", "Water Corporation", "Other"],
    internet: ["Telstra", "Optus", "TPG", "Vodafone", "NBN Co", "Other"],
    gas: ["AGL", "Origin Energy", "EnergyAustralia", "Other"],
  }
};

function EnhancedUtilityTracker() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUtilityType, setFilterUtilityType] = useState<string>("all");
  const [isPropertySettingsOpen, setIsPropertySettingsOpen] = useState(false);
  const [isBillUploadOpen, setIsBillUploadOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [country] = useState("TH"); // Default to Thailand
  const { toast } = useToast();

  // Fetch data
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: utilityAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/utility-accounts"],
  });

  const { data: utilityBills = [], isLoading: billsLoading } = useQuery({
    queryKey: ["/api/utility-bills"],
  });

  const { data: utilityReminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/utility-reminders"],
  });

  const { data: utilityStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/utility-stats"],
  });

  // Forms
  const propertySettingsForm = useForm<PropertyUtilitySettingData>({
    resolver: zodResolver(propertyUtilitySettingSchema),
    defaultValues: {
      utilityType: "electricity",
      billArrivalDay: 15,
      isActive: true,
    },
  });

  const billUploadForm = useForm<BillUploadData>({
    resolver: zodResolver(billUploadSchema),
    defaultValues: {
      currency: "THB",
      responsibleParty: "owner",
    },
  });

  const paymentForm = useForm<PaymentConfirmationData>({
    resolver: zodResolver(paymentConfirmationSchema),
  });

  // Mutations
  const createUtilityAccountMutation = useMutation({
    mutationFn: async (data: PropertyUtilitySettingData) => {
      return await apiRequest("POST", "/api/utility-accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-accounts"] });
      setIsPropertySettingsOpen(false);
      propertySettingsForm.reset();
      toast({ title: "Utility account created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating utility account", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const uploadBillMutation = useMutation({
    mutationFn: async (data: BillUploadData & { file?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'file' && value) {
          formData.append(key, value.toString());
        }
      });
      if (data.file) {
        formData.append('file', data.file);
      }
      return await apiRequest("POST", "/api/utility-bills", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/utility-stats"] });
      setIsBillUploadOpen(false);
      billUploadForm.reset();
      toast({ title: "Bill uploaded successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error uploading bill", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (data: PaymentConfirmationData) => {
      return await apiRequest("POST", `/api/utility-bills/${data.billId}/confirm-payment`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/utility-stats"] });
      setIsPaymentConfirmOpen(false);
      paymentForm.reset();
      setSelectedBill(null);
      toast({ title: "Payment confirmed successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error confirming payment", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Filter utility bills
  const filteredBills = utilityBills.filter((bill: any) => {
    const propertyMatch = !selectedProperty || bill.propertyId.toString() === selectedProperty;
    const statusMatch = filterStatus === "all" || bill.status === filterStatus;
    const typeMatch = filterUtilityType === "all" || bill.type === filterUtilityType;
    return propertyMatch && statusMatch && typeMatch;
  });

  // Get utility icon
  const getUtilityIcon = (type: string) => {
    switch (type) {
      case "electricity": return <Zap className="w-4 h-4" />;
      case "water": return <Droplets className="w-4 h-4" />;
      case "internet": return <Wifi className="w-4 h-4" />;
      case "gas": return <DollarSign className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      uploaded: { variant: "default", icon: <Upload className="w-3 h-3" /> },
      paid: { variant: "secondary", icon: <CheckCircle className="w-3 h-3" /> },
      overdue: { variant: "destructive", icon: <AlertCircle className="w-3 h-3" /> },
    };
    
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utility Tracker</h1>
          <p className="text-muted-foreground">
            Manage utility bills, providers, and automated reminders across all properties
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsPropertySettingsOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Property Settings
          </Button>
          <Button 
            onClick={() => setIsBillUploadOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Bill
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Utility Accounts
          </TabsTrigger>
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Bills & Payments
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Reminders
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Bills</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{utilityStats?.totalBills || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across {properties.length} properties
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {utilityStats?.pendingBills || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting upload
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {utilityStats?.overdueBills || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Need immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{utilityStats?.monthlyTotal?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current month utilities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick alerts for overdue bills */}
          {utilityStats?.overdueBills > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You have {utilityStats.overdueBills} overdue utility bills requiring immediate attention.
                Check the Bills & Payments tab to resolve these issues.
              </AlertDescription>
            </Alert>
          )}

          {/* Recent bill activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bill Activity</CardTitle>
              <CardDescription>Latest utility bill uploads and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBills.slice(0, 5).map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getUtilityIcon(bill.type)}
                      <div>
                        <div className="font-medium">{bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}</div>
                        <div className="text-sm text-muted-foreground">
                          Property: {properties.find((p: any) => p.id === bill.propertyId)?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium">฿{parseFloat(bill.amount || "0").toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{bill.dueDate}</div>
                      </div>
                      {getStatusBadge(bill.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Utility Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Property Utility Accounts</h2>
            <Button onClick={() => setIsPropertySettingsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>

          <div className="space-y-4">
            {properties.map((property: any) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {property.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["electricity", "water", "internet", "gas"].map((utilityType) => {
                      const account = utilityAccounts.find((acc: any) => 
                        acc.propertyId === property.id && acc.utilityType === utilityType
                      );
                      
                      return (
                        <div key={utilityType} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getUtilityIcon(utilityType)}
                            <span className="font-medium capitalize">{utilityType}</span>
                          </div>
                          
                          {account ? (
                            <div className="space-y-1 text-sm">
                              <div><strong>Provider:</strong> {account.provider}</div>
                              <div><strong>Account:</strong> {account.accountNumber}</div>
                              <div><strong>Bill Day:</strong> {account.expectedBillDay}</div>
                              {account.packageInfo && (
                                <div><strong>Package:</strong> {account.packageInfo}</div>
                              )}
                              <Badge variant={account.isActive ? "secondary" : "destructive"}>
                                {account.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              No account configured
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 w-full"
                                onClick={() => {
                                  propertySettingsForm.setValue("propertyId", property.id.toString());
                                  propertySettingsForm.setValue("utilityType", utilityType as any);
                                  setIsPropertySettingsOpen(true);
                                }}
                              >
                                Setup Account
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bills & Payments Tab */}
        <TabsContent value="bills" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bills & Payments</h2>
            <div className="flex gap-2">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Properties</SelectItem>
                  {properties.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterUtilityType} onValueChange={setFilterUtilityType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Utility</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill: any) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        {properties.find((p: any) => p.id === bill.propertyId)?.name}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getUtilityIcon(bill.type)}
                        {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}
                      </TableCell>
                      <TableCell>{bill.provider}</TableCell>
                      <TableCell>฿{parseFloat(bill.amount || "0").toLocaleString()}</TableCell>
                      <TableCell>{bill.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {bill.status === "uploaded" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBill(bill);
                                paymentForm.setValue("billId", bill.id.toString());
                                setIsPaymentConfirmOpen(true);
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Paid
                            </Button>
                          )}
                          {bill.receiptUrl && (
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6">
          <h2 className="text-xl font-semibold">Automated Reminders</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Active Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utilityReminders.map((reminder: any) => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{reminder.reminderType}</div>
                        <div className="text-sm text-muted-foreground">{reminder.reminderMessage}</div>
                      </div>
                      <Badge variant={reminder.isRead ? "secondary" : "default"}>
                        {reminder.isRead ? "Read" : "Unread"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reminder Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Bill arrival notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Alert when bills are expected
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">4-day overdue reminders</div>
                      <div className="text-sm text-muted-foreground">
                        Send alerts for missing bills
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Payment confirmations</div>
                      <div className="text-sm text-muted-foreground">
                        Notify when payments are processed
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Property Settings Dialog */}
      <Dialog open={isPropertySettingsOpen} onOpenChange={setIsPropertySettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Property Utility Settings</DialogTitle>
            <DialogDescription>
              Configure utility providers and account details for property-specific billing
            </DialogDescription>
          </DialogHeader>
          
          <Form {...propertySettingsForm}>
            <form onSubmit={propertySettingsForm.handleSubmit((data) => createUtilityAccountMutation.mutate(data))} className="space-y-4">
              <FormField
                control={propertySettingsForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                control={propertySettingsForm.control}
                name="utilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utility Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select utility type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="internet">Internet</SelectItem>
                        <SelectItem value="gas">Gas</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={propertySettingsForm.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertySettingsForm.watch("utilityType") && 
                         utilityProviders[country as keyof typeof utilityProviders]?.[propertySettingsForm.watch("utilityType") as keyof typeof utilityProviders.TH]?.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
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
                  control={propertySettingsForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={propertySettingsForm.control}
                  name="billArrivalDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Arrival Day</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="31" 
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {propertySettingsForm.watch("utilityType") === "internet" && (
                <FormField
                  control={propertySettingsForm.control}
                  name="contractPackage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Package</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 100/50 Mbps Fiber" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {propertySettingsForm.watch("utilityType") === "custom" && (
                <FormField
                  control={propertySettingsForm.control}
                  name="customTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Pest Control, Residence Fee" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPropertySettingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createUtilityAccountMutation.isPending}>
                  {createUtilityAccountMutation.isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bill Upload Dialog */}
      <Dialog open={isBillUploadOpen} onOpenChange={setIsBillUploadOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Utility Bill</DialogTitle>
            <DialogDescription>
              Upload a utility bill and set payment responsibility
            </DialogDescription>
          </DialogHeader>
          
          <Form {...billUploadForm}>
            <form onSubmit={billUploadForm.handleSubmit((data) => uploadBillMutation.mutate(data))} className="space-y-4">
              <FormField
                control={billUploadForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  control={billUploadForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={billUploadForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                          <SelectItem value="AUD">AUD (Australian Dollar)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={billUploadForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={billUploadForm.control}
                name="responsibleParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsible Party</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Owner (Charge to owner)</SelectItem>
                        <SelectItem value="company">Company (Company expense)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={billUploadForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about this bill..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload bill receipt or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsBillUploadOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadBillMutation.isPending}>
                  {uploadBillMutation.isPending ? "Uploading..." : "Upload Bill"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={isPaymentConfirmOpen} onOpenChange={setIsPaymentConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Mark this bill as paid and upload payment receipt
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                {getUtilityIcon(selectedBill.type)}
                <span className="font-medium">{selectedBill.type.charAt(0).toUpperCase() + selectedBill.type.slice(1)}</span>
              </div>
              <div className="text-sm space-y-1">
                <div>Amount: ฿{parseFloat(selectedBill.amount || "0").toLocaleString()}</div>
                <div>Due Date: {selectedBill.dueDate}</div>
                <div>Property: {properties.find((p: any) => p.id === selectedBill.propertyId)?.name}</div>
              </div>
            </div>
          )}
          
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit((data) => confirmPaymentMutation.mutate(data))} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="online_banking">Online Banking</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="auto_debit">Auto Debit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="receiptNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter receipt number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Payment confirmation notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Upload payment receipt (Optional)
                </p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPaymentConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={confirmPaymentMutation.isPending}>
                  {confirmPaymentMutation.isPending ? "Confirming..." : "Confirm Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnhancedUtilityTracker;