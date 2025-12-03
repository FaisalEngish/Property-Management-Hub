/**
 * Agent Retail Tab Component
 * Shows retail agent commission earnings from direct bookings
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
import { ShoppingCart, Calendar, CheckCircle, Clock, TrendingUp, Target } from "lucide-react";
import { FinancialFilters } from "@/pages/AdminFinance";

interface AgentRetailTabProps {
  filters: FinancialFilters;
}

export function AgentRetailTab({ filters }: AgentRetailTabProps) {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.set('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.set('endDate', filters.endDate.toISOString());
  if (filters.stakeholderIds) queryParams.set('agentIds', filters.stakeholderIds.join(','));

  const { data: agentEarnings = [], isLoading } = useQuery({
    queryKey: [`/api/admin/finance/agent-retail?${queryParams}`],
  });

  const handleMarkPaid = (agentId: string, amount: number) => {
    // TODO: Implement mark as paid functionality
    console.log('Mark paid:', agentId, amount);
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

  const totalEarnings = agentEarnings.reduce((sum: number, agent: any) => sum + agent.earnings.net, 0);
  const totalBookings = agentEarnings.reduce((sum: number, agent: any) => sum + agent.properties.length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Retail Agent Commission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Retail Commissions</p>
              <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Retail Agents</p>
              <p className="text-2xl font-bold">{agentEarnings.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Direct Bookings</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Commission/Agent</p>
              <p className="text-2xl font-bold">
                ${agentEarnings.length > 0 ? Math.round(totalEarnings / agentEarnings.length).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retail Agent Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retail Agent</TableHead>
                <TableHead>Direct Bookings</TableHead>
                <TableHead className="text-right">Total Booking Value</TableHead>
                <TableHead className="text-right">Commission Rate</TableHead>
                <TableHead className="text-right">Commission Earned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentEarnings.map((agent: any) => {
                const totalBookingValue = agent.properties.reduce((sum: number, prop: any) => sum + prop.revenue, 0);
                const commissionRate = 7; // 7% for retail agents
                
                return (
                  <TableRow key={agent.stakeholderId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.stakeholderName}</div>
                          <div className="text-sm text-muted-foreground">Retail Agent</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{agent.properties.length}</span>
                        <span className="text-sm text-muted-foreground">bookings</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        ${totalBookingValue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{commissionRate}%</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${agent.earnings.net.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(agent.earnings.status)}
                    </TableCell>
                    <TableCell>
                      {agent.earnings.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(agent.stakeholderId, agent.earnings.net)}
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

          {agentEarnings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No retail agent commissions found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {agentEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentEarnings
                .sort((a: any, b: any) => b.earnings.net - a.earnings.net)
                .map((agent: any) => {
                  const avgBookingValue = agent.properties.reduce((sum: number, prop: any) => sum + prop.revenue, 0) / agent.properties.length;
                  const commissionPerBooking = agent.earnings.net / agent.properties.length;
                  
                  return (
                    <div key={agent.stakeholderId} className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <h4 className="font-medium">{agent.stakeholderName}</h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bookings:</span>
                          <span>{agent.properties.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Booking Value:</span>
                          <span>${avgBookingValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commission/Booking:</span>
                          <span>${Math.round(commissionPerBooking).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Earned:</span>
                          <span className="font-medium">${agent.earnings.net.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Booking Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Booking performance chart</p>
              <p className="text-sm text-gray-400">Would show monthly trends and targets</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}