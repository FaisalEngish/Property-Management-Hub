/**
 * Staff Wages Tab Component
 * Shows staff wage calculations and payments
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
import { Users2, Clock, DollarSign, CheckCircle, User, Calendar } from "lucide-react";
import { FinancialFilters } from "@/pages/AdminFinance";

interface StaffWagesTabProps {
  filters: FinancialFilters;
}

export function StaffWagesTab({ filters }: StaffWagesTabProps) {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.set('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.set('endDate', filters.endDate.toISOString());
  if (filters.stakeholderIds) queryParams.set('staffIds', filters.stakeholderIds.join(','));

  const { data: staffWages = [], isLoading } = useQuery({
    queryKey: [`/api/admin/finance/staff-wages?${queryParams}`],
  });

  const handleMarkPaid = (staffId: string, amount: number) => {
    // TODO: Implement mark as paid functionality
    console.log('Mark paid:', staffId, amount);
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

  const getPositionBadge = (position: string) => {
    const colors: { [key: string]: string } = {
      'Head of Housekeeping': 'bg-blue-100 text-blue-800',
      'Maintenance Manager': 'bg-green-100 text-green-800',
      'Guest Services': 'bg-purple-100 text-purple-800',
      'Property Coordinator': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge variant="secondary" className={colors[position] || 'bg-gray-100 text-gray-800'}>
        {position}
      </Badge>
    );
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

  const totalWages = staffWages.reduce((sum: number, staff: any) => sum + staff.earnings.net, 0);
  const totalGross = staffWages.reduce((sum: number, staff: any) => sum + staff.earnings.gross, 0);
  const totalDeductions = staffWages.reduce((sum: number, staff: any) => sum + staff.earnings.deductions, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Staff Wages Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Net Wages</p>
              <p className="text-2xl font-bold">${totalWages.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gross Wages</p>
              <p className="text-2xl font-bold">${totalGross.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <p className="text-2xl font-bold">${totalDeductions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Staff Members</p>
              <p className="text-2xl font-bold">{staffWages.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Wages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Wage Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Gross Wage</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffWages.map((staff: any) => (
                <TableRow key={staff.stakeholderId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium">{staff.stakeholderName}</div>
                        <div className="text-sm text-muted-foreground">ID: {staff.stakeholderId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPositionBadge(staff.position)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      ${staff.earnings.gross.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-red-600">
                      -${staff.earnings.deductions.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tax & Benefits
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${staff.earnings.net.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(staff.earnings.status)}
                  </TableCell>
                  <TableCell>
                    {staff.earnings.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(staff.stakeholderId, staff.earnings.net)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {staffWages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No staff wage records found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll Breakdown */}
      {staffWages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Breakdown by Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Position */}
              <div>
                <h4 className="font-medium mb-3">Wages by Position</h4>
                <div className="space-y-3">
                  {staffWages.map((staff: any) => (
                    <div key={staff.stakeholderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm">{staff.position}</span>
                      </div>
                      <span className="font-medium">${staff.earnings.net.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Common Deductions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm">Income Tax</span>
                    <span className="font-medium">${Math.round(totalDeductions * 0.6).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm">Social Security</span>
                    <span className="font-medium">${Math.round(totalDeductions * 0.25).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm">Health Insurance</span>
                    <span className="font-medium">${Math.round(totalDeductions * 0.15).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Next Payroll</h4>
              </div>
              <p className="text-2xl font-bold mb-1">Dec 31, 2024</p>
              <p className="text-sm text-muted-foreground">Monthly payroll processing</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium">Last Processed</h4>
              </div>
              <p className="text-2xl font-bold mb-1">Nov 30, 2024</p>
              <p className="text-sm text-muted-foreground">All payments completed</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h4 className="font-medium">Pending Actions</h4>
              </div>
              <p className="text-2xl font-bold mb-1">
                {staffWages.filter((s: any) => s.earnings.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Staff payments pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}