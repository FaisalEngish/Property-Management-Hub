import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Play, Settings, Users, Building, Calendar, DollarSign, CheckCircle, AlertCircle, Zap } from "lucide-react";

export default function SystemWideDemoIntegration() {
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [demoMode, setDemoMode] = useState("realistic");

  const demoModules = [
    {
      id: 1,
      name: "Property Management Demo",
      description: "Comprehensive property portfolio with Villa Samui Breeze, Villa Aruna, and Villa Paradise",
      status: "active",
      lastUpdated: "2025-01-22",
      records: 145,
      coverage: "100%",
      features: ["Properties", "Bookings", "Tasks", "Maintenance", "Financial Tracking"]
    },
    {
      id: 2,
      name: "Guest Services Demo",
      description: "Complete guest lifecycle from check-in to check-out with AI recommendations",
      status: "active",
      lastUpdated: "2025-01-22",
      records: 89,
      coverage: "95%",
      features: ["Guest Portal", "Smart Requests", "Activity Recommendations", "Service Timeline"]
    },
    {
      id: 3,
      name: "Financial Operations Demo",
      description: "Revenue tracking, commission calculations, and expense management",
      status: "active",
      lastUpdated: "2025-01-22",
      records: 267,
      coverage: "98%",
      features: ["Booking Revenue", "Commission Tracking", "Expense Reports", "Invoicing"]
    },
    {
      id: 4,
      name: "Staff Management Demo",
      description: "Staff profiles, task assignments, payroll, and performance tracking",
      status: "active",
      lastUpdated: "2025-01-22",
      records: 156,
      coverage: "92%",
      features: ["Staff Profiles", "Task Management", "Payroll", "Overtime Tracking"]
    },
    {
      id: 5,
      name: "Agent & Partner Demo",
      description: "Retail and referral agent management with commission tracking",
      status: "active",
      lastUpdated: "2025-01-22",
      records: 78,
      coverage: "88%",
      features: ["Agent Profiles", "Commission Tracking", "Performance Analytics", "Booking Engine"]
    }
  ];

  const demoUsers = [
    {
      id: 1,
      name: "John Admin",
      role: "admin",
      email: "admin@test.com",
      lastActive: "2025-01-22 09:30",
      sessionsCount: 15,
      modulesAccessed: 8
    },
    {
      id: 2,
      name: "Jane Manager",
      role: "portfolio-manager",
      email: "manager@test.com",
      lastActive: "2025-01-22 08:45",
      sessionsCount: 12,
      modulesAccessed: 6
    },
    {
      id: 3,
      name: "Bob Owner",
      role: "owner",
      email: "owner@test.com",
      lastActive: "2025-01-21 18:20",
      sessionsCount: 8,
      modulesAccessed: 4
    },
    {
      id: 4,
      name: "Sarah Staff",
      role: "staff",
      email: "staff@test.com",
      lastActive: "2025-01-22 07:15",
      sessionsCount: 20,
      modulesAccessed: 5
    },
    {
      id: 5,
      name: "Mike Agent",
      role: "retail-agent",
      email: "agent@test.com",
      lastActive: "2025-01-21 16:30",
      sessionsCount: 6,
      modulesAccessed: 3
    }
  ];

  const systemStats = {
    totalModules: demoModules.length,
    activeModules: demoModules.filter(m => m.status === "active").length,
    totalRecords: demoModules.reduce((sum, m) => sum + m.records, 0),
    averageCoverage: (demoModules.reduce((sum, m) => sum + parseInt(m.coverage), 0) / demoModules.length).toFixed(1)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "updating": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "portfolio-manager": return "bg-blue-100 text-blue-800";
      case "owner": return "bg-green-100 text-green-800";
      case "staff": return "bg-purple-100 text-purple-800";
      case "retail-agent": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCoverageColor = (coverage: string) => {
    const percent = parseInt(coverage);
    if (percent >= 95) return "text-green-600";
    if (percent >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8" />
            System-Wide Demo Integration
          </h1>
          <p className="text-gray-600">Comprehensive demo data management and system integration overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure Demo
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Refresh All Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modules">Demo Modules</TabsTrigger>
          <TabsTrigger value="users">Demo Users</TabsTrigger>
          <TabsTrigger value="integration">Integration Status</TabsTrigger>
          <TabsTrigger value="analytics">System Analytics</TabsTrigger>
          <TabsTrigger value="settings">Demo Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Modules</p>
                    <p className="text-2xl font-bold">{systemStats.totalModules}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Modules</p>
                    <p className="text-2xl font-bold text-green-600">{systemStats.activeModules}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Demo Records</p>
                    <p className="text-2xl font-bold text-purple-600">{systemStats.totalRecords.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Coverage</p>
                    <p className="text-2xl font-bold text-orange-600">{systemStats.averageCoverage}%</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="property">Property Management</SelectItem>
                    <SelectItem value="guest">Guest Services</SelectItem>
                    <SelectItem value="financial">Financial Operations</SelectItem>
                    <SelectItem value="staff">Staff Management</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="updating">Updating</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={demoMode} onValueChange={setDemoMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Demo Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic Data</SelectItem>
                    <SelectItem value="minimal">Minimal Data</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>

                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Module List */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoModules.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Database className="w-5 h-5 text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(module.status)}>
                          {module.status}
                        </Badge>
                        <span className={`font-bold ${getCoverageColor(module.coverage)}`}>
                          {module.coverage}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="font-medium">{module.lastUpdated}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Demo Records</p>
                        <p className="font-medium text-purple-600">{module.records}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Coverage</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{width: module.coverage}}
                            ></div>
                          </div>
                          <span className="text-sm">{module.coverage}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Features</p>
                        <p className="font-medium">{module.features.length} modules</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Features Included</p>
                        <div className="flex gap-1 flex-wrap">
                          {module.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {module.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{module.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Refresh Data</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demo User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <div className="text-right text-sm">
                        <p className="font-medium">{user.sessionsCount} sessions</p>
                        <p className="text-gray-500">{user.modulesAccessed} modules accessed</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-500">Last active:</p>
                        <p className="font-medium">{user.lastActive}</p>
                      </div>
                      <Button variant="outline" size="sm">Login As</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Integration Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Connection</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Demo Data Sync</span>
                  <Badge className="bg-green-100 text-green-800">Synced</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cross-Module References</span>
                  <Badge className="bg-green-100 text-green-800">Valid</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>User Authentication</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Endpoints</span>
                  <Badge className="bg-yellow-100 text-yellow-800">98% Responsive</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Consistency Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">99.2%</p>
                  <p className="text-gray-600">Overall Data Integrity</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Property Records</span>
                    <span className="font-semibold">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">User Profiles</span>
                    <span className="font-semibold">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Financial Data</span>
                    <span className="font-semibold">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Task Management</span>
                    <span className="font-semibold">99.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-gray-600">Total Demo Interactions</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Page Views</span>
                    <span className="font-semibold">856</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Calls</span>
                    <span className="font-semibold">391</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">User Sessions</span>
                    <span className="font-semibold">61</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Accessed Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Property Management</span>
                  <span className="font-semibold">34%</span>
                </div>
                <div className="flex justify-between">
                  <span>Financial Dashboard</span>
                  <span className="font-semibold">28%</span>
                </div>
                <div className="flex justify-between">
                  <span>Task Management</span>
                  <span className="font-semibold">18%</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest Services</span>
                  <span className="font-semibold">12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Staff Management</span>
                  <span className="font-semibold">8%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">245ms</p>
                  <p className="text-gray-600">Average Response Time</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-semibold">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-semibold">0.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="font-semibold">94.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demo Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Data Generation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Auto-refresh demo data</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Generate realistic timestamps</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cross-reference data integrity</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Refresh interval (hours)</label>
                      <Input type="number" defaultValue="24" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Demo Modes</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Default demo mode</label>
                      <Select defaultValue="realistic">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal Data</SelectItem>
                          <SelectItem value="realistic">Realistic Data</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">User session timeout (minutes)</label>
                      <Input type="number" defaultValue="60" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <Button variant="outline">Reset All Demo Data</Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Export Configuration</Button>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}