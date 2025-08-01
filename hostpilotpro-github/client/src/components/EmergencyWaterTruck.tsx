import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Truck, Droplets, AlertTriangle, TrendingUp, Calendar, 
  DollarSign, Zap, CheckCircle, XCircle, Clock, 
  Users, Target, BarChart3, Edit, Trash2, Plus
} from "lucide-react";

// Types
interface EmergencyWaterDelivery {
  id: number;
  organizationId: string;
  propertyId: number;
  deliveryDate: string;
  volumeLiters: number;
  costTHB: string;
  costPerLiter: string;
  supplierName: string;
  supplierContact: string;
  deliveryType: string;
  emergencyReason: string;
  urgencyLevel: string;
  requestedBy: string;
  approvedBy?: string;
  deliveredBy?: string;
  receiptUrl?: string;
  paymentStatus: string;
  billingRoute: string;
  notes?: string;
  weatherConditions?: string;
  deliveryTime?: string;
  tankLocation?: string;
  pumpingRequired: boolean;
  deliveryConfirmed: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface WaterDeliveryAlert {
  id: number;
  organizationId: string;
  propertyId: number;
  alertType: string;
  alertTitle: string;
  alertMessage: string;
  severity: string;
  triggerCount: number;
  triggerPeriodDays: number;
  totalCost: string;
  recommendationAI: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

interface WaterUpgradeSuggestion {
  id: number;
  organizationId: string;
  propertyId: number;
  upgradeType: string;
  currentIssue: string;
  suggestedSolution: string;
  estimatedCost: string;
  estimatedSavingsPerYear: string;
  paybackPeriodMonths: number;
  priority: string;
  basedOnDeliveries: number;
  confidenceScore: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  implementedAt?: string;
  createdAt: string;
}

interface WaterManagementAnalytics {
  totalDeliveries: number;
  totalCost: number;
  averageCostPerLiter: number;
  deliveriesByType: { type: string; count: number; totalCost: number }[];
  monthlyTrend: { month: string; deliveries: number; cost: number }[];
  activeAlerts: number;
  pendingSuggestions: number;
}

export default function EmergencyWaterTruck() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<EmergencyWaterDelivery | null>(null);
  const [newDelivery, setNewDelivery] = useState<Partial<EmergencyWaterDelivery>>({
    deliveryDate: new Date().toISOString().split('T')[0],
    volumeLiters: 5000,
    costTHB: "2500",
    supplierName: "Samui Water Supply Co.",
    supplierContact: "+66 77 123 456",
    deliveryType: "emergency",
    urgencyLevel: "high",
    paymentStatus: "pending",
    billingRoute: "owner_billable",
    pumpingRequired: true,
    deliveryConfirmed: false,
    status: "scheduled"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch water deliveries
  const { data: deliveries = [], isLoading: isLoadingDeliveries } = useQuery({
    queryKey: ["/api/emergency-water-deliveries", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/emergency-water-deliveries${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ""}`).then(res => res.json())
  });

  // Fetch water delivery alerts
  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["/api/water-delivery-alerts", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/water-delivery-alerts${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ""}`).then(res => res.json())
  });

  // Fetch water upgrade suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["/api/water-upgrade-suggestions", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/water-upgrade-suggestions${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ""}`).then(res => res.json())
  });

  // Fetch water management analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["/api/water-management-analytics", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/water-management-analytics${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ""}`).then(res => res.json())
  });

  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: (data: Partial<EmergencyWaterDelivery>) => 
      apiRequest("POST", "/api/emergency-water-deliveries", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Emergency water delivery created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-water-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-management-analytics"] });
      setIsCreateDialogOpen(false);
      setNewDelivery({
        deliveryDate: new Date().toISOString().split('T')[0],
        volumeLiters: 5000,
        costTHB: "2500",
        supplierName: "Samui Water Supply Co.",
        supplierContact: "+66 77 123 456",
        deliveryType: "emergency",
        urgencyLevel: "high",
        paymentStatus: "pending",
        billingRoute: "owner_billable",
        pumpingRequired: true,
        deliveryConfirmed: false,
        status: "scheduled"
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create emergency water delivery", variant: "destructive" });
    }
  });

  // Update delivery mutation
  const updateDeliveryMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<EmergencyWaterDelivery>) => 
      apiRequest("PUT", `/api/emergency-water-deliveries/${id}`, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Emergency water delivery updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-water-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-management-analytics"] });
      setIsEditDialogOpen(false);
      setSelectedDelivery(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update emergency water delivery", variant: "destructive" });
    }
  });

  // Delete delivery mutation
  const deleteDeliveryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/emergency-water-deliveries/${id}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Emergency water delivery deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-water-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-management-analytics"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete emergency water delivery", variant: "destructive" });
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => 
      apiRequest("PUT", `/api/water-delivery-alerts/${alertId}/acknowledge`, {}),
    onSuccess: () => {
      toast({ title: "Success", description: "Alert acknowledged successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/water-delivery-alerts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to acknowledge alert", variant: "destructive" });
    }
  });

  // Review suggestion mutation
  const reviewSuggestionMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PUT", `/api/water-upgrade-suggestions/${id}/review`, { status }),
    onSuccess: () => {
      toast({ title: "Success", description: "Suggestion reviewed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/water-upgrade-suggestions"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to review suggestion", variant: "destructive" });
    }
  });

  const handleCreateDelivery = () => {
    if (!newDelivery.propertyId || !newDelivery.emergencyReason) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }
    createDeliveryMutation.mutate(newDelivery);
  };

  const handleUpdateDelivery = () => {
    if (!selectedDelivery) return;
    updateDeliveryMutation.mutate({ id: selectedDelivery.id, ...selectedDelivery });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8 text-blue-600" />
            Emergency Water Delivery
          </h1>
          <p className="text-gray-600">AI forecasting and role-based management</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Emergency Water Delivery</DialogTitle>
              <DialogDescription>
                Create a new emergency water delivery request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="property">Property *</Label>
                <Select onValueChange={(value) => setNewDelivery(prev => ({ ...prev, propertyId: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Villa Samui Breeze</SelectItem>
                    <SelectItem value="2">Villa Tropical Paradise</SelectItem>
                    <SelectItem value="3">Villa Aruna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  type="date"
                  value={newDelivery.deliveryDate}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, deliveryDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="volumeLiters">Volume (Liters) *</Label>
                <Input
                  type="number"
                  value={newDelivery.volumeLiters}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, volumeLiters: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="costTHB">Cost (THB) *</Label>
                <Input
                  type="number"
                  value={newDelivery.costTHB}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, costTHB: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emergencyReason">Emergency Reason *</Label>
                <Textarea
                  placeholder="Describe the emergency situation..."
                  value={newDelivery.emergencyReason || ""}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, emergencyReason: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="urgencyLevel">Urgency Level</Label>
                <Select value={newDelivery.urgencyLevel} onValueChange={(value) => setNewDelivery(prev => ({ ...prev, urgencyLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDelivery} disabled={createDeliveryMutation.isPending}>
                {createDeliveryMutation.isPending ? "Creating..." : "Create Delivery"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold">{analytics.totalDeliveries}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold">{analytics.totalCost.toLocaleString()} THB</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Cost/Liter</p>
                  <p className="text-2xl font-bold">{analytics.averageCostPerLiter.toFixed(2)} THB</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.activeAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="deliveries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliveries">Delivery History</TabsTrigger>
          <TabsTrigger value="alerts">AI Alerts</TabsTrigger>
          <TabsTrigger value="suggestions">Upgrade Suggestions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Delivery History Tab */}
        <TabsContent value="deliveries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Emergency Water Deliveries
              </CardTitle>
              <CardDescription>
                Track and manage all emergency water deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDeliveries ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : deliveries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No emergency water deliveries found
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((delivery: EmergencyWaterDelivery) => (
                    <div key={delivery.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Droplets className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-semibold">{delivery.supplierName}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(delivery.deliveryDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDeliveryMutation.mutate(delivery.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Volume:</span> {delivery.volumeLiters.toLocaleString()} L
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span> {delivery.costTHB} THB
                        </div>
                        <div>
                          <span className="font-medium">Per Liter:</span> {delivery.costPerLiter} THB/L
                        </div>
                      </div>
                      {delivery.emergencyReason && (
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <span className="font-medium">Emergency Reason:</span> {delivery.emergencyReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                AI Water Management Alerts
              </CardTitle>
              <CardDescription>
                Intelligent alerts for frequent deliveries and infrastructure recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAlerts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active alerts found
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert: WaterDeliveryAlert) => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          <h3 className="font-semibold">{alert.alertTitle}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{alert.severity}</Badge>
                          {!alert.isAcknowledged && (
                            <Button
                              size="sm"
                              onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mb-3">{alert.alertMessage}</p>
                      <div className="bg-white/50 p-3 rounded text-sm">
                        <p className="font-medium">AI Recommendation:</p>
                        <p>{alert.recommendationAI}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                        <span>
                          {alert.triggerCount} deliveries in {alert.triggerPeriodDays} days
                        </span>
                        <span>Total cost: {alert.totalCost} THB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Suggestions Tab */}
        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Water Infrastructure Upgrade Suggestions
              </CardTitle>
              <CardDescription>
                AI-generated recommendations for long-term water management solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upgrade suggestions available
                </div>
              ) : (
                <div className="space-y-6">
                  {suggestions.map((suggestion: WaterUpgradeSuggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{suggestion.upgradeType.replace('_', ' ').toUpperCase()}</h3>
                          <Badge className={`${suggestion.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {suggestion.priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{suggestion.status}</Badge>
                          {suggestion.status === 'new' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reviewSuggestionMutation.mutate({ id: suggestion.id, status: 'approved' })}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reviewSuggestionMutation.mutate({ id: suggestion.id, status: 'rejected' })}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Current Issue</h4>
                          <p className="text-sm text-gray-600">{suggestion.currentIssue}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Suggested Solution</h4>
                          <p className="text-sm text-gray-600">{suggestion.suggestedSolution}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {parseInt(suggestion.estimatedCost).toLocaleString()} THB
                          </p>
                          <p className="text-sm text-gray-600">Estimated Cost</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {parseInt(suggestion.estimatedSavingsPerYear).toLocaleString()} THB
                          </p>
                          <p className="text-sm text-gray-600">Annual Savings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {suggestion.paybackPeriodMonths} months
                          </p>
                          <p className="text-sm text-gray-600">Payback Period</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Based on {suggestion.basedOnDeliveries} deliveries</span>
                        <span>Confidence: {(parseFloat(suggestion.confidenceScore) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Types Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Deliveries by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.deliveriesByType && analytics.deliveriesByType.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.deliveriesByType.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{item.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{item.count} deliveries</span>
                          <span className="font-semibold">{item.totalCost.toLocaleString()} THB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.monthlyTrend.slice(-6).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{item.month}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{item.deliveries} deliveries</span>
                          <span className="font-semibold">{item.cost.toLocaleString()} THB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No trend data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Water Delivery</DialogTitle>
            <DialogDescription>
              Update delivery information
            </DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedDelivery.status}
                  onValueChange={(value) => setSelectedDelivery(prev => prev ? ({ ...prev, status: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={selectedDelivery.paymentStatus}
                  onValueChange={(value) => setSelectedDelivery(prev => prev ? ({ ...prev, paymentStatus: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  placeholder="Add delivery notes..."
                  value={selectedDelivery.notes || ""}
                  onChange={(e) => setSelectedDelivery(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDelivery} disabled={updateDeliveryMutation.isPending}>
              {updateDeliveryMutation.isPending ? "Updating..." : "Update Delivery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}