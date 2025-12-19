/**
 * Package Service
 * 
 * Business logic for package and bundle management
 * Task 11: Develop Package and Bundle System
 */

import { supabase } from '../supabase'
import { logger } from '../logger'
import type {
  Package,
  PackagePurchase,
  PackageStats,
  CreatePackageInput,
  UpdatePackageInput,
  PurchasePackageInput,
  PurchasePackageResult,
  PackageFilter,
  PackageListItem,
  PackageComparison,
  FamilyPackageAllocation,
} from '@/types/package'

class PackageService {
  /**
   * Calculate package price with discounts
   */
  async calculatePackagePrice(
    packageId: string,
    couponCode?: string
  ): Promise<{
    originalPrice: number
    discountPrice: number
    couponDiscount: number
    finalPrice: number
    totalDiscount: number
    couponId?: string
    error?: string
  }> {
    try {
      const { data, error } = await supabase.rpc('calculate_package_price', {
        p_package_id: packageId,
        p_coupon_code: couponCode || null,
      })

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          originalPrice: 0,
          discountPrice: 0,
          couponDiscount: 0,
          finalPrice: 0,
          totalDiscount: 0,
          error: 'Package not found',
        }
      }

      const result = data[0]
      return {
        originalPrice: result.original_price,
        discountPrice: result.discount_price,
        couponDiscount: result.coupon_discount,
        finalPrice: result.final_price,
        totalDiscount: result.total_discount,
        couponId: result.coupon_id,
      }
    } catch (error) {
      logger.error('Error calculating package price:', error)
      return {
        originalPrice: 0,
        discountPrice: 0,
        couponDiscount: 0,
        finalPrice: 0,
        totalDiscount: 0,
        error: 'حدث خطأ أثناء حساب السعر',
      }
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(input: PurchasePackageInput): Promise<PurchasePackageResult> {
    try {
      // Get package details
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', input.package_id)
        .eq('status', 'active')
        .single()

      if (packageError || !packageData) {
        return {
          success: false,
          final_price: 0,
          discount_amount: 0,
          credits_granted: 0,
          error_message: 'الباقة غير متوفرة',
        }
      }

      const pkg = packageData as Package

      // Calculate price with coupon if provided
      const priceCalc = await this.calculatePackagePrice(input.package_id, input.coupon_code)

      if (priceCalc.error) {
        return {
          success: false,
          final_price: 0,
          discount_amount: 0,
          credits_granted: 0,
          error_message: priceCalc.error,
        }
      }

      // Record purchase
      const { data: purchaseId, error: purchaseError } = await supabase.rpc('purchase_package', {
        p_package_id: input.package_id,
        p_user_id: input.user_id,
        p_purchase_price: priceCalc.finalPrice,
        p_original_price: priceCalc.originalPrice,
        p_discount_amount: priceCalc.totalDiscount,
        p_credits_granted: pkg.credits,
        p_coupon_id: priceCalc.couponId || null,
        p_payment_method: input.payment_method,
        p_validity_days: pkg.validity_days || null,
      })

      if (purchaseError) throw purchaseError

      // Get the created purchase
      const { data: purchase, error: fetchError } = await supabase
        .from('package_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single()

      if (fetchError) throw fetchError

      logger.log('Package purchased:', { packageId: input.package_id, userId: input.user_id })

      return {
        success: true,
        purchase: purchase as PackagePurchase,
        package: pkg,
        final_price: priceCalc.finalPrice,
        discount_amount: priceCalc.totalDiscount,
        credits_granted: pkg.credits,
      }
    } catch (error) {
      logger.error('Error purchasing package:', error)
      return {
        success: false,
        final_price: 0,
        discount_amount: 0,
        credits_granted: 0,
        error_message: 'حدث خطأ أثناء شراء الباقة',
      }
    }
  }

  /**
   * Create a new package
   */
  async createPackage(input: CreatePackageInput): Promise<{ data: Package | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert({
          name: input.name,
          name_ar: input.name_ar,
          description: input.description,
          description_ar: input.description_ar,
          package_type: input.package_type,
          credits: input.credits,
          price: input.price,
          discount_price: input.discount_price,
          validity_days: input.validity_days,
          max_students: input.max_students || 1,
          includes_trial: input.includes_trial || false,
          trial_classes: input.trial_classes || 0,
          regular_classes: input.regular_classes || 0,
          features: input.features || [],
          is_featured: input.is_featured || false,
          is_bestseller: input.is_bestseller || false,
          is_seasonal: input.is_seasonal || false,
          seasonal_start: input.seasonal_start?.toISOString(),
          seasonal_end: input.seasonal_end?.toISOString(),
          display_order: input.display_order || 0,
          status: input.status || 'active',
          image_url: input.image_url,
        })
        .select()
        .single()

      if (error) throw error

      logger.log('Package created:', data.name)
      return { data: data as Package, error: null }
    } catch (error) {
      logger.error('Error creating package:', error)
      return { data: null, error }
    }
  }

  /**
   * Update an existing package
   */
  async updatePackage(input: UpdatePackageInput): Promise<{ data: Package | null; error: any }> {
    try {
      const updateData: any = {}

      if (input.name) updateData.name = input.name
      if (input.name_ar) updateData.name_ar = input.name_ar
      if (input.description !== undefined) updateData.description = input.description
      if (input.description_ar !== undefined) updateData.description_ar = input.description_ar
      if (input.package_type) updateData.package_type = input.package_type
      if (input.credits !== undefined) updateData.credits = input.credits
      if (input.price !== undefined) updateData.price = input.price
      if (input.discount_price !== undefined) updateData.discount_price = input.discount_price
      if (input.validity_days !== undefined) updateData.validity_days = input.validity_days
      if (input.max_students !== undefined) updateData.max_students = input.max_students
      if (input.includes_trial !== undefined) updateData.includes_trial = input.includes_trial
      if (input.trial_classes !== undefined) updateData.trial_classes = input.trial_classes
      if (input.regular_classes !== undefined) updateData.regular_classes = input.regular_classes
      if (input.features !== undefined) updateData.features = input.features
      if (input.is_featured !== undefined) updateData.is_featured = input.is_featured
      if (input.is_bestseller !== undefined) updateData.is_bestseller = input.is_bestseller
      if (input.is_seasonal !== undefined) updateData.is_seasonal = input.is_seasonal
      if (input.seasonal_start) updateData.seasonal_start = input.seasonal_start.toISOString()
      if (input.seasonal_end) updateData.seasonal_end = input.seasonal_end.toISOString()
      if (input.display_order !== undefined) updateData.display_order = input.display_order
      if (input.status) updateData.status = input.status
      if (input.image_url !== undefined) updateData.image_url = input.image_url

      const { data, error } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error

      logger.log('Package updated:', input.id)
      return { data: data as Package, error: null }
    } catch (error) {
      logger.error('Error updating package:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete a package
   */
  async deletePackage(packageId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from('packages').delete().eq('id', packageId)

      if (error) throw error

      logger.log('Package deleted:', packageId)
      return { error: null }
    } catch (error) {
      logger.error('Error deleting package:', error)
      return { error }
    }
  }

  /**
   * Get package by ID
   */
  async getPackage(packageId: string): Promise<{ data: Package | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single()

      if (error) throw error

      return { data: data as Package, error: null }
    } catch (error) {
      logger.error('Error fetching package:', error)
      return { data: null, error }
    }
  }

  /**
   * List packages with filters
   */
  async listPackages(filter?: PackageFilter): Promise<{ data: PackageListItem[]; error: any }> {
    try {
      let query = supabase.from('packages').select('*')

      if (filter?.package_type) {
        query = query.eq('package_type', filter.package_type)
      }

      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      if (filter?.is_featured !== undefined) {
        query = query.eq('is_featured', filter.is_featured)
      }

      if (filter?.is_bestseller !== undefined) {
        query = query.eq('is_bestseller', filter.is_bestseller)
      }

      if (filter?.is_seasonal !== undefined) {
        query = query.eq('is_seasonal', filter.is_seasonal)
      }

      if (filter?.search) {
        query = query.or(
          `name.ilike.%${filter.search}%,name_ar.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
        )
      }

      if (filter?.min_price !== undefined) {
        query = query.gte('price', filter.min_price)
      }

      if (filter?.max_price !== undefined) {
        query = query.lte('price', filter.max_price)
      }

      if (filter?.active_only) {
        query = query.eq('status', 'active')
        const now = new Date().toISOString()
        query = query.or(`is_seasonal.eq.false,and(is_seasonal.eq.true,seasonal_start.lte.${now},seasonal_end.gte.${now})`)
      }

      query = query.order('display_order', { ascending: true })
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Enhance with additional info
      const enhancedData = await Promise.all(
        (data as Package[]).map(async (pkg) => {
          const stats = await this.getPackageStats(pkg.id)
          const savingsAmount = pkg.discount_price ? pkg.price - pkg.discount_price : 0
          const savingsPercentage = pkg.discount_price
            ? Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100)
            : 0

          return {
            ...pkg,
            purchase_count: stats.data?.total_purchases || 0,
            revenue: stats.data?.total_revenue || 0,
            savings_amount: savingsAmount,
            savings_percentage: savingsPercentage,
          }
        })
      )

      return { data: enhancedData, error: null }
    } catch (error) {
      logger.error('Error listing packages:', error)
      return { data: [], error }
    }
  }

  /**
   * Get package statistics
   */
  async getPackageStats(packageId: string): Promise<{ data: PackageStats | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_package_stats', {
        p_package_id: packageId,
      })

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          data: {
            total_purchases: 0,
            total_revenue: 0,
            total_credits_sold: 0,
            total_credits_used: 0,
            avg_purchase_price: 0,
            conversion_rate: 0,
            most_popular_type: 'credit_bundle',
          },
          error: null,
        }
      }

      return { data: data[0] as PackageStats, error: null }
    } catch (error) {
      logger.error('Error fetching package stats:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user's active packages
   */
  async getUserActivePackages(userId: string): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_user_active_packages', {
        p_user_id: userId,
      })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('Error fetching user active packages:', error)
      return { data: [], error }
    }
  }

  /**
   * Get user's package purchase history
   */
  async getUserPackagePurchases(userId: string): Promise<{ data: PackagePurchase[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('package_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false })

      if (error) throw error

      return { data: data as PackagePurchase[], error: null }
    } catch (error) {
      logger.error('Error fetching user package purchases:', error)
      return { data: [], error }
    }
  }

  /**
   * Allocate family package credits to a student
   */
  async allocateFamilyCredits(
    packagePurchaseId: string,
    studentId: string,
    studentName: string,
    creditsAllocated: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('allocate_family_credits', {
        p_package_purchase_id: packagePurchaseId,
        p_student_id: studentId,
        p_student_name: studentName,
        p_credits_allocated: creditsAllocated,
      })

      if (error) throw error

      if (data === true) {
        logger.log('Family credits allocated:', { packagePurchaseId, studentId, creditsAllocated })
        return { success: true }
      }

      return { success: false, error: 'فشل تخصيص الرصيد' }
    } catch (error: any) {
      logger.error('Error allocating family credits:', error)
      return { success: false, error: error.message || 'حدث خطأ أثناء تخصيص الرصيد' }
    }
  }

  /**
   * Get family package allocations
   */
  async getFamilyPackageAllocations(
    packagePurchaseId: string
  ): Promise<{ data: FamilyPackageAllocation[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('family_package_allocations')
        .select('*')
        .eq('package_purchase_id', packagePurchaseId)
        .order('allocated_at', { ascending: false })

      if (error) throw error

      return { data: data as FamilyPackageAllocation[], error: null }
    } catch (error) {
      logger.error('Error fetching family package allocations:', error)
      return { data: [], error }
    }
  }

  /**
   * Compare packages for pricing page
   */
  async comparePackages(packageIds: string[]): Promise<{ data: PackageComparison[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .in('id', packageIds)
        .eq('status', 'active')

      if (error) throw error

      const packages = data as Package[]
      const comparisons: PackageComparison[] = packages.map((pkg) => {
        const effectivePrice = pkg.discount_price || pkg.price
        const pricePerCredit = effectivePrice / pkg.credits

        // Calculate savings vs buying single classes (assuming single class = 100 SAR)
        const singleClassPrice = 100
        const savingsVsSingle = pkg.credits * singleClassPrice - effectivePrice

        return {
          package_id: pkg.id,
          name: pkg.name,
          name_ar: pkg.name_ar,
          credits: pkg.credits,
          price: effectivePrice,
          price_per_credit: Math.round(pricePerCredit * 100) / 100,
          savings_vs_single: Math.round(savingsVsSingle * 100) / 100,
          features: pkg.features,
          is_recommended: pkg.is_featured,
        }
      })

      // Sort by price per credit (best value first)
      comparisons.sort((a, b) => a.price_per_credit - b.price_per_credit)

      return { data: comparisons, error: null }
    } catch (error) {
      logger.error('Error comparing packages:', error)
      return { data: [], error }
    }
  }

  /**
   * Get seasonal packages
   */
  async getSeasonalPackages(): Promise<{ data: Package[]; error: any }> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_seasonal', true)
        .eq('status', 'active')
        .lte('seasonal_start', now)
        .gte('seasonal_end', now)
        .order('display_order', { ascending: true })

      if (error) throw error

      return { data: data as Package[], error: null }
    } catch (error) {
      logger.error('Error fetching seasonal packages:', error)
      return { data: [], error }
    }
  }

  /**
   * Expire old seasonal packages (should be run periodically)
   */
  async expireSeasonalPackages(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('expire_seasonal_packages')

      if (error) throw error

      logger.log(`Expired ${data} seasonal packages`)
      return data || 0
    } catch (error) {
      logger.error('Error expiring seasonal packages:', error)
      return 0
    }
  }

  /**
   * Get featured packages for homepage
   */
  async getFeaturedPackages(limit: number = 3): Promise<{ data: Package[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('display_order', { ascending: true })
        .limit(limit)

      if (error) throw error

      return { data: data as Package[], error: null }
    } catch (error) {
      logger.error('Error fetching featured packages:', error)
      return { data: [], error }
    }
  }

  /**
   * Get bestseller packages
   */
  async getBestsellerPackages(limit: number = 3): Promise<{ data: Package[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_bestseller', true)
        .eq('status', 'active')
        .order('display_order', { ascending: true })
        .limit(limit)

      if (error) throw error

      return { data: data as Package[], error: null }
    } catch (error) {
      logger.error('Error fetching bestseller packages:', error)
      return { data: [], error }
    }
  }

  /**
   * Calculate savings for a package
   */
  calculateSavings(
    credits: number,
    packagePrice: number,
    singleClassPrice: number = 100
  ): { savingsAmount: number; savingsPercentage: number } {
    const regularTotal = credits * singleClassPrice
    const savingsAmount = regularTotal - packagePrice
    const savingsPercentage = Math.round((savingsAmount / regularTotal) * 100)

    return {
      savingsAmount: Math.max(0, savingsAmount),
      savingsPercentage: Math.max(0, savingsPercentage),
    }
  }
}

export const packageService = new PackageService()
export default packageService
