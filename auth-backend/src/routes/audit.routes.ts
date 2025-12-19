import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { auditLogService } from '../services/audit-log.service';
import {
  successResponse,
  serverErrorResponse,
} from '../utils/responses';
import logger from '../config/logger';

const router = Router();

/**
 * Get audit logs (Admin only)
 * GET /api/audit/logs
 */
router.get(
  '/logs',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const filters = {
        userId: req.query.userId as string,
        action: req.query.action as string,
        entityType: req.query.entityType as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const logs = await auditLogService.getAuditLogs(filters);

      return successResponse(res, {
        logs,
        count: logs.length,
        filters,
      });
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      return serverErrorResponse(res, 'Failed to fetch audit logs');
    }
  }
);

/**
 * Get audit statistics (Admin only)
 * GET /api/audit/stats
 */
router.get(
  '/stats',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const stats = await auditLogService.getAuditStats(startDate, endDate);

      return successResponse(res, { stats });
    } catch (error) {
      logger.error('Error fetching audit stats:', error);
      return serverErrorResponse(res, 'Failed to fetch audit statistics');
    }
  }
);

export default router;
