import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import AdvancedFinanceFilters from "./AdvancedFinanceFilters";
import { format } from "date-fns";

interface FilterValues {
  propertyId?: string;
  department?: string;
  costCenter?: string;
  budgetCategory?: string;
  businessUnit?: string;
  type?: string;
  category?: string;
  channelSource?: string;
  revenueStream?: string;
  status?: string;
  dateStart?: Date;
  dateEnd?: Date;
  tags?: string[];
  fiscalYear?: number;
  minAmount?: number;
  maxAmount?: number;
}

export default function EnhancedFinanceDashboard() {
  const [filters, setFilters] = useState<FilterValues>({});
  const [activeTab, setActiveTab] = useState("overview");

  // Build query string from filters
  const buildQueryString = (filters: FilterValues) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'dateStart' || key === 'dateEnd') {
          params.append(key, (value as Date).toISOString().split('T')[0]);
        } else if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return params.toString();
  };

  // Fetch enhanced analytics
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ["/api/finance/analytics", filters],
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const response = await fetch(`/api/finance/analytics?${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    }
  });

  // Fetch department report
  const { data: departmentReport, isLoading: departmentLoading } = useQuery({
    queryKey: ["/api/finance/department-report", filters],
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const response = await fetch(`/api/finance/department-report?${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch department report");
      return response.json();
    }
  });

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading financial analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Financial Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive revenue, expense, and payout analysis with multi-dimensional filtering
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchAnalytics()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFinanceFilters
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        loading={analyticsLoading}
      />

      {/* Key Metrics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.totalExpenses)}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">+3.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.netProfit)}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">Margin: {analytics.profitMargin}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{analytics.transactionCount}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">Avg: {formatCurrency(analytics.averageTransaction)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applied Filters Summary */}
      {analytics?.appliedFilters && Object.values(analytics.appliedFilters).some(v => v !== null) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Active Filters:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(analytics.appliedFilters)
                  .filter(([_, value]) => value !== null)
                  .map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="business-units">Business Units</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Revenue', value: analytics?.totalRevenue || 0, fill: '#10B981' },
                    { name: 'Expenses', value: analytics?.totalExpenses || 0, fill: '#EF4444' },
                    { name: 'Commissions', value: analytics?.totalCommissions || 0, fill: '#8B5CF6' },
                    { name: 'Payouts', value: analytics?.totalPayouts || 0, fill: '#F59E0B' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Count by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{analytics?.transactionCount}</p>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                  </div>
                  
                  {analytics?.period?.start && (
                    <div className="text-center text-sm text-gray-600">
                      Period: {format(new Date(analytics.period.start), 'MMM dd, yyyy')} - {' '}
                      {analytics.period.end ? format(new Date(analytics.period.end), 'MMM dd, yyyy') : 'Present'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          {analytics?.departmentBreakdown && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.departmentBreakdown).map(([dept, data]: [string, any]) => ({
                          name: dept,
                          value: data.revenue,
                          fill: COLORS[Object.keys(analytics.departmentBreakdown).indexOf(dept) % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(analytics.departmentBreakdown).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.departmentBreakdown).map(([dept, data]: [string, any]) => (
                      <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{dept.charAt(0).toUpperCase() + dept.slice(1)}</p>
                          <p className="text-sm text-gray-600">{data.count} transactions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(data.revenue)}</p>
                          <p className="text-sm text-gray-600">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          {analytics?.channelBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={Object.entries(analytics.channelBreakdown).map(([channel, data]: [string, any]) => ({
                    channel: channel.charAt(0).toUpperCase() + channel.slice(1),
                    revenue: data.revenue,
                    count: data.count,
                    avgTransaction: data.avgTransaction
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(Number(value)) : value,
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Business Units Tab */}
        <TabsContent value="business-units" className="space-y-6">
          {analytics?.businessUnitBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Business Unit Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.businessUnitBreakdown).map(([unit, data]: [string, any]) => (
                    <div key={unit} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{unit.replace(/-/g, ' ').toUpperCase()}</h3>
                        <Badge variant="outline">{data.count} transactions</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold text-green-600">{formatCurrency(data.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expenses</p>
                          <p className="font-semibold text-red-600">{formatCurrency(data.expenses)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Net Profit</p>
                          <p className={`font-semibold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(data.netProfit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}