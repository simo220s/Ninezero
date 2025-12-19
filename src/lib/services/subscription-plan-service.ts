/**
 * Subscription Plan Service
 * 
 * Handles all subscription plan-related operations
 * Requirement 9.1: Interface to create and modify subscription plans
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface SubscriptionPlan {
  id: string
  name: string
  name_ar: string
  price: number
  credits: number
  duration: 'monthly' | 'quarterly' | 'annual'
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionPlanData {
  name: string
  name_ar: string
  price: number
  credits: number
  duration: 'monthly' | 'quarterly' | 'annual'
  features: string[]
  is_active?: boolean
}

export interface UpdateSubscriptionPlanData {
  name?: string
  name_ar?: string
  price?: number
  credits?: number
  duration?: 'monthly' | 'quarterly' | 'annual'
  features?: string[]
  is_active?: boolean
}

class SubscriptionPlanService {
  /**
   * Get all subscription plans
   */
  async getAllPlans(): Promise<{ data: SubscriptionPlan[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching subscription plans:', error)
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (err) {
      logger.error('Unexpected error fetching subscription plans:', err)
      return { data: null, error: err as Error }
    }
  }


  /**
   * Get active subscription plans (for students)
   */
  async getActivePlans(): Promise<{ data: SubscriptionPlan[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) {
        logger.error('Error fetching active subscription plans:', error)
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (err) {
      logger.error('Unexpected error fetching active subscription plans:', err)
      return { data: null, error: err as Error }
    }
  }

  /**
   * Get a single subscription plan by ID
   */
  async getPlanById(planId: string): Promise<{ data: SubscriptionPlan | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) {
        logger.error('Error fetching subscription plan:', error)
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (err) {
      logger.error('Unexpected error fetching subscription plan:', err)
      return { data: null, error: err as Error }
    }
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(planData: CreateSubscriptionPlanData): Promise<{ data: SubscriptionPlan | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([{
          ...planData,
          is_active: planData.is_active ?? true
        }])
        .select()
        .single()

      if (error) {
        logger.error('Error creating subscription plan:', error)
        return { data: null, error: new Error(error.message) }
      }

      logger.log('Subscription plan created successfully:', data.id)
      return { data, error: null }
    } catch (err) {
      logger.error('Unexpected error creating subscription plan:', err)
      return { data: null, error: err as Error }
    }
  }

  /**
   * Update an existing subscription plan
   */
  async updatePlan(planId: string, updates: UpdateSubscriptionPlanData): Promise<{ data: SubscriptionPlan | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single()

      if (error) {
        logger.error('Error updating subscription plan:', error)
        return { data: null, error: new Error(error.message) }
      }

      logger.log('Subscription plan updated successfully:', planId)
      return { data, error: null }
    } catch (err) {
      logger.error('Unexpected error updating subscription plan:', err)
      return { data: null, error: err as Error }
    }
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(planId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId)

      if (error) {
        logger.error('Error deleting subscription plan:', error)
        return { error: new Error(error.message) }
      }

      logger.log('Subscription plan deleted successfully:', planId)
      return { error: null }
    } catch (err) {
      logger.error('Unexpected error deleting subscription plan:', err)
      return { error: err as Error }
    }
  }

  /**
   * Toggle plan active status
   */
  async togglePlanStatus(planId: string, isActive: boolean): Promise<{ data: SubscriptionPlan | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({ is_active: isActive })
        .eq('id', planId)
        .select()
        .single()

      if (error) {
        logger.error('Error toggling subscription plan status:', error)
        return { data: null, error: new Error(error.message) }
      }

      logger.log('Subscription plan status toggled:', planId, isActive)
      return { data, error: null }
    } catch (err) {
      logger.error('Unexpected error toggling subscription plan status:', err)
      return { data: null, error: err as Error }
    }
  }
}

// Export singleton instance
const subscriptionPlanService = new SubscriptionPlanService()
export default subscriptionPlanService
