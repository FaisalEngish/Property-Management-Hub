import React, { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { 
  Settings, 
  Users, 
  Zap,
  Brain,
  DollarSign,
  Key,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Globe,
  CreditCard,
  Percent,
  Calculator,
  Receipt,
  Database,
  Shield,
  Activity,
  TestTube,
  Building2,
  Phone,
  Mail,
  Smartphone,
  Crown,
  UserCheck,
  FileText,
  Bell,
  Bot,
  Gauge
} from "lucide-react";
import TopBar from "../components/TopBar";
import { useDashboardStats, useUsersData } from "../hooks/useDashboardData";

// Lazy load all System modules
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
const OrganizationBranding = lazy(() => import("./admin/OrganizationBranding"));
const SimpleSalariesWages = lazy(() => import("./SimpleSalariesWages"));
const StaffExpenseManagement = lazy(() => import("./StaffExpenseManagement"));
const InvoiceGenerator = lazy(() => import("./InvoiceGenerator"));
const FinanceEngine = lazy(() => import("./FinanceEngine"));
const SystemWideDemoIntegration = lazy(() => import("./SystemWideDemoIntegration"));
const AlertManagement = lazy(() => import("./AlertManagement"));
const AIFeatureDashboard = lazy(() => import("./AIFeatureDashboard"));

interface ConsolidatedModule {
  title: string;
  description: string;
  key: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  category: string;
}

interface CategorySection {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  modules: ConsolidatedModule[];
}

export default function ConsolidatedSystemHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: users = [], isLoading: usersLoading } = useUsersData();

  // Safe fallbacks for null data
  const safeUsers = users || [];
  const safeStats = dashboardStats || { totalProperties: 0 };

  const categories: CategorySection[] = [
    {
      title: "Core Settings",
      description: "Essential platform configuration and defaults",
      icon: Settings,
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      badge: "Core",
      modules: [
        {
          title: "Platform Settings",
          description: "Currency, VAT, platform defaults and core configuration",
          key: "platform-settings",
          icon: Globe,
          badge: "Essential",
          color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
          component: SettingsPage,
          category: "core"
        },
        {
          title: "Company Branding",
          description: "Organization branding, logos, and visual identity management",
          key: "company-branding",
          icon: Building2,
          badge: "Brand",
          color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
          component: OrganizationBranding,
          category: "core"
        }
      ]
    },
    {
      title: "Financial Management",
      description: "Complete financial controls and staff payroll",
      icon: DollarSign,
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      badge: "Finance",
      modules: [
        {
          title: "Commission Rules & Auto-billing",
          description: "Commission rates, auto-billing settings, and payment automation",
          key: "commission-billing",
          icon: Percent,
          badge: "Rules",
          color: "bg-green-50 hover:bg-green-100 border-green-200",
          component: SettingsPage,
          category: "finance"
        },
        {
          title: "Staff Salaries & Payroll",
          description: "Staff salary management, overtime tracking, and payroll processing",
          key: "staff-payroll",
          icon: Calculator,
          badge: "Payroll",
          color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
          component: SimpleSalariesWages,
          category: "finance"
        },
        {
          title: "Staff Expense Management",
          description: "Employee expense tracking, approval workflows, and reimbursements",
          key: "staff-expenses",
          icon: Receipt,
          badge: "Expenses",
          color: "bg-teal-50 hover:bg-teal-100 border-teal-200",
          component: StaffExpenseManagement,
          category: "finance"
        },
        {
          title: "Invoice Generator",
          description: "Automated invoice generation and financial document management",
          key: "invoice-generator",
          icon: FileText,
          badge: "Invoices",
          color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200",
          component: InvoiceGenerator,
          category: "finance"
        },
        {
          title: "Finance Engine",
          description: "Advanced financial analytics, reporting, and revenue management",
          key: "finance-engine",
          icon: Gauge,
          badge: "Analytics",
          color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
          component: FinanceEngine,
          category: "finance"
        }
      ]
    },
    {
      title: "Integrations & APIs",
      description: "Third-party connections and API management",
      icon: Key,
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      badge: "APIs",
      modules: [
        {
          title: "PMS Connections",
          description: "Hostaway, Guesty, and other Property Management System integrations",
          key: "pms-connections",
          icon: Building2,
          badge: "PMS",
          color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
          component: ApiConnections,
          category: "integrations"
        },
        {
          title: "Payment Systems",
          description: "Stripe, payment processing, and financial API configurations",
          key: "payment-systems",
          icon: CreditCard,
          badge: "Payments",
          color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
          component: ApiConnections,
          category: "integrations"
        },
        {
          title: "Communication APIs",
          description: "SMS/WhatsApp (Twilio), email services, and messaging integrations",
          key: "communication-apis",
          icon: Smartphone,
          badge: "Comms",
          color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
          component: ApiConnections,
          category: "integrations"
        }
      ]
    },
    {
      title: "User & Staff Management",
      description: "Team hierarchy and access control",
      icon: Users,
      color: "bg-violet-50 hover:bg-violet-100 border-violet-200",
      badge: "Staff",
      modules: [
        {
          title: "User Roles & Permissions",
          description: "Role management, permission controls, and access administration",
          key: "user-roles",
          icon: Crown,
          badge: "Roles",
          color: "bg-red-50 hover:bg-red-100 border-red-200",
          component: AdminGodModeRoleManager,
          category: "users"
        },
        {
          title: "Staff Hierarchy",
          description: "User management, staff structure, and organizational hierarchy",
          key: "staff-hierarchy",
          icon: UserCheck,
          badge: "Hierarchy",
          color: "bg-violet-50 hover:bg-violet-100 border-violet-200",
          component: UserManagement,
          category: "users"
        }
      ]
    },
    {
      title: "System Administration",
      description: "SaaS management and system health monitoring",
      icon: Database,
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
      badge: "Admin",
      modules: [
        {
          title: "SaaS Management",
          description: "Multi-tenant provisioning, signup requests, and subscription management",
          key: "saas-management",
          icon: Database,
          badge: "SaaS",
          color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
          component: SaasManagement,
          category: "admin"
        },
        {
          title: "Activity Logs",
          description: "System activity monitoring, user actions, and audit trail management",
          key: "activity-logs",
          icon: Activity,
          badge: "Logs",
          color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
          component: ActivityLogs,
          category: "admin"
        },
        {
          title: "System Integrity Check",
          description: "System health monitoring, data validation, and integrity verification",
          key: "system-integrity",
          icon: Shield,
          badge: "Health",
          color: "bg-red-50 hover:bg-red-100 border-red-200",
          component: SystemIntegrityCheck,
          category: "admin"
        },
        {
          title: "Sandbox Testing",
          description: "Demo data testing environment and system validation tools",
          key: "sandbox-testing",
          icon: TestTube,
          badge: "Test",
          color: "bg-pink-50 hover:bg-pink-100 border-pink-200",
          component: SandboxTestingDashboard,
          category: "admin"
        },
        {
          title: "Demo Integration",
          description: "System-wide demo data management and integration tools",
          key: "demo-integration",
          icon: Database,
          badge: "Demo",
          color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200",
          component: SystemWideDemoIntegration,
          category: "admin"
        }
      ]
    },
    {
      title: "Automation & AI",
      description: "Smart workflows and AI-powered features",
      icon: Brain,
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      badge: "AI",
      modules: [
        {
          title: "Task Automation",
          description: "Automated workflows, scheduling rules, and system automation management",
          key: "task-automation",
          icon: Zap,
          badge: "Auto",
          color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
          component: AutomationManagement,
          category: "automation"
        },
        {
          title: "AI Notifications & Reminders",
          description: "AI-powered notifications, smart reminders, and intelligent alerts",
          key: "ai-notifications",
          icon: Bell,
          badge: "Smart",
          color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
          component: AiNotificationsReminders,
          category: "automation"
        },
        {
          title: "Alert Management",
          description: "System alerts, notification rules, and alert escalation management",
          key: "alert-management",
          icon: Bell,
          badge: "Alerts",
          color: "bg-amber-50 hover:bg-amber-100 border-amber-200",
          component: AlertManagement,
          category: "automation"
        },
        {
          title: "AI Features Dashboard",
          description: "AI task management, feedback monitoring, and smart feature controls",
          key: "ai-features",
          icon: Bot,
          badge: "AI",
          color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
          component: AIFeatureDashboard,
          category: "automation"
        }
      ]
    }
  ];

  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle]
    }));
  };

  const getSelectedComponent = () => {
    for (const category of categories) {
      const module = category.modules.find(m => m.key === selectedModule);
      if (module) {
        const Component = module.component;
        return <Component />;
      }
    }
    return null;
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex flex-col">
          <TopBar 
            title="System Administration" 
            subtitle="Consolidated platform management"
          />
          
          <div className="p-6">
            <Button
              variant="outline"
              onClick={() => setSelectedModule(null)}
              className="mb-6 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to System Hub
            </Button>
            
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg">Loading module...</span>
                  </div>
                </div>
              }
            >
              {getSelectedComponent()}
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col">
        <TopBar 
          title="System Hub" 
          subtitle="Consolidated platform administration and configuration"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeStats.totalProperties || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeUsers.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Modules</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.reduce((acc, cat) => acc + cat.modules.length, 0)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Consolidated Categories */}
            <div className="space-y-6">
              {categories && categories.length > 0 ? categories.map((category) => {
                const isExpanded = expandedCategories[category.title];
                const CategoryIcon = category.icon;
                
                return (
                  <Card key={category.title} className="overflow-hidden">
                    <Collapsible
                      open={isExpanded}
                      onOpenChange={() => toggleCategory(category.title)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className={`${category.color} hover:opacity-90 transition-all duration-200`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <CategoryIcon className="h-6 w-6" />
                              <div className="text-left">
                                <CardTitle className="flex items-center gap-2">
                                  {category.title}
                                  {category.badge && (
                                    <Badge variant="secondary" className="text-xs">
                                      {category.badge}
                                    </Badge>
                                  )}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {category.modules.length} modules
                              </Badge>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.modules.map((module) => {
                              const ModuleIcon = module.icon;
                              
                              return (
                                <Card
                                  key={module.key}
                                  className={`${module.color} cursor-pointer hover:shadow-md transition-all duration-200 border-2`}
                                  onClick={() => setSelectedModule(module.key)}
                                >
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <ModuleIcon className="h-5 w-5" />
                                      {module.badge && (
                                        <Badge variant="secondary" className="text-xs">
                                          {module.badge}
                                        </Badge>
                                      )}
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-2">
                                    <h3 className="font-semibold text-sm mb-2">{module.title}</h3>
                                    <p className="text-xs text-muted-foreground">{module.description}</p>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              }) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      Loading system modules...
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}