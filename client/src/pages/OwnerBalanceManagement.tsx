import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  Send, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Eye,
  Settings,
  TrendingUp,
  Calendar,
  CreditCard,
  History
} from "lucide-react";

interface OwnerBalance {
  id: number;
  propertyId: number;
  propertyName: string;
  totalEarnings: string;
  totalExpenses: string;
  totalCommissions: string;
  netBalance: string;
  lastCalculatedAt: Date;
}

interface PayoutRequest {
  id: number;
  propertyId: number;
  propertyName: string;
  requestedAmount: string;
  paymentMethod: string;
  paymentDetails: string;
  notes: string;
  requestStatus: 'pending' | 'approved' | 'rejected' | 'paid' | 'confirmed';
  requestedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  confirmedAt?: Date;
  paymentSlipUrl?: string;
  adminNotes?: string;
}

interface PaymentLog {
  id: number;
  propertyId: number;
  propertyName: string;
  amount: string;
  paymentType: string;
  paymentMethod: string;
  transactionReference: string;
  processedAt: Date;
  paymentSlipUrl?: string;
}

interface PropertyPayoutSettings {
  id: number;
  propertyId: number;
  payoutFrequency: 'weekly' | 'monthly' | 'quarterly';
  minimumPayoutAmount: string;
  autoPayoutEnabled: boolean;
  payoutDay: number;
}

