import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  AlertCircle,
  FileText,
  CreditCard,
  Receipt,
  Banknote
} from "lucide-react";
import GlobalFilters, { useGlobalFilters, applyGlobalFilters } from "@/components/GlobalFilters";

import TopBar from "@/components/TopBar";

interface FinancialRecord {
  id: number;
  propertyId: number;
  propertyName?: string;
  ownerId?: string;
  portfolioManagerId?: string;
  amount: number;
  currency: string;
  type: "income" | "expense" | "commission";
  description: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
}

export default function FilteredFinancialDashboard() {
  const [globalFilters, setGlobalFilters] = useGlobalFilters("financial-filters");

  // Fetch financial data
  const { data: bookingRevenues = [], isLoading: loadingRevenues } = useQuery({
    queryKey: ["/api/booking-revenue"],
  });

  const { data: ownerPayouts = [], isLoading: loadingPayouts } = useQuery({
    queryKey: ["/api/owner-invoicing/payout-requests"],
  });

  const { data: utilityBills = [], isLoading: loadingUtilities } = useQuery({
    queryKey: ["/api/utility-bills"],
  });

  const { data: commissions = [], isLoading: loadingCommissions } = useQuery({
    queryKey: ["/api/booking-revenue/commissions"],
  });

  // Transform data into unified financial records
  const allFinancialRecords: FinancialRecord[] = [
    ...bookingRevenues.map((rev: any) => ({
      id: rev.id,
      propertyId: rev.propertyId,
      propertyName: rev.propertyName,
      ownerId: rev.ownerId,
      portfolioManagerId: rev.portfolioManagerId,
      amount: parseFloat(rev.totalRevenue || "0"),
      currency: rev.currency || "THB",
      type: "income" as const,
      description: `Booking Revenue - ${rev.bookingPlatform}`,
      date: rev.checkInDate,
      status: rev.status || "completed",
    })),
    ...ownerPayouts.map((payout: any) => ({
      id: payout.id,
      propertyId: payout.propertyId,
      propertyName: payout.propertyName,
      ownerId: payout.ownerId,
      amount: parseFloat(payout.amount || "0"),
      currency: payout.currency || "THB",
      type: "expense" as const,
      description: `Owner Payout - ${payout.paymentMethod}`,
      date: payout.requestDate,
      status: payout.status || "pending",
    })),
    ...utilityBills.map((bill: any) => ({
      id: bill.id,
      propertyId: bill.propertyId,
      propertyName: bill.propertyName,
      amount: parseFloat(bill.amount || "0"),
      currency: bill.currency || "THB",
      type: "expense" as const,
      description: `Utility Bill - ${bill.billType}`,
      date: bill.billDate,
      status: bill.paymentStatus === "paid" ? "completed" : "pending",
    })),
    ...commissions.map((comm: any) => ({
      id: comm.id,
      propertyId: comm.propertyId,
      propertyName: comm.propertyName,
      amount: parseFloat(comm.totalCommission || "0"),
      currency: comm.currency || "THB",
      type: "commission" as const,
      description: `Commission - ${comm.commissionType}`,
      date: comm.calculatedDate,
      status: "completed",
    })),
  ];

  // Apply global filters
  const filteredRecords = applyGlobalFilters(allFinancialRecords, globalFilters, {
    propertyIdField: "propertyId",
    ownerIdField: "ownerId",
    portfolioManagerIdField: "portfolioManagerId",
    searchFields: ["description", "propertyName"],
  });

  // Calculate summary metrics
  const totalIncome = filteredRecords
    .filter(r => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = filteredRecords
    .filter(r => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalCommissions = filteredRecords
    .filter(r => r.type === "commission")
    .reduce((sum, r) => sum + r.amount, 0);

  const netProfit = totalIncome - totalExpenses - totalCommissions;

  const pendingCount = filteredRecords.filter(r => r.status === "pending").length;

  const isLoading = loadingRevenues || loadingPayouts || loadingUtilities || loadingCommissions;

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-background">

        <div className="flex-1 flex flex-col lg:ml-0">
          <TopBar title="Financial Dashboard" />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">

      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Financial Dashboard" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Global Filters */}
          <GlobalFilters
            filters={globalFilters}
            onFiltersChange={setGlobalFilters}
            placeholder="Search financial records..."
            showFilters={{
              property: true,
              owner: true,
              portfolioManager: true,
              area: true,
              bedrooms: true,
              status: false,
              search: true,
            }}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ฿{totalIncome.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {filteredRecords.filter(r => r.type === "income").length} bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ฿{totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {filteredRecords.filter(r => r.type === "expense").length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ฿{totalCommissions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {filteredRecords.filter(r => r.type === "commission").length} commissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <Banknote className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ฿{netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {pendingCount} pending
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Records */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Records ({filteredRecords.length})</TabsTrigger>
              <TabsTrigger value="income">
                Income ({filteredRecords.filter(r => r.type === "income").length})
              </TabsTrigger>
              <TabsTrigger value="expenses">
                Expenses ({filteredRecords.filter(r => r.type === "expense").length})
              </TabsTrigger>
              <TabsTrigger value="commissions">
                Commissions ({filteredRecords.filter(r => r.type === "commission").length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <FinancialRecordsTable records={filteredRecords} />
            </TabsContent>

            <TabsContent value="income">
              <FinancialRecordsTable 
                records={filteredRecords.filter(r => r.type === "income")} 
              />
            </TabsContent>

            <TabsContent value="expenses">
              <FinancialRecordsTable 
                records={filteredRecords.filter(r => r.type === "expense")} 
              />
            </TabsContent>

            <TabsContent value="commissions">
              <FinancialRecordsTable 
                records={filteredRecords.filter(r => r.type === "commission")} 
              />
            </TabsContent>

            <TabsContent value="pending">
              <FinancialRecordsTable 
                records={filteredRecords.filter(r => r.status === "pending")} 
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function FinancialRecordsTable({ records }: { records: FinancialRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Property</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Type</th>
                <th className="text-right p-2">Amount</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.type}-${record.id}`} className="border-b hover:bg-muted/50">
                  <td className="p-2 text-sm">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-sm font-medium">
                    {record.propertyName || "Unknown Property"}
                  </td>
                  <td className="p-2 text-sm">{record.description}</td>
                  <td className="p-2">
                    <Badge 
                      variant={record.type === "income" ? "default" : 
                              record.type === "expense" ? "destructive" : 
                              "secondary"}
                    >
                      {record.type}
                    </Badge>
                  </td>
                  <td className={`p-2 text-sm font-bold text-right ${
                    record.type === "income" ? "text-green-600" : 
                    record.type === "expense" ? "text-red-600" : 
                    "text-orange-600"
                  }`}>
                    ฿{record.amount.toLocaleString()}
                  </td>
                  <td className="p-2">
                    <Badge 
                      variant={record.status === "completed" ? "default" : 
                              record.status === "pending" ? "secondary" : 
                              "destructive"}
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No financial records found with current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}