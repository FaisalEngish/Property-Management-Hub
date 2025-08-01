import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, DollarSign, Users, History, User, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

interface UserForReset {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface UserBalanceSummary {
  currentBalance: number;
  userType: string;
}

interface BalanceResetAudit {
  id: number;
  userId: string;
  userType: string;
  previousBalance: string;
  newBalance: string;
  resetReason: string | null;
  adminUserId: string;
  propertyId: number | null;
  createdAt: Date;
  userEmail: string;
  userFirstName: string | null;
  userLastName: string | null;
  adminEmail: string;
  adminFirstName: string | null;
  adminLastName: string | null;
}

export default function FinanceResetControl() {
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [resetReason, setResetReason] = useState<string>("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserForReset | null>(null);
  const [balanceSummary, setBalanceSummary] = useState<UserBalanceSummary | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users available for balance reset
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/balance-reset/users', selectedUserType],
    queryFn: () => apiRequest('GET', `/api/admin/balance-reset/users?userType=${selectedUserType}`),
  });

  // Fetch audit log
  const { data: auditLog = [], isLoading: auditLoading } = useQuery({
    queryKey: ['/api/admin/balance-reset/audit'],
    queryFn: () => apiRequest('GET', '/api/admin/balance-reset/audit'),
  });

  // Reset balance mutation
  const resetBalanceMutation = useMutation({
    mutationFn: async (data: { userId: string; resetReason?: string }) => {
      return await apiRequest('POST', '/api/admin/balance-reset/execute', data);
    },
    onSuccess: () => {
      toast({
        title: "Balance Reset Successful",
        description: "User balance has been reset to zero.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/balance-reset'] });
      setIsConfirmDialogOpen(false);
      setSelectedUserId("");
      setResetReason("");
      setUserToReset(null);
      setBalanceSummary(null);
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset user balance",
        variant: "destructive",
      });
    },
  });

  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u: UserForReset) => u.id === userId);
    if (user) {
      setUserToReset(user);
      
      // Fetch balance summary for selected user
      try {
        const summary = await apiRequest('GET', `/api/admin/balance-reset/user/${userId}/balance`);
        setBalanceSummary(summary);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    }
  };

  const handleResetConfirm = () => {
    if (!selectedUserId) return;
    
    resetBalanceMutation.mutate({
      userId: selectedUserId,
      resetReason: resetReason.trim() || undefined,
    });
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'owner': return 'bg-blue-100 text-blue-800';
      case 'portfolio-manager': return 'bg-green-100 text-green-800';
      case 'referral-agent': return 'bg-purple-100 text-purple-800';
      case 'retail-agent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUserName = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return email;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Reset Control</h1>
          <p className="text-gray-600">Admin-only balance management and audit controls</p>
        </div>
      </div>

      <Tabs defaultValue="reset" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reset">Balance Reset</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="reset">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select User for Reset
                </CardTitle>
                <CardDescription>
                  Choose a user type and specific user to reset their balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="user-type">User Type</Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                      <SelectItem value="referral-agent">Referral Agent</SelectItem>
                      <SelectItem value="retail-agent">Retail Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="user-select">Select User</Label>
                  <Select value={selectedUserId} onValueChange={handleUserSelect} disabled={usersLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={usersLoading ? "Loading users..." : "Select user"} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: UserForReset) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getUserTypeColor(user.role)}>
                              {user.role.replace('-', ' ')}
                            </Badge>
                            {formatUserName(user.firstName, user.lastName, user.email)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reset-reason">Reset Reason (Optional)</Label>
                  <Textarea
                    id="reset-reason"
                    placeholder="Enter reason for balance reset..."
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Balance Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Balance
                </CardTitle>
                <CardDescription>
                  Review balance before confirming reset
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userToReset && balanceSummary ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {formatUserName(userToReset.firstName, userToReset.lastName, userToReset.email)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getUserTypeColor(balanceSummary.userType)}>
                        {balanceSummary.userType.replace('-', ' ')}
                      </Badge>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Current Balance</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${balanceSummary.currentBalance.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>Warning:</strong> This action will reset the balance to $0.00 and cannot be undone.
                        All pending payouts will be marked as "reset".
                      </div>
                    </div>

                    <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          disabled={balanceSummary.currentBalance === 0}
                        >
                          Reset Balance to Zero
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Balance Reset</DialogTitle>
                          <DialogDescription>
                            You are about to reset the balance for{' '}
                            <strong>{formatUserName(userToReset.firstName, userToReset.lastName, userToReset.email)}</strong>{' '}
                            from <strong>${balanceSummary.currentBalance.toFixed(2)}</strong> to <strong>$0.00</strong>.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-gray-600">
                            This action will permanently reset all pending balances and cannot be undone.
                            {resetReason && (
                              <>
                                <br /><br />
                                <strong>Reason:</strong> {resetReason}
                              </>
                            )}
                          </p>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsConfirmDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleResetConfirm}
                            disabled={resetBalanceMutation.isPending}
                          >
                            {resetBalanceMutation.isPending ? "Resetting..." : "Confirm Reset"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : selectedUserId ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading balance information...
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a user to view their current balance
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Balance Reset Audit Log
              </CardTitle>
              <CardDescription>
                Complete history of all balance reset operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-500 mt-2">Loading audit log...</p>
                </div>
              ) : auditLog.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No balance reset operations found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Previous Balance</TableHead>
                        <TableHead>Reset By</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLog.map((record: BalanceResetAudit) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {format(new Date(record.createdAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {formatUserName(record.userFirstName, record.userLastName, record.userEmail)}
                              </div>
                              <div className="text-sm text-gray-500">{record.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getUserTypeColor(record.userType)}>
                              {record.userType.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono">
                              ${parseFloat(record.previousBalance).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatUserName(record.adminFirstName, record.adminLastName, record.adminEmail)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {record.resetReason || 'No reason provided'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}