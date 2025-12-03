// Session-based cache for dashboard and finance data
// Provides 120-second caching with instant loading and background refresh

interface CacheEntry {
  data: any;
  timestamp: number;
  key: string;
  isStale?: boolean;
}

interface CacheUpdateListener {
  (key: string, data: any): void;
}

class SessionCache {
  private cache = new Map<string, CacheEntry>();
  private listeners = new Map<string, Set<CacheUpdateListener>>();
  private readonly CACHE_DURATION = 120 * 1000; // 120 seconds

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
      isStale: false
    });
    
    // Notify listeners of cache update
    this.notifyListeners(key, data);
  }

  // Add listener for cache updates
  addListener(key: string, listener: CacheUpdateListener): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
  }

  // Remove listener
  removeListener(key: string, listener: CacheUpdateListener): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.delete(listener);
      if (keyListeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  // Notify all listeners for a key
  private notifyListeners(key: string, data: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(key, data));
    }
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > this.CACHE_DURATION;
  }

  clear(keyPattern?: string): void {
    if (!keyPattern) {
      this.cache.clear();
      return;
    }

    // Clear keys matching pattern
    for (const [key] of this.cache) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  getAllCachedKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getCacheStats(): { total: number; expired: number; active: number } {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      expired,
      active
    };
  }

  // Preload critical dashboard data
  async preloadDashboardData(): Promise<void> {
    const criticalEndpoints = [
      '/api/dashboard/stats',
      '/api/properties',
      '/api/tasks',
      '/api/bookings',
      '/api/finance/analytics'
    ];

    const promises = criticalEndpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          this.set(endpoint, data);
        }
      } catch (error) {
        console.warn(`Failed to preload ${endpoint}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}

// Global session cache instance
export const sessionCache = new SessionCache();

// Cache-aware fetch function
export async function cachedFetch(
  url: string, 
  options: RequestInit = {},
  forceRefresh = false
): Promise<any> {
  // Return cached data immediately if available and not forcing refresh
  if (!forceRefresh) {
    const cached = sessionCache.get(url);
    if (cached) {
      // Start background refresh if data is getting stale
      if (sessionCache.isStale(url)) {
        backgroundRefresh(url, options);
      }
      return cached;
    }
  }

  // Fetch fresh data
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    sessionCache.set(url, data);
    return data;
  } catch (error) {
    // If fetch fails, return cached data as fallback (if available)
    const cached = sessionCache.get(url);
    if (cached) {
      console.warn(`Fetch failed for ${url}, using cached data:`, error);
      return cached;
    }
    throw error;
  }
}

// Background refresh without blocking UI
async function backgroundRefresh(url: string, options: RequestInit = {}): Promise<void> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      sessionCache.set(url, data);
      
      // Trigger a React Query cache update
      if (typeof window !== 'undefined' && (window as any).queryClient) {
        (window as any).queryClient.setQueryData([url], data);
      }
    }
  } catch (error) {
    console.warn(`Background refresh failed for ${url}:`, error);
  }
}

// Manual refresh utility
export async function forceRefresh(url: string): Promise<any> {
  sessionCache.clear(url);
  return cachedFetch(url, {}, true);
}

// Cache warming on app load
export function warmCache(): void {
  if (typeof window !== 'undefined') {
    // Warm cache after a short delay to avoid blocking initial render
    setTimeout(() => {
      sessionCache.preloadDashboardData();
    }, 1000);
  }
}