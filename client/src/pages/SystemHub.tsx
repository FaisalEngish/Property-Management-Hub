import React, { lazy, Suspense, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  Zap,
  Brain,
  Activity,
  TestTube,
  Shield,
  Database,
  Key,
  ArrowLeft,
  BarChart3,
  Building,
  UserCheck,
  Cog,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  FileText,
  Plus,
  DollarSign,
  Wallet,
  Link,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Bell,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import TopBar from "@/components/TopBar";
import RefreshDataButton from "@/components/RefreshDataButton";
import { useDashboardStats, useUsersData } from "@/hooks/useDashboardData";

// Lazy load all System modules - only load when user clicks
const SettingsPage = lazy(() => import("./Settings"));
const UserManagement = lazy(() => import("./UserManagement"));  
const AutomationManagement = lazy(() => import("./AutomationManagement"));
const AiNotificationsReminders = lazy(() => import("./AiNotificationsReminders"));
const ActivityLogs = lazy(() => import("./ActivityLogs"));
const SandboxTestingDashboard = lazy(() => import("./SandboxTestingDashboard"));
const AdminGodModeRoleManager = lazy(() => import("./AdminGodModeRoleManager"));
const SaasManagement = lazy(() => import("./admin/SaasManagement"));
const ApiConnections = lazy(() => import("./admin/ApiConnections"));
const SystemIntegrityCheck = lazy(() => import("./SystemIntegrityCheck"));
const AiOpsAnomaliesManagement = lazy(() => import("./admin/AiOpsAnomaliesManagement"));
const AdditionalSettings = lazy(() => import("./AdditionalSettings"));
const UpgradedAdminDashboard = lazy(() => import("./UpgradedAdminDashboard"));

export default function SystemHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBadge, setFilterBadge] = useState("all");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Core Settings": true,
    "Financial Management": true,
    "Integrations & APIs": true,
    "User & Staff Management": true,
    "System Administration": true,
    "Automation & AI": true
  });
  
  // Use cached data for system stats
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: users = [], isLoading: usersLoading } = useUsersData();

  const systemItems = [
    // Core Settings
    {
      title: "Settings",
      description: "General settings, branding, legal templates, and currency & tax configuration",
      key: "settings",
      icon: Settings,
      badge: "Core",
      category: "Core Settings",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: SettingsPage
    },
    {
      title: "Additional Settings",
      description: "Extended admin configuration options and advanced system settings",
      key: "additional-settings",
      icon: Cog,
      badge: "Extended",
      category: "Core Settings",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      component: AdditionalSettings
    },
    
    // Financial Management
    {
      title: "Financial Analytics",
      description: "Revenue tracking, expense management, and financial reporting dashboard",
      key: "finance-hub",
      icon: DollarSign,
      badge: "Finance",
      category: "Financial Management", 
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      component: () => <div>Navigate to Finance Hub</div>
    },
    {
      title: "Payment Processing",
      description: "Configure payment gateways, billing cycles, and automated invoicing",
      key: "payment-settings",
      icon: Wallet,
      badge: "Billing",
      category: "Financial Management",
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      component: SettingsPage
    },
    
    // Integrations & APIs
    {
      title: "API Connections",
      description: "Configure Stripe, Hostaway, OpenAI, Twilio and other third-party API integrations",
      key: "api-connections",
      icon: Key,
      badge: "APIs",
      category: "Integrations & APIs",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      component: ApiConnections
    },
    {
      title: "Third-Party Integrations",
      description: "Manage external service connections and webhook configurations",
      key: "integrations-management",
      icon: Link,
      badge: "Integrations",
      category: "Integrations & APIs",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
      component: ApiConnections
    },
    
    // User & Staff Management
    {
      title: "Staff Management", 
      description: "Manage staff members, roles, permissions, and granular access control across all platform modules",
      key: "user-management",
      icon: Users,
      badge: "Staff",
      category: "User & Staff Management",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      component: UserManagement
    },
    {
      title: "Admin God Mode",
      description: "Advanced admin controls, role management, and system override capabilities",
      key: "admin-god-mode-role-manager",
      icon: Shield,
      badge: "Admin",
      category: "User & Staff Management",
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      component: AdminGodModeRoleManager
    },
    
    // System Administration
    {
      title: "SaaS Management",
      description: "Multi-tenant organization management, signup requests, and tenant provisioning",
      key: "saas-management",
      icon: Database,
      badge: "SaaS",
      category: "System Administration",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: SaasManagement
    },
    {
      title: "System Integrity Check",
      description: "System health monitoring, integrity scanning, and diagnostic tools",
      key: "system-integrity-check",
      icon: Shield,
      badge: "Diagnostics",
      category: "System Administration",
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      component: SystemIntegrityCheck
    },
    {
      title: "Activity Logs",
      description: "System activity monitoring, user actions, and audit trail management",
      key: "activity-logs",
      icon: Activity,
      badge: "Logs",
      category: "System Administration",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      component: ActivityLogs
    },
    {
      title: "Upgraded Admin Dashboard",
      description: "Enhanced admin control center with advanced monitoring capabilities",
      key: "upgraded-admin-dashboard",
      icon: BarChart3,
      badge: "Enhanced",
      category: "System Administration",
      color: "bg-slate-50 hover:bg-slate-100 border-slate-200",
      component: UpgradedAdminDashboard
    },
    {
      title: "Sandbox Testing",
      description: "Demo data testing environment and system validation tools",
      key: "sandbox-testing",
      icon: TestTube,
      badge: "Test",
      category: "System Administration",
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200",
      component: SandboxTestingDashboard
    },
    
    // Automation & AI
    {
      title: "Automation Management",
      description: "Configure automated workflows, scheduling, and system automation rules",
      key: "automation-management",
      icon: Zap,
      badge: "Auto",
      category: "Automation & AI",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
      component: AutomationManagement
    },
    {
      title: "AI Features",
      description: "AI task management, notifications, feedback monitoring, and smart suggestions",
      key: "ai-features",
      icon: Brain,
      badge: "AI",
      category: "Automation & AI",
      color: "bg-violet-50 hover:bg-violet-100 border-violet-200",
      component: AiNotificationsReminders,
      hasAI: true
    },
    {
      title: "AI Operations & Anomalies",
      description: "AI operations monitoring, anomaly detection, and performance analytics",
      key: "ai-ops-anomalies",
      icon: Brain,
      badge: "AI Ops",
      category: "Automation & AI",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      component: AiOpsAnomaliesManagement,
      hasAI: true
    }
  ];

  // Filter and group items based on search and filter criteria
  const filteredAndGroupedItems = useMemo(() => {
    let filtered = systemItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBadge === "all" || item.badge === filterBadge;
      return matchesSearch && matchesFilter;
    });

    // Group by category
    const grouped = filtered.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof filtered>);

    return grouped;
  }, [systemItems, searchTerm, filterBadge]);

  // Get unique badge types for filter
  const uniqueBadges = useMemo(() => {
    const badges = [...new Set(systemItems.map(item => item.badge))];
    return badges.sort();
  }, [systemItems]);

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Get role breakdown for users tooltip
  const getRoleBreakdown = () => {
    if (!users.length) return [];
    const roleCounts = users.reduce((acc: Record<string, number>, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
  };

  const handleModuleClick = (key: string) => {
    setSelectedModule(key);
  };

  const selectedItem = systemItems.find(item => item.key === selectedModule);

  // If a module is selected, render it lazily
  if (selectedModule && selectedItem) {
    const Component = selectedItem.component;
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex flex-col lg:ml-0">
          <TopBar title={selectedItem.title} />
          
          <main className="flex-1 overflow-auto">
            <div className="p-4 border-b bg-white">
              <Button
                variant="outline"
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to System Hub
              </Button>
            </div>
            
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading {selectedItem.title}...</p>
                </div>
              </div>
            }>
              <Component />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Default hub view with enhanced enterprise features
  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="System Hub" />
        
        <main className={`flex-1 overflow-auto p-6 pb-24 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-background'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Hub</h1>
                  <p className={`transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    Complete system administration suite for user management, automation, and platform configuration
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <Sun className={`h-4 w-4 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-yellow-500'}`} />
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                      className="data-[state=checked]:bg-slate-600"
                    />
                    <Moon className={`h-4 w-4 transition-colors duration-300 ${isDarkMode ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <RefreshDataButton
                    endpoints={['/api/dashboard/stats', '/api/users']}
                    variant="outline"
                    size="sm"
                    showStats={true}
                    showLastUpdate={true}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Properties Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className={`cursor-help transition-all duration-300 backdrop-blur-sm border hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-blue-800/80 via-blue-700/60 to-blue-800/80 border-blue-600/60 hover:border-blue-400/60' 
                        : 'bg-gradient-to-br from-blue-50/80 via-blue-100/60 to-blue-50/80 border-blue-200/60 hover:border-blue-300/60'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                              Total Properties
                            </p>
                            <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                              {dashboardStats?.totalProperties || 25}
                            </p>
                          </div>
                          <div className={`p-3 rounded-xl shadow-lg ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700' 
                              : 'bg-gradient-to-br from-blue-100 to-blue-200'
                          }`}>
                            <Building className={`h-8 w-8 ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className={`max-w-sm p-3 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 text-white' 
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-900'
                  }`}>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Property Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Active:</span>
                          <span className="font-medium">{dashboardStats?.totalProperties || 25}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Occupied:</span>
                          <span className="font-medium">{Math.floor((dashboardStats?.totalProperties || 25) * 0.8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available:</span>
                          <span className="font-medium">{Math.floor((dashboardStats?.totalProperties || 25) * 0.2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance:</span>
                          <span className="font-medium">2</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Active Users Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className={`cursor-help transition-all duration-300 backdrop-blur-sm border hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-green-800/80 via-green-700/60 to-green-800/80 border-green-600/60 hover:border-green-400/60' 
                        : 'bg-gradient-to-br from-green-50/80 via-green-100/60 to-green-50/80 border-green-200/60 hover:border-green-300/60'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                              Active Users
                            </p>
                            <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-100' : 'text-green-900'}`}>
                              {users?.length || 4}
                            </p>
                          </div>
                          <div className={`p-3 rounded-xl shadow-lg ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-green-600 to-green-700' 
                              : 'bg-gradient-to-br from-green-100 to-green-200'
                          }`}>
                            <UserCheck className={`h-8 w-8 ${isDarkMode ? 'text-green-100' : 'text-green-700'}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className={`max-w-sm p-3 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 text-white' 
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-900'
                  }`}>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Role Breakdown
                      </p>
                      <div className="space-y-1 text-xs">
                        {getRoleBreakdown().map(({ role, count }, index) => (
                          <div key={index} className="flex justify-between capitalize">
                            <span>{role}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* System Modules Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className={`cursor-help transition-all duration-300 backdrop-blur-sm border hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-purple-800/80 via-purple-700/60 to-purple-800/80 border-purple-600/60 hover:border-purple-400/60' 
                        : 'bg-gradient-to-br from-purple-50/80 via-purple-100/60 to-purple-50/80 border-purple-200/60 hover:border-purple-300/60'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                              System Modules
                            </p>
                            <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                              {systemItems.length}
                            </p>
                          </div>
                          <div className={`p-3 rounded-xl shadow-lg ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-purple-600 to-purple-700' 
                              : 'bg-gradient-to-br from-purple-100 to-purple-200'
                          }`}>
                            <Cog className={`h-8 w-8 ${isDarkMode ? 'text-purple-100' : 'text-purple-700'}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className={`max-w-sm p-3 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 text-white' 
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-900'
                  }`}>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Module Distribution
                      </p>
                      <div className="space-y-1 text-xs">
                        {Object.entries(filteredAndGroupedItems).map(([category, items], index) => (
                          <div key={index} className="flex justify-between">
                            <span>{category}:</span>
                            <span className="font-medium">{items.length} modules</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Search & Filter Bar */}
            <div className={`mb-6 p-4 rounded-lg border transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search system modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : ''}`}
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Select value={filterBadge} onValueChange={setFilterBadge}>
                    <SelectTrigger className={`w-48 pl-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`}>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <SelectItem value="all" className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>All Modules</SelectItem>
                      {uniqueBadges.map(badge => (
                        <SelectItem key={badge} value={badge} className={isDarkMode ? 'text-white focus:bg-slate-700' : ''}>
                          {badge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Expandable Module Groups */}
            <div className="space-y-6">
              {Object.entries(filteredAndGroupedItems).map(([groupName, items]) => {
                const isExpanded = expandedGroups[groupName];
                return (
                  <Collapsible key={groupName} open={isExpanded} onOpenChange={() => toggleGroup(groupName)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-between p-6 h-auto transition-all duration-300 ${
                          isDarkMode
                            ? 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-slate-600 hover:border-emerald-500/50 text-white'
                            : 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200 hover:border-emerald-300/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-emerald-700/20' : 'bg-emerald-100/50'
                          }`}>
                            <Cog className={`h-5 w-5 ${
                              isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                            }`} />
                          </div>
                          <div className="text-left">
                            <h3 className={`text-lg font-semibold ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {groupName}
                            </h3>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {items.length} modules available
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quick Action Icons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-8 w-8 p-0 transition-colors duration-200 ${
                                      isDarkMode 
                                        ? 'hover:bg-blue-700 hover:text-blue-100' 
                                        : 'hover:bg-blue-100 hover:text-blue-700'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Configure action
                                    }}
                                  >
                                    <Cog className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Configure</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-8 w-8 p-0 transition-colors duration-200 ${
                                      isDarkMode 
                                        ? 'hover:bg-green-700 hover:text-green-100' 
                                        : 'hover:bg-green-100 hover:text-green-700'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // View docs action
                                    }}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">View Docs</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-8 w-8 p-0 transition-colors duration-200 ${
                                      isDarkMode 
                                        ? 'hover:bg-orange-700 hover:text-orange-100' 
                                        : 'hover:bg-orange-100 hover:text-orange-700'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Add module action
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Add Module</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          
                          <Badge className={`${
                            isDarkMode 
                              ? 'bg-emerald-800 text-emerald-200 border-emerald-600' 
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {items.length}
                          </Badge>
                          
                          {isExpanded ? (
                            <ChevronUp className={`h-5 w-5 transition-transform duration-300 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`} />
                          ) : (
                            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`} />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => {
                          const IconComponent = item.icon;
                          
                          return (
                            <Card
                              key={item.key}
                              className={`group cursor-pointer transition-all duration-500 ease-in-out backdrop-blur-sm border hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden ${
                                isDarkMode 
                                  ? 'bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-700/80 border-slate-600/60 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-400/20' 
                                  : 'bg-gradient-to-br from-white via-slate-50/40 to-emerald-50/20 border-slate-200/60 hover:border-emerald-300/50 hover:shadow-xl hover:shadow-emerald-500/20'
                              }`}
                              onClick={() => handleModuleClick(item.key)}
                            >
                              {/* Enhanced Glassmorphism overlay */}
                              <div className={`absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                                isDarkMode 
                                  ? 'bg-gradient-to-br from-slate-700/70 via-emerald-900/30 to-slate-700/40' 
                                  : 'bg-gradient-to-br from-white/70 via-emerald-50/30 to-white/40'
                              }`} />
                              
                              {/* AI Badge */}
                              {item.hasAI && (
                                <div className="absolute top-2 left-2 z-10">
                                  <Badge className={`px-2 py-1 text-xs shadow-lg backdrop-blur-sm ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-r from-violet-700 to-violet-600 text-violet-100 border-violet-500' 
                                      : 'bg-gradient-to-r from-violet-100 to-violet-50 text-violet-800 border-violet-300'
                                  }`}>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI
                                  </Badge>
                                </div>
                              )}
                              
                              <CardHeader className="pb-3 relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-3 backdrop-blur-sm rounded-xl shadow-xl border group-hover:scale-110 transition-all duration-500 ${
                                      isDarkMode 
                                        ? 'bg-gradient-to-br from-emerald-700/80 via-emerald-600/60 to-slate-700/40 border-emerald-500/50' 
                                        : 'bg-gradient-to-br from-emerald-100/80 via-emerald-50/60 to-white/40 border-emerald-200/50'
                                    }`}>
                                      <IconComponent className={`h-5 w-5 transition-colors duration-300 ${
                                        isDarkMode 
                                          ? 'text-emerald-200 group-hover:text-emerald-100' 
                                          : 'text-emerald-700 group-hover:text-emerald-800'
                                      }`} />
                                    </div>
                                    <CardTitle className={`text-base font-semibold transition-colors duration-300 ${
                                      isDarkMode 
                                        ? 'text-slate-100 group-hover:text-white' 
                                        : 'text-slate-800 group-hover:text-slate-900'
                                    }`}>
                                      {item.title}
                                    </CardTitle>
                                  </div>
                                  
                                  <Badge className={`shadow-lg backdrop-blur-sm transition-all duration-300 px-2 py-1 text-xs ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 border-slate-500' 
                                      : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border-slate-300'
                                  }`}>
                                    {item.badge}
                                  </Badge>
                                </div>
                                
                                {/* Quick Action Icons on Hover */}
                                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-7 w-7 p-0 transition-colors duration-200 ${
                                            isDarkMode 
                                              ? 'hover:bg-emerald-700 hover:text-emerald-100' 
                                              : 'hover:bg-emerald-100 hover:text-emerald-700'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleModuleClick(item.key);
                                          }}
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">View</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-7 w-7 p-0 transition-colors duration-200 ${
                                            isDarkMode 
                                              ? 'hover:bg-blue-700 hover:text-blue-100' 
                                              : 'hover:bg-blue-100 hover:text-blue-700'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Configure action
                                          }}
                                        >
                                          <Cog className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">Configure</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-7 w-7 p-0 transition-colors duration-200 ${
                                            isDarkMode 
                                              ? 'hover:bg-green-700 hover:text-green-100' 
                                              : 'hover:bg-green-100 hover:text-green-700'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Add action
                                          }}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">Add</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-4 relative z-10">
                                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'text-slate-300 group-hover:text-slate-200' 
                                    : 'text-slate-600 group-hover:text-slate-700'
                                }`}>
                                  {item.description}
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

          </div>
        </main>

        {/* Sticky Footer System Status Bar */}
        <div className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-sm border-t transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900/95 border-slate-700' 
            : 'bg-white/95 border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-3">
              {/* System Status Display */}
              <div className="flex items-center gap-6 lg:gap-8 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg shadow-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-green-800 to-green-700' 
                      : 'bg-gradient-to-br from-green-100 to-green-50'
                  }`}>
                    <CheckCircle className={`h-4 w-4 ${
                      isDarkMode ? 'text-green-200' : 'text-green-700'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      System Status
                    </p>
                    <p className={`text-sm font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
                    }`}>
                      Online
                    </p>
                  </div>
                </div>
                
                <div className={`hidden sm:block transition-colors duration-300 ${
                  isDarkMode ? 'text-emerald-600' : 'text-emerald-300'
                }`}>|</div>
                
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg shadow-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-blue-800 to-blue-700' 
                      : 'bg-gradient-to-br from-blue-100 to-blue-50'
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-700'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      Last Sync
                    </p>
                    <p className={`text-sm font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
                    }`}>
                      2 min ago
                    </p>
                  </div>
                </div>
                
                <div className={`hidden sm:block transition-colors duration-300 ${
                  isDarkMode ? 'text-emerald-600' : 'text-emerald-300'
                }`}>|</div>
                
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg shadow-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-purple-800 to-purple-700' 
                      : 'bg-gradient-to-br from-purple-100 to-purple-50'
                  }`}>
                    <Package className={`h-4 w-4 ${
                      isDarkMode ? 'text-purple-200' : 'text-purple-700'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      Total Modules
                    </p>
                    <p className={`text-sm font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
                    }`}>
                      {systemItems.length}
                    </p>
                  </div>
                </div>
                
                <div className={`hidden sm:block transition-colors duration-300 ${
                  isDarkMode ? 'text-emerald-600' : 'text-emerald-300'
                }`}>|</div>
                
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg shadow-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-700' 
                      : 'bg-gradient-to-br from-slate-100 to-slate-50'
                  }`}>
                    <Bell className={`h-4 w-4 ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-700'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      Alerts
                    </p>
                    <p className={`text-sm font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
                    }`}>
                      None
                    </p>
                  </div>
                </div>
              </div>

              {/* System Actions */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-8 px-3 text-xs transition-all duration-300 shadow-lg ${
                          isDarkMode 
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Health Check
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Run system health check</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}