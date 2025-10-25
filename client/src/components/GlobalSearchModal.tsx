import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckSquare, 
  X,
  Clock,
  MapPin
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface SearchResult {
  id: string;
  type: 'property' | 'booking' | 'task' | 'user' | 'finance';
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Search across all data types
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/global-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await apiRequest("GET", `/api/global-search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: searchQuery.length > 2,
  });

  const handleResultClick = (result: SearchResult) => {
    setLocation(result.path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'property': return Home;
      case 'booking': return Calendar;
      case 'task': return CheckSquare;
      case 'user': return Users;
      case 'finance': return DollarSign;
      default: return Search;
    }
  };

  const formatResultType = (type: SearchResult['type']) => {
    switch (type) {
      case 'property': return 'Property';
      case 'booking': return 'Booking';
      case 'task': return 'Task';
      case 'user': return 'User';
      case 'finance': return 'Finance';
      default: return 'Result';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 flex flex-col" style={{ maxHeight: "80vh" }}>
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties, bookings, tasks, users, finance records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-4"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : searchQuery.length <= 2 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Type at least 3 characters to search
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Search across:</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    <Badge variant="outline" className="text-xs">Properties</Badge>
                    <Badge variant="outline" className="text-xs">Bookings</Badge>
                    <Badge variant="outline" className="text-xs">Tasks</Badge>
                    <Badge variant="outline" className="text-xs">Users</Badge>
                    <Badge variant="outline" className="text-xs">Finance</Badge>
                  </div>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Try different keywords or check spelling
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result) => {
                  const Icon = getResultIcon(result.type);
                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-1.5 rounded-md bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {result.title}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {formatResultType(result.type)}
                              </Badge>
                              {result.badge && (
                                <Badge variant={result.badge.variant} className="text-xs">
                                  {result.badge.text}
                                </Badge>
                              )}
                            </div>
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {result.subtitle}
                              </p>
                            )}
                            {result.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {searchResults.length > 0 && (
          <div className="px-6 py-3 border-t bg-muted/30 shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">Enter</kbd> to open first result, 
              <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded ml-1">Esc</kbd> to close
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}