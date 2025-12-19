/**
 * Security Module
 * 
 * Central export for all security-related functionality
 * Provides input validation, audit logging, rate limiting, GDPR compliance,
 * authorization, and data backup services
 */

// Input Validation
export {
  sanitizeHtml,
  sanitizeText,
  validateArabicText,
  validateEnglishText,
  validateBilingualText,
  validateSaudiPhone,
  validateEmail,
  validateGoogleMeetLink,
  validateUrl,
  detectXSS,
  detectSQLInjection,
  validateInput,
  schemas,
} from './input-validation'

// Audit Logging
export {
  AuditEventType,
  AuditSeverity,
  type AuditLogEntry,
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
} from './audit-logging'

// Rate Limiting
export {
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
} from './rate-limiting'

// GDPR Compliance
export {
  DataCategory,
  ConsentType,
  DATA_RETENTION,
  type UserConsent,
  recordConsent,
  hasConsent,
  getUserConsents,
  exportUserData,
  anonymizeUserData,
  deleteUserData,
  cancelDeletion,
  processScheduledDeletions,
  getDataRetentionStatus,
  generatePrivacyReport,
} from './gdpr-compliance'

// Data Backup
export {
  BackupType,
  BackupStatus,
  type BackupRecord,
  createBackup,
  restoreBackup,
  listBackups,
  cleanupOldBackups,
  scheduleAutomaticBackups,
  verifyBackup,
  exportBackupToFile,
  getBackupStatistics,
} from './data-backup'

// Authorization
export {
  type AuthorizationResult,
  canManageStudents,
  canCreateStudents,
  canDeleteStudents,
  canManageClasses,
  canCreateClasses,
  canDeleteClasses,
  canViewFinancials,
  canManagePayments,
  canViewStatistics,
  canManageReviews,
  canExportData,
  canManageCoupons,
  canManagePackages,
  canManageCategories,
  canAccessResource,
  requireAuthorization,
  withAuthorization,
} from './authorization'

// Re-export permissions from auth module for convenience
export {
  ROLES,
  PERMISSIONS,
  type UserRole,
  type Permission,
  type UserWithPermissions,
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getUserPermissions,
  canAccessRoute,
  requirePermission,
  requireRole,
  getRoleDisplayName,
  isTeacherOrAdmin,
  isStudent,
} from '../auth/permissions'

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  // Input validation
  MAX_TEXT_LENGTH: 10000,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  
  // Rate limiting
  ENABLE_RATE_LIMITING: true,
  RATE_LIMIT_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Audit logging
  ENABLE_AUDIT_LOGGING: true,
  AUDIT_LOG_RETENTION_DAYS: 365 * 7, // 7 years
  
  // GDPR
  ENABLE_GDPR_COMPLIANCE: true,
  DATA_RETENTION_DAYS: 365 * 5, // 5 years
  DELETION_GRACE_PERIOD_DAYS: 30,
  
  // Backups
  ENABLE_AUTO_BACKUP: true,
  BACKUP_RETENTION_DAYS: 90,
  BACKUP_SCHEDULE_HOUR: 2, // 2 AM
  
  // Session
  SESSION_TIMEOUT_MINUTES: 60,
  REMEMBER_ME_DAYS: 30,
  
  // Password
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: false,
} as const

// Import cleanup and schedule functions
import { cleanupRateLimits as cleanupRateLimitsInternal } from './rate-limiting'
import { scheduleAutomaticBackups as scheduleAutomaticBackupsInternal } from './data-backup'

/**
 * Initialize security services
 */
export function initializeSecurity(userId?: string): void {
  // Start rate limit cleanup
  if (SECURITY_CONFIG.ENABLE_RATE_LIMITING) {
    setInterval(() => {
      cleanupRateLimitsInternal()
    }, SECURITY_CONFIG.RATE_LIMIT_CLEANUP_INTERVAL)
  }
  
  // Schedule automatic backups
  if (SECURITY_CONFIG.ENABLE_AUTO_BACKUP && userId) {
    scheduleAutomaticBackupsInternal(userId)
  }
  
  // Security services initialized
}

export default {
  SECURITY_CONFIG,
  initializeSecurity,
}
