/**
 * GDPR Compliance Utilities
 * 
 * Ensures compliance with GDPR and data protection regulations
 * Handles data privacy, consent management, and data subject rights
 */

import { supabase } from '../supabase'
import { logger } from '../logger'
import { logAuditEvent, AuditEventType, AuditSeverity } from './audit-logging'

// Data categories for GDPR
export const DataCategoryEnum = {
  PERSONAL_INFO: 'personal_info', // Name, email, phone
  CONTACT_INFO: 'contact_info', // Address, phone, email
  FINANCIAL_INFO: 'financial_info', // Payment details, transactions
  EDUCATIONAL_INFO: 'educational_info', // English level, progress
  USAGE_DATA: 'usage_data', // Login history, activity logs
  COMMUNICATION: 'communication', // Messages, notifications
} as const

export type DataCategory = typeof DataCategoryEnum[keyof typeof DataCategoryEnum]; const _DataCategory = typeof DataCategory[keyof typeof DataCategory]

// Consent types
export const ConsentTypeEnum = {
  TERMS_OF_SERVICE: 'terms_of_service',
  PRIVACY_POLICY: 'privacy_policy',
  MARKETING_EMAILS: 'marketing_emails',
  SMS_NOTIFICATIONS: 'sms_notifications',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  DATA_PROCESSING: 'data_processing',
  THIRD_PARTY_SHARING: 'third_party_sharing',
} as const

export type ConsentType = typeof ConsentTypeEnum[keyof typeof ConsentTypeEnum]; const _ConsentType = typeof ConsentType[keyof typeof ConsentType]

// Data retention periods (in days)
export const DATA_RETENTION = {
  ACTIVE_USER: 365 * 5, // 5 years for active users
  INACTIVE_USER: 365 * 2, // 2 years for inactive users
  AUDIT_LOGS: 365 * 7, // 7 years for audit logs
  FINANCIAL_RECORDS: 365 * 10, // 10 years for financial records
  DELETED_USER: 30, // 30 days grace period for deleted users
} as const

// User consent record
export interface UserConsent {
  user_id: string
  consent_type: ConsentType
  granted: boolean
  granted_at?: Date
  revoked_at?: Date
  ip_address?: string
  user_agent?: string
}

/**
 * Record user consent
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentType,
  granted: boolean
): Promise<void> {
  try {
    const consent: UserConsent = {
      user_id: userId,
      consent_type: consentType,
      granted,
      granted_at: granted ? new Date() : undefined,
      revoked_at: !granted ? new Date() : undefined,
      ip_address: 'client-ip', // Would be obtained from server
      user_agent: navigator.userAgent,
    }
    
    const { error } = await supabase
      .from('user_consents')
      .upsert(consent, {
        onConflict: 'user_id,consent_type',
      })
    
    if (error) throw error
    
    await logAuditEvent({
      event_type: AuditEventType.SETTINGS_UPDATED,
      severity: AuditSeverity.INFO,
      user_id: userId,
      action: `Consent ${granted ? 'granted' : 'revoked'} for ${consentType}`,
      metadata: { consent_type: consentType, granted },
    })
    
    logger.info(`Consent ${granted ? 'granted' : 'revoked'} for user ${userId}: ${consentType}`)
  } catch (error) {
    logger.error('Failed to record consent:', error)
    throw error
  }
}

/**
 * Check if user has granted consent
 */
export async function hasConsent(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_consents')
      .select('granted')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .single()
    
    if (error) {
      logger.error('Failed to check consent:', error)
      return false
    }
    
    return data?.granted || false
  } catch (error) {
    logger.error('Error checking consent:', error)
    return false
  }
}

/**
 * Get all consents for a user
 */
export async function getUserConsents(userId: string): Promise<UserConsent[]> {
  try {
    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    logger.error('Failed to get user consents:', error)
    return []
  }
}

