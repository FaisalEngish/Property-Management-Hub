import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  DollarSign, 
  Building2, 
  CheckSquare,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Sun,
  Moon,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
export default function DashboardHub() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check for existing dark mode preference
  useEffect(() => {
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  // Fetch dashboard metrics
  const { data: metrics = {} } = useQuery({
    queryKey: ['/api/dashboard-metrics'],
    queryFn: async () => {
      // Mock data for demo - replace with actual API call
      return {
        totalRevenue: 2847650,
        activeProperties: 24,
        pendingTasks: 8,
        staffOnline: 12,
        revenueChange: 8.5,
        propertiesChange: 2,
        tasksChange: -15,
        staffChange: 4
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const formatCurrency = (amount: number) => {
    return `฿${amount?.toLocaleString() || '0'}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-500 dark:text-gray-400";
  };
  const dashboardItems = [
    {
      title: "Admin Dashboard",
      description: "Comprehensive overview of all properties, bookings, tasks, and financial metrics",
      href: "/",
      icon: BarChart3,
      badge: "Main",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-700",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Financial Dashboard", 
      description: "Revenue tracking, expense analysis, and financial performance insights",
      href: "/admin-finance",
      icon: DollarSign,
      badge: "Finance",
      color: "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 dark:from-green-900/30 dark:to-green-800/30 dark:border-green-700",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Property Dashboard",
      description: "Property-specific metrics, occupancy rates, and performance analytics",
      href: "/property-hub", 
      icon: Building2,
      badge: "Properties",
      color: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 dark:border-purple-700",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Task Overview",
      description: "Global task monitoring across all properties with staff performance tracking",
      href: "/tasks",
      icon: CheckSquare,
      badge: "Operations",
      color: "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 dark:border-orange-700",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      title: "Daily Operations",
      description: "Today's activities, urgent tasks, and operational status overview",
      href: "/daily-operations",
      icon: Activity,
      badge: "Today",
      color: "bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 dark:from-red-900/30 dark:to-red-800/30 dark:border-red-700",
      gradient: "from-red-500 to-red-600"
    },
    {
      title: "Portfolio Manager Dashboard",
      description: "Multi-property portfolio insights and management tools",
      href: "/portfolio-manager-dashboard",
      icon: TrendingUp,
      badge: "Portfolio",
      color: "bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 dark:border-indigo-700",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Personalization and Dark Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, Admin
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatDate(currentTime)} • {formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDarkMode}
          className="flex items-center gap-2"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(metrics.revenueChange)}
                  <span className={`text-xs font-medium ${getChangeColor(metrics.revenueChange)}`}>
                    {metrics.revenueChange > 0 ? '+' : ''}{metrics.revenueChange}% vs last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Properties</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {metrics.activeProperties}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(metrics.propertiesChange)}
                  <span className={`text-xs font-medium ${getChangeColor(metrics.propertiesChange)}`}>
                    {metrics.propertiesChange > 0 ? '+' : ''}{metrics.propertiesChange} this month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {metrics.pendingTasks}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(metrics.tasksChange)}
                  <span className={`text-xs font-medium ${getChangeColor(metrics.tasksChange)}`}>
                    {metrics.tasksChange > 0 ? '+' : ''}{metrics.tasksChange}% vs yesterday
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Staff Online</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {metrics.staffOnline}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(metrics.staffChange)}
                  <span className={`text-xs font-medium ${getChangeColor(metrics.staffChange)}`}>
                    {metrics.staffChange > 0 ? '+' : ''}{metrics.staffChange} vs yesterday
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Navigation Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard Hub</h2>
        <p className="text-gray-600 dark:text-gray-400">Access all dashboard views and analytics from one central location</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dashboardItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-0 rounded-xl overflow-hidden ${item.color}`}>
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 bg-gradient-to-br ${item.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-3 py-1 bg-white/80 dark:bg-gray-800/80 font-medium backdrop-blur-sm border-0"
                    >
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {item.description}
                  </p>
                  <div className="mt-4 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}