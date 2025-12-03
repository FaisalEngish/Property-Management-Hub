import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { Loader2, TrendingUp, Users, Target, BarChart3, Plus, Search, Edit, Trash2, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "../lib/queryClient";

// Form schemas
const createRecommendationSchema = z.object({
  guestId: z.string().min(1, "Guest ID is required"),
  propertyId: z.number().min(1, "Property selection is required"),
  recommendationType: z.enum([
    "extra_cleaning",
    "private_chef", 
    "spa_service",
    "tour_guide",
    "grocery_delivery",
    "laundry_service",
    "transportation",
    "other"
  ]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  status: z.enum(["pending", "sent", "accepted", "declined", "expired"]).default("pending"),
});

type CreateRecommendationForm = z.infer<typeof createRecommendationSchema>;

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-blue-100 text-blue-800", 
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

const typeIcons = {
  extra_cleaning: "🧹",
  private_chef: "👨‍🍳",
  spa_service: "💆‍♀️",
  tour_guide: "🗺️",
  grocery_delivery: "🛒",
  laundry_service: "👕",
  transportation: "🚗",
  other: "✨",
};

export default function UpsellRecommendationsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<number | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch recommendations with filters
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/upsell-recommendations', { 
      propertyId: selectedProperty,
      recommendationType: selectedType,
      status: selectedStatus,
      search: searchTerm
    }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('propertyId', selectedProperty.toString());
      if (selectedType) params.append('recommendationType', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('q', searchTerm);
      
      return fetch(`/api/upsell-recommendations${searchTerm ? '/search' : ''}?${params}`).then(res => res.json());
    },
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => fetch('/api/properties').then(res => res.json()),
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/upsell-recommendations/analytics'],
    queryFn: () => fetch('/api/upsell-recommendations/analytics').then(res => res.json()),
  });

  // Fetch recommendation types
  const { data: recommendationTypes = [] } = useQuery({
    queryKey: ['/api/upsell-recommendations/types'],
    queryFn: () => fetch('/api/upsell-recommendations/types').then(res => res.json()),
  });

  const form = useForm<CreateRecommendationForm>({
    resolver: zodResolver(createRecommendationSchema),
    defaultValues: {
      guestId: "",
      propertyId: undefined,
      recommendationType: "extra_cleaning",
      message: "",
      status: "pending",
    },
  });

  // Create recommendation mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateRecommendationForm) =>
      apiRequest("POST", "/api/upsell-recommendations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations/types'] });
      setCreateDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Upsell recommendation created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create recommendation", variant: "destructive" });
    },
  });

  // Update recommendation mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRecommendationForm> }) =>
      apiRequest("PUT", `/api/upsell-recommendations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations/analytics'] });
      setEditDialogOpen(false);
      setSelectedRecommendation(null);
      toast({ title: "Success", description: "Recommendation updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update recommendation", variant: "destructive" });
    },
  });

  // Delete recommendation mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/upsell-recommendations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations/analytics'] });
      toast({ title: "Success", description: "Recommendation deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete recommendation", variant: "destructive" });
    },
  });

  // Generate smart recommendations mutation
  const generateMutation = useMutation({
    mutationFn: ({ guestId, propertyId }: { guestId: string; propertyId: number }) =>
      apiRequest("POST", "/api/upsell-recommendations/generate", { guestId, propertyId }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/upsell-recommendations/analytics'] });
      toast({ 
        title: "Success", 
        description: `Generated ${data.recommendations?.length || 0} smart recommendations with ฿${data.totalEstimatedValue?.toLocaleString()} potential value` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to generate recommendations", variant: "destructive" });
    },
  });

  const onSubmit = (data: CreateRecommendationForm) => {
    createMutation.mutate(data);
  };

  const handleEdit = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setEditDialogOpen(true);
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateMutation.mutate({ id, data: { status: status as "pending" | "sent" | "accepted" | "declined" | "expired" } });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upsell Recommendations</h2>
          <p className="text-muted-foreground">Manage guest service recommendations and track conversion rates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New Recommendation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Upsell Recommendation</DialogTitle>
                <DialogDescription>Create targeted service recommendations for guests</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="guestId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter guest identifier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {properties.map((property: any) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recommendationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommendation Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="extra_cleaning">🧹 Extra Cleaning</SelectItem>
                            <SelectItem value="private_chef">👨‍🍳 Private Chef</SelectItem>
                            <SelectItem value="spa_service">💆‍♀️ Spa Service</SelectItem>
                            <SelectItem value="tour_guide">🗺️ Tour Guide</SelectItem>
                            <SelectItem value="grocery_delivery">🛒 Grocery Delivery</SelectItem>
                            <SelectItem value="laundry_service">👕 Laundry Service</SelectItem>
                            <SelectItem value="transportation">🚗 Transportation</SelectItem>
                            <SelectItem value="other">✨ Other Service</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommendation Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the service offering and benefits..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Recommendation
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="recommendations">📋 Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="types">🎯 Service Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalRecommendations || 0}</div>
                <p className="text-xs text-muted-foreground">All time recommendations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.conversionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Accepted vs declined</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Guests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.uniqueGuests || 0}</div>
                <p className="text-xs text-muted-foreground">Guests with recommendations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.pendingCount || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting guest response</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Generate AI-powered recommendations for your guests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Generate personalized recommendations based on guest preferences and property amenities</p>
                </div>
                <Button 
                  onClick={() => generateMutation.mutate({ guestId: "guest-demo-123", propertyId: properties[0]?.id })}
                  disabled={generateMutation.isPending || !properties.length}
                >
                  {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Star className="mr-2 h-4 w-4" />
                  Generate Smart Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedProperty?.toString() || ""} onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : undefined)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Properties</SelectItem>
                {properties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType || ""} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="extra_cleaning">Extra Cleaning</SelectItem>
                <SelectItem value="private_chef">Private Chef</SelectItem>
                <SelectItem value="spa_service">Spa Service</SelectItem>
                <SelectItem value="tour_guide">Tour Guide</SelectItem>
                <SelectItem value="grocery_delivery">Grocery Delivery</SelectItem>
                <SelectItem value="laundry_service">Laundry Service</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus || ""} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {recommendationsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Days Since</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.map((recommendation: any) => (
                      <TableRow key={recommendation.id}>
                        <TableCell className="font-medium">{recommendation.guestName || recommendation.guestId}</TableCell>
                        <TableCell>{recommendation.propertyName}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{typeIcons[recommendation.recommendationType as keyof typeof typeIcons]}</span>
                            <span className="capitalize">{recommendation.recommendationType?.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{recommendation.message}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[recommendation.status as keyof typeof statusColors]}>
                            {recommendation.status}
                          </Badge>
                          {recommendation.isExpired && (
                            <Badge variant="destructive" className="ml-1">Expired</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(recommendation.createdAt)}</TableCell>
                        <TableCell>{recommendation.daysSinceCreated} days</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(recommendation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMutation.mutate(recommendation.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {recommendation.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(recommendation.id, 'sent')}
                                >
                                  Send
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(recommendation.id, 'accepted')}
                                >
                                  Accept
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Breakdown of recommendation statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-medium">{analytics?.pendingCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sent</span>
                    <span className="font-medium">{analytics?.sentCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accepted</span>
                    <span className="font-medium text-green-600">{analytics?.acceptedCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Declined</span>
                    <span className="font-medium text-red-600">{analytics?.declinedCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired</span>
                    <span className="font-medium text-gray-600">{analytics?.expiredCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span className="font-medium">{analytics?.conversionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Recommendations/Guest</span>
                    <span className="font-medium">{analytics?.avgRecommendationsPerGuest || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Properties</span>
                    <span className="font-medium">{analytics?.uniqueProperties || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Guests</span>
                    <span className="font-medium">{analytics?.uniqueGuests || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Type Performance</CardTitle>
              <CardDescription>Analyze conversion rates by recommendation type</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead>Declined</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendationTypes.map((type: any) => (
                    <TableRow key={type.recommendationType}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{typeIcons[type.recommendationType as keyof typeof typeIcons]}</span>
                          <span className="capitalize">{type.recommendationType?.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{type.recommendationCount}</TableCell>
                      <TableCell>{type.pendingCount}</TableCell>
                      <TableCell className="text-green-600">{type.acceptedCount}</TableCell>
                      <TableCell className="text-red-600">{type.declinedCount}</TableCell>
                      <TableCell>
                        <Badge variant={type.conversionRate > 50 ? "default" : "secondary"}>
                          {type.conversionRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Recommendation</DialogTitle>
            <DialogDescription>Modify recommendation details and status</DialogDescription>
          </DialogHeader>
          {selectedRecommendation && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={selectedRecommendation.status} 
                  onValueChange={(value) => handleStatusUpdate(selectedRecommendation.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}