/**
 * Export user data (GDPR Right to Data Portability)
 */
export async function exportUserData(userId: string): Promise<{
  personal_info: any
  students: any[]
  classes: any[]
  payments: any[]
  consents: any[]
  audit_logs: any[]
}> {
  try {
    logger.info(`Exporting data for user ${userId}`)
    
    // Get personal information
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    // Get students
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
    
    // Get classes
    const { data: classes } = await supabase
      .from('class_sessions')
      .select('*')
      .or(`student_id.eq.${userId},teacher_id.eq.${userId}`)
    
    // Get payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
    
    // Get consents
    const { data: consents } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
    
    // Get audit logs (last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', ninetyDaysAgo.toISOString())
    
    // Log data export
    await logAuditEvent({
      event_type: AuditEventType.DATA_EXPORTED,
      severity: AuditSeverity.INFO,
      user_id: userId,
      action: 'User data exported',
      metadata: { export_date: new Date().toISOString() },
    })
    
    return {
      personal_info: profile,
      students: students || [],
      classes: classes || [],
      payments: payments || [],
      consents: consents || [],
      audit_logs: auditLogs || [],
    }
  } catch (error) {
    logger.error('Failed to export user data:', error)
    throw error
  }
}

/**
 * Anonymize user data (GDPR Right to Erasure - partial)
 */
export async function anonymizeUserData(userId: string): Promise<void> {
  try {
    logger.info(`Anonymizing data for user ${userId}`)
    
    // Anonymize profile
    await supabase
      .from('profiles')
      .update({
        first_name: 'Anonymized',
        last_name: 'User',
        email: `anonymized_${userId}@deleted.local`,
        phone: null,
        avatar_url: null,
      })
      .eq('id', userId)
    
    // Anonymize students
    await supabase
      .from('students')
      .update({
        name: 'Anonymized Student',
        email: `anonymized_${userId}@deleted.local`,
        phone: null,
        parent_name: 'Anonymized Parent',
        parent_phone: null,
        parent_email: null,
      })
      .eq('user_id', userId)
    
    // Keep financial records but anonymize personal info
    await supabase
      .from('payments')
      .update({
        user_email: `anonymized_${userId}@deleted.local`,
      })
      .eq('user_id', userId)
    
    // Log anonymization
    await logAuditEvent({
      event_type: AuditEventType.SETTINGS_UPDATED,
      severity: AuditSeverity.INFO,
      user_id: userId,
      action: 'User data anonymized',
      metadata: { anonymization_date: new Date().toISOString() },
    })
    
    logger.info(`Data anonymized for user ${userId}`)
  } catch (error) {
    logger.error('Failed to anonymize user data:', error)
    throw error
  }
}

/**
 * Delete user data (GDPR Right to Erasure - complete)
 */
