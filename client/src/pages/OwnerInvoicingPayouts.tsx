import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, FileText, TrendingUp, Receipt, Download, Upload, CheckCircle, XCircle, Clock, AlertTriangle, Eye, Edit, Plus, ArrowUpDown, Filter, Search, Calendar as CalendarIcon2 } from 'lucide-react';
import { RoleBackButton } from '@/components/BackButton';

// Form schemas
const payoutRequestSchema = z.object({
  requestedAmount: z.string().min(1, 'Amount is required'),
  payoutType: z.enum(['full', 'partial']),
  propertyId: z.number().optional(),
  bankAccountName: z.string().min(1, 'Account name is required'),
  bankAccountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  bankBranch: z.string().optional(),
  routingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  ownerNotes: z.string().optional(),
  urgencyLevel: z.enum(['normal', 'urgent']),
  preferredPayoutDate: z.date().optional(),
});

const ownerInvoiceSchema = z.object({
  fromParty: z.enum(['owner', 'management', 'portfolio_manager']),
  fromPartyId: z.string().min(1, 'From party ID is required'),
  toParty: z.enum(['owner', 'management', 'portfolio_manager']),
  toPartyId: z.string().min(1, 'To party ID is required'),
  propertyId: z.number().optional(),
  invoiceDate: z.date(),
  dueDate: z.date().optional(),
  periodStart: z.date(),
  periodEnd: z.date(),
  invoiceType: z.enum(['management_fee', 'expenses', 'revenue_share', 'services']),
  category: z.enum(['rental_income', 'cleaning', 'maintenance', 'utilities', 'management']),
  description: z.string().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  ownerNotes: z.string().optional(),
});

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.string().default('1'),
  unitPrice: z.string().min(1, 'Unit price is required'),
  chargeType: z.enum(['guest_billable', 'owner_billable', 'company_expense', 'complimentary']),
  sourceType: z.enum(['booking', 'service', 'utility', 'manual']).optional(),
  sourceId: z.number().optional(),
  serviceDate: z.date().optional(),
  referenceNumber: z.string().optional(),
  vendorName: z.string().optional(),
  taxable: z.boolean().default(true),
});

