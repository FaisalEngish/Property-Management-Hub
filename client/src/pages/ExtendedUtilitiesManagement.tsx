import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Zap, Droplets, Wifi, Bug, TreePine, Car, Plus, Search, Edit, Trash2, Bell, Upload, Download, Calendar, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, User, Settings, BarChart3, FileText, Eye, EyeOff, Filter, RefreshCw, BookOpen, Target, Activity, Lightbulb } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

// Enhanced types for Extended Utilities Management
interface PropertyUtilityMaster {
  id: number;
  organizationId: string;
  propertyId: number;
  utilityType: string;
  providerName: string;
  accountNumber: string;
  whoPays: string;
  whoPayssOtherExplanation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  property?: {
    name: string;
    address: string;
  };
}

interface UtilityBillExtended {
  id: number;
  organizationId: string;
  utilityMasterId: number;
  propertyId: number;
  billPeriodStart: string;
  billPeriodEnd: string;
  billAmount: string;
  currency: string;
  dueDate: string;
  paymentStatus: string;
  receiptUrl?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  notes?: string;
  latePaymentAlert: boolean;
  whoPaysOverride?: string;
  utilityMaster?: PropertyUtilityMaster;
  property?: {
    name: string;
  };
  uploadedByUser?: {
    firstName: string;
    lastName: string;
  };
}

interface UtilityNotification {
  id: number;
  organizationId: string;
  utilityMasterId: number;
  notificationType: string;
  recipientRole: string;
  recipientUserId?: string;
  message: string;
  severity: string;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  actionRequired: boolean;
  actionTaken: boolean;
  actionTakenBy?: string;
  actionTakenAt?: string;
  actionNotes?: string;
  utilityMaster?: PropertyUtilityMaster;
}

interface UtilityAccessPermissions {
  id: number;
  organizationId: string;
  utilityMasterId: number;
  userRole: string;
  canEditProviderInfo: boolean;
  canEditAccountNumber: boolean;
  canUploadBills: boolean;
  canViewBills: boolean;
  canSetReminders: boolean;
  canViewAccountNumber: boolean;
  setBy: string;
}

interface UtilityAiPrediction {
  id: number;
  organizationId: string;
  utilityMasterId: number;
  predictionType: string;
  predictedArrivalDate: string;
  confidence: number;
  basedOnHistory: string;
  isAccurate?: boolean;
  actualArrivalDate?: string;
  utilityMaster?: PropertyUtilityMaster;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

// Utility type icons mapping
const utilityIcons = {
  electricity: <Zap className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  internet: <Wifi className="h-4 w-4" />,
  pest_control: <Bug className="h-4 w-4" />,
  garden: <TreePine className="h-4 w-4" />,
  pool: <Droplets className="h-4 w-4" />,
  gas: <Car className="h-4 w-4" />,
  hoa: <FileText className="h-4 w-4" />,
  other: <Settings className="h-4 w-4" />,
};

// Payment status badges
const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800", 
  overdue: "bg-red-100 text-red-800",
  partial: "bg-blue-100 text-blue-800",
};

// Who pays badge colors
const whoPaysBadgeColors = {
  owner: "bg-purple-100 text-purple-800",
  management: "bg-blue-100 text-blue-800",
  guest: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-800",
};

