import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Link } from "wouter";
import { BackButton } from "@/components/BackButton";

import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  FileText,
  Bell,
  Download,
  Upload,
  X,
  Plus,
  Minus,
  BarChart3,
  Building,
  User,
  Receipt,
  Eye,
  ExternalLink,
  Filter,
  Search,
  Zap,
  Home,
  Target,
  Lightbulb,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  Trash2,
  Hand,
  Check,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import AdminBalanceResetCard from "@/components/ui/AdminBalanceResetCard";
import { useCurrency } from "@/hooks/useCurrency";

// Types for PM dashboard data
interface FinancialOverview {
  totalCommissionEarnings: number;
  propertyBreakdown: PropertyBreakdown[];
  monthlyTrend: MonthlyTrend[];
  pendingBalance: number;
}

interface PropertyBreakdown {
  propertyId: number;
  propertyName: string;
  totalRevenue: number;
  commissionEarned: number;
  bookingCount: number;
}

interface MonthlyTrend {
  period: string;
  earnings: number;
}

interface CommissionBalance {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  lastPayoutDate?: string;
}

interface PayoutRequest {
  id: number;
  amount: number;
  currency: string;
  requestNotes?: string;
  adminNotes?: string;
  status: string;
  receiptUrl?: string;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
}

interface TaskLog {
  id: number;
  taskTitle: string;
  department: string;
  staffAssigned?: string;
  status: string;
  completedAt?: string;
  evidencePhotos?: string[];
  receipts?: string[];
  result?: string;
  notes?: string;
  propertyName?: string;
  createdAt: string;
}

interface PMNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  actionRequired: boolean;
  isRead: boolean;
  createdAt: string;
  relatedType?: string;
  relatedId?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  receiverName: string;
  invoiceType: string;
  description: string;
  totalAmount: number;
  status: string;
  dueDate?: string;
  createdAt: string;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  occupancyRate: number;
  propertyCount: number;
  completedTasks: number;
  pendingTasks: number;
}

interface RevenueByMonth {
  month: string;
  revenue: number;
  bookings: number;
}

interface PropertyPerformance {
  propertyId: number;
  propertyName: string;
  revenue: number;
  bookings: number;
  occupancyRate: number;
  rating: number;
}

interface AISuggestion {
  id: number;
  type: string;
  priority: string;
  title: string;
  description: string;
  actionable: boolean;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  revenueByMonth: RevenueByMonth[];
  propertyPerformance: PropertyPerformance[];
  suggestions: AISuggestion[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// Form schemas
const payoutRequestSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  requestNotes: z.string().optional(),
});

const invoiceLineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
});