export async function deleteUserData(userId: string, gracePeriodDays: number = 30): Promise<void> {
  try {
    logger.info(`Scheduling deletion for user ${userId} with ${gracePeriodDays} days grace period`)
    
    // Mark user for deletion
    await supabase
      .from('profiles')
      .update({
        deletion_scheduled_at: new Date().toISOString(),
        deletion_date: new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', userId)
    
    // Log deletion request
    await logAuditEvent({
      event_type: AuditEventType.SETTINGS_UPDATED,
      severity: AuditSeverity.WARNING,
      user_id: userId,
      action: 'User deletion scheduled',
      metadata: {
        grace_period_days: gracePeriodDays,
        deletion_date: new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000).toISOString(),
      },
    })
    
    logger.info(`Deletion scheduled for user ${userId}`)
  } catch (error) {
    logger.error('Failed to schedule user deletion:', error)
    throw error
  }
}

/**
 * Cancel scheduled deletion
 */
export async function cancelDeletion(userId: string): Promise<void> {
  try {
    await supabase
      .from('profiles')
      .update({
        deletion_scheduled_at: null,
        deletion_date: null,
      })
      .eq('id', userId)
    
    await logAuditEvent({
      event_type: AuditEventType.SETTINGS_UPDATED,
      severity: AuditSeverity.INFO,
      user_id: userId,
      action: 'User deletion cancelled',
    })
    
    logger.info(`Deletion cancelled for user ${userId}`)
  } catch (error) {
    logger.error('Failed to cancel deletion:', error)
    throw error
  }
}

/**
 * Process scheduled deletions (should be run as a cron job)
 */
export async function processScheduledDeletions(): Promise<void> {
  try {
    // Find users scheduled for deletion
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id')
      .not('deletion_date', 'is', null)
      .lte('deletion_date', new Date().toISOString())
    
    if (error) throw error
    
    if (!users || users.length === 0) {
      logger.info('No users scheduled for deletion')
      return
    }
    
    logger.info(`Processing deletion for ${users.length} users`)
    
    for (const user of users) {
      try {
        // Delete user data
        await supabase.from('students').delete().eq('user_id', user.id)
        await supabase.from('class_sessions').delete().eq('student_id', user.id)
        await supabase.from('user_consents').delete().eq('user_id', user.id)
        
        // Keep audit logs and financial records for compliance
        // Just anonymize them
        await anonymizeUserData(user.id)
        
        // Delete profile
        await supabase.from('profiles').delete().eq('id', user.id)
        
        logger.info(`Deleted user ${user.id}`)
      } catch (error) {
        logger.error(`Failed to delete user ${user.id}:`, error)
      }
    }
  } catch (error) {
    logger.error('Failed to process scheduled deletions:', error)
  }
}

/**
 * Get data retention status
 */
export async function getDataRetentionStatus(userId: string): Promise<{
  lastActivity: Date | null
  retentionPeriod: number
  deletionDate: Date | null
  isScheduledForDeletion: boolean
}> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_login_at, deletion_date')
      .eq('id', userId)
      .single()
    
    const lastActivity = profile?.last_login_at ? new Date(profile.last_login_at) : null
    const deletionDate = profile?.deletion_date ? new Date(profile.deletion_date) : null
    
    // Determine retention period based on activity
    const daysSinceActivity = lastActivity
      ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    const retentionPeriod = daysSinceActivity > 365
      ? DATA_RETENTION.INACTIVE_USER
      : DATA_RETENTION.ACTIVE_USER
    
    return {
      lastActivity,
      retentionPeriod,
      deletionDate,
      isScheduledForDeletion: !!deletionDate,
    }
  } catch (error) {
    logger.error('Failed to get data retention status:', error)
    throw error
  }
}

/**
 * Generate privacy report for user
 */
export async function generatePrivacyReport(userId: string): Promise<{
  consents: UserConsent[]
  dataCategories: Record<DataCategory, boolean>
  retentionStatus: any
  exportAvailable: boolean
}> {
  const consents = await getUserConsents(userId)
  const retentionStatus = await getDataRetentionStatus(userId)
  
  // Check which data categories exist for user
  const dataCategories: Record<DataCategory, boolean> = {
    [DataCategory.PERSONAL_INFO]: true, // Always exists
    [DataCategory.CONTACT_INFO]: true, // Always exists
    [DataCategory.FINANCIAL_INFO]: false,
    [DataCategory.EDUCATIONAL_INFO]: false,
    [DataCategory.USAGE_DATA]: false,
    [DataCategory.COMMUNICATION]: false,
  }
  
  // Check for financial data
  const { data: payments } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
  
  dataCategories[DataCategory.FINANCIAL_INFO] = !!payments && payments.length > 0
  
  // Check for educational data
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
  
  dataCategories[DataCategory.EDUCATIONAL_INFO] = !!students && students.length > 0
  
  return {
    consents,
    dataCategories,
    retentionStatus,
    exportAvailable: true,
  }
}

export default {
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
}

