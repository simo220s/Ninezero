/**
 * Statistics and Analytics Service
 * 
 * Provides comprehensive analytics for teacher performance including:
 * - Student analytics
 * - Class analytics  
 * - Financial analytics
 * - Performance metrics
 * 
 * Phase 3.2 - Comprehensive Statistics Page
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { getMonthKey, getArabicMonthName, ARABIC_MONTH_NAMES } from '@/lib/utils/date-helpers'

export interface PerformanceMetrics {
  totalStudents: number
  activeStudents: number
  totalClasses: number
  completedClasses: number
  completionRate: number
  attendanceRate: number
  averageRating: number
  totalRevenue: number
  monthlyRevenue: number
}

export interface AgeGroupAnalytics {
  ageGroup: '10-12' | '13-15' | '16-18'
  studentCount: number
  completedLessons: number
  averageProgress: number
  revenue: number
}

export interface LevelAnalytics {
  level: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced'
  studentCount: number
  completedLessons: number
  averageRating: number
  progressRate: number
}

export interface MonthlyTrend {
  month: string
  students: number
  classes: number
  revenue: number
  rating: number
}

/**
 * Get comprehensive performance metrics for a teacher
 */
export async function getPerformanceMetrics(
  teacherId: string,
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
): Promise<{
  data: PerformanceMetrics | null
  error: any
}> {
  try {
    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    // Get all class sessions for this teacher
    const { data: allSessions, error: allSessionsError } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('teacher_id', teacherId)

    if (allSessionsError) {
      logger.error('Error fetching all sessions:', allSessionsError)
      return { data: null, error: allSessionsError }
    }

    // Get sessions within time range
    const { data: rangeSessions, error: rangeError } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('teacher_id', teacherId)
      .gte('date', startDate.toISOString().split('T')[0])

    if (rangeError) {
      logger.error('Error fetching range sessions:', rangeError)
      return { data: null, error: rangeError }
    }

    // Get unique students
    const allStudentIds = new Set(allSessions?.map(s => s.student_id) || [])
    const totalStudents = allStudentIds.size

    // Calculate active students (had class in time range)
    const rangeStudentIds = new Set(rangeSessions?.map(s => s.student_id) || [])
    const activeStudents = rangeStudentIds.size

    // Calculate class stats
    const totalClasses = allSessions?.length || 0
    const completedClasses = allSessions?.filter(s => s.status === 'completed').length || 0
    const completionRate = totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0

    // Calculate attendance rate (completed + scheduled vs no-show + cancelled)
    const scheduledOrCompleted = allSessions?.filter(s => 
      s.status === 'scheduled' || s.status === 'completed'
    ).length || 0
    const attendanceRate = totalClasses > 0 ? (scheduledOrCompleted / totalClasses) * 100 : 0

    // Get average rating from reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('is_approved', true)
    
    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Calculate revenue (using average price per class)
    const averagePricePerClass = 150 // SAR - should come from pricing config
    const totalRevenue = completedClasses * averagePricePerClass
    
    // Monthly revenue from sessions in current month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const monthlyCompleted = rangeSessions?.filter(s => 
      s.status === 'completed' && 
      new Date(s.date) >= monthStart
    ).length || 0
    
    const monthlyRevenue = monthlyCompleted * averagePricePerClass

    const metrics: PerformanceMetrics = {
      totalStudents,
      activeStudents,
      totalClasses,
      completedClasses,
      completionRate: Math.round(completionRate * 10) / 10,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRevenue,
      monthlyRevenue,
    }

    return { data: metrics, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching performance metrics:', err)
    return { data: null, error: err }
  }
}

/**
 * Get age group analytics
 */
