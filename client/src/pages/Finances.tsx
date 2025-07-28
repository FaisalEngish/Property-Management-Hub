import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import TopBar from "@/components/TopBar";
import CreateFinanceDialog from "@/components/CreateFinanceDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  User, 
  CreditCard, 
  Gift, 
  Building2,
  Calendar,
  Filter,
  Search,
  FileText,
  Eye
} from "lucide-react";

// Source type mappings with icons and colors
const sourceConfig = {
  "guest-payment": {
    label: "Guest Payment",
    icon: CreditCard,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  "owner-charge": {
    label: "Owner Charge",
    icon: User,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  "company-expense": {
    label: "Company Expense",
    icon: Building2,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  "complimentary": {
    label: "Complimentary",
    icon: Gift,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
};

const statusConfig = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

// [MERGED] This module has been consolidated into FinanceEngine.tsx and FinancialToolkit.tsx
// Basic financial functionality is now available in the comprehensive financial management system
export default function Finances() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterSource, setFilterSource] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: finances = [] } = useQuery({
    queryKey: ["/api/finances"],
  });

  // Filter finances based on search and filters
  const filteredFinances = (finances as any[]).filter((finance) => {
    const matchesSearch = !searchTerm || 
      finance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finance.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finance.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filterSource === "all" || finance.source === filterSource;
    const matchesType = filterType === "all" || finance.type === filterType;
    
    return matchesSearch && matchesSource && matchesType;
  });

  // Calculate summary stats by source
  const summaryBySource = Object.keys(sourceConfig).reduce((acc, source) => {
    const sourceFinances = (finances as any[]).filter(f => f.source === source);
    const income = sourceFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
    const expenses = sourceFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
    
    acc[source] = { income, expenses, net: income - expenses, count: sourceFinances.length };
    return acc;
  }, {} as Record<string, { income: number; expenses: number; net: number; count: number }>);

  // Overall totals
  const totalRevenue = (finances as any[])
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);

  const totalExpenses = (finances as any[])
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);

  const totalCommissions = (finances as any[])
    .filter(f => f.type === 'commission')
    .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex bg-background">

      
      <div className="flex-1 flex flex-col">
        <TopBar 
          title="Admin's Financial Dashboard" 
          subtitle="Track income, expenses, and source attribution"
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          action={
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          }
        />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">All income sources</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">All expense categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalRevenue - totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">Revenue minus expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
                <Receipt className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCommissions)}</div>
                <p className="text-xs text-muted-foreground">Agent commissions</p>
              </CardContent>
            </Card>
          </div>

          {/* Source-based Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Breakdown by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(sourceConfig).map(([sourceKey, config]) => {
                  const Icon = config.icon;
                  const data = summaryBySource[sourceKey] || { income: 0, expenses: 0, net: 0, count: 0 };
                  
                  return (
                    <div key={sourceKey} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{config.label}</span>
                        <Badge variant="secondary" className="text-xs">{data.count}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Income:</span>
                          <span className="font-medium">{formatCurrency(data.income)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Expenses:</span>
                          <span className="font-medium">{formatCurrency(data.expenses)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                          <span>Net:</span>
                          <span className={data.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(data.net)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Financial Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by description, category, or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {Object.entries(sourceConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Financial Records Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFinances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No financial records found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFinances.map((finance) => {
                        const sourceConf = sourceConfig[finance.source as keyof typeof sourceConfig];
                        const SourceIcon = sourceConf?.icon || Receipt;
                        
                        return (
                          <TableRow key={finance.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(finance.date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <SourceIcon className="h-4 w-4" />
                                <Badge className={sourceConf?.color || ""}>
                                  {sourceConf?.label || finance.source}
                                </Badge>
                                {finance.sourceType && (
                                  <Badge variant="outline" className="text-xs">
                                    {finance.sourceType === 'owner-gift' ? 'Owner Gift' : 'Company Gift'}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {finance.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {finance.category}
                              {finance.subcategory && (
                                <div className="text-xs text-muted-foreground">
                                  {finance.subcategory}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${
                                finance.type === 'income' ? 'text-green-600' : 
                                finance.type === 'expense' ? 'text-red-600' : 
                                'text-blue-600'
                              }`}>
                                {finance.type === 'expense' ? '-' : '+'}{formatCurrency(parseFloat(finance.amount))}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig[finance.status as keyof typeof statusConfig] || ""}>
                                {finance.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {finance.referenceNumber && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm font-mono">{finance.referenceNumber}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="text-sm truncate">
                                  {finance.description || "No description"}
                                </div>
                                {finance.processedBy && (
                                  <div className="text-xs text-muted-foreground">
                                    Processed by: {finance.processedByUser?.firstName} {finance.processedByUser?.lastName}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredFinances.length > 0 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredFinances.length} of {(finances as any[]).length} records
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Total displayed: {formatCurrency(
                      filteredFinances.reduce((sum, f) => 
                        sum + (f.type === 'income' ? parseFloat(f.amount) : -parseFloat(f.amount)), 0
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <CreateFinanceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}