import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  Receipt, 
  FileText, 
  TrendingUp, 
  Users, 
  ShieldCheck,
  PlusCircle,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  CreditCard,
  FileDown,
  Settings
} from "lucide-react";

export default function EnhancedFinancialControls() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("owner-balances");

  // Check user permissions for each component
  const canViewOwnerBalances = ['admin', 'portfolio-manager', 'owner'].includes(user?.role);
  const canViewPayoutRequests = ['admin', 'portfolio-manager', 'owner'].includes(user?.role);
  const canViewInvoices = ['admin', 'portfolio-manager', 'owner'].includes(user?.role);
  const canViewPMEarnings = ['admin', 'portfolio-manager'].includes(user?.role);
  const canViewStaffSalary = ['admin', 'portfolio-manager', 'staff'].includes(user?.role);
  const canViewBalanceReset = user?.role === 'admin';

  // Component 1: Owner Balance Dashboard
  const OwnerBalanceDashboard = () => {
    const { data: ownerBalances, isLoading } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/owner-balances'],
      enabled: canViewOwnerBalances,
    });

    const { data: dashboard } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/dashboard'],
      enabled: ['admin', 'portfolio-manager'].includes(user?.role),
    });

    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Owner Balances</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ฿{dashboard?.totalOwnerBalances?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Current available balances
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ฿{dashboard?.pendingPayouts?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval/payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboard?.systemHealth || 'Operational'}
              </div>
              <p className="text-xs text-muted-foreground">
                All systems running
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Owner Balances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Balance Overview</CardTitle>
            <CardDescription>
              Current financial status for all property owners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>This Month Earnings</TableHead>
                  <TableHead>Pending Payouts</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownerBalances?.map((balance: any) => (
                  <TableRow key={balance.id}>
                    <TableCell className="font-medium">{balance.ownerName}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        parseFloat(balance.currentBalance) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ฿{parseFloat(balance.currentBalance).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>฿{parseFloat(balance.thisMonthEarnings).toLocaleString()}</TableCell>
                    <TableCell>฿{parseFloat(balance.pendingPayouts).toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(balance.lastCalculated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Component 2: Payout Request Workflow
  const PayoutRequestWorkflow = () => {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data: payoutRequests, isLoading } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/payout-requests', { status: selectedStatus !== 'all' ? selectedStatus : undefined }],
      enabled: canViewPayoutRequests,
    });

    const createPayoutMutation = useMutation({
      mutationFn: async (data: any) => {
        return await apiRequest("POST", "/api/enhanced-financial-controls/payout-requests", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/enhanced-financial-controls/payout-requests'] });
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Payout request created successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create payout request",
          variant: "destructive",
        });
      },
    });

    const getStatusBadge = (status: string) => {
      const statusMap: { [key: string]: { label: string; variant: any } } = {
        pending: { label: "Pending", variant: "secondary" },
        approved: { label: "Approved", variant: "default" },
        payment_uploaded: { label: "Payment Uploaded", variant: "outline" },
        confirmed: { label: "Confirmed", variant: "default" },
        rejected: { label: "Rejected", variant: "destructive" },
      };
      
      const statusInfo = statusMap[status] || { label: status, variant: "outline" };
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    };

    return (
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Payout Request Management</h3>
            <p className="text-sm text-muted-foreground">Manage owner payout requests and approvals</p>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="payment_uploaded">Payment Uploaded</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {user?.role === 'owner' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Payout Request</DialogTitle>
                    <DialogDescription>
                      Request a payout from your available balance
                    </DialogDescription>
                  </DialogHeader>
                  {/* Payout request form would go here */}
                  <DialogFooter>
                    <Button 
                      onClick={() => setIsCreateDialogOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createPayoutMutation.mutate({})}
                      disabled={createPayoutMutation.isPending}
                    >
                      Create Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Payout Requests Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : payoutRequests?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  payoutRequests?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono">#{request.id}</TableCell>
                      <TableCell>{request.ownerName || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">
                        ฿{parseFloat(request.requestedAmount || '0').toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.requestStatus)}</TableCell>
                      <TableCell>
                        {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{request.paymentMethod || 'Bank Transfer'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user?.role !== 'owner' && request.requestStatus === 'pending' && (
                            <>
                              <Button variant="default" size="sm">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="sm">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Component 3: Enhanced Invoice Tool (Simplified)
  const EnhancedInvoiceTool = () => {
    const { data: invoices, isLoading } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/invoices'],
      enabled: canViewInvoices,
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Invoice Management</h3>
            <p className="text-sm text-muted-foreground">Create and manage invoices between all parties</p>
          </div>
          {['admin', 'portfolio-manager'].includes(user?.role) && (
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invoices found - feature implementation in progress
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Component 4: Portfolio Manager Earnings
  const PortfolioManagerEarnings = () => {
    const { data: pmEarnings, isLoading } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/pm-earnings'],
      enabled: canViewPMEarnings,
    });

    const { data: pmSummary } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/pm-summary', user?.id],
      enabled: user?.role === 'portfolio-manager',
    });

    return (
      <div className="space-y-6">
        {user?.role === 'portfolio-manager' && pmSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{pmSummary.totalEarnings?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties Managed</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pmSummary.propertiesManaged || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  ฿{pmSummary.pendingPayouts?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Manager Earnings</CardTitle>
            <CardDescription>
              Commission tracking and payout management
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Portfolio manager earnings data will be displayed here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Component 5: Staff Salary & Advance Requests
  const StaffSalaryAdvanceRequests = () => {
    const { data: advanceRequests, isLoading } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/staff-advance-requests'],
      enabled: canViewStaffSalary,
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Staff Salary & Advance Management</h3>
            <p className="text-sm text-muted-foreground">Manage staff salary settings and advance requests</p>
          </div>
          {user?.role === 'staff' && (
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Request Advance
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advance Requests</CardTitle>
            <CardDescription>
              Current salary advance requests and approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No advance requests found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Component 6: Balance Reset Control (Admin Only)
  const BalanceResetControl = () => {
    const { data: users, isLoading } = useQuery({
      queryKey: ['/api/enhanced-financial-controls/users-for-balance-reset'],
      enabled: canViewBalanceReset,
    });

    const resetBalanceMutation = useMutation({
      mutationFn: async (data: { userId: string; reason: string }) => {
        return await apiRequest("POST", "/api/enhanced-financial-controls/reset-user-balance", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/enhanced-financial-controls/users-for-balance-reset'] });
        toast({
          title: "Success",
          description: "User balance reset successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to reset user balance",
          variant: "destructive",
        });
      },
    });

    if (!canViewBalanceReset) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Access denied: Admin privileges required</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Balance reset operations are irreversible and will be logged for audit purposes.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Balance Reset Control</CardTitle>
            <CardDescription>
              Reset user balances with full audit trail (Admin Only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Pending Payouts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found for balance reset
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          user.currentBalance > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ฿{user.currentBalance?.toLocaleString() || '0'}
                        </span>
                      </TableCell>
                      <TableCell>฿{user.pendingPayouts?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        {user.currentBalance !== 0 && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => resetBalanceMutation.mutate({ 
                              userId: user.id, 
                              reason: "Admin balance reset" 
                            })}
                            disabled={resetBalanceMutation.isPending}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reset Balance
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!canViewOwnerBalances && !canViewPayoutRequests && !canViewInvoices && !canViewPMEarnings && !canViewStaffSalary && !canViewBalanceReset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Access denied: Insufficient permissions to view financial controls</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enhanced Financial Controls</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive financial management system with role-based access controls
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {canViewOwnerBalances && (
            <TabsTrigger value="owner-balances" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Owner Balances
            </TabsTrigger>
          )}
          {canViewPayoutRequests && (
            <TabsTrigger value="payout-requests" className="flex items-center">
              <Receipt className="w-4 h-4 mr-2" />
              Payout Requests
            </TabsTrigger>
          )}
          {canViewInvoices && (
            <TabsTrigger value="invoices" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Invoice Tool
            </TabsTrigger>
          )}
          {canViewPMEarnings && (
            <TabsTrigger value="pm-earnings" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              PM Earnings
            </TabsTrigger>
          )}
          {canViewStaffSalary && (
            <TabsTrigger value="staff-salary" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Staff Salary
            </TabsTrigger>
          )}
          {canViewBalanceReset && (
            <TabsTrigger value="balance-reset" className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Balance Reset
            </TabsTrigger>
          )}
        </TabsList>

        {canViewOwnerBalances && (
          <TabsContent value="owner-balances">
            <OwnerBalanceDashboard />
          </TabsContent>
        )}

        {canViewPayoutRequests && (
          <TabsContent value="payout-requests">
            <PayoutRequestWorkflow />
          </TabsContent>
        )}

        {canViewInvoices && (
          <TabsContent value="invoices">
            <EnhancedInvoiceTool />
          </TabsContent>
        )}

        {canViewPMEarnings && (
          <TabsContent value="pm-earnings">
            <PortfolioManagerEarnings />
          </TabsContent>
        )}

        {canViewStaffSalary && (
          <TabsContent value="staff-salary">
            <StaffSalaryAdvanceRequests />
          </TabsContent>
        )}

        {canViewBalanceReset && (
          <TabsContent value="balance-reset">
            <BalanceResetControl />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}