/**
 * Coupon Service
 * 
 * Business logic for coupon management and validation
 * Task 10: Implement Coupon and Discount System
 */

import { supabase } from '../supabase'
import { logger } from '../logger'
import type {
  Coupon,
  CouponUsage,
  CouponValidationResult,
  CouponStats,
  CreateCouponInput,
  UpdateCouponInput,
  ApplyCouponInput,
  ApplyCouponResult,
  CouponFilter,
  CouponListItem,
} from '@/types/coupon'

class CouponService {
  /**
   * Validate a coupon code
   */
  async validateCoupon(
    code: string,
    userId: string,
    purchaseAmount: number
  ): Promise<CouponValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: code.toUpperCase(),
        p_user_id: userId,
        p_purchase_amount: purchaseAmount,
      })

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          is_valid: false,
          discount_amount: 0,
          error_message: 'كود الخصم غير صالح',
        }
      }

      const result = data[0]
      return {
        is_valid: result.is_valid,
        coupon_id: result.coupon_id,
        discount_amount: result.discount_amount,
        error_message: result.error_message,
      }
    } catch (error) {
      logger.error('Error validating coupon:', error)
      return {
        is_valid: false,
        discount_amount: 0,
        error_message: 'حدث خطأ أثناء التحقق من كود الخصم',
      }
    }
  }

  /**
   * Apply a coupon and record usage
   */
  async applyCoupon(input: ApplyCouponInput): Promise<ApplyCouponResult> {
    try {
      // First validate the coupon
      const validation = await this.validateCoupon(
        input.code,
        input.user_id,
        input.purchase_amount
      )

      if (!validation.is_valid) {
        return {
          success: false,
          discount_amount: 0,
          final_amount: input.purchase_amount,
          error_message: validation.error_message,
        }
      }

      // Get coupon details
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', validation.coupon_id)
        .single()

      if (couponError || !coupon) {
        throw couponError || new Error('Coupon not found')
      }

      const finalAmount = input.purchase_amount - validation.discount_amount

      return {
        success: true,
        coupon: coupon as Coupon,
        discount_amount: validation.discount_amount,
        final_amount: finalAmount,
      }
    } catch (error) {
      logger.error('Error applying coupon:', error)
      return {
        success: false,
        discount_amount: 0,
        final_amount: input.purchase_amount,
        error_message: 'حدث خطأ أثناء تطبيق كود الخصم',
      }
    }
  }

  /**
   * Record coupon usage after successful payment
   */
  async recordCouponUsage(
    couponId: string,
    userId: string,
    orderId: string,
    originalAmount: number,
    discountAmount: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('apply_coupon', {
        p_coupon_id: couponId,
        p_user_id: userId,
        p_order_id: orderId,
        p_original_amount: originalAmount,
        p_discount_amount: discountAmount,
      })

      if (error) throw error

      logger.log('Coupon usage recorded:', { couponId, userId, orderId })
      return data === true
    } catch (error) {
      logger.error('Error recording coupon usage:', error)
      return false
    }
  }

  /**
   * Create a new coupon
   */
  async createCoupon(input: CreateCouponInput): Promise<{ data: Coupon | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: input.code.toUpperCase(),
          name: input.name,
          name_ar: input.name_ar,
          description: input.description,
          description_ar: input.description_ar,
          discount_type: input.discount_type,
          discount_value: input.discount_value,
          min_purchase_amount: input.min_purchase_amount || 0,
          max_discount_amount: input.max_discount_amount,
          valid_from: input.valid_from.toISOString(),
          valid_until: input.valid_until.toISOString(),
          max_uses: input.max_uses,
          max_uses_per_user: input.max_uses_per_user || 1,
          applicable_to: input.applicable_to || 'all',
          teacher_id: input.teacher_id,
          status: input.status || 'active',
        })
        .select()
        .single()

      if (error) throw error

      logger.log('Coupon created:', data.code)
      return { data: data as Coupon, error: null }
    } catch (error) {
      logger.error('Error creating coupon:', error)
      return { data: null, error }
    }
  }

  /**
   * Update an existing coupon
   */
  async updateCoupon(input: UpdateCouponInput): Promise<{ data: Coupon | null; error: any }> {
    try {
      const updateData: any = {}

      if (input.name) updateData.name = input.name
      if (input.name_ar) updateData.name_ar = input.name_ar
      if (input.description !== undefined) updateData.description = input.description
      if (input.description_ar !== undefined) updateData.description_ar = input.description_ar
      if (input.discount_type) updateData.discount_type = input.discount_type
      if (input.discount_value !== undefined) updateData.discount_value = input.discount_value
      if (input.min_purchase_amount !== undefined)
        updateData.min_purchase_amount = input.min_purchase_amount
      if (input.max_discount_amount !== undefined)
        updateData.max_discount_amount = input.max_discount_amount
      if (input.valid_from) updateData.valid_from = input.valid_from.toISOString()
      if (input.valid_until) updateData.valid_until = input.valid_until.toISOString()
      if (input.max_uses !== undefined) updateData.max_uses = input.max_uses
      if (input.max_uses_per_user !== undefined)
        updateData.max_uses_per_user = input.max_uses_per_user
      if (input.applicable_to) updateData.applicable_to = input.applicable_to
      if (input.status) updateData.status = input.status

      const { data, error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error

      logger.log('Coupon updated:', input.id)
      return { data: data as Coupon, error: null }
    } catch (error) {
      logger.error('Error updating coupon:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(couponId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', couponId)

      if (error) throw error

      logger.log('Coupon deleted:', couponId)
      return { error: null }
    } catch (error) {
      logger.error('Error deleting coupon:', error)
      return { error }
    }
  }

  /**
   * Get coupon by ID
   */
  async getCoupon(couponId: string): Promise<{ data: Coupon | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .single()

      if (error) throw error

      return { data: data as Coupon, error: null }
    } catch (error) {
      logger.error('Error fetching coupon:', error)
      return { data: null, error }
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<{ data: Coupon | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (error) throw error

      return { data: data as Coupon, error: null }
    } catch (error) {
      logger.error('Error fetching coupon by code:', error)
      return { data: null, error }
    }
  }

  /**
   * List coupons with filters
   */
  async listCoupons(filter?: CouponFilter): Promise<{ data: CouponListItem[]; error: any }> {
    try {
      let query = supabase.from('coupons').select('*')

      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      if (filter?.applicable_to) {
        query = query.eq('applicable_to', filter.applicable_to)
      }

      if (filter?.teacher_id) {
        query = query.eq('teacher_id', filter.teacher_id)
      }

      if (filter?.search) {
        query = query.or(
          `code.ilike.%${filter.search}%,name.ilike.%${filter.search}%,name_ar.ilike.%${filter.search}%`
        )
      }

      if (filter?.valid_only) {
        const now = new Date().toISOString()
        query = query.lte('valid_from', now).gte('valid_until', now)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Enhance with additional info
      const enhancedData = (data as Coupon[]).map((coupon) => ({
        ...coupon,
        usage_count: coupon.current_uses,
        remaining_uses: coupon.max_uses ? coupon.max_uses - coupon.current_uses : undefined,
        is_expired: new Date(coupon.valid_until) < new Date(),
        is_depleted: coupon.max_uses ? coupon.current_uses >= coupon.max_uses : false,
      }))

      return { data: enhancedData, error: null }
    } catch (error) {
      logger.error('Error listing coupons:', error)
      return { data: [], error }
    }
  }

  /**
   * Get coupon statistics
   */
  async getCouponStats(couponId: string): Promise<{ data: CouponStats | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_coupon_stats', {
        p_coupon_id: couponId,
      })

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          data: {
            total_uses: 0,
            total_discount_given: 0,
            total_revenue: 0,
            unique_users: 0,
            avg_discount: 0,
          },
          error: null,
        }
      }

      return { data: data[0] as CouponStats, error: null }
    } catch (error) {
      logger.error('Error fetching coupon stats:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user's coupon usage history
   */
  async getUserCouponUsages(userId: string): Promise<{ data: CouponUsage[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('coupon_usages')
        .select('*')
        .eq('user_id', userId)
        .order('used_at', { ascending: false })

      if (error) throw error

      return { data: data as CouponUsage[], error: null }
    } catch (error) {
      logger.error('Error fetching user coupon usages:', error)
      return { data: [], error }
    }
  }

  /**
   * Expire old coupons (should be run periodically)
   */
  async expireOldCoupons(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('expire_old_coupons')

      if (error) throw error

      logger.log(`Expired ${data} old coupons`)
      return data || 0
    } catch (error) {
      logger.error('Error expiring old coupons:', error)
      return 0
    }
  }

  /**
   * Generate a random coupon code
   */
  generateCouponCode(prefix: string = 'CLUB', length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = prefix
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return code
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(
    originalAmount: number,
    discountType: 'percentage' | 'fixed',
    discountValue: number,
    maxDiscountAmount?: number
  ): number {
    let discount = 0

    if (discountType === 'percentage') {
      discount = (originalAmount * discountValue) / 100
      if (maxDiscountAmount && discount > maxDiscountAmount) {
        discount = maxDiscountAmount
      }
    } else {
      discount = discountValue
    }

    // Ensure discount doesn't exceed original amount
    if (discount > originalAmount) {
      discount = originalAmount
    }

    return Math.round(discount * 100) / 100 // Round to 2 decimal places
  }
}

export const couponService = new CouponService()
export default couponService
