import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup expired entries periodically (every 5 minutes)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client identifier: authenticated userId preferred, fallback to client IP
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'anonymous';

    const userId = (req as any).user?.id;
    const key = userId ? `user:${userId}` : `ip:${clientIp}`;

    const now = Date.now();
    const existing = store.get(key);

    if (!existing || now > existing.resetAt) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', options.max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + options.windowMs) / 1000));
      return next();
    }

    if (existing.count >= options.max) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(existing.resetAt / 1000));
      res.status(429).json({
        success: false,
        error: options.message,
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    existing.count++;
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', options.max - existing.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(existing.resetAt / 1000));
    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 200 : 20,
  message: 'Too many authentication attempts. Please try again after 60 seconds.',
});

export const syncRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 200 : 30,
  message: 'Too many synchronization requests. Please wait a minute before syncing again.',
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 200 : 30,
  message: 'AI inference rate limit exceeded. Please wait a moment before sending more prompts.',
});
