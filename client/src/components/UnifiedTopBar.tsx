import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Home, 
  User, 
  Settings, 
  Bell, 
  BellOff, 
  LogOut,
  DollarSign,
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";

interface UnifiedTopBarProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  roleBasedActions?: React.ReactNode;
}

export default function UnifiedTopBar({ 
  title, 
  showBackButton = true, 
  backPath,
  roleBasedActions 
}: UnifiedTopBarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currency, setCurrency] = useState("THB");

  const handleLogout = async () => {
    try {
      // Call the proper logout endpoint
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      
      // Clear all local storage and session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear React Query cache to remove any cached user data
      queryClient.clear();
      
      // Force reload to completely reset application state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, clear local state
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();
      window.location.href = "/";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'portfolio-manager': return 'Portfolio Manager';
      case 'owner': return 'Property Owner';
      case 'staff': return 'Staff Member';
      case 'retail-agent': return 'Retail Agent';
      case 'referral-agent': return 'Referral Agent';
      case 'guest': return 'Guest';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'portfolio-manager': return 'bg-blue-500';
      case 'owner': return 'bg-green-500';
      case 'staff': return 'bg-purple-500';
      case 'retail-agent': return 'bg-orange-500';
      case 'referral-agent': return 'bg-yellow-500';
      case 'guest': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getDefaultBackPath = () => {
    if (backPath) return backPath;
    
    const role = (user as any)?.role;
    switch (role) {
      case 'admin': return '/';
      case 'portfolio-manager': return '/portfolio-manager-dashboard';
      case 'owner': return '/owner-dashboard';
      case 'staff': return '/staff-dashboard';
      case 'retail-agent': return '/retail-agent-dashboard';
      case 'referral-agent': return '/referral-agent-dashboard';
      case 'guest': return '/enhanced-guest-dashboard';
      default: return '/';
    }
  };

  const currencySymbols = {
    THB: '฿',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Left Section: Back Button + Title */}
      <div className="flex items-center gap-4">
        {showBackButton && (
          <div className="flex items-center gap-2">
            <Link href={getDefaultBackPath()}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {user && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getRoleDisplayName((user as any)?.role)} Dashboard
            </p>
          )}
        </div>
      </div>

      {/* Center Section: Role-based Actions */}
      <div className="flex-1 flex justify-center">
        {roleBasedActions}
      </div>

      {/* Right Section: User Menu */}
      <div className="flex items-center gap-3">
        {/* Currency Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <DollarSign className="h-4 w-4" />
              {currencySymbols[currency as keyof typeof currencySymbols]} {currency}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(currencySymbols).map(([code, symbol]) => (
              <DropdownMenuItem 
                key={code} 
                onClick={() => setCurrency(code)}
                className={currency === code ? "bg-gray-100 dark:bg-gray-700" : ""}
              >
                <span className="mr-2">{symbol}</span>
                {code} - {code === 'THB' ? 'Thai Baht' : 
                      code === 'USD' ? 'US Dollar' : 
                      code === 'EUR' ? 'Euro' : 'British Pound'}
                {code === 'THB' && <Badge variant="secondary" className="ml-2">Default</Badge>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={notificationsEnabled ? "text-blue-600" : "text-gray-400"}
        >
          {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" />
              <Badge className={`${getRoleColor((user as any)?.role)} text-white`}>
                {getRoleDisplayName((user as any)?.role)}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link href="/settings" className="w-full flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}