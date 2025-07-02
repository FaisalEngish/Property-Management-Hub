import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DollarSign, 
  FileText, 
  PlusCircle, 
  Calendar, 
  TrendingUp, 
  Building, 
  User,
  Receipt,
  Calculator,
  BarChart3,
  Download,
  Send
} from "lucide-react";
import { format } from "date-fns";

// Schema for invoice creation
const invoiceSchema = z.object({
  senderId: z.string().min(1, "Sender is required"),
  recipientId: z.string().min(1, "Recipient is required"),
  invoiceType: z.string().min(1, "Invoice type is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.string().default("GBP"),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Item description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be positive"),
    total: z.number().min(0, "Total must be positive"),
  })).default([]),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function FinancialToolkit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("staff-salary");
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));

  // Staff Salary Component
  const StaffSalaryViewer = () => {
    const { data: salary, isLoading } = useQuery({
      queryKey: ["/api/staff/salary", user?.id],
      enabled: !!user?.id,
    });

    if (isLoading) return <div>Loading salary information...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{salary?.monthlySalary ? parseFloat(salary.monthlySalary.toString()).toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">Base monthly salary</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Bonus</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{salary?.performanceBonus ? parseFloat(salary.performanceBonus.toString()).toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">Current period bonus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{salary ? (
                  parseFloat(salary.monthlySalary?.toString() || "0") + 
                  parseFloat(salary.performanceBonus?.toString() || "0")
                ).toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">Salary + bonuses</p>
            </CardContent>
          </Card>
        </div>

        {salary && (
          <Card>
            <CardHeader>
              <CardTitle>Salary Details</CardTitle>
              <CardDescription>Your current salary information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Position</Label>
                  <p className="text-sm text-muted-foreground">{salary.position || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">{salary.department || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Effective From</Label>
                  <p className="text-sm text-muted-foreground">
                    {salary.effectiveFrom ? format(new Date(salary.effectiveFrom), "PP") : "Not specified"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={salary.isActive ? "default" : "secondary"}>
                    {salary.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Portfolio Manager Earnings Component
  const PortfolioManagerEarnings = () => {
    const { data: earnings, isLoading } = useQuery({
      queryKey: ["/api/portfolio-manager/earnings", user?.id, selectedPeriod],
      enabled: !!user?.id,
    });

    if (isLoading) return <div>Loading portfolio earnings...</div>;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Portfolio Manager Earnings</h3>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const period = date.toISOString().slice(0, 7);
                return (
                  <SelectItem key={period} value={period}>
                    {format(date, "MMMM yyyy")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rental Revenue</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{earnings?.rentalRevenue ? parseFloat(earnings.rentalRevenue.toString()).toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">From managed properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{earnings?.totalCommission ? parseFloat(earnings.totalCommission.toString()).toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">Total commission for period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties Managed</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {earnings?.assignedProperties?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active assignments</p>
            </CardContent>
          </Card>
        </div>

        {earnings?.assignedProperties && earnings.assignedProperties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Managed Properties</CardTitle>
              <CardDescription>Properties currently under your management</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.assignedProperties.map((property: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{property.propertyName || `Property #${property.propertyId}`}</TableCell>
                      <TableCell>{property.commissionRate}%</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Universal Invoice Tool Component
  const UniversalInvoiceTool = () => {
    const [showCreateInvoice, setShowCreateInvoice] = useState(false);
    
    const { data: invoices, isLoading } = useQuery({
      queryKey: ["/api/invoices"],
    });

    const { data: users } = useQuery({
      queryKey: ["/api/users"],
    });

    const form = useForm<InvoiceFormData>({
      resolver: zodResolver(invoiceSchema),
      defaultValues: {
        currency: "GBP",
        lineItems: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
      },
    });

    const createInvoiceMutation = useMutation({
      mutationFn: (data: InvoiceFormData) => apiRequest("/api/invoices", "POST", data),
      onSuccess: () => {
        toast({ title: "Success", description: "Invoice created successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
        setShowCreateInvoice(false);
        form.reset();
      },
      onError: (error: Error) => {
        toast({ 
          title: "Error", 
          description: error.message || "Failed to create invoice",
          variant: "destructive" 
        });
      },
    });

    const onSubmit = (data: InvoiceFormData) => {
      createInvoiceMutation.mutate(data);
    };

    if (isLoading) return <div>Loading invoices...</div>;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Universal Invoice Tool</h3>
          <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate professional invoices between any parties in your organization
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="senderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From (Sender)</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sender" />
                              </SelectTrigger>
                              <SelectContent>
                                {users?.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recipientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To (Recipient)</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recipient" />
                              </SelectTrigger>
                              <SelectContent>
                                {users?.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="invoiceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select invoice type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="booking-commission">Booking Commission</SelectItem>
                              <SelectItem value="maintenance-charge">Maintenance Charge</SelectItem>
                              <SelectItem value="portfolio-commission">Portfolio Management Commission</SelectItem>
                              <SelectItem value="service-fee">Service Fee</SelectItem>
                              <SelectItem value="expense-reimbursement">Expense Reimbursement</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Invoice description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
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

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Additional notes or terms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateInvoice(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createInvoiceMutation.isPending}>
                      {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
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
            <CardDescription>Manage and track all invoices in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices && invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invoice.invoiceType.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>£{parseFloat(invoice.amount.toString()).toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), "PP")}</TableCell>
                      <TableCell>
                        <Badge variant={
                          invoice.status === "paid" ? "default" :
                          invoice.status === "overdue" ? "destructive" : "secondary"
                        }>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found. Create your first invoice to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Financial Dashboard Component (placeholder for owner financial enhancements)
  const FinancialDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£24,500</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£3,250</div>
              <p className="text-xs text-muted-foreground">To agents this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Costs</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£8,900</div>
              <p className="text-xs text-muted-foreground">Salaries this month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of your organization's financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Financial dashboard and reporting features coming soon</p>
              <p className="text-sm">This will include comprehensive financial analytics, profit/loss statements, and detailed reporting</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Financial & Invoice Toolkit</h1>
          <p className="text-muted-foreground">
            Comprehensive financial management tools for staff salaries, commission tracking, and universal invoicing
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="staff-salary">
              <DollarSign className="h-4 w-4 mr-2" />
              Staff Salary
            </TabsTrigger>
            <TabsTrigger value="portfolio-earnings">
              <TrendingUp className="h-4 w-4 mr-2" />
              Portfolio Earnings
            </TabsTrigger>
            <TabsTrigger value="invoice-tool">
              <FileText className="h-4 w-4 mr-2" />
              Invoice Tool
            </TabsTrigger>
            <TabsTrigger value="financial-dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff-salary">
            <StaffSalaryViewer />
          </TabsContent>

          <TabsContent value="portfolio-earnings">
            <PortfolioManagerEarnings />
          </TabsContent>

          <TabsContent value="invoice-tool">
            <UniversalInvoiceTool />
          </TabsContent>

          <TabsContent value="financial-dashboard">
            <FinancialDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}