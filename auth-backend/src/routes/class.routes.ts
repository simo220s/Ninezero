import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { classStatusService } from '../services/class-status.service';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '../utils/responses';
import logger from '../config/logger';

const router = Router();

/**
 * Note: Rate limiting for class scheduling operations
 * When implementing POST /schedule endpoint, apply rate limiter:
 * - 20 requests per hour per user
 * - Import from middleware/rate-limit.middleware.ts or create inline
 */

/**
 * Get upcoming classes for current user
 * GET /api/classes/upcoming
 */
router.get('/upcoming', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    const classes = await classStatusService.getUpcomingClasses(userId, role);

    return successResponse(res, {
      classes,
      count: classes.length,
    });
  } catch (error) {
    logger.error('Error fetching upcoming classes:', error);
    return serverErrorResponse(res, 'Failed to fetch upcoming classes');
  }
});

/**
 * Get class history for current user
 * GET /api/classes/history
 */
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId || !role) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    const classes = await classStatusService.getClassHistory(userId, role, limit);

    return successResponse(res, {
      classes,
      count: classes.length,
    });
  } catch (error) {
    logger.error('Error fetching class history:', error);
    return serverErrorResponse(res, 'Failed to fetch class history');
  }
});

/**
 * Check if class is within join window
 * GET /api/classes/:id/can-join
 */
router.get('/:id/can-join', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const classId = req.params.id;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    // Fetch class details
    const { getSupabaseClient } = await import('../config/supabase');
    const supabase = getSupabaseClient();

    const { data: classSession, error } = await supabase
      .from('class_sessions')
      .select('date, time, student_id, teacher_id')
      .eq('id', classId)
      .single();

    if (error || !classSession) {
      return serverErrorResponse(res, 'Class not found');
    }

    // Verify user is part of this class
    if (
      classSession.student_id !== userId &&
      classSession.teacher_id !== userId
    ) {
      return unauthorizedResponse(res, 'Not authorized to join this class');
    }

    // Get join window setting from admin settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'join_window_minutes')
      .single();

    const joinWindowMinutes = settings?.value
      ? parseInt(settings.value)
      : 10;

    const canJoin = classStatusService.isWithinJoinWindow(
      classSession.date,
      classSession.time,
      joinWindowMinutes
    );

    return successResponse(res, {
      canJoin,
      joinWindowMinutes,
    });
  } catch (error) {
    logger.error('Error checking join availability:', error);
    return serverErrorResponse(res, 'Failed to check join availability');
  }
});

/**
 * Trigger manual class status update
 * POST /api/classes/update-statuses
 * (Admin only)
 */
router.post(
  '/update-statuses',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const role = req.user?.role;

      if (role !== 'admin') {
        return unauthorizedResponse(res, 'Admin access required');
      }

      const result = await classStatusService.updateClassStatuses();

      return successResponse(res, {
        message: 'Class statuses updated',
        inProgress: result.inProgress,
        completed: result.completed,
      });
    } catch (error) {
      logger.error('Error updating class statuses:', error);
      return serverErrorResponse(res, 'Failed to update class statuses');
    }
  }
);

export default router;
