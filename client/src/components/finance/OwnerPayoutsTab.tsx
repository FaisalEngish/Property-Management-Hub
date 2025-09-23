/**
 * Owner Payouts Tab Component
 * Shows owner payout calculations with property breakdown
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Eye, CheckCircle, Clock } from "lucide-react";
import { FinancialFilters } from "@/pages/AdminFinance";

interface OwnerPayoutsTabProps {
  filters: FinancialFilters;
}

export function OwnerPayoutsTab({ filters }: OwnerPayoutsTabProps) {
  const [confirmPaymentOwnerId, setConfirmPaymentOwnerId] = useState<string | null>(null);
  const [confirmPaymentAmount, setConfirmPaymentAmount] = useState<number>(0);
  const { toast } = useToast();
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.set('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.set('endDate', filters.endDate.toISOString());
  if (filters.propertyIds) queryParams.set('propertyIds', filters.propertyIds.join(','));
  if (filters.stakeholderIds) queryParams.set('ownerIds', filters.stakeholderIds.join(','));

  const { data: ownerPayouts = [], isLoading } = useQuery({
    queryKey: [`/api/admin/finance/owner-payouts?${queryParams}`],
  });

  const handleMarkPaidConfirm = () => {
    // TODO: Implement mark as paid functionality
    console.log('Mark paid:', confirmPaymentOwnerId, confirmPaymentAmount);
    
    // Show success toast
    toast({
      title: "Payment Marked as Paid",
      description: `Successfully marked payment of ฿${confirmPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} as paid.`,
      duration: 3000,
    });
    
    // Close dialog
    setConfirmPaymentOwnerId(null);
    setConfirmPaymentAmount(0);
  };

  const openPaymentConfirmation = (ownerId: string, amount: number) => {
    setConfirmPaymentOwnerId(ownerId);
    setConfirmPaymentAmount(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'queued':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Queued</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  const totalPayout = ownerPayouts.reduce((sum: number, owner: any) => sum + (owner.earnings?.net || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Owner Payouts Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Payouts Due</p>
              <p className="text-2xl font-bold">฿{(totalPayout || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Number of Owners</p>
              <p className="text-2xl font-bold">{ownerPayouts.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Properties Involved</p>
              <p className="text-2xl font-bold">
                {ownerPayouts.reduce((sum: number, owner: any) => sum + (owner.properties?.length || 0), 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Owner Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead className="text-right">Gross Revenue</TableHead>
                <TableHead className="text-right">Management Fees</TableHead>
                <TableHead className="text-right">Net Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerPayouts.map((owner: any) => (
                <TableRow key={owner.stakeholderId}>
                  <TableCell className="min-w-[150px]">
                    <div>
                      <div className="font-medium">{owner.stakeholderName}</div>
                      <div className="text-sm text-muted-foreground">{owner.stakeholderId}</div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <div className="space-y-1">
                      {owner.properties.slice(0, 2).map((property: any) => (
                        <div key={property.propertyId} className="text-sm">
                          {property.propertyName}
                        </div>
                      ))}
                      {owner.properties.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{owner.properties.length - 2} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right min-w-[100px]">
                    ฿{(owner.earnings?.gross || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right min-w-[100px]">
                    ฿{(owner.earnings?.deductions || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium min-w-[100px]">
                    ฿{(owner.earnings?.net || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="min-w-[80px]">
                    {getStatusBadge(owner.earnings.status)}
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{owner.stakeholderName} - Property Breakdown</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Property</TableHead>
                                  <TableHead className="text-right">Revenue</TableHead>
                                  <TableHead className="text-right">Management Fee</TableHead>
                                  <TableHead className="text-right">Net Payout</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {owner.properties.map((property: any) => (
                                  <TableRow key={property.propertyId}>
                                    <TableCell>{property.propertyName}</TableCell>
                                    <TableCell className="text-right">
                                      ฿{(property.revenue || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ฿{((property.revenue || 0) - (property.commission || 0)).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      ฿{(property.commission || 0).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {owner.earnings.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => openPaymentConfirmation(owner.stakeholderId, owner.earnings?.net || 0)}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {ownerPayouts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No owner payouts found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Confirmation Dialog */}
      <Dialog open={!!confirmPaymentOwnerId} onOpenChange={() => setConfirmPaymentOwnerId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to mark this payment as paid?
            </p>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  ฿{confirmPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleMarkPaidConfirm} className="bg-green-600 hover:bg-green-700">
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}