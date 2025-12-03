/**
 * Admin Finance - Multi-Tab Finance Management
 * Single interface for Owner payouts, PM earnings, Agent commissions, and Staff wages
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Building2,
  DollarSign,
  TrendingUp,
  Settings,
  Download,
  Filter
} from "lucide-react";
import { AdminFinanceFilters } from "@/components/AdminFinanceFilters";
import { OwnerPayoutsTab } from "@/components/finance/OwnerPayoutsTab";
import { PropertyManagerEarningsTab } from "@/components/finance/PropertyManagerEarningsTab";
import { AgentReferralTab } from "@/components/finance/AgentReferralTab";
import { AgentRetailTab } from "@/components/finance/AgentRetailTab";
import { StaffWagesTab } from "@/components/finance/StaffWagesTab";
import { CommissionSettingsTab } from "@/components/finance/CommissionSettingsTab";

export interface FinancialFilters {
  startDate?: Date;
  endDate?: Date;
  propertyIds?: number[];
  stakeholderIds?: string[];
}

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<FinancialFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch financial overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/admin/finance/overview', filters],
    enabled: true,
  });

  const handleExport = (type: string) => {
    const queryString = new URLSearchParams();
    if (filters.startDate) queryString.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) queryString.set('endDate', filters.endDate.toISOString());
    if (filters.propertyIds) queryString.set('propertyIds', filters.propertyIds.join(','));
    
    const url = `/api/admin/finance/export/${type}?${queryString}`;
    window.open(url, '_blank');
  };

  if (overviewLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Finance</h1>
          <p className="text-muted-foreground">
            Unified financial management for all stakeholders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button
            onClick={() => handleExport(activeTab)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <AdminFinanceFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${overview?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Management Fees</p>
                <p className="text-2xl font-bold">
                  ${overview?.managementFeeEarned?.toLocaleString() || '0'}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Owner Payouts</p>
                <p className="text-2xl font-bold">
                  ${overview?.ownerPayout?.toLocaleString() || '0'}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Company Retention</p>
                <p className="text-2xl font-bold">
                  ${overview?.companyRetention?.toLocaleString() || '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Tab Interface */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="owner-payouts" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Owner Payouts
                </TabsTrigger>
                <TabsTrigger value="pm-earnings" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  PM Earnings
                </TabsTrigger>
                <TabsTrigger value="agent-referral" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Referral
                </TabsTrigger>
                <TabsTrigger value="agent-retail" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Retail
                </TabsTrigger>
                <TabsTrigger value="staff-wages" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Staff Wages
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <div className="px-6 pb-6">
              <TabsContent value="owner-payouts">
                <OwnerPayoutsTab filters={filters} />
              </TabsContent>

              <TabsContent value="pm-earnings">
                <PropertyManagerEarningsTab filters={filters} />
              </TabsContent>

              <TabsContent value="agent-referral">
                <AgentReferralTab filters={filters} />
              </TabsContent>

              <TabsContent value="agent-retail">
                <AgentRetailTab filters={filters} />
              </TabsContent>

              <TabsContent value="staff-wages">
                <StaffWagesTab filters={filters} />
              </TabsContent>

              <TabsContent value="settings">
                <CommissionSettingsTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}