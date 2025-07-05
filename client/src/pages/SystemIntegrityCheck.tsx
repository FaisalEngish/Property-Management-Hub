import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCw, 
  FileText, 
  Send,
  ArrowLeft,
  Settings,
  Shield,
  Users,
  Calendar,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface IntegrityIssue {
  id: string;
  dashboardRole: string;
  pageName: string;
  issueType: 'Broken Link' | 'Missing Field' | 'Empty Component' | 'No Back Button' | 'Unhandled Role Access' | 'Missing Logout' | 'Broken Form' | 'Undefined Component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolutionSuggestion: string;
  status: 'open' | 'flagged_resolved' | 'sent_to_developer';
  notes?: string;
  detectedAt: string;
  componentPath?: string;
  expectedBehavior?: string;
}

interface IntegrityReport {
  scanId: string;
  scanTimestamp: string;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  dashboardCoverage: {
    role: string;
    pagesScanned: number;
    issuesFound: number;
  }[];
  issues: IntegrityIssue[];
}

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const statusColors = {
  open: "bg-gray-100 text-gray-800",
  flagged_resolved: "bg-green-100 text-green-800",
  sent_to_developer: "bg-purple-100 text-purple-800"
};

const issueTypeIcons = {
  'Broken Link': XCircle,
  'Missing Field': AlertTriangle,
  'Empty Component': FileText,
  'No Back Button': ArrowLeft,
  'Unhandled Role Access': Shield,
  'Missing Logout': Users,
  'Broken Form': Settings,
  'Undefined Component': XCircle
};

