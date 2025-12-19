/**
 * Rate Limiting Service
 * 
 * Implements rate limiting for API endpoints to prevent abuse
 * Protects against brute force attacks and DDoS attempts
 */

import { logger } from '../logger'

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Error message when limit exceeded
}

// Rate limit presets
export const RATE_LIMITS = {
  // Authentication endpoints (stricter limits)
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة',
  },
  
  AUTH_SIGNUP: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour
    message: 'تم تجاوز عدد محاولات التسجيل. يرجى المحاولة بعد ساعة',
  },
  
  AUTH_PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 reset attempts per hour
    message: 'تم تجاوز عدد محاولات إعادة تعيين كلمة المرور. يرجى المحاولة بعد ساعة',
  },
  
  // API endpoints (moderate limits)
  API_READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'تم تجاوز عدد الطلبات. يرجى المحاولة بعد دقيقة',
  },
  
  API_WRITE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'تم تجاوز عدد الطلبات. يرجى المحاولة بعد دقيقة',
  },
  
  // Class booking (prevent spam)
  CLASS_BOOKING: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 bookings per 5 minutes
    message: 'تم تجاوز عدد محاولات الحجز. يرجى المحاولة بعد 5 دقائق',
  },
  
  // Student management
  STUDENT_OPERATIONS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 operations per minute
    message: 'تم تجاوز عدد العمليات. يرجى المحاولة بعد دقيقة',
  },
  
  // Financial operations (stricter)
  PAYMENT_OPERATIONS: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5, // 5 payment operations per 5 minutes
    message: 'تم تجاوز عدد العمليات المالية. يرجى المحاولة بعد 5 دقائق',
  },
  
  // Coupon validation
  COUPON_VALIDATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 validations per minute
    message: 'تم تجاوز عدد محاولات التحقق من الكوبون. يرجى المحاولة بعد دقيقة',
  },
  
  // Data export (prevent abuse)
  DATA_EXPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 exports per hour
    message: 'تم تجاوز عدد عمليات التصدير. يرجى المحاولة بعد ساعة',
  },
} as const

// Request tracking
interface RequestRecord {
  count: number
  firstRequest: number
  lastRequest: number
}

// In-memory store for rate limiting (in production, use Redis)
const requestStore = new Map<string, RequestRecord>()

/**
 * Generate rate limit key
 */
function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
  const key = getRateLimitKey(identifier, endpoint)
  const now = Date.now()
  
  // Get or create request record
  let record = requestStore.get(key)
  
  // Clean up old records
  if (record && now - record.firstRequest > config.windowMs) {
    // Window has passed, reset counter
    record = undefined
    requestStore.delete(key)
  }
  
  // Initialize new record
  if (!record) {
    record = {
      count: 0,
      firstRequest: now,
      lastRequest: now,
    }
  }
  
  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    const resetTime = record.firstRequest + config.windowMs
    
    logger.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`)
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      message: config.message,
    }
  }
  
  // Increment counter
  record.count++
  record.lastRequest = now
  requestStore.set(key, record)
  
  const remaining = config.maxRequests - record.count
  const resetTime = record.firstRequest + config.windowMs
  
  return {
    allowed: true,
    remaining,
    resetTime,
  }
}

/**
 * Reset rate limit for a specific identifier and endpoint
 */
export function resetRateLimit(identifier: string, endpoint: string): void {
  const key = getRateLimitKey(identifier, endpoint)
  requestStore.delete(key)
  logger.info(`Rate limit reset for ${identifier} on ${endpoint}`)
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): { count: number; remaining: number; resetTime: number } {
  const key = getRateLimitKey(identifier, endpoint)
  const record = requestStore.get(key)
  const now = Date.now()
  
  if (!record || now - record.firstRequest > config.windowMs) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    }
  }
  
  return {
    count: record.count,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.firstRequest + config.windowMs,
  }
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  let cleaned = 0
  
  for (const [key, record] of requestStore.entries()) {
    // Remove records older than 1 hour
    if (now - record.lastRequest > 60 * 60 * 1000) {
      requestStore.delete(key)
      cleaned++
    }
  }
  
  if (cleaned > 0) {
    logger.info(`Cleaned up ${cleaned} expired rate limit records`)
  }
}

/**
 * Rate limit middleware for API calls
 */
export async function rateLimitMiddleware<T>(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig,
  operation: () => Promise<T>
): Promise<T> {
  const result = checkRateLimit(identifier, endpoint, config)
  
  if (!result.allowed) {
    const error = new Error(result.message || 'Rate limit exceeded') as Error & { resetTime?: number }
    error.name = 'RateLimitError'
    error.resetTime = result.resetTime
    throw error
  }
  
  return await operation()
}

/**
 * Get rate limit headers (for API responses)
 */
export function getRateLimitHeaders(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Record<string, string> {
  const status = getRateLimitStatus(identifier, endpoint, config)
  
  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': status.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(status.resetTime / 1000).toString(),
  }
}

/**
 * Block suspicious activity
 */
export function blockSuspiciousActivity(
  identifier: string,
  reason: string,
  durationMs: number = 60 * 60 * 1000 // 1 hour default
): void {
  const key = `blocked:${identifier}`
  const record: RequestRecord = {
    count: 999999, // Very high count to block
    firstRequest: Date.now(),
    lastRequest: Date.now(),
  }
  
  requestStore.set(key, record)
  
  logger.warn(`Blocked ${identifier} for ${durationMs}ms. Reason: ${reason}`)
  
  // Auto-unblock after duration
  setTimeout(() => {
    requestStore.delete(key)
    logger.info(`Unblocked ${identifier}`)
  }, durationMs)
}

/**
 * Check if identifier is blocked
 */
export function isBlocked(identifier: string): boolean {
  const key = `blocked:${identifier}`
  return requestStore.has(key)
}

/**
 * Unblock identifier
 */
export function unblock(identifier: string): void {
  const key = `blocked:${identifier}`
  requestStore.delete(key)
  logger.info(`Manually unblocked ${identifier}`)
}

// Cleanup expired records every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}

export default {
  RATE_LIMITS,
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  rateLimitMiddleware,
  getRateLimitHeaders,
  blockSuspiciousActivity,
  isBlocked,
  unblock,
  cleanupRateLimits,
}
