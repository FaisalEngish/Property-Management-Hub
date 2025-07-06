import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Calendar, ListTodo, DollarSign, Plus, Home, ClipboardList, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const recentBookings = bookings.slice(0, 3);
  const recentTasks = tasks.slice(0, 3);

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar 
          title="Dashboard" 
          subtitle="Welcome back! Here's your property overview"
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Properties"
              value={stats?.totalProperties || 0}
              icon={Building}
              color="primary"
            />
            <StatsCard
              title="Active Bookings"
              value={stats?.activeBookings || 0}
              icon={Calendar}
              color="success"
            />
            <StatsCard
              title="Pending ListTodo"
              value={stats?.pendingTasks || 0}
              icon={ListTodo}
              color="warning"
            />
            <StatsCard
              title="Monthly Revenue"
              value={`$${stats?.monthlyRevenue?.toLocaleString() || '0'}`}
              icon={DollarSign}
              color="accent"
            />
          </div>

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
                          <p className="text-sm text-gray-500">${booking.totalAmount}</p>
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
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
              <Plus className="w-6 h-6 text-primary" />
              <span>New Booking</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
              <Home className="w-6 h-6 text-green-600" />
              <span>Add Property</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
              <ClipboardList className="w-6 h-6 text-yellow-600" />
              <span>Create Task</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <span>View Reports</span>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
