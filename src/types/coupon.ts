/**
 * Coupon System Types
 * 
 * Type definitions for the coupon and discount system
 */

export type DiscountType = 'percentage' | 'fixed'
export type CouponStatus = 'active' | 'inactive' | 'expired' | 'depleted'
export type ApplicableTo = 'all' | 'trial' | 'regular' | 'packages' | 'credits'

export interface Coupon {
  id: string
  code: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  discount_type: DiscountType
  discount_value: number
  min_purchase_amount: number
  max_discount_amount?: number
  valid_from: Date
  valid_until: Date
  max_uses?: number
  current_uses: number
  max_uses_per_user: number
  applicable_to: ApplicableTo
  teacher_id?: string
  status: CouponStatus
  created_by?: string
  created_at: Date
  updated_at: Date
}

export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  order_id?: string
  discount_amount: number
  original_amount: number
  final_amount: number
  used_at: Date
}

export interface CouponCategory {
  id: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  created_at: Date
}

export interface CouponValidationResult {
  is_valid: boolean
  coupon_id?: string
  discount_amount: number
  error_message?: string
}

export interface CouponStats {
  total_uses: number
  total_discount_given: number
  total_revenue: number
  unique_users: number
  avg_discount: number
}

export interface CreateCouponInput {
  code: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  discount_type: DiscountType
  discount_value: number
  min_purchase_amount?: number
  max_discount_amount?: number
  valid_from: Date
  valid_until: Date
  max_uses?: number
  max_uses_per_user?: number
  applicable_to?: ApplicableTo
  teacher_id?: string
  status?: CouponStatus
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {
  id: string
}

export interface ApplyCouponInput {
  code: string
  user_id: string
  purchase_amount: number
}

export interface ApplyCouponResult {
  success: boolean
  coupon?: Coupon
  discount_amount: number
  final_amount: number
  error_message?: string
}

export interface CouponFilter {
  status?: CouponStatus
  applicable_to?: ApplicableTo
  teacher_id?: string
  search?: string
  valid_only?: boolean
}

export interface CouponListItem extends Coupon {
  usage_count?: number
  remaining_uses?: number
  is_expired?: boolean
  is_depleted?: boolean
}
