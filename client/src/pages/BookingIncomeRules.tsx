import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Settings, 
  TrendingUp, 
  Users, 
  Wallet,
  Building,
  Target,
  BarChart3,
  Shuffle,
  Receipt
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DualOtaPricing, DualOtaPricingSummary } from "@/components/DualOtaPricing";

// Mock data for property payout rules
const mockPayoutRules = [
  {
    id: 1,
    propertyName: "Villa Sapphire",
    airbnbOwnerPercent: "70",
    airbnbManagementPercent: "30",
    vrboOwnerPercent: "0",
    vrboManagementPercent: "100",
    bookingOwnerPercent: "0",
    bookingManagementPercent: "100",
    directOwnerPercent: "0",
    directManagementPercent: "100",
    stripeFeePercent: "5",
    defaultCurrency: "AUD",
    allowBookingOverride: true
  },
  {
    id: 2,
    propertyName: "Villa Emerald",
    airbnbOwnerPercent: "75",
    airbnbManagementPercent: "25",
    vrboOwnerPercent: "50",
    vrboManagementPercent: "50",
    bookingOwnerPercent: "0",
    bookingManagementPercent: "100",
    directOwnerPercent: "0",
    directManagementPercent: "100",
    stripeFeePercent: "5",
    defaultCurrency: "AUD",
    allowBookingOverride: true
  }
];

// Mock data for booking income records with dual OTA pricing
const mockBookingIncomeRecords = [
  {
    id: 1,
    propertyName: "Villa Sapphire",
    guestName: "John Smith",
    bookingPlatform: "Airbnb",
    bookingReference: "HM89234712",
    checkInDate: "2025-01-15",
    checkOutDate: "2025-01-22",
    // OTA Dual Pricing Data
    guestTotalPrice: 2450.00,       // What guest paid to Airbnb
    platformPayout: 2100.00,        // What host received after Airbnb's 14.3% commission
    otaCommissionAmount: 350.00,    // Airbnb commission (14.3%)
    // Legacy for backward compatibility
    grossIncome: "2100.00",         // Maps to platformPayout
    ownerShare: "1470.00",          // 70% of platformPayout
    managementShare: "630.00",      // 30% of platformPayout
    stripeFee: "105.00",            // 5% processing fee
    currency: "AUD",
    payoutStatus: "pending"
  },
  {
    id: 2,
    propertyName: "Villa Emerald",
    guestName: "Sarah Wilson",
    bookingPlatform: "VRBO",
    bookingReference: "VR45678901",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-27",
    // OTA Dual Pricing Data
    guestTotalPrice: 2115.00,       // What guest paid to VRBO
    platformPayout: 1800.00,        // What host received after VRBO's 15% commission
    otaCommissionAmount: 315.00,    // VRBO commission (15%)
    // Legacy for backward compatibility
    grossIncome: "1800.00",         // Maps to platformPayout
    ownerShare: "900.00",           // 50% of platformPayout
    managementShare: "900.00",      // 50% of platformPayout
    stripeFee: "90.00",             // 5% processing fee
    currency: "AUD",
    payoutStatus: "processed"
  },
  {
    id: 3,
    propertyName: "Villa Opal",
    guestName: "David Chen",
    bookingPlatform: "Booking.com",
    bookingReference: "BC12345678",
    checkInDate: "2025-01-25",
    checkOutDate: "2025-02-01",
    // OTA Dual Pricing Data
    guestTotalPrice: 1950.00,       // What guest paid to Booking.com
    platformPayout: 1560.00,        // What host received after Booking.com's 20% commission
    otaCommissionAmount: 390.00,    // Booking.com commission (20%)
    // Legacy for backward compatibility
    grossIncome: "1560.00",         // Maps to platformPayout
    ownerShare: "0.00",             // 0% to owner (management property)
    managementShare: "1560.00",     // 100% to management
    stripeFee: "78.00",             // 5% processing fee
    currency: "AUD",
    payoutStatus: "processed"
  },
  {
    id: 4,
    propertyName: "Villa Diamond",
    guestName: "Lisa Martinez",
    bookingPlatform: "Direct",
    bookingReference: "DIR789012",
    checkInDate: "2025-02-05",
    checkOutDate: "2025-02-12",
    // Direct booking - no OTA commission
    guestTotalPrice: 2200.00,       // What guest paid directly
    platformPayout: 2200.00,        // Same as guest total (no OTA commission)
    otaCommissionAmount: 0.00,      // No OTA commission
    // Legacy for backward compatibility
    grossIncome: "2200.00",         // Maps to platformPayout
    ownerShare: "0.00",             // 0% to owner (management property)
    managementShare: "2200.00",     // 100% to management
    stripeFee: "110.00",            // 5% processing fee
    currency: "AUD",
    payoutStatus: "pending"
  }
];

