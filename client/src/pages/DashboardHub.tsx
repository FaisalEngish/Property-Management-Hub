import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  DollarSign, 
  Building2, 
  CheckSquare,
  TrendingUp,
  Users,
  Calendar,
  Activity
} from "lucide-react";
export default function DashboardHub() {
  const dashboardItems = [
    {
      title: "Admin Dashboard",
      description: "Comprehensive overview of all properties, bookings, tasks, and financial metrics",
      href: "/",
      icon: BarChart3,
      badge: "Main",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      title: "Financial Dashboard", 
      description: "Revenue tracking, expense analysis, and financial performance insights",
      href: "/simple-filtered-financial-dashboard",
      icon: DollarSign,
      badge: "Finance",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "Property Dashboard",
      description: "Property-specific metrics, occupancy rates, and performance analytics",
      href: "/filtered-property-dashboard", 
      icon: Building2,
      badge: "Properties",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      title: "Task Overview",
      description: "Global task monitoring across all properties with staff performance tracking",
      href: "/tasks",
      icon: CheckSquare,
      badge: "Operations",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
      title: "Daily Operations",
      description: "Today's activities, urgent tasks, and operational status overview",
      href: "/daily-operations",
      icon: Activity,
      badge: "Today",
      color: "bg-red-50 hover:bg-red-100 border-red-200"
    },
    {
      title: "Portfolio Manager Dashboard",
      description: "Multi-property portfolio insights and management tools",
      href: "/portfolio-manager-dashboard",
      icon: TrendingUp,
      badge: "Portfolio",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Hub</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Access all dashboard views and analytics from one central location</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <IconComponent className="h-6 w-6 text-gray-700" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}