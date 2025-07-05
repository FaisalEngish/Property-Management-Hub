import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Calendar,
  Plus,
  Bell,
  Settings,
  Brain,
  Lightbulb,
  Droplet,
  Leaf,
  Bug,
  Wrench,
  Snowflake,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AiNotification, InsertAiNotification, AiReminderSetting } from "@shared/schema";

const ALERT_TYPE_CONFIG = {
  cleaning: { icon: <Lightbulb className="h-4 w-4" />, label: "Cleaning", color: "bg-blue-500" },
  electricity: { icon: <Zap className="h-4 w-4" />, label: "Electricity", color: "bg-yellow-500" },
  garden: { icon: <Leaf className="h-4 w-4" />, label: "Garden", color: "bg-green-500" },
  pest: { icon: <Bug className="h-4 w-4" />, label: "Pest Control", color: "bg-orange-500" },
  maintenance: { icon: <Wrench className="h-4 w-4" />, label: "Maintenance", color: "bg-gray-500" },
  ac: { icon: <Snowflake className="h-4 w-4" />, label: "AC Service", color: "bg-cyan-500" },
  water: { icon: <Droplet className="h-4 w-4" />, label: "Water", color: "bg-blue-600" },
  checkin: { icon: <UserCheck className="h-4 w-4" />, label: "Check-in", color: "bg-purple-500" },
  upgrade: { icon: <TrendingUp className="h-4 w-4" />, label: "Upgrade", color: "bg-pink-500" },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", variant: "secondary" as const, color: "text-gray-600" },
  medium: { label: "Medium", variant: "outline" as const, color: "text-blue-600" },
  high: { label: "High", variant: "destructive" as const, color: "text-orange-600" },
  critical: { label: "Critical", variant: "destructive" as const, color: "text-red-600" },
};

