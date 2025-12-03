import { fastCache } from './fastCache';

export const queryKeys = {
  // Authentication
  auth: {
    user: () => ['/api/auth/user'] as const,
  },
  
  // Properties
  properties: {
    all: () => ['/api/properties'] as const,
    detail: (id: number | string) => ['/api/properties', id] as const,
  },
  
  // Finances
  finance: {
    all: () => ['/api/finance'] as const,
    analytics: (propertyId?: string | number) => 
      propertyId 
        ? [`/api/finance/analytics?propertyId=${propertyId}`] as const
        : ['/api/finance/analytics'] as const,
  },
  
  // Bookings
  bookings: {
    all: () => ['/api/bookings'] as const,
    withSource: (propertyId?: string | number) => 
      propertyId 
        ? [`/api/bookings/with-source?propertyId=${propertyId}`] as const
        : ['/api/bookings/with-source'] as const,
  },
  
  // Tasks
  tasks: {
    all: () => ['/api/tasks'] as const,
    byProperty: (propertyId: number | string) => ['/api/tasks', { propertyId }] as const,
  },
  
  // Utilities
  utilities: {
    all: () => ['/api/utilities'] as const,
    byProperty: (propertyId: number | string) => ['/api/utilities', { propertyId }] as const,
  },
  
  // Dashboard
  dashboard: {
    summary: () => ['/api/dashboard'] as const,
  },
  
  // Property Documents
  documents: {
    all: () => ['/api/property-documents'] as const,
    expiring: () => ['/api/property-documents/expiring'] as const,
    byProperty: (propertyId: number | string) => ['/api/property-documents', { propertyId }] as const,
  },
  
  // Users
  users: {
    all: () => ['/api/users'] as const,
  },
  
  // Services
  services: {
    all: () => ['/api/addon-services'] as const,
  },
  
  // Service Bookings
  serviceBookings: {
    all: () => ['/api/service-bookings'] as const,
  },
  
  // Staff
  staff: {
    all: () => ['/api/staff'] as const,
  },
  
  // Owners
  owners: {
    all: () => ['/api/owners'] as const,
  },
  
  // Settings
  settings: {
    system: () => ['/api/system-settings'] as const,
    currency: () => ['/api/currency/rates'] as const,
  },
  
  // Inventory
  inventory: {
    all: () => ['/api/inventory'] as const,
  },
  
  // Vendors
  vendors: {
    all: () => ['/api/vendors'] as const,
  },
};

// Resource type to query patterns mapping for real-time invalidation
export type RealtimeResourceType = 
  | 'property' 
  | 'task' 
  | 'booking' 
  | 'finance' 
  | 'service' 
  | 'serviceBooking'
  | 'staff' 
  | 'utility' 
  | 'document'
  | 'owner'
  | 'settings'
  | 'automation'
  | 'inventory'
  | 'vendor'
  | 'investment'
  | 'review'
  | 'certification'
  | 'securityDeposit'
  | 'sustainability'
  | 'sharedCost'
  | 'chat';

// Mapping of resource types to cache patterns that need invalidation
// Note: /api/finance/analytics is explicitly listed for resources that affect finance metrics
export const resourceToCachePatterns: Record<RealtimeResourceType, string[]> = {
  property: ['/api/properties', '/api/dashboard', '/api/fast/properties', '/api/finance', '/api/finance/analytics'],
  task: ['/api/tasks', '/api/dashboard', '/api/fast/tasks', '/api/ultra-fast-tasks', '/api/finance', '/api/finance/analytics'],
  booking: ['/api/bookings', '/api/dashboard', '/api/finance', '/api/finance/analytics', '/api/booking-revenue'],
  finance: ['/api/finance', '/api/finance/analytics', '/api/dashboard', '/api/booking-revenue'],
  service: ['/api/addon-services', '/api/services'],
  serviceBooking: ['/api/service-bookings', '/api/finance', '/api/finance/analytics', '/api/dashboard'],
  staff: ['/api/staff', '/api/dashboard'],
  utility: ['/api/utilities', '/api/utility-bills', '/api/dashboard', '/api/finance', '/api/finance/analytics'],
  document: ['/api/property-documents', '/api/documents'],
  owner: ['/api/owners', '/api/owner'],
  settings: ['/api/system-settings', '/api/currency', '/api/dashboard', '/api/finance', '/api/finance/analytics', '/api/properties', '/api/bookings'],
  automation: ['/api/automation', '/api/tasks'],
  inventory: ['/api/inventory'],
  vendor: ['/api/vendors'],
  investment: ['/api/investments', '/api/property-investments', '/api/finance', '/api/finance/analytics'],
  review: ['/api/reviews', '/api/property-reviews'],
  certification: ['/api/certifications', '/api/staff-certifications'],
  securityDeposit: ['/api/security-deposits', '/api/finance', '/api/finance/analytics'],
  sustainability: ['/api/sustainability', '/api/sustainability-metrics'],
  sharedCost: ['/api/shared-costs', '/api/finance', '/api/finance/analytics'],
  chat: ['/api/chat', '/api/property-chat'],
};

