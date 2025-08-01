import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CheckSquare, Clock, DollarSign, Wallet, CheckCircle, AlertCircle, Wrench, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Link } from "wouter";

export default function StaffDashboard() {
  // Fetch staff wallet data
  const { data: walletData } = useQuery({
    queryKey: ["/api/staff-wallet/staff-pool"],
    enabled: true
  });

  // Fetch staff tasks
  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: true
  });

  // Sample data for staff dashboard
  const staffWalletBalance = walletData?.currentBalance || 6750;
  const basePettyCash = walletData?.basePettyCash || 5000;
  const pendingExpenses = 2;
  const tasksToday = tasks?.filter((task: any) => {
    const today = new Date().toDateString();
    return new Date(task.dueDate).toDateString() === today;
  })?.length || 4;
  
  const completedToday = tasks?.filter((task: any) => {
    const today = new Date().toDateString();
    return task.status === 'completed' && new Date(task.completedAt || task.updatedAt).toDateString() === today;
  })?.length || 2;

  const quickActions = [
    {
      title: "My Tasks Today",
      count: tasksToday,
      icon: CheckSquare,
      href: "/tasks",
      color: "blue",
      description: `${completedToday} completed`
    },
    {
      title: "My Wallet Balance",
      count: formatCurrency(staffWalletBalance),
      icon: Wallet,
      href: "/staff-wallet-petty-cash",
      color: "green",
      description: `Base: ${formatCurrency(basePettyCash)}`
    },
    {
      title: "Pending Expenses",
      count: pendingExpenses,
      icon: AlertCircle,
      href: "/staff-expense-management",
      color: "orange",
      description: "Awaiting review"
    },
    {
      title: "Cash Collections",
      count: "2 pending",
      icon: DollarSign,
      href: "/staff-cash-collection",
      color: "purple",
      description: "Guest check-outs"
    }
  ];

  const todaysTasks = [
    {
      id: 1,
      title: "Villa Aruna - Pool Cleaning",
      property: "Villa Aruna",
      priority: "normal",
      status: "pending",
      time: "09:00",
      category: "pool"
    },
    {
      id: 2,
      title: "Villa Breeze - Guest Check-out",
      property: "Villa Breeze", 
      priority: "high",
      status: "in_progress",
      time: "11:00",
      category: "checkout"
    },
    {
      id: 3,
      title: "Villa Paradise - Maintenance Check",
      property: "Villa Paradise",
      priority: "normal", 
      status: "pending",
      time: "14:00",
      category: "maintenance"
    },
    {
      id: 4,
      title: "Villa Samui - Guest Check-in Prep",
      property: "Villa Samui",
      priority: "high",
      status: "completed",
      time: "15:30",
      category: "checkin"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pool': return CheckCircle;
      case 'maintenance': return Wrench;
      case 'checkout': 
      case 'checkin': return Clock;
      default: return CheckSquare;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your daily overview</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <Clock className="w-4 h-4 mr-1" />
          Staff Portal
        </Badge>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Link key={action.title} href={action.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                  <IconComponent className={`h-4 w-4 text-${action.color}-600`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{action.count}</div>
                  <p className={`text-xs text-${action.color}-600`}>
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Today's Tasks ({todaysTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysTasks.map((task) => {
              const CategoryIcon = getCategoryIcon(task.category);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-500">
                        {task.property} • {task.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(task.status)}
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Link href="/tasks">
              <Button variant="outline" className="w-full">
                View All My Tasks
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💰 Wallet & Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/staff-wallet-petty-cash">
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="w-4 h-4 mr-2" />
                Manage Petty Cash
              </Button>
            </Link>
            <Link href="/staff-cash-collection">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Cash Collection
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🏘️ Property Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/checkin-checkout-workflow">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="w-4 h-4 mr-2" />
                Check-in/Out
              </Button>
            </Link>
            <Link href="/maintenance-log-warranty-tracker">
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="w-4 h-4 mr-2" />
                Maintenance
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💬 Guest Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/guest-portal-smart-requests">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Guest Requests
              </Button>
            </Link>
            <Link href="/daily-operations">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Daily Operations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}