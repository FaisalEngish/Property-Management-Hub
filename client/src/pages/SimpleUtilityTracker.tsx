import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Droplets, Wifi, AlertCircle, Plus } from "lucide-react";

interface Utility {
  id: number;
  type: string;
  property: string;
  status: string;
  amount: number;
  dueDate: string;
  usage?: string;
}

export default function SimpleUtilityTracker() {
  const { data: utilities = [], isLoading, error } = useQuery<Utility[]>({
    queryKey: ['/api/utilities'],
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const formatWithConversion = (amount: number | null | undefined) => {
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

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Utilities</h3>
          <p className="text-gray-600">Unable to load utility data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utility Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor utility bills, track usage, and manage property expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            Utilities
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilities.length > 0 ? utilities.map((utility) => (
            <div key={utility.id} className="bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getUtilityIcon(utility.type)}
                    <div>
                      <h3 className="text-lg font-semibold">{utility.type || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600">{utility.property || 'Unknown Property'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(utility.status)}`}>
                    {utility.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-semibold">{formatWithConversion(utility.amount)}</span>
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
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Utility Data</h3>
              <p className="text-gray-600 mb-4">No utility records found. Get started by adding your first utility account.</p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  <p>• Track electricity, water, and internet bills</p>
                  <p>• Monitor usage and due dates</p>
                  <p>• Manage property expenses efficiently</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}