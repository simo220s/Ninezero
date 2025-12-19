/**
 * Audit Logging System
 * 
 * Tracks all administrative actions for security and compliance
 * Provides comprehensive audit trail for GDPR and security requirements
 */

import { supabase } from '../supabase'
import { logger } from '../logger'

// Audit event types
export const AuditEventTypeEnum = {
  // Authentication
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_SIGNUP: 'user_signup',
  PASSWORD_RESET: 'password_reset',
  
  // Student Management
  STUDENT_CREATED: 'student_created',
  STUDENT_UPDATED: 'student_updated',
  STUDENT_DELETED: 'student_deleted',
  STUDENT_CONVERTED: 'student_converted',
  STUDENT_IMPORTED: 'student_imported',
  STUDENT_EXPORTED: 'student_exported',
  
  // Class Management
  CLASS_CREATED: 'class_created',
  CLASS_UPDATED: 'class_updated',
  CLASS_DELETED: 'class_deleted',
  CLASS_CANCELLED: 'class_cancelled',
  CLASS_RESCHEDULED: 'class_rescheduled',
  
  // Financial
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_REFUNDED: 'payment_refunded',
  CREDITS_ADDED: 'credits_added',
  CREDITS_DEDUCTED: 'credits_deducted',
  INVOICE_GENERATED: 'invoice_generated',
  
  // Coupon Management
  COUPON_CREATED: 'coupon_created',
  COUPON_UPDATED: 'coupon_updated',
  COUPON_DELETED: 'coupon_deleted',
  COUPON_APPLIED: 'coupon_applied',
  
  // Package Management
  PACKAGE_CREATED: 'package_created',
  PACKAGE_UPDATED: 'package_updated',
  PACKAGE_DELETED: 'package_deleted',
  PACKAGE_PURCHASED: 'package_purchased',
  
  // Category Management
  CATEGORY_CREATED: 'category_created',
  CATEGORY_UPDATED: 'category_updated',
  CATEGORY_DELETED: 'category_deleted',
  
  // Data Access
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported',
  REPORT_GENERATED: 'report_generated',
  
  // Security
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  PERMISSION_DENIED: 'permission_denied',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  
  // System
  SETTINGS_UPDATED: 'settings_updated',
  BACKUP_CREATED: 'backup_created',
  BACKUP_RESTORED: 'backup_restored',
} as const

export type AuditEventType = typeof AuditEventTypeEnum[keyof typeof AuditEventTypeEnum]

// Audit event severity levels
export const AuditSeverityEnum = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const

export type AuditSeverity = typeof AuditSeverityEnum[keyof typeof AuditSeverityEnum]

// Audit log entry interface
export interface AuditLogEntry {
  id?: string
  event_type: AuditEventType
  severity: AuditSeverity
  user_id: string
  user_email?: string
  user_role?: string
  action: string
  resource_type?: string
  resource_id?: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp?: Date
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    // Get client IP and user agent
    const ipAddress = await getClientIP()
    const userAgent = navigator.userAgent
    
    // Create audit log entry
    const auditEntry: AuditLogEntry = {
      ...entry,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date(),
    }
    
    // Log to database
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntry)
    
    if (error) {
      logger.error('Failed to log audit event:', error)
      // Fall back to console logging
      logger.info('Audit Event:', auditEntry)
    }
    
    // Log critical events to console as well
    if (entry.severity === AuditSeverity.CRITICAL || entry.severity === AuditSeverity.ERROR) {
      logger.warn('Critical Audit Event:', auditEntry)
    }
  } catch (error) {
    logger.error('Error logging audit event:', error)
  }
}

/**
 * Log user authentication event
 */
export async function logAuthEvent(
  userId: string,
  userEmail: string,
  eventType: typeof AuditEventType.USER_LOGIN | typeof AuditEventType.USER_LOGOUT | typeof AuditEventType.USER_SIGNUP,
  success: boolean
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    user_id: userId,
    user_email: userEmail,
    action: `User ${eventType.replace('user_', '')} ${success ? 'successful' : 'failed'}`,
    metadata: { success },
  })
}

/**
 * Log student management event
 */
export async function logStudentEvent(
  userId: string,
  eventType: AuditEventType,
  studentId: string,
  changes?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: AuditSeverity.INFO,
    user_id: userId,
    action: `Student ${eventType.replace('student_', '')}`,
    resource_type: 'student',
    resource_id: studentId,
    changes,
  })
}