const invoiceSchema = z.object({
  receiverType: z.enum(["user", "organization", "external"]),
  receiverId: z.string().optional(),
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverAddress: z.string().optional(),
  invoiceType: z.string().min(1, "Invoice type is required"),
  description: z.string().min(1, "Description is required"),
  lineItems: z
    .array(invoiceLineItemSchema)
    .min(1, "At least one line item is required"),
  taxRate: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export default function PortfolioManagerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { formatWithConversion } = useCurrency();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedPortfolioManager, setSelectedPortfolioManager] =
    useState<string>(""); // For admin to select PM
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showInvoiceViewDialog, setShowInvoiceViewDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [taskFilters, setTaskFilters] = useState({
    department: "all",
    status: "all",
    search: "",
  });
  const [selectedTask, setSelectedTask] = useState<TaskLog | null>(null);
  const [showTaskDetailDialog, setShowTaskDetailDialog] = useState(false);

  // Check if current user is admin
  const isAdmin = (user as any)?.role === "admin";

  // Portfolio Managers Query (for admin dropdown)
  const { data: portfolioManagers = [] } = useQuery({
    queryKey: ["/api/users", "portfolio-manager"],
    queryFn: () => apiRequest("GET", "/api/users?role=portfolio-manager"),
    enabled: isAdmin,
  });

  // Staff Members Query (for admin dropdown)
  const { data: staffMembers = [] } = useQuery({
    queryKey: ["/api/staff-members"],
    queryFn: () => apiRequest("GET", "/api/staff-members?organizationId=default-org"),
    enabled: isAdmin,
  });

  // Combine portfolio managers and staff members for dropdown
  const allStaffOptions = React.useMemo(() => {
    // Filter out demo/test users from portfolio managers
    const filteredPMs = (portfolioManagers && Array.isArray(portfolioManagers) ? portfolioManagers : [])
      .filter((pm: any) => 
        !pm.id?.toLowerCase().includes('demo') && 
        !pm.email?.toLowerCase().includes('demo') &&
        !pm.email?.toLowerCase().includes('test') &&
        !pm.email?.toLowerCase().includes('reza') &&
        !pm.name?.toLowerCase().includes('reza') &&
        !pm.firstName?.toLowerCase().includes('reza')
      );
    
    const pmOptions = filteredPMs.map((pm: any) => ({
      id: pm.id,
      name: pm.name || `${pm.firstName || ''} ${pm.lastName || ''}`.trim(),
      type: 'portfolio-manager',
      role: pm.role
    }));
    
    const staffOptions = (staffMembers && Array.isArray(staffMembers) ? staffMembers : []).map((staff: any) => ({
      id: `staff-${staff.id}`,
      name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
      type: 'staff',
      position: staff.position,
      department: staff.department
    }));
    
    return [...pmOptions, ...staffOptions];
  }, [portfolioManagers, staffMembers]);

  // Set default selected PM for admin (first option in list) or current user for PM
  useEffect(() => {
    if (isAdmin && allStaffOptions.length > 0 && !selectedPortfolioManager) {
      setSelectedPortfolioManager(allStaffOptions[0]?.id);
    } else if (!isAdmin && (user as any)?.id) {
      setSelectedPortfolioManager((user as any)?.id);
    }
  }, [isAdmin, allStaffOptions, user, selectedPortfolioManager]);

  // Financial Overview Query
  const { data: financialOverview, isLoading: financialLoading } =
    useQuery<FinancialOverview>({
      queryKey: [
        "/api/pm/dashboard/financial-overview",
        dateRange.startDate,
        dateRange.endDate,
        selectedProperty,
        selectedPortfolioManager,
      ],
      queryFn: async () => {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          ...(selectedProperty !== "all" && { propertyId: selectedProperty }),
          ...(selectedPortfolioManager && {
            portfolioManagerId: selectedPortfolioManager,
          }),
        });
        return apiRequest(
          "GET",
          `/api/pm/dashboard/financial-overview?${params}`,
        );
      },
      enabled: !!selectedPortfolioManager,
    });

  // Commission Balance Query
  const { data: balance, isLoading: balanceLoading } =
    useQuery<CommissionBalance>({
      queryKey: ["/api/pm/dashboard/balance", selectedPortfolioManager],
      queryFn: () => {
        const params = new URLSearchParams({
          ...(selectedPortfolioManager && {
            portfolioManagerId: selectedPortfolioManager,
          }),
        });
        return apiRequest("GET", `/api/pm/dashboard/balance?${params}`);
      },
      enabled: !!selectedPortfolioManager,
    });

  // Payout Requests Query
  const { data: payouts, isLoading: payoutsLoading } = useQuery<
    PayoutRequest[]
  >({
    queryKey: ["/api/pm/dashboard/payouts", selectedPortfolioManager],
    queryFn: () => {
      const params = new URLSearchParams({
        ...(selectedPortfolioManager && {
          portfolioManagerId: selectedPortfolioManager,
        }),
      });
      return apiRequest("GET", `/api/pm/dashboard/payouts?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Task Logs Query
  const { data: taskLogs, isLoading: taskLogsLoading, refetch: refetchTaskLogs } = useQuery<TaskLog[]>({
    queryKey: [
      "/api/pm/dashboard/task-logs",
      taskFilters.department,
      taskFilters.status,
      dateRange.startDate,
      dateRange.endDate,
      selectedPortfolioManager,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: "100",
        ...(taskFilters.department !== "all" && {
          department: taskFilters.department,
        }),
        ...(taskFilters.status !== "all" && { status: taskFilters.status }),
        ...(selectedPortfolioManager && {
          portfolioManagerId: selectedPortfolioManager,
        }),
      });
      return apiRequest("GET", `/api/pm/dashboard/task-logs?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Helper function to export task logs to CSV
  const exportTaskLogsToCSV = () => {
    if (!taskLogs || taskLogs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no task logs to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["ID", "Task Title", "Department", "Status", "Property", "Staff Assigned", "Created At", "Completed At", "Result", "Notes"];
    const csvRows = [headers.join(",")];

    taskLogs.forEach((task) => {
      const row = [
        task.id,
        `"${(task.taskTitle || "").replace(/"/g, '""')}"`,
        task.department || "",
        task.status || "",
        `"${(task.propertyName || "").replace(/"/g, '""')}"`,
        `"${(task.staffAssigned || "").replace(/"/g, '""')}"`,
        task.createdAt ? format(parseISO(task.createdAt), "yyyy-MM-dd HH:mm") : "",
        task.completedAt ? format(parseISO(task.completedAt), "yyyy-MM-dd HH:mm") : "",
        `"${(task.result || "").replace(/"/g, '""')}"`,
        `"${(task.notes || "").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `task-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "Export successful",
      description: `Exported ${taskLogs.length} task logs to CSV.`,
    });
  };

  // Portfolio Properties Query
  // Fetch all properties (local + Hostaway) for the dropdown
  const { data: allProperties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => apiRequest("GET", "/api/properties"),
  });

  // Fetch PM-specific portfolio properties for counts
  const { data: portfolioProperties = [] } = useQuery({
    queryKey: ["/api/pm/dashboard/portfolio", selectedPortfolioManager],
    queryFn: () => {
      const params = new URLSearchParams({
        ...(selectedPortfolioManager && {
          portfolioManagerId: selectedPortfolioManager,
        }),
      });
      return apiRequest("GET", `/api/pm/dashboard/portfolio?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // PM Notifications Query
  const { data: notifications, isLoading: notificationsLoading } = useQuery<
    PMNotification[]
  >({
    queryKey: ["/api/pm/dashboard/notifications", selectedPortfolioManager],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: "20",
        ...(selectedPortfolioManager && {
          portfolioManagerId: selectedPortfolioManager,
        }),
      });
      return apiRequest("GET", `/api/pm/dashboard/notifications?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Invoices Query
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/pm/dashboard/invoices"],
    queryFn: () => apiRequest("GET", "/api/pm/dashboard/invoices"),
  });

  // Analytics Query
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery<AnalyticsData>({
    queryKey: [
      "/api/pm/dashboard/analytics",
      dateRange.startDate,
      dateRange.endDate,
      selectedPortfolioManager,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedPortfolioManager && {
          portfolioManagerId: selectedPortfolioManager,
        }),
      });
      return apiRequest("GET", `/api/pm/dashboard/analytics?${params}`);
    },
    enabled: !!selectedPortfolioManager,
  });

  // Payout Request Mutation
  const payoutMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", "/api/pm/dashboard/payouts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/payouts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/balance"],
      });
      toast({
        title: "Payout Request Submitted",
        description: "Your payout request has been submitted for approval.",
      });
      setShowPayoutDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Payment Received Mutation
  const paymentReceivedMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("PATCH", `/api/pm/dashboard/payouts/${id}/received`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/payouts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/balance"],
      });
      toast({
        title: "Payment Confirmed",
        description: "Payment receipt confirmed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Invoice Creation Mutation
  const invoiceMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", "/api/pm/dashboard/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/invoices"],
      });
      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
      });
      setShowInvoiceDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark Notification as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("PATCH", `/api/pm/dashboard/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/notifications"],
      });
    },
  });

  // Mark All Notifications as Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", "/api/pm/dashboard/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/notifications"],
      });
      toast({
        title: "All notifications marked as read",
        description: "Your notification inbox is now clear.",
      });
    },
  });

  // Delete Notification Mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/pm/dashboard/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/notifications"],
      });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    },
  });

  // Generate Sample Notifications Mutation
  const generateSampleNotificationsMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/pm/dashboard/notifications/generate-sample"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/pm/dashboard/notifications"],
      });
      toast({
        title: "Sample notifications created",
        description: "5 sample notifications have been added for testing.",
      });
    },
  });

  // Notification filter state
  const [notificationFilter, setNotificationFilter] = useState<string>("all");

  // Forms
  const payoutForm = useForm({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      amount: "",
      requestNotes: "",
    },
  });

  const invoiceForm = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      receiverType: "organization" as const,
      receiverId: "",
      receiverName: "",
      receiverAddress: "",
      invoiceType: "management_commission",
      description: "",
      lineItems: [
        {
          description: "",
          quantity: "1",
          unitPrice: "",
          referenceId: "",
          referenceType: "",
        },
      ],
      taxRate: "10",
      notes: "",
      dueDate: "",
      referenceNumber: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: invoiceForm.control,
    name: "lineItems",
  });

  const onPayoutSubmit = (data: any) => {
    payoutMutation.mutate(data);
  };

  const onInvoiceSubmit = (data: any) => {
    invoiceMutation.mutate(data);
  };

  // Handle viewing invoice details
  const handleViewInvoice = async (invoice: any) => {
    try {
      // Fetch full invoice details with line items
      const fullInvoice = await apiRequest("GET", `/api/billing-invoices/${invoice.id}`);
      setSelectedInvoice(fullInvoice);
      setShowInvoiceViewDialog(true);
    } catch (error: any) {
      console.error("Error loading invoice:", error);
      // Fallback to showing what we have
      setSelectedInvoice(invoice);
      setShowInvoiceViewDialog(true);
    }
  };

  // Handle downloading invoice as PDF
  const handleDownloadPDF = async (invoice: any) => {
    try {
      // Fetch full invoice details if not already loaded
      let fullInvoice = invoice;
      if (!invoice.lineItems) {
        try {
          fullInvoice = await apiRequest("GET", `/api/billing-invoices/${invoice.id}`);
        } catch (error) {
          console.error("Error fetching full invoice:", error);
          // Continue with what we have
        }
      }

      // Create a professional printable invoice HTML
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow pop-ups to download PDF",
          variant: "destructive",
        });
        return;
      }

      const lineItemsHTML = fullInvoice.lineItems && fullInvoice.lineItems.length > 0
        ? `
          <table class="line-items">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${fullInvoice.lineItems.map((item: any) => `
                <tr>
                  <td>${item.description || 'N/A'}</td>
                  <td style="text-align: right;">${item.quantity || 1}</td>
                  <td style="text-align: right;">$${parseFloat(item.unitPrice || 0).toFixed(2)}</td>
                  <td style="text-align: right;">$${(parseFloat(item.quantity || 1) * parseFloat(item.unitPrice || 0)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        : '';

      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${fullInvoice.invoiceNumber || 'N/A'}</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                padding: 40px; 
                color: #333;
                line-height: 1.6;
              }
              .header { 
                text-align: center; 
                margin-bottom: 40px; 
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
              }
              .header h1 { 
                font-size: 36px; 
                color: #1e40af; 
                margin-bottom: 10px;
              }
              .header h2 { 
                font-size: 24px; 
                color: #64748b;
                margin-bottom: 10px;
              }
              .status { 
                padding: 6px 16px; 
                border-radius: 6px; 
                display: inline-block; 
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
              }
              .status-draft { background-color: #f1f5f9; color: #475569; }
              .status-sent { background-color: #dbeafe; color: #1e40af; }
              .status-paid { background-color: #dcfce7; color: #166534; }
              .status-overdue { background-color: #fee2e2; color: #991b1b; }
              
              .info-section { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                margin: 30px 0; 
              }
              .info-box {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
              }
              .info-box h3 {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .info-box p {
                font-size: 16px;
                color: #1e293b;
                font-weight: 500;
              }
              
              .line-items { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 30px 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .line-items th { 
                background-color: #1e40af; 
                color: white;
                padding: 12px; 
                text-align: left; 
                font-weight: 600;
              }
              .line-items td { 
                border-bottom: 1px solid #e2e8f0; 
                padding: 12px; 
              }
              .line-items tr:last-child td {
                border-bottom: none;
              }
              .line-items tr:hover {
                background-color: #f8fafc;
              }
              
              .totals-section {
                margin-top: 30px;
                text-align: right;
              }
              .total-row {
                display: flex;
                justify-content: flex-end;
                gap: 40px;
                margin: 10px 0;
                padding: 10px 0;
              }
              .total-row.grand-total {
                border-top: 3px solid #2563eb;
                padding-top: 15px;
                margin-top: 15px;
              }
              .total-label {
                font-size: 18px;
                color: #64748b;
              }
              .total-amount {
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
                min-width: 150px;
              }
              .grand-total .total-label,
              .grand-total .total-amount {
                font-size: 24px;
                color: #1e40af;
              }
              
              .notes-section {
                margin-top: 40px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border-left: 4px solid #64748b;
              }
              .notes-section h3 {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
                text-transform: uppercase;
              }
              .notes-section p {
                color: #475569;
              }
              
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
              <h2>${fullInvoice.invoiceNumber || 'N/A'}</h2>
              <span class="status status-${fullInvoice.status || 'draft'}">${(fullInvoice.status || 'draft').toUpperCase()}</span>
            </div>
            
            <div class="info-section">
              <div class="info-box">
                <h3>Bill To</h3>
                <p>${fullInvoice.receiverName || 'N/A'}</p>
                ${fullInvoice.receiverAddress ? `<p style="margin-top: 8px; font-size: 14px; color: #64748b;">${fullInvoice.receiverAddress}</p>` : ''}
              </div>
              <div class="info-box">
                <h3>Invoice Date</h3>
                <p>${fullInvoice.createdAt ? format(parseISO(fullInvoice.createdAt), "MMMM d, yyyy") : 'N/A'}</p>
                ${fullInvoice.dueDate ? `
                  <h3 style="margin-top: 12px;">Due Date</h3>
                  <p>${format(parseISO(fullInvoice.dueDate), "MMMM d, yyyy")}</p>
                ` : ''}
              </div>
            </div>

            ${fullInvoice.description ? `
              <div class="info-box" style="margin: 20px 0;">
                <h3>Description</h3>
                <p>${fullInvoice.description}</p>
              </div>
            ` : ''}

            ${lineItemsHTML}

            <div class="totals-section">
              ${fullInvoice.subtotal ? `
                <div class="total-row">
                  <div class="total-label">Subtotal:</div>
                  <div class="total-amount">$${parseFloat(fullInvoice.subtotal).toFixed(2)}</div>
                </div>
              ` : ''}
              ${fullInvoice.taxAmount ? `
                <div class="total-row">
                  <div class="total-label">Tax:</div>
                  <div class="total-amount">$${parseFloat(fullInvoice.taxAmount).toFixed(2)}</div>
                </div>
              ` : ''}
              <div class="total-row grand-total">
                <div class="total-label">Total Amount:</div>
                <div class="total-amount">$${fullInvoice.totalAmount ? parseFloat(fullInvoice.totalAmount).toFixed(2) : '0.00'}</div>
              </div>
            </div>

            ${fullInvoice.paymentTerms || fullInvoice.notes ? `
              <div class="notes-section">
                ${fullInvoice.paymentTerms ? `
                  <h3>Payment Terms</h3>
                  <p>${fullInvoice.paymentTerms}</p>
                ` : ''}
                ${fullInvoice.notes ? `
                  <h3 style="margin-top: ${fullInvoice.paymentTerms ? '15px' : '0'};">Notes</h3>
                  <p>${fullInvoice.notes}</p>
                ` : ''}
              </div>
            ` : ''}

            <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
              <p>Thank you for your business!</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.print();
      }, 300);

      toast({
        title: "PDF Ready",
        description: "Use the print dialog to save or print your invoice",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  // Department color mapping
  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      cleaning: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      gardening: "bg-green-100 text-green-800",
      pool: "bg-cyan-100 text-cyan-800",
      security: "bg-red-100 text-red-800",
      inspection: "bg-purple-100 text-purple-800",
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  // Severity icons
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (financialLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container px-3 sm:px-6 overflow-x-hidden w-full">
      {/* Back button sits on top of everything */}
      <div className="mt-3">
        <BackButton
          fallbackRoute="/dashboard-hub"
          variant="ghost"
          className="!p-2 !rounded-md bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm"
        >
          <span className="hidden sm:inline text-sm">Back to Dashboard</span>
        </BackButton>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="mt-2 sm:mt-3 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              Portfolio Manager Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                {isAdmin
                  ? "Viewing data for:"
                  : "Manage your portfolio, track commissions, and create invoices"}
              </p>
              {isAdmin && selectedPortfolioManager && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <User className="h-3 w-3 mr-1" />
                  {allStaffOptions.find((person) => person.id === selectedPortfolioManager)?.name ||
                    "Portfolio Manager"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {/* Portfolio Manager Selection (Admin Only) */}
          {isAdmin && (
            <Select
              value={selectedPortfolioManager}
              onValueChange={setSelectedPortfolioManager}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Select Staff Member">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="truncate">
                      {allStaffOptions.find((person) => person.id === selectedPortfolioManager)?.name ||
                        "Select Staff"}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {allStaffOptions.map((person: any) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{person.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {person.type === 'staff' 
                          ? `${person.position} - ${person.department}`
                          : person.role}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="w-full sm:w-32 lg:w-40 text-sm"
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full sm:w-32 lg:w-40 text-sm"
            />
          </div>

          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-full sm:w-40 lg:w-48">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {(allProperties && Array.isArray(allProperties)
                ? allProperties
                : []
              )?.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                  {property.externalId && (
                    <span className="text-xs text-gray-500 ml-2">(Hostaway)</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => document.querySelector('[value="balance"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commission Earnings
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatWithConversion(financialOverview?.totalCommissionEarnings || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                From management fees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/properties"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Portfolio Properties
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(portfolioProperties && Array.isArray(portfolioProperties)
                  ? portfolioProperties.length
                  : 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Under management</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => document.querySelector('[value="balance"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Balance
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatWithConversion(balance?.currentBalance || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for payout
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => document.querySelector('[value="notifications"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unread Notifications
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(notifications && Array.isArray(notifications)
                  ? notifications.filter((n) => !n.isRead).length
                  : 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-6 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="balance" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Balance</TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Invoices</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Task Logs</span>
                <span className="sm:hidden">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Portfolio Quick Access */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Portfolio Management
                    </CardTitle>
                    <CardDescription>
                      Quick access to property management tools
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = "/properties"}>
                    View All Properties
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-3 md:grid-cols-6">
                  <Button
                    variant="outline"
                    className="h-24 flex-col hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    onClick={() => (window.location.href = "/properties")}
                    data-testid="button-property-access"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium">Properties</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex-col hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    onClick={() =>
                      (window.location.href = "/property-documents-management")
                    }
                    data-testid="button-document-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium">Documents</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex-col hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    onClick={() => (window.location.href = "/tasks")}
                    data-testid="button-maintenance"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium">Maintenance</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex-col hover:bg-green-50 hover:border-green-300 transition-colors"
                    onClick={() => (window.location.href = "/services")}
                    data-testid="button-service-tracker"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-xs font-medium">Services</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex-col hover:bg-red-50 hover:border-red-300 transition-colors"
                    onClick={() =>
                      (window.location.href = "/invoice-generator")
                    }
                    data-testid="button-invoices"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
                      <Receipt className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-xs font-medium">Invoices</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex-col hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                    onClick={() => (window.location.href = "/utility-tracker")}
                    data-testid="button-utility-tracker"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-xs font-medium">Utilities</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Property Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Property Performance
                  </CardTitle>
                  <CardDescription>
                    Commission earnings by property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {financialOverview?.propertyBreakdown && financialOverview.propertyBreakdown.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financialOverview.propertyBreakdown.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="propertyName" 
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Commission']}
                          />
                          <Bar dataKey="commissionEarned" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <BarChart3 className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">No Performance Data</h4>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Property performance data will appear here once you have bookings in your portfolio.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Earnings Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Earnings Trend
                  </CardTitle>
                  <CardDescription>
                    Commission earnings over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {financialOverview?.monthlyTrend && financialOverview.monthlyTrend.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financialOverview.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Earnings']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="earnings" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <TrendingUp className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">No Earnings Data</h4>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Earnings trend data will appear here as commissions are recorded over time.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row: Recent Activity, Pending Tasks, and Notifications */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Property List */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Portfolio Properties
                    </CardTitle>
                    <Badge variant="secondary">
                      {portfolioProperties?.length || 0} total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {portfolioProperties && portfolioProperties.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {portfolioProperties.slice(0, 5).map((property: any) => (
                        <div
                          key={property.id}
                          className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => window.location.href = `/properties/${property.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Home className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{property.name || property.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {property.city || property.address || 'No address'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {property.status || 'Active'}
                          </Badge>
                        </div>
                      ))}
                      {portfolioProperties.length > 5 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-sm"
                          onClick={() => window.location.href = "/properties"}
                        >
                          View all {portfolioProperties.length} properties
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Building className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">No properties assigned</p>
                      <Button variant="link" size="sm" onClick={() => window.location.href = "/properties"}>
                        Browse Properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Task Logs */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Recent Tasks
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => document.querySelector('[value="tasks"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {taskLogs && taskLogs.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {taskLogs.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              task.status === 'completed' ? 'bg-green-100' : 
                              task.status === 'in_progress' ? 'bg-blue-100' : 'bg-yellow-100'
                            }`}>
                              {task.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : task.status === 'in_progress' ? (
                                <Clock className="h-4 w-4 text-blue-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{task.taskTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {task.propertyName}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">No recent tasks</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Recent Notifications
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => document.querySelector('[value="notifications"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {notifications && notifications.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-3 p-2 rounded-lg border transition-colors ${
                            !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'urgent' ? 'bg-red-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {notification.type === 'urgent' ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : notification.type === 'warning' ? (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <Info className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{notification.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Bell className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Quick Actions</h4>
                      <p className="text-sm text-muted-foreground">
                        Common tasks to manage your portfolio
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => window.location.href = "/tasks"}>
                      <Plus className="h-4 w-4 mr-1" />
                      New Task
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.location.href = "/bookings"}>
                      <Calendar className="h-4 w-4 mr-1" />
                      View Bookings
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowPayoutDialog(true)} disabled={!balance?.currentBalance || balance.currentBalance <= 0}>
                      <DollarSign className="h-4 w-4 mr-1" />
                      Request Payout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Tab */}
          <TabsContent value="balance" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Commission Balance</h3>
                <p className="text-sm text-muted-foreground">
                  Track your earnings and request payouts
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/balance"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/pm/dashboard/payouts"] });
                  }}
                  data-testid="button-refresh-balance"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Dialog
                  open={showPayoutDialog}
                  onOpenChange={setShowPayoutDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      disabled={
                        !balance?.currentBalance || balance.currentBalance <= 0
                      }
                      data-testid="button-request-payout"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Request Payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Commission Payout</DialogTitle>
                      <DialogDescription>
                        Submit a payout request for your earned commissions
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...payoutForm}>
                      <form
                        onSubmit={payoutForm.handleSubmit(onPayoutSubmit)}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Wallet className="h-5 w-5" />
                            <span className="font-semibold">Available Balance</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-800 mt-1">
                            {formatWithConversion(balance?.currentBalance || 0)}
                          </p>
                        </div>

                        <FormField
                          control={payoutForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Amount to Request (USD)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Enter amount" 
                                    className="pl-9"
                                    type="number"
                                    step="0.01"
                                    max={balance?.currentBalance || 0}
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Maximum: ${balance?.currentBalance?.toLocaleString() || 0}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={payoutForm.control}
                          name="requestNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Payment method preference, bank details, or other notes..."
                                  {...field}
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
                            onClick={() => setShowPayoutDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={payoutMutation.isPending}
                          >
                            {payoutMutation.isPending
                              ? "Submitting..."
                              : "Submit Request"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Balance Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatWithConversion(balance?.totalEarned || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lifetime commission earnings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid Out</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatWithConversion(balance?.totalPaid || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total payouts received
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatWithConversion(balance?.currentBalance || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  {balance?.lastPayoutDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last payout: {format(parseISO(balance.lastPayoutDate), "MMM d, yyyy")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Admin Balance Reset Card - Only visible to admin users */}
              {isAdmin && selectedPortfolioManager && (
                <AdminBalanceResetCard
                  userId={selectedPortfolioManager}
                  userRole="portfolio-manager"
                  userEmail={portfolioManagers?.find(pm => pm.id === selectedPortfolioManager)?.email || ""}
                  userName={
                    portfolioManagers?.find(pm => pm.id === selectedPortfolioManager)?.name || ""
                  }
                  currentBalance={balance?.currentBalance}
                  onBalanceReset={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["/api/pm/dashboard/balance"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["/api/pm/dashboard/payouts"],
                    });
                  }}
                />
              )}

              {/* Payout History */}
              <Card className={isAdmin && selectedPortfolioManager ? "" : "md:col-span-2"}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Payout Requests
                    </CardTitle>
                    <CardDescription>
                      {payouts && payouts.length > 0 
                        ? `${payouts.length} request${payouts.length !== 1 ? 's' : ''} total`
                        : "No payout requests yet"
                      }
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {payoutsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payouts && Array.isArray(payouts) && payouts.length > 0 ? (
                        payouts.map((payout) => (
                          <div
                            key={payout.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            data-testid={`payout-item-${payout.id}`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-lg">
                                  {formatWithConversion(payout.amount || 0)}
                                </p>
                                <StatusBadge status={payout.status} />
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Requested: {format(parseISO(payout.requestedAt), "MMM d, yyyy")}</span>
                                </div>
                                {payout.approvedAt && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Approved: {format(parseISO(payout.approvedAt), "MMM d")}</span>
                                  </div>
                                )}
                                {payout.paidAt && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Paid: {format(parseISO(payout.paidAt), "MMM d")}</span>
                                  </div>
                                )}
                              </div>
                              {payout.requestNotes && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Note: {payout.requestNotes}
                                </p>
                              )}
                              {payout.adminNotes && (
                                <p className="text-sm text-blue-600 mt-1">
                                  Admin: {payout.adminNotes}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 items-end">
                              {payout.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => paymentReceivedMutation.mutate(payout.id)}
                                  disabled={paymentReceivedMutation.isPending}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm Receipt
                                </Button>
                              )}
                              {payout.receiptUrl && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  asChild
                                >
                                  <a href={payout.receiptUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Receipt
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Receipt className="h-8 w-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No payout requests</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            When you request payouts from your commission balance, they will appear here.
                          </p>
                          {balance?.currentBalance && balance.currentBalance > 0 && (
                            <Button onClick={() => setShowPayoutDialog(true)}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Request Your First Payout
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Balance Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">How Commission Payouts Work</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Your commission balance accumulates from property management fees</li>
                      <li>• Request a payout when your balance reaches the minimum threshold</li>
                      <li>• Admin will review and approve your request</li>
                      <li>• Once approved and paid, confirm receipt to update your records</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Invoice Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage invoices for commissions and services
                </p>
              </div>

              <Dialog
                open={showInvoiceDialog}
                onOpenChange={setShowInvoiceDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Generate a professional invoice for commissions or
                      services
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...invoiceForm}>
                    <form
                      onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={invoiceForm.control}
                          name="receiverType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Receiver Type</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="organization">
                                      Organization
                                    </SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="external">
                                      External Party
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={invoiceForm.control}
                          name="receiverName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Receiver Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Company or person name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={invoiceForm.control}
                          name="invoiceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Invoice Type</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="management_commission">
                                      Management Commission
                                    </SelectItem>
                                    <SelectItem value="booking_commission">
                                      Booking Commission
                                    </SelectItem>
                                    <SelectItem value="service_fee">
                                      Service Fee
                                    </SelectItem>
                                    <SelectItem value="consultation">
                                      Consultation
                                    </SelectItem>
                                    <SelectItem value="maintenance">
                                      Maintenance Charge
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={invoiceForm.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
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
                              <Textarea
                                placeholder="Invoice description..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Line Items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Line Items</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              append({
                                description: "",
                                quantity: "1",
                                unitPrice: "",
                                referenceId: "",
                                referenceType: "",
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Item
                          </Button>
                        </div>

                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="grid grid-cols-6 gap-2 items-end"
                          >
                            <div className="col-span-2">
                              <FormField
                                control={invoiceForm.control}
                                name={`lineItems.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Description"
                                        {...field}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={invoiceForm.control}
                              name={`lineItems.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Qty" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={invoiceForm.control}
                              name={`lineItems.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Price" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={invoiceForm.control}
                              name={`lineItems.${index}.referenceId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Reference" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={invoiceForm.control}
                          name="taxRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax Rate (%)</FormLabel>
                              <FormControl>
                                <Input placeholder="10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={invoiceForm.control}
                          name="referenceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reference Number (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Booking ID, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={invoiceForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional notes..."
                                {...field}
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
                          onClick={() => setShowInvoiceDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={invoiceMutation.isPending}
                        >
                          {invoiceMutation.isPending
                            ? "Creating..."
                            : "Create Invoice"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {invoicesLoading ? (
                  <div className="text-center py-8">Loading invoices...</div>
                ) : (
                  <div className="space-y-4">
                    {(invoices && Array.isArray(invoices) ? invoices : [])?.map(
                      (invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">
                              {invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.receiverName}
                            </p>
                            <p className="text-sm">{invoice.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Created:{" "}
                              {format(
                                parseISO(invoice.createdAt),
                                "MMM d, yyyy",
                              )}
                            </p>
                          </div>

                          <div className="text-right space-y-2">
                            <p className="font-semibold">
                              ${invoice.totalAmount?.toLocaleString()}
                            </p>
                            <StatusBadge status={invoice.status} />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewInvoice(invoice)}
                                data-testid={`button-view-invoice-${invoice.id}`}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownloadPDF(invoice)}
                                data-testid={`button-pdf-invoice-${invoice.id}`}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                            </div>
                          </div>
                        </div>
                      ),
                    ) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice View Dialog */}
            <Dialog open={showInvoiceViewDialog} onOpenChange={setShowInvoiceViewDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Invoice Details</DialogTitle>
                  <DialogDescription>
                    View complete invoice information
                  </DialogDescription>
                </DialogHeader>

                {selectedInvoice && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Invoice Number</Label>
                        <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <div className="mt-1">
                          <StatusBadge status={selectedInvoice.status} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Bill To</Label>
                        <p className="font-medium">{selectedInvoice.receiverName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Total Amount</Label>
                        <p className="font-semibold text-lg">${selectedInvoice.totalAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Created Date</Label>
                        <p>{format(parseISO(selectedInvoice.createdAt), "MMM d, yyyy")}</p>
                      </div>
                      {selectedInvoice.dueDate && (
                        <div>
                          <Label className="text-muted-foreground">Due Date</Label>
                          <p>{format(parseISO(selectedInvoice.dueDate), "MMM d, yyyy")}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="mt-1">{selectedInvoice.description}</p>
                    </div>

                    {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Line Items</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-right">Quantity</th>
                                <th className="px-4 py-2 text-right">Unit Price</th>
                                <th className="px-4 py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedInvoice.lineItems.map((item: any, index: number) => (
                                <tr key={index} className="border-t">
                                  <td className="px-4 py-2">{item.description}</td>
                                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                                  <td className="px-4 py-2 text-right">${parseFloat(item.unitPrice || 0).toFixed(2)}</td>
                                  <td className="px-4 py-2 text-right font-semibold">
                                    ${(parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {selectedInvoice.paymentTerms && (
                      <div>
                        <Label className="text-muted-foreground">Payment Terms</Label>
                        <p className="mt-1">{selectedInvoice.paymentTerms}</p>
                      </div>
                    )}

                    {selectedInvoice.notes && (
                      <div>
                        <Label className="text-muted-foreground">Notes</Label>
                        <p className="mt-1 text-sm">{selectedInvoice.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button onClick={() => setShowInvoiceViewDialog(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Task Logs Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Task & Portfolio Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Track tasks completed across your portfolio properties
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchTaskLogs()}
                  disabled={taskLogsLoading}
                  data-testid="button-refresh-tasks"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${taskLogsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTaskLogsToCSV}
                  disabled={!taskLogs || taskLogs.length === 0}
                  data-testid="button-export-tasks"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Task Statistics */}
            {taskLogs && taskLogs.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{taskLogs.length}</p>
                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{taskLogs.filter(t => t.status === "completed").length}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{taskLogs.filter(t => t.status === "pending").length}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{taskLogs.filter(t => t.status === "in_progress").length}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{taskLogs.filter(t => t.status === "cancelled").length}</p>
                        <p className="text-xs text-muted-foreground">Cancelled</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks by title, property, or staff..."
                      className="pl-10"
                      value={taskFilters.search}
                      onChange={(e) =>
                        setTaskFilters((prev) => ({ ...prev, search: e.target.value }))
                      }
                      data-testid="input-search-tasks"
                    />
                  </div>

                  {/* Department Filter */}
                  <Select
                    value={taskFilters.department}
                    onValueChange={(value) =>
                      setTaskFilters((prev) => ({ ...prev, department: value }))
                    }
                  >
                    <SelectTrigger className="w-full md:w-44" data-testid="select-department">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="gardening">Gardening</SelectItem>
                      <SelectItem value="pool">Pool</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select
                    value={taskFilters.status}
                    onValueChange={(value) =>
                      setTaskFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-full md:w-36" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {(taskFilters.search || taskFilters.department !== "all" || taskFilters.status !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTaskFilters({ department: "all", status: "all", search: "" })}
                      data-testid="button-clear-filters"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card>
              <CardContent className="pt-6">
                {taskLogsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Loading task logs...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const tasksList = taskLogs && Array.isArray(taskLogs) ? taskLogs : [];
                      const filteredTasks = tasksList.filter(task => {
                        if (taskFilters.search) {
                          const search = taskFilters.search.toLowerCase();
                          return (
                            (task.taskTitle?.toLowerCase().includes(search)) ||
                            (task.propertyName?.toLowerCase().includes(search)) ||
                            (task.staffAssigned?.toLowerCase().includes(search)) ||
                            (task.department?.toLowerCase().includes(search))
                          );
                        }
                        return true;
                      });

                      if (filteredTasks.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              {taskFilters.search || taskFilters.department !== "all" || taskFilters.status !== "all"
                                ? "No matching tasks"
                                : "No task logs yet"}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              {taskFilters.search || taskFilters.department !== "all" || taskFilters.status !== "all"
                                ? "Try adjusting your filters to see more results."
                                : "Task logs from your portfolio properties will appear here."}
                            </p>
                            {(taskFilters.search || taskFilters.department !== "all" || taskFilters.status !== "all") && (
                              <Button
                                variant="outline"
                                onClick={() => setTaskFilters({ department: "all", status: "all", search: "" })}
                              >
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        );
                      }

                      return filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskDetailDialog(true);
                          }}
                          data-testid={`task-item-${task.id}`}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{task.taskTitle}</p>
                              <Badge className={getDepartmentColor(task.department)}>
                                {task.department}
                              </Badge>
                              <StatusBadge status={task.status} />
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span>{task.propertyName || "Unknown Property"}</span>
                              </div>
                              {task.staffAssigned && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{task.staffAssigned}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(parseISO(task.createdAt), "MMM d, yyyy")}</span>
                              </div>
                              {task.completedAt && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Completed {format(parseISO(task.completedAt), "MMM d")}</span>
                                </div>
                              )}
                            </div>

                            {task.result && (
                              <p className="text-sm text-gray-600 line-clamp-1">{task.result}</p>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            {task.evidencePhotos && task.evidencePhotos.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                {task.evidencePhotos.length} Photos
                              </Badge>
                            )}
                            {task.receipts && task.receipts.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Receipt className="h-3 w-3 mr-1" />
                                {task.receipts.length} Receipts
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                                setShowTaskDetailDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task Detail Dialog */}
            <Dialog open={showTaskDetailDialog} onOpenChange={setShowTaskDetailDialog}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Task Details
                  </DialogTitle>
                  <DialogDescription>
                    Complete information about this task
                  </DialogDescription>
                </DialogHeader>

                {selectedTask && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{selectedTask.taskTitle}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getDepartmentColor(selectedTask.department)}>
                            {selectedTask.department}
                          </Badge>
                          <StatusBadge status={selectedTask.status} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">ID: #{selectedTask.id}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Property</Label>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedTask.propertyName || "Unknown"}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Staff Assigned</Label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedTask.staffAssigned || "Unassigned"}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Created</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {format(parseISO(selectedTask.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Completed</Label>
                        <div className="flex items-center gap-2">
                          {selectedTask.completedAt ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <p className="font-medium text-green-600">
                                {format(parseISO(selectedTask.completedAt), "MMMM d, yyyy 'at' h:mm a")}
                              </p>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <p className="text-muted-foreground">Not completed yet</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Result */}
                    {selectedTask.result && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Result / Outcome</Label>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm">{selectedTask.result}</p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedTask.notes && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Notes</Label>
                        <div className="p-3 bg-gray-50 border rounded-lg">
                          <p className="text-sm">{selectedTask.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Evidence Photos */}
                    {selectedTask.evidencePhotos && selectedTask.evidencePhotos.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">
                          Evidence Photos ({selectedTask.evidencePhotos.length})
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedTask.evidencePhotos.map((photo, index) => (
                            <div
                              key={index}
                              className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border"
                            >
                              <img
                                src={photo}
                                alt={`Evidence ${index + 1}`}
                                className="max-w-full max-h-full object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Receipts */}
                    {selectedTask.receipts && selectedTask.receipts.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">
                          Receipts ({selectedTask.receipts.length})
                        </Label>
                        <div className="space-y-2">
                          {selectedTask.receipts.map((receipt, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Receipt {index + 1}</span>
                              </div>
                              <Button size="sm" variant="ghost" asChild>
                                <a href={receipt} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTaskDetailDialog(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Notifications & Alerts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Stay updated on guest issues, approvals, and system suggestions
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["/api/pm/dashboard/notifications"],
                    })
                  }
                  data-testid="button-refresh-notifications"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                {notifications && notifications.length > 0 && notifications.some(n => !n.isRead) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    data-testid="button-mark-all-read"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {markAllReadMutation.isPending ? "Marking..." : "Mark All Read"}
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All", icon: Bell },
                { value: "urgent", label: "Urgent", icon: AlertTriangle },
                { value: "warning", label: "Warning", icon: AlertCircle },
                { value: "info", label: "Info", icon: Info },
                { value: "unread", label: "Unread", icon: Eye },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={notificationFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotificationFilter(filter.value)}
                  data-testid={`button-filter-${filter.value}`}
                >
                  <filter.icon className="h-4 w-4 mr-1" />
                  {filter.label}
                  {filter.value === "unread" && notifications && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {notifications.filter(n => !n.isRead).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            <Card>
              <CardContent className="pt-6">
                {notificationsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const notificationsList = notifications && Array.isArray(notifications) ? notifications : [];
                      const filteredNotifications = notificationsList.filter(n => {
                        if (notificationFilter === "all") return true;
                        if (notificationFilter === "unread") return !n.isRead;
                        return n.severity === notificationFilter;
                      });

                      if (filteredNotifications.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              {notificationFilter === "all" 
                                ? "No notifications yet" 
                                : `No ${notificationFilter} notifications`}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-6">
                              {notificationFilter === "all"
                                ? "When you receive notifications about guest issues, approvals, or system suggestions, they will appear here."
                                : `You don't have any ${notificationFilter === "unread" ? "unread" : notificationFilter + " priority"} notifications.`}
                            </p>
                            {notificationFilter === "all" && (
                              <Button
                                variant="outline"
                                onClick={() => generateSampleNotificationsMutation.mutate()}
                                disabled={generateSampleNotificationsMutation.isPending}
                                data-testid="button-generate-sample"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                {generateSampleNotificationsMutation.isPending 
                                  ? "Creating..." 
                                  : "Generate Sample Notifications"}
                              </Button>
                            )}
                          </div>
                        );
                      }

                      return filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-3 p-4 border rounded-lg transition-all duration-200 ${
                            !notification.isRead
                              ? "bg-blue-50 border-blue-200 shadow-sm"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                          data-testid={`notification-item-${notification.id}`}
                        >
                          <div className="mt-1 flex-shrink-0">
                            {notification.severity === "urgent" ? (
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              </div>
                            ) : notification.severity === "warning" ? (
                              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Info className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(parseISO(notification.createdAt), "MMM d, HH:mm")}
                              </p>
                            </div>

                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <Badge variant="outline" className="text-xs capitalize">
                                {notification.type.replace(/_/g, " ")}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  notification.severity === "urgent"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : notification.severity === "warning"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {notification.severity}
                              </Badge>
                              {notification.actionRequired && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markReadMutation.mutate(notification.id);
                                }}
                                disabled={markReadMutation.isPending}
                                title="Mark as read"
                                data-testid={`button-mark-read-${notification.id}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {notification.relatedType && notification.relatedId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="View related item"
                                data-testid={`button-view-related-${notification.id}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                              disabled={deleteNotificationMutation.isPending}
                              title="Delete notification"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              data-testid={`button-delete-notification-${notification.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            {notifications && notifications.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{notifications.length}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{notifications.filter(n => n.severity === "urgent").length}</p>
                        <p className="text-xs text-muted-foreground">Urgent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Hand className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{notifications.filter(n => n.actionRequired).length}</p>
                        <p className="text-xs text-muted-foreground">Action Needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{notifications.filter(n => !n.isRead).length}</p>
                        <p className="text-xs text-muted-foreground">Unread</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Portfolio Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Performance insights and AI-powered suggestions for {analyticsData?.period?.startDate} to {analyticsData?.period?.endDate}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchAnalytics()}
                disabled={analyticsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {analyticsLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Key Metrics Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${analyticsData?.summary?.totalRevenue?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {analyticsData?.summary?.totalBookings || 0}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {analyticsData?.summary?.occupancyRate?.toFixed(1) || '0'}%
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <Progress 
                        value={analyticsData?.summary?.occupancyRate || 0} 
                        className="mt-3 h-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Booking Value</p>
                          <p className="text-2xl font-bold text-orange-600">
                            ${analyticsData?.summary?.averageBookingValue?.toFixed(0) || '0'}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Revenue Trend Chart */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Revenue Trend
                      </CardTitle>
                      <CardDescription>Monthly revenue and booking performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analyticsData?.revenueByMonth && analyticsData.revenueByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={analyticsData.revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" fontSize={12} />
                            <YAxis fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                                name === 'revenue' ? 'Revenue' : 'Bookings'
                              ]}
                            />
                            <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="revenue" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No revenue data available for this period</p>
                          <p className="text-xs mt-1">Add properties and track bookings to see revenue trends</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Suggestions */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        AI Suggestions
                      </CardTitle>
                      <CardDescription>Smart recommendations for your portfolio</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analyticsData?.suggestions && analyticsData.suggestions.length > 0 ? (
                        analyticsData.suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className={`p-3 rounded-lg border ${
                              suggestion.priority === 'high'
                                ? 'border-red-200 bg-red-50'
                                : suggestion.priority === 'medium'
                                ? 'border-yellow-200 bg-yellow-50'
                                : 'border-green-200 bg-green-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${
                                suggestion.priority === 'high'
                                  ? 'text-red-600'
                                  : suggestion.priority === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}>
                                {suggestion.type === 'occupancy' && <Target className="h-4 w-4" />}
                                {suggestion.type === 'revenue' && <DollarSign className="h-4 w-4" />}
                                {suggestion.type === 'tasks' && <CheckCircle className="h-4 w-4" />}
                                {suggestion.type === 'performance' && <Star className="h-4 w-4" />}
                                {suggestion.type === 'property' && <Home className="h-4 w-4" />}
                                {suggestion.type === 'insight' && <Lightbulb className="h-4 w-4" />}
                                {suggestion.type === 'info' && <AlertCircle className="h-4 w-4" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{suggestion.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {suggestion.description}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  suggestion.priority === 'high'
                                    ? 'border-red-300 text-red-700'
                                    : suggestion.priority === 'medium'
                                    ? 'border-yellow-300 text-yellow-700'
                                    : 'border-green-300 text-green-700'
                                }`}
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No suggestions available</p>
                          <p className="text-xs mt-1">Add more data to receive AI-powered insights</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Property Performance Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Property Performance
                    </CardTitle>
                    <CardDescription>Individual property metrics and rankings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.propertyPerformance && analyticsData.propertyPerformance.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Property</th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Revenue</th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Bookings</th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Occupancy</th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.propertyPerformance.map((property, index) => (
                              <tr key={property.propertyId} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-2">
                                    {index === 0 && property.revenue > 0 && (
                                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Top</Badge>
                                    )}
                                    <span className="font-medium">{property.propertyName}</span>
                                  </div>
                                </td>
                                <td className="text-right py-3 px-2 font-semibold text-green-600">
                                  ${property.revenue.toLocaleString()}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {property.bookings}
                                </td>
                                <td className="text-right py-3 px-2">
                                  <div className="flex items-center justify-end gap-2">
                                    <Progress 
                                      value={property.occupancyRate} 
                                      className="w-16 h-2"
                                    />
                                    <span className={`text-sm ${
                                      property.occupancyRate >= 70 
                                        ? 'text-green-600' 
                                        : property.occupancyRate >= 40 
                                        ? 'text-yellow-600' 
                                        : 'text-red-600'
                                    }`}>
                                      {property.occupancyRate.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="text-right py-3 px-2">
                                  <div className="flex items-center justify-end gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{property.rating.toFixed(1)}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No properties in your portfolio</p>
                        <p className="text-xs mt-1">
                          Properties assigned to you will appear here with performance metrics
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Task Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Task Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Completed Tasks</span>
                          <Badge className="bg-green-100 text-green-800">
                            {analyticsData?.summary?.completedTasks || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Pending Tasks</span>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {analyticsData?.summary?.pendingTasks || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Portfolio Properties</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {analyticsData?.summary?.propertyCount || 0}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Revenue per Property</span>
                          <span className="font-semibold">
                            ${analyticsData?.summary?.propertyCount && analyticsData.summary.propertyCount > 0
                              ? ((analyticsData.summary.totalRevenue || 0) / analyticsData.summary.propertyCount).toFixed(0)
                              : '0'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Bookings per Property</span>
                          <span className="font-semibold">
                            {analyticsData?.summary?.propertyCount && analyticsData.summary.propertyCount > 0
                              ? ((analyticsData.summary.totalBookings || 0) / analyticsData.summary.propertyCount).toFixed(1)
                              : '0'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Task Completion Rate</span>
                          <span className="font-semibold">
                            {analyticsData?.summary?.completedTasks !== undefined && analyticsData?.summary?.pendingTasks !== undefined
                              ? ((analyticsData.summary.completedTasks / 
                                  Math.max(analyticsData.summary.completedTasks + analyticsData.summary.pendingTasks, 1)) * 100).toFixed(0)
                              : '0'
                            }%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
