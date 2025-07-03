import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, Clock, CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare, Timer, TrendingUp, Settings } from "lucide-react";

interface EnhancedAiSuggestion {
  id: number;
  propertyId: number;
  suggestionType: string;
  suggestedTitle: string;
  suggestedDescription: string;
  confidenceScore: string;
  urgencyLevel: string;
  estimatedCost: string;
  aiAnalysis: string;
  sourceData: any;
  triggerKeywords: string[];
  status: string;
  createdAt: string;
}

interface PropertyTimeline {
  id: number;
  propertyId: number;
  eventType: string;
  title: string;
  description: string;
  emoji: string;
  linkedId: number;
  linkedType: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

interface SmartNotification {
  id: number;
  notificationType: string;
  title: string;
  message: string;
  priority: string;
  actionRequired: boolean;
  actionButtons: any[];
  isRead: boolean;
  createdAt: string;
}

interface FastActionSuggestion {
  id: number;
  propertyId: number;
  actionType: string;
  title: string;
  description: string;
  estimatedCost: string;
  urgency: string;
  status: string;
  suggestedBy: string;
  createdAt: string;
}

// [MERGED] This module has been consolidated into MaintenanceTaskSystem.tsx  
// AI task suggestions functionality is now available in the AI Suggestions tab of comprehensive task management
export default function AiTaskManager() {
  const [selectedProperty, setSelectedProperty] = useState<number>(1);
  const [reviewText, setReviewText] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<EnhancedAiSuggestion | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI suggestions
  const { data: aiSuggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/enhanced-ai-suggestions', selectedProperty],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch property timeline
  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: [`/api/property-timeline/${selectedProperty}`],
    refetchInterval: 30000,
  });

