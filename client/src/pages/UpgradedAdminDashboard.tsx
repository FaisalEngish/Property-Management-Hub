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

  // Get recent tasks for display - safe array operations
  const recentTasks = Array.isArray(tasks) ? tasks.slice(0, 5) : [];
  const recentBookings = Array.isArray(bookings) ? bookings.slice(0, 5) : [];
  const recentFinances = Array.isArray(finances) ? finances.slice(0, 5) : [];

  // Create property lookup map for bookings - safe array operation
  const propertyMap = new Map();
  if (Array.isArray(properties)) {
    properties.forEach((property: any) => {
      propertyMap.set(property.id, property.name);
    });
  }

  const formatCurrency = (amount: number) => {
    return `฿${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Enhanced Admin Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
                Welcome back, {user?.firstName || user?.email}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="rounded-xl border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <MoreVertical className="h-4 w-4 mr-2 text-emerald-600" />
              <span className="font-medium text-emerald-700">Refresh</span>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-emerald-100/50 hover:border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Properties</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{properties.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-100/80 rounded-xl">
                    <Building className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-teal-100/50 hover:border-teal-200 bg-gradient-to-br from-teal-50/30 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active Tasks</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{tasks.length}</p>
                  </div>
                  <div className="p-3 bg-teal-100/80 rounded-xl">
                    <ListTodo className="h-8 w-8 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-cyan-100/50 hover:border-cyan-200 bg-gradient-to-br from-cyan-50/30 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Bookings</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{bookings.length}</p>
                  </div>
                  <div className="p-3 bg-cyan-100/80 rounded-xl">
                    <Calendar className="h-8 w-8 text-cyan-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-100/50 hover:border-green-200 bg-gradient-to-br from-green-50/30 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Finances</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{finances.length}</p>
                  </div>
                  <div className="p-3 bg-green-100/80 rounded-xl">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100/60 rounded-xl p-1 shadow-inner">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg font-semibold data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="rounded-lg font-semibold data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              className="rounded-lg font-semibold data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="finances" 
              className="rounded-lg font-semibold data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Finances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Properties Overview */}
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-emerald-100/50">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-emerald-100/80 rounded-lg">
                      <Building className="h-6 w-6 text-emerald-600" />
                    </div>
                    Properties ({properties.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {properties.slice(0, 4).map((property: any) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50/50 to-slate-50/80 rounded-lg border border-emerald-100/30">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{property.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{property.bedrooms} BR</p>
                      </div>
                      <Badge 
                        variant={property.status === 'active' ? 'default' : 'secondary'} 
                        className={property.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}
                      >
                        {property.status}
                      </Badge>
                    </div>
                  ))}
                  {properties.length > 4 && (
                    <p className="text-sm text-center text-slate-500 pt-2 font-medium">
                      +{properties.length - 4} more properties
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-teal-100/50">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-teal-100/80 rounded-lg">
                      <ListTodo className="h-6 w-6 text-teal-600" />
                    </div>
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {recentTasks.map((task: any) => (
                    <div key={task.id} className="space-y-3 p-4 bg-gradient-to-r from-teal-50/50 to-slate-50/80 rounded-lg border border-teal-100/30">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-slate-800">{task.title}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="rounded-lg hover:bg-teal-100/50 transition-colors duration-200"
                        >
                          <MoreVertical className="h-4 w-4 text-teal-600" />
                        </Button>
                      </div>
                      <TaskProgressBar 
                        status={task.status} 
                        priority={task.priority} 
                      />
                      <p className="text-xs text-slate-500 font-medium">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-cyan-100/50">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-cyan-100/80 rounded-lg">
                      <Calendar className="h-6 w-6 text-cyan-600" />
                    </div>
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {recentBookings.map((booking: any) => {
                    const propertyName = propertyMap.get(booking.propertyId) || `Property #${booking.propertyId}`;
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50/50 to-slate-50/80 rounded-lg border border-cyan-100/30">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{booking.guestName}</p>
                          <p className="text-xs text-cyan-600 font-semibold">{propertyName}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {formatDate(booking.checkInDate || booking.checkIn)} - {formatDate(booking.checkOutDate || booking.checkOut)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-slate-800">{formatCurrency(booking.totalAmount)}</p>
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className={booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}
                          >
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

          <TabsContent value="tasks" className="space-y-6">
            <Card className="rounded-xl shadow-lg border-2 border-teal-100/50">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-teal-100/80 rounded-lg">
                    <ListTodo className="h-6 w-6 text-teal-600" />
                  </div>
                  All Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  {Array.isArray(tasks) && tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50/50 to-slate-50/80 rounded-xl border-2 border-teal-100/30 hover:border-teal-200/50 transition-all duration-200 hover:shadow-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-lg text-slate-800">{task.title}</h3>
                          <Badge 
                            variant="outline" 
                            className="bg-emerald-100/80 text-emerald-700 border-emerald-200 font-semibold"
                          >
                            {task.type}
                          </Badge>
                        </div>
                        <TaskProgressBar 
                          status={task.status} 
                          priority={task.priority}
                          className="mb-3"
                        />
                        <p className="text-sm text-slate-500 font-medium">
                          Assigned to: <span className="text-slate-700 font-semibold">{task.assignedTo}</span> | Due: <span className="text-slate-700 font-semibold">{formatDate(task.dueDate)}</span>
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="rounded-xl hover:bg-teal-100/50 transition-all duration-200 hover:scale-105"
                      >
                        <MoreVertical className="h-5 w-5 text-teal-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="rounded-xl shadow-lg border-2 border-cyan-100/50">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-cyan-100/80 rounded-lg">
                    <Calendar className="h-6 w-6 text-cyan-600" />
                  </div>
                  All Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  {Array.isArray(bookings) && bookings.map((booking: any) => {
                    const propertyName = propertyMap.get(booking.propertyId) || `Property #${booking.propertyId}`;
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50/50 to-slate-50/80 rounded-xl border-2 border-cyan-100/30 hover:border-cyan-200/50 transition-all duration-200 hover:shadow-md">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg text-slate-800">{booking.guestName}</h3>
                            <Badge 
                              variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                              className={
                                booking.status === 'confirmed' 
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold' 
                                  : booking.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700 border-amber-200 font-semibold'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 font-semibold'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-cyan-600 font-bold mb-2">
                            Property: {propertyName}
                          </p>
                          <p className="text-sm text-slate-500 font-medium">
                            {formatDate(booking.checkInDate || booking.checkIn)} - {formatDate(booking.checkOutDate || booking.checkOut)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-slate-800 mb-1">{formatCurrency(booking.totalAmount)}</p>
                          <p className="text-sm text-slate-500 font-medium">{booking.source || 'Direct'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            <Card className="rounded-xl shadow-lg border-2 border-green-100/50">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-green-100/80 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  Recent Financial Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  {recentFinances.map((finance: any) => (
                    <div key={finance.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-slate-50/80 rounded-xl border-2 border-green-100/30 hover:border-green-200/50 transition-all duration-200 hover:shadow-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-lg text-slate-800">{finance.description}</h3>
                          <Badge 
                            variant={
                              finance.type === 'income' ? 'default' :
                              finance.type === 'expense' ? 'destructive' : 'secondary'
                            }
                            className={
                              finance.type === 'income' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold' 
                                : finance.type === 'expense'
                                ? 'bg-red-100 text-red-700 border-red-200 font-semibold'
                                : 'bg-slate-100 text-slate-600 border-slate-200 font-semibold'
                            }
                          >
                            {finance.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                          <span className="text-slate-700 font-semibold">{formatDate(finance.date)}</span> | Property: <span className="text-slate-700 font-semibold">{finance.propertyName || 'General'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-xl mb-1 ${
                          finance.type === 'income' ? 'text-emerald-600' :
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