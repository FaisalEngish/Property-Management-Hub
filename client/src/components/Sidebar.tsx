import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Calculator,
  Droplets,
  Target,
  Filter
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
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

// Memoized role-based menu generation for performance
const getRoleBasedMenus = (role: string): MenuSection[] => {
  const roleSpecificMenus: Record<string, MenuSection[]> = {
    admin: [
      {
        title: "📊 Dashboards",
        items: [
          { label: "Admin Dashboard", icon: Home, href: "/", description: "Comprehensive admin overview and insights" },
          { label: "Financial Dashboard", icon: DollarSign, href: "/filtered-financial-dashboard", badge: "New" },
          { label: "Property Dashboard", icon: Building, href: "/filtered-property-dashboard", badge: "New" },
        ]
      },
      {
        title: "🏘️ Property Management",
        items: [
          { label: "Properties", icon: Building, href: "/properties", description: "Manage all properties" },
          { label: "Unified Calendar & Bookings", icon: Calendar, href: "/bookings", description: "All booking views and calendar management" },
          { label: "Tasks", icon: CheckSquare, href: "/tasks", description: "Track and assign tasks" },
          { label: "Property Appliances", icon: Wrench, href: "/property-appliances-management", description: "Manage property appliances and repairs", badge: "New" },
          { label: "Check-in/Check-out Workflow", icon: CheckCircle, href: "/checkin-checkout-workflow" },
          { label: "Daily Operations", icon: Clock, href: "/daily-operations", badge: "New" },
        ]
      },
      {
        title: "🧹 Operations",
        items: [
          { label: "Auto-Scheduling Rules", icon: Clock, href: "/auto-scheduling-recurring-task-generator" },
          { label: "Maintenance Log & Warranty", icon: Wrench, href: "/maintenance-log-warranty-tracker" },
          { label: "Staff Profile & Payroll", icon: Users, href: "/staff-profile-payroll" },
          { label: "Staff Advance & Overtime", icon: Clock, href: "/staff-advance-salary-overtime-tracker" },
          { label: "Maintenance Suggestions", icon: Wrench, href: "/maintenance-suggestions" },
        ]
      },
      {
        title: "💬 Guest Services",
        items: [
          { label: "Guest Portal Smart Requests", icon: MessageSquare, href: "/guest-portal-smart-requests", badge: "AI" },
          { label: "Guest Activity Recommendations", icon: Star, href: "/guest-activity-recommendations", badge: "AI" },
          { label: "Loyalty Guest Tracker", icon: Users, href: "/loyalty-tracker", badge: "New" },
        ]
      },
      {
        title: "💰 Finance & Revenue",
        items: [
          { label: "Enhanced Financial Controls", icon: Shield, href: "/enhanced-financial-controls" },
          { label: "OTA Revenue & Net Payout", icon: BarChart3, href: "/ota-revenue-net-payout-calculation", badge: "New" },
          { label: "OTA Payout Logic — Smart Revenue", icon: Calculator, href: "/ota-payout-logic-smart-revenue", badge: "NEW" },
          { label: "Smart Pricing & Performance", icon: Brain, href: "/smart-pricing-performance-toolkit", badge: "AI" },
          { label: "Invoices", icon: FileText, href: "/invoice-generator" },
          { label: "Booking Income", icon: BarChart3, href: "/booking-income-rules" },
          { label: "Finance Engine", icon: Database, href: "/finance-engine" },
          { label: "Utility Tracker", icon: Car, href: "/utility-tracker" },
        ]
      },
      {
        title: "⚙️ System & Admin",
        items: [
          { label: "Automation Management", icon: Settings, href: "/automation-management", description: "Commission & utility automation controls", badge: "Live" },
          { label: "Currency & Tax Management", icon: DollarSign, href: "/currency-tax-management", description: "Multi-currency rates and international tax compliance", badge: "Global" },
          { label: "API Connections", icon: Key, href: "/admin/api-connections", description: "Configure Hostaway, Stripe, and OpenAI integrations", badge: "SaaS" },
          { label: "SaaS Management", icon: Building2, href: "/admin/saas-management", description: "Manage signup requests and client organizations", badge: "Framework" },
          { label: "User Management", icon: Users, href: "/admin/user-management", description: "Manage users & permissions" },
          { label: "Staff Permissions", icon: Shield, href: "/admin/staff-permission-management", description: "Manage staff task creation permissions" },
          { label: "Staff Expense Management", icon: Receipt, href: "/staff-expense-management", description: "Review staff expenses", badge: "New" },
          { label: "System Integrity Check", icon: Shield, href: "/admin/system-integrity-check", badge: "QA" },
          { label: "System-Wide Demo Integration", icon: Database, href: "/system-wide-demo-integration", badge: "Demo" },
          { label: "Activity Logs", icon: Activity, href: "/admin/activity-log" },
          { label: "Finance Reset", icon: Shield, href: "/admin/finance-reset" },
          { label: "AI Notifications & Reminders", icon: Brain, href: "/ai-notifications-reminders", badge: "New" },
          { label: "AI Feature Dashboard", icon: Brain, href: "/ai-features", badge: "AI" },
          { label: "Owner Targets & Upgrades", icon: Target, href: "/owner-target-upgrade-tracker", badge: "New" },
          { label: "Sandbox Testing", icon: Activity, href: "/sandbox-testing", badge: "QA" },
          { label: "System Settings", icon: Settings, href: "/settings" },
        ]
      }
    ],
    "portfolio-manager": [
      {
        title: "📊 Dashboards",
        items: [
          { label: "Portfolio Manager Dashboard", icon: Home, href: "/", description: "Property portfolio overview" },
          { label: "Financial Dashboard", icon: DollarSign, href: "/filtered-financial-dashboard", badge: "New" },
          { label: "Property Dashboard", icon: Building, href: "/filtered-property-dashboard", badge: "New" },
        ]
      },
      {
        title: "🏘️ Property Management",
        items: [
          { label: "Properties", icon: Building, href: "/properties", description: "Manage portfolio properties" },
          { label: "Unified Calendar & Bookings", icon: Calendar, href: "/bookings", description: "All booking views and calendar management" },
          { label: "Tasks", icon: CheckSquare, href: "/tasks", description: "Track and assign tasks" },
          { label: "Property Appliances", icon: Wrench, href: "/property-appliances-management", description: "Manage property appliances and repairs", badge: "New" },
          { label: "Check-in/Check-out Workflow", icon: CheckCircle, href: "/checkin-checkout-workflow" },
          { label: "Daily Operations", icon: Clock, href: "/daily-operations", badge: "New" },
        ]
      },
      {
        title: "🧹 Operations",
        items: [
          { label: "Auto-Scheduling Rules", icon: Clock, href: "/auto-scheduling-recurring-task-generator" },
          { label: "Maintenance Log & Warranty", icon: Wrench, href: "/maintenance-log-warranty-tracker" },
          { label: "Staff Profile & Payroll", icon: Users, href: "/staff-profile-payroll" },
          { label: "Staff Advance & Overtime", icon: Clock, href: "/staff-advance-salary-overtime-tracker" },
          { label: "Staff Expense Management", icon: Receipt, href: "/staff-expense-management", description: "Review staff expenses", badge: "New" },
        ]
      },
      {
        title: "💬 Guest Services",
        items: [
          { label: "Guest Portal Smart Requests", icon: MessageSquare, href: "/guest-portal-smart-requests", badge: "AI" },
          { label: "Guest Activity Recommendations", icon: Star, href: "/guest-activity-recommendations", badge: "AI" },
          { label: "Loyalty Guest Tracker", icon: Users, href: "/loyalty-tracker", badge: "New" },
        ]
      },
      {
        title: "💰 Finance & Revenue",
        items: [
          { label: "OTA Revenue & Net Payout", icon: BarChart3, href: "/ota-revenue-net-payout-calculation", badge: "New" },
          { label: "OTA Payout Logic — Smart Revenue", icon: Calculator, href: "/ota-payout-logic-smart-revenue", badge: "NEW" },
          { label: "Smart Pricing & Performance", icon: Brain, href: "/smart-pricing-performance-toolkit", badge: "AI" },
          { label: "Invoices", icon: FileText, href: "/invoice-generator" },
          { label: "Booking Income", icon: BarChart3, href: "/booking-income-rules" },
          { label: "Finance Engine", icon: Database, href: "/finance-engine" },
          { label: "Utility Tracker", icon: Car, href: "/utility-tracker" },
        ]
      }
    ],
    staff: [
      {
        title: "📊 Daily Tasks",
        items: [
          { label: "Staff Dashboard", icon: Home, href: "/", description: "Daily task overview" },
          { label: "My Tasks", icon: CheckSquare, href: "/tasks", description: "Assigned tasks" },
          { label: "Daily Operations", icon: Clock, href: "/daily-operations", badge: "New" },
        ]
      },
      {
        title: "🏘️ Property Operations",
        items: [
          { label: "Check-in/Check-out", icon: CheckCircle, href: "/checkin-checkout-workflow" },
          { label: "Maintenance Requests", icon: Wrench, href: "/maintenance-log-warranty-tracker" },
          { label: "Property Appliances", icon: Wrench, href: "/property-appliances-management", description: "Report appliance issues", badge: "New" },
          { label: "Guest Services", icon: MessageSquare, href: "/guest-portal-smart-requests" },
        ]
      },
      {
        title: "💰 My Salary & Wallet",
        items: [
          { label: "My Salary & Overtime", icon: Clock, href: "/staff-advance-salary-overtime-tracker", description: "Track my hours and overtime" },
          { label: "My Wallet & Petty Cash", icon: Calculator, href: "/staff-wallet-petty-cash", description: "Manage petty cash and expenses", badge: "Cash" },
          { label: "Cash Collection Tracker", icon: DollarSign, href: "/staff-cash-collection", description: "Track cash from check-outs", badge: "New" },
        ]
      }
    ],
    owner: [
      {
        title: "📊 My Properties",
        items: [
          { label: "Owner Dashboard", icon: Home, href: "/", description: "Property overview" },
          { label: "My Properties", icon: Building, href: "/properties", description: "View my properties" },
          { label: "Financial Reports", icon: DollarSign, href: "/filtered-financial-dashboard" },
        ]
      },
      {
        title: "💰 Finances",
        items: [
          { label: "Booking Income", icon: BarChart3, href: "/booking-income-rules" },
          { label: "Invoices", icon: FileText, href: "/invoice-generator" },
        ]
      }
    ],
    guest: [
      {
        title: "Guest Services",
        items: [
          { label: "My Stay", icon: Home, href: "/", description: "Guest dashboard" },
          { label: "Property Info", icon: Building, href: "/property-info" },
          { label: "Services", icon: Coffee, href: "/services" },
        ]
      }
    ],
    "retail-agent": [
      {
        title: "📊 Booking Dashboard",
        items: [
          { label: "Booking Engine", icon: Calendar, href: "/retail-agent", description: "Create bookings and track commissions" },
          { label: "My Reservations", icon: BookOpen, href: "/retail-agent?tab=my-bookings", description: "View all my created reservations" },
        ]
      },
      {
        title: "🔧 Agent Tools",
        items: [
          { label: "Quote Generator", icon: Calculator, href: "/agent/quote-generator", description: "Generate property quotes for clients" },
          { label: "Commission Tracker", icon: DollarSign, href: "/agent/commissions", description: "Track commission earnings" },
          { label: "Proposals", icon: FileText, href: "/agent/proposals", description: "Manage client proposals" },
          { label: "Media Download", icon: Camera, href: "/agent/media-download", description: "Download property photos and videos" },
          { label: "Leaderboard", icon: Star, href: "/agent/leaderboard", description: "View agent performance rankings" },
        ]
      }
    ],
    "referral-agent": [
      {
        title: "🏠 Property Management Services",
        items: [
          { label: "Service Overview", icon: FileText, href: "/referral-agent", description: "Our management services and downloadable PDF" },
          { label: "Property Browse", icon: Building, href: "/referral-agent?tab=properties", description: "Browse available properties" },
        ]
      },
      {
        title: "📊 My Referrals",
        items: [
          { label: "Referred Properties", icon: UserPlus, href: "/referral-agent?tab=referred", description: "Track your referred properties" },
          { label: "Financial Updates", icon: DollarSign, href: "/referral-agent?tab=finances", description: "10% commission tracking" },
          { label: "Performance Reports", icon: BarChart3, href: "/referral-agent?tab=finances", description: "Occupancy, bookings, reviews" },
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

export default function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
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
  
  const { user, isAuthenticated } = useAuth();
  const userRole = (user as any)?.role || "guest";

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
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/demo-logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
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

  // Memoize menu sections to prevent recreation on every render
  const menuSections = useMemo(() => getRoleBasedMenus(userRole), [userRole]);
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
                className={cn("text-xs", roleColors[userRole as keyof typeof roleColors])}
              >
                {userRole.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
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
                            setIsOpen(false);
                            // Direct navigation for referral agent tabs
                            if (item.href.includes('/referral-agent')) {
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

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
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

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b p-4 pl-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={(user as any)?.profileImageUrl} />
              <AvatarFallback>
                <RoleIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", roleColors[userRole as keyof typeof roleColors])}
            >
              {userRole.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
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