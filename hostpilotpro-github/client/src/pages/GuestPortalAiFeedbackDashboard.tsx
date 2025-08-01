import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  MessageSquare, 
  Settings, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Eye, 
  Play, 
  Zap,
  TrendingUp,
  Bell,
  Clock,
  Users,
  Target,
  Filter,
  Search
} from "lucide-react";
import { format } from "date-fns";

interface GuestFeedback {
  id: number;
  guestName: string;
  propertyId: number;
  propertyName: string;
  originalMessage: string;
  feedbackChannel: string;
  detectedKeywords: string[];
  sentimentScore: number;
  urgencyLevel: string;
  requiresAction: boolean;
  isProcessed: boolean;
  processedBy?: string;
  processingNotes?: string;
  assignedTaskId?: number;
  receivedAt: string;
  processedAt?: string;
}

interface AiTaskRule {
  id: number;
  ruleName: string;
  keywords: string[];
  taskType: string;
  taskTitle: string;
  taskDescription?: string;
  assignToDepartment: string;
  priority: string;
  defaultAssignee?: string;
  isActive: boolean;
  triggerCount: number;
  lastTriggered?: string;
  createdBy: string;
  createdAt: string;
}

interface ProcessingLog {
  id: number;
  feedbackId: number;
  processingType: string;
  triggeredRuleId?: number;
  matchedKeywords: string[];
  confidenceScore: number;
  actionTaken: string;
  createdTaskId?: number;
  processedBy: string;
  processingTime: number;
  createdAt: string;
}

interface FeedbackAnalytics {
  totalFeedback: number;
  unprocessedCount: number;
  highUrgencyCount: number;
  averageProcessingTime: number;
  topIssueCategories: Array<{ category: string; count: number }>;
  recentTrends: Array<{ date: string; count: number }>;
  automationRate: number;
}

