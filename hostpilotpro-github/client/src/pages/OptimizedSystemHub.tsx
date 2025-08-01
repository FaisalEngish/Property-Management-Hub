import React, { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Server, 
  Activity,
  Settings,
  BarChart3,
  Shield,
  Database,
  ArrowLeft,
  Clock,
  Zap
} from "lucide-react";

import LazyChart from "@/components/LazyChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Lazy load detailed system modules
const DetailedUserManagement = lazy(() => import("./UserManagement"));
const DetailedSettings = lazy(() => import("./SimpleSettings"));
const DetailedAutomation = lazy(() => import("./AutomationManagement"));

interface SystemSummary {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
  };
  systemStats: {
    totalProperties: number;
    activeTasks: number;
    systemUptime: string;
    apiCallsToday: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
  }>;
}

export default function OptimizedSystemHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Single API call for system hub summary
  const { data: systemData, isLoading, error } = useQuery({
    queryKey: ['/api/system-hub/summary'],
    queryFn: () => 
      fetch('/api/system-hub/summary', { credentials: 'include' })
        .then(res => res.json()),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  });

  // If a detailed module is selected, render it
  if (selectedModule) {
    const moduleComponents = {
      'users': DetailedUserManagement,
      'settings': DetailedSettings,
      'automation': DetailedAutomation
    };

    const Component = moduleComponents[selectedModule as keyof typeof moduleComponents];
    
    if (Component) {
      return (
        <div>
          <div className="p-4 border-b bg-white">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to System Hub
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)} Management
              </h1>
            </div>
          </div>
              
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-2">Loading system module...</p>
              </div>
            </div>
          }>
            <Component />
          </Suspense>
        </div>
      );
    }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Hub</h1>
          <p className="text-gray-600 mt-1">
            Complete system administration with real-time monitoring and management
          </p>
        </div>
      </div>

      {/* Summary Cards - Always visible */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-20">
                  <LoadingSpinner size="md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Failed to load system summary</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : systemData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {systemData.userStats?.totalUsers || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {systemData.userStats?.activeUsers || 0} active
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Properties</p>
                        <p className="text-2xl font-bold text-green-600">
                          {systemData.systemStats?.totalProperties || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {systemData.systemStats?.activeTasks || 0} active tasks
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">System Uptime</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {systemData.systemStats?.systemUptime || '99.9%'}
                        </p>
                        <p className="text-xs text-gray-500">Last 30 days</p>
                      </div>
                      <Server className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">API Calls</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {systemData.systemStats?.apiCallsToday?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                      <Zap className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
        </div>
      ) : null}

      {/* Tabs for different views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setSelectedModule('users')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users & Roles
                </Button>
                <Button
                  onClick={() => setSelectedModule('settings')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
                <Button
                  onClick={() => setSelectedModule('automation')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Automation & Tasks
                </Button>
              </CardContent>
            </Card>

            {/* User Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {systemData?.userStats?.usersByRole && (
                  <div className="space-y-3">
                    {Object.entries(systemData.userStats.usersByRole).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center">
                        <span className="text-sm capitalize text-gray-600">{role}:</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent System Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {systemData?.recentActivity && systemData.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {systemData.recentActivity.map((activity: any) => (
                          <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{activity.type || 'System Event'}</h4>
                              <p className="text-sm text-gray-600">{activity.description || 'No description'}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {activity.timestamp || 'Unknown time'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No recent activity data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab - Lazy loaded charts */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LazyChart
                    title="System Performance"
                    description="24-hour system metrics"
                    endpoint="/api/charts/system-performance?period=24h"
                    chartType="line"
                    height={300}
                  />
                  
                  <LazyChart
                    title="User Activity"
                    description="Daily active users"
                    endpoint="/api/charts/user-activity?period=7d"
                    chartType="bar"
                    height={300}
                  />
                </div>
              </TabsContent>

              {/* Modules Tab */}
              <TabsContent value="modules">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedModule('users')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        User Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Manage user accounts, roles, and permissions
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline">
                          {systemData?.userStats?.totalUsers || 0} users
                        </Badge>
                        <Button variant="outline" size="sm">
                          Open Module
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedModule('settings')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-green-600" />
                        System Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Configure system-wide settings and preferences
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin Only
                        </Badge>
                        <Button variant="outline" size="sm">
                          Open Module
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedModule('automation')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        Automation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Manage automated tasks and system workflows
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline">
                          {systemData?.systemStats?.activeTasks || 0} active
                        </Badge>
                        <Button variant="outline" size="sm">
                          Open Module
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
        </Tabs>
      </div>
    </>
  );
}