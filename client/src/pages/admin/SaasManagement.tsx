import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, Building2, Globe, Users, Settings, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SignupRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  country: string;
  website?: string;
  propertyCount?: number;
  businessType?: string;
  message?: string;
  requestedFeatures?: string[];
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface TenantOrganization {
  id: string;
  organizationId: string;
  companyName: string;
  subdomain: string;
  planType: string;
  status: "active" | "suspended" | "terminated";
  createdAt: string;
  maxProperties: number;
  maxUsers: number;
  features: string[];
  contactEmail: string;
}

export default function SaasManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);
  const [hostawayApiKey, setHostawayApiKey] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch signup requests
  const { data: signupRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/saas/signup-requests"],
  });

  // Fetch tenant organizations
  const { data: tenantOrgs = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ["/api/saas/tenant-organizations"],
  });

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, hostawayApiKey }: { requestId: string; hostawayApiKey: string }) => {
      return apiRequest(`/api/saas/signup-requests/${requestId}/approve`, "POST", { hostawayApiKey });
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "Environment provisioning has started. The client will receive login details shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saas/signup-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saas/tenant-organizations"] });
      setSelectedRequest(null);
      setHostawayApiKey("");
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      return apiRequest(`/api/saas/signup-requests/${requestId}/reject`, "POST", { reason });
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "The client has been notified of the rejection.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saas/signup-requests"] });
      setSelectedRequest(null);
      setRejectionReason("");
    },
  });

  // Update tenant status mutation
  const updateTenantStatusMutation = useMutation({
    mutationFn: async ({ organizationId, status }: { organizationId: string; status: string }) => {
      return apiRequest(`/api/saas/tenant-organizations/${organizationId}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Tenant organization status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saas/tenant-organizations"] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "active":
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "suspended":
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Suspended</Badge>;
      case "terminated":
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (planType: string) => {
    const colors = {
      basic: "bg-blue-100 text-blue-800",
      pro: "bg-purple-100 text-purple-800", 
      enterprise: "bg-amber-100 text-amber-800",
    };
    return <Badge className={colors[planType as keyof typeof colors] || ""}>{planType.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SaaS Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage signup requests and tenant organizations
          </p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Signup Requests
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Organizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Signup Requests</CardTitle>
              <CardDescription>
                Review and approve new management company requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : signupRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No signup requests found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signupRequests.map((request: SignupRequest) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{request.companyName}</div>
                            {request.website && (
                              <div className="text-sm text-gray-500">{request.website}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{request.contactName}</div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.country}</TableCell>
                        <TableCell>{request.propertyCount || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(request.submittedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Signup Request</DialogTitle>
                                  <DialogDescription>
                                    {request.companyName} - {request.contactName}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedRequest && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Company Name</Label>
                                        <p>{selectedRequest.companyName}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Contact Person</Label>
                                        <p>{selectedRequest.contactName}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Email</Label>
                                        <p>{selectedRequest.email}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Phone</Label>
                                        <p>{selectedRequest.phone || "N/A"}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Country</Label>
                                        <p>{selectedRequest.country}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Properties</Label>
                                        <p>{selectedRequest.propertyCount || "N/A"}</p>
                                      </div>
                                    </div>

                                    {selectedRequest.message && (
                                      <div>
                                        <Label className="font-semibold">Message</Label>
                                        <p className="mt-1 text-sm">{selectedRequest.message}</p>
                                      </div>
                                    )}

                                    {selectedRequest.requestedFeatures && selectedRequest.requestedFeatures.length > 0 && (
                                      <div>
                                        <Label className="font-semibold">Requested Features</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {selectedRequest.requestedFeatures.map(feature => (
                                            <Badge key={feature} variant="outline">{feature}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {selectedRequest.status === "pending" && (
                                      <div className="space-y-4 pt-4 border-t">
                                        <div>
                                          <Label htmlFor="hostawayApiKey">Hostaway API Key (Optional)</Label>
                                          <Input
                                            id="hostawayApiKey"
                                            value={hostawayApiKey}
                                            onChange={(e) => setHostawayApiKey(e.target.value)}
                                            placeholder="Enter Hostaway API key for integration"
                                          />
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <Button
                                            onClick={() => approveRequestMutation.mutate({
                                              requestId: selectedRequest.id,
                                              hostawayApiKey
                                            })}
                                            disabled={approveRequestMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve & Deploy
                                          </Button>

                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="destructive">
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Reject Request</DialogTitle>
                                                <DialogDescription>
                                                  Please provide a reason for rejection
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <Textarea
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  placeholder="Reason for rejection..."
                                                  rows={3}
                                                />
                                                <Button
                                                  onClick={() => rejectRequestMutation.mutate({
                                                    requestId: selectedRequest.id,
                                                    reason: rejectionReason
                                                  })}
                                                  disabled={!rejectionReason.trim() || rejectRequestMutation.isPending}
                                                  variant="destructive"
                                                  className="w-full"
                                                >
                                                  Confirm Rejection
                                                </Button>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
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

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Organizations</CardTitle>
              <CardDescription>
                Manage existing tenant organizations and their environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrgs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : tenantOrgs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No organizations found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantOrgs.map((org: TenantOrganization) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{org.companyName}</div>
                            <div className="text-sm text-gray-500">{org.contactEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            {org.subdomain}.hostpilotpro.com
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(org.planType)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{org.maxProperties} properties</div>
                            <div className="text-gray-500">{org.maxUsers} users</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(org.status)}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://${org.subdomain}.hostpilotpro.com`, '_blank')}
                            >
                              <Globe className="h-4 w-4 mr-1" />
                              Visit
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Settings className="h-4 w-4 mr-1" />
                                  Manage
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Manage Organization</DialogTitle>
                                  <DialogDescription>{org.companyName}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <Button
                                      onClick={() => updateTenantStatusMutation.mutate({
                                        organizationId: org.organizationId,
                                        status: org.status === "active" ? "suspended" : "active"
                                      })}
                                      variant={org.status === "active" ? "destructive" : "default"}
                                      disabled={updateTenantStatusMutation.isPending}
                                    >
                                      {org.status === "active" ? "Suspend" : "Activate"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
      </Tabs>
    </div>
  );
}