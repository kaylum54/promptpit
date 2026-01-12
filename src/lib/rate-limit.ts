/**
 * Rate Limiting Utility for PromptPit API Routes
 *
 * Simple in-memory rate limiter using a Map.
 * Works well for single-server deployments.
 * For multi-server deployments, consider Redis-based solutions.
 */

import { NextRequest } from 'next/server';

/**
 * Rate limit configuration for different endpoints
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Maximum requests allowed in window */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Unix timestamp when the rate limit resets */
  resetTime: number;
  /** Retry after in seconds (only set if rate limited) */
  retryAfter?: number;
}

/**
 * Internal tracking of request counts per key
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Predefined rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  /** Debate generation - 30 requests per minute */
  debate: { limit: 30, windowMs: 60 * 1000 },
  /** Feedback submission - 5 requests per minute (prevent spam) */
  feedback: { limit: 5, windowMs: 60 * 1000 },
  /** Analytics tracking - 100 requests per minute */
  analytics: { limit: 100, windowMs: 60 * 1000 },
  /** General API routes - 60 requests per minute */
  general: { limit: 60, windowMs: 60 * 1000 },
} as const;

/**
 * In-memory store for rate limiting
 * Key format: `${endpoint}:${identifier}`
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval reference for clearing old entries
 */
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the cleanup interval to remove expired entries
 * Runs every 60 seconds by default
 */
function startCleanup(intervalMs: number = 60 * 1000): void {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    });
  }, intervalMs);

  // Allow the process to exit even if the interval is running
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

// Start cleanup on module load
startCleanup();

/**
 * Extracts the client IP address from a NextRequest
 * Checks various headers for proxied requests
 */
export function getClientIP(request: NextRequest): string {
  // Check for forwarded headers (common with proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }

  // Check for real IP header (Nginx, Cloudflare)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  // Check for Cloudflare's connecting IP
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Fallback to a generic identifier if no IP is found
  // This can happen in development or certain proxy configurations
  return 'unknown';
}

/**
 * Check rate limit for a given identifier and configuration
 *
 * @param identifier - Unique identifier for rate limiting (usually IP + endpoint)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and limit info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or the window has expired, create a new one
  if (!entry || entry.resetTime <= now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: Math.ceil(resetTime / 1000),
    };
  }

  // Entry exists and window is still active
  const newCount = entry.count + 1;
  const remaining = Math.max(0, config.limit - newCount);

  if (newCount > config.limit) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetTime: Math.ceil(entry.resetTime / 1000),
      retryAfter,
    };
  }

  // Update the count
  rateLimitStore.set(identifier, {
    count: newCount,
    resetTime: entry.resetTime,
  });

  return {
    allowed: true,
    limit: config.limit,
    remaining,
    resetTime: Math.ceil(entry.resetTime / 1000),
  };
}

/**
 * Apply rate limiting to a request
 * Convenience function that extracts IP and checks the rate limit
 *
 * @param request - NextRequest object
 * @param endpoint - Endpoint name for identification (e.g., 'debate', 'feedback')
 * @param config - Rate limit configuration (defaults to 'general' if not specified)
 * @returns RateLimitResult
 */
export function rateLimit(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.general
): RateLimitResult {
  const ip = getClientIP(request);
  const identifier = `${endpoint}:${ip}`;
  return checkRateLimit(identifier, config);
}

/**
 * Get rate limit headers to include in responses
 *
 * @param result - Rate limit result from checkRateLimit
 * @returns Headers object with rate limit information
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  };

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Create a 429 Too Many Requests response with proper headers
 *
 * @param result - Rate limit result (must have allowed: false)
 * @returns Response object with 429 status and rate limit headers
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = getRateLimitHeaders(result);

  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Get current store size (useful for monitoring)
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}