// Helper to clear fastCache entries by pattern
const clearFastCacheByPattern = (pattern: string) => {
  fastCache.deleteByPattern(pattern);
};

// Centralized helper to check if any query key element matches a pattern
// Handles:
// - Simple keys: ['/api/xxx']
// - Parameterized keys: ['/api/xxx', { id: 123 }]
// - Nested filter objects: ['/api/xxx', { filters: { propertyId: 66 } }]
// The URL pattern is always the first string element in the query key array
export const matchesQueryKeyPattern = (queryKey: any[], patterns: string[]): boolean => {
  for (const keyElement of queryKey) {
    // Check if this element matches any pattern (for string elements like '/api/finance/analytics')
    if (typeof keyElement === 'string') {
      if (patterns.some(p => keyElement.includes(p))) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to invalidate related queries AND clear fastCache
// Using refetchQueries with type: 'active' forces immediate refetch of active queries
export const invalidateFinanceQueries = async (queryClient: any) => {
  // Clear fastCache first to ensure fresh data on refetch
  clearFastCacheByPattern('/api/finance');
  clearFastCacheByPattern('/api/dashboard');
  
  // Force refetch active queries
  await queryClient.refetchQueries({ queryKey: queryKeys.finance.all(), type: 'active' });
  
  // Invalidate finance analytics including parameterized queries like ['/api/finance/analytics', { propertyId: 66 }]
  queryClient.invalidateQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance/analytics'])
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
  
  // Refetch active finance analytics queries immediately
  await queryClient.refetchQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance']),
    type: 'active'
  });
};

export const invalidatePropertyQueries = async (queryClient: any) => {
  // Clear fastCache first to ensure fresh data on refetch
  clearFastCacheByPattern('/api/properties');
  clearFastCacheByPattern('/api/dashboard');
  
  // Force refetch active queries
  await queryClient.refetchQueries({ queryKey: queryKeys.properties.all(), type: 'active' });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
};

export const invalidateBookingQueries = async (queryClient: any) => {
  // Clear fastCache first to ensure fresh data on refetch
  clearFastCacheByPattern('/api/bookings');
  clearFastCacheByPattern('/api/finance');
  clearFastCacheByPattern('/api/dashboard');
  
  // Force refetch active queries
  await queryClient.refetchQueries({ queryKey: queryKeys.bookings.all(), type: 'active' });
  queryClient.invalidateQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/bookings/with-source'])
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() });
  queryClient.invalidateQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance/analytics'])
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
  
  // Refetch active finance queries immediately
  await queryClient.refetchQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance']),
    type: 'active'
  });
};

export const invalidateTaskQueries = async (queryClient: any) => {
  // Clear fastCache first to ensure fresh data on refetch
  // Tasks affect finance (estimated costs) and dashboard stats
  clearFastCacheByPattern('/api/tasks');
  clearFastCacheByPattern('/api/dashboard');
  clearFastCacheByPattern('/api/finance');
  
  // Force refetch active queries
  await queryClient.refetchQueries({ queryKey: queryKeys.tasks.all(), type: 'active' });
  
  // Also invalidate finance and dashboard which depend on task data
  queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() });
  queryClient.invalidateQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance/analytics'])
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
  
  // Refetch active finance queries immediately
  await queryClient.refetchQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance', '/api/dashboard']),
    type: 'active'
  });
};

export const invalidateUtilityQueries = async (queryClient: any) => {
  // Clear fastCache first to ensure fresh data on refetch
  // Utilities affect finance (expenses) and dashboard stats
  clearFastCacheByPattern('/api/utilities');
  clearFastCacheByPattern('/api/dashboard');
  clearFastCacheByPattern('/api/finance');
  
  // Force refetch active queries
  await queryClient.refetchQueries({ queryKey: queryKeys.utilities.all(), type: 'active' });
  
  // Also invalidate finance which depends on utility expenses
  queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() });
  queryClient.invalidateQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance/analytics'])
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
  
  // Refetch active finance queries immediately
  await queryClient.refetchQueries({ 
    predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, ['/api/finance']),
    type: 'active'
  });
};

