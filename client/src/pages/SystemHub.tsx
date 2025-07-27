import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Users, 
  Zap,
  Brain,
  Activity,
  TestTube,
  Shield,
  Database
} from "lucide-react";
import TopBar from "@/components/TopBar";

export default function SystemHub() {
  const systemItems = [
    {
      title: "Settings",
      description: "API connections, branding, legal templates, and currency & tax configuration",
      href: "/settings",
      icon: Settings,
      badge: "Core",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      title: "User Management", 
      description: "Manage users, roles, permissions, and access control across the platform",
      href: "/user-management",
      icon: Users,
      badge: "Users",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "Automation Management",
      description: "Configure automated workflows, scheduling, and system automation rules",
      href: "/automation-management", 
      icon: Zap,
      badge: "Auto",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
    },
    {
      title: "AI Features",
      description: "AI task management, notifications, feedback monitoring, and smart suggestions",
      href: "/ai-feature-dashboard",
      icon: Brain,
      badge: "AI",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      title: "Activity Logs",
      description: "System activity monitoring, user actions, and audit trail management",
      href: "/activity-logs",
      icon: Activity,
      badge: "Logs",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
      title: "Sandbox Testing",
      description: "Demo data testing environment and system validation tools",
      href: "/sandbox-testing-dashboard",
      icon: TestTube,
      badge: "Test",
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200"
    },
    {
      title: "Additional Settings",
      description: "Advanced administrative tools, system integrity, and demo integration",
      href: "/admin/additional-settings",
      icon: Shield,
      badge: "Tools",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    },
    {
      title: "SaaS Management",
      description: "Multi-tenant organization management and subscription oversight",
      href: "/admin/saas-management",
      icon: Database,
      badge: "SaaS",
      color: "bg-red-50 hover:bg-red-100 border-red-200"
    }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="System Hub" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">System Hub</h1>
              <p className="text-gray-600">
                System administration, configuration, and management tools for platform oversight
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemItems.map((item) => {
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