export default function GuestPortalAiFeedbackDashboard() {
  const [activeTab, setActiveTab] = useState("feedback");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data
  const { data: feedback = [] } = useQuery({
    queryKey: ["/api/ai/feedback", { urgency: selectedUrgency, property: selectedProperty, search: searchQuery }],
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["/api/ai/task-rules"],
  });

  const { data: processingLog = [] } = useQuery({
    queryKey: ["/api/ai/processing-log"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/ai/feedback-analytics"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Process feedback mutation
  const processFeedbackMutation = useMutation({
    mutationFn: async ({ feedbackId, action, notes }: { feedbackId: number; action: string; notes?: string }) => {
      return apiRequest("POST", `/api/ai/feedback/${feedbackId}/process`, { action, notes });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/processing-log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feedback-analytics"] });
      toast({
        title: "Feedback Processed",
        description: data.action === 'create_task' ? `Task created: ${data.taskTitle}` : "Feedback processed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-process high urgency feedback
  const autoProcessMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/ai/auto-process-feedback");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feedback"] });
      toast({
        title: "Auto-Processing Complete",
        description: `Processed ${data.processedCount} high-urgency items`,
      });
    },
  });

  // Filter feedback
  const filteredFeedback = feedback.filter((item: GuestFeedback) => {
    const matchesUrgency = selectedUrgency === "all" || item.urgencyLevel === selectedUrgency;
    const matchesProperty = selectedProperty === "all" || item.propertyId.toString() === selectedProperty;
    const matchesSearch = searchQuery === "" || 
      item.originalMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.guestName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesUrgency && matchesProperty && matchesSearch;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentEmoji = (score: number) => {
    if (score >= 0.5) return "😊";
    if (score >= 0.1) return "😐";
    if (score >= -0.3) return "😕";
    return "😞";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Guest Portal AI Feedback Trigger System</h1>
          <p className="text-muted-foreground">
            Convert guest complaints into actionable tasks using AI analysis
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => autoProcessMutation.mutate()}
            disabled={autoProcessMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto-Process Urgent
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                  <p className="text-2xl font-bold">{analytics.totalFeedback}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unprocessed</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.unprocessedCount}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Urgency</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.highUrgencyCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Automation Rate</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.automationRate}%</p>
                </div>
                <Brain className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Process Time</p>
                  <p className="text-2xl font-bold">{analytics.averageProcessingTime}s</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Live Feedback Monitor
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            AI Task Rules
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Processing Log
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics & Trends
          </TabsTrigger>
        </TabsList>

        {/* Live Feedback Monitor Tab */}
        <TabsContent value="feedback" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Urgency</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.map((item: GuestFeedback) => (
              <Card key={item.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{item.guestName}</h3>
                        <Badge variant="outline">{item.propertyName}</Badge>
                        <Badge className={getUrgencyColor(item.urgencyLevel)}>
                          {item.urgencyLevel}
                        </Badge>
                        {item.requiresAction && (
                          <Badge variant="destructive">
                            <Bell className="w-3 h-3 mr-1" />
                            Action Required
                          </Badge>
                        )}
                        <span className="text-lg">{getSentimentEmoji(item.sentimentScore)}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.receivedAt), "MMM dd, yyyy HH:mm")} • via {item.feedbackChannel}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!item.isProcessed && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => processFeedbackMutation.mutate({ 
                              feedbackId: item.id, 
                              action: 'create_task',
                              notes: 'Auto-generated from guest feedback'
                            })}
                            disabled={processFeedbackMutation.isPending}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Create Task
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processFeedbackMutation.mutate({ 
                              feedbackId: item.id, 
                              action: 'mark_resolved'
                            })}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Resolved
                          </Button>
                        </>
                      )}
                      
                      {item.isProcessed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Processed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm">{item.originalMessage}</p>
                    </div>
                    
                    {item.detectedKeywords && item.detectedKeywords.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Detected Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.detectedKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.assignedTaskId && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Target className="w-4 h-4" />
                        <span>Linked to Task #{item.assignedTaskId}</span>
                      </div>
                    )}
                    
                    {item.processingNotes && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Processing Notes:</strong> {item.processingNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredFeedback.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No feedback to process</h3>
                  <p className="text-muted-foreground">
                    All guest feedback has been processed or no new feedback matches your filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* AI Task Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">AI Task Creation Rules</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Rule
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule: AiTaskRule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rule.ruleName}</CardTitle>
                      <CardDescription>
                        Triggers: {rule.taskType} tasks for {rule.assignToDepartment}
                      </CardDescription>
                    </div>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Keywords</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Generated Task</Label>
                    <p className="text-sm text-muted-foreground mt-1">{rule.taskTitle}</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Priority: <Badge variant="outline">{rule.priority}</Badge>
                    </span>
                    <span className="text-muted-foreground">
                      Triggered {rule.triggerCount} times
                    </span>
                  </div>
                  
                  {rule.lastTriggered && (
                    <p className="text-xs text-muted-foreground">
                      Last triggered: {format(new Date(rule.lastTriggered), "MMM dd, yyyy HH:mm")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Processing Log Tab */}
        <TabsContent value="processing" className="space-y-6">
          <h3 className="text-xl font-semibold">AI Processing Activity Log</h3>
          
          <div className="space-y-4">
            {processingLog.map((log: ProcessingLog) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.actionTaken === 'task_created' ? 'default' : 'secondary'}>
                          {log.actionTaken.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {(log.confidenceScore * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {log.processingTime}ms
                        </span>
                      </div>
                      
                      <p className="text-sm">
                        Processed feedback #{log.feedbackId} using {log.processingType}
                      </p>
                      
                      {log.matchedKeywords && log.matchedKeywords.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Matched:</span>
                          <div className="flex flex-wrap gap-1">
                            {log.matchedKeywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {log.createdTaskId && (
                        <p className="text-sm text-blue-600">
                          → Created Task #{log.createdTaskId}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {processingLog.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No processing activity</h3>
                  <p className="text-muted-foreground">
                    AI processing logs will appear here when feedback is analyzed.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-xl font-semibold">Feedback Analytics & Trends</h3>
          
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Issue Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Issue Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topIssueCategories.map((category, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-600 rounded-full" 
                              style={{ 
                                width: `${(category.count / Math.max(...analytics.topIssueCategories.map(c => c.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Volume Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentTrends.map((trend, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {format(new Date(trend.date), "MMM dd")}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-600 rounded-full" 
                              style={{ 
                                width: `${(trend.count / Math.max(...analytics.recentTrends.map(t => t.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{trend.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}