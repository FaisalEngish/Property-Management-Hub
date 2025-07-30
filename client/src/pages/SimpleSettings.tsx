import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Percent, Info, Save, Globe, Bell, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SimpleSettings() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    language: 'English',
    defaultManagementCommission: 15,
    portfolioManagerCommission: 50,
    referralAgentCommission: 10,
    autoCalculateCommissions: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  const handleSave = () => {
    // Save settings to backend
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Platform Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure your HostPilotPro platform preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                {isEditing ? (
                  <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 py-2">THB (Thai Baht)</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                {isEditing ? (
                  <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 py-2">Asia/Bangkok</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                {isEditing ? (
                  <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Thai">ไทย</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 py-2">English</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Default Commission Settings
            </CardTitle>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">How Commissions Work:</p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• <strong>Default rates</strong> apply to all properties unless overridden</li>
                    <li>• Each property can have <strong>custom commission rates</strong> in Property Settings</li>
                    <li>• Management commission is deducted from gross booking revenue</li>
                    <li>• Agent commissions are calculated from net revenue after management fee</li>
                    <li>• Portfolio Manager gets percentage of management commission</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="management-commission">Management Commission (%)</Label>
                {isEditing ? (
                  <Input
                    id="management-commission"
                    type="number"
                    min="0"
                    max="50"
                    value={settings.defaultManagementCommission}
                    onChange={(e) => setSettings({...settings, defaultManagementCommission: parseInt(e.target.value)})}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 py-2">{settings.defaultManagementCommission}%</p>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                )}
                <p className="text-xs text-gray-500">Deducted from gross booking revenue</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-commission">Portfolio Manager Share (%)</Label>
                {isEditing ? (
                  <Input
                    id="pm-commission"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.portfolioManagerCommission}
                    onChange={(e) => setSettings({...settings, portfolioManagerCommission: parseInt(e.target.value)})}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 py-2">{settings.portfolioManagerCommission}%</p>
                    <Badge variant="secondary">Of Management Fee</Badge>
                  </div>
                )}
                <p className="text-xs text-gray-500">Share of management commission</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral-commission">Referral Agent Commission (%)</Label>
                {isEditing ? (
                  <Input
                    id="referral-commission"
                    type="number"
                    min="0"
                    max="20"
                    value={settings.referralAgentCommission}
                    onChange={(e) => setSettings({...settings, referralAgentCommission: parseInt(e.target.value)})}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 py-2">{settings.referralAgentCommission}%</p>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                )}
                <p className="text-xs text-gray-500">From net revenue (after management fee)</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                id="auto-commission"
                checked={settings.autoCalculateCommissions}
                onCheckedChange={(checked) => setSettings({...settings, autoCalculateCommissions: checked})}
                disabled={!isEditing}
              />
              <Label htmlFor="auto-commission">Automatically calculate commissions on new bookings</Label>
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Bookings, tasks, and payment alerts</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Emergency alerts only</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-xs text-gray-500">Real-time dashboard updates</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Hostaway API</p>
                  <p className="text-xs text-gray-500">Property sync</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Stripe Payments</p>
                  <p className="text-xs text-gray-500">Commission processing</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email Service</p>
                  <p className="text-xs text-gray-500">Notifications</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Captain Cortex AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">👨‍✈️</span>
              Captain Cortex AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">AI Assistant Status</p>
                  <p className="text-xs text-gray-500">Smart co-pilot active</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Response Cache</p>
                  <p className="text-xs text-gray-500">Performance optimization</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">5 min TTL</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">AI Model</p>
                  <p className="text-xs text-gray-500">OpenAI integration</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">GPT-4o-mini</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission System Explanation */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Info className="h-5 w-5" />
              Commission System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-800">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">1. Default vs Property-Specific Settings</h4>
                <p className="text-sm">The rates shown above are <strong>defaults</strong> that apply to all properties. You can override these for specific properties in Property Settings → Commission tab.</p>
              </div>
              <div>
                <h4 className="font-semibold">2. Commission Flow</h4>
                <p className="text-sm">Booking Revenue → Management Commission (15%) → Remaining goes to Owner → Agent commissions calculated separately from net revenue</p>
              </div>
              <div>
                <h4 className="font-semibold">3. Where to Customize</h4>
                <p className="text-sm">Go to <strong>Property Management → Select Property → Settings → Commission</strong> to set custom rates for individual properties.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}