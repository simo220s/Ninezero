/**
 * Discount Service
 * 
 * Handles manual discount application by teachers/admins to student subscriptions.
 * 
 * Features:
 * - Apply manual discounts to student subscriptions
 * - View active discounts
 * - Remove or expire discounts
 * - Validate discount parameters
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { validateUserId, validatePercentage, validateDurationMonths, validateRequiredString } from '@/lib/utils/validation'
import { addMonths } from '@/lib/utils/date-helpers'

// ============================================================================
// Constants
// ============================================================================
const MAX_DISCOUNT_PERCENTAGE = 100
const MIN_DISCOUNT_PERCENTAGE = 1
const MAX_DISCOUNT_DURATION_MONTHS = 12
const MIN_DISCOUNT_DURATION_MONTHS = 1

// ============================================================================
// Type Definitions
// ============================================================================
export type DiscountType = 'retention' | 'promotional' | 'custom' | 'manual'

export interface ManualDiscount {
  id: string
  user_id: string
  subscription_id: string
  discount_percentage: number
  discount_type: DiscountType
  start_date: string
  end_date: string
  is_active: boolean
  reason: string
  applied_by: string
  created_at: string
  updated_at: string
}

export interface ApplyDiscountParams {
  userId: string
  subscriptionId: string
  discountPercentage: number
  durationMonths: number
  reason: string
  appliedBy: string
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
 * Calculate discount end date
 * Uses centralized date helper
 */
function calculateDiscountEndDate(startDate: Date, durationMonths: number): Date {
  return addMonths(startDate, durationMonths)
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Apply manual discount to a student's subscription
 * 
 * @param params - Discount parameters
 * @returns ServiceResponse with discount details
 */
export async function applyManualDiscount(
  params: ApplyDiscountParams
): Promise<ServiceResponse<ManualDiscount>> {
  try {
    logger.log('Applying manual discount', { 
      userId: params.userId, 
      percentage: params.discountPercentage 
    })

    const { userId, subscriptionId, discountPercentage, durationMonths, reason, appliedBy } = params

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

    // Validate applied by ID
    const appliedByValidation = validateUserId(appliedBy)
    if (!appliedByValidation.valid) {
      logger.error('Invalid appliedBy ID:', appliedByValidation.error)
      return { 
        success: false, 
        error: appliedByValidation.error,
        message: 'معرف المعلم غير صالح' 
      }
    }

    // Validate discount percentage
    const percentageValidation = validatePercentage(discountPercentage, MIN_DISCOUNT_PERCENTAGE, MAX_DISCOUNT_PERCENTAGE)
    if (!percentageValidation.valid) {
      logger.error('Invalid discount percentage:', percentageValidation.error)
      return { 
        success: false, 
        error: percentageValidation.error,
        message: 'نسبة الخصم غير صالحة' 
      }
    }

    // Validate duration
    const durationValidation = validateDurationMonths(durationMonths, MIN_DISCOUNT_DURATION_MONTHS, MAX_DISCOUNT_DURATION_MONTHS)
    if (!durationValidation.valid) {
      logger.error('Invalid duration:', durationValidation.error)
      return { 
        success: false, 
        error: durationValidation.error,
        message: 'مدة الخصم غير صالحة' 
      }
    }

    // Validate reason
    const reasonValidation = validateRequiredString(reason, 'Reason', 3)
    if (!reasonValidation.valid) {
      return {
        success: false,
        error: 'INVALID_REASON',
        message: 'يرجى إدخال سبب الخصم (3 أحرف على الأقل)'
      }
    }

    // Check if subscription exists and is active
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      logger.error('Subscription not found or not active:', subError)
      return {
        success: false,
        error: 'SUBSCRIPTION_NOT_FOUND',
        message: 'الاشتراك غير موجود أو غير نشط'
      }
    }

    // Check for existing active manual discounts
    const { data: existingDiscounts, error: checkError } = await supabase
      .from('subscription_discounts')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_id', subscriptionId)
      .eq('discount_type', 'manual')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())

    if (checkError) {
      logger.error('Error checking existing discounts:', checkError)
      // Continue anyway
    }

    // Deactivate existing manual discounts
    if (existingDiscounts && existingDiscounts.length > 0) {
      const { error: deactivateError } = await supabase
        .from('subscription_discounts')
        .update({ is_active: false })
        .in('id', existingDiscounts.map(d => d.id))

      if (deactivateError) {
        logger.error('Error deactivating existing discounts:', deactivateError)
        // Continue anyway
      }
    }

    // Calculate dates
    const startDate = new Date()
    const endDate = calculateDiscountEndDate(startDate, durationMonths)

    // Create discount record
    const { data: discountData, error: discountError } = await supabase
      .from('subscription_discounts')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        discount_percentage: discountPercentage,
        discount_type: 'manual',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
        reason,
        applied_by: appliedBy,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (discountError) {
      logger.error('Failed to apply manual discount:', discountError)
      return { 
        success: false, 
        error: discountError,
        message: 'فشل تطبيق الخصم. يرجى المحاولة مرة أخرى' 
      }
    }

    logger.log('Manual discount applied successfully', { discountId: discountData.id })
    return { 
      success: true,
      data: discountData,
      message: 'تم تطبيق الخصم بنجاح' 
    }
  } catch (error) {
    logger.error('Error applying manual discount:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى' 
    }
  }
}

