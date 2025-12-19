/**
 * Notification Service
 * 
 * Provides notification management with real-time updates via Supabase Realtime.
 * Integrates with backend notification system and provides frontend state management.
 * 
 * Phase 4.1 - Notification System Frontend Integration
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { executeQuery, executeMutation } from '@/lib/supabase/query-handler'
import { realtimeManager } from '@/lib/supabase/realtime-manager'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  lesson_id?: string
}

/**
 * Get all notifications for a user
 */
export async function getNotifications(userId: string): Promise<{
  data: Notification[] | null
  error: any
}> {
  const result = await executeQuery(
    async () => await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    {
      context: { userId, action: 'getNotifications' },
    }
  )

  return {
    data: result.data as Notification[] | null,
    error: result.error,
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<{
  data: number
  error: any
}> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      logger.error('Error fetching unread count:', error)
      return { data: 0, error }
    }

    return { data: count || 0, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching unread count:', err)
    return { data: 0, error: err }
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<{
  success: boolean
  error: any
}> {
  const result = await executeMutation(
    async () => await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId),
    {
      context: { notificationId, action: 'markAsRead' },
      showErrorToast: false, // Silent operation
    }
  )

  return {
    success: result.success,
    error: result.error,
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<{
  success: boolean
  error: any
}> {
  const result = await executeMutation(
    async () => await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false),
    {
      context: { userId, action: 'markAllAsRead' },
    }
  )

  return {
    success: result.success,
    error: result.error,
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<{
  success: boolean
  error: any
}> {
  const result = await executeMutation(
    async () => await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId),
    {
      context: { notificationId, action: 'deleteNotification' },
    }
  )

  return {
    success: result.success,
    error: result.error,
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: Notification) => void,
  onError?: (error: any) => void
): () => void {
  logger.log('Subscribing to real-time notifications for user:', userId)

  // Use the realtime manager for better connection handling
  return realtimeManager.subscribe(
    `notifications:${userId}`,
    (payload) => {
      if (payload.eventType === 'INSERT') {
        logger.log('New notification received:', payload)
        const notification = payload.new as Notification
        onNewNotification(notification)

        // Play notification sound (optional)
        playNotificationSound()
      } else if (payload.eventType === 'UPDATE') {
        logger.log('Notification updated:', payload)
        // Handle notification update (e.g., mark as read)
      }
    },
    {
      table: 'notifications',
      event: '*',
      filter: `user_id=eq.${userId}`,
      autoReconnect: true,
      maxReconnectAttempts: 5,
      onError,
    }
  )
}

/**
 * Unsubscribe from real-time notifications
 */
export async function unsubscribeFromNotifications(userId: string): Promise<void> {
  logger.log('Unsubscribing from real-time notifications')
  await realtimeManager.unsubscribe(`notifications:${userId}`)
}

/**
 * Play notification sound
 * Note: Safari requires user interaction before playing audio
 */
function playNotificationSound(): void {
  try {
    // Check if AudioContext is supported
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) {
      logger.log('AudioContext not supported in this browser')
      return
    }

    // Create and play a simple beep sound
    const audioContext = new AudioContextClass()
    
    // Safari requires resuming the context after user interaction
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch((err) => {
        logger.log('Could not resume audio context:', err)
      })
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    // Clean up after sound finishes
    setTimeout(() => {
      audioContext.close().catch((err) => {
        logger.log('Could not close audio context:', err)
      })
    }, 1000)
  } catch (err) {
    // Silently fail if audio context is not supported or blocked
    logger.log('Could not play notification sound:', err)
  }
}

/**
 * Send browser notification (requires permission)
 */
export async function sendBrowserNotification(notification: Notification): Promise<void> {
  if (!('Notification' in window)) {
    logger.log('Browser notifications not supported')
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png', // Add your app logo path
      tag: notification.id,
      requireInteraction: false,
    })
  } else if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
      })
    }
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission()
  }

  return Notification.permission
}

export const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  sendBrowserNotification,
  requestNotificationPermission,
}

export default notificationService
