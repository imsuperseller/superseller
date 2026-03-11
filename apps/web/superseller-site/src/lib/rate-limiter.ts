import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  statusCode?: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    const defaults: RateLimitConfig = {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
      message: 'Too many requests, please try again later.',
      statusCode: 429,
    };
    this.config = { ...defaults, ...config };
  }

  private getClientIdentifier(req: NextRequest): string {
    // Use IP address from headers or req properties
    const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown';

    // Add user agent for additional uniqueness
    const userAgent = req.headers.get('user-agent') || '';

    // Add route path for per-route limiting
    const path = req.nextUrl?.pathname || '';

    return `${ip}:${userAgent}:${path}`;
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  check(req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();

    const identifier = this.getClientIdentifier(req);
    const now = Date.now();

    if (!this.store[identifier]) {
      this.store[identifier] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const record = this.store[identifier];

    // Check if window has reset
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.config.windowMs;
    }

    // Increment request count
    record.count++;

    const allowed = record.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - record.count);

    return {
      allowed,
      remaining,
      resetTime: record.resetTime,
    };
  }

  middleware() {
    return (req: NextRequest) => {
      const result = this.check(req);

      if (!result.allowed) {
        return NextResponse.json(
          { error: this.config.message },
          {
            status: this.config.statusCode,
            headers: {
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
              'Retry-After': Math.ceil(this.config.windowMs / 1000).toString(),
            },
          }
        );
      }

      return null;
    };
  }
}

// Create different rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'API rate limit exceeded. Please try again later.',
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 file uploads per hour
  message: 'Upload limit exceeded. Please try again later.',
});

export const searchRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50, // 50 searches per 5 minutes
  message: 'Search rate limit exceeded. Please try again later.',
});

// Helper function to apply rate limiting to API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimiter: RateLimiter = apiRateLimiter
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResult = rateLimiter.middleware()(req);

    if (rateLimitResult) {
      return rateLimitResult;
    }

    return handler(req);
  };
}

// Legacy export for backward compatibility
export const withApiRateLimit = withRateLimit;
