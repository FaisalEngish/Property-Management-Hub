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
  Filter,
  BarChart3,
  PieChart,
  ExternalLink
} from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
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
  const [activeTab, setActiveTab] = useState("owner-payouts");
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

  // Format currency consistently with Thai Baht
  const formatCurrency = (amount: number) => {
    return `฿${amount?.toLocaleString() || '0'}`;
  };

  // Format growth rate with context
  const formatGrowthRate = (rate: number) => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${rate.toFixed(1)}% vs last month`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Admin Cockpit</h1>
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
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(overview?.totalRevenue || 0)}
                </p>
                <p className="text-xs text-green-600">
                  {formatGrowthRate(overview?.revenueGrowth || 12.5)}
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
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(overview?.managementFeeEarned || 0)}
                </p>
                <p className="text-xs text-green-600">
                  {formatGrowthRate(overview?.managementFeeGrowth || 8.3)}
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
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(overview?.ownerPayout || 0)}
                </p>
                <p className="text-xs text-green-600">
                  {formatGrowthRate(overview?.payoutGrowth || 11.9)}
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
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(overview?.companyRetention || 0)}
                </p>
                <p className="text-xs text-green-600">
                  {formatGrowthRate(overview?.retentionGrowth || 15.2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Property Revenue</span>
                </div>
                <span className="font-medium">{formatCurrency(overview?.propertyRevenue || 850000)} (68%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Management Fees</span>
                </div>
                <span className="font-medium">{formatCurrency(overview?.managementFeeEarned || 280000)} (22%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Additional Services</span>
                </div>
                <span className="font-medium">{formatCurrency(overview?.additionalServices || 125000)} (10%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pie Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Staff Wages', value: overview?.staffWages || 125000, color: '#ef4444' },
                        { name: 'Maintenance', value: overview?.maintenance || 85000, color: '#eab308' },
                        { name: 'Utilities', value: overview?.utilities || 70000, color: '#a855f7' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Staff Wages', value: overview?.staffWages || 125000, color: '#ef4444' },
                        { name: 'Maintenance', value: overview?.maintenance || 85000, color: '#eab308' },
                        { name: 'Utilities', value: overview?.utilities || 70000, color: '#a855f7' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              {/* List View */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Staff Wages</span>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(overview?.staffWages || 125000)} (45%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Maintenance</span>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(overview?.maintenance || 85000)} (30%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Utilities</span>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(overview?.utilities || 70000)} (25%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Summary & Property Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Commission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Calculation Details</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total Revenue Base:</span>
                    <span className="font-medium">{formatCurrency(overview?.totalRevenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Rate (15%):</span>
                    <span className="font-medium text-green-600">{formatCurrency((overview?.totalRevenue || 0) * 0.15)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>PM Share (50%):</span>
                    <span className="font-medium">{formatCurrency(((overview?.totalRevenue || 0) * 0.15) * 0.5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Company Share (50%):</span>
                    <span className="font-medium">{formatCurrency(((overview?.totalRevenue || 0) * 0.15) * 0.5)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle>Property Financial Performance</CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View All Properties
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Villa SABAI</p>
                  <p className="text-sm text-muted-foreground">Premium Beachfront</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{formatCurrency(185000)}</p>
                  <p className="text-xs text-green-600">ROI: +18.5%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Villa Aruna</p>
                  <p className="text-sm text-muted-foreground">Mountain View</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{formatCurrency(142000)}</p>
                  <p className="text-xs text-green-600">ROI: +14.2%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Villa Samui</p>
                  <p className="text-sm text-muted-foreground">City Center</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{formatCurrency(98000)}</p>
                  <p className="text-xs text-red-600">ROI: -5.3%</p>
                </div>
              </div>
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