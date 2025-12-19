import { supabase } from './supabase'

/**
 * Admin-specific database operations
 */

export interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  trialStudents: number
  regularStudents: number
  scheduledClasses: number
  completedClasses: number
  totalCredits: number
  averageRating: number
}

export interface UpcomingClass {
  id: string
  date: string
  time: string
  duration: number
  studentName: string
  teacherName: string
  meetingLink?: string
  status: string
}

export interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

/**
 * Get dashboard statistics for admin
 */
export async function getAdminDashboardStats(): Promise<{ data: AdminStats | null; error: any }> {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError

    // Get students count (role = 'student' or users without teacher email)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('is_trial, role')

    if (profilesError) throw profilesError

    const students = profiles?.filter(p => p.role !== 'teacher' && p.role !== 'admin') || []
    const totalStudents = students.length
    const trialStudents = students.filter(s => s.is_trial).length
    const regularStudents = students.filter(s => !s.is_trial).length

    // Get teachers count
    const { count: totalTeachers, error: teachersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher')

    if (teachersError) throw teachersError

    // Get scheduled classes count
    const { count: scheduledClasses, error: scheduledError } = await supabase
      .from('class_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled')

    if (scheduledError) throw scheduledError

    // Get completed classes count
    const { count: completedClasses, error: completedError } = await supabase
      .from('class_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    if (completedError) throw completedError

    // Get total credits in system
    const { data: creditsData, error: creditsError } = await supabase
      .from('class_credits')
      .select('credits')

    if (creditsError) throw creditsError

    const totalCredits = creditsData?.reduce((sum, record) => sum + (record.credits || 0), 0) || 0

    // Get average rating (placeholder - will be implemented when reviews table exists)
    const averageRating = 0

    const stats: AdminStats = {
      totalUsers: totalUsers || 0,
      totalStudents,
      totalTeachers: totalTeachers || 0,
      trialStudents,
      regularStudents,
      scheduledClasses: scheduledClasses || 0,
      completedClasses: completedClasses || 0,
      totalCredits: Math.round(totalCredits * 10) / 10, // Round to 1 decimal
      averageRating,
    }

    return { data: stats, error: null }
  } catch (error) {
    logger.error('Error fetching admin stats:', error)
    return { data: null, error }
  }
}

/**
 * Get upcoming classes in the next 24 hours
 */
export async function getUpcomingClasses24h(): Promise<{ data: UpcomingClass[] | null; error: any }> {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('class_sessions')
      .select(`
        id,
        date,
        time,
        duration,
        meeting_link,
        status,
        student:profiles!class_sessions_student_id_fkey (
          first_name,
          last_name
        ),
        teacher:profiles!class_sessions_teacher_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('status', 'scheduled')
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', tomorrow.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(10)

    if (error) throw error

    const upcomingClasses: UpcomingClass[] = (data || []).map((cls: any) => {
      const student = Array.isArray(cls.student) ? cls.student[0] : cls.student
      const teacher = Array.isArray(cls.teacher) ? cls.teacher[0] : cls.teacher
      
      return {
        id: cls.id,
        date: cls.date,
        time: cls.time,
        duration: cls.duration,
        studentName: student ? `${student.first_name} ${student.last_name}` : 'غير محدد',
        teacherName: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'غير محدد',
        meetingLink: cls.meeting_link,
        status: cls.status,
      }
    })

    return { data: upcomingClasses, error: null }
  } catch (error) {
    logger.error('Error fetching upcoming classes:', error)
    return { data: null, error }
  }
}

/**
 * Get recent activity (last 10 activities)
 */
export async function getRecentActivity(): Promise<{ data: RecentActivity[] | null; error: any }> {
  try {
    // Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (usersError) throw usersError

    // Get recent class bookings
    const { data: recentClasses, error: classesError } = await supabase
      .from('class_sessions')
      .select(`
        id,
        created_at,
        student:profiles!class_sessions_student_id_fkey (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (classesError) throw classesError

    // Combine and format activities
    const activities: RecentActivity[] = []

    // Add user registrations
    recentUsers?.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_registration',
        description: `تسجيل مستخدم جديد: ${user.first_name} ${user.last_name}`,
        timestamp: user.created_at,
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
      })
    })

    // Add class bookings
    recentClasses?.forEach(cls => {
      const student = Array.isArray(cls.student) ? cls.student[0] : cls.student
      activities.push({
        id: `class-${cls.id}`,
        type: 'class_booking',
        description: `حجز حصة جديدة: ${student?.first_name || ''} ${student?.last_name || ''}`,
        timestamp: cls.created_at,
        userName: student ? `${student.first_name} ${student.last_name}` : 'غير محدد',
      })
    })

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return { data: activities.slice(0, 10), error: null }
  } catch (error) {
    logger.error('Error fetching recent activity:', error)
    return { data: null, error }
  }
}

