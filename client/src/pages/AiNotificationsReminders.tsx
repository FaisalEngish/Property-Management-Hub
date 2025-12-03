import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Building,
  Settings,
  Zap,
  MessageSquare,
  Calendar,
  DollarSign,
  Mail,
  Smartphone,
  Target,
  TrendingUp,
  Bot,
  Activity
} from "lucide-react";

export default function AiNotificationsReminders() {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    inApp: true,
    slack: false
  });

  // Fetch properties from API
  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch AI insights from API
  const { data: aiInsights = [] } = useQuery<any[]>({
    queryKey: ["/api/ai-insights"],
  });

  // Fetch notification history from API
  const { data: notificationHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications/history"],
  });

  // Fetch automation rules from API
  const { data: automationRules = [] } = useQuery<any[]>({
    queryKey: ["/api/automation-rules"],
  });


  const getTypeIcon = (type: string) => {
    switch (type) {
      case "maintenance": return Settings;
      case "booking": return Calendar;
      case "guest": return Users;
      case "financial": return DollarSign;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "maintenance": return "text-blue-500";
      case "booking": return "text-green-500";
      case "guest": return "text-purple-500";
      case "financial": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatWithConversion = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            AI Notifications & Reminders
          </h1>
          <p className="text-gray-600">Intelligent alerts and automated reminders powered by AI analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure AI
          </Button>
          <Button>
            <Bell className="w-4 h-4 mr-2" />
            Test Notification
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Insights</p>
                    <p className="text-2xl font-bold">{aiInsights.length}</p>
                  </div>
                  <Brain className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-red-600">
                      {aiInsights.filter(i => i.priority === 'high').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(aiInsights.reduce((sum, i) => sum + i.confidence, 0) / aiInsights.length)}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Est. Savings</p>
                    <p className="text-2xl font-bold text-blue-600">₹2,500</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Label>Filter by Property:</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.name}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights List */}
          <div className="space-y-4">
            {aiInsights.map((insight) => {
              const TypeIcon = getTypeIcon(insight.type);
              
              return (
                <Card key={insight.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TypeIcon className={`w-6 h-6 ${getTypeColor(insight.type)}`} />
                        <div>
                          <h3 className="font-semibold text-lg">{insight.title}</h3>
                          <p className="text-sm text-gray-600">{insight.property}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{insight.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-600 font-medium">Suggested Action</p>
                        <p className="text-blue-800">{insight.suggestedAction}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-600 font-medium">Estimated Cost</p>
                        <p className="text-green-800">
                          {insight.estimatedCost > 0 
                            ? formatWithConversion(insight.estimatedCost, insight.currency)
                            : "No cost"
                          }
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-orange-600 font-medium">Due Date</p>
                        <p className="text-orange-800">{insight.dueDate}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-4">
                      <p className="text-sm text-gray-600 font-medium mb-1">AI Reasoning:</p>
                      <p className="text-gray-700 text-sm">{insight.aiReasoning}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept & Schedule
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Discuss
                      </Button>
                      <Button variant="outline" size="sm">
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.frequency}</p>
                        </div>
                      </div>
                      <Switch checked={rule.enabled} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Trigger Condition</p>
                        <p>{rule.trigger}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Action</p>
                        <p>{rule.action}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-gray-500 font-medium text-sm">Applied to:</p>
                      <div className="flex gap-2 mt-1">
                        {rule.properties.map((property, index) => (
                          <Badge key={index} variant="outline">{property}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notificationHistory.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {notification.channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                      {notification.channel === 'sms' && <Smartphone className="w-4 h-4 text-green-500" />}
                      <div>
                        <p className="font-medium text-sm">{notification.subject}</p>
                        <p className="text-xs text-gray-600">To: {notification.recipient}</p>
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        notification.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {notification.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Email Alerts</p>
                    <p className="text-sm text-gray-600">Send notifications via email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, email: checked})
                    }
                  />
                </div>
                <div>
                  <Label>Default Recipients</Label>
                  <Input value="admin@hostpilotpro.com" className="mt-1" />
                </div>
                <div>
                  <Label>Email Template</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Template</SelectItem>
                      <SelectItem value="detailed">Detailed Template</SelectItem>
                      <SelectItem value="minimal">Minimal Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable SMS Alerts</p>
                    <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, sms: checked})
                    }
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value="+66 89 123 4567" className="mt-1" />
                </div>
                <div>
                  <Label>Priority Threshold</Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="medium">Medium & High</SelectItem>
                      <SelectItem value="high">High Priority Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>AI Analysis Frequency</Label>
                <Select defaultValue="hourly">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Minimum Confidence Level</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input type="range" min="50" max="95" defaultValue="75" className="flex-1" />
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Learning Mode</p>
                  <p className="text-sm text-gray-600">Allow AI to learn from user actions</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Proactive Suggestions</p>
                  <p className="text-sm text-gray-600">Generate preventive recommendations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button>Save AI Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}