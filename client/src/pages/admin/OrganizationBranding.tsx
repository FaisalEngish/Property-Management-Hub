import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Palette, Upload, Eye, Settings, Users, Building2 } from "lucide-react";

// Branding configuration schema
const brandingConfigSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().min(7, "Must be a valid hex color").optional().or(z.literal("")),
  secondaryColor: z.string().min(7, "Must be a valid hex color").optional().or(z.literal("")),
  reportTheme: z.enum(["modern", "classic", "minimal", "corporate"]).optional(),
  customDomain: z.string().url().optional().or(z.literal("")),
});

const transparencyConfigSchema = z.object({
  mode: z.enum(["full", "summary", "financial-only", "limited"]),
});

interface OwnerSettings {
  id: string;
  organizationId: string;
  ownerId: string;
  transparencyMode: string;
  customBranding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    reportTheme?: string;
    customDomain?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  organizationId: string;
}

export default function OrganizationBranding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  // Fetch all users with owner role
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const ownerUsers = users.filter((user: User) => user.role === 'owner');

  // Fetch owner settings for selected owner
  const { data: ownerSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/owner-settings", selectedOwnerId],
    enabled: !!selectedOwnerId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Initialize forms
  const brandingForm = useForm({
    resolver: zodResolver(brandingConfigSchema),
    defaultValues: {
      logoUrl: "",
      primaryColor: "#3b82f6",
      secondaryColor: "#06b6d4",
      reportTheme: "modern" as const,
      customDomain: "",
    },
  });

  const transparencyForm = useForm({
    resolver: zodResolver(transparencyConfigSchema),
    defaultValues: {
      mode: "summary" as const,
    },
  });

  // Update form values when settings load
  useState(() => {
    if (ownerSettings?.customBranding) {
      brandingForm.reset({
        logoUrl: ownerSettings.customBranding.logoUrl || "",
        primaryColor: ownerSettings.customBranding.primaryColor || "#3b82f6",
        secondaryColor: ownerSettings.customBranding.secondaryColor || "#06b6d4",
        reportTheme: (ownerSettings.customBranding.reportTheme as any) || "modern",
        customDomain: ownerSettings.customBranding.customDomain || "",
      });
    }
    if (ownerSettings?.transparencyMode) {
      transparencyForm.reset({
        mode: ownerSettings.transparencyMode as any,
      });
    }
  });

  // Update branding mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof brandingConfigSchema>) => {
      return apiRequest("PATCH", `/api/owner-settings/${selectedOwnerId}/branding`, data);
    },
    onSuccess: () => {
      toast({
        title: "Branding Updated",
        description: "Custom branding settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update branding settings",
        variant: "destructive",
      });
    },
  });

  // Update transparency mutation
  const updateTransparencyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof transparencyConfigSchema>) => {
      return apiRequest("PATCH", `/api/owner-settings/${selectedOwnerId}/transparency`, data);
    },
    onSuccess: () => {
      toast({
        title: "Transparency Updated",
        description: "Owner transparency mode has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update transparency settings",
        variant: "destructive",
      });
    },
  });

  const onBrandingSubmit = (data: z.infer<typeof brandingConfigSchema>) => {
    updateBrandingMutation.mutate(data);
  };

  const onTransparencySubmit = (data: z.infer<typeof transparencyConfigSchema>) => {
    updateTransparencyMutation.mutate(data);
  };

  if (usersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Organization Branding</h1>
          <p className="text-gray-600">Manage custom branding and transparency settings for property owners</p>
        </div>
      </div>

      {/* Owner Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Owner
          </CardTitle>
          <CardDescription>
            Choose a property owner to configure their branding and transparency settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="owner-select">Property Owner</Label>
              <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an owner to configure..." />
                </SelectTrigger>
                <SelectContent>
                  {ownerUsers.map((owner: User) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{owner.username}</span>
                        <Badge variant="secondary" className="ml-2">
                          {owner.email}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {ownerUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No property owners found in the system.</p>
                <p className="text-sm">Owners will appear here once they are created.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      {selectedOwnerId && (
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Custom Branding
            </TabsTrigger>
            <TabsTrigger value="transparency" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Transparency
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Custom Branding Configuration</CardTitle>
                <CardDescription>
                  Customize the visual appearance for this owner's reports and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <Form {...brandingForm}>
                    <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-6">
                      <FormField
                        control={brandingForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Logo URL</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input placeholder="https://example.com/logo.png" {...field} />
                                <Button type="button" variant="outline" size="sm">
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={brandingForm.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Brand Color</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input type="color" className="w-16 h-10" {...field} />
                                  <Input placeholder="#3b82f6" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={brandingForm.control}
                          name="secondaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secondary Brand Color</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input type="color" className="w-16 h-10" {...field} />
                                  <Input placeholder="#06b6d4" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={brandingForm.control}
                        name="reportTheme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Theme</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a report theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="classic">Classic</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="corporate">Corporate</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={brandingForm.control}
                        name="customDomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Domain (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://reports.yourcompany.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={updateBrandingMutation.isPending}
                      >
                        {updateBrandingMutation.isPending ? "Saving..." : "Save Branding Settings"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transparency">
            <Card>
              <CardHeader>
                <CardTitle>Owner Transparency Settings</CardTitle>
                <CardDescription>
                  Control what financial and operational information this owner can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...transparencyForm}>
                  <form onSubmit={transparencyForm.handleSubmit(onTransparencySubmit)} className="space-y-6">
                    <FormField
                      control={transparencyForm.control}
                      name="mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transparency Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transparency level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full">
                                <div className="space-y-1">
                                  <div className="font-medium">Full Transparency</div>
                                  <div className="text-sm text-gray-500">Complete access to all financial and operational data</div>
                                </div>
                              </SelectItem>
                              <SelectItem value="summary">
                                <div className="space-y-1">
                                  <div className="font-medium">Summary Reports</div>
                                  <div className="text-sm text-gray-500">High-level summaries and key metrics only</div>
                                </div>
                              </SelectItem>
                              <SelectItem value="financial-only">
                                <div className="space-y-1">
                                  <div className="font-medium">Financial Only</div>
                                  <div className="text-sm text-gray-500">Access to financial data, limited operational details</div>
                                </div>
                              </SelectItem>
                              <SelectItem value="limited">
                                <div className="space-y-1">
                                  <div className="font-medium">Limited Access</div>
                                  <div className="text-sm text-gray-500">Basic property status and essential information only</div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Transparency Level Details</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Full:</strong> Complete financial reports, task details, guest information</p>
                        <p><strong>Summary:</strong> Monthly summaries, key performance indicators, basic metrics</p>
                        <p><strong>Financial Only:</strong> Revenue, expenses, payouts - no operational details</p>
                        <p><strong>Limited:</strong> Property status, basic booking information, essential notifications</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={updateTransparencyMutation.isPending}
                    >
                      {updateTransparencyMutation.isPending ? "Updating..." : "Update Transparency Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Branding Preview</CardTitle>
                <CardDescription>
                  Preview how the custom branding will appear in owner reports and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Mock Report Preview */}
                  <div
                    className="border rounded-lg p-6"
                    style={{
                      borderColor: brandingForm.watch("primaryColor") || "#3b82f6",
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {brandingForm.watch("logoUrl") ? (
                          <img
                            src={brandingForm.watch("logoUrl")}
                            alt="Company Logo"
                            className="h-12 w-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="h-12 w-24 rounded flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: brandingForm.watch("primaryColor") || "#3b82f6" }}
                          >
                            LOGO
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold">Monthly Property Report</h2>
                          <p className="text-gray-600">December 2024</p>
                        </div>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: brandingForm.watch("secondaryColor") || "#06b6d4",
                          color: "white",
                        }}
                      >
                        {brandingForm.watch("reportTheme") || "Modern"} Theme
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900">Revenue</h3>
                        <p className="text-2xl font-bold" style={{ color: brandingForm.watch("primaryColor") || "#3b82f6" }}>
                          ฿128,500
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900">Occupancy</h3>
                        <p className="text-2xl font-bold" style={{ color: brandingForm.watch("secondaryColor") || "#06b6d4" }}>
                          85%
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900">Net Profit</h3>
                        <p className="text-2xl font-bold text-green-600">฿89,200</p>
                      </div>
                    </div>

                    {brandingForm.watch("customDomain") && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Custom Domain:</strong> {brandingForm.watch("customDomain")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-gray-500 text-sm">
                    This is a preview of how your branding will appear in owner reports and documents.
                    Save your settings to apply these changes.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}