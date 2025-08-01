import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Hammer, 
  Plus, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit,
  Trash2,
  Calendar,
  User,
  Settings,
  FileText,
  Camera,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MaintenanceSuggestion {
  id: number;
  organizationId: string;
  propertyId: number;
  title: string;
  description: string;
  maintenanceType: 'repair' | 'replacement' | 'upgrade' | 'other';
  estimatedCost: number | null;
  currency: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  photoAttachments: string[] | null;
  paymentResponsibility: 'owner' | 'management' | 'shared' | 'guest';
  status: 'pending' | 'approved' | 'declined' | 'completed';
  submittedBy: string;
  submittedByRole: string;
  ownerResponse: string | null;
  ownerComments: string | null;
  ownerRespondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Property {
  id: number;
  name: string;
}

export default function MaintenanceSuggestionsApproval() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("suggestions");
  const [selectedSuggestion, setSelectedSuggestion] = useState<MaintenanceSuggestion | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalType, setApprovalType] = useState<'approve' | 'decline'>('approve');
  const [approvalComments, setApprovalComments] = useState('');

  // Form state for creating suggestions
  const [newSuggestion, setNewSuggestion] = useState({
    propertyId: '',
    title: '',
    description: '',
    maintenanceType: 'repair' as const,
    estimatedCost: '',
    currency: 'AUD',
    urgencyLevel: 'medium' as const,
    paymentResponsibility: 'owner' as const,
  });

  // Fetch maintenance suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/maintenance-suggestions"],
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch owner-specific suggestions for owner dashboard
  const { data: ownerSuggestions = [] } = useQuery({
    queryKey: ["/api/owner/maintenance-suggestions"],
    enabled: user?.role === 'owner',
  });

  // Fetch pending approvals for owners
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["/api/owner/pending-approvals"],
    enabled: user?.role === 'owner',
  });

  // Create suggestion mutation
  const createSuggestionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/maintenance-suggestions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-suggestions"] });
      setShowCreateDialog(false);
      setNewSuggestion({
        propertyId: '',
        title: '',
        description: '',
        maintenanceType: 'repair',
        estimatedCost: '',
        currency: 'AUD',
        urgencyLevel: 'medium',
        paymentResponsibility: 'owner',
      });
      toast({
        title: "Success",
        description: "Maintenance suggestion created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approval mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ id, type, comments }: { id: number; type: 'approve' | 'decline'; comments: string }) => {
      return apiRequest("POST", `/api/maintenance-suggestions/${id}/${type}`, { comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/maintenance-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/pending-approvals"] });
      setShowApprovalDialog(false);
      setApprovalComments('');
      toast({
        title: "Success",
        description: `Maintenance suggestion ${approvalType}d successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateSuggestion = () => {
    const data = {
      ...newSuggestion,
      propertyId: parseInt(newSuggestion.propertyId),
      estimatedCost: newSuggestion.estimatedCost ? parseFloat(newSuggestion.estimatedCost) : null,
    };
    createSuggestionMutation.mutate(data);
  };

  const handleApproval = (suggestion: MaintenanceSuggestion, type: 'approve' | 'decline') => {
    setSelectedSuggestion(suggestion);
    setApprovalType(type);
    setShowApprovalDialog(true);
  };

  const submitApproval = () => {
    if (selectedSuggestion) {
      approvalMutation.mutate({
        id: selectedSuggestion.id,
        type: approvalType,
        comments: approvalComments,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "warning",
      approved: "success",
      declined: "destructive",
      completed: "secondary",
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      low: "secondary",
      medium: "warning",
      high: "destructive",
      critical: "destructive",
    } as const;
    
    return (
      <Badge variant={variants[urgency as keyof typeof variants] || "default"}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      repair: <Hammer className="h-4 w-4" />,
      replacement: <Settings className="h-4 w-4" />,
      upgrade: <CheckCircle className="h-4 w-4" />,
      other: <FileText className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <Hammer className="h-4 w-4" />;
  };

  if (user?.role === 'owner') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Hammer className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Maintenance Approvals</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approvals ({pendingApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending maintenance suggestions requiring your approval.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingApprovals.map((suggestion: MaintenanceSuggestion) => (
                  <Card key={suggestion.id} className="border-l-4 border-l-amber-400">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(suggestion.maintenanceType)}
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          {getUrgencyBadge(suggestion.urgencyLevel)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(suggestion, 'approve')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(suggestion, 'decline')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{suggestion.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{suggestion.estimatedCost ? `${suggestion.currency} ${suggestion.estimatedCost}` : 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>By {suggestion.submittedByRole}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{suggestion.paymentResponsibility}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {ownerSuggestions.map((suggestion: MaintenanceSuggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(suggestion.maintenanceType)}
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        {getStatusBadge(suggestion.status)}
                        {getUrgencyBadge(suggestion.urgencyLevel)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSuggestion(suggestion);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                    <CardDescription>{suggestion.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion.estimatedCost ? `${suggestion.currency} ${suggestion.estimatedCost}` : 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>By {suggestion.submittedByRole}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{suggestion.paymentResponsibility}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Admin/PM view
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Hammer className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Maintenance Suggestions</h1>
        </div>
        {(user?.role === 'admin' || user?.role === 'portfolio-manager') && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Suggestion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Maintenance Suggestion</DialogTitle>
                <DialogDescription>
                  Submit a new maintenance suggestion for owner approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property">Property</Label>
                    <Select value={newSuggestion.propertyId} onValueChange={(value) => setNewSuggestion(prev => ({ ...prev, propertyId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Maintenance Type</Label>
                    <Select value={newSuggestion.maintenanceType} onValueChange={(value) => setNewSuggestion(prev => ({ ...prev, maintenanceType: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="replacement">Replacement</SelectItem>
                        <SelectItem value="upgrade">Upgrade</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newSuggestion.title}
                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the maintenance needed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSuggestion.description}
                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the maintenance work needed..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Estimated Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newSuggestion.estimatedCost}
                      onChange={(e) => setNewSuggestion(prev => ({ ...prev, estimatedCost: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select value={newSuggestion.urgencyLevel} onValueChange={(value) => setNewSuggestion(prev => ({ ...prev, urgencyLevel: value as any }))}>
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
                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Responsibility</Label>
                    <Select value={newSuggestion.paymentResponsibility} onValueChange={(value) => setNewSuggestion(prev => ({ ...prev, paymentResponsibility: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSuggestion} disabled={createSuggestionMutation.isPending}>
                  {createSuggestionMutation.isPending ? "Creating..." : "Create Suggestion"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {suggestionsLoading ? (
          <div className="text-center py-8">Loading suggestions...</div>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Hammer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No maintenance suggestions found.</p>
                {(user?.role === 'admin' || user?.role === 'portfolio-manager') && (
                  <p className="text-sm mt-2">Create your first suggestion to get started.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          suggestions.map((suggestion: MaintenanceSuggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(suggestion.maintenanceType)}
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    {getStatusBadge(suggestion.status)}
                    {getUrgencyBadge(suggestion.urgencyLevel)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    {(user?.role === 'admin' || user?.role === 'portfolio-manager') && (
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>{suggestion.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion.estimatedCost ? `${suggestion.currency} ${suggestion.estimatedCost}` : 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>By {suggestion.submittedByRole}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{suggestion.paymentResponsibility}</Badge>
                  </div>
                </div>
                {suggestion.ownerComments && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">Owner Response:</span>
                    </div>
                    <p className="text-sm">{suggestion.ownerComments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalType === 'approve' ? 'Approve' : 'Decline'} Maintenance Suggestion
            </DialogTitle>
            <DialogDescription>
              {approvalType === 'approve' 
                ? 'Approving this suggestion will create a maintenance task.' 
                : 'Please provide a reason for declining this suggestion.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder={approvalType === 'approve' ? 'Optional approval notes...' : 'Please explain why this suggestion is being declined...'}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitApproval} 
              disabled={approvalMutation.isPending}
              variant={approvalType === 'approve' ? 'default' : 'destructive'}
            >
              {approvalMutation.isPending ? "Processing..." : (approvalType === 'approve' ? 'Approve' : 'Decline')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Maintenance Suggestion Details</DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedSuggestion.maintenanceType)}
                    <span className="capitalize">{selectedSuggestion.maintenanceType}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedSuggestion.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Urgency</Label>
                  <div className="mt-1">
                    {getUrgencyBadge(selectedSuggestion.urgencyLevel)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Cost</Label>
                  <p className="mt-1">
                    {selectedSuggestion.estimatedCost 
                      ? `${selectedSuggestion.currency} ${selectedSuggestion.estimatedCost}` 
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm">{selectedSuggestion.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Payment Responsibility</Label>
                <Badge variant="outline" className="mt-1">
                  {selectedSuggestion.paymentResponsibility}
                </Badge>
              </div>
              {selectedSuggestion.ownerComments && (
                <div>
                  <Label className="text-sm font-medium">Owner Response</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedSuggestion.ownerComments}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Responded on {new Date(selectedSuggestion.ownerRespondedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}