interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.limits = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + this.windowMs;
      return false;
    }

    entry.count++;
    return entry.count > this.maxRequests;
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return this.maxRequests;
    
    if (Date.now() > entry.resetTime) return this.maxRequests;
    
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return Date.now() + this.windowMs;
    return entry.resetTime;
  }
}

// Create rate limiters with different configurations
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 requests per 5 minutes for auth endpoints 