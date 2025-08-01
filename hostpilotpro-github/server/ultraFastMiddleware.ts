import { Request, Response, NextFunction } from "express";

// Ultra-fast response cache middleware for instant responses
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function ultraFastCache(ttlMinutes: number = 10) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = `${req.method}:${req.url}:${(req as any).user?.id || 'anonymous'}`;
    const cached = responseCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`Ultra-fast cache hit: ${cacheKey}`);
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      responseCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000
      });
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Clean up cache every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      responseCache.delete(key);
    }
  }
}, 10 * 60 * 1000);