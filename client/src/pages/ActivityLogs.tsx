import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Search, Filter, Download, Eye, Calendar, User, Shield } from "lucide-react";

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  const activityLogs = [
    {
      id: 1,
      timestamp: "2025-01-21 15:42:33",
      user: "John Admin",
      userRole: "admin",
      action: "USER_LOGIN",
      entity: "System",
      details: "Admin user logged in successfully",
      ipAddress: "192.168.1.100",
      severity: "info"
    },
    {
      id: 2,
      timestamp: "2025-01-21 15:40:15",
      user: "Jane Manager",
      userRole: "portfolio-manager",
      action: "PROPERTY_UPDATE",
      entity: "Villa Samui Breeze",
      details: "Updated property pricing from $150/night to $175/night",
      ipAddress: "192.168.1.101",
      severity: "medium"
    },
    {
      id: 3,
      timestamp: "2025-01-21 15:35:22",
      user: "Bob Staff",
      userRole: "staff",
      action: "TASK_COMPLETED",
      entity: "Pool Cleaning Task #45",
      details: "Pool cleaning task marked as completed with photos uploaded",
      ipAddress: "192.168.1.102",
      severity: "low"
    },
    {
      id: 4,
      timestamp: "2025-01-21 15:30:08",
      user: "John Admin",
      userRole: "admin",
      action: "USER_PERMISSIONS_MODIFIED",
      entity: "Staff User: Carol Wilson",
      details: "Granted property management permissions to staff user",
      ipAddress: "192.168.1.100",
      severity: "high"
    },
    {
      id: 5,
      timestamp: "2025-01-21 15:25:41",
      user: "System",
      userRole: "system",
      action: "BOOKING_CREATED",
      entity: "Booking #BK-2025-0156",
      details: "New booking created via Hostaway API integration",
      ipAddress: "API",
      severity: "medium"
    },
    {
      id: 6,
      timestamp: "2025-01-21 15:20:17",
      user: "Alice Owner",
      userRole: "owner",
      action: "PAYOUT_REQUESTED",
      entity: "Owner Payout #PO-2025-0089",
      details: "Requested payout of $2,450.00 for December earnings",
      ipAddress: "192.168.1.103",
      severity: "medium"
    },
    {
      id: 7,
      timestamp: "2025-01-21 15:15:52",
      user: "John Admin",
      userRole: "admin",
      action: "FINANCE_RESET",
      entity: "User Balance: Bob Johnson",
      details: "Admin reset user balance from $1,200 to $0 - Reason: Account reconciliation",
      ipAddress: "192.168.1.100",
      severity: "critical"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      case "info": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "portfolio-manager": return "bg-blue-100 text-blue-800";
      case "staff": return "bg-green-100 text-green-800";
      case "owner": return "bg-purple-100 text-purple-800";
      case "system": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "USER_LOGIN": return <User className="w-4 h-4" />;
      case "PROPERTY_UPDATE": return <Eye className="w-4 h-4" />;
      case "TASK_COMPLETED": return <Activity className="w-4 h-4" />;
      case "USER_PERMISSIONS_MODIFIED": return <Shield className="w-4 h-4" />;
      case "FINANCE_RESET": return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const summaryStats = {
    totalLogs: activityLogs.length,
    criticalActions: activityLogs.filter(log => log.severity === "critical").length,
    adminActions: activityLogs.filter(log => log.userRole === "admin").length,
    systemActions: activityLogs.filter(log => log.userRole === "system").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Activity Logs
          </h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button>
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="critical">Critical Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Log Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Logs</p>
                    <p className="text-2xl font-bold">{summaryStats.totalLogs}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Critical Actions</p>
                    <p className="text-2xl font-bold text-red-600">{summaryStats.criticalActions}</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admin Actions</p>
                    <p className="text-2xl font-bold">{summaryStats.adminActions}</p>
                  </div>
                  <User className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Actions</p>
                    <p className="text-2xl font-bold">{summaryStats.systemActions}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admin Users</SelectItem>
                    <SelectItem value="portfolio-manager">Portfolio Managers</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="owner">Owners</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="USER_LOGIN">User Login</SelectItem>
                    <SelectItem value="PROPERTY_UPDATE">Property Update</SelectItem>
                    <SelectItem value="TASK_COMPLETED">Task Completed</SelectItem>
                    <SelectItem value="USER_PERMISSIONS_MODIFIED">Permissions Modified</SelectItem>
                    <SelectItem value="FINANCE_RESET">Finance Reset</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user}
                            </span>
                            <Badge className={getRoleColor(log.userRole)} variant="outline">
                              {log.userRole}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {log.timestamp}
                            </span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {log.entity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Critical Actions Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.filter(log => log.severity === "critical" || log.severity === "high").map((log) => (
                  <div key={log.id} className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-red-800">{log.action.replace(/_/g, ' ')}</p>
                          <Badge className="bg-red-200 text-red-800">{log.severity}</Badge>
                        </div>
                        <p className="text-sm text-red-700 mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-xs text-red-600">
                          <span>User: {log.user}</span>
                          <span>Entity: {log.entity}</span>
                          <span>Time: {log.timestamp}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity by User Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Admin</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: "60%"}}></div>
                      </div>
                      <span className="text-sm">3</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Portfolio Manager</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: "20%"}}></div>
                      </div>
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Staff</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: "20%"}}></div>
                      </div>
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Owner</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: "20%"}}></div>
                      </div>
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>System</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-500 h-2 rounded-full" style={{width: "20%"}}></div>
                      </div>
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Critical</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: "14%"}}></div>
                      </div>
                      <span className="text-sm">{summaryStats.criticalActions}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>High</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: "14%"}}></div>
                      </div>
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Medium</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: "43%"}}></div>
                      </div>
                      <span className="text-sm">3</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: "14%"}}></div>
                      </div>
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Info</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: "14%"}}></div>
                      </div>
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logging Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Log Retention</h4>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Auto Export</h4>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Alert Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span>Critical Action Alerts</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Login Attempts</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Permission Changes</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Financial Actions</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}