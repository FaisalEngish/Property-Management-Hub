import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Clock } from "lucide-react";
import { useCache } from "@/context/CacheContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { sessionCache } from "@/lib/sessionCache";

interface RefreshDataButtonProps {
  endpoints?: string[];
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showStats?: boolean;
  showLastUpdate?: boolean;
  className?: string;
}

export default function RefreshDataButton({ 
  endpoints = [
    '/api/dashboard/stats',
    '/api/properties',
    '/api/tasks',
    '/api/bookings',
    '/api/finance',
    '/api/finance/analytics',
    '/api/users'
  ],
  variant = "outline",
  size = "sm",
  showStats = false,
  showLastUpdate = false,
  className = ""
}: RefreshDataButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshData, clearCache } = useCache();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const refreshPromises = endpoints.map(async (endpoint) => {
        try {
          await refreshData(endpoint);
          return { endpoint, success: true };
        } catch (error) {
          console.error(`Failed to refresh ${endpoint}:`, error);
          return { endpoint, success: false, error };
        }
      });

      const results = await Promise.allSettled(refreshPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      toast({
        title: "Data Refreshed",
        description: `Updated ${successful} endpoints${failed > 0 ? `, ${failed} failed` : ''}`,
        variant: failed > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Data refresh failed:', error);
      toast({
        title: "Refresh Failed", 
        description: "Unable to refresh data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const cacheStats = sessionCache.getCacheStats();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {size !== "sm" && (isRefreshing ? 'Refreshing...' : 'Refresh Data')}
      </Button>
      
      {showStats && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>{cacheStats.active} cached</span>
        </Badge>
      )}

      {showLastUpdate && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated</span>
        </Badge>
      )}
    </div>
  );
}

// Clear cache button for admin/debugging
export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);
  const { clearCache } = useCache();
  const { toast } = useToast();

  const handleClear = async () => {
    setIsClearing(true);
    
    try {
      clearCache();
      
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