/**
 * Get all users with filters
 */
export async function getAllUsers(filters?: {
  role?: string
  search?: string
  trialStatus?: boolean
}) {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.trialStatus !== undefined) {
      query = query.eq('is_trial', filters.trialStatus)
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    return { data, error }
  } catch (error) {
    logger.error('Error fetching users:', error)
    return { data: null, error }
  }
}


/**
 * Get all classes with filters
 */
export async function getAllClasses(filters?: {
  status?: string
  dateFrom?: string
  dateTo?: string
  teacherId?: string
  studentId?: string
}) {
  try {
    let query = supabase
      .from('class_sessions')
      .select(`
        *,
        student:profiles!class_sessions_student_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        teacher:profiles!class_sessions_teacher_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo)
    }

    if (filters?.teacherId) {
      query = query.eq('teacher_id', filters.teacherId)
    }

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error fetching classes:', error)
    return { data: null, error }
  }
}

/**
 * Get class details by ID
 */
export async function getClassDetails(classId: string) {
  try {
    const { data, error } = await supabase
      .from('class_sessions')
      .select(`
        *,
        student:profiles!class_sessions_student_id_fkey (
          id,
          first_name,
          last_name,
          email,
          is_trial
        ),
        teacher:profiles!class_sessions_teacher_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', classId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error fetching class details:', error)
    return { data: null, error }
  }
}

/**
 * Update class session
 */
