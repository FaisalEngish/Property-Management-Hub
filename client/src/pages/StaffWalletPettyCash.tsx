import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { formatCurrency } from "@/lib/currency";

export default function StaffWalletPettyCash() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isClearBalanceOpen, setIsClearBalanceOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for staff wallet
  const walletData = {
    currentBalance: 6750, // 5000 base + 1750 from recent check-out
    basePettyCash: 5000,
    totalCollected: 2500, // Cash collected from check-outs
    totalExpenses: 750,   // Expenses paid
    lastCleared: "2025-01-22",
    staffName: "Niran Thepsiri",
    staffId: "staff-pool"
  };

  const recentTransactions = [
    {
      id: 1,
      type: "income",
      amount: 1750,
      description: "Check-out cash collection - Villa Aruna electricity",
      category: "checkout_cash",
      date: "2025-01-23 14:30",
      guestName: "John Smith",
      propertyName: "Villa Aruna"
    },
    {
      id: 2,
      type: "expense",
      amount: 450,
      description: "Gasoline for property visits",
      category: "transport",
      date: "2025-01-23 10:15",
      receipt: "Receipt-GAS-001.jpg"
    },
    {
      id: 3,
      type: "income",
      amount: 750,
      description: "Check-out cash collection - Villa Breeze deposit return",
      category: "checkout_cash",
      date: "2025-01-22 16:45",
      guestName: "Sarah Wilson",
      propertyName: "Villa Breeze"
    },
    {
      id: 4,
      type: "expense",
      amount: 300,
      description: "Office supplies and cleaning materials",
      category: "supplies",
      date: "2025-01-22 11:30",
      receipt: "Receipt-SUP-002.jpg"
    }
  ];

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
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet"] });
    }
  });

  const addIncomeMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock API call
      return { success: true, data };
    },
    onSuccess: () => {
      toast({ title: "Cash collection recorded" });
      setIsAddIncomeOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet"] });
    }
  });

  const clearBalanceMutation = useMutation({
    mutationFn: async () => {
      // Mock API call to clear balance and reset to base petty cash
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Balance cleared and reset to base petty cash amount" });
      setIsClearBalanceOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff-wallet"] });
    }
  });

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
                  {formatCurrency(walletData.currentBalance)}
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
                  {formatCurrency(walletData.basePettyCash)}
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
                  +{formatCurrency(walletData.totalCollected)}
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
                  -{formatCurrency(walletData.totalExpenses)}
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
            <div className="space-y-4">
              <div>
                <Label>Amount Collected (THB)</Label>
                <Input type="number" placeholder="Enter amount" />
              </div>
              <div>
                <Label>Source</Label>
                <Select>
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
                <Input placeholder="Enter guest name" />
              </div>
              <div>
                <Label>Property</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="villa-aruna">Villa Aruna</SelectItem>
                    <SelectItem value="villa-breeze">Villa Samui Breeze</SelectItem>
                    <SelectItem value="villa-paradise">Villa Paradise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Additional details..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddIncomeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => addIncomeMutation.mutate({})}>
                  Record Collection
                </Button>
              </div>
            </div>
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
            <div className="space-y-4">
              <div>
                <Label>Amount Spent (THB)</Label>
                <Input type="number" placeholder="Enter amount" />
              </div>
              <div>
                <Label>Category</Label>
                <Select>
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
                <Textarea placeholder="What was purchased/paid for?" />
              </div>
              <div>
                <Label>Receipt (Optional)</Label>
                <Input type="file" accept="image/*,.pdf" />
                <p className="text-xs text-gray-500 mt-1">Upload receipt photo or PDF</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => addExpenseMutation.mutate({})}>
                  Record Expense
                </Button>
              </div>
            </div>
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
                  This will clear your current balance and reset your wallet to the base petty cash amount of {formatCurrency(walletData.basePettyCash)}.
                </p>
                <p className="text-sm text-orange-600 mt-2 font-medium">
                  Current balance: {formatCurrency(walletData.currentBalance)} → {formatCurrency(walletData.basePettyCash)}
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
            {recentTransactions.map((transaction) => (
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
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}