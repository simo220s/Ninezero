/**
 * Subscription Sync Service
 * 
 * Provides real-time synchronization of subscription changes across multiple
 * browser sessions and devices using Supabase Realtime.
 * 
 * Features:
 * - Real-time subscription updates
 * - Real-time discount updates
 * - Real-time cancellation status updates
 * - Automatic reconnection on connection failures (via realtime manager)
 * - Event-based notification system
 * - Centralized subscription management
 */

import { realtimeManager } from '@/lib/supabase/realtime-manager'
import { logger } from '@/lib/utils/logger'

// ============================================================================
// Type Definitions
// ============================================================================

export type SubscriptionChangeType = 
  | 'subscription_updated'
  | 'discount_applied'
  | 'discount_removed'
  | 'cancellation_requested'
  | 'cancellation_cancelled'
  | 'cancellation_completed'

export interface SubscriptionChange {
  type: SubscriptionChangeType
  userId: string
  subscriptionId: string
  timestamp: string
  data: any
}

export type SubscriptionChangeCallback = (change: SubscriptionChange) => void

// ============================================================================
// Subscription Sync Manager
// ============================================================================

class SubscriptionSyncManager {
  private unsubscribeFunctions: Map<string, Set<() => void>> = new Map()
  private callbacks: Map<string, Set<SubscriptionChangeCallback>> = new Map()

  /**
   * Subscribe to real-time subscription changes for a user
   */
  subscribeToUserSubscription(
    userId: string,
    callback: SubscriptionChangeCallback
  ): () => void {
    logger.info('Subscribing to subscription changes', {
      component: 'SubscriptionSyncManager',
      metadata: { userId },
    })

    // Store callback
    if (!this.callbacks.has(userId)) {
      this.callbacks.set(userId, new Set())
    }
    this.callbacks.get(userId)!.add(callback)

    // Create subscriptions if they don't exist
    if (!this.unsubscribeFunctions.has(userId)) {
      this.createSubscriptions(userId)
    }

    // Return unsubscribe function
    return () => this.unsubscribe(userId, callback)
  }

  /**
   * Create realtime subscriptions using the realtime manager
   */
  private createSubscriptions(userId: string): void {
    try {
      const unsubscribeFns = new Set<() => void>()

      // Subscribe to subscriptions table
      const unsubscribeSubscriptions = realtimeManager.subscribe(
        `subscription-sync:subscriptions:${userId}`,
        (payload: any) => this.handleSubscriptionChange(userId, payload),
        {
          table: 'subscriptions',
          event: '*',
          filter: `user_id=eq.${userId}`,
          autoReconnect: true,
          maxReconnectAttempts: 5,
          reconnectDelay: 2000,
          onError: (error: Error) => {
            logger.error('Subscription sync error (subscriptions table)', error, {
              component: 'SubscriptionSyncManager',
              metadata: { userId },
            })
          },
        }
      )
      unsubscribeFns.add(unsubscribeSubscriptions)

      // Subscribe to subscription_discounts table
      const unsubscribeDiscounts = realtimeManager.subscribe(
        `subscription-sync:discounts:${userId}`,
        (payload: any) => this.handleDiscountChange(userId, payload),
        {
          table: 'subscription_discounts',
          event: '*',
          filter: `user_id=eq.${userId}`,
          autoReconnect: true,
          maxReconnectAttempts: 5,
          reconnectDelay: 2000,
          onError: (error: Error) => {
            logger.error('Subscription sync error (discounts table)', error, {
              component: 'SubscriptionSyncManager',
              metadata: { userId },
            })
          },
        }
      )
      unsubscribeFns.add(unsubscribeDiscounts)

      // Subscribe to cancellation_requests table
      const unsubscribeCancellations = realtimeManager.subscribe(
        `subscription-sync:cancellations:${userId}`,
        (payload: any) => this.handleCancellationChange(userId, payload),
        {
          table: 'cancellation_requests',
          event: '*',
          filter: `user_id=eq.${userId}`,
          autoReconnect: true,
          maxReconnectAttempts: 5,
          reconnectDelay: 2000,
          onError: (error: Error) => {
            logger.error('Subscription sync error (cancellations table)', error, {
              component: 'SubscriptionSyncManager',
              metadata: { userId },
            })
          },
        }
      )
      unsubscribeFns.add(unsubscribeCancellations)

      this.unsubscribeFunctions.set(userId, unsubscribeFns)

      logger.info('Successfully created subscription sync subscriptions', {
        component: 'SubscriptionSyncManager',
        metadata: { userId },
      })
    } catch (error) {
      logger.error('Error creating subscription sync subscriptions', error as Error, {
        component: 'SubscriptionSyncManager',
        metadata: { userId },
      })
    }
  }

