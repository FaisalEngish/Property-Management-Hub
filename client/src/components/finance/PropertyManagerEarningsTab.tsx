/**
 * Property Manager Earnings Tab Component
 * Shows PM earnings with their commission splits and property assignments
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
import { UserCheck, TrendingUp, Building2, CheckCircle, Clock } from "lucide-react";
import { FinancialFilters } from "@/pages/AdminFinance";

interface PropertyManagerEarningsTabProps {
  filters: FinancialFilters;
}

export function PropertyManagerEarningsTab({ filters }: PropertyManagerEarningsTabProps) {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.set('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.set('endDate', filters.endDate.toISOString());
  if (filters.propertyIds) queryParams.set('propertyIds', filters.propertyIds.join(','));
  if (filters.stakeholderIds) queryParams.set('managerIds', filters.stakeholderIds.join(','));

  const { data: pmEarnings = [], isLoading } = useQuery({
    queryKey: [`/api/admin/finance/pm-earnings?${queryParams}`],
  });

  const handleMarkPaid = (managerId: string, amount: number) => {
    // TODO: Implement mark as paid functionality
    console.log('Mark paid:', managerId, amount);
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

  const totalEarnings = pmEarnings.reduce((sum: number, pm: any) => sum + pm.earnings.net, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Property Manager Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total PM Earnings</p>
              <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Managers</p>
              <p className="text-2xl font-bold">{pmEarnings.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Properties Managed</p>
              <p className="text-2xl font-bold">
                {pmEarnings.reduce((sum: number, pm: any) => sum + pm.properties.length, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PM Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Manager Commission Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Manager</TableHead>
                <TableHead>Properties Managed</TableHead>
                <TableHead className="text-right">Total Revenue Generated</TableHead>
                <TableHead className="text-right">Commission Split</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pmEarnings.map((pm: any) => {
                const totalRevenue = pm.properties.reduce((sum: number, prop: any) => sum + prop.revenue, 0);
                // For demo purposes, assume 50% split
                const splitPercentage = 50;
                
                return (
                  <TableRow key={pm.stakeholderId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{pm.stakeholderName}</div>
                          <div className="text-sm text-muted-foreground">Portfolio Manager</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {pm.properties.slice(0, 2).map((property: any) => (
                          <div key={property.propertyId} className="text-sm flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {property.propertyName}
                          </div>
                        ))}
                        {pm.properties.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{pm.properties.length - 2} more properties
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        ${totalRevenue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{splitPercentage}%</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${pm.earnings.net.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pm.earnings.status)}
                    </TableCell>
                    <TableCell>
                      {pm.earnings.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(pm.stakeholderId, pm.earnings.net)}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {pmEarnings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No property manager earnings found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {pmEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pmEarnings.map((pm: any) => {
                const avgRevenuePerProperty = pm.properties.reduce((sum: number, prop: any) => sum + prop.revenue, 0) / pm.properties.length;
                return (
                  <div key={pm.stakeholderId} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{pm.stakeholderName}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Properties:</span>
                        <span>{pm.properties.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Revenue/Property:</span>
                        <span>${avgRevenuePerProperty.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commission Rate:</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}