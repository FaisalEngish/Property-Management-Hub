import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Repeat, Settings, Plus, Play, Pause, Edit, Trash } from "lucide-react";

export default function AutoScheduleTaskGenerator() {
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleFrequency, setNewRuleFrequency] = useState("weekly");

  const schedulingRules = [
    {
      id: 1,
      name: "Pool Cleaning Schedule",
      frequency: "Weekly",
      nextRun: "2025-01-22 10:00",
      department: "pool",
      taskTemplate: "Pool cleaning and chemical balance check",
      assignedTo: "Pool Team",
      property: "All Properties",
      status: "active",
      lastGenerated: "2025-01-15 10:00",
      tasksCreated: 12
    },
    {
      id: 2,
      name: "Deep Cleaning Rotation",
      frequency: "Monthly",
      nextRun: "2025-01-25 09:00",
      department: "cleaning",
      taskTemplate: "Deep cleaning of property including all rooms",
      assignedTo: "Housekeeping Team",
      property: "Villa Samui Breeze",
      status: "active",
      lastGenerated: "2024-12-25 09:00",
      tasksCreated: 8
    },
    {
      id: 3,
      name: "Garden Maintenance",
      frequency: "Bi-weekly",
      nextRun: "2025-01-23 08:00",
      department: "garden",
      taskTemplate: "Garden pruning, watering, and landscaping maintenance",
      assignedTo: "Garden Team",
      property: "Villa Aruna",
      status: "paused",
      lastGenerated: "2025-01-09 08:00",
      tasksCreated: 15
    },
    {
      id: 4,
      name: "AC System Inspection",
      frequency: "Monthly",
      nextRun: "2025-01-28 14:00",
      department: "maintenance",
      taskTemplate: "Air conditioning system inspection and filter replacement",
      assignedTo: "Maintenance Team",
      property: "All Properties",
      status: "active",
      lastGenerated: "2024-12-28 14:00",
      tasksCreated: 6
    },
    {
      id: 5,
      name: "Wi-Fi & Tech Check",
      frequency: "Weekly",
      nextRun: "2025-01-24 16:00",
      department: "general",
      taskTemplate: "Internet connectivity and smart device functionality check",
      assignedTo: "Tech Support",
      property: "All Properties",
      status: "active",
      lastGenerated: "2025-01-17 16:00",
      tasksCreated: 20
    }
  ];

  const generatedTasks = [
    {
      id: 1,
      title: "Pool Cleaning - Villa Samui Breeze",
      generatedBy: "Pool Cleaning Schedule",
      createdAt: "2025-01-21 10:00",
      assignedTo: "Pool Team",
      dueDate: "2025-01-21 15:00",
      status: "pending",
      department: "pool"
    },
    {
      id: 2,
      title: "Wi-Fi Check - Villa Aruna",
      generatedBy: "Wi-Fi & Tech Check",
      createdAt: "2025-01-21 16:00",
      assignedTo: "Tech Support",
      dueDate: "2025-01-21 17:00",
      status: "in-progress",
      department: "general"
    },
    {
      id: 3,
      title: "Deep Cleaning - Villa Paradise",
      generatedBy: "Deep Cleaning Rotation",
      createdAt: "2025-01-20 09:00",
      assignedTo: "Housekeeping Team",
      dueDate: "2025-01-20 17:00",
      status: "completed",
      department: "cleaning"
    }
  ];

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case "pool": return "bg-blue-100 text-blue-800";
      case "cleaning": return "bg-green-100 text-green-800";
      case "garden": return "bg-emerald-100 text-emerald-800";
      case "maintenance": return "bg-orange-100 text-orange-800";
      case "general": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-orange-100 text-orange-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const summaryStats = {
    activeRules: schedulingRules.filter(rule => rule.status === "active").length,
    totalTasksGenerated: schedulingRules.reduce((sum, rule) => sum + rule.tasksCreated, 0),
    pendingTasks: generatedTasks.filter(task => task.status === "pending").length,
    completedTasks: generatedTasks.filter(task => task.status === "completed").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Repeat className="w-8 h-8" />
            Auto-Schedule Task Generator
          </h1>
          <p className="text-gray-600">Automate recurring task creation with smart scheduling rules</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Scheduling Rules</TabsTrigger>
          <TabsTrigger value="tasks">Generated Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Rules</p>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.activeRules}</p>
                  </div>
                  <Play className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasks Generated</p>
                    <p className="text-2xl font-bold">{summaryStats.totalTasksGenerated}</p>
                  </div>
                  <Repeat className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Tasks</p>
                    <p className="text-2xl font-bold text-orange-600">{summaryStats.pendingTasks}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.completedTasks}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create New Rule */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Scheduling Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Input
                  placeholder="Rule name"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                />
                <Select value={newRuleFrequency} onValueChange={setNewRuleFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="villa-samui">Villa Samui Breeze</SelectItem>
                    <SelectItem value="villa-aruna">Villa Aruna</SelectItem>
                    <SelectItem value="villa-paradise">Villa Paradise</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="cleaning">
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="pool">Pool</SelectItem>
                    <SelectItem value="garden">Garden</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Assigned to" />
                <Button>Create Rule</Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Active Scheduling Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedulingRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.taskTemplate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(rule.status)}>
                          {rule.status}
                        </Badge>
                        <Badge className={getDepartmentColor(rule.department)}>
                          {rule.department}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Frequency</p>
                        <p className="text-sm font-medium">{rule.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Next Run</p>
                        <p className="text-sm font-medium">{rule.nextRun}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Assigned To</p>
                        <p className="text-sm font-medium">{rule.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Property</p>
                        <p className="text-sm font-medium">{rule.property}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tasks Created</p>
                        <p className="text-sm font-medium">{rule.tasksCreated}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Last generated: {rule.lastGenerated}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          {rule.status === "active" ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Resume
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">Generated by: {task.generatedBy}</p>
                        <p className="text-xs text-gray-500">
                          Created: {task.createdAt} • Due: {task.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDepartmentColor(task.department)}>
                        {task.department}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <span className="text-sm text-gray-600">{task.assignedTo}</span>
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
                <CardTitle>Task Generation by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Pool</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: "20%"}}></div>
                      </div>
                      <span className="text-sm">12</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>General</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: "33%"}}></div>
                      </div>
                      <span className="text-sm">20</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Garden</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{width: "25%"}}></div>
                      </div>
                      <span className="text-sm">15</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cleaning</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: "13%"}}></div>
                      </div>
                      <span className="text-sm">8</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Maintenance</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: "10%"}}></div>
                      </div>
                      <span className="text-sm">6</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Rate by Rule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">94%</p>
                    <p className="text-gray-600">Average Completion Rate</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Pool Cleaning Schedule</span>
                      <span className="font-semibold text-green-600">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Wi-Fi & Tech Check</span>
                      <span className="font-semibold text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Deep Cleaning Rotation</span>
                      <span className="font-semibold text-green-600">88%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">AC System Inspection</span>
                      <span className="font-semibold text-orange-600">83%</span>
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
              <CardTitle>Global System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Task Generation</h4>
                  <div className="flex items-center justify-between">
                    <span>Auto-generate tasks</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Skip holidays</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Weekend generation</span>
                    <Switch />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notifications</h4>
                  <div className="flex items-center justify-between">
                    <span>Rule creation alerts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Task generation alerts</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed generation alerts</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Default Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Default Assignment</label>
                    <Input placeholder="Unassigned" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Task Due Hours</label>
                    <Input type="number" placeholder="24" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Priority Level</label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
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