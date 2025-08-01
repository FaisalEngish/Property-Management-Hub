import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, AlertTriangle, Clock, FileText, Users, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Service Categories for filtering
const SERVICE_CATEGORIES = [
  "cleaning", "maintenance", "security", "landscaping", "pool", "management"
];

const BILLING_FREQUENCIES = [
  "monthly", "quarterly", "bi-annual", "annual"
];

const BILLING_ROUTES = [
  { value: "company_expense", label: "Company Expense" },
  { value: "owner_charge", label: "Charge to Owner" }
];

const BILL_STATUSES = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "paid", label: "Paid", color: "green" },
  { value: "overdue", label: "Overdue", color: "red" },
  { value: "disputed", label: "Disputed", color: "orange" }
];

export default function RecurringServicesBilling() {
  const [activeTab, setActiveTab] = useState("services");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/recurring-services"],
    retry: 1,
  });

  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ["/api/recurring-service-bills"],
    retry: 1,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/recurring-services-analytics"],
    retry: 1,
  });

  const { data: overdueBills = [] } = useQuery({
    queryKey: ["/api/recurring-services/overdue"],
    retry: 1,
  });

  const { data: upcomingBills = [] } = useQuery({
    queryKey: ["/api/recurring-services/upcoming"],
    retry: 1,
  });

  // Service Management State
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    serviceCategory: "",
    providerName: "",
    providerContact: "",
    providerEmail: "",
    billingFrequency: "monthly",
    billingAmount: "",
    nextBillingDate: "",
    billingRoute: "company_expense",
    notes: ""
  });

  // Bill Management State
  const [billForm, setBillForm] = useState({
    serviceId: "",
    billNumber: "",
    billDate: "",
    dueDate: "",
    billAmount: "",
    billingRoute: "company_expense",
    notes: ""
  });

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/recurring-services", data),
    onSuccess: () => {
      toast({ title: "Service created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-services"] });
      setServiceForm({
        serviceName: "",
        serviceCategory: "",
        providerName: "",
        providerContact: "",
        providerEmail: "",
        billingFrequency: "monthly",
        billingAmount: "",
        nextBillingDate: "",
        billingRoute: "company_expense",
        notes: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating service",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createBillMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/recurring-service-bills", data),
    onSuccess: () => {
      toast({ title: "Bill recorded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-service-bills"] });
      setBillForm({
        serviceId: "",
        billNumber: "",
        billDate: "",
        dueDate: "",
        billAmount: "",
        billingRoute: "company_expense",
        notes: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error recording bill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markBillPaidMutation = useMutation({
    mutationFn: ({ billId, paymentDetails }: any) => 
      apiRequest("POST", `/api/recurring-service-bills/${billId}/mark-paid`, paymentDetails),
    onSuccess: () => {
      toast({ title: "Bill marked as paid" });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-service-bills"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating bill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createServiceMutation.mutate(serviceForm);
  };

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBillMutation.mutate(billForm);
  };

  const handleMarkPaid = (billId: number) => {
    const paymentDetails = {
      paidAmount: parseFloat(prompt("Enter paid amount:") || "0"),
      paymentDate: new Date().toISOString(),
      paymentMethod: prompt("Payment method (card/bank_transfer/check/cash):") || "card",
      paymentReference: prompt("Payment reference (optional):") || "",
      processedBy: "current-user-id"
    };

    if (paymentDetails.paidAmount > 0) {
      markBillPaidMutation.mutate({ billId, paymentDetails });
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = BILL_STATUSES.find(s => s.value === status);
    return (
      <Badge variant={statusConfig?.color === 'green' ? 'default' : 'destructive'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recurring Services & Bills Management</h1>
          <p className="mt-2 text-gray-600">
            Manage recurring property services, track billing cycles, and monitor payment schedules
          </p>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Active Services</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalServices}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Monthly Billing</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.totalMonthlyBilling)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Upcoming Bills</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.upcomingBills.count}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(analytics.upcomingBills.totalAmount)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Overdue Bills</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.overdueBills.count}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(analytics.overdueBills.totalAmount)}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="bills">Bills & Payments</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Services Management */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Service */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Recurring Service</CardTitle>
                  <CardDescription>Register a new recurring service for property management</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="serviceName">Service Name</Label>
                      <Input
                        id="serviceName"
                        value={serviceForm.serviceName}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, serviceName: e.target.value }))}
                        placeholder="e.g., Weekly Pool Cleaning"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="serviceCategory">Category</Label>
                        <Select 
                          value={serviceForm.serviceCategory}
                          onValueChange={(value) => setServiceForm(prev => ({ ...prev, serviceCategory: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="billingFrequency">Billing Frequency</Label>
                        <Select 
                          value={serviceForm.billingFrequency}
                          onValueChange={(value) => setServiceForm(prev => ({ ...prev, billingFrequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            {BILLING_FREQUENCIES.map(freq => (
                              <SelectItem key={freq} value={freq}>
                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="providerName">Service Provider</Label>
                      <Input
                        id="providerName"
                        value={serviceForm.providerName}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, providerName: e.target.value }))}
                        placeholder="Provider company name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="providerContact">Contact Number</Label>
                        <Input
                          id="providerContact"
                          value={serviceForm.providerContact}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, providerContact: e.target.value }))}
                          placeholder="Phone number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="providerEmail">Email</Label>
                        <Input
                          id="providerEmail"
                          type="email"
                          value={serviceForm.providerEmail}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, providerEmail: e.target.value }))}
                          placeholder="provider@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingAmount">Billing Amount</Label>
                        <Input
                          id="billingAmount"
                          type="number"
                          step="0.01"
                          value={serviceForm.billingAmount}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, billingAmount: e.target.value }))}
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="nextBillingDate">Next Billing Date</Label>
                        <Input
                          id="nextBillingDate"
                          type="date"
                          value={serviceForm.nextBillingDate}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billingRoute">Billing Route</Label>
                      <Select 
                        value={serviceForm.billingRoute}
                        onValueChange={(value) => setServiceForm(prev => ({ ...prev, billingRoute: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing route" />
                        </SelectTrigger>
                        <SelectContent>
                          {BILLING_ROUTES.map(route => (
                            <SelectItem key={route.value} value={route.value}>
                              {route.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createServiceMutation.isPending}
                    >
                      {createServiceMutation.isPending ? "Creating..." : "Create Service"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Services List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Services</CardTitle>
                  <CardDescription>Currently managed recurring services</CardDescription>
                </CardHeader>
                <CardContent>
                  {servicesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No recurring services found</p>
                      <p className="text-sm">Add your first service to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {services.map((service: any) => (
                        <div key={service.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{service.serviceName}</h4>
                              <p className="text-sm text-gray-600">{service.providerName}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{service.serviceCategory}</Badge>
                                <Badge variant="outline">{service.billingFrequency}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(service.billingAmount)}</p>
                              <p className="text-sm text-gray-600">
                                Next: {formatDate(service.nextBillingDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bills & Payments */}
          <TabsContent value="bills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Record New Bill */}
              <Card>
                <CardHeader>
                  <CardTitle>Record New Bill</CardTitle>
                  <CardDescription>Log a received bill for recurring service</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBillSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="serviceId">Service</Label>
                      <Select 
                        value={billForm.serviceId}
                        onValueChange={(value) => setBillForm(prev => ({ ...prev, serviceId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service: any) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.serviceName} - {service.providerName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="billNumber">Bill Number</Label>
                      <Input
                        id="billNumber"
                        value={billForm.billNumber}
                        onChange={(e) => setBillForm(prev => ({ ...prev, billNumber: e.target.value }))}
                        placeholder="Invoice/Bill #"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billDate">Bill Date</Label>
                        <Input
                          id="billDate"
                          type="date"
                          value={billForm.billDate}
                          onChange={(e) => setBillForm(prev => ({ ...prev, billDate: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={billForm.dueDate}
                          onChange={(e) => setBillForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billAmount">Amount</Label>
                      <Input
                        id="billAmount"
                        type="number"
                        step="0.01"
                        value={billForm.billAmount}
                        onChange={(e) => setBillForm(prev => ({ ...prev, billAmount: e.target.value }))}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createBillMutation.isPending}
                    >
                      {createBillMutation.isPending ? "Recording..." : "Record Bill"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Bills List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Bills</CardTitle>
                  <CardDescription>Track payment status and manage bills</CardDescription>
                </CardHeader>
                <CardContent>
                  {billsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : bills.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No bills recorded yet</p>
                      <p className="text-sm">Record your first bill to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bills.map((bill: any) => (
                        <div key={bill.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{bill.billNumber || `Bill #${bill.id}`}</h4>
                                {getStatusBadge(bill.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                Service: {bill.serviceName || 'Unknown Service'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Due: {formatDate(bill.dueDate)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">{formatCurrency(bill.billAmount)}</p>
                              {bill.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleMarkPaid(bill.id)}
                                  className="mt-2"
                                >
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reminders */}
          <TabsContent value="reminders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Bills */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bills (Next 7 Days)</CardTitle>
                  <CardDescription>Bills due soon that need attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBills.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No upcoming bills</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBills.map((bill: any) => (
                        <div key={bill.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium">{bill.serviceName}</p>
                            <p className="text-sm text-gray-600">Due: {formatDate(bill.dueDate)}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(bill.billAmount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Overdue Bills */}
              <Card>
                <CardHeader>
                  <CardTitle>Overdue Bills</CardTitle>
                  <CardDescription>Bills that are past due date</CardDescription>
                </CardHeader>
                <CardContent>
                  {overdueBills.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <AlertTriangle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                      <p>No overdue bills</p>
                      <p className="text-sm">Great job staying current!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {overdueBills.map((bill: any) => (
                        <div key={bill.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium">{bill.serviceName}</p>
                            <p className="text-sm text-red-600">Overdue since: {formatDate(bill.dueDate)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">{formatCurrency(bill.billAmount)}</p>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleMarkPaid(bill.id)}
                              className="mt-1"
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance Overview</CardTitle>
                <CardDescription>Track service quality and cost effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.performanceAverages && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <TrendingUp className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold">{analytics.performanceAverages.qualityRating.toFixed(1)}/5</p>
                      <p className="text-sm text-gray-600">Quality Rating</p>
                    </div>
                    <div className="text-center">
                      <Clock className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl font-bold">{analytics.performanceAverages.timelinessRating.toFixed(1)}/5</p>
                      <p className="text-sm text-gray-600">Timeliness</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
                      <p className="text-2xl font-bold">{analytics.performanceAverages.costEffectiveness.toFixed(1)}/5</p>
                      <p className="text-sm text-gray-600">Cost Effectiveness</p>
                    </div>
                    <div className="text-center">
                      <Users className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold">{analytics.performanceAverages.customerSatisfaction.toFixed(1)}/5</p>
                      <p className="text-sm text-gray-600">Customer Satisfaction</p>
                    </div>
                  </div>
                )}

                {analytics?.servicesByCategory && analytics.servicesByCategory.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Services by Category</h3>
                    <div className="space-y-3">
                      {analytics.servicesByCategory.map((category: any) => (
                        <div key={category.category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{category.category}</p>
                            <p className="text-sm text-gray-600">{category.count} services</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(category.totalBilling)}/month</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}