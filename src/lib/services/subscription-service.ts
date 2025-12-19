/**
 * Subscription Service
 * 
 * Handles subscription management including cancellation requests,
 * retention discounts, and subscription status updates.
 * 
 * Features:
 * - Submit cancellation feedback
 * - Apply retention discounts (20% for 3 months)
 * - Confirm cancellation with 24-hour delay
 * - Retrieve subscription and cancellation status
 * - Validate cancellation requests
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { validateUserId, validatePercentage, validateArray } from '@/lib/utils/validation'
import { addHours, addMonths } from '@/lib/utils/date-helpers'

// ============================================================================
// Constants
// ============================================================================
const CANCELLATION_DELAY_HOURS = 24
const DEFAULT_RETENTION_DISCOUNT = 20 // 20%
const RETENTION_DISCOUNT_DURATION_MONTHS = 3
const MAX_CANCELLATION_REASONS = 10

// ============================================================================
// Validation Constants
// ============================================================================
const VALID_CANCELLATION_REASONS = [
  'price_high',
  'not_using_enough',
  'quality_issues',
  'found_alternative',
  'technical_issues',
  'other'
] as const

const VALID_CANCELLATION_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed'
] as const

// ============================================================================
// Type Definitions
// ============================================================================
export type CancellationReason = typeof VALID_CANCELLATION_REASONS[number]
export type CancellationStatus = typeof VALID_CANCELLATION_STATUSES[number]

export interface CancellationRequest {
  id: string
  user_id: string
  subscription_id: string
  reasons: string[]
  discount_offered: boolean
  discount_accepted: boolean
  status: CancellationStatus
  requested_at: string
  effective_date: string // 24 hours after request
  confirmed_at?: string
  completed_at?: string
  cancelled_by_user_at?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionCancellationData {
  userId: string
  subscriptionId: string
  reasons: string[]
  discountOffered: boolean
  discountAccepted: boolean
}

export interface SubscriptionDiscount {
  id: string
  user_id: string
  subscription_id: string
  discount_percentage: number
  discount_type: 'retention' | 'promotional' | 'custom'
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceResponse<T = void> {
  success: boolean
  data?: T
  error?: any
  message?: string
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate cancellation reasons
 */
function validateCancellationReasons(reasons: string[]): { valid: boolean; error?: string } {
  // Use centralized array validation
  const arrayValidation = validateArray(reasons, 'Reasons', 1, MAX_CANCELLATION_REASONS)
  if (!arrayValidation.valid) {
    return arrayValidation
  }

  // Check for valid reason values
  const invalidReasons = reasons.filter(r => !VALID_CANCELLATION_REASONS.includes(r as CancellationReason))
  if (invalidReasons.length > 0) {
    return { valid: false, error: `Invalid cancellation reasons: ${invalidReasons.join(', ')}` }
  }

  return { valid: true }
}

/**
 * Calculate effective date (24 hours from now)
 * Uses centralized date helper
 */
function calculateEffectiveDate(fromDate: Date = new Date()): Date {
  return addHours(fromDate, CANCELLATION_DELAY_HOURS)
}

/**
 * Calculate discount end date (3 months from start)
 * Uses centralized date helper
 */
