/**
 * Financial Management Service
 * 
 * Provides real financial data for income tracking, expense management,
 * and financial analytics by querying Supabase database.
 * 
 * Phase 1.2 - Replace Mock Data in Financial Management
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import pricingService from './pricing-service'
import { getMonthKey, getArabicMonthName, ARABIC_MONTH_NAMES } from '@/lib/utils/date-helpers'

export interface IncomeRecord {
  id: string
  date: string
  student_name: string
  age_group: '10-12' | '13-15' | '16-18'
  lesson_type: 'Individual' | 'Group' | 'Assessment' | 'Trial'
  amount: number
  status: 'completed' | 'pending'
}

export interface ExpenseRecord {
  id: string
  date: string
  category: string
  description: string
  amount: number
  receipt?: string
}

export interface MonthlyBreakdown {
  month: string
  totalIncome: number
  byAgeGroup: {
    '10-12': number
    '13-15': number
    '16-18': number
  }
  byLessonType: {
    Individual: number
    Group: number
    Assessment: number
    Trial: number
  }
  expenses: number
  netIncome: number
}

/**
 * Get income records from completed class sessions
 */
export async function getIncomeRecords(teacherId: string): Promise<{
  data: IncomeRecord[] | null
  error: any
}> {
  try {
    // Fetch completed class sessions with student details and age
    const { data: sessions, error } = await supabase
      .from('class_sessions')
      .select(`
        id,
        date,
        duration,
        is_trial,
        status,
        student_id,
        student:profiles!class_sessions_student_id_fkey(
          first_name,
          last_name
        ),
        students:student_id(
          age
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')
      .order('date', { ascending: false })

    if (error) {
      logger.error('Error fetching income records:', error)
      return { data: null, error }
    }

    // Transform to income records with proper async price calculation
    const incomeRecordsPromises = (sessions || []).map(async (session) => {
      // Get student age from students table
      let age = 13 // Default age
      if (session.students && Array.isArray(session.students) && session.students.length > 0) {
        age = session.students[0].age || 13
      } else if (session.student_id) {
        // Try to get age from students table directly
        const { data: studentData } = await supabase
          .from('students')
          .select('age')
          .eq('id', session.student_id)
          .maybeSingle()
        if (studentData?.age) {
          age = studentData.age
        }
      }

      // Calculate age group from actual age
      let ageGroup: '10-12' | '13-15' | '16-18' = '13-15'
      if (age >= 10 && age <= 12) {
        ageGroup = '10-12'
      } else if (age >= 16 && age <= 18) {
        ageGroup = '16-18'
      }
      
      // Determine lesson type
      let lessonType: 'Individual' | 'Group' | 'Assessment' | 'Trial' = 'Individual'
      if (session.is_trial) {
        lessonType = 'Trial'
      }
      
      // Calculate amount based on lesson type and duration
      const amount = await calculateLessonPrice(lessonType, ageGroup, session.duration)
      
      return {
        id: session.id,
        date: session.date,
        student_name: session.student 
          ? `${session.student.first_name || ''} ${session.student.last_name || ''}`.trim() || 'طالب'
          : 'طالب',
        age_group: ageGroup,
        lesson_type: lessonType,
        amount,
        status: 'completed' as const,
      }
    })

    const incomeRecords = await Promise.all(incomeRecordsPromises)

    return { data: incomeRecords, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching income records:', err)
    return { data: null, error: err }
  }
}

/**
 * Get expense records from expenses table
 */
export async function getExpenseRecords(teacherId: string): Promise<{
  data: ExpenseRecord[] | null
  error: any
}> {
  try {
    // Check if expenses table exists, if not return empty array
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('date', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array (not an error)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        logger.log('Expenses table not found - returning empty array')
        return { data: [], error: null }
      }
      logger.error('Error fetching expense records:', error)
      return { data: null, error }
    }

    const expenseRecords: ExpenseRecord[] = (expenses || []).map(expense => ({
      id: expense.id,
      date: expense.date || expense.created_at,
      category: expense.category || 'أخرى',
      description: expense.description || '',
      amount: expense.amount || 0,
      receipt: expense.receipt || undefined,
    }))

    return { data: expenseRecords, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching expense records:', err)
    return { data: null, error: err }
  }
}

/**
 * Create a new expense record
 */
export async function createExpense(teacherId: string, expense: {
  category: string
  description: string
  amount: number
  date?: string
  receipt?: string
}): Promise<{
  data: ExpenseRecord | null
  error: any
}> {
  try {
    // First, ensure expenses table exists (create if not)
    const { data: expenseData, error } = await supabase
      .from('expenses')
      .insert({
        teacher_id: teacherId,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date || new Date().toISOString().split('T')[0],
        receipt: expense.receipt || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, we need to create it first
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        logger.log('Expenses table does not exist - need to create it first')
        // Return error so UI can handle it
        return { 
          data: null, 
          error: { message: 'جدول المصروفات غير موجود. يرجى إنشاء الجدول أولاً.' } 
        }
      }
      logger.error('Error creating expense:', error)
      return { data: null, error }
    }

    const expenseRecord: ExpenseRecord = {
      id: expenseData.id,
      date: expenseData.date || expenseData.created_at,
      category: expenseData.category,
      description: expenseData.description,
      amount: expenseData.amount,
      receipt: expenseData.receipt || undefined,
    }

    return { data: expenseRecord, error: null }
  } catch (err) {
    logger.error('Unexpected error creating expense:', err)
    return { data: null, error: err }
  }
}

/**
 * Get monthly income breakdown
 */
export async function getMonthlyBreakdown(
  teacherId: string,
  months: number = 4
): Promise<{
  data: MonthlyBreakdown[] | null
  error: any
}> {
  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Fetch completed sessions in date range
    const { data: sessions, error } = await supabase
      .from('class_sessions')
      .select(`
        id,
        date,
        duration,
        is_trial,
        student_id
      `)
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    if (error) {
      logger.error('Error fetching monthly breakdown:', error)
      return { data: null, error }
    }

    // Group by month
    const monthlyData: Record<string, MonthlyBreakdown> = {}

    // Process sessions with proper async handling
    for (const session of (sessions || [])) {
      const date = new Date(session.date)
      const monthKey = getMonthKey(date)
      const monthName = getArabicMonthName(date)

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          totalIncome: 0,
          byAgeGroup: {
            '10-12': 0,
            '13-15': 0,
            '16-18': 0,
          },
          byLessonType: {
            Individual: 0,
            Group: 0,
            Assessment: 0,
            Trial: 0,
          },
          expenses: 0,
          netIncome: 0,
        }
      }

      // Get student age for proper age group calculation
      let age = 13 // Default
      if (session.student_id) {
        const { data: studentData } = await supabase
          .from('students')
          .select('age')
          .eq('id', session.student_id)
          .maybeSingle()
        if (studentData?.age) {
          age = studentData.age
        }
      }

      // Calculate age group from actual age
      let ageGroup: '10-12' | '13-15' | '16-18' = '13-15'
      if (age >= 10 && age <= 12) {
        ageGroup = '10-12'
      } else if (age >= 16 && age <= 18) {
        ageGroup = '16-18'
      }

      // Calculate income
      const lessonType = session.is_trial ? 'Trial' : 'Individual'
      const amount = await calculateLessonPrice(lessonType, ageGroup, session.duration)

      monthlyData[monthKey].totalIncome += amount
      monthlyData[monthKey].byAgeGroup[ageGroup] += amount
      monthlyData[monthKey].byLessonType[lessonType] += amount
    }

    // Get expenses for the same period
    const { data: expenseRecords } = await getExpenseRecords(teacherId)
    if (expenseRecords) {
      for (const expense of expenseRecords) {
        const expenseDate = new Date(expense.date)
        const monthKey = getMonthKey(expenseDate)
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].expenses += expense.amount
        }
      }
    }

    // Calculate net income (totalIncome - expenses)
    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].netIncome = monthlyData[key].totalIncome - monthlyData[key].expenses
    })

    // Convert to array and sort by date (most recent first)
    const breakdowns = Object.entries(monthlyData)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([, data]) => data)
      .slice(0, months)

    return { data: breakdowns, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching monthly breakdown:', err)
    return { data: null, error: err }
  }
}

/**
 * Calculate lesson price using pricing service
 */
async function calculateLessonPrice(
  lessonType: 'Individual' | 'Group' | 'Assessment' | 'Trial',
  ageGroup: '10-12' | '13-15' | '16-18',
  duration: number
): Promise<number> {
  try {
    const { data, error } = await pricingService.calculateClassPrice({
      classType: lessonType,
      ageGroup,
      duration,
    })

    if (error || !data) {
      logger.error('Error calculating price, using fallback:', error)
      // Fallback to simple calculation
      const basePrice = lessonType === 'Trial' ? 0 : 150
      return Math.round((basePrice / 60) * duration)
    }

    return data.finalPrice
  } catch (err) {
    logger.error('Error in calculateLessonPrice:', err)
    const basePrice = lessonType === 'Trial' ? 0 : 150
    return Math.round((basePrice / 60) * duration)
  }
}

/**
 * Get total income
 */
export async function getTotalIncome(teacherId: string): Promise<{
  data: number
  error: any
}> {
  try {
    const { data: incomeRecords, error } = await getIncomeRecords(teacherId)
    
    if (error) {
      return { data: 0, error }
    }

    const total = (incomeRecords || []).reduce((sum, record) => sum + record.amount, 0)
    return { data: total, error: null }
  } catch (err) {
    logger.error('Unexpected error calculating total income:', err)
    return { data: 0, error: err }
  }
}

/**
 * Get total expenses
 */
export async function getTotalExpenses(teacherId: string): Promise<{
  data: number
  error: any
}> {
  try {
    const { data: expenseRecords, error } = await getExpenseRecords(teacherId)
    
    if (error) {
      return { data: 0, error }
    }

    const total = (expenseRecords || []).reduce((sum, record) => sum + record.amount, 0)
    return { data: total, error: null }
  } catch (err) {
    logger.error('Unexpected error calculating total expenses:', err)
    return { data: 0, error: err }
  }
}

/**
 * Get average income per lesson
 */
export async function getAverageIncomePerLesson(teacherId: string): Promise<{
  data: number
  error: any
}> {
  try {
    const { data: incomeRecords, error } = await getIncomeRecords(teacherId)
    
    if (error) {
      return { data: 0, error }
    }

    if (!incomeRecords || incomeRecords.length === 0) {
      return { data: 0, error: null }
    }

    const total = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
    const average = Math.round(total / incomeRecords.length)
    
    return { data: average, error: null }
  } catch (err) {
    logger.error('Unexpected error calculating average income per lesson:', err)
    return { data: 0, error: err }
  }
}

/**
 * Get average income per student
 */
export async function getAverageIncomePerStudent(teacherId: string): Promise<{
  data: number
  error: any
}> {
  try {
    const { data: incomeRecords, error } = await getIncomeRecords(teacherId)
    
    if (error) {
      return { data: 0, error }
    }

    if (!incomeRecords || incomeRecords.length === 0) {
      return { data: 0, error: null }
    }

    // Get unique students
    const uniqueStudents = new Set(incomeRecords.map(r => r.student_name))
    const total = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
    const average = Math.round(total / uniqueStudents.size)
    
    return { data: average, error: null }
  } catch (err) {
    logger.error('Unexpected error calculating average income per student:', err)
    return { data: 0, error: err }
  }
}

export const financialService = {
  getIncomeRecords,
  getExpenseRecords,
  createExpense,
  getMonthlyBreakdown,
  getTotalIncome,
  getTotalExpenses,
  getAverageIncomePerLesson,
  getAverageIncomePerStudent,
}

export default financialService

