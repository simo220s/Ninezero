/**
 * Helper function to sync and fix student conversion data inconsistencies
 * 
 * This function checks for inconsistencies between the students and profiles tables
 * and fixes them to ensure data integrity.
 */

import { supabase } from './supabase'
import { logger } from './logger'

interface ConversionStatus {
  userId: string
  email: string
  studentsIsTrialStatus: boolean
  profilesIsTrialStatus: boolean
  isConsistent: boolean
}

/**
 * Check for conversion inconsistencies across all students
 */
export async function checkConversionConsistency(): Promise<ConversionStatus[]> {
  try {
    // Query to find all students and their corresponding profile status
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        user_id,
        is_trial,
        profiles!inner (
          id,
          email,
          is_trial,
          trial_completed
        )
      `)

    if (error) {
      logger.error('Error checking conversion consistency:', error)
      throw error
    }

    const results: ConversionStatus[] = (data || []).map((student: any) => {
      const studentsIsTrialStatus = student.is_trial
      const profilesIsTrialStatus = student.profiles.is_trial
      const isConsistent = studentsIsTrialStatus === profilesIsTrialStatus

      return {
        userId: student.user_id,
        email: student.profiles.email,
        studentsIsTrialStatus,
        profilesIsTrialStatus,
        isConsistent
      }
    })

    // Log inconsistencies
    const inconsistencies = results.filter(r => !r.isConsistent)
    if (inconsistencies.length > 0) {
      logger.warn(`Found ${inconsistencies.length} conversion inconsistencies:`)
      inconsistencies.forEach(inc => {
        logger.warn(`  - ${inc.email}: students.is_trial=${inc.studentsIsTrialStatus}, profiles.is_trial=${inc.profilesIsTrialStatus}`)
      })
    } else {
      logger.log('✓ All student conversion data is consistent')
    }

    return results
  } catch (error) {
    logger.error('Failed to check conversion consistency:', error)
    throw error
  }
}

/**
 * Fix conversion inconsistencies by syncing profiles table with students table
 * The students table is considered the source of truth
 */
export async function syncConversionData(userId: string): Promise<{ success: boolean; error?: any }> {
  try {
    logger.log(`Syncing conversion data for user ${userId}`)

    // Get student status
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('is_trial, user_id')
      .eq('user_id', userId)
      .single()

    if (studentError) {
      logger.error('Error fetching student:', studentError)
      return { success: false, error: studentError }
    }

    if (!student) {
      logger.error('Student not found')
      return { success: false, error: new Error('Student not found') }
    }

    // Update profile to match student status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_trial: student.is_trial,
        trial_completed: !student.is_trial,
        converted_at: student.is_trial ? null : new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      logger.error('Error updating profile:', profileError)
      return { success: false, error: profileError }
    }

    logger.log('✓ Conversion data synced successfully')
    return { success: true }
  } catch (error) {
    logger.error('Failed to sync conversion data:', error)
    return { success: false, error }
  }
}

/**
 * Fix all conversion inconsistencies in the database
 */
export async function fixAllConversionInconsistencies(): Promise<{
  fixed: number
  failed: number
  errors: any[]
}> {
  try {
    const statuses = await checkConversionConsistency()
    const inconsistencies = statuses.filter(s => !s.isConsistent)

    if (inconsistencies.length === 0) {
      logger.log('No inconsistencies to fix')
      return { fixed: 0, failed: 0, errors: [] }
    }

    logger.log(`Fixing ${inconsistencies.length} inconsistencies...`)

    let fixed = 0
    let failed = 0
    const errors: any[] = []

    for (const inc of inconsistencies) {
      const result = await syncConversionData(inc.userId)
      if (result.success) {
        fixed++
        logger.log(`✓ Fixed: ${inc.email}`)
      } else {
        failed++
        errors.push({ email: inc.email, error: result.error })
        logger.error(`✗ Failed to fix: ${inc.email}`, result.error)
      }
    }

    logger.log(`\nResults: ${fixed} fixed, ${failed} failed`)
    return { fixed, failed, errors }
  } catch (error) {
    logger.error('Failed to fix conversion inconsistencies:', error)
    throw error
  }
}