  /**
   * Handle subscription table changes
   */
  private handleSubscriptionChange(userId: string, payload: any): void {
    logger.debug('Subscription change detected', {
      component: 'SubscriptionSyncManager',
      metadata: { userId, eventType: payload.eventType },
    })

    const change: SubscriptionChange = {
      type: 'subscription_updated',
      userId,
      subscriptionId: payload.new?.id || payload.old?.id,
      timestamp: new Date().toISOString(),
      data: payload.new || payload.old,
    }

    this.notifyCallbacks(userId, change)
  }

  /**
   * Handle discount table changes
   */
  private handleDiscountChange(userId: string, payload: any): void {
    logger.debug('Discount change detected', {
      component: 'SubscriptionSyncManager',
      metadata: { userId, eventType: payload.eventType },
    })

    const isActive = payload.new?.is_active ?? payload.old?.is_active
    const changeType: SubscriptionChangeType =
      payload.eventType === 'DELETE' || !isActive
        ? 'discount_removed'
        : 'discount_applied'

    const change: SubscriptionChange = {
      type: changeType,
      userId,
      subscriptionId: payload.new?.subscription_id || payload.old?.subscription_id,
      timestamp: new Date().toISOString(),
      data: payload.new || payload.old,
    }

    this.notifyCallbacks(userId, change)
  }

  /**
   * Handle cancellation request changes
   */
  private handleCancellationChange(userId: string, payload: any): void {
    logger.debug('Cancellation change detected', {
      component: 'SubscriptionSyncManager',
      metadata: { userId, eventType: payload.eventType },
    })

    const status = payload.new?.status || payload.old?.status
    let changeType: SubscriptionChangeType = 'cancellation_requested'

    if (status === 'cancelled') {
      changeType = 'cancellation_cancelled'
    } else if (status === 'completed') {
      changeType = 'cancellation_completed'
    }

    const change: SubscriptionChange = {
      type: changeType,
      userId,
      subscriptionId: payload.new?.subscription_id || payload.old?.subscription_id,
      timestamp: new Date().toISOString(),
      data: payload.new || payload.old,
    }

    this.notifyCallbacks(userId, change)
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(userId: string, change: SubscriptionChange): void {
    const callbacks = this.callbacks.get(userId)
    if (!callbacks) return

    callbacks.forEach((callback) => {
      try {
        callback(change)
      } catch (error) {
        logger.error('Error in subscription change callback', error as Error, {
          component: 'SubscriptionSyncManager',
          metadata: { userId },
        })
      }
    })
  }

  /**
   * Unsubscribe a specific callback
   */
  private unsubscribe(userId: string, callback: SubscriptionChangeCallback): void {
    logger.info('Unsubscribing from subscription changes', {
      component: 'SubscriptionSyncManager',
      metadata: { userId },
    })

    const callbacks = this.callbacks.get(userId)
    if (callbacks) {
      callbacks.delete(callback)

      // If no more callbacks, cleanup the subscriptions
      if (callbacks.size === 0) {
        this.cleanup(userId)
      }
    }
  }

  /**
   * Cleanup subscriptions and callbacks for a user
   */
  private cleanup(userId: string): void {
    logger.info('Cleaning up subscription sync', {
      component: 'SubscriptionSyncManager',
      metadata: { userId },
    })

    // Remove callbacks
    this.callbacks.delete(userId)

    // Unsubscribe from all realtime subscriptions
    const unsubscribeFns = this.unsubscribeFunctions.get(userId)
    if (unsubscribeFns) {
      unsubscribeFns.forEach((unsubscribe) => unsubscribe())
      this.unsubscribeFunctions.delete(userId)
    }
  }

  /**
   * Cleanup all subscriptions (call on app unmount)
   */
  cleanupAll(): void {
    logger.info('Cleaning up all subscription sync subscriptions', {
      component: 'SubscriptionSyncManager',
    })

    const userIds = Array.from(this.unsubscribeFunctions.keys())
    userIds.forEach((userId) => this.cleanup(userId))
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const subscriptionSyncManager = new SubscriptionSyncManager()

// ============================================================================
// Public API
// ============================================================================

/**
 * Subscribe to real-time subscription changes for a user
 * 
 * @param userId - The user's unique identifier
 * @param callback - Function to call when subscription changes occur
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * const unsubscribe = subscribeToSubscriptionChanges(userId, (change) => {
 *   console.log('Subscription changed:', change)
 *   // Update UI, refetch data, show notification, etc.
 * })
 * 
 * // Later, when component unmounts:
 * unsubscribe()
 * ```
 */
export function subscribeToSubscriptionChanges(
  userId: string,
  callback: SubscriptionChangeCallback
): () => void {
  return subscriptionSyncManager.subscribeToUserSubscription(userId, callback)
}

/**
 * Cleanup all subscription sync subscriptions
 * Call this when the app is unmounting or user logs out
 */
export function cleanupSubscriptionSync(): void {
  subscriptionSyncManager.cleanupAll()
}

// ============================================================================
// Exports
// ============================================================================

export default {
  subscribeToSubscriptionChanges,
  cleanupSubscriptionSync
}
