import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Database, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Receipt,
  Target,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function FinanceEngine() {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportSettings, setReportSettings] = useState({
    reportType: "comprehensive",
    includeRevenue: true,
    includeExpenses: true,
    includeOwnerBalances: true,
    includeTransactions: true,
    format: "pdf"
  });

  const properties = [
    { id: 1, name: "Villa Samui Breeze", location: "Koh Samui" },
    { id: 2, name: "Villa Tropical Paradise", location: "Phuket" },
    { id: 3, name: "Villa Aruna", location: "Bali" },
    { id: 4, name: "Villa Gala", location: "Krabi" }
  ];

  const financialSummary = {
    totalRevenue: 245000,
    totalExpenses: 89500,
    netProfit: 155500,
    profitMargin: 63.4,
    ownerPayouts: 171500,
    pendingPayouts: 28750,
    commissions: 24500,
    managementFees: 36750
  };

  const revenueBreakdown = [
    { source: "Airbnb", amount: 125000, percentage: 51, bookings: 28 },
    { source: "VRBO", amount: 75000, percentage: 31, bookings: 18 },
    { source: "Booking.com", amount: 30000, percentage: 12, bookings: 12 },
    { source: "Direct", amount: 15000, percentage: 6, bookings: 5 }
  ];

  const expenseCategories = [
    { category: "Cleaning & Maintenance", amount: 32500, percentage: 36.3 },
    { category: "Utilities", amount: 28000, percentage: 31.3 },
    { category: "Marketing", amount: 12000, percentage: 13.4 },
    { category: "Property Management", amount: 10000, percentage: 11.2 },
    { category: "Insurance & Legal", amount: 7000, percentage: 7.8 }
  ];

  const ownerBalances = [
    {
      id: 1,
      ownerName: "John Smith",
      property: "Villa Samui Breeze",
      currentBalance: 45000,
      pendingPayout: 12500,
      lastPayout: "2025-01-15",
      totalEarnings: 156000,
      status: "active"
    },
    {
      id: 2,
      ownerName: "Sarah Johnson",
      property: "Villa Tropical Paradise",
      currentBalance: 28000,
      pendingPayout: 8750,
      lastPayout: "2025-01-18",
      totalEarnings: 98500,
      status: "active"
    },
    {
      id: 3,
      ownerName: "Michael Chen",
      property: "Villa Aruna",
      currentBalance: 35000,
      pendingPayout: 5500,
      lastPayout: "2025-01-20",
      totalEarnings: 125000,
      status: "pending_review"
    },
    {
      id: 4,
      ownerName: "Lisa Wong",
      property: "Villa Gala",
      currentBalance: 52000,
      pendingPayout: 2000,
      lastPayout: "2025-01-12",
      totalEarnings: 180000,
      status: "active"
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      date: "2025-01-22",
      type: "revenue",
      description: "Airbnb booking - Villa Samui Breeze",
      amount: 8500,
      property: "Villa Samui Breeze",
      status: "completed"
    },
    {
      id: 2,
      date: "2025-01-22",
      type: "expense",
      description: "Pool cleaning service",
      amount: -800,
      property: "Villa Tropical Paradise",
      status: "completed"
    },
    {
      id: 3,
      date: "2025-01-21",
      type: "payout",
      description: "Owner payout - John Smith",
      amount: -12500,
      property: "Villa Samui Breeze",
      status: "pending"
    },
    {
      id: 4,
      date: "2025-01-21",
      type: "commission",
      description: "Management fee - 15%",
      amount: 1275,
      property: "Villa Tropical Paradise",
      status: "completed"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "revenue": return ArrowUpRight;
      case "expense": return ArrowDownRight;
      case "payout": return Wallet;
      case "commission": return Target;
      default: return Receipt;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "revenue": return "text-green-600";
      case "expense": return "text-red-600";
      case "payout": return "text-blue-600";
      case "commission": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending_review": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed": return CheckCircle;
      case "pending_review":
      case "pending": return Clock;
      default: return AlertCircle;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8" />
            Finance Engine
          </h1>
          <p className="text-gray-600">Comprehensive financial management and analytics dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
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
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowReportDialog(true)}>Generate Report</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="owners">Owner Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialSummary.totalRevenue)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(financialSummary.totalExpenses)}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(financialSummary.netProfit)}
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
                    <p className="text-sm text-gray-600">Profit Margin</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {financialSummary.profitMargin}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue and Expense Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Revenue by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueBreakdown.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                          backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)`
                        }}></div>
                        <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-gray-600">{source.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(source.amount)}</p>
                        <p className="text-sm text-gray-600">{source.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" style={{
                          backgroundColor: `hsl(${10 + index * 25}, 70%, 50%)`
                        }}></div>
                        <p className="font-medium">{category.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.amount)}</p>
                        <p className="text-sm text-gray-600">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-600">Owner Payouts</p>
                <p className="text-xl font-bold">{formatCurrency(financialSummary.ownerPayouts)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm text-gray-600">Pending Payouts</p>
                <p className="text-xl font-bold">{formatCurrency(financialSummary.pendingPayouts)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-gray-600">Commissions</p>
                <p className="text-xl font-bold">{formatCurrency(financialSummary.commissions)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-gray-600">Management Fees</p>
                <p className="text-xl font-bold">{formatCurrency(financialSummary.managementFees)}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Revenue by Platform</h4>
                  <div className="space-y-2">
                    {revenueBreakdown.map((source, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded border">
                        <span>{source.source}</span>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(source.amount)}</div>
                          <div className="text-sm text-gray-600">{source.bookings} bookings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Monthly Trend</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded border">
                      <span>January 2025</span>
                      <span className="font-bold">{formatCurrency(245000)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span>December 2024</span>
                      <span className="font-bold">{formatCurrency(220000)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span>November 2024</span>
                      <span className="font-bold">{formatCurrency(198000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{category.category}</h4>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-gray-600">{category.percentage}% of total</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Owner Balances & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ownerBalances.map((owner) => {
                  const StatusIcon = getStatusIcon(owner.status);
                  
                  return (
                    <div key={owner.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{owner.ownerName}</h4>
                          <p className="text-sm text-gray-600">{owner.property}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={getStatusColor(owner.status)}>
                            {owner.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Current Balance</p>
                          <p className="font-bold text-lg">{formatCurrency(owner.currentBalance)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pending Payout</p>
                          <p className="font-bold text-yellow-600">{formatCurrency(owner.pendingPayout)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Payout</p>
                          <p className="font-medium">{owner.lastPayout}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Earnings</p>
                          <p className="font-bold text-green-600">{formatCurrency(owner.totalEarnings)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Process Payout</Button>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const TransactionIcon = getTransactionIcon(transaction.type);
                  const StatusIcon = getStatusIcon(transaction.status);
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <TransactionIcon className={`w-5 h-5 ${getTransactionColor(transaction.type)}`} />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.property}</p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Daily Revenue</span>
                    <span className="font-bold">{formatCurrency(7903)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue Growth (MoM)</span>
                    <span className="font-bold text-green-600">+11.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expense Ratio</span>
                    <span className="font-bold">36.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner Satisfaction</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Monthly Revenue Target</span>
                      <span>97.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '97.8%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Expense Control</span>
                      <span>89.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '89.5%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Profit Margin Goal</span>
                      <span>105.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}