export default function SystemIntegrityCheck() {
  const [selectedIssue, setSelectedIssue] = useState<IntegrityIssue | null>(null);
  const [developerNote, setDeveloperNote] = useState("");
  const [scanRunning, setScanRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch latest integrity report
  const { data: report, isLoading, refetch } = useQuery<IntegrityReport>({
    queryKey: ["/api/admin/system-integrity-check"],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Run new integrity scan
  const scanMutation = useMutation({
    mutationFn: async () => {
      setScanRunning(true);
      return await apiRequest("POST", "/api/admin/system-integrity-check/scan", {});
    },
    onSuccess: () => {
      toast({
        title: "Scan Complete",
        description: "System integrity scan completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-integrity-check"] });
      setScanRunning(false);
    },
    onError: (error: any) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to run integrity scan.",
        variant: "destructive",
      });
      setScanRunning(false);
    },
  });

  // Update issue status
  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, status, notes }: { issueId: string; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/admin/system-integrity-check/issues/${issueId}`, {
        status,
        notes
      });
    },
    onSuccess: () => {
      toast({
        title: "Issue Updated",
        description: "Issue status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-integrity-check"] });
      setSelectedIssue(null);
      setDeveloperNote("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update issue status.",
        variant: "destructive",
      });
    },
  });

  const handleFlagResolved = (issue: IntegrityIssue) => {
    updateIssueMutation.mutate({
      issueId: issue.id,
      status: 'flagged_resolved'
    });
  };

  const handleSendToDeveloper = (issue: IntegrityIssue) => {
    updateIssueMutation.mutate({
      issueId: issue.id,
      status: 'sent_to_developer',
      notes: developerNote
    });
  };

  const getIssuesByRole = (role: string) => {
    return report?.issues.filter(issue => issue.dashboardRole === role) || [];
  };

  const getIssuesBySeverity = (severity: string) => {
    return report?.issues.filter(issue => issue.severity === severity) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading system integrity report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Integrity Check</h1>
          <p className="text-muted-foreground">
            Comprehensive diagnostic tool for validating dashboard interfaces and functionality
          </p>
        </div>
        <Button 
          onClick={() => scanMutation.mutate()} 
          disabled={scanRunning}
          className="min-w-32"
        >
          {scanRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Run New Scan
            </>
          )}
        </Button>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalIssues}</div>
                <p className="text-xs text-muted-foreground">
                  Last scan: {new Date(report.scanTimestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{report.criticalIssues}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{report.highIssues}</div>
                <p className="text-xs text-muted-foreground">
                  Should be addressed soon
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dashboards Scanned</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.dashboardCoverage.length}</div>
                <p className="text-xs text-muted-foreground">
                  Role-based interfaces
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Coverage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Coverage</CardTitle>
              <CardDescription>Issues found per role-based dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {report.dashboardCoverage.map((coverage) => (
                  <div key={coverage.role} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{coverage.role}</h4>
                      <Badge variant={coverage.issuesFound > 0 ? "destructive" : "default"}>
                        {coverage.issuesFound} issues
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {coverage.pagesScanned} pages scanned
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
              <TabsTrigger value="by-role">By Role</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <IssuesList issues={report.issues} onSelectIssue={setSelectedIssue} />
            </TabsContent>

            <TabsContent value="critical" className="space-y-4">
              <IssuesList issues={getIssuesBySeverity('critical')} onSelectIssue={setSelectedIssue} />
            </TabsContent>

            <TabsContent value="high" className="space-y-4">
              <IssuesList issues={getIssuesBySeverity('high')} onSelectIssue={setSelectedIssue} />
            </TabsContent>

            <TabsContent value="medium" className="space-y-4">
              <IssuesList issues={getIssuesBySeverity('medium')} onSelectIssue={setSelectedIssue} />
            </TabsContent>

            <TabsContent value="low" className="space-y-4">
              <IssuesList issues={getIssuesBySeverity('low')} onSelectIssue={setSelectedIssue} />
            </TabsContent>

            <TabsContent value="by-role" className="space-y-4">
              <div className="space-y-6">
                {['Admin', 'Host', 'Housekeeping', 'Pool', 'Retail Agent', 'Referral Agent', 'Owner', 'Guest'].map(role => {
                  const roleIssues = getIssuesByRole(role);
                  if (roleIssues.length === 0) return null;
                  
                  return (
                    <Card key={role}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {role} Dashboard
                          <Badge variant="outline">{roleIssues.length} issues</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <IssuesList issues={roleIssues} onSelectIssue={setSelectedIssue} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIssue && issueTypeIcons[selectedIssue.issueType] && 
                React.createElement(issueTypeIcons[selectedIssue.issueType], { className: "h-5 w-5" })
              }
              {selectedIssue?.issueType} - {selectedIssue?.pageName}
            </DialogTitle>
            <DialogDescription>
              {selectedIssue?.dashboardRole} Dashboard Issue
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={severityColors[selectedIssue.severity]}>
                  {selectedIssue.severity.toUpperCase()}
                </Badge>
                <Badge className={statusColors[selectedIssue.status]}>
                  {selectedIssue.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Resolution Suggestion</h4>
                <p className="text-sm text-muted-foreground">{selectedIssue.resolutionSuggestion}</p>
              </div>
              
              {selectedIssue.componentPath && (
                <div>
                  <h4 className="font-medium">Component Path</h4>
                  <code className="text-sm bg-muted p-1 rounded">{selectedIssue.componentPath}</code>
                </div>
              )}
              
              {selectedIssue.expectedBehavior && (
                <div>
                  <h4 className="font-medium">Expected Behavior</h4>
                  <p className="text-sm text-muted-foreground">{selectedIssue.expectedBehavior}</p>
                </div>
              )}
              
              {selectedIssue.status === 'open' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="developer-note" className="text-sm font-medium">
                      Developer Note (for Send to Developer)
                    </label>
                    <Textarea
                      id="developer-note"
                      value={developerNote}
                      onChange={(e) => setDeveloperNote(e.target.value)}
                      placeholder="Add any additional context or specific instructions for the developer..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleFlagResolved(selectedIssue)}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Flag as Resolved
                    </Button>
                    <Button 
                      onClick={() => handleSendToDeveloper(selectedIssue)}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to Developer
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedIssue.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedIssue.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface IssuesListProps {
  issues: IntegrityIssue[];
  onSelectIssue: (issue: IntegrityIssue) => void;
}

function IssuesList({ issues, onSelectIssue }: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          No issues found! All scanned components are functioning correctly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue) => {
        const IconComponent = issueTypeIcons[issue.issueType];
        
        return (
          <Card 
            key={issue.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectIssue(issue)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <IconComponent className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{issue.pageName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {issue.dashboardRole}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {issue.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge className={severityColors[issue.severity]}>
                        {issue.severity}
                      </Badge>
                      <Badge className={statusColors[issue.status]}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {issue.issueType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}