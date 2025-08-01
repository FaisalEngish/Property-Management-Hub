import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { 
  FileText, 
  Download, 
  Calendar, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  Home,
  Plus,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OwnerStatementExport {
  id: number;
  exportType: string;
  dateRangeType: string;
  startDate: string;
  endDate: string;
  propertyIds: string;
  fileName: string;
  fileSize?: number;
  totalEarnings: string;
  totalExpenses: string;
  managementCommission: string;
  netBalance: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

export function OwnerStatementExport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportForm, setExportForm] = useState({
    exportType: 'pdf',
    dateRangeType: 'month',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    selectedProperties: [] as number[],
    includeNotes: false,
    includeServiceLogs: false,
    includeBranding: true
  });

  // Fetch properties for the current owner
  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['/api/properties'],
    select: (data: Property[]) => data.filter(p => p.id) // Only owned properties
  });

  // Fetch statement exports
  const { data: exports = [], isLoading: loadingExports } = useQuery({
    queryKey: ['/api/owner-statement-exports'],
    refetchInterval: 5000 // Refresh every 5 seconds to check export status
  });

  // Create export mutation
  const createExportMutation = useMutation({
    mutationFn: async (exportData: any) => {
      return apiRequest('POST', '/api/owner-statement-exports', exportData);
    },
    onSuccess: (data) => {
      toast({
        title: "Export Started",
        description: `Your ${exportForm.exportType.toUpperCase()} statement is being generated. You'll be notified when it's ready.`,
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/owner-statement-exports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to start statement export",
        variant: "destructive",
      });
    }
  });

  // Download export mutation
  const downloadMutation = useMutation({
    mutationFn: async (exportId: number) => {
      const response = await fetch(`/api/owner-statement-exports/${exportId}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const exportRecord = exports.find(e => e.id === exportId);
      if (exportRecord?.exportType === 'csv') {
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportRecord.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // For PDF, handle in separate flow
        const data = await response.json();
        window.open(`/api/owner-statement-exports/${exportId}/pdf-data`, '_blank');
      }
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your statement file is being downloaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download statement",
        variant: "destructive",
      });
    }
  });

  // Handle date range type change
  const handleDateRangeTypeChange = (type: string) => {
    setExportForm(prev => {
      if (type === 'month') {
        const now = new Date();
        return {
          ...prev,
          dateRangeType: type,
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      }
      return { ...prev, dateRangeType: type };
    });
  };

  // Handle month selection for quick filters
  const handleMonthSelection = (monthsBack: number) => {
    const targetDate = subMonths(new Date(), monthsBack);
    setExportForm(prev => ({
      ...prev,
      startDate: format(startOfMonth(targetDate), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(targetDate), 'yyyy-MM-dd')
    }));
  };

  // Handle property selection
  const handlePropertyToggle = (propertyId: number) => {
    setExportForm(prev => ({
      ...prev,
      selectedProperties: prev.selectedProperties.includes(propertyId)
        ? prev.selectedProperties.filter(id => id !== propertyId)
        : [...prev.selectedProperties, propertyId]
    }));
  };

  // Handle select all properties
  const handleSelectAllProperties = () => {
    setExportForm(prev => ({
      ...prev,
      selectedProperties: prev.selectedProperties.length === properties.length 
        ? [] 
        : properties.map(p => p.id)
    }));
  };

  // Submit export
  const handleSubmitExport = () => {
    if (!exportForm.selectedProperties.length) {
      toast({
        title: "Selection Required",
        description: "Please select at least one property for the statement.",
        variant: "destructive",
      });
      return;
    }

    createExportMutation.mutate({
      exportType: exportForm.exportType,
      dateRangeType: exportForm.dateRangeType,
      startDate: exportForm.startDate,
      endDate: exportForm.endDate,
      propertyIds: exportForm.selectedProperties,
      includeNotes: exportForm.includeNotes,
      includeServiceLogs: exportForm.includeServiceLogs,
      includeBranding: exportForm.includeBranding
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      generating: 'secondary',
      failed: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            Financial Statements
          </h2>
          <p className="text-muted-foreground">
            Export detailed financial reports for your properties
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Export Statement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Export Owner Statement</DialogTitle>
              <DialogDescription>
                Generate a comprehensive financial report for your properties
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exportType">Export Format</Label>
                    <Select 
                      value={exportForm.exportType} 
                      onValueChange={(value) => setExportForm(prev => ({ ...prev, exportType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            PDF Document
                          </div>
                        </SelectItem>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            CSV Spreadsheet
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateRangeType">Date Range</Label>
                    <Select 
                      value={exportForm.dateRangeType} 
                      onValueChange={handleDateRangeTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {exportForm.dateRangeType === 'month' && (
                  <div>
                    <Label>Quick Month Selection</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMonthSelection(0)}
                      >
                        This Month
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMonthSelection(1)}
                      >
                        Last Month
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMonthSelection(2)}
                      >
                        2 Months Ago
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMonthSelection(3)}
                      >
                        3 Months Ago
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={exportForm.startDate}
                      onChange={(e) => setExportForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={exportForm.endDate}
                      onChange={(e) => setExportForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Select Properties</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllProperties}
                  >
                    {exportForm.selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                {loadingProperties ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`property-${property.id}`}
                          checked={exportForm.selectedProperties.includes(property.id)}
                          onCheckedChange={() => handlePropertyToggle(property.id)}
                        />
                        <Label htmlFor={`property-${property.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Home className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{property.name}</div>
                            <div className="text-sm text-muted-foreground">{property.address}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="options" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeNotes"
                      checked={exportForm.includeNotes}
                      onCheckedChange={(checked) => 
                        setExportForm(prev => ({ ...prev, includeNotes: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeNotes">Include property notes and comments</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeServiceLogs"
                      checked={exportForm.includeServiceLogs}
                      onCheckedChange={(checked) => 
                        setExportForm(prev => ({ ...prev, includeServiceLogs: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeServiceLogs">Include service and maintenance logs</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeBranding"
                      checked={exportForm.includeBranding}
                      onCheckedChange={(checked) => 
                        setExportForm(prev => ({ ...prev, includeBranding: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeBranding">Include company branding and logo</Label>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Statement Will Include:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• All booking earnings by platform</li>
                    <li>• Property expenses and maintenance costs</li>
                    <li>• Management commission breakdown</li>
                    <li>• Add-on service charges</li>
                    <li>• Net balance calculation</li>
                    {exportForm.includeNotes && <li>• Property notes and comments</li>}
                    {exportForm.includeServiceLogs && <li>• Service and maintenance logs</li>}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitExport}
                disabled={createExportMutation.isPending || !exportForm.selectedProperties.length}
                className="gap-2"
              >
                {createExportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Generate Statement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Statements
          </CardTitle>
          <CardDescription>
            Your exported financial statements and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingExports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No statements yet</h3>
              <p className="text-muted-foreground mb-4">
                Export your first financial statement to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Export Statement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {exports.map((exportRecord: OwnerStatementExport) => (
                <div key={exportRecord.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(exportRecord.status)}
                    <div>
                      <div className="font-medium">{exportRecord.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(exportRecord.createdAt), 'MMM dd, yyyy at HH:mm')} •{' '}
                        {exportRecord.status === 'completed' && exportRecord.fileSize && 
                          `${Math.round(exportRecord.fileSize / 1024)} KB`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Net: ${parseFloat(exportRecord.netBalance).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(exportRecord.startDate), 'MMM dd')} - {format(new Date(exportRecord.endDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    
                    {getStatusBadge(exportRecord.status)}
                    
                    {exportRecord.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => downloadMutation.mutate(exportRecord.id)}
                        disabled={downloadMutation.isPending}
                        className="gap-2"
                      >
                        {downloadMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download
                      </Button>
                    )}
                    
                    {exportRecord.status === 'failed' && (
                      <div className="text-xs text-red-500 max-w-xs">
                        {exportRecord.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}