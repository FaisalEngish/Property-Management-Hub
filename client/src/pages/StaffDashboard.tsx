import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  PlayCircle,
  PauseCircle,
  SkipForward,
  RotateCcw,
  Upload,
  Receipt,
  UserCheck,
  Briefcase,
  ClipboardList,
  Target,
  Star,
  ArrowRight,
  Timer,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { RoleBackButton } from "@/components/BackButton";

const completionSchema = z.object({
  completionNotes: z.string().optional(),
  evidencePhotos: z.array(z.string()).optional(),
  issuesFound: z.array(z.string()).optional(),
  expenses: z.array(z.object({
    item: z.string().min(1, "Item is required"),
    amount: z.string().min(1, "Amount is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
  })).optional(),
  duration: z.number().optional(),
});

const expenseSchema = z.object({
  item: z.string().min(1, "Item is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export default function StaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [taskTimer, setTaskTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Get staff department from user profile
  const staffDepartment = user?.department || 'general';

  // Dashboard Overview Query
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/staff/dashboard/overview", user?.id, staffDepartment],
    enabled: !!user?.id,
  });

  // Staff Tasks Query
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/staff/tasks", user?.id],
    enabled: !!user?.id,
  });

  // Staff Salary Query
  const { data: salary, isLoading: salaryLoading } = useQuery({
    queryKey: ["/api/staff/salary", user?.id],
    enabled: !!user?.id,
  });

  // Staff Expenses Query
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/staff/expenses", user?.id],
    enabled: !!user?.id,
  });

  // Task completion form
  const completionForm = useForm({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      completionNotes: "",
      evidencePhotos: [],
      issuesFound: [],
      expenses: [],
      duration: 0,
    },
  });

  // Expense form
  const expenseForm = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      item: "",
      amount: "",
      category: "cleaning_supplies",
      description: "",
      receiptUrl: "",
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTaskTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Start Task Mutation
  const startTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/staff/tasks/${taskId}/start`);
    },
    onSuccess: () => {
      toast({ title: "Task Started", description: "Task has been started successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/dashboard/overview"] });
      setIsTimerRunning(true);
      setTaskTimer(0);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start task",
        variant: "destructive",
      });
    },
  });

  // Complete Task Mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number; data: any }) => {
      return apiRequest("POST", `/api/staff/tasks/${taskId}/complete`, data);
    },
    onSuccess: () => {
      toast({ title: "Task Completed", description: "Task has been completed successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/dashboard/overview"] });
      setIsCompleting(false);
      setSelectedTask(null);
      setIsTimerRunning(false);
      setTaskTimer(0);
      completionForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  // Skip Task Mutation
  const skipTaskMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: number; reason: string }) => {
      return apiRequest("POST", `/api/staff/tasks/${taskId}/skip`, { reason });
    },
    onSuccess: () => {
      toast({ title: "Task Skipped", description: "Task has been skipped." });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/dashboard/overview"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to skip task",
        variant: "destructive",
      });
    },
  });

  // Create Expense Mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/staff/expenses", data);
    },
    onSuccess: () => {
      toast({ title: "Expense Added", description: "Expense has been recorded successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/expenses"] });
      expenseForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const onCompleteTask = (data: any) => {
    if (!selectedTask) return;
    completeTaskMutation.mutate({
      taskId: selectedTask.id,
      data: { ...data, duration: taskTimer },
    });
  };

  const onCreateExpense = (data: any) => {
    createExpenseMutation.mutate(data);
  };

  if (overviewLoading || tasksLoading || salaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <RoleBackButton role="staff" className="mb-4" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your tasks, track earnings, and monitor performance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Users className="h-4 w-4 mr-2" />
            {staffDepartment.charAt(0).toUpperCase() + staffDepartment.slice(1)} Staff
          </Badge>
          {isTimerRunning && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Timer className="h-4 w-4 text-blue-600" />
              <span className="font-mono text-blue-600">{formatTime(taskTimer)}</span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.href = '/api/auth/demo-logout'}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.todayTasks || 0}</div>
                <p className="text-xs text-muted-foreground">Tasks due today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{overview?.overdueTasks || 0}</div>
                <p className="text-xs text-muted-foreground">Need immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.upcomingTasks || 0}</div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Tasks List */}
          {overview?.todayTasksList && overview.todayTasksList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Priority Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview.todayTasksList.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getPriorityColor(task.priority)} className="shrink-0">
                          {task.priority}
                        </Badge>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.propertyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => startTaskMutation.mutate(task.id)}
                            disabled={startTaskMutation.isPending}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-6">
            {tasks && tasks.length > 0 ? (
              tasks.map((task: any) => (
                <Card key={task.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{task.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {task.propertyName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {task.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.status === 'pending' && (
                        <Button
                          onClick={() => startTaskMutation.mutate(task.id)}
                          disabled={startTaskMutation.isPending}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button
                          onClick={() => {
                            setSelectedTask(task);
                            setIsCompleting(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const reason = prompt("Please provide a reason for skipping this task:");
                          if (reason) {
                            skipTaskMutation.mutate({ taskId: task.id, reason });
                          }
                        }}
                      >
                        <SkipForward className="h-4 w-4 mr-2" />
                        Skip
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tasks Assigned</h3>
                <p className="text-muted-foreground">You're all caught up! No tasks currently assigned.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Salary Tab */}
        <TabsContent value="salary" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{salary && salary.length > 0 ? parseFloat(salary[0].monthlySalary).toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">Base monthly salary</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Task Bonuses</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{salary && salary.length > 0 ? parseFloat(salary[0].taskBonusAmount || "0").toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">Per task completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Additional Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{salary && salary.length > 0 ? parseFloat(salary[0].additionalIncome || "0").toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">Tips and extras</p>
              </CardContent>
            </Card>
          </div>

          {salary && salary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Salary History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salary.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{record.salaryPeriod}</p>
                        <p className="text-sm text-muted-foreground">{record.department} Department</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">฿{parseFloat(record.monthlySalary).toLocaleString()}</p>
                        <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Expense Tracking</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Receipt className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                </DialogHeader>
                <Form {...expenseForm}>
                  <form onSubmit={expenseForm.handleSubmit(onCreateExpense)} className="space-y-4">
                    <FormField
                      control={expenseForm.control}
                      name="item"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item/Service</FormLabel>
                          <FormControl>
                            <Input placeholder="Cleaning supplies, tools, etc." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (฿)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cleaning_supplies">Cleaning Supplies</SelectItem>
                              <SelectItem value="tools">Tools & Equipment</SelectItem>
                              <SelectItem value="materials">Materials</SelectItem>
                              <SelectItem value="fuel">Fuel & Transport</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="submit" disabled={createExpenseMutation.isPending}>
                        Record Expense
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {expenses && expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense: any) => (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{expense.item}</p>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>{expense.taskTitle}</span>
                          <span>•</span>
                          <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">฿{parseFloat(expense.amount).toLocaleString()}</p>
                        <Badge variant={expense.isApproved ? 'default' : 'secondary'}>
                          {expense.reimbursementStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Expenses Recorded</h3>
              <p className="text-muted-foreground">Start tracking your work-related expenses here.</p>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tasks?.filter((t: any) => t.status === 'completed').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Task Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5h</div>
                <p className="text-xs text-muted-foreground">Average completion time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">Tasks on time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed performance metrics will be available once you complete more tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Completion Dialog */}
      <Dialog open={isCompleting} onOpenChange={setIsCompleting}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <Form {...completionForm}>
            <form onSubmit={completionForm.handleSubmit(onCompleteTask)} className="space-y-4">
              <FormField
                control={completionForm.control}
                name="completionNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what was accomplished..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Label>Evidence Photos (URLs)</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Photo URL" />
                  <Button type="button" variant="outline">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Issues Found</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Describe any issues..." />
                  <Button type="button" variant="outline">Add</Button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Time spent: {formatTime(taskTimer)}
                </p>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCompleting(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={completeTaskMutation.isPending}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Task
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}