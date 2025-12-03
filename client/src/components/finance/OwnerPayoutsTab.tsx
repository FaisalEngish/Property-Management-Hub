/**
 * Owner Payouts Tab Component
 * Shows owner payout calculations with property breakdown
 */

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
  DialogTrigger 
} from "@/components/ui/dialog";
import { DollarSign, Eye, CheckCircle, Clock } from "lucide-react";
import { FinancialFilters } from "@/pages/AdminFinance";

interface OwnerPayoutsTabProps {
  filters: FinancialFilters;
}

export function OwnerPayoutsTab({ filters }: OwnerPayoutsTabProps) {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.set('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.set('endDate', filters.endDate.toISOString());
  if (filters.propertyIds) queryParams.set('propertyIds', filters.propertyIds.join(','));
  if (filters.stakeholderIds) queryParams.set('ownerIds', filters.stakeholderIds.join(','));

  const { data: ownerPayouts = [], isLoading } = useQuery({
    queryKey: [`/api/admin/finance/owner-payouts?${queryParams}`],
  });

  const handleMarkPaid = (ownerId: string, amount: number) => {
    // TODO: Implement mark as paid functionality
    console.log('Mark paid:', ownerId, amount);
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

  const totalPayout = ownerPayouts.reduce((sum: number, owner: any) => sum + owner.earnings.net, 0);

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
              <p className="text-2xl font-bold">${totalPayout.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Number of Owners</p>
              <p className="text-2xl font-bold">{ownerPayouts.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Properties Involved</p>
              <p className="text-2xl font-bold">
                {ownerPayouts.reduce((sum: number, owner: any) => sum + owner.properties.length, 0)}
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
          <Table>
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
                  <TableCell>
                    <div>
                      <div className="font-medium">{owner.stakeholderName}</div>
                      <div className="text-sm text-muted-foreground">{owner.stakeholderId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  <TableCell className="text-right">
                    ${owner.earnings.gross.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${owner.earnings.deductions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${owner.earnings.net.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(owner.earnings.status)}
                  </TableCell>
                  <TableCell>
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
                                      ${property.revenue.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${(property.revenue - property.commission).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      ${property.commission.toLocaleString()}
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
                          onClick={() => handleMarkPaid(owner.stakeholderId, owner.earnings.net)}
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

          {ownerPayouts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No owner payouts found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}