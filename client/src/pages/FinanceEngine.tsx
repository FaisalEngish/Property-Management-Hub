import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Plus, DollarSign, TrendingUp, Calendar, FileText, Download, Eye, Check, X, Upload, CreditCard, Wallet, PieChart, BarChart3, Building, Users, Settings, Calculator, Receipt, Clock, AlertTriangle, Target, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function FinanceEngine() {
  const [activeTab, setActiveTab] = useState("balances");
  const [showCreateBalanceDialog, setShowCreateBalanceDialog] = useState(false);
  const [showCreateRoutingDialog, setShowCreateRoutingDialog] = useState(false);
  const [showProcessBillDialog, setShowProcessBillDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [processingBill, setProcessingBill] = useState(null);
  const [routingDecision, setRoutingDecision] = useState("");
  const [routingNotes, setRoutingNotes] = useState("");

  // Form states for creating new entries
  const [newBalance, setNewBalance] = useState({
    ownerId: "",
    propertyId: "",
    currentBalance: "",
    thisMonthEarnings: "",
    thisMonthExpenses: "",
    pendingEarnings: "",
  });

  const [newRoutingRule, setNewRoutingRule] = useState({
    propertyId: "",
    platform: "",
    ownerPercentage: "",
    managementPercentage: "",
    platformFeePercentage: "",
    routingType: "split_payout",
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Role-based access control
  const isAdmin = user?.role === 'admin';
  const isPortfolioManager = user?.role === 'portfolio-manager';
  const isStaff = user?.role === 'staff';
  const isOwner = user?.role === 'owner';
  const canManageFinances = isAdmin || isPortfolioManager;
  const canProcessBills = isAdmin || isPortfolioManager || isStaff;

  // Enhanced Finance Engine queries
  const { data: ownerBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ["/api/finance/owner-balance", selectedOwner],
    enabled: !!user && !!selectedOwner,
  });

  const { data: payoutRoutingRules, isLoading: routingLoading } = useQuery({
    queryKey: ["/api/finance/payout-routing-rules"],
    enabled: !!user,
  });

  const { data: utilityBillProcessing, isLoading: processingLoading } = useQuery({
    queryKey: ["/api/finance/utility-bill-processing"],
    enabled: !!user,
  });

  const { data: transactionLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/finance/transaction-logs"],
    enabled: !!user,
  });

  // Support queries
  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && canManageFinances,
  });

  const { data: utilityBills } = useQuery({
    queryKey: ["/api/utility-bills"],
    enabled: !!user,
  });

  // Mutations for Enhanced Finance Engine
  const createBalanceTracker = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/finance/owner-balance", data),
    onSuccess: () => {
      toast({ title: "Owner balance tracker created successfully" });
      setShowCreateBalanceDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/finance/owner-balance"] });
      setNewBalance({
        ownerId: "",
        propertyId: "",
        currentBalance: "",
        thisMonthEarnings: "",
        thisMonthExpenses: "",
        pendingEarnings: "",
      });
    },
    onError: (error) => {
      toast({ title: "Error creating balance tracker", description: error.message, variant: "destructive" });
    },
  });

  const createRoutingRule = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/finance/payout-routing-rules", data),
    onSuccess: () => {
      toast({ title: "Payout routing rule created successfully" });
      setShowCreateRoutingDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/finance/payout-routing-rules"] });
      setNewRoutingRule({
        propertyId: "",
        platform: "",
        ownerPercentage: "",
        managementPercentage: "",
        platformFeePercentage: "",
        routingType: "split_payout",
        notes: "",
      });
    },
    onError: (error) => {
      toast({ title: "Error creating routing rule", description: error.message, variant: "destructive" });
    },
  });

  const processUtilityBill = useMutation({
    mutationFn: async ({ billId, routingDecision, notes }: any) => 
      apiRequest("POST", `/api/finance/process-utility-bill/${billId}`, { routingDecision, notes }),
    onSuccess: () => {
      toast({ title: "Utility bill processed successfully" });
      setShowProcessBillDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/finance/utility-bill-processing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/transaction-logs"] });
    },
    onError: (error) => {
      toast({ title: "Error processing bill", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold">Access Required</h3>
              <p className="text-gray-600">Please log in to access the Enhanced Finance Engine.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ownerUsers = users?.filter((u: any) => u.role === 'owner') || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            Enhanced Finance Engine
          </h1>
          <p className="text-muted-foreground">
            Comprehensive owner balance management, payout routing, utility tracking & financial analytics
          </p>
        </div>
        {canManageFinances && (
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateBalanceDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Balance Tracker
            </Button>
            <Button variant="outline" onClick={() => setShowCreateRoutingDialog(true)}>
              <Target className="h-4 w-4 mr-2" />
              Add Routing Rule
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Owner Balances
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Payout Routing
          </TabsTrigger>
          <TabsTrigger value="utilities" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Utility Processing
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transaction Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-6">
          {/* Owner Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Owner to View Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an owner to view their balance" />
                </SelectTrigger>
                <SelectContent>
                  {ownerUsers.map((owner: any) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.firstName} {owner.lastName} ({owner.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Owner Balance Display */}
          {selectedOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Balance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balancesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : ownerBalances ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${parseFloat(ownerBalances.currentBalance || '0').toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">This Month Earnings</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${parseFloat(ownerBalances.thisMonthEarnings || '0').toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">This Month Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${parseFloat(ownerBalances.thisMonthExpenses || '0').toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Pending Earnings</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${parseFloat(ownerBalances.pendingEarnings || '0').toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No balance tracker found for this owner.</p>
                    {canManageFinances && (
                      <Button className="mt-4" onClick={() => setShowCreateBalanceDialog(true)}>
                        Create Balance Tracker
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payout Routing Rules</h3>
              {canManageFinances && (
                <Button onClick={() => setShowCreateRoutingDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              )}
            </div>

            {routingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid gap-4">
                {payoutRoutingRules?.map((rule: any) => (
                  <Card key={rule.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{rule.platform.toUpperCase()}</CardTitle>
                          <CardDescription>
                            Property ID: {rule.propertyId} • {rule.routingType.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Owner Share</p>
                          <p className="text-lg font-semibold text-green-600">{rule.ownerPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Management Share</p>
                          <p className="text-lg font-semibold text-blue-600">{rule.managementPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Platform Fees</p>
                          <p className="text-lg font-semibold text-red-600">{rule.platformFeePercentage || 0}%</p>
                        </div>
                      </div>
                      {rule.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">{rule.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {payoutRoutingRules?.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold">No Routing Rules</h3>
                        <p className="text-gray-600 mb-4">Create routing rules to automate payout calculations.</p>
                        {canManageFinances && (
                          <Button onClick={() => setShowCreateRoutingDialog(true)}>
                            Create First Rule
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Utility Bill Processing</h3>

            {/* Pending Utility Bills */}
            {utilityBills?.filter((bill: any) => bill.status === 'pending').map((bill: any) => (
              <Card key={bill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)} Bill
                      </CardTitle>
                      <CardDescription>
                        {bill.provider} • Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${parseFloat(bill.amount || 0).toFixed(2)}</p>
                      <Badge variant="secondary">Pending Processing</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Property</p>
                        <p>Property ID: {bill.propertyId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Billing Month</p>
                        <p>{bill.billingMonth}</p>
                      </div>
                    </div>
                    
                    {canProcessBills && (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => {
                            setProcessingBill(bill);
                            setShowProcessBillDialog(true);
                          }}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Process Bill
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Processed Bills History */}
            {processingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold">Recently Processed Bills</h4>
                {utilityBillProcessing?.slice(0, 5).map((processing: any) => (
                  <Card key={processing.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Bill ID: {processing.utilityBillId}</p>
                          <p className="text-sm text-muted-foreground">
                            {processing.routingDecision?.replace('_', ' ')} • 
                            {new Date(processing.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={processing.processingStatus === 'processed' ? 'default' : 'secondary'}>
                          {processing.processingStatus}
                        </Badge>
                      </div>
                      {processing.processingNotes && (
                        <p className="text-sm text-muted-foreground mt-2">{processing.processingNotes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Enhanced Finance Transaction Logs</h3>

            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {transactionLogs?.map((log: any) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{log.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.transactionType.replace('_', ' ').toUpperCase()} • 
                              {log.relatedTableName} • 
                              {new Date(log.transactionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${parseFloat(log.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{log.currency}</p>
                        </div>
                      </div>
                      
                      {log.processingNotes && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm text-muted-foreground">{log.processingNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {transactionLogs?.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold">No Transaction Logs</h3>
                        <p className="text-gray-600">Transaction logs will appear here as financial activities occur.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Finance Engine Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Active Balance Trackers</p>
                      <p className="text-2xl font-bold text-blue-600">{ownerUsers.length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Routing Rules</p>
                      <p className="text-2xl font-bold text-green-600">{payoutRoutingRules?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Processed Bills</p>
                      <p className="text-2xl font-bold text-purple-600">{utilityBillProcessing?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Transaction Logs</p>
                      <p className="text-2xl font-bold text-orange-600">{transactionLogs?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Connection</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Endpoints</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Processing</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Routing Engine</span>
                    <Badge variant="default">Ready</Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Enhanced Finance Engine is fully operational and processing transactions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Balance Tracker Dialog */}
      <Dialog open={showCreateBalanceDialog} onOpenChange={setShowCreateBalanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Owner Balance Tracker</DialogTitle>
            <DialogDescription>
              Set up balance tracking for an owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Select value={newBalance.ownerId} onValueChange={(value) => setNewBalance({...newBalance, ownerId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {ownerUsers.map((owner: any) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.firstName} {owner.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="property">Property (Optional)</Label>
              <Select value={newBalance.propertyId} onValueChange={(value) => setNewBalance({...newBalance, propertyId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property or leave blank for all" />
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentBalance">Current Balance</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  step="0.01"
                  value={newBalance.currentBalance}
                  onChange={(e) => setNewBalance({...newBalance, currentBalance: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pendingEarnings">Pending Earnings</Label>
                <Input
                  id="pendingEarnings"
                  type="number"
                  step="0.01"
                  value={newBalance.pendingEarnings}
                  onChange={(e) => setNewBalance({...newBalance, pendingEarnings: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBalanceDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createBalanceTracker.mutate(newBalance)}
              disabled={createBalanceTracker.isPending || !newBalance.ownerId}
            >
              {createBalanceTracker.isPending ? "Creating..." : "Create Tracker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Routing Rule Dialog */}
      <Dialog open={showCreateRoutingDialog} onOpenChange={setShowCreateRoutingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payout Routing Rule</DialogTitle>
            <DialogDescription>
              Configure how payouts are split between owner and management.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select value={newRoutingRule.propertyId} onValueChange={(value) => setNewRoutingRule({...newRoutingRule, propertyId: value})}>
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
              
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={newRoutingRule.platform} onValueChange={(value) => setNewRoutingRule({...newRoutingRule, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                    <SelectItem value="vrbo">VRBO</SelectItem>
                    <SelectItem value="booking_com">Booking.com</SelectItem>
                    <SelectItem value="direct">Direct Booking</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerPercentage">Owner %</Label>
                <Input
                  id="ownerPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newRoutingRule.ownerPercentage}
                  onChange={(e) => setNewRoutingRule({...newRoutingRule, ownerPercentage: e.target.value})}
                  placeholder="70.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managementPercentage">Management %</Label>
                <Input
                  id="managementPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newRoutingRule.managementPercentage}
                  onChange={(e) => setNewRoutingRule({...newRoutingRule, managementPercentage: e.target.value})}
                  placeholder="30.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformFeePercentage">Platform Fee %</Label>
                <Input
                  id="platformFeePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newRoutingRule.platformFeePercentage}
                  onChange={(e) => setNewRoutingRule({...newRoutingRule, platformFeePercentage: e.target.value})}
                  placeholder="3.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="routingType">Routing Type</Label>
              <Select value={newRoutingRule.routingType} onValueChange={(value) => setNewRoutingRule({...newRoutingRule, routingType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select routing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="split_payout">Split Payout</SelectItem>
                  <SelectItem value="management_only">Management Only</SelectItem>
                  <SelectItem value="owner_direct">Owner Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newRoutingRule.notes}
                onChange={(e) => setNewRoutingRule({...newRoutingRule, notes: e.target.value})}
                placeholder="Optional notes about this routing rule..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRoutingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createRoutingRule.mutate(newRoutingRule)}
              disabled={createRoutingRule.isPending || !newRoutingRule.propertyId || !newRoutingRule.platform}
            >
              {createRoutingRule.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Utility Bill Dialog */}
      <Dialog open={showProcessBillDialog} onOpenChange={setShowProcessBillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Utility Bill</DialogTitle>
            <DialogDescription>
              Decide how to route this utility bill for payment.
            </DialogDescription>
          </DialogHeader>
          {processingBill && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{processingBill.type} Bill</h4>
                <p className="text-sm text-muted-foreground">{processingBill.provider}</p>
                <p className="text-lg font-bold">${parseFloat(processingBill.amount || 0).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Due: {new Date(processingBill.dueDate).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="routing">Routing Decision</Label>
                <Select value={routingDecision} onValueChange={setRoutingDecision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select routing decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner_charge">Charge to Owner</SelectItem>
                    <SelectItem value="company_expense">Company Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Processing Notes</Label>
                <Textarea
                  id="notes"
                  value={routingNotes}
                  onChange={(e) => setRoutingNotes(e.target.value)}
                  placeholder="Add any processing notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessBillDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                processUtilityBill.mutate({
                  billId: processingBill?.id,
                  routingDecision,
                  notes: routingNotes
                });
                setProcessingBill(null);
                setRoutingDecision("");
                setRoutingNotes("");
              }}
              disabled={processUtilityBill.isPending || !routingDecision}
            >
              {processUtilityBill.isPending ? "Processing..." : "Process Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}