function calculateDiscountEndDate(startDate: Date = new Date()): Date {
  return addMonths(startDate, RETENTION_DISCOUNT_DURATION_MONTHS)
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Submit cancellation feedback
 * 
 * Validates and stores user feedback when they initiate subscription cancellation.
 * This is Step 1 of the cancellation flow.
 * 
 * @param userId - The user's unique identifier
 * @param reasons - Array of cancellation reason IDs
 * @param additionalComments - Optional additional feedback text
 * @returns ServiceResponse indicating success or failure
 */
export async function submitCancellationFeedback(
  userId: string,
  reasons: string[],
  additionalComments?: string
): Promise<ServiceResponse> {
  try {
    logger.log('Submitting cancellation feedback', { userId, reasonCount: reasons.length })

    // Validate user ID
    const userValidation = validateUserId(userId)
    if (!userValidation.valid) {
      logger.error('Invalid user ID:', userValidation.error)
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    // Validate reasons
    const reasonsValidation = validateCancellationReasons(reasons)
    if (!reasonsValidation.valid) {
      logger.error('Invalid cancellation reasons:', reasonsValidation.error)
      return { 
        success: false, 
        error: reasonsValidation.error,
        message: 'يرجى اختيار سبب واحد على الأقل' 
      }
    }

    // Check if user has already submitted feedback recently (within last hour)
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { data: recentFeedback, error: checkError } = await supabase
      .from('cancellation_feedback')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo.toISOString())
      .limit(1)

    if (checkError) {
      logger.error('Error checking recent feedback:', checkError)
      // Continue anyway - this is not critical
    }

    if (recentFeedback && recentFeedback.length > 0) {
      logger.warn('User submitted feedback recently', { userId })
      return {
        success: false,
        error: 'RATE_LIMIT',
        message: 'لقد قمت بإرسال ملاحظات مؤخراً. يرجى المحاولة لاحقاً'
      }
    }

    // Store feedback for analytics
    const { error: feedbackError } = await supabase
      .from('cancellation_feedback')
      .insert({
        user_id: userId,
        reasons,
        additional_comments: additionalComments || null,
        created_at: new Date().toISOString()
      })

    if (feedbackError) {
      logger.error('Failed to submit cancellation feedback:', feedbackError)
      return { 
        success: false, 
        error: feedbackError,
        message: 'حدث خطأ في إرسال الملاحظات. يرجى المحاولة مرة أخرى' 
      }
    }

    logger.log('Cancellation feedback submitted successfully', { userId })
    return { 
      success: true,
      message: 'تم إرسال ملاحظاتك بنجاح' 
    }
  } catch (error) {
    logger.error('Error submitting cancellation feedback:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى' 
    }
  }
}

/**
 * Apply retention discount to user's subscription
 * 
 * Applies a retention discount (default 20%) to prevent cancellation.
 * This is Step 2 of the cancellation flow when user accepts the offer.
 * 
 * @param userId - The user's unique identifier
 * @param subscriptionId - The subscription identifier
 * @param discountPercentage - Discount percentage (default 20%)
 * @returns ServiceResponse with discount details
 */
export async function applyRetentionDiscount(
  userId: string,
  subscriptionId: string,
  discountPercentage: number = DEFAULT_RETENTION_DISCOUNT
): Promise<ServiceResponse<SubscriptionDiscount>> {
  try {
    logger.log('Applying retention discount', { userId, subscriptionId, discountPercentage })

    // Validate user ID
    const userValidation = validateUserId(userId)
    if (!userValidation.valid) {
      logger.error('Invalid user ID:', userValidation.error)
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    // Validate subscription ID
    const subscriptionValidation = validateUserId(subscriptionId) // Same format as user ID
    if (!subscriptionValidation.valid) {
      logger.error('Invalid subscription ID:', subscriptionValidation.error)
      return { 
        success: false, 
        error: subscriptionValidation.error,
        message: 'معرف الاشتراك غير صالح' 
      }
    }

    // Validate discount percentage
    const discountValidation = validatePercentage(discountPercentage, 1, 100)
    if (!discountValidation.valid) {
      logger.error('Invalid discount percentage:', discountValidation.error)
      return { 
        success: false, 
        error: discountValidation.error,
        message: 'نسبة الخصم غير صالحة' 
      }
    }

    // Check if user already has an active retention discount
    const { data: existingDiscount, error: checkError } = await supabase
      .from('subscription_discounts')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_id', subscriptionId)
      .eq('discount_type', 'retention')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
      logger.error('Error checking existing discount:', checkError)
      // Continue anyway - this is not critical
    }

    if (existingDiscount) {
      logger.warn('User already has an active retention discount', { userId, subscriptionId })
      return {
        success: false,
        error: 'DISCOUNT_EXISTS',
        message: 'لديك بالفعل خصم نشط على هذا الاشتراك'
      }
    }

    // Calculate effective dates
    const startDate = new Date()
    const endDate = calculateDiscountEndDate(startDate)

    // Create discount record
    const { data: discountData, error: discountError } = await supabase
      .from('subscription_discounts')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        discount_percentage: discountPercentage,
        discount_type: 'retention',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (discountError) {
      logger.error('Failed to apply retention discount:', discountError)
      return { 
        success: false, 
        error: discountError,
        message: 'فشل تطبيق الخصم. يرجى المحاولة مرة أخرى' 
      }
    }

    logger.log('Retention discount applied successfully', { discountId: discountData.id })
    return { 
      success: true,
      data: discountData,
      message: 'تم تطبيق الخصم بنجاح' 
    }
  } catch (error) {
    logger.error('Error applying retention discount:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى' 
    }
  }
}

/**
 * Confirm cancellation and create a cancellation request with 24-hour delay
 * 
 * Creates a cancellation request that will be processed after 24 hours.
 * This is Step 3 of the cancellation flow.
 * 
 * @param data - Cancellation data including user ID, subscription ID, and reasons
 * @returns ServiceResponse with cancellation request details
 */
export async function confirmCancellation(
  data: SubscriptionCancellationData
): Promise<ServiceResponse<CancellationRequest>> {
  try {
    logger.log('Confirming subscription cancellation', { 
      userId: data.userId, 
      subscriptionId: data.subscriptionId 
    })

    const { userId, subscriptionId, reasons, discountOffered, discountAccepted } = data

    // Validate user ID
    const userValidation = validateUserId(userId)
    if (!userValidation.valid) {
      logger.error('Invalid user ID:', userValidation.error)
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    // Validate subscription ID
    const subscriptionValidation = validateUserId(subscriptionId)
    if (!subscriptionValidation.valid) {
      logger.error('Invalid subscription ID:', subscriptionValidation.error)
      return { 
        success: false, 
        error: subscriptionValidation.error,
        message: 'معرف الاشتراك غير صالح' 
      }
    }

    // Validate reasons
    const reasonsValidation = validateCancellationReasons(reasons)
    if (!reasonsValidation.valid) {
      logger.error('Invalid cancellation reasons:', reasonsValidation.error)
      return { 
        success: false, 
        error: reasonsValidation.error,
        message: 'أسباب الإلغاء غير صالحة' 
      }
    }

    // Check if user already has a pending cancellation request
    const { data: existingRequest, error: checkError } = await supabase
      .from('cancellation_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_id', subscriptionId)
      .eq('status', 'pending')
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
      logger.error('Error checking existing cancellation:', checkError)
      // Continue anyway - this is not critical
    }

    if (existingRequest) {
      logger.warn('User already has a pending cancellation request', { 
        userId, 
        subscriptionId,
        requestId: existingRequest.id 
      })
      return {
        success: false,
        error: 'CANCELLATION_PENDING',
        data: existingRequest,
        message: 'لديك بالفعل طلب إلغاء قيد المعالجة'
      }
    }

    // Calculate dates
    const requestedAt = new Date()
    const effectiveDate = calculateEffectiveDate(requestedAt)

    // Create cancellation request
    const { data: cancellationData, error: cancellationError } = await supabase
      .from('cancellation_requests')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        reasons,
        discount_offered: discountOffered,
        discount_accepted: discountAccepted,
        status: 'pending',
        requested_at: requestedAt.toISOString(),
        effective_date: effectiveDate.toISOString(),
        confirmed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (cancellationError) {
      logger.error('Failed to create cancellation request:', cancellationError)
      return { 
        success: false, 
        error: cancellationError,
        message: 'فشل إنشاء طلب الإلغاء. يرجى المحاولة مرة أخرى' 
      }
    }

    logger.log('Cancellation request created successfully', { 
      requestId: cancellationData.id,
      effectiveDate: effectiveDate.toISOString()
    })

    return { 
      success: true, 
      data: cancellationData,
      message: 'تم تأكيد طلب الإلغاء. سيتم تفعيله خلال 24 ساعة' 
    }
  } catch (error) {
    logger.error('Error confirming cancellation:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى' 
    }
  }
}

/**
 * Get active subscription for a user
 * 
 * @param userId - The user's unique identifier
 * @returns ServiceResponse with subscription data
 */
export async function getUserSubscription(
  userId: string
): Promise<ServiceResponse<any>> {
  try {
    // Validate user ID
    const userValidation = validateUserId(userId)
    if (!userValidation.valid) {
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { 
          success: false, 
          error: 'NOT_FOUND',
          message: 'لا يوجد اشتراك نشط' 
        }
      }
      logger.error('Failed to get user subscription:', error)
      return { 
        success: false, 
        error,
        message: 'فشل تحميل بيانات الاشتراك' 
      }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error getting user subscription:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ في تحميل الاشتراك' 
    }
  }
}

