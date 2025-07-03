import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Calendar as CalendarIcon, 
  MapPin, 
  Home,
  AlertTriangle,
  Plus,
  Star,
  Send,
  Bot,
  Settings,
  CheckCircle,
  Clock,
  User,
  Building,
  Camera,
  Phone,
  Mail,
  Shield,
  Zap,
  Activity,
  Bell,
  Map,
  Car,
  Coffee,
  Utensils,
  Waves,
  TreePine,
  Sparkles,
  Gift
} from "lucide-react";

// Guest Portal Communication Center - Main Component
export default function GuestCommunicationCenter() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch guest data - assume guest ID from demo auth
  const { data: guestBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/guest/bookings"],
    staleTime: 30000,
  });

  const { data: guestMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/guest/messages"],
    staleTime: 30000,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/guest/addon-services"],
    staleTime: 30000,
  });

  const { data: attractions = [], isLoading: attractionsLoading } = useQuery({
    queryKey: ["/api/guest/attractions"],
    staleTime: 30000,
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/guest/notifications"],
    staleTime: 30000,
  });

  // Get current booking (active one)
  const currentBooking = Array.isArray(guestBookings) ? 
    guestBookings.find((booking: any) => booking.status === 'active') : null;

  // Send issue report mutation
  const reportIssueMutation = useMutation({
    mutationFn: async (issueData: any) => {
      return apiRequest("POST", "/api/guest/report-issue", issueData);
    },
    onSuccess: () => {
      toast({
        title: "Issue Reported",
        description: "Your issue has been reported to the management team.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest/notifications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to report issue. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send service request mutation
  const serviceRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return apiRequest("POST", "/api/guest/service-request", requestData);
    },
    onSuccess: () => {
      toast({
        title: "Service Requested",
        description: "Your service request has been submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest/notifications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: "Failed to submit service request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Book addon service mutation
  const bookServiceMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("POST", "/api/guest/book-addon", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Service Booked",
        description: "Your addon service has been booked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest/notifications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to book service. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/guest/send-message", messageData);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the property manager.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest/messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (bookingsLoading || messagesLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Guest Communication Center</h1>
        <p className="text-muted-foreground">
          Your central hub for communication, services, and property information
        </p>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            My Stays
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Explore
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Welcome Card */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Welcome Back!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentBooking ? (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <h3 className="font-semibold">Current Stay</h3>
                      <p className="text-sm text-muted-foreground">
                        Property #{currentBooking.propertyId}
                      </p>
                      <div className="flex gap-4 text-sm mt-2">
                        <span>Check-in: {format(new Date(currentBooking.checkIn), "PPP")}</span>
                        <span>Check-out: {format(new Date(currentBooking.checkOut), "PPP")}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No active bookings</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ReportIssueForm 
                  onSubmit={(data) => reportIssueMutation.mutate(data)} 
                />
                <ServiceRequestForm 
                  onSubmit={(data) => serviceRequestMutation.mutate(data)}
                />
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(notifications) && notifications.length > 0 ? (
                    (notifications as any[]).slice(0, 3).map((notification: any) => (
                      <div key={notification.id} className="p-2 border rounded text-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{notification.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">
                          {notification.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>+66 2 123 4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>support@hostpilotpro.com</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Emergency Assistance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <MessagesSection 
            messages={guestMessages}
            onSendMessage={(data) => sendMessageMutation.mutate(data)}
            isLoading={messagesLoading}
          />
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <ServicesSection 
            services={services}
            onBookService={(data) => bookServiceMutation.mutate(data)}
            isLoading={servicesLoading}
          />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <CalendarSection 
            bookings={guestBookings}
            currentBooking={currentBooking}
            isLoading={bookingsLoading}
          />
        </TabsContent>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-6">
          <ExploreSection 
            attractions={attractions}
            isLoading={attractionsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== COMPONENT FORMS =====

function ReportIssueForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    urgency: "medium",
    propertyId: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ category: "", description: "", urgency: "medium", propertyId: 1 });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Issue Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="amenities">Amenities</SelectItem>
                <SelectItem value="ac">Air Conditioning</SelectItem>
                <SelectItem value="wifi">WiFi/Internet</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe the issue in detail..."
              required
            />
          </div>
          <div>
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait</SelectItem>
                <SelectItem value="medium">Medium - Within 24 hours</SelectItem>
                <SelectItem value="high">High - Same day</SelectItem>
                <SelectItem value="urgent">Urgent - Immediate attention</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ServiceRequestForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    serviceType: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    propertyId: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ serviceType: "", description: "", preferredDate: "", preferredTime: "", propertyId: 1 });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Star className="h-4 w-4 mr-2" />
          Request Service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Additional Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleaning">Extra Cleaning</SelectItem>
                <SelectItem value="laundry">Laundry Service</SelectItem>
                <SelectItem value="grocery">Grocery Shopping</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="massage">In-Villa Massage</SelectItem>
                <SelectItem value="chef">Private Chef</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide specific details about your service request..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Input
                id="preferredTime"
                type="time"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddonBookingForm({ services, onSubmit }: { services: any[], onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    serviceId: "",
    scheduledDate: "",
    scheduledTime: "",
    guestCount: 1,
    specialRequests: "",
    propertyId: 1
  });

  const selectedService = services.find(s => s.id === parseInt(formData.serviceId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ serviceId: "", scheduledDate: "", scheduledTime: "", guestCount: 1, specialRequests: "", propertyId: 1 });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Book New Service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Addon Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceId">Service</Label>
            <Select value={formData.serviceId} onValueChange={(value) => setFormData({ ...formData, serviceId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service: any) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.serviceName} - ฿{service.basePrice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedService && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p><strong>Description:</strong> {selectedService.description}</p>
              <p><strong>Duration:</strong> {selectedService.duration} minutes</p>
              <p><strong>Price:</strong> ฿{selectedService.basePrice}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="scheduledTime">Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="guestCount">Number of Guests</Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              max="20"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Any special requests or preferences..."
            />
          </div>

          <Button type="submit" className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===== SECTION COMPONENTS =====

function MessagesSection({ messages, onSendMessage, isLoading }: { 
  messages: unknown, 
  onSendMessage: (data: any) => void, 
  isLoading: boolean 
}) {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage({
        message: newMessage,
        propertyId: 1
      });
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Property Manager Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Array.isArray(messages) && messages.length > 0 ? (
              (messages as any[]).map((message: any) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {message.senderType === 'guest' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Building className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {message.senderType === 'guest' ? 'You' : 'Property Manager'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), "PPp")}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                  {message.aiSuggestion && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-700">AI Assistant</span>
                      </div>
                      <p className="text-blue-700">{message.aiSuggestion}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No messages yet. Start a conversation with your property manager!
              </p>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ServicesSection({ services, onBookService, isLoading }: { 
  services: unknown, 
  onBookService: (data: any) => void, 
  isLoading: boolean 
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Addon Services</h2>
        <AddonBookingForm 
          services={Array.isArray(services) ? services : []}
          onSubmit={onBookService}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(services) && services.length > 0 ? (
          (services as any[]).map((service: any) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {service.category === 'wellness' && <Sparkles className="h-5 w-5" />}
                  {service.category === 'transport' && <Car className="h-5 w-5" />}
                  {service.category === 'food' && <Utensils className="h-5 w-5" />}
                  {service.category === 'cleaning' && <Star className="h-5 w-5" />}
                  <span className="text-base">{service.serviceName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {service.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price:</span>
                    <span className="font-medium">฿{service.basePrice}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {service.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No services available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarSection({ bookings, currentBooking, isLoading }: { 
  bookings: unknown, 
  currentBooking: any, 
  isLoading: boolean 
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Stays</h2>

      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(bookings) && bookings.length > 0 ? (
              (bookings as any[]).map((booking: any) => (
                <div key={booking.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{booking.propertyName || `Property #${booking.propertyId}`}</h5>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.checkIn), "PPP")} - {format(new Date(booking.checkOut), "PPP")}
                      </p>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {currentBooking && (
        <Card>
          <CardHeader>
            <CardTitle>Current Stay Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Check-in</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(currentBooking.checkIn), "PPPP")}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Check-out</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(currentBooking.checkOut), "PPPP")}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Property Details</h4>
              <p className="text-sm text-muted-foreground">
                Property #{currentBooking.propertyId} - {currentBooking.guestName}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExploreSection({ attractions, isLoading }: { attractions: any[], isLoading: boolean }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Explore the Area</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {attractions && attractions.length > 0 ? (
          attractions.map((attraction: any) => (
            <Card key={attraction.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {attraction.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {attraction.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Distance:</span>
                    <span>{attraction.distance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline">{attraction.type}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              Attraction information will be available soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function HelpSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Help & Support</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>Property Manager: +66 2 123 4567</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>Emergency Services: 191</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>support@hostpilotpro.com</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Camera className="h-4 w-4 mr-2" />
              Property Guide
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Car className="h-4 w-4 mr-2" />
              Transportation Info
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Coffee className="h-4 w-4 mr-2" />
              Local Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}