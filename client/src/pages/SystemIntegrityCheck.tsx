import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  Server, 
  Users, 
  Building,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  Clock,
  Activity
} from "lucide-react";

export default function SystemIntegrityCheck() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const systemChecks = [
    {
      category: "Database Integrity",
      icon: Database,
      status: "healthy",
      issues: 0,
      checks: [
        { name: "Property Records", status: "pass", description: "All property records are valid" },
        { name: "Booking Consistency", status: "pass", description: "No orphaned booking records" },
        { name: "User Account Integrity", status: "warning", description: "2 inactive accounts need review" },
        { name: "Financial Records", status: "pass", description: "All transactions balanced" },
      ]
    },
    {
      category: "API Endpoints",
      icon: Server,
      status: "healthy",
      issues: 1,
      checks: [
        { name: "Authentication Service", status: "pass", description: "All auth endpoints responding" },
        { name: "Property Management API", status: "pass", description: "CRUD operations working" },
        { name: "Booking Engine API", status: "warning", description: "Slow response times detected" },
        { name: "Financial API", status: "pass", description: "All payment endpoints active" },
      ]
    },
    {
      category: "User Access Control",
      icon: Users,
      status: "warning",
      issues: 3,
      checks: [
        { name: "Role Permissions", status: "pass", description: "All roles configured correctly" },
        { name: "Admin Access", status: "pass", description: "Admin permissions verified" },
        { name: "Guest Access", status: "warning", description: "3 expired guest sessions found" },
        { name: "Staff Permissions", status: "pass", description: "Staff access levels correct" },
      ]
    },
    {
      category: "Property Data",
      icon: Building,
      status: "healthy",
      issues: 0,
      checks: [
        { name: "Property Listings", status: "pass", description: "All properties have complete data" },
        { name: "Amenity Information", status: "pass", description: "Amenities properly configured" },
        { name: "Pricing Data", status: "pass", description: "All pricing rules valid" },
        { name: "Availability Calendar", status: "pass", description: "Calendar sync operational" },
      ]
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "warning",
      message: "3 guest sessions expired and need cleanup",
      timestamp: "2025-01-22 09:30:00",
      category: "User Access"
    },
    {
      id: 2,
      type: "info",
      message: "Database backup completed successfully",
      timestamp: "2025-01-22 08:00:00",
      category: "System"
    },
    {
      id: 3,
      type: "warning",
      message: "Booking API response time increased to 2.3s",
      timestamp: "2025-01-22 07:45:00",
      category: "Performance"
    },
    {
      id: 4,
      type: "success",
      message: "Security scan completed - no vulnerabilities found",
      timestamp: "2025-01-22 06:00:00",
      category: "Security"
    }
  ];

  const performanceMetrics = [
    { name: "Database Query Speed", value: 95, unit: "ms avg", status: "good" },
    { name: "API Response Time", value: 230, unit: "ms avg", status: "warning" },
    { name: "Memory Usage", value: 68, unit: "% used", status: "good" },
    { name: "CPU Utilization", value: 42, unit: "% avg", status: "good" },
    { name: "Storage Usage", value: 73, unit: "% used", status: "good" },
    { name: "Active Connections", value: 156, unit: "concurrent", status: "good" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
      case "healthy":
      case "good":
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
      case "healthy":
      case "good":
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
      case "critical":
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const startSystemScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            System Integrity Check
          </h1>
          <p className="text-gray-600">Monitor system health, database integrity, and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={startSystemScan} disabled={isScanning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Full Scan'}
          </Button>
        </div>
      </div>

      {isScanning && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="font-medium">System Scan in Progress...</span>
            </div>
            <Progress value={scanProgress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">{scanProgress}% Complete</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Status</p>
                    <p className="text-2xl font-bold text-green-600">Healthy</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Issues</p>
                    <p className="text-2xl font-bold text-yellow-600">4</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Scan</p>
                    <p className="text-2xl font-bold">2h ago</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-green-600">99.8%</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemChecks.map((check, index) => {
              const IconComponent = check.icon;
              const StatusIcon = getStatusIcon(check.status);
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        {check.category}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-5 h-5" />
                        <Badge className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {check.checks.map((item, idx) => {
                        const ItemStatusIcon = getStatusIcon(item.status);
                        return (
                          <div key={idx} className="flex items-center justify-between p-2 rounded border">
                            <div className="flex items-center gap-2">
                              <ItemStatusIcon className="w-4 h-4" />
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-gray-600">{item.description}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(item.status)} variant="outline">
                              {item.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Health Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <Database className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-medium">Total Tables</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">Healthy Tables</p>
                  <p className="text-2xl font-bold text-green-600">22</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="font-medium">Need Attention</p>
                  <p className="text-2xl font-bold text-yellow-600">2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Table Status Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "properties", records: 1245, status: "healthy", lastCheck: "5 min ago" },
                  { name: "bookings", records: 3567, status: "healthy", lastCheck: "5 min ago" },
                  { name: "users", records: 892, status: "warning", lastCheck: "5 min ago" },
                  { name: "tasks", records: 2134, status: "healthy", lastCheck: "5 min ago" },
                  { name: "financial_transactions", records: 8901, status: "healthy", lastCheck: "5 min ago" },
                ].map((table, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{table.name}</p>
                        <p className="text-sm text-gray-600">{table.records.toLocaleString()} records</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{table.lastCheck}</span>
                      <Badge className={getStatusColor(table.status)}>
                        {table.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{metric.name}</p>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>SSL Certificate</span>
                    <Badge className="bg-green-100 text-green-800">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Firewall Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Security Scan</span>
                    <Badge className="bg-blue-100 text-blue-800">6h ago</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Login Attempts</span>
                    <Badge className="bg-yellow-100 text-yellow-800">3 today</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Sessions</span>
                    <span className="font-bold">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Sessions</span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Guest Sessions</span>
                    <span className="font-bold">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Expired Sessions</span>
                    <span className="font-bold text-yellow-600">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <Alert key={alert.id}>
                    <AlertDescription className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-500" />}
                        <div>
                          <p>{alert.message}</p>
                          <p className="text-sm text-gray-500">{alert.category} • {alert.timestamp}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{alert.type}</Badge>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}