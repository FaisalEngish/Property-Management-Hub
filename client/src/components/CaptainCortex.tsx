import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, Filter, Eye, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

const CaptainCortex = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('detailed'); // 'concise' or 'detailed'
  const [lastQuery, setLastQuery] = useState("");

  const askCortex = async (question?: string, options?: any) => {
    const queryText = question || prompt;
    if (!queryText.trim()) return;
    
    // Detect export commands and handle them directly
    const exportCSVKeywords = /\b(?:export|download|save)\s+(?:to\s+)?csv\b/i;
    const exportPDFKeywords = /\b(?:export|download|save)\s+(?:to\s+)?pdf\b/i;
    const financeKeywords = /\b(?:financial?|finance|transaction|revenue|expense|income|money|payment|budget)\b/i;
    
    if (exportCSVKeywords.test(queryText)) {
      console.log('🔍 Detected CSV export command, routing to handleFinancialExport');
      handleFinancialExport('csv');
      if (!question) setPrompt(""); // Clear input only for manual queries
      return;
    }
    
    if (exportPDFKeywords.test(queryText)) {
      console.log('🔍 Detected PDF export command, routing to handleFinancialExport');
      handleFinancialExport('pdf');
      if (!question) setPrompt(""); // Clear input only for manual queries
      return;
    }
    
    setIsLoading(true);
    setLastQuery(queryText);
    try {
      const res = await fetch("/api/ai-bot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: queryText,
          viewMode: options?.viewMode || viewMode,
          exportFormat: options?.exportFormat
        }),
      });
      const data = await res.json();
      setResponse(data.response || "No response received");
      if (!question) setPrompt(""); // Clear input only for manual queries
    } catch (error) {
      setResponse("Error connecting to AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string, target?: string) => {
    // Handle export actions directly with API calls
    if (action === 'finance-export-csv') {
      handleFinancialExport('csv');
      return;
    }
    if (action === 'finance-export-pdf') {
      handleFinancialExport('pdf');
      return;
    }
    
    // Handle other actions with AI queries
    const queries = {
      'export-csv': 'Export staff list to CSV',
      'export-pdf': 'Export to PDF',
      'concise': `${lastQuery} - concise mode`,
      'detailed': `${lastQuery} - show detailed view`,
      'drill-sales': 'Show only Sales department staff',
      'drill-operations': 'Show only Operations department staff',
      'drill-managers': 'Show only managers',
      'drill-active': 'Show only Active staff',
      'finance-detailed': 'Show detailed financial analysis with all transactions',
      'finance-revenue': 'Show revenue breakdown by property',
      'finance-expenses': 'Show expense analysis by category',
      'finance-profit': 'Show profit margin analysis'
    };
    
    const query = target ? `Show only ${target}` : queries[action];
    if (query) {
      askCortex(query, { 
        exportFormat: action.includes('export') ? action.split('-')[2] || action.split('-')[1] : undefined,
        viewMode: action === 'concise' ? 'concise' : 'detailed'
      });
    }
  };

  const handleFinancialExport = async (exportType: 'csv' | 'pdf') => {
    try {
      setIsLoading(true);
      setResponse(`Preparing ${exportType.toUpperCase()} export...`);
      
      console.log(`🚀 Starting ${exportType.toUpperCase()} export...`);
      
      const response = await fetch('/api/finance-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies/session for authentication
        body: JSON.stringify({
          exportType: exportType,
          format: exportType === 'csv' ? 'standard' : 'detailed',
          dateRange: 'all',
          filters: {}
        }),
      });

      console.log(`📊 Export response status: ${response.status}`);
      console.log(`📊 Export response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Check if we got JSON error response (authentication/validation error)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error(`❌ Server error:`, errorData);
          throw new Error(errorData.message || `Export failed: ${response.statusText}`);
        } else {
          // Probably got HTML instead of expected response
          const htmlContent = await response.text();
          console.error(`❌ Unexpected response content:`, htmlContent.substring(0, 200));
          throw new Error(`Export failed: Got HTML instead of ${exportType.toUpperCase()} data. Please check authentication.`);
        }
      }

      // Check content type to ensure we got the expected file
      const contentType = response.headers.get('content-type');
      const expectedTypes = {
        csv: 'text/csv',
        pdf: 'text/html' // PDF export returns HTML for printing
      };
      
      if (!contentType || !contentType.includes(expectedTypes[exportType])) {
        console.warn(`⚠️ Unexpected content type: ${contentType}, expected: ${expectedTypes[exportType]}`);
      }

      // Backend returns actual file content
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || 
        `financial_export_${new Date().toISOString().split('T')[0]}.${exportType === 'pdf' ? 'html' : exportType}`;
      
      console.log(`📄 Downloaded file: ${fileName}, size: ${blob.size} bytes`);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setResponse(`✅ ${exportType.toUpperCase()} export completed successfully! Downloaded: ${fileName} (${Math.round(blob.size / 1024)}KB)`);
      
    } catch (error) {
      console.error(`❌ Error exporting ${exportType}:`, error);
      setResponse(`❌ Failed to export ${exportType.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      askCortex();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
          onClick={() => setIsOpen(true)}
          title="Open Captain Cortex AI Assistant"
        >
          👨‍✈️ Captain Cortex
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg w-[480px] p-4 max-h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">👨‍✈️ Captain Cortex</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'concise' ? 'detailed' : 'concise')}
                title={`Switch to ${viewMode === 'concise' ? 'detailed' : 'concise'} mode`}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                {viewMode === 'concise' ? 'Detailed' : 'Concise'}
              </Button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Close"
              >
                ❌
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-3">
            The Smart Co-Pilot for Property Management by HostPilotPro
            <span className="ml-2 px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-blue-700 dark:text-blue-200">
              {viewMode} mode
            </span>
          </div>
          
          <textarea
            className="w-full p-2 border dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
            placeholder="Ask about your staff, finance, properties, or any management question..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          
          <div className="flex gap-2 mb-3">
            <Button
              className="flex-1"
              onClick={() => askCortex()}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? "Thinking..." : "Ask (Ctrl+Enter)"}
            </Button>
          </div>

          {/* Quick Action Buttons for Staff */}
          {response && response.includes('staff') && !response.startsWith('FINANCIAL_DATA:') && (
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">🚀 Quick Actions:</div>
              
              <div className="grid grid-cols-2 gap-1 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('export-csv')}
                  className="text-xs"
                  disabled={isLoading}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('export-pdf')}
                  className="text-xs"
                  disabled={isLoading}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Export PDF
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-1 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('drill-sales')}
                  className="text-xs"
                  disabled={isLoading}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Sales Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('drill-operations')}
                  className="text-xs"
                  disabled={isLoading}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Operations
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('drill-managers')}
                  className="text-xs"
                  disabled={isLoading}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Managers
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('drill-active')}
                  className="text-xs"
                  disabled={isLoading}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Active Staff
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                💡 Try: "Show details for [Staff Name]" or "View charts" for visual analytics
              </div>
            </div>
          )}

          {/* Quick Action Buttons for Finance */}
          {response && response.startsWith('FINANCIAL_DATA:') && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">💰 Financial Actions:</div>
              
              <div className="grid grid-cols-2 gap-1 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('finance-export-csv')}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('finance-export-pdf')}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Export PDF
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-1 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('finance-revenue')}
                  className="text-xs border-green-200 text-green-700 hover:bg-green-50"
                  disabled={isLoading}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Revenue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('finance-expenses')}
                  className="text-xs border-red-200 text-red-700 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Expenses
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('finance-profit')}
                  className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                  disabled={isLoading}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Profit Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('finance-detailed')}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  All Transactions
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                💡 Try: "Show profit trends" or "Compare monthly revenue" for deeper insights
              </div>
            </div>
          )}

          {response && (
            <div className="mt-2">
              {response.startsWith('FINANCIAL_DATA:') ? (
                (() => {
                  try {
                    const jsonStr = response.substring('FINANCIAL_DATA:'.length);
                    console.log('Parsing financial data:', jsonStr.substring(0, 200) + '...');
                    const financialData = JSON.parse(jsonStr);
                    
                    if (!financialData || !financialData.data) {
                      throw new Error('Invalid financial data structure');
                    }
                    
                    const { metrics, transactions, hasMoreTransactions, totalTransactions, insights } = financialData.data;
                    
                    // Validate metrics exist and have numbers
                    if (!metrics || typeof metrics.totalRevenue !== 'number' || typeof metrics.totalExpenses !== 'number') {
                      throw new Error('Invalid financial metrics');
                    }
                    
                    return (
                      <div className="space-y-4">
                        {/* Financial KPI Cards */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Revenue</p>
                                <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                  ฿{metrics.totalRevenue.toLocaleString()}
                                </p>
                              </div>
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Total Expenses</p>
                                <p className="text-lg font-bold text-red-800 dark:text-red-200">
                                  ฿{metrics.totalExpenses.toLocaleString()}
                                </p>
                              </div>
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Net Profit</p>
                                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                  ฿{metrics.netProfit.toLocaleString()}
                                </p>
                              </div>
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Transactions</p>
                                <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                                  {metrics.transactionCount}
                                </p>
                              </div>
                              <Activity className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                        </div>

                        {/* Recent Transactions Table */}
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                          <div className="px-3 py-2 border-b dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Recent Transactions ({transactions.length} of {totalTransactions})
                            </h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-300 font-medium">Date</th>
                                  <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-300 font-medium">Type</th>
                                  <th className="px-2 py-1 text-right text-gray-700 dark:text-gray-300 font-medium">Amount</th>
                                  <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-300 font-medium">Category</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions.map((tx: any, index: number) => (
                                  <tr key={tx.id || index} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-2 py-1 text-gray-900 dark:text-gray-100">
                                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-2 py-1">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                        tx.type === 'income' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      }`}>
                                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                      </span>
                                    </td>
                                    <td className={`px-2 py-1 text-right font-medium ${
                                      tx.type === 'income' 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      ฿{tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-2 py-1 text-gray-600 dark:text-gray-400 truncate">
                                      {tx.category}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {hasMoreTransactions && (
                            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {totalTransactions - transactions.length} more transactions available
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Financial Insights */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Key Insights</h3>
                          <ul className="space-y-1">
                            {insights.map((insight: string, index: number) => (
                              <li key={index} className="text-xs text-blue-700 dark:text-blue-300 flex items-start">
                                <span className="mr-1">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Financial data parsing error:', error);
                    console.error('Raw response:', response.substring(0, 500));
                    return (
                      <div className="p-3 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
                        <p className="font-medium">Error parsing financial data</p>
                        <p className="text-xs mt-1 opacity-75">
                          {error instanceof Error ? error.message : 'Invalid data format'}. Please try asking again.
                        </p>
                      </div>
                    );
                  }
                })()
              ) : (
                <div className="p-3 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-gray-900 dark:text-gray-100">Response:</strong>
                    {lastQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAction(viewMode === 'concise' ? 'detailed' : 'concise')}
                        className="text-xs"
                        disabled={isLoading}
                      >
                        {viewMode === 'concise' ? 'Expand Details' : 'Show Summary'}
                      </Button>
                    )}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-1 max-h-80 overflow-y-auto">
                    {response}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaptainCortex;