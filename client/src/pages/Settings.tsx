import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Settings as SettingsIcon,
  DollarSign,
  Percent,
  CreditCard,
  Bell,
  Zap,
  Key,
  Globe,
  Shield,
  Clock,
  Save,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";

interface PlatformSetting {
  id: number;
  settingKey: string;
  settingValue: string | null;
  settingType: string;
  category: string;
  description: string | null;
  isSecret: boolean;
  updatedBy: string | null;
  updatedAt: Date | null;
  createdAt: Date | null;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("currency");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Local form state
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  // Initialize form values when settings load
  useEffect(() => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      const initialValues: Record<string, string> = {};
      (settings as PlatformSetting[]).forEach((setting) => {
        initialValues[setting.settingKey] = setting.settingValue || "";
      });
      setFormValues(initialValues);
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, data }: { key: string; data: any }) => {
      return await apiRequest(`/api/admin/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Setting Updated",
        description: "Platform setting has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Update Failed",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string) => {
    return formValues[key] || "";
  };

  const getSettingType = (key: string) => {
    const setting = (settings as PlatformSetting[]).find((s) => s.settingKey === key);
    return setting?.settingType || "string";
  };

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = async (key: string, type: string, category: string, description?: string, isSecret = false) => {
    const value = formValues[key] || "";
    updateSettingMutation.mutate({
      key,
      data: {
        settingKey: key,
        settingValue: value,
        settingType: type,
        category,
        description,
        isSecret,
      },
    });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsByCategory = {
    currency: (settings as PlatformSetting[]).filter((s) => s.category === "currency"),
    commission: (settings as PlatformSetting[]).filter((s) => s.category === "commission"),
    billing: (settings as PlatformSetting[]).filter((s) => s.category === "billing"),
    automation: (settings as PlatformSetting[]).filter((s) => s.category === "automation"),
    api: (settings as PlatformSetting[]).filter((s) => s.category === "api"),
  };

  const defaultSettings = [
    // Currency & VAT
    { key: "platform.currency", value: "USD", type: "string", category: "currency", description: "Default platform currency" },
    { key: "platform.vat_rate", value: "0.10", type: "number", category: "currency", description: "Default VAT rate (decimal, e.g., 0.10 for 10%)" },
    { key: "platform.currency_symbol", value: "$", type: "string", category: "currency", description: "Currency symbol for display" },
    
    // Commission Rules
    { key: "commission.retail_agent_rate", value: "0.05", type: "number", category: "commission", description: "Default retail agent commission rate" },
    { key: "commission.referral_agent_rate", value: "0.03", type: "number", category: "commission", description: "Default referral agent commission rate" },
    { key: "commission.auto_calculate", value: "true", type: "boolean", category: "commission", description: "Automatically calculate commissions" },
    
    // Auto-billing
    { key: "billing.addon_auto_charge", value: "true", type: "boolean", category: "billing", description: "Automatically charge add-on services" },
    { key: "billing.utility_tracking", value: "true", type: "boolean", category: "billing", description: "Enable automatic utility tracking" },
    { key: "billing.payment_reminder_days", value: "7", type: "number", category: "billing", description: "Days before payment due to send reminder" },
    
    // Task Automation
    { key: "automation.task_reminders", value: "true", type: "boolean", category: "automation", description: "Send automatic task reminders" },
    { key: "automation.cleanup_cycle_days", value: "30", type: "number", category: "automation", description: "Days after task completion to archive" },
    { key: "automation.recurring_task_advance_days", value: "3", type: "number", category: "automation", description: "Days in advance to create recurring tasks" },
    
    // API Credentials
    { key: "api.hostaway_api_key", value: "", type: "string", category: "api", description: "Hostaway API key for booking integration", isSecret: true },
    { key: "api.hostaway_account_id", value: "", type: "string", category: "api", description: "Hostaway account identifier" },
    { key: "api.pea_api_key", value: "", type: "string", category: "api", description: "PEA (Property Exchange Australia) API key", isSecret: true },
    { key: "api.pea_endpoint", value: "", type: "string", category: "api", description: "PEA API endpoint URL" },
  ];

  const ensureDefaultSettings = async () => {
    for (const setting of defaultSettings) {
      const existing = (settings as PlatformSetting[]).find((s) => s.settingKey === setting.key);
      if (!existing) {
        await handleSaveSetting(
          setting.key,
          setting.type,
          setting.category,
          setting.description,
          setting.isSecret || false
        );
      }
    }
  };

  // Redirect non-admin users after hooks are defined
  if ((user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex flex-col">
          <TopBar 
            title="Access Denied" 
            subtitle="Admin privileges required"
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          <main className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Access Restricted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This area is restricted to administrators only. Contact your system admin for access.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (settings.length === 0 && !isLoading) {
    ensureDefaultSettings();
  }

  return (
    <div className="min-h-screen flex bg-background">

      
      <div className="flex-1 flex flex-col">
        <TopBar 
          title="Platform Settings" 
          subtitle="Configure global platform defaults and integrations"
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="currency" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Currency & VAT
              </TabsTrigger>
              <TabsTrigger value="commission" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Commissions
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Auto-billing
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Credentials
              </TabsTrigger>
            </TabsList>

            {/* Currency & VAT Tab */}
            <TabsContent value="currency" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Currency & Tax Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select 
                        value={getSetting("platform.currency")} 
                        onValueChange={(value) => {
                          handleInputChange("platform.currency", value);
                          handleSaveSetting("platform.currency", "string", "currency", "Default platform currency");
                        }}
                      >
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="THB">THB - Thai Baht</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency-symbol">Currency Symbol</Label>
                      <div className="flex gap-2">
                        <Input
                          id="currency-symbol"
                          data-testid="input-currency-symbol"
                          value={getSetting("platform.currency_symbol")}
                          onChange={(e) => handleInputChange("platform.currency_symbol", e.target.value)}
                          placeholder="$"
                        />
                        <Button 
                          onClick={() => handleSaveSetting("platform.currency_symbol", "string", "currency", "Currency symbol for display")}
                          size="sm"
                          data-testid="button-save-currency-symbol"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vat-rate">Default VAT Rate (%)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="vat-rate"
                          data-testid="input-vat-rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={parseFloat(getSetting("platform.vat_rate") || "0") * 100}
                          onChange={(e) => handleInputChange("platform.vat_rate", (parseFloat(e.target.value) / 100).toString())}
                          placeholder="10"
                        />
                        <Button 
                          onClick={() => handleSaveSetting("platform.vat_rate", "number", "currency", "Default VAT rate (decimal)")}
                          size="sm"
                          data-testid="button-save-vat-rate"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commission Tab */}
            <TabsContent value="commission" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Commission Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="retail-commission">Retail Agent Commission (%)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="retail-commission"
                          data-testid="input-retail-commission"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={parseFloat(getSetting("commission.retail_agent_rate") || "0") * 100}
                          onChange={(e) => handleInputChange("commission.retail_agent_rate", (parseFloat(e.target.value) / 100).toString())}
                          placeholder="5"
                        />
                        <Button 
                          onClick={() => handleSaveSetting("commission.retail_agent_rate", "number", "commission", "Default retail agent commission rate")}
                          size="sm"
                          data-testid="button-save-retail-commission"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral-commission">Referral Agent Commission (%)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="referral-commission"
                          data-testid="input-referral-commission"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={parseFloat(getSetting("commission.referral_agent_rate") || "0") * 100}
                          onChange={(e) => handleInputChange("commission.referral_agent_rate", (parseFloat(e.target.value) / 100).toString())}
                          placeholder="3"
                        />
                        <Button 
                          onClick={() => handleSaveSetting("commission.referral_agent_rate", "number", "commission", "Default referral agent commission rate")}
                          size="sm"
                          data-testid="button-save-referral-commission"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-calculate"
                      data-testid="toggle-auto-calculate"
                      checked={getSetting("commission.auto_calculate") === "true"}
                      onCheckedChange={(checked) => {
                        handleInputChange("commission.auto_calculate", checked.toString());
                        handleSaveSetting("commission.auto_calculate", "boolean", "commission", "Automatically calculate commissions");
                      }}
                    />
                    <Label htmlFor="auto-calculate">Automatically calculate commissions on bookings</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Auto-billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Auto-billing Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="addon-auto-charge"
                        data-testid="toggle-addon-auto-charge"
                        checked={getSetting("billing.addon_auto_charge") === "true"}
                        onCheckedChange={(checked) => {
                          handleInputChange("billing.addon_auto_charge", checked.toString());
                          handleSaveSetting("billing.addon_auto_charge", "boolean", "billing", "Automatically charge add-on services");
                        }}
                      />
                      <Label htmlFor="addon-auto-charge">Auto-charge add-on services to guest bookings</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="utility-tracking"
                        data-testid="toggle-utility-tracking"
                        checked={getSetting("billing.utility_tracking") === "true"}
                        onCheckedChange={(checked) => {
                          handleInputChange("billing.utility_tracking", checked.toString());
                          handleSaveSetting("billing.utility_tracking", "boolean", "billing", "Enable automatic utility tracking");
                        }}
                      />
                      <Label htmlFor="utility-tracking">Enable automatic utility bill tracking</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-reminder">Payment Reminder (days before due)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="payment-reminder"
                          data-testid="input-payment-reminder"
                          type="number"
                          min="1"
                          max="30"
                          value={getSetting("billing.payment_reminder_days")}
                          onChange={(e) => handleInputChange("billing.payment_reminder_days", e.target.value)}
                          placeholder="7"
                        />
                        <Button 
                          onClick={() => handleSaveSetting("billing.payment_reminder_days", "number", "billing", "Days before payment due to send reminder")}
                          size="sm"
                          data-testid="button-save-payment-reminder"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Task Automation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="task-reminders"
                        data-testid="toggle-task-reminders"
                        checked={getSetting("automation.task_reminders") === "true"}
                        onCheckedChange={(checked) => {
                          handleInputChange("automation.task_reminders", checked.toString());
                          handleSaveSetting("automation.task_reminders", "boolean", "automation", "Send automatic task reminders");
                        }}
                      />
                      <Label htmlFor="task-reminders">Send automatic task reminders to assignees</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cleanup-cycle">Cleanup Cycle (days)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="cleanup-cycle"
                            data-testid="input-cleanup-cycle"
                            type="number"
                            min="1"
                            max="365"
                            value={getSetting("automation.cleanup_cycle_days")}
                            onChange={(e) => handleInputChange("automation.cleanup_cycle_days", e.target.value)}
                            placeholder="30"
                          />
                          <Button 
                            onClick={() => handleSaveSetting("automation.cleanup_cycle_days", "number", "automation", "Days after task completion to archive")}
                            size="sm"
                            data-testid="button-save-cleanup-cycle"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recurring-advance">Recurring Task Advance (days)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="recurring-advance"
                            data-testid="input-recurring-advance"
                            type="number"
                            min="1"
                            max="30"
                            value={getSetting("automation.recurring_task_advance_days")}
                            onChange={(e) => handleInputChange("automation.recurring_task_advance_days", e.target.value)}
                            placeholder="3"
                          />
                          <Button 
                            onClick={() => handleSaveSetting("automation.recurring_task_advance_days", "number", "automation", "Days in advance to create recurring tasks")}
                            size="sm"
                            data-testid="button-save-recurring-advance"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Credentials Tab */}
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    External API Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg dark:border-orange-800 dark:bg-orange-950">
                    <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Security Notice</span>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      API credentials are encrypted and stored securely. Only administrators can view or modify these values.
                    </p>
                  </div>

                  {/* Hostaway Integration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Hostaway Integration</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hostaway-key">API Key</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="hostaway-key"
                              data-testid="input-hostaway-key"
                              type={showSecrets["hostaway-key"] ? "text" : "password"}
                              value={getSetting("api.hostaway_api_key")}
                              onChange={(e) => handleInputChange("api.hostaway_api_key", e.target.value)}
                              placeholder="Enter Hostaway API key"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => toggleSecretVisibility("hostaway-key")}
                              data-testid="button-toggle-hostaway-key"
                            >
                              {showSecrets["hostaway-key"] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <Button 
                            onClick={() => handleSaveSetting("api.hostaway_api_key", "string", "api", "Hostaway API key for booking integration", true)}
                            size="sm"
                            data-testid="button-save-hostaway-key"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hostaway-account">Account ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="hostaway-account"
                            data-testid="input-hostaway-account"
                            value={getSetting("api.hostaway_account_id")}
                            onChange={(e) => handleInputChange("api.hostaway_account_id", e.target.value)}
                            placeholder="Enter Hostaway account ID"
                          />
                          <Button 
                            onClick={() => handleSaveSetting("api.hostaway_account_id", "string", "api", "Hostaway account identifier")}
                            size="sm"
                            data-testid="button-save-hostaway-account"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* PEA Integration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">PEA Integration</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pea-key">API Key</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="pea-key"
                              data-testid="input-pea-key"
                              type={showSecrets["pea-key"] ? "text" : "password"}
                              value={getSetting("api.pea_api_key")}
                              onChange={(e) => handleInputChange("api.pea_api_key", e.target.value)}
                              placeholder="Enter PEA API key"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => toggleSecretVisibility("pea-key")}
                              data-testid="button-toggle-pea-key"
                            >
                              {showSecrets["pea-key"] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <Button 
                            onClick={() => handleSaveSetting("api.pea_api_key", "string", "api", "PEA API key", true)}
                            size="sm"
                            data-testid="button-save-pea-key"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pea-endpoint">Endpoint URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="pea-endpoint"
                            data-testid="input-pea-endpoint"
                            value={getSetting("api.pea_endpoint")}
                            onChange={(e) => handleInputChange("api.pea_endpoint", e.target.value)}
                            placeholder="Enter PEA endpoint URL"
                          />
                          <Button 
                            onClick={() => handleSaveSetting("api.pea_endpoint", "string", "api", "PEA API endpoint URL")}
                            size="sm"
                            data-testid="button-save-pea-endpoint"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
