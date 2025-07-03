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
  Archive,
  Filter,
  Download,
  Eye,
  Home,
  Building,
  Receipt,
  CreditCard,
  Trash2
} from "lucide-react";

// Utility type schema
const utilityTypeSchema = z.object({
  type: z.string().min(1, "Utility type is required"),
  provider: z.string().min(1, "Provider is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  billArrivalDay: z.string().min(1, "Bill arrival day is required"),
  contractPackage: z.string().optional(),
  customTitle: z.string().optional(),
});

// Bill upload schema
const billUploadSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  utilityType: z.string().min(1, "Utility type is required"),
  amount: z.string().min(1, "Amount is required"),
  billDate: z.string().min(1, "Bill date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

type UtilityTypeData = z.infer<typeof utilityTypeSchema>;
type BillUploadData = z.infer<typeof billUploadSchema>;

function UtilityTracker() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isBillUploadDialogOpen, setIsBillUploadDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedUtilityType, setSelectedUtilityType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Fetch utilities overview
  const { data: utilitiesOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/utilities-overview"],
  });

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch utility bills
  const { data: utilityBills, isLoading: billsLoading } = useQuery({
    queryKey: ["/api/utility-bills"],
  });

  // Fetch utility reminders
  const { data: utilityReminders, isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/utility-reminders"],
  });

  // Upload bill mutation
  const uploadBillMutation = useMutation({
    mutationFn: async (data: BillUploadData & { file?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'file' && value) {
          formData.append(key, value);
        }
      });
      if (data.file) {
        formData.append('billFile', data.file);
      }
      return apiRequest("POST", "/api/utility-bills", formData);
    },
    onSuccess: () => {
      toast({
        title: "Bill Uploaded",
        description: "Utility bill uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/utilities-overview"] });
      setIsBillUploadDialogOpen(false);
      billForm.reset();
      setUploadedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload bill",
        variant: "destructive",
      });
    },
  });

  // Mark bill as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: async ({ billId, receiptFile }: { billId: number; receiptFile?: File }) => {
      const formData = new FormData();
      formData.append('status', 'paid');
      if (receiptFile) {
        formData.append('receiptFile', receiptFile);
      }
      return apiRequest("PUT", `/api/utility-bills/${billId}`, formData);
    },
    onSuccess: () => {
      toast({
        title: "Payment Confirmed",
        description: "Bill marked as paid successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/utilities-overview"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark bill as paid",
        variant: "destructive",
      });
    },
  });

  // Configure utility mutation
  const configureUtilityMutation = useMutation({
    mutationFn: async (data: { propertyId: number; utilities: UtilityTypeData[] }) => {
      return apiRequest("POST", "/api/property-utilities", data);
    },
    onSuccess: () => {
      toast({
        title: "Utilities Configured",
        description: "Property utilities configured successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/utilities-overview"] });
      setIsSettingsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to configure utilities",
        variant: "destructive",
      });
    },
  });

  const billForm = useForm<BillUploadData>({
    resolver: zodResolver(billUploadSchema),
    defaultValues: {
      propertyId: "",
      utilityType: "",
      amount: "",
      billDate: "",
      dueDate: "",
      notes: "",
    },
  });

  const onUploadBill = (data: BillUploadData) => {
    uploadBillMutation.mutate({ ...data, file: uploadedFile || undefined });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date();
    
    if (status === "paid") {
      return <Badge className="bg-green-500 text-white">Paid</Badge>;
    } else if (isOverdue) {
      return <Badge className="bg-red-500 text-white">Overdue</Badge>;
    } else if (status === "uploaded") {
      return <Badge className="bg-blue-500 text-white">Pending Payment</Badge>;
    } else {
      return <Badge className="bg-yellow-500 text-white">Awaiting Bill</Badge>;
    }
  };

  const getUtilityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "electricity":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "water":
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case "internet":
        return <Wifi className="h-5 w-5 text-purple-500" />;
      default:
        return <Home className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Utility Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track electricity, water, internet, and custom utility bills across all properties
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bills & Payments
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Properties Utility Overview</h2>
              <div className="flex gap-2">
                <Dialog open={isBillUploadDialogOpen} onOpenChange={setIsBillUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Utility Bill</DialogTitle>
                      <DialogDescription>
                        Upload a new utility bill and payment details
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...billForm}>
                      <form onSubmit={billForm.handleSubmit(onUploadBill)} className="space-y-4">
                        <FormField
                          control={billForm.control}
                          name="propertyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {properties?.map((property: any) => (
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
                          control={billForm.control}
                          name="utilityType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Utility Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                  <SelectItem value="pest_control">Pest Control</SelectItem>
                                  <SelectItem value="residence_fee">Residence Fee</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={billForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (THB)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={billForm.control}
                            name="billDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bill Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={billForm.control}
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
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Bill File</label>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="cursor-pointer"
                          />
                          {uploadedFile && (
                            <p className="text-sm text-gray-600 mt-1">
                              Selected: {uploadedFile.name}
                            </p>
                          )}
                        </div>

                        <FormField
                          control={billForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Additional notes about this bill..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsBillUploadDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={uploadBillMutation.isPending}
                          >
                            {uploadBillMutation.isPending ? "Uploading..." : "Upload Bill"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configure Utilities
                </Button>
              </div>
            </div>

            {overviewLoading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin mr-2" />
                Loading utilities overview...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties?.map((property: any) => (
                  <Card key={property.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {property.name}
                      </CardTitle>
                      <CardDescription>
                        {property.bedrooms} bed • {property.bathrooms} bath
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Demo utility data */}
                      {[
                        { type: "electricity", provider: "PEA", amount: "3,200", status: "paid", dueDate: "2024-01-15" },
                        { type: "water", provider: "Local Authority", amount: "450", status: "uploaded", dueDate: "2024-01-20" },
                        { type: "internet", provider: "AIS Fiber", amount: "1,200", status: "awaiting", dueDate: "2024-01-25" },
                      ].map((utility, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getUtilityIcon(utility.type)}
                            <div>
                              <p className="font-medium capitalize">{utility.type}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{utility.provider}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₿{utility.amount}</p>
                            {getStatusBadge(utility.status, utility.dueDate)}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bills & Payments Tab */}
          <TabsContent value="bills" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bills & Payments</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {billsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin mr-2" />
                Loading bills...
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Property</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Utility</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {/* Demo bill data */}
                        {[
                          { 
                            id: 1,
                            property: "Villa Moonlight", 
                            utility: "Electricity", 
                            provider: "PEA",
                            amount: "3,200", 
                            dueDate: "2024-01-15", 
                            status: "uploaded",
                            billFile: "electricity_dec_2023.pdf"
                          },
                          { 
                            id: 2,
                            property: "Villa Sunshine", 
                            utility: "Water", 
                            provider: "Local Authority",
                            amount: "450", 
                            dueDate: "2024-01-20", 
                            status: "paid",
                            billFile: "water_dec_2023.pdf"
                          },
                          { 
                            id: 3,
                            property: "Villa Paradise", 
                            utility: "Internet", 
                            provider: "AIS Fiber",
                            amount: "1,200", 
                            dueDate: "2024-01-25", 
                            status: "awaiting",
                            billFile: null
                          },
                        ].map((bill) => (
                          <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{bill.property}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getUtilityIcon(bill.utility)}
                                <div>
                                  <p className="font-medium">{bill.utility}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{bill.provider}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold">₿{bill.amount}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(bill.dueDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(bill.status, bill.dueDate)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {bill.billFile && (
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                )}
                                {bill.status === "uploaded" && (
                                  <Button 
                                    size="sm"
                                    onClick={() => markPaidMutation.mutate({ billId: bill.id })}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Paid
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Reminders
                </CardTitle>
                <CardDescription>
                  Automated notifications for overdue and missing bills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Demo reminder data */}
                  {[
                    {
                      id: 1,
                      property: "Villa Moonlight",
                      utility: "Electricity",
                      type: "overdue",
                      days: 3,
                      expectedDate: "2024-01-14",
                      message: "Bill expected 3 days ago"
                    },
                    {
                      id: 2,
                      property: "Villa Paradise",
                      utility: "Water",
                      type: "due_soon",
                      days: 2,
                      expectedDate: "2024-01-18",
                      message: "Bill expected in 2 days"
                    }
                  ].map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          reminder.type === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium">{reminder.property} - {reminder.utility}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{reminder.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reminder.type === 'overdue' ? 'destructive' : 'default'}>
                          {reminder.type === 'overdue' ? 'Overdue' : 'Due Soon'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">₿45,250</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pending Bills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">12</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting upload</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Overdue Bills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">3</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Need attention</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Utility Expense Breakdown</CardTitle>
                <CardDescription>Monthly expenses by utility type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Electricity", amount: "28,500", percentage: 63, color: "bg-yellow-500" },
                    { type: "Water", amount: "8,200", percentage: 18, color: "bg-blue-500" },
                    { type: "Internet", amount: "6,400", percentage: 14, color: "bg-purple-500" },
                    { type: "Other", amount: "2,150", percentage: 5, color: "bg-gray-500" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color}`} />
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold w-20 text-right">₿{item.amount}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// [MERGED] This module has been consolidated into EnhancedUtilityTracker.tsx
// Basic utility tracking functionality is now available in the comprehensive utility management system
export default UtilityTracker;