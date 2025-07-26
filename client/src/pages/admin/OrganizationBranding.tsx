import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Building2, Palette, Globe, Save, Image } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const brandingSchema = z.object({
  customDomain: z.string().optional(),
  brandingLogoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color code").optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

interface Organization {
  id: string;
  name: string;
  customDomain?: string;
  brandingLogoUrl?: string;
  themeColor?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrganizationBranding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      customDomain: "",
      brandingLogoUrl: "",
      themeColor: "#2563eb",
    },
  });

  // Fetch current organization details
  const { data: organization, isLoading, error } = useQuery<Organization>({
    queryKey: ["/api/organization/current"],
    onSuccess: (data) => {
      form.reset({
        customDomain: data.customDomain || "",
        brandingLogoUrl: data.brandingLogoUrl || "",
        themeColor: data.themeColor || "#2563eb",
      });
    },
  });

  // Update organization branding mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingFormData) => {
      const response = await apiRequest("PUT", "/api/organization/branding", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Branding Updated",
        description: "Organization branding settings have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/current"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update organization branding settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BrandingFormData) => {
    updateBrandingMutation.mutate(data);
  };

  const watchedValues = form.watch();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load organization details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            Organization Branding
            <Badge variant="secondary">Brand</Badge>
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your organization's branding, domain, and visual identity
          </p>
        </div>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding Settings
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Custom Domain
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Visual Branding
              </CardTitle>
              <CardDescription>
                Configure your organization's logo, colors, and visual identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="brandingLogoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://your-domain.com/logo.png"
                            type="url"
                          />
                        </FormControl>
                        <FormDescription>
                          URL to your organization's logo image. Recommended size: 200x60px.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="themeColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Theme Color</FormLabel>
                        <div className="flex items-center gap-4">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="#2563eb"
                              className="max-w-32"
                            />
                          </FormControl>
                          <div
                            className="w-12 h-12 rounded-md border-2 border-gray-300"
                            style={{ backgroundColor: field.value || "#2563eb" }}
                          />
                        </div>
                        <FormDescription>
                          Primary color for buttons, links, and brand elements. Use hex format (e.g., #2563eb).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={updateBrandingMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateBrandingMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Branding Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domain Configuration
              </CardTitle>
              <CardDescription>
                Set up a custom domain for your organization's portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Domain</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="portal.yourcompany.com"
                          />
                        </FormControl>
                        <FormDescription>
                          Your custom domain for client access. Make sure to configure DNS records.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>DNS Configuration Required</AlertTitle>
                    <AlertDescription>
                      After setting your custom domain, you'll need to configure your DNS records to point to our servers. 
                      Contact support for detailed DNS setup instructions.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    disabled={updateBrandingMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateBrandingMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Domain Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Branding Preview
              </CardTitle>
              <CardDescription>
                Preview how your branding will appear to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Organization Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Settings</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Organization:</span> {organization?.name}
                    </div>
                    <div>
                      <span className="font-medium">Domain:</span> {watchedValues.customDomain || "Not configured"}
                    </div>
                    <div>
                      <span className="font-medium">Theme Color:</span> {watchedValues.themeColor || "#2563eb"}
                    </div>
                    <div>
                      <span className="font-medium">Logo URL:</span> {watchedValues.brandingLogoUrl || "Not configured"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Visual Preview</h3>
                  <div 
                    className="border rounded-lg p-4 bg-white"
                    style={{ borderColor: watchedValues.themeColor || "#2563eb" }}
                  >
                    {watchedValues.brandingLogoUrl ? (
                      <img 
                        src={watchedValues.brandingLogoUrl} 
                        alt="Organization Logo" 
                        className="h-12 mb-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-12 mb-4 flex items-center">
                        <span className="text-gray-500 text-sm">Logo will appear here</span>
                      </div>
                    )}
                    
                    <Button
                      variant="default"
                      style={{ backgroundColor: watchedValues.themeColor || "#2563eb" }}
                      className="text-white"
                    >
                      Sample Button
                    </Button>
                    
                    <p className="mt-4 text-sm text-gray-600">
                      This is how your branding will appear in the client portal.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Branding Guidelines</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Logo should be in PNG or SVG format with transparent background</li>
                    <li>• Recommended logo dimensions: 200x60px or similar aspect ratio</li>
                    <li>• Theme color should have good contrast for text readability</li>
                    <li>• Custom domain requires DNS configuration and SSL setup</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}