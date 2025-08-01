import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useToast } from "../../hooks/use-toast";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Wrench,
  Shield,
  AlertCircle,
  Loader2,
  Play,
  RefreshCcw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AiOpsAnomaly {
  id: number;
  organizationId: string;
  propertyId?: number;
  anomalyType: string;
  severity: string;
  status: string;
  details: any;
  autoFixed: boolean;
  fixAction?: string;
  detectedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnomalyAnalytics {
  totalAnomalies: number;
  statusDistribution: Array<{ status: string; count: number }>;
  severityDistribution: Array<{ severity: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  autoFixSuccessRate: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    default: return "outline";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open": return "destructive";
    case "in-progress": return "default";
    case "resolved": return "secondary";
    default: return "outline";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "missing-task": return <Clock className="h-4 w-4" />;
    case "overdue-maintenance": return <AlertTriangle className="h-4 w-4" />;
    case "booking-conflict": return <AlertCircle className="h-4 w-4" />;
    case "payout-mismatch": return <TrendingUp className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

export default function AiOpsAnomaliesManagement() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI operations anomalies
  const { data: anomalies, isLoading: anomaliesLoading } = useQuery<AiOpsAnomaly[]>({
    queryKey: ["/api/ai-ops-anomalies"],
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnomalyAnalytics>({
    queryKey: ["/api/ai-ops-anomalies/analytics"],
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Detect anomalies mutation
  const detectAnomaliesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ai-ops-anomalies/detect"),
    onSuccess: (data) => {
      toast({
        title: "Anomaly Detection Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-ops-anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-ops-anomalies/analytics"] });
    },
    onError: () => {
      toast({
        title: "Detection Failed",
        description: "Failed to detect anomalies",
        variant: "destructive",
      });
    },
  });

  // Auto-fix anomalies mutation
  const autoFixMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ai-ops-anomalies/auto-fix"),
    onSuccess: (data) => {
      toast({
        title: "Auto-Fix Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-ops-anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-ops-anomalies/analytics"] });
    },
    onError: () => {
      toast({
        title: "Auto-Fix Failed",
        description: "Failed to auto-fix anomalies",
        variant: "destructive",
      });
    },
  });

  // Resolve anomaly mutation
  const resolveAnomalyMutation = useMutation({
    mutationFn: ({ id, fixAction }: { id: number; fixAction: string }) =>
      apiRequest("POST", `/api/ai-ops-anomalies/${id}/resolve`, { fixAction }),
    onSuccess: () => {
      toast({
        title: "Anomaly Resolved",
        description: "Anomaly has been marked as resolved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-ops-anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-ops-anomalies/analytics"] });
    },
    onError: () => {
      toast({
        title: "Resolution Failed",
        description: "Failed to resolve anomaly",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (anomaliesLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Operations Anomalies</h1>
          <p className="text-muted-foreground">
            Monitor and manage system anomalies with AI-powered detection and auto-fix capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => detectAnomaliesMutation.mutate()}
            disabled={detectAnomaliesMutation.isPending}
            variant="outline"
          >
            {detectAnomaliesMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Detect Anomalies
          </Button>
          <Button
            onClick={() => autoFixMutation.mutate()}
            disabled={autoFixMutation.isPending}
            variant="default"
          >
            {autoFixMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wrench className="h-4 w-4 mr-2" />
            )}
            Auto-Fix
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalAnomalies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Detected across all properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.statusDistribution?.find(s => s.status === "open")?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Fix Rate</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.autoFixSuccessRate || "0.0"}%</div>
                <p className="text-xs text-muted-foreground">
                  Successfully auto-resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.statusDistribution?.find(s => s.status === "resolved")?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Issues fixed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Anomalies */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Anomalies</CardTitle>
              <CardDescription>Latest detected system anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              {anomalies && anomalies.length > 0 ? (
                <div className="space-y-4">
                  {anomalies.slice(0, 5).map((anomaly) => (
                    <div key={anomaly.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(anomaly.anomalyType)}
                        <div>
                          <p className="font-medium">{anomaly.details?.description || "Unknown anomaly"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getSeverityColor(anomaly.severity) as any}>
                              {anomaly.severity}
                            </Badge>
                            <Badge variant={getStatusColor(anomaly.status) as any}>
                              {anomaly.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(anomaly.detectedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {anomaly.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            resolveAnomalyMutation.mutate({
                              id: anomaly.id,
                              fixAction: "Manually resolved from overview",
                            })
                          }
                          disabled={resolveAnomalyMutation.isPending}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    No anomalies detected. Your system is running smoothly!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Anomalies</CardTitle>
              <CardDescription>Complete list of system anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              {anomalies && anomalies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Auto-Fixed</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anomalies.map((anomaly) => (
                      <TableRow key={anomaly.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(anomaly.anomalyType)}
                            <span className="capitalize">{anomaly.anomalyType.replace("-", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div>
                            <p className="font-medium">{anomaly.details?.description}</p>
                            {anomaly.details?.recommendation && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {anomaly.details.recommendation}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(anomaly.severity) as any}>
                            {anomaly.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(anomaly.status) as any}>
                            {anomaly.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {anomaly.autoFixed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(anomaly.detectedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {anomaly.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                resolveAnomalyMutation.mutate({
                                  id: anomaly.id,
                                  fixAction: "Manually resolved",
                                })
                              }
                              disabled={resolveAnomalyMutation.isPending}
                            >
                              Resolve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    No anomalies found. Run detection to scan for issues.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.statusDistribution?.map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(status.status) as any}>
                          {status.status}
                        </Badge>
                      </div>
                      <span className="font-medium">{status.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.severityDistribution?.map((severity) => (
                    <div key={severity.severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(severity.severity) as any}>
                          {severity.severity}
                        </Badge>
                      </div>
                      <span className="font-medium">{severity.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anomaly Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.typeDistribution?.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type.type)}
                        <span className="capitalize">{type.type.replace("-", " ")}</span>
                      </div>
                      <span className="font-medium">{type.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Auto-Fix Success Rate</span>
                    <span className="text-2xl font-bold">{analytics?.autoFixSuccessRate}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${analytics?.autoFixSuccessRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}