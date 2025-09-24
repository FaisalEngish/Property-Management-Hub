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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Trophy,
  LayoutDashboard,
  Banknote,
  Cog,
  PieChart,
  UserCheck,
  Award
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

// Enhanced hub-based navigation with better organization
const getRoleBasedMenus = (role: string): MenuSection[] => {
  // All roles get the same simplified hub navigation with better grouping
  const commonMenus = [
    {
      title: "Analytics",
      items: [
        { label: "Dashboard Hub", icon: LayoutDashboard, href: "/dashboard-hub", description: "Access all dashboard views and analytics" },
        { label: "Reports", icon: PieChart, href: "/reports", description: "Comprehensive reporting and insights" },
      ]
    },
    {
      title: "Management", 
      items: [
        { label: "Property Hub", icon: Building2, href: "/property-hub", description: "Complete property management tools" },
        { label: "Finance Hub", icon: Banknote, href: "/finance-hub", description: "Financial management and analytics" },
        { label: "Staff Salaries", icon: Calculator, href: "/salaries-wages", description: "Manage staff salaries and wages" },
      ]
    },
    {
      title: "Settings",
      items: [
        { label: "System Hub", icon: Cog, href: "/system-hub", description: "System settings and administration" },
        { label: "Achievements", icon: Award, href: "/achievements", description: "Track your progress and unlock rewards" },
      ]
    }
  ];

  const roleSpecificMenus: Record<string, MenuSection[]> = {
    admin: commonMenus,
    "portfolio-manager": commonMenus,
    staff: [
      {
        title: "Analytics",
        items: [
          { label: "Dashboard Hub", icon: LayoutDashboard, href: "/dashboard-hub", description: "Access all dashboard views and analytics" },
        ]
      },
      {
        title: "Management",
        items: [
          { label: "Property Hub", icon: Building2, href: "/property-hub", description: "Complete property management tools" },
        ]
      },
      {
        title: "Settings",
        items: [
          { label: "Achievements", icon: Award, href: "/achievements", description: "Track your progress and unlock rewards" },
        ]
      }
    ],
    owner: [
      {
        title: "Analytics",
        items: [
          { label: "Dashboard Hub", icon: LayoutDashboard, href: "/dashboard-hub", description: "Access all dashboard views and analytics" },
        ]
      },
      {
        title: "Management",
        items: [
          { label: "Property Hub", icon: Building2, href: "/property-hub", description: "Complete property management tools" },
          { label: "Finance Hub", icon: Banknote, href: "/finance-hub", description: "Financial management and analytics" },
        ]
      },
      {
        title: "Settings",
        items: [
          { label: "Achievements", icon: Award, href: "/achievements", description: "Track your progress and unlock rewards" },
        ]
      }
    ],
    "retail-agent": [
      {
        title: "Agent Tools",
        items: [
          { label: "Quote Generator", icon: Calculator, href: "/agent/quote-generator", description: "Generate property quotes for clients" },
          { label: "Commissions", icon: Banknote, href: "/agent/commissions", description: "Track commission earnings" },
          { label: "Proposals", icon: FileText, href: "/agent/proposals", description: "Create and manage proposals" },
          { label: "Media Download", icon: Camera, href: "/agent/media-download", description: "Download property media files" },
          { label: "Leaderboard", icon: Award, href: "/agent/leaderboard", description: "View performance rankings" },
        ]
      }
    ],
    "referral-agent": [
      {
        title: "Agent Tools",
        items: [
          { label: "Quote Generator", icon: Calculator, href: "/agent/quote-generator", description: "Generate property quotes for clients" },
          { label: "Commissions", icon: Banknote, href: "/agent/commissions", description: "Track commission earnings" },
          { label: "Proposals", icon: FileText, href: "/agent/proposals", description: "Create and manage proposals" },
          { label: "Media Download", icon: Camera, href: "/agent/media-download", description: "Download property media files" },
          { label: "Leaderboard", icon: Award, href: "/agent/leaderboard", description: "View performance rankings" },
        ]
      }
    ],
    guest: [
      {
        title: "Guest Portal",
        items: [
          { label: "My Stay", icon: Home, href: "/", description: "Guest dashboard and booking information" },
          { label: "Property Info", icon: Building, href: "/property-info", description: "Property information and amenities" },
          { label: "Services", icon: Coffee, href: "/services", description: "Available services and requests" },
        ]
      }
    ]
  };

  // Default fallback menu for unrecognized roles
  const defaultMenus: MenuSection[] = [
    {
      title: "Dashboard",
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
    queryKey: ['notifications', 'unread'],
    queryFn: () => apiRequest('GET', '/api/notifications/unread'),
    refetchInterval: isAuthenticated ? 30000 : false, // Only refresh when authenticated
    enabled: isAuthenticated, // Only enabled when authenticated
  });

  const { data: allNotifications = [] } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => apiRequest('GET', '/api/notifications'),
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
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full max-h-screen transition-all duration-300",
        "bg-[var(--sidebar-bg)] bg-[image:var(--sidebar-gradient)] border-r border-[var(--sidebar-border)]",
        isCollapsed ? "w-16" : "w-72 xl:w-80"
      )}>
        {/* Fixed Header - Logo and Collapse Toggle */}
        <div className="sticky top-0 z-10 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] flex-shrink-0">
          {/* Brand/Logo Section */}
          <div className="p-3 h-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-foreground">HostPilotPro</span>
                  <span className="text-xs text-[var(--sidebar-muted)]">v2.0</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-muted/60 rounded-lg"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Navigation Menu */}
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {isCollapsed ? (
              // Collapsed view - icons only with tooltips
              <div className="space-y-2 py-2">
                {menuSections.flatMap(section => 
                  section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <Tooltip key={itemIndex} delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-10 h-9 p-0 mx-auto flex items-center justify-center transition-all duration-200 rounded-lg",
                              isActive 
                                ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[var(--sidebar-shadow)]" 
                                : "hover:bg-muted/60 hover:scale-105"
                            )}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setLocation(item.href);
                            }}
                            aria-label={item.label}
                            data-testid={`link-${item.href.replace('/', '').replace('/', '-') || 'home'}`}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <Icon className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )} strokeWidth={isActive ? 2.25 : 1.5} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                )}
              </div>
            ) : (
              // Expanded view - full menu with sections
              <div className="space-y-6 py-2">
                {menuSections.map((section, sectionIndex) => {
                  const hasActiveItem = section.items.some(item => location === item.href);
                  
                  return (
                    <div key={sectionIndex} className="space-y-3">
                      {/* Section Divider */}
                      {sectionIndex > 0 && <Separator className="my-2 opacity-50" />}
                      
                      {/* Section Header */}
                      <div className={cn(
                        "px-2 py-2 relative",
                        hasActiveItem && "border-l-2 border-primary/60 pl-3"
                      )}>
                        <div className={cn(
                          "text-xs uppercase tracking-wider font-medium transition-colors",
                          hasActiveItem ? "text-primary" : "text-[var(--sidebar-muted)]"
                        )}>
                          {section.title}
                        </div>
                      </div>
                      
                      {/* Section Items */}
                      <div className="space-y-1">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          const isActive = location === item.href;
                          
                          return (
                            <Button
                              key={itemIndex}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start h-9 px-2.5 transition-all duration-200 rounded-lg",
                                isActive 
                                  ? "bg-primary/10 text-foreground ring-1 ring-primary/20 shadow-[var(--sidebar-shadow)] font-semibold" 
                                  : "hover:bg-muted/60 hover:translate-x-1"
                              )}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setLocation(item.href);
                              }}
                              data-testid={`link-${item.href.replace('/', '').replace('/', '-') || 'home'}`}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <Icon className={cn(
                                "h-4 w-4 mr-3 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )} strokeWidth={isActive ? 2.25 : 1.5} />
                              <span className={cn(
                                "transition-colors text-sm",
                                isActive ? "font-semibold text-foreground" : "text-foreground"
                              )}>
                                {item.label}
                              </span>
                              {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* User Profile Section at Bottom */}
        <div className="sticky bottom-0 mt-auto p-3">
          {isCollapsed ? (
            // Collapsed user profile
            <div className="flex justify-center">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-10 h-10 p-0 rounded-lg hover:bg-muted/60 transition-colors"
                        aria-label="User menu"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(user as any)?.profileImageUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary border border-primary/20">
                            <RoleIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-64">
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={(user as any)?.profileImageUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <RoleIcon className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-sm truncate">
                              {(user as any)?.firstName} {(user as any)?.lastName || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {(user as any)?.email}
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs mt-2 font-medium", roleInfo.color)}
                        >
                          {roleInfo.name}
                        </Badge>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div className="font-medium">{(user as any)?.firstName} {(user as any)?.lastName || 'User'}</div>
                  <div className="text-xs text-muted-foreground">{roleInfo.name}</div>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            // Expanded user profile - Compact Card Design
            <div className="bg-[var(--sidebar-card)] border border-[var(--sidebar-border)] rounded-xl p-3 shadow-[var(--sidebar-shadow)] transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                  <AvatarImage src={(user as any)?.profileImageUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    <RoleIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">
                    {(user as any)?.firstName} {(user as any)?.lastName || 'User'}
                  </p>
                  <p className="text-xs text-[var(--sidebar-muted)] truncate">
                    {(user as any)?.email}
                  </p>
                </div>
                <NotificationBell />
              </div>
              
              {/* Role Badge */}
              <div className="mb-3">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs font-medium px-2 py-1", roleInfo.color)}
                >
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {roleInfo.name}
                </Badge>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSettingsOpen(true)}
                  className="flex-1 h-8 text-xs hover:bg-muted/60 border-[var(--sidebar-border)]"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 border-[var(--sidebar-border)]"
                  aria-label="Logout"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );

  // Mobile Sheet
  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex",
        isCollapsed ? "w-16" : "w-80",
        className
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 border-r">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
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