import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, Minus, Receipt, DollarSign, Clock, TrendingUp, AlertCircle, Coffee, Car, Wrench, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

export default function StaffWalletPettyCash() {
  const { formatWithConversion } = useCurrency();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isClearBalanceOpen, setIsClearBalanceOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for cash collection
  const cashForm = useForm({
    defaultValues: {
      amount: "",
      source: "",
      guestName: "",
      property: "",
      notes: "",
      receiptPhoto: ""
    }
  });

  // Form for expenses
  const expenseForm = useForm({
    defaultValues: {
      amount: "",
      description: "",
      category: "",
      property: "",
      receipt: "",
      receiptPhoto: ""
    }
  });

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, formType: 'cash' | 'expense') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (formType === 'cash') {
          cashForm.setValue("receiptPhoto", base64);
        } else {
          expenseForm.setValue("receiptPhoto", base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch wallet data from backend
  const { data: walletData, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ["/api/staff-wallet/staff-pool"],
    enabled: true,
    retry: 3,
    staleTime: 30000 // 30 seconds
  });

  // Fetch transactions from backend
  const { data: recentTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/staff-wallet/staff-pool/transactions"],
    enabled: true,
    retry: 3,
    staleTime: 30000 // 30 seconds
  });

  const expenseCategories = [
    { value: "transport", label: "Transport & Fuel", icon: Car },
    { value: "supplies", label: "Office Supplies", icon: ShoppingCart },
    { value: "maintenance", label: "Emergency Repairs", icon: Wrench },
    { value: "meals", label: "Staff Meals", icon: Coffee },
    { value: "other", label: "Other Expenses", icon: Receipt }
  ];

  const addExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/staff-wallet/staff-pool/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add expense');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Expense added successfully" });
      setIsAddExpenseOpen(false);
      expenseForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet/staff-pool"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet/staff-pool/transactions"] });
    }
  });

  const addIncomeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/staff-wallet/staff-pool/cash-income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record cash collection');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Cash collection recorded" });
      setIsAddIncomeOpen(false);
      cashForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet/staff-pool"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet/staff-pool/transactions"] });
    }
  });

  const clearBalanceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/staff-wallet/staff-pool/clear-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear balance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Balance cleared and reset to base petty cash amount" });
      setIsClearBalanceOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet/staff-pool"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet/staff-pool/transactions"] });
    }
  });

  // Handle loading and error states
  if (walletLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wallet & Petty Cash</h1>
            <p className="text-gray-600">Loading your wallet data...</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Wallet className="w-4 h-4 mr-1" />
            Staff Wallet
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wallet & Petty Cash</h1>
            <p className="text-red-600">Error loading wallet data. Please try again.</p>
          </div>
          <Badge variant="outline" className="text-red-600 border-red-200">
            <AlertCircle className="w-4 h-4 mr-1" />
            Error
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Wallet & Petty Cash</h1>
          <p className="text-gray-600">Manage your petty cash, expenses, and cash collections</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Wallet className="w-4 h-4 mr-1" />
          Staff Wallet
        </Badge>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatWithConversion(walletData?.currentBalance || 0)}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Base Petty Cash</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatWithConversion(walletData?.basePettyCash || 5000)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cash Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  +{formatWithConversion(walletData?.totalCollected || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  -{formatWithConversion(walletData?.totalExpenses || 0)}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Cash Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Cash Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={cashForm.handleSubmit((data) => addIncomeMutation.mutate(data))} className="space-y-4">
              <div>
                <Label>Amount Collected (THB)</Label>
                <Input 
                  type="number" 
                  placeholder="Enter amount"
                  {...cashForm.register("amount", { required: true })}
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select onValueChange={(value) => cashForm.setValue("source", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkout_electric">Check-out - Electricity Payment</SelectItem>
                    <SelectItem value="checkout_deposit">Check-out - Deposit Collection</SelectItem>
                    <SelectItem value="checkout_damages">Check-out - Damage Charges</SelectItem>
                    <SelectItem value="service_payment">Service Payment</SelectItem>
                    <SelectItem value="other">Other Cash Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Guest Name</Label>
                <Input 
                  placeholder="Enter guest name"
                  {...cashForm.register("guestName")}
                />
              </div>
              <div>
                <Label>Property</Label>
                <Select onValueChange={(value) => cashForm.setValue("property", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Villa Aruna">Villa Aruna</SelectItem>
                    <SelectItem value="Villa Samui Breeze">Villa Samui Breeze</SelectItem>
                    <SelectItem value="Villa Paradise">Villa Paradise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Additional details..."
                  {...cashForm.register("notes")}
                />
              </div>
              <div>
                <Label>Receipt Photo (Optional)</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, 'cash')}
                />
                <p className="text-xs text-gray-500 mt-1">Upload receipt photo or proof of collection</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsAddIncomeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addIncomeMutation.isPending}>
                  {addIncomeMutation.isPending ? "Recording..." : "Record Collection"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Minus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={expenseForm.handleSubmit((data) => addExpenseMutation.mutate(data))} className="space-y-4">
              <div>
                <Label>Amount Spent (THB)</Label>
                <Input 
                  type="number" 
                  placeholder="Enter amount"
                  {...expenseForm.register("amount", { required: true })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select onValueChange={(value) => expenseForm.setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  placeholder="What was purchased/paid for?"
                  {...expenseForm.register("description", { required: true })}
                />
              </div>
              <div>
                <Label>Property</Label>
                <Select onValueChange={(value) => expenseForm.setValue("property", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Villa Aruna">Villa Aruna</SelectItem>
                    <SelectItem value="Villa Samui Breeze">Villa Samui Breeze</SelectItem>
                    <SelectItem value="Villa Paradise">Villa Paradise</SelectItem>
                    <SelectItem value="NA">N/A - General Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Receipt Number/Details (Optional)</Label>
                <Input 
                  placeholder="Receipt number or store details"
                  {...expenseForm.register("receipt")}
                />
              </div>
              <div>
                <Label>Receipt Photo (Optional)</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, 'expense')}
                />
                <p className="text-xs text-gray-500 mt-1">Upload receipt photo for expense verification</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsAddExpenseOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addExpenseMutation.isPending}>
                  {addExpenseMutation.isPending ? "Recording..." : "Record Expense"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isClearBalanceOpen} onOpenChange={setIsClearBalanceOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              <AlertCircle className="w-4 h-4 mr-2" />
              Clear Balance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Wallet Balance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  This will clear your current balance and reset your wallet to the base petty cash amount of {formatWithConversion(walletData.basePettyCash)}.
                </p>
                <p className="text-sm text-orange-600 mt-2 font-medium">
                  Current balance: {formatWithConversion(walletData.currentBalance)} → {formatWithConversion(walletData.basePettyCash)}
                </p>
              </div>
              <div>
                <Label>Reason for clearing</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end_of_day">End of day clearing</SelectItem>
                    <SelectItem value="bank_deposit">Depositing excess cash</SelectItem>
                    <SelectItem value="handover">Shift handover</SelectItem>
                    <SelectItem value="audit">Audit requirement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes about the clearing..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsClearBalanceOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => clearBalanceMutation.mutate()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Clear Balance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No transactions yet</p>
                <p className="text-sm">Add an expense or record cash collection to see transactions here</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <Plus className={`w-5 h-5 text-green-600`} />
                    ) : (
                      <Minus className={`w-5 h-5 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                    {transaction.guestName && (
                      <p className="text-xs text-blue-600">
                        {transaction.guestName} • {transaction.propertyName}
                      </p>
                    )}
                    {transaction.receipt && (
                      <p className="text-xs text-gray-500">Receipt: {transaction.receipt}</p>
                    )}
                    {transaction.receiptPhoto && (
                      <p className="text-xs text-blue-600">📸 Photo attached</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatWithConversion(transaction.amount)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}