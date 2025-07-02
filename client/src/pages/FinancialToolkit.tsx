import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DollarSign, 
  Receipt, 
  FileText, 
  Calendar, 
  Calculator,
  TrendingUp,
  Users,
  Building,
  Plus,
  Download,
  Upload,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

// Form schemas
const invoiceSchema = z.object({
  invoiceType: z.string().min(1, "Invoice type is required"),
  fromName: z.string().min(1, "From name is required"),
  fromAddress: z.string().optional(),
  fromEmail: z.string().email().optional(),
  toName: z.string().min(1, "To name is required"),
  toAddress: z.string().optional(),
  toEmail: z.string().email().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  tags: z.array(z.string()).optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.string().min(1, "Quantity is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    category: z.string().optional(),
  })).min(1, "At least one line item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function FinancialToolkit() {
  const [activeTab, setActiveTab] = useState("staff-salaries");
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form initialization
  const invoiceForm = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      lineItems: [{ description: "", quantity: "1", unitPrice: "", category: "" }],
      tags: [],
    },
  });

  // Queries
  const { data: staffPayrollRecords = [], isLoading: isLoadingPayroll } = useQuery({
    queryKey: ["/api/payroll/staff", selectedYear, selectedMonth],
    queryFn: () => apiRequest("GET", `/api/payroll/staff?year=${selectedYear}&month=${selectedMonth}`),
  });

  const { data: portfolioCommissions = [], isLoading: isLoadingPMCommissions } = useQuery({
    queryKey: ["/api/commissions/portfolio-manager", selectedYear, selectedMonth],
    queryFn: () => apiRequest("GET", `/api/commissions/portfolio-manager?year=${selectedYear}&month=${selectedMonth}`),
  });

  const { data: referralCommissions = [], isLoading: isLoadingRACommissions } = useQuery({
    queryKey: ["/api/commissions/referral-agent", selectedYear, selectedMonth],
    queryFn: () => apiRequest("GET", `/api/commissions/referral-agent?year=${selectedYear}&month=${selectedMonth}`),
  });

  const { data: universalInvoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["/api/invoices/universal"],
    queryFn: () => apiRequest("GET", "/api/invoices/universal"),
  });

  const { data: salaryAnalytics } = useQuery({
    queryKey: ["/api/analytics/staff-salaries"],
    queryFn: () => apiRequest("GET", "/api/analytics/staff-salaries"),
  });

  const { data: commissionAnalytics } = useQuery({
    queryKey: ["/api/analytics/commissions"],
    queryFn: () => apiRequest("GET", "/api/analytics/commissions"),
  });

  // Mutations
  const markPayrollPaidMutation = useMutation({
    mutationFn: (data: { id: number; paymentMethod: string; paymentReference?: string; notes?: string }) =>
      apiRequest("PATCH", `/api/payroll/staff/${data.id}/mark-paid`, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Payroll marked as paid successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/staff"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark payroll as paid", variant: "destructive" });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: InvoiceFormData) => apiRequest("POST", "/api/invoices/universal", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Invoice created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/universal"] });
      setIsCreateInvoiceOpen(false);
      invoiceForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
    },
  });

  const requestPayoutMutation = useMutation({
    mutationFn: (data: { id: number; type: "portfolio-manager" | "referral-agent" }) => {
      const endpoint = data.type === "portfolio-manager" 
        ? `/api/commissions/portfolio-manager/${data.id}/request-payout`
        : `/api/commissions/referral-agent/${data.id}/request-payment`;
      return apiRequest("PATCH", endpoint, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payout requested successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/commissions/portfolio-manager"] });
      queryClient.invalidateQueries({ queryKey: ["/api/commissions/referral-agent"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to request payout", variant: "destructive" });
    },
  });

  // Helper functions
  const handleMarkPayrollPaid = (id: number) => {
    markPayrollPaidMutation.mutate({
      id,
      paymentMethod: "bank_transfer",
      paymentReference: `PAY-${Date.now()}`,
      notes: "Marked as paid via Financial Toolkit",
    });
  };

  const handleRequestPayout = (id: number, type: "portfolio-manager" | "referral-agent") => {
    requestPayoutMutation.mutate({ id, type });
  };

  const addLineItem = () => {
    const currentItems = invoiceForm.getValues("lineItems");
    invoiceForm.setValue("lineItems", [...currentItems, { description: "", quantity: "1", unitPrice: "", category: "" }]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = invoiceForm.getValues("lineItems");
    if (currentItems.length > 1) {
      invoiceForm.setValue("lineItems", currentItems.filter((_, i) => i !== index));
    }
  };

  const calculateInvoiceTotal = () => {
    const lineItems = invoiceForm.watch("lineItems");
    return lineItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return total + (quantity * unitPrice);
    }, 0);
  };

  const onSubmitInvoice = (data: InvoiceFormData) => {
    const invoiceData = {
      ...data,
      invoiceDate: new Date().toISOString(),
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      subtotal: calculateInvoiceTotal().toString(),
      totalAmount: calculateInvoiceTotal().toString(),
      currency: "THB",
      status: "draft",
    };
    createInvoiceMutation.mutate(invoiceData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial & Invoice Toolkit</h1>
          <p className="text-muted-foreground">
            Comprehensive financial management for payroll, commissions, and invoice generation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {format(new Date(2023, month - 1, 1), "MMMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff-salaries" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Salaries
          </TabsTrigger>
          <TabsTrigger value="pm-earnings" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            PM Earnings
          </TabsTrigger>
          <TabsTrigger value="invoice-tool" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoice Tool
          </TabsTrigger>
          <TabsTrigger value="financial-dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff-salaries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Salary Management
              </CardTitle>
              <CardDescription>
                View and manage monthly staff salary payments and records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPayroll ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {staffPayrollRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No payroll records found for {format(new Date(selectedYear, selectedMonth - 1, 1), "MMMM yyyy")}</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {staffPayrollRecords.map((record: any) => (
                        <Card key={record.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{record.staffId}</h4>
                                <Badge variant={record.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                  {record.paymentStatus}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Period: {record.payrollPeriod} | Net Pay: ฿{parseFloat(record.netPay).toLocaleString()}
                              </p>
                              {record.paymentDate && (
                                <p className="text-sm text-green-600">
                                  Paid on {format(new Date(record.paymentDate), "dd MMM yyyy")}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {record.paymentStatus === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkPayrollPaid(record.id)}
                                  disabled={markPayrollPaidMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Paid
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pm-earnings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Portfolio Manager Commissions
                </CardTitle>
                <CardDescription>
                  Monthly commission earnings and payout management
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPMCommissions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolioCommissions.map((commission: any) => (
                      <Card key={commission.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{commission.managerId}</h4>
                              <Badge variant={commission.payoutStatus === 'paid' ? 'default' : 'secondary'}>
                                {commission.payoutStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Commission: ฿{parseFloat(commission.commissionAmount).toLocaleString()} ({commission.commissionRate}%)
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Properties: {commission.totalProperties} | Revenue: ฿{parseFloat(commission.totalRevenue).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {commission.payoutStatus === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleRequestPayout(commission.id, 'portfolio-manager')}
                                disabled={requestPayoutMutation.isPending}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Request Payout
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Receipt className="h-4 w-4 mr-2" />
                              Generate Invoice
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referral Agent Commissions
                </CardTitle>
                <CardDescription>
                  10% commission tracking and payment requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRACommissions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referralCommissions.map((commission: any) => (
                      <Card key={commission.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{commission.agentId}</h4>
                              <Badge variant={commission.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                {commission.paymentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {commission.propertyName} | ฿{parseFloat(commission.commissionAmount).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Occupancy: {commission.occupancyRate}% | Rating: {commission.averageReviewScore}/5
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {commission.paymentStatus === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleRequestPayout(commission.id, 'referral-agent')}
                                disabled={requestPayoutMutation.isPending}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Request Payment
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoice-tool" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Universal Invoice Generator</h2>
              <p className="text-muted-foreground">Create custom invoices for any purpose</p>
            </div>
            <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a professional invoice for any business purpose
                  </DialogDescription>
                </DialogHeader>
                <Form {...invoiceForm}>
                  <form onSubmit={invoiceForm.handleSubmit(onSubmitInvoice)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={invoiceForm.control}
                        name="invoiceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select invoice type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="commission">Commission</SelectItem>
                                <SelectItem value="service">Service Fee</SelectItem>
                                <SelectItem value="reimbursement">Reimbursement</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="cleaning">Cleaning Fee</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={invoiceForm.control}
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="font-semibold">From (Sender)</h3>
                        <FormField
                          control={invoiceForm.control}
                          name="fromName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name/Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name or company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={invoiceForm.control}
                          name="fromEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="your@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={invoiceForm.control}
                          name="fromAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Your address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">To (Recipient)</h3>
                        <FormField
                          control={invoiceForm.control}
                          name="toName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name/Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Recipient name or company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={invoiceForm.control}
                          name="toEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="recipient@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={invoiceForm.control}
                          name="toAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Recipient address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={invoiceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Invoice description or notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Line Items</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      {invoiceForm.watch("lineItems").map((_, index) => (
                        <div key={index} className="grid gap-4 md:grid-cols-4 p-4 border rounded-lg">
                          <FormField
                            control={invoiceForm.control}
                            name={`lineItems.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input placeholder="Item description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={invoiceForm.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={invoiceForm.control}
                            name={`lineItems.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price (฿)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-end">
                            {invoiceForm.watch("lineItems").length > 1 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeLineItem(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            Total: ฿{calculateInvoiceTotal().toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createInvoiceMutation.isPending}>
                        {createInvoiceMutation.isPending ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Receipt className="h-4 w-4 mr-2" />
                            Create Invoice
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>All generated invoices and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {universalInvoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No invoices created yet</p>
                    </div>
                  ) : (
                    universalInvoices.map((invoice: any) => (
                      <Card key={invoice.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                              <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                {invoice.status}
                              </Badge>
                              <Badge variant="outline">{invoice.invoiceType}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {invoice.fromName} → {invoice.toName}
                            </p>
                            <p className="text-sm font-medium">
                              ฿{parseFloat(invoice.totalAmount).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{salaryAnalytics?.totalMonthlyPayroll?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending: ฿{salaryAnalytics?.totalPendingPayments?.toLocaleString() || "0"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PM Commissions</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{commissionAnalytics?.portfolioManagerEarnings?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{commissionAnalytics?.monthlyGrowth?.toFixed(1) || "0"}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referral Commissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{commissionAnalytics?.referralAgentEarnings?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  10% of management fees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{commissionAnalytics?.totalCommissionsPending?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Financial Activity</CardTitle>
                <CardDescription>Latest payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent activity would be populated from API */}
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Staff salary paid</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <p className="text-sm font-medium">฿15,000</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commission generated</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                    <p className="text-sm font-medium">฿8,500</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Invoice created</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                    <p className="text-sm font-medium">฿3,200</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common financial management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-20 flex-col">
                    <Receipt className="h-6 w-6 mb-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="h-6 w-6 mb-2" />
                    Upload Receipt
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calculator className="h-6 w-6 mb-2" />
                    Tax Calculator
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}