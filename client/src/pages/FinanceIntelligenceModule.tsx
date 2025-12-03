import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Brain, 
  Download,
  AlertTriangle,
  Target,
  Calendar,
  Users,
  Zap,
  FileText,
  Send,
  Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { useFastAuth } from "@/lib/fastAuth";
import { useToast } from "@/hooks/use-toast";

interface FinanceData {
  id: number;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description: string;
  department?: string;
}

interface DepartmentAnalysis {
  department: string;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  revenuePercentage: number;
  expensePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface AIAnalysis {
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
  profitMargin: number;
  recommendations: string[];
  redFlags: string[];
  opportunities: string[];
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  departmentInsights: Array<{
    department: string;
    status: 'profitable' | 'concerning' | 'loss';
    insight: string;
    action: string;
  }>;
}

export default function FinanceIntelligenceModule() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const { user } = useFastAuth();
  const { toast } = useToast();

  // Fetch financial data
  const { data: financeData = [], isLoading } = useQuery<FinanceData[]>({
    queryKey: ['/api/finance-intelligence/data', selectedPeriod],
    queryFn: () => apiRequest(`/api/finance-intelligence/data?period=${selectedPeriod}`),
  });

  // Fetch salary data
  const { data: salaryData = [] } = useQuery({
    queryKey: ['/api/staff-salaries/summary'],
    queryFn: () => apiRequest('/api/staff-salaries/summary'),
  });

  // Calculate department analysis
  const departmentAnalysis = useMemo(() => {
    const departments = [
      'Rental Income', 'Cleaning Fees', 'Laundry Fees', 'Pool Service', 
      'Garden Service', 'Other Services', 'Management Fees', 'Salaries & Wages', 
      'Fixed Costs', 'Utilities'
    ];

    return departments.map(dept => {
      const deptData = financeData.filter(item => 
        item.category.toLowerCase().includes(dept.toLowerCase()) ||
        item.department?.toLowerCase().includes(dept.toLowerCase())
      );

      const revenue = deptData
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

      const expenses = deptData
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

      const totalRevenue = financeData
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

      const totalExpenses = financeData
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        department: dept,
        totalRevenue: revenue,
        totalExpenses: expenses,
        profit: revenue - expenses,
        profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
        revenuePercentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
        expensePercentage: totalExpenses > 0 ? (expenses / totalExpenses) * 100 : 0,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
      } as DepartmentAnalysis;
    }).filter(dept => dept.totalRevenue > 0 || dept.totalExpenses > 0);
  }, [financeData]);

  // Calculate overall metrics
  const totalRevenue = financeData
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = financeData
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Prepare chart data
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => {
      const monthRevenue = Math.floor(Math.random() * 50000) + 100000;
      const monthExpenses = Math.floor(Math.random() * 30000) + 60000;
      return {
        month,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      };
    });
  }, []);

  const departmentPieData = departmentAnalysis.map(dept => ({
    name: dept.department,
    value: dept.revenuePercentage,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  // AI Analysis Mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async () => {
      const analysisData = {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        departmentAnalysis,
        monthlyTrends,
        period: selectedPeriod
      };
      
      return apiRequest('POST', '/api/finance-intelligence/ai-analysis', analysisData);
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      toast({
        title: "AI Analysis Complete",
        description: "Financial intelligence report generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate AI analysis",
        variant: "destructive",
      });
    },
  });

  const handleAiAnalysis = () => {
    setAiAnalysisLoading(true);
    aiAnalysisMutation.mutate();
    // Simulate AI analysis time
    setTimeout(() => setAiAnalysisLoading(false), 3000);
  };

  const exportReport = async () => {
    try {
      const response = await apiRequest('POST', '/api/finance-intelligence/export', {
        period: selectedPeriod,
        includeAiAnalysis: !!aiAnalysis,
        data: { departmentAnalysis, aiAnalysis }
      });
      
      // Create download link
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-intelligence-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report Exported",
        description: "Financial intelligence report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export financial report",
        variant: "destructive",
      });
    }
  };

  const formatWithConversion = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading finance intelligence...</div>
        </div>
      </div>
    );
  }

  // Check permissions
  if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Access Denied: This module requires Admin or Portfolio Manager permissions</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Finance Intelligence Module
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered financial analysis and business intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            onClick={handleAiAnalysis}
            disabled={aiAnalysisLoading}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            {aiAnalysisLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            Analyze & Advise
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Button
          variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('monthly')}
        >
          Monthly View
        </Button>
        <Button
          variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('yearly')}
        >
          Yearly View
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatWithConversion(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
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
              {formatWithConversion(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              +3.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatWithConversion(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Health</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getHealthColor(aiAnalysis?.overallHealth || 'good')}>
                {aiAnalysis?.overallHealth || 'Good'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on AI analysis
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="departments">Department Analysis</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatWithConversion(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={departmentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                    >
                      {departmentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentAnalysis.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="profitMargin" fill="#8884d8" name="Profit Margin %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {departmentAnalysis.map((dept) => (
              <Card key={dept.department}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{dept.department}</CardTitle>
                    <div className="flex items-center gap-2">
                      {dept.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {dept.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {dept.trend === 'stable' && <DollarSign className="h-4 w-4 text-blue-600" />}
                      <Badge variant={dept.profit >= 0 ? 'default' : 'destructive'}>
                        {dept.profit >= 0 ? 'Profitable' : 'Loss'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatWithConversion(dept.totalRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dept.revenuePercentage.toFixed(1)}% of total
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatWithConversion(dept.totalExpenses)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dept.expensePercentage.toFixed(1)}% of total
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profit</p>
                      <p className={`text-xl font-bold ${dept.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatWithConversion(dept.profit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Margin</p>
                      <p className={`text-xl font-bold ${dept.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dept.profitMargin.toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${dept.profitMargin >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                          style={{ width: `${Math.abs(dept.profitMargin)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          {aiAnalysis ? (
            <div className="space-y-4">
              {/* AI Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Business Health Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold p-4 rounded-lg ${getHealthColor(aiAnalysis.overallHealth)}`}>
                        {aiAnalysis.overallHealth.toUpperCase()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Overall Health</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold p-4 rounded-lg bg-blue-50 text-blue-600">
                        {aiAnalysis.profitMargin.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Profit Margin</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold p-4 rounded-lg bg-green-50 text-green-600">
                        {aiAnalysis.forecast.confidence}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Forecast Confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">💡 AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">⚠️ Red Flags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiAnalysis.redFlags.map((flag, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Department Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Department-Specific Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiAnalysis.departmentInsights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{insight.department}</h4>
                          <Badge variant={
                            insight.status === 'profitable' ? 'default' : 
                            insight.status === 'concerning' ? 'secondary' : 'destructive'
                          }>
                            {insight.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.insight}</p>
                        <p className="text-sm font-medium text-blue-600">
                          Recommended Action: {insight.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Financial Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Month Projection</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatWithConversion(aiAnalysis.forecast.nextMonth)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Quarter Projection</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatWithConversion(aiAnalysis.forecast.nextQuarter)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Confidence Level: {aiAnalysis.forecast.confidence}%
                    </p>
                    <Progress value={aiAnalysis.forecast.confidence} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis Not Generated</h3>
                  <p className="text-gray-600 mb-4">
                    Click "Analyze & Advise" to generate AI-powered insights and recommendations
                  </p>
                  <Button
                    onClick={handleAiAnalysis}
                    disabled={aiAnalysisLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {aiAnalysisLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    Generate AI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}