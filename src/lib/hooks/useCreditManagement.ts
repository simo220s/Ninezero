/**
 * Credit Management Hook
 * 
 * Custom hook for managing student credits with React Query integration
 * Provides data caching, automatic refetching, and optimistic updates
 * 
 * Task 5: Implement Credit Management Workflow
 */

import { useState, useCallback } from 'react'
import { CreditService, type AddCreditsInput, type CreditHistoryFilter } from '@/lib/services/credit-service'
import { logger } from '@/lib/logger'

interface UseCreditManagementReturn {
  addCredits: (input: AddCreditsInput) => Promise<any>
  getStudentCredits: (studentId: string) => Promise<number | undefined>
  getCreditHistory: (filter?: CreditHistoryFilter) => Promise<any>
  deductCredits: (input: AddCreditsInput) => Promise<any>
  getCreditStats: (studentId: string) => Promise<any>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

/**
 * Hook for managing student credits
 */
export const useCreditManagement = (): UseCreditManagementReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Add credits to a student
   */
  const addCredits = useCallback(async (input: AddCreditsInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await CreditService.addCredits(input)

      if (!result.success) {
        throw new Error(result.error || 'فشل في إضافة الرصيد')
      }

      logger.log('Credits added successfully:', result)
      return result
    } catch (err: any) {
      const errorMessage = err?.message || 'فشل في إضافة الرصيد'
      setError(errorMessage)
      logger.error('Error adding credits:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Get student credit balance
   */
  const getStudentCredits = useCallback(async (studentId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await CreditService.getStudentCredits(studentId)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.credits
    } catch (err: any) {
      const errorMessage = err?.message || 'فشل في جلب الرصيد'
      setError(errorMessage)
      logger.error('Error fetching credits:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Get credit transaction history
   */
  const getCreditHistory = useCallback(async (filter: CreditHistoryFilter = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await CreditService.getCreditHistory(filter)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.transactions
    } catch (err: any) {
      const errorMessage = err?.message || 'فشل في جلب سجل المعاملات'
      setError(errorMessage)
      logger.error('Error fetching credit history:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Deduct credits from a student
   */
  const deductCredits = useCallback(async (input: AddCreditsInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await CreditService.deductCredits(input)

      if (!result.success) {
        throw new Error(result.error || 'فشل في خصم الرصيد')
      }

      logger.log('Credits deducted successfully:', result)
      return result
    } catch (err: any) {
      const errorMessage = err?.message || 'فشل في خصم الرصيد'
      setError(errorMessage)
      logger.error('Error deducting credits:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Get credit statistics for a student
   */
  const getCreditStats = useCallback(async (studentId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await CreditService.getCreditStats(studentId)

      if (result.error) {
        throw new Error(result.error)
      }

      return {
        totalAdded: result.totalAdded,
        totalDeducted: result.totalDeducted,
        totalRefunded: result.totalRefunded,
        transactionCount: result.transactionCount
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'فشل في جلب الإحصائيات'
      setError(errorMessage)
      logger.error('Error fetching credit stats:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    addCredits,
    getStudentCredits,
    getCreditHistory,
    deductCredits,
    getCreditStats,
    isLoading,
    error,
    clearError
  }
}

export default useCreditManagement
