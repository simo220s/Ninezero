/**
 * Payment and Settlement Service
 * 
 * Manages real-time payment tracking and financial settlements:
 * - Payment recording and verification
 * - Settlement calculations
 * - Transaction history
 * - Revenue analytics
 * 
 * Task: Connect Financial Management to Real Payment Data
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getMonthKey, ARABIC_MONTH_NAMES } from '@/lib/utils/date-helpers'

export interface Payment {
  id: string
  user_id: string
  class_session_id?: string
  amount: number
  currency: string
  payment_method: 'credit_card' | 'bank_transfer' | 'cash' | 'wallet' | 'package_credits'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_date: string
  settlement_status: 'pending' | 'settled' | 'cancelled'
  settlement_date?: string
  transaction_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Settlement {
  id: string
  teacher_id: string
  period_start: string
  period_end: string
  total_amount: number
  payment_count: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  settled_at?: string
  payment_reference?: string
  created_at: string
  updated_at: string
}

export interface PaymentAnalytics {
  totalRevenue: number
  pendingAmount: number
  settledAmount: number
  paymentCount: number
  averageTransactionValue: number
  paymentMethodBreakdown: Record<string, number>
  monthlyTrends: {
    month: string
    revenue: number
    count: number
  }[]
}

let realtimeChannel: RealtimeChannel | null = null

/**
 * Record a new payment
 */
export async function recordPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<{
  data: Payment | null
  error: any
}> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...payment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error('Error recording payment:', error)
      return { data: null, error }
    }

    logger.log('Payment recorded successfully:', data.id)
    return { data: data as Payment, error: null }
  } catch (err) {
    logger.error('Unexpected error recording payment:', err)
    return { data: null, error: err }
  }
}

/**
 * Get payments for a teacher
 */
export async function getTeacherPayments(
  teacherId: string,
  filters?: {
    status?: Payment['payment_status']
    dateFrom?: string
    dateTo?: string
  }
): Promise<{
  data: Payment[] | null
  error: any
}> {
  try {
    // Get class sessions for this teacher
    const { data: sessions, error: sessionsError } = await supabase
      .from('class_sessions')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')

    if (sessionsError) {
      logger.error('Error fetching sessions:', sessionsError)
      return { data: null, error: sessionsError }
    }

    if (!sessions || sessions.length === 0) {
      return { data: [], error: null }
    }

    const sessionIds = sessions.map(s => s.id)

    // Build query
    let query = supabase
      .from('payments')
      .select('*')
      .in('class_session_id', sessionIds)
      .order('payment_date', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('payment_status', filters.status)
    }
    if (filters?.dateFrom) {
      query = query.gte('payment_date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('payment_date', filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching payments:', error)
      return { data: null, error }
    }

    return { data: data as Payment[], error: null }
  } catch (err) {
    logger.error('Unexpected error fetching payments:', err)
    return { data: null, error: err }
  }
}

/**
 * Get payment analytics
 */
export async function getPaymentAnalytics(
  teacherId: string,
  period?: { start: string; end: string }
): Promise<{
  data: PaymentAnalytics | null
  error: any
}> {
  try {
    const filters: any = {}
    if (period) {
      filters.dateFrom = period.start
      filters.dateTo = period.end
    }

    const { data: payments, error } = await getTeacherPayments(teacherId, filters)

    if (error || !payments) {
      return { data: null, error }
    }

    // Calculate analytics
    const completedPayments = payments.filter(p => p.payment_status === 'completed')
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const pendingPayments = payments.filter(p => p.payment_status === 'pending')
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
    const settledPayments = completedPayments.filter(p => p.settlement_status === 'settled')
    const settledAmount = settledPayments.reduce((sum, p) => sum + p.amount, 0)

    // Payment method breakdown
    const paymentMethodBreakdown: Record<string, number> = {}
    completedPayments.forEach(p => {
      paymentMethodBreakdown[p.payment_method] = (paymentMethodBreakdown[p.payment_method] || 0) + p.amount
    })

    // Monthly trends
    const monthlyData: Record<string, { revenue: number; count: number }> = {}

    completedPayments.forEach(payment => {
      const date = new Date(payment.payment_date)
      const monthKey = getMonthKey(date)
      const monthName = ARABIC_MONTH_NAMES[date.getMonth()]

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, count: 0 }
      }

      monthlyData[monthKey].revenue += payment.amount
      monthlyData[monthKey].count++
    })

    const monthlyTrends = Object.entries(monthlyData)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .reverse()
      .map(([key, data]) => ({
        month: ARABIC_MONTH_NAMES[parseInt(key.split('-')[1])],
        revenue: data.revenue,
        count: data.count,
      }))

    const analytics: PaymentAnalytics = {
      totalRevenue,
      pendingAmount,
      settledAmount,
      paymentCount: completedPayments.length,
      averageTransactionValue: completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0,
      paymentMethodBreakdown,
      monthlyTrends,
    }

    return { data: analytics, error: null }
  } catch (err) {
    logger.error('Unexpected error calculating payment analytics:', err)
    return { data: null, error: err }
  }
}

