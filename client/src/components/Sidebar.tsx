import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LogOut,
  Settings,
  User,
  Bell,
  BarChart3,
  Building2,
  DollarSign,
  Calendar,
  Shield,
  Building,
  Key,
  Users,
  Package,
  UserPlus,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  Calculator,
  Trophy,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFastAuth } from "@/lib/fastAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const roleIcons = {
  admin: Shield,
  "portfolio-manager": Building,
  owner: Key,
  staff: Users,
  "retail-agent": Package,
  "referral-agent": UserPlus,
  guest: User,
  freelancer: Wrench,
};

export default function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const { user, isAuthenticated, logout } = useFastAuth();

  // Save collapse state and dispatch event when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    window.dispatchEvent(new CustomEvent('sidebarCollapse', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  const userRole = user?.role || "guest";
  const RoleIcon = roleIcons[userRole as keyof typeof roleIcons] || User;

  // Main menu items based on role
  const getMenuItems = (role: string) => {
    const commonItems = [
      {
        label: "Dashboard",
        icon: BarChart3,
        href: "/dashboard-hub",
        tooltip: "Dashboard Hub",
      },
      {
        label: "Property",
        icon: Building2,
        href: "/property-hub",
        tooltip: "Property Management",
      },
      {
        label: "Finance",
        icon: DollarSign,
        href: "/finance-hub",
        tooltip: "Finance Hub",
      },
      {
        label: "System",
        icon: Settings,
        href: "/system-hub",
        tooltip: "System Settings",
      },
      {
        label: "Salaries",
        icon: Calculator,
        href: "/salaries-wages",
        tooltip: "Staff Salaries",
      },
      {
        label: "Achievements",
        icon: Trophy,
        href: "/achievements",
        tooltip: "Achievements",
      },
    ];

    const roleMenus: Record<string, any[]> = {
      admin: commonItems,
      "portfolio-manager": commonItems,
      staff: [
        {
          label: "Dashboard",
          icon: BarChart3,
          href: "/dashboard-hub",
          tooltip: "Dashboard Hub",
        },
        {
          label: "Property",
          icon: Building2,
          href: "/property-hub",
          tooltip: "Property Management",
        },
        {
          label: "Achievements",
          icon: Trophy,
          href: "/achievements",
          tooltip: "Achievements",
        },
      ],
      owner: [
        {
          label: "Dashboard",
          icon: BarChart3,
          href: "/dashboard-hub",
          tooltip: "Dashboard Hub",
        },
        {
          label: "Property",
          icon: Building2,
          href: "/property-hub",
          tooltip: "Property Management",
        },
        {
          label: "Finance",
          icon: DollarSign,
          href: "/finance-hub",
          tooltip: "Finance Hub",
        },
        {
          label: "Achievements",
          icon: Trophy,
          href: "/achievements",
          tooltip: "Achievements",
        },
      ],
      guest: [
        { label: "My Stay", icon: Home, href: "/", tooltip: "Guest Dashboard" },
        {
          label: "Property Info",
          icon: Building,
          href: "/property-info",
          tooltip: "Property Information",
        },
        {
          label: "Calendar",
          icon: Calendar,
          href: "/services",
          tooltip: "Services",
        },
      ],
    };

    return roleMenus[role] || commonItems;
  };

  const menuItems = getMenuItems(userRole);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const handleNavigation = (href: string) => {
    if (href.includes("-hub")) {
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      window.location.href = href;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-white dark:bg-black text-black dark:text-slate-500 flex flex-col items-start transition-all duration-300 ease-in-out shadow-2xl z-50",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
      >
        {/* Header Section */}
        <div className="w-full border-b border-slate-700/50 text-black dark:text-white">
          {/* Logo / Brand */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={cn(
                  "w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0",
                  isCollapsed && "w-8 h-8",
                )}
              >
                <Building
                  className={cn(
                    "text-white",
                    isCollapsed ? "h-4 w-4" : "h-5 w-5",
                  )}
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-black dark:text-white truncate">
                    HostPilotPro
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 w-full overflow-y-auto py-4 px-2 text-black">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                location === item.href || location.startsWith(item.href + "?");

              const NavButton = (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "text-slate-900 hover:bg-slate-700/50 hover:text-white",
                    isCollapsed && "justify-center px-2",
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon
                    className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "h-5 w-5" : "h-5 w-5",
                    )}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              );

              if (isCollapsed) {
                return (
                  <li key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>{NavButton}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-slate-700 text-white border-slate-600"
                      >
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={index}>{NavButton}</li>;
            })}
          </ul>
        </nav>

        {/* Footer Section */}
        <div className="w-full border-t border-slate-700/50">
          {/* Settings Button */}
          {!isCollapsed && (
            <div className="px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-slate-900 hover:bg-slate-700/50 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <div className="p-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={cn(
                    "w-full h-10 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200",
                    isCollapsed && "justify-center px-0",
                  )}
                  data-testid="sidebar-toggle"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <>
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      <span className="text-sm">Collapse</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-slate-700 text-white border-slate-600"
              >
                {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
