import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  FileText,
  MessageSquare,
  Star,
  MapPin,
  User
} from "lucide-react";

export default function ReferralAgentDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch assigned properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/referral-agent/properties"],
  });

  // Fetch commission summary
  const { data: commissionSummary = {}, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/referral-agent/commission-summary"],
  });

  // Fetch monthly earnings
  const { data: earnings = [], isLoading: earningsLoading } = useQuery({
    queryKey: ["/api/referral-agent/earnings", selectedMonth, selectedYear],
  });

  // Fetch payouts
  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ["/api/referral-agent/payouts"],
  });

  // Fetch program rules
  const { data: programRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["/api/referral-agent/program-rules"],
  });

  // Fetch performance analytics
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/referral-agent/analytics"],
  });

  const generateMonthOptions = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(
        <option key={i} value={i}>
          {new Date(0, i - 1).toLocaleString('en', { month: 'long' })}
        </option>
      );
    }
    return months;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return years;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Track your property referrals and commission earnings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            {generateMonthOptions()}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            {generateYearOptions()}
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Agent Tools</TabsTrigger>
          <TabsTrigger value="program">Program Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Commission Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summaryLoading ? "..." : commissionSummary.totalEarned?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time commission earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summaryLoading ? "..." : commissionSummary.currentBalance?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for payout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {propertiesLoading ? "..." : properties.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Under your referral
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summaryLoading ? "..." : commissionSummary.totalPendingCommissions?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Properties</CardTitle>
              <CardDescription>Properties you've referred to portfolio managers</CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No properties found
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.slice(0, 5).map((property: any) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Building className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-medium">{property.propertyName}</h3>
                          <p className="text-sm text-muted-foreground">
                            PM: {property.portfolioManagerName} • {property.commissionRate}% commission
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={property.isActive ? "default" : "secondary"}>
                          {property.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Since {new Date(property.referralDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Referral Properties</CardTitle>
              <CardDescription>Complete list of properties under your referral program</CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property: any) => (
                    <div key={property.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{property.propertyName}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <User className="h-4 w-4 mr-1" />
                            Portfolio Manager: {property.portfolioManagerName}
                          </div>
                        </div>
                        <Badge variant={property.isActive ? "default" : "secondary"}>
                          {property.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Commission Rate:</span>
                          <p className="font-medium">{property.commissionRate}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Referral Date:</span>
                          <p className="font-medium">{new Date(property.referralDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Property ID:</span>
                          <p className="font-medium">#{property.propertyId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium">{property.isActive ? "Active" : "Inactive"}</p>
                        </div>
                      </div>

                      {property.notes && (
                        <div className="mt-3 p-2 bg-muted rounded">
                          <span className="text-sm text-muted-foreground">Notes:</span>
                          <p className="text-sm mt-1">{property.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Tracker</CardTitle>
              <CardDescription>Monthly commission earnings and payout history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monthly Earnings */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Earnings for {new Date(0, selectedMonth - 1).toLocaleString('en', { month: 'long' })} {selectedYear}
                  </h3>
                  
                  {earningsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : earnings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No earnings data for selected month
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {earnings.map((earning: any) => (
                        <div key={earning.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{earning.propertyName}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                Property #{earning.propertyId}
                              </div>
                            </div>
                            <Badge variant={earning.status === 'paid' ? "default" : "secondary"}>
                              {earning.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Gross Rental:</span>
                              <p className="font-medium">${earning.grossRentalIncome}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Management Fee:</span>
                              <p className="font-medium">${earning.managementFeeTotal}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Your Commission:</span>
                              <p className="font-medium text-green-600">${earning.referralCommissionEarned}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Occupancy Rate:</span>
                              <p className="font-medium">{earning.occupancyRate}%</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span>{earning.averageReviewScore}/5.0</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Bookings:</span>
                                <span className="ml-1">{earning.totalBookings}</span>
                              </div>
                            </div>
                            {earning.status === 'paid' && earning.paidAt && (
                              <div className="text-xs text-muted-foreground">
                                Paid: {new Date(earning.paidAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Payout History */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payout History</h3>
                  
                  {payoutsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : payouts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No payout history available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payouts.slice(0, 10).map((payout: any) => (
                        <div key={payout.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">${payout.payoutAmount}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payout.requestedAt).toLocaleDateString()}
                              {payout.payoutDescription && ` • ${payout.payoutDescription}`}
                            </p>
                          </div>
                          <Badge variant={
                            payout.payoutStatus === 'paid' ? "default" :
                            payout.payoutStatus === 'approved' ? "secondary" :
                            payout.payoutStatus === 'pending' ? "outline" : "destructive"
                          }>
                            {payout.payoutStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track property performance and earnings trends</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : analytics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No analytics data available
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Performance Summary */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Average Occupancy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(analytics.reduce((sum: number, item: any) => sum + parseFloat(item.occupancyRate || 0), 0) / analytics.length).toFixed(1)}%
                        </div>
                        <Progress 
                          value={analytics.reduce((sum: number, item: any) => sum + parseFloat(item.occupancyRate || 0), 0) / analytics.length} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Average Review Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(analytics.reduce((sum: number, item: any) => sum + parseFloat(item.averageReviewScore || 0), 0) / analytics.length).toFixed(1)}/5.0
                        </div>
                        <div className="flex items-center mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`h-4 w-4 ${
                                star <= (analytics.reduce((sum: number, item: any) => sum + parseFloat(item.averageReviewScore || 0), 0) / analytics.length)
                                  ? 'text-yellow-500 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Total Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics.reduce((sum: number, item: any) => sum + (item.totalBookings || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Across all properties
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Property Performance Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Property Performance Details</h3>
                    <div className="space-y-3">
                      {analytics.map((item: any) => (
                        <div key={`${item.propertyId}-${item.month}-${item.year}`} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{item.propertyName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(0, item.month - 1).toLocaleString('en', { month: 'long' })} {item.year}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">${item.referralCommissionEarned}</p>
                              <p className="text-xs text-muted-foreground">Commission Earned</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Rental Income:</span>
                              <p className="font-medium">${item.grossRentalIncome}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Occupancy:</span>
                              <p className="font-medium">{item.occupancyRate}%</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Review Score:</span>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                                <span className="font-medium">{item.averageReviewScore}/5.0</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Bookings:</span>
                              <p className="font-medium">{item.totalBookings}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Property Fact Sheets</CardTitle>
                <CardDescription>Download detailed property information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.slice(0, 5).map((property: any) => (
                    <div key={property.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{property.propertyName}</p>
                        <p className="text-sm text-muted-foreground">Property #{property.propertyId}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
                {properties.length > 5 && (
                  <Button variant="outline" className="w-full mt-3">
                    View All Properties
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Media Library</CardTitle>
                <CardDescription>Access property photos and marketing materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="bg-muted rounded-lg p-6 mb-4">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Access high-quality photos, virtual tours, and marketing materials for your referral properties
                    </p>
                  </div>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Media Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Resources</CardTitle>
              <CardDescription>Tools and resources to help with your referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>Commission Calculator</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Client Communication Templates</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Market Analysis Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program Rules</CardTitle>
              <CardDescription>Terms, conditions, and guidelines for the referral program</CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : programRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No program rules available
                </div>
              ) : (
                <div className="space-y-4">
                  {programRules.map((rule: any) => (
                    <div key={rule.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{rule.title}</h3>
                          <Badge variant="outline" className="mt-1">
                            {rule.ruleType}
                          </Badge>
                        </div>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {rule.description}
                      </p>

                      <div className="bg-muted p-3 rounded text-sm">
                        <div dangerouslySetInnerHTML={{ __html: rule.ruleContent }} />
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>Effective: {new Date(rule.effectiveDate).toLocaleDateString()}</span>
                        <span>Created by: {rule.createdByName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}