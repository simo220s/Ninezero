/**
 * Wishlist and Favorites System Types
 * 
 * Type definitions for wishlist, favorites, and saved timeslots
 * Task 13: Implement Wishlist and Favorites System
 */

export type WishlistItemType = 'teacher' | 'package' | 'timeslot' | 'course'
export type NotificationType = 'reminder' | 'price_drop' | 'availability' | 'expiring_soon'

export interface WishlistItem {
  id: string
  user_id: string
  item_type: WishlistItemType
  item_id: string
  item_name?: string
  item_name_ar?: string
  notes?: string
  priority: number // 0-5, where 5 is highest
  is_gift: boolean
  gift_recipient_name?: string
  gift_recipient_email?: string
  reminder_enabled: boolean
  reminder_date?: Date
  created_at: Date
  updated_at: Date
}

export interface FavoriteTeacher {
  id: string
  user_id: string
  teacher_id: string
  teacher_name: string
  teacher_specialization?: string
  notes?: string
  notification_enabled: boolean
  created_at: Date
}

export interface SavedTimeslot {
  id: string
  user_id: string
  teacher_id?: string
  day_of_week: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  timezone: string
  is_recurring: boolean
  notes?: string
  created_at: Date
}

export interface WishlistShare {
  id: string
  user_id: string
  share_token: string
  share_name: string
  share_name_ar: string
  description?: string
  description_ar?: string
  is_public: boolean
  expires_at?: Date
  view_count: number
  created_at: Date
  updated_at: Date
}

export interface WishlistShareItem {
  id: string
  share_id: string
  wishlist_item_id: string
  display_order: number
  created_at: Date
}

export interface WishlistNotification {
  id: string
  wishlist_item_id: string
  user_id: string
  notification_type: NotificationType
  notification_message: string
  notification_message_ar: string
  is_sent: boolean
  sent_at?: Date
  scheduled_for?: Date
  created_at: Date
}

export interface WishlistConversion {
  id: string
  wishlist_item_id?: string
  user_id: string
  item_type: WishlistItemType
  item_id: string
  purchase_id?: string
  conversion_date: Date
  days_in_wishlist?: number
  notes?: string
}

export interface WishlistStats {
  total_items: number
  items_by_type: Record<WishlistItemType, number>
  gift_items: number
  high_priority_items: number
  items_with_reminders: number
  avg_days_in_wishlist: number
}

export interface AddToWishlistInput {
  user_id: string
  item_type: WishlistItemType
  item_id: string
  item_name?: string
  item_name_ar?: string
  notes?: string
  priority?: number
  is_gift?: boolean
  gift_recipient_name?: string
  gift_recipient_email?: string
}

export interface UpdateWishlistItemInput {
  id: string
  notes?: string
  priority?: number
  is_gift?: boolean
  gift_recipient_name?: string
  gift_recipient_email?: string
  reminder_enabled?: boolean
  reminder_date?: Date
}

export interface AddFavoriteTeacherInput {
  user_id: string
  teacher_id: string
  teacher_name: string
  teacher_specialization?: string
  notes?: string
  notification_enabled?: boolean
}

export interface SaveTimeslotInput {
  user_id: string
  teacher_id?: string
  day_of_week: number
  start_time: string
  end_time: string
  timezone?: string
  is_recurring?: boolean
  notes?: string
}

export interface CreateWishlistShareInput {
  user_id: string
  share_name: string
  share_name_ar: string
  description?: string
  description_ar?: string
  is_public?: boolean
  expires_days?: number
  wishlist_item_ids: string[]
}

export interface WishlistShareResult {
  share_id: string
  share_token: string
  share_url: string
}

export interface WishlistFilter {
  item_type?: WishlistItemType
  is_gift?: boolean
  priority_min?: number
  has_reminder?: boolean
  search?: string
}

export interface WishlistItemWithDetails extends WishlistItem {
  item_details?: any // Package, Teacher, or Course details
  is_available?: boolean
  current_price?: number
  discount_available?: boolean
}

export interface FavoriteTeacherWithDetails extends FavoriteTeacher {
  teacher_avatar?: string
  teacher_rating?: number
  teacher_total_classes?: number
  teacher_available_slots?: number
  is_online?: boolean
}

export interface SavedTimeslotWithDetails extends SavedTimeslot {
  teacher_name?: string
  teacher_avatar?: string
  is_available?: boolean
  next_occurrence?: Date
}

export interface SharedWishlistView {
  share: WishlistShare
  items: WishlistItemWithDetails[]
  owner_name?: string
  is_expired: boolean
}

export interface WishlistConversionStats {
  total_conversions: number
  conversion_rate: number
  avg_days_to_conversion: number
  conversions_by_type: Record<WishlistItemType, number>
  total_revenue_from_conversions: number
}

export interface WishlistReminderSettings {
  enabled: boolean
  reminder_days_before: number[]
  notification_channels: ('email' | 'sms' | 'whatsapp' | 'push')[]
  quiet_hours_start?: string
  quiet_hours_end?: string
}

export interface GiftWishlistItem extends WishlistItem {
  gift_message?: string
  gift_message_ar?: string
  gift_occasion?: string
  gift_budget?: number
}

