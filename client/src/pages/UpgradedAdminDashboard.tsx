import React, { useState } from 'react';
import { useFastAuth } from '@/lib/fastAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calendar, ListTodo, DollarSign, User, Users, TrendingUp, MoreVertical, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import TopBar from '@/components/TopBar';

export default function UpgradedAdminDashboard() {
  const { user } = useFastAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data for dashboard
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: finances = [], isLoading: financesLoading } = useQuery({
    queryKey: ['/api/finance'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const isLoading = propertiesLoading || tasksLoading || bookingsLoading || financesLoading;

  // Get recent tasks for display
  const recentTasks = tasks.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);
  const recentFinances = finances.slice(0, 5);

  // Calculate monthly revenue from bookings
  const calculateMonthlyRevenue = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return bookings.reduce((total: number, booking: any) => {
      const bookingDate = new Date(booking.checkInDate || booking.checkIn || booking.createdAt);
      if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
        return total + (booking.totalAmount || 0);
      }
      return total;
    }, 0);
  };

  const monthlyRevenue = calculateMonthlyRevenue();

  // Create property lookup map for bookings
  const propertyMap = new Map();
  properties.forEach((property: any) => {
    propertyMap.set(property.id, property.name);
  });

  const formatCurrency = (amount: number) => {
    return `฿${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      // Same month and year
      return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      // Same year, different months
      return `${start.getDate()} ${start.toLocaleDateString('en-GB', { month: 'short' })}–${end.getDate()} ${end.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
    } else {
      // Different years
      return `${formatDate(startDate)} – ${formatDate(endDate)}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Enhanced Admin Dashboard" />
        
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Enhanced Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back, {user?.firstName || user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <MoreVertical className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Properties</p>
                    <p className="text-2xl font-bold">{properties.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Tasks</p>
                    <p className="text-2xl font-bold">{tasks.length}</p>
                  </div>
                  <ListTodo className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Finances</p>
                    <p className="text-2xl font-bold">{finances.length}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Properties Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Properties ({properties.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {properties.slice(0, 4).map((property: any) => (
                    <div key={property.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <div>
                        <p className="font-medium text-sm">{property.name}</p>
                        <p className="text-xs text-slate-600">{property.bedrooms} BR</p>
                      </div>
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                  ))}
                  {properties.length > 4 && (
                    <p className="text-xs text-center text-slate-600 pt-2">
                      +{properties.length - 4} more properties
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-5 w-5" />
                      Recent Tasks
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View All Tasks
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTasks.map((task: any) => (
                    <div key={task.id} className="space-y-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{task.title}</p>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      <TaskProgressBar 
                        status={task.status} 
                        priority={task.priority} 
                      />
                      <p className="text-xs text-slate-600">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentBookings.map((booking: any) => {
                    const propertyName = propertyMap.get(booking.propertyId) || `Property #${booking.propertyId}`;
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <div>
                          <p className="font-medium text-sm">{booking.guestName}</p>
                          <p className="text-xs text-blue-600 font-medium">{propertyName}</p>
                          <p className="text-xs text-slate-600">
                            {formatDateRange(booking.checkInDate || booking.checkIn, booking.checkOutDate || booking.checkOut)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(booking.totalAmount)}</p>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge variant="outline">{task.type}</Badge>
                        </div>
                        <TaskProgressBar 
                          status={task.status} 
                          priority={task.priority}
                          className="mb-2"
                        />
                        <p className="text-sm text-slate-600">
                          Assigned to: {task.assignedTo} | Due: {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking: any) => {
                    const propertyName = propertyMap.get(booking.propertyId) || `Property #${booking.propertyId}`;
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{booking.guestName}</h3>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-600 font-medium mb-1">
                            Property: {propertyName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {formatDateRange(booking.checkInDate || booking.checkIn, booking.checkOutDate || booking.checkOut)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(booking.totalAmount)}</p>
                          <p className="text-sm text-slate-600">{booking.source || 'Direct'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Financial Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFinances.map((finance: any) => (
                    <div key={finance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{finance.description}</h3>
                          <Badge variant={
                            finance.type === 'income' ? 'default' :
                            finance.type === 'expense' ? 'destructive' : 'secondary'
                          }>
                            {finance.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {formatDate(finance.date)} | Property: {finance.propertyName || 'General'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          finance.type === 'income' ? 'text-green-600' :
                          finance.type === 'expense' ? 'text-red-600' : 'text-slate-600'
                        }`}>
                          {finance.type === 'expense' ? '-' : '+'}{formatCurrency(finance.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
}