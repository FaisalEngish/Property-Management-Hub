import { QueryClient } from "@tanstack/react-query";
import { fastCache } from "./fastCache";

type ResourceType = 
  | 'task'
  | 'property'
  | 'booking'
  | 'finance'
  | 'document'
  | 'utility'
  | 'service'
  | 'serviceBooking'
  | 'staff'
  | 'owner'
  | 'settings'
  | 'inventory'
  | 'vendor'
  | 'dashboard';

const CROSS_MODULE_DEPENDENCIES: Record<ResourceType, ResourceType[]> = {
  task: ['dashboard', 'finance'],
  property: ['dashboard', 'finance', 'booking'],
  booking: ['dashboard', 'finance'],
  finance: ['dashboard'],
  document: ['dashboard'],
  utility: ['dashboard', 'finance'],
  service: [],
  serviceBooking: ['dashboard', 'finance'],
  staff: ['dashboard'],
  owner: [],
  settings: ['dashboard', 'finance', 'property', 'booking'],
  inventory: [],
  vendor: [],
  dashboard: [],
};

const RESOURCE_CACHE_PATTERNS: Record<ResourceType, string[]> = {
  task: ['/api/tasks', '/api/fast/tasks', '/api/ultra-fast-tasks', '/api/dashboard', '/api/finance', '/api/finance/analytics'],
  property: ['/api/properties', '/api/fast/properties', '/api/dashboard', '/api/finance', '/api/finance/analytics'],
  booking: ['/api/bookings', '/api/booking-revenue', '/api/dashboard', '/api/finance', '/api/finance/analytics'],
  finance: ['/api/finance', '/api/finance/analytics', '/api/booking-revenue', '/api/dashboard'],
  document: ['/api/property-documents', '/api/documents'],
  utility: ['/api/utilities', '/api/utility-bills', '/api/finance', '/api/finance/analytics'],
  service: ['/api/addon-services', '/api/services'],
  serviceBooking: ['/api/service-bookings', '/api/finance', '/api/finance/analytics'],
  staff: ['/api/staff', '/api/staff-members'],
  owner: ['/api/owners', '/api/owner'],
  settings: ['/api/system-settings', '/api/currency', '/api/finance', '/api/finance/analytics'],
  inventory: ['/api/inventory'],
  vendor: ['/api/vendors'],
  dashboard: ['/api/dashboard'],
};

const RESOURCE_QUERY_KEYS: Record<ResourceType, (string | readonly string[])[]> = {
  task: [['/api/tasks'], ['/api/dashboard/task-stats'], ['/api/dashboard/recent-tasks']],
  property: [['/api/properties'], ['/api/dashboard/stats']],
  booking: [['/api/bookings'], ['/api/bookings/with-source']],
  finance: [['/api/finance'], ['/api/finance/analytics'], ['/api/booking-revenue']],
  document: [['/api/property-documents'], ['/api/property-documents/expiring']],
  utility: [['/api/utilities'], ['/api/utility-bills']],
  service: [['/api/addon-services']],
  serviceBooking: [['/api/service-bookings']],
  staff: [['/api/staff'], ['/api/staff-members']],
  owner: [['/api/owners']],
  settings: [['/api/system-settings'], ['/api/currency/rates']],
  inventory: [['/api/inventory']],
  vendor: [['/api/vendors']],
  dashboard: [['/api/dashboard'], ['/api/dashboard/stats']],
};

class CacheManager {
  private queryClient: QueryClient | null = null;

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  private clearFastCacheForResource(resourceType: ResourceType) {
    const patterns = RESOURCE_CACHE_PATTERNS[resourceType] || [];
    for (const pattern of patterns) {
      fastCache.deleteByPattern(pattern);
    }
  }

  private async refetchQueriesForResource(resourceType: ResourceType) {
    if (!this.queryClient) {
      console.warn('[CacheManager] QueryClient not set');
      return;
    }

    const patterns = RESOURCE_CACHE_PATTERNS[resourceType] || [];
    
    // Helper to check if a query key matches any pattern
    // Handles both simple keys ['/api/finance'] and parameterized keys ['/api/finance/analytics', { propertyId: 66 }]
    const matchesPattern = (queryKey: readonly unknown[]): boolean => {
      for (const keyElement of queryKey) {
        if (typeof keyElement === 'string') {
          if (patterns.some(pattern => keyElement.includes(pattern))) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Invalidate all queries that match any of the resource patterns
    this.queryClient.invalidateQueries({
      predicate: (query) => matchesPattern(query.queryKey)
    });
    
    // Also refetch active queries using the predicate approach
    await this.queryClient.refetchQueries({
      predicate: (query) => matchesPattern(query.queryKey),
      type: 'active',
    });
    
    console.log(`[CacheManager] Refetched queries for: ${resourceType}`);
  }

  async invalidateResource(resourceType: ResourceType, options?: { skipDependencies?: boolean }) {
    console.log(`[CacheManager] Invalidating: ${resourceType}`);
    
    this.clearFastCacheForResource(resourceType);
    
    await this.refetchQueriesForResource(resourceType);
    
    if (!options?.skipDependencies) {
      const dependencies = CROSS_MODULE_DEPENDENCIES[resourceType] || [];
      for (const dep of dependencies) {
        console.log(`[CacheManager] Invalidating dependency: ${dep}`);
        this.clearFastCacheForResource(dep);
        await this.refetchQueriesForResource(dep);
      }
    }
  }

  async invalidateMultiple(resourceTypes: ResourceType[]) {
    const allResources = new Set<ResourceType>();
    
    for (const type of resourceTypes) {
      allResources.add(type);
      const deps = CROSS_MODULE_DEPENDENCIES[type] || [];
      deps.forEach(d => allResources.add(d));
    }
    
    for (const resource of allResources) {
      this.clearFastCacheForResource(resource);
    }
    
    for (const resource of allResources) {
      await this.refetchQueriesForResource(resource);
    }
  }

  clearAll() {
    fastCache.clear();
    this.queryClient?.clear();
    console.log('[CacheManager] Cleared all caches');
  }
}

export const cacheManager = new CacheManager();

export function initializeCacheManager(queryClient: QueryClient) {
  cacheManager.setQueryClient(queryClient);
  console.log('[CacheManager] Initialized');
}

export async function invalidateOnMutation(
  queryClient: QueryClient,
  resourceType: ResourceType
) {
  cacheManager.setQueryClient(queryClient);
  await cacheManager.invalidateResource(resourceType);
}

export type { ResourceType };
