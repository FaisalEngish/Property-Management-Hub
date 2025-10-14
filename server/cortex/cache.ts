/**
 * Simple in-memory cache for Captain Cortex AI
 * 60 second TTL with cache invalidation support
 */

import { logger } from '../logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

const CACHE_TTL = 60 * 1000; // 60 seconds
const cache = new Map<string, CacheEntry<any>>();

/**
 * Generate cache key from question and organizationId
 */
export function generateCacheKey(question: string, organizationId: string): string {
  const normalizedQuestion = question.toLowerCase().trim();
  return `cortex:${organizationId}:${normalizedQuestion}`;
}

/**
 * Get from cache
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  const age = Date.now() - entry.timestamp;
  
  if (age > CACHE_TTL) {
    // Expired, remove from cache
    cache.delete(key);
    return null;
  }
  
  logger.info('[CORTEX CACHE] Hit', { key, age });
  return entry.data as T;
}

/**
 * Set to cache
 */
export function setToCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    key
  });
  
  logger.info('[CORTEX CACHE] Set', { key });
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    // Clear all
    const size = cache.size;
    cache.clear();
    logger.info('[CORTEX CACHE] Cleared all', { entriesRemoved: size });
    return;
  }
  
  // Remove entries matching pattern
  let removed = 0;
  for (const [key] of cache) {
    if (key.includes(pattern)) {
      cache.delete(key);
      removed++;
    }
  }
  
  logger.info('[CORTEX CACHE] Invalidated', { pattern, entriesRemoved: removed });
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  
  for (const [, entry] of cache) {
    const age = now - entry.timestamp;
    if (age > CACHE_TTL) {
      expired++;
    } else {
      active++;
    }
  }
  
  return {
    total: cache.size,
    active,
    expired,
    ttl: CACHE_TTL
  };
}
