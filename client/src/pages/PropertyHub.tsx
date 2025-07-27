import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Calendar, 
  CheckSquare,
  UserCheck,
  Wrench,
  Users,
  ClipboardList,
  Settings
} from "lucide-react";
import TopBar from "@/components/TopBar";

export default function PropertyHub() {
  const propertyItems = [
    {
      title: "Properties List",
      description: "View and manage all properties with detailed information and status",
      href: "/properties",
      icon: Building2,
      badge: "Core",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      title: "Calendar & Bookings", 
      description: "Booking calendar, reservations management, and availability tracking",
      href: "/bookings",
      icon: Calendar,
      badge: "Bookings",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "Check-in/Check-out",
      description: "Guest arrival and departure management with workflow tracking",
      href: "/guest-check-in-check-out-tracker", 
      icon: UserCheck,
      badge: "Guests",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      title: "Property Tasks",
      description: "Task management for cleaning, maintenance, and property operations",
      href: "/tasks",
      icon: CheckSquare,
      badge: "Tasks",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
      title: "Appliances & Maintenance",
      description: "Equipment tracking, maintenance schedules, and repair management",
      href: "/property-appliances-management",
      icon: Wrench,
      badge: "Maintenance",
      color: "bg-red-50 hover:bg-red-100 border-red-200"
    },
    {
      title: "Guest Services",
      description: "Guest communication, requests, and service management tools",
      href: "/guest-portal",
      icon: Users,
      badge: "Service",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    },
    {
      title: "Staff Operations",
      description: "Staff task assignments, schedules, and operational coordination",
      href: "/staff-tasks",
      icon: ClipboardList,
      badge: "Staff",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
    },
    {
      title: "Property Settings",
      description: "Property-specific configurations, rates, and management settings",
      href: "/property-settings-module",
      icon: Settings,
      badge: "Settings",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Property Management Hub" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Management Hub</h1>
              <p className="text-gray-600">
                Comprehensive property management tools for operations, maintenance, and guest services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertyItems.map((item) => {
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
        </main>
      </div>
    </div>
  );
}