import { useState } from "react";
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

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

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
    const setting = settings.find((s: PlatformSetting) => s.settingKey === key);
    return setting?.settingValue || "";
  };

  const getSettingType = (key: string) => {
    const setting = settings.find((s: PlatformSetting) => s.settingKey === key);
    return setting?.settingType || "string";
  };

  const handleUpdateSetting = async (key: string, value: string, type: string, category: string, description?: string, isSecret = false) => {
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
    currency: settings.filter((s: PlatformSetting) => s.category === "currency"),
    commission: settings.filter((s: PlatformSetting) => s.category === "commission"),
    billing: settings.filter((s: PlatformSetting) => s.category === "billing"),
    automation: settings.filter((s: PlatformSetting) => s.category === "automation"),
    api: settings.filter((s: PlatformSetting) => s.category === "api"),
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
      const existing = settings.find((s: PlatformSetting) => s.settingKey === setting.key);
      if (!existing) {
        await handleUpdateSetting(
          setting.key,
          setting.value,
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
                        onValueChange={(value) => handleUpdateSetting("platform.currency", value, "string", "currency", "Default platform currency")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency-symbol">Currency Symbol</Label>
                      <Input
                        id="currency-symbol"
                        value={getSetting("platform.currency_symbol")}
                        onChange={(e) => handleUpdateSetting("platform.currency_symbol", e.target.value, "string", "currency", "Currency symbol for display")}
                        placeholder="$"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vat-rate">Default VAT Rate (%)</Label>
                      <Input
                        id="vat-rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={parseFloat(getSetting("platform.vat_rate") || "0") * 100}
                        onChange={(e) => handleUpdateSetting("platform.vat_rate", (parseFloat(e.target.value) / 100).toString(), "number", "currency", "Default VAT rate (decimal)")}
                        placeholder="10"
                      />
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
                      <Input
                        id="retail-commission"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={parseFloat(getSetting("commission.retail_agent_rate") || "0") * 100}
                        onChange={(e) => handleUpdateSetting("commission.retail_agent_rate", (parseFloat(e.target.value) / 100).toString(), "number", "commission", "Default retail agent commission rate")}
                        placeholder="5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral-commission">Referral Agent Commission (%)</Label>
                      <Input
                        id="referral-commission"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={parseFloat(getSetting("commission.referral_agent_rate") || "0") * 100}
                        onChange={(e) => handleUpdateSetting("commission.referral_agent_rate", (parseFloat(e.target.value) / 100).toString(), "number", "commission", "Default referral agent commission rate")}
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-calculate"
                      checked={getSetting("commission.auto_calculate") === "true"}
                      onCheckedChange={(checked) => handleUpdateSetting("commission.auto_calculate", checked.toString(), "boolean", "commission", "Automatically calculate commissions")}
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
                        checked={getSetting("billing.addon_auto_charge") === "true"}
                        onCheckedChange={(checked) => handleUpdateSetting("billing.addon_auto_charge", checked.toString(), "boolean", "billing", "Automatically charge add-on services")}
                      />
                      <Label htmlFor="addon-auto-charge">Auto-charge add-on services to guest bookings</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="utility-tracking"
                        checked={getSetting("billing.utility_tracking") === "true"}
                        onCheckedChange={(checked) => handleUpdateSetting("billing.utility_tracking", checked.toString(), "boolean", "billing", "Enable automatic utility tracking")}
                      />
                      <Label htmlFor="utility-tracking">Enable automatic utility bill tracking</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-reminder">Payment Reminder (days before due)</Label>
                      <Input
                        id="payment-reminder"
                        type="number"
                        min="1"
                        max="30"
                        value={getSetting("billing.payment_reminder_days")}
                        onChange={(e) => handleUpdateSetting("billing.payment_reminder_days", e.target.value, "number", "billing", "Days before payment due to send reminder")}
                        placeholder="7"
                      />
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
                        checked={getSetting("automation.task_reminders") === "true"}
                        onCheckedChange={(checked) => handleUpdateSetting("automation.task_reminders", checked.toString(), "boolean", "automation", "Send automatic task reminders")}
                      />
                      <Label htmlFor="task-reminders">Send automatic task reminders to assignees</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cleanup-cycle">Cleanup Cycle (days)</Label>
                        <Input
                          id="cleanup-cycle"
                          type="number"
                          min="1"
                          max="365"
                          value={getSetting("automation.cleanup_cycle_days")}
                          onChange={(e) => handleUpdateSetting("automation.cleanup_cycle_days", e.target.value, "number", "automation", "Days after task completion to archive")}
                          placeholder="30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recurring-advance">Recurring Task Advance (days)</Label>
                        <Input
                          id="recurring-advance"
                          type="number"
                          min="1"
                          max="30"
                          value={getSetting("automation.recurring_task_advance_days")}
                          onChange={(e) => handleUpdateSetting("automation.recurring_task_advance_days", e.target.value, "number", "automation", "Days in advance to create recurring tasks")}
                          placeholder="3"
                        />
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
                  <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Security Notice</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      API credentials are encrypted and stored securely. Only administrators can view or modify these values.
                    </p>
                  </div>

                  {/* Hostaway Integration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Hostaway Integration</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hostaway-key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="hostaway-key"
                            type={showSecrets["hostaway-key"] ? "text" : "password"}
                            value={getSetting("api.hostaway_api_key")}
                            onChange={(e) => handleUpdateSetting("api.hostaway_api_key", e.target.value, "string", "api", "Hostaway API key for booking integration", true)}
                            placeholder="Enter Hostaway API key"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => toggleSecretVisibility("hostaway-key")}
                          >
                            {showSecrets["hostaway-key"] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hostaway-account">Account ID</Label>
                        <Input
                          id="hostaway-account"
                          value={getSetting("api.hostaway_account_id")}
                          onChange={(e) => handleUpdateSetting("api.hostaway_account_id", e.target.value, "string", "api", "Hostaway account identifier")}
                          placeholder="Enter Hostaway account ID"
                        />
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
                        <div className="relative">
                          <Input
                            id="pea-key"
                            type={showSecrets["pea-key"] ? "text" : "password"}
                            value={getSetting("api.pea_api_key")}
                            onChange={(e) => handleUpdateSetting("api.pea_api_key", e.target.value, "string", "api", "PEA (Property Exchange Australia) API key", true)}
                            placeholder="Enter PEA API key"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => toggleSecretVisibility("pea-key")}
                          >
                            {showSecrets["pea-key"] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pea-endpoint">API Endpoint</Label>
                        <Input
                          id="pea-endpoint"
                          value={getSetting("api.pea_endpoint")}
                          onChange={(e) => handleUpdateSetting("api.pea_endpoint", e.target.value, "string", "api", "PEA API endpoint URL")}
                          placeholder="https://api.pea.com.au/v1"
                        />
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