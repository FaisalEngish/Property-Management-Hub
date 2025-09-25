import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Building, 
  Calendar, 
  ListTodo, 
  DollarSign, 
  Settings,
  LayoutDashboard,
  BarChart3,
  Banknote,
  Building2,
  ChevronRight,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

export default function EnhancedAdminDashboard() {
  const [location, setLocation] = useLocation();
  
  // Fetch real data from API
  const { data: properties = [] } = useQuery({ queryKey: ["/api/properties"] });
  const { data: tasks = [] } = useQuery({ queryKey: ["/api/tasks"] });
  const { data: bookings = [] } = useQuery({ queryKey: ["/api/bookings"] });
  const { data: finances = [] } = useQuery({ queryKey: ["/api/finance"] });

  // Hub Navigator Cards
  const hubCards = [
    {
      title: "Dashboard Hub",
      subtitle: "Overview & Analytics",
      route: "/dashboard",
      icon: LayoutDashboard,
      color: "blue",
      bgClass: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30",
      iconClass: "from-blue-500 to-blue-600",
      badge: "✨ Overview"
    },
    {
      title: "Enhanced Admin",
      subtitle: "Advanced Management",
      route: "/dashboard/admin",
      icon: Settings,
      color: "emerald",
      bgClass: "from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30",
      iconClass: "from-emerald-500 to-emerald-600",
      badge: "✨ Admin Pro",
      active: true
    },
    {
      title: "Finance Hub",
      subtitle: "Financial Management",
      route: "/finance",
      icon: Banknote,
      color: "purple",
      bgClass: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30",
      iconClass: "from-purple-500 to-purple-600",
      badge: "💰 Finance"
    },
    {
      title: "Property Hub",
      subtitle: "Property Management",
      route: "/properties",
      icon: Building2,
      color: "indigo",
      bgClass: "from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30",
      iconClass: "from-indigo-500 to-indigo-600",
      badge: "🏠 Properties"
    }
  ];

  // Calculate KPIs
  const totalRevenue = Array.isArray(finances) ? finances.filter(f => f.type === 'revenue').reduce((sum, f) => sum + (f.amount || 0), 0) : 0;
  const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'completed').length : 0;
  const activeTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'in_progress').length : 0;

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toLocaleString()} THB`,
      icon: TrendingUp,
      change: "+12.5%",
      positive: true
    },
    {
      title: "Properties",
      value: Array.isArray(properties) ? properties.length.toString() : "0",
      icon: Building,
      change: "+2",
      positive: true
    },
    {
      title: "Active Tasks",
      value: activeTasks.toString(),
      icon: Clock,
      change: `-${completedTasks}`,
      positive: false
    },
    {
      title: "Bookings",
      value: Array.isArray(bookings) ? bookings.length.toString() : "0",
      icon: Users,
      change: "+5.2%",
      positive: true
    }
  ];

  return (
    <div className="theme-admin-emerald min-h-screen" style={{ backgroundColor: 'var(--admin-bg)' }}>
      {/* Fixed Layout with proper spacing for sidebar */}
      <div className="pl-72">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
          
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span 
                className="px-3 py-1 text-sm font-medium rounded-full border"
                style={{ 
                  backgroundColor: 'var(--admin-card)', 
                  color: 'var(--admin-text)',
                  borderColor: 'var(--admin-border)'
                }}
              >
                ✨ Admin Pro
              </span>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setLocation("/settings")}
                data-testid="button-settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi, index) => (
              <div
                key={index}
                className="rounded-xl border-0 shadow-lg hover:shadow-xl transition-shadow p-6"
                style={{ 
                  backgroundColor: 'var(--admin-card)', 
                  borderColor: 'var(--admin-border)'
                }}
                data-testid={`kpi-${kpi.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--admin-text)' }}>
                      {kpi.value}
                    </p>
                    <p className={`text-xs mt-1 ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change} from last month
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ 
                      background: `linear-gradient(135deg, var(--admin-accent), var(--admin-accent-hover))` 
                    }}
                  >
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hub Navigator Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--admin-text)' }}>
              Management Hubs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hubCards.map((hub, index) => (
                <div
                  key={index}
                  className={`rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 p-6 cursor-pointer group ${
                    hub.active ? 'ring-2' : ''
                  }`}
                  style={{ 
                    background: `linear-gradient(135deg, ${hub.bgClass.split(' ')[0].replace('from-', '')}, ${hub.bgClass.split(' ')[1].replace('to-', '')})`,
                    ...(hub.active ? { ringColor: 'var(--admin-accent)' } : {})
                  }}
                  onClick={() => !hub.active && setLocation(hub.route)}
                  data-testid={`hub-${hub.title.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm">
                      {hub.badge}
                    </span>
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${hub.iconClass.split(' ')[0].replace('from-', '')}, ${hub.iconClass.split(' ')[1].replace('to-', '')})` 
                      }}
                    >
                      <hub.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {hub.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {hub.subtitle}
                    </p>
                  </div>
                  {!hub.active && (
                    <ChevronRight className="h-4 w-4 text-gray-400 mt-3 group-hover:text-gray-600 transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Data Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div 
              className="rounded-xl border-0 shadow-lg p-6"
              style={{ 
                backgroundColor: 'var(--admin-card)', 
                borderColor: 'var(--admin-border)'
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
                Recent Properties
              </h3>
              <div className="space-y-3">
                {Array.isArray(properties) ? properties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{property.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      property.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400">No properties available</p>
                )}
              </div>
            </div>

            <div 
              className="rounded-xl border-0 shadow-lg p-6"
              style={{ 
                backgroundColor: 'var(--admin-card)', 
                borderColor: 'var(--admin-border)'
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
                Recent Tasks
              </h3>
              <div className="space-y-3">
                {Array.isArray(tasks) ? tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{task.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : task.status === 'in_progress' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400">No tasks available</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}