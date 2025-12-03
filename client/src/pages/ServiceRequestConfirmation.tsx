import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Star, 
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  MessageSquare,
  Settings,
  Filter,
  Search,
  RefreshCw,
  User,
  Mail,
  Phone
} from "lucide-react";

interface ServiceRequestNotification {
  id: number;
  serviceRequestId: number;
  reservationId: string;
  propertyId: number;
  propertyName: string;
  guestName: string;
  notificationType: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  actionRequired: boolean;
  actionUrl: string;
  actionLabel: string;
  serviceDetails: {
    serviceCategory: string;
    description: string;
    estimatedCost: number;
    currency: string;
    preferredDate: string;
    preferredTime: string;
    guestCount?: number;
    billingType?: string;
  };
  createdAt: string;
}

interface ServiceRequestDetails {
  id: number;
  reservationId: string;
  guestId: string;
  propertyId: number;
  requestType: string;
  serviceCategory: string;
  title: string;
  description: string;
  estimatedCost: number;
  billingType: string;
  currency: string;
  preferredDate: string;
  preferredTime: string;
  guestCount?: number;
  status: string;
  priority: string;
  awaitingConfirmation: boolean;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  createdAt: string;
  updatedAt: string;
}

const ServiceRequestConfirmation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Component state
  const [selectedNotification, setSelectedNotification] = useState<ServiceRequestNotification | null>(null);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<ServiceRequestDetails | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Confirmation form state
  const [confirmationForm, setConfirmationForm] = useState({
    finalCost: "",
    billingType: "guest_billable",
    assignedDepartment: "",
    assignedTo: "",
    scheduledDate: "",
    scheduledTime: "",
    adminNotes: "",
    specialInstructions: "",
    autoCreateTask: true
  });

  // Decline form state
  const [declineForm, setDeclineForm] = useState({
    declineReason: "",
    alternativeSuggestions: ""
  });

  // API Queries
  const { data: notifications = [], isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery({
    queryKey: ["/api/service-requests/notifications/pending"],
    enabled: !!user && ['admin', 'portfolio-manager', 'staff'].includes(user.role),
  });

  const { data: serviceRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests"],
    enabled: !!user && ['admin', 'portfolio-manager', 'staff'].includes(user.role),
  });

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: async ({ serviceRequestId, confirmationData }: { serviceRequestId: number, confirmationData: any }) => {
      return await apiRequest("POST", `/api/service-requests/${serviceRequestId}/confirm`, confirmationData);
    },
    onSuccess: () => {
      toast({
        title: "Service Request Confirmed",
        description: "The service request has been confirmed and tasks created.",
      });
      setConfirmationDialogOpen(false);
      setSelectedNotification(null);
      setSelectedServiceRequest(null);
      refetchNotifications();
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Confirmation Failed",
        description: error.message || "Failed to confirm service request",
        variant: "destructive",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async ({ serviceRequestId, declineData }: { serviceRequestId: number, declineData: any }) => {
      return await apiRequest("POST", `/api/service-requests/${serviceRequestId}/decline`, declineData);
    },
    onSuccess: () => {
      toast({
        title: "Service Request Declined",
        description: "The service request has been declined with reason provided.",
      });
      setDeclineDialogOpen(false);
      setSelectedNotification(null);
      setSelectedServiceRequest(null);
      refetchNotifications();
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Decline Failed",
        description: error.message || "Failed to decline service request",
        variant: "destructive",
      });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async ({ notificationId, notes }: { notificationId: number, notes?: string }) => {
      return await apiRequest("PATCH", `/api/service-requests/notifications/${notificationId}/acknowledge`, { notes });
    },
    onSuccess: () => {
      toast({
        title: "Notification Acknowledged",
        description: "Notification has been marked as acknowledged.",
      });
      refetchNotifications();
    },
    onError: (error) => {
      toast({
        title: "Acknowledge Failed",
        description: error.message || "Failed to acknowledge notification",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getBillingTypeLabel = (billingType: string) => {
    switch (billingType) {
      case 'guest_billable':
        return 'Guest Billable';
      case 'owner_billable':
        return 'Owner Billable';
      case 'company_expense':
        return 'Company Expense';
      case 'complimentary':
        return 'Complimentary';
      case 'split_billing':
        return 'Split Billing';
      default:
        return 'Unknown';
    }
  };

  const formatWithConversion = (amount: number, currency: string = 'THB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Event handlers
  const handleReviewServiceRequest = async (notification: ServiceRequestNotification) => {
    try {
      const response = await apiRequest("GET", `/api/service-requests/${notification.serviceRequestId}/details`);
      setSelectedServiceRequest(response);
      setSelectedNotification(notification);
      
      // Pre-populate confirmation form
      setConfirmationForm({
        finalCost: notification.serviceDetails.estimatedCost.toString(),
        billingType: notification.serviceDetails.billingType || "guest_billable",
        assignedDepartment: notification.serviceDetails.serviceCategory,
        assignedTo: "",
        scheduledDate: notification.serviceDetails.preferredDate,
        scheduledTime: notification.serviceDetails.preferredTime,
        adminNotes: "",
        specialInstructions: "",
        autoCreateTask: true
      });
      
      setConfirmationDialogOpen(true);
    } catch (error) {
      console.error("Error fetching service request details:", error);
      toast({
        title: "Error",
        description: "Failed to load service request details",
        variant: "destructive",
      });
    }
  };

  const handleConfirmService = () => {
    if (!selectedServiceRequest) return;

    confirmMutation.mutate({
      serviceRequestId: selectedServiceRequest.id,
      confirmationData: {
        finalCost: parseFloat(confirmationForm.finalCost) || 0,
        billingType: confirmationForm.billingType,
        assignedDepartment: confirmationForm.assignedDepartment,
        assignedTo: confirmationForm.assignedTo,
        scheduledDate: confirmationForm.scheduledDate,
        scheduledTime: confirmationForm.scheduledTime,
        adminNotes: confirmationForm.adminNotes,
        specialInstructions: confirmationForm.specialInstructions,
        autoCreateTask: confirmationForm.autoCreateTask,
      }
    });
  };

  const handleDeclineService = () => {
    if (!selectedServiceRequest) return;

    declineMutation.mutate({
      serviceRequestId: selectedServiceRequest.id,
      declineData: {
        declineReason: declineForm.declineReason,
        alternativeSuggestions: declineForm.alternativeSuggestions,
      }
    });
  };

  const handleAcknowledge = (notificationId: number) => {
    acknowledgeMutation.mutate({ notificationId });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification: ServiceRequestNotification) => {
    const matchesStatus = filterStatus === "all" || notification.status === filterStatus;
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (!user || !['admin', 'portfolio-manager', 'staff'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You need admin, portfolio manager, or staff access to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Request Confirmation</h1>
          <p className="text-muted-foreground">
            Review and confirm guest service requests with pricing and assignment
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchNotifications()}
            disabled={notificationsLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Pending Notifications</TabsTrigger>
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pending Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Guest name, property..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                      setFilterPriority("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="grid grid-cols-1 gap-4">
            {notificationsLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading notifications...
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Bell className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">All service requests are up to date.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification: ServiceRequestNotification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{notification.guestName}</span>
                          <MapPin className="h-4 w-4 ml-2" />
                          <span>{notification.propertyName}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {notification.status === "unread" && (
                          <Badge variant="outline">New</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    
                    {/* Service Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <p className="font-medium capitalize">{notification.serviceDetails.serviceCategory}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Estimated Cost</Label>
                        <p className="font-medium">
                          {formatWithConversion(notification.serviceDetails.estimatedCost, notification.serviceDetails.currency)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Preferred Date</Label>
                        <p className="font-medium">{notification.serviceDetails.preferredDate}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Preferred Time</Label>
                        <p className="font-medium">{notification.serviceDetails.preferredTime}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Created {formatDateTime(notification.createdAt)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        {notification.actionRequired && (
                          <Button
                            onClick={() => handleReviewServiceRequest(notification)}
                            disabled={confirmMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {notification.actionLabel}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setDeclineDialogOpen(true) || setSelectedNotification(notification)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                      {notification.status === "unread" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(notification.id)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* All Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Service Requests</CardTitle>
              <CardDescription>
                Complete list of service requests with status and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading requests...
                </div>
              ) : serviceRequests.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No service requests</h3>
                  <p className="mt-1 text-sm text-gray-500">No service requests have been submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.guestName} • {request.propertyName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant={request.awaitingConfirmation ? "destructive" : "default"}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          {formatWithConversion(request.estimatedCost, request.currency)} • 
                          {getBillingTypeLabel(request.billingType)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {notifications.filter((n: ServiceRequestNotification) => n.priority === 'high' || n.priority === 'urgent').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Urgent attention needed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatWithConversion(
                    notifications.reduce((sum: number, n: ServiceRequestNotification) => sum + n.serviceDetails.estimatedCost, 0),
                    'THB'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending services value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">~2h</div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Service Request</DialogTitle>
            <DialogDescription>
              Review and confirm the service request details, pricing, and assignment.
            </DialogDescription>
          </DialogHeader>

          {selectedServiceRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Request Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Guest</Label>
                    <p>{selectedServiceRequest.guestName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Property</Label>
                    <p>{selectedServiceRequest.propertyName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Service</Label>
                    <p>{selectedServiceRequest.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p className="capitalize">{selectedServiceRequest.serviceCategory}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedServiceRequest.description}</p>
                </div>
              </div>

              {/* Confirmation Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="finalCost">Final Cost ({selectedServiceRequest.currency})</Label>
                    <Input
                      id="finalCost"
                      type="number"
                      value={confirmationForm.finalCost}
                      onChange={(e) => setConfirmationForm({ ...confirmationForm, finalCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingType">Billing Type</Label>
                    <Select value={confirmationForm.billingType} onValueChange={(value) => setConfirmationForm({ ...confirmationForm, billingType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest_billable">Guest Billable</SelectItem>
                        <SelectItem value="owner_billable">Owner Billable</SelectItem>
                        <SelectItem value="company_expense">Company Expense</SelectItem>
                        <SelectItem value="complimentary">Complimentary</SelectItem>
                        <SelectItem value="split_billing">Split Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignedDepartment">Department</Label>
                    <Select value={confirmationForm.assignedDepartment} onValueChange={(value) => setConfirmationForm({ ...confirmationForm, assignedDepartment: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="housekeeping">Housekeeping</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="catering">Catering</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={confirmationForm.assignedTo}
                      onChange={(e) => setConfirmationForm({ ...confirmationForm, assignedTo: e.target.value })}
                      placeholder="Staff member name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={confirmationForm.scheduledDate}
                      onChange={(e) => setConfirmationForm({ ...confirmationForm, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={confirmationForm.scheduledTime}
                      onChange={(e) => setConfirmationForm({ ...confirmationForm, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={confirmationForm.specialInstructions}
                    onChange={(e) => setConfirmationForm({ ...confirmationForm, specialInstructions: e.target.value })}
                    placeholder="Any special instructions for service delivery..."
                  />
                </div>

                <div>
                  <Label htmlFor="adminNotes">Admin Notes (Internal)</Label>
                  <Textarea
                    id="adminNotes"
                    value={confirmationForm.adminNotes}
                    onChange={(e) => setConfirmationForm({ ...confirmationForm, adminNotes: e.target.value })}
                    placeholder="Internal notes for record keeping..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoCreateTask"
                    checked={confirmationForm.autoCreateTask}
                    onChange={(e) => setConfirmationForm({ ...confirmationForm, autoCreateTask: e.target.checked })}
                  />
                  <Label htmlFor="autoCreateTask">Automatically create task for service delivery</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmService} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Service Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this service request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="declineReason">Decline Reason</Label>
              <Textarea
                id="declineReason"
                value={declineForm.declineReason}
                onChange={(e) => setDeclineForm({ ...declineForm, declineReason: e.target.value })}
                placeholder="Explain why this service request cannot be fulfilled..."
                required
              />
            </div>

            <div>
              <Label htmlFor="alternativeSuggestions">Alternative Suggestions (Optional)</Label>
              <Textarea
                id="alternativeSuggestions"
                value={declineForm.alternativeSuggestions}
                onChange={(e) => setDeclineForm({ ...declineForm, alternativeSuggestions: e.target.value })}
                placeholder="Suggest alternative services or solutions..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineService}
              disabled={declineMutation.isPending || !declineForm.declineReason.trim()}
            >
              {declineMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequestConfirmation;