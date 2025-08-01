import { useState, useEffect } from "react";
import { useFastAuth } from "@/lib/fastAuth";
import AdminGlobalFilterBar, { AdminFilters } from "@/components/AdminGlobalFilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, ListTodo, DollarSign, User, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Wrench, Settings } from "lucide-react";
import { RoleBackButton } from "@/components/BackButton";
import RefreshDataButton from "@/components/RefreshDataButton";

interface FilteredData {
  properties: any[];
  tasks: any[];
  bookings: any[];
  finances: any[];
  utilities: any[];
  maintenance: any[];
}

export default function EnhancedAdminDashboard() {
  const { user } = useFastAuth();
  const [activeFilters, setActiveFilters] = useState<AdminFilters>({});
  
  const [filteredData, setFilteredData] = useState<FilteredData>({
    properties: [],
    tasks: [],
    bookings: [],
    finances: [],
    utilities: [],
    maintenance: []
  });

  // Mock data for demonstration
  const mockData = {
    properties: [
      { id: 1, name: "Villa Samui Breeze", owner: "John Smith", portfolioManager: "Alex Thompson", area: "Chaweng", bedrooms: 3, status: "active", revenue: 45000 },
      { id: 2, name: "Villa Tropical Paradise", owner: "Sarah Johnson", portfolioManager: "Jessica Wilson", area: "Lamai", bedrooms: 4, status: "active", revenue: 52000 },
      { id: 3, name: "Villa Balinese Charm", owner: "Michael Brown", portfolioManager: "Alex Thompson", area: "Bophut", bedrooms: 2, status: "maintenance", revenue: 38000 },
      { id: 4, name: "Villa Ocean View", owner: "Emma Davis", portfolioManager: "David Miller", area: "Chaweng", bedrooms: 5, status: "active", revenue: 68000 },
      { id: 5, name: "Villa Sunset Dreams", owner: "John Smith", portfolioManager: "Jessica Wilson", area: "Nathon", bedrooms: 3, status: "active", revenue: 41000 }
    ],
    tasks: [
      { id: 1, title: "Pool Cleaning", property: "Villa Samui Breeze", assignedTo: "Pool Team", priority: "high", status: "pending", dueDate: "2025-01-06" },
      { id: 2, title: "AC Maintenance", property: "Villa Tropical Paradise", assignedTo: "Maintenance Team", priority: "medium", status: "in_progress", dueDate: "2025-01-07" },
      { id: 3, title: "Garden Service", property: "Villa Balinese Charm", assignedTo: "Garden Team", priority: "low", status: "completed", dueDate: "2025-01-05" },
      { id: 4, title: "Deep Cleaning", property: "Villa Ocean View", assignedTo: "Housekeeping", priority: "high", status: "pending", dueDate: "2025-01-08" }
    ],
    bookings: [
      { id: 1, guestName: "Robert Wilson", property: "Villa Samui Breeze", checkIn: "2025-01-10", checkOut: "2025-01-17", status: "confirmed", amount: 12500 },
      { id: 2, guestName: "Lisa Chen", property: "Villa Tropical Paradise", checkIn: "2025-01-12", checkOut: "2025-01-19", status: "pending", amount: 15600 },
      { id: 3, guestName: "James Miller", property: "Villa Ocean View", checkIn: "2025-01-15", checkOut: "2025-01-22", status: "confirmed", amount: 18900 }
    ],
    finances: [
      { id: 1, type: "revenue", property: "Villa Samui Breeze", amount: 12500, date: "2025-01-05", description: "Booking Payment" },
      { id: 2, type: "expense", property: "Villa Tropical Paradise", amount: 850, date: "2025-01-04", description: "Maintenance Cost" },
      { id: 3, type: "commission", property: "Villa Ocean View", amount: 1890, date: "2025-01-03", description: "Agent Commission" }
    ],
    utilities: [
      { id: 1, property: "Villa Samui Breeze", type: "electricity", amount: 2340, status: "paid", dueDate: "2025-01-15" },
      { id: 2, property: "Villa Tropical Paradise", type: "water", amount: 890, status: "overdue", dueDate: "2025-01-02" },
      { id: 3, property: "Villa Balinese Charm", type: "internet", amount: 1200, status: "pending", dueDate: "2025-01-10" }
    ],
    maintenance: [
      { id: 1, property: "Villa Samui Breeze", issue: "Pool pump replacement", priority: "high", status: "scheduled", cost: 4500 },
      { id: 2, property: "Villa Ocean View", issue: "AC unit service", priority: "medium", status: "in_progress", cost: 2200 },
      { id: 3, property: "Villa Balinese Charm", issue: "Garden renovation", priority: "low", status: "completed", cost: 8900 }
    ]
  };

  // Filter data based on active filters
  useEffect(() => {
    const applyFilters = (data: any[], type: string) => {
      return data.filter(item => {
        // Property filter
        if (activeFilters.propertyId && item.property !== getPropertyName(activeFilters.propertyId)) {
          return false;
        }
        
        // Owner filter (for properties)
        if (activeFilters.ownerId && type === 'properties' && item.owner !== getOwnerName(activeFilters.ownerId)) {
          return false;
        }
        
        // Portfolio Manager filter (for properties)
        if (activeFilters.portfolioManagerId && type === 'properties' && item.portfolioManager !== getPMName(activeFilters.portfolioManagerId)) {
          return false;
        }
        
        // Area filter (for properties)
        if (activeFilters.area && type === 'properties' && item.area !== activeFilters.area) {
          return false;
        }
        
        // Bedroom count filter (for properties)
        if (activeFilters.bedroomCount && type === 'properties') {
          if (activeFilters.bedroomCount === 7 && item.bedrooms < 7) return false;
          if (activeFilters.bedroomCount < 7 && item.bedrooms !== activeFilters.bedroomCount) return false;
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

    setFilteredData({
      properties: applyFilters(mockData.properties, 'properties'),
      tasks: applyFilters(mockData.tasks, 'tasks'),
      bookings: applyFilters(mockData.bookings, 'bookings'),
      finances: applyFilters(mockData.finances, 'finances'),
      utilities: applyFilters(mockData.utilities, 'utilities'),
      maintenance: applyFilters(mockData.maintenance, 'maintenance')
    });
  }, [activeFilters]);

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
      <RoleBackButton />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive property management overview with global filtering</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {user?.role === 'admin' ? 'System Administrator' : 'Portfolio Manager'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              try {
                window.location.href = "/settings";
              } catch (error) {
                console.error("Settings navigation error:", error);
                window.location.href = "/simple-settings";
              }
            }}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Global Filter Bar and Cache Controls */}
      <div className="flex items-center justify-between gap-4">
        <AdminGlobalFilterBar 
          onFiltersChange={setActiveFilters}
          className="flex-1"
        />
        <RefreshDataButton
          variant="outline"
          size="sm"
          showStats={true}
          showLastUpdate={true}
        />
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
                <p className="text-2xl font-bold">{filteredData.finances.filter(f => f.type === 'revenue').reduce((sum, f) => sum + f.amount, 0).toLocaleString()}</p>
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
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Properties ({filteredData.properties.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredData.properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{property.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {property.owner}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {property.portfolioManager}
                        </span>
                        <span>{property.area}</span>
                        <span>{property.bedrooms} bedrooms</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{property.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Revenue</p>
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
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Tasks ({filteredData.tasks.length})
              </CardTitle>
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
                        <span>{task.property}</span>
                        <span>{task.assignedTo}</span>
                        <span>Due: {task.dueDate}</span>
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
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Bookings ({filteredData.bookings.length})
              </CardTitle>
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
                        <p className="font-semibold text-green-600">₹{booking.amount.toLocaleString()}</p>
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
                          {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
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
                        <p className="font-semibold">₹{utility.amount.toLocaleString()}</p>
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
                        <span>Cost: ₹{maintenance.cost.toLocaleString()}</span>
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