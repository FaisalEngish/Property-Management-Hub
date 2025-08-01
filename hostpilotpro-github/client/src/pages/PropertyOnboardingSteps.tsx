import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, ChevronLeft, Check, User, FileText, MapPin, Camera, ExternalLink, FileCheck, Building, Upload, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Property contact and basic details",
    icon: User,
    fields: ["contactName", "contactEmail", "contactPhone", "emergencyContact"]
  },
  {
    id: 2,
    title: "Document Upload",
    description: "Required legal and property documents",
    icon: FileText,
    fields: ["ownershipProof", "insuranceDocuments", "permits"]
  },
  {
    id: 3,
    title: "Utility Details",
    description: "Electricity, water, and internet setup",
    icon: MapPin,
    fields: ["electricityProvider", "waterProvider", "internetProvider", "utilityDeposits"]
  },
  {
    id: 4,
    title: "Property Photos",
    description: "Interior and exterior photos for marketing",
    icon: Camera,
    fields: ["exteriorPhotos", "interiorPhotos", "amenityPhotos"]
  },
  {
    id: 5,
    title: "OTA Platform Links",
    description: "Booking platform connections and listings",
    icon: ExternalLink,
    fields: ["airbnbUrl", "vrboUrl", "bookingComUrl", "directBookingUrl"]
  },
  {
    id: 6,
    title: "Contract & Completion",
    description: "Management agreement and final approval",
    icon: FileCheck,
    fields: ["managementContract", "agreementSigned", "onboardingComplete"]
  }
];