export const invalidateDocumentQueries = async (queryClient: any) => {
  // Clear fastCache first to ensure fresh data on refetch
  clearFastCacheByPattern('/api/property-documents');
  clearFastCacheByPattern('/api/dashboard');
  
  // Force refetch active queries
  await queryClient.refetchQueries({ queryKey: queryKeys.documents.all(), type: 'active' });
  queryClient.invalidateQueries({ queryKey: queryKeys.documents.expiring() });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
};

export const invalidateSystemSettingsQueries = async (queryClient: any) => {
  // Clear ALL caches first to ensure fresh data
  clearFastCacheByPattern('/api/system-settings');
  clearFastCacheByPattern('/api/currency');
  clearFastCacheByPattern('/api/dashboard');
  clearFastCacheByPattern('/api/finance');
  clearFastCacheByPattern('/api/properties');
  clearFastCacheByPattern('/api/bookings');
  
  // Force immediate refetch (not just mark stale) for critical queries
  await queryClient.refetchQueries({ queryKey: ['/api/system-settings'], type: 'active' });
  await queryClient.refetchQueries({ queryKey: ['/api/currency/rates'], type: 'active' });
  
  // Invalidate related queries to trigger refetch on next access
  queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
  queryClient.invalidateQueries({ queryKey: queryKeys.properties.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
};

export const invalidateServiceQueries = async (queryClient: any) => {
  clearFastCacheByPattern('/api/addon-services');
  clearFastCacheByPattern('/api/services');
  await queryClient.refetchQueries({ queryKey: queryKeys.services.all(), type: 'active' });
};

export const invalidateServiceBookingQueries = async (queryClient: any) => {
  clearFastCacheByPattern('/api/service-bookings');
  clearFastCacheByPattern('/api/finance');
  clearFastCacheByPattern('/api/dashboard');
  await queryClient.refetchQueries({ queryKey: queryKeys.serviceBookings.all(), type: 'active' });
  queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
};

export const invalidateStaffQueries = async (queryClient: any) => {
  clearFastCacheByPattern('/api/staff');
  clearFastCacheByPattern('/api/dashboard');
  await queryClient.refetchQueries({ queryKey: queryKeys.staff.all(), type: 'active' });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
};

export const invalidateOwnerQueries = async (queryClient: any) => {
  clearFastCacheByPattern('/api/owners');
  clearFastCacheByPattern('/api/owner');
  await queryClient.refetchQueries({ queryKey: queryKeys.owners.all(), type: 'active' });
};

export const invalidateInventoryQueries = async (queryClient: any) => {
  clearFastCacheByPattern('/api/inventory');
  await queryClient.refetchQueries({ queryKey: queryKeys.inventory.all(), type: 'active' });
};

export const invalidateVendorQueries = async (queryClient: any) => {
  clearFastCacheByPattern('/api/vendors');
  await queryClient.refetchQueries({ queryKey: queryKeys.vendors.all(), type: 'active' });
};

// Master invalidation function for real-time updates
export const invalidateByResourceType = async (queryClient: any, resourceType: RealtimeResourceType) => {
  const patterns = resourceToCachePatterns[resourceType] || [];
  
  // Clear all fastCache entries for the resource patterns
  for (const pattern of patterns) {
    clearFastCacheByPattern(pattern);
  }
  
  // Invalidate and refetch queries based on resource type
  switch (resourceType) {
    case 'property':
      await invalidatePropertyQueries(queryClient);
      break;
    case 'task':
      await invalidateTaskQueries(queryClient);
      break;
    case 'booking':
      await invalidateBookingQueries(queryClient);
      break;
    case 'finance':
      await invalidateFinanceQueries(queryClient);
      break;
    case 'service':
      await invalidateServiceQueries(queryClient);
      break;
    case 'serviceBooking':
      await invalidateServiceBookingQueries(queryClient);
      break;
    case 'staff':
      await invalidateStaffQueries(queryClient);
      break;
    case 'utility':
      await invalidateUtilityQueries(queryClient);
      break;
    case 'document':
      await invalidateDocumentQueries(queryClient);
      break;
    case 'owner':
      await invalidateOwnerQueries(queryClient);
      break;
    case 'settings':
      await invalidateSystemSettingsQueries(queryClient);
      break;
    case 'inventory':
      await invalidateInventoryQueries(queryClient);
      break;
    case 'vendor':
      await invalidateVendorQueries(queryClient);
      break;
    default:
      // For other resource types, invalidate based on patterns using centralized helper
      // Handle both simple keys ['/api/xxx'] and parameterized keys ['/api/xxx', { id: 123 }]
      queryClient.invalidateQueries({
        predicate: (query: any) => matchesQueryKeyPattern(query.queryKey, patterns)
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
  }
  
  console.log(`[RT] Invalidated queries for resource: ${resourceType}`);
};
