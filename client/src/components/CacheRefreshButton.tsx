import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { sessionCache } from "@/lib/sessionCache";
import { useToast } from "@/hooks/use-toast";

interface CacheRefreshButtonProps {
  endpoints?: string[];
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showStats?: boolean;
}

export default function CacheRefreshButton({ 
  endpoints = [
    '/api/dashboard/stats',
    '/api/properties', 
    '/api/tasks',
    '/api/bookings',
    '/api/finance/analytics',
    '/api/finance'
  ],
  variant = "outline",
  size = "sm",
  showStats = false
}: CacheRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Force refresh all specified endpoints
      const refreshPromises = endpoints.map(async (endpoint) => {
        try {
          // Clear session cache first
          sessionCache.clear(endpoint);
          
          // Fetch fresh data
          const response = await fetch(endpoint, { credentials: 'include' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data = await response.json();
          
          // Update session cache
          sessionCache.set(endpoint, data);
          
          // Update React Query cache
          queryClient.setQueryData([endpoint], data);
          
          return { endpoint, success: true };
        } catch (error) {
          console.error(`Failed to refresh ${endpoint}:`, error);
          return { endpoint, success: false, error };
        }
      });

      const results = await Promise.allSettled(refreshPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      // Invalidate React Query cache to trigger refetch
      await queryClient.invalidateQueries();

      toast({
        title: "Cache Refreshed",
        description: `Updated ${successful} endpoints${failed > 0 ? `, ${failed} failed` : ''}`,
        variant: failed > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Cache refresh failed:', error);
      toast({
        title: "Refresh Failed", 
        description: "Unable to refresh cache data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const cacheStats = sessionCache.getCacheStats();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      
      {showStats && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Database className="h-3 w-3" />
          <span>{cacheStats.active} cached</span>
        </div>
      )}
    </div>
  );
}

// Clear cache button for admin/debugging
export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleClear = async () => {
    setIsClearing(true);
    
    try {
      // Clear session cache
      sessionCache.clear();
      
      // Clear React Query cache
      await queryClient.clear();
      
      toast({
        title: "Cache Cleared",
        description: "All cached data has been cleared",
      });
    } catch (error) {
      console.error('Cache clear failed:', error);
      toast({
        title: "Clear Failed",
        description: "Unable to clear cache",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      variant="ghost" 
      size="sm"
      onClick={handleClear}
      disabled={isClearing}
      className="text-destructive hover:text-destructive"
    >
      {isClearing ? 'Clearing...' : 'Clear Cache'}
    </Button>
  );
}