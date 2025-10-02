import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
  Calendar
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { queryClient } from "../lib/queryClient";

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

  const { data: systemInfo, isLoading, error } = useQuery<SystemInfo>({
    queryKey: ["/api/system"]
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/system"] });
    await queryClient.refetchQueries({ queryKey: ["/api/system"] });
    
    toast({
      title: "System data refreshed",
      description: "Latest system information loaded successfully"
    });
    
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg">Loading system information...</span>
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
              {error instanceof Error ? error.message : "No system data available"}
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              System Hub
            </h1>
            <p className="text-gray-600 mt-1">
              Platform administration and system monitoring
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">System Version</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{systemInfo.version}</div>
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
              <p className="text-xs text-green-600 mt-2">All systems operational</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold text-purple-700">
                {new Date(systemInfo.lastUpdated).toLocaleString()}
              </div>
              <p className="text-xs text-purple-600 mt-1">Real-time monitoring</p>
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
                <Badge className={systemInfo.health.database === 'healthy' ? 'bg-green-600' : 'bg-red-600'}>
                  {systemInfo.health.database}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">API</span>
                </div>
                <Badge className={systemInfo.health.api === 'operational' ? 'bg-green-600' : 'bg-red-600'}>
                  {systemInfo.health.api}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Cache</span>
                </div>
                <Badge className={systemInfo.health.cache === 'active' ? 'bg-green-600' : 'bg-red-600'}>
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
              <ModuleCard 
                icon={Building2}
                name="Properties"
                count={systemInfo.modules.properties.count}
                active={systemInfo.modules.properties.active}
                color="blue"
              />
              <a href="/admin/user-management" className="block" data-testid="module-link-users">
                <ModuleCard 
                  icon={Users}
                  name="Users"
                  count={systemInfo.modules.users.count}
                  active={systemInfo.modules.users.active}
                  color="green"
                  clickable={true}
                />
              </a>
              <ModuleCard 
                icon={DollarSign}
                name="Finance"
                count={systemInfo.modules.finance.count}
                active={systemInfo.modules.finance.active}
                color="emerald"
              />
              <ModuleCard 
                icon={ClipboardList}
                name="Tasks"
                count={systemInfo.modules.tasks.count}
                active={systemInfo.modules.tasks.active}
                color="orange"
              />
              <ModuleCard 
                icon={Calendar}
                name="Bookings"
                count={systemInfo.modules.bookings.count}
                active={systemInfo.modules.bookings.active}
                color="purple"
              />
            </div>
          </CardContent>
        </Card>

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
              <APIStatusBadge name="Stripe" active={systemInfo.apiConfigs.hasStripe} />
              <APIStatusBadge name="Hostaway" active={systemInfo.apiConfigs.hasHostaway} />
              <APIStatusBadge name="OpenAI" active={systemInfo.apiConfigs.hasOpenAI} />
              <APIStatusBadge name="Twilio" active={systemInfo.apiConfigs.hasTwilio} />
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
                <span className="text-indigo-900 font-semibold">{systemInfo.organization.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-indigo-700">ID:</span>
                <span className="text-indigo-900 font-mono text-sm">{systemInfo.organization.id}</span>
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
              <a 
                href="/admin/user-management" 
                className="block p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-lg transition-all cursor-pointer group"
                data-testid="link-user-management"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-blue-900">User Management</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Create and manage user accounts with role-based access control
                </p>
              </a>
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
  clickable = false
}: { 
  icon: any; 
  name: string; 
  count: number; 
  active: boolean; 
  color: string;
  clickable?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]} ${clickable ? 'hover:shadow-lg hover:scale-105 transition-all cursor-pointer' : ''}`}>
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
        <div className="text-xs mt-2 font-medium opacity-70">Click to manage →</div>
      )}
    </div>
  );
}

function APIStatusBadge({ name, active }: { name: string; active: boolean }) {
  return (
    <div className={`p-3 rounded-lg border-2 flex items-center justify-between ${
      active 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <span className="font-medium text-sm">{name}</span>
      {active ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400" />
      )}
    </div>
  );
}