export default function OwnerBalanceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState({ start: '', end: '' });
  const [showPayoutRequestDialog, setShowPayoutRequestDialog] = useState(false);
  const [showPaymentConfirmDialog, setShowPaymentConfirmDialog] = useState<PayoutRequest | null>(null);

  // Queries
  const { data: balances, isLoading: balancesLoading } = useQuery<OwnerBalance[]>({
    queryKey: ["/api/owner-balances"],
    enabled: !!user,
  });

  const { data: payoutRequests, isLoading: requestsLoading } = useQuery<PayoutRequest[]>({
    queryKey: ["/api/owner-payout-requests"],
    enabled: !!user,
  });

  const { data: paymentHistory, isLoading: historyLoading } = useQuery<PaymentLog[]>({
    queryKey: ["/api/owner-payment-history"],
    enabled: !!user,
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  // Mutations
  const calculateBalanceMutation = useMutation({
    mutationFn: async (data: { propertyId: number; period: { start: string; end: string } }) => {
      return await apiRequest("POST", "/api/owner-balance/calculate", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-balances"] });
      toast({
        title: "Balance Calculated",
        description: "Your property balance has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPayoutRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/owner-payout-request", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-payout-requests"] });
      setShowPayoutRequestDialog(false);
      toast({
        title: "Payout Request Submitted",
        description: "Your payout request has been submitted for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (data: { requestId: number; notes?: string }) => {
      return await apiRequest("PUT", `/api/owner-payout-request/${data.requestId}/confirm`, { notes: data.notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-payout-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner-payment-history"] });
      setShowPaymentConfirmDialog(null);
      toast({
        title: "Payment Confirmed",
        description: "Payment receipt has been confirmed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCalculateBalance = () => {
    if (!selectedProperty || !selectedPeriod.start || !selectedPeriod.end) {
      toast({
        title: "Missing Information",
        description: "Please select a property and date range.",
        variant: "destructive",
      });
      return;
    }

    calculateBalanceMutation.mutate({
      propertyId: selectedProperty,
      period: selectedPeriod,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending", icon: Clock },
      approved: { variant: "secondary" as const, label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
      paid: { variant: "default" as const, label: "Paid", icon: DollarSign },
      confirmed: { variant: "default" as const, label: "Confirmed", icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatWithConversion = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user || user.role !== 'owner') {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              This page is only accessible to property owners.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance Management</h1>
          <p className="text-muted-foreground">
            Track your property earnings, manage payout requests, and view payment history.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPayoutRequestDialog} onOpenChange={setShowPayoutRequestDialog}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Payout Request</DialogTitle>
                <DialogDescription>
                  Submit a request to withdraw your property earnings.
                </DialogDescription>
              </DialogHeader>
              <PayoutRequestForm
                properties={properties || []}
                onSubmit={(data) => createPayoutRequestMutation.mutate(data)}
                isLoading={createPayoutRequestMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="balances" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balances">Live Balances</TabsTrigger>
          <TabsTrigger value="requests">Payout Requests</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Live Balances Tab */}
        <TabsContent value="balances" className="space-y-6">
          {/* Balance Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Balance Calculator
              </CardTitle>
              <CardDescription>
                Calculate your live balance for any property and time period.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Select value={selectedProperty?.toString() || ""} onValueChange={(value) => setSelectedProperty(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    type="date"
                    value={selectedPeriod.start}
                    onChange={(e) => setSelectedPeriod(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    type="date"
                    value={selectedPeriod.end}
                    onChange={(e) => setSelectedPeriod(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCalculateBalance}
                disabled={calculateBalanceMutation.isPending}
                className="w-full"
              >
                {calculateBalanceMutation.isPending ? "Calculating..." : "Calculate Balance"}
              </Button>
            </CardContent>
          </Card>

          {/* Balance Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {balancesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : balances?.length ? (
              balances.map((balance) => (
                <Card key={balance.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{balance.propertyName}</CardTitle>
                    <CardDescription>
                      Last updated: {formatDate(balance.lastCalculatedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gross Earnings</span>
                      <span className="font-medium text-green-600">
                        {formatWithConversion(balance.totalEarnings)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expenses</span>
                      <span className="font-medium text-red-600">
                        -{formatWithConversion(balance.totalExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Management Fee</span>
                      <span className="font-medium text-orange-600">
                        -{formatWithConversion(balance.totalCommissions)}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Net Balance</span>
                        <span className={`text-lg font-bold ${parseFloat(balance.netBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatWithConversion(balance.netBalance)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Balances Yet</h3>
                  <p className="text-muted-foreground">
                    Use the balance calculator above to calculate your property earnings.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Payout Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {requestsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : payoutRequests?.length ? (
            <div className="space-y-4">
              {payoutRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{request.propertyName}</h3>
                          {getStatusBadge(request.requestStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested: {formatWithConversion(request.requestedAmount)} via {request.paymentMethod}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(request.requestedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.requestStatus === 'paid' && request.paymentSlipUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPaymentConfirmDialog(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Receipt
                          </Button>
                        )}
                        {request.paymentSlipUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(request.paymentSlipUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Slip
                          </Button>
                        )}
                      </div>
                    </div>
                    {request.adminNotes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Admin Notes:</strong> {request.adminNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Payout Requests</h3>
                <p className="text-muted-foreground">
                  You haven't submitted any payout requests yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-6">
          {historyLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : paymentHistory?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{payment.propertyName}</span>
                          <Badge variant="outline">{payment.paymentType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {payment.transactionReference} • {formatDate(payment.processedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatWithConversion(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Payment History</h3>
                <p className="text-muted-foreground">
                  Your payment history will appear here once you receive payments.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payout Settings
              </CardTitle>
              <CardDescription>
                Configure your payout preferences for each property.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Payout settings are managed by your property manager. Contact them to update your preferences.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Confirmation Dialog */}
      {showPaymentConfirmDialog && (
        <Dialog open={!!showPaymentConfirmDialog} onOpenChange={() => setShowPaymentConfirmDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment Receipt</DialogTitle>
              <DialogDescription>
                Please confirm that you have received the payment of {formatWithConversion(showPaymentConfirmDialog.requestedAmount)}.
              </DialogDescription>
            </DialogHeader>
            <PaymentConfirmForm
              request={showPaymentConfirmDialog}
              onConfirm={(notes) => confirmPaymentMutation.mutate({ 
                requestId: showPaymentConfirmDialog.id, 
                notes 
              })}
              isLoading={confirmPaymentMutation.isPending}
              onCancel={() => setShowPaymentConfirmDialog(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Payout Request Form Component
function PayoutRequestForm({ 
  properties, 
  onSubmit, 
  isLoading 
}: { 
  properties: any[]; 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    propertyId: '',
    requestedAmount: '',
    paymentMethod: '',
    paymentDetails: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      propertyId: parseInt(formData.propertyId),
      requestedAmount: formData.requestedAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="property">Property</Label>
        <Select value={formData.propertyId} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property: any) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Requested Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.requestedAmount}
          onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="payment-method">Payment Method</Label>
        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="crypto">Cryptocurrency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="payment-details">Payment Details</Label>
        <Textarea
          id="payment-details"
          placeholder="Bank account details, PayPal email, etc."
          value={formData.paymentDetails}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentDetails: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes for this request"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Request"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Payment Confirmation Form Component
function PaymentConfirmForm({ 
  request, 
  onConfirm, 
  onCancel, 
  isLoading 
}: { 
  request: PayoutRequest; 
  onConfirm: (notes?: string) => void; 
  onCancel: () => void; 
  isLoading: boolean; 
}) {
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="confirmation-notes">Confirmation Notes (Optional)</Label>
        <Textarea
          id="confirmation-notes"
          placeholder="Any additional notes about the payment receipt"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(notes)} disabled={isLoading}>
          {isLoading ? "Confirming..." : "Confirm Receipt"}
        </Button>
      </DialogFooter>
    </div>
  );
}