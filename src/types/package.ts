/**
 * Package and Bundle System Types
 * 
 * Type definitions for credit bundles, family packages, and combo packages
 * Task 11: Develop Package and Bundle System
 */

export type PackageType = 'credit_bundle' | 'family' | 'trial_combo' | 'seasonal' | 'custom'
export type PackageStatus = 'active' | 'inactive' | 'archived' | 'coming_soon'

export interface Package {
  id: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  package_type: PackageType
  credits: number
  price: number
  discount_price?: number
  discount_percentage?: number
  validity_days?: number
  max_students?: number // For family packages
  includes_trial?: boolean // For trial combo packages
  trial_classes?: number
  regular_classes?: number
  features: PackageFeature[]
  is_featured: boolean
  is_bestseller: boolean
  is_seasonal: boolean
  seasonal_start?: Date
  seasonal_end?: Date
  display_order: number
  status: PackageStatus
  image_url?: string
  created_at: Date
  updated_at: Date
}

export interface PackageFeature {
  id: string
  text: string
  text_ar: string
  icon?: string
  is_highlighted?: boolean
}

export interface PackagePurchase {
  id: string
  package_id: string
  user_id: string
  purchase_price: number
  original_price: number
  discount_amount: number
  credits_granted: number
  coupon_id?: string
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  valid_from: Date
  valid_until?: Date
  purchased_at: Date
  activated_at?: Date
}

export interface PackageUsage {
  id: string
  package_purchase_id: string
  user_id: string
  credits_used: number
  class_id?: string
  used_at: Date
  notes?: string
}

export interface PackageStats {
  total_purchases: number
  total_revenue: number
  total_credits_sold: number
  total_credits_used: number
  avg_purchase_price: number
  conversion_rate: number
  most_popular_type: PackageType
}

export interface CreatePackageInput {
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  package_type: PackageType
  credits: number
  price: number
  discount_price?: number
  validity_days?: number
  max_students?: number
  includes_trial?: boolean
  trial_classes?: number
  regular_classes?: number
  features?: PackageFeature[]
  is_featured?: boolean
  is_bestseller?: boolean
  is_seasonal?: boolean
  seasonal_start?: Date
  seasonal_end?: Date
  display_order?: number
  status?: PackageStatus
  image_url?: string
}

export interface UpdatePackageInput extends Partial<CreatePackageInput> {
  id: string
}

export interface PurchasePackageInput {
  package_id: string
  user_id: string
  coupon_code?: string
  payment_method: string
}

export interface PurchasePackageResult {
  success: boolean
  purchase?: PackagePurchase
  package?: Package
  final_price: number
  discount_amount: number
  credits_granted: number
  error_message?: string
}

export interface PackageFilter {
  package_type?: PackageType
  status?: PackageStatus
  is_featured?: boolean
  is_bestseller?: boolean
  is_seasonal?: boolean
  search?: string
  min_price?: number
  max_price?: number
  active_only?: boolean
}

export interface PackageListItem extends Package {
  purchase_count?: number
  revenue?: number
  avg_rating?: number
  savings_amount?: number
  savings_percentage?: number
}

export interface PackageComparison {
  package_id: string
  name: string
  name_ar: string
  credits: number
  price: number
  price_per_credit: number
  savings_vs_single: number
  features: PackageFeature[]
  is_recommended?: boolean
}

export interface FamilyPackageAllocation {
  id: string
  package_purchase_id: string
  student_id: string
  student_name: string
  credits_allocated: number
  credits_used: number
  allocated_at: Date
}

export interface SeasonalPackageConfig {
  id: string
  name: string
  name_ar: string
  season_type: 'ramadan' | 'back_to_school' | 'summer' | 'winter' | 'eid' | 'custom'
  start_date: Date
  end_date: Date
  discount_percentage: number
  special_features?: string[]
  banner_image?: string
  is_active: boolean
}
