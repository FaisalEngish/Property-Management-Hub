import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, Upload, User, Home, FileText, Settings, CreditCard, Check } from "lucide-react";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Property Details", icon: Home },
  { id: 3, title: "Upload Documents", icon: FileText },
  { id: 4, title: "Service Packages", icon: Settings },
  { id: 5, title: "Payout Method", icon: CreditCard },
  { id: 6, title: "Terms & Submit", icon: Check }
];

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(1, "Address is required"),
  emergencyContact: z.string().min(1, "Emergency contact is required")
});

const propertyDetailsSchema = z.object({
  propertyName: z.string().min(1, "Property name is required"),
  propertyAddress: z.string().min(1, "Property address is required"),
  bedrooms: z.number().min(1, "At least 1 bedroom required"),
  bathrooms: z.number().min(1, "At least 1 bathroom required"),
  maxGuests: z.number().min(1, "Maximum guests required"),
  propertyType: z.string().min(1, "Property type is required"),
  description: z.string().min(1, "Property description is required")
});

const servicePackagesSchema = z.object({
  poolService: z.boolean(),
  gardenService: z.boolean(),
  pestControl: z.boolean(),
  maintenance: z.boolean(),
  cleaningService: z.boolean(),
  welcomePackService: z.boolean()
});

const payoutMethodSchema = z.object({
  payoutMethod: z.string().min(1, "Payout method is required"),
  payoutFrequency: z.string().min(1, "Payout frequency is required"),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional()
});

export default function OwnerOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, File[]>>({});
  const { toast } = useToast();

  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: onboardingData.personal || {}
  });

  const propertyForm = useForm({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: onboardingData.property || {}
  });

  const serviceForm = useForm({
    resolver: zodResolver(servicePackagesSchema),
    defaultValues: onboardingData.services || {}
  });

  const payoutForm = useForm({
    resolver: zodResolver(payoutMethodSchema),
    defaultValues: onboardingData.payout || {}
  });

  const submitOnboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/owner/onboarding", data);
    },
    onSuccess: () => {
      toast({
        title: "Onboarding Complete!",
        description: "Your property has been successfully registered.",
      });
      window.location.href = "/owner";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStepSubmit = (stepData: any) => {
    const stepKey = currentStep === 1 ? 'personal' : 
                   currentStep === 2 ? 'property' : 
                   currentStep === 4 ? 'services' : 
                   currentStep === 5 ? 'payout' : '';
    
    if (stepKey) {
      setOnboardingData(prev => ({ ...prev, [stepKey]: stepData }));
    }
    
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDocumentUpload = (category: string, files: FileList | null) => {
    if (files) {
      setUploadedDocuments(prev => ({
        ...prev,
        [category]: Array.from(files)
      }));
    }
  };

  const handleFinalSubmit = () => {
    const finalData = {
      ...onboardingData,
      documents: uploadedDocuments,
      agreedToTerms: true,
      completedAt: new Date().toISOString()
    };
    
    submitOnboardingMutation.mutate(finalData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(handleStepSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={personalForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={personalForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name and phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...propertyForm}>
            <form onSubmit={propertyForm.handleSubmit(handleStepSubmit)} className="space-y-4">
              <FormField
                control={propertyForm.control}
                name="propertyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Villa Paradise" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={propertyForm.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Full address including postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={propertyForm.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={propertyForm.control}
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
              <FormField
                control={propertyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe your property for guests..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );

      case 3:
        const documentCategories = [
          { key: "ownership", label: "Proof of Ownership", required: true },
          { key: "floorplan", label: "Floorplan", required: false },
          { key: "license", label: "Rental License", required: true },
          { key: "insurance", label: "Property Insurance", required: true },
          { key: "welcome", label: "Welcome Book / Guest Manual", required: false },
          { key: "safety", label: "Safety Certificates", required: false },
          { key: "hoa", label: "HOA / Residence Rules", required: false }
        ];

        return (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Upload documents for your property. Required documents are marked with *.
            </div>
            {documentCategories.map((category) => (
              <div key={category.key} className="space-y-2">
                <label className="text-sm font-medium">
                  {category.label} {category.required && "*"}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload(category.key, e.target.files)}
                      className="hidden"
                      id={`upload-${category.key}`}
                    />
                    <label
                      htmlFor={`upload-${category.key}`}
                      className="cursor-pointer text-blue-600 hover:text-blue-500"
                    >
                      Click to upload files
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB each</p>
                  </div>
                  {uploadedDocuments[category.key] && (
                    <div className="mt-2 text-sm text-green-600">
                      {uploadedDocuments[category.key].length} file(s) uploaded
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => handleStepSubmit({})} className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(handleStepSubmit)} className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Select the service packages you would like for your property:
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "poolService", label: "Pool Service", description: "Weekly cleaning and chemical balancing" },
                  { key: "gardenService", label: "Garden Service", description: "Lawn maintenance and landscaping" },
                  { key: "pestControl", label: "Pest Control", description: "Monthly pest prevention treatment" },
                  { key: "maintenance", label: "Maintenance Package", description: "Regular property maintenance checks" },
                  { key: "cleaningService", label: "Cleaning Service", description: "Between-guest cleaning service" },
                  { key: "welcomePackService", label: "Welcome Pack Service", description: "Guest welcome amenities" }
                ].map((service) => (
                  <FormField
                    key={service.key}
                    control={serviceForm.control}
                    name={service.key as any}
                    render={({ field }) => (
                      <FormItem className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-sm font-medium">{service.label}</FormLabel>
                            <p className="text-xs text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );

      case 5:
        return (
          <Form {...payoutForm}>
            <form onSubmit={payoutForm.handleSubmit(handleStepSubmit)} className="space-y-4">
              <FormField
                control={payoutForm.control}
                name="payoutMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payout method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="wise">Wise</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={payoutForm.control}
                name="payoutFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={payoutForm.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter bank name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={payoutForm.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter account number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={payoutForm.control}
                name="accountHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter account holder name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(4)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h3 className="text-lg font-semibold mt-4">Review and Submit</h3>
              <p className="text-muted-foreground">Please review your information and agree to terms</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div><strong>Name:</strong> {onboardingData.personal?.firstName} {onboardingData.personal?.lastName}</div>
              <div><strong>Property:</strong> {onboardingData.property?.propertyName}</div>
              <div><strong>Location:</strong> {onboardingData.property?.propertyAddress}</div>
              <div><strong>Payout Method:</strong> {onboardingData.payout?.payoutMethod}</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label htmlFor="terms" className="text-sm">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="marketing" />
                <label htmlFor="marketing" className="text-sm">
                  I would like to receive marketing communications
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(5)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={handleFinalSubmit} 
                className="flex-1"
                disabled={submitOnboardingMutation.isPending}
              >
                {submitOnboardingMutation.isPending ? "Submitting..." : "Complete Onboarding"}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Property Owner Onboarding</h1>
        <p className="text-muted-foreground">Let's get your property set up in our system</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted ? 'bg-green-500 border-green-500 text-white' :
                isCurrent ? 'border-blue-500 text-blue-500' :
                'border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-12 h-px mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
}