import { supabase } from './supabase'
import type { User, ClassCredits } from '@/types'
import { retryOperation, parseSupabaseError } from './error-handling'
import { logger } from './logger'

// Database operations for the Saudi English Club platform

// User Profile Operations
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  
  return { data, error }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle()
  
  return { data, error }
}

// Class Credits Operations
export async function getUserCredits(userId: string): Promise<{ data: ClassCredits | null, error: any }> {
  const { data, error } = await supabase
    .from('class_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  return { data, error }
}

export async function addCredits(userId: string, amount: number) {
  const { data, error } = await supabase.rpc('add_credits', {
    user_id: userId,
    amount: amount
  })
  
  return { data, error }
}

export async function deductCredits(userId: string, amount: number) {
  const { data, error } = await supabase.rpc('deduct_credits', {
    user_id: userId,
    amount: amount
  })
  
  return { data, error }
}

// Referral Operations
export async function getUserReferrals(userId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_user_id', userId)
  
  return { data, error }
}

export async function createReferral(referrerUserId: string, referredUserId: string, referralCode: string) {
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_user_id: referrerUserId,
      referred_user_id: referredUserId,
      referral_code: referralCode,
      status: 'pending'
    })
    .select()
    .single()
  
  return { data, error }
}

// Appointment Operations
export async function getUserAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: true })
  
  return { data, error }
}

export async function createAppointment(appointment: {
  userId: string
  studentName: string
  appointmentType: 'trial' | 'regular'
  status: 'scheduled' | 'completed' | 'cancelled'
  appointmentDate: Date
  duration: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: appointment.userId,
      student_name: appointment.studentName,
      student_email: appointment.studentName, // This should be email in real implementation
      appointment_type: appointment.appointmentType,
      status: appointment.status,
      appointment_date: appointment.appointmentDate.toISOString(),
      duration: appointment.duration,
      notes: appointment.notes,
    })
    .select()
    .single()
  
  return { data, error }
}

// Student Operations (for teacher dashboard)
export async function getAllStudents() {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      profiles:user_id (
        first_name,
        last_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function getStudentsByLevel(level: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('level', level)
  
  return { data, error }
}

export async function getTrialStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('is_trial', true)
  
  return { data, error }
}

/**
 * Permanently delete a student and all related data
 * This will delete:
 * - Student record from students table
 * - Related class sessions
 * - Related reviews
 * - Related class credits
 * - Related appointments
 * - User profile (if student has user_id)
 */
export async function deleteStudentPermanently(studentId: string, userId?: string) {
  try {
    // Start a transaction-like operation by deleting related data first
    
    // 1. Delete class sessions
    const { error: sessionsError } = await supabase
      .from('class_sessions')
      .delete()
      .eq('student_id', studentId)
    
    if (sessionsError) {
      logger.error('Error deleting class sessions:', sessionsError)
      return { data: null, error: sessionsError }
    }

    // 2. Delete reviews
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .or(`student_id.eq.${studentId}${userId ? `,user_id.eq.${userId}` : ''}`)
    
    if (reviewsError) {
      logger.error('Error deleting reviews:', reviewsError)
      return { data: null, error: reviewsError }
    }

    // 3. Delete class credits
    if (userId) {
      const { error: creditsError } = await supabase
        .from('class_credits')
        .delete()
        .eq('user_id', userId)
      
      if (creditsError) {
        logger.error('Error deleting class credits:', creditsError)
        return { data: null, error: creditsError }
      }
    }

    // 4. Delete appointments
    const { error: appointmentsError } = await supabase
      .from('appointments')
      .delete()
      .eq('user_id', userId || studentId)
    
    if (appointmentsError) {
      logger.error('Error deleting appointments:', appointmentsError)
      return { data: null, error: appointmentsError }
    }

    // 5. Delete student record
    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)
      .select()
    
    if (error) {
      logger.error('Error deleting student:', error)
      return { data: null, error }
    }

    // 6. Optionally delete user profile if userId exists
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (profileError) {
        logger.error('Error deleting user profile:', profileError)
        // Don't fail the whole operation if profile deletion fails
      }

      // 7. Delete auth user (if exists)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) {
        logger.error('Error deleting auth user:', authError)
        // Don't fail the whole operation if auth deletion fails
      }
    }

    logger.log(`Student ${studentId} deleted permanently`)
    return { data, error: null }
  } catch (err) {
    logger.error('Error in deleteStudentPermanently:', err)
    return { data: null, error: err }
  }
}

