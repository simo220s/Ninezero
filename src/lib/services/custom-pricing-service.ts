/**
 * Custom Pricing Service
 * 
 * Handles API calls for custom pricing management
 * Requirement 9.2: Backend integration for custom pricing
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface StudentWithPricing {
  id: string
  name: string
  email: string
  defaultPrice: number
  customPrice?: number
  hasCustomPrice: boolean
}

export interface CustomPriceRecord {
  id: string
  student_id: string
  teacher_id: string
  custom_price: number
  created_at: string
  updated_at: string
}

class CustomPricingService {
  /**
   * Get all students with their pricing information
   */
  async getStudentsWithPricing(teacherId: string): Promise<StudentWithPricing[]> {
    try {
      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'student')

      if (studentsError) throw studentsError

      // Fetch custom pricing records
      const { data: customPrices, error: pricesError } = await supabase
        .from('custom_pricing')
        .select('*')
        .eq('teacher_id', teacherId)

      if (pricesError) throw pricesError

      // Combine data
      const studentsWithPricing: StudentWithPricing[] = students.map(student => {
        const customPrice = customPrices?.find(cp => cp.student_id === student.id)
        
        return {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
          defaultPrice: 100, // TODO: Get from subscription plan
          customPrice: customPrice?.custom_price,
          hasCustomPrice: !!customPrice
        }
      })

      logger.info('Students with pricing loaded', { count: studentsWithPricing.length })
      return studentsWithPricing
    } catch (error) {
      logger.error('Failed to load students with pricing', error)
      throw error
    }
  }

  /**
   * Set custom price for a student
   */
  async setCustomPrice(
    studentId: string,
    teacherId: string,
    customPrice: number
  ): Promise<void> {
    try {
      // Check if custom price already exists
      const { data: existing } = await supabase
        .from('custom_pricing')
        .select('id')
        .eq('student_id', studentId)
        .eq('teacher_id', teacherId)
        .single()

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('custom_pricing')
          .update({
            custom_price: customPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('custom_pricing')
          .insert({
            student_id: studentId,
            teacher_id: teacherId,
            custom_price: customPrice
          })

        if (error) throw error
      }

      logger.info('Custom price set', { studentId, customPrice })
    } catch (error) {
      logger.error('Failed to set custom price', error)
      throw error
    }
  }

  /**
   * Remove custom price for a student
   */
  async removeCustomPrice(studentId: string, teacherId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_pricing')
        .delete()
        .eq('student_id', studentId)
        .eq('teacher_id', teacherId)

      if (error) throw error

      logger.info('Custom price removed', { studentId })
    } catch (error) {
      logger.error('Failed to remove custom price', error)
      throw error
    }
  }

  /**
   * Get custom price for a specific student
   */
  async getCustomPrice(
    studentId: string,
    teacherId: string
  ): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('custom_pricing')
        .select('custom_price')
        .eq('student_id', studentId)
        .eq('teacher_id', teacherId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

      return data?.custom_price || null
    } catch (error) {
      logger.error('Failed to get custom price', error)
      throw error
    }
  }
}

export default new CustomPricingService()