/**
 * Get settlements for a teacher
 */
export async function getTeacherSettlements(teacherId: string): Promise<{
  data: Settlement[] | null
  error: any
}> {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching settlements:', error)
      return { data: null, error }
    }

    return { data: data as Settlement[], error: null }
  } catch (err) {
    logger.error('Unexpected error fetching settlements:', err)
    return { data: null, error: err }
  }
}

/**
 * Create a settlement request
 */
export async function createSettlement(settlement: Omit<Settlement, 'id' | 'created_at' | 'updated_at'>): Promise<{
  data: Settlement | null
  error: any
}> {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .insert({
        ...settlement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating settlement:', error)
      return { data: null, error }
    }

    logger.log('Settlement created successfully:', data.id)
    return { data: data as Settlement, error: null }
  } catch (err) {
    logger.error('Unexpected error creating settlement:', err)
    return { data: null, error: err }
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['payment_status'],
  notes?: string
): Promise<{
  success: boolean
  error: any
}> {
  try {
    const { error } = await supabase
      .from('payments')
      .update({
        payment_status: status,
        notes: notes || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (error) {
      logger.error('Error updating payment status:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (err) {
    logger.error('Unexpected error updating payment status:', err)
    return { success: false, error: err }
  }
}

/**
 * Subscribe to real-time payment updates
 */
export function subscribeToPaymentUpdates(
  teacherId: string,
  onPayment: (payment: Payment) => void,
  onError?: (error: any) => void
): RealtimeChannel {
  // Clean up existing subscription
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }

  logger.log('Subscribing to real-time payment updates for teacher:', teacherId)

  realtimeChannel = supabase
    .channel(`payments:${teacherId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'payments',
      },
      (payload) => {
        logger.log('New payment received:', payload)
        const payment = payload.new as Payment
        onPayment(payment)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
      },
      (payload) => {
        logger.log('Payment updated:', payload)
        const payment = payload.new as Payment
        onPayment(payment)
      }
    )
    .subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        logger.log('Successfully subscribed to payment updates')
      } else if (status === 'CLOSED') {
        logger.log('Payment updates subscription closed')
      } else if (status === 'CHANNEL_ERROR') {
        logger.error('Payment subscription error:', error)
        onError?.(error)
      }
    })

  return realtimeChannel
}

/**
 * Unsubscribe from payment updates
 */
export function unsubscribeFromPaymentUpdates(): void {
  if (realtimeChannel) {
    logger.log('Unsubscribing from payment updates')
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
}

/**
 * Format payment method name for display
 */
export function formatPaymentMethod(method: Payment['payment_method']): { ar: string; en: string } {
  const methods = {
    credit_card: { ar: 'بطاقة ائتمان', en: 'Credit Card' },
    bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
    cash: { ar: 'نقداً', en: 'Cash' },
    wallet: { ar: 'محفظة إلكترونية', en: 'Wallet' },
    package_credits: { ar: 'رصيد الباقة', en: 'Package Credits' },
  }
  return methods[method]
}

/**
 * Get payment status badge class
 */
export function getPaymentStatusBadge(status: Payment['payment_status']): string {
  const badges = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }
  return badges[status]
}

export const paymentService = {
  recordPayment,
  getTeacherPayments,
  getPaymentAnalytics,
  getTeacherSettlements,
  createSettlement,
  updatePaymentStatus,
  subscribeToPaymentUpdates,
  unsubscribeFromPaymentUpdates,
  formatPaymentMethod,
  getPaymentStatusBadge,
}

export default paymentService

