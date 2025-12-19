/**
 * Wishlist Service
 * 
 * Business logic for wishlist and favorites management
 * Task 13: Implement Wishlist and Favorites System
 */

import { supabase } from '../supabase'
import { logger } from '../logger'
import type {
  WishlistItem,
  FavoriteTeacher,
  SavedTimeslot,
  WishlistShare,
  WishlistShareItem,
  WishlistNotification,
  WishlistConversion,
  WishlistStats,
  AddToWishlistInput,
  UpdateWishlistItemInput,
  AddFavoriteTeacherInput,
  SaveTimeslotInput,
  CreateWishlistShareInput,
  WishlistShareResult,
  WishlistFilter,
  WishlistItemWithDetails,
  FavoriteTeacherWithDetails,
  SavedTimeslotWithDetails,
  SharedWishlistView,
  WishlistItemType,
} from '@/types/wishlist'

class WishlistService {
  /**
   * Add item to wishlist
   */
  async addToWishlist(input: AddToWishlistInput): Promise<{ data: WishlistItem | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('add_to_wishlist', {
        p_user_id: input.user_id,
        p_item_type: input.item_type,
        p_item_id: input.item_id,
        p_item_name: input.item_name || null,
        p_item_name_ar: input.item_name_ar || null,
        p_notes: input.notes || null,
        p_priority: input.priority || 0,
        p_is_gift: input.is_gift || false,
      })

      if (error) throw error

      // Fetch the created/updated item
      const { data: wishlistItem, error: fetchError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('id', data)
        .single()

      if (fetchError) throw fetchError

      logger.log('Item added to wishlist:', { itemType: input.item_type, itemId: input.item_id })
      return { data: wishlistItem as WishlistItem, error: null }
    } catch (error) {
      logger.error('Error adding to wishlist:', error)
      return { data: null, error }
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(
    userId: string,
    itemType: WishlistItemType,
    itemId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase.rpc('remove_from_wishlist', {
        p_user_id: userId,
        p_item_type: itemType,
        p_item_id: itemId,
      })

      if (error) throw error

      logger.log('Item removed from wishlist:', { itemType, itemId })
      return { success: data === true, error: null }
    } catch (error) {
      logger.error('Error removing from wishlist:', error)
      return { success: false, error }
    }
  }

  /**
   * Check if item is in wishlist
   */
  async isInWishlist(
    userId: string,
    itemType: WishlistItemType,
    itemId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_in_wishlist', {
        p_user_id: userId,
        p_item_type: itemType,
        p_item_id: itemId,
      })

      if (error) throw error

