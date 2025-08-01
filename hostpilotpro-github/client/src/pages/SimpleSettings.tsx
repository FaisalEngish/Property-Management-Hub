import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  AlertCircle,
  CheckCircle,
  Key,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  phone?: string;
  timezone?: string;
  language?: string;
}

interface SystemSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  theme: 'light' | 'dark' | 'system';
  organizationName: string;
  organizationLogo?: string;
}

export default function SimpleSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile'],
    queryFn: () => apiRequest('/api/user/profile'),
  });

  // Fetch system settings
  const { data: systemSettings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ['/api/settings/system'],
    queryFn: () => apiRequest('/api/settings/system'),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => 
      apiRequest('/api/user/profile', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed", 
        description: "Failed to update profile settings.",
        variant: "destructive"
      });
    }
  });

  // Update system settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => 
      apiRequest('/api/settings/system', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/system'] });
      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update system settings.", 
        variant: "destructive"
      });
    }
  });

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    updateProfileMutation.mutate({ [field]: value });
  };

  const handleSettingsUpdate = (field: keyof SystemSettings, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'THB', label: 'Thai Baht (฿)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Bangkok', label: 'Bangkok' },
    { value: 'Australia/Sydney', label: 'Sydney' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'th', label: 'Thai' },
    { value: 'ja', label: 'Japanese' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={userProfile?.firstName || ''}
                        onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userProfile?.lastName || ''}
                        onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile?.email || ''}
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userProfile?.phone || ''}
                      onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={userProfile?.timezone || 'UTC'} 
                        onValueChange={(value) => handleProfileUpdate('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={userProfile?.language || 'en'} 
                        onValueChange={(value) => handleProfileUpdate('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Shield className="h-3 w-3" />
                      {userProfile?.role} Access Level
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={systemSettings?.emailNotifications ?? true}
                  onCheckedChange={(checked) => handleSettingsUpdate('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={systemSettings?.pushNotifications ?? true}
                  onCheckedChange={(checked) => handleSettingsUpdate('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming and overdue tasks
                  </p>
                </div>
                <Switch
                  checked={systemSettings?.taskReminders ?? true}
                  onCheckedChange={(checked) => handleSettingsUpdate('taskReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Theme Preference</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={systemSettings?.theme === value ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => handleSettingsUpdate('theme', value)}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings - Admin Only */}
        {isAdmin && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={systemSettings?.organizationName || ''}
                    onChange={(e) => handleSettingsUpdate('organizationName', e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select 
                      value={systemSettings?.currency || 'USD'} 
                      onValueChange={(value) => handleSettingsUpdate('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={systemSettings?.dateFormat || 'MM/DD/YYYY'} 
                      onValueChange={(value) => handleSettingsUpdate('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Security & Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Manage API Keys
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Backup Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}