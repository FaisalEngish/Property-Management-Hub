import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  Filter, 
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  FileText
} from "lucide-react";

const requestPayoutSchema = z.object({
  propertyId: z.string().optional(),
  requestedAmount: z.string().min(1, "Amount is required"),
  requestNotes: z.string().optional(),
  periodStartDate: z.string().min(1, "Start date is required"),
  periodEndDate: z.string().min(1, "End date is required"),
});

export default function Payouts() {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: ownerPayouts = [] } = useQuery({
    queryKey: ["/api/owner-payouts"],
  });

  // Get owner balance data
  const { data: ownerBalance } = useQuery({
    queryKey: ["/api/owner-balance", selectedOwner, selectedProperty],
    enabled: !!selectedOwner,
  });

  const { data: ownerPayoutsFiltered = [] } = useQuery({
    queryKey: ["/api/owner-payouts", { ownerId: selectedOwner }],
    enabled: !!selectedOwner,
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (data: z.infer<typeof requestPayoutSchema>) => {
      return await apiRequest("/api/owner-payouts", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          ownerId: selectedOwner,
          propertyId: data.propertyId ? parseInt(data.propertyId) : null,
          currency: "USD",
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner-balance"] });
      setIsRequestDialogOpen(false);
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted for approval.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payout request",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      return await apiRequest(`/api/owner-payouts/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ approvalNotes: notes }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-payouts"] });
      toast({
        title: "Payout Approved",
        description: "The payout request has been approved.",
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, paymentMethod, paymentReference }: { id: number; paymentMethod: string; paymentReference?: string }) => {
      return await apiRequest(`/api/owner-payouts/${id}/mark-paid`, {
        method: "PATCH",
        body: JSON.stringify({ paymentMethod, paymentReference }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-payouts"] });
      toast({
        title: "Payment Recorded",
        description: "The payout has been marked as paid.",
      });
    },
  });

  const confirmReceivedMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/owner-payouts/${id}/confirm-received`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner-payouts"] });
      toast({
        title: "Payment Confirmed",
        description: "You have confirmed receipt of the payment.",
      });
    },
  });

  const form = useForm<z.infer<typeof requestPayoutSchema>>({
    resolver: zodResolver(requestPayoutSchema),
    defaultValues: {
      propertyId: "",
      requestedAmount: "",
      requestNotes: "",
      periodStartDate: "",
      periodEndDate: "",
    },
  });

  const onSubmit = (data: z.infer<typeof requestPayoutSchema>) => {
    requestPayoutMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
      paid: { variant: "default" as const, icon: DollarSign, label: "Paid" },
      completed: { variant: "default" as const, icon: CheckCircle, label: "Completed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const owners = users.filter((u: any) => u.role === 'owner');

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Owner Balance & Payouts</h1>
            </div>

            {/* Owner Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select owner to view balance" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((owner: any) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.firstName} {owner.lastName} ({owner.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All properties</SelectItem>
                      {properties
                        .filter((p: any) => !selectedOwner || p.ownerId === selectedOwner)
                        .map((property: any) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {selectedOwner && ownerBalance && (
              <>
                {/* Balance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ${ownerBalance.totalIncome?.toFixed(2) || '0.00'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        ${ownerBalance.totalExpenses?.toFixed(2) || '0.00'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Commission Deductions</CardTitle>
                      <DollarSign className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        ${ownerBalance.commissionDeductions?.toFixed(2) || '0.00'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        ${ownerBalance.pendingPayouts?.toFixed(2) || '0.00'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        ${(ownerBalance.netBalance - ownerBalance.pendingPayouts)?.toFixed(2) || '0.00'}
                      </div>
                      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="mt-2 w-full" 
                            size="sm"
                            disabled={!ownerBalance.netBalance || ownerBalance.netBalance <= ownerBalance.pendingPayouts}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Request Payout
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Request Payout</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="propertyId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Property (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select property or leave blank for all" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="">All properties</SelectItem>
                                        {properties
                                          .filter((p: any) => p.ownerId === selectedOwner)
                                          .map((property: any) => (
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
                                name="requestedAmount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Requested Amount ($)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        placeholder="0.00" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="periodStartDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Period Start</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="periodEndDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Period End</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="requestNotes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Add any additional notes for this payout request..." 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsRequestDialogOpen(false)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={requestPayoutMutation.isPending}
                                  className="flex-1"
                                >
                                  {requestPayoutMutation.isPending ? "Submitting..." : "Submit Request"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>

                {/* Payout History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ownerPayoutsFiltered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500">
                              No payout requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          ownerPayoutsFiltered.map((payout: any) => (
                            <TableRow key={payout.id}>
                              <TableCell>
                                {new Date(payout.requestDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="font-medium">
                                ${parseFloat(payout.requestedAmount).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {payout.periodStartDate && payout.periodEndDate ? 
                                  `${payout.periodStartDate} to ${payout.periodEndDate}` : 
                                  'N/A'
                                }
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(payout.status)}
                              </TableCell>
                              <TableCell>
                                {payout.paymentDate ? 
                                  new Date(payout.paymentDate).toLocaleDateString() : 
                                  '-'
                                }
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {payout.status === 'pending' && user?.role === 'admin' && (
                                    <Button
                                      size="sm"
                                      onClick={() => approveMutation.mutate({ id: payout.id })}
                                      disabled={approveMutation.isPending}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {payout.status === 'approved' && user?.role === 'admin' && (
                                    <Button
                                      size="sm"
                                      onClick={() => markPaidMutation.mutate({ 
                                        id: payout.id, 
                                        paymentMethod: 'bank_transfer' 
                                      })}
                                      disabled={markPaidMutation.isPending}
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                  {payout.status === 'paid' && payout.ownerId === user?.id && (
                                    <Button
                                      size="sm"
                                      onClick={() => confirmReceivedMutation.mutate(payout.id)}
                                      disabled={confirmReceivedMutation.isPending}
                                    >
                                      Confirm Received
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}

            {!selectedOwner && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select an Owner
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Choose an owner from the dropdown above to view their balance details and payout history.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}