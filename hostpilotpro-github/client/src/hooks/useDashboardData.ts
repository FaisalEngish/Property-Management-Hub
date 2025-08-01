import { useCachedData } from '@/context/CacheContext';

// Dashboard stats with automatic background refresh
export function useDashboardStats() {
  return useCachedData('/api/dashboard/stats', undefined, {
    backgroundRefresh: true,
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });
}

// Properties data with caching
export function usePropertiesData() {
  return useCachedData('/api/properties', undefined, {
    backgroundRefresh: true,
    refetchInterval: 3 * 60 * 1000 // 3 minutes
  });
}

// Tasks data with caching
export function useTasksData() {
  return useCachedData('/api/tasks', undefined, {
    backgroundRefresh: true,
    refetchInterval: 2 * 60 * 1000 // 2 minutes
  });
}

// Bookings data with caching
export function useBookingsData() {
  return useCachedData('/api/bookings', undefined, {
    backgroundRefresh: true,
    refetchInterval: 2 * 60 * 1000 // 2 minutes
  });
}

// Finance data with caching
export function useFinanceData() {
  return useCachedData('/api/finance', undefined, {
    backgroundRefresh: true,
    refetchInterval: 3 * 60 * 1000 // 3 minutes
  });
}

// Finance analytics with caching
export function useFinanceAnalytics() {
  return useCachedData('/api/finance/analytics', undefined, {
    backgroundRefresh: true,
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });
}

// Users data with caching
export function useUsersData() {
  return useCachedData('/api/users', undefined, {
    backgroundRefresh: true,
    refetchInterval: 10 * 60 * 1000 // 10 minutes
  });
}