import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Phone, Globe, MapPin, Users, MessageSquare, Crown, Star, Zap, CheckCircle, DollarSign, Calendar, Settings, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const BUSINESS_TYPES = [
  { value: "villa", label: "Villa Management" },
  { value: "hotel", label: "Hotel / Resort" },
  { value: "apartment", label: "Apartment Complex" },
  { value: "bnb", label: "B&B / Guesthouse" },
  { value: "other", label: "Other" },
];

const PMS_SYSTEMS = [
  { value: "hostaway", label: "Hostaway", description: "Full integration available", supported: true },
  { value: "guesty", label: "Guesty", description: "Integration coming soon", supported: false },
  { value: "lodgify", label: "Lodgify", description: "Integration coming soon", supported: false },
  { value: "airbnb", label: "Airbnb Direct", description: "Manual import only", supported: false },
  { value: "none", label: "No PMS / Manual Entry", description: "Start without PMS integration", supported: true },
];

const SUBSCRIPTION_TIERS = [
  {
    id: "starter",
    name: "Starter",
    icon: <Star className="h-5 w-5" />,
    description: "Perfect for small property managers",
    propertyRange: "1-10 properties",
    price: "$15",
    priceDetail: "per property/month",
    features: [
      "Property & booking management",
      "Basic task tracking",
      "Financial reporting",
      "Email support",
      "Mobile app access"
    ]
  },
  {
    id: "professional",
    name: "Professional", 
    icon: <Crown className="h-5 w-5" />,
    description: "For growing management companies",
    propertyRange: "11-50 properties",
    price: "$12",
    priceDetail: "per property/month",
    popular: true,
    features: [
      "Everything in Starter",
      "PMS integrations (Hostaway)",
      "Advanced analytics",
      "Staff management",
      "API access",
      "Priority support"
    ]
  },
  {
    id: "enterprise", 
    name: "Enterprise",
    icon: <Zap className="h-5 w-5" />,
    description: "For large-scale operations",
    propertyRange: "50+ properties", 
    price: "$8",
    priceDetail: "per property/month",
    features: [
      "Everything in Professional", 
      "White-label branding",
      "Custom integrations",
      "Advanced reporting",
      "Dedicated account manager",
      "Custom training"
    ]
  }
];

const INTEGRATION_PRIORITIES = [
  { id: "hostaway", label: "Hostaway PMS", description: "Property sync & calendar" },
  { id: "stripe", label: "Stripe Payments", description: "Payment processing" },
  { id: "quickbooks", label: "QuickBooks", description: "Accounting integration" },
  { id: "twilio", label: "SMS/WhatsApp", description: "Guest communication" },
  { id: "mailchimp", label: "Email Marketing", description: "Guest outreach" },
];

const COUNTRIES = [
  "Thailand", "Singapore", "Malaysia", "Indonesia", "Philippines", 
  "Vietnam", "Cambodia", "Laos", "Myanmar", "Brunei", "Other"
];

const REVENUE_RANGES = [
  { value: "0-10k", label: "$0 - $10k/month" },
  { value: "10k-50k", label: "$10k - $50k/month" },
  { value: "50k-100k", label: "$50k - $100k/month" },
  { value: "100k+", label: "$100k+/month" },
];

