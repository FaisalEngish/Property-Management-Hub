import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertCircle, 
  Bell, 
  Shield, 
  CheckCircle, 
  Plus,
  Search,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle
} from "lucide-react";

export default function AlertManagement() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Demo data
  const alertRules = [
    {
      id: 1,
      name: "Appliance Repair Overdue",
      description: "Alert when appliance repairs are overdue by more than 24 hours",
      triggerType: "appliance_repair",
      alertLevel: "warning",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Critical System Health",
      description: "Alert for critical system health issues requiring immediate attention",
      triggerType: "system_health",
      alertLevel: "critical",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Booking Payment Overdue",
      description: "Alert when guest payment is overdue",
      triggerType: "booking_overdue",
      alertLevel: "warning",
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ];

  const alertLogs = [
    {
      id: 1,
      message: "AC Unit #AC-001 repair overdue by 2 days",
      details: "Villa Samui Breeze - Central AC unit requires maintenance attention",
      triggerType: "appliance_repair",
      alertLevel: "warning",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      message: "Database connection issues detected",
      details: "System experiencing intermittent connectivity problems affecting booking system",
      triggerType: "system_health",
      alertLevel: "critical",
      status: "acknowledged",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      message: "Pool Pump #PP-003 maintenance scheduled",
      details: "Villa Tropical Paradise - Weekly pool pump maintenance due",
      triggerType: "property_maintenance",
      alertLevel: "warning",
      status: "resolved",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const alertAnalytics = {
    totalAlerts: 47,
    resolutionRate: 87,
    avgResponseTime: 2.4,
    pendingAlerts: alertLogs.filter(log => log.status === 'pending').length,
    criticalAlerts: alertLogs.filter(log => log.alertLevel === 'critical' && log.status === 'pending').length
  };

  const getStatusBadge = (status: string) => {
    if (status === "pending") return <Badge className="bg-yellow-500">Pending</Badge>;
    if (status === "acknowledged") return <Badge className="bg-blue-500">Acknowledged</Badge>;
    if (status === "resolved") return <Badge className="bg-green-500">Resolved</Badge>;
    return <Badge className="bg-gray-500">Dismissed</Badge>;
  };

  const getAlertLevelBadge = (level: string) => {
    return level === "critical" ? 
      <Badge variant="destructive">Critical</Badge> : 
      <Badge variant="secondary">Warning</Badge>;
  };

  const getTriggerTypeIcon = (type: string) => {
    if (type === "appliance_repair") return <AlertCircle className="h-4 w-4" />;
    if (type === "booking_overdue") return <Clock className="h-4 w-4" />;
    if (type === "property_maintenance") return <Shield className="h-4 w-4" />;
    if (type === "utility_bill") return <TrendingUp className="h-4 w-4" />;
    if (type === "staff_task") return <Users className="h-4 w-4" />;
    if (type === "guest_complaint") return <AlertTriangle className="h-4 w-4" />;
    if (type === "system_health") return <Bell className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage system alerts and notifications</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Alert Rules</TabsTrigger>
            <TabsTrigger value="logs">Alert Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alertAnalytics.totalAlerts}</div>
                  <p className="text-xs text-gray-500">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{alertAnalytics.pendingAlerts}</div>
                  <p className="text-xs text-gray-500">Requires attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Critical Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{alertAnalytics.criticalAlerts}</div>
                  <p className="text-xs text-gray-500">Urgent action needed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{alertAnalytics.resolutionRate}%</div>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getTriggerTypeIcon(log.triggerType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{log.message}</p>
                        <p className="text-sm text-gray-500">{log.details}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getAlertLevelBadge(log.alertLevel)}
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alert Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Alert Rules</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Trigger Type</TableHead>
                      <TableHead>Alert Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-gray-500">{rule.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTriggerTypeIcon(rule.triggerType)}
                            <span className="capitalize">{rule.triggerType.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getAlertLevelBadge(rule.alertLevel)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(rule.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alert Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Alert Logs</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.message}</div>
                            <div className="text-sm text-gray-500">{log.details}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTriggerTypeIcon(log.triggerType)}
                            <span className="capitalize">{log.triggerType.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getAlertLevelBadge(log.alertLevel)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.status)}
                        </TableCell>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {log.status === 'pending' && (
                              <>
                                <Button variant="outline" size="sm">Acknowledge</Button>
                                <Button variant="outline" size="sm">Resolve</Button>
                              </>
                            )}
                            {log.status === 'acknowledged' && (
                              <Button variant="outline" size="sm">Resolve</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Alert Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS Alerts</span>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Critical Alert Threshold</span>
                    <span className="font-medium">Immediate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Warning Alert Threshold</span>
                    <span className="font-medium">5 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-resolve After</span>
                    <span className="font-medium">24 hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}