import { useState, memo, useCallback } from "react";
import { useFastAuth } from "@/lib/fastAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Crown, 
  Building, 
  Users, 
  ShoppingCart, 
  UserCheck 
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Memoized role icon component
const RoleIcon = memo(({ role }: { role: string }) => {
  switch (role) {
    case 'admin': return <Shield className="w-1.5 h-1.5 text-white" />;
    case 'portfolio-manager': return <Crown className="w-1.5 h-1.5 text-white" />;
    case 'owner': return <Building className="w-1.5 h-1.5 text-white" />;
    case 'staff': return <Users className="w-1.5 h-1.5 text-white" />;
    case 'retail-agent': return <ShoppingCart className="w-1.5 h-1.5 text-white" />;
    case 'referral-agent': return <UserCheck className="w-1.5 h-1.5 text-white" />;
    default: return <User className="w-1.5 h-1.5 text-white" />;
  }
});

// Memoized user display component
const UserDisplay = memo(({ user }: { user: any }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'portfolio-manager': return 'bg-blue-500';
      case 'owner': return 'bg-green-500';
      case 'staff': return 'bg-purple-500';
      case 'retail-agent': return 'bg-orange-500';
      case 'referral-agent': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const roleColor = getRoleColor(user?.role);

  return (
    <div className="flex items-center gap-3">
      <div className="hidden lg:flex flex-col items-end">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {user?.firstName || "Demo"} {user?.lastName || "User"}
        </div>
        <Badge variant="secondary" className="text-xs">
          {user?.role === "admin" ? "Admin" :
           user?.role === "portfolio-manager" ? "Manager" :
           user?.role === "owner" ? "Owner" :
           user?.role === "staff" ? "Staff" :
           user?.role === "retail-agent" ? "Retail" :
           user?.role === "referral-agent" ? "Referral" :
           user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
        </Badge>
      </div>
      
      <div className="relative">
        <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
          <AvatarImage src={user?.profileImageUrl} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
            {(user?.firstName || "U").charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${roleColor} rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900`}>
          <RoleIcon role={user?.role} />
        </div>
      </div>
    </div>
  );
});

export default memo(function OptimizedTopBar() {
  const { user } = useFastAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      window.location.href = "/login";
    },
  });

  // Optimized navigation handlers
  const handleProfileClick = useCallback(() => {
    setIsDropdownOpen(false);
    window.location.href = "/profile";
  }, []);

  const handleSettingsClick = useCallback(() => {
    setIsDropdownOpen(false);
    try {
      window.location.href = "/settings";
    } catch (error) {
      console.error("Settings navigation error:", error);
      window.location.href = "/simple-settings";
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsDropdownOpen(false);
    logoutMutation.mutate();
  }, [logoutMutation]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            HostPilotPro
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <UserDisplay user={user} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleProfileClick}
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleSettingsClick}
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
});