export default function SignupRequest() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("business");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Business Information
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    website: "",
    propertyCount: "",
    businessType: "",
    
    // Subscription & Pricing
    subscriptionTier: "professional",
    subscriptionType: "trial", // trial or paid
    estimatedMonthlyRevenue: "",
    
    // PMS Integration
    pmsSystem: "",
    currentSoftware: "",
    integrationPriority: [] as string[],
    
    // Staff Structure
    staffStructure: {
      ceoCount: 1,
      managerCount: 1,
      supervisorCount: 2,
      staffCount: 5,
      agentCount: 0,
    },
    
    // Additional
    message: "",
    requestedFeatures: [] as string[],
  });

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requestedFeatures: checked
        ? [...prev.requestedFeatures, featureId]
        : prev.requestedFeatures.filter(f => f !== featureId)
    }));
  };

  const handleIntegrationChange = (integrationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      integrationPriority: checked
        ? [...prev.integrationPriority, integrationId]
        : prev.integrationPriority.filter(i => i !== integrationId)
    }));
  };

  const calculateTotalPrice = () => {
    const count = parseInt(formData.propertyCount) || 0;
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === formData.subscriptionTier);
    if (!tier || count === 0) return { monthly: 0, tier: null };
    
    const pricePerProperty = parseInt(tier.price.replace('$', ''));
    return {
      monthly: count * pricePerProperty,
      tier,
      count
    };
  };

  const getRecommendedTier = () => {
    const count = parseInt(formData.propertyCount) || 0;
    if (count <= 10) return "starter";
    if (count <= 50) return "professional";
    return "enterprise";
  };

  const nextStep = () => {
    const steps = ["business", "subscription", "pms", "staff", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps = ["business", "subscription", "pms", "staff", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const isStepValid = (step: string) => {
    switch (step) {
      case "business":
        return formData.companyName && formData.contactName && formData.email && formData.country && formData.propertyCount;
      case "subscription":
        return formData.subscriptionTier && formData.subscriptionType;
      case "pms":
        return formData.pmsSystem !== undefined;
      case "staff":
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("/api/saas/signup-request", "POST", {
        ...formData,
        propertyCount: parseInt(formData.propertyCount) || 0,
      });

      toast({
        title: "Request Submitted!",
        description: `Thank you for your interest in HostPilotPro! We'll provision your ${formData.subscriptionType === 'trial' ? 'trial' : 'paid'} environment and send setup instructions to ${formData.email} within 24 hours.`,
      });

      // Reset to success step or redirect
      setCurrentStep("success");

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricing = calculateTotalPrice();
  const recommendedTier = getRecommendedTier();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join HostPilotPro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Scale your property management business with our comprehensive SaaS platform.
            Get your dedicated environment with PMS integrations, staff management, and enterprise-grade tools.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            {[
              { id: "business", label: "Business", icon: Building2 },
              { id: "subscription", label: "Plan", icon: Crown },
              { id: "pms", label: "PMS", icon: Settings },
              { id: "staff", label: "Team", icon: Users },
              { id: "review", label: "Review", icon: CheckCircle }
            ].map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = ["business", "subscription", "pms", "staff"].slice(0, ["business", "subscription", "pms", "staff", "review"].indexOf(currentStep)).includes(step.id);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className={`flex items-center ${index < 4 ? 'flex-1' : ''}`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-blue-600 text-white' : 
                    'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 4 && <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="shadow-lg">
          {currentStep === "business" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Tell us about your property management company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Mr Property Siam"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contact Person *
                    </Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="Your Full Name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@yourcompany.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+66 123 456 789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Country *
                    </Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyCount" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Number of Properties *
                    </Label>
                    <Input
                      id="propertyCount"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.propertyCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        setFormData(prev => ({ 
                          ...prev, 
                          propertyCount: e.target.value,
                          subscriptionTier: count <= 10 ? "starter" : count <= 50 ? "professional" : "enterprise"
                        }));
                      }}
                      placeholder="50"
                    />
                    {formData.propertyCount && (
                      <p className="text-sm text-blue-600">
                        Recommended plan: {getRecommendedTier() === "starter" ? "Starter" : getRecommendedTier() === "professional" ? "Professional" : "Enterprise"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedRevenue">Estimated Monthly Revenue</Label>
                  <Select value={formData.estimatedMonthlyRevenue} onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedMonthlyRevenue: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select revenue range (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === "subscription" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-blue-600" />
                  Choose Your Plan
                </CardTitle>
                <CardDescription>
                  Select the subscription tier that fits your business size
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Trial vs Paid Toggle */}
                  <div className="flex justify-center">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          formData.subscriptionType === 'trial'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, subscriptionType: 'trial' }))}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          14-Day Free Trial
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          formData.subscriptionType === 'paid'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, subscriptionType: 'paid' }))}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Start Paid Plan
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Subscription Tiers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SUBSCRIPTION_TIERS.map((tier) => (
                      <div
                        key={tier.id}
                        className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.subscriptionTier === tier.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-blue-300'
                        } ${tier.popular ? 'ring-2 ring-blue-200' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: tier.id }))}
                      >
                        {tier.popular && (
                          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                            Most Popular
                          </Badge>
                        )}
                        
                        <div className="text-center">
                          <div className="flex justify-center mb-4">
                            {tier.icon}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                          <p className="text-gray-600 mb-4 text-sm">{tier.description}</p>
                          <p className="text-sm text-blue-600 mb-4">{tier.propertyRange}</p>
                          
                          <div className="mb-4">
                            <span className="text-3xl font-bold">{tier.price}</span>
                            <span className="text-gray-600">/{tier.priceDetail}</span>
                          </div>

                          {formData.propertyCount && (
                            <div className="mb-4 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-600">
                                {parseInt(formData.propertyCount)} properties × {tier.price}
                              </p>
                              <p className="font-bold text-lg">
                                ${parseInt(formData.propertyCount) * parseInt(tier.price.replace('$', ''))}/month
                              </p>
                            </div>
                          )}

                          <ul className="text-left space-y-2 text-sm">
                            {tier.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pricing.monthly > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Your Plan Summary</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            {pricing.count} properties on {pricing.tier?.name} plan
                          </p>
                          <p className="text-sm text-gray-600">
                            {formData.subscriptionType === 'trial' ? '14-day free trial, then ' : ''}${pricing.monthly}/month
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formData.subscriptionType === 'trial' ? 'FREE' : `$${pricing.monthly}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formData.subscriptionType === 'trial' ? 'for 14 days' : 'per month'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {currentStep === "pms" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-blue-600" />
                  PMS Integration
                </CardTitle>
                <CardDescription>
                  Connect your Property Management System for seamless data sync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {PMS_SYSTEMS.map((pms) => (
                    <div
                      key={pms.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.pmsSystem === pms.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${!pms.supported ? 'opacity-60' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, pmsSystem: pms.value }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {pms.label}
                            {pms.value === 'hostaway' && <Badge className="bg-green-100 text-green-800">Ready for Mr Property Siam</Badge>}
                            {!pms.supported && <Badge variant="secondary">Coming Soon</Badge>}
                          </h3>
                          <p className="text-sm text-gray-600">{pms.description}</p>
                        </div>
                        {formData.pmsSystem === pms.value && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="currentSoftware">What software do you currently use?</Label>
                  <Input
                    id="currentSoftware"
                    value={formData.currentSoftware}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentSoftware: e.target.value }))}
                    placeholder="e.g., Excel, QuickBooks, custom system"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Integration Priorities (optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {INTEGRATION_PRIORITIES.map(integration => (
                      <div key={integration.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={integration.id}
                          checked={formData.integrationPriority.includes(integration.id)}
                          onCheckedChange={(checked) => handleIntegrationChange(integration.id, checked as boolean)}
                        />
                        <Label htmlFor={integration.id} className="text-sm">
                          <div>
                            <span className="font-medium">{integration.label}</span>
                            <p className="text-gray-500 text-xs">{integration.description}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === "staff" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Team Structure
                </CardTitle>
                <CardDescription>
                  Plan your staff hierarchy for role-based access control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ceoCount" className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      CEO/Owners (Full Access)
                    </Label>
                    <Input
                      id="ceoCount"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.staffStructure.ceoCount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        staffStructure: { 
                          ...prev.staffStructure, 
                          ceoCount: parseInt(e.target.value) || 1 
                        } 
                      }))}
                    />
                    <p className="text-xs text-gray-600">System administration, billing, full property access</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managerCount" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Managers (Property Oversight)
                    </Label>
                    <Input
                      id="managerCount"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.staffStructure.managerCount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        staffStructure: { 
                          ...prev.staffStructure, 
                          managerCount: parseInt(e.target.value) || 0 
                        } 
                      }))}
                    />
                    <p className="text-xs text-gray-600">Property portfolio management, staff oversight</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supervisorCount" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Supervisors (Operations)
                    </Label>
                    <Input
                      id="supervisorCount"
                      type="number"
                      min="0"
                      max="20"
                      value={formData.staffStructure.supervisorCount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        staffStructure: { 
                          ...prev.staffStructure, 
                          supervisorCount: parseInt(e.target.value) || 0 
                        } 
                      }))}
                    />
                    <p className="text-xs text-gray-600">Task management, quality control, reporting</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffCount" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Staff Members (Execution)
                    </Label>
                    <Input
                      id="staffCount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.staffStructure.staffCount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        staffStructure: { 
                          ...prev.staffStructure, 
                          staffCount: parseInt(e.target.value) || 0 
                        } 
                      }))}
                    />
                    <p className="text-xs text-gray-600">Housekeeping, maintenance, guest services</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentCount" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Agents (Bookings)
                    </Label>
                    <Input
                      id="agentCount"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.staffStructure.agentCount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        staffStructure: { 
                          ...prev.staffStructure, 
                          agentCount: parseInt(e.target.value) || 0 
                        } 
                      }))}
                    />
                    <p className="text-xs text-gray-600">Sales agents, booking management, commissions</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Total Team Size</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {Object.values(formData.staffStructure).reduce((a, b) => a + b, 0)} team members
                  </p>
                  <p className="text-sm text-gray-600">
                    Accounts will be created during setup based on your structure
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === "review" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  Review & Submit
                </CardTitle>
                <CardDescription>
                  Review your configuration and submit your request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Company:</strong> {formData.companyName}</p>
                      <p><strong>Contact:</strong> {formData.contactName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Properties:</strong> {formData.propertyCount}</p>
                      <p><strong>Location:</strong> {formData.country}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Subscription Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Tier:</strong> {formData.subscriptionTier.charAt(0).toUpperCase() + formData.subscriptionTier.slice(1)}</p>
                      <p><strong>Type:</strong> {formData.subscriptionType === 'trial' ? '14-day Free Trial' : 'Paid Plan'}</p>
                      {pricing.monthly > 0 && (
                        <p><strong>Monthly Cost:</strong> {formData.subscriptionType === 'trial' ? 'FREE (then $' + pricing.monthly + ')' : '$' + pricing.monthly}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">PMS Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>System:</strong> {PMS_SYSTEMS.find(p => p.value === formData.pmsSystem)?.label || 'None selected'}</p>
                      {formData.currentSoftware && <p><strong>Current Software:</strong> {formData.currentSoftware}</p>}
                      {formData.integrationPriority.length > 0 && (
                        <p><strong>Priority Integrations:</strong> {formData.integrationPriority.length} selected</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Team Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>CEOs/Owners:</strong> {formData.staffStructure.ceoCount}</p>
                      <p><strong>Managers:</strong> {formData.staffStructure.managerCount}</p>
                      <p><strong>Supervisors:</strong> {formData.staffStructure.supervisorCount}</p>
                      <p><strong>Staff:</strong> {formData.staffStructure.staffCount}</p>
                      <p><strong>Agents:</strong> {formData.staffStructure.agentCount}</p>
                      <p className="font-semibold border-t pt-1">
                        <strong>Total:</strong> {Object.values(formData.staffStructure).reduce((a, b) => a + b, 0)} accounts
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finalMessage" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Additional Requirements (optional)
                  </Label>
                  <Textarea
                    id="finalMessage"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Any special requirements, questions, or timeline preferences..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation Buttons */}
          {currentStep !== "success" && (
            <div className="flex justify-between p-6 border-t bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === "business"}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex gap-2">
                {currentStep === "review" ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Quick Provisioning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your dedicated environment will be provisioned within 24 hours with all selected integrations ready to use.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                PMS Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Seamless integration with Hostaway and other PMS systems. Perfect for companies like Mr Property Siam.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Team Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Role-based access control with accounts for CEOs, managers, staff, and agents from day one.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}