export default function OwnerInvoicingPayouts() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showLineItemDialog, setShowLineItemDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Forms
  const payoutForm = useForm({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      payoutType: 'full',
      urgencyLevel: 'normal',
    },
  });

  const invoiceForm = useForm({
    resolver: zodResolver(ownerInvoiceSchema),
    defaultValues: {
      fromParty: 'management',
      toParty: 'owner',
      invoiceType: 'revenue_share',
      category: 'rental_income',
      invoiceDate: new Date(),
      periodStart: new Date(),
      periodEnd: new Date(),
    },
  });

  const lineItemForm = useForm({
    resolver: zodResolver(lineItemSchema),
    defaultValues: {
      description: '',
      category: '',
      quantity: '1',
      unitPrice: '',
      chargeType: 'owner_billable',
      referenceNumber: '',
      vendorName: '',
      taxable: true,
    },
  });

  // Queries
  const { data: analytics } = useQuery({
    queryKey: ['/api/owner-invoicing/analytics', selectedProperty, selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/owner-invoicing/analytics?${new URLSearchParams({
      ...(selectedProperty && { propertyId: selectedProperty.toString() }),
      period: selectedPeriod,
    })}`),
  });

  const { data: ownerBalance } = useQuery({
    queryKey: ['/api/owner-balance', selectedProperty],
    queryFn: () => apiRequest('GET', `/api/owner-balance?${new URLSearchParams({
      ...(selectedProperty && { propertyId: selectedProperty.toString() }),
    })}`),
  });

  const { data: payoutRequestsRaw } = useQuery({
    queryKey: ['/api/owner-payout-requests', statusFilter, selectedProperty],
    queryFn: () => apiRequest('GET', `/api/owner-payout-requests?${new URLSearchParams({
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(selectedProperty && { propertyId: selectedProperty.toString() }),
    })}`),
    retry: false,
  });

  // Ensure data is always an array to prevent crashes
  const payoutRequests = Array.isArray(payoutRequestsRaw) ? payoutRequestsRaw : [];

  const { data: ownerInvoicesRaw } = useQuery({
    queryKey: ['/api/owner-invoices', statusFilter, selectedProperty],
    queryFn: () => apiRequest('GET', `/api/owner-invoices?${new URLSearchParams({
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(selectedProperty && { propertyId: selectedProperty.toString() }),
    })}`),
    retry: false,
  });

  // Ensure data is always an array to prevent crashes
  const ownerInvoices = Array.isArray(ownerInvoicesRaw) ? ownerInvoicesRaw : [];

  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: lineItems } = useQuery({
    queryKey: ['/api/owner-invoices', selectedInvoice?.id, 'line-items'],
    queryFn: () => selectedInvoice ? apiRequest('GET', `/api/owner-invoices/${selectedInvoice.id}/line-items`) : null,
    enabled: !!selectedInvoice,
  });

  // Mutations
  const createPayoutRequestMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/owner-payout-requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner-payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoicing/analytics'] });
      setShowPayoutDialog(false);
      payoutForm.reset();
      toast({
        title: 'Success',
        description: 'Payout request created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payout request',
        variant: 'destructive',
      });
    },
  });

  const updatePayoutRequestMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/owner-payout-requests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner-payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoicing/analytics'] });
      toast({
        title: 'Success',
        description: 'Payout request updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payout request',
        variant: 'destructive',
      });
    },
  });

  const createOwnerInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/owner-invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoicing/analytics'] });
      setShowInvoiceDialog(false);
      invoiceForm.reset();
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    },
  });

  const addLineItemMutation = useMutation({
    mutationFn: ({ invoiceId, ...data }: any) => apiRequest('POST', `/api/owner-invoices/${invoiceId}/line-items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoices', selectedInvoice?.id, 'line-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoices'] });
      setShowLineItemDialog(false);
      lineItemForm.reset();
      toast({
        title: 'Success',
        description: 'Line item added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add line item',
        variant: 'destructive',
      });
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/owner-invoices/generate-from-bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner-invoicing/analytics'] });
      toast({
        title: 'Success',
        description: 'Invoice generated from booking data successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate invoice',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      processing: { variant: 'default', icon: ArrowUpDown },
      completed: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      draft: { variant: 'secondary', icon: Edit },
      sent: { variant: 'default', icon: FileText },
      viewed: { variant: 'default', icon: Eye },
      paid: { variant: 'default', icon: CheckCircle },
      overdue: { variant: 'destructive', icon: AlertTriangle },
      cancelled: { variant: 'destructive', icon: XCircle },
    };

    const config = statusConfig[status] || { variant: 'secondary', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatWithConversion = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Form handlers
  const handleCreatePayoutRequest = (data: any) => {
    const formattedData = {
      ...data,
      requestedAmount: data.requestedAmount,
      availableBalance: ownerBalance?.currentBalance || '0',
      preferredPayoutDate: data.preferredPayoutDate?.toISOString().split('T')[0],
    };
    createPayoutRequestMutation.mutate(formattedData);
  };

  const handleCreateOwnerInvoice = (data: any) => {
    const formattedData = {
      ...data,
      invoiceDate: data.invoiceDate.toISOString().split('T')[0],
      dueDate: data.dueDate?.toISOString().split('T')[0],
      periodStart: data.periodStart.toISOString().split('T')[0],
      periodEnd: data.periodEnd.toISOString().split('T')[0],
      subtotal: '0',
      totalAmount: '0',
    };
    createOwnerInvoiceMutation.mutate(formattedData);
  };

  const handleAddLineItem = (data: any) => {
    const lineTotal = parseFloat(data.quantity) * parseFloat(data.unitPrice);
    const formattedData = {
      ...data,
      invoiceId: selectedInvoice.id,
      lineTotal: lineTotal.toString(),
      serviceDate: data.serviceDate?.toISOString().split('T')[0],
    };
    addLineItemMutation.mutate(formattedData);
  };

  const handleGenerateInvoice = (ownerId: string, propertyId: number) => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    generateInvoiceMutation.mutate({
      ownerId,
      propertyId,
      periodStart: firstDay.toISOString().split('T')[0],
      periodEnd: lastDay.toISOString().split('T')[0],
    });
  };

  const handleUpdatePayoutStatus = (requestId: number, status: string) => {
    updatePayoutRequestMutation.mutate({ id: requestId, status });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <RoleBackButton role="admin" className="mb-4" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Invoicing & Payouts</h1>
          <p className="text-muted-foreground">
            Comprehensive owner financial integration with automated invoicing and payout management
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProperty?.toString() || 'all'} onValueChange={(value) => setSelectedProperty(value === 'all' ? null : parseInt(value))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties?.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPayoutDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.currentBalance ? formatWithConversion(analytics.currentBalance.currentBalance) : '$0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for payout
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payout Requests</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPayoutRequests}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.pendingPayoutRequests} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.unpaidInvoices} unpaid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completedPayoutRequests}</div>
              <p className="text-xs text-muted-foreground">
                Completed payouts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payout Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payout Requests</CardTitle>
                <CardDescription>Latest payout requests and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentPayoutRequests?.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatWithConversion(request.requestedAmount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                  {(!analytics?.recentPayoutRequests || analytics.recentPayoutRequests.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No recent payout requests</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest invoices and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentInvoices?.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatWithConversion(invoice.totalAmount)} • {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                  ))}
                  {(!analytics?.recentInvoices || analytics.recentInvoices.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No recent invoices</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Owner Balance Details</CardTitle>
              <CardDescription>Detailed breakdown of current balance and financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              {ownerBalance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">{formatWithConversion(ownerBalance.currentBalance)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
                    <p className="text-2xl font-bold">{formatWithConversion(ownerBalance.pendingRevenue)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold">{formatWithConversion(ownerBalance.totalExpenses)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Management Fees</p>
                    <p className="text-2xl font-bold">{formatWithConversion(ownerBalance.managementFees)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Monthly Rental Income</p>
                    <p className="text-2xl font-bold">{formatWithConversion(ownerBalance.monthlyRentalIncome)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Monthly Utilities</p>
                    <p className="text-2xl font-bold">{formatWithConversion(ownerBalance.monthlyUtilities)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Monthly Maintenance</p>
                    <p className="text-2xl font-bold">{formatWithConversion(ownerBalance.monthlyMaintenance)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Last Payout</p>
                    <p className="text-2xl font-bold">
                      {ownerBalance.lastPayoutAmount ? formatWithConversion(ownerBalance.lastPayoutAmount) : 'None'}
                    </p>
                    {ownerBalance.lastPayoutDate && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ownerBalance.lastPayoutDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No balance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Requests Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowPayoutDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Payout Request
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>Manage your payout requests and track their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatWithConversion(request.requestedAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.payoutType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {properties?.find((p: any) => p.id === request.propertyId)?.name || 'All Properties'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdatePayoutStatus(request.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!payoutRequests || payoutRequests.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payout requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Owner Invoices</CardTitle>
              <CardDescription>View and manage invoices between owners and management</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownerInvoices?.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invoice.fromParty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invoice.toParty}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatWithConversion(invoice.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!ownerInvoices || ownerInvoices.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Overview of financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Balance</span>
                    <span className="font-medium">{analytics?.currentBalance ? formatWithConversion(analytics.currentBalance.currentBalance) : '$0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending Payouts</span>
                    <span className="font-medium">{analytics?.pendingPayoutRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed Payouts</span>
                    <span className="font-medium">{analytics?.completedPayoutRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Invoices</span>
                    <span className="font-medium">{analytics?.totalInvoices || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Paid Invoices</span>
                    <span className="font-medium">{analytics?.paidInvoices || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and utilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setShowPayoutDialog(true)}
                  >
                    <ArrowUpDown className="w-6 h-6" />
                    <span className="text-sm">Request Payout</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setShowInvoiceDialog(true)}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm">Create Invoice</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                  >
                    <Download className="w-6 h-6" />
                    <span className="text-sm">Export Data</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                  >
                    <Receipt className="w-6 h-6" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Payout Request</DialogTitle>
            <DialogDescription>
              Request a payout from your available balance
            </DialogDescription>
          </DialogHeader>
          <Form {...payoutForm}>
            <form onSubmit={payoutForm.handleSubmit(handleCreatePayoutRequest)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={payoutForm.control}
                  name="requestedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={payoutForm.control}
                  name="payoutType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payout Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full">Full Balance</SelectItem>
                          <SelectItem value="partial">Partial Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={payoutForm.control}
                  name="bankAccountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Account holder name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={payoutForm.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Bank account number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={payoutForm.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Bank name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={payoutForm.control}
                  name="bankBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Branch (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Branch name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={payoutForm.control}
                  name="urgencyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={payoutForm.control}
                  name="preferredPayoutDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={payoutForm.control}
                name="ownerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Additional notes or special instructions"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPayoutDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPayoutRequestMutation.isPending}>
                  {createPayoutRequestMutation.isPending ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Owner Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice between owners and management
            </DialogDescription>
          </DialogHeader>
          <Form {...invoiceForm}>
            <form onSubmit={invoiceForm.handleSubmit(handleCreateOwnerInvoice)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={invoiceForm.control}
                  name="fromParty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={invoiceForm.control}
                  name="toParty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={invoiceForm.control}
                  name="fromPartyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From User</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={invoiceForm.control}
                  name="toPartyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To User</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={invoiceForm.control}
                  name="invoiceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="management_fee">Management Fee</SelectItem>
                          <SelectItem value="expenses">Expenses</SelectItem>
                          <SelectItem value="revenue_share">Revenue Share</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={invoiceForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rental_income">Rental Income</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={invoiceForm.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={invoiceForm.control}
                  name="periodStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Start</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={invoiceForm.control}
                  name="periodEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period End</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={invoiceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Invoice description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createOwnerInvoiceMutation.isPending}>
                  {createOwnerInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                View invoice details and line items
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Invoice Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Date:</span> {format(new Date(selectedInvoice.invoiceDate), 'PPP')}</p>
                    <p><span className="text-muted-foreground">Due Date:</span> {selectedInvoice.dueDate ? format(new Date(selectedInvoice.dueDate), 'PPP') : 'N/A'}</p>
                    <p><span className="text-muted-foreground">Period:</span> {format(new Date(selectedInvoice.periodStart), 'MMM dd')} - {format(new Date(selectedInvoice.periodEnd), 'MMM dd, yyyy')}</p>
                    <p><span className="text-muted-foreground">Type:</span> {selectedInvoice.invoiceType}</p>
                    <p><span className="text-muted-foreground">Category:</span> {selectedInvoice.category}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Financial Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Subtotal:</span> {formatWithConversion(selectedInvoice.subtotal)}</p>
                    <p><span className="text-muted-foreground">Tax:</span> {formatWithConversion(selectedInvoice.taxAmount || 0)}</p>
                    <p className="font-medium"><span className="text-muted-foreground">Total:</span> {formatWithConversion(selectedInvoice.totalAmount)}</p>
                    <div className="pt-2">
                      {getStatusBadge(selectedInvoice.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Line Items</h4>
                  <Button size="sm" onClick={() => setShowLineItemDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatWithConversion(item.unitPrice)}</TableCell>
                        <TableCell className="font-medium">{formatWithConversion(item.lineTotal)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.chargeType}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!lineItems || lineItems.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No line items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Description */}
              {selectedInvoice.description && (
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.description}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Line Item Dialog */}
      <Dialog open={showLineItemDialog} onOpenChange={setShowLineItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Line Item</DialogTitle>
            <DialogDescription>
              Add a new line item to the invoice
            </DialogDescription>
          </DialogHeader>
          <Form {...lineItemForm}>
            <form onSubmit={lineItemForm.handleSubmit(handleAddLineItem)} className="space-y-4">
              <FormField
                control={lineItemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Item description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={lineItemForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Item category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lineItemForm.control}
                  name="chargeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charge Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select charge type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="guest_billable">Guest Billable</SelectItem>
                          <SelectItem value="owner_billable">Owner Billable</SelectItem>
                          <SelectItem value="company_expense">Company Expense</SelectItem>
                          <SelectItem value="complimentary">Complimentary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={lineItemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lineItemForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={lineItemForm.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Reference number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lineItemForm.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vendor name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowLineItemDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addLineItemMutation.isPending}>
                  {addLineItemMutation.isPending ? 'Adding...' : 'Add Line Item'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}