export async function getAgeGroupAnalytics(
  teacherId: string
): Promise<{
  data: AgeGroupAnalytics[] | null
  error: any
}> {
  try {
    // Get all completed sessions for this teacher
    const { data: sessions, error } = await supabase
      .from('class_sessions')
      .select(`
        id,
        duration,
        student:profiles!class_sessions_student_id_fkey(id)
      `)
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')

    if (error) {
      logger.error('Error fetching sessions for age group analytics:', error)
      return { data: null, error }
    }

    // Group by age groups (placeholder - would need age field in profiles)
    // For now, distribute evenly across age groups
    const totalSessions = sessions?.length || 0
    const studentsPerGroup = Math.ceil(totalSessions / 3)
    
    const averagePricePerClass = 150 // SAR

    const analytics: AgeGroupAnalytics[] = [
      {
        ageGroup: '10-12',
        studentCount: studentsPerGroup,
        completedLessons: Math.floor(totalSessions * 0.35),
        averageProgress: 78,
        revenue: Math.floor(totalSessions * 0.35) * 150,
      },
      {
        ageGroup: '13-15',
        studentCount: studentsPerGroup,
        completedLessons: Math.floor(totalSessions * 0.4),
        averageProgress: 82,
        revenue: Math.floor(totalSessions * 0.4) * 175,
      },
      {
        ageGroup: '16-18',
        studentCount: studentsPerGroup,
        completedLessons: Math.floor(totalSessions * 0.25),
        averageProgress: 85,
        revenue: Math.floor(totalSessions * 0.25) * 200,
      },
    ]

    return { data: analytics, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching age group analytics:', err)
    return { data: null, error: err }
  }
}

/**
 * Get English level analytics
 */
export async function getLevelAnalytics(
  teacherId: string
): Promise<{
  data: LevelAnalytics[] | null
  error: any
}> {
  try {
    // Get completed sessions
    const { data: sessions, error } = await supabase
      .from('class_sessions')
      .select('id, student_id')
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')

    if (error) {
      logger.error('Error fetching sessions for level analytics:', error)
      return { data: null, error }
    }

    const totalSessions = sessions?.length || 0
    const uniqueStudents = new Set(sessions?.map(s => s.student_id) || []).size

    // Placeholder distribution (would need level field in profiles/students)
    const analytics: LevelAnalytics[] = [
      {
        level: 'Beginner',
        studentCount: Math.ceil(uniqueStudents * 0.35),
        completedLessons: Math.floor(totalSessions * 0.3),
        averageRating: 4.8,
        progressRate: 75,
      },
      {
        level: 'Elementary',
        studentCount: Math.ceil(uniqueStudents * 0.3),
        completedLessons: Math.floor(totalSessions * 0.35),
        averageRating: 4.7,
        progressRate: 80,
      },
      {
        level: 'Intermediate',
        studentCount: Math.ceil(uniqueStudents * 0.2),
        completedLessons: Math.floor(totalSessions * 0.25),
        averageRating: 4.6,
        progressRate: 82,
      },
      {
        level: 'Advanced',
        studentCount: Math.ceil(uniqueStudents * 0.15),
        completedLessons: Math.floor(totalSessions * 0.1),
        averageRating: 4.9,
        progressRate: 88,
      },
    ]

    return { data: analytics, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching level analytics:', err)
    return { data: null, error: err }
  }
}

/**
 * Get monthly trends for the past N months
 */
export async function getMonthlyTrends(
  teacherId: string,
  months: number = 5
): Promise<{
  data: MonthlyTrend[] | null
  error: any
}> {
  try {
    // Get sessions from past N months
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const { data: sessions, error } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('teacher_id', teacherId)
      .gte('date', startDate.toISOString().split('T')[0])

    if (error) {
      logger.error('Error fetching sessions for trends:', error)
      return { data: null, error }
    }

    // Group by month
    const monthlyData: Record<string, MonthlyTrend> = {}
    const averagePricePerClass = 150

    ;(sessions || []).forEach(session => {
      const date = new Date(session.date)
      const monthKey = getMonthKey(date)
      const monthName = getArabicMonthName(date)

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          students: 0,
          classes: 0,
          revenue: 0,
          rating: 4.7, // Placeholder
        }
      }

      monthlyData[monthKey].classes++
      if (session.status === 'completed') {
        monthlyData[monthKey].revenue += averagePricePerClass
      }
    })

    // Count unique students per month
    Object.keys(monthlyData).forEach(key => {
      const monthSessions = (sessions || []).filter(s => {
        const date = new Date(s.date)
        return `${date.getFullYear()}-${date.getMonth()}` === key
      })
      monthlyData[key].students = new Set(monthSessions.map(s => s.student_id)).size
    })

    // Convert to array and sort by date
    const trends = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, data]) => data)

    return { data: trends, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching monthly trends:', err)
    return { data: null, error: err }
  }
}

export const statisticsService = {
  getPerformanceMetrics,
  getAgeGroupAnalytics,
  getLevelAnalytics,
  getMonthlyTrends,
}

export default statisticsService

