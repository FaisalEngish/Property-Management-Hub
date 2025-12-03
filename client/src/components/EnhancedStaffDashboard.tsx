import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  Users, 
  AlertTriangle,
  Target,
  Award,
  TrendingUp,
  FileText,
  Camera
} from "lucide-react";
import TaskScheduleView from "@/components/TaskScheduleView";
import { useAuth } from "@/hooks/useAuth";

interface StaffDashboardProps {
  department?: string;
  staffName?: string;
}

export default function EnhancedStaffDashboard({ 
  department = "housekeeping",
  staffName = "Staff Member"
}: StaffDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("schedule");

  // Department-specific configurations
  const departmentConfig = {
    housekeeping: {
      name: "Housekeeping",
      color: "blue",
      icon: CheckSquare,
      tasks: ["Room Cleaning", "Laundry", "Guest Checkout", "Deep Cleaning"],
      metrics: {
        roomsCleaned: 156,
        averageTime: "45 min",
        rating: 4.8,
        efficiency: 92
      }
    },
    pool: {
      name: "Pool Maintenance",
      color: "cyan",
      icon: Target,
      tasks: ["Chemical Testing", "Skimming", "Vacuuming", "Equipment Check"],
      metrics: {
        poolsCleaned: 42,
        averageTime: "30 min",
        rating: 4.9,
        efficiency: 95
      }
    },
    garden: {
      name: "Garden Maintenance",
      color: "green",
      icon: TrendingUp,
      tasks: ["Watering", "Pruning", "Lawn Care", "Pest Control"],
      metrics: {
        areasManaged: 28,
        averageTime: "60 min",
        rating: 4.7,
        efficiency: 88
      }
    },
    maintenance: {
      name: "Property Maintenance",
      color: "red",
      icon: AlertTriangle,
      tasks: ["Repairs", "Inspections", "Preventive Care", "Emergency Fix"],
      metrics: {
        issuesFixed: 73,
        averageTime: "90 min",
        rating: 4.6,
        efficiency: 90
      }
    },
    host: {
      name: "Host Services",
      color: "purple",
      icon: Users,
      tasks: ["Guest Welcome", "Check-in", "Concierge", "Problem Resolution"],
      metrics: {
        guestsServed: 124,
        averageTime: "25 min",
        rating: 4.9,
        efficiency: 96
      }
    },
    pest: {
      name: "Pest Control",
      color: "orange",
      icon: Award,
      tasks: ["Inspection", "Treatment", "Prevention", "Follow-up"],
      metrics: {
        treatments: 18,
        averageTime: "45 min",
        rating: 4.8,
        efficiency: 94
      }
    }
  };

  const config = departmentConfig[department as keyof typeof departmentConfig] || departmentConfig.housekeeping;
  const IconComponent = config.icon;

  // Mock data for staff performance
  const todayStats = {
    tasksAssigned: 8,
    tasksCompleted: 6,
    tasksInProgress: 2,
    hoursWorked: 6.5,
    efficiency: 92
  };

  const weeklyStats = {
    totalTasks: 45,
    completedTasks: 42,
    averageRating: 4.8,
    overtimeHours: 2.5,
    bonusEarned: 450
  };

  // Recent completions will be fetched from API
  const recentCompletions: any[] = [];

  const handleTaskUpdate = (taskId: number, updates: any) => {
    console.log(`Updating task ${taskId}:`, updates);
    // Here you would typically call an API to update the task
  };

  const handleExportTasks = (tasks: any[]) => {
    console.log("Exporting tasks:", tasks);
    // Here you would generate and download a CSV/PDF export
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <IconComponent className={`h-8 w-8 text-${config.color}-500`} />
            {config.name} Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {staffName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {department.charAt(0).toUpperCase() + department.slice(1)} Team
          </Badge>
          <Badge variant="outline" className="text-sm">
            Efficiency: {todayStats.efficiency}%
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold">{todayStats.tasksCompleted}/{todayStats.tasksAssigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Hours Worked</p>
                <p className="text-2xl font-bold">{todayStats.hoursWorked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{weeklyStats.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{weeklyStats.averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            My Tasks
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <TaskScheduleView
            userRole="staff"
            staffDepartment={department}
            onTaskUpdate={handleTaskUpdate}
            onExportTasks={handleExportTasks}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Task list would go here - simplified for demo */}
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Active tasks are displayed in the Schedule tab</p>
                  <p className="text-sm">Switch to Schedule view for full task management</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasks Completed</span>
                    <span className="font-semibold">{weeklyStats.completedTasks}/{weeklyStats.totalTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-semibold">{weeklyStats.averageRating}/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overtime Hours</span>
                    <span className="font-semibold">{weeklyStats.overtimeHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bonus Earned</span>
                    <span className="font-semibold text-green-600">{weeklyStats.bonusEarned} THB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>{config.name} Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Completed</span>
                    <span className="font-semibold">{config.metrics.roomsCleaned || config.metrics.poolsCleaned || config.metrics.areasManaged || config.metrics.issuesFixed || config.metrics.guestsServed || config.metrics.treatments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Time</span>
                    <span className="font-semibold">{config.metrics.averageTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Rating</span>
                    <span className="font-semibold">{config.metrics.rating}/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Efficiency</span>
                    <span className="font-semibold">{config.metrics.efficiency}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Completions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCompletions.map((completion) => (
                  <div key={completion.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{completion.task}</p>
                      <p className="text-sm text-muted-foreground">Completed at {completion.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Camera className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{completion.photos}</span>
                      </div>
                      <Badge variant="outline">
                        ⭐ {completion.rating}/5
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Task History
                <Button variant="outline" size="sm">
                  Export History
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Task history and export functionality</p>
                <p className="text-sm">Complete task logs with photos and completion notes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}