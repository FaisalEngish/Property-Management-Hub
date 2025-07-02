import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  BarChart3, 
  Settings,
  X,
  Menu
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "portfolio-manager", "owner", "staff", "retail-agent", "referral-agent"] },
  { path: "/properties", icon: Building, label: "Properties", roles: ["admin", "portfolio-manager", "owner"] },
  { path: "/tasks", icon: ListTodo, label: "ListTodo", roles: ["admin", "portfolio-manager", "owner", "staff"] },
  { path: "/bookings", icon: Calendar, label: "Bookings", roles: ["admin", "portfolio-manager", "owner", "retail-agent"] },
  { path: "/finances", icon: DollarSign, label: "Finances", roles: ["admin", "portfolio-manager", "owner"] },
  { path: "/inventory", icon: Package, label: "Inventory", roles: ["admin", "portfolio-manager", "owner", "staff"] },
  { path: "/reports", icon: BarChart3, label: "Reports", roles: ["admin", "portfolio-manager", "owner"] },
  { path: "/settings", icon: Settings, label: "Settings", roles: ["admin", "portfolio-manager", "owner"] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [currentRole, setCurrentRole] = useState("portfolio-manager");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(currentRole)
  );

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">HostPilotPro</h1>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 capitalize">{currentRole.replace('-', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-4 flex-1">
        <div className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Role Selector */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-3">
          <Label className="block text-xs font-medium text-gray-700 mb-2">View as:</Label>
          <Select value={currentRole} onValueChange={setCurrentRole}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="retail-agent">Retail Agent</SelectItem>
              <SelectItem value="referral-agent">Referral Agent</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/api/logout'}
        >
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 flex flex-col ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {sidebarContent}
      </aside>
    </>
  );
}
