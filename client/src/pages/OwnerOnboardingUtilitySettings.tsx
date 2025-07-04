import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Wrench, 
  Receipt, 
  Settings, 
  Upload, 
  UserCheck,
  Building2,
  CreditCard,
  Calendar,
  Phone
} from "lucide-react";

interface OnboardingStep {
  id: number;
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  stepType: string;
  isRequired: boolean;
  status: "pending" | "in_progress" | "completed";
  completedAt?: string;
  completedBy?: string;
  data?: string;
}

interface UtilitySettings {
  id: number;
  electricityProvider: string;
  electricityAccountNumber: string;
  electricityRatePerKwh: number;
  waterProvider: string;
  waterAccountNumber: string;
  waterRatePerUnit: number;
  internetProvider: string;
  internetAccountNumber: string;
  internetMonthlyCost: number;
  otherUtilities?: string;
  settingsNotes?: string;
}

interface MaintenanceHistory {
  id: number;
  serviceType: string;
  serviceProvider: string;
  serviceDate: string;
  serviceCost: number;
  serviceCurrency: string;
  serviceDescription: string;
  nextServiceDue?: string;
  serviceStatus: string;
  warrantyExpiresAt?: string;
  invoiceNumber?: string;
  notes?: string;
}

interface BillingLog {
  id: number;
  billType: string;
  billingPeriod: string;
  billAmount: number;
  billCurrency: string;
  billDueDate: string;
  billStatus: string;
  paidDate?: string;
  paymentMethod?: string;
  billProvider: string;
  unitsConsumed?: number;
  ratePerUnit?: number;
  previousReading?: number;
  currentReading?: number;
  notes?: string;
}

interface OnboardingDocument {
  id: number;
  documentType: string;
  documentTitle: string;
  documentDescription: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  uploadStatus: "pending_upload" | "pending_review" | "approved" | "rejected";
  uploadedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  expirationDate?: string;
  documentNotes?: string;
}

interface ServiceSelection {
  id: number;
  serviceCategory: string;
  serviceName: string;
  serviceProvider: string;
  serviceFrequency: string;
  serviceCost: number;
  serviceCurrency: string;
  serviceStatus: string;
  startDate: string;
  endDate?: string;
  autoRenewal: boolean;
  serviceNotes?: string;
}

const getStepIcon = (stepType: string) => {
  switch (stepType) {
    case "contact_info": return <User className="h-5 w-5" />;
    case "ownership_proof": return <FileText className="h-5 w-5" />;
    case "property_linking": return <Building2 className="h-5 w-5" />;
    case "document_upload": return <Upload className="h-5 w-5" />;
    case "payout_setup": return <CreditCard className="h-5 w-5" />;
    case "service_selection": return <Settings className="h-5 w-5" />;
    case "onboarding_call": return <Phone className="h-5 w-5" />;
    default: return <User className="h-5 w-5" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    case "in_progress":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
    case "pending":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    default:
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Unknown</Badge>;
  }
};

const getDocumentStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case "pending_review":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
    case "pending_upload":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Upload className="h-3 w-3 mr-1" />Pending Upload</Badge>;
    case "rejected":
      return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Unknown</Badge>;
  }
};

const getBillStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "overdue":
      return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
    default:
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Unknown</Badge>;
  }
};

export default function OwnerOnboardingUtilitySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number>(1); // Default to first property

  // Fetch onboarding steps
  const { data: onboardingSteps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ["/api/owner-onboarding/steps", user?.id],
    enabled: !!user?.id,
  });

  // Fetch utility settings for selected property
  const { data: utilitySettings, isLoading: utilityLoading } = useQuery({
    queryKey: ["/api/properties", selectedProperty, "utility-settings"],
    enabled: !!selectedProperty,
  });

  // Fetch maintenance history for selected property
  const { data: maintenanceHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/properties", selectedProperty, "maintenance-history"],
    enabled: !!selectedProperty,
  });

  // Fetch billing logs for selected property
  const { data: billingLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/properties", selectedProperty, "billing-logs"],
    enabled: !!selectedProperty,
  });

  // Fetch onboarding documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/owner-onboarding/documents", user?.id],
    enabled: !!user?.id,
  });

  // Fetch service selections
  const { data: serviceSelections = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/owner-onboarding/services", user?.id],
    enabled: !!user?.id,
  });

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: number) => {
      return apiRequest("POST", `/api/owner-onboarding/steps/${stepId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-onboarding/steps"] });
      toast({
        title: "Step Completed",
        description: "Onboarding step has been marked as completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate progress
  const completedSteps = onboardingSteps.filter((step: OnboardingStep) => step.status === "completed").length;
  const totalSteps = onboardingSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  if (stepsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Onboarding & Utility Settings</h1>
          <p className="text-muted-foreground">
            Complete your onboarding process and manage property utility settings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-lg font-semibold">{completedSteps}/{totalSteps} Steps</p>
          </div>
          <div className="w-32">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="onboarding" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Onboarding</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="utilities" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Utilities</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Services</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
              <CardDescription>
                Complete all required steps to finish your onboarding process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {onboardingSteps.map((step: OnboardingStep) => (
                <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStepIcon(step.stepType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{step.stepTitle}</h4>
                        {step.isRequired && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.stepDescription}</p>
                      {step.completedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed on {new Date(step.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(step.status)}
                    {step.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => completeStepMutation.mutate(step.id)}
                        disabled={completeStepMutation.isPending}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Documents</CardTitle>
              <CardDescription>
                Upload and manage your property ownership and legal documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found. Start by uploading your property ownership documents.
                </div>
              ) : (
                documents.map((doc: OnboardingDocument) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{doc.documentTitle}</h4>
                        <p className="text-sm text-muted-foreground">{doc.documentDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.fileName} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {doc.expirationDate && (
                          <p className="text-xs text-yellow-600">
                            Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getDocumentStatusBadge(doc.uploadStatus)}
                      {doc.uploadedAt && (
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utility Settings</CardTitle>
              <CardDescription>
                Manage your property utility accounts and billing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {utilityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : utilitySettings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-600 mb-2">ELECTRICITY</h4>
                    <p className="text-sm"><strong>Provider:</strong> {utilitySettings.electricityProvider}</p>
                    <p className="text-sm"><strong>Account:</strong> {utilitySettings.electricityAccountNumber}</p>
                    <p className="text-sm"><strong>Rate:</strong> ฿{utilitySettings.electricityRatePerKwh}/kWh</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm text-cyan-600 mb-2">WATER</h4>
                    <p className="text-sm"><strong>Provider:</strong> {utilitySettings.waterProvider}</p>
                    <p className="text-sm"><strong>Account:</strong> {utilitySettings.waterAccountNumber}</p>
                    <p className="text-sm"><strong>Rate:</strong> ฿{utilitySettings.waterRatePerUnit}/unit</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm text-purple-600 mb-2">INTERNET</h4>
                    <p className="text-sm"><strong>Provider:</strong> {utilitySettings.internetProvider}</p>
                    <p className="text-sm"><strong>Account:</strong> {utilitySettings.internetAccountNumber}</p>
                    <p className="text-sm"><strong>Monthly:</strong> ฿{utilitySettings.internetMonthlyCost}</p>
                  </div>
                  {utilitySettings.otherUtilities && (
                    <>
                      {JSON.parse(utilitySettings.otherUtilities).gas && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-sm text-orange-600 mb-2">GAS</h4>
                          <p className="text-sm"><strong>Provider:</strong> {JSON.parse(utilitySettings.otherUtilities).gas.provider}</p>
                          <p className="text-sm"><strong>Account:</strong> {JSON.parse(utilitySettings.otherUtilities).gas.accountNumber}</p>
                          <p className="text-sm"><strong>Monthly:</strong> ฿{JSON.parse(utilitySettings.otherUtilities).gas.monthlyCost}</p>
                        </div>
                      )}
                      {JSON.parse(utilitySettings.otherUtilities).hoaFees && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-sm text-green-600 mb-2">HOA FEES</h4>
                          <p className="text-sm"><strong>Provider:</strong> {JSON.parse(utilitySettings.otherUtilities).hoaFees.provider}</p>
                          <p className="text-sm"><strong>Account:</strong> {JSON.parse(utilitySettings.otherUtilities).hoaFees.accountNumber}</p>
                          <p className="text-sm"><strong>Monthly:</strong> ฿{JSON.parse(utilitySettings.otherUtilities).hoaFees.monthlyCost}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No utility settings found. Please contact your property manager to set up utility accounts.
                </div>
              )}
              {utilitySettings?.settingsNotes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Notes</h4>
                  <p className="text-sm text-blue-800">{utilitySettings.settingsNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>
                Track property maintenance services and upcoming schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : maintenanceHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No maintenance history found.
                </div>
              ) : (
                maintenanceHistory.map((history: MaintenanceHistory) => (
                  <div key={history.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{history.serviceType}</h4>
                          <Badge variant="outline" className="text-xs">
                            {history.serviceStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Provider:</strong> {history.serviceProvider}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          {history.serviceDescription}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Service Date:</strong> {new Date(history.serviceDate).toLocaleDateString()}
                        </p>
                        {history.nextServiceDue && (
                          <p className="text-sm text-blue-600">
                            <strong>Next Service:</strong> {new Date(history.nextServiceDue).toLocaleDateString()}
                          </p>
                        )}
                        {history.warrantyExpiresAt && (
                          <p className="text-sm text-green-600">
                            <strong>Warranty Until:</strong> {new Date(history.warrantyExpiresAt).toLocaleDateString()}
                          </p>
                        )}
                        {history.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Notes:</strong> {history.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {history.serviceCurrency} {history.serviceCost.toLocaleString()}
                        </p>
                        {history.invoiceNumber && (
                          <p className="text-xs text-muted-foreground">
                            {history.invoiceNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Logs</CardTitle>
              <CardDescription>
                Track utility bills and payment history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : billingLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No billing logs found.
                </div>
              ) : (
                billingLogs.map((log: BillingLog) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold capitalize">{log.billType}</h4>
                          {getBillStatusBadge(log.billStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Provider:</strong> {log.billProvider}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Period:</strong> {log.billingPeriod}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Due Date:</strong> {new Date(log.billDueDate).toLocaleDateString()}
                        </p>
                        {log.unitsConsumed && (
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Usage:</strong> {log.unitsConsumed} units @ ฿{log.ratePerUnit}/unit
                          </p>
                        )}
                        {log.previousReading && log.currentReading && (
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Readings:</strong> {log.previousReading} → {log.currentReading}
                          </p>
                        )}
                        {log.paidDate && (
                          <p className="text-sm text-green-600">
                            <strong>Paid:</strong> {new Date(log.paidDate).toLocaleDateString()}
                            {log.paymentMethod && ` via ${log.paymentMethod.replace('_', ' ')}`}
                          </p>
                        )}
                        {log.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Notes:</strong> {log.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {log.billCurrency} {log.billAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Selections</CardTitle>
              <CardDescription>
                Manage your property management services and packages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : serviceSelections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No service selections found.
                </div>
              ) : (
                serviceSelections.map((service: ServiceSelection) => (
                  <div key={service.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{service.serviceName}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {service.serviceStatus}
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {service.serviceCategory}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Provider:</strong> {service.serviceProvider}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Frequency:</strong> {service.serviceFrequency.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Start Date:</strong> {new Date(service.startDate).toLocaleDateString()}
                        </p>
                        {service.endDate && (
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>End Date:</strong> {new Date(service.endDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Auto-Renewal:</strong> {service.autoRenewal ? "Yes" : "No"}
                        </p>
                        {service.serviceNotes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Notes:</strong> {service.serviceNotes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {service.serviceCurrency} {service.serviceCost.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          per {service.serviceFrequency.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}