/**
 * Get pending cancellation request for a user
 * 
 * @param userId - The user's unique identifier
 * @returns ServiceResponse with cancellation request data
 */
export async function getPendingCancellation(
  userId: string
): Promise<ServiceResponse<CancellationRequest | null>> {
  try {
    // Validate user ID
    const userValidation = validateUserId(userId)
    if (!userValidation.valid) {
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    const { data, error } = await supabase
      .from('cancellation_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error('Failed to get pending cancellation:', error)
      return { 
        success: false, 
        error,
        message: 'فشل تحميل طلب الإلغاء' 
      }
    }

    return { success: true, data: data || null }
  } catch (error) {
    logger.error('Error getting pending cancellation:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ في تحميل طلب الإلغاء' 
    }
  }
}

/**
 * Cancel a pending cancellation request (user changed their mind)
 * 
 * @param userId - The user's unique identifier
 * @param cancellationRequestId - The cancellation request ID
 * @returns ServiceResponse indicating success or failure
 */
export async function cancelCancellationRequest(
  userId: string,
  cancellationRequestId: string
): Promise<ServiceResponse> {
  try {
    logger.log('Cancelling cancellation request', { userId, cancellationRequestId })

    // Validate user ID
    const userValidation = validateUserId(userId)
    if (!userValidation.valid) {
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    // Update cancellation request status
    const { error } = await supabase
      .from('cancellation_requests')
      .update({
        status: 'cancelled',
        cancelled_by_user_at: new Date().toISOString()
      })
      .eq('id', cancellationRequestId)
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (error) {
      logger.error('Failed to cancel cancellation request:', error)
      return { 
        success: false, 
        error,
        message: 'فشل إلغاء طلب الإلغاء' 
      }
    }

    logger.log('Cancellation request cancelled successfully')
    return { 
      success: true,
      message: 'تم إلغاء طلب الإلغاء بنجاح' 
    }
  } catch (error) {
    logger.error('Error cancelling cancellation request:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ غير متوقع' 
    }
  }
}

/**
 * Get active retention discounts for a user
 * 
 * @param userId - The user's unique identifier
 * @returns ServiceResponse with array of active discounts
 */
export async function getActiveDiscounts(
  userId: string
): Promise<ServiceResponse<SubscriptionDiscount[]>> {
  try {
    // Validate user ID
    const userValidation = validateUserId(userId)
    if (!userValidation.valid) {
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    const { data, error } = await supabase
      .from('subscription_discounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get active discounts:', error)
      return { 
        success: false, 
        error,
        message: 'فشل تحميل الخصومات النشطة' 
      }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    logger.error('Error getting active discounts:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ في تحميل الخصومات' 
    }
  }
}

// ============================================================================
// Exports
// ============================================================================
export default {
  // Main cancellation flow functions
  submitCancellationFeedback,
  applyRetentionDiscount,
  confirmCancellation,
  
  // Helper functions
  getUserSubscription,
  getPendingCancellation,
  cancelCancellationRequest,
  getActiveDiscounts,
  
  // Constants
  CANCELLATION_DELAY_HOURS,
  DEFAULT_RETENTION_DISCOUNT,
  RETENTION_DISCOUNT_DURATION_MONTHS,
  VALID_CANCELLATION_REASONS
}
