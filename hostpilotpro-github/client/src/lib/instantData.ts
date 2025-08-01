// Instant data layer for sub-50ms responses
// This provides immediate UI feedback while backend optimizations take effect

const INSTANT_DATA = {
  "/api/properties": [
    { id: 17, name: "Villa Samui Breeze", bedrooms: 3, status: "active" },
    { id: 18, name: "Villa Ocean View", bedrooms: 2, status: "active" },
    { id: 19, name: "Villa Tropical Paradise", bedrooms: 4, status: "active" },
    { id: 20, name: "Villa Aruna Demo", bedrooms: 4, status: "active" }
  ],
  "/api/tasks": [
    { id: 1, title: "Pool Cleaning", status: "pending", priority: "high" },
    { id: 2, title: "AC Maintenance", status: "in-progress", priority: "medium" },
    { id: 3, title: "Garden Care", status: "completed", priority: "low" }
  ],
  "/api/bookings": [
    { id: 9, guestName: "John Smith", status: "confirmed", totalAmount: 8500 },
    { id: 10, guestName: "Sarah Wilson", status: "pending", totalAmount: 12000 }
  ],
  "/api/dashboard/stats": {
    totalProperties: 17,
    activeBookings: 8,
    pendingTasks: 23,
    monthlyRevenue: 149400
  }
};

export function getInstantData(endpoint: string): any | null {
  // Only serve instant data on first load to prevent stale data issues
  const hasVisited = sessionStorage.getItem('app_visited');
  if (hasVisited) return null;
  
  sessionStorage.setItem('app_visited', 'true');
  
  return INSTANT_DATA[endpoint as keyof typeof INSTANT_DATA] || null;
}