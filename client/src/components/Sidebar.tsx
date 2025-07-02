import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Building, 
  ListTodo, 
  Calendar, 
  DollarSign, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight,
  Camera,
  Home,
  Briefcase,
  FileText,
  CreditCard,
  Shield,
  UserCheck,
  Clock,
  TrendingUp,
  Gift,
  Calculator,
  Zap,
  UserPlus,
  ShoppingCart,
  Brain,
  RefreshCw,
  ClipboardList,
  Plus
} from "lucide-react";

// Define navigation modules with hierarchical structure
const navigationModules = [
  {
    id: "core",
    label: "Core",
    items: [
      { 
        path: "/", 
        icon: LayoutDashboard, 
        label: "Dashboard", 
        roles: ["admin", "portfolio-manager", "staff", "retail-agent", "referral-agent", "guest"],
        description: "Overview and metrics"
      },
      { 
        path: "/owner/dashboard", 
        icon: LayoutDashboard, 
        label: "Owner Dashboard", 
        roles: ["owner"],
        description: "Property performance, financials, and payout management"
      },
      { 
        path: "/pm/dashboard", 
        icon: Briefcase, 
        label: "PM Dashboard", 
        roles: ["portfolio-manager"],
        description: "Portfolio management, commissions, and invoicing"
      },
      { 
        path: "/staff", 
        icon: UserCheck, 
        label: "Staff Dashboard", 
        roles: ["staff"],
        description: "Task management, salary tracking, and performance analytics"
      },
    ]
  },
  {
    id: "property-management",
    label: "Property Management",
    roles: ["admin", "portfolio-manager", "owner", "staff"],
    items: [
      { 
        path: "/properties", 
        icon: Building, 
        label: "Properties", 
        roles: ["admin", "portfolio-manager", "owner"],
        description: "Manage your properties"
      },
      { 
        path: "/tasks", 
        icon: ListTodo, 
        label: "Tasks", 
        roles: ["admin", "portfolio-manager", "owner"],
        description: "Track maintenance and operations"
      },
      { 
        path: "/staff-tasks", 
        icon: ListTodo, 
        label: "My Tasks", 
        roles: ["staff"],
        description: "Complete assigned tasks with photo evidence"
      },
      { 
        path: "/welcome-packs", 
        icon: Gift, 
        label: "Welcome Packs", 
        roles: ["admin", "portfolio-manager", "owner", "staff"],
        description: "Guest welcome pack inventory and templates"
      },
      { 
        path: "/inventory-dashboard", 
        icon: BarChart3, 
        label: "Inventory Analytics", 
        roles: ["admin", "portfolio-manager", "owner", "staff"],
        description: "Inventory usage tracking and analytics"
      },
    ]
  },
  {
    id: "guest-services",
    label: "Guest Services",
    roles: ["admin", "portfolio-manager", "owner", "retail-agent", "referral-agent", "staff"],
    items: [
      { 
        path: "/bookings", 
        icon: Calendar, 
        label: "Bookings", 
        roles: ["admin", "portfolio-manager", "owner", "retail-agent", "referral-agent"],
        description: "Reservation management"
      },
      { 
        path: "/services", 
        icon: Users, 
        label: "Services", 
        roles: ["admin", "portfolio-manager", "owner", "staff"],
        description: "Add-on services and utilities"
      },
      { 
        path: "/guest-addon-services", 
        icon: Package, 
        label: "Guest Add-On Services", 
        roles: ["admin", "portfolio-manager", "staff"],
        description: "Guest service booking platform with flexible billing"
      },
      { 
        path: "/utility-tracking", 
        icon: Zap, 
        label: "Utility Tracking", 
        roles: ["admin", "portfolio-manager", "staff"],
        description: "Bill automation and expense tracking"
      },
      { 
        path: "/recurring-services", 
        icon: RefreshCw, 
        label: "Recurring Services", 
        roles: ["admin", "portfolio-manager", "staff"],
        description: "Service contracts and billing management"
      },
      { 
        path: "/referral-agent", 
        icon: UserPlus, 
        label: "Referral Dashboard", 
        roles: ["referral-agent"],
        description: "Property referrals and commission tracking"
      },
      { 
        path: "/retail-booking", 
        icon: ShoppingCart, 
        label: "Booking Engine", 
        roles: ["retail-agent"],
        description: "Create bookings and track commissions"
      },
      { 
        path: "/agent-media-library", 
        icon: Camera, 
        label: "Property Media Library", 
        roles: ["admin", "portfolio-manager", "retail-agent", "referral-agent"],
        description: "Property photos, videos, and marketing materials with agent access controls"
      },
      { 
        path: "/guest/add-ons", 
        icon: Plus, 
        label: "Guest Add-On Booking", 
        roles: ["guest"],
        description: "Book additional services during stay"
      },
      { 
        path: "/admin/add-ons-bookings", 
        icon: ClipboardList, 
        label: "Add-On Bookings", 
        roles: ["admin", "portfolio-manager", "staff"],
        description: "Manage guest add-on service bookings"
      },
      { 
        path: "/admin/add-ons-settings", 
        icon: Settings, 
        label: "Add-On Services", 
        roles: ["admin", "portfolio-manager"],
        description: "Configure available add-on services"
      },
    ]
  },
  {
    id: "financial",
    label: "Financial",
    roles: ["admin", "portfolio-manager", "owner"],
    items: [
      { 
        path: "/finances", 
        icon: DollarSign, 
        label: "Finances", 
        roles: ["admin", "portfolio-manager", "owner"],
        description: "Financial overview"
      },
      { 
        path: "/payouts", 
        icon: TrendingUp, 
        label: "Payouts", 
        roles: ["admin", "portfolio-manager", "owner"],
        description: "Owner earnings and distributions"
      },
      { 
        path: "/financial-toolkit", 
        icon: Calculator, 
        label: "Financial Toolkit", 
        roles: ["admin", "portfolio-manager", "staff"],
        description: "Staff salaries, commissions, and invoicing"
      },
      { 
        path: "/reports", 
        icon: BarChart3, 
        label: "Reports", 
        roles: ["admin", "portfolio-manager", "owner"],
        description: "Analytics and insights"
      },
    ]
  },
  {
    id: "administration",
    label: "Administration",
    roles: ["admin", "portfolio-manager"],
    items: [
      { 
        path: "/hostaway", 
        icon: Building, 
        label: "Hostaway Sync", 
        roles: ["admin", "portfolio-manager"],
        description: "Property and booking synchronization"
      },
      { 
        path: "/ai-feedback", 
        icon: Brain, 
        label: "AI Task Triggers", 
        roles: ["admin", "portfolio-manager"],
        description: "Smart guest feedback monitoring and automatic task creation"
      },
      { 
        path: "/admin/finance-reset", 
        icon: Shield, 
        label: "Finance Reset Control", 
        roles: ["admin"],
        description: "Admin-only balance management and audit controls"
      },
      { 
        path: "/settings", 
        icon: Settings, 
        label: "Settings", 
        roles: ["admin", "portfolio-manager", "owner"],
        description: "System configuration"
      },
    ]
  }
];

