import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { trialConversionService } from '../services/trial-conversion.service';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
  forbiddenResponse,
} from '../utils/responses';
import logger from '../config/logger';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for manual conversion operations
// 20 requests per hour per admin
const conversionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد عمليات التحويل المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Get conversion statistics (Admin only)
 * GET /api/conversion/stats
 */
router.get(
  '/stats',
  requireAuth,
  requireRole('admin'),
  async (_req: Request, res: Response) => {
    try {
      const stats = await trialConversionService.getConversionStats();

      return successResponse(res, { stats });
    } catch (error) {
      logger.error('Error fetching conversion stats:', error);
      return serverErrorResponse(res, 'Failed to fetch conversion statistics');
    }
  }
);

/**
 * Manually convert a trial student (Admin only)
 * POST /api/conversion/manual/:userId
 * Rate limited: 20 requests per hour per admin
 */
router.post(
  '/manual/:userId',
  requireAuth,
  requireRole('admin'),
  conversionRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const adminId = req.user?.userId;
      const userId = req.params.userId;

      if (!adminId) {
        return unauthorizedResponse(res, 'Admin not authenticated');
      }

      const result = await trialConversionService.manualConversion(
        userId,
        adminId
      );

      if (result.success) {
        return successResponse(res, { message: result.message });
      } else {
        return forbiddenResponse(res, result.message);
      }
    } catch (error) {
      logger.error('Error in manual conversion:', error);
      return serverErrorResponse(res, 'Failed to convert student');
    }
  }
);

/**
 * Process all completed trial lessons (Admin only)
 * POST /api/conversion/process-trials
 * Rate limited: 20 requests per hour per admin
 */
router.post(
  '/process-trials',
  requireAuth,
  requireRole('admin'),
  conversionRateLimiter,
  async (_req: Request, res: Response) => {
    try {
      const conversionCount =
        await trialConversionService.processCompletedTrialLessons();

      return successResponse(res, {
        message: 'Trial lessons processed',
        conversions: conversionCount,
      });
    } catch (error) {
      logger.error('Error processing trial lessons:', error);
      return serverErrorResponse(res, 'Failed to process trial lessons');
    }
  }
);

/**
 * Check if current user has completed trial
 * GET /api/conversion/check-status
 */
router.get('/check-status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    const { getSupabaseClient } = await import('../config/supabase');
    const supabase = getSupabaseClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_trial, trial_completed, converted_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return serverErrorResponse(res, 'Failed to fetch user profile');
    }

    return successResponse(res, {
      isTrial: profile.is_trial,
      trialCompleted: profile.trial_completed,
      convertedAt: profile.converted_at,
      shouldRedirect: !profile.is_trial && profile.trial_completed,
    });
  } catch (error) {
    logger.error('Error checking conversion status:', error);
    return serverErrorResponse(res, 'Failed to check conversion status');
  }
});

export default router;
