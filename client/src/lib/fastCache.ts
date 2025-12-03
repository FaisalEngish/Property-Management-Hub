// Ultra-fast in-memory cache for React Query
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class FastCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get all cache keys (for pattern-based invalidation)
  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  // Delete all keys matching a pattern
  deleteByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        console.log(`🗑️ Cleared fastCache: ${key}`);
      }
    }
  }

  // Auto-cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const fastCache = new FastCache();

// Cleanup every 5 minutes
setInterval(() => fastCache.cleanup(), 5 * 60 * 1000);