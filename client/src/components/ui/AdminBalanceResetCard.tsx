import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Shield, AlertTriangle, DollarSign } from "lucide-react";

interface AdminBalanceResetCardProps {
  userId: string;
  userRole: string;
  userEmail: string;
  userName: string;
  currentBalance?: number;
  onBalanceReset?: () => void;
}

export default function AdminBalanceResetCard({
  userId,
  userRole,
  userEmail,
  userName,
  currentBalance,
  onBalanceReset
}: AdminBalanceResetCardProps) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetReason, setResetReason] = useState("");
  const [balanceData, setBalanceData] = useState<{ currentBalance: number; userType: string } | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only show for admin users
  if (user?.role !== 'admin') {
    return null;
  }

  // Only show for users with financial balances
  const eligibleRoles = ['owner', 'portfolio-manager', 'retail-agent', 'referral-agent'];
  if (!eligibleRoles.includes(userRole)) {
    return null;
  }

  // Fetch balance mutation
  const fetchBalanceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('GET', `/api/admin/balance-reset/user/${userId}/balance`);
    },
    onSuccess: (data) => {
      setBalanceData(data);
      setIsResetDialogOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch balance information",
        variant: "destructive",
      });
    },
  });

  // Reset balance mutation
  const resetBalanceMutation = useMutation({
    mutationFn: async (data: { userId: string; resetReason?: string }) => {
      return await apiRequest('POST', '/api/admin/balance-reset/execute', data);
    },
    onSuccess: () => {
      toast({
        title: "Balance Reset Successful",
        description: `${userName}'s balance has been reset to zero.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/balance-reset'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referral'] });
      setIsResetDialogOpen(false);
      setResetReason("");
      setBalanceData(null);
      onBalanceReset?.();
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset user balance",
        variant: "destructive",
      });
    },
  });

  const handleResetClick = () => {
    fetchBalanceMutation.mutate();
  };

  const handleConfirmReset = () => {
    resetBalanceMutation.mutate({
      userId,
      resetReason: resetReason.trim() || undefined,
    });
  };

  const getUserTypeDisplay = (role: string) => {
    switch (role) {
      case 'owner': return 'Property Owner';
      case 'portfolio-manager': return 'Portfolio Manager';
      case 'retail-agent': return 'Retail Agent';
      case 'referral-agent': return 'Referral Agent';
      default: return role;
    }
  };

  const getBalanceTypeDescription = (role: string) => {
    switch (role) {
      case 'owner': return 'pending payouts and commission deductions';
      case 'portfolio-manager': return 'commission earnings and payout requests';
      case 'retail-agent': return 'commission earnings and payout requests';
      case 'referral-agent': return 'referral commissions and payout requests';
      default: return 'financial balances';
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg text-red-900">Admin Controls</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            Administrative balance management for {getUserTypeDisplay(userRole)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Current Balance:</span>
              <span className="text-sm text-red-700">
                {currentBalance !== undefined ? `$${currentBalance.toFixed(2)}` : 'Loading...'}
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleResetClick}
            disabled={fetchBalanceMutation.isPending || resetBalanceMutation.isPending}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            {fetchBalanceMutation.isPending ? "Loading Balance..." : "Reset Balance to $0"}
          </Button>
          
          <p className="text-xs text-red-600">
            ⚠️ This action will clear all {getBalanceTypeDescription(userRole)} and cannot be undone.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <AlertDialogTitle>Confirm Balance Reset</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <div>
                Are you sure you want to reset <strong>{userName}</strong>'s balance to zero?
              </div>
              
              {balanceData && (
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">User:</span>
                    <span className="text-sm">{userName} ({userEmail})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm">{getUserTypeDisplay(userRole)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Current Balance:</span>
                    <span className="text-sm font-bold text-red-600">
                      ${balanceData.currentBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="resetReason" className="text-sm font-medium">
                  Reason for Reset (optional):
                </Label>
                <Textarea
                  id="resetReason"
                  placeholder="Enter reason for balance reset..."
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="min-h-16"
                />
              </div>
              
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                <strong>Warning:</strong> This action will be logged and cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReset}
              disabled={resetBalanceMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {resetBalanceMutation.isPending ? "Resetting..." : "Reset Balance"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}