import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AdminFilters>({});
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Enhanced demo data for better dashboard experience
  const enhancedProperties = [
    { id: 1, name: "Villa Samui Breeze", owner: "John Smith", portfolioManager: "Alex Thompson", area: "Chaweng", bedrooms: 3, status: "active", revenue: 125000 },
    { id: 2, name: "Villa Tropical Paradise", owner: "Sarah Johnson", portfolioManager: "Jessica Wilson", area: "Lamai", bedrooms: 4, status: "active", revenue: 145000 },
    { id: 3, name: "Villa Balinese Charm", owner: "Michael Brown", portfolioManager: "Alex Thompson", area: "Bophut", bedrooms: 2, status: "maintenance", revenue: 105000 },
    ...properties
  ];

  const enhancedTasks = [
    { id: 1, title: "Pool Cleaning", property: "Villa Samui Breeze", assignedTo: "Pool Team", priority: "high", status: "pending", dueDate: "2025-01-06" },
    { id: 2, title: "AC Maintenance", property: "Villa Tropical Paradise", assignedTo: "Maintenance Team", priority: "medium", status: "in-progress", dueDate: "2025-01-07" },
    { id: 3, title: "Garden Service", property: "Villa Balinese Charm", assignedTo: "Garden Team", priority: "low", status: "completed", dueDate: "2025-01-05" },
    ...tasks
  ];

  const enhancedBookings = [
    { id: 1, guestName: "Robert Wilson", property: "Villa Samui Breeze", checkIn: "2025-01-10", checkOut: "2025-01-17", status: "confirmed", totalAmount: 35000 },
    { id: 2, guestName: "Lisa Chen", property: "Villa Tropical Paradise", checkIn: "2025-01-12", checkOut: "2025-01-19", status: "pending", totalAmount: 43500 },
    { id: 3, guestName: "James Miller", property: "Villa Ocean View", checkIn: "2025-01-15", checkOut: "2025-01-22", status: "confirmed", totalAmount: 52500 },
    ...bookings
  ];

  const recentBookings = enhancedBookings.slice(0, 3);
  const recentTasks = enhancedTasks.slice(0, 3);

  // Filter data based on active filters
  const filteredProperties = enhancedProperties.filter(property => {
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
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar 
          title="Enhanced Admin Dashboard" 
          subtitle="Comprehensive property management overview with advanced filtering"
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              title="High Priority Tasks"
              value={enhancedTasks.filter(t => t.priority === 'high').length}
              icon={AlertTriangle}
              color="warning"
            />
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(filteredProperties.reduce((sum, p) => sum + p.revenue, 0))}
              icon={DollarSign}
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
                    {recentBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Home className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{booking.guestName}</p>
                            <p className="text-sm text-gray-500">Property ID: {booking.propertyId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">{formatCurrency(booking.totalAmount)}</p>
                        </div>
                      </div>
                    ))}
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
                  <Card key={property.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{property.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {property.area} • {property.bedrooms} bedrooms • {property.owner}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            Revenue: {formatCurrency(property.revenue)}
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
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="grid gap-4">
                {enhancedTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(task.priority)}
                          <div>
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {task.property} • {task.assignedTo}
                            </p>
                            <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <div className="grid gap-4">
                {enhancedBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{booking.guestName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.property}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.checkIn} → {booking.checkOut}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(booking.totalAmount)}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
        open={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
      />
    </div>
  );
}
