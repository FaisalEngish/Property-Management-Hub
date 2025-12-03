import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Key, 
  Wifi, 
  CreditCard, 
  Brain, 
  Home, 
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  Zap
} from "lucide-react";

const apiConnectionSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

type ApiConnectionForm = z.infer<typeof apiConnectionSchema>;

interface ApiConnection {
  id: string;
  service: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTested: string;
  isActive: boolean;
  hasCredentials: boolean;
  description?: string;
}

const predefinedServices = [
  {
    service: "lodgify",
    name: "Lodgify Property Management",
    icon: Home,
    color: "bg-amber-100 text-amber-700",
    description: "Sync properties, bookings, and financial data from Lodgify",
    fields: [
      { name: "apiKey", label: "API Key", placeholder: "Your Lodgify API key", type: "password" },
      { name: "baseUrl", label: "API Base URL", placeholder: "https://api.lodgify.com", type: "text" }
    ]
  },
  {
    service: "makcorps",
    name: "Makcorps Hotel Pricing",
    icon: Zap,
    color: "bg-indigo-100 text-indigo-700",
    description: "Real-time hotel pricing from 200+ OTAs (Booking.com, Expedia, Agoda, etc.)",
    fields: [
      { name: "apiKey", label: "API Key", placeholder: "Your Makcorps API key", type: "password" },
      { name: "baseUrl", label: "API Base URL", placeholder: "https://api.makcorps.com", type: "text" }
    ]
  },
  {
    service: "rentcast",
    name: "RentCast Property Data",
    icon: Home,
    color: "bg-teal-100 text-teal-700",
    description: "140M+ property records, rental estimates (AVM), valuations, market data & trends",
    fields: [
      { name: "apiKey", label: "API Key", placeholder: "Your RentCast API key", type: "password" },
      { name: "baseUrl", label: "API Base URL", placeholder: "https://api.rentcast.io/v1", type: "text" }
    ]
  },
  {
    service: "stripe",
    name: "Stripe Payment Processing",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-700",
    description: "Process payments and manage subscriptions",
    fields: [
      { name: "apiKey", label: "Publishable Key", placeholder: "pk_live_...", type: "text" },
      { name: "apiSecret", label: "Secret Key", placeholder: "sk_live_...", type: "password" }
    ]
  },
  {
    service: "hostaway",
    name: "Hostaway Property Management",
    icon: Home,
    color: "bg-blue-100 text-blue-700", 
    description: "Sync properties, bookings, and guest data",
    fields: [
      { name: "apiKey", label: "API Key", placeholder: "Your Hostaway API key", type: "password" },
      { name: "baseUrl", label: "API Base URL", placeholder: "https://api.hostaway.com", type: "text" }
    ]
  },
  {
    service: "openai",
    name: "OpenAI AI Assistant",
    icon: Brain,
    color: "bg-green-100 text-green-700",
    description: "AI-powered recommendations and automation",
    fields: [
      { name: "apiKey", label: "API Key", placeholder: "sk-...", type: "password" }
    ]
  },
  {
    service: "twilio",
    name: "Twilio SMS Notifications", 
    icon: Wifi,
    color: "bg-red-100 text-red-700",
    description: "Send SMS notifications to guests and staff",
    fields: [
      { name: "apiKey", label: "Account SID", placeholder: "AC...", type: "text" },
      { name: "apiSecret", label: "Auth Token", placeholder: "Your auth token", type: "password" }
    ]
  }
];

