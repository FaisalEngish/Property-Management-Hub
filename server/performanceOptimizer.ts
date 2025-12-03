import { Response } from "express";

// Memory cache for frequent database queries
const memoryCache = new Map<string, { data: any; expiry: number }>();

export function cacheResponse(key: string, data: any, minutes: number = 10) {
  const expiry = Date.now() + (minutes * 60 * 1000);
  memoryCache.set(key, { data, expiry });
}

export function getCachedResponse(key: string): any | null {
  const cached = memoryCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  if (cached) {
    memoryCache.delete(key);
  }
  return null;
}

export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
  } else {
    memoryCache.clear();
  }
}

// Fast response middleware
export function sendCachedOrFetch(
  cacheKey: string,
  fetchFn: () => Promise<any>,
  res: Response,
  cacheMinutes: number = 10
) {
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log(`Cache hit: ${cacheKey}`);
    return res.json(cached);
  }

  return fetchFn().then(data => {
    cacheResponse(cacheKey, data, cacheMinutes);
    res.json(data);
  }).catch(error => {
    console.error(`Error in ${cacheKey}:`, error);
    res.status(500).json({ message: "Internal server error" });
  });
}

// Clean up expired cache entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiry <= now) {
      memoryCache.delete(key);
    }
  }
}, 5 * 60 * 1000);