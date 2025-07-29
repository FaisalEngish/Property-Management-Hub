import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calendar, ListTodo, DollarSign, User, Users, TrendingUp, MoreVertical } from 'lucide-react';
import { RoleBackButton } from '@/components/BackButton';
import RefreshDataButton from '@/components/RefreshDataButton';
import { LiveAlertsBar } from '@/components/LiveAlertsBar';
import { KPIWidgets } from '@/components/KPIWidgets';
import { QuickActionButtons } from '@/components/QuickActionButtons';
import { TaskProgressBar } from '@/components/TaskProgressBar';
import { useQuery } from '@tanstack/react-query';

export default function UpgradedAdminDashboard() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <RoleBackButton />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back, {user?.name || user?.email}
              </p>
            </div>
          </div>
          <RefreshDataButton />
        </div>

        {/* Live Alerts Bar */}
        <LiveAlertsBar />

        {/* Quick Action Buttons */}
        <QuickActionButtons />

        {/* KPI Widgets */}
        <KPIWidgets />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListTodo className="h-5 w-5" />
                    Recent Tasks
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
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <div>
                        <p className="font-medium text-sm">{booking.guestName}</p>
                        <p className="text-xs text-slate-600">
                          {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(booking.totalAmount)}</p>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{booking.guestName}</h3>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Property: {booking.propertyName || 'Unknown Property'}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(booking.totalAmount)}</p>
                        <p className="text-sm text-slate-600">{booking.source || 'Direct'}</p>
                      </div>
                    </div>
                  ))}
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
      </div>
    </div>
  );
}