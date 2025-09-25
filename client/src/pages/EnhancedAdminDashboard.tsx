import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, ListTodo, DollarSign, User, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Settings, Plus, Trash2, Wrench } from "lucide-react";

interface FilteredData {
  properties: any[];
  tasks: any[];
  bookings: any[];
  finances: any[];
  utilities: any[];
  maintenance: any[];
}

export default function EnhancedAdminDashboard() {
  const [location, setLocation] = useLocation();
  const [activeFilters, setActiveFilters] = useState<any>({});
  
  // Fetch real data from API
  const { data: properties = [] } = useQuery({ queryKey: ["/api/properties"] });
  const { data: tasks = [] } = useQuery({ queryKey: ["/api/tasks"] });
  const { data: bookings = [] } = useQuery({ queryKey: ["/api/bookings"] });
  const { data: finances = [] } = useQuery({ queryKey: ["/api/finance"] });
  
  const [filteredData, setFilteredData] = useState<FilteredData>({
    properties: [],
    tasks: [],
    bookings: [],
    finances: [],
    utilities: [],
    maintenance: []
  });

  // Filter data based on active filters - Fixed infinite loop
  useEffect(() => {
    const applyFilters = (data: any[], type: string) => {
      return data.filter(item => {
        // Property filter
        if (activeFilters.propertyId && item.propertyId !== activeFilters.propertyId) {
          return false;
        }
        
        // Search text filter
        if (activeFilters.searchText) {
          const searchLower = activeFilters.searchText.toLowerCase();
          const searchableText = Object.values(item).join(' ').toLowerCase();
          if (!searchableText.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      });
    };

    // Use data directly to avoid infinite loop
    const safeProperties = Array.isArray(properties) ? properties : [];
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const safeFinances = Array.isArray(finances) ? finances : [];

    setFilteredData({
      properties: applyFilters(safeProperties, 'properties'),
      tasks: applyFilters(safeTasks, 'tasks'),
      bookings: applyFilters(safeBookings, 'bookings'),
      finances: applyFilters(safeFinances, 'finances'),
      utilities: [], // Will be added when utility API is ready
      maintenance: [] // Will be added when maintenance API is ready
    });
  }, [activeFilters, JSON.stringify(properties), JSON.stringify(tasks), JSON.stringify(bookings), JSON.stringify(finances)]);

  const getPropertyName = (id: number) => {
    const propertyNames = { 1: "Villa Samui Breeze", 2: "Villa Tropical Paradise", 3: "Villa Balinese Charm", 4: "Villa Ocean View", 5: "Villa Sunset Dreams" };
    return propertyNames[id as keyof typeof propertyNames];
  };

  const getOwnerName = (id: string) => {
    const ownerNames = { "owner1": "John Smith", "owner2": "Sarah Johnson", "owner3": "Michael Brown", "owner4": "Emma Davis" };
    return ownerNames[id as keyof typeof ownerNames];
  };

  const getPMName = (id: string) => {
    const pmNames = { "pm1": "Alex Thompson", "pm2": "Jessica Wilson", "pm3": "David Miller" };
    return pmNames[id as keyof typeof pmNames];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': case 'confirmed': case 'paid': case 'completed': return 'default';
      case 'pending': case 'scheduled': return 'secondary';
      case 'overdue': case 'high': return 'destructive';
      case 'maintenance': case 'in_progress': case 'medium': return 'outline';
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive property management overview with advanced filtering</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Administrator
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              setLocation("/settings");
            }}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters - Simplified */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setActiveFilters({...activeFilters, searchText: e.target.value})}
            />
          </div>
        </div>
        <Button variant="outline" size="sm">
          Clear Filters
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold">{filteredData.properties.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold">{filteredData.tasks.filter(t => t.status !== 'completed').length}</p>
              </div>
              <ListTodo className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-2xl font-bold">{filteredData.bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (THB)</p>
                <p className="text-2xl font-bold">{filteredData.finances.filter(f => f.type === 'revenue').reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Properties ({filteredData.properties.length})
                </CardTitle>
                <Button onClick={() => setCreatePropertyOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Property
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredData.properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{property.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{property.address}</span>
                        <span>{property.bedrooms} bedrooms</span>
                        <span>{property.maxGuests} max guests</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {property.pricePerNight ? `₹${property.pricePerNight}/night` : 'No rate set'}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredData.properties.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No properties match your current filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Tasks ({filteredData.tasks.length})
                </CardTitle>
                <Button onClick={() => setCreateTaskOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredData.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <h3 className="font-semibold">{task.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{task.description}</span>
                        <span>Assigned: {task.assignedTo}</span>
                        <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {filteredData.tasks.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No tasks match your current filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Bookings ({filteredData.bookings.length})
                </CardTitle>
                <Button onClick={() => setCreateBookingOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Booking
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredData.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{booking.guestName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{booking.property}</span>
                        <span>{booking.checkIn} - {booking.checkOut}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{(booking.amount || 0).toLocaleString()}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredData.bookings.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No bookings match your current filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Transactions ({filteredData.finances.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredData.finances.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{transaction.property}</span>
                        <span>{transaction.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'revenue' ? 'text-green-600' : transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}₹{(transaction.amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={transaction.type === 'revenue' ? 'default' : transaction.type === 'expense' ? 'destructive' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredData.finances.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No financial transactions match your current filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Utility Bills ({filteredData.utilities.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredData.utilities.map((utility) => (
                  <div key={utility.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold capitalize">{utility.type}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{utility.property}</span>
                        <span>Due: {utility.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">₹{(utility.amount || 0).toLocaleString()}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(utility.status)}>
                        {utility.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredData.utilities.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No utility bills match your current filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Issues ({filteredData.maintenance.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredData.maintenance.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(maintenance.priority)}
                        <h3 className="font-semibold">{maintenance.issue}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{maintenance.property}</span>
                        <span>Cost: ₹{(maintenance.cost || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(maintenance.status)}>
                      {maintenance.status}
                    </Badge>
                  </div>
                ))}
                {filteredData.maintenance.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No maintenance issues match your current filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}