  // Fetch smart notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/smart-notifications'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
  });

  // Fetch fast action suggestions
  const { data: fastActions = [], isLoading: fastActionsLoading } = useQuery({
    queryKey: ['/api/fast-action-suggestions', selectedProperty],
    refetchInterval: 30000,
  });

  // Process review feedback mutation
  const processReviewMutation = useMutation({
    mutationFn: async (data: { bookingId: number; reviewText: string }) => {
      return await apiRequest('POST', '/api/ai/process-review-feedback', data);
    },
    onSuccess: (data) => {
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${data.suggestions.length} task suggestions from review feedback.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-ai-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/smart-notifications'] });
      setReviewText("");
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to process review feedback",
        variant: "destructive",
      });
    },
  });

  // Accept AI suggestion mutation
  const acceptSuggestionMutation = useMutation({
    mutationFn: async (data: { id: number; taskData: any }) => {
      return await apiRequest('POST', `/api/enhanced-ai-suggestions/${data.id}/accept`, {
        taskTitle: data.taskData.title,
        taskDescription: data.taskData.description,
        assignedTo: data.taskData.assignedTo,
        priority: data.taskData.priority,
        propertyId: selectedProperty,
        department: getSuggestionDepartment(data.taskData.title),
      });
    },
    onSuccess: () => {
      toast({
        title: "Suggestion Accepted",
        description: "AI suggestion has been converted to a task.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-ai-suggestions'] });
      queryClient.invalidateQueries({ queryKey: [`/api/property-timeline/${selectedProperty}`] });
      setSelectedSuggestion(null);
      setTaskFormData({ title: "", description: "", assignedTo: "", priority: "medium" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept suggestion",
        variant: "destructive",
      });
    },
  });

  // Reject suggestion mutation
  const rejectSuggestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/enhanced-ai-suggestions/${id}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Suggestion Dismissed",
        description: "AI suggestion has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-ai-suggestions'] });
    },
  });

  const getSuggestionDepartment = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('clean')) return 'cleaning';
    if (titleLower.includes('pool')) return 'pool';
    if (titleLower.includes('garden')) return 'garden';
    if (titleLower.includes('repair') || titleLower.includes('fix')) return 'maintenance';
    return 'general';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500 text-white';
      case 'accepted': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleProcessReview = () => {
    if (!reviewText.trim()) {
      toast({
        title: "Review Required",
        description: "Please enter guest review text to analyze.",
        variant: "destructive",
      });
      return;
    }

    processReviewMutation.mutate({
      bookingId: 1, // Mock booking ID
      reviewText,
    });
  };

  const handleAcceptSuggestion = () => {
    if (!selectedSuggestion || !taskFormData.title) {
      toast({
        title: "Task Details Required",
        description: "Please fill in all task details.",
        variant: "destructive",
      });
      return;
    }

    acceptSuggestionMutation.mutate({
      id: selectedSuggestion.id,
      taskData: taskFormData,
    });
  };

  useEffect(() => {
    if (selectedSuggestion) {
      setTaskFormData({
        title: selectedSuggestion.suggestedTitle,
        description: selectedSuggestion.suggestedDescription,
        assignedTo: "",
        priority: selectedSuggestion.urgencyLevel === 'urgent' ? 'high' : selectedSuggestion.urgencyLevel,
      });
    }
  }, [selectedSuggestion]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">AI Task Manager</h1>
            <p className="text-gray-600">Intelligent task automation and smart notifications</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedProperty.toString()} onValueChange={(value) => setSelectedProperty(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Villa Sunset Paradise</SelectItem>
              <SelectItem value="2">Ocean Breeze Resort</SelectItem>
              <SelectItem value="3">Mountain View Lodge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suggestions" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Suggestions</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="fast-actions" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Fast Actions</span>
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Review Analyzer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Task Suggestions</span>
                <Badge variant="outline">{aiSuggestions.length} active</Badge>
              </CardTitle>
              <CardDescription>
                AI-generated task suggestions based on guest feedback and property patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : aiSuggestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI suggestions at the moment</p>
                  <p className="text-sm">Process guest reviews to generate intelligent task suggestions</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {aiSuggestions.map((suggestion: EnhancedAiSuggestion) => (
                    <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{suggestion.suggestedTitle}</h3>
                              <Badge className={getUrgencyColor(suggestion.urgencyLevel)}>
                                {suggestion.urgencyLevel}
                              </Badge>
                              <Badge className={getStatusColor(suggestion.status)}>
                                {suggestion.status}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{suggestion.suggestedDescription}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                              <div>
                                <span className="font-medium">Confidence:</span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${suggestion.confidenceScore}%` }}
                                    />
                                  </div>
                                  <span>{suggestion.confidenceScore}%</span>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Type:</span>
                                <p className="capitalize">{suggestion.suggestionType.replace('-', ' ')}</p>
                              </div>
                              <div>
                                <span className="font-medium">Est. Cost:</span>
                                <p>${suggestion.estimatedCost}</p>
                              </div>
                              <div>
                                <span className="font-medium">Keywords:</span>
                                <p className="text-xs">{suggestion.triggerKeywords?.join(', ')}</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded text-sm">
                              <span className="font-medium">AI Analysis:</span>
                              <p className="mt-1">{suggestion.aiAnalysis}</p>
                            </div>
                          </div>
                          
                          {suggestion.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedSuggestion(suggestion)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Create Task from AI Suggestion</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="taskTitle">Task Title</Label>
                                      <Input
                                        id="taskTitle"
                                        value={taskFormData.title}
                                        onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="taskDescription">Description</Label>
                                      <Textarea
                                        id="taskDescription"
                                        value={taskFormData.description}
                                        onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="assignedTo">Assign To</Label>
                                        <Select 
                                          value={taskFormData.assignedTo} 
                                          onValueChange={(value) => setTaskFormData(prev => ({ ...prev, assignedTo: value }))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select staff member" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="staff@test.com">John Smith (Maintenance)</SelectItem>
                                            <SelectItem value="cleaner@test.com">Maria Garcia (Cleaning)</SelectItem>
                                            <SelectItem value="gardener@test.com">James Wilson (Garden)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select 
                                          value={taskFormData.priority} 
                                          onValueChange={(value) => setTaskFormData(prev => ({ ...prev, priority: value }))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        onClick={handleAcceptSuggestion}
                                        disabled={acceptSuggestionMutation.isPending}
                                      >
                                        {acceptSuggestionMutation.isPending ? 'Creating...' : 'Create Task'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => rejectSuggestionMutation.mutate(suggestion.id)}
                                disabled={rejectSuggestionMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Property Timeline</span>
              </CardTitle>
              <CardDescription>
                Chronological activity feed for the selected property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timelineLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : timeline.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No timeline events for this property</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event: PropertyTimeline) => (
                    <div key={event.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{event.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{event.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>By: {event.createdByRole}</span>
                          <span>Type: {event.eventType}</span>
                          {event.linkedType && <span>Linked: {event.linkedType}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Smart Notifications</span>
                <Badge variant="outline">{notifications.filter((n: SmartNotification) => !n.isRead).length} unread</Badge>
              </CardTitle>
              <CardDescription>
                Real-time alerts and action items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification: SmartNotification) => (
                    <Card key={notification.id} className={`border-l-4 ${notification.isRead ? 'border-l-gray-300 bg-gray-50' : 'border-l-blue-500 bg-white'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">{notification.title}</h4>
                              <Badge className={`${notification.priority === 'high' ? 'bg-red-500' : notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                                {notification.priority}
                              </Badge>
                              {!notification.isRead && <Badge variant="outline">New</Badge>}
                            </div>
                            <p className="text-gray-600">{notification.message}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {notification.actionRequired && notification.actionButtons?.length > 0 && (
                            <div className="flex space-x-2 ml-4">
                              {notification.actionButtons.map((button: any, idx: number) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant={button.style === 'primary' ? 'default' : 'outline'}
                                >
                                  {button.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fast-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Fast Action Suggestions</span>
              </CardTitle>
              <CardDescription>
                Quick approval workflow for urgent actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fastActionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : fastActions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fast actions pending</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {fastActions.map((action: FastActionSuggestion) => (
                    <Card key={action.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{action.title}</h3>
                              <Badge className={getUrgencyColor(action.urgency)}>
                                {action.urgency}
                              </Badge>
                              <Badge className={getStatusColor(action.status)}>
                                {action.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{action.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Type: {action.actionType}</span>
                              <span>Cost: ${action.estimatedCost}</span>
                              <span>Suggested by: {action.suggestedBy}</span>
                            </div>
                          </div>
                          {action.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button variant="outline" size="sm">
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Review Analyzer</span>
              </CardTitle>
              <CardDescription>
                Analyze guest reviews to automatically generate task suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reviewText">Guest Review Text</Label>
                <Textarea
                  id="reviewText"
                  placeholder="Paste guest review or feedback here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleProcessReview}
                  disabled={processReviewMutation.isPending || !reviewText.trim()}
                  className="flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>
                    {processReviewMutation.isPending ? 'Analyzing...' : 'Analyze Review'}
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setReviewText("")}
                  disabled={processReviewMutation.isPending}
                >
                  Clear
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Sample Reviews to Try:</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    className="block text-left text-blue-600 hover:text-blue-800"
                    onClick={() => setReviewText("The pool was quite dirty when we arrived, and the water looked cloudy. Also, the villa could use a good cleaning - there was dust everywhere.")}
                  >
                    • "The pool was quite dirty when we arrived, and the water looked cloudy. Also, the villa could use a good cleaning - there was dust everywhere."
                  </button>
                  <button 
                    className="block text-left text-blue-600 hover:text-blue-800"
                    onClick={() => setReviewText("The garden was overgrown and needs attention. Some of the outdoor furniture is broken and needs to be fixed or replaced.")}
                  >
                    • "The garden was overgrown and needs attention. Some of the outdoor furniture is broken and needs to be fixed or replaced."
                  </button>
                  <button 
                    className="block text-left text-blue-600 hover:text-blue-800"
                    onClick={() => setReviewText("Air conditioning wasn't working properly in the master bedroom. The repair should be prioritized for future guests.")}
                  >
                    • "Air conditioning wasn't working properly in the master bedroom. The repair should be prioritized for future guests."
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}