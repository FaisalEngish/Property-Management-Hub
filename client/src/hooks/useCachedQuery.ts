import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { sessionCache } from '@/lib/sessionCache';

// Enhanced query hook that integrates with session cache
export function useCachedQuery<T = any>(
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      // Try cache first
      const cached = sessionCache.get(endpoint);
      if (cached && !sessionCache.isStale(endpoint)) {
        return cached;
      }

      // Fetch from server
      const response = await fetch(endpoint, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the response
      sessionCache.set(endpoint, data);
      
      return data;
    },
    staleTime: 120 * 1000, // 2 minutes
    gcTime: 300 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options
  });
}

// Hook for multiple endpoints with shared cache
export function useCachedQueries(endpoints: string[]) {
  const queries = endpoints.map(endpoint => ({
    queryKey: [endpoint],
    queryFn: async () => {
      const cached = sessionCache.get(endpoint);
      if (cached && !sessionCache.isStale(endpoint)) {
        return cached;
      }

      const response = await fetch(endpoint, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
      
      const data = await response.json();
      sessionCache.set(endpoint, data);
      return data;
    },
    staleTime: 120 * 1000,
    gcTime: 300 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  }));

  return queries;
}