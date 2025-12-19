import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';
import { successResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from '../utils/responses';
import { getSupabaseClient } from '../config/supabase';
import logger from '../config/logger';
import rateLimit from 'express-rate-limit';

const router = Router();
const supabase = getSupabaseClient();

// Rate limiter for notification preference updates
// 10 requests per hour per user
const notificationUpdateRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد تحديثات الإشعارات المسموحة. يرجى المحاولة لاحقاً',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Get unread notifications for current user
 * GET /api/notifications/unread
 */
router.get('/unread', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    const notifications = await notificationService.getUnreadNotifications(userId);

    return successResponse(res, {
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    logger.error('Error fetching unread notifications:', error);
    return serverErrorResponse(res, 'Failed to fetch notifications');
  }
});

/**
 * Get all notifications for current user
 * GET /api/notifications
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching notifications:', error);
      return serverErrorResponse(res, 'Failed to fetch notifications');
    }

    return successResponse(res, {
      notifications: notifications || [],
      count: notifications?.length || 0,
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return serverErrorResponse(res, 'Failed to fetch notifications');
  }
});

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    // Verify notification belongs to user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      return notFoundResponse(res, 'Notification not found');
    }

    if (notification.user_id !== userId) {
      return forbiddenResponse(res, 'Unauthorized');
    }

    const success = await notificationService.markAsRead(notificationId);

    if (!success) {
      return serverErrorResponse(res, 'Failed to mark notification as read');
    }

    return successResponse(res, { message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return serverErrorResponse(res, 'Failed to mark notification as read');
  }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    const success = await notificationService.markAllAsRead(userId);

    if (!success) {
      return serverErrorResponse(res, 'Failed to mark all notifications as read');
    }

    return successResponse(res, { message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return serverErrorResponse(res, 'Failed to mark all notifications as read');
  }
});

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
router.get('/preferences', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    const preferences = await notificationService.getNotificationPreferences(userId);

    if (!preferences) {
      return serverErrorResponse(res, 'Failed to fetch preferences');
    }

    return successResponse(res, { preferences });
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    return serverErrorResponse(res, 'Failed to fetch preferences');
  }
});

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 * Rate limited: 10 requests per hour per user
 */
router.put('/preferences', requireAuth, notificationUpdateRateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const preferences = req.body;

    if (!userId) {
      return unauthorizedResponse(res, 'User not authenticated');
    }

    const success = await notificationService.updateNotificationPreferences(
      userId,
      preferences
    );

    if (!success) {
      return serverErrorResponse(res, 'Failed to update preferences');
    }

    return successResponse(res, { message: 'Preferences updated successfully' });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    return serverErrorResponse(res, 'Failed to update preferences');
  }
});

export default router;
