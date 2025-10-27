import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  DollarSign,
  Clock,
  FileText,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Award,
  Receipt,
  Building,
  User,
  Target,
} from "lucide-react";

// Form schemas
const salaryProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
  role: z.enum(["staff", "portfolio-manager"]),
  monthlySalary: z.string().min(1, "Monthly salary is required"),
  currency: z.string().default("AUD"),
  bonusEligible: z.boolean().default(true),
  overtimeRate: z.string().default("1.5"),
  emergencyCalloutRate: z.string().default("50.00"),
  isActive: z.boolean().default(true),
});

const commissionLogSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
  commissionType: z.enum(["booking_bonus", "task_completion", "emergency_bonus", "referral_bonus"]),
  sourceType: z.enum(["booking", "task", "property", "referral"]).optional(),
  sourceId: z.number().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  month: z.string().min(1, "Month is required"),
});

const timeClockSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  clockType: z.enum(["regular", "emergency", "overtime"]),
  shiftType: z.enum(["clock_in", "clock_out"]),
  location: z.string().optional(),
  propertyId: z.number().optional(),
  propertyName: z.string().optional(),
  reason: z.string().optional(),
  workDescription: z.string().optional(),
});

const invoiceSchema = z.object({
  invoiceType: z.enum(["owner_to_company", "company_to_owner", "company_to_agent", "pm_to_company"]),
  fromPartyType: z.enum(["owner", "company", "agent", "pm"]),
  fromPartyName: z.string().min(1, "From party name is required"),
  toPartyType: z.enum(["owner", "company", "agent", "pm"]),
  toPartyName: z.string().min(1, "To party name is required"),
  propertyId: z.number().optional(),
  propertyName: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  subtotal: z.string().min(1, "Subtotal is required"),
  vatEnabled: z.boolean().default(false),
  vatRate: z.string().default("10.00"),
  currency: z.string().default("AUD"),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
});

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().default("1.00"),
  unitPrice: z.string().min(1, "Unit price is required"),
  category: z.enum(["management_fee", "maintenance", "utilities", "cleaning", "commission"]).optional(),
});

export default function StaffSalaryInvoiceGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Fetch staff salary profiles
  const { data: salaryProfiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["/api/staff-salary/profiles"],
  });

  // Fetch staff commission log
  const { data: commissionLog, isLoading: loadingCommissions } = useQuery({
    queryKey: ["/api/staff-salary/commissions", selectedStaff, selectedMonth],
    enabled: !!selectedStaff,
  });

  // Fetch staff time clocks
  const { data: timeClocks, isLoading: loadingTimeClocks } = useQuery({
    queryKey: ["/api/staff-salary/time-clocks", selectedStaff, selectedMonth],
    enabled: !!selectedStaff,
  });

  // Fetch emergency callout summary
  const { data: emergencySummary, isLoading: loadingEmergency } = useQuery({
    queryKey: ["/api/staff-salary/emergency-summary", selectedMonth],
  });

  // Fetch invoices
  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  // Fetch salary analytics
  const { data: salaryAnalytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["/api/staff-salary/analytics", selectedMonth],
  });

  // Forms
  const salaryForm = useForm<z.infer<typeof salaryProfileSchema>>({
    resolver: zodResolver(salaryProfileSchema),
    defaultValues: {
      currency: "AUD",
      bonusEligible: true,
      overtimeRate: "1.5",
      emergencyCalloutRate: "50.00",
      isActive: true,
    },
  });

  const commissionForm = useForm<z.infer<typeof commissionLogSchema>>({
    resolver: zodResolver(commissionLogSchema),
    defaultValues: {
      month: selectedMonth,
    },
  });

  const timeClockForm = useForm<z.infer<typeof timeClockSchema>>({
    resolver: zodResolver(timeClockSchema),
  });

  const invoiceForm = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: "AUD",
      vatEnabled: false,
      vatRate: "10.00",
    },
  });

  // Mutations
  const createSalaryProfile = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-salary/profiles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/profiles"] });
      toast({ title: "Success", description: "Salary profile created successfully" });
      setActiveDialog(null);
      salaryForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createCommission = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-salary/commissions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/commissions"] });
      toast({ title: "Success", description: "Commission log created successfully" });
      setActiveDialog(null);
      commissionForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createTimeClock = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-salary/time-clocks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/time-clocks"] });
      toast({ title: "Success", description: "Time clock entry created successfully" });
      setActiveDialog(null);
      timeClockForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createInvoice = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Success", description: "Invoice created successfully" });
      setActiveDialog(null);
      invoiceForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveTimeClock = useMutation({
    mutationFn: ({ id, hoursPaid, notes }: { id: number; hoursPaid: number; notes?: string }) =>
      apiRequest("PATCH", `/api/staff-salary/time-clocks/${id}/approve`, { hoursPaid, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/time-clocks"] });
      toast({ title: "Success", description: "Time clock approved successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCommissionStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/staff-salary/commissions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-salary/commissions"] });
      toast({ title: "Success", description: "Commission status updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      paid: "secondary",
      disputed: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "PPP");
  };

  const calculateInvoiceTotal = (subtotal: string, vatEnabled: boolean, vatRate: string) => {
    const sub = parseFloat(subtotal || "0");
    const vat = vatEnabled ? (sub * parseFloat(vatRate || "0")) / 100 : 0;
    return sub + vat;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Salary & Invoice Generator</h1>
          <p className="text-muted-foreground">
            Comprehensive salary tracking, overtime management, and multi-purpose invoice generation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">January 2025</SelectItem>
              <SelectItem value="2024-12">December 2024</SelectItem>
              <SelectItem value="2024-11">November 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salaryAnalytics && salaryAnalytics[0]
                ? formatCurrency(salaryAnalytics[0].totalStaffCost)
                : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Monthly salary expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Cost</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salaryAnalytics && salaryAnalytics[0]
                ? formatCurrency(salaryAnalytics[0].totalOvertimeCost)
                : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Emergency & overtime pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salaryAnalytics && salaryAnalytics[0] ? salaryAnalytics[0].activeStaffCount : 0}
            </div>
            <p className="text-xs text-muted-foreground">Current employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices ? invoices.length : 0}</div>
            <p className="text-xs text-muted-foreground">Generated invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="salary-profiles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="salary-profiles">💼 Salary Profiles</TabsTrigger>
          <TabsTrigger value="commissions">🎯 Commissions</TabsTrigger>
          <TabsTrigger value="time-clocks">🕐 Time Clocks</TabsTrigger>
          <TabsTrigger value="invoice-generator">🧾 Invoice Generator</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        {/* Salary Profiles Tab */}
        <TabsContent value="salary-profiles" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Staff Salary Profiles</h2>
            <Dialog open={activeDialog === "create-salary"} onOpenChange={(open) => setActiveDialog(open ? "create-salary" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Salary Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Staff Salary Profile</DialogTitle>
                  <DialogDescription>Set up salary and overtime rates for a staff member</DialogDescription>
                </DialogHeader>
                <Form {...salaryForm}>
                  <form
                    onSubmit={salaryForm.handleSubmit((data) => createSalaryProfile.mutate(data))}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={salaryForm.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="demo-staff" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={salaryForm.control}
                        name="userName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John Staff" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={salaryForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={salaryForm.control}
                        name="monthlySalary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Salary (AUD)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="4500.00" type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={salaryForm.control}
                        name="overtimeRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overtime Rate Multiplier</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="1.5" type="number" step="0.1" />
                            </FormControl>
                            <FormDescription>Multiplier for overtime pay (e.g., 1.5x normal rate)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={salaryForm.control}
                        name="emergencyCalloutRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Callout Rate (AUD)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="75.00" type="number" step="0.01" />
                            </FormControl>
                            <FormDescription>Flat rate for emergency callouts</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <FormField
                        control={salaryForm.control}
                        name="bonusEligible"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Bonus Eligible</FormLabel>
                              <FormDescription>Enable bonus calculations for this staff member</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialog(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createSalaryProfile.isPending}>
                        {createSalaryProfile.isPending ? "Creating..." : "Create Profile"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {loadingProfiles ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              salaryProfiles?.map((profile: any) => (
                <Card key={profile.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>{profile.userName}</span>
                          <Badge variant="outline">{profile.role}</Badge>
                        </CardTitle>
                        <CardDescription>User ID: {profile.userId}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(profile.monthlySalary)}</div>
                        <div className="text-sm text-muted-foreground">Monthly Salary</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Overtime Rate</div>
                          <div className="text-sm text-muted-foreground">{profile.overtimeRate}x</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Emergency Rate</div>
                          <div className="text-sm text-muted-foreground">{formatCurrency(profile.emergencyCalloutRate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Bonus Eligible</div>
                          <div className="text-sm text-muted-foreground">
                            {profile.bonusEligible ? "Yes" : "No"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-muted-foreground">
                      Hired: {formatDate(profile.hireDate)} • Status: {profile.isActive ? "Active" : "Inactive"}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Staff Commission & Bonus Log</h2>
            <div className="flex items-center space-x-4">
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Staff</SelectItem>
                  <SelectItem value="demo-staff">John Staff</SelectItem>
                  <SelectItem value="demo-manager">Sarah Manager</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={activeDialog === "create-commission"} onOpenChange={(open) => setActiveDialog(open ? "create-commission" : null)}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Commission
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Commission Entry</DialogTitle>
                    <DialogDescription>Record a commission or bonus for a staff member</DialogDescription>
                  </DialogHeader>
                  <Form {...commissionForm}>
                    <form
                      onSubmit={commissionForm.handleSubmit((data) => createCommission.mutate(data))}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={commissionForm.control}
                          name="userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User ID</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="demo-staff" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={commissionForm.control}
                          name="userName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John Staff" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={commissionForm.control}
                          name="commissionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Commission Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="booking_bonus">Booking Bonus</SelectItem>
                                  <SelectItem value="task_completion">Task Completion</SelectItem>
                                  <SelectItem value="emergency_bonus">Emergency Bonus</SelectItem>
                                  <SelectItem value="referral_bonus">Referral Bonus</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={commissionForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (AUD)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="150.00" type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={commissionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Emergency callout bonus for urgent pool repair" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={commissionForm.control}
                        name="month"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Month</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="2025-01" />
                            </FormControl>
                            <FormDescription>Format: YYYY-MM</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialog(null)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createCommission.isPending}>
                          {createCommission.isPending ? "Adding..." : "Add Commission"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            {loadingCommissions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              commissionLog?.map((commission: any) => (
                <Card key={commission.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{commission.userName}</div>
                          <div className="text-sm text-muted-foreground">{commission.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(commission.amount)}</div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(commission.status)}
                          <Badge variant="outline">{commission.commissionType.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div>Month: {commission.month}</div>
                      <div>Created: {formatDate(commission.createdAt)}</div>
                      {commission.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateCommissionStatus.mutate({ id: commission.id, status: "approved" })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCommissionStatus.mutate({ id: commission.id, status: "disputed" })}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Time Clocks Tab */}
        <TabsContent value="time-clocks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Emergency Clock-In System</h2>
            <Dialog open={activeDialog === "create-timeclock"} onOpenChange={(open) => setActiveDialog(open ? "create-timeclock" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Timer className="h-4 w-4 mr-2" />
                  Clock In/Out
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Emergency Clock In/Out</DialogTitle>
                  <DialogDescription>Record emergency or overtime work session</DialogDescription>
                </DialogHeader>
                <Form {...timeClockForm}>
                  <form
                    onSubmit={timeClockForm.handleSubmit((data) => createTimeClock.mutate(data))}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={timeClockForm.control}
                        name="userName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John Staff" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={timeClockForm.control}
                        name="clockType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clock Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="overtime">Overtime</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={timeClockForm.control}
                        name="shiftType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shift Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select shift" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="clock_in">Clock In</SelectItem>
                                <SelectItem value="clock_out">Clock Out</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={timeClockForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Villa Sunset - Pool Area" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={timeClockForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Pool pump failure - guests unable to use pool" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={timeClockForm.control}
                      name="workDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Diagnosed and replaced faulty pool pump motor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialog(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTimeClock.isPending}>
                        {createTimeClock.isPending ? "Recording..." : "Record Time"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {loadingTimeClocks ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              timeClocks?.map((timeClock: any) => (
                <Card key={timeClock.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{timeClock.userName}</div>
                          <div className="text-sm text-muted-foreground">{timeClock.workDescription}</div>
                          <div className="text-sm text-muted-foreground">Location: {timeClock.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {timeClock.totalPay ? formatCurrency(timeClock.totalPay) : "Pending"}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={timeClock.clockType === "emergency" ? "destructive" : "outline"}>
                            {timeClock.clockType}
                          </Badge>
                          <Badge variant="outline">{timeClock.shiftType.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div>Clock Time: {format(new Date(timeClock.clockTime), "PPp")}</div>
                      <div>Hours: {timeClock.hoursPaid || "TBD"}</div>
                      {timeClock.supervisorApproval === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => approveTimeClock.mutate({ id: timeClock.id, hoursPaid: 2.5 })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Invoice Generator Tab */}
        <TabsContent value="invoice-generator" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Invoice Generator</h2>
            <Dialog open={activeDialog === "create-invoice"} onOpenChange={(open) => setActiveDialog(open ? "create-invoice" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>Generate a new invoice for various party types</DialogDescription>
                </DialogHeader>
                <Form {...invoiceForm}>
                  <form
                    onSubmit={invoiceForm.handleSubmit((data) => {
                      const total = calculateInvoiceTotal(data.subtotal, data.vatEnabled, data.vatRate);
                      createInvoice.mutate({
                        ...data,
                        vatAmount: data.vatEnabled ? (parseFloat(data.subtotal) * parseFloat(data.vatRate)) / 100 : 0,
                        totalAmount: total,
                      });
                    })}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={invoiceForm.control}
                        name="invoiceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select invoice type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="owner_to_company">Owner → Company</SelectItem>
                                <SelectItem value="company_to_owner">Company → Owner</SelectItem>
                                <SelectItem value="company_to_agent">Company → Agent</SelectItem>
                                <SelectItem value="pm_to_company">PM → Company</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={invoiceForm.control}
                        name="propertyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Name (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Villa Sunset" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={invoiceForm.control}
                        name="fromPartyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Party Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Villa Owner LLC" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={invoiceForm.control}
                        name="toPartyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Party Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="HostPilotPro Management" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={invoiceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Monthly management fee for January 2025" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={invoiceForm.control}
                        name="subtotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtotal (AUD)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="2500.00" type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={invoiceForm.control}
                        name="vatRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Rate (%)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="10.00" type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center space-x-2 pt-8">
                        <FormField
                          control={invoiceForm.control}
                          name="vatEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel>Enable VAT</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={invoiceForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Standard monthly management fee" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialog(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createInvoice.isPending}>
                        {createInvoice.isPending ? "Creating..." : "Create Invoice"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              invoices?.map((invoice: any) => (
                <Card key={invoice.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground">{invoice.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.fromPartyName} → {invoice.toPartyName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(invoice.totalAmount)}</div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(invoice.status)}
                          <Badge variant="outline">{invoice.invoiceType.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div>Property: {invoice.propertyName || "N/A"}</div>
                      <div>Created: {formatDate(invoice.createdAt)}</div>
                      <div>Due: {invoice.dueDate ? formatDate(invoice.dueDate) : "No due date"}</div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Salary & Overtime Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Monthly Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  salaryAnalytics && salaryAnalytics[0] && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Staff Cost</span>
                        <span className="font-medium">{formatCurrency(salaryAnalytics[0].totalStaffCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Overtime Cost</span>
                        <span className="font-medium">{formatCurrency(salaryAnalytics[0].totalOvertimeCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bonus Cost</span>
                        <span className="font-medium">{formatCurrency(salaryAnalytics[0].totalBonusCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Emergency Cost</span>
                        <span className="font-medium">{formatCurrency(salaryAnalytics[0].totalEmergencyCost)}</span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Staff Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  salaryAnalytics && salaryAnalytics[0] && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Staff</span>
                        <span className="font-medium">{salaryAnalytics[0].activeStaffCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average Salary</span>
                        <span className="font-medium">{formatCurrency(salaryAnalytics[0].averageSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Top Overtime</span>
                        <span className="font-medium">{salaryAnalytics[0].highestOvertimeUser || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Hours</span>
                        <span className="font-medium">{salaryAnalytics[0].highestOvertimeHours}h</span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Emergency Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEmergency ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  emergencySummary && emergencySummary.length > 0 && (
                    <div className="space-y-3">
                      {emergencySummary.map((summary: any) => (
                        <div key={summary.id} className="border-b pb-2 last:border-b-0">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{summary.userName}</span>
                            <span className="text-sm text-muted-foreground">{summary.totalCallouts} callouts</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{summary.totalHours}h total</span>
                            <span>{formatCurrency(summary.totalPay)}</span>
                          </div>
                          {summary.bonusEligible && (
                            <Badge size="sm" variant="secondary" className="mt-1">
                              Bonus Eligible
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}