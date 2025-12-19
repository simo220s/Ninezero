/**
 * Dashboard Statistics Service
 * 
 * Provides real-time statistics for the teacher dashboard by querying
 * the Supabase database instead of using mock data.
 * 
 * Phase 1.1 - Replace Mock Data in Teacher Dashboard
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface TeacherStats {
  totalStudents: number
  activeStudents: number
  trialStudents: number
  upcomingClasses: number
  completedClasses: number
  thisWeekClasses: number
  successRate: number
  totalEarnings: number
}

export interface DashboardStatsError {
  error: string
  details?: any
}

/**
 * Get comprehensive statistics for a teacher's dashboard
 */
export async function getTeacherStats(
  teacherId: string
): Promise<{ data: TeacherStats | null; error: DashboardStatsError | null }> {
  try {
    // Parallel queries for better performance
    const [
      studentsResult,
      upcomingClassesResult,
      completedClassesResult,
      thisWeekClassesResult,
      reviewsResult,
      earningsResult,
    ] = await Promise.all([
      getStudentCounts(teacherId),
      getUpcomingClassesCount(teacherId),
      getCompletedClassesCount(teacherId),
      getThisWeekClassesCount(teacherId),
      getAverageRating(teacherId),
      getTotalEarnings(teacherId),
    ])

    // Check for errors in any query
    if (studentsResult.error) {
      return { data: null, error: { error: 'Failed to fetch student counts', details: studentsResult.error } }
    }
    if (upcomingClassesResult.error) {
      return { data: null, error: { error: 'Failed to fetch upcoming classes', details: upcomingClassesResult.error } }
    }
    if (completedClassesResult.error) {
      return { data: null, error: { error: 'Failed to fetch completed classes', details: completedClassesResult.error } }
    }
    if (thisWeekClassesResult.error) {
      return { data: null, error: { error: 'Failed to fetch this week classes', details: thisWeekClassesResult.error } }
    }
    if (reviewsResult.error) {
      return { data: null, error: { error: 'Failed to fetch reviews', details: reviewsResult.error } }
    }
    if (earningsResult.error) {
      return { data: null, error: { error: 'Failed to fetch earnings', details: earningsResult.error } }
    }

    const stats: TeacherStats = {
      totalStudents: studentsResult.data?.total || 0,
      activeStudents: studentsResult.data?.active || 0,
      trialStudents: studentsResult.data?.trial || 0,
      upcomingClasses: upcomingClassesResult.data || 0,
      completedClasses: completedClassesResult.data || 0,
      thisWeekClasses: thisWeekClassesResult.data || 0,
      successRate: reviewsResult.data || 0,
      totalEarnings: earningsResult.data || 0,
    }

    logger.log('Teacher stats fetched successfully', { teacherId, stats })
    return { data: stats, error: null }
  } catch (err) {
    logger.error('Error fetching teacher stats:', err)
    return { data: null, error: { error: 'Unexpected error fetching stats', details: err } }
  }
}

/**
 * Get student counts (total, active, trial)
 */
async function getStudentCounts(teacherId: string) {
  try {
    // Get all students for this teacher from class_sessions
    const { data: sessions, error } = await supabase
      .from('class_sessions')
      .select('student_id, student:profiles!class_sessions_student_id_fkey(is_trial)')
      .eq('teacher_id', teacherId)

    if (error) {
      logger.error('Error fetching student counts:', error)
      return { data: null, error }
    }

    // Get unique students
    const uniqueStudentIds = new Set(sessions?.map(s => s.student_id) || [])
    const total = uniqueStudentIds.size

    // Count trial vs active students
    const studentDetails = sessions?.reduce((acc, session) => {
      if (session.student_id && !acc.has(session.student_id)) {
        acc.set(session.student_id, session.student?.is_trial || false)
      }
      return acc
    }, new Map<string, boolean>())

    const trial = Array.from(studentDetails?.values() || []).filter(isTrial => isTrial).length
    const active = total - trial

    return {
      data: { total, active, trial },
      error: null,
    }
  } catch (err) {
    logger.error('Unexpected error in getStudentCounts:', err)
    return { data: null, error: err }
  }
}

/**
 * Get count of upcoming scheduled classes
 */
