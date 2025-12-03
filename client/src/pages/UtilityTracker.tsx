import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Zap,
  Droplets,
  Wifi,
  Flame,
  Shield,
  Wrench,
  Plus,
  Upload,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Settings,
  Bell,
  FileText,
  TrendingUp,
  Edit,
  Trash,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const UTILITY_ICONS: Record<string, any> = {
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  gas: Flame,
  security: Shield,
  maintenance: Wrench,
};

const UTILITY_COLORS: Record<string, string> = {
  electricity: "#fbbf24",
  water: "#3b82f6",
  internet: "#8b5cf6",
  gas: "#f97316",
  security: "#10b981",
  maintenance: "#ef4444",
};

const billFormSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  utilityType: z.string().min(1, "Utility type is required"),
  provider: z.string().optional(),
  accountNumber: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().default("AUD"),
  dueDate: z.string().min(1, "Due date is required"),
  billingMonth: z.string().min(1, "Billing month is required"),
  status: z.string().default("pending"),
  notes: z.string().optional(),
});

const accountFormSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  utilityType: z.string().min(1, "Utility type is required"),
  provider: z.string().min(1, "Provider is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  packageInfo: z.string().optional(),
  expectedBillDay: z.string().min(1, "Expected bill day is required"),
});

const alertRuleFormSchema = z.object({
  propertyId: z.string().optional(),
  utilityType: z.string().optional(),
  alertType: z.string().min(1, "Alert type is required"),
  threshold: z.string().optional(),
  daysBeforeDue: z.string().optional(),
  notifyUsers: z.array(z.string()).optional(),
  notifyRoles: z.array(z.string()).optional(),
});

