import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Finances() {
  const { data: finances = [] } = useQuery({
    queryKey: ["/api/finances"],
  });

  const revenue = finances
    .filter((f: any) => f.type === 'income')
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);

  const expenses = finances
    .filter((f: any) => f.type === 'expense')
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);

  const commissions = finances
    .filter((f: any) => f.type === 'commission')
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Financial Dashboard" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">YTD</span>
                    <span className="font-semibold text-gray-900">${revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold text-gray-900">${commissions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">$0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold text-gray-900">${expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">${expenses.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {finances.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No financial records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finances.map((finance: any) => (
                        <TableRow key={finance.id}>
                          <TableCell>{new Date(finance.date).toLocaleDateString()}</TableCell>
                          <TableCell>{finance.description || '-'}</TableCell>
                          <TableCell>{finance.category}</TableCell>
                          <TableCell>
                            <Badge variant={finance.type === 'income' ? 'default' : 'destructive'}>
                              {finance.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            finance.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {finance.type === 'income' ? '+' : '-'}${parseFloat(finance.amount || '0').toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
