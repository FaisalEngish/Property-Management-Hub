import { useEffect } from 'react';
import { queryClient } from '../lib/queryClient';

// Pre-cache critical endpoints on app start for instant navigation
export function InstantPageSwitcher() {
  useEffect(() => {
    const preCacheEndpoints = [
      '/api/properties',
      '/api/tasks', 
      '/api/bookings',
      '/api/dashboard/stats',
      '/api/finance',
      '/api/finance/analytics',
      '/api/users'
    ];

    // Pre-cache all hub page data immediately
    preCacheEndpoints.forEach(endpoint => {
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 60 * 60 * 1000, // 1 hour
      });
    });

    // Also pre-cache the hub page routes themselves
    const hubRoutes = ['/dashboard-hub', '/property-hub', '/finance-hub', '/system-hub'];
    hubRoutes.forEach(route => {
      queryClient.prefetchQuery({
        queryKey: ['route', route],
        queryFn: () => Promise.resolve(true),
        staleTime: 60 * 60 * 1000,
      });
    });
  }, []);

  return null; // This component has no UI
}