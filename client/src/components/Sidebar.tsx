import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { InstantHubLink, PreloadHubData } from "@/components/InstantHubNavigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  X,
  ArrowLeft,
  LogOut,
  Settings,
  User,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Activity,
  Database,
  TrendingUp,
  Home,
  Building,
  Building2,
  CheckSquare,
  Calendar,
  DollarSign,
  FileText,
  Wrench,
  Users,
  MessageSquare,
  Clock,
  BarChart3,
  Package,
  UserPlus,
  Camera,
  BookOpen,
  Star,
  Car,
  Coffee,
  FolderOpen,
  Receipt,
  Key,
  Luggage,
  CheckCircle,
  Phone,
  Eye,
  Brain,
  Bot,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Calculator,
  Droplets,
  Target,
  Filter,
  Palette,
  Trophy
} from "lucide-react";
import { useFastAuth } from "@/lib/fastAuth";
import { filterMenuForRole, getRoleDisplayInfo, UserRole } from "@/utils/roleBasedMenu";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  description?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Simplified hub-based navigation for all roles
const getRoleBasedMenus = (role: string): MenuSection[] => {
  // All roles get the same simplified hub navigation
  const commonMenus = [
    {
      title: "Main Navigation",
      items: [
        { label: "Dashboard", icon: BarChart3, href: "/dashboard-hub", description: "Access all dashboard views and analytics" },
        { label: "Property", icon: Building2, href: "/property-hub", description: "Complete property management tools" },
        { label: "Finance", icon: DollarSign, href: "/finance-hub", description: "Financial management and analytics" },
        { label: "System", icon: Settings, href: "/system-hub", description: "System settings and administration" },
        { label: "Staff Salaries", icon: Calculator, href: "/salaries-wages", description: "Manage staff salaries and wages" },
        { label: "Achievements", icon: Trophy, href: "/achievements", description: "Track your progress and unlock rewards" },
      ]
    }
  ];

  const roleSpecificMenus: Record<string, MenuSection[]> = {
    admin: commonMenus,
    "portfolio-manager": commonMenus,
    staff: [
      {
        title: "Main Navigation",
        items: [
          { label: "Dashboard", icon: BarChart3, href: "/dashboard-hub", description: "Access all dashboard views and analytics" },
          { label: "Property", icon: Building2, href: "/property-hub", description: "Complete property management tools" },
          { label: "Achievements", icon: Trophy, href: "/achievements", description: "Track your progress and unlock rewards" },
        ]
      }
    ],
    owner: [
      {
        title: "Main Navigation", 
        items: [
          { label: "Dashboard", icon: BarChart3, href: "/dashboard-hub", description: "Access all dashboard views and analytics" },
          { label: "Property", icon: Building2, href: "/property-hub", description: "Complete property management tools" },
          { label: "Finance", icon: DollarSign, href: "/finance-hub", description: "Financial management and analytics" },
          { label: "Achievements", icon: Trophy, href: "/achievements", description: "Track your progress and unlock rewards" },
        ]
      }
    ],
    "retail-agent": [
      {
        title: "Agent Tools",
        items: [
          { label: "Quote Generator", icon: Calculator, href: "/agent/quote-generator", description: "Generate property quotes for clients" },
          { label: "Commissions", icon: DollarSign, href: "/agent/commissions", description: "Track commission earnings" },
          { label: "Proposals", icon: FileText, href: "/agent/proposals", description: "Create and manage proposals" },
          { label: "Media Download", icon: Camera, href: "/agent/media-download", description: "Download property media files" },
          { label: "Leaderboard", icon: Star, href: "/agent/leaderboard", description: "View performance rankings" },
        ]
      }
    ],
    "referral-agent": [
      {
        title: "Agent Tools",
        items: [
          { label: "Quote Generator", icon: Calculator, href: "/agent/quote-generator", description: "Generate property quotes for clients" },
          { label: "Commissions", icon: DollarSign, href: "/agent/commissions", description: "Track commission earnings" },
          { label: "Proposals", icon: FileText, href: "/agent/proposals", description: "Create and manage proposals" },
          { label: "Media Download", icon: Camera, href: "/agent/media-download", description: "Download property media files" },
          { label: "Leaderboard", icon: Star, href: "/agent/leaderboard", description: "View performance rankings" },
        ]
      }
    ],
    guest: [
      {
        title: "Guest Portal",
        items: [
          { label: "My Stay", icon: Home, href: "/", description: "Guest dashboard and booking information" },
          { label: "Property Info", icon: Building, href: "/property-info" },
          { label: "Services", icon: Coffee, href: "/services" },
        ]
      }
    ]
  };

  // Default fallback menu for unrecognized roles
  const defaultMenus: MenuSection[] = [
    {
      title: "📊 Dashboard",
      items: [
        { label: "Dashboard", icon: Home, href: "/", description: "Main dashboard" },
        { label: "Properties", icon: Building, href: "/properties" },
      ]
    }
  ];

  return roleSpecificMenus[role] || defaultMenus;
};

