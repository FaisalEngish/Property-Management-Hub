import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// High-performance query hook with aggressive caching
export function usePerformanceQuery<T>(
  queryKey: string[],
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey,
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
    ...options,
  });
}

// Ultra-fast query for static/rarely changing data
export function useStaticQuery<T>(
  queryKey: string[],
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey,
    staleTime: 60 * 60 * 1000, // 1 hour cache
    gcTime: 2 * 60 * 60 * 1000, // 2 hours garbage collection
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
    ...options,
  });
}