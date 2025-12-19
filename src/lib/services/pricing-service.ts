/**
 * Dynamic Pricing Service
 * 
 * Manages pricing for English classes based on:
 * - Class type (Individual, Group, Assessment, Trial)
 * - Age group (10-12, 13-15, 16-18)
 * - Duration
 * - Special rates and discounts
 * 
 * High Priority Task 2: Implement Dynamic Pricing System
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export type ClassType = 'Individual' | 'Group' | 'Assessment' | 'Trial'
export type AgeGroup = '10-12' | '13-15' | '16-18'

export interface PricingRule {
  id: string
  class_type: ClassType
  age_group: AgeGroup
  base_price: number // Price per hour in SAR
  currency: string
  is_active: boolean
  effective_from: string
  effective_until?: string
  created_at: string
  updated_at: string
}

export interface PricingCalculation {
  basePrice: number
  duration: number // in minutes
  totalPrice: number
  pricePerMinute: number
  currency: string
  discount?: {
    amount: number
    reason: string
  }
  finalPrice: number
}

// Default pricing matrix (fallback if database pricing not available)
const DEFAULT_PRICING: Record<ClassType, Record<AgeGroup, number>> = {
  Individual: {
    '10-12': 150,
    '13-15': 175,
    '16-18': 200,
  },
  Group: {
    '10-12': 100,
    '13-15': 125,
    '16-18': 150,
  },
  Assessment: {
    '10-12': 100,
    '13-15': 100,
    '16-18': 100,
  },
  Trial: {
    '10-12': 0,
    '13-15': 0,
    '16-18': 0,
  },
}

/**
 * Get pricing rules from database
 * Note: This would require a pricing_rules table in the database
 */
export async function getPricingRules(): Promise<{
  data: PricingRule[] | null
  error: any
}> {
  try {
    // TODO: Implement when pricing_rules table is created
    // const { data, error } = await supabase
    //   .from('pricing_rules')
    //   .select('*')
    //   .eq('is_active', true)
    //   .order('effective_from', { ascending: false })

    // For now, return null to use default pricing
    logger.log('Using default pricing matrix (pricing_rules table not yet implemented)')
    return { data: null, error: null }
  } catch (err) {
    logger.error('Error fetching pricing rules:', err)
    return { data: null, error: err }
  }
}

/**
 * Get base price for a class type and age group
 */
export async function getBasePrice(
  classType: ClassType,
  ageGroup: AgeGroup
): Promise<{
  data: number | null
  error: any
}> {
  try {
    // Try to get from database first
    const { data: rules, error } = await getPricingRules()
    
    if (!error && rules && rules.length > 0) {
      // Find matching rule
      const rule = rules.find(
        r => r.class_type === classType && r.age_group === ageGroup
      )
      
      if (rule) {
        return { data: rule.base_price, error: null }
      }
    }

    // Fallback to default pricing
    const basePrice = DEFAULT_PRICING[classType]?.[ageGroup] || 150
    return { data: basePrice, error: null }
  } catch (err) {
    logger.error('Error getting base price:', err)
    return { data: null, error: err }
  }
}

/**
 * Calculate class price including duration and discounts
 */
