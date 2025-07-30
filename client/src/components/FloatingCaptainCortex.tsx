import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CaptainCortexAvatar from "./CaptainCortexAvatar";
import AIBotChat from "./AIBotChat";

interface SpeechBubbleProps {
  message: string;
  onClose: () => void;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ message, onClose }) => (
  <div className="absolute bottom-16 right-2 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-3 max-w-64 shadow-lg animate-bounce">
    <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
      {message}
    </div>
    <button 
      onClick={onClose}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
    >
      ×
    </button>
    {/* Speech bubble tail */}
    <div className="absolute bottom-0 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-500 transform translate-y-full"></div>
    <div className="absolute bottom-0 right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-gray-800 transform translate-y-full -translate-y-[2px]"></div>
  </div>
);

const FloatingCaptainCortex = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");

  // Fetch role-based greeting (handle authentication gracefully)
  const { data: greetingData } = useQuery<{greeting: string}>({
    queryKey: ['/api/ai-bot/greeting'],
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Don't retry if unauthorized
  });

  // Check for high priority tasks as notifications (handle authentication gracefully)
  const { data: tasksData } = useQuery({
    queryKey: ['/api/tasks'],
    staleTime: 1000 * 60, // 1 minute
    retry: false, // Don't retry if unauthorized
  });

  // Filter high priority tasks as notifications
  const notificationsData = React.useMemo(() => {
    if (!tasksData || !Array.isArray(tasksData)) return [];
    return tasksData.filter((task: any) => task.priority === 'high' && task.status === 'pending');
  }, [tasksData]);

  // Show speech bubble for notifications
  useEffect(() => {
    if (notificationsData && Array.isArray(notificationsData) && notificationsData.length > 0) {
      setSpeechMessage(`You have ${notificationsData.length} new notification${notificationsData.length > 1 ? 's' : ''}!`);
      setShowSpeechBubble(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowSpeechBubble(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationsData]);

  // Show greeting bubble on first load
  useEffect(() => {
    const hasShownGreeting = localStorage.getItem('cortex-greeting-shown');
    if (!hasShownGreeting && greetingData?.greeting) {
      setSpeechMessage("Hi! I'm Captain Cortex, your property management co-pilot!");
      setShowSpeechBubble(true);
      localStorage.setItem('cortex-greeting-shown', 'true');
      
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShowSpeechBubble(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [greetingData]);

  return (
    <>
      {/* Small floating avatar */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Speech bubble */}
        {showSpeechBubble && (
          <SpeechBubble 
            message={speechMessage}
            onClose={() => setShowSpeechBubble(false)}
          />
        )}
        
        {/* Floating avatar button */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
          onClick={() => setIsOpen(true)}
          title="Chat with Captain Cortex"
        >
          <CaptainCortexAvatar size={60} className="rounded-full overflow-hidden border-2 border-white" />
        </button>
      </div>

      {/* Full-screen chat overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex">
            {/* Left panel with large avatar */}
            <div className="w-1/3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-l-lg p-6 flex flex-col items-center justify-center text-white">
              <div className="mb-4">
                <CaptainCortexAvatar size={150} className="rounded-full overflow-hidden border-4 border-white shadow-lg" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Captain Cortex</h2>
              <p className="text-sm text-blue-100 text-center mb-4">
                The Smart Co-Pilot for Property Management by HostPilotPro
              </p>
              <div className="text-xs text-blue-200 bg-blue-700 bg-opacity-50 rounded-lg p-3 text-center">
                {greetingData?.greeting || "Ready to help you navigate tasks, finances, and property data!"}
              </div>
            </div>

            {/* Right panel with chat */}
            <div className="w-2/3 flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Chat with Captain Cortex
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                  title="Close"
                >
                  ×
                </button>
              </div>

              {/* Chat content */}
              <div className="flex-1 p-4">
                <AIBotChat />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCaptainCortex;