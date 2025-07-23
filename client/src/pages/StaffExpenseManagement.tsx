import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, CheckCircle, Clock, Building, User, Receipt, AlertCircle, DollarSign, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";

export default function StaffExpenseManagement() {
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for staff expenses pending review
  const pendingExpenses = [
    {
      id: 1,
      staffName: "Niran Thepsiri",
      staffId: "staff-pool",
      amount: 450,
      description: "Gasoline for property visits",
      category: "transport",
      date: "2025-01-23",
      time: "10:15",
      receipt: "receipt-gas-001.jpg",
      status: "pending_review",
      suggestedProperty: "villa-aruna", // AI suggestion based on location/context
      suggestedCategory: "company_expense" // AI suggestion
    },
    {
      id: 2,
      staffName: "Somchai Jaidee",
      staffId: "staff-maintenance",
      amount: 850,
      description: "Emergency plumbing supplies for villa repair",
      category: "maintenance",
      date: "2025-01-23",
      time: "14:30",
      receipt: "receipt-plumbing-002.jpg",
      status: "pending_review",
      suggestedProperty: "villa-breeze",
      suggestedCategory: "billed_to_owner"
    },
    {
      id: 3,
      staffName: "Apinya Khamchong",
      staffId: "staff-guest-services",
      amount: 300,
      description: "Guest welcome snacks and beverages",
      category: "supplies",
      date: "2025-01-23",
      time: "16:00",
      receipt: "receipt-snacks-003.jpg",
      status: "pending_review",
      suggestedProperty: "villa-paradise",
      suggestedCategory: "billed_to_guest"
    }
  ];

  const reviewedExpenses = [
    {
      id: 4,
      staffName: "Wichai Suwanapong",
      amount: 200,
      description: "Security patrol fuel",
      category: "transport",
      date: "2025-01-22",
      finalCategory: "company_expense",
      property: null,
      reviewedBy: "Admin",
      reviewDate: "2025-01-23 09:00",
      status: "approved"
    },
    {
      id: 5,
      staffName: "Niran Thepsiri",
      amount: 1250,
      description: "Pool chemical supplies",
      category: "maintenance",
      date: "2025-01-22",
      finalCategory: "billed_to_owner",
      property: "villa-aruna",
      reviewedBy: "Property Manager",
      reviewDate: "2025-01-23 08:30",
      status: "approved"
    }
  ];

  const properties = [
    { value: "villa-aruna", label: "Villa Aruna" },
    { value: "villa-breeze", label: "Villa Samui Breeze" },
    { value: "villa-paradise", label: "Villa Paradise" },
    { value: "villa-charm", label: "Villa Balinese Charm" }
  ];

  const expenseCategories = [
    { value: "company_expense", label: "Company Expense", color: "blue", description: "General business cost" },
    { value: "billed_to_guest", label: "Billed to Guest", color: "green", description: "Guest should be charged" },
    { value: "billed_to_owner", label: "Billed to Owner", color: "orange", description: "Property owner responsibility" }
  ];

  const reviewExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/staff-expenses/${selectedExpense?.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to review expense');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Expense reviewed and categorized successfully" });
      setIsReviewDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff-expenses"] });
    }
  });

  const handleReviewExpense = (expense: any) => {
    setSelectedExpense(expense);
    setIsReviewDialogOpen(true);
  };

  const getTotalPending = () => {
    return pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalByCategory = (category: string) => {
    return reviewedExpenses
      .filter(expense => expense.finalCategory === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Expense Management</h1>
          <p className="text-gray-600">Review and categorize staff petty cash expenses</p>
        </div>
        <Badge variant="outline" className="text-red-600 border-red-200">
          <AlertCircle className="w-4 h-4 mr-1" />
          {pendingExpenses.length} Pending Review
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(getTotalPending())}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Company Expenses</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(getTotalByCategory('company_expense'))}
                </p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Guest Billable</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(getTotalByCategory('billed_to_guest'))}
                </p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Owner Billable</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(getTotalByCategory('billed_to_owner'))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Review ({pendingExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Reviewed ({reviewedExpenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Expenses Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending expenses to review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingExpenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{expense.description}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {expense.staffName}
                              </span>
                              <span>
                                {expense.date} at {expense.time}
                              </span>
                              <span className="text-blue-600">
                                Category: {expense.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm mt-1">
                              <Badge variant="outline" className="text-blue-600">
                                AI Suggests: {properties.find(p => p.value === expense.suggestedProperty)?.label || 'Company-wide'}
                              </Badge>
                              <Badge variant="outline" className="text-green-600">
                                Category: {expenseCategories.find(c => c.value === expense.suggestedCategory)?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(expense.amount)}
                          </p>
                          <Button 
                            onClick={() => handleReviewExpense(expense)}
                            className="mt-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review & Categorize
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Reviewed & Categorized Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewedExpenses.map((expense) => (
                  <div key={expense.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{expense.description}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {expense.staffName}
                            </span>
                            <span>{expense.date}</span>
                            <span>Reviewed by: {expense.reviewedBy}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-1">
                            <Badge 
                              variant="outline" 
                              className={`${
                                expense.finalCategory === 'company_expense' ? 'text-blue-600 border-blue-200' :
                                expense.finalCategory === 'billed_to_guest' ? 'text-green-600 border-green-200' :
                                'text-orange-600 border-orange-200'
                              }`}
                            >
                              {expenseCategories.find(c => c.value === expense.finalCategory)?.label}
                            </Badge>
                            {expense.property && (
                              <Badge variant="outline" className="text-purple-600">
                                <Building className="w-3 h-3 mr-1" />
                                {properties.find(p => p.value === expense.property)?.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(expense.amount)}
                        </p>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Approved
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Expense Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review & Categorize Expense</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-6">
              {/* Expense Details */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Staff Member</Label>
                    <p className="font-semibold">{selectedExpense.staffName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Amount</Label>
                    <p className="font-semibold text-green-600">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Date & Time</Label>
                    <p className="font-semibold">{selectedExpense.date} at {selectedExpense.time}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Category</Label>
                    <p className="font-semibold">{selectedExpense.category}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-600">Description</Label>
                    <p className="font-semibold">{selectedExpense.description}</p>
                  </div>
                  {selectedExpense.receipt && (
                    <div className="col-span-2">
                      <Label className="text-sm text-gray-600">Receipt</Label>
                      <p className="text-blue-600 text-sm">{selectedExpense.receipt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">AI Recommendations</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-blue-600">Suggested Property</Label>
                    <p>{properties.find(p => p.value === selectedExpense.suggestedProperty)?.label || 'Company-wide'}</p>
                  </div>
                  <div>
                    <Label className="text-blue-600">Suggested Category</Label>
                    <p>{expenseCategories.find(c => c.value === selectedExpense.suggestedCategory)?.label}</p>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <Label>Expense Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="How should this expense be categorized?" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                            <span>{category.label}</span>
                            <span className="text-xs text-gray-500">({category.description})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assign to Property (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property or leave blank for company-wide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Company-wide (No specific property)</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.value} value={property.value}>
                          {property.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Review Notes</Label>
                  <Textarea 
                    placeholder="Add any notes about this expense categorization..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => reviewExpenseMutation.mutate({})}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Categorize
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}