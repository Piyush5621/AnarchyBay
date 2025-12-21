import { getRedis } from '../lib/redis.js';
import { RateLimitError } from './errorHandler.js';
import { logger } from '../lib/logger.js';

export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    maxRequests = 100,
    keyPrefix = 'ratelimit',
    keyGenerator = (req) => req.ip || 'unknown',
  } = options;

  return async (req, res, next) => {
    const redis = getRedis();

    // ✅ FIXED: Silent skip in development
    if (!redis) {
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Rate limiting skipped: Redis not available');
      }
      return next();
    }

    try {
      const identifier = keyGenerator(req);
      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      const multi = redis.multi();
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zadd(key, now, `${now}-${Math.random()}`);
      multi.zcard(key);
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      
      // Ensure results exist before accessing
      if (!results) {
        return next();
      }

      const count = results[2][1];

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      if (count > maxRequests) {
        logger.warn(
          { identifier, count, maxRequests, requestId: req.id },
          'Rate limit exceeded'
        );
        throw new RateLimitError(
          `Too many requests. Please try again in ${Math.ceil(windowMs / 1000)} seconds.`
        );
      }

      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        next(error);
      } else {
        logger.error({ error, requestId: req.id }, 'Rate limiter error');
        next();
      }
    }
  };
};

export const rateLimiters = {
  auth: rateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'ratelimit:auth',
    keyGenerator: (req) => `${req.ip}:${req.body?.email || 'unknown'}`,
  }),

  api: rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'ratelimit:api',
  }),

  download: rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'ratelimit:download',
    keyGenerator: (req) => `${req.user?.id || req.ip}`,
  }),

  upload: rateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    keyPrefix: 'ratelimit:upload',
    keyGenerator: (req) => req.user?.id || req.ip,
  }),

  payment: rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'ratelimit:payment',
    keyGenerator: (req) => req.user?.id || req.ip,
  }),
};