/**
 * Credit Management Service
 * 
 * Handles student credit operations including adding credits, retrieving balances,
 * and maintaining transaction history.
 * 
 * Task 5: Implement Credit Management Workflow
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface CreditTransaction {
  id: string
  student_id: string
  teacher_id: string
  amount: number
  type: 'add' | 'deduct' | 'refund'
  reason: string
  balance_before: number
  balance_after: number
  created_at: string
}

export interface CreditBalance {
  student_id: string
  credits: number
  last_updated: string
}

export interface AddCreditsInput {
  studentId: string
  teacherId: string
  amount: number
  reason?: string
}

export interface CreditHistoryFilter {
  studentId?: string
  teacherId?: string
  type?: 'add' | 'deduct' | 'refund'
  fromDate?: Date
  toDate?: Date
  limit?: number
}

/**
 * Credit Management Service
 */
export class CreditService {
  /**
   * Add credits to a student account with transaction logging
   */
  static async addCredits(input: AddCreditsInput): Promise<{
    success: boolean
    newBalance: number
    transaction?: CreditTransaction
    error?: any
  }> {
    const { studentId, teacherId, amount, reason = 'إضافة رصيد' } = input

    try {
      logger.log('Adding credits:', { studentId, teacherId, amount, reason })

      // Validate amount
      if (amount <= 0) {
        throw new Error('يجب أن يكون المبلغ أكبر من صفر')
      }

      if (amount > 100) {
        throw new Error('لا يمكن إضافة أكثر من 100 حصة في المرة الواحدة')
      }

      // Get current balance from class_credits table
      const { data: currentCredits, error: fetchError } = await supabase
        .from('class_credits')
        .select('credits')
        .eq('user_id', studentId)
        .maybeSingle()

      if (fetchError) {
        logger.error('Error fetching current credits:', fetchError)
        throw fetchError
      }

      const balanceBefore = currentCredits?.credits || 0
      const newBalance = balanceBefore + amount

      logger.log('Credit calculation:', { balanceBefore, amount, newBalance })

      // Update credits using the RPC function
      const { error: updateError } = await supabase.rpc('add_credits', {
        p_user_id: studentId,
        p_amount: amount
      })

      if (updateError) {
        logger.error('Error updating credits:', updateError)
        throw updateError
      }

      logger.log('Credits updated successfully')

      // Log transaction in credit_transactions table
      const { data: transaction, error: logError } = await supabase
        .from('credit_transactions')
        .insert({
          student_id: studentId,
          teacher_id: teacherId,
          amount,
          type: 'add',
          reason,
          balance_before: balanceBefore,
          balance_after: newBalance,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (logError) {
        logger.error('Error logging transaction (non-critical):', logError)
        // Don't fail the operation if logging fails
      } else {
        logger.log('Transaction logged successfully:', transaction)
      }

      return {
        success: true,
        newBalance,
        transaction: transaction as CreditTransaction
      }
    } catch (error: any) {
      logger.error('Error in addCredits:', error)
      return {
        success: false,
        newBalance: 0,
        error: error?.message || 'فشل في إضافة الرصيد'
      }
    }
  }

  /**
   * Get student credit balance
   */
  static async getStudentCredits(studentId: string): Promise<{
    credits: number
    error?: any
  }> {
    try {
      logger.log('Fetching credits for student:', studentId)

      const { data, error } = await supabase
        .from('class_credits')
        .select('credits')
        .eq('user_id', studentId)
        .maybeSingle()

      if (error) {
        logger.error('Error fetching student credits:', error)
        throw error
      }

      const credits = data?.credits || 0
      logger.log('Student credits:', credits)

      return { credits }
    } catch (error: any) {
      logger.error('Error in getStudentCredits:', error)
      return {
        credits: 0,
        error: error?.message || 'فشل في جلب الرصيد'
      }
    }
  }

  /**
   * Get credit transaction history
   */
  static async getCreditHistory(filter: CreditHistoryFilter = {}): Promise<{
    transactions: CreditTransaction[]
    error?: any
  }> {
    try {
      const {
        studentId,
        teacherId,
        type,
        fromDate,
        toDate,
        limit = 50
      } = filter

      logger.log('Fetching credit history with filter:', filter)

      let query = supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      // Apply filters
      if (studentId) {
        query = query.eq('student_id', studentId)
      }

      if (teacherId) {
        query = query.eq('teacher_id', teacherId)
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (fromDate) {
        query = query.gte('created_at', fromDate.toISOString())
      }

      if (toDate) {
        query = query.lte('created_at', toDate.toISOString())
      }

      const { data, error } = await query

      if (error) {
        logger.error('Error fetching credit history:', error)
        throw error
      }

      logger.log(`Fetched ${data?.length || 0} transactions`)

      return {
        transactions: (data || []) as CreditTransaction[]
      }
    } catch (error: any) {
      logger.error('Error in getCreditHistory:', error)
      return {
        transactions: [],
        error: error?.message || 'فشل في جلب سجل المعاملات'
      }
    }
  }

  /**
   * Deduct credits from a student account
   */
  static async deductCredits(input: AddCreditsInput): Promise<{
    success: boolean
    newBalance: number
    transaction?: CreditTransaction
    error?: any
  }> {
    const { studentId, teacherId, amount, reason = 'خصم رصيد' } = input

    try {
      logger.log('Deducting credits:', { studentId, teacherId, amount, reason })

      // Validate amount
      if (amount <= 0) {
        throw new Error('يجب أن يكون المبلغ أكبر من صفر')
      }

      // Get current balance
      const { data: currentCredits, error: fetchError } = await supabase
        .from('class_credits')
        .select('credits')
        .eq('user_id', studentId)
        .maybeSingle()

      if (fetchError) {
        logger.error('Error fetching current credits:', fetchError)
        throw fetchError
      }

      const balanceBefore = currentCredits?.credits || 0

      // Check if sufficient balance
      if (balanceBefore < amount) {
        throw new Error('رصيد غير كافٍ')
      }

      const newBalance = balanceBefore - amount

      // Deduct credits using the RPC function
      const { error: updateError } = await supabase.rpc('deduct_credits', {
        p_user_id: studentId,
        p_amount: amount
      })

      if (updateError) {
        logger.error('Error deducting credits:', updateError)
        throw updateError
      }

      logger.log('Credits deducted successfully')

      // Log transaction
      const { data: transaction, error: logError } = await supabase
        .from('credit_transactions')
        .insert({
          student_id: studentId,
          teacher_id: teacherId,
          amount,
          type: 'deduct',
          reason,
          balance_before: balanceBefore,
          balance_after: newBalance,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (logError) {
        logger.error('Error logging transaction (non-critical):', logError)
      }

      return {
        success: true,
        newBalance,
        transaction: transaction as CreditTransaction
      }
    } catch (error: any) {
      logger.error('Error in deductCredits:', error)
      return {
        success: false,
        newBalance: 0,
        error: error?.message || 'فشل في خصم الرصيد'
      }
    }
  }

  /**
   * Get credit statistics for a student
   */
  static async getCreditStats(studentId: string): Promise<{
    totalAdded: number
    totalDeducted: number
    totalRefunded: number
    transactionCount: number
    error?: any
  }> {
    try {
      const { transactions, error } = await this.getCreditHistory({
        studentId,
        limit: 1000
      })

      if (error) {
        throw error
      }

      const stats = transactions.reduce(
        (acc, t) => {
          acc.transactionCount++
          if (t.type === 'add') acc.totalAdded += t.amount
          if (t.type === 'deduct') acc.totalDeducted += t.amount
          if (t.type === 'refund') acc.totalRefunded += t.amount
          return acc
        },
        {
          totalAdded: 0,
          totalDeducted: 0,
          totalRefunded: 0,
          transactionCount: 0
        }
      )

      return stats
    } catch (error: any) {
      logger.error('Error in getCreditStats:', error)
      return {
        totalAdded: 0,
        totalDeducted: 0,
        totalRefunded: 0,
        transactionCount: 0,
        error: error?.message || 'فشل في جلب الإحصائيات'
      }
    }
  }
}

export default CreditService
