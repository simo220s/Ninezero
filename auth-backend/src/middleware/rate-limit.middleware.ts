import rateLimit from 'express-rate-limit';
import { Response } from 'express';

/**
 * Rate limiter for login endpoint
 * 5 attempts per 15 minutes per IP/email
 */
export const loginRateLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5'), // 5 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for register endpoint
 * 3 attempts per hour per IP
 */
export const registerRateLimiter = rateLimit({
  windowMs: parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.REGISTER_RATE_LIMIT_MAX || '3'), // 3 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});

/**
 * Rate limiter for password reset endpoint
 * 3 attempts per hour per IP
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.REGISTER_RATE_LIMIT_MAX || '3'), // 3 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد الطلبات المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد الطلبات المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});

/**
 * Admin actions rate limiter
 * 50 requests per 15 minutes per user
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد العمليات المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد العمليات المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});

/**
 * Credit adjustment rate limiter
 * 10 requests per hour per admin
 */
export const creditAdjustmentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد تعديلات الرصيد المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد تعديلات الرصيد المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});

/**
 * File upload rate limiter
 * 5 uploads per hour per user
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 uploads
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد عمليات الرفع المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد عمليات الرفع المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});

/**
 * Class scheduling rate limiter
 * 20 requests per hour per user
 */
export const classScheduleRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد عمليات جدولة الحصص المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد عمليات جدولة الحصص المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});

/**
 * Review submission rate limiter
 * 10 reviews per day per user
 */
export const reviewRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 reviews
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد التقييمات المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'تم تجاوز عدد التقييمات المسموحة. يرجى المحاولة لاحقاً',
      },
    });
  },
});
