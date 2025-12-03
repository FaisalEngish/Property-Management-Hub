import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, TrendingUp, BarChart3, PieChart, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface Report {
  id: number;
  organizationId: string;
  title: string;
  type: string;
  data: {
    summary?: Record<string, any>;
    details?: any[];
    charts?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  generatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsAnalytics() {
  const { toast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState<string>("bookings");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<string>("generate");

  // Fetch all reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (type: string) => {
      return apiRequest('POST', '/api/reports/generate', { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    }
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setSelectedReport(null);
      toast({
        title: "Report Deleted",
        description: "Report has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete report",
        variant: "destructive",
      });
    }
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate(selectedReportType);
  };

  const handleExportCSV = async (reportId: number) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Report has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = (id: number) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteReportMutation.mutate(id);
    }
  };

  const reportTypes = [
    { value: "bookings", label: "Bookings Report", icon: FileText },
    { value: "finances", label: "Financial Report", icon: TrendingUp },
    { value: "tasks", label: "Tasks Report", icon: BarChart3 },
    { value: "properties", label: "Properties Report", icon: PieChart },
  ];

  const getReportTypeLabel = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType?.label || type;
  };

  const getReportTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      bookings: "bg-blue-100 text-blue-800",
      finances: "bg-green-100 text-green-800",
      tasks: "bg-orange-100 text-orange-800",
      properties: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-reports">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports and analytics
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate" data-testid="tab-generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Report History</TabsTrigger>
          <TabsTrigger value="view" data-testid="tab-view" disabled={!selectedReport}>
            View Report
          </TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Select a report type to generate comprehensive analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedReportType === type.value ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedReportType(type.value)}
                    data-testid={`card-report-type-${type.value}`}
                  >
                    <CardContent className="p-6 text-center">
                      <type.icon className="h-12 w-12 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold">{type.label}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="flex-1" data-testid="select-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending}
                  data-testid="button-generate-report"
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                View and manage previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No reports generated yet</p>
                  <p className="text-sm">Generate your first report to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          <Badge className={getReportTypeBadgeColor(report.type)}>
                            {getReportTypeLabel(report.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setActiveTab("view");
                            }}
                            data-testid={`button-view-${report.id}`}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportCSV(report.id)}
                            data-testid={`button-export-${report.id}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                            data-testid={`button-delete-${report.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Report Tab */}
        <TabsContent value="view" className="space-y-4">
          {selectedReport && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedReport.title}</CardTitle>
                    <CardDescription>
                      Generated on {format(new Date(selectedReport.createdAt), 'MMMM dd, yyyy at HH:mm')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleExportCSV(selectedReport.id)}
                    data-testid="button-export-current"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Cards */}
                {selectedReport.data.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(selectedReport.data.summary).map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-2xl font-bold">
                            {typeof value === 'number' 
                              ? value.toLocaleString()
                              : value}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Details Table */}
                {selectedReport.data.details && selectedReport.data.details.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Detailed Data</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(selectedReport.data.details[0]).map((key) => (
                              <TableHead key={key} className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedReport.data.details.slice(0, 10).map((row, idx) => (
                            <TableRow key={idx}>
                              {Object.values(row).map((value, vidx) => (
                                <TableCell key={vidx}>
                                  {typeof value === 'object' 
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {selectedReport.data.details.length > 10 && (
                        <div className="p-3 text-center text-sm text-muted-foreground bg-muted">
                          Showing 10 of {selectedReport.data.details.length} records. Export to CSV to view all.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
