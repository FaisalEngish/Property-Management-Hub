import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Percent, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface KPIMetrics {
  monthlyRevenue: number;
  monthlyExpenses: number;
  occupancyPercent: number;
  activeBookings: number;
  topPerformingProperty: { name: string; revenue: number } | null;
}

export function KPIWidgets() {
  const { data: kpis, isLoading } = useQuery<KPIMetrics>({
    queryKey: ['/api/dashboard/kpi-metrics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const netIncome = kpis.monthlyRevenue - kpis.monthlyExpenses;
  const profitMargin = kpis.monthlyRevenue > 0 ? ((netIncome / kpis.monthlyRevenue) * 100) : 0;

  // Mock chart data for revenue vs expenses
  const chartData = [
    { name: 'Week 1', revenue: kpis.monthlyRevenue * 0.2, expenses: kpis.monthlyExpenses * 0.25 },
    { name: 'Week 2', revenue: kpis.monthlyRevenue * 0.3, expenses: kpis.monthlyExpenses * 0.3 },
    { name: 'Week 3', revenue: kpis.monthlyRevenue * 0.25, expenses: kpis.monthlyExpenses * 0.2 },
    { name: 'Week 4', revenue: kpis.monthlyRevenue * 0.25, expenses: kpis.monthlyExpenses * 0.25 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Monthly Revenue vs Expenses */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Monthly Revenue vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Revenue</span>
              <span className="font-semibold text-green-600">
                ฿{kpis.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Expenses</span>
              <span className="font-semibold text-red-600">
                ฿{kpis.monthlyExpenses.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm font-medium">Net Income</span>
              <div className="flex items-center gap-1">
                {netIncome >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ฿{Math.abs(netIncome).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="h-20 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Occupancy Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{kpis.occupancyPercent}%</div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${kpis.occupancyPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600">Current occupancy level</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Bookings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Active Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{kpis.activeBookings}</div>
            <p className="text-xs text-slate-600">Confirmed & checked-in</p>
            <div className="flex items-center gap-1 text-xs">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600">Active now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Property - Full Width */}
      <Card className="lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4" />
            Top Performing Property This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kpis.topPerformingProperty ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{kpis.topPerformingProperty.name}</h3>
                <p className="text-sm text-slate-600">Leading revenue generator</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ฿{kpis.topPerformingProperty.revenue.toLocaleString()}
                </div>
                <p className="text-sm text-slate-600">Monthly revenue</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600">No revenue data available for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}