// Frontend speed optimization utilities

// Disable all React Query background refetching for maximum speed
export const SPEED_QUERY_OPTIONS = {
  refetchInterval: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: 60 * 60 * 1000, // 1 hour
  cacheTime: 120 * 60 * 1000, // 2 hours
  retry: 0, // No retries for speed
  networkMode: 'online' as const,
  notifyOnChangeProps: ['data', 'error'] as const,
};

// Preload critical data on app start
export function preloadCriticalData() {
  const criticalEndpoints = [
    '/api/properties',
    '/api/tasks',
    '/api/bookings',
    '/api/dashboard/stats'
  ];
  
  criticalEndpoints.forEach(endpoint => {
    fetch(endpoint, { credentials: 'include' })
      .then(res => res.json())
      .catch(() => {/* Silent fail for preload */});
  });
}

// Instant UI feedback with skeleton data
export const SKELETON_DATA = {
  properties: Array(4).fill(null).map((_, i) => ({
    id: i + 1,
    name: `Loading property ${i + 1}...`,
    status: 'loading'
  })),
  tasks: Array(3).fill(null).map((_, i) => ({
    id: i + 1,
    title: `Loading task ${i + 1}...`,
    status: 'loading'
  })),
  bookings: Array(2).fill(null).map((_, i) => ({
    id: i + 1,
    guestName: `Loading booking ${i + 1}...`,
    status: 'loading'
  }))
};