import { useState, useEffect } from "react";
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
  Key,
  Luggage,
  CheckCircle
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

const getRoleBasedMenus = (role: string): MenuSection[] => {
  const commonMenus: MenuSection[] = [
    {
      title: "Navigation",
      items: [
        { label: "Dashboard", icon: Home, href: "/", description: "Main dashboard overview" },
      ]
    }
  ];

  const roleSpecificMenus: Record<string, MenuSection[]> = {
    admin: [
      {
        title: "Core Management",
        items: [
          { label: "Daily Operations", icon: Calendar, href: "/daily-operations" },
          { label: "Properties", icon: Building, href: "/properties" },
          { label: "Tasks", icon: CheckSquare, href: "/tasks" },
          { label: "Bookings", icon: Calendar, href: "/bookings" },
          { label: "Finances", icon: DollarSign, href: "/finances" },
        ]
      },
      {
        title: "Property Management",
        items: [
          { label: "Check-in/Check-out", icon: LogOut, href: "/checkin-checkout-workflow" },
          { label: "Guest Check-In Tracker", icon: Luggage, href: "/guest-checkin-checkout-tracker", badge: "New" },
          { label: "Owner Onboarding", icon: UserPlus, href: "/owner-onboarding-system", badge: "New" },
          { label: "Maintenance System", icon: Wrench, href: "/maintenance-task-system" },
          { label: "Auto-Scheduling Rules", icon: Clock, href: "/auto-scheduling-recurring-task-generator", badge: "New" },
          { label: "Maintenance Log & Warranty", icon: Wrench, href: "/maintenance-log-warranty-tracker", badge: "New" },
          { label: "Maintenance & Service Tracking", icon: Activity, href: "/maintenance-service-tracking", badge: "New" },
          { label: "Utilities & Maintenance", icon: Settings, href: "/maintenance-utilities-renovation-tracker" },
          { label: "Task Attachments", icon: FileText, href: "/task-attachments-notes" },
          { label: "Document Center", icon: FolderOpen, href: "/document-center" },
          { label: "Property Access", icon: Key, href: "/property-access" },
          { label: "AI Task Manager", icon: Activity, href: "/ai-task-manager" },
          { label: "Welcome Packs", icon: Package, href: "/welcome-packs" },
          { label: "Smart Inventory", icon: Package, href: "/smart-inventory-dashboard", badge: "New" },
          { label: "Service Marketplace", icon: Star, href: "/service-marketplace-dashboard", badge: "New" },
        ]
      },
      {
        title: "Guest Services",
        items: [
          { label: "Guest Communication", icon: MessageSquare, href: "/guest-communication-center" },
          { label: "Service Request Confirmation", icon: CheckCircle, href: "/service-request-confirmation", badge: "New" },
          { label: "Add-on Services", icon: Coffee, href: "/addon-services-booking" },
          { label: "Agent Media Library", icon: Camera, href: "/agent-media-library" },
          { label: "Loyalty Tracker", icon: Star, href: "/loyalty-tracker" },
        ]
      },
      {
        title: "Financial",
        items: [
          { label: "Enhanced Financial Controls", icon: Shield, href: "/enhanced-financial-controls" },
          { label: "Financial Toolkit", icon: DollarSign, href: "/financial-toolkit" },
          { label: "Invoice Generator", icon: FileText, href: "/invoice-generator" },
          { label: "Booking Income Rules", icon: BarChart3, href: "/booking-income-rules" },
          { label: "Finance Engine", icon: Database, href: "/finance-engine" },
          { label: "Utility Tracker", icon: Car, href: "/utility-tracker" },
          { label: "Payouts", icon: DollarSign, href: "/payouts" },
        ]
      },
      {
        title: "Administration",
        items: [
          { label: "Activity Logs", icon: Activity, href: "/admin/activity-log" },
          { label: "Finance Reset", icon: Shield, href: "/admin/finance-reset" },
          { label: "System Settings", icon: Settings, href: "/settings" },
          { label: "Utility Settings", icon: Settings, href: "/admin/utility-customization" },
        ]
      }
    ],
    "portfolio-manager": [
      {
        title: "Portfolio Management",
        items: [
          { label: "My Properties", icon: Building, href: "/properties" },
          { label: "Check-in/Check-out", icon: LogOut, href: "/checkin-checkout-workflow" },
          { label: "Tasks Overview", icon: CheckSquare, href: "/tasks" },
          { label: "Auto-Scheduling Rules", icon: Clock, href: "/auto-scheduling-recurring-task-generator", badge: "New" },
          { label: "Maintenance Log & Warranty", icon: Wrench, href: "/maintenance-log-warranty-tracker", badge: "New" },
          { label: "Maintenance & Service Tracking", icon: Activity, href: "/maintenance-service-tracking", badge: "New" },
          { label: "Bookings", icon: Calendar, href: "/bookings" },
          { label: "Maintenance", icon: Wrench, href: "/maintenance-task-system" },
          { label: "Document Center", icon: FolderOpen, href: "/document-center" },
          { label: "Property Access", icon: Key, href: "/property-access" },
          { label: "Owner Onboarding", icon: UserPlus, href: "/owner-onboarding-system", badge: "New" },
          { label: "Owner Onboarding & Utility Settings", icon: Settings, href: "/owner-onboarding-utility-settings", badge: "New" },
        ]
      },
      {
        title: "Financial",
        items: [
          { label: "Enhanced Financial Controls", icon: Shield, href: "/enhanced-financial-controls" },
          { label: "Invoices", icon: FileText, href: "/invoice-generator" },
          { label: "Booking Income", icon: BarChart3, href: "/booking-income-rules" },
          { label: "Finance Engine", icon: Database, href: "/finance-engine" },
          { label: "Payouts", icon: DollarSign, href: "/payouts" },
        ]
      },
      {
        title: "Operations",
        items: [
          { label: "Staff Management", icon: Users, href: "/staff-tasks" },
          { label: "Guest Services", icon: MessageSquare, href: "/guest-communication-center" },
          { label: "Service Request Confirmation", icon: CheckCircle, href: "/service-request-confirmation", badge: "New" },
          { label: "Media Library", icon: Camera, href: "/agent-media-library" },
        ]
      }
    ],
    staff: [
      {
        title: "Daily Tasks",
        items: [
          { label: "Task List", icon: CheckSquare, href: "/staff-tasks", badge: "Priority" },
          { label: "Scheduled Tasks", icon: Clock, href: "/auto-scheduling-recurring-task-generator", badge: "New" },
          { label: "Maintenance Log & Warranty", icon: Wrench, href: "/maintenance-log-warranty-tracker", badge: "New" },
          { label: "Maintenance & Service Tracking", icon: Activity, href: "/maintenance-service-tracking", badge: "New" },
          { label: "Check-in/Check-out", icon: LogOut, href: "/checkin-checkout-workflow" },
          { label: "Guest Check-In Tracker", icon: Luggage, href: "/guest-checkin-checkout-tracker", badge: "New" },
          { label: "Maintenance", icon: Wrench, href: "/maintenance-task-system" },
          { label: "Task Attachments", icon: FileText, href: "/task-attachments-notes" },
        ]
      },
      {
        title: "Time Management",
        items: [
          { label: "Clock In/Out", icon: Clock, href: "/staff-clock-overtime" },
          { label: "Overtime Tracker", icon: Clock, href: "/staff-overhours-tracker" },
          { label: "Salary Tracker", icon: DollarSign, href: "/staff-salary-overtime-tracker" },
        ]
      },
      {
        title: "Resources",
        items: [
          { label: "Profile & Payroll", icon: User, href: "/staff-profile-payroll" },
          { label: "Communication", icon: MessageSquare, href: "/guest-communication-center" },
        ]
      }
    ],
    owner: [
      {
        title: "Financial Overview",
        items: [
          { label: "Finance Dashboard", icon: DollarSign, href: "/finances" },
          { label: "Balance Management", icon: BarChart3, href: "/owner/balance-management" },
          { label: "Invoicing & Payouts", icon: FileText, href: "/owner-invoicing-payouts" },
        ]
      },
      {
        title: "Property Management",
        items: [
          { label: "My Bookings", icon: Calendar, href: "/bookings" },
          { label: "Maintenance Requests", icon: Wrench, href: "/maintenance-task-system" },
          { label: "Property Timeline", icon: Activity, href: "/properties" },
        ]
      }
    ],
    guest: [
      {
        title: "My Stay",
        items: [
          { label: "My Bookings", icon: Calendar, href: "/bookings" },
          { label: "Add-on Services", icon: Coffee, href: "/guest-addon-services" },
          { label: "Service Requests", icon: Wrench, href: "/guest-communication-center" },
        ]
      },
      {
        title: "Communication",
        items: [
          { label: "Chat Support", icon: MessageSquare, href: "/guest-communication-center" },
          { label: "Guest Portal", icon: Home, href: "/guest-portal" },
          { label: "Smart Requests & AI Chat", icon: MessageSquare, href: "/guest-portal-smart-requests" },
        ]
      }
    ],
    "retail-agent": [
      {
        title: "Booking Management",
        items: [
          { label: "Live Booking Engine", icon: Calendar, href: "/retail-agent-booking" },
          { label: "Commission Tracker", icon: DollarSign, href: "/agent-commission" },
        ]
      },
      {
        title: "Resources",
        items: [
          { label: "Property Media", icon: Camera, href: "/agent-media-library" },
          { label: "Booking Calendar", icon: Calendar, href: "/booking-calendar" },
        ]
      }
    ],
    "referral-agent": [
      {
        title: "Performance",
        items: [
          { label: "My Portfolio", icon: Building, href: "/referral-agent" },
          { label: "Commission Tracking", icon: DollarSign, href: "/agent-commission" },
        ]
      },
      {
        title: "Marketing",
        items: [
          { label: "Media Library", icon: Camera, href: "/agent-media-library" },
          { label: "Loyalty Program", icon: Star, href: "/loyalty-tracker" },
        ]
      }
    ]
  };

  return [...commonMenus, ...(roleSpecificMenus[role] || [])];
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  "portfolio-manager": "bg-blue-100 text-blue-800",
  staff: "bg-green-100 text-green-800",
  owner: "bg-purple-100 text-purple-800",
  guest: "bg-gray-100 text-gray-800",
  "retail-agent": "bg-orange-100 text-orange-800",
  "referral-agent": "bg-yellow-100 text-yellow-800",
};

const roleIcons = {
  admin: Shield,
  "portfolio-manager": BarChart3,
  staff: Users,
  owner: Building,
  guest: User,
  "retail-agent": UserPlus,
  "referral-agent": Star,
};

export default function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const menuSections = getRoleBasedMenus(userRole);
  const RoleIcon = roleIcons[userRole as keyof typeof roleIcons] || User;

  if (!isAuthenticated) {
    return null;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
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
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
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
                        <span className="text-sm capitalize">{key} updates</span>
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

                {/* Dark Mode */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Appearance
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dark mode</span>
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
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="th">ไทย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-4 space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={itemIndex} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-left h-auto py-2 px-2",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm truncate">{item.label}</span>
                            {item.badge && (
                              <Badge variant="destructive" className="text-xs ml-2">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p>HostPilotPro v2.0</p>
          <p>© 2025 Property Management</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 bg-background border-r", className)}>
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
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <RoleIcon className="h-5 w-5" />
                Navigation
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
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
    </>
  );
}