      return data === true
    } catch (error) {
      logger.error('Error checking wishlist:', error)
      return false
    }
  }

  /**
   * Update wishlist item
   */
  async updateWishlistItem(
    input: UpdateWishlistItemInput
  ): Promise<{ data: WishlistItem | null; error: any }> {
    try {
      const updateData: any = {}

      if (input.notes !== undefined) updateData.notes = input.notes
      if (input.priority !== undefined) updateData.priority = input.priority
      if (input.is_gift !== undefined) updateData.is_gift = input.is_gift
      if (input.gift_recipient_name !== undefined)
        updateData.gift_recipient_name = input.gift_recipient_name
      if (input.gift_recipient_email !== undefined)
        updateData.gift_recipient_email = input.gift_recipient_email
      if (input.reminder_enabled !== undefined)
        updateData.reminder_enabled = input.reminder_enabled
      if (input.reminder_date) updateData.reminder_date = input.reminder_date.toISOString()

      const { data, error } = await supabase
        .from('wishlists')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error

      logger.log('Wishlist item updated:', input.id)
      return { data: data as WishlistItem, error: null }
    } catch (error) {
      logger.error('Error updating wishlist item:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user's wishlist
   */
  async getUserWishlist(
    userId: string,
    filter?: WishlistFilter
  ): Promise<{ data: WishlistItemWithDetails[]; error: any }> {
    try {
      let query = supabase.from('wishlists').select('*').eq('user_id', userId)

      if (filter?.item_type) {
        query = query.eq('item_type', filter.item_type)
      }

      if (filter?.is_gift !== undefined) {
        query = query.eq('is_gift', filter.is_gift)
      }

      if (filter?.priority_min !== undefined) {
        query = query.gte('priority', filter.priority_min)
      }

      if (filter?.has_reminder !== undefined) {
        query = query.eq('reminder_enabled', filter.has_reminder)
      }

      if (filter?.search) {
        query = query.or(
          `item_name.ilike.%${filter.search}%,item_name_ar.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`
        )
      }

      query = query.order('priority', { ascending: false })
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Enhance with item details
      const enhancedData = await this.enhanceWishlistItems(data as WishlistItem[])

      return { data: enhancedData, error: null }
    } catch (error) {
      logger.error('Error fetching user wishlist:', error)
      return { data: [], error }
    }
  }

  /**
   * Enhance wishlist items with details
   */
  private async enhanceWishlistItems(
    items: WishlistItem[]
  ): Promise<WishlistItemWithDetails[]> {
    const enhanced = await Promise.all(
      items.map(async (item) => {
        let itemDetails = null
        let isAvailable = true
        let currentPrice = null
        let discountAvailable = false

        try {
          if (item.item_type === 'package') {
            const { data: pkg } = await supabase
              .from('packages')
              .select('*')
              .eq('id', item.item_id)
              .single()

            if (pkg) {
              itemDetails = pkg
              isAvailable = pkg.status === 'active'
              currentPrice = pkg.discount_price || pkg.price
              discountAvailable = pkg.discount_price !== null
            }
          } else if (item.item_type === 'teacher') {
            const { data: teacher } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', item.item_id)
              .single()

            if (teacher) {
              itemDetails = teacher
              isAvailable = teacher.is_active
            }
          }
        } catch (error) {
          logger.error('Error enhancing wishlist item:', error)
        }

        return {
          ...item,
          item_details: itemDetails,
          is_available: isAvailable,
          current_price: currentPrice,
          discount_available: discountAvailable,
        }
      })
    )

    return enhanced
  }

  /**
   * Add favorite teacher
   */
  async addFavoriteTeacher(
    input: AddFavoriteTeacherInput
  ): Promise<{ data: FavoriteTeacher | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('add_favorite_teacher', {
        p_user_id: input.user_id,
        p_teacher_id: input.teacher_id,
        p_teacher_name: input.teacher_name,
        p_teacher_specialization: input.teacher_specialization || null,
        p_notes: input.notes || null,
      })

      if (error) throw error

      // Fetch the created/updated favorite
      const { data: favorite, error: fetchError } = await supabase
        .from('favorite_teachers')
        .select('*')
        .eq('id', data)
        .single()

      if (fetchError) throw fetchError

      logger.log('Teacher added to favorites:', input.teacher_id)
      return { data: favorite as FavoriteTeacher, error: null }
    } catch (error) {
      logger.error('Error adding favorite teacher:', error)
      return { data: null, error }
    }
  }

  /**
   * Remove favorite teacher
   */
  async removeFavoriteTeacher(
    userId: string,
    teacherId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('favorite_teachers')
        .delete()
        .eq('user_id', userId)
        .eq('teacher_id', teacherId)

      if (error) throw error

      logger.log('Teacher removed from favorites:', teacherId)
      return { success: true, error: null }
    } catch (error) {
      logger.error('Error removing favorite teacher:', error)
      return { success: false, error }
    }
  }

  /**
   * Get user's favorite teachers
   */
  async getFavoriteTeachers(
    userId: string
  ): Promise<{ data: FavoriteTeacherWithDetails[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('favorite_teachers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Enhance with teacher details
      const enhanced = await Promise.all(
        (data as FavoriteTeacher[]).map(async (fav) => {
          try {
            const { data: teacher } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', fav.teacher_id)
              .single()

            return {
              ...fav,
              teacher_avatar: teacher?.avatar_url,
              teacher_rating: teacher?.rating || 0,
              teacher_total_classes: teacher?.total_classes || 0,
              teacher_available_slots: 0, // TODO: Calculate from schedule
              is_online: teacher?.is_online || false,
            }
          } catch (error) {
            return {
              ...fav,
              teacher_avatar: undefined,
              teacher_rating: 0,
              teacher_total_classes: 0,
              teacher_available_slots: 0,
              is_online: false,
            }
          }
        })
      )

      return { data: enhanced, error: null }
    } catch (error) {
      logger.error('Error fetching favorite teachers:', error)
      return { data: [], error }
    }
  }

  /**
   * Check if teacher is favorited
   */
  async isTeacherFavorited(userId: string, teacherId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorite_teachers')
        .select('id')
        .eq('user_id', userId)
        .eq('teacher_id', teacherId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data !== null
    } catch (error) {
      logger.error('Error checking favorite teacher:', error)
      return false
    }
  }

  /**
   * Save time slot
   */
  async saveTimeslot(
    input: SaveTimeslotInput
  ): Promise<{ data: SavedTimeslot | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('save_timeslot', {
        p_user_id: input.user_id,
        p_teacher_id: input.teacher_id || null,
        p_day_of_week: input.day_of_week,
        p_start_time: input.start_time,
        p_end_time: input.end_time,
        p_timezone: input.timezone || 'Asia/Riyadh',
        p_is_recurring: input.is_recurring !== false,
        p_notes: input.notes || null,
      })

      if (error) throw error

      // Fetch the created timeslot
      const { data: timeslot, error: fetchError } = await supabase
        .from('saved_timeslots')
        .select('*')
        .eq('id', data)
        .single()

      if (fetchError) throw fetchError

      logger.log('Timeslot saved:', data)
      return { data: timeslot as SavedTimeslot, error: null }
    } catch (error) {
      logger.error('Error saving timeslot:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete saved timeslot
   */
  async deleteTimeslot(timeslotId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from('saved_timeslots').delete().eq('id', timeslotId)

      if (error) throw error

      logger.log('Timeslot deleted:', timeslotId)
      return { success: true, error: null }
    } catch (error) {
      logger.error('Error deleting timeslot:', error)
      return { success: false, error }
    }
  }

  /**
   * Get user's saved timeslots
   */
  async getSavedTimeslots(
    userId: string,
    teacherId?: string
  ): Promise<{ data: SavedTimeslotWithDetails[]; error: any }> {
    try {
      let query = supabase.from('saved_timeslots').select('*').eq('user_id', userId)

      if (teacherId) {
        query = query.eq('teacher_id', teacherId)
      }

      query = query.order('day_of_week', { ascending: true })
      query = query.order('start_time', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      // Enhance with teacher details and next occurrence
      const enhanced = await Promise.all(
        (data as SavedTimeslot[]).map(async (slot) => {
          let teacherName = undefined
          let teacherAvatar = undefined

          if (slot.teacher_id) {
            try {
              const { data: teacher } = await supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', slot.teacher_id)
                .single()

              if (teacher) {
                teacherName = teacher.name
                teacherAvatar = teacher.avatar_url
              }
            } catch (error) {
              // Ignore error
            }
          }

          // Calculate next occurrence
          const nextOccurrence = this.calculateNextOccurrence(
            slot.day_of_week,
            slot.start_time,
            slot.timezone
          )

          return {
            ...slot,
            teacher_name: teacherName,
            teacher_avatar: teacherAvatar,
            is_available: true, // TODO: Check actual availability
            next_occurrence: nextOccurrence,
          }
        })
      )

      return { data: enhanced, error: null }
    } catch (error) {
      logger.error('Error fetching saved timeslots:', error)
      return { data: [], error }
    }
  }

  /**
   * Calculate next occurrence of a timeslot
   */
  private calculateNextOccurrence(
    dayOfWeek: number,
    startTime: string,
    timezone: string
  ): Date {
    const now = new Date()
    const currentDay = now.getDay()
    let daysUntil = dayOfWeek - currentDay

    if (daysUntil < 0) {
      daysUntil += 7
    } else if (daysUntil === 0) {
      // Check if time has passed today
      const [hours, minutes] = startTime.split(':').map(Number)
      const slotTime = new Date(now)
      slotTime.setHours(hours, minutes, 0, 0)

      if (slotTime <= now) {
        daysUntil = 7
      }
    }

    const nextDate = new Date(now)
    nextDate.setDate(now.getDate() + daysUntil)

    const [hours, minutes] = startTime.split(':').map(Number)
    nextDate.setHours(hours, minutes, 0, 0)

    return nextDate
  }

  /**
   * Create wishlist share
   */
  async createWishlistShare(
    input: CreateWishlistShareInput
  ): Promise<{ data: WishlistShareResult | null; error: any }> {
    try {
      // Create the share
      const { data: shareData, error: shareError } = await supabase.rpc(
        'create_wishlist_share',
        {
          p_user_id: input.user_id,
          p_share_name: input.share_name,
          p_share_name_ar: input.share_name_ar,
          p_description: input.description || null,
          p_description_ar: input.description_ar || null,
          p_is_public: input.is_public || false,
          p_expires_days: input.expires_days || null,
        }
      )

      if (shareError) throw shareError

      const result = shareData[0] as WishlistShareResult

      // Add items to the share
      if (input.wishlist_item_ids.length > 0) {
        const shareItems = input.wishlist_item_ids.map((itemId, index) => ({
          share_id: result.share_id,
          wishlist_item_id: itemId,
          display_order: index,
        }))

        const { error: itemsError } = await supabase
          .from('wishlist_share_items')
          .insert(shareItems)

        if (itemsError) throw itemsError
      }

      logger.log('Wishlist share created:', result.share_id)
      return { data: result, error: null }
    } catch (error) {
      logger.error('Error creating wishlist share:', error)
      return { data: null, error }
    }
  }

  /**
   * Get shared wishlist
   */
  async getSharedWishlist(
    shareToken: string
  ): Promise<{ data: SharedWishlistView | null; error: any }> {
    try {
      // Get share details
      const { data: share, error: shareError } = await supabase
        .from('wishlist_shares')
        .select('*')
        .eq('share_token', shareToken)
        .single()

      if (shareError) throw shareError

      const wishlistShare = share as WishlistShare

      // Check if expired
      const isExpired =
        wishlistShare.expires_at !== null && new Date(wishlistShare.expires_at) < new Date()

      if (isExpired && !wishlistShare.is_public) {
        return {
          data: null,
          error: { message: 'This shared wishlist has expired' },
        }
      }

      // Increment view count
      await supabase
        .from('wishlist_shares')
        .update({ view_count: wishlistShare.view_count + 1 })
        .eq('id', wishlistShare.id)

      // Get share items
      const { data: shareItems, error: itemsError } = await supabase
        .from('wishlist_share_items')
        .select('wishlist_item_id')
        .eq('share_id', wishlistShare.id)
        .order('display_order', { ascending: true })

      if (itemsError) throw itemsError

      // Get wishlist items
      const itemIds = (shareItems as WishlistShareItem[]).map((si) => si.wishlist_item_id)

      if (itemIds.length === 0) {
        return {
          data: {
            share: wishlistShare,
            items: [],
            is_expired: isExpired,
          },
          error: null,
        }
      }

      const { data: items, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .in('id', itemIds)

      if (wishlistError) throw wishlistError

      // Enhance items
      const enhancedItems = await this.enhanceWishlistItems(items as WishlistItem[])

      // Get owner name
      const { data: owner } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', wishlistShare.user_id)
        .single()

      return {
        data: {
          share: wishlistShare,
          items: enhancedItems,
          owner_name: owner?.name,
          is_expired: isExpired,
        },
        error: null,
      }
    } catch (error) {
      logger.error('Error fetching shared wishlist:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user's wishlist shares
   */
  async getUserWishlistShares(
    userId: string
  ): Promise<{ data: WishlistShare[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist_shares')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data as WishlistShare[], error: null }
    } catch (error) {
      logger.error('Error fetching user wishlist shares:', error)
      return { data: [], error }
    }
  }

  /**
   * Delete wishlist share
   */
  async deleteWishlistShare(shareId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from('wishlist_shares').delete().eq('id', shareId)

      if (error) throw error

      logger.log('Wishlist share deleted:', shareId)
      return { success: true, error: null }
    } catch (error) {
      logger.error('Error deleting wishlist share:', error)
      return { success: false, error }
    }
  }

  /**
   * Record wishlist conversion
   */
  async recordConversion(
    wishlistItemId: string,
    purchaseId?: string
  ): Promise<{ data: WishlistConversion | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('record_wishlist_conversion', {
        p_wishlist_item_id: wishlistItemId,
        p_purchase_id: purchaseId || null,
      })

      if (error) throw error

      // Fetch the created conversion
      const { data: conversion, error: fetchError } = await supabase
        .from('wishlist_conversions')
        .select('*')
        .eq('id', data)
        .single()

      if (fetchError) throw fetchError

      logger.log('Wishlist conversion recorded:', data)
      return { data: conversion as WishlistConversion, error: null }
    } catch (error) {
      logger.error('Error recording wishlist conversion:', error)
      return { data: null, error }
    }
  }

  /**
   * Get wishlist statistics
   */
  async getWishlistStats(userId: string): Promise<{ data: WishlistStats | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_wishlist_stats', {
        p_user_id: userId,
      })

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          data: {
            total_items: 0,
            items_by_type: {} as Record<WishlistItemType, number>,
            gift_items: 0,
            high_priority_items: 0,
            items_with_reminders: 0,
            avg_days_in_wishlist: 0,
          },
          error: null,
        }
      }

      return { data: data[0] as WishlistStats, error: null }
    } catch (error) {
      logger.error('Error fetching wishlist stats:', error)
      return { data: null, error }
    }
  }

  /**
   * Get pending wishlist reminders
   */
  async getPendingReminders(): Promise<{ data: WishlistNotification[]; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_pending_wishlist_reminders')

      if (error) throw error

      return { data: (data || []) as WishlistNotification[], error: null }
    } catch (error) {
      logger.error('Error fetching pending reminders:', error)
      return { data: [], error }
    }
  }

  /**
   * Mark notification as sent
   */
  async markNotificationSent(notificationId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('wishlist_notifications')
        .update({ is_sent: true, sent_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error

      return { success: true, error: null }
    } catch (error) {
      logger.error('Error marking notification as sent:', error)
      return { success: false, error }
    }
  }

  /**
   * Convert wishlist to cart/booking
   */
  async convertWishlistToCart(
    userId: string,
    wishlistItemIds: string[]
  ): Promise<{ success: boolean; items: any[]; error: any }> {
    try {
      const { data: items, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userId)
        .in('id', wishlistItemIds)

      if (error) throw error

      // Group items by type for processing
      const packages = items.filter((item) => item.item_type === 'package')
      const teachers = items.filter((item) => item.item_type === 'teacher')

      // Return items for cart processing
      return {
        success: true,
        items: items as WishlistItem[],
        error: null,
      }
    } catch (error) {
      logger.error('Error converting wishlist to cart:', error)
      return { success: false, items: [], error }
    }
  }
}

export const wishlistService = new WishlistService()
export default wishlistService