// Mock data for owner balance requests
const mockOwnerBalanceRequests = [
  {
    id: 1,
    ownerName: "Michael Chen",
    propertyName: "Villa Sapphire",
    requestedAmount: "4200.00",
    availableBalance: "4850.00",
    requestType: "withdrawal",
    status: "pending",
    requestDate: "2025-01-10",
    currency: "AUD"
  },
  {
    id: 2,
    ownerName: "Emma Davis",
    propertyName: "Villa Emerald",
    requestedAmount: "3500.00",
    availableBalance: "3500.00",
    requestType: "full_balance",
    status: "approved",
    requestDate: "2025-01-08",
    currency: "AUD"
  }
];

// Mock data for commission payouts
const mockCommissionPayouts = [
  {
    id: 1,
    agentName: "Alex Thompson",
    agentType: "retail",
    propertyName: "Villa Sapphire",
    commissionAmount: "210.00",
    commissionPercent: "10",
    bookingReference: "HM89234712",
    payoutStatus: "pending",
    earnedDate: "2025-01-15",
    currency: "AUD"
  },
  {
    id: 2,
    agentName: "Lisa Rodriguez",
    agentType: "referral",
    propertyName: "Villa Emerald",
    commissionAmount: "90.00",
    commissionPercent: "5",
    bookingReference: "VR45678901",
    payoutStatus: "paid",
    earnedDate: "2025-01-20",
    currency: "AUD"
  }
];

// Mock data for analytics
const mockAnalytics = {
  totalBookingIncome: "85420.00",
  totalOwnerShare: "52140.00",
  totalManagementShare: "33280.00",
  totalCommissionsPaid: "4250.00",
  averageBookingValue: "1685.00",
  topPerformingProperty: "Villa Sapphire",
  platformDistribution: {
    airbnb: "45%",
    vrbo: "25%",
    booking: "15%",
    direct: "15%"
  }
};

