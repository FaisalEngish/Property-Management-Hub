import React, { useState } from "react";

const CaptainCortex = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
          onClick={() => setIsOpen(true)}
          title="Open Captain Cortex AI Assistant"
        >
          🧠 Captain Cortex
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg w-96 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Captain Cortex</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Close"
            >
              ❌
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-2">The Smart Co-Pilot for Property Management by HostPilotPro</div>
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