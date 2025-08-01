import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Activity,
  Bell
} from "lucide-react";

export default function DailyOperations() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    select: (data: any[]) => data.map(task => ({
      id: task.id,
      title: task.title || 'Untitled Task',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo || 'Unassigned',
      propertyName: task.propertyName || 'Unknown Property',
      dueDate: task.dueDate || new Date().toISOString(),
      type: task.type || 'maintenance'
    }))
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    select: (data: any[]) => data.map(booking => ({
      id: booking.id,
      guestName: booking.guestName || 'Unknown Guest',
      propertyName: booking.propertyName || 'Unknown Property',
      checkIn: booking.checkIn || new Date().toISOString(),
      checkOut: booking.checkOut || new Date().toISOString(),
      status: booking.status || 'confirmed',
      totalAmount: booking.totalAmount || 0
    }))
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    select: (data: any[]) => data.map(property => ({
      id: property.id,
      name: property.name || 'Unnamed Property',
      status: property.status || 'active',
      occupancyRate: Math.floor(Math.random() * 100), // Demo data
      revenue: Math.floor(Math.random() * 50000) + 10000, // Demo data
      maintenanceIssues: Math.floor(Math.random() * 5)
    }))
  });

  // Today's metrics
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  const todayCheckIns = bookings.filter(booking => {
    const checkInDate = new Date(booking.checkIn).toDateString();
    const today = new Date().toDateString();
    return checkInDate === today;
  });

  const todayCheckOuts = bookings.filter(booking => {
    const checkOutDate = new Date(booking.checkOut).toDateString();
    const today = new Date().toDateString();
    return checkOutDate === today;
  });

  const operationalStats = {
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'active').length,
    todayTasks: todayTasks.length,
    completedTasks: todayTasks.filter(t => t.status === 'completed').length,
    checkInsToday: todayCheckIns.length,
    checkOutsToday: todayCheckOuts.length,
    averageOccupancy: properties.length ? Math.round(properties.reduce((acc, p) => acc + p.occupancyRate, 0) / properties.length) : 0,
    dailyRevenue: bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0)
  };

  const isLoading = tasksLoading || bookingsLoading || propertiesLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Daily Operations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Today's overview - {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button>
            <Activity className="w-4 h-4 mr-2" />
            Live Status
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Properties Active</p>
                <p className="text-2xl font-bold">{operationalStats.activeProperties}/{operationalStats.totalProperties}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Tasks</p>
                <p className="text-2xl font-bold">{operationalStats.completedTasks}/{operationalStats.todayTasks}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check-ins / Outs</p>
                <p className="text-2xl font-bold">{operationalStats.checkInsToday} / {operationalStats.checkOutsToday}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Occupancy</p>
                <p className="text-2xl font-bold">{operationalStats.averageOccupancy}%</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Today's Tasks</TabsTrigger>
          <TabsTrigger value="bookings">Guest Activities</TabsTrigger>
          <TabsTrigger value="properties">Property Status</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Tasks ({todayTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All tasks completed!</h3>
                  <p className="text-gray-600">No pending tasks for today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.propertyName} • {task.assignedTo}</p>
                        </div>
                      </div>
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Today's Check-ins ({todayCheckIns.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {todayCheckIns.length === 0 ? (
                  <p className="text-gray-600">No check-ins scheduled today</p>
                ) : (
                  <div className="space-y-2">
                    {todayCheckIns.map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <h4 className="font-medium">{booking.guestName}</h4>
                          <p className="text-sm text-gray-600">{booking.propertyName}</p>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          {new Date(booking.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Today's Check-outs ({todayCheckOuts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {todayCheckOuts.length === 0 ? (
                  <p className="text-gray-600">No check-outs scheduled today</p>
                ) : (
                  <div className="space-y-2">
                    {todayCheckOuts.map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <h4 className="font-medium">{booking.guestName}</h4>
                          <p className="text-sm text-gray-600">{booking.propertyName}</p>
                        </div>
                        <Badge variant="outline" className="text-blue-600">
                          {new Date(booking.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-4">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{property.name}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Occupancy:</span>
                            <Progress value={property.occupancyRate} className="w-20" />
                            <span className="text-sm font-medium">{property.occupancyRate}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm">฿{property.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {property.maintenanceIssues > 0 && (
                        <Badge variant="destructive">
                          {property.maintenanceIssues} Issues
                        </Badge>
                      )}
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">High Priority Task Overdue</h4>
                    <p className="text-sm text-red-600">Pool maintenance at Villa Samui Breeze is 2 days overdue</p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">Upcoming Maintenance Due</h4>
                    <p className="text-sm text-yellow-600">AC service required at Villa Ocean View in 3 days</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">Warning</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800">Guest Check-in Reminder</h4>
                    <p className="text-sm text-blue-600">3 guests checking in today - ensure properties are ready</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600">Info</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}