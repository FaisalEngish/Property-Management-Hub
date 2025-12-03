import React from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, AlertCircle, Plus } from "lucide-react";

export default function CachedInvoiceGenerator() {
  const { data: invoices, isLoading: invoicesLoading, error } = useQuery({
    queryKey: ['/api/invoices'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/invoices');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000
  });

  // Safe array handling to prevent crashes
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const formatWithConversion = (amount: number | null | undefined) => {
    if (amount == null) return "฿0";
    return `฿${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="text-gray-600 mt-1">Generate invoices, track payments, and manage income streams</p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Loading error
            </Badge>
          )}
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {invoicesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{safeInvoices.length}</p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {safeInvoices.filter((inv: any) => inv.status === 'paid').length}
                  </p>
                  <p className="text-sm text-gray-600">Paid</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {safeInvoices.filter((inv: any) => inv.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {safeInvoices.filter((inv: any) => inv.status === 'overdue').length}
                  </p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Invoices</span>
                {invoicesLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeInvoices.length > 0 ? (
                <div className="space-y-4">
                  {safeInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{invoice.number || `INV-${invoice.id}`}</h3>
                          <p className="text-sm text-gray-600">{invoice.clientName || 'Client Name'}</p>
                          <p className="text-xs text-gray-500">{invoice.date || 'No date'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatWithConversion(invoice.amount)}</p>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status || 'Draft'}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices</h3>
                  <p className="text-gray-600 mb-4">No invoices found. Create your first invoice to get started.</p>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}