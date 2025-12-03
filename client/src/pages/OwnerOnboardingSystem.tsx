import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Home, 
  MapPin, 
  Camera, 
  FileText, 
  Zap, 
  FileCheck, 
  Shield, 
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Upload,
  Phone,
  Mail,
  Building,
  Bed,
  Bath,
  Wifi,
  Car,
  Utensils,
  Wind,
  Tv,
  Waves
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form schemas for each step
const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  preferredLanguage: z.enum(["english", "thai", "chinese", "japanese"]),
  communicationPreference: z.enum(["email", "phone", "whatsapp", "line"])
});

const step2Schema = z.object({
  propertyName: z.string().min(1, "Property name is required"),
  propertyType: z.enum(["villa", "condo", "house", "apartment", "resort"]),
  bedrooms: z.coerce.number().min(1, "At least 1 bedroom required"),
  bathrooms: z.coerce.number().min(1, "At least 1 bathroom required"),
  maxGuests: z.coerce.number().min(1, "Maximum guests required"),
  totalArea: z.coerce.number().min(1, "Total area required"),
  yearBuilt: z.coerce.number().optional()
});

const step3Schema = z.object({
  fullAddress: z.string().min(1, "Full address is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(5, "Valid postal code required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  locationNotes: z.string().optional()
});

export default function OwnerOnboardingSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(1);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  // Query for onboarding processes
  const { data: processes = [], isLoading } = useQuery({
    queryKey: ["/api/owner-onboarding"],
    retry: false,
  });

  // Query for current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Query for properties (for dropdown selection)
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  // Forms for each step
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      preferredLanguage: "english",
      communicationPreference: "email"
    }
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      propertyName: "",
      propertyType: "villa",
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      totalArea: 100,
      yearBuilt: new Date().getFullYear()
    }
  });

  const step3Form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      fullAddress: "",
      district: "",
      province: "",
      postalCode: "",
      country: "Thailand",
      latitude: 0,
      longitude: 0,
      locationNotes: ""
    }
  });

  // Mutation for creating new onboarding process
  const createProcessMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/owner-onboarding", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Onboarding process created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner-onboarding"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create onboarding process",
        variant: "destructive"
      });
    }
  });

  // Mutation for updating process steps
  const updateStepMutation = useMutation({
    mutationFn: async ({ processId, stepData }: { processId: string; stepData: any }) => {
      return apiRequest("PATCH", `/api/owner-onboarding/${processId}`, stepData);
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved",
        description: "Your progress has been saved successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner-onboarding"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save progress",
        variant: "destructive"
      });
    }
  });

  // Handle step form submission
  const handleStepSubmit = async (stepNumber: number, data: any) => {
    if (!selectedProcessId) {
      toast({
        title: "Error",
        description: "Please select an onboarding process first",
        variant: "destructive"
      });
      return;
    }

    const stepFieldMap: Record<number, string> = {
      1: "step1OwnerContactInfo",
      2: "step2PropertyBasics", 
      3: "step3LocationMapping",
      4: "step4PhotoUploads",
      5: "step5PropertyDescription",
      6: "step6UtilityInfo",
      7: "step7LegalDocuments",
      8: "step8SecurityAccess",
      9: "step9ServicesSetup"
    };

    const stepField = stepFieldMap[stepNumber];
    if (!stepField) return;

    const updateData = {
      [stepField]: true,
      [`${stepField}Data`]: data,
      completedSteps: Math.max(stepNumber, processes.find((p: any) => p.id === selectedProcessId)?.completedSteps || 0),
      progressPercentage: ((Math.max(stepNumber, processes.find((p: any) => p.id === selectedProcessId)?.completedSteps || 0)) / 9 * 100).toFixed(2),
      currentStep: stepNumber < 9 ? stepNumber + 1 : 9,
      lastActivityAt: new Date().toISOString()
    };

    updateStepMutation.mutate({
      processId: selectedProcessId,
      stepData: updateData
    });

    // Move to next step if not the last one
    if (stepNumber < 9) {
      setActiveStep(stepNumber + 1);
    }
  };

  // Process data
  const currentProcess = selectedProcessId 
    ? processes.find((p: any) => p.id === selectedProcessId)
    : null;

  // Step configuration
  const steps = [
    { 
      number: 1, 
      title: "Owner Contact Info", 
      icon: User, 
      description: "Personal contact information and preferences",
      field: "step1OwnerContactInfo"
    },
    { 
      number: 2, 
      title: "Property Details", 
      icon: Home, 
      description: "Basic property information and specifications",
      field: "step2PropertyBasics"
    },
    { 
      number: 3, 
      title: "Location", 
      icon: MapPin, 
      description: "Property address and GPS coordinates",
      field: "step3LocationMapping"
    },
    { 
      number: 4, 
      title: "Photos", 
      icon: Camera, 
      description: "Property photos and visual documentation",
      field: "step4PhotoUploads"
    },
    { 
      number: 5, 
      title: "Description", 
      icon: FileText, 
      description: "Property description and guest information",
      field: "step5PropertyDescription"
    },
    { 
      number: 6, 
      title: "Utilities", 
      icon: Zap, 
      description: "Utility accounts and service information",
      field: "step6UtilityInfo"
    },
    { 
      number: 7, 
      title: "Legal Documents", 
      icon: FileCheck, 
      description: "Ownership documents and legal requirements",
      field: "step7LegalDocuments"
    },
    { 
      number: 8, 
      title: "Security", 
      icon: Shield, 
      description: "Access codes and security information",
      field: "step8SecurityAccess"
    },
    { 
      number: 9, 
      title: "Services Setup", 
      icon: Settings, 
      description: "Additional services and final configuration",
      field: "step9ServicesSetup"
    }
  ];

  const getStepStatus = (step: any) => {
    if (!currentProcess) return "pending";
    const isCompleted = currentProcess[step.field];
    const currentStepNumber = currentProcess.currentStep;
    
    if (isCompleted) return "completed";
    if (step.number === currentStepNumber) return "current";
    if (step.number < currentStepNumber) return "completed";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "current": return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "current": return Clock;
      case "pending": return AlertTriangle;
      default: return Clock;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Owner Onboarding System</h1>
        <p className="text-muted-foreground">
          Comprehensive 9-step onboarding process for new property owners
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="onboarding">🚀 Onboarding Flow</TabsTrigger>
          <TabsTrigger value="processes">📋 All Processes</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Processes</p>
                    <p className="text-2xl font-bold">{processes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {processes.filter((p: any) => p.completedSteps === 9).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {processes.filter((p: any) => p.completedSteps > 0 && p.completedSteps < 9).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold">
                      {processes.filter((p: any) => p.isOverdue).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest onboarding process updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processes
                  .slice(0, 5)
                  .map((process: any) => (
                    <div key={process.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <div>
                          <p className="font-medium">Owner {process.ownerId}</p>
                          <p className="text-sm text-muted-foreground">
                            Step {process.currentStep} of 9 • {process.progressPercentage}% complete
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={process.isOverdue ? "destructive" : "default"}>
                          {process.priority}
                        </Badge>
                        <Progress value={parseFloat(process.progressPercentage)} className="w-20" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Flow Tab */}
        <TabsContent value="onboarding" className="space-y-6">
          {/* Process Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Onboarding Process</CardTitle>
              <CardDescription>Choose a process to continue or create a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Select value={selectedProcessId || ""} onValueChange={setSelectedProcessId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an onboarding process..." />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((process: any) => (
                      <SelectItem key={process.id} value={process.id}>
                        Owner {process.ownerId} - Step {process.currentStep}/9 ({process.progressPercentage}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    const newProcessData = {
                      ownerId: user?.id || "new-owner",
                      propertyId: null,
                      priority: "medium",
                      onboardingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    };
                    createProcessMutation.mutate(newProcessData);
                  }}
                  disabled={createProcessMutation.isPending}
                >
                  Create New Process
                </Button>
              </div>

              {currentProcess && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Current progress: Step {currentProcess.currentStep} of 9 ({currentProcess.progressPercentage}% complete)
                    {currentProcess.isOverdue && " - This process is overdue!"}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Step Progress */}
          {selectedProcessId && (
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Progress</CardTitle>
                <CardDescription>Track your progress through the 9-step onboarding process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {steps.map((step) => {
                    const status = getStepStatus(step);
                    const StatusIcon = getStatusIcon(status);
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.number}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${getStatusColor(status)} ${
                          activeStep === step.number ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setActiveStep(step.number)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <StepIcon className="h-5 w-5" />
                            <span className="font-medium">Step {step.number}</span>
                          </div>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold mb-1">{step.title}</h3>
                        <p className="text-sm opacity-75">{step.description}</p>
                      </div>
                    );
                  })}
                </div>

                <Progress 
                  value={currentProcess ? parseFloat(currentProcess.progressPercentage) : 0} 
                  className="mb-4" 
                />
                <p className="text-center text-sm text-muted-foreground">
                  {currentProcess ? currentProcess.progressPercentage : 0}% Complete
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step Forms */}
          {selectedProcessId && (
            <Card>
              <CardHeader>
                <CardTitle>Step {activeStep}: {steps[activeStep - 1]?.title}</CardTitle>
                <CardDescription>{steps[activeStep - 1]?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step 1: Owner Contact Info */}
                {activeStep === 1 && (
                  <Form {...step1Form}>
                    <form onSubmit={step1Form.handleSubmit((data) => handleStepSubmit(1, data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={step1Form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step1Form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={step1Form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step1Form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={step1Form.control}
                          name="preferredLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="english">English</SelectItem>
                                  <SelectItem value="thai">Thai</SelectItem>
                                  <SelectItem value="chinese">Chinese</SelectItem>
                                  <SelectItem value="japanese">Japanese</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step1Form.control}
                          name="communicationPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Communication Preference</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select preference" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="phone">Phone</SelectItem>
                                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                  <SelectItem value="line">LINE</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" disabled>
                          Previous
                        </Button>
                        <Button type="submit" disabled={updateStepMutation.isPending}>
                          {updateStepMutation.isPending ? "Saving..." : "Save & Continue"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 2: Property Details */}
                {activeStep === 2 && (
                  <Form {...step2Form}>
                    <form onSubmit={step2Form.handleSubmit((data) => handleStepSubmit(2, data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={step2Form.control}
                          name="propertyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter property name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step2Form.control}
                          name="propertyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="villa">Villa</SelectItem>
                                  <SelectItem value="condo">Condominium</SelectItem>
                                  <SelectItem value="house">House</SelectItem>
                                  <SelectItem value="apartment">Apartment</SelectItem>
                                  <SelectItem value="resort">Resort</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={step2Form.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bedrooms</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step2Form.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bathrooms</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step2Form.control}
                          name="maxGuests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Guests</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={step2Form.control}
                          name="totalArea"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Area (sqm)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step2Form.control}
                          name="yearBuilt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Built (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1900" max={new Date().getFullYear()} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveStep(1)}>
                          Previous
                        </Button>
                        <Button type="submit" disabled={updateStepMutation.isPending}>
                          {updateStepMutation.isPending ? "Saving..." : "Save & Continue"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 3: Location */}
                {activeStep === 3 && (
                  <Form {...step3Form}>
                    <form onSubmit={step3Form.handleSubmit((data) => handleStepSubmit(3, data))} className="space-y-4">
                      <FormField
                        control={step3Form.control}
                        name="fullAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter complete property address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={step3Form.control}
                          name="district"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>District</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter district" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step3Form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter province" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step3Form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter postal code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={step3Form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step3Form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="GPS latitude" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step3Form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="GPS longitude" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={step3Form.control}
                        name="locationNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Any additional location details..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveStep(2)}>
                          Previous
                        </Button>
                        <Button type="submit" disabled={updateStepMutation.isPending}>
                          {updateStepMutation.isPending ? "Saving..." : "Save & Continue"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Placeholder forms for remaining steps */}
                {activeStep > 3 && activeStep <= 9 && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Step {activeStep} ({steps[activeStep - 1]?.title}) form will be implemented in the next phase.
                        This step includes: {steps[activeStep - 1]?.description}
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveStep(activeStep - 1)}>
                        Previous
                      </Button>
                      <Button 
                        onClick={() => {
                          handleStepSubmit(activeStep, { placeholder: true });
                        }}
                        disabled={updateStepMutation.isPending}
                      >
                        {updateStepMutation.isPending ? "Saving..." : "Mark Complete & Continue"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Processes Tab */}
        <TabsContent value="processes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Onboarding Processes</CardTitle>
              <CardDescription>View and manage all owner onboarding processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processes.map((process: any) => (
                  <div key={process.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Owner {process.ownerId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Step {process.currentStep} of 9 • {process.completedSteps} steps completed
                        </p>
                        {process.adminNotes && (
                          <p className="text-sm mt-1">{process.adminNotes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={process.isOverdue ? "destructive" : process.priority === "urgent" ? "destructive" : process.priority === "high" ? "default" : "secondary"}>
                          {process.priority}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{process.progressPercentage}%</p>
                          <Progress value={parseFloat(process.progressPercentage)} className="w-20" />
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedProcessId(process.id);
                            setActiveStep(process.currentStep);
                          }}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate by Step</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step) => {
                    const completedCount = processes.filter((p: any) => p[step.field]).length;
                    const completionRate = processes.length > 0 ? (completedCount / processes.length) * 100 : 0;
                    
                    return (
                      <div key={step.number} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Step {step.number}: {step.title}</span>
                          <span>{completionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={completionRate} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Process Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Completion Time</span>
                    <span className="font-medium">12 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Common Blocker</span>
                    <span className="font-medium">Step 7 (Legal Documents)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Steps per Day</span>
                    <span className="font-medium">0.75</span>
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