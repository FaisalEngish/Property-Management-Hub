import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { FileText, Plus, Download, Eye, Calendar, DollarSign, User, Building, Trash2, Edit, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { BillingInvoice, BillingInvoiceTemplate, BillingInvoiceLineItem } from "@shared/schema";

interface InvoiceWithLineItems extends BillingInvoice {
  items?: BillingInvoiceLineItem[];
}

interface TemplateWithLineItems extends BillingInvoiceTemplate {
  lineItems?: Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    taxRate: string;
    discount: string;
  }>;
}

export default function InvoiceGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const organizationId = user?.organizationId || "default-org";

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("invoices");
  const [isFormResetting, setIsFormResetting] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithLineItems | null>(null);
  
  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: "",
    clientType: "",
    clientName: "",
    clientId: "",
    propertyId: "",
    template: "",
    issueDate: "",
    dueDate: "",
    description: "",
    items: [] as { description: string; quantity: number; unitPrice: number; taxRate: number; discount: number; }[]
  });
  
  const [currentItem, setCurrentItem] = useState({
    description: "",
    quantity: "1",
    unitPrice: "",
    taxRate: "0",
    discount: "0"
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    lineItems: [] as { description: string; quantity: string; unitPrice: string; taxRate: string; discount: string; }[]
  });
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Fetch invoices with filters
  const { data: invoicesData, isLoading: loadingInvoices, refetch: refetchInvoices } = useQuery<{ invoices: InvoiceWithLineItems[]; total: number }>({
    queryKey: ["/api/billing-invoices", selectedStatus !== "all" ? selectedStatus : undefined],
    enabled: activeTab === "invoices",
  });

  // Fetch next invoice number
  const { data: nextNumberData, refetch: refetchNextNumber } = useQuery<{ invoiceNumber: string }>({
    queryKey: ["/api/billing-invoices/next-number"],
    enabled: activeTab === "create",
  });

  // Fetch invoice stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/billing-invoices/stats"],
    enabled: activeTab === "analytics" || activeTab === "invoices",
  });

  // Fetch templates
  const { data: templatesData, isLoading: loadingTemplates, refetch: refetchTemplates } = useQuery<TemplateWithLineItems[]>({
    queryKey: ["/api/billing-invoice-templates"],
    enabled: activeTab === "templates" || activeTab === "create",
  });

  // Fetch users for client dropdown
  const { data: usersData } = useQuery<Array<{ id: string; firstName: string; lastName: string; role: string }>>({
    queryKey: ["/api/users", { role: "owner" }],
    enabled: activeTab === "create",
  });

  // Fetch properties for property dropdown
  const { data: propertiesData } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["/api/properties"],
    enabled: activeTab === "create",
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: { invoice: any; lineItems: any[]; status: string }) => {
      return await apiRequest("POST", "/api/billing-invoices", {
        ...data.invoice,
        status: data.status,
        organizationId,
        createdBy: user?.id,
        lineItems: data.lineItems,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing-invoices/stats"] });
      resetForm();
      setActiveTab("invoices");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/billing-invoices/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing-invoices/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: { template: any; lineItems: any[] }) => {
      return await apiRequest("POST", "/api/billing-invoice-templates", {
        ...data.template,
        organizationId,
        createdBy: user?.id,
        lineItems: data.lineItems,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing-invoice-templates"] });
      setShowTemplateModal(false);
      resetTemplateForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (data: { id: number; template: any; lineItems: any[] }) => {
      return await apiRequest("PUT", `/api/billing-invoice-templates/${data.id}`, {
        ...data.template,
        lineItems: data.lineItems,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing-invoice-templates"] });
      setShowTemplateModal(false);
      setEditingTemplate(null);
      resetTemplateForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/billing-invoice-templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing-invoice-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Auto-fetch next invoice number and dates when opening create tab
  useEffect(() => {
    if (activeTab === "create" && nextNumberData?.invoiceNumber) {
      const today = new Date();
      const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      setNewInvoice(prev => {
        // If form is resetting, always update with new invoice number
        if (isFormResetting) {
          setIsFormResetting(false);
          return {
            ...prev,
            invoiceNumber: nextNumberData.invoiceNumber,
            issueDate: today.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
          };
        }
        
        // If invoice number changed, update it along with dates (even if form has other data)
        if (prev.invoiceNumber !== nextNumberData.invoiceNumber) {
          return {
            ...prev,
            invoiceNumber: nextNumberData.invoiceNumber,
            issueDate: prev.issueDate || today.toISOString().split('T')[0],
            dueDate: prev.dueDate || dueDate.toISOString().split('T')[0],
          };
        }
        
        return prev;
      });
    }
  }, [activeTab, nextNumberData, isFormResetting]);

  // Filter invoices based on client and period
  const filteredInvoices = (invoicesData?.invoices || []).filter(invoice => {
    const clientMatch = selectedClient === "all" || invoice.clientType === selectedClient;
    
    // Period filtering logic
    const invoiceDate = new Date(invoice.issueDate);
    const now = new Date();
    let periodMatch = true;
    
    if (selectedPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodMatch = invoiceDate >= weekAgo;
    } else if (selectedPeriod === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      periodMatch = invoiceDate >= monthAgo;
    } else if (selectedPeriod === "quarter") {
      const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      periodMatch = invoiceDate >= quarterAgo;
    } else if (selectedPeriod === "year") {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      periodMatch = invoiceDate >= yearAgo;
    }
    
    return clientMatch && periodMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "sent":
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getClientIcon = (clientType: string) => {
    switch (clientType) {
      case "owner": return <User className="w-4 h-4" />;
      case "pm": return <Building className="w-4 h-4" />;
      case "agent": return <User className="w-4 h-4" />;
      case "vendor": return <Building className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const formatWithConversion = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  // Helper functions for invoice form
  const addLineItem = () => {
    if (currentItem.description && currentItem.unitPrice) {
      const quantity = parseFloat(currentItem.quantity) || 1;
      const unitPrice = parseFloat(currentItem.unitPrice);
      const taxRate = parseFloat(currentItem.taxRate) || 0;
      const discount = parseFloat(currentItem.discount) || 0;
      
      setNewInvoice(prev => ({
        ...prev,
        items: [...prev.items, {
          description: currentItem.description,
          quantity,
          unitPrice,
          taxRate,
          discount,
        }]
      }));
      setCurrentItem({ description: "", quantity: "1", unitPrice: "", taxRate: "0", discount: "0" });
    }
  };

  const handleCreateInvoice = (status: "draft" | "sent") => {
    if (!newInvoice.clientName || !newInvoice.clientType || newInvoice.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one line item.",
        variant: "destructive",
      });
      return;
    }

    if (status === "sent" && (!newInvoice.invoiceNumber || !newInvoice.issueDate || !newInvoice.dueDate)) {
      toast({
        title: "Validation Error",
        description: "Invoice number, issue date, and due date are required to send an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate totals
    const lineItems = newInvoice.items.map(item => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = item.discount || 0;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * (item.taxRate || 0)) / 100;
      const amount = taxableAmount + taxAmount;

      return {
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        taxRate: (item.taxRate || 0).toString(),
        discount: (item.discount || 0).toString(),
        amount: amount.toString(),
      };
    });

    const subtotal = newInvoice.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const discountTotal = newInvoice.items.reduce((sum, item) => 
      sum + (item.discount || 0), 0
    );
    const taxTotal = newInvoice.items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const taxableAmount = subtotal - (item.discount || 0);
      return sum + (taxableAmount * (item.taxRate || 0)) / 100;
    }, 0);
    const total = subtotal - discountTotal + taxTotal;

    const invoiceData = {
      invoiceNumber: newInvoice.invoiceNumber,
      clientType: newInvoice.clientType,
      clientName: newInvoice.clientName,
      clientId: newInvoice.clientId || null,
      propertyId: newInvoice.propertyId ? parseInt(newInvoice.propertyId) : null,
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      description: newInvoice.description,
      subtotal: subtotal.toString(),
      taxTotal: taxTotal.toString(),
      discountTotal: discountTotal.toString(),
      total: total.toString(),
    };
    
    createInvoiceMutation.mutate({ invoice: invoiceData, lineItems, status });
  };

  const removeLineItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return newInvoice.items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = item.discount || 0;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * (item.taxRate || 0)) / 100;
      return sum + taxableAmount + taxAmount;
    }, 0);
  };

  const loadTemplate = async (templateId: string) => {
    const template = templatesData?.find(t => t.id.toString() === templateId);
    if (template && template.lineItems) {
      const templateItems = template.lineItems.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        taxRate: parseFloat(item.taxRate),
        discount: parseFloat(item.discount),
      }));
      setNewInvoice(prev => ({
        ...prev,
        template: templateId,
        items: templateItems
      }));
    }
  };

  const resetForm = async () => {
    // Set resetting flag
    setIsFormResetting(true);
    
    // Clear the form first
    setNewInvoice({
      invoiceNumber: "",
      clientType: "",
      clientName: "",
      clientId: "",
      propertyId: "",
      template: "",
      issueDate: "",
      dueDate: "",
      description: "",
      items: []
    });
    setCurrentItem({ description: "", quantity: "1", unitPrice: "", taxRate: "0", discount: "0" });
    
    // Refetch next invoice number to trigger useEffect auto-fill
    await refetchNextNumber();
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      description: "",
      lineItems: []
    });
  };

  const handleExportReport = async () => {
    try {
      const filters = {
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        fromDate: undefined,
        toDate: undefined,
      };
      
      const queryString = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]
      ).toString();
      
      window.open(`/api/billing-invoices/export/${organizationId}?${queryString}`, '_blank');
      
      toast({
        title: "Success",
        description: "Export started. Download will begin shortly.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = async (template: TemplateWithLineItems) => {
    setEditingTemplate(template.id);
    setTemplateForm({
      name: template.name,
      description: template.description || "",
      lineItems: template.lineItems || []
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    const templateData = {
      name: templateForm.name,
      description: templateForm.description,
      isActive: true,
    };

    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate,
        template: templateData,
        lineItems: templateForm.lineItems
      });
    } else {
      createTemplateMutation.mutate({
        template: templateData,
        lineItems: templateForm.lineItems
      });
    }
  };

  const summaryStats = {
    totalInvoices: statsData?.totalInvoices || 0,
    totalAmount: statsData?.totalAmount || 0,
    paidInvoices: statsData?.paidInvoices || 0,
    overdueInvoices: statsData?.overdueInvoices || 0,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Invoice Generator
          </h1>
          <p className="text-gray-600">Create, manage, and track invoices for owners, agents, and service providers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportReport} data-testid="button-export-report">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => {
            setActiveTab("create");
            resetForm();
          }} data-testid="button-new-invoice">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices" data-testid="tab-all-invoices">All Invoices</TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create-invoice">Create Invoice</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold" data-testid="stat-total-invoices">{summaryStats.totalInvoices}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold" data-testid="stat-total-amount">{formatWithConversion(summaryStats.totalAmount)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Invoices</p>
                    <p className="text-2xl font-bold text-green-600" data-testid="stat-paid-invoices">{summaryStats.paidInvoices}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600" data-testid="stat-overdue-invoices">{summaryStats.overdueInvoices}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger data-testid="select-client-filter">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="owner">Owners</SelectItem>
                    <SelectItem value="pm">Portfolio Managers</SelectItem>
                    <SelectItem value="agent">Agents</SelectItem>
                    <SelectItem value="vendor">Service Providers</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger data-testid="select-period-filter">
                    <SelectValue placeholder="This Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => refetchInvoices()} data-testid="button-apply-filters">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredInvoices.length} of {invoicesData?.invoices?.length || 0} invoices
                  </span>
                  {(selectedStatus !== "all" || selectedClient !== "all" || selectedPeriod !== "month") && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedStatus("all");
                        setSelectedClient("all");
                        setSelectedPeriod("month");
                      }}
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No invoices found
                    </div>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-4" data-testid={`invoice-${invoice.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              {getClientIcon(invoice.clientType)}
                              <div>
                                <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                                <p className="text-sm text-gray-600">{invoice.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <span className="font-bold text-green-600">{formatWithConversion(invoice.total)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Client</p>
                            <p className="font-medium">{invoice.clientName}</p>
                            <p className="text-xs text-gray-500">{invoice.clientType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Property</p>
                            <p className="font-medium">{invoice.propertyId || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Issue Date</p>
                            <p className="font-medium">{invoice.issueDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="font-medium">{invoice.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Line Items</p>
                            <p className="font-medium">{invoice.items?.length || 0} items</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Created: {new Date(invoice.createdAt || '').toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setViewingInvoice(invoice)}
                              data-testid={`button-view-${invoice.id}`}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this invoice?")) {
                                  deleteInvoiceMutation.mutate(invoice.id);
                                }
                              }}
                              data-testid={`button-delete-${invoice.id}`}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Invoice Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">
                        Invoice Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <Input 
                          value={newInvoice.invoiceNumber}
                          onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                          placeholder="INV-2025-005"
                          data-testid="input-invoice-number"
                          className={!newInvoice.invoiceNumber ? "border-red-300" : ""}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => refetchNextNumber()}
                          data-testid="button-auto-number"
                        >
                          Auto
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Client Type <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={newInvoice.clientType}
                        onValueChange={(value) => setNewInvoice({...newInvoice, clientType: value})}
                      >
                        <SelectTrigger data-testid="select-client-type" className={!newInvoice.clientType ? "border-red-300" : ""}>
                          <SelectValue placeholder="Select client type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Property Owner</SelectItem>
                          <SelectItem value="pm">Portfolio Manager</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="vendor">Service Provider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Client Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        value={newInvoice.clientName}
                        onChange={(e) => setNewInvoice({...newInvoice, clientName: e.target.value})}
                        placeholder="Enter client name"
                        data-testid="input-client-name"
                        className={!newInvoice.clientName ? "border-red-300" : ""}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Property (Optional)</label>
                      <Select 
                        value={newInvoice.propertyId}
                        onValueChange={(value) => setNewInvoice({...newInvoice, propertyId: value})}
                      >
                        <SelectTrigger data-testid="select-property">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertiesData?.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Dates & Template</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">
                        Issue Date <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        type="date" 
                        value={newInvoice.issueDate}
                        onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                        data-testid="input-issue-date"
                        className={!newInvoice.issueDate ? "border-red-300" : ""}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        type="date" 
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                        data-testid="input-due-date"
                        className={!newInvoice.dueDate ? "border-red-300" : ""}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Use Template (Optional)</label>
                      <Select 
                        value={newInvoice.template}
                        onValueChange={loadTemplate}
                      >
                        <SelectTrigger data-testid="select-template">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templatesData?.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Description</label>
                      <Input 
                        value={newInvoice.description}
                        onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                        placeholder="Invoice description"
                        data-testid="input-description"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Line Items</h4>
                  <span className="text-sm text-gray-600">
                    Total: {formatWithConversion(calculateTotal())}
                  </span>
                </div>

                {/* Existing Line Items */}
                {newInvoice.items.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    {newInvoice.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatWithConversion(item.unitPrice)}
                            {item.discount > 0 && ` - Discount: ${formatWithConversion(item.discount)}`}
                            {item.taxRate > 0 && ` + Tax: ${item.taxRate}%`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatWithConversion(
                              (item.quantity * item.unitPrice - item.discount) * 
                              (1 + (item.taxRate / 100))
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            data-testid={`button-remove-item-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Line Item */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h5 className="font-medium text-sm">Add Line Item</h5>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <Input 
                        placeholder="Description"
                        value={currentItem.description}
                        onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                        data-testid="input-line-item-description"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number"
                        placeholder="Qty"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                        data-testid="input-line-item-quantity"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number"
                        placeholder="Unit Price"
                        value={currentItem.unitPrice}
                        onChange={(e) => setCurrentItem({...currentItem, unitPrice: e.target.value})}
                        data-testid="input-line-item-price"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number"
                        placeholder="Tax %"
                        value={currentItem.taxRate}
                        onChange={(e) => setCurrentItem({...currentItem, taxRate: e.target.value})}
                        data-testid="input-line-item-tax"
                      />
                    </div>
                    <div>
                      <Button onClick={addLineItem} className="w-full" data-testid="button-add-line-item">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleCreateInvoice("draft")}
                  disabled={createInvoiceMutation.isPending}
                  data-testid="button-save-draft"
                >
                  {createInvoiceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save as Draft
                </Button>
                <Button 
                  onClick={() => handleCreateInvoice("sent")}
                  disabled={createInvoiceMutation.isPending}
                  data-testid="button-generate-invoice"
                >
                  {createInvoiceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Generate Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Templates</CardTitle>
                <Button onClick={() => {
                  setEditingTemplate(null);
                  resetTemplateForm();
                  setShowTemplateModal(true);
                }} data-testid="button-new-template">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templatesData?.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4" data-testid={`template-${template.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            data-testid={`button-edit-template-${template.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this template?")) {
                                deleteTemplateMutation.mutate(template.id);
                              }
                            }}
                            data-testid={`button-delete-template-${template.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {template.lineItems?.length || 0} default line items
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Modal */}
          {showTemplateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>{editingTemplate ? "Edit Template" : "New Template"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Template Name</label>
                    <Input 
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                      placeholder="Template name"
                      data-testid="input-template-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <Input 
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                      placeholder="Template description"
                      data-testid="input-template-description"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowTemplateModal(false);
                        setEditingTemplate(null);
                        resetTemplateForm();
                      }}
                      data-testid="button-cancel-template"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveTemplate}
                      disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                      data-testid="button-save-template"
                    >
                      {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Save Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold" data-testid="analytics-total-revenue">
                          {formatWithConversion(statsData?.totalRevenue || 0)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Amount</p>
                        <p className="text-2xl font-bold" data-testid="analytics-pending-amount">
                          {formatWithConversion(statsData?.pendingAmount || 0)}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Paid This Month</p>
                        <p className="text-2xl font-bold" data-testid="analytics-paid-month">
                          {formatWithConversion(statsData?.paidThisMonth || 0)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Overdue Amount</p>
                        <p className="text-2xl font-bold text-red-600" data-testid="analytics-overdue-amount">
                          {formatWithConversion(statsData?.overdueAmount || 0)}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Monthly chart data will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* View Invoice Modal */}
      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-bold text-lg">{viewingInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(viewingInvoice.status)}>
                    {viewingInvoice.status}
                  </Badge>
                </div>
              </div>

              {/* Client & Property Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Client Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-gray-600">Name:</span> {viewingInvoice.clientName}</p>
                    <p className="text-sm"><span className="text-gray-600">Type:</span> {viewingInvoice.clientType}</p>
                    {viewingInvoice.clientEmail && (
                      <p className="text-sm"><span className="text-gray-600">Email:</span> {viewingInvoice.clientEmail}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Invoice Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-gray-600">Issue Date:</span> {viewingInvoice.issueDate}</p>
                    <p className="text-sm"><span className="text-gray-600">Due Date:</span> {viewingInvoice.dueDate}</p>
                    {viewingInvoice.propertyId && (
                      <p className="text-sm"><span className="text-gray-600">Property ID:</span> {viewingInvoice.propertyId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingInvoice.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-700">{viewingInvoice.description}</p>
                </div>
              )}

              {/* Line Items */}
              <div>
                <h4 className="font-semibold mb-2">Line Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Tax %</th>
                        <th className="text-right p-2">Discount</th>
                        <th className="text-right p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInvoice.items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{item.description}</td>
                          <td className="text-right p-2">{item.quantity}</td>
                          <td className="text-right p-2">{formatWithConversion(item.unitPrice)}</td>
                          <td className="text-right p-2">{item.taxRate}%</td>
                          <td className="text-right p-2">{formatWithConversion(item.discount || 0)}</td>
                          <td className="text-right p-2">{formatWithConversion(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatWithConversion(viewingInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax Total:</span>
                      <span>{formatWithConversion(viewingInvoice.taxTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount Total:</span>
                      <span>-{formatWithConversion(viewingInvoice.discountTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">{formatWithConversion(viewingInvoice.total)}</span>
                    </div>
                    {viewingInvoice.paidAmount && Number(viewingInvoice.paidAmount) > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Paid:</span>
                          <span>-{formatWithConversion(viewingInvoice.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-orange-600">
                          <span>Balance Due:</span>
                          <span>{formatWithConversion(Number(viewingInvoice.total) - Number(viewingInvoice.paidAmount))}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex justify-between text-xs text-gray-500 border-t pt-4">
                <span>Created: {new Date(viewingInvoice.createdAt || '').toLocaleString()}</span>
                <span>Created by: {viewingInvoice.createdBy}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
