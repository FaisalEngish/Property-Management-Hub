import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  X,
  Edit,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

interface CommissionSummary {
  totalEarned: number;
  pendingCommissions: number;
  paidCommissions: number;
  currentBalance: number;
  totalBookings?: number;
  thisMonthEarnings: number;
  averageCommissionRate: number;
  lastPaymentDate?: string;
}

interface CommissionLogEntry {
  id: number;
  propertyName: string;
  referenceNumber: string;
  commissionDate: string;
  baseAmount: string;
  commissionRate: string;
  commissionAmount: string;
  currency: string;
  status: string;
  agentType: string;
  processedBy?: string;
  processedAt?: string;
  adminNotes?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  periodStart: string;
  periodEnd: string;
  totalCommissions: string;
  currency: string;
  status: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedReason?: string;
  description?: string;
  agentNotes?: string;
}

export default function AgentCommissionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState({ start: "", end: "" });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    propertyId: "",
  });
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    periodStart: "",
    periodEnd: "",
    description: "",
    agentNotes: "",
  });

  // Set default period to current month
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setInvoiceForm({
      ...invoiceForm,
      periodStart: startOfMonth.toISOString().split('T')[0],
      periodEnd: endOfMonth.toISOString().split('T')[0],
    });
  }, []);

  // Fetch commission summary
  const { data: summary, isLoading: summaryLoading } = useQuery<CommissionSummary>({
    queryKey: ["/api/agent/commission-summary"],
  });

  // Fetch commission log
  const { data: commissions = [], isLoading: commissionsLoading } = useQuery<CommissionLogEntry[]>({
    queryKey: ["/api/agent/commission-log", filters],
    queryFn: () => apiRequest("GET", "/api/agent/commission-log", filters),
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/agent/invoices"],
  });

  // Generate invoice mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: (data: typeof invoiceForm) => apiRequest("POST", "/api/agent/generate-invoice", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Invoice generated successfully" });
      setInvoiceDialog(false);
      setInvoiceForm({
        periodStart: "",
        periodEnd: "",
        description: "",
        agentNotes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agent/invoices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  // Submit invoice mutation
  const submitInvoiceMutation = useMutation({
    mutationFn: (invoiceId: number) => apiRequest("PATCH", `/api/agent/invoices/${invoiceId}/submit`),
    onSuccess: () => {
      toast({ title: "Success", description: "Invoice submitted for approval" });
      queryClient.invalidateQueries({ queryKey: ["/api/agent/invoices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit invoice",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: "secondary" as const, icon: Clock, text: "🔁 Pending" },
      paid: { variant: "default" as const, icon: CheckCircle, text: "✅ Paid" },
      approved: { variant: "default" as const, icon: CheckCircle, text: "✅ Approved" },
      submitted: { variant: "outline" as const, icon: Clock, text: "📤 Submitted" },
      draft: { variant: "secondary" as const, icon: Edit, text: "📝 Draft" },
      rejected: { variant: "destructive" as const, icon: X, text: "❌ Rejected" },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  if (!user || !['retail-agent', 'referral-agent'].includes(user.role)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Access denied. Agent role required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Commission Dashboard</h1>
          <p className="text-muted-foreground">
            Track your commissions, earnings, and generate invoices for payout requests
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                Generate Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Commission Invoice</DialogTitle>
                <DialogDescription>
                  Create an invoice for your pending commissions within a specific period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="periodStart">Period Start</Label>
                    <Input
                      id="periodStart"
                      type="date"
                      value={invoiceForm.periodStart}
                      onChange={(e) => setInvoiceForm({...invoiceForm, periodStart: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodEnd">Period End</Label>
                    <Input
                      id="periodEnd"
                      type="date"
                      value={invoiceForm.periodEnd}
                      onChange={(e) => setInvoiceForm({...invoiceForm, periodEnd: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Commission invoice for December 2024"
                    value={invoiceForm.description}
                    onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="agentNotes">Agent Notes</Label>
                  <Textarea
                    id="agentNotes"
                    placeholder="Additional notes or comments..."
                    value={invoiceForm.agentNotes}
                    onChange={(e) => setInvoiceForm({...invoiceForm, agentNotes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInvoiceDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => generateInvoiceMutation.mutate(invoiceForm)}
                  disabled={generateInvoiceMutation.isPending}
                >
                  {generateInvoiceMutation.isPending ? "Generating..." : "Generate Invoice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : formatCurrency(summary?.totalEarned || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : formatCurrency(summary?.thisMonthEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Current month earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : formatCurrency(summary?.pendingCommissions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'retail-agent' ? 'Total Bookings' : 'Avg Commission Rate'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : 
                user.role === 'retail-agent' ? 
                  (summary?.totalBookings || 0) : 
                  `${(summary?.averageCommissionRate || 0).toFixed(1)}%`
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {user.role === 'retail-agent' ? 'Bookings made' : 'Average rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="commissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="commissions">Commission Log</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Log</CardTitle>
              <CardDescription>
                Detailed history of all your commission transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">From Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">To Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ status: "", startDate: "", endDate: "", propertyId: "" })}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Commission Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Property/Villa</TableHead>
                      <TableHead>Booking Ref</TableHead>
                      <TableHead>Role Type</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading commissions...
                        </TableCell>
                      </TableRow>
                    ) : commissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No commission records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell>
                            {format(new Date(commission.commissionDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {commission.propertyName}
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-1 rounded">
                              {commission.referenceNumber}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {commission.agentType === 'retail-agent' ? 'Retail Agent' : 'Referral Agent'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(commission.commissionAmount)}
                            <div className="text-xs text-muted-foreground">
                              {commission.commissionRate}% rate
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(commission.status)}
                            {commission.processedAt && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(commission.processedAt), 'dd/MM/yyyy')}
                              </div>
                            )}
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

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Invoices</CardTitle>
              <CardDescription>
                Manage your commission invoice requests and track approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No invoices found. Generate your first invoice to request commission payout.
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {format(new Date(invoice.periodStart), 'MMM dd')} - {format(new Date(invoice.periodEnd), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(invoice.totalCommissions)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(invoice.status)}
                            {invoice.rejectedReason && (
                              <div className="text-xs text-red-600 mt-1">
                                {invoice.rejectedReason}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(invoice.invoiceDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {invoice.status === 'draft' && (
                                <Button
                                  size="sm"
                                  onClick={() => submitInvoiceMutation.mutate(invoice.id)}
                                  disabled={submitInvoiceMutation.isPending}
                                >
                                  Submit
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
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
      </Tabs>
    </div>
  );
}