// Severity colors for notifications
const severityColors = {
  low: "bg-blue-100 text-blue-800",
  normal: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

// Form schemas
const utilityMasterSchema = z.object({
  propertyId: z.number().min(1, "Property is required"),
  utilityType: z.string().min(1, "Utility type is required"),
  providerName: z.string().min(1, "Provider name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  whoPays: z.string().min(1, "Who pays is required"),
  whoPayssOtherExplanation: z.string().optional(),
  isActive: z.boolean().default(true),
});

const utilityBillSchema = z.object({
  utilityMasterId: z.number().min(1, "Utility is required"),
  billPeriodStart: z.string().min(1, "Start period is required"),
  billPeriodEnd: z.string().min(1, "End period is required"),
  billAmount: z.string().min(1, "Bill amount is required"),
  currency: z.string().default("THB"),
  dueDate: z.string().min(1, "Due date is required"),
  paymentStatus: z.string().default("pending"),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  whoPaysOverride: z.string().optional(),
});

const notificationUpdateSchema = z.object({
  actionNotes: z.string().optional(),
});

type UtilityMasterForm = z.infer<typeof utilityMasterSchema>;
type UtilityBillForm = z.infer<typeof utilityBillSchema>;
type NotificationUpdateForm = z.infer<typeof notificationUpdateSchema>;

export default function ExtendedUtilitiesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<PropertyUtilityMaster | null>(null);
  const [selectedBill, setSelectedBill] = useState<UtilityBillExtended | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<UtilityNotification | null>(null);
  const [showAddUtilityDialog, setShowAddUtilityDialog] = useState(false);
  const [showAddBillDialog, setShowAddBillDialog] = useState(false);
  const [showEditUtilityDialog, setShowEditUtilityDialog] = useState(false);
  const [showEditBillDialog, setShowEditBillDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showDeleteUtilityDialog, setShowDeleteUtilityDialog] = useState(false);
  const [showDeleteBillDialog, setShowDeleteBillDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUtilityType, setFilterUtilityType] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterWhoPays, setFilterWhoPays] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterNotificationType, setFilterNotificationType] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Check user permissions
  const canManageUtilities = user?.role === "admin" || user?.role === "portfolio-manager";
  const canViewUtilities = canManageUtilities || user?.role === "staff" || user?.role === "owner";

  // Form initialization
  const utilityMasterForm = useForm<UtilityMasterForm>({
    resolver: zodResolver(utilityMasterSchema),
    defaultValues: {
      propertyId: 0,
      utilityType: "",
      providerName: "",
      accountNumber: "",
      whoPays: "management",
      whoPayssOtherExplanation: "",
      isActive: true,
    },
  });

  const utilityBillForm = useForm<UtilityBillForm>({
    resolver: zodResolver(utilityBillSchema),
    defaultValues: {
      utilityMasterId: 0,
      billPeriodStart: "",
      billPeriodEnd: "",
      billAmount: "",
      currency: "THB",
      dueDate: "",
      paymentStatus: "pending",
      receiptUrl: "",
      notes: "",
      whoPaysOverride: "",
    },
  });

  const notificationUpdateForm = useForm<NotificationUpdateForm>({
    resolver: zodResolver(notificationUpdateSchema),
    defaultValues: {
      actionNotes: "",
    },
  });

  // Data fetching queries
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    enabled: canViewUtilities,
  });

  const { data: utilities = [], isLoading: utilitiesLoading, refetch: refetchUtilities } = useQuery({
    queryKey: ["/api/extended-utilities/utilities"],
    enabled: canViewUtilities,
  });

  const { data: utilityBills = [], isLoading: billsLoading, refetch: refetchBills } = useQuery({
    queryKey: ["/api/extended-utilities/bills"],
    enabled: canViewUtilities,
  });

  const { data: notifications = [], isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery({
    queryKey: ["/api/extended-utilities/notifications"],
    enabled: canViewUtilities,
  });

  const { data: aiPredictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/extended-utilities/ai-predictions"],
    enabled: canViewUtilities,
  });

  // Mutations for CRUD operations
  const createUtilityMutation = useMutation({
    mutationFn: async (data: UtilityMasterForm) => {
      return await apiRequest("POST", "/api/extended-utilities/utilities", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Utility configuration created successfully",
      });
      setShowAddUtilityDialog(false);
      utilityMasterForm.reset();
      refetchUtilities();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create utility configuration",
        variant: "destructive",
      });
    },
  });

  const updateUtilityMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<UtilityMasterForm> }) => {
      return await apiRequest("PUT", `/api/extended-utilities/utilities/${data.id}`, data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Utility configuration updated successfully",
      });
      setShowEditUtilityDialog(false);
      setSelectedUtility(null);
      utilityMasterForm.reset();
      refetchUtilities();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update utility configuration",
        variant: "destructive",
      });
    },
  });

  const deleteUtilityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/extended-utilities/utilities/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Utility configuration deleted successfully",
      });
      setShowDeleteUtilityDialog(false);
      setSelectedUtility(null);
      refetchUtilities();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete utility configuration",
        variant: "destructive",
      });
    },
  });

  const createBillMutation = useMutation({
    mutationFn: async (data: UtilityBillForm) => {
      return await apiRequest("POST", "/api/extended-utilities/bills", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Utility bill created successfully",
      });
      setShowAddBillDialog(false);
      utilityBillForm.reset();
      refetchBills();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create utility bill",
        variant: "destructive",
      });
    },
  });

  const updateBillMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<UtilityBillForm> }) => {
      return await apiRequest("PUT", `/api/extended-utilities/bills/${data.id}`, data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Utility bill updated successfully",
      });
      setShowEditBillDialog(false);
      setSelectedBill(null);
      utilityBillForm.reset();
      refetchBills();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update utility bill",
        variant: "destructive",
      });
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/extended-utilities/bills/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Utility bill deleted successfully",
      });
      setShowDeleteBillDialog(false);
      setSelectedBill(null);
      refetchBills();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete utility bill",
        variant: "destructive",
      });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: async (data: { id: number; actionNotes?: string }) => {
      return await apiRequest("PUT", `/api/extended-utilities/notifications/${data.id}/mark-read`, {
        actionNotes: data.actionNotes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
      setShowNotificationDialog(false);
      setSelectedNotification(null);
      notificationUpdateForm.reset();
      refetchNotifications();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getUtilityIcon = (type: string) => {
    return utilityIcons[type as keyof typeof utilityIcons] || utilityIcons.other;
  };

  const formatCurrency = (amount: string, currency: string = "THB") => {
    const symbols = { THB: "฿", USD: "$", EUR: "€", GBP: "£" };
    return `${symbols[currency as keyof typeof symbols] || currency} ${parseFloat(amount).toLocaleString()}`;
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = paymentStatusColors[status as keyof typeof paymentStatusColors] || "bg-gray-100 text-gray-800";
    return (
      <Badge className={colors}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getWhoPaysBadge = (whoPays: string) => {
    const colors = whoPaysBadgeColors[whoPays as keyof typeof whoPaysBadgeColors] || "bg-gray-100 text-gray-800";
    return (
      <Badge className={colors}>
        {whoPays.charAt(0).toUpperCase() + whoPays.slice(1)}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors = severityColors[severity as keyof typeof severityColors] || "bg-gray-100 text-gray-800";
    return (
      <Badge className={colors}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  // Filter functions
  const filteredUtilities = utilities.filter(utility => {
    const matchesSearch = !searchTerm || 
      utility.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utility.accountNumber.includes(searchTerm) ||
      utility.property?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterUtilityType || utility.utilityType === filterUtilityType;
    const matchesWhoPays = !filterWhoPays || utility.whoPays === filterWhoPays;
    const matchesProperty = !selectedProperty || utility.propertyId === selectedProperty;
    
    return matchesSearch && matchesType && matchesWhoPays && matchesProperty;
  });

  const filteredBills = utilityBills.filter(bill => {
    const matchesSearch = !searchTerm || 
      bill.utilityMaster?.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.property?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterPaymentStatus || bill.paymentStatus === filterPaymentStatus;
    const matchesProperty = !selectedProperty || bill.propertyId === selectedProperty;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.utilityMaster?.providerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = !filterSeverity || notification.severity === filterSeverity;
    const matchesType = !filterNotificationType || notification.notificationType === filterNotificationType;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  // Calculate statistics
  const activeUtilitiesCount = utilities.filter(u => u.isActive).length;
  const overdueBillsCount = utilityBills.filter(b => b.paymentStatus === "overdue").length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const totalMonthlyBills = utilityBills
    .filter(b => b.billPeriodStart >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    .reduce((sum, b) => sum + parseFloat(b.billAmount), 0);

  // Handle form submissions
  const onCreateUtility = (data: UtilityMasterForm) => {
    createUtilityMutation.mutate(data);
  };

  const onUpdateUtility = (data: UtilityMasterForm) => {
    if (selectedUtility) {
      updateUtilityMutation.mutate({ id: selectedUtility.id, updates: data });
    }
  };

  const onCreateBill = (data: UtilityBillForm) => {
    createBillMutation.mutate(data);
  };

  const onUpdateBill = (data: UtilityBillForm) => {
    if (selectedBill) {
      updateBillMutation.mutate({ id: selectedBill.id, updates: data });
    }
  };

  const onUpdateNotification = (data: NotificationUpdateForm) => {
    if (selectedNotification) {
      markNotificationReadMutation.mutate({ 
        id: selectedNotification.id, 
        actionNotes: data.actionNotes 
      });
    }
  };

  // Set up form data when editing
  useEffect(() => {
    if (selectedUtility && showEditUtilityDialog) {
      utilityMasterForm.reset({
        propertyId: selectedUtility.propertyId,
        utilityType: selectedUtility.utilityType,
        providerName: selectedUtility.providerName,
        accountNumber: selectedUtility.accountNumber,
        whoPays: selectedUtility.whoPays,
        whoPayssOtherExplanation: selectedUtility.whoPayssOtherExplanation || "",
        isActive: selectedUtility.isActive,
      });
    }
  }, [selectedUtility, showEditUtilityDialog, utilityMasterForm]);

  useEffect(() => {
    if (selectedBill && showEditBillDialog) {
      utilityBillForm.reset({
        utilityMasterId: selectedBill.utilityMasterId,
        billPeriodStart: selectedBill.billPeriodStart.split('T')[0],
        billPeriodEnd: selectedBill.billPeriodEnd.split('T')[0],
        billAmount: selectedBill.billAmount,
        currency: selectedBill.currency,
        dueDate: selectedBill.dueDate.split('T')[0],
        paymentStatus: selectedBill.paymentStatus,
        receiptUrl: selectedBill.receiptUrl || "",
        notes: selectedBill.notes || "",
        whoPaysOverride: selectedBill.whoPaysOverride || "",
      });
    }
  }, [selectedBill, showEditBillDialog, utilityBillForm]);

  if (!canViewUtilities) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to view the Extended Utilities Management system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            Extended Utilities Management
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive utility management system with role-based access, AI predictions, and automated notifications
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Utilities</p>
                  <p className="text-2xl font-bold">{activeUtilitiesCount}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Bills</p>
                  <p className="text-2xl font-bold text-red-600">{overdueBillsCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">{unreadNotificationsCount}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyBills.toString())}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="utilities" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Utilities
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Bills
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="ai-predictions" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Bills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {utilityBills.slice(0, 5).map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getUtilityIcon(bill.utilityMaster?.utilityType || "")}
                          <div>
                            <p className="font-medium">{bill.utilityMaster?.providerName}</p>
                            <p className="text-sm text-gray-600">{bill.property?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(bill.billAmount, bill.currency)}</p>
                          {getPaymentStatusBadge(bill.paymentStatus)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getSeverityBadge(notification.severity)}
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification.sentAt), "MMM dd, HH:mm")}
                            </span>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Property Filter</CardTitle>
                <CardDescription>Filter all data by property</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedProperty?.toString() || ""}
                  onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select property (or leave blank for all)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property: Property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Utilities Tab */}
          <TabsContent value="utilities" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Utility Configurations</CardTitle>
                    <CardDescription>Manage property utility setups and payment responsibilities</CardDescription>
                  </div>
                  {canManageUtilities && (
                    <Button onClick={() => setShowAddUtilityDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Utility
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search utilities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterUtilityType} onValueChange={setFilterUtilityType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="internet">Internet</SelectItem>
                      <SelectItem value="pest_control">Pest Control</SelectItem>
                      <SelectItem value="garden">Garden</SelectItem>
                      <SelectItem value="pool">Pool</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="hoa">HOA</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterWhoPays} onValueChange={setFilterWhoPays}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by who pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payers</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Utilities Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utility</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Account Number</TableHead>
                        <TableHead>Who Pays</TableHead>
                        <TableHead>Status</TableHead>
                        {canManageUtilities && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {utilitiesLoading ? (
                        <TableRow>
                          <TableCell colSpan={canManageUtilities ? 7 : 6} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                            <p className="mt-2">Loading utilities...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredUtilities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={canManageUtilities ? 7 : 6} className="text-center py-8">
                            <p>No utilities found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUtilities.map((utility) => (
                          <TableRow key={utility.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getUtilityIcon(utility.utilityType)}
                                <span className="capitalize">{utility.utilityType.replace('_', ' ')}</span>
                              </div>
                            </TableCell>
                            <TableCell>{utility.property?.name}</TableCell>
                            <TableCell>{utility.providerName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {utility.accountNumber}
                                </code>
                              </div>
                            </TableCell>
                            <TableCell>{getWhoPaysBadge(utility.whoPays)}</TableCell>
                            <TableCell>
                              <Badge className={utility.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {utility.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            {canManageUtilities && (
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUtility(utility);
                                      setShowEditUtilityDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUtility(utility);
                                      setShowDeleteUtilityDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Utility Bills</CardTitle>
                    <CardDescription>Track and manage utility bill payments</CardDescription>
                  </div>
                  {canManageUtilities && (
                    <Button onClick={() => setShowAddBillDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bill
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search bills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bills Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utility</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Who Pays</TableHead>
                        {canManageUtilities && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billsLoading ? (
                        <TableRow>
                          <TableCell colSpan={canManageUtilities ? 8 : 7} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                            <p className="mt-2">Loading bills...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredBills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={canManageUtilities ? 8 : 7} className="text-center py-8">
                            <p>No bills found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getUtilityIcon(bill.utilityMaster?.utilityType || "")}
                                <span>{bill.utilityMaster?.providerName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{bill.property?.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{format(new Date(bill.billPeriodStart), "MMM dd")}</p>
                                <p className="text-gray-500">to {format(new Date(bill.billPeriodEnd), "MMM dd, yyyy")}</p>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(bill.billAmount, bill.currency)}</TableCell>
                            <TableCell>
                              <div className={`text-sm ${new Date(bill.dueDate) < new Date() && bill.paymentStatus !== 'paid' ? 'text-red-600 font-medium' : ''}`}>
                                {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>{getPaymentStatusBadge(bill.paymentStatus)}</TableCell>
                            <TableCell>
                              {getWhoPaysBadge(bill.whoPaysOverride || bill.utilityMaster?.whoPays || "management")}
                            </TableCell>
                            {canManageUtilities && (
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBill(bill);
                                      setShowEditBillDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {bill.receiptUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(bill.receiptUrl, '_blank')}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBill(bill);
                                      setShowDeleteBillDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utility Notifications</CardTitle>
                <CardDescription>AI-powered alerts and system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterNotificationType} onValueChange={setFilterNotificationType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="late_upload_alert">Late Upload Alert</SelectItem>
                      <SelectItem value="payment_due">Payment Due</SelectItem>
                      <SelectItem value="owner_reminder">Owner Reminder</SelectItem>
                      <SelectItem value="guest_usage_tracking">Guest Usage Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                  {notificationsLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                      <p className="mt-2">Loading notifications...</p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <p>No notifications found</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <Card key={notification.id} className={`cursor-pointer hover:shadow-md transition-shadow ${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getSeverityBadge(notification.severity)}
                                <Badge variant="outline">{notification.notificationType.replace('_', ' ')}</Badge>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm mb-2">{notification.message}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Role: {notification.recipientRole}</span>
                                <span>Sent: {format(new Date(notification.sentAt), "MMM dd, yyyy HH:mm")}</span>
                                {notification.actionRequired && (
                                  <span className="text-orange-600 font-medium">Action Required</span>
                                )}
                              </div>
                              {notification.actionTaken && notification.actionNotes && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                                  <p className="font-medium">Action Taken:</p>
                                  <p>{notification.actionNotes}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    By {notification.actionTakenBy} on {notification.actionTakenAt && format(new Date(notification.actionTakenAt), "MMM dd, yyyy HH:mm")}
                                  </p>
                                </div>
                              )}
                            </div>
                            {!notification.isRead && canManageUtilities && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setShowNotificationDialog(true);
                                }}
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Predictions Tab */}
          <TabsContent value="ai-predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Utility Bill Predictions
                </CardTitle>
                <CardDescription>AI-powered predictions for utility bill arrivals based on historical data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictionsLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                      <p className="mt-2">Loading AI predictions...</p>
                    </div>
                  ) : aiPredictions.length === 0 ? (
                    <div className="text-center py-8">
                      <p>No AI predictions available</p>
                    </div>
                  ) : (
                    aiPredictions.map((prediction) => (
                      <Card key={prediction.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getUtilityIcon(prediction.utilityMaster?.utilityType || "")}
                              <div>
                                <p className="font-medium">{prediction.utilityMaster?.providerName}</p>
                                <p className="text-sm text-gray-600">{prediction.utilityMaster?.property?.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                Predicted: {format(new Date(prediction.predictedArrivalDate), "MMM dd, yyyy")}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className={`${prediction.confidence >= 80 ? 'bg-green-100 text-green-800' : prediction.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  {prediction.confidence}% confidence
                                </Badge>
                                {prediction.isAccurate !== undefined && (
                                  <Badge className={prediction.isAccurate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {prediction.isAccurate ? 'Accurate' : 'Inaccurate'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Based on: {prediction.basedOnHistory}</p>
                            {prediction.actualArrivalDate && (
                              <p>Actual arrival: {format(new Date(prediction.actualArrivalDate), "MMM dd, yyyy")}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Access Permissions</CardTitle>
                <CardDescription>Role-based access control for utility management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Admin</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Full utility management</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">All bill operations</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Notification management</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Permission configuration</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Portfolio Manager</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Property utility management</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Bill processing</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">View notifications</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">System configuration</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Owner</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">View own properties</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">View bills</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Edit configurations</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Manage notifications</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Utility Dialog */}
        <Dialog open={showAddUtilityDialog} onOpenChange={setShowAddUtilityDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Utility Configuration</DialogTitle>
              <DialogDescription>
                Configure a new utility for a property
              </DialogDescription>
            </DialogHeader>
            <Form {...utilityMasterForm}>
              <form onSubmit={utilityMasterForm.handleSubmit(onCreateUtility)} className="space-y-4">
                <FormField
                  control={utilityMasterForm.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property: Property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
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
                  control={utilityMasterForm.control}
                  name="utilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utility Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select utility type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electricity">Electricity</SelectItem>
                          <SelectItem value="water">Water</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                          <SelectItem value="pest_control">Pest Control</SelectItem>
                          <SelectItem value="garden">Garden</SelectItem>
                          <SelectItem value="pool">Pool</SelectItem>
                          <SelectItem value="gas">Gas</SelectItem>
                          <SelectItem value="hoa">HOA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityMasterForm.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PEA, TOT, 3BB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityMasterForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityMasterForm.control}
                  name="whoPays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who Pays?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who pays" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="management">Management Company</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {utilityMasterForm.watch("whoPays") === "other" && (
                  <FormField
                    control={utilityMasterForm.control}
                    name="whoPayssOtherExplanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Payment Explanation</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Explain who pays and how..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={utilityMasterForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <div className="text-sm text-gray-600">
                          Enable this utility configuration
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddUtilityDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUtilityMutation.isPending}>
                    {createUtilityMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create Utility
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Utility Dialog */}
        <Dialog open={showEditUtilityDialog} onOpenChange={setShowEditUtilityDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Utility Configuration</DialogTitle>
              <DialogDescription>
                Update utility configuration settings
              </DialogDescription>
            </DialogHeader>
            <Form {...utilityMasterForm}>
              <form onSubmit={utilityMasterForm.handleSubmit(onUpdateUtility)} className="space-y-4">
                <FormField
                  control={utilityMasterForm.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property: Property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
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
                  control={utilityMasterForm.control}
                  name="utilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utility Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select utility type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electricity">Electricity</SelectItem>
                          <SelectItem value="water">Water</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                          <SelectItem value="pest_control">Pest Control</SelectItem>
                          <SelectItem value="garden">Garden</SelectItem>
                          <SelectItem value="pool">Pool</SelectItem>
                          <SelectItem value="gas">Gas</SelectItem>
                          <SelectItem value="hoa">HOA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityMasterForm.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PEA, TOT, 3BB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityMasterForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityMasterForm.control}
                  name="whoPays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who Pays?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who pays" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="management">Management Company</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {utilityMasterForm.watch("whoPays") === "other" && (
                  <FormField
                    control={utilityMasterForm.control}
                    name="whoPayssOtherExplanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Payment Explanation</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Explain who pays and how..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={utilityMasterForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <div className="text-sm text-gray-600">
                          Enable this utility configuration
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditUtilityDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUtilityMutation.isPending}>
                    {updateUtilityMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Update Utility
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Bill Dialog */}
        <Dialog open={showAddBillDialog} onOpenChange={setShowAddBillDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Utility Bill</DialogTitle>
              <DialogDescription>
                Add a new utility bill entry
              </DialogDescription>
            </DialogHeader>
            <Form {...utilityBillForm}>
              <form onSubmit={utilityBillForm.handleSubmit(onCreateBill)} className="space-y-4">
                <FormField
                  control={utilityBillForm.control}
                  name="utilityMasterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utility</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select utility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {utilities.map((utility) => (
                            <SelectItem key={utility.id} value={utility.id.toString()}>
                              {utility.providerName} ({utility.property?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={utilityBillForm.control}
                    name="billPeriodStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period Start</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={utilityBillForm.control}
                    name="billPeriodEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period End</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={utilityBillForm.control}
                    name="billAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={utilityBillForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="THB">THB (฿)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={utilityBillForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="whoPaysOverride"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who Pays Override (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Use default or override" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Use Default</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="management">Management Company</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddBillDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBillMutation.isPending}>
                    {createBillMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create Bill
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Bill Dialog */}
        <Dialog open={showEditBillDialog} onOpenChange={setShowEditBillDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Utility Bill</DialogTitle>
              <DialogDescription>
                Update utility bill information
              </DialogDescription>
            </DialogHeader>
            <Form {...utilityBillForm}>
              <form onSubmit={utilityBillForm.handleSubmit(onUpdateBill)} className="space-y-4">
                <FormField
                  control={utilityBillForm.control}
                  name="utilityMasterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utility</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select utility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {utilities.map((utility) => (
                            <SelectItem key={utility.id} value={utility.id.toString()}>
                              {utility.providerName} ({utility.property?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={utilityBillForm.control}
                    name="billPeriodStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period Start</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={utilityBillForm.control}
                    name="billPeriodEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period End</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={utilityBillForm.control}
                    name="billAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={utilityBillForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="THB">THB (฿)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={utilityBillForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="whoPaysOverride"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who Pays Override (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Use default or override" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Use Default</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="management">Management Company</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={utilityBillForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditBillDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateBillMutation.isPending}>
                    {updateBillMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Update Bill
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Notification Action Dialog */}
        <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mark Notification as Read</DialogTitle>
              <DialogDescription>
                Add action notes and mark this notification as read
              </DialogDescription>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm">{selectedNotification.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getSeverityBadge(selectedNotification.severity)}
                    <Badge variant="outline">{selectedNotification.notificationType.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <Form {...notificationUpdateForm}>
                  <form onSubmit={notificationUpdateForm.handleSubmit(onUpdateNotification)} className="space-y-4">
                    <FormField
                      control={notificationUpdateForm.control}
                      name="actionNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what action was taken..."
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
                        onClick={() => setShowNotificationDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={markNotificationReadMutation.isPending}>
                        {markNotificationReadMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Mark as Read
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Utility Confirmation */}
        <AlertDialog open={showDeleteUtilityDialog} onOpenChange={setShowDeleteUtilityDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Utility Configuration</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this utility configuration? This action cannot be undone.
                All associated bills will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUtility && deleteUtilityMutation.mutate(selectedUtility.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Bill Confirmation */}
        <AlertDialog open={showDeleteBillDialog} onOpenChange={setShowDeleteBillDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Utility Bill</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this utility bill? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedBill && deleteBillMutation.mutate(selectedBill.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}