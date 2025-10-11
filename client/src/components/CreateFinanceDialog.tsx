import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calendar,
  DollarSign,
  Receipt,
  User,
  Building,
  FileText,
  AlertCircle,
  Upload,
  Gift,
  CreditCard,
  Banknote,
  Building2
} from "lucide-react";

const financeFormSchema = z.object({
  type: z.string().min(1, "Type is required"),
  source: z.string().min(1, "Source is required"),
  sourceType: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().optional(),
  status: z.string().default("pending"),
  propertyId: z.string().optional(),
  bookingId: z.string().optional(),
  ownerId: z.string().optional(),
  agentId: z.string().optional(),
  referenceNumber: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.string().optional(),
});

interface CreateFinanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Financial source types with icons and descriptions
const financialSources = [
  {
    value: "guest-payment",
    label: "Guest Payment",
    icon: CreditCard,
    description: "Payment received from guests",
    color: "text-green-600",
  },
  {
    value: "owner-charge",
    label: "Owner Charge",
    icon: User,
    description: "Expense charged to property owner",
    color: "text-blue-600",
  },
  {
    value: "company-expense",
    label: "Company Expense",
    icon: Building2,
    description: "Business operational expense",
    color: "text-purple-600",
  },
  {
    value: "complimentary",
    label: "Complimentary",
    icon: Gift,
    description: "Complimentary service or gift",
    color: "text-orange-600",
  },
];

// Categories for different expense types
const financialCategories = {
  "booking-payment": "Booking Payment",
  "cleaning": "Cleaning Services",
  "maintenance": "Property Maintenance",
  "utilities": "Utilities",
  "electricity": "Electricity",
  "water": "Water",
  "gas": "Gas",
  "internet": "Internet/WiFi",
  "commission": "Agent Commission",
  "add-on-service": "Add-on Services",
  "massage": "Massage Services",
  "chef-service": "Chef Services",
  "transportation": "Transportation",
  "pool-service": "Pool Maintenance",
  "garden-service": "Garden Maintenance",
  "supplies": "Property Supplies",
  "repairs": "Repairs",
  "insurance": "Insurance",
  "management-fee": "Management Fee",
  "marketing": "Marketing/Advertising",
  "other": "Other",
};

export default function CreateFinanceDialog({ open, onOpenChange }: CreateFinanceDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComplimentaryType, setShowComplimentaryType] = useState(false);

  const form = useForm<z.infer<typeof financeFormSchema>>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      type: "expense",
      source: "",
      sourceType: "",
      category: "",
      subcategory: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      dueDate: "",
      status: "pending",
      propertyId: "",
      bookingId: "",
      ownerId: "",
      agentId: "",
      referenceNumber: "",
      isRecurring: false,
      recurringType: "",
    },
  });

  // Get properties for selection
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  // Get bookings for selection
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  const createFinanceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof financeFormSchema>) => {
      const financeData = {
        ...data,
        amount: parseFloat(data.amount),
        date: data.date, // Keep as YYYY-MM-DD format
        dueDate: data.dueDate || null,
        propertyId: data.propertyId ? parseInt(data.propertyId) : null,
        bookingId: data.bookingId ? parseInt(data.bookingId) : null,
        processedBy: (user as any)?.id,
        organizationId: (user as any)?.organizationId || "default-org",
        department: "administration", // Default department
        currency: "THB", // Default currency (Thailand Baht)
      };

      console.log("Creating finance record with data:", financeData);

      return await apiRequest("/api/finances", {
        method: "POST",
        body: JSON.stringify(financeData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: async () => {
      // Invalidate and refetch all finance-related queries to ensure instant data refresh
      await queryClient.invalidateQueries({ queryKey: ["/api/finances"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/finance"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/finance/analytics"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      await queryClient.refetchQueries({ queryKey: ["/api/finances"] });
      await queryClient.refetchQueries({ queryKey: ["/api/finance"] });
      await queryClient.refetchQueries({ queryKey: ["/api/finance/analytics"] });
      await queryClient.refetchQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Finance Record Created",
        description: "The financial record has been added successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to Create Record",
        description: "Please check all fields and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof financeFormSchema>) => {
    createFinanceMutation.mutate(data);
  };

  const selectedSource = form.watch("source");
  const selectedType = form.watch("type");

  // Show complimentary type selector when source is complimentary
  const handleSourceChange = (value: string) => {
    form.setValue("source", value);
    setShowComplimentaryType(value === "complimentary");
    if (value !== "complimentary") {
      form.setValue("sourceType", "");
    }
  };

  const getSourceIcon = (sourceValue: string) => {
    const source = financialSources.find(s => s.value === sourceValue);
    return source ? source.icon : DollarSign;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Create Financial Record
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Source Tracking Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium text-sm">Source & Traceability</h3>
              </div>

              {/* Financial Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Source *</FormLabel>
                    <Select onValueChange={handleSourceChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source of funds" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {financialSources.map((source) => {
                          const Icon = source.icon;
                          return (
                            <SelectItem key={source.value} value={source.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${source.color}`} />
                                <div>
                                  <div className="font-medium">{source.label}</div>
                                  <div className="text-xs text-muted-foreground">{source.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Complimentary Type (conditional) */}
              {showComplimentaryType && (
                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complimentary Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complimentary type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner-gift">Owner Gift</SelectItem>
                          <SelectItem value="company-gift">Company Gift</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Reference Number */}
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Invoice #, Receipt #, or external reference"
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="commission">Commission</SelectItem>
                        <SelectItem value="fee">Fee</SelectItem>
                        <SelectItem value="payout">Payout</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(financialCategories).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          type="date"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(properties as any[]).map((property) => (
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional details about this financial record..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source Summary */}
            {selectedSource && (
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getSourceIcon(selectedSource);
                    const source = financialSources.find(s => s.value === selectedSource);
                    return (
                      <>
                        <Icon className={`h-4 w-4 ${source?.color || 'text-blue-500'}`} />
                        <span className="font-medium text-sm">
                          Record will be tagged as: {source?.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Processed by: {(user as any)?.firstName} {(user as any)?.lastName} • {new Date().toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFinanceMutation.isPending}
                className="min-w-[100px]"
              >
                {createFinanceMutation.isPending ? "Creating..." : "Create Record"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}