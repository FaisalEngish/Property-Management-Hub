import React from "react";
import { useCachedData } from "@/context/CacheContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RefreshDataButton from "@/components/RefreshDataButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Zap, Droplets, Wifi, AlertCircle } from "lucide-react";

export default function CachedUtilityTracker() {
  const { data: utilities = [], isLoading: utilitiesLoading, isStale } = useCachedData(
    '/api/utilities',
    undefined,
    { backgroundRefresh: true, refetchInterval: 5 * 60 * 1000 }
  );

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "฿0";
    return `฿${amount.toLocaleString()}`;
  };

  const getUtilityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'electricity': return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'water': return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'internet': return <Wifi className="h-5 w-5 text-green-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utility Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor utility bills, track usage, and manage property expenses</p>
        </div>
        <div className="flex items-center gap-2">
          {isStale && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Data refreshing...
            </Badge>
          )}
          <RefreshDataButton
            endpoints={['/api/utilities']}
            showStats={true}
            showLastUpdate={true}
          />
        </div>
      </div>

      {utilitiesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilities.length > 0 ? utilities.map((utility: any) => (
            <Card key={utility.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getUtilityIcon(utility.type)}
                    <div>
                      <CardTitle className="text-lg">{utility.type || 'Unknown'}</CardTitle>
                      <p className="text-sm text-gray-600">{utility.property || 'Unknown Property'}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(utility.status)}>
                    {utility.status || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-semibold">{formatCurrency(utility.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className="text-sm">{utility.dueDate || 'Not set'}</span>
                  </div>
                  {utility.usage && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Usage:</span>
                      <span className="text-sm">{utility.usage}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Utility Data</h3>
              <p className="text-gray-600">No utility records found. Data will appear here when available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}