const roleIcons = {
  admin: Shield,
  "portfolio-manager": Building,
  owner: Key,
  staff: Users,
  "retail-agent": Package,
  "referral-agent": UserPlus,
  guest: User,
  freelancer: Wrench
};

const roleColors = {
  admin: "text-red-500 bg-red-50",
  "portfolio-manager": "text-blue-500 bg-blue-50",
  owner: "text-green-500 bg-green-50",
  staff: "text-purple-500 bg-purple-50",
  "retail-agent": "text-orange-500 bg-orange-50",
  "referral-agent": "text-yellow-500 bg-yellow-50",
  guest: "text-gray-500 bg-gray-50",
  freelancer: "text-teal-500 bg-teal-50"
};

// Notification Bell Component
function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const { data: unreadNotifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications/unread'],
    queryFn: () => apiRequest('/api/notifications/unread'),
    refetchInterval: isAuthenticated ? 30000 : false, // Only refresh when authenticated
    enabled: isAuthenticated, // Only enabled when authenticated
  });

  const { data: allNotifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => apiRequest('/api/notifications'),
    enabled: isAuthenticated, // Only enabled when authenticated
  });

  const unreadCount = Array.isArray(unreadNotifications) ? unreadNotifications.length : 0;

  const handleOpenChange = (open: boolean) => {
    console.log("Notification dropdown state change:", open);
    setIsOpen(open);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Bell className="h-4 w-4 text-muted-foreground animate-pulse" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 relative focus:outline-none" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Notification bell clicked");
            setIsOpen(!isOpen);
          }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500 text-white pointer-events-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 z-50" 
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={() => setIsOpen(false)}
        onPointerDownOutside={() => setIsOpen(false)}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {allNotifications.slice(0, 5).map((notification: any, index: number) => (
              <DropdownMenuItem 
                key={notification.id || index} 
                className="flex flex-col items-start p-3 cursor-pointer"
                onSelect={() => {
                  console.log("Notification selected:", notification.title);
                  // Don't close the dropdown immediately to prevent flickering
                }}
              >
                <div className="font-medium text-sm">
                  {notification.title || 'New notification'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {notification.message || notification.content || 'No message'}
                </div>
                {notification.createdAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
        {allNotifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-sm text-primary cursor-pointer"
              onSelect={() => {
                console.log("View all notifications clicked");
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Sidebar({ className, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use mobile menu state from parent if provided, otherwise use local state
  const mobileMenuOpen = isMobileMenuOpen !== undefined ? isMobileMenuOpen : isOpen;
  const setMobileMenuOpen = setIsMobileMenuOpen !== undefined ? setIsMobileMenuOpen : setIsOpen;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    "📊 Dashboards": false,
    "🏘️ Property Management": false,
    "🧹 Operations": false,
    "💬 Guest Services": false,
    "💰 Finance & Revenue": false,
    "⚙️ System & Admin": false,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    tasks: true,
    bookings: true,
    payments: true,
    maintenance: false,
  });
  
  const { user, isAuthenticated, logout } = useFastAuth();
  
  // Debug user data to identify role issue
  useEffect(() => {
    if (user) {
      console.log("Sidebar user data:", user);
      console.log("User role detected:", user.role);
    }
  }, [user]);
  
  const userRole = (user?.role || "guest") as UserRole;
  const roleInfo = getRoleDisplayInfo(userRole);

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Handle mobile menu close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location, setMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Force page reload as fallback
      window.location.href = "/";
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  // Memoize menu sections with role-based filtering
  const menuSections = useMemo(() => {
    const baseMenu = getRoleBasedMenus(userRole);
    return filterMenuForRole(baseMenu, userRole);
  }, [userRole]);
  const RoleIcon = useMemo(() => roleIcons[userRole as keyof typeof roleIcons] || User, [userRole]);

  if (!isAuthenticated) {
    return null;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full max-h-screen bg-background">
      {/* Fixed Header - Logo, User Info, and Controls */}
      <div className="sticky top-0 z-10 bg-background border-b flex-shrink-0">
        {/* Brand/Logo Section */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">HostPilotPro</span>
                <span className="text-xs text-muted-foreground">v2.0</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Info Section */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={(user as any)?.profileImageUrl} />
              <AvatarFallback>
                <RoleIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {(user as any)?.email || "User"}
              </p>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", roleInfo.color)}
              >
                {roleInfo.name}
              </Badge>
            </div>
            <NotificationBell />
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                console.log("Settings button clicked");
                setSettingsOpen(true);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Menu with Full Scroll Support */}
      <div className="flex-1 overflow-hidden">
        <div className="px-3 py-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Navigation</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const allCollapsed = Object.values(collapsedSections).every(Boolean);
                const newState = menuSections.reduce((acc, section) => {
                  acc[section.title] = !allCollapsed;
                  return acc;
                }, {} as Record<string, boolean>);
                setCollapsedSections(newState);
              }}
              className="h-6 w-6 p-0"
            >
              {Object.values(collapsedSections).every(Boolean) ? (
                <PanelLeftOpen className="h-3 w-3" />
              ) : (
                <PanelLeftClose className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <ScrollArea className="h-full px-2">
          <div className="py-2 space-y-1">
            {menuSections.map((section, sectionIndex) => {
              const hasActiveItem = section.items.some(item => location === item.href);
              const isCollapsed = collapsedSections[section.title];
              
              return (
                <Collapsible
                  key={sectionIndex}
                  open={!isCollapsed}
                  onOpenChange={() => toggleSection(section.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left h-auto py-3 px-3 hover:bg-muted/50 transition-all duration-200",
                        hasActiveItem && !isCollapsed && "bg-muted/30 border-l-2 border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "text-sm font-medium transition-colors",
                            hasActiveItem ? "text-primary" : "text-foreground"
                          )}>
                            {section.title}
                          </h3>
                          {hasActiveItem && (
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {section.items.length > 0 && (
                            <Badge variant="outline" className="text-xs h-5 px-1.5">
                              {section.items.length}
                            </Badge>
                          )}
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                          )}
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-3 pr-2 pb-2">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      // Better active state detection for URLs with parameters
                      const isActive = (() => {
                        const currentPath = location.split('?')[0];
                        const itemPath = item.href.split('?')[0];
                        
                        // For exact match (no parameters)
                        if (location === item.href) return true;
                        
                        // For parameter-based URLs, check if base path matches and parameters are correct
                        if (currentPath === itemPath && item.href.includes('?')) {
                          const currentParams = new URLSearchParams(location.split('?')[1] || '');
                          const itemParams = new URLSearchParams(item.href.split('?')[1] || '');
                          const itemTab = itemParams.get('tab');
                          const currentTab = currentParams.get('tab');
                          return itemTab === currentTab;
                        }
                        
                        // Default case - check base path for default tab
                        if (currentPath === itemPath && !item.href.includes('?') && !location.includes('?')) {
                          return true;
                        }
                        
                        return false;
                      })();
                      return (
                        <div 
                          key={itemIndex}
                          onClick={() => {
                            console.log('Sidebar link clicked:', item.href);
                            setMobileMenuOpen(false);
                            // For hub pages, use instant navigation, for others use regular navigation
                            if (item.href.includes('-hub')) {
                              // Use wouter navigation for instant loading
                              window.history.pushState({}, '', item.href);
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            } else if (item.href.includes('/referral-agent')) {
                              const urlParams = new URLSearchParams(item.href.split('?')[1] || '');
                              const tab = urlParams.get('tab') || 'services';
                              console.log('Setting tab to:', tab);
                              // Dispatch custom event to trigger tab change
                              window.dispatchEvent(new CustomEvent('changeReferralTab', { detail: { tab } }));
                            } else {
                              // Normal navigation for other links
                              window.location.href = item.href;
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start text-left h-auto py-2 px-3 hover:bg-muted/80 transition-all duration-200 relative group",
                              isActive && "bg-primary/15 text-primary border-l-2 border-primary hover:bg-primary/20 shadow-sm"
                            )}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
                            )}
                            <Icon className={cn(
                              "h-4 w-4 mr-3 flex-shrink-0 transition-colors",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-sm truncate transition-colors",
                                  isActive ? "font-medium" : "group-hover:text-foreground"
                                )}>
                                  {item.label}
                                </span>
                                <div className="flex items-center gap-1 ml-2">
                                  {item.badge && (
                                    <Badge 
                                      variant={item.badge === "NEW" || item.badge === "Enhanced" ? "destructive" : "secondary"}
                                      className="text-xs h-4 px-1.5"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                  {isActive && (
                                    <ChevronRight className="h-3 w-3 text-primary" />
                                  )}
                                </div>
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate group-hover:text-muted-foreground/80">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </Button>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-background border-t flex-shrink-0">
        <div className="p-3">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
            <p>© 2025 Property Management</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 bg-background border-r", className)} style={{ maxHeight: '100vh', overflow: 'hidden' }}>
        <SidebarContent />
      </div>

      {/* Mobile Menu - Only show mobile sheet when controlled by TopBar */}
      <div className="lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[90vw] sm:w-80 md:w-96 p-0 flex flex-col overflow-y-auto" style={{ maxHeight: '100vh' }}>
            <SheetHeader className="p-4 border-b flex-shrink-0">
              <SheetTitle className="flex items-center gap-2">
                <RoleIcon className="h-5 w-5" />
                Navigation
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Menu Trigger - Only show when not using external mobile menu control */}
      {isMobileMenuOpen === undefined && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="bg-background shadow-md"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Customize your preferences and application settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Notification Preferences */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h4>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm capitalize">{key}</label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Theme */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Theme
              </h4>
              <div className="flex items-center justify-between">
                <label className="text-sm">Dark Mode</label>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </div>

            <Separator />

            {/* Language */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </h4>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="th">ไทย</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}