export default function UtilityTracker() {
  const [location, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const [selectedProperty, setSelectedProperty] = useState(
    urlParams.get("propertyId") || "all",
  );
  const [selectedTab, setSelectedTab] = useState("overview");
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [alertRuleDialogOpen, setAlertRuleDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // SETTINGS STATE
  const [defaultCurrency, setDefaultCurrency] = useState("AUD");

  const { toast } = useToast();

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch utility accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/utility/accounts", selectedProperty],
    queryFn: async () => {
      const params =
        selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : "";
      const response = await fetch(`/api/utility/accounts${params}`);
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json();
    },
  });

  // Fetch utility bills
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ["/api/utility/bills", selectedProperty],
    queryFn: async () => {
      const params =
        selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : "";
      const response = await fetch(`/api/utility/bills${params}`);
      if (!response.ok) throw new Error("Failed to fetch bills");
      return response.json();
    },
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/utility/analytics", selectedProperty],
    queryFn: async () => {
      const params =
        selectedProperty !== "all" ? `?propertyId=${selectedProperty}` : "";
      const response = await fetch(`/api/utility/analytics${params}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  // Fetch alert rules
  const { data: alertRules = [], isLoading: alertRulesLoading } = useQuery({
    queryKey: ["/api/utility/alert-rules"],
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/utility/alerts"],
  });

  // Forms
  const billForm = useForm({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      propertyId: "",
      utilityType: "",
      provider: "",
      accountNumber: "",
      amount: "",
      currency: defaultCurrency,
      dueDate: "",
      billingMonth: "",
      status: "pending",
      notes: "",
    },
  });

  const accountForm = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      propertyId: "",
      utilityType: "",
      provider: "",
      accountNumber: "",
      packageInfo: "",
      expectedBillDay: "",
    },
  });

  const alertRuleForm = useForm({
    resolver: zodResolver(alertRuleFormSchema),
    defaultValues: {
      propertyId: "",
      utilityType: "",
      alertType: "",
      threshold: "",
      daysBeforeDue: "",
      notifyUsers: [],
      notifyRoles: [],
    },
  });

  // Update property filter when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const propId = params.get("propertyId");
    if (propId) {
      setSelectedProperty(propId);
    }
  }, [location]);

  // Update URL when property filter changes
  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value);
    const newUrl =
      value !== "all"
        ? `/utility-tracker?propertyId=${value}`
        : "/utility-tracker";
    setLocation(newUrl);
  };

  // Create/Edit Bill Mutation
  const billMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
          formData.append(key, data[key]);
        }
      });
      if (uploadedFile) {
        formData.append("receipt", uploadedFile);
      }

      if (editingBill) {
        return await apiRequest(
          "PATCH",
          `/api/utility/bills/${editingBill.id}`,
          data,
        );
      } else {
        const response = await fetch("/api/utility/bills", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to create bill");
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/utility/analytics"] });
      setBillDialogOpen(false);
      setEditingBill(null);
      setUploadedFile(null);
      billForm.reset();
      toast({
        title: editingBill ? "Bill Updated" : "Bill Created",
        description: `Bill has been ${editingBill ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save bill",
        variant: "destructive",
      });
    },
  });

  // Delete Bill Mutation
  const deleteBillMutation = useMutation({
    mutationFn: async (billId: number) => {
      return await apiRequest("DELETE", `/api/utility/bills/${billId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/utility/analytics"] });
      toast({
        title: "Bill Deleted",
        description: "Bill has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete bill",
        variant: "destructive",
      });
    },
  });

  // Create/Edit Account Mutation
  const accountMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingAccount) {
        return await apiRequest(
          "PATCH",
          `/api/utility/accounts/${editingAccount.id}`,
          data,
        );
      } else {
        return await apiRequest("POST", "/api/utility/accounts", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility/accounts"] });
      setAccountDialogOpen(false);
      setEditingAccount(null);
      accountForm.reset();
      toast({
        title: editingAccount ? "Account Updated" : "Account Created",
        description: `Account has been ${editingAccount ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save account",
        variant: "destructive",
      });
    },
  });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      return await apiRequest("DELETE", `/api/utility/accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility/accounts"] });
      toast({
        title: "Account Deleted",
        description: "Account has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  // Create Alert Rule Mutation
  const alertRuleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/utility/alert-rules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility/alert-rules"] });
      setAlertRuleDialogOpen(false);
      alertRuleForm.reset();
      toast({
        title: "Alert Rule Created",
        description: "Alert rule has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create alert rule",
        variant: "destructive",
      });
    },
  });

  // Toggle Alert Rule Mutation
  const toggleAlertRuleMutation = useMutation({
    mutationFn: async ({
      ruleId,
      isEnabled,
    }: {
      ruleId: number;
      isEnabled: boolean;
    }) => {
      return await apiRequest("PATCH", `/api/utility/alert-rules/${ruleId}`, {
        isEnabled,
      });
    },
    onMutate: async ({ ruleId, isEnabled }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: ["/api/utility/alert-rules"],
      });

      // Snapshot the previous value for rollback
      const previousRules = queryClient.getQueryData([
        "/api/utility/alert-rules",
      ]);

      // Optimistically update the cache immediately
      queryClient.setQueryData(["/api/utility/alert-rules"], (old: any) => {
        if (!old) return old;
        return old.map((rule: any) =>
          rule.id === ruleId ? { ...rule, isEnabled } : rule,
        );
      });

      return { previousRules };
    },
    onSuccess: () => {
      toast({
        title: "Alert Rule Updated",
        description: "Alert rule status has been updated.",
      });
    },
    onError: (err, variables, context: any) => {
      // Rollback to previous state on error
      if (context?.previousRules) {
        queryClient.setQueryData(
          ["/api/utility/alert-rules"],
          context.previousRules,
        );
      }
      toast({
        title: "Error",
        description: "Failed to update alert rule status.",
        variant: "destructive",
      });
    },
  });

  // Update Alert Status Mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({
      alertId,
      alertStatus,
    }: {
      alertId: number;
      alertStatus: string;
    }) => {
      return await apiRequest("PATCH", `/api/utility/alerts/${alertId}`, {
        alertStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility/alerts"] });
      toast({
        title: "Alert Updated",
        description: "Alert status has been updated.",
      });
    },
  });

  // Mark bill as paid
  const markAsPaidMutation = useMutation({
    mutationFn: async (billId: number) => {
      return await apiRequest("PATCH", `/api/utility/bills/${billId}`, {
        status: "paid",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/utility/analytics"] });
      toast({
        title: "Bill Marked as Paid",
        description: "Bill status has been updated to paid.",
      });
    },
  });

  const onBillSubmit = (data: any) => {
    // if the form doesn’t explicitly set currency, fall back to current default
    const payload = {
      ...data,
      currency: data.currency || defaultCurrency,
    };
    billMutation.mutate(payload);
  };

  const onAccountSubmit = (data: any) => {
    accountMutation.mutate(data);
  };

  const onAlertRuleSubmit = (data: any) => {
    alertRuleMutation.mutate(data);
  };

  const openEditBill = (bill: any) => {
    setEditingBill(bill);
    billForm.reset({
      propertyId: bill.propertyId?.toString() || "",
      utilityType: bill.type || "",
      provider: bill.provider || "",
      accountNumber: bill.accountNumber || "",
      amount: bill.amount?.toString() || "",
      currency: bill.currency || "AUD",
      dueDate: bill.dueDate
        ? new Date(bill.dueDate).toISOString().split("T")[0]
        : "",
      billingMonth: bill.billingMonth || "",
      status: bill.status || "pending",
      notes: bill.notes || "",
    });
    setBillDialogOpen(true);
  };

  const openEditAccount = (account: any) => {
    setEditingAccount(account);
    accountForm.reset({
      propertyId: account.propertyId?.toString() || "",
      utilityType: account.utilityType || "",
      provider: account.provider || "",
      accountNumber: account.accountNumber || "",
      packageInfo: account.packageInfo || "",
      expectedBillDay: account.expectedBillDay?.toString() || "",
    });
    setAccountDialogOpen(true);
  };

  const openNewBill = () => {
    setEditingBill(null);
    setUploadedFile(null);
    billForm.reset({
      propertyId: selectedProperty !== "all" ? selectedProperty : "",
      utilityType: "",
      provider: "",
      accountNumber: "",
      amount: "",
      currency: defaultCurrency, // 🔄 sync with Settings dropdown      dueDate: "",
      billingMonth: "",
      status: "pending",
      notes: "",
    });
    setBillDialogOpen(true);
  };

  const openNewAccount = () => {
    setEditingAccount(null);
    accountForm.reset({
      propertyId: selectedProperty !== "all" ? selectedProperty : "",
      utilityType: "",
      provider: "",
      accountNumber: "",
      packageInfo: "",
      expectedBillDay: "",
    });
    setAccountDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: (
        <Badge data-testid={`badge-${status}`} className="bg-green-500">
          Paid
        </Badge>
      ),
      pending: (
        <Badge data-testid={`badge-${status}`} className="bg-yellow-500">
          Pending
        </Badge>
      ),
      overdue: (
        <Badge data-testid={`badge-${status}`} className="bg-red-500">
          Overdue
        </Badge>
      ),
    };
    return (
      variants[status] || (
        <Badge data-testid={`badge-${status}`}>{status}</Badge>
      )
    );
  };

  const summary = analytics?.summary || {
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    billCount: 0,
  };
  const byType = analytics?.byType || {};
  const byMonth = analytics?.byMonth || {};

  // Safe number conversion helper
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === "number" ? value : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Prepare chart data
  const typeChartData = Object.entries(byType).map(([type, data]: any) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: safeNumber(data.total),
  }));

  const monthChartData = Object.entries(byMonth)
    .map(([month, data]: any) => ({
      month,
      amount: safeNumber(data.total),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const recentBills = [...bills]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="p-6 space-y-6" data-testid="utility-tracker">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Utility Tracker
          </h1>
          <p
            className="text-muted-foreground"
            data-testid="text-page-description"
          >
            Manage utility bills, accounts, and expenses
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="property-filter">Property:</Label>
          <Select value={selectedProperty} onValueChange={handlePropertyChange}>
            <SelectTrigger
              className="w-[200px]"
              data-testid="select-property-filter"
            >
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        data-testid="tabs-utility"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="bills" data-testid="tab-bills">
            Bills
          </TabsTrigger>
          <TabsTrigger value="accounts" data-testid="tab-accounts">
            Accounts
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            Alerts
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent
          value="overview"
          className="space-y-6"
          data-testid="content-overview"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-total-monthly">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Monthly
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold"
                  data-testid="text-total-monthly"
                >
                  ${safeNumber(summary.totalAmount).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.billCount} bills
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-paid-bills">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Paid Bills
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold text-green-600"
                  data-testid="text-paid-amount"
                >
                  ${safeNumber(summary.paidAmount).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed payments
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-pending-bills">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold text-yellow-600"
                  data-testid="text-pending-amount"
                >
                  ${safeNumber(summary.pendingAmount).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-overdue-bills">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold text-red-600"
                  data-testid="text-overdue-amount"
                >
                  ${safeNumber(summary.overdueAmount).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "electricity",
              "water",
              "internet",
              "gas",
              "security",
              "maintenance",
            ].map((type) => {
              const Icon = UTILITY_ICONS[type];
              const typeData = byType[type] || { total: 0, count: 0 };
              return (
                <Card key={type} data-testid={`card-type-${type}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {type}
                    </CardTitle>
                    <Icon
                      className="h-4 w-4"
                      style={{ color: UTILITY_COLORS[type] }}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-2xl font-bold"
                      data-testid={`text-type-${type}-amount`}
                    >
                      ${safeNumber(typeData.total).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {typeData.count || 0} bills
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card data-testid="card-recent-bills">
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : recentBills.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No bills found
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBills.map((bill: any) => {
                    const Icon = UTILITY_ICONS[bill.type];
                    return (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`item-recent-bill-${bill.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className="h-5 w-5"
                            style={{ color: UTILITY_COLORS[bill.type] }}
                          />
                          <div>
                            <div className="font-medium">
                              {bill.propertyName || "Unknown Property"}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {bill.type} - {bill.provider || "No provider"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold">
                              $
                              {bill.amount
                                ? parseFloat(bill.amount).toFixed(2)
                                : "0.00"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Due:{" "}
                              {bill.dueDate
                                ? new Date(bill.dueDate).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                          {getStatusBadge(bill.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLS TAB */}
        <TabsContent
          value="bills"
          className="space-y-4"
          data-testid="content-bills"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Bills</h2>
            <Button onClick={openNewBill} data-testid="button-add-bill">
              <Plus className="h-4 w-4 mr-2" />
              Upload Bill
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {billsLoading ? (
                <div className="text-center py-8">Loading bills...</div>
              ) : bills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bills found. Upload your first bill to get started.
                </div>
              ) : (
                <Table data-testid="table-bills">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill: any) => (
                      <TableRow
                        key={bill.id}
                        data-testid={`row-bill-${bill.id}`}
                      >
                        <TableCell>{bill.propertyName || "Unknown"}</TableCell>
                        <TableCell className="capitalize">
                          {bill.type}
                        </TableCell>
                        <TableCell>{bill.provider || "N/A"}</TableCell>
                        <TableCell>
                          $
                          {bill.amount
                            ? parseFloat(bill.amount).toFixed(2)
                            : "0.00"}
                        </TableCell>
                        <TableCell>
                          {bill.dueDate
                            ? new Date(bill.dueDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {bill.status !== "paid" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  markAsPaidMutation.mutate(bill.id)
                                }
                                data-testid={`button-mark-paid-${bill.id}`}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditBill(bill)}
                              data-testid={`button-edit-bill-${bill.id}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this bill?",
                                  )
                                ) {
                                  deleteBillMutation.mutate(bill.id);
                                }
                              }}
                              data-testid={`button-delete-bill-${bill.id}`}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNTS TAB */}
        <TabsContent
          value="accounts"
          className="space-y-4"
          data-testid="content-accounts"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Utility Accounts</h2>
            <Button onClick={openNewAccount} data-testid="button-add-account">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {accountsLoading ? (
            <div className="text-center py-8">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8 text-muted-foreground">
                No utility accounts found. Add your first account to get
                started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account: any) => {
                const Icon = UTILITY_ICONS[account.utilityType];
                return (
                  <Card
                    key={account.id}
                    data-testid={`card-account-${account.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: UTILITY_COLORS[account.utilityType],
                            }}
                          />
                          <CardTitle className="capitalize">
                            {account.utilityType}
                          </CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditAccount(account)}
                            data-testid={`button-edit-account-${account.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this account?",
                                )
                              ) {
                                deleteAccountMutation.mutate(account.id);
                              }
                            }}
                            data-testid={`button-delete-account-${account.id}`}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Property
                        </div>
                        <div className="font-medium">
                          {account.propertyName || "Unknown"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Provider
                        </div>
                        <div className="font-medium">{account.provider}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Account Number
                        </div>
                        <div className="font-medium">
                          {account.accountNumber}
                        </div>
                      </div>
                      {account.packageInfo && (
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Package
                          </div>
                          <div className="font-medium">
                            {account.packageInfo}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Billing Day
                        </div>
                        <div className="font-medium">
                          Day {account.expectedBillDay} of month
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent
          value="analytics"
          className="space-y-4"
          data-testid="content-analytics"
        >
          <h2 className="text-xl font-semibold">Analytics & Insights</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="card-monthly-trend">
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : monthChartData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-type-breakdown">
              <CardHeader>
                <CardTitle>Spending by Utility Type</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : typeChartData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: $${safeNumber(value).toFixed(2)}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              UTILITY_COLORS[entry.name.toLowerCase()] ||
                              "#8884d8"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ALERTS TAB */}
        <TabsContent
          value="alerts"
          className="space-y-4"
          data-testid="content-alerts"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Alert Rules & Notifications
            </h2>
            <Button
              onClick={() => setAlertRuleDialogOpen(true)}
              data-testid="button-add-alert-rule"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card data-testid="card-alert-rules">
              <CardHeader>
                <CardTitle>Active Alert Rules</CardTitle>
              </CardHeader>
              <CardContent>
                {alertRulesLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : alertRules.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No alert rules configured. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alertRules.map((rule: any) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`item-alert-rule-${rule.id}`}
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {rule.alertType.replace(/_/g, " ")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rule.propertyId
                              ? `Property ID: ${rule.propertyId}`
                              : "All Properties"}
                            {" | "}
                            {rule.utilityType
                              ? `${rule.utilityType}`
                              : "All Types"}
                            {rule.threshold &&
                              ` | Threshold: $${rule.threshold}`}
                            {rule.daysBeforeDue &&
                              ` | ${rule.daysBeforeDue} days before due`}
                          </div>
                        </div>
                        <Switch
                          checked={rule.isEnabled}
                          onCheckedChange={(checked) =>
                            toggleAlertRuleMutation.mutate({
                              ruleId: rule.id,
                              isEnabled: checked,
                            })
                          }
                          data-testid={`switch-alert-rule-${rule.id}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-active-alerts">
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No active alerts
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`item-alert-${alert.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-yellow-500" />
                          <div>
                            <div className="font-medium">
                              {alert.alertMessage || "Alert notification"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {alert.propertyName || "Multiple properties"} -{" "}
                              {alert.alertType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge data-testid={`badge-alert-status-${alert.id}`}>
                            {alert.alertStatus || "active"}
                          </Badge>
                          {alert.alertStatus === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAlertMutation.mutate({
                                  alertId: alert.id,
                                  alertStatus: "acknowledged",
                                })
                              }
                              data-testid={`button-acknowledge-alert-${alert.id}`}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent
          value="settings"
          className="space-y-4"
          data-testid="content-settings"
        >
          <h2 className="text-xl font-semibold">Settings & Preferences</h2>

          <Card data-testid="card-currency-settings">
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default-currency">Default Currency</Label>
                <Select
                  value={defaultCurrency}
                  onValueChange={(value) => setDefaultCurrency(value)}
                >
                  <SelectTrigger
                    id="default-currency"
                    data-testid="select-default-currency"
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    <SelectItem value="THB">Thai Baht (THB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-notification-settings">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive email alerts for upcoming and overdue bills
                  </div>
                </div>
                <Switch
                  defaultChecked
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">High Amount Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when bills exceed a threshold
                  </div>
                </div>
                <Switch
                  defaultChecked
                  data-testid="switch-high-amount-alerts"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Payment Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    Receive reminders before bill due dates
                  </div>
                </div>
                <Switch defaultChecked data-testid="switch-payment-reminders" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-alert-thresholds">
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="high-amount-threshold">
                  High Amount Threshold ({defaultCurrency})
                </Label>
                <Input
                  id="high-amount-threshold"
                  type="number"
                  placeholder="500"
                  defaultValue="500"
                  data-testid="input-high-amount-threshold"
                />
              </div>
              <div>
                <Label htmlFor="reminder-days">Reminder Days Before Due</Label>
                <Input
                  id="reminder-days"
                  type="number"
                  placeholder="7"
                  defaultValue="7"
                  data-testid="input-reminder-days"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bill Dialog */}
      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-testid="dialog-bill-form"
        >
          <DialogHeader>
            <DialogTitle>
              {editingBill ? "Edit Bill" : "Upload Bill"}
            </DialogTitle>
            <DialogDescription>
              {editingBill
                ? "Update bill information"
                : "Add a new utility bill to the system"}
            </DialogDescription>
          </DialogHeader>
          <Form {...billForm}>
            <form
              onSubmit={billForm.handleSubmit(onBillSubmit)}
              className="space-y-4"
            >
              <FormField
                control={billForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-bill-property">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property: any) => (
                          <SelectItem
                            key={property.id}
                            value={property.id.toString()}
                          >
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billForm.control}
                name="utilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utility Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-bill-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="internet">Internet</SelectItem>
                        <SelectItem value="gas">Gas</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billForm.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., AGL Energy"
                        data-testid="input-bill-provider"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-bill-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-bill-due-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billForm.control}
                name="billingMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Month</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="month"
                        placeholder="2025-01"
                        data-testid="input-bill-month"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-bill-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes"
                        data-testid="input-bill-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editingBill && (
                <div>
                  <Label htmlFor="receipt-file">Receipt File (Optional)</Label>
                  <Input
                    id="receipt-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setUploadedFile(e.target.files?.[0] || null)
                    }
                    data-testid="input-bill-file"
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBillDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={billMutation.isPending}
                  data-testid="button-submit-bill"
                >
                  {billMutation.isPending
                    ? "Saving..."
                    : editingBill
                      ? "Update Bill"
                      : "Create Bill"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Account Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-testid="dialog-account-form"
        >
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Account" : "Add Account"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Update utility account information"
                : "Add a new utility account"}
            </DialogDescription>
          </DialogHeader>
          <Form {...accountForm}>
            <form
              onSubmit={accountForm.handleSubmit(onAccountSubmit)}
              className="space-y-4"
            >
              <FormField
                control={accountForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-account-property">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property: any) => (
                          <SelectItem
                            key={property.id}
                            value={property.id.toString()}
                          >
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="utilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utility Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-account-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="internet">Internet</SelectItem>
                        <SelectItem value="gas">Gas</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., AGL Energy"
                        data-testid="input-account-provider"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter account number"
                        data-testid="input-account-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="packageInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Info (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Business Plan 100"
                        data-testid="input-account-package"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="expectedBillDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Bill Day</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="31"
                        placeholder="1-31"
                        data-testid="input-account-bill-day"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAccountDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={accountMutation.isPending}
                  data-testid="button-submit-account"
                >
                  {accountMutation.isPending
                    ? "Saving..."
                    : editingAccount
                      ? "Update Account"
                      : "Add Account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alert Rule Dialog */}
      <Dialog open={alertRuleDialogOpen} onOpenChange={setAlertRuleDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-testid="dialog-alert-rule-form"
        >
          <DialogHeader>
            <DialogTitle>Create Alert Rule</DialogTitle>
            <DialogDescription>
              Set up automated alerts for utility bills
            </DialogDescription>
          </DialogHeader>
          <Form {...alertRuleForm}>
            <form
              onSubmit={alertRuleForm.handleSubmit(onAlertRuleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={alertRuleForm.control}
                name="alertType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-alert-type">
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upcoming_due_date">
                          Upcoming Due Date
                        </SelectItem>
                        <SelectItem value="overdue_bill">
                          Overdue Bill
                        </SelectItem>
                        <SelectItem value="high_amount">High Amount</SelectItem>
                        <SelectItem value="missing_receipt">
                          Missing Receipt
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={alertRuleForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Property (Optional - Leave blank for all)
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-alert-property">
                          <SelectValue placeholder="All properties" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        {properties.map((property: any) => (
                          <SelectItem
                            key={property.id}
                            value={property.id.toString()}
                          >
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={alertRuleForm.control}
                name="utilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Utility Type (Optional - Leave blank for all)
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-alert-utility-type">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="internet">Internet</SelectItem>
                        <SelectItem value="gas">Gas</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={alertRuleForm.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Threshold Amount (for high_amount alerts)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="500"
                        data-testid="input-alert-threshold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={alertRuleForm.control}
                name="daysBeforeDue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Days Before Due (for upcoming_due_date alerts)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="7"
                        data-testid="input-alert-days"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAlertRuleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={alertRuleMutation.isPending}
                  data-testid="button-submit-alert-rule"
                >
                  {alertRuleMutation.isPending ? "Creating..." : "Create Rule"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
