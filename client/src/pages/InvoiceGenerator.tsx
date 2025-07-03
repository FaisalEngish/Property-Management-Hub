import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Download, 
  Send, 
  DollarSign, 
  Calendar,
  Receipt,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  RefreshCw,
  Building,
  User,
  Settings,
  Archive,
  Calculator
} from "lucide-react";

const invoiceGenerationSchema = z.object({
  templateId: z.number().optional(),
  senderType: z.string().min(1, "Sender type is required"),
  receiverType: z.string().min(1, "Receiver type is required"),
  senderId: z.string().optional(),
  receiverId: z.string().optional(),
  senderName: z.string().min(1, "Sender name is required"),
  receiverName: z.string().min(1, "Receiver name is required"),
  senderEmail: z.string().email().optional(),
  receiverEmail: z.string().email().optional(),
  periodStart: z.string().min(1, "Start date is required"),
  periodEnd: z.string().min(1, "End date is required"),
  propertyIds: z.array(z.number()).optional(),
  includeBookings: z.boolean().default(true),
  includeAddons: z.boolean().default(true),
  includeCommissions: z.boolean().default(false),
  taxEnabled: z.boolean().default(false),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

type InvoiceGenerationForm = z.infer<typeof invoiceGenerationSchema>;

const templateSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  templateType: z.string().min(1, "Template type is required"),
  defaultSender: z.string().min(1, "Default sender is required"),
  defaultReceiver: z.string().min(1, "Default receiver is required"),
  taxRate: z.number().min(0).max(100).default(0),
  taxEnabled: z.boolean().default(false),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate Invoice Form
  const generateForm = useForm<InvoiceGenerationForm>({
    resolver: zodResolver(invoiceGenerationSchema),
    defaultValues: {
      senderType: "management",
      receiverType: "owner",
      includeBookings: true,
      includeAddons: true,
      includeCommissions: false,
      taxEnabled: false,
      taxRate: 0,
    },
  });

  // Template Form
  const templateForm = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateType: "booking_commission",
      defaultSender: "management",
      defaultReceiver: "owner",
      taxEnabled: false,
      taxRate: 0,
    },
  });

  // Queries
  const { data: invoiceTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/invoice-templates"],
    queryFn: () => apiRequest("GET", "/api/invoice-templates"),
  });

  const { data: generatedInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/generated-invoices", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return apiRequest("GET", `/api/generated-invoices?${params.toString()}`);
    },
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => apiRequest("GET", "/api/properties"),
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("GET", "/api/users"),
  });

  const { data: invoiceAnalytics } = useQuery({
    queryKey: ["/api/invoice-analytics"],
    queryFn: () => apiRequest("GET", "/api/invoice-analytics"),
  });

  // Mutations
  const generateInvoiceMutation = useMutation({
    mutationFn: (data: InvoiceGenerationForm) => 
      apiRequest("POST", "/api/generate-invoice", data),
    onSuccess: (response) => {
      toast({
        title: "Invoice Generated",
        description: `Invoice ${response.invoiceNumber} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generated-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-analytics"] });
      generateForm.reset();
      setPreviewData(null);
      setActiveTab("invoices");
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: TemplateForm) => 
      apiRequest("POST", "/api/invoice-templates", data),
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "Invoice template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      templateForm.reset();
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TemplateForm> }) => 
      apiRequest("PUT", `/api/invoice-templates/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Template Updated",
        description: "Invoice template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, paymentData }: { id: number; paymentData: any }) => 
      apiRequest("POST", `/api/generated-invoices/${id}/mark-paid`, paymentData),
    onSuccess: () => {
      toast({
        title: "Payment Recorded",
        description: "Invoice has been marked as paid.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generated-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-analytics"] });
    },
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      sent: "default",
      paid: "secondary",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      unpaid: "outline",
      partial: "default",
      paid: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const handlePreviewData = async () => {
    const formValues = generateForm.getValues();
    try {
      const params = new URLSearchParams({
        startDate: formValues.periodStart,
        endDate: formValues.periodEnd,
      });
      
      if (formValues.propertyIds?.length) {
        params.append('propertyIds', formValues.propertyIds.join(','));
      }
      if (formValues.receiverType === 'owner' && formValues.receiverId) {
        params.append('ownerId', formValues.receiverId);
      }
      if (formValues.receiverType === 'portfolio_manager' && formValues.receiverId) {
        params.append('portfolioManagerId', formValues.receiverId);
      }

      const data = await apiRequest("GET", `/api/invoice-preview-data?${params.toString()}`);
      setPreviewData(data);
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Failed to load preview data",
        variant: "destructive",
      });
    }
  };

  const onGenerateSubmit = (data: InvoiceGenerationForm) => {
    generateInvoiceMutation.mutate(data);
  };

  const onTemplateSubmit = (data: TemplateForm) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const openTemplateDialog = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      templateForm.reset(template);
    } else {
      setEditingTemplate(null);
      templateForm.reset();
    }
    setIsTemplateDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Creator Tool</h1>
          <p className="text-muted-foreground">
            Automated invoice generation with PDF support and manual adjustments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openTemplateDialog()} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {invoiceAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoiceAnalytics.totalInvoices || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(invoiceAnalytics.totalAmount || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(invoiceAnalytics.paidAmount || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${(invoiceAnalytics.unpaidAmount || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">
            <Calculator className="h-4 w-4 mr-2" />
            Generate Invoice
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="archive">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </TabsTrigger>
        </TabsList>

        {/* Generate Invoice Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Invoice</CardTitle>
              <CardDescription>
                Create invoices for bookings, commissions, and services with automatic calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generateForm}>
                <form onSubmit={generateForm.handleSubmit(onGenerateSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Invoice Parties */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Invoice Parties</h3>
                      
                      <FormField
                        control={generateForm.control}
                        name="senderType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="management">Management</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generateForm.control}
                        name="receiverType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receiver Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select receiver" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="management">Management</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generateForm.control}
                        name="senderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter sender name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generateForm.control}
                        name="receiverName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receiver Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter receiver name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Invoice Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Invoice Period</h3>
                      
                      <FormField
                        control={generateForm.control}
                        name="periodStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Period Start</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generateForm.control}
                        name="periodEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Period End</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generateForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Include Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Include in Invoice</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={generateForm.control}
                        name="includeBookings"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Booking Revenue</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Include accommodation revenue and commissions
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generateForm.control}
                        name="includeAddons"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Add-on Services</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Include guest service bookings
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generateForm.control}
                        name="includeCommissions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Commission Payments</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Include portfolio manager commissions
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Tax Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={generateForm.control}
                        name="taxEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Enable Tax Calculation</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    {generateForm.watch("taxEnabled") && (
                      <FormField
                        control={generateForm.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="Enter tax rate"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Notes */}
                  <FormField
                    control={generateForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview Data */}
                  {previewData && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Invoice Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Booking Revenue:</p>
                            <p className="text-lg">${previewData.totals.bookingRevenue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Add-on Services:</p>
                            <p className="text-lg">${previewData.totals.addonServices.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Management Commission:</p>
                            <p className="text-lg">-${previewData.totals.managementCommission.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Owner Payout:</p>
                            <p className="text-lg">${previewData.totals.ownerPayout.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviewData}
                      disabled={!generateForm.watch("periodStart") || !generateForm.watch("periodEnd")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Data
                    </Button>
                    <Button
                      type="submit"
                      disabled={generateInvoiceMutation.isPending}
                    >
                      {generateInvoiceMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Generate Invoice
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices List Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Invoices</CardTitle>
                  <CardDescription>
                    View, manage, and download invoices
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Parties</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedInvoices?.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{invoice.senderName} → {invoice.receiverName}</div>
                            <div className="text-muted-foreground">
                              {invoice.senderType} → {invoice.receiverType}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              ${parseFloat(invoice.totalAmount).toFixed(2)}
                            </div>
                            {invoice.currency && (
                              <div className="text-muted-foreground">{invoice.currency}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsInvoiceDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {invoice.paymentStatus === 'unpaid' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  markAsPaidMutation.mutate({
                                    id: invoice.id,
                                    paymentData: {
                                      paymentMethod: 'manual',
                                      paymentDate: new Date().toISOString().split('T')[0],
                                    }
                                  });
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Templates</CardTitle>
                  <CardDescription>
                    Manage reusable invoice templates
                  </CardDescription>
                </div>
                <Button onClick={() => openTemplateDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoiceTemplates?.map((template: any) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.templateName}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTemplateDialog(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Type:</span> {template.templateType}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Default:</span> {template.defaultSender} → {template.defaultReceiver}
                      </div>
                      {template.taxEnabled && (
                        <div className="text-sm">
                          <span className="font-medium">Tax:</span> {template.taxRate}%
                        </div>
                      )}
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Archive</CardTitle>
              <CardDescription>
                Historical invoices and export options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Archive functionality will be available soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              Configure invoice template settings and defaults
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={templateForm.control}
                  name="templateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={templateForm.control}
                  name="templateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="booking_commission">Booking Commission</SelectItem>
                          <SelectItem value="monthly_summary">Monthly Summary</SelectItem>
                          <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                          <SelectItem value="service_fee">Service Fee</SelectItem>
                          <SelectItem value="expense_reimbursement">Expense Reimbursement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={templateForm.control}
                  name="defaultSender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Sender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={templateForm.control}
                  name="defaultReceiver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Receiver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select receiver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <FormField
                  control={templateForm.control}
                  name="taxEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Enable Tax by Default</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {templateForm.watch("taxEnabled") && (
                <FormField
                  control={templateForm.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="Enter tax rate"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={templateForm.control}
                name="headerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Text (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Custom header text for invoices..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Text (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Custom footer text for invoices..."
                        rows={2}
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
                  onClick={() => setIsTemplateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                >
                  {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDetailsOpen} onOpenChange={setIsInvoiceDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
                <DialogDescription>
                  {selectedInvoice.senderName} → {selectedInvoice.receiverName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Invoice Date:</p>
                    <p>{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Due Date:</p>
                    <p>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status:</p>
                    <div>{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Status:</p>
                    <div>{getPaymentStatusBadge(selectedInvoice.paymentStatus)}</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Financial Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Subtotal:</p>
                      <p className="font-medium">${parseFloat(selectedInvoice.subtotal).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax:</p>
                      <p className="font-medium">${parseFloat(selectedInvoice.taxAmount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total:</p>
                      <p className="font-medium text-lg">${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  {selectedInvoice.paymentStatus === 'unpaid' && (
                    <Button
                      onClick={() => {
                        markAsPaidMutation.mutate({
                          id: selectedInvoice.id,
                          paymentData: {
                            paymentMethod: 'manual',
                            paymentDate: new Date().toISOString().split('T')[0],
                          }
                        });
                        setIsInvoiceDetailsOpen(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}