export default function BookingIncomeRules() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("rules");
  const [editingRule, setEditingRule] = useState<any>(null);

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
  };

  const handleSaveRule = () => {
    toast({
      title: "Payout Rule Updated",
      description: "Property commission rules have been saved successfully.",
    });
    setEditingRule(null);
  };

  const handleProcessPayout = (recordId: number) => {
    toast({
      title: "Payout Processed",
      description: "Owner payout has been processed and logged.",
    });
  };

  const handleApproveRequest = (requestId: number) => {
    toast({
      title: "Request Approved",
      description: "Owner balance request has been approved.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Income Rules & Commission Structure</h1>
          <p className="text-muted-foreground">
            Manage property-based booking income, OTA routing, and commission payouts
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Target className="h-4 w-4 mr-1" />
          Property-Based System
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Payout Rules
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Booking Income
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Owner Balances
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Commission Payouts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Property Payout Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property-Based Payout Rules
              </CardTitle>
              <CardDescription>
                Configure commission splits and routing rules for each property across different booking platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPayoutRules.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{rule.propertyName}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{rule.defaultCurrency}</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Edit Rules
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-blue-600">Airbnb Split</Label>
                        <div className="text-sm">
                          <div>Owner: {rule.airbnbOwnerPercent}%</div>
                          <div>Management: {rule.airbnbManagementPercent}%</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-red-600">VRBO Split</Label>
                        <div className="text-sm">
                          <div>Owner: {rule.vrboOwnerPercent}%</div>
                          <div>Management: {rule.vrboManagementPercent}%</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-600">Booking.com Split</Label>
                        <div className="text-sm">
                          <div>Owner: {rule.bookingOwnerPercent}%</div>
                          <div>Management: {rule.bookingManagementPercent}%</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-600">Direct Booking Split</Label>
                        <div className="text-sm">
                          <div>Owner: {rule.directOwnerPercent}%</div>
                          <div>Management: {rule.directManagementPercent}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Stripe Fee: {rule.stripeFeePercent}%</span>
                      <span>Override Allowed: {rule.allowBookingOverride ? "Yes" : "No"}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Income Records Tab */}
        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Booking Income Records
              </CardTitle>
              <CardDescription>
                Track booking income, automated splits, and payout routing across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBookingIncomeRecords.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{record.propertyName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {record.guestName} • {record.bookingReference}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.bookingPlatform === "Airbnb" ? "default" : "secondary"}>
                          {record.bookingPlatform}
                        </Badge>
                        <Badge variant={record.payoutStatus === "processed" ? "default" : "secondary"}>
                          {record.payoutStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Dual OTA Pricing Section */}
                    <div className="mb-4">
                      <DualOtaPricingSummary
                        guestTotalPrice={record.guestTotalPrice}
                        platformPayout={record.platformPayout}
                        otaCommissionAmount={record.otaCommissionAmount}
                        currency={record.currency}
                        platform={record.bookingPlatform}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Check-in</Label>
                        <div className="font-medium">{record.checkInDate}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Check-out</Label>
                        <div className="font-medium">{record.checkOutDate}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Owner Share</Label>
                        <div className="font-medium text-green-600">{record.currency} {record.ownerShare}</div>
                        <div className="text-xs text-muted-foreground">From payout amount</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Management Share</Label>
                        <div className="font-medium text-blue-600">{record.currency} {record.managementShare}</div>
                        <div className="text-xs text-muted-foreground">From payout amount</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Stripe Fee: {record.currency} {record.stripeFee}
                      </div>
                      {record.payoutStatus === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => handleProcessPayout(record.id)}>
                          <Shuffle className="h-4 w-4 mr-1" />
                          Process Payout
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner Balance Requests Tab */}
        <TabsContent value="balances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Owner Balance Requests
              </CardTitle>
              <CardDescription>
                Manage owner balance withdrawals and payout requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOwnerBalanceRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{request.ownerName}</h3>
                        <p className="text-sm text-muted-foreground">{request.propertyName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={request.status === "approved" ? "default" : "secondary"}>
                          {request.status}
                        </Badge>
                        <Badge variant="outline">{request.requestType}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Request Date</Label>
                        <div className="font-medium">{request.requestDate}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Requested Amount</Label>
                        <div className="font-medium">{request.currency} {request.requestedAmount}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Available Balance</Label>
                        <div className="font-medium text-green-600">{request.currency} {request.availableBalance}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Actions</Label>
                        {request.status === "pending" ? (
                          <Button variant="outline" size="sm" onClick={() => handleApproveRequest(request.id)}>
                            Approve
                          </Button>
                        ) : (
                          <Badge variant="default">Processed</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Payouts Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Commission Payouts
              </CardTitle>
              <CardDescription>
                Track and manage commission payouts for retail and referral agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCommissionPayouts.map((payout) => (
                  <Card key={payout.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{payout.agentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payout.propertyName} • {payout.bookingReference}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={payout.agentType === "retail" ? "default" : "secondary"}>
                          {payout.agentType} agent
                        </Badge>
                        <Badge variant={payout.payoutStatus === "paid" ? "default" : "secondary"}>
                          {payout.payoutStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Earned Date</Label>
                        <div className="font-medium">{payout.earnedDate}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Commission Rate</Label>
                        <div className="font-medium">{payout.commissionPercent}%</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Commission Amount</Label>
                        <div className="font-medium text-green-600">{payout.currency} {payout.commissionAmount}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <div className="font-medium">{payout.payoutStatus}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Booking Income</p>
                    <p className="text-2xl font-bold">AUD {mockAnalytics.totalBookingIncome}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Owner Share Total</p>
                    <p className="text-2xl font-bold">AUD {mockAnalytics.totalOwnerShare}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Management Share</p>
                    <p className="text-2xl font-bold">AUD {mockAnalytics.totalManagementShare}</p>
                  </div>
                  <Building className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Commissions Paid</p>
                    <p className="text-2xl font-bold">AUD {mockAnalytics.totalCommissionsPaid}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Airbnb</span>
                      <Badge variant="default">{mockAnalytics.platformDistribution.airbnb}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>VRBO</span>
                      <Badge variant="secondary">{mockAnalytics.platformDistribution.vrbo}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Booking.com</span>
                      <Badge variant="outline">{mockAnalytics.platformDistribution.booking}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Direct Bookings</span>
                      <Badge variant="outline">{mockAnalytics.platformDistribution.direct}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Average Booking Value</span>
                      <span className="font-medium">AUD {mockAnalytics.averageBookingValue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Top Performing Property</span>
                      <span className="font-medium">{mockAnalytics.topPerformingProperty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Payout Rule Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payout Rules - {editingRule?.propertyName}</DialogTitle>
            <DialogDescription>
              Configure commission splits and routing rules for this property
            </DialogDescription>
          </DialogHeader>
          
          {editingRule && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Airbnb Owner %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.airbnbOwnerPercent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Airbnb Management %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.airbnbManagementPercent}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>VRBO Owner %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.vrboOwnerPercent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>VRBO Management %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.vrboManagementPercent}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Booking.com Owner %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.bookingOwnerPercent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Booking.com Management %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.bookingManagementPercent}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Direct Booking Owner %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.directOwnerPercent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Direct Booking Management %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.directManagementPercent}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stripe Fee %</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingRule.stripeFeePercent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Default Currency</Label>
                  <Select defaultValue={editingRule.defaultCurrency}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="THB">THB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingRule(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRule}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}