export async function updateClassSession(classId: string, updates: {
  date?: string
  time?: string
  duration?: number
  meeting_link?: string
  status?: string
}) {
  try {
    const { data, error } = await supabase
      .from('class_sessions')
      .update(updates)
      .eq('id', classId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error updating class:', error)
    return { data: null, error }
  }
}

/**
 * Delete class session
 */
export async function deleteClassSession(classId: string) {
  try {
    const { error } = await supabase
      .from('class_sessions')
      .delete()
      .eq('id', classId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    logger.error('Error deleting class:', error)
    return { error }
  }
}


/**
 * Get all credit transactions with filters
 */
export async function getAllCreditTransactions(filters?: {
  userId?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}) {
  try {
    let query = supabase
      .from('credit_transactions')
      .select(`
        *,
        user:profiles!credit_transactions_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.type) {
      query = query.eq('transaction_type', filters.type)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error fetching credit transactions:', error)
    return { data: null, error }
  }
}

/**
 * Get credit statistics
 */
export async function getCreditStatistics() {
  try {
    // Get total credits in system
    const { data: creditsData, error: creditsError } = await supabase
      .from('class_credits')
      .select('credits')

    if (creditsError) throw creditsError

    const totalCredits = creditsData?.reduce((sum, record) => sum + (record.credits || 0), 0) || 0

    // Get transactions this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('amount, transaction_type')
      .gte('created_at', firstDayOfMonth)

    if (transactionsError) throw transactionsError

    const creditsAdded = transactionsData
      ?.filter(t => t.transaction_type === 'add' || t.transaction_type === 'refund')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

    const creditsConsumed = transactionsData
      ?.filter(t => t.transaction_type === 'deduct')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

    // Get average credits per student
    const { data: studentsData, error: studentsError } = await supabase
      .from('profiles')
      .select('id')
      .neq('role', 'teacher')
      .neq('role', 'admin')

    if (studentsError) throw studentsError

    const studentCount = studentsData?.length || 1
    const avgCreditsPerStudent = totalCredits / studentCount

    // Get low balance users (less than 1 credit)
    const { data: lowBalanceData, error: lowBalanceError } = await supabase
      .from('class_credits')
      .select('user_id, credits')
      .lt('credits', 1)

    if (lowBalanceError) throw lowBalanceError

    return {
      data: {
        totalCredits: Math.round(totalCredits * 10) / 10,
        creditsAddedThisMonth: Math.round(creditsAdded * 10) / 10,
        creditsConsumedThisMonth: Math.round(creditsConsumed * 10) / 10,
        avgCreditsPerStudent: Math.round(avgCreditsPerStudent * 10) / 10,
        lowBalanceCount: lowBalanceData?.length || 0,
      },
      error: null,
    }
  } catch (error) {
    logger.error('Error fetching credit statistics:', error)
    return { data: null, error }
  }
}

/**
 * Manual credit adjustment
 */
export async function adjustUserCredits(
  userId: string,
  amount: number,
  reason: string,
  adminId: string
) {
  try {
    // Get current credits
    const { data: currentCredits, error: fetchError } = await supabase
      .from('class_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    const newBalance = (currentCredits?.credits || 0) + amount

    // Update credits
    const { error: updateError } = await supabase
      .from('class_credits')
      .update({ credits: newBalance })
      .eq('user_id', userId)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: amount > 0 ? 'add' : 'deduct',
        description: reason,
        performed_by: adminId,
      })

    if (transactionError) throw transactionError

    return { error: null }
  } catch (error) {
    logger.error('Error adjusting credits:', error)
    return { error }
  }
}


/**
 * Get all reviews with filters
 */
export async function getAllReviews(filters?: {
  teacherId?: string
  rating?: number
  approved?: boolean
}) {
  try {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        student:profiles!reviews_student_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        teacher:profiles!reviews_teacher_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.teacherId) {
      query = query.eq('teacher_id', filters.teacherId)
    }

    if (filters?.rating) {
      query = query.eq('rating', filters.rating)
    }

    if (filters?.approved !== undefined) {
      query = query.eq('approved', filters.approved)
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error fetching reviews:', error)
    return { data: null, error }
  }
}

/**
 * Approve a review
 */
export async function approveReview(reviewId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ approved: true, approved_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error approving review:', error)
    return { data: null, error }
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    logger.error('Error deleting review:', error)
    return { error }
  }
}


/**
 * System Settings Management
 * Note: The admin_settings table should be created in Supabase with the following structure:
 * - id: uuid (primary key)
 * - key: text (unique)
 * - value: jsonb
 * - description: text
 * - updated_by: uuid (references profiles)
 * - updated_at: timestamptz
 * - created_at: timestamptz
 */

export interface SystemSetting {
  id: string
  key: string
  value: any // JSONB can hold any JSON value
  description: string
  updated_by?: string
  updated_at: string
  created_at: string
}

/**
 * Get all system settings
 */
export async function getAllSettings() {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error fetching settings:', error)
    return { data: null, error }
  }
}

/**
 * Get a specific setting by key
 */
export async function getSetting(key: string) {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error fetching setting:', error)
    return { data: null, error }
  }
}

/**
 * Update a system setting
 */
export async function updateSetting(
  key: string,
  value: any, // Can be any JSON value
  updatedBy: string
) {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .update({
        value,
        updated_by: updatedBy,
      })
      .eq('key', key)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    logger.error('Error updating setting:', error)
    return { data: null, error }
  }
}


