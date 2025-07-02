import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { 
  Menu, 
  Bell, 
  Search, 
  Settings,
  HelpCircle,
  Shield,
  Briefcase,
  Home,
  UserCheck,
  CreditCard,
  Users,
  Clock
} from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onMobileMenuToggle?: () => void;
}

// Role icons mapping
const roleIcons = {
  admin: Shield,
  "portfolio-manager": Briefcase,
  owner: Home,
  staff: UserCheck,
  "retail-agent": CreditCard,
  "referral-agent": Users,
  guest: Clock
} as const;

const roleColors = {
  admin: "bg-red-500",
  "portfolio-manager": "bg-blue-500",
  owner: "bg-green-500",
  staff: "bg-yellow-500",
  "retail-agent": "bg-purple-500",
  "referral-agent": "bg-orange-500",
  guest: "bg-gray-500"
} as const;

export default function TopBar({ title, subtitle, action, onMobileMenuToggle }: TopBarProps) {
  const { user } = useAuth();
  
  const userRole = (user as any)?.role || "guest";
  const RoleIcon = roleIcons[userRole as keyof typeof roleIcons] || Clock;
  const roleColor = roleColors[userRole as keyof typeof roleColors] || "bg-gray-500";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Title and subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate lg:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {action}
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2">
          
          {/* Search button (desktop) */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex h-8 w-8 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-3 pl-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {(user as any)?.firstName} {(user as any)?.lastName}
              </p>
              <div className="flex justify-end">
                <Badge variant="secondary" className="text-xs">
                  {userRole === "portfolio-manager" ? "PM" : 
                   userRole === "retail-agent" ? "Retail" :
                   userRole === "referral-agent" ? "Referral" :
                   userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="relative">
              <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                <AvatarImage src={(user as any)?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {((user as any)?.firstName || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${roleColor} rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900`}>
                <RoleIcon className="w-1.5 h-1.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute right-4 top-16 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New booking received</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ocean View Suite for July 15-20</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Task completed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pool maintenance at Villa Aurora</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment received</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">$2,450 from Ocean View Suite</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}