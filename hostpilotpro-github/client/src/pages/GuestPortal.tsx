import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  MessageSquare,
  Bot,
  Bell,
  Calendar as CalendarIcon,
  MapPin,
  Utensils,
  Car,
  Heart,
  Coffee,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  MessageCircle,
  Send,
  Plus,
  Settings,
  TrendingUp,
  Users,
  Activity,
  Target,
  Lightbulb,
  Phone,
  Mail,
  Wifi,
  ShowerHead,
  Thermometer,
  Volume2,
} from "lucide-react";

// Form schemas
const messageSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Valid email is required"),
  propertyId: z.number().min(1, "Property selection is required"),
  messageContent: z.string().min(1, "Message content is required"),
  messageType: z.enum(["chat", "request", "feedback", "complaint"]),
});

const serviceRequestSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  propertyId: z.number().min(1, "Property selection is required"),
  serviceType: z.enum(["massage", "taxi", "chef", "cleaning", "amenities"]),
  serviceName: z.string().min(1, "Service name is required"),
  requestedDate: z.date(),
  requestedTime: z.string().min(1, "Time is required"),
  numberOfGuests: z.number().min(1).max(20),
  specialRequests: z.string().optional(),
});

export default function GuestPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number>(1);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // Fetch guest messages
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["/api/guest-portal/messages", selectedProperty],
  });

  // Fetch AI-generated tasks
  const { data: aiTasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["/api/guest-portal/ai-tasks", selectedProperty],
  });

  // Fetch service requests
  const { data: serviceRequests, isLoading: loadingServices } = useQuery({
    queryKey: ["/api/guest-portal/service-requests", selectedProperty],
  });

  // Fetch AI suggestions
  const { data: aiSuggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ["/api/guest-portal/ai-suggestions"],
  });

  // Fetch portal settings
  const { data: portalSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ["/api/guest-portal/settings", selectedProperty],
  });

  // Fetch analytics
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["/api/guest-portal/analytics", selectedProperty],
  });

  // Forms
  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      propertyId: selectedProperty,
      messageType: "chat",
    },
  });

  const serviceForm = useForm<z.infer<typeof serviceRequestSchema>>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      propertyId: selectedProperty,
      numberOfGuests: 2,
      requestedDate: new Date(),
    },
  });

  // Mutations
  const createMessage = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/guest-portal/messages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/messages"] });
      toast({ title: "Success", description: "Message sent successfully" });
      setActiveDialog(null);
      messageForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createServiceRequest = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/guest-portal/service-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/service-requests"] });
      toast({ title: "Success", description: "Service request submitted successfully" });
      setActiveDialog(null);
      serviceForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const respondToMessage = useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      apiRequest("PATCH", `/api/guest-portal/messages/${id}/respond`, { response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/messages"] });
      toast({ title: "Success", description: "Response sent successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveAiTask = useMutation({
    mutationFn: (taskId: number) => apiRequest("PATCH", `/api/guest-portal/ai-tasks/${taskId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/ai-tasks"] });
      toast({ title: "Success", description: "AI task approved successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectAiTask = useMutation({
    mutationFn: (taskId: number) => apiRequest("PATCH", `/api/guest-portal/ai-tasks/${taskId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/ai-tasks"] });
      toast({ title: "Success", description: "AI task rejected successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "outline",
      acknowledged: "secondary",
      resolved: "default",
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "outline",
      normal: "secondary",
      high: "destructive",
      urgent: "destructive",
      critical: "destructive",
    };
    return <Badge variant={variants[priority] || "outline"}>{priority}</Badge>;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "negative":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "massage":
        return <Heart className="h-5 w-5" />;
      case "taxi":
        return <Car className="h-5 w-5" />;
      case "chef":
        return <Utensils className="h-5 w-5" />;
      case "cleaning":
        return <Home className="h-5 w-5" />;
      default:
        return <Coffee className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "PPP");
  };

  const formatTime = (date: string | Date) => {
    return format(new Date(date), "p");
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Guest Portal</h1>
          <p className="text-muted-foreground">
            Smart communication center with AI-powered task automation and guest services
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedProperty.toString()} onValueChange={(value) => setSelectedProperty(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Villa Sunset</SelectItem>
              <SelectItem value="2">Ocean Breeze</SelectItem>
              <SelectItem value="3">Mountain View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics && analytics[0] ? analytics[0].totalMessages : 0}
            </div>
            <p className="text-xs text-muted-foreground">Guest communications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics && analytics[0] ? analytics[0].totalServiceRequests : 0}
            </div>
            <p className="text-xs text-muted-foreground">Bookings & requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics && analytics[0] ? `${analytics[0].averageResponseTime}m` : "0m"}
            </div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics && analytics[0] ? `${analytics[0].guestSatisfactionScore}/5` : "0/5"}
            </div>
            <p className="text-xs text-muted-foreground">Guest rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="messages">💬 Messages</TabsTrigger>
          <TabsTrigger value="ai-tasks">🤖 AI Tasks</TabsTrigger>
          <TabsTrigger value="services">🛎️ Services</TabsTrigger>
          <TabsTrigger value="suggestions">💡 AI Insights</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        {/* Guest Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Guest Communication Center</h2>
            <Dialog open={activeDialog === "create-message"} onOpenChange={(open) => setActiveDialog(open ? "create-message" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Simulate Guest Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Simulate Guest Message</DialogTitle>
                  <DialogDescription>Create a demo guest message to test AI processing</DialogDescription>
                </DialogHeader>
                <Form {...messageForm}>
                  <form
                    onSubmit={messageForm.handleSubmit((data) => createMessage.mutate(data))}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={messageForm.control}
                        name="guestName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guest Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Sarah Johnson" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={messageForm.control}
                        name="guestEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guest Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="sarah.johnson@example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={messageForm.control}
                      name="messageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select message type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="chat">Chat</SelectItem>
                              <SelectItem value="request">Request</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="complaint">Complaint</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={messageForm.control}
                      name="messageContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Content</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="The pool seems dirty and there's no hot water in the bathroom. Could someone please look into this?"
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            AI will process this message for keywords and sentiment
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialog(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMessage.isPending}>
                        {createMessage.isPending ? "Processing..." : "Send Message"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              messages?.map((message: any) => (
                <Card key={message.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{message.guestName}</h3>
                            <Badge variant="outline">{message.messageType}</Badge>
                            {getPriorityBadge(message.priority)}
                            {getSentimentIcon(message.aiSentiment)}
                          </div>
                          <p className="text-sm text-muted-foreground">{message.guestEmail}</p>
                          <p className="mt-2">{message.messageContent}</p>
                          
                          {message.aiProcessed && (
                            <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">AI Analysis</span>
                                <Badge variant="secondary">
                                  {Math.round(parseFloat(message.aiConfidence) * 100)}% confidence
                                </Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="font-medium">Keywords:</span> {message.aiKeywords?.join(", ")}
                                </div>
                                <div>
                                  <span className="font-medium">Suggestions:</span> {message.aiSuggestions?.join(", ")}
                                </div>
                              </div>
                            </div>
                          )}

                          {message.staffResponse && (
                            <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500">
                              <div className="flex items-center space-x-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Staff Response</span>
                                <span className="text-xs text-muted-foreground">
                                  by {message.respondedBy} • {formatTime(message.respondedAt)}
                                </span>
                              </div>
                              <p className="text-sm">{message.staffResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </div>
                        {getStatusBadge(message.status)}
                        {!message.staffResponse && message.status !== "resolved" && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedMessage(message);
                              setActiveDialog("respond-message");
                            }}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Response Dialog */}
          <Dialog open={activeDialog === "respond-message"} onOpenChange={(open) => setActiveDialog(open ? "respond-message" : null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Respond to Guest</DialogTitle>
                <DialogDescription>Send a response to {selectedMessage?.guestName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm">{selectedMessage?.messageContent}</p>
                </div>
                <Textarea
                  placeholder="Type your response here..."
                  rows={4}
                  id="response-text"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActiveDialog(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const responseText = (document.getElementById("response-text") as HTMLTextAreaElement)?.value;
                      if (responseText && selectedMessage) {
                        respondToMessage.mutate({ id: selectedMessage.id, response: responseText });
                        setActiveDialog(null);
                      }
                    }}
                  >
                    Send Response
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* AI Tasks Tab */}
        <TabsContent value="ai-tasks" className="space-y-6">
          <h2 className="text-2xl font-bold">AI-Generated Tasks</h2>
          
          <div className="space-y-4">
            {loadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              aiTasks?.map((task: any) => (
                <Card key={task.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-secondary/50 rounded-lg">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">AI Task: {task.department}</h3>
                            <Badge variant="outline">{task.taskType.replace("_", " ")}</Badge>
                            {getPriorityBadge(task.urgency)}
                            <Badge variant="secondary">
                              {Math.round(parseFloat(task.confidence) * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Guest: {task.guestId} • Property: {task.propertyId}
                          </p>
                          <p className="mb-3">{task.aiDescription}</p>
                          
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="font-medium">Keywords:</span> {task.aiKeywords?.join(", ")}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
                            </div>
                            {task.assignedTo && (
                              <div>
                                <span className="font-medium">Assigned to:</span> {task.assignedTo}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(task.status)}
                        {task.status === "pending" && (
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => approveAiTask.mutate(task.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectAiTask.mutate(task.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Service Requests Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Guest Service Requests</h2>
            <Dialog open={activeDialog === "create-service"} onOpenChange={(open) => setActiveDialog(open ? "create-service" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Service Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Service Request</DialogTitle>
                  <DialogDescription>Book a service for guests</DialogDescription>
                </DialogHeader>
                <Form {...serviceForm}>
                  <form
                    onSubmit={serviceForm.handleSubmit((data) => createServiceRequest.mutate(data))}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={serviceForm.control}
                        name="guestName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guest Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Mike Chen" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={serviceForm.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="massage">Massage</SelectItem>
                                <SelectItem value="taxi">Taxi/Transport</SelectItem>
                                <SelectItem value="chef">Private Chef</SelectItem>
                                <SelectItem value="cleaning">Extra Cleaning</SelectItem>
                                <SelectItem value="amenities">Extra Amenities</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={serviceForm.control}
                      name="serviceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Traditional Thai Massage" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={serviceForm.control}
                        name="requestedDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={serviceForm.control}
                        name="requestedTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="19:00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={serviceForm.control}
                        name="numberOfGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guests</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" max="20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={serviceForm.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Couples massage preferred" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialog(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createServiceRequest.isPending}>
                        {createServiceRequest.isPending ? "Creating..." : "Create Request"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {loadingServices ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              serviceRequests?.map((request: any) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getServiceIcon(request.serviceType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{request.serviceName}</h3>
                            <Badge variant="outline">{request.serviceType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Guest: {request.guestName} • {request.numberOfGuests} guests
                          </p>
                          <div className="text-sm space-y-1 mb-3">
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(request.requestedDate)} at {request.requestedTime}
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span> {formatCurrency(request.estimatedCost)}
                            </div>
                            <div>
                              <span className="font-medium">Payment:</span> {request.paymentMethod.replace("_", " ")}
                            </div>
                          </div>
                          {request.specialRequests && (
                            <p className="text-sm text-muted-foreground">{request.specialRequests}</p>
                          )}
                          {request.guestFeedback && (
                            <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500">
                              <div className="flex items-center space-x-2 mb-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">Guest Feedback</span>
                                <div className="flex">
                                  {Array.from({ length: request.guestRating }, (_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm">{request.guestFeedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-2">
                          {formatDate(request.createdAt)}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <h2 className="text-2xl font-bold">AI Smart Suggestions</h2>
          
          <div className="grid gap-6">
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              aiSuggestions?.map((suggestion: any) => (
                <Card key={suggestion.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-secondary/50 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{suggestion.suggestionTitle}</h3>
                            <Badge variant="outline">{suggestion.suggestionType.replace("_", " ")}</Badge>
                            <Badge variant="secondary">
                              {Math.round(parseFloat(suggestion.confidence) * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Target: {suggestion.targetAudience} • Based on: {suggestion.basedOnData.replace("_", " ")}
                          </p>
                          <p className="mb-3">{suggestion.suggestionDescription}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {suggestion.potentialRevenue && parseFloat(suggestion.potentialRevenue) > 0 && (
                              <div>
                                <span className="font-medium">Potential Revenue:</span> {formatCurrency(suggestion.potentialRevenue)}
                              </div>
                            )}
                            {suggestion.implementationCost && parseFloat(suggestion.implementationCost) > 0 && (
                              <div>
                                <span className="font-medium">Implementation Cost:</span> {formatCurrency(suggestion.implementationCost)}
                              </div>
                            )}
                          </div>
                          
                          {suggestion.notes && (
                            <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                              <p className="text-sm">{suggestion.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-2">
                          {formatDate(suggestion.createdAt)}
                        </div>
                        {getPriorityBadge(suggestion.priority)}
                        {getStatusBadge(suggestion.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Guest Portal Settings</h2>
          
          {loadingSettings ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            portalSettings && (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portal Configuration</CardTitle>
                    <CardDescription>Enable or disable guest portal features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enable-portal">Guest Portal</Label>
                        <Switch id="enable-portal" checked={portalSettings.enableGuestPortal} />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enable-ai">AI Assistant</Label>
                        <Switch id="enable-ai" checked={portalSettings.enableAiAssistant} />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enable-services">Service Booking</Label>
                        <Switch id="enable-services" checked={portalSettings.enableServiceBooking} />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enable-chat">Chat System</Label>
                        <Switch id="enable-chat" checked={portalSettings.enableChatSystem} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Guest Information</CardTitle>
                    <CardDescription>Information displayed to guests</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Welcome Message</Label>
                        <p className="text-sm text-muted-foreground mt-1">{portalSettings.welcomeMessage}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center space-x-2">
                            <Wifi className="h-4 w-4" />
                            <span>WiFi Password</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{portalSettings.wifiPassword}</p>
                        </div>
                        <div>
                          <Label className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>Emergency Contact</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{portalSettings.emergencyContact}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Local Recommendations</CardTitle>
                    <CardDescription>Places and activities recommended to guests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {portalSettings.localRecommendations?.map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}