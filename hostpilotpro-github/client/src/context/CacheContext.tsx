import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sessionCache } from '@/lib/sessionCache';

interface CacheContextType {
  getCachedData: (key: string) => any;
  setCachedData: (key: string, data: any) => void;
  refreshData: (key: string) => Promise<void>;
  isStale: (key: string) => boolean;
  clearCache: (keyPattern?: string) => void;
  subscribeToCacheUpdates: (key: string, callback: (data: any) => void) => () => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

interface CacheProviderProps {
  children: ReactNode;
}

export function CacheProvider({ children }: CacheProviderProps) {
  const [, forceUpdate] = useState({});

  const getCachedData = (key: string) => {
    return sessionCache.get(key);
  };

  const setCachedData = (key: string, data: any) => {
    sessionCache.set(key, data);
    forceUpdate({}); // Trigger re-render
  };

  const refreshData = async (key: string) => {
    try {
      const response = await fetch(key, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCachedData(key, data);
        return data;
      }
    } catch (error) {
      console.error(`Failed to refresh data for ${key}:`, error);
    }
  };

  const isStale = (key: string) => {
    return sessionCache.isStale(key);
  };

  const clearCache = (keyPattern?: string) => {
    sessionCache.clear(keyPattern);
    forceUpdate({}); // Trigger re-render
  };

  const subscribeToCacheUpdates = (key: string, callback: (data: any) => void) => {
    const listener = (cacheKey: string, data: any) => {
      if (cacheKey === key) {
        callback(data);
      }
    };
    
    sessionCache.addListener(key, listener);
    
    // Return unsubscribe function
    return () => {
      sessionCache.removeListener(key, listener);
    };
  };

  const contextValue: CacheContextType = {
    getCachedData,
    setCachedData,
    refreshData,
    isStale,
    clearCache,
    subscribeToCacheUpdates
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}

// Hook for automatic cache-first data fetching with background refresh
export function useCachedData<T = any>(
  key: string,
  fetchFn?: () => Promise<T>,
  options: { 
    backgroundRefresh?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getCachedData, setCachedData, subscribeToCacheUpdates, isStale } = useCache();
  const [data, setData] = useState<T | null>(() => getCachedData(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = subscribeToCacheUpdates(key, (newData) => {
      setData(newData);
      setIsLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [key, subscribeToCacheUpdates]);

  // Fetch data function
  const fetchData = async (fromCache = true) => {
    try {
      setError(null);
      
      // Try cache first if enabled
      if (fromCache) {
        const cached = getCachedData(key);
        if (cached) {
          setData(cached);
          setIsLoading(false);
          
          // Background refresh if stale
          if (isStale(key) && options.backgroundRefresh !== false) {
            fetchData(false); // Background fetch without using cache
          }
          return cached;
        }
      }

      setIsLoading(true);
      
      let result: T;
      if (fetchFn) {
        result = await fetchFn();
      } else {
        // Default fetch
        const response = await fetch(key, { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        result = await response.json();
      }

      setCachedData(key, result);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Fallback to cached data if available
      const cached = getCachedData(key);
      if (cached) {
        setData(cached);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [key]);

  // Refetch interval
  useEffect(() => {
    if (options.refetchInterval) {
      const interval = setInterval(() => {
        fetchData(false); // Background refresh
      }, options.refetchInterval);

      return () => clearInterval(interval);
    }
  }, [options.refetchInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(false),
    isStale: isStale(key)
  };
}