// Appointment Management
export async function updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single()
  
  return { data, error }
}

export async function cancelAppointment(appointmentId: string, userId: string) {
  try {
    // Update appointment status to cancelled
    const { error: updateError } = await updateAppointmentStatus(appointmentId, 'cancelled')
    if (updateError) throw updateError

    // Refund credit for regular appointments
    const { data: appointment } = await supabase
      .from('appointments')
      .select('appointment_type')
      .eq('id', appointmentId)
      .single()

    if (appointment?.appointment_type === 'regular') {
      const { error: creditError } = await supabase.rpc('add_credits', {
        user_id: userId,
        amount: 1.0
      })
      if (creditError) throw creditError
    }

    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Referral reward system
export async function processFirstPaidLessonReferral(userId: string) {
  try {
    // Check if this is the user's first paid lesson
    const { data: paidLessons, error: lessonsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('user_id', userId)
      .eq('appointment_type', 'regular')
      .eq('status', 'completed')

    if (lessonsError) throw lessonsError

    // If this is the first paid lesson (count should be 1 after completion)
    if (paidLessons && paidLessons.length === 1) {
      // Find any pending referrals for this user
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .select('referrer_user_id, id')
        .eq('referred_user_id', userId)
        .eq('status', 'pending')
        .single()

      if (referralError || !referral) return { error: null }

      // Award additional 0.5 credits to referrer
      const { error: creditError } = await supabase.rpc('add_credits', {
        user_id: referral.referrer_user_id,
        amount: 0.5
      })

      if (creditError) throw creditError

      // Update referral status to completed and add credits awarded
      const { error: updateError } = await supabase
        .from('referrals')
        .update({ 
          status: 'completed',
          credits_awarded: 0.75 // 0.25 initial + 0.5 completion bonus
        })
        .eq('id', referral.id)

      if (updateError) throw updateError

      // Check for milestone bonuses
      await checkMilestoneBonuses(referral.referrer_user_id)
    }

    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Milestone bonus system
export async function checkMilestoneBonuses(userId: string) {
  try {
    // Get completed referrals count
    const { data: completedReferrals, error: referralsError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_user_id', userId)
      .eq('status', 'completed')

    if (referralsError) throw referralsError

    const completedCount = completedReferrals?.length || 0

    // Check for 5 referrals milestone (1 credit bonus)
    if (completedCount === 5) {
      await supabase.rpc('add_credits', {
        user_id: userId,
        amount: 1.0
      })

      // You could also create a notification or achievement record here
      logger.log(`User ${userId} reached 5 referrals milestone - awarded 1 credit bonus`)
    }

    // Check for 10 referrals milestone (20% discount - this would need to be handled in pricing logic)
    if (completedCount === 10) {
      // For now, we'll award additional credits equivalent to 20% discount
      await supabase.rpc('add_credits', {
        user_id: userId,
        amount: 2.0 // Equivalent to 20% discount on multiple lessons
      })

      logger.log(`User ${userId} reached 10 referrals milestone - awarded discount bonus`)
    }

    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Get referral statistics for a user
export async function getReferralStats(userId: string) {
  try {
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('status, credits_awarded')
      .eq('referrer_user_id', userId)

    if (error) throw error

    const stats = {
      totalReferrals: referrals?.length || 0,
      pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0,
      completedReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
      totalCreditsEarned: referrals?.reduce((sum, r) => sum + (r.credits_awarded || 0), 0) || 0
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Complete a lesson and process referral rewards
export async function completeLesson(appointmentId: string) {
  try {
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('user_id, appointment_type')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) throw appointmentError

    // Mark appointment as completed
    const { error: updateError } = await updateAppointmentStatus(appointmentId, 'completed')
    if (updateError) throw updateError

    // Process referral rewards if this is a regular (paid) lesson
    if (appointment.appointment_type === 'regular') {
      await processFirstPaidLessonReferral(appointment.user_id)
    }

    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Get milestone information for a user
export async function getMilestoneInfo(userId: string) {
  try {
    const { data: stats } = await getReferralStats(userId)
    if (!stats) return { data: null, error: 'Failed to get referral stats' }

    const completedReferrals = stats.completedReferrals
    
    // Determine next milestone and progress
    let nextMilestone = 5
    let milestoneReward = '1 نقطة مجانية'
    
    if (completedReferrals >= 10) {
      nextMilestone = Math.ceil(completedReferrals / 10) * 10 + 10
      milestoneReward = 'مكافآت حصرية'
    } else if (completedReferrals >= 5) {
      nextMilestone = 10
      milestoneReward = 'خصم 20% على الباقة التالية'
    }
    
    const progress = (completedReferrals / nextMilestone) * 100
    
    // Check if user has reached any milestones
    const reachedMilestones = []
    if (completedReferrals >= 5) reachedMilestones.push({ milestone: 5, reward: '1 نقطة مجانية' })
    if (completedReferrals >= 10) reachedMilestones.push({ milestone: 10, reward: 'خصم 20%' })
    
    return {
      data: {
        current: completedReferrals,
        next: nextMilestone,
        progress,
        reward: milestoneReward,
        reachedMilestones
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

// Class Session Management

export interface ClassSession {
  id: string
  student_id: string
  teacher_id: string
  date: string // ISO date
  time: string // HH:MM format
  duration: number // minutes
  meeting_link: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  is_trial: boolean
  recurring: boolean
  recurrence_pattern?: 'weekly' | 'biweekly'
  created_at: string
  updated_at: string
  student?: {
    first_name: string
    last_name: string
    email: string
  }
}

// Create a new class session with retry logic
export async function createClassSession(classData: {
  studentId: string
  teacherId: string
  date: string
  time: string
  duration: number
  meetingLink: string
  isTrial?: boolean
  recurring?: boolean
  recurrencePattern?: 'weekly' | 'biweekly'
}) {
  try {
    const result = await retryOperation(async () => {
      const { data, error } = await supabase
        .from('class_sessions')
        .insert([{
          student_id: classData.studentId,
          teacher_id: classData.teacherId,
          date: classData.date,
          time: classData.time,
          duration: classData.duration,
          meeting_link: classData.meetingLink,
          status: 'scheduled',
          is_trial: classData.isTrial || false,
          recurring: classData.recurring || false,
          recurrence_pattern: classData.recurrencePattern
        }])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    }, { maxAttempts: 3 })
    
    return result
  } catch (error) {
    const appError = parseSupabaseError(error)
    return { data: null, error: appError }
  }
}

// Get all classes for a student
export async function getStudentClasses(studentId: string) {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
  
  return { data, error }
}

// Get all classes for a teacher with student information
export async function getTeacherClasses(teacherId: string) {
  const { data, error } = await supabase
    .from('class_sessions')
    .select(`
      *,
      student:profiles!student_id(first_name, last_name, email)
    `)
    .eq('teacher_id', teacherId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
  
  return { data, error }
}

// Update a class session
export async function updateClassSession(classId: string, updates: {
  date?: string
  time?: string
  duration?: number
  meetingLink?: string
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
}) {
  const updateData: any = {}
  
  if (updates.date) updateData.date = updates.date
  if (updates.time) updateData.time = updates.time
  if (updates.duration) updateData.duration = updates.duration
  if (updates.meetingLink) updateData.meeting_link = updates.meetingLink
  if (updates.status) updateData.status = updates.status
  
  const { data, error } = await supabase
    .from('class_sessions')
    .update(updateData)
    .eq('id', classId)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Cancel class with different options (makeup, health, regular)
 */
export async function cancelClassWithOptions(classId: string, options: {
  type: 'makeup' | 'health' | 'regular'
  reason?: string
  refundCredits: boolean
}) {
  try {
    // Build update object with available fields
    const updateData: any = {
      status: 'cancelled',
      cancellation_reason: options.reason || `إلغاء ${options.type === 'makeup' ? 'مع حصة تعويضية' : options.type === 'health' ? 'بسبب مشاكل صحية' : 'عادي'}`
    }

    // Add optional fields if they exist in the schema
    // Note: These fields may need to be added to the database schema
    // For now, we'll store the type in cancellation_reason or metadata if available

    const { data, error } = await supabase
      .from('class_sessions')
      .update(updateData)
      .eq('id', classId)
      .select()
      .single()

    if (error) {
      logger.error('Error cancelling class:', error)
      return { data: null, error }
    }

    logger.log(`Class cancelled with type: ${options.type}`, { classId, refundCredits: options.refundCredits })
    return { data, error: null }
  } catch (err) {
    logger.error('Unexpected error cancelling class:', err)
    return { data: null, error: err }
  }
}

/**
 * Create a makeup class
 */
export async function createMakeupClass(data: {
  originalClassId: string
  studentId: string
  date: string
  time: string
  duration: number
}) {
  try {
    // Get the original class to copy teacher and other details
    const { data: originalClass, error: fetchError } = await supabase
      .from('class_sessions')
      .select('teacher_id, meeting_link, is_trial, class_type')
      .eq('id', data.originalClassId)
      .single()

    if (fetchError || !originalClass) {
      logger.error('Error fetching original class:', fetchError)
      return { data: null, error: fetchError || new Error('Original class not found') }
    }

    // Create the makeup class
    // Note: is_makeup and original_class_id may need to be added to schema
    // For now, we'll add a note in cancellation_reason or create a separate field
    const { data: makeupClass, error } = await supabase
      .from('class_sessions')
      .insert({
        student_id: data.studentId,
        teacher_id: originalClass.teacher_id,
        date: data.date,
        time: data.time,
        duration: data.duration,
        meeting_link: originalClass.meeting_link || '',
        status: 'scheduled',
        is_trial: originalClass.is_trial || false,
        class_type: originalClass.class_type || 'Individual',
        cancellation_reason: `حصة تعويضية للحصة ${data.originalClassId}`
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating makeup class:', error)
      return { data: null, error }
    }

    logger.log('Makeup class created successfully', { makeupClassId: makeupClass.id })
    return { data: makeupClass, error: null }
  } catch (err) {
    logger.error('Unexpected error creating makeup class:', err)
    return { data: null, error: err }
  }
}

// Delete a class session
export async function deleteClassSession(classId: string) {
  const { error } = await supabase
    .from('class_sessions')
    .delete()
    .eq('id', classId)
  
  return { error }
}

// Get student type (trial or regular)
export async function getStudentType(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_trial, trial_completed')
    .eq('id', userId)
    .maybeSingle()
  
  return { data, error }
}

/**
 * Convert trial student to regular student with atomic transaction-like behavior
 * This function ensures data consistency between students and profiles tables
 * 
 * @param studentId - The ID of the student to convert
 * @returns Object with data or error
 */
export async function convertTrialStudent(studentId: string) {
  // Track original state for potential rollback
  let originalStudentState: { is_trial: boolean; updated_at: string } | null = null
  let studentUpdateCompleted = false
  let profileUpdateCompleted = false

  try {
    const result = await retryOperation(async () => {
      logger.log('=== Starting conversion process ===')
      logger.log('Student ID:', studentId)
      
      // STEP 1: Fetch and validate student record
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('user_id, is_trial, updated_at')
        .eq('id', studentId)
        .single()
      
      if (fetchError) {
        logger.error('❌ Error fetching student:', fetchError)
        throw new Error(`Failed to fetch student: ${fetchError.message}`)
      }
      
      if (!student) {
        logger.error('❌ Student not found')
        throw new Error('Student not found')
      }

      if (!student.user_id) {
        logger.error('❌ Student has no user_id')
        throw new Error('Student must have an associated user account')
      }
      
      // Check if already converted
      if (!student.is_trial) {
        logger.log('✅ Student is already a regular student')
        return { data: { message: 'Student is already regular' }, error: null }
      }
      
      // Store original state for potential rollback
      originalStudentState = {
        is_trial: student.is_trial,
        updated_at: student.updated_at
      }
      
      logger.log('✓ Found trial student with user_id:', student.user_id)
      
      // STEP 2: Update students table (First critical operation)
      logger.log('→ Updating students table...')
      const { error: studentsUpdateError } = await supabase
        .from('students')
        .update({ 
          is_trial: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)
      
      if (studentsUpdateError) {
        logger.error('❌ CRITICAL: Failed to update students table:', studentsUpdateError)
        throw new Error(`Failed to update students table: ${studentsUpdateError.message}`)
      }
      
      studentUpdateCompleted = true
      logger.log('✓ Students table updated successfully')
      
      // STEP 3: Update profiles table (Second critical operation)
      logger.log('→ Updating profiles table...')
      const { error: profilesUpdateError } = await supabase
        .from('profiles')
        .update({ 
          is_trial: false,
          trial_completed: true,
          converted_at: new Date().toISOString()
        })
        .eq('id', student.user_id)
      
      if (profilesUpdateError) {
        logger.error('❌ CRITICAL: Failed to update profiles table:', profilesUpdateError)
        logger.log('→ Attempting rollback of students table...')
        
        // ROLLBACK: Revert students table to original state
        try {
          const { error: rollbackError } = await supabase
            .from('students')
            .update(originalStudentState!)
            .eq('id', studentId)
          
          if (rollbackError) {
            logger.error('❌ ROLLBACK FAILED:', rollbackError)
            throw new Error(
              `Conversion failed and rollback unsuccessful. CRITICAL: Data inconsistency detected. ` +
              `Students table updated but profiles table failed. Manual intervention required for student ${studentId}`
            )
          }
          
          logger.log('✓ Rollback successful - students table reverted')
        } catch (rollbackError) {
          logger.error('❌ Rollback exception:', rollbackError)
          throw new Error(
            `Conversion failed with rollback error. CRITICAL: Data may be inconsistent for student ${studentId}`
          )
        }
        
        throw new Error(`Failed to update profiles table: ${profilesUpdateError.message}`)
      }
      
      profileUpdateCompleted = true
      logger.log('✓ Profiles table updated successfully')
      
      // STEP 4: Verify data consistency (Post-conversion check)
      logger.log('→ Verifying data consistency...')
      const { data: verifyStudent, error: verifyStudentError } = await supabase
        .from('students')
        .select('is_trial')
        .eq('id', studentId)
        .single()
      
      const { data: verifyProfile, error: verifyProfileError } = await supabase
        .from('profiles')
        .select('is_trial, trial_completed')
        .eq('id', student.user_id)
        .single()
      
      if (verifyStudentError || verifyProfileError) {
        logger.error('❌ Verification query failed')
        logger.error('Student verification error:', verifyStudentError)
        logger.error('Profile verification error:', verifyProfileError)
      } else {
        const isConsistent = 
          verifyStudent?.is_trial === false && 
          verifyProfile?.is_trial === false && 
          verifyProfile?.trial_completed === true
        
        if (!isConsistent) {
          logger.error('❌ WARNING: Data inconsistency detected after conversion!')
          logger.error('Student is_trial:', verifyStudent?.is_trial)
          logger.error('Profile is_trial:', verifyProfile?.is_trial)
          logger.error('Profile trial_completed:', verifyProfile?.trial_completed)
        } else {
          logger.log('✓ Data consistency verified')
        }
      }

      // STEP 5: Create success notification (Non-critical - don't fail conversion)
      logger.log('→ Creating success notification...')
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: student.user_id,
            type: 'conversion',
            title: 'تم تحويلك إلى طالب نظامي!',
            message: 'مبروك! تم تحويلك إلى طالب نظامي. يمكنك الآن حجز حصصك المنتظمة والاستفادة من جميع المزايا.',
            read: false,
            created_at: new Date().toISOString()
          })
        logger.log('✓ Notification created successfully')
      } catch (notificationError) {
        logger.error('⚠ Failed to create notification (non-critical):', notificationError)
        // Don't fail the conversion if notification fails
      }
      
      logger.log('=== Conversion completed successfully ===')
      return { 
        data: { 
          message: 'Conversion successful',
          studentId,
          userId: student.user_id,
          studentsTableUpdated: studentUpdateCompleted,
          profilesTableUpdated: profileUpdateCompleted
        }, 
        error: null 
      }
    }, { maxAttempts: 3 })
    
    return result
  } catch (error) {
    logger.error('=== Conversion failed ===')
    logger.error('Error details:', error)
    logger.error('Students table updated:', studentUpdateCompleted)
    logger.error('Profiles table updated:', profileUpdateCompleted)
    
    const appError = parseSupabaseError(error)
    return { 
      data: null, 
      error: {
        ...appError,
        details: {
          studentId,
          studentsTableUpdated: studentUpdateCompleted,
          profilesTableUpdated: profileUpdateCompleted,
          originalError: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }
}
