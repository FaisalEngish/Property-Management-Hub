import React, { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
  BarChart3
} from "lucide-react";
import TopBar from "../components/TopBar";
import RefreshDataButton from "../components/RefreshDataButton";
import { useDashboardStats, useUsersData } from "../hooks/useDashboardData";

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
  
  // Use cached data for system stats
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: users = [], isLoading: usersLoading } = useUsersData();

  const systemItems = [
    {
      title: "🔑 API Connections",
      description: "Configure Stripe, Hostaway, OpenAI, Twilio and other third-party API integrations",
      key: "api-connections",
      icon: Key,
      badge: "APIs",
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 border-2",
      component: ApiConnections
    },
    {
      title: "Settings",
      description: "General settings, branding, legal templates, and currency & tax configuration",
      key: "settings",
      icon: Settings,
      badge: "Core",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: SettingsPage
    },
    {
      title: "Staff Management", 
      description: "Manage staff members, roles, permissions, and granular access control across all platform modules",
      key: "user-management",
      icon: Users,
      badge: "Staff",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      component: UserManagement
    },
    {
      title: "Automation Management",
      description: "Configure automated workflows, scheduling, and system automation rules",
      key: "automation-management",
      icon: Zap,
      badge: "Auto",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
      component: AutomationManagement
    },
    {
      title: "AI Features",
      description: "AI task management, notifications, feedback monitoring, and smart suggestions",
      key: "ai-features",
      icon: Brain,
      badge: "AI",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      component: AiNotificationsReminders
    },
    {
      title: "Activity Logs",
      description: "System activity monitoring, user actions, and audit trail management",
      key: "activity-logs",
      icon: Activity,
      badge: "Logs",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      component: ActivityLogs
    },
    {
      title: "Sandbox Testing",
      description: "Demo data testing environment and system validation tools",
      key: "sandbox-testing",
      icon: TestTube,
      badge: "Test",
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200",
      component: SandboxTestingDashboard
    },
    {
      title: "Admin God Mode",
      description: "Advanced admin controls, role management, and system override capabilities",
      key: "admin-god-mode-role-manager",
      icon: Shield,
      badge: "Admin",
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      component: AdminGodModeRoleManager
    },
    {
      title: "SaaS Management",
      description: "Multi-tenant organization management, signup requests, and tenant provisioning",
      key: "saas-management",
      icon: Database,
      badge: "SaaS",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
      component: SaasManagement
    },
    {
      title: "System Integrity Check",
      description: "System health monitoring, integrity scanning, and diagnostic tools",
      key: "system-integrity-check",
      icon: Shield,
      badge: "Diagnostics",
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      component: SystemIntegrityCheck
    },
    {
      title: "AI Operations & Anomalies",
      description: "AI operations monitoring, anomaly detection, and performance analytics",
      key: "ai-ops-anomalies",
      icon: Brain,
      badge: "AI Ops",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      component: AiOpsAnomaliesManagement
    },
    {
      title: "Additional Settings",
      description: "Extended admin configuration options and advanced system settings",
      key: "additional-settings",
      icon: Settings,
      badge: "Extended",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      component: AdditionalSettings
    },
    {
      title: "Upgraded Admin Dashboard",
      description: "Enhanced admin control center with advanced monitoring capabilities",
      key: "upgraded-admin-dashboard",
      icon: BarChart3,
      badge: "Enhanced",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      component: UpgradedAdminDashboard
    }
  ];

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

  // Default hub view with cards
  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="System Hub" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">System Hub</h1>
                  <p className="text-gray-600">
                    Complete system administration suite for user management, automation, and platform configuration
                  </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card
                    key={item.key}
                    className={`h-full ${item.color} border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-opacity-60 cursor-pointer group`}
                    onClick={() => handleModuleClick(item.key)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white/50">
                            <IconComponent className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-white/70 text-gray-700 border border-gray-300">
                          {item.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}