/**
 * Get all active discounts for students
 * 
 * @param filters - Optional filters
 * @returns ServiceResponse with array of discounts
 */
export async function getAllActiveDiscounts(
  filters?: {
    userId?: string
    discountType?: DiscountType
  }
): Promise<ServiceResponse<ManualDiscount[]>> {
  try {
    let query = supabase
      .from('subscription_discounts')
      .select(`
        *,
        user:users!subscription_discounts_user_id_fkey(id, first_name, last_name, email),
        applied_by_user:users!subscription_discounts_applied_by_fkey(id, first_name, last_name)
      `)
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.discountType) {
      query = query.eq('discount_type', filters.discountType)
    }

    const { data, error } = await query

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

/**
 * Remove/deactivate a discount
 * 
 * @param discountId - The discount ID to remove
 * @param removedBy - The user ID removing the discount
 * @returns ServiceResponse indicating success or failure
 */
export async function removeDiscount(
  discountId: string,
  removedBy: string
): Promise<ServiceResponse> {
  try {
    logger.log('Removing discount', { discountId, removedBy })

    // Validate IDs
    const discountValidation = validateUserId(discountId)
    if (!discountValidation.valid) {
      return { 
        success: false, 
        error: discountValidation.error,
        message: 'معرف الخصم غير صالح' 
      }
    }

    const userValidation = validateUserId(removedBy)
    if (!userValidation.valid) {
      return { 
        success: false, 
        error: userValidation.error,
        message: 'معرف المستخدم غير صالح' 
      }
    }

    // Deactivate discount
    const { error } = await supabase
      .from('subscription_discounts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', discountId)

    if (error) {
      logger.error('Failed to remove discount:', error)
      return { 
        success: false, 
        error,
        message: 'فشل إزالة الخصم' 
      }
    }

    logger.log('Discount removed successfully')
    return { 
      success: true,
      message: 'تم إزالة الخصم بنجاح' 
    }
  } catch (error) {
    logger.error('Error removing discount:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ غير متوقع' 
    }
  }
}

/**
 * Get discount statistics
 * 
 * @returns ServiceResponse with discount statistics
 */
export async function getDiscountStatistics(): Promise<ServiceResponse<any>> {
  try {
    const { data, error } = await supabase.rpc('get_discount_statistics')

    if (error) {
      logger.error('Failed to get discount statistics:', error)
      // Return default stats if RPC doesn't exist
      return {
        success: true,
        data: {
          totalActiveDiscounts: 0,
          totalDiscountValue: 0,
          avgDiscountPercentage: 0,
          discountsByType: {}
        }
      }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error getting discount statistics:', error)
    return { 
      success: false, 
      error,
      message: 'حدث خطأ في تحميل الإحصائيات' 
    }
  }
}

// ============================================================================
// Exports
// ============================================================================
export default {
  applyManualDiscount,
  getAllActiveDiscounts,
  removeDiscount,
  getDiscountStatistics,
  
  // Constants
  MAX_DISCOUNT_PERCENTAGE,
  MIN_DISCOUNT_PERCENTAGE,
  MAX_DISCOUNT_DURATION_MONTHS,
  MIN_DISCOUNT_DURATION_MONTHS
}
