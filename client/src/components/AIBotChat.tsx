import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function AIBotChat({ className }: AIBotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '👨‍✈️ Hello! I\'m Captain Cortex – your smart co-pilot for property management, powered by HostPilotPro. Ready to navigate tasks, finances, and data with you!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: data.response,
            timestamp: new Date()
          }
        ];
      });
    },
    onError: (error) => {
      // Remove loading message and add error response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: 'I apologize, but I encountered an error processing your question. Please try again.',
            timestamp: new Date()
          }
        ];
      });
    }
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: 'Analyzing your question and fetching relevant data...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');

    // Send to AI bot
    botMutation.mutate(inputValue);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className={`h-[600px] flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          MR Pilot AI Assistant
          <Badge variant="secondary" className="ml-auto">
            Connected to Live Data
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 p-4">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-3">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : message.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-900'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lightbulb className="h-4 w-4" />
              Suggested questions:
            </div>
            <div className="flex flex-wrap gap-2">
              {(suggestedQuestions as string[]).slice(0, 3).map((question: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={botMutation.isPending}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about tasks, revenue, expenses, bookings..."
            disabled={botMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || botMutation.isPending}
            size="icon"
          >
            {botMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}