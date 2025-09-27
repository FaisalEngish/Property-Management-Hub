import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, Filter, Eye } from "lucide-react";

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
    const queries = {
      'export-csv': 'Export staff list to CSV',
      'export-pdf': 'Export to PDF',
      'concise': `${lastQuery} - concise mode`,
      'detailed': `${lastQuery} - show detailed view`,
      'drill-sales': 'Show only Sales department staff',
      'drill-operations': 'Show only Operations department staff',
      'drill-managers': 'Show only managers',
      'drill-active': 'Show only Active staff'
    };
    
    const query = target ? `Show only ${target}` : queries[action];
    if (query) {
      askCortex(query, { 
        exportFormat: action.includes('export') ? action.split('-')[1] : undefined,
        viewMode: action === 'concise' ? 'concise' : 'detailed'
      });
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

          {/* Quick Action Buttons */}
          {response && response.includes('staff') && (
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

          {response && (
            <div className="mt-2 p-3 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-sm">
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
  );
};

export default CaptainCortex;