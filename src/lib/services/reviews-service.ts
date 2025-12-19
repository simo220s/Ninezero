/**
 * Reviews and Feedback Service
 * 
 * Provides functionality for fetching, filtering, and managing student/parent
 * reviews and teacher responses.
 * 
 * Phase 3.1 - Reviews Management Page Implementation
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface Review {
  id: string
  student_id: string
  student_name: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
  is_approved: boolean
  lesson_id?: string
  teacher_response?: string
  responded_at?: string
}

export interface ReviewAnalytics {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  responseRate: number
  respondedCount: number
  pendingCount: number
}

/**
 * Get all reviews for a teacher
 */
export async function getTeacherReviews(teacherId: string): Promise<{
  data: Review[] | null
  error: any
}> {
  try {
    // Get all completed class sessions for this teacher
    const { data: sessions, error: sessionsError } = await supabase
      .from('class_sessions')
      .select(`
        id,
        student:profiles!class_sessions_student_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')

    if (sessionsError) {
      logger.error('Error fetching teacher sessions for reviews:', sessionsError)
      return { data: null, error: sessionsError }
    }

    if (!sessions || sessions.length === 0) {
      return { data: [], error: null }
    }

    // Get reviews for these sessions
    // Note: Currently the reviews table doesn't have direct foreign key to class_sessions
    // It references lessons table. We'll fetch all reviews for now and filter by student
    const studentIds = sessions
      .map(s => s.student?.id)
      .filter(Boolean) as string[]

    if (studentIds.length === 0) {
      return { data: [], error: null }
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      logger.error('Error fetching reviews:', reviewsError)
      return { data: null, error: reviewsError }
    }

    // Transform reviews to include student names from sessions data
    const transformedReviews: Review[] = (reviews || []).map(review => {
      const session = sessions.find(s => s.student?.id === review.student_id)
      const studentName = session?.student
        ? `${session.student.first_name} ${session.student.last_name}`
        : review.student_name || 'طالب'

      return {
        id: review.id,
        student_id: review.student_id,
        student_name: studentName,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
        is_approved: review.is_approved,
        lesson_id: review.lesson_id,
        teacher_response: undefined, // TODO: Add teacher_response field to reviews table
        responded_at: undefined,
      }
    })

    return { data: transformedReviews, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching teacher reviews:', err)
    return { data: null, error: err }
  }
}

/**
 * Get review analytics for a teacher
 */
export async function getReviewAnalytics(teacherId: string): Promise<{
  data: ReviewAnalytics | null
  error: any
}> {
  try {
    const { data: reviews, error } = await getTeacherReviews(teacherId)

    if (error) {
      return { data: null, error }
    }

    if (!reviews || reviews.length === 0) {
      return {
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          responseRate: 0,
          respondedCount: 0,
          pendingCount: 0,
        },
        error: null,
      }
    }

    // Calculate analytics
    const totalReviews = reviews.length
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / totalReviews

    const ratingDistribution: ReviewAnalytics['ratingDistribution'] = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }

    const respondedCount = reviews.filter(r => r.teacher_response).length
    const pendingCount = totalReviews - respondedCount
    const responseRate = totalReviews > 0 ? (respondedCount / totalReviews) * 100 : 0

    const analytics: ReviewAnalytics = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution,
      responseRate: Math.round(responseRate),
      respondedCount,
      pendingCount,
    }

    return { data: analytics, error: null }
  } catch (err) {
    logger.error('Unexpected error calculating review analytics:', err)
    return { data: null, error: err }
  }
}

/**
 * Submit teacher response to a review
 * Note: This would need a teacher_response field added to the reviews table
 */
export async function submitTeacherResponse(
  reviewId: string,
  response: string
): Promise<{
  success: boolean
  error: any
}> {
  try {
    // TODO: Once teacher_response field is added to reviews table, update here
    logger.log('Submitting teacher response:', { reviewId, response })
    
    // Placeholder: In a real implementation, this would update the database
    // const { error } = await supabase
    //   .from('reviews')
    //   .update({
    //     teacher_response: response,
    //     responded_at: new Date().toISOString(),
    //   })
    //   .eq('id', reviewId)

    // if (error) {
    //   logger.error('Error submitting teacher response:', error)
    //   return { success: false, error }
    // }

    return { success: true, error: null }
  } catch (err) {
    logger.error('Unexpected error submitting teacher response:', err)
    return { success: false, error: err }
  }
}

/**
 * Mark review as read/addressed
 * Uses is_approved field temporarily until a separate field is added
 */
export async function markReviewAsAddressed(
  reviewId: string
): Promise<{
  success: boolean
  error: any
}> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId)

    if (error) {
      logger.error('Error marking review as addressed:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (err) {
    logger.error('Unexpected error marking review as addressed:', err)
    return { success: false, error: err }
  }
}

/**
 * Filter reviews by criteria
 */
export function filterReviews(
  reviews: Review[],
  filters: {
    searchTerm?: string
    rating?: number | 'all'
    hasResponse?: boolean | 'all'
    dateFrom?: Date
    dateTo?: Date
  }
): Review[] {
  let filtered = [...reviews]

  // Search by student name or comment
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(
      r =>
        r.student_name.toLowerCase().includes(term) ||
        r.comment.toLowerCase().includes(term)
    )
  }

  // Filter by rating
  if (filters.rating && filters.rating !== 'all') {
    filtered = filtered.filter(r => r.rating === filters.rating)
  }

  // Filter by response status
  if (filters.hasResponse !== 'all' && filters.hasResponse !== undefined) {
    filtered = filtered.filter(r => Boolean(r.teacher_response) === filters.hasResponse)
  }

  // Filter by date range
  if (filters.dateFrom) {
    filtered = filtered.filter(r => new Date(r.created_at) >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    filtered = filtered.filter(r => new Date(r.created_at) <= filters.dateTo!)
  }

  return filtered
}

export const reviewsService = {
  getTeacherReviews,
  getReviewAnalytics,
  submitTeacherResponse,
  markReviewAsAddressed,
  filterReviews,
}

export default reviewsService

