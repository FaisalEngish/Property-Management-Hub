import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import CreatePropertyDialog from "@/components/CreatePropertyDialog";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Calendar, ListTodo, DollarSign, Plus, Home, ClipboardList, TrendingUp, Users, AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react";

interface AdminFilters {
  propertyId?: number;
  ownerId?: string;
  portfolioManagerId?: string;
  area?: string;
  bedroomCount?: number;
  searchText?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AdminFilters>({});
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 30 * 1000, // 30 seconds - show fresh data quickly
    refetchOnMount: true, // Always refetch to show latest stats
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    staleTime: 30 * 1000, // 30 seconds - allow fresh data to show
    refetchOnMount: true, // Always refetch on mount to show latest properties
  });

  // Use optimized dashboard API endpoint for recent tasks only
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/dashboard/recent-tasks"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache for recent tasks
    refetchOnMount: false,
  });

  // Get task statistics without loading all tasks
  const { data: taskStats = {} } = useQuery({
    queryKey: ["/api/dashboard/task-stats"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache for task stats
    refetchOnMount: false,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    staleTime: 0, // No cache - always show fresh data
    refetchOnMount: true, // Always refetch on mount to show latest bookings
  });

  // Debug: Log bookings data changes
  console.log("📅 Dashboard - Bookings data:", bookings, "Count:", bookings.length);

  // Fetch expiring documents (within 30 days)
  const { data: expiringDocuments = [] } = useQuery({
    queryKey: ["/api/property-documents/expiring?days=30"],
    staleTime: 0, // Always refetch to ensure alerts are up-to-date
    refetchOnMount: true,
  });

  // Debug: Log expiring documents data
  console.log("📋 Dashboard - Expiring Documents:", expiringDocuments, "Count:", expiringDocuments.length);

  // Fetch expiring insurance (within 30 days)
  const { data: expiringInsurance = [] } = useQuery({
    queryKey: ["/api/property-insurance/expiring/30"],
    staleTime: 0, // Always refetch to ensure alerts are up-to-date
    refetchOnMount: true,
  });

  // Toast notifications for expired documents on Dashboard
  useEffect(() => {
    if (expiringDocuments && Array.isArray(expiringDocuments) && expiringDocuments.length > 0) {
      const now = new Date();
      const expiredDocs = expiringDocuments.filter((doc: any) => {
        if (!doc.expiryDate) return false;
        const expiryDate = new Date(doc.expiryDate);
        return expiryDate < now;
      });

      if (expiredDocs.length > 0) {
        // Show one toast with total count
        toast({
          title: "⚠️ Documents Expired",
          description: `${expiredDocs.length} property document${expiredDocs.length > 1 ? 's have' : ' has'} expired. Check the dashboard for details.`,
          variant: "destructive",
        });
      }
    }
  }, [expiringDocuments, toast]);

  // Use real bookings from API, sorted by creation date (most recent first)
  const recentBookings = bookings
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);
  const recentTasks = tasks.slice(0, 5); // Use actual tasks from API
  
  // Create property lookup map for bookings  
  const propertyMap = new Map();
  properties.forEach((property: any) => {
    propertyMap.set(property.id, property.name);
  });

  // Filter data based on active filters - use actual properties from API
  const filteredProperties = properties.filter((property: any) => {
    if (activeFilters.searchText && !property.name.toLowerCase().includes(activeFilters.searchText.toLowerCase())) return false;
    if (activeFilters.area && property.area !== activeFilters.area) return false;
    if (activeFilters.bedroomCount && property.bedrooms !== activeFilters.bedroomCount) return false;
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': case 'confirmed': case 'paid': case 'completed': return 'default';
      case 'pending': case 'scheduled': return 'secondary';
      case 'overdue': case 'high': return 'destructive';
      case 'maintenance': case 'in-progress': case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <TopBar 
          title="Enhanced Admin Dashboard" 
          subtitle="Comprehensive property management overview with advanced filtering"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Enhanced Global Filter Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search properties..."
                  value={activeFilters.searchText || ""}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, searchText: e.target.value }))}
                />
                <Select 
                  value={activeFilters.area || "all"} 
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, area: value === "all" ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="Chaweng">Chaweng</SelectItem>
                    <SelectItem value="Lamai">Lamai</SelectItem>
                    <SelectItem value="Bophut">Bophut</SelectItem>
                    <SelectItem value="Nathon">Nathon</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={activeFilters.bedroomCount?.toString() || "all"} 
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, bedroomCount: value === "all" ? undefined : parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bedrooms</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4 Bedrooms</SelectItem>
                    <SelectItem value="5">5+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveFilters({})}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Properties"
              value={filteredProperties.length}
              icon={Building}
              color="primary"
            />
            <StatsCard
              title="Active Properties"
              value={filteredProperties.filter(p => p.status === 'active').length}
              icon={Home}
              color="success"
            />
            <StatsCard
              title="Expired Documents"
              value={expiringDocuments.filter((doc: any) => {
                if (!doc.expiryDate) return false;
                return new Date(doc.expiryDate) < new Date();
              }).length}
              icon={AlertTriangle}
              color="warning"
            />
            <StatsCard
              title="High Priority Tasks"
              value={taskStats.highPriority || 0}
              icon={AlertTriangle}
              color="accent"
            />
          </div>

          {/* Enhanced Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking: any) => {
                      const propertyName = propertyMap.get(booking.propertyId) || booking.property || `Property #${booking.propertyId}`;
                      // Try multiple amount fields in order of preference
                      const amount = booking.totalAmount || booking.guestTotalPrice || booking.platformPayout || booking.netHostPayout || 0;
                      return (
                        <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Home className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.guestName}</p>
                              <p className="text-sm text-blue-600 font-medium">{propertyName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">{formatCurrency(amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks found</p>
                ) : (
                  <div className="space-y-4">
                    {recentTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'pending' ? 'bg-yellow-500' :
                            task.status === 'in-progress' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-500">{task.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expiry Alerts Section */}
          {(expiringDocuments.length > 0 || expiringInsurance.length > 0) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  Expiry Alerts ({expiringDocuments.length + expiringInsurance.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Expiring Documents */}
                  {expiringDocuments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-orange-900 mb-3">Property Documents Expiring</h3>
                      <div className="space-y-3">
                        {expiringDocuments.map((doc: any) => {
                          const propertyName = propertyMap.get(doc.propertyId) || `Property #${doc.propertyId}`;
                          const daysUntilExpiry = Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          const isExpired = daysUntilExpiry < 0;
                          
                          return (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isExpired ? 'bg-red-100' : 'bg-orange-100'}`}>
                                  <Building className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{doc.docType || 'Document'}</p>
                                  <p className="text-sm text-gray-600">{propertyName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={isExpired ? "destructive" : "outline"} className={isExpired ? '' : 'border-orange-300 text-orange-700'}>
                                  {isExpired ? 'Expired' : `${daysUntilExpiry} days left`}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(doc.expiryDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expiring Insurance */}
                  {expiringInsurance.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-orange-900 mb-3">Property Insurance Expiring</h3>
                      <div className="space-y-3">
                        {expiringInsurance.map((insurance: any) => {
                          const propertyName = propertyMap.get(insurance.propertyId) || `Property #${insurance.propertyId}`;
                          const daysUntilExpiry = Math.ceil((new Date(insurance.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          const isExpired = daysUntilExpiry < 0;
                          
                          return (
                            <div key={insurance.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isExpired ? 'bg-red-100' : 'bg-blue-100'}`}>
                                  <Building className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-blue-600'}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{insurance.insuranceType || 'Insurance'}</p>
                                  <p className="text-sm text-gray-600">{propertyName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={isExpired ? "destructive" : "outline"} className={isExpired ? '' : 'border-blue-300 text-blue-700'}>
                                  {isExpired ? 'Expired' : `${daysUntilExpiry} days left`}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(insurance.expiryDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setIsBookingDialogOpen(true)}
            >
              <Plus className="w-6 h-6 text-primary" />
              <span>New Booking</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setIsPropertyDialogOpen(true)}
            >
              <Home className="w-6 h-6 text-green-600" />
              <span>Add Property</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setIsTaskDialogOpen(true)}
            >
              <ClipboardList className="w-6 h-6 text-yellow-600" />
              <span>Create Task</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/finances'}
            >
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <span>View Reports</span>
            </Button>
          </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              <div className="grid gap-4">
                {filteredProperties.map((property) => (
                  <Card 
                    key={property.id} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => window.location.href = `/property-hub?property=${property.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{property.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {property.address || 'No address'} • {property.bedrooms || 0} bedrooms
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {property.pricePerNight ? `฿${property.pricePerNight}/night` : 'No price set'}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(property.status)}>
                          {property.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/property-hub'}
                  className="w-full"
                >
                  View All Properties in Property Management Hub
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="grid gap-4">
                {recentTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No tasks found
                    </CardContent>
                  </Card>
                ) : (
                  recentTasks.map((task: any) => {
                    const propertyName = propertyMap.get(task.propertyId) || task.property || `Property #${task.propertyId}`;
                    return (
                      <Card key={task.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getPriorityIcon(task.priority)}
                              <div>
                                <h3 className="font-semibold">{task.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {propertyName} • {task.type}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Due: {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'No date'}
                                </p>
                              </div>
                            </div>
                            <Badge variant={getStatusBadgeVariant(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <div className="grid gap-4">
                {bookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No bookings found
                    </CardContent>
                  </Card>
                ) : (
                  bookings.map((booking: any) => {
                    const propertyName = propertyMap.get(booking.propertyId) || booking.property || `Property #${booking.propertyId}`;
                    // Try multiple amount fields in order of preference
                    const amount = booking.totalAmount || booking.guestTotalPrice || booking.platformPayout || booking.netHostPayout || 0;
                    return (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{booking.guestName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {propertyName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                              </p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(amount)}
                              </p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Dialog Components */}
      <CreateBookingDialog 
        open={isBookingDialogOpen} 
        onOpenChange={setIsBookingDialogOpen} 
      />
      <CreatePropertyDialog 
        open={isPropertyDialogOpen} 
        onOpenChange={setIsPropertyDialogOpen} 
      />
      <CreateTaskDialog 
        isOpen={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
      />
    </div>
  );
}
