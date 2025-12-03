import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Send, 
  Calendar, 
  MapPin, 
  Car, 
  Waves, 
  Utensils, 
  Sparkles, 
  Clock, 
  DollarSign,
  Star,
  Phone,
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Search,
  Heart,
  Award,
  Shield,
  Zap,
  Bell,
  Eye
} from "lucide-react";
import { format } from "date-fns";

// Types
interface GuestMessage {
  id: number;
  organizationId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  bookingId: number | null;
  propertyId: number | null;
  messageContent: string;
  messageType: 'chat' | 'request' | 'feedback' | 'complaint';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  aiProcessed: boolean;
  aiKeywords: string[] | null;
  aiSentiment: 'positive' | 'neutral' | 'negative' | null;
  aiConfidence: number | null;
  aiSuggestions: string[] | null;
  staffResponse: string | null;
  respondedBy: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GuestServiceRequest {
  id: number;
  organizationId: string;
  guestId: string;
  guestName: string;
  bookingId: number | null;
  propertyId: number;
  serviceType: string;
  serviceName: string;
  requestedDate: Date | null;
  requestedTime: string | null;
  numberOfGuests: number;
  specialRequests: string | null;
  estimatedCost: number | null;
  currency: string;
  paymentMethod: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  confirmedBy: string | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
  guestRating: number | null;
  guestFeedback: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Booking {
  id: number;
  guestName: string;
  propertyId: number;
  propertyName: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
}

// Available Services Configuration
const availableServices = [
  {
    category: "Cleaning",
    icon: Sparkles,
    color: "bg-blue-100 text-blue-700",
    services: [
      { name: "Additional Housekeeping", price: 80, duration: "2 hours", description: "Extra cleaning service" },
      { name: "Deep Clean", price: 150, duration: "4 hours", description: "Comprehensive deep cleaning" },
      { name: "Laundry Service", price: 25, duration: "Same day", description: "Wash, dry, and fold" }
    ]
  },
  {
    category: "Wellness",
    icon: Heart,
    color: "bg-pink-100 text-pink-700",
    services: [
      { name: "In-Villa Massage", price: 120, duration: "60 min", description: "Relaxing massage therapy" },
      { name: "Couples Massage", price: 220, duration: "90 min", description: "Massage for two" },
      { name: "Yoga Session", price: 80, duration: "60 min", description: "Private yoga instruction" }
    ]
  },
  {
    category: "Transport",
    icon: Car,
    color: "bg-green-100 text-green-700",
    services: [
      { name: "Airport Transfer", price: 45, duration: "45 min", description: "One-way airport pickup/dropoff" },
      { name: "Local Taxi", price: 25, duration: "Per trip", description: "Local area transportation" },
      { name: "Day Tour", price: 200, duration: "8 hours", description: "Full day guided tour" }
    ]
  },
  {
    category: "Dining",
    icon: Utensils,
    color: "bg-orange-100 text-orange-700",
    services: [
      { name: "Private Chef", price: 180, duration: "3 hours", description: "Personal chef service" },
      { name: "Grocery Delivery", price: 15, duration: "1 hour", description: "Fresh groceries delivered" },
      { name: "Restaurant Booking", price: 0, duration: "Instant", description: "Dinner reservations" }
    ]
  }
];

// Sample recommendations
const beachRecommendations = [
  { name: "Patong Beach", distance: "5 km", rating: 4.5, highlights: ["Shopping", "Nightlife", "Water sports"] },
  { name: "Kata Beach", distance: "12 km", rating: 4.7, highlights: ["Family-friendly", "Clear water", "Surfing"] },
  { name: "Freedom Beach", distance: "8 km", rating: 4.8, highlights: ["Secluded", "Crystal clear", "Snorkeling"] }
];

const tourRecommendations = [
  { name: "Phi Phi Islands", price: 85, duration: "Full day", rating: 4.6, highlights: ["Boat tour", "Snorkeling", "Lunch included"] },
  { name: "Big Buddha & Wat Chalong", price: 45, duration: "Half day", rating: 4.4, highlights: ["Cultural", "Temple visit", "City views"] },
  { name: "Phang Nga Bay", price: 95, duration: "Full day", rating: 4.7, highlights: ["James Bond Island", "Kayaking", "Limestone caves"] }
];

export default function GuestPortalMessaging() {
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<'chat' | 'request' | 'feedback' | 'complaint'>('chat');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceRequestData, setServiceRequestData] = useState({
    requestedDate: "",
    requestedTime: "",
    numberOfGuests: 1,
    specialRequests: ""
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock guest data (in real app, this would come from authentication)
  const guestData = {
    id: "guest-123",
    name: "John Smith",
    email: "john.smith@email.com"
  };

  // Queries
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/guest-bookings", guestData.id],
    enabled: !!guestData.id,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/guest-messages", guestData.id],
    enabled: !!guestData.id,
  });

  const { data: serviceRequests = [], isLoading: serviceRequestsLoading } = useQuery({
    queryKey: ["/api/guest-service-requests", guestData.id],
    enabled: !!guestData.id,
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/guest-messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-messages"] });
      setMessageText("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent to our team.",
      });
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createServiceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/guest-service-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-service-requests"] });
      setSelectedService(null);
      setServiceRequestData({
        requestedDate: "",
        requestedTime: "",
        numberOfGuests: 1,
        specialRequests: ""
      });
      toast({
        title: "Service Requested",
        description: "Your service request has been submitted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create service request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const messageData = {
      guestId: guestData.id,
      guestName: guestData.name,
      guestEmail: guestData.email,
      bookingId: selectedBooking,
      propertyId: selectedBooking ? bookings.find(b => b.id === selectedBooking)?.propertyId : null,
      messageContent: messageText,
      messageType,
      priority: messageType === 'complaint' ? 'high' : 'normal',
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleServiceRequest = () => {
    if (!selectedService) return;

    const requestData = {
      guestId: guestData.id,
      guestName: guestData.name,
      bookingId: selectedBooking,
      propertyId: selectedBooking ? bookings.find(b => b.id === selectedBooking)?.propertyId : 1,
      serviceType: selectedService.category.toLowerCase(),
      serviceName: selectedService.name,
      requestedDate: serviceRequestData.requestedDate ? new Date(serviceRequestData.requestedDate) : null,
      requestedTime: serviceRequestData.requestedTime,
      numberOfGuests: serviceRequestData.numberOfGuests,
      specialRequests: serviceRequestData.specialRequests,
      estimatedCost: selectedService.price,
      currency: "AUD",
      paymentMethod: "guest_charge",
    };

    createServiceRequestMutation.mutate(requestData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'normal':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredMessages = messages.filter((message: GuestMessage) => {
    if (filterStatus !== "all" && message.status !== filterStatus) return false;
    if (searchTerm && !message.messageContent.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {guestData.name}! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your personal guest portal for bookings, services, and support
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="services">Book Services</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 2).map((booking: Booking) => (
                        <div key={booking.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{booking.propertyName}</h4>
                          <p className="text-sm text-gray-600">
                            {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No upcoming bookings</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Book Cleaning
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Car className="w-4 h-4 mr-2" />
                    Request Transport
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Book Massage
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.slice(0, 3).map((message: GuestMessage) => (
                        <div key={message.id} className="p-3 border rounded-lg">
                          <p className="text-sm line-clamp-2">{message.messageContent}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge className={getStatusColor(message.status)}>
                              {message.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent messages</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Chat Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Guest Support Chat
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        AI Assistant Available
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Send us a message and we'll respond quickly. Our AI assistant can help with common questions instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Messages Display */}
                  <ScrollArea className="h-96 mb-4 p-4 border rounded-lg">
                    <div className="space-y-4">
                      {filteredMessages.map((message: GuestMessage) => (
                        <div key={message.id} className="space-y-2">
                          {/* Guest Message */}
                          <div className="flex justify-end">
                            <div className="max-w-xs lg:max-w-md">
                              <div className="bg-blue-500 text-white rounded-lg px-4 py-2">
                                <p className="text-sm">{message.messageContent}</p>
                              </div>
                              <div className="flex items-center justify-end gap-2 mt-1">
                                <Badge className={getPriorityColor(message.priority)} variant="outline">
                                  {message.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(message.createdAt), 'HH:mm')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* AI/Staff Response */}
                          {message.staffResponse && (
                            <div className="flex justify-start">
                              <div className="max-w-xs lg:max-w-md">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    {message.respondedBy?.includes('ai') ? (
                                      <Bot className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <User className="w-4 h-4 text-green-500" />
                                    )}
                                    <span className="text-xs font-medium">
                                      {message.respondedBy?.includes('ai') ? 'AI Assistant' : 'Support Team'}
                                    </span>
                                  </div>
                                  <p className="text-sm">{message.staffResponse}</p>
                                </div>
                                <span className="text-xs text-gray-500 ml-2">
                                  {message.respondedAt && format(new Date(message.respondedAt), 'HH:mm')}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* AI Suggestions */}
                          {message.aiSuggestions && message.aiSuggestions.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 ml-8">
                              <div className="flex items-center gap-2 mb-2">
                                <Bot className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  AI Suggestions
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {message.aiSuggestions.map((suggestion, idx) => (
                                  <li key={idx} className="text-sm text-blue-600 dark:text-blue-400">
                                    • {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chat">Chat</SelectItem>
                          <SelectItem value="request">Request</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {bookings.length > 0 && (
                        <Select value={selectedBooking?.toString() || ""} onValueChange={(value) => setSelectedBooking(value ? parseInt(value) : null)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select booking" />
                          </SelectTrigger>
                          <SelectContent>
                            {bookings.map((booking: Booking) => (
                              <SelectItem key={booking.id} value={booking.id.toString()}>
                                {booking.propertyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message here..."
                        className="resize-none"
                        rows={3}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Filters & Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Message Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Response Times</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Chat messages:</span>
                        <Badge variant="outline">~2 min</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Service requests:</span>
                        <Badge variant="outline">~15 min</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Urgent issues:</span>
                        <Badge variant="outline">Immediate</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">AI Assistant</h4>
                    <p className="text-sm text-gray-600">
                      Our AI assistant can instantly help with:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Check-in/out procedures</li>
                      <li>• Property amenities</li>
                      <li>• Local recommendations</li>
                      <li>• Service booking</li>
                      <li>• Common questions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {availableServices.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className="w-5 h-5" />
                      </div>
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.services.map((service) => (
                      <Dialog key={service.name}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between h-auto p-3"
                            onClick={() => setSelectedService(service)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-gray-500">{service.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${service.price}</div>
                              <div className="text-sm text-gray-500">{service.duration}</div>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Book {service.name}</DialogTitle>
                            <DialogDescription>
                              {service.description} - ${service.price} AUD ({service.duration})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Preferred Date</label>
                                <Input
                                  type="date"
                                  value={serviceRequestData.requestedDate}
                                  onChange={(e) => setServiceRequestData({
                                    ...serviceRequestData,
                                    requestedDate: e.target.value
                                  })}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Preferred Time</label>
                                <Input
                                  type="time"
                                  value={serviceRequestData.requestedTime}
                                  onChange={(e) => setServiceRequestData({
                                    ...serviceRequestData,
                                    requestedTime: e.target.value
                                  })}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Number of Guests</label>
                              <Input
                                type="number"
                                min="1"
                                value={serviceRequestData.numberOfGuests}
                                onChange={(e) => setServiceRequestData({
                                  ...serviceRequestData,
                                  numberOfGuests: parseInt(e.target.value) || 1
                                })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Special Requests</label>
                              <Textarea
                                value={serviceRequestData.specialRequests}
                                onChange={(e) => setServiceRequestData({
                                  ...serviceRequestData,
                                  specialRequests: e.target.value
                                })}
                                placeholder="Any special requirements..."
                                rows={3}
                              />
                            </div>
                            <Button 
                              onClick={handleServiceRequest}
                              disabled={createServiceRequestMutation.isPending}
                              className="w-full"
                            >
                              Book Service - ${service.price} AUD
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Beach Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="w-5 h-5" />
                    Recommended Beaches
                  </CardTitle>
                  <CardDescription>
                    Best beaches near your property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {beachRecommendations.map((beach, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{beach.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{beach.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{beach.distance}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {beach.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tour Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Recommended Tours
                  </CardTitle>
                  <CardDescription>
                    Popular tours and activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tourRecommendations.map((tour, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{tour.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{tour.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">${tour.price}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tour.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  My Service Requests
                </CardTitle>
                <CardDescription>
                  Track your service requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {serviceRequestsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : serviceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {serviceRequests.map((request: GuestServiceRequest) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{request.serviceName}</h4>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Requested Date:</span>{' '}
                            {request.requestedDate 
                              ? format(new Date(request.requestedDate), 'MMM dd, yyyy')
                              : 'Flexible'
                            }
                          </div>
                          <div>
                            <span className="font-medium">Time:</span>{' '}
                            {request.requestedTime || 'Flexible'}
                          </div>
                          <div>
                            <span className="font-medium">Guests:</span>{' '}
                            {request.numberOfGuests}
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span>{' '}
                            ${request.estimatedCost} {request.currency}
                          </div>
                        </div>
                        {request.specialRequests && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Special Requests:</span>
                            <p className="text-sm text-gray-600 mt-1">{request.specialRequests}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            Requested {format(new Date(request.createdAt), 'MMM dd, HH:mm')}
                          </span>
                          {request.status === 'completed' && request.guestRating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{request.guestRating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No service requests yet</p>
                    <p className="text-sm text-gray-400">Book a service to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}