/**
 * Agent Referral Tab Component
 * Shows referral agent commission earnings
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
import { UserPlus, Share2, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { FinancialFilters } from "@/pages/AdminFinance";

interface AgentReferralTabProps {
  filters: FinancialFilters;
}

export function AgentReferralTab({ filters }: AgentReferralTabProps) {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.set('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.set('endDate', filters.endDate.toISOString());
  if (filters.stakeholderIds) queryParams.set('agentIds', filters.stakeholderIds.join(','));

  const { data: agentEarnings = [], isLoading } = useQuery({
    queryKey: [`/api/admin/finance/agent-referral?${queryParams}`],
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
  const totalReferrals = agentEarnings.reduce((sum: number, agent: any) => sum + agent.properties.length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Referral Agent Commission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Referral Commissions</p>
              <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Referral Agents</p>
              <p className="text-2xl font-bold">{agentEarnings.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold">{totalReferrals}</p>
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
          <CardTitle>Referral Agent Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral Agent</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead className="text-right">Total Referral Value</TableHead>
                <TableHead className="text-right">Commission Rate</TableHead>
                <TableHead className="text-right">Commission Earned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentEarnings.map((agent: any) => {
                const totalReferralValue = agent.properties.reduce((sum: number, prop: any) => sum + prop.revenue, 0);
                const commissionRate = 5; // 5% for referral agents
                
                return (
                  <TableRow key={agent.stakeholderId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <Share2 className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.stakeholderName}</div>
                          <div className="text-sm text-muted-foreground">Referral Agent</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{agent.properties.length}</span>
                        <span className="text-sm text-muted-foreground">referrals</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        ${totalReferralValue.toLocaleString()}
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
              No referral agent commissions found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {agentEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Referral Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentEarnings
                .sort((a: any, b: any) => b.earnings.net - a.earnings.net)
                .slice(0, 6)
                .map((agent: any, index: number) => (
                  <div key={agent.stakeholderId} className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {index === 0 && <div className="w-2 h-2 bg-gold-500 rounded-full"></div>}
                      {index === 1 && <div className="w-2 h-2 bg-silver-500 rounded-full"></div>}
                      {index === 2 && <div className="w-2 h-2 bg-bronze-500 rounded-full"></div>}
                      <h4 className="font-medium">{agent.stakeholderName}</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referrals:</span>
                        <span>{agent.properties.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commission:</span>
                        <span className="font-medium">${agent.earnings.net.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg/Referral:</span>
                        <span>${Math.round(agent.earnings.net / agent.properties.length).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}