// Role configuration for different user types
const roleConfig = {
  admin: {
    label: "Administrator",
    color: "bg-red-500",
    icon: Shield,
    permissions: ["all"]
  },
  "portfolio-manager": {
    label: "Portfolio Manager",
    color: "bg-blue-500",
    icon: Briefcase,
    permissions: ["manage", "view"]
  },
  owner: {
    label: "Property Owner",
    color: "bg-green-500",
    icon: Home,
    permissions: ["view", "finances"]
  },
  staff: {
    label: "Staff Member",
    color: "bg-yellow-500",
    icon: UserCheck,
    permissions: ["tasks", "inventory"]
  },
  "retail-agent": {
    label: "Retail Agent",
    color: "bg-purple-500",
    icon: CreditCard,
    permissions: ["bookings", "view"]
  },
  "referral-agent": {
    label: "Referral Agent",
    color: "bg-orange-500",
    icon: Users,
    permissions: ["bookings", "commissions"]
  },
  guest: {
    label: "Guest",
    color: "bg-gray-500",
    icon: Clock,
    permissions: ["view-limited"]
  }
} as const;

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(["core"]);

  // Get current user role (fallback to guest if no role found)
  const userRole = (user as any)?.role || "guest";
  const currentRoleConfig = roleConfig[userRole as keyof typeof roleConfig] || roleConfig.guest;

  // Check if user has access to a specific item
  const hasAccess = (item: any) => {
    return item.roles.includes(userRole);
  };

  // Check if user has access to any item in a module
  const hasModuleAccess = (module: any) => {
    if (module.roles && !module.roles.some((role: string) => role === userRole)) {
      return false;
    }
    return module.items.some((item: any) => hasAccess(item));
  };

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Filter modules based on user role
  const visibleModules = navigationModules.filter(hasModuleAccess);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" />
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-72'}
        lg:relative lg:translate-x-0
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">HostPilotPro</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hospitality Management</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={(user as any)?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {((user as any)?.firstName || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${currentRoleConfig.color} rounded-full flex items-center justify-center`}>
                <currentRoleConfig.icon className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentRoleConfig.label}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleModules.map((module) => (
            <div key={module.id} className="space-y-1">
              {/* Module Header */}
              {!isCollapsed && module.items.length > 1 && (
                <Button
                  variant="ghost"
                  className="w-full justify-between text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 h-8"
                  onClick={() => toggleModule(module.id)}
                >
                  <span>{module.label}</span>
                  <ChevronRight 
                    className={`w-3 h-3 transition-transform ${
                      expandedModules.includes(module.id) ? 'rotate-90' : ''
                    }`}
                  />
                </Button>
              )}

              {/* Module Items */}
              <div className={`space-y-1 ${
                !isCollapsed && module.items.length > 1 && !expandedModules.includes(module.id) 
                  ? 'hidden' 
                  : ''
              }`}>
                {module.items
                  .filter(hasAccess)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`
                            w-full justify-start h-10 px-3
                            ${isCollapsed ? 'px-0 justify-center' : ''}
                            ${isActive 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                          {!isCollapsed && (
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-xs opacity-70">{item.description}</div>
                              )}
                            </div>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
              </div>

              {/* Separator between modules */}
              {!isCollapsed && module.id !== visibleModules[visibleModules.length - 1].id && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ${
              isCollapsed ? 'px-0 justify-center' : ''
            }`}
            onClick={() => window.location.href = '/api/logout'}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>
    </>
  );
}