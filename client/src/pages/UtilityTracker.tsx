import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Car, 
  Zap, 
  Droplets, 
  Wifi, 
  Flame, 
  Shield, 
  Plus, 
  Download, 
  Upload,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Settings,
  Bell,
  FileText,
  Eye
} from "lucide-react";

export default function UtilityTracker() {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedUtilityType, setSelectedUtilityType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [setupData, setSetupData] = useState({
    property: "",
    utilityType: "",
    provider: "",
    accountNumber: "",
    rate: "",
    autoPayEnabled: false
  });

  const properties = [
    { id: 1, name: "Villa Samui Breeze", location: "Koh Samui" },
    { id: 2, name: "Villa Tropical Paradise", location: "Phuket" },
    { id: 3, name: "Villa Aruna", location: "Bali" },
    { id: 4, name: "Villa Gala", location: "Krabi" }
  ];

  const utilityTypes = [
    { id: "electricity", name: "Electricity", icon: Zap, color: "text-yellow-500" },
    { id: "water", name: "Water", icon: Droplets, color: "text-blue-500" },
    { id: "internet", name: "Internet", icon: Wifi, color: "text-green-500" },
    { id: "gas", name: "Gas", icon: Flame, color: "text-orange-500" },
    { id: "security", name: "Security", icon: Shield, color: "text-red-500" },
    { id: "maintenance", name: "Maintenance", icon: Settings, color: "text-purple-500" }
  ];

  const utilityBills = [
    {
      id: 1,
      propertyId: 1,
      type: "electricity",
      provider: "PEA (Provincial Electricity Authority)",
      accountNumber: "1234567890",
      billDate: "2025-01-15",
      dueDate: "2025-02-15",
      amount: 3500,
      currency: "THB",
      status: "paid",
      usage: "875 kWh",
      period: "December 2024",
      receiptUrl: "/receipts/villa1-electricity-jan2025.pdf"
    },
    {
      id: 2,
      propertyId: 1,
      type: "water",
      provider: "Samui Water Works",
      accountNumber: "WAT-001234",
      billDate: "2025-01-10",
      dueDate: "2025-02-10",
      amount: 890,
      currency: "THB",
      status: "paid",
      usage: "45 m³",
      period: "December 2024",
      receiptUrl: "/receipts/villa1-water-jan2025.pdf"
    },
    {
      id: 3,
      propertyId: 2,
      type: "internet",
      provider: "AIS Fiber",
      accountNumber: "AIS-567890",
      billDate: "2025-01-20",
      dueDate: "2025-02-20",
      amount: 1200,
      currency: "THB",
      status: "pending",
      usage: "Unlimited",
      period: "January 2025",
      receiptUrl: null
    },
    {
      id: 4,
      propertyId: 3,
      type: "electricity",
      provider: "PLN (Perusahaan Listrik Negara)",
      accountNumber: "PLN-789012",
      billDate: "2025-01-12",
      dueDate: "2025-02-12",
      amount: 2800,
      currency: "IDR",
      status: "overdue",
      usage: "690 kWh",
      period: "December 2024",
      receiptUrl: null
    },
    {
      id: 5,
      propertyId: 1,
      type: "gas",
      provider: "PTT Gas",
      accountNumber: "GAS-345678",
      billDate: "2025-01-08",
      dueDate: "2025-02-08",
      amount: 650,
      currency: "THB",
      status: "paid",
      usage: "25 kg",
      period: "December 2024",
      receiptUrl: "/receipts/villa1-gas-jan2025.pdf"
    }
  ];

  const monthlyStats = {
    totalAmount: 8940,
    paidAmount: 6340,
    pendingAmount: 1200,
    overdueAmount: 1400,
    billCount: 15,
    averagePerProperty: 2235
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "processing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "pending": return Clock;
      case "overdue": return AlertTriangle;
      default: return Clock;
    }
  };

  const filteredBills = utilityBills.filter(bill => {
    if (selectedProperty !== "all" && bill.propertyId !== parseInt(selectedProperty)) return false;
    if (selectedUtilityType !== "all" && bill.type !== selectedUtilityType) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Car className="w-8 h-8" />
            Utility Tracker
          </h1>
          <p className="text-gray-600">Track utility bills, usage, and payments across all properties</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Utility Bill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Property</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Utility Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {utilityTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bill Amount</Label>
                  <Input type="number" placeholder="Enter amount" />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Upload Receipt</Label>
                  <Input type="file" accept=".pdf,.jpg,.png" />
                </div>
                <Button className="w-full">Upload Bill</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Utility Account
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Monthly</p>
                    <p className="text-2xl font-bold">{formatCurrency(monthlyStats.totalAmount, 'THB')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Bills</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyStats.paidAmount, 'THB')}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(monthlyStats.pendingAmount, 'THB')}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyStats.overdueAmount, 'THB')}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Utility Types Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {utilityTypes.map((type) => {
              const IconComponent = type.icon;
              const typeBills = utilityBills.filter(bill => bill.type === type.id);
              const totalAmount = typeBills.reduce((sum, bill) => sum + bill.amount, 0);
              
              return (
                <Card key={type.id}>
                  <CardContent className="p-4 text-center">
                    <IconComponent className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
                    <p className="font-medium text-sm">{type.name}</p>
                    <p className="text-xs text-gray-600">{typeBills.length} bills</p>
                    <p className="text-sm font-bold mt-1">{formatCurrency(totalAmount, 'THB')}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Bills */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {utilityBills.slice(0, 5).map((bill) => {
                  const property = properties.find(p => p.id === bill.propertyId);
                  const utilityType = utilityTypes.find(t => t.id === bill.type);
                  const StatusIcon = getStatusIcon(bill.status);
                  const UtilityIcon = utilityType?.icon || Car;
                  
                  return (
                    <div key={bill.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <UtilityIcon className={`w-5 h-5 ${utilityType?.color}`} />
                        <div>
                          <p className="font-medium">{property?.name}</p>
                          <p className="text-sm text-gray-600">{utilityType?.name} • {bill.period}</p>
                          <p className="text-xs text-gray-500">{bill.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </div>
                        <p className="font-bold">{formatCurrency(bill.amount, bill.currency)}</p>
                        <p className="text-xs text-gray-500">Due: {bill.dueDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUtilityType} onValueChange={setSelectedUtilityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Utilities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Utilities</SelectItem>
                    {utilityTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Current Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Month</SelectItem>
                    <SelectItem value="last">Last Month</SelectItem>
                    <SelectItem value="last3">Last 3 Months</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Bills List */}
          <Card>
            <CardHeader>
              <CardTitle>Utility Bills ({filteredBills.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBills.map((bill) => {
                  const property = properties.find(p => p.id === bill.propertyId);
                  const utilityType = utilityTypes.find(t => t.id === bill.type);
                  const StatusIcon = getStatusIcon(bill.status);
                  const UtilityIcon = utilityType?.icon || Car;
                  
                  return (
                    <div key={bill.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <UtilityIcon className={`w-6 h-6 ${utilityType?.color}`} />
                          <div>
                            <h4 className="font-medium">{property?.name}</h4>
                            <p className="text-sm text-gray-600">{utilityType?.name} Bill</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-5 h-5" />
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Provider</p>
                          <p className="font-medium">{bill.provider}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Period</p>
                          <p className="font-medium">{bill.period}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Usage</p>
                          <p className="font-medium">{bill.usage}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-bold text-lg">{formatCurrency(bill.amount, bill.currency)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-500">
                          Due: {bill.dueDate} • Account: {bill.accountNumber}
                        </div>
                        <div className="flex gap-2">
                          {bill.receiptUrl && (
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Receipt
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Mark Paid
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Utility Accounts Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{property.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {utilityTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <div key={type.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`w-4 h-4 ${type.color}`} />
                              <span className="text-sm">{type.name}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSetupData({
                                  property: property.name,
                                  utilityType: type.name,
                                  provider: "",
                                  accountNumber: "",
                                  rate: "",
                                  autoPayEnabled: false
                                });
                                setSetupDialogOpen(true);
                              }}
                            >
                              Setup
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>January 2025</span>
                    <span className="font-bold">{formatCurrency(8940, 'THB')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>December 2024</span>
                    <span className="font-bold">{formatCurrency(8230, 'THB')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>November 2024</span>
                    <span className="font-bold">{formatCurrency(7890, 'THB')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Utility Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utilityTypes.map((type) => {
                    const typeBills = utilityBills.filter(bill => bill.type === type.id);
                    const totalAmount = typeBills.reduce((sum, bill) => sum + bill.amount, 0);
                    const IconComponent = type.icon;
                    
                    return (
                      <div key={type.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${type.color}`} />
                          <span className="text-sm">{type.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(totalAmount, 'THB')}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-red-200 rounded bg-red-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-800">Overdue Bill</p>
                      <p className="text-sm text-red-600">Villa Aruna electricity bill is 5 days overdue</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-yellow-200 rounded bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-800">Due Soon</p>
                      <p className="text-sm text-yellow-600">Villa Tropical Paradise internet bill due in 3 days</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Pay Now</Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-blue-200 rounded bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-800">New Bill Received</p>
                      <p className="text-sm text-blue-600">Villa Samui Breeze water bill for January 2025</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email alerts for due bills</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Get SMS alerts for overdue bills</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-pay Reminders</p>
                    <p className="text-sm text-gray-600">Reminders 7 days before due date</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label>Default Currency</Label>
                  <Select defaultValue="THB">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="IDR">IDR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Utility Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Property</Label>
              <Input 
                value={setupData.property} 
                disabled 
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Utility Type</Label>
              <Input 
                value={setupData.utilityType} 
                disabled 
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Provider Name</Label>
              <Input 
                placeholder="e.g., PEA, Metropolitan Waterworks"
                value={setupData.provider}
                onChange={(e) => setSetupData({...setupData, provider: e.target.value})}
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input 
                placeholder="Enter account number"
                value={setupData.accountNumber}
                onChange={(e) => setSetupData({...setupData, accountNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Rate per Unit (THB)</Label>
              <Input 
                type="number"
                placeholder="e.g., 7.50"
                value={setupData.rate}
                onChange={(e) => setSetupData({...setupData, rate: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={setupData.autoPayEnabled}
                onCheckedChange={(checked) => setSetupData({...setupData, autoPayEnabled: checked})}
              />
              <Label>Enable Auto-pay Notifications</Label>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  console.log('Setting up utility account:', setupData);
                  // Here you would typically save to backend
                  setSetupDialogOpen(false);
                  // Reset form
                  setSetupData({
                    property: "",
                    utilityType: "",
                    provider: "",
                    accountNumber: "",
                    rate: "",
                    autoPayEnabled: false
                  });
                }}
              >
                Save Account Setup
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSetupDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}