import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Download
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";

interface Property {
  id: number;
  name: string;
}

interface Finance {
  id: number;
  propertyId: number;
  type: 'income' | 'expense';
  category: string;
  amount: string;
  date: string;
  description?: string;
  department?: string;
}

interface Booking {
  id: number;
  propertyId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  platformPayout?: string;
  guestTotalPrice?: string;
  totalAmount?: string;
  bookingPlatform?: string;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AdvancedFinancialAnalytics() {
  const { formatWithConversion } = useCurrency();
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Fetch properties
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch finances
  const { data: finances = [] } = useQuery<Finance[]>({
    queryKey: ["/api/finance"],
  });

  // Fetch bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(finances.map(f => f.category))];
    return uniqueCategories.filter(Boolean);
  }, [finances]);

  // Filter finances based on all criteria
  const filteredFinances = useMemo(() => {
    return finances.filter(f => {
      const propertyMatch = selectedProperty === 'all' || f.propertyId.toString() === selectedProperty;
      const typeMatch = selectedType === 'all' || f.type === selectedType;
      const categoryMatch = selectedCategory === 'all' || f.category === selectedCategory;
      
      let dateMatch = true;
      if (dateFrom && f.date) {
        dateMatch = dateMatch && !isBefore(parseISO(f.date), parseISO(dateFrom));
      }
      if (dateTo && f.date) {
        dateMatch = dateMatch && !isAfter(parseISO(f.date), parseISO(dateTo));
      }
      
      return propertyMatch && typeMatch && categoryMatch && dateMatch;
    });
  }, [finances, selectedProperty, selectedType, selectedCategory, dateFrom, dateTo]);

  // Filter bookings based on criteria - includes bookings that overlap the date range
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      
      const propertyMatch = selectedProperty === 'all' || b.propertyId.toString() === selectedProperty;
      
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const checkIn = parseISO(b.checkIn);
        const checkOut = parseISO(b.checkOut);
        
        // Booking overlaps if: checkIn <= rangeEnd AND checkOut >= rangeStart
        if (dateFrom && dateTo) {
          const rangeStart = parseISO(dateFrom);
          const rangeEnd = parseISO(dateTo);
          dateMatch = checkIn <= rangeEnd && checkOut >= rangeStart;
        } else if (dateFrom) {
          // Only start date: booking must end after or on start date
          const rangeStart = parseISO(dateFrom);
          dateMatch = checkOut >= rangeStart;
        } else if (dateTo) {
          // Only end date: booking must start before or on end date
          const rangeEnd = parseISO(dateTo);
          dateMatch = checkIn <= rangeEnd;
        }
      }
      
      return propertyMatch && dateMatch;
    });
  }, [bookings, selectedProperty, dateFrom, dateTo]);

  // Calculate booking revenue
  const bookingRevenue = filteredBookings.reduce((sum, b) => {
    const amount = parseFloat(b.platformPayout || b.totalAmount || '0');
    return sum + amount;
  }, 0);

  // Calculate finance transaction revenue
  const financeRevenue = filteredFinances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);

  // Total revenue includes both booking revenue and other income
  const totalRevenue = bookingRevenue + financeRevenue;

  const totalExpenses = filteredFinances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

  // Revenue by Category (Pie Chart Data) - includes booking revenue
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    // Add booking revenue as a category
    if (bookingRevenue > 0) {
      categoryMap.set('Booking Revenue', bookingRevenue);
    }
    
    // Add other finance income
    filteredFinances
      .filter(f => f.type === 'income')
      .forEach(f => {
        const current = categoryMap.get(f.category) || 0;
        categoryMap.set(f.category, current + parseFloat(f.amount || '0'));
      });
    
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredFinances, bookingRevenue]);

  // Expense by Category (Pie Chart Data)
  const expenseCategoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredFinances
      .filter(f => f.type === 'expense')
      .forEach(f => {
        const current = categoryMap.get(f.category) || 0;
        categoryMap.set(f.category, current + parseFloat(f.amount || '0'));
      });
    
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredFinances]);

  // Property Comparison (Bar Chart Data) - includes booking revenue
  const propertyComparisonData = useMemo(() => {
    if (selectedProperty !== 'all') return [];
    
    return properties.map(prop => {
      const propFinances = filteredFinances.filter(f => f.propertyId === prop.id);
      const propBookings = filteredBookings.filter(b => b.propertyId === prop.id);
      
      const financeRevenue = propFinances
        .filter(f => f.type === 'income')
        .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
      
      const bookingRevenue = propBookings.reduce((sum, b) => {
        const amount = parseFloat(b.platformPayout || b.totalAmount || '0');
        return sum + amount;
      }, 0);
      
      const revenue = financeRevenue + bookingRevenue;
      const expenses = propFinances
        .filter(f => f.type === 'expense')
        .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
      
      return {
        name: prop.name.length > 15 ? prop.name.substring(0, 15) + '...' : prop.name,
        revenue,
        expenses,
        profit: revenue - expenses
      };
    }).filter(p => p.revenue > 0 || p.expenses > 0);
  }, [properties, filteredFinances, filteredBookings, selectedProperty]);

  // Monthly Trend (Line Chart Data) - includes booking revenue
  const monthlyTrendData = useMemo(() => {
    const monthMap = new Map<string, { revenue: number; expenses: number; sortDate: Date }>();
    
    // Add finance transactions
    filteredFinances.forEach(f => {
      if (!f.date) return;
      const dateObj = parseISO(f.date);
      const monthStart = startOfMonth(dateObj);
      const monthKey = monthStart.toISOString();
      
      const current = monthMap.get(monthKey) || { revenue: 0, expenses: 0, sortDate: monthStart };
      
      if (f.type === 'income') {
        current.revenue += parseFloat(f.amount || '0');
      } else {
        current.expenses += parseFloat(f.amount || '0');
      }
      
      monthMap.set(monthKey, current);
    });
    
    // Add booking revenue by check-in month
    filteredBookings.forEach(b => {
      if (!b.checkIn) return;
      const dateObj = parseISO(b.checkIn);
      const monthStart = startOfMonth(dateObj);
      const monthKey = monthStart.toISOString();
      
      const current = monthMap.get(monthKey) || { revenue: 0, expenses: 0, sortDate: monthStart };
      const amount = parseFloat(b.platformPayout || b.totalAmount || '0');
      current.revenue += amount;
      
      monthMap.set(monthKey, current);
    });
    
    return Array.from(monthMap.entries())
      .map(([monthKey, data]) => ({
        month: format(data.sortDate, 'MMM yyyy'),
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
        sortDate: data.sortDate
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
  }, [filteredFinances, filteredBookings]);

  // Top performing properties
  const topProperties = useMemo(() => {
    const propertyMap = new Map<number, number>();
    filteredFinances
      .filter(f => f.type === 'income')
      .forEach(f => {
        const current = propertyMap.get(f.propertyId) || 0;
        propertyMap.set(f.propertyId, current + parseFloat(f.amount || '0'));
      });
    
    return Array.from(propertyMap.entries())
      .map(([id, revenue]) => ({
        property: properties.find(p => p.id === id)?.name || 'Unknown',
        revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredFinances, properties]);

  const clearFilters = () => {
    setSelectedProperty('all');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateFrom('');
    setDateTo('');
  };

  const activeFiltersCount = 
    (selectedProperty !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Financial Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Multi-dimensional insights with dynamic filtering
          </p>
        </div>
        <Button variant="outline" data-testid="button-export">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Multi-Dimensional Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({activeFiltersCount} active)
                </span>
              )}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Property Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Property</label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger data-testid="select-property">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="input-date-from"
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="input-date-to"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="metric-revenue">
              {formatWithConversion(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredFinances.filter(f => f.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="metric-expenses">
              {formatWithConversion(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredFinances.filter(f => f.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} data-testid="metric-profit">
              {formatWithConversion(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredFinances.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Filtered transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend Line Chart */}
        {monthlyTrendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatWithConversion(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Revenue by Category Pie Chart */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatWithConversion(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Property Comparison Bar Chart (only when all properties selected) */}
      {propertyComparisonData.length > 0 && selectedProperty === 'all' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Property Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={propertyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatWithConversion(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Expense Distribution */}
      {expenseCategoryData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatWithConversion(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Properties */}
      {topProperties.length > 0 && selectedProperty === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Revenue Generating Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProperties.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.property}</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatWithConversion(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {filteredFinances.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No data available for the selected filters</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
