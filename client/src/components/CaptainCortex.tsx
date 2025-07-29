import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CaptainCortexAvatar from "./CaptainCortexAvatar";

const CaptainCortex = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch role-based greeting
  const { data: greetingData } = useQuery<{greeting: string}>({
    queryKey: ['/api/ai-bot/greeting'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const askCortex = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-bot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });
      const data = await res.json();
      setResponse(data.response || "No response received");
    } catch (error) {
      setResponse("Error connecting to AI assistant");
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
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors flex items-center gap-2"
          onClick={() => setIsOpen(true)}
          title="Open Captain Cortex AI Assistant"
        >
          <div className="flex-shrink-0">
            <CaptainCortexAvatar size={40} className="rounded-full overflow-hidden border-2 border-white" />
          </div>
          <span className="text-sm font-medium pr-2">Captain Cortex</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg w-96 p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CaptainCortexAvatar size={50} className="rounded-full overflow-hidden border-2 border-blue-200" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100">Captain Cortex</h2>
                <div className="text-xs text-gray-500">The Smart Co-Pilot for Property Management by HostPilotPro</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Close"
            >
              ❌
            </button>
          </div>
          {!response && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              {greetingData?.greeting || "👨‍✈️ Hello! I'm Captain Cortex – your smart co-pilot for property management, powered by HostPilotPro. Ready to navigate tasks, finances, and data with you!"}
            </div>
          )}
          <textarea
            className="w-full p-2 border dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
            placeholder="Ask about your tasks, properties, or any management question..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full disabled:bg-gray-400 transition-colors"
            onClick={askCortex}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? "Thinking..." : "Ask (Ctrl+Enter)"}
          </button>
          {response && (
            <div className="mt-2 p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-sm">
              <strong className="text-gray-900 dark:text-gray-100">Response:</strong>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-1">{response}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaptainCortex;