import React from "react";
import { useFinanceData, useFinanceAnalytics } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RefreshDataButton from "@/components/RefreshDataButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";

export default function CachedFinances() {
  const { data: finances = [], isLoading: financesLoading, isStale: financesStale } = useFinanceData();
  const { data: analytics, isLoading: analyticsLoading, isStale: analyticsStale } = useFinanceAnalytics();

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "฿0";
    return `฿${amount.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue & Payouts</h1>
          <p className="text-gray-600 mt-1">Track property revenue, owner payouts, and commission calculations</p>
        </div>
        <div className="flex items-center gap-2">
          {(financesStale || analyticsStale) && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Data refreshing...
            </Badge>
          )}
          <RefreshDataButton
            endpoints={['/api/finance', '/api/finance/analytics']}
            showStats={true}
            showLastUpdate={true}
          />
        </div>
      </div>

      {/* Analytics Overview */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(analytics.totalExpenses)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency((analytics.totalRevenue || 0) - (analytics.totalExpenses || 0))}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Finance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Financial Transactions</span>
            {financesLoading && <LoadingSpinner size="sm" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {financesLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : finances.length > 0 ? (
            <div className="space-y-4">
              {finances.slice(0, 10).map((finance: any) => (
                <div key={finance.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{finance.type}</h3>
                    <p className="text-sm text-gray-600">{finance.description}</p>
                    <p className="text-xs text-gray-500">{finance.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${finance.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(finance.amount)}
                    </p>
                    <Badge variant="outline">{finance.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No financial records found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}