// Instant data layer for sub-50ms responses
// This provides immediate UI feedback while backend optimizations take effect
// IMPORTANT: Do NOT include data that should show real counts immediately (like properties)
// Only include endpoints where showing placeholder data is acceptable

const INSTANT_DATA = {
  // REMOVED: "/api/properties" - Properties should always fetch real data to show accurate counts
  // REMOVED: "/api/tasks" - Tasks should show real data
  // REMOVED: "/api/bookings" - Bookings should show real data
  // REMOVED: "/api/dashboard/stats" - Stats should show real data
};

export function getInstantData(endpoint: string): any | null {
  // Only serve instant data on first load to prevent stale data issues
  const hasVisited = sessionStorage.getItem('app_visited');
  if (hasVisited) return null;
  
  sessionStorage.setItem('app_visited', 'true');
  
  return INSTANT_DATA[endpoint as keyof typeof INSTANT_DATA] || null;
}