export default function AiNotificationsReminders() {
  const [selectedProperty, setSelectedProperty] = useState<string>("1");
  const [activeTab, setActiveTab] = useState("timeline");
  const [newTaskDialog, setNewTaskDialog] = useState(false);
  const [dismissDialog, setDismissDialog] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch AI notifications for selected property
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/ai-notifications", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/ai-notifications?propertyId=${selectedProperty}`),
  });

  // Fetch reminder settings
  const { data: reminderSettings } = useQuery({
    queryKey: ["/api/ai-reminder-settings", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/ai-reminder-settings?propertyId=${selectedProperty}`),
  });

  // Mark notification as done mutation
  const markAsDoneMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest("PATCH", `/api/ai-notifications/${notificationId}`, {
        status: "completed",
        actionTaken: true,
        actionTakenAt: new Date(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-notifications"] });
      toast({ title: "Notification marked as completed" });
    },
  });

  // Dismiss notification mutation
  const dismissMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiRequest("PATCH", `/api/ai-notifications/${id}`, {
        status: "dismissed",
        actionNotes: reason,
        actionTaken: true,
        actionTakenAt: new Date(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-notifications"] });
      setDismissDialog(null);
      toast({ title: "Notification dismissed" });
    },
  });

  // Snooze notification mutation
  const snoozeMutation = useMutation({
    mutationFn: ({ id, days }: { id: number; days: number }) => {
      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + days);
      return apiRequest("PATCH", `/api/ai-notifications/${id}`, {
        status: "snoozed",
        snoozeUntil,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-notifications"] });
      toast({ title: "Notification snoozed" });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (notification: AiNotification) =>
      apiRequest("POST", "/api/tasks", {
        title: notification.title,
        description: notification.description,
        priority: notification.priority,
        propertyId: notification.propertyId,
        dueDate: notification.dueDate,
        type: notification.alertType,
        sourceType: "ai_notification",
        sourceId: notification.id.toString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskDialog(false);
      toast({ title: "Task created successfully" });
    },
  });

  const activeNotifications = notifications?.filter((n: AiNotification) => 
    n.status === "active" && (!n.snoozeUntil || new Date(n.snoozeUntil) <= new Date())
  ) || [];

  const snoozedNotifications = notifications?.filter((n: AiNotification) => 
    n.status === "snoozed" && n.snoozeUntil && new Date(n.snoozeUntil) > new Date()
  ) || [];

  const completedNotifications = notifications?.filter((n: AiNotification) => 
    n.status === "completed" || n.status === "dismissed"
  ) || [];

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRelative = (date: string | null) => {
    if (!date) return "";
    const now = new Date();
    const target = new Date(date);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return "Due today";
    if (diff === 1) return "Due tomorrow";
    return `Due in ${diff} days`;
  };

  const NotificationCard = ({ notification }: { notification: AiNotification }) => {
    const config = ALERT_TYPE_CONFIG[notification.alertType as keyof typeof ALERT_TYPE_CONFIG];
    const priorityConfig = PRIORITY_CONFIG[notification.priority as keyof typeof PRIORITY_CONFIG];
    const isOverdue = notification.dueDate && new Date(notification.dueDate) < new Date();

    return (
      <Card className={`mb-4 ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${config?.color} text-white`}>
                {config?.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{notification.title}</CardTitle>
                <CardDescription className="mt-1">
                  {notification.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={priorityConfig.variant}>
                {priorityConfig.label}
              </Badge>
              {notification.aiConfidence && (
                <Badge variant="outline" className="text-xs">
                  AI: {Math.round(Number(notification.aiConfidence) * 100)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Due Date: {formatDate(notification.dueDate)}</span>
              {notification.dueDate && (
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {formatDateRelative(notification.dueDate)}
                </span>
              )}
            </div>
            {notification.lastServiceDate && (
              <div className="text-sm text-muted-foreground">
                Last Service: {formatDate(notification.lastServiceDate)}
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => markAsDoneMutation.mutate(notification.id)}
                disabled={markAsDoneMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark as Done
              </Button>
              
              <Dialog open={newTaskDialog} onOpenChange={setNewTaskDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Task from Alert</DialogTitle>
                    <DialogDescription>
                      This will create a new task based on this AI notification.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Task Title</label>
                      <Input value={notification.title} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea value={notification.description || ""} readOnly />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => createTaskMutation.mutate(notification)}
                        disabled={createTaskMutation.isPending}
                      >
                        Create Task
                      </Button>
                      <Button variant="outline" onClick={() => setNewTaskDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={dismissDialog === notification.id} onOpenChange={(open) => 
                setDismissDialog(open ? notification.id : null)
              }>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Dismiss
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dismiss Notification</DialogTitle>
                    <DialogDescription>
                      Provide a reason for dismissing this alert.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter reason for dismissal..."
                      id="dismiss-reason"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const reason = (document.getElementById('dismiss-reason') as HTMLTextAreaElement)?.value;
                          dismissMutation.mutate({ id: notification.id, reason });
                        }}
                        disabled={dismissMutation.isPending}
                      >
                        Dismiss Alert
                      </Button>
                      <Button variant="outline" onClick={() => setDismissDialog(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Select onValueChange={(days) => snoozeMutation.mutate({ id: notification.id, days: Number(days) })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Snooze" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Notifications & Reminders
          </h1>
          <p className="text-muted-foreground mt-1">
            Smart alerts and automated reminders for property management
          </p>
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Villa Aruna (Demo)</SelectItem>
            <SelectItem value="2">Villa Samui Breeze</SelectItem>
            <SelectItem value="3">Villa Tropical Paradise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">🚨 Active Alerts</TabsTrigger>
          <TabsTrigger value="snoozed">😴 Snoozed</TabsTrigger>
          <TabsTrigger value="completed">✅ Completed</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{activeNotifications.length}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {activeNotifications.filter(n => n.dueDate && new Date(n.dueDate) < new Date()).length}
                </div>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {activeNotifications.filter(n => n.priority === "high" || n.priority === "critical").length}
                </div>
                <p className="text-xs text-muted-foreground">Critical items</p>
              </CardContent>
            </Card>
          </div>

          {activeNotifications.length === 0 ? (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                No active notifications for this property. AI monitoring is working to detect upcoming maintenance needs.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {activeNotifications.map((notification: AiNotification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="snoozed" className="space-y-4">
          <h3 className="text-lg font-semibold">Snoozed Notifications</h3>
          {snoozedNotifications.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>No snoozed notifications.</AlertDescription>
            </Alert>
          ) : (
            snoozedNotifications.map((notification: AiNotification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          {completedNotifications.slice(0, 10).map((notification: AiNotification) => {
            const config = ALERT_TYPE_CONFIG[notification.alertType as keyof typeof ALERT_TYPE_CONFIG];
            return (
              <Card key={notification.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${config?.color} text-white opacity-60`}>
                      {config?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {notification.status === "completed" ? "Completed" : "Dismissed"} on{" "}
                        {formatDate(notification.actionTakenAt)}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {notification.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Reminder Settings
              </CardTitle>
              <CardDescription>
                Configure how AI monitors and alerts for this property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ALERT_TYPE_CONFIG).map(([type, config]) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.color} text-white`}>
                        {config.icon}
                      </div>
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}