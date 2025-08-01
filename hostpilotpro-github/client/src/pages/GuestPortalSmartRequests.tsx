import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Bot,
  Bell,
  Star,
  MapPin,
  Book,
  Utensils,
  Bed,
  Car,
  Plane,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Demo data for guest reservation
const DEMO_RESERVATION = {
  id: "Demo1234",
  guestName: "Liam Andersen",
  propertyName: "Villa Aruna",
  checkIn: "2025-07-05",
  checkOut: "2025-07-10",
  status: "confirmed"
};

// Service categories with icons
const SERVICE_CATEGORIES = [
  { id: "spa", name: "Spa & Wellness", icon: Star, keywords: ["massage", "spa", "wellness", "treatment"] },
  { id: "dining", name: "Dining", icon: Utensils, keywords: ["dinner", "chef", "meal", "restaurant", "food"] },
  { id: "housekeeping", name: "Housekeeping", icon: Bed, keywords: ["cleaning", "towels", "bed", "room", "housekeeping"] },
  { id: "transport", name: "Transportation", icon: Car, keywords: ["taxi", "transfer", "airport", "car", "driver"] },
  { id: "concierge", name: "Concierge", icon: MapPin, keywords: ["recommendation", "booking", "tour", "tickets"] },
  { id: "general", name: "General", icon: Phone, keywords: ["other", "help", "question", "request"] }
];