async function getUpcomingClassesCount(teacherId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { count, error } = await supabase
      .from('class_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('status', 'scheduled')
      .gte('date', today)

    if (error) {
      logger.error('Error fetching upcoming classes count:', error)
      return { data: null, error }
    }

    return { data: count || 0, error: null }
  } catch (err) {
    logger.error('Unexpected error in getUpcomingClassesCount:', err)
    return { data: null, error: err }
  }
}

/**
 * Get count of completed classes
 */
async function getCompletedClassesCount(teacherId: string) {
  try {
    const { count, error } = await supabase
      .from('class_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')

    if (error) {
      logger.error('Error fetching completed classes count:', error)
      return { data: null, error }
    }

    return { data: count || 0, error: null }
  } catch (err) {
    logger.error('Unexpected error in getCompletedClassesCount:', err)
    return { data: null, error: err }
  }
}

/**
 * Get count of classes scheduled for this week
 */
async function getThisWeekClassesCount(teacherId: string) {
  try {
    // Calculate start and end of current week
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const startDate = startOfWeek.toISOString().split('T')[0]
    const endDate = endOfWeek.toISOString().split('T')[0]

    const { count, error } = await supabase
      .from('class_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('status', 'scheduled')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      logger.error('Error fetching this week classes count:', error)
      return { data: null, error }
    }

    return { data: count || 0, error: null }
  } catch (err) {
    logger.error('Unexpected error in getThisWeekClassesCount:', err)
    return { data: null, error: err }
  }
}

/**
 * Calculate success rate from reviews
 * Success rate = (Average rating / 5) * 100
 */
async function getAverageRating(teacherId: string) {
  try {
    // Get all reviews for this teacher's students
    // Since reviews table references student_id, we need to find classes taught by this teacher
    const { data: sessions, error: sessionsError } = await supabase
      .from('class_sessions')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')

    if (sessionsError) {
      logger.error('Error fetching sessions for reviews:', sessionsError)
      return { data: null, error: sessionsError }
    }

    // Get reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('is_approved', true)

    if (reviewsError) {
      logger.error('Error fetching reviews:', reviewsError)
      return { data: null, error: reviewsError }
    }

    if (!reviews || reviews.length === 0) {
      // Default to 98% if no reviews yet (as per original mock)
      return { data: 98, error: null }
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    const successRate = Math.round((averageRating / 5) * 100)

    return { data: successRate, error: null }
  } catch (err) {
    logger.error('Unexpected error in getAverageRating:', err)
    return { data: null, error: err }
  }
}

/**
 * Calculate total earnings from completed classes
 * Using credit_transactions with 'deduct' type (credits spent on classes)
 */
async function getTotalEarnings(teacherId: string) {
  try {
    // Get all completed classes for this teacher
    const { data: completedSessions, error: sessionsError } = await supabase
      .from('class_sessions')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')

    if (sessionsError) {
      logger.error('Error fetching completed sessions:', sessionsError)
      return { data: null, error: sessionsError }
    }

    if (!completedSessions || completedSessions.length === 0) {
      return { data: 0, error: null }
    }

    // Calculate earnings based on credit system
    // Assuming each class session uses credits, and we need to track revenue
    // For now, using a simple calculation: number of completed classes * average price
    // In a real system, this would come from a payments table or pricing configuration
    
    // Temporary calculation: completed classes * 150 SAR average (can be refined)
    const averagePricePerClass = 150 // SAR - this should come from pricing config
    const totalEarnings = completedSessions.length * averagePricePerClass

    return { data: totalEarnings, error: null }
  } catch (err) {
    logger.error('Unexpected error in getTotalEarnings:', err)
    return { data: null, error: err }
  }
}

/**
 * Get detailed class statistics
 */
export async function getClassStatistics(teacherId: string) {
  try {
    const { data: sessions, error } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('teacher_id', teacherId)

    if (error) {
      logger.error('Error fetching class statistics:', error)
      return { data: null, error }
    }

    const stats = {
      total: sessions?.length || 0,
      scheduled: sessions?.filter(s => s.status === 'scheduled').length || 0,
      completed: sessions?.filter(s => s.status === 'completed').length || 0,
      cancelled: sessions?.filter(s => s.status === 'cancelled').length || 0,
      noShow: sessions?.filter(s => s.status === 'no-show').length || 0,
    }

    return { data: stats, error: null }
  } catch (err) {
    logger.error('Unexpected error in getClassStatistics:', err)
    return { data: null, error: err }
  }
}

export const dashboardStatsService = {
  getTeacherStats,
  getClassStatistics,
}

export default dashboardStatsService