/**
 * Log class management event
 */
export async function logClassEvent(
  userId: string,
  eventType: AuditEventType,
  classId: string,
  changes?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: AuditSeverity.INFO,
    user_id: userId,
    action: `Class ${eventType.replace('class_', '')}`,
    resource_type: 'class',
    resource_id: classId,
    changes,
  })
}

/**
 * Log financial event
 */
export async function logFinancialEvent(
  userId: string,
  eventType: AuditEventType,
  amount: number,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: AuditSeverity.INFO,
    user_id: userId,
    action: `Financial ${eventType.replace('payment_', '').replace('credits_', '')}`,
    resource_type: 'financial',
    metadata: { amount, ...metadata },
  })
}

/**
 * Log coupon event
 */
export async function logCouponEvent(
  userId: string,
  eventType: AuditEventType,
  couponId: string,
  changes?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: AuditSeverity.INFO,
    user_id: userId,
    action: `Coupon ${eventType.replace('coupon_', '')}`,
    resource_type: 'coupon',
    resource_id: couponId,
    changes,
  })
}

/**
 * Log package event
 */
export async function logPackageEvent(
  userId: string,
  eventType: AuditEventType,
  packageId: string,
  changes?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: AuditSeverity.INFO,
    user_id: userId,
    action: `Package ${eventType.replace('package_', '')}`,
    resource_type: 'package',
    resource_id: packageId,
    changes,
  })
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userId: string,
  eventType: AuditEventType,
  action: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: AuditSeverity.WARNING,
    user_id: userId,
    action,
    metadata,
  })
}

/**
 * Log data access event
 */
export async function logDataAccessEvent(
  userId: string,
  eventType: AuditEventType,
  resourceType: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    severity: AuditSeverity.INFO,
    user_id: userId,
    action: `Data ${eventType.replace('data_', '').replace('report_', '')}`,
    resource_type: resourceType,
    metadata,
  })
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(filters: {
  userId?: string
  eventType?: AuditEventType
  severity?: AuditSeverity
  resourceType?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<AuditLogEntry[]> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }
    
    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType)
    }
    
    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }
    
    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType)
    }
    
    if (filters.resourceId) {
      query = query.eq('resource_id', filters.resourceId)
    }
    
    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString())
    }
    
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString())
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      logger.error('Failed to query audit logs:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    logger.error('Error querying audit logs:', error)
    return []
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: string, days: number = 30): Promise<{
  totalEvents: number
  eventsByType: Record<string, number>
  recentEvents: AuditLogEntry[]
}> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const logs = await queryAuditLogs({
    userId,
    startDate,
    limit: 100,
  })
  
  const eventsByType: Record<string, number> = {}
  logs.forEach(log => {
    eventsByType[log.event_type] = (eventsByType[log.event_type] || 0) + 1
  })
  
  return {
    totalEvents: logs.length,
    eventsByType,
    recentEvents: logs.slice(0, 10),
  }
}

/**
 * Get client IP address
 */
async function getClientIP(): Promise<string> {
  try {
    // In production, this would be obtained from the server
    // For now, return a placeholder
    return 'client-ip'
  } catch {
    return 'unknown'
  }
}

/**
 * Export audit logs for compliance
 */
export async function exportAuditLogs(filters: {
  startDate: Date
  endDate: Date
  userId?: string
}): Promise<string> {
  const logs = await queryAuditLogs(filters)
  
  // Convert to CSV format
  const headers = ['Timestamp', 'Event Type', 'Severity', 'User ID', 'Action', 'Resource Type', 'Resource ID']
  const rows = logs.map(log => [
    log.timestamp?.toISOString() || '',
    log.event_type,
    log.severity,
    log.user_id,
    log.action,
    log.resource_type || '',
    log.resource_id || '',
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')
  
  return csv
}

export default {
  logAuditEvent,
  logAuthEvent,
  logStudentEvent,
  logClassEvent,
  logFinancialEvent,
  logCouponEvent,
  logPackageEvent,
  logSecurityEvent,
  logDataAccessEvent,
  queryAuditLogs,
  getUserActivitySummary,
  exportAuditLogs,
}

