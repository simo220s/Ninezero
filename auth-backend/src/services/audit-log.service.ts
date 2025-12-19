import { getSupabaseClient } from '../config/supabase';
import logger from '../config/logger';

const supabase = getSupabaseClient();

/**
 * Audit log actions
 */
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  CREDIT_ADJUSTMENT = 'credit_adjustment',
  TRIAL_CONVERSION = 'trial_conversion',
  MANUAL_TRIAL_CONVERSION = 'manual_trial_conversion',
  APPROVE_REVIEW = 'approve_review',
  DELETE_REVIEW = 'delete_review',
  CANCEL_CLASS = 'cancel_class',
  BULK_IMPORT = 'bulk_import',
  SETTINGS_UPDATE = 'settings_update',
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  userId?: string;
  action: AuditAction | string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit logging service
 */
class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(entry: AuditLogEntry): Promise<boolean> {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        user_id: entry.userId || null,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId || null,
        old_value: entry.oldValue || null,
        new_value: entry.newValue || null,
        description: entry.description || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        created_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Failed to create audit log:', error);
        return false;
      }

      logger.info(`Audit log created: ${entry.action} on ${entry.entityType}`);
      return true;
    } catch (error) {
      logger.error('Error creating audit log:', error);
      return false;
    }
  }

  /**
   * Log user creation
   */
  async logUserCreate(
    adminId: string,
    newUser: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.CREATE,
      entityType: 'profile',
      entityId: newUser.id,
      newValue: {
        email: newUser.email,
        role: newUser.role,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
      description: `Created user: ${newUser.email}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user update
   */
  async logUserUpdate(
    adminId: string,
    userId: string,
    oldData: any,
    newData: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      entityType: 'profile',
      entityId: userId,
      oldValue: oldData,
      newValue: newData,
      description: `Updated user: ${userId}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user deletion
   */
  async logUserDelete(
    adminId: string,
    userId: string,
    userData: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.DELETE,
      entityType: 'profile',
      entityId: userId,
      oldValue: userData,
      description: `Deleted user: ${userData.email}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log credit adjustment
   */
  async logCreditAdjustment(
    adminId: string,
    userId: string,
    oldBalance: number,
    newBalance: number,
    amount: number,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.CREDIT_ADJUSTMENT,
      entityType: 'class_credits',
      entityId: userId,
      oldValue: { credits: oldBalance },
      newValue: { credits: newBalance },
      description: `Adjusted credits for user ${userId}: ${amount > 0 ? '+' : ''}${amount} (${reason})`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log class cancellation
   */
  async logClassCancellation(
    userId: string,
    classId: string,
    classData: any,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.CANCEL_CLASS,
      entityType: 'class_session',
      entityId: classId,
      oldValue: { status: classData.status },
      newValue: { status: 'cancelled' },
      description: `Cancelled class: ${reason}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log review approval
   */
  async logReviewApproval(
    adminId: string,
    reviewId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.APPROVE_REVIEW,
      entityType: 'review',
      entityId: reviewId,
      oldValue: { approved: false },
      newValue: { approved: true },
      description: `Approved review: ${reviewId}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log review deletion
   */
  async logReviewDeletion(
    adminId: string,
    reviewId: string,
    reviewData: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.DELETE_REVIEW,
      entityType: 'review',
      entityId: reviewId,
      oldValue: reviewData,
      description: `Deleted review: ${reviewId}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log settings update
   */
  async logSettingsUpdate(
    adminId: string,
    settingKey: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.SETTINGS_UPDATE,
      entityType: 'admin_settings',
      entityId: settingKey,
      oldValue: { value: oldValue },
      newValue: { value: newValue },
      description: `Updated setting: ${settingKey}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user login
   */
  async logLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGIN,
      entityType: 'auth',
      description: 'User logged in',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user logout
   */
  async logLogout(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGOUT,
      entityType: 'auth',
      description: 'User logged out',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(startDate?: string, endDate?: string): Promise<{
    totalLogs: number;
    actionCounts: Record<string, number>;
    entityCounts: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    try {
      let query = supabase.from('audit_logs').select('*');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error || !data) {
        return {
          totalLogs: 0,
          actionCounts: {},
          entityCounts: {},
          topUsers: [],
        };
      }

      // Calculate statistics
      const actionCounts: Record<string, number> = {};
      const entityCounts: Record<string, number> = {};
      const userCounts: Record<string, number> = {};

      data.forEach((log) => {
        // Count actions
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

        // Count entity types
        entityCounts[log.entity_type] =
          (entityCounts[log.entity_type] || 0) + 1;

        // Count by user
        if (log.user_id) {
          userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
        }
      });

      // Get top users
      const topUsers = Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalLogs: data.length,
        actionCounts,
        entityCounts,
        topUsers,
      };
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      return {
        totalLogs: 0,
        actionCounts: {},
        entityCounts: {},
        topUsers: [],
      };
    }
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