export async function calculateClassPrice(params: {
  classType: ClassType
  ageGroup: AgeGroup
  duration: number // in minutes
  discountCode?: string
  packageDiscount?: number
}): Promise<{
  data: PricingCalculation | null
  error: any
}> {
  try {
    const { classType, ageGroup, duration, discountCode, packageDiscount } = params

    // Get base price (per hour)
    const { data: basePricePerHour, error: priceError } = await getBasePrice(classType, ageGroup)
    
    if (priceError || basePricePerHour === null) {
      return { data: null, error: priceError || new Error('Base price not found') }
    }

    // Calculate price for duration
    const pricePerMinute = basePricePerHour / 60
    const totalPrice = pricePerMinute * duration

    let discount: PricingCalculation['discount'] = undefined
    let finalPrice = totalPrice

    // Apply discount code if provided
    if (discountCode) {
      // TODO: Implement discount code validation from database
      // For now, apply a simple percentage discount
      const discountPercent = 10 // 10% discount
      const discountAmount = (totalPrice * discountPercent) / 100
      discount = {
        amount: discountAmount,
        reason: `Discount code: ${discountCode}`,
      }
      finalPrice -= discountAmount
    }

    // Apply package discount if provided
    if (packageDiscount && packageDiscount > 0) {
      const packageDiscountAmount = (totalPrice * packageDiscount) / 100
      if (discount) {
        discount.amount += packageDiscountAmount
        discount.reason += `, Package discount: ${packageDiscount}%`
      } else {
        discount = {
          amount: packageDiscountAmount,
          reason: `Package discount: ${packageDiscount}%`,
        }
      }
      finalPrice -= packageDiscountAmount
    }

    // Ensure final price is not negative
    finalPrice = Math.max(0, finalPrice)

    const calculation: PricingCalculation = {
      basePrice: basePricePerHour,
      duration,
      totalPrice: Math.round(totalPrice * 100) / 100,
      pricePerMinute: Math.round(pricePerMinute * 100) / 100,
      currency: 'SAR',
      discount,
      finalPrice: Math.round(finalPrice * 100) / 100,
    }

    logger.log('Price calculated', calculation)
    return { data: calculation, error: null }
  } catch (err) {
    logger.error('Error calculating class price:', err)
    return { data: null, error: err }
  }
}

/**
 * Get pricing matrix for display
 */
export async function getPricingMatrix(): Promise<{
  data: Record<ClassType, Record<AgeGroup, number>> | null
  error: any
}> {
  try {
    const { data: rules, error } = await getPricingRules()
    
    if (!error && rules && rules.length > 0) {
      // Build matrix from rules
      const matrix: any = {
        Individual: {},
        Group: {},
        Assessment: {},
        Trial: {},
      }

      rules.forEach(rule => {
        if (!matrix[rule.class_type]) {
          matrix[rule.class_type] = {}
        }
        matrix[rule.class_type][rule.age_group] = rule.base_price
      })

      return { data: matrix, error: null }
    }

    // Return default pricing
    return { data: DEFAULT_PRICING, error: null }
  } catch (err) {
    logger.error('Error fetching pricing matrix:', err)
    return { data: null, error: err }
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'SAR'): string {
  return `${price.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency === 'SAR' ? 'ر.س' : currency}`
}

/**
 * Calculate package price (bulk discount)
 */
export function calculatePackagePrice(params: {
  singleClassPrice: number
  numberOfClasses: number
  discountPercent: number
}): {
  totalWithoutDiscount: number
  discountAmount: number
  totalWithDiscount: number
} {
  const { singleClassPrice, numberOfClasses, discountPercent } = params
  
  const totalWithoutDiscount = singleClassPrice * numberOfClasses
  const discountAmount = (totalWithoutDiscount * discountPercent) / 100
  const totalWithDiscount = totalWithoutDiscount - discountAmount

  return {
    totalWithoutDiscount: Math.round(totalWithoutDiscount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalWithDiscount: Math.round(totalWithDiscount * 100) / 100,
  }
}

/**
 * Get recommended pricing for a student based on their profile
 */
export async function getRecommendedPricing(student: {
  age: number
  englishLevel: string
  classType: ClassType
}): Promise<{
  data: PricingCalculation | null
  error: any
}> {
  try {
    // Determine age group
    let ageGroup: AgeGroup = '13-15'
    if (student.age >= 10 && student.age <= 12) ageGroup = '10-12'
    else if (student.age >= 16 && student.age <= 18) ageGroup = '16-18'

    // Standard duration
    const duration = 60 // 60 minutes

    return await calculateClassPrice({
      classType: student.classType,
      ageGroup,
      duration,
    })
  } catch (err) {
    logger.error('Error getting recommended pricing:', err)
    return { data: null, error: err }
  }
}

export const pricingService = {
  getPricingRules,
  getBasePrice,
  calculateClassPrice,
  getPricingMatrix,
  formatPrice,
  calculatePackagePrice,
  getRecommendedPricing,
}

export default pricingService

