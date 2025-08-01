import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe, MapPin, Users, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const BUSINESS_TYPES = [
  { value: "villa", label: "Villa Management" },
  { value: "hotel", label: "Hotel / Resort" },
  { value: "apartment", label: "Apartment Complex" },
  { value: "bnb", label: "B&B / Guesthouse" },
  { value: "other", label: "Other" },
];

const FEATURES = [
  { id: "financial_reporting", label: "Advanced Financial Reporting" },
  { id: "api_integrations", label: "API Integrations (Hostaway, Stripe)" },
  { id: "advanced_analytics", label: "Advanced Analytics & Insights" },
  { id: "multi_language", label: "Multi-Language Support" },
  { id: "white_label", label: "White Label Branding" },
];

const COUNTRIES = [
  "Thailand", "Singapore", "Malaysia", "Indonesia", "Philippines", 
  "Vietnam", "Cambodia", "Laos", "Myanmar", "Brunei", "Other"
];

export default function SignupRequest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    website: "",
    propertyCount: "",
    businessType: "",
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
        description: "Thank you for your interest in HostPilotPro. We'll review your request and get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        country: "",
        website: "",
        propertyCount: "",
        businessType: "",
        message: "",
        requestedFeatures: [],
      });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join HostPilotPro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your hospitality business with our comprehensive property management platform. 
            Get your own dedicated environment with full API integrations.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Request Your HostPilotPro Environment
            </CardTitle>
            <CardDescription>
              Tell us about your business and we'll set up a customized platform for your needs.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
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
                    placeholder="Your Management Company"
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

              {/* Contact Information */}
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

              {/* Location & Website */}
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

              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyCount">Number of Properties</Label>
                  <Input
                    id="propertyCount"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.propertyCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyCount: e.target.value }))}
                    placeholder="5"
                  />
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

              {/* Requested Features */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Requested Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FEATURES.map(feature => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.id}
                        checked={formData.requestedFeatures.includes(feature.id)}
                        onCheckedChange={(checked) => handleFeatureChange(feature.id, checked as boolean)}
                      />
                      <Label htmlFor={feature.id} className="text-sm font-normal">
                        {feature.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Additional Information
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us more about your business needs, integration requirements, or any specific questions..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? "Submitting Request..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🚀 Quick Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get your dedicated environment provisioned within 24 hours of approval.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔧 Full Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete API integrations with Hostaway, Stripe, and other essential services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Comprehensive reporting and analytics to optimize your property management.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}