import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Download, DollarSign, Settings, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const exchangeRateSchema = z.object({
  fromCurrency: z.string().min(3, "Currency code must be 3 characters"),
  toCurrency: z.string().min(3, "Currency code must be 3 characters"),
  exchangeRate: z.string().min(1, "Exchange rate is required"),
  rateDate: z.string().min(1, "Rate date is required"),
  rateSource: z.string().default("manual"),
});

const multiCurrencyFinanceSchema = z.object({
  transactionDate: z.string().min(1, "Transaction date is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  originalCurrency: z.string().min(3, "Currency code required"),
  originalAmount: z.string().min(1, "Amount is required"),
  propertyId: z.string().optional(),
  ownerId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
});

const quickbooksSettingsSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  realmId: z.string().optional(),
  autoSync: z.boolean().default(false),
  syncFrequency: z.string().default("daily"),
  syncIncome: z.boolean().default(true),
  syncExpenses: z.boolean().default(true),
  syncInvoices: z.boolean().default(true),
  syncPayments: z.boolean().default(true),
});

const exportRequestSchema = z.object({
  exportType: z.string().min(1, "Export type is required"),
  exportFormat: z.string().min(1, "Export format is required"),
  dateRange: z.string().min(1, "Date range is required"),
  propertyIds: z.array(z.string()).optional(),
  currencies: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

const currencies = [
  { code: "THB", name: "Thai Baht" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
];

const categories = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

const exportTypes = [
  { value: "excel", label: "Excel (XLSX)" },
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF Report" },
  { value: "quickbooks", label: "QuickBooks Format" },
  { value: "google_sheets", label: "Google Sheets" },
];

const exportFormats = [
  { value: "monthly_summary", label: "Monthly Summary" },
  { value: "annual_report", label: "Annual Report" },
  { value: "detailed_breakdown", label: "Detailed Breakdown" },
  { value: "owner_statement", label: "Owner Statement" },
  { value: "occupancy_report", label: "Occupancy Report" },
];

export default function MultiCurrencyFinanceQuickbooks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("transactions");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddExchangeRate, setShowAddExchangeRate] = useState(false);
  const [showQuickbooksSettings, setShowQuickbooksSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Data queries
  const { data: finances = [], isLoading: financesLoading } = useQuery({
    queryKey: ["/api/multi-currency-finances"],
  });

  const { data: exchangeRates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["/api/currency-exchange-rates"],
  });

  const { data: quickbooksSettings } = useQuery({
    queryKey: ["/api/quickbooks-integration"],
  });

  const { data: exportLogs = [] } = useQuery({
    queryKey: ["/api/finance-export-logs"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: owners = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Forms
  const transactionForm = useForm({
    resolver: zodResolver(multiCurrencyFinanceSchema),
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      category: "",
      originalCurrency: "THB",
    },
  });

  const exchangeRateForm = useForm({
    resolver: zodResolver(exchangeRateSchema),
    defaultValues: {
      rateDate: new Date().toISOString().split('T')[0],
      toCurrency: "THB",
      rateSource: "manual",
    },
  });

  const quickbooksForm = useForm({
    resolver: zodResolver(quickbooksSettingsSchema),
    defaultValues: quickbooksSettings || {
      autoSync: false,
      syncFrequency: "daily",
      syncIncome: true,
      syncExpenses: true,
      syncInvoices: true,
      syncPayments: true,
    },
  });

  const exportForm = useForm({
    resolver: zodResolver(exportRequestSchema),
    defaultValues: {
      exportType: "excel",
      exportFormat: "monthly_summary",
      dateRange: new Date().toISOString().slice(0, 7), // YYYY-MM
    },
  });

  // Mutations
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      // Auto-convert currency if not THB
      if (data.originalCurrency !== "THB") {
        const conversionResult = await apiRequest("POST", "/api/convert-currency", {
          amount: parseFloat(data.originalAmount),
          fromCurrency: data.originalCurrency,
          toCurrency: "THB",
        });
        data.thbAmount = conversionResult.convertedAmount;
        data.exchangeRate = conversionResult.exchangeRate;
        data.exchangeRateId = conversionResult.rateId;
      } else {
        data.thbAmount = parseFloat(data.originalAmount);
        data.exchangeRate = 1.0;
      }

      return await apiRequest("POST", "/api/multi-currency-finances", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Transaction created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/multi-currency-finances"] });
      setShowAddTransaction(false);
      transactionForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createExchangeRateMutation = useMutation({
    mutationFn: async (data: any) => 
      await apiRequest("POST", "/api/currency-exchange-rates", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Exchange rate added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/currency-exchange-rates"] });
      setShowAddExchangeRate(false);
      exchangeRateForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateQuickbooksMutation = useMutation({
    mutationFn: async (data: any) => 
      await apiRequest("PUT", "/api/quickbooks-integration", data),
    onSuccess: () => {
      toast({ title: "Success", description: "QuickBooks settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/quickbooks-integration"] });
      setShowQuickbooksSettings(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async (data: any) => 
      await apiRequest("POST", "/api/finance-export", data),
    onSuccess: (result: any) => {
      toast({ 
        title: "Export Started", 
        description: `Your ${result.exportType} export is being generated. You'll receive a download link shortly.`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/finance-export-logs"] });
      setShowExportDialog(false);
      exportForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Calculate summary statistics
  const totalIncome = finances
    .filter((f: any) => f.category === 'income')
    .reduce((sum: number, f: any) => sum + parseFloat(f.thbAmount || "0"), 0);

  const totalExpenses = finances
    .filter((f: any) => f.category === 'expense')
    .reduce((sum: number, f: any) => sum + parseFloat(f.thbAmount || "0"), 0);

  const netProfit = totalIncome - totalExpenses;

  // Currency breakdown
  const currencyBreakdown = finances.reduce((acc: any[], finance: any) => {
    const existing = acc.find(c => c.currency === finance.originalCurrency);
    if (existing) {
      existing.totalAmount += parseFloat(finance.originalAmount || "0");
      existing.thbEquivalent += parseFloat(finance.thbAmount || "0");
    } else {
      acc.push({
        currency: finance.originalCurrency,
        totalAmount: parseFloat(finance.originalAmount || "0"),
        thbEquivalent: parseFloat(finance.thbAmount || "0"),
      });
    }
    return acc;
  }, []);

  const formatWithConversion = (amount: number, currency = "THB") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      completed: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (financesLoading || ratesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Currency Finance + QuickBooks</h1>
          <p className="text-muted-foreground">
            Manage finances across currencies with automated reporting and QuickBooks integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowExportDialog(true)} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => setShowQuickbooksSettings(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            QuickBooks
          </Button>
          <Button onClick={() => setShowAddTransaction(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatWithConversion(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatWithConversion(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              +4.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatWithConversion(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netProfit >= 0 ? '+' : ''}8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currencies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyBreakdown.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active currencies tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="transactions">💰 Transactions</TabsTrigger>
          <TabsTrigger value="exchange-rates">💱 Exchange Rates</TabsTrigger>
          <TabsTrigger value="reports">📊 Reports</TabsTrigger>
          <TabsTrigger value="export-logs">📤 Export Logs</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financial Transactions</h3>
            <Button onClick={() => setShowAddExchangeRate(true)} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Exchange Rate
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Description</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Original Amount</th>
                      <th className="text-left p-4 font-medium">THB Amount</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          No transactions found. Create your first transaction to get started.
                        </td>
                      </tr>
                    ) : (
                      finances.map((finance: any) => (
                        <tr key={finance.id} className="border-b hover:bg-muted/25">
                          <td className="p-4">{formatDate(finance.transactionDate)}</td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{finance.description}</div>
                              {finance.subcategory && (
                                <div className="text-sm text-muted-foreground">{finance.subcategory}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={finance.category === 'income' ? 'default' : 'outline'}>
                              {finance.category}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {formatWithConversion(parseFloat(finance.originalAmount), finance.originalCurrency)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Rate: {parseFloat(finance.exchangeRate).toFixed(4)}
                            </div>
                          </td>
                          <td className="p-4 font-medium">
                            {formatWithConversion(parseFloat(finance.thbAmount))}
                          </td>
                          <td className="p-4">{getStatusBadge(finance.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {finance.exportedToQuickbooks && (
                                <Badge variant="secondary" className="text-xs">QB</Badge>
                              )}
                              {finance.exportedToGoogleSheets && (
                                <Badge variant="secondary" className="text-xs">GS</Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchange Rates Tab */}
        <TabsContent value="exchange-rates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Currency Exchange Rates</h3>
            <p className="text-sm text-muted-foreground">
              Current and historical exchange rates for currency conversion
            </p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">From</th>
                      <th className="text-left p-4 font-medium">To</th>
                      <th className="text-left p-4 font-medium">Rate</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Source</th>
                      <th className="text-left p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchangeRates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          No exchange rates found. Add exchange rates to enable currency conversion.
                        </td>
                      </tr>
                    ) : (
                      exchangeRates.map((rate: any) => (
                        <tr key={rate.id} className="border-b hover:bg-muted/25">
                          <td className="p-4">
                            <Badge variant="outline">{rate.fromCurrency}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{rate.toCurrency}</Badge>
                          </td>
                          <td className="p-4 font-mono">
                            {parseFloat(rate.exchangeRate).toFixed(6)}
                          </td>
                          <td className="p-4">{formatDate(rate.rateDate)}</td>
                          <td className="p-4">
                            <Badge variant={rate.rateSource === 'manual' ? 'outline' : 'default'}>
                              {rate.rateSource}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={rate.isActive ? 'default' : 'secondary'}>
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Currency Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Breakdown</CardTitle>
                <CardDescription>
                  Total amounts by currency with THB equivalents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currencyBreakdown.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No currency data available
                  </p>
                ) : (
                  currencyBreakdown.map((item: any) => (
                    <div key={item.currency} className="flex justify-between items-center">
                      <div>
                        <Badge variant="outline">{item.currency}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatWithConversion(item.totalAmount, item.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ≈ {formatWithConversion(item.thbEquivalent, "THB")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* QuickBooks Status */}
            <Card>
              <CardHeader>
                <CardTitle>QuickBooks Integration</CardTitle>
                <CardDescription>
                  Sync status and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickbooksSettings ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      <Badge variant={quickbooksSettings.isActive ? 'default' : 'secondary'}>
                        {quickbooksSettings.isActive ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Auto Sync</span>
                      <Badge variant={quickbooksSettings.autoSync ? 'default' : 'outline'}>
                        {quickbooksSettings.autoSync ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Sync</span>
                      <span className="text-sm text-muted-foreground">
                        {quickbooksSettings.lastSyncAt 
                          ? formatDate(quickbooksSettings.lastSyncAt)
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sync Frequency</span>
                      <Badge variant="outline">{quickbooksSettings.syncFrequency}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      QuickBooks not configured
                    </p>
                    <Button onClick={() => setShowQuickbooksSettings(true)} size="sm">
                      Setup QuickBooks
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Logs Tab */}
        <TabsContent value="export-logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Export History</h3>
            <p className="text-sm text-muted-foreground">
              Recent export activities and download links
            </p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Format</th>
                      <th className="text-left p-4 font-medium">Date Range</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Records</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          No export history available
                        </td>
                      </tr>
                    ) : (
                      exportLogs.map((log: any) => (
                        <tr key={log.id} className="border-b hover:bg-muted/25">
                          <td className="p-4">{formatDate(log.createdAt)}</td>
                          <td className="p-4">
                            <Badge variant="outline">{log.exportType}</Badge>
                          </td>
                          <td className="p-4">{log.exportFormat}</td>
                          <td className="p-4">{log.dateRange}</td>
                          <td className="p-4">{getStatusBadge(log.status)}</td>
                          <td className="p-4">{log.recordCount || 0}</td>
                          <td className="p-4">
                            {log.status === 'completed' && log.fileUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={log.fileUrl} download>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Default Currency Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Default Settings</CardTitle>
                <CardDescription>
                  Configure default currency and behavior settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Select defaultValue="THB">
                    <SelectTrigger id="default-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto-conversion">Auto Currency Conversion</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-conversion" defaultChecked />
                    <span className="text-sm text-muted-foreground">
                      Automatically convert to THB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Export Preferences</CardTitle>
                <CardDescription>
                  Configure default export settings and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-export-type">Default Export Type</Label>
                  <Select defaultValue="excel">
                    <SelectTrigger id="default-export-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="include-logo">Include Company Logo</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="include-logo" defaultChecked />
                    <span className="text-sm text-muted-foreground">
                      Add logo to PDF reports
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Trends</CardTitle>
                <CardDescription>
                  Income and expense trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground">Chart visualization placeholder</p>
                </div>
              </CardContent>
            </Card>

            {/* Currency Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Distribution</CardTitle>
                <CardDescription>
                  Transaction volume by currency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground">Chart visualization placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Financial Transaction</DialogTitle>
            <DialogDescription>
              Create a new financial transaction with multi-currency support
            </DialogDescription>
          </DialogHeader>
          <Form {...transactionForm}>
            <form onSubmit={transactionForm.handleSubmit((data) => createTransactionMutation.mutate(data))} 
                  className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transactionForm.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
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
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={transactionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter transaction description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={transactionForm.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., utilities, maintenance, booking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transactionForm.control}
                  name="originalCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="originalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transactionForm.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property: any) => (
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
                  control={transactionForm.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {owners.filter((user: any) => user.role === 'owner').map((owner: any) => (
                            <SelectItem key={owner.id} value={owner.id}>
                              {owner.firstName} {owner.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transactionForm.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="REF-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddTransaction(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTransactionMutation.isPending}>
                  {createTransactionMutation.isPending ? "Creating..." : "Create Transaction"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Exchange Rate Dialog */}
      <Dialog open={showAddExchangeRate} onOpenChange={setShowAddExchangeRate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exchange Rate</DialogTitle>
            <DialogDescription>
              Add a new currency exchange rate for conversions
            </DialogDescription>
          </DialogHeader>
          <Form {...exchangeRateForm}>
            <form onSubmit={exchangeRateForm.handleSubmit((data) => createExchangeRateMutation.mutate(data))} 
                  className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={exchangeRateForm.control}
                  name="fromCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={exchangeRateForm.control}
                  name="toCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={exchangeRateForm.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.000001" placeholder="1.000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={exchangeRateForm.control}
                name="rateDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={exchangeRateForm.control}
                name="rateSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="api">API Source</SelectItem>
                        <SelectItem value="bank">Bank Rate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddExchangeRate(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createExchangeRateMutation.isPending}>
                  {createExchangeRateMutation.isPending ? "Adding..." : "Add Rate"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* QuickBooks Settings Dialog */}
      <Dialog open={showQuickbooksSettings} onOpenChange={setShowQuickbooksSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QuickBooks Integration Settings</DialogTitle>
            <DialogDescription>
              Configure QuickBooks sync settings and preferences
            </DialogDescription>
          </DialogHeader>
          <Form {...quickbooksForm}>
            <form onSubmit={quickbooksForm.handleSubmit((data) => updateQuickbooksMutation.mutate(data))} 
                  className="space-y-4">
              <FormField
                control={quickbooksForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter QuickBooks Company ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quickbooksForm.control}
                name="realmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Realm ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter QuickBooks Realm ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={quickbooksForm.control}
                  name="autoSync"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Auto Sync</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Automatically sync transactions
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={quickbooksForm.control}
                  name="syncFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sync Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={quickbooksForm.control}
                  name="syncIncome"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Sync Income</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Include income transactions
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={quickbooksForm.control}
                  name="syncExpenses"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Sync Expenses</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Include expense transactions
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={quickbooksForm.control}
                  name="syncInvoices"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Sync Invoices</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Include invoice records
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={quickbooksForm.control}
                  name="syncPayments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Sync Payments</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Include payment records
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowQuickbooksSettings(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateQuickbooksMutation.isPending}>
                  {updateQuickbooksMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Financial Data</DialogTitle>
            <DialogDescription>
              Export your financial data in various formats
            </DialogDescription>
          </DialogHeader>
          <Form {...exportForm}>
            <form onSubmit={exportForm.handleSubmit((data) => exportDataMutation.mutate(data))} 
                  className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={exportForm.control}
                  name="exportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Export Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {exportTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={exportForm.control}
                  name="exportFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {exportFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={exportForm.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={exportDataMutation.isPending}>
                  {exportDataMutation.isPending ? "Exporting..." : "Start Export"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}