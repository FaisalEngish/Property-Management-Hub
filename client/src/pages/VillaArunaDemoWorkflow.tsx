import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  User, 
  Home, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Camera, 
  Receipt, 
  FileText,
  Users,
  MapPin,
  Phone,
  CreditCard,
  Zap,
  AlertCircle,
  BarChart3,
  Wrench,
  Waves,
  Leaf,
  Play,
  RefreshCw,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DEMO_DATA_OVERVIEW = {
  property: {
    name: "Villa Aruna (Demo)",
    location: "Bophut Hills, Koh Samui",
    bedrooms: 3,
    pool: true,
    electricityRate: 7,
    owner: "Jacky Testuser",
    pm: "Dean Testmanager"
  },
  guest: {
    name: "John Doe",
    stay: "1 July – 5 July",
    deposit: 5000,
    currency: "THB",
    nationality: "British",
    passport: "GB123456789"
  },
  workflow: {
    electricityUsage: 100,
    electricityCost: 700,
    refund: 4300,
    ownerNet: 71000,
    rentalIncome: 80000,
    managementFee: 7200,
    serviceFee: 1800
  }
};

const USER_ROLE_TESTS = [
  {
    role: "admin",
    name: "Admin",
    email: "admin@test.com",
    password: "admin123",
    icon: <User className="h-4 w-4" />,
    color: "bg-red-500",
    tests: [
      "View complete property overview",
      "Access all financial records",
      "Manage check-in/check-out tasks",
      "View utility billing details",
      "Export reports and statements"
    ]
  },
  {
    role: "portfolio-manager", 
    name: "Dean Testmanager",
    email: "dean@test.com",
    password: "pm123",
    icon: <BarChart3 className="h-4 w-4" />,
    color: "bg-blue-500",
    tests: [
      "Manage Villa Aruna operations",
      "Review John Doe booking workflow",
      "Process electricity billing",
      "Generate owner earnings report",
      "Approve maintenance tasks"
    ]
  },
  {
    role: "owner",
    name: "Jacky Testuser", 
    email: "jacky@test.com",
    password: "owner123",
    icon: <Home className="h-4 w-4" />,
    color: "bg-green-500",
    tests: [
      "View Villa Aruna earnings (71,000 THB)",
      "See electricity cost recovery",
      "Check task completion timeline", 
      "Review guest feedback",
      "Request payout for net earnings"
    ]
  },
  {
    role: "staff",
    name: "Thura Host",
    email: "thura@test.com", 
    password: "staff123",
    icon: <Users className="h-4 w-4" />,
    color: "bg-purple-500",
    tests: [
      "Complete check-in task with photos",
      "Record electric meter reading", 
      "Process check-out and billing",
      "Upload task evidence photos",
      "Update maintenance status"
    ]
  }
];

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "Guest Check-In",
    description: "John Doe arrives, passport scan, 5,000 THB deposit, meter reading: 1000 kW",
    status: "completed",
    assignedTo: "Thura Host",
    completedAt: "July 1, 15:00",
    evidence: ["passport-photo.jpg", "meter-1000kw.jpg"]
  },
  {
    id: 2,
    title: "Property Maintenance",
    description: "Pool service and garden maintenance during stay",
    status: "completed", 
    assignedTo: "Thura Host",
    completedAt: "July 3, 10:00",
    evidence: ["pool-service.jpg", "garden-maintenance.jpg"]
  },
  {
    id: 3,
    title: "Guest Check-Out",
    description: "Final meter reading: 1100 kW, usage calculation, billing & refund",
    status: "completed",
    assignedTo: "Thura Host", 
    completedAt: "July 5, 11:00",
    evidence: ["meter-1100kw.jpg", "receipt-billing.jpg"]
  },
  {
    id: 4,
    title: "Post-Checkout Cleaning",
    description: "Deep cleaning and preparation for next guests",
    status: "completed",
    assignedTo: "Thura Host",
    completedAt: "July 5, 14:00", 
    evidence: ["cleaning-complete.jpg"]
  },
  {
    id: 5,
    title: "Owner Earnings Update",
    description: "Financial reconciliation and owner earnings calculation",
    status: "completed",
    assignedTo: "Dean Testmanager",
    completedAt: "July 5, 16:00",
    evidence: ["earnings-report.pdf"]
  }
];