export default function GuestPortalSmartRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user is a guest
  const isGuest = user?.role === "guest";
  const isStaff = ["admin", "portfolio-manager", "staff"].includes(user?.role || "");

  // Fetch chat messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/guest-portal/chat-messages", DEMO_RESERVATION.id],
    enabled: !!user,
  });

  // Fetch service requests
  const { data: serviceRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/guest-portal/service-requests", DEMO_RESERVATION.id],
    enabled: !!user,
  });

  // Fetch pending notifications (for staff)
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/guest-portal/notifications"],
    enabled: isStaff,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/guest-portal/send-message", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/notifications"] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle service request action (accept/decline/edit)
  const handleRequestActionMutation = useMutation({
    mutationFn: async ({ requestId, action, notes }: any) => {
      return apiRequest("POST", `/api/guest-portal/service-requests/${requestId}/action`, {
        action,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-portal/notifications"] });
      setSelectedRequest(null);
      toast({
        title: "Request updated",
        description: "Service request has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      reservationId: DEMO_RESERVATION.id,
      messageText: newMessage,
      senderType: isGuest ? "guest" : "staff",
      senderId: user?.id || "demo-user",
    };

    sendMessageMutation.mutate(messageData);
  };

  // Handle request action
  const handleRequestAction = (action: string, notes?: string) => {
    if (!selectedRequest) return;

    handleRequestActionMutation.mutate({
      requestId: selectedRequest.id,
      action,
      notes,
    });
  };

  // Check if guest access is unlocked (7 days before check-in)
  const checkInDate = new Date(DEMO_RESERVATION.checkIn);
  const sevenDaysBeforeCheckIn = new Date(checkInDate);
  sevenDaysBeforeCheckIn.setDate(checkInDate.getDate() - 7);
  const isAccessUnlocked = new Date() >= sevenDaysBeforeCheckIn;

  if (messagesLoading || requestsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Guest view
  if (isGuest) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guest Portal</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, {DEMO_RESERVATION.guestName}! Your stay at {DEMO_RESERVATION.propertyName}
            </p>
          </div>

          {!isAccessUnlocked && (
            <Alert className="mb-6">
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Full access unlocks 7 days before check-in ({sevenDaysBeforeCheckIn.toLocaleDateString()}).
                Chat and basic information are available now.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">💬 Chat & Requests</TabsTrigger>
              <TabsTrigger value="services">✨ Confirmed Services</TabsTrigger>
              <TabsTrigger value="info" disabled={!isAccessUnlocked}>📋 Arrival & Info</TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat with our team
                  </CardTitle>
                  <CardDescription>
                    Ask questions, request services, or get recommendations. Our AI will help route your requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <ScrollArea className="h-96 border rounded-lg p-4">
                      <div className="space-y-4">
                        {messages.map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              message.senderType === "guest" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex items-start gap-2 max-w-xs lg:max-w-md ${
                                message.senderType === "guest" ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {message.senderType === "guest" ? (
                                  <User className="h-4 w-4" />
                                ) : message.isSystemGenerated ? (
                                  <Bot className="h-4 w-4" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                              </div>
                              <div
                                className={`p-3 rounded-lg ${
                                  message.senderType === "guest"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{message.messageText}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message or request..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quick Request Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SERVICE_CATEGORIES.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <Button
                            key={category.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setNewMessage(`I would like to request ${category.name.toLowerCase()}`)}
                          >
                            <IconComponent className="h-4 w-4 mr-2" />
                            {category.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Confirmed Services & Requests</CardTitle>
                  <CardDescription>
                    View all confirmed services and add-ons for your stay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceRequests
                      .filter((req: any) => req.status === "accepted")
                      .map((request: any) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{request.serviceType}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">{request.category}</Badge>
                                <Badge variant={request.billingType === "guest_billable" ? "destructive" : "default"}>
                                  {request.billingType}
                                </Badge>
                              </div>
                            </div>
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmed
                            </Badge>
                          </div>
                          {request.scheduledDate && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-300">
                              <Calendar className="h-4 w-4" />
                              Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}

                    {serviceRequests.filter((req: any) => req.status === "accepted").length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No confirmed services yet</p>
                        <p className="text-sm">Request services through the chat to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Arrival Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Please provide your arrival details for a smooth check-in
                    </p>
                    <Button>Update Arrival Info</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      House Manual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Important information about your stay
                    </p>
                    <Button variant="outline">View Manual</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Area Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Local recommendations and attractions
                    </p>
                    <Button variant="outline">Explore Area</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Service Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Cleaning and maintenance schedule
                    </p>
                    <Button variant="outline">View Schedule</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Staff/Admin view
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Guest Portal Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage guest communications and service requests
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">
              🔔 Notifications
              {notifications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">📋 All Requests</TabsTrigger>
            <TabsTrigger value="chat">💬 Chat Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <Card key={notification.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        New Service Request
                      </CardTitle>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <CardDescription>
                      From {notification.guestName} - {notification.propertyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{notification.serviceType}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {notification.description}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleRequestAction("accept")}
                          disabled={handleRequestActionMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedRequest(notification)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleRequestAction("decline")}
                          disabled={handleRequestActionMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {notifications.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500">No pending notifications</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>All Service Requests</CardTitle>
                <CardDescription>
                  Complete history of service requests across all reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceRequests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{request.serviceType}</h4>
                            <Badge variant={
                              request.status === "accepted" ? "default" :
                              request.status === "pending" ? "secondary" : "destructive"
                            }>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {request.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{request.guestName}</span>
                            <span>•</span>
                            <span>{request.propertyName}</span>
                            <span>•</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                          <Badge variant={request.billingType === "guest_billable" ? "destructive" : "outline"}>
                            {request.billingType}
                          </Badge>
                          {request.estimatedCost && (
                            <span className="text-sm font-semibold">
                              ฿{request.estimatedCost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {serviceRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No service requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Chat Monitor</CardTitle>
                <CardDescription>
                  Monitor guest conversations and AI-generated requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg border ${
                          message.senderType === "guest" ? "bg-blue-50 dark:bg-blue-950" : "bg-gray-50 dark:bg-gray-950"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {message.senderType === "guest" ? (
                                <User className="h-4 w-4" />
                              ) : message.isSystemGenerated ? (
                                <Bot className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                              <span className="font-semibold text-sm">
                                {message.senderType === "guest" ? "Guest" : 
                                 message.isSystemGenerated ? "AI Assistant" : "Staff"}
                              </span>
                            </div>
                            <p className="text-sm">{message.messageText}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Request Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Service Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{selectedRequest.serviceType}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedRequest.description}
                    </p>
                  </div>
                  
                  <Textarea 
                    placeholder="Add notes or modifications..."
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleRequestAction("accept")}
                      disabled={handleRequestActionMutation.isPending}
                      className="flex-1"
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleRequestAction("decline")}
                      disabled={handleRequestActionMutation.isPending}
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}