const onboardingSchema = z.object({
  // Step 1: Basic Information
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(1, "Phone number is required"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  
  // Step 2: Document Upload
  ownershipProof: z.boolean(),
  insuranceDocuments: z.boolean(),
  permits: z.boolean(),
  
  // Step 3: Utility Details
  electricityProvider: z.string().optional(),
  waterProvider: z.string().optional(),
  internetProvider: z.string().optional(),
  utilityDeposits: z.coerce.number().min(0),
  
  // Step 4: Property Photos
  exteriorPhotos: z.coerce.number().min(0),
  interiorPhotos: z.coerce.number().min(0),
  amenityPhotos: z.coerce.number().min(0),
  
  // Step 5: OTA Platform Links
  airbnbUrl: z.string().optional(),
  vrboUrl: z.string().optional(),
  bookingComUrl: z.string().optional(),
  directBookingUrl: z.string().optional(),
  
  // Step 6: Contract & Completion
  managementContract: z.boolean(),
  agreementSigned: z.boolean(),
  onboardingComplete: z.boolean(),
});

export default function PropertyOnboardingSteps() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check user permissions
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/demo-user"],
    retry: false,
  });

  const userRole = (user as any)?.role;
  const canManage = ['admin', 'portfolio-manager'].includes(userRole);

  // Fetch properties
  const { data: properties, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  // Fetch onboarding data
  const { data: onboardingData, isLoading: isOnboardingLoading } = useQuery({
    queryKey: ["/api/property-onboarding", selectedProperty],
    enabled: !!selectedProperty,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/property-onboarding/${selectedProperty}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved",
        description: "Onboarding progress has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-onboarding"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      emergencyContact: "",
      ownershipProof: false,
      insuranceDocuments: false,
      permits: false,
      electricityProvider: "",
      waterProvider: "",
      internetProvider: "",
      utilityDeposits: 0,
      exteriorPhotos: 0,
      interiorPhotos: 0,
      amenityPhotos: 0,
      airbnbUrl: "",
      vrboUrl: "",
      bookingComUrl: "",
      directBookingUrl: "",
      managementContract: false,
      agreementSigned: false,
      onboardingComplete: false,
    },
  });

  // Calculate completion percentage
  const completionPercentage = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

  const onSubmit = (data: any) => {
    updateMutation.mutate({
      ...data,
      currentStep,
      completedSteps,
      updatedBy: (user as any)?.id,
    });
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepData = () => {
    return ONBOARDING_STEPS.find(step => step.id === currentStep);
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Property Onboarding is only accessible to Admin and Portfolio Manager roles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = getCurrentStepData();
  const StepIcon = currentStepData?.icon || User;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🏠 Property Onboarding</h1>
          <p className="text-muted-foreground">
            Step-by-step property setup and document collection
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {Math.round(completionPercentage)}% Complete
        </Badge>
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
          <CardDescription>Choose a property to manage its onboarding process</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProperty?.toString()} onValueChange={(value) => setSelectedProperty(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property..." />
            </SelectTrigger>
            <SelectContent>
              {(properties as any[])?.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name} - {property.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProperty && (
        <>
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                Onboarding Progress
              </CardTitle>
              <CardDescription>
                Complete all steps to fully onboard your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={completionPercentage} className="h-2" />
                <div className="grid grid-cols-6 gap-2">
                  {ONBOARDING_STEPS.map((step) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;
                    const StepIcon = step.icon;
                    
                    return (
                      <div
                        key={step.id}
                        className={`p-3 border rounded-lg text-center cursor-pointer transition-all ${
                          isCurrent ? 'border-primary bg-primary/5' :
                          isCompleted ? 'border-green-200 bg-green-50' :
                          'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentStep(step.id)}
                      >
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-primary text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                        </div>
                        <h3 className="text-xs font-medium">{step.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Step Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                Step {currentStep}: {currentStepData?.title}
              </CardTitle>
              <CardDescription>
                {currentStepData?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Contact Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter full name..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="email@example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+66 XX XXX XXXX" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Name and phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Document Upload */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="ownershipProof"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Property Ownership Proof</FormLabel>
                                <FormDescription>
                                  Title deed or ownership certificate
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="insuranceDocuments"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Insurance Documents</FormLabel>
                                <FormDescription>
                                  Property insurance and liability coverage
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="permits"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Required Permits</FormLabel>
                                <FormDescription>
                                  Business license and rental permits
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Upload className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-800">Document Upload</h4>
                            <p className="text-sm text-amber-700">
                              Use the Document Center to upload files for each category. Mark as complete once uploaded.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Utility Details */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="electricityProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Electricity Provider</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="PEA, MEA, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="waterProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Water Provider</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Local water authority" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="internetProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Internet Provider</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="AIS, True, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="utilityDeposits"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Utility Deposits (THB)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0" />
                            </FormControl>
                            <FormDescription>
                              Total security deposits paid for all utilities
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 4: Property Photos */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="exteriorPhotos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exterior Photos</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="0" />
                              </FormControl>
                              <FormDescription>
                                Building, garden, pool, entrance
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="interiorPhotos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interior Photos</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="0" />
                              </FormControl>
                              <FormDescription>
                                Bedrooms, bathrooms, kitchen, living areas
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="amenityPhotos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amenity Photos</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="0" />
                              </FormControl>
                              <FormDescription>
                                Special features, amenities, details
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Camera className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800">Photo Guidelines</h4>
                            <ul className="text-sm text-blue-700 mt-1 space-y-1">
                              <li>• High resolution (min 1920x1080)</li>
                              <li>• Good lighting and clear shots</li>
                              <li>• Include wide shots and detail photos</li>
                              <li>• Show unique selling points</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: OTA Platform Links */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="airbnbUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Airbnb Listing URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://airbnb.com/rooms/..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="vrboUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>VRBO Listing URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://vrbo.com/..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bookingComUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Booking.com URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://booking.com/..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="directBookingUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Direct Booking URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://yourwebsite.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 6: Contract & Completion */}
                  {currentStep === 6 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="managementContract"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Management Contract</FormLabel>
                                <FormDescription>
                                  Property management agreement signed and filed
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="agreementSigned"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Terms Agreement</FormLabel>
                                <FormDescription>
                                  Owner has agreed to terms and conditions
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="onboardingComplete"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-green-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Onboarding Complete</FormLabel>
                                <FormDescription>
                                  Property is ready for active management
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      {completionPercentage === 100 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-green-800">Onboarding Complete!</h4>
                              <p className="text-sm text-green-700">
                                Congratulations! The property is now fully onboarded and ready for active management.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      <Button type="submit" variant="outline" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Progress"}
                      </Button>
                      {currentStep < ONBOARDING_STEPS.length ? (
                        <Button type="button" onClick={nextStep}>
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button type="submit" disabled={updateMutation.isPending}>
                          Complete Onboarding
                          <Check className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}