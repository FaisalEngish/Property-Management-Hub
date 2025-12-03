import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Plus, 
  Upload, 
  AlertTriangle, 
  FileText, 
  Calendar,
  DollarSign,
  Zap,
  Droplets,
  Wifi,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

// Form schemas
const utilityAccountSchema = z.object({
  propertyId: z.number(),
  utilityType: z.enum(["electricity", "water", "internet", "gas"]),
  provider: z.string().min(1, "Provider is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  packageInfo: z.string().optional(),
  expectedBillDay: z.number().min(1).max(31),
});

const utilityBillSchema = z.object({
  propertyId: z.number(),
  utilityAccountId: z.number().optional(),
  type: z.enum(["electricity", "water", "internet", "gas"]),
  provider: z.string().optional(),
  accountNumber: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  dueDate: z.string().min(1, "Due date is required"),
  billPeriodStart: z.string().optional(),
  billPeriodEnd: z.string().optional(),
  billingMonth: z.string().min(1, "Billing month is required"),
  responsibleParty: z.enum(["owner", "company"]),
  notes: z.string().optional(),
});

type UtilityAccountForm = z.infer<typeof utilityAccountSchema>;
type UtilityBillForm = z.infer<typeof utilityBillSchema>;

const getUtilityIcon = (type: string) => {
  switch (type) {
    case "electricity": return <Zap className="h-4 w-4" />;
    case "water": return <Droplets className="h-4 w-4" />;
    case "internet": return <Wifi className="h-4 w-4" />;
    case "gas": return <Building className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "destructive";
    case "uploaded": return "secondary";
    case "paid": return "default";
    case "overdue": return "destructive";
    default: return "secondary";
  }
};

// [MERGED] This module has been consolidated into EnhancedUtilityTracker.tsx  
// Advanced utility tracking functionality is now integrated into the comprehensive utility management system
export default function UtilityTracking() {
  const [activeTab, setActiveTab] = useState("accounts");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: utilityAccounts } = useQuery({
    queryKey: ["/api/utility-accounts"],
  });

  const { data: utilityBills } = useQuery({
    queryKey: ["/api/utility-bills"],
  });

  const { data: overdueReminders } = useQuery({
    queryKey: ["/api/utility-reminders/overdue"],
  });

  // Forms
  const accountForm = useForm<UtilityAccountForm>({
    resolver: zodResolver(utilityAccountSchema),
    defaultValues: {
      expectedBillDay: 15,
    },
  });

  const billForm = useForm<UtilityBillForm>({
    resolver: zodResolver(utilityBillSchema),
    defaultValues: {
      responsibleParty: "owner",
      billingMonth: format(new Date(), "yyyy-MM"),
    },
  });

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: async (data: UtilityAccountForm) => {
      return await apiRequest("/api/utility-accounts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-accounts"] });
      accountForm.reset();
      toast({ title: "Utility account created successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to create utility account", variant: "destructive" });
    },
  });

  const createBillMutation = useMutation({
    mutationFn: async (data: UtilityBillForm) => {
      return await apiRequest("/api/utility-bills", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      billForm.reset();
      toast({ title: "Utility bill created successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to create utility bill", variant: "destructive" });
    },
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async ({ billId, file }: { billId: number; file: File }) => {
      const formData = new FormData();
      formData.append("receipt", file);
      return await apiRequest(`/api/utility-bills/${billId}/upload-receipt`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      toast({ title: "Receipt uploaded successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to upload receipt", variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utility Tracking & Billing</h1>
        <p className="text-muted-foreground">
          Manage property utility accounts, track bills, and automate reminders
        </p>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders && overdueReminders.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Overdue Utility Bills ({overdueReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueReminders.slice(0, 3).map((reminder: any) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <span className="font-medium">{reminder.utilityBill?.type}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Property {reminder.utilityBill?.propertyId}
                    </span>
                  </div>
                  <Badge variant="destructive">
                    {Math.ceil((new Date().getTime() - new Date(reminder.utilityBill?.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Utility Accounts</TabsTrigger>
          <TabsTrigger value="bills">Bill Management</TabsTrigger>
          <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
          <TabsTrigger value="history">Historical Logs</TabsTrigger>
        </TabsList>

        {/* Utility Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Utility Account</CardTitle>
                <CardDescription>
                  Set up utility provider details for properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit((data) => createAccountMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={accountForm.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {properties?.map((property: any) => (
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
                      control={accountForm.control}
                      name="utilityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Utility Type</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select utility type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="electricity">Electricity</SelectItem>
                              <SelectItem value="water">Water</SelectItem>
                              <SelectItem value="internet">Internet</SelectItem>
                              <SelectItem value="gas">Gas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Origin Energy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="packageInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Info (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Internet plan details, service package..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="expectedBillDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Bill Day</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="31" 
                              placeholder="15" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={createAccountMutation.isPending}>
                      <Plus className="h-4 w-4 mr-2" />
                      {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Accounts</CardTitle>
                <CardDescription>
                  Manage utility provider accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utilityAccounts?.map((account: any) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getUtilityIcon(account.utilityType)}
                        <div>
                          <div className="font-medium">{account.provider}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.utilityType} • Due: {account.expectedBillDay}th
                          </div>
                        </div>
                      </div>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bill Management Tab */}
        <TabsContent value="bills" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Utility Bill</CardTitle>
                <CardDescription>
                  Log expected utility bills for tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...billForm}>
                  <form onSubmit={billForm.handleSubmit((data) => createBillMutation.mutate(data))} className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={billForm.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {properties?.map((property: any) => (
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
                      control={billForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bill Type</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="electricity">Electricity</SelectItem>
                              <SelectItem value="water">Water</SelectItem>
                              <SelectItem value="internet">Internet</SelectItem>
                              <SelectItem value="gas">Gas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={billForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input placeholder="250.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={billForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={billForm.control}
                      name="billingMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Month</FormLabel>
                          <FormControl>
                            <Input type="month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={billForm.control}
                      name="responsibleParty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsible Party</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="owner">Owner Billable</SelectItem>
                              <SelectItem value="company">Company Billable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <Button type="submit" disabled={createBillMutation.isPending}>
                        <Plus className="h-4 w-4 mr-2" />
                        {createBillMutation.isPending ? "Creating..." : "Create Bill"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Bills</CardTitle>
                <CardDescription>
                  Bills awaiting receipt upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {utilityBills?.filter((bill: any) => bill.status === "pending").map((bill: any) => (
                      <TableRow key={bill.id}>
                        <TableCell>{bill.propertyId}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {getUtilityIcon(bill.type)}
                          {bill.type}
                        </TableCell>
                        <TableCell>${bill.amount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upload Receipt Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Bill Receipt</CardTitle>
              <CardDescription>
                Upload receipts for pending utility bills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {utilityBills?.filter((bill: any) => bill.status === "pending").map((bill: any) => (
                    <div key={bill.id} className="border rounded p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getUtilityIcon(bill.type)}
                          <span className="font-medium">{bill.type}</span>
                        </div>
                        <Badge variant={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Property {bill.propertyId} • ${bill.amount} • Due: {format(new Date(bill.dueDate), "MMM dd")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadReceiptMutation.mutate({ billId: bill.id, file });
                            }
                          }}
                        />
                        <Button size="sm" disabled={uploadReceiptMutation.isPending}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Logs Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utility Expense History</CardTitle>
              <CardDescription>
                Historical utility expenses by property and type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Period</TableHead>
                    <TableHead>Responsible Party</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utilityBills?.map((bill: any) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.propertyId}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getUtilityIcon(bill.type)}
                        {bill.type}
                      </TableCell>
                      <TableCell>{bill.provider}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {bill.amount}
                      </TableCell>
                      <TableCell>{bill.billingMonth}</TableCell>
                      <TableCell>
                        <Badge variant={bill.responsibleParty === "owner" ? "default" : "secondary"}>
                          {bill.responsibleParty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bill.receiptUrl ? (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">No receipt</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}