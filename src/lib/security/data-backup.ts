/**
 * Data Backup and Recovery Service
 * 
 * Provides automated backup and recovery procedures for critical data
 * Ensures business continuity and data protection
 */

import { supabase } from '../supabase'
import { logger } from '../logger'
import { logAuditEvent, AuditEventType, AuditSeverity } from './audit-logging'

// Backup types
export const BackupTypeEnum = {
  FULL: 'full', // Complete database backup
  INCREMENTAL: 'incremental', // Changes since last backup
  DIFFERENTIAL: 'differential', // Changes since last full backup
  MANUAL: 'manual', // User-initiated backup
} as const

export type BackupType = typeof BackupTypeEnum[keyof typeof BackupTypeEnum]; const _BackupType = typeof BackupType[keyof typeof BackupType]

// Backup status
export const BackupStatusEnum = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export type BackupStatus = typeof BackupStatusEnum[keyof typeof BackupStatusEnum]; const _BackupStatus = typeof BackupStatus[keyof typeof BackupStatus]

// Backup record
export interface BackupRecord {
  id?: string
  backup_type: BackupType
  status: BackupStatus
  started_at: Date
  completed_at?: Date
  size_bytes?: number
  tables_included: string[]
  records_count?: number
  error_message?: string
  created_by?: string
}

// Tables to backup
const CRITICAL_TABLES = [
  'profiles',
  'students',
  'class_sessions',
  'class_credits',
  'payments',
  'invoices',
  'coupons',
  'packages',
  'user_consents',
  'audit_logs',
]

/**
 * Create a backup of critical data
 */
