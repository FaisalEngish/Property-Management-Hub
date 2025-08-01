// Performance optimization utilities for HostPilotPro
import { QueryClient } from '@tanstack/react-query';

// Enhanced query client configuration for better performance
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive caching for better performance
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: 'always',
        // Enable background refetch for fresh data
        refetchInterval: 10 * 60 * 1000, // 10 minutes
      },
      mutations: {
        retry: 1,
      }
    }
  });
};

// Pre-cache critical endpoints for instant loading
export const preCacheCriticalData = async (queryClient: QueryClient) => {
  const endpoints = [
    '/api/auth/user',
    '/api/properties', 
    '/api/dashboard/stats',
    '/api/tasks',
    '/api/bookings'
  ];

  // Pre-fetch all critical endpoints in parallel
  await Promise.allSettled(
    endpoints.map(endpoint => 
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 5 * 60 * 1000
      })
    )
  );
};

// Fast cache for frequently accessed static data
class FastCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes: number = 30) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const fastCache = new FastCache();

// Menu performance optimizer
export const optimizeMenuLoading = {
  // Cache menu items for 1 hour
  cacheMenuItems: (userRole: string, menuItems: any[]) => {
    fastCache.set(`menu-${userRole}`, menuItems, 60);
  },

  getCachedMenuItems: (userRole: string) => {
    return fastCache.get(`menu-${userRole}`);
  },

  // Lazy load menu sections
  lazyLoadMenuSections: (sections: string[]) => {
    return sections.map(section => ({
      section,
      loaded: false,
      loading: false
    }));
  }
};

// Instant data layer for critical endpoints
export const instantDataLayer = {
  // Static responses for immediate UI feedback
  staticResponses: {
    '/api/properties': [],
    '/api/tasks': [],
    '/api/bookings': [],
    '/api/dashboard/stats': {
      totalProperties: 0,
      activeBookings: 0,
      completedTasks: 0,
      pendingTasks: 0
    }
  },

  // Serve instant static response
  getInstantResponse: (endpoint: string) => {
    console.log('Instant data served:', endpoint);
    return instantDataLayer.staticResponses[endpoint as keyof typeof instantDataLayer.staticResponses];
  }
};