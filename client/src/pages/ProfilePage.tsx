import { useState, useEffect } from "react";
import { useFastAuth } from "@/lib/fastAuth";
import { profileStorage } from "@/lib/profileStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  BellOff, 
  Shield, 
  Camera,
  Save,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user } = useFastAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: (user as any)?.firstName || "Demo",
    lastName: (user as any)?.lastName || "Admin",
    email: (user as any)?.email || "admin@test.com",
    phone: (user as any)?.phone || "+66 2 123 4567",
    company: (user as any)?.company || "HostPilotPro",
    department: (user as any)?.department || "Administration",
    timezone: (user as any)?.timezone || "Asia/Bangkok",
    language: (user as any)?.language || "English"
  });

  // Load saved profile data on mount
  useEffect(() => {
    if (user) {
      const savedProfile = profileStorage.getProfile((user as any).id);
      if (savedProfile) {
        setFormData(prev => ({ ...prev, ...savedProfile }));
      }
      
      const savedNotifications = profileStorage.getNotifications((user as any).id);
      if (savedNotifications) {
        setNotifications(savedNotifications);
      }
    }
  }, [user]);
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    taskReminders: true,
    bookingAlerts: true,
    maintenanceAlerts: true,
    paymentNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    systemUpdates: false
  });
  
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "4 hours",
    passwordLastChanged: "2024-12-15"
  });

  const handleSaveProfile = () => {
    if (user) {
      // Save to localStorage for immediate persistence
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        department: formData.department
      };
      
      const saved = profileStorage.saveProfile((user as any).id, profileData);
      
      if (saved) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        });
      } else {
        toast({
          title: "Save Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive"
        });
      }
    }
    setIsEditing(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);
    
    if (user) {
      // Save to localStorage immediately
      profileStorage.saveNotifications((user as any).id, updatedNotifications);
    }
    
    toast({
      title: "Notification Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'portfolio-manager': return 'Portfolio Manager';
      case 'owner': return 'Property Owner';
      case 'staff': return 'Staff Member';
      case 'retail-agent': return 'Retail Agent';
      case 'referral-agent': return 'Referral Agent';
      case 'guest': return 'Guest';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'portfolio-manager': return 'bg-blue-500';
      case 'owner': return 'bg-green-500';
      case 'staff': return 'bg-purple-500';
      case 'retail-agent': return 'bg-orange-500';
      case 'referral-agent': return 'bg-yellow-500';
      case 'guest': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
        </div>
        <Badge className={`${getRoleColor((user as any)?.role)} text-white`}>
          {getRoleDisplayName((user as any)?.role)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={(user as any)?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  onClick={() => toast({ title: "Photo Upload", description: "Photo upload feature coming soon!" })}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">{formData.firstName} {formData.lastName}</h3>
                <p className="text-gray-600">{formData.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {getRoleDisplayName((user as any)?.role)}
                </Badge>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company</span>
                <span className="text-sm font-medium">{formData.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department</span>
                <span className="text-sm font-medium">{formData.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Timezone</span>
                <span className="text-sm font-medium">{formData.timezone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Language</span>
                <span className="text-sm font-medium">{formData.language}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    "Edit Profile"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {value ? <Bell className="h-4 w-4 text-green-600" /> : <BellOff className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }));
                    toast({
                      title: "Security Setting Updated",
                      description: `Two-factor authentication ${checked ? 'enabled' : 'disabled'}.`,
                    });
                  }}
                />
              </div>
              
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">Password Security</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Last Changed</span>
                    <span className="text-xs font-medium">{security.passwordLastChanged}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Session Timeout</span>
                    <span className="text-xs font-medium">{security.sessionTimeout}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => toast({ title: "Change Password", description: "Password change feature coming soon!" })}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}