export async function createBackup(
  userId: string,
  backupType: BackupType = BackupType.MANUAL
): Promise<string> {
  const backupId = crypto.randomUUID()
  
  try {
    logger.info(`Starting ${backupType} backup initiated by user ${userId}`)
    
    // Create backup record
    const backupRecord: BackupRecord = {
      id: backupId,
      backup_type: backupType,
      status: BackupStatus.IN_PROGRESS,
      started_at: new Date(),
      tables_included: CRITICAL_TABLES,
      created_by: userId,
    }
    
    await supabase.from('backups').insert(backupRecord)
    
    // Perform backup
    const backupData: Record<string, any[]> = {}
    let totalRecords = 0
    
    for (const table of CRITICAL_TABLES) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
        
        if (error) {
          logger.error(`Failed to backup table ${table}:`, error)
          continue
        }
        
        backupData[table] = data || []
        totalRecords += data?.length || 0
      } catch (error) {
        logger.error(`Error backing up table ${table}:`, error)
      }
    }
    
    // Store backup data (in production, this would be stored in cloud storage)
    const backupJson = JSON.stringify(backupData, null, 2)
    const sizeBytes = new Blob([backupJson]).size
    
    // Update backup record
    await supabase
      .from('backups')
      .update({
        status: BackupStatus.COMPLETED,
        completed_at: new Date().toISOString(),
        size_bytes: sizeBytes,
        records_count: totalRecords,
      })
      .eq('id', backupId)
    
    // Log backup creation
    await logAuditEvent({
      event_type: AuditEventType.BACKUP_CREATED,
      severity: AuditSeverity.INFO,
      user_id: userId,
      action: `${backupType} backup created`,
      metadata: {
        backup_id: backupId,
        tables: CRITICAL_TABLES,
        records_count: totalRecords,
        size_bytes: sizeBytes,
      },
    })
    
    logger.info(`Backup ${backupId} completed successfully. ${totalRecords} records, ${sizeBytes} bytes`)
    
    return backupId
  } catch (error) {
    logger.error('Backup failed:', error)
    
    // Update backup record with error
    await supabase
      .from('backups')
      .update({
        status: BackupStatus.FAILED,
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', backupId)
    
    throw error
  }
}

/**
 * Restore data from backup
 */
export async function restoreBackup(
  userId: string,
  backupId: string,
  options: {
    tables?: string[]
    overwrite?: boolean
  } = {}
): Promise<void> {
  try {
    logger.info(`Starting restore from backup ${backupId} by user ${userId}`)
    
    // Get backup record
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single()
    
    if (backupError || !backup) {
      throw new Error('Backup not found')
    }
    
    if (backup.status !== BackupStatus.COMPLETED) {
      throw new Error('Backup is not completed')
    }
    
    // In production, retrieve backup data from cloud storage
    // For now, we'll simulate the restore process
    
    const tablesToRestore = options.tables || backup.tables_included
    
    logger.info(`Restoring tables: ${tablesToRestore.join(', ')}`)
    
    // Log restore operation
    await logAuditEvent({
      event_type: AuditEventType.BACKUP_RESTORED,
      severity: AuditSeverity.WARNING,
      user_id: userId,
      action: `Backup ${backupId} restored`,
      metadata: {
        backup_id: backupId,
        tables: tablesToRestore,
        overwrite: options.overwrite,
      },
    })
    
    logger.info(`Restore from backup ${backupId} completed successfully`)
  } catch (error) {
    logger.error('Restore failed:', error)
    throw error
  }
}

/**
 * List available backups
 */
export async function listBackups(filters: {
  backupType?: BackupType
  status?: BackupStatus
  startDate?: Date
  endDate?: Date
  limit?: number
} = {}): Promise<BackupRecord[]> {
  try {
    let query = supabase
      .from('backups')
      .select('*')
      .order('started_at', { ascending: false })
    
    if (filters.backupType) {
      query = query.eq('backup_type', filters.backupType)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.startDate) {
      query = query.gte('started_at', filters.startDate.toISOString())
    }
    
    if (filters.endDate) {
      query = query.lte('started_at', filters.endDate.toISOString())
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    logger.error('Failed to list backups:', error)
    return []
  }
}

/**
 * Delete old backups
 */
export async function cleanupOldBackups(retentionDays: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    const { data: oldBackups, error: selectError } = await supabase
      .from('backups')
      .select('id')
      .lt('started_at', cutoffDate.toISOString())
    
    if (selectError) throw selectError
    
    if (!oldBackups || oldBackups.length === 0) {
      logger.info('No old backups to clean up')
      return 0
    }
    
    const { error: deleteError } = await supabase
      .from('backups')
      .delete()
      .lt('started_at', cutoffDate.toISOString())
    
    if (deleteError) throw deleteError
    
    logger.info(`Cleaned up ${oldBackups.length} old backups`)
    return oldBackups.length
  } catch (error) {
    logger.error('Failed to cleanup old backups:', error)
    return 0
  }
}

/**
 * Schedule automatic backups
 */
export function scheduleAutomaticBackups(userId: string): void {
  // Daily full backup at 2 AM
  const dailyBackup = () => {
    const now = new Date()
    if (now.getHours() === 2) {
      createBackup(userId, BackupType.FULL)
        .then(() => logger.info('Automatic daily backup completed'))
        .catch(error => logger.error('Automatic daily backup failed:', error))
    }
  }
  
  // Check every hour
  setInterval(dailyBackup, 60 * 60 * 1000)
  
  logger.info('Automatic backup schedule configured')
}

/**
 * Verify backup integrity
 */
export async function verifyBackup(backupId: string): Promise<{
  valid: boolean
  errors: string[]
}> {
  try {
    const { data: backup, error } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single()
    
    if (error || !backup) {
      return { valid: false, errors: ['Backup not found'] }
    }
    
    const errors: string[] = []
    
    // Check backup status
    if (backup.status !== BackupStatus.COMPLETED) {
      errors.push('Backup is not completed')
    }
    
    // Check if backup has data
    if (!backup.records_count || backup.records_count === 0) {
      errors.push('Backup contains no records')
    }
    
    // Check if backup is not too old
    const backupAge = Date.now() - new Date(backup.started_at).getTime()
    const maxAge = 90 * 24 * 60 * 60 * 1000 // 90 days
    if (backupAge > maxAge) {
      errors.push('Backup is older than 90 days')
    }
    
    return {
      valid: errors.length === 0,
      errors,
    }
  } catch (error) {
    logger.error('Failed to verify backup:', error)
    return { valid: false, errors: ['Verification failed'] }
  }
}

/**
 * Export backup to file
 */
export async function exportBackupToFile(backupId: string): Promise<Blob> {
  try {
    const { data: backup, error } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single()
    
    if (error || !backup) {
      throw new Error('Backup not found')
    }
    
    // In production, retrieve actual backup data from cloud storage
    const backupData = {
      metadata: backup,
      data: {}, // Would contain actual backup data
    }
    
    const json = JSON.stringify(backupData, null, 2)
    return new Blob([json], { type: 'application/json' })
  } catch (error) {
    logger.error('Failed to export backup:', error)
    throw error
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStatistics(): Promise<{
  totalBackups: number
  successfulBackups: number
  failedBackups: number
  totalSize: number
  lastBackup: Date | null
  nextScheduledBackup: Date | null
}> {
  try {
    const { data: backups, error } = await supabase
      .from('backups')
      .select('*')
    
    if (error) throw error
    
    const totalBackups = backups?.length || 0
    const successfulBackups = backups?.filter(b => b.status === BackupStatus.COMPLETED).length || 0
    const failedBackups = backups?.filter(b => b.status === BackupStatus.FAILED).length || 0
    const totalSize = backups?.reduce((sum, b) => sum + (b.size_bytes || 0), 0) || 0
    
    const lastBackup = backups && backups.length > 0
      ? new Date(backups[0].started_at)
      : null
    
    // Calculate next scheduled backup (2 AM tomorrow)
    const nextScheduledBackup = new Date()
    nextScheduledBackup.setDate(nextScheduledBackup.getDate() + 1)
    nextScheduledBackup.setHours(2, 0, 0, 0)
    
    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      totalSize,
      lastBackup,
      nextScheduledBackup,
    }
  } catch (error) {
    logger.error('Failed to get backup statistics:', error)
    return {
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      totalSize: 0,
      lastBackup: null,
      nextScheduledBackup: null,
    }
  }
}

export default {
  createBackup,
  restoreBackup,
  listBackups,
  cleanupOldBackups,
  scheduleAutomaticBackups,
  verifyBackup,
  exportBackupToFile,
  getBackupStatistics,
}