export default function VillaArunaDemoWorkflow() {
  const [selectedUserRole, setSelectedUserRole] = useState<string>("admin");
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check user permissions
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/demo-user"],
    retry: false,
  });

  // Fetch demo property data
  const { data: villaAruna, isLoading: isPropertyLoading } = useQuery({
    queryKey: ["/api/demo/villa-aruna"],
    enabled: !!user,
  });

  // Fetch demo booking data
  const { data: johnDoeBooking, isLoading: isBookingLoading } = useQuery({
    queryKey: ["/api/demo/john-doe-booking"],
    enabled: !!user,
  });

  // Login as different user mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return await apiRequest("POST", "/api/auth/demo-login", credentials);
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "You are now logged in as the selected user role.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/demo-user"] });
      // Redirect to appropriate dashboard
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleSwitch = (role: any) => {
    setSelectedUserRole(role.role);
    loginMutation.mutate({
      email: role.email,
      password: role.password
    });
  };

  const currentUserRole = USER_ROLE_TESTS.find(role => role.role === selectedUserRole);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🏝️ Villa Aruna Demo Workflow</h1>
          <p className="text-muted-foreground">
            Complete demo setup for testing all user roles and system workflows
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Demo Environment
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="workflow">⚡ Workflow</TabsTrigger>
          <TabsTrigger value="users">👥 User Roles</TabsTrigger>
          <TabsTrigger value="financials">💰 Financials</TabsTrigger>
          <TabsTrigger value="testing">🧪 Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{DEMO_DATA_OVERVIEW.property.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {DEMO_DATA_OVERVIEW.property.location}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Bedrooms: {DEMO_DATA_OVERVIEW.property.bedrooms}</div>
                  <div>Pool: {DEMO_DATA_OVERVIEW.property.pool ? "Yes" : "No"}</div>
                  <div>Electricity: {DEMO_DATA_OVERVIEW.property.electricityRate} THB/kW</div>
                  <div>Owner: {DEMO_DATA_OVERVIEW.property.owner}</div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{DEMO_DATA_OVERVIEW.guest.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {DEMO_DATA_OVERVIEW.guest.nationality} • {DEMO_DATA_OVERVIEW.guest.passport}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Stay Period:</span>
                    <span>{DEMO_DATA_OVERVIEW.guest.stay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit Paid:</span>
                    <span>{DEMO_DATA_OVERVIEW.guest.deposit.toLocaleString()} {DEMO_DATA_OVERVIEW.guest.currency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rental Income:</span>
                    <span className="text-green-600">+{DEMO_DATA_OVERVIEW.workflow.rentalIncome.toLocaleString()} THB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Management Fee:</span>
                    <span className="text-red-600">-{DEMO_DATA_OVERVIEW.workflow.managementFee.toLocaleString()} THB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee:</span>
                    <span className="text-red-600">-{DEMO_DATA_OVERVIEW.workflow.serviceFee.toLocaleString()} THB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Electricity (Guest):</span>
                    <span className="text-green-600">+{DEMO_DATA_OVERVIEW.workflow.electricityCost.toLocaleString()} THB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Owner Net:</span>
                    <span className="text-green-600">{DEMO_DATA_OVERVIEW.workflow.ownerNet.toLocaleString()} THB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Progress</CardTitle>
              <CardDescription>Complete booking-to-checkout workflow status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {WORKFLOW_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 border rounded-lg text-center cursor-pointer transition-all ${
                      step.status === 'completed' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                    onClick={() => setActiveWorkflowStep(step.id)}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <h3 className="text-xs font-medium">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{step.assignedTo}</p>
                    {step.status === 'completed' && (
                      <p className="text-xs text-green-600 mt-1">{step.completedAt}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Workflow Steps</CardTitle>
              <CardDescription>Step-by-step breakdown of the complete booking workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {WORKFLOW_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className={`border rounded-lg p-4 ${
                      activeWorkflowStep === step.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : step.id}
                        </div>
                        <div>
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Assigned to: {step.assignedTo}</span>
                            {step.status === 'completed' && (
                              <span>Completed: {step.completedAt}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                        {step.status}
                      </Badge>
                    </div>
                    
                    {step.evidence && step.evidence.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          Evidence Photos
                        </h4>
                        <div className="flex gap-2">
                          {step.evidence.map((photo, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {photo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Roles Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Different User Roles</CardTitle>
              <CardDescription>Login as different users to test role-based access and workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {USER_ROLE_TESTS.map((role) => (
                  <div
                    key={role.role}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedUserRole === role.role ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedUserRole(role.role)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${role.color}`}>
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Test Scenarios:</h4>
                      <ul className="space-y-1">
                        {role.tests.map((test, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {test}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button
                      className="w-full mt-3"
                      variant={selectedUserRole === role.role ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleSwitch(role);
                      }}
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Login as {role.name}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rental Income (4 nights × 20,000 THB)</span>
                    <span className="font-medium text-green-600">+80,000 THB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electricity Recovery (100 kW × 7 THB)</span>
                    <span className="font-medium text-green-600">+700 THB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Revenue</span>
                    <span className="font-medium text-green-600">80,700 THB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Management Fee (9% of 80,000)</span>
                    <span className="font-medium text-red-600">-7,200 THB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Service Fee</span>
                    <span className="font-medium text-red-600">-1,800 THB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electricity (Guest Paid)</span>
                    <span className="font-medium text-gray-500">0 THB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Expenses</span>
                    <span className="font-medium text-red-600">9,000 THB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Guest Electricity Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Check-in Meter Reading</span>
                    <span className="font-medium">1,000 kW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Check-out Meter Reading</span>
                    <span className="font-medium">1,100 kW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Usage (100 kW × 7 THB/kW)</span>
                    <span className="font-medium text-red-600">700 THB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Deposit Refund (5,000 - 700)</span>
                    <span className="font-medium text-green-600">4,300 THB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Net Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Owner Net Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-medium text-green-600">80,000 THB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Expenses</span>
                    <span className="font-medium text-red-600">-9,000 THB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electricity Recovery</span>
                    <span className="font-medium text-green-600">+0 THB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Owner Net Earnings</span>
                    <span className="font-medium text-green-600 text-lg">71,000 THB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This demo environment contains complete test data for Villa Aruna with John Doe's stay. 
              All workflows are pre-completed with realistic data for testing each user role's dashboard and functionality.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Access Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Access Links</CardTitle>
                <CardDescription>Direct links to test specific functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/checkin-checkout-workflow">
                    <Camera className="h-4 w-4 mr-2" />
                    Check-in/Check-out Workflow
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/property-utilities-maintenance">
                    <Zap className="h-4 w-4 mr-2" />
                    Utility Billing & Maintenance
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/owner/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    Owner Dashboard
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/staff/tasks">
                    <Users className="h-4 w-4 mr-2" />
                    Staff Task Management
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/finances">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financial Dashboard
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Test Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle>Test Scenarios</CardTitle>
                <CardDescription>Recommended testing flow for each user type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Admin Testing:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• View all properties and bookings</li>
                    <li>• Access complete financial records</li>
                    <li>• Review task completion evidence</li>
                    <li>• Export reports and statements</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Owner Testing:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Check Villa Aruna earnings (71,000 THB)</li>
                    <li>• Review electricity cost recovery</li>
                    <li>• See task completion timeline</li>
                    <li>• Request payout for net earnings</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Staff Testing:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• View assigned tasks for Villa Aruna</li>
                    <li>• Check evidence photos uploaded</li>
                    <li>• Review meter reading workflow</li>
                    <li>• See maintenance task completion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}