export default function ApiConnections() {
  const [editingService, setEditingService] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApiConnectionForm>({
    resolver: zodResolver(apiConnectionSchema),
    defaultValues: {
      isActive: true,
    },
  });

  // Fetch API connections
  const { data: connectionsData = [], isLoading } = useQuery({
    queryKey: ["/api/admin/api-connections"],
    queryFn: () => apiRequest("GET", "/api/admin/api-connections"),
  });

  // Ensure connections is always an array
  const connections = Array.isArray(connectionsData) ? connectionsData : [];

  // Update API connection
  const updateConnectionMutation = useMutation({
    mutationFn: (data: { service: string; config: ApiConnectionForm }) =>
      apiRequest("PUT", `/api/admin/api-connections/${data.service}`, data.config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-connections"] });
      setEditingService(null);
      form.reset();
      toast({
        title: "Connection Updated",
        description: `${variables.service} configuration has been saved successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update API connection",
        variant: "destructive",
      });
    },
  });

  // Test API connection
  const testConnectionMutation = useMutation({
    mutationFn: (service: string) =>
      apiRequest("POST", `/api/admin/api-connections/${service}/test`),
    onSuccess: (result, service) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-connections"] });
      setTestingConnection(null);
      toast({
        title: "Connection Test Successful",
        description: `${service} API is working correctly.`,
      });
    },
    onError: (error: any, service) => {
      setTestingConnection(null);
      toast({
        title: "Connection Test Failed",
        description: `${service}: ${error.message || "Connection test failed"}`,
        variant: "destructive",
      });
    },
  });

  // Toggle connection status
  const toggleConnectionMutation = useMutation({
    mutationFn: (data: { service: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/api-connections/${data.service}/toggle`, { isActive: data.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-connections"] });
    },
  });

  const handleEdit = (service: any) => {
    const connection = connections.find((c: ApiConnection) => c.service === service.service);
    setEditingService(service.service);
    form.reset({
      name: service.name,
      isActive: connection?.isActive ?? true,
      description: service.description,
    });
  };

  const handleTestConnection = (service: string) => {
    setTestingConnection(service);
    testConnectionMutation.mutate(service);
  };

  const toggleShowSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getStatusIcon = (connection: ApiConnection | undefined) => {
    if (!connection) return <XCircle className="h-4 w-4 text-gray-400" />;
    
    switch (connection.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (connection: ApiConnection | undefined) => {
    if (!connection) {
      return <Badge variant="secondary">Not Configured</Badge>;
    }
    
    switch (connection.status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-700">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            API Connections
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure third-party integrations for your property management system
          </p>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> All API keys are encrypted and stored securely. Only administrators can view and modify these settings.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">Service Connections</TabsTrigger>
          <TabsTrigger value="logs">Connection Logs</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <div className="grid gap-6">
            {predefinedServices.map((service) => {
              const connection = connections.find((c: ApiConnection) => c.service === service.service);
              const ServiceIcon = service.icon;
              
              return (
                <Card key={service.service} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${service.color}`}>
                          <ServiceIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {service.name}
                            {getStatusIcon(connection)}
                          </CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(connection)}
                        <Switch
                          checked={connection?.isActive ?? false}
                          onCheckedChange={(checked) =>
                            toggleConnectionMutation.mutate({
                              service: service.service,
                              isActive: checked,
                            })
                          }
                          disabled={!connection?.hasCredentials}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {connection?.hasCredentials 
                          ? `Last tested: ${connection.lastTested || 'Never'}`
                          : 'No credentials configured'
                        }
                      </div>
                      <div className="flex gap-2">
                        {connection?.hasCredentials && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(service.service)}
                            disabled={testingConnection === service.service}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            {testingConnection === service.service ? "Testing..." : "Test"}
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <ServiceIcon className="h-5 w-5" />
                                Configure {service.name}
                              </DialogTitle>
                              <DialogDescription>
                                Enter your API credentials for {service.name}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit((data) => 
                                updateConnectionMutation.mutate({ service: service.service, config: data })
                              )} className="space-y-4">
                                {service.fields.map((field) => (
                                  <FormField
                                    key={field.name}
                                    control={form.control}
                                    name={field.name as keyof ApiConnectionForm}
                                    render={({ field: formField }) => (
                                      <FormItem>
                                        <FormLabel>{field.label}</FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              type={field.type === 'password' && !showSecrets[field.name] ? 'password' : 'text'}
                                              placeholder={field.placeholder}
                                              {...formField}
                                            />
                                            {field.type === 'password' && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => toggleShowSecret(field.name)}
                                              >
                                                {showSecrets[field.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                              </Button>
                                            )}
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ))}
                                
                                <FormField
                                  control={form.control}
                                  name="isActive"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel>Enable Service</FormLabel>
                                        <FormDescription>
                                          Activate this integration for your organization
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
                                
                                <div className="flex justify-end space-x-2">
                                  <DialogTrigger asChild>
                                    <Button type="button" variant="outline">
                                      Cancel
                                    </Button>
                                  </DialogTrigger>
                                  <Button type="submit" disabled={updateConnectionMutation.isPending}>
                                    {updateConnectionMutation.isPending ? "Saving..." : "Save Configuration"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Connection Activity Logs</CardTitle>
              <CardDescription>
                Monitor API connection status and error logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4" />
                <p>Connection logs will appear here when services are tested or used</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Global API Settings</CardTitle>
              <CardDescription>
                Configure global settings for all API integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="font-medium">Automatic Testing</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically test connections every 24 hours
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="font-medium">Error Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Send email notifications when connections fail
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="font-medium">Debug Logging</div>
                  <div className="text-sm text-muted-foreground">
                    Enable detailed logging for troubleshooting
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}