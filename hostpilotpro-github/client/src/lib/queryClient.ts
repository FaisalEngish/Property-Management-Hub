import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { fastCache } from "./fastCache";
import { getInstantData } from "./instantData";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const cacheKey = queryKey[0] as string;
    
    // Check instant data first for immediate response
    const instantData = getInstantData(cacheKey);
    if (instantData) {
      console.log(`Instant data served: ${cacheKey}`);
      // Also cache it for consistency
      fastCache.set(cacheKey, instantData, 60);
      return instantData;
    }
    
    // Check fast cache second
    if (fastCache.has(cacheKey)) {
      const cached = fastCache.get(cacheKey);
      console.log(`Fast cache hit: ${cacheKey}`);
      return cached;
    }
    
    const res = await fetch(cacheKey, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
    // Store in fast cache for 30 minutes
    fastCache.set(cacheKey, data, 30);
    
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Allow reconnect refetch
      refetchOnMount: false, // Don't refetch on mount if cache exists
      staleTime: 120 * 1000, // 120 seconds to match session cache
      gcTime: 300 * 1000, // 5 minutes garbage collection  
      retry: 2, // Allow 2 retries for better reliability
      networkMode: 'online',
      notifyOnChangeProps: ['data', 'error'],
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
});

// Make queryClient globally available for session cache integration
if (typeof window !== 'undefined') {
  (window as any).queryClient = queryClient;
}
