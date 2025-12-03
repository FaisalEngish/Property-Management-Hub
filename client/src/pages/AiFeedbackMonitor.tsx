import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Brain, MessageSquare, Settings, Activity, CheckCircle, AlertTriangle, Plus, Eye, Play, Zap } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const feedbackSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  propertyId: z.coerce.number().min(1, "Property is required"),
  originalMessage: z.string().min(1, "Message is required"),
  source: z.string().min(1, "Source is required"),
});

const ruleSchema = z.object({
  ruleName: z.string().min(1, "Rule name is required"),
  keywords: z.string().min(1, "Keywords are required"),
  taskType: z.string().min(1, "Task type is required"),
  taskTitle: z.string().min(1, "Task title is required"),
  taskDescription: z.string().optional(),
  assignToDepartment: z.string().min(1, "Department is required"),
  priority: z.enum(["low", "medium", "high"]),
  defaultAssignee: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface GuestFeedback {
  id: number;
  guestName: string;
  propertyId: number;
  originalMessage: string;
  source: string;
  detectedKeywords: string[];
  aiConfidence: number;
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

export default function AiFeedbackMonitor() {
  const [activeTab, setActiveTab] = useState("feedback");
  const [selectedFeedback, setSelectedFeedback] = useState<GuestFeedback | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data
  const { data: feedback = [] } = useQuery({
    queryKey: ["/api/ai/feedback"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["/api/ai/rules"],
  });

  const { data: processingLogs = [] } = useQuery({
    queryKey: ["/api/ai/processing-logs"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Forms
  const feedbackForm = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      guestName: "",
      propertyId: 0,
      originalMessage: "",
      source: "manual",
    },
  });

  const ruleForm = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      ruleName: "",
      keywords: "",
      taskType: "maintenance",
      taskTitle: "",
      taskDescription: "",
      assignToDepartment: "maintenance",
      priority: "medium" as const,
      defaultAssignee: "",
      isActive: true,
    },
  });

  // Mutations
  const createFeedbackMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/ai/feedback", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      feedbackForm.reset();
      toast({
        title: "Feedback Processed",
        description: data.autoTasksCreated > 0 
          ? `${data.autoTasksCreated} task(s) automatically created`
          : "Feedback saved for review",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process feedback",
        variant: "destructive",
      });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/ai/rules", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/rules"] });
      ruleForm.reset();
      toast({
        title: "Success",
        description: "AI task rule created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create AI task rule",
        variant: "destructive",
      });
    },
  });

  const processFeedbackMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/ai/feedback/${id}/process`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setSelectedFeedback(null);
      toast({
        title: "Success",
        description: "Feedback processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process feedback",
        variant: "destructive",
      });
    },
  });

  const analyzeMessageMutation = useMutation({
    mutationFn: (message: string) => 
      apiRequest("/api/ai/analyze-message", { method: "POST", body: JSON.stringify({ message }) }),
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Found ${data.matchedRules.length} matching rules`,
      });
    },
  });

  const onSubmitFeedback = (data: any) => {
    createFeedbackMutation.mutate(data);
  };

  const onSubmitRule = (data: any) => {
    const formattedData = {
      ...data,
      keywords: data.keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
    };
    createRuleMutation.mutate(formattedData);
  };

  const handleProcessFeedback = (feedbackId: number, action: string, ruleId?: number) => {
    const data: any = {
      processingNotes: `Manually ${action} by user`,
    };
    
    if (action === "create_task" && ruleId) {
      data.createTask = true;
      data.ruleId = ruleId;
    }
    
    processFeedbackMutation.mutate({ id: feedbackId, data });
  };

  const testAiAnalysis = () => {
    if (!testMessage.trim()) return;
    analyzeMessageMutation.mutate(testMessage);
  };

  const unprocessedFeedback = feedback.filter((f: GuestFeedback) => !f.isProcessed);
  const actionRequiredFeedback = feedback.filter((f: GuestFeedback) => f.requiresAction && !f.isProcessed);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">AI Smart Task Triggers & Feedback Monitor</h1>
          <p className="text-muted-foreground">
            Automatically detect guest issues and create maintenance tasks
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{feedback.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Needs Action</p>
                <p className="text-2xl font-bold">{actionRequiredFeedback.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{rules.filter((r: AiTaskRule) => r.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Processing Logs</p>
                <p className="text-2xl font-bold">{processingLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback">Guest Feedback</TabsTrigger>
          <TabsTrigger value="rules">AI Task Rules</TabsTrigger>
          <TabsTrigger value="logs">Processing Logs</TabsTrigger>
          <TabsTrigger value="test">Test AI</TabsTrigger>
        </TabsList>

        {/* Guest Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Guest Feedback Monitor</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Guest Feedback</DialogTitle>
                  <DialogDescription>
                    Submit guest feedback for AI analysis and task creation
                  </DialogDescription>
                </DialogHeader>
                <Form {...feedbackForm}>
                  <form onSubmit={feedbackForm.handleSubmit(onSubmitFeedback)} className="space-y-4">
                    <FormField
                      control={feedbackForm.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guest Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John Smith" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={feedbackForm.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {properties.map((property: any) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                  {property.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={feedbackForm.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="airbnb">Airbnb</SelectItem>
                              <SelectItem value="booking">Booking.com</SelectItem>
                              <SelectItem value="vrbo">VRBO</SelectItem>
                              <SelectItem value="direct">Direct Message</SelectItem>
                              <SelectItem value="phone">Phone Call</SelectItem>
                              <SelectItem value="manual">Manual Entry</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={feedbackForm.control}
                      name="originalMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guest Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="The pool is dirty and needs cleaning..."
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={createFeedbackMutation.isPending}>
                      {createFeedbackMutation.isPending ? "Processing..." : "Process Feedback"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {feedback.map((item: GuestFeedback) => (
              <Card key={item.id} className={item.requiresAction && !item.isProcessed ? "border-orange-200 bg-orange-50" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.guestName}</CardTitle>
                      <CardDescription>
                        {properties.find((p: any) => p.id === item.propertyId)?.name || `Property #${item.propertyId}`} 
                        • {item.source} • {format(new Date(item.receivedAt), "MMM dd, yyyy HH:mm")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {item.requiresAction && (
                        <Badge variant="destructive">Action Required</Badge>
                      )}
                      {item.isProcessed ? (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Processed
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Original Message:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{item.originalMessage}</p>
                    </div>
                    
                    {item.detectedKeywords?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Detected Keywords:</p>
                        <div className="flex gap-1 flex-wrap">
                          {item.detectedKeywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>AI Confidence: {Math.round(item.aiConfidence * 100)}%</span>
                      {item.assignedTaskId && (
                        <span>Task #{item.assignedTaskId} created</span>
                      )}
                    </div>

                    {!item.isProcessed && item.requiresAction && (
                      <div className="flex gap-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Process Feedback</DialogTitle>
                              <DialogDescription>
                                Choose how to handle this guest feedback
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm font-medium">Guest Message:</p>
                                <p className="text-sm mt-1">{item.originalMessage}</p>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="font-medium">Available Actions:</h4>
                                {rules.filter((r: AiTaskRule) => r.isActive).map((rule: AiTaskRule) => (
                                  <Button
                                    key={rule.id}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleProcessFeedback(item.id, "create_task", rule.id)}
                                  >
                                    <Play className="h-3 w-3 mr-2" />
                                    Create {rule.taskType}: {rule.taskTitle}
                                  </Button>
                                ))}
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => handleProcessFeedback(item.id, "mark_reviewed")}
                                >
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  Mark as Reviewed (No Action)
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Task Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Task Rules</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create AI Task Rule</DialogTitle>
                  <DialogDescription>
                    Define keywords and actions for automatic task creation
                  </DialogDescription>
                </DialogHeader>
                <Form {...ruleForm}>
                  <form onSubmit={ruleForm.handleSubmit(onSubmitRule)} className="space-y-4">
                    <FormField
                      control={ruleForm.control}
                      name="ruleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Pool Cleaning Detection" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ruleForm.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords (comma-separated)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="pool dirty, pool clean, pool maintenance" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ruleForm.control}
                        name="taskType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={ruleForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={ruleForm.control}
                      name="taskTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title Template</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Clean pool - Guest: {guest_name}" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ruleForm.control}
                      name="taskDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Pool cleaning and maintenance required based on guest feedback" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ruleForm.control}
                        name="assignToDepartment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                                <SelectItem value="front-desk">Front Desk</SelectItem>
                                <SelectItem value="management">Management</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={ruleForm.control}
                        name="defaultAssignee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Assignee (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="staff-user-id" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={createRuleMutation.isPending}>
                      {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {rules.map((rule: AiTaskRule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rule.ruleName}</CardTitle>
                      <CardDescription>
                        {rule.assignToDepartment} • {rule.taskType} • Priority: {rule.priority}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {rule.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Keywords:</p>
                      <div className="flex gap-1 flex-wrap">
                        {rule.keywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Task Template:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{rule.taskTitle}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Triggered {rule.triggerCount} times</span>
                      {rule.lastTriggered && (
                        <span>Last: {format(new Date(rule.lastTriggered), "MMM dd, yyyy")}</span>
                      )}
                      <span>Created by {rule.createdBy}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Processing Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <h2 className="text-xl font-semibold">AI Processing Logs</h2>
          <div className="grid gap-4">
            {processingLogs.map((log: ProcessingLog) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">Feedback #{log.feedbackId}</span>
                      <Badge variant="outline" className="ml-2">
                        {log.processingType}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Action:</span> {log.actionTaken}
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span> {Math.round(log.confidenceScore * 100)}%
                    </div>
                    {log.matchedKeywords.length > 0 && (
                      <div>
                        <span className="font-medium">Keywords:</span> {log.matchedKeywords.join(", ")}
                      </div>
                    )}
                    {log.createdTaskId && (
                      <div>
                        <span className="font-medium">Created Task:</span> #{log.createdTaskId}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Processing Time:</span> {log.processingTime}ms
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test AI Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test AI Message Analysis</CardTitle>
              <CardDescription>
                Test how the AI system would process a guest message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-message">Guest Message</Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="The pool is very dirty and needs to be cleaned immediately..."
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={testAiAnalysis}
                disabled={!testMessage.trim() || analyzeMessageMutation.isPending}
              >
                <Brain className="h-4 w-4 mr-2" />
                {analyzeMessageMutation.isPending ? "Analyzing..." : "Analyze Message"}
              </Button>

              {analyzeMessageMutation.data && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Analysis Results:</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Matched Rules:</span>
                        <span className="ml-2">{analyzeMessageMutation.data.matchedRules.length}</span>
                      </div>
                      
                      {analyzeMessageMutation.data.detectedKeywords.length > 0 && (
                        <div>
                          <span className="font-medium">Detected Keywords:</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {analyzeMessageMutation.data.detectedKeywords.map((keyword: string) => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analyzeMessageMutation.data.recommendedActions.length > 0 && (
                        <div>
                          <span className="font-medium">Recommended Actions:</span>
                          <ul className="mt-1 space-y-1">
                            {analyzeMessageMutation.data.recommendedActions.map((action: string, index: number) => (
                              <li key={index} className="text-sm bg-green-50 p-2 rounded flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}