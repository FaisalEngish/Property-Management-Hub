import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  Database,
  Cloud,
  Zap,
  Users,
  Building2,
  DollarSign,
  ClipboardList,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { queryClient } from "../lib/queryClient";
import LoadingOverlay from "../components/ui/LoadingOverlay";

interface SystemInfo {
  version: string;
  lastUpdated: string;
  status: string;
  health: {
    database: string;
    api: string;
    cache: string;
  };
  modules: {
    properties: { active: boolean; count: number };
    users: { active: boolean; count: number };
    finance: { active: boolean; count: number };
    tasks: { active: boolean; count: number };
    bookings: { active: boolean; count: number };
  };
  hostaway?: {
    properties: number;
    bookings: number;
    lastSync: string | null;
    isConnected: boolean;
  };
  apiConfigs: {
    hasStripe: boolean;
    hasHostaway: boolean;
    hasOpenAI: boolean;
    hasTwilio: boolean;
  };
  organization: {
    id: string;
    name: string;
  };
}

export default function ConsolidatedSystemHub() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: systemInfo,
    isLoading,
    error,
  } = useQuery<SystemInfo>({
    queryKey: ["/api/system"],
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/system"] });
    await queryClient.refetchQueries({ queryKey: ["/api/system"] });

    toast({
      title: "System data refreshed",
      description: "Latest system information loaded successfully",
    });

    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <LoadingOverlay show={true} text="Loading system information..." />
          {/* <span className="text-lg">Loading system information...</span> */}
        </div>
      </div>
    );
  }

  if (error || !systemInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              System Data Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error instanceof Error
                ? error.message
                : "No system data available"}
            </p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
              System Hub
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Platform administration and system monitoring
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <RefreshCw
              className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">
                System Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {systemInfo.version}
              </div>
              <p className="text-xs text-blue-600 mt-1">HostPilotPro</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {systemInfo.status.toUpperCase()}
              </Badge>
              <p className="text-xs text-green-600 mt-2">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold text-purple-700">
                {new Date(systemInfo.lastUpdated).toLocaleString()}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Real-time monitoring
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Database</span>
                </div>
                <Badge
                  className={
                    systemInfo.health.database === "healthy"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }
                >
                  {systemInfo.health.database}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">API</span>
                </div>
                <Badge
                  className={
                    systemInfo.health.api === "operational"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }
                >
                  {systemInfo.health.api}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Cache</span>
                </div>
                <Badge
                  className={
                    systemInfo.health.cache === "active"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }
                >
                  {systemInfo.health.cache}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Active Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/property-hub" data-testid="module-link-properties">
                <ModuleCard
                  icon={Building2}
                  name="Properties"
                  count={systemInfo.modules.properties.count}
                  active={systemInfo.modules.properties.active}
                  color="blue"
                  clickable={true}
                />
              </Link>
              <Link href="/admin/user-management" data-testid="module-link-users">
                <ModuleCard
                  icon={Users}
                  name="Users"
                  count={systemInfo.modules.users.count}
                  active={systemInfo.modules.users.active}
                  color="green"
                  clickable={true}
                />
              </Link>
              <Link href="/finance-hub" data-testid="module-link-finance">
                <ModuleCard
                  icon={DollarSign}
                  name="Finance"
                  count={systemInfo.modules.finance.count}
                  active={systemInfo.modules.finance.active}
                  color="emerald"
                  clickable={true}
                />
              </Link>
              <Link href="/ultra-fast-tasks" data-testid="module-link-tasks">
                <ModuleCard
                  icon={ClipboardList}
                  name="Tasks"
                  count={systemInfo.modules.tasks.count}
                  active={systemInfo.modules.tasks.active}
                  color="orange"
                  clickable={true}
                />
              </Link>
              <Link href="/bookings-central" data-testid="module-link-bookings">
                <ModuleCard
                  icon={Calendar}
                  name="Bookings"
                  count={systemInfo.modules.bookings.count}
                  active={systemInfo.modules.bookings.active}
                  color="purple"
                  clickable={true}
                />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Hostaway Integration Status */}
        {systemInfo.hostaway && (
          <Card className="border-2 border-teal-200 bg-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <ExternalLink className="h-5 w-5 text-teal-600" />
                Hostaway Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-sm text-teal-700 mb-1">Connection Status</div>
                  <Badge className={systemInfo.hostaway.isConnected ? "bg-green-600" : "bg-red-600"}>
                    {systemInfo.hostaway.isConnected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-sm text-teal-700 mb-1">Synced Properties</div>
                  <div className="text-2xl font-bold text-teal-900">{systemInfo.hostaway.properties}</div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-sm text-teal-700 mb-1">Synced Bookings</div>
                  <div className="text-2xl font-bold text-teal-900">{systemInfo.hostaway.bookings}</div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-sm text-teal-700 mb-1">Last Sync</div>
                  <div className="text-sm font-semibold text-teal-900">
                    {systemInfo.hostaway.lastSync 
                      ? new Date(systemInfo.hostaway.lastSync).toLocaleString()
                      : "Never"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-purple-600" />
              API Configurations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <APIStatusBadge
                name="Stripe"
                active={systemInfo.apiConfigs.hasStripe}
              />
              <APIStatusBadge
                name="Hostaway"
                active={systemInfo.apiConfigs.hasHostaway}
              />
              <APIStatusBadge
                name="OpenAI"
                active={systemInfo.apiConfigs.hasOpenAI}
              />
              <APIStatusBadge
                name="Twilio"
                active={systemInfo.apiConfigs.hasTwilio}
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Info */}
        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-indigo-700">Name:</span>
                <span className="text-indigo-900 font-semibold">
                  {systemInfo.organization.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-indigo-700">ID:</span>
                <span className="text-indigo-900 font-mono text-sm">
                  {systemInfo.organization.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Administration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              System Administration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/user-management"
                data-testid="link-user-management"
              >
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-blue-900">
                      User Management
                    </h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Create and manage user accounts with role-based access control
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/api-connections"
                data-testid="link-api-connections"
              >
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200 rounded-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <Cloud className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-emerald-900">
                      API Connections
                    </h3>
                  </div>
                  <p className="text-sm text-emerald-700">
                    Configure Stripe, Hostaway, OpenAI, Twilio and other integrations
                  </p>
                </div>
              </Link>
              <Link
                href="/settings"
                data-testid="link-settings"
              >
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-purple-900">
                      System Settings
                    </h3>
                  </div>
                  <p className="text-sm text-purple-700">
                    General settings, branding, legal templates, and configuration
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ModuleCard({
  icon: Icon,
  name,
  count,
  active,
  color,
  clickable = false,
}: {
  icon: any;
  name: string;
  count: number;
  active: boolean;
  color: string;
  clickable?: boolean;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]} ${clickable ? "hover:shadow-lg hover:scale-105 transition-all cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5" />
        {active ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div className="font-semibold text-lg">{name}</div>
      <div className="text-sm opacity-80">{count} records</div>
      {clickable && (
        <div className="text-xs mt-2 font-medium opacity-70">
          Click to manage →
        </div>
      )}
    </div>
  );
}

function APIStatusBadge({ name, active }: { name: string; active: boolean }) {
  return (
    <div
      className={`p-3 rounded-lg border-2 flex items-center justify-between ${
        active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <span className="font-medium text-sm">{name}</span>
      {active ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400" />
      )}
    </div>
  );
}
