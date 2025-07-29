import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Lightbulb } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface AIBotChatProps {
  className?: string;
}

const AIBotChat: React.FC<AIBotChatProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch role-based greeting
  const { data: greetingData } = useQuery<{greeting: string}>({
    queryKey: ['/api/ai-bot/greeting'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Initialize with role-based greeting when available
  useEffect(() => {
    if (greetingData?.greeting && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        content: greetingData.greeting,
        timestamp: new Date()
      }]);
    }
  }, [greetingData, messages.length]);

  // Fetch suggested questions
  const { data: suggestedQuestions = [] } = useQuery<string[]>({
    queryKey: ['/api/ai-bot/suggestions'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // AI Bot query mutation
  const botMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('/api/ai-bot/query', {
        method: 'POST',
        body: { question }
      });
      return response;
    },
    onSuccess: (data, question) => {
      // Remove loading message and add bot response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: Date.now().toString(),
          type: 'bot',
          content: data.response || 'No response received',
          timestamp: new Date()
        }];
      });
    },
    onError: () => {
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }];
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || botMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      type: 'bot',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    botMutation.mutate(inputValue.trim());
    setInputValue('');
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    
    // Auto-submit the suggested question
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      type: 'bot',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    botMutation.mutate(question);
    setInputValue('');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Suggested questions:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your tasks, properties, or any management question..."
            className="flex-1"
            disabled={botMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || botMutation.isPending}
            className="px-3"
          >
            {botMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIBotChat;
export { AIBotChat };