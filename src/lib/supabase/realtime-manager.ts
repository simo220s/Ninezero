/**
 * Supabase Realtime Subscription Manager
 * 
 * Provides centralized management of realtime subscriptions with:
 * - Automatic cleanup on unmount
 * - Reconnection logic
 * - Error handling
 * - Subscription tracking
 */

import { type RealtimeChannel, type RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logger } from '../utils/logger'
import { errorService } from '../services/error-service'
import { connectionManager, ConnectionStatusEnum } from './connection-manager'
import type { ConnectionStatus } from './connection-manager'

/**
 * Subscription callback type
 */
export type RealtimeCallback<T extends Record<string, any> = Record<string, any>> = (
  payload: RealtimePostgresChangesPayload<T>
) => void

/**
 * Subscription options
 */
export interface RealtimeSubscriptionOptions {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  schema?: string
  filter?: string
  onError?: (error: Error) => void
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectDelay?: number
}

/**
 * Subscription metadata
 */
interface SubscriptionMetadata {
  channel: RealtimeChannel
  options: RealtimeSubscriptionOptions
  callback: RealtimeCallback<any>
  reconnectAttempts: number
  isActive: boolean
}

/**
 * Realtime Subscription Manager
 */
class RealtimeManager {
  private subscriptions: Map<string, SubscriptionMetadata> = new Map()
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    // Listen to connection status changes
    connectionManager.onStatusChange((status) => {
      if (status === ConnectionStatusEnum.CONNECTED) {
        this.handleReconnection()
      } else if (status === ConnectionStatusEnum.ERROR) {
        this.handleDisconnection()
      }
    })
  }

  /**
   * Subscribe to realtime changes
   */
  subscribe<T extends Record<string, any> = Record<string, any>>(
    subscriptionId: string,
    callback: RealtimeCallback<T>,
    options: RealtimeSubscriptionOptions
  ): () => void {
    // Check if subscription already exists
    if (this.subscriptions.has(subscriptionId)) {
      logger.warn('Subscription already exists, cleaning up old subscription', {
        component: 'RealtimeManager',
        metadata: { subscriptionId },
      })
      this.unsubscribe(subscriptionId)
    }

    logger.info('Creating realtime subscription', {
      component: 'RealtimeManager',
      metadata: {
        subscriptionId,
        table: options.table,
        event: options.event || '*',
      },
    })

    // Create channel
    const channel = this.createChannel(subscriptionId, callback, options)

    // Store subscription metadata
    this.subscriptions.set(subscriptionId, {
      channel,
      options,
      callback,
      reconnectAttempts: 0,
      isActive: true,
    })

    // Subscribe to channel
    this.subscribeChannel(subscriptionId, channel, options)

    // Return unsubscribe function
    return () => this.unsubscribe(subscriptionId)
  }

  /**
   * Create a realtime channel
   */
  private createChannel<T extends Record<string, any>>(
    subscriptionId: string,
    callback: RealtimeCallback<T>,
    options: RealtimeSubscriptionOptions
  ): RealtimeChannel {
    const channelName = `${options.table}:${subscriptionId}`

    const channel = supabase.channel(channelName)

    // Configure postgres changes listener
    channel.on(
      'postgres_changes' as any,
      {
        event: options.event || '*',
        schema: options.schema || 'public',
        table: options.table,
        filter: options.filter,
      } as any,
      (payload: any) => {
        logger.debug('Realtime event received', {
          component: 'RealtimeManager',
          metadata: {
            subscriptionId,
            event: payload.eventType,
            table: options.table,
          },
        })

        try {
          callback(payload as RealtimePostgresChangesPayload<T>)
        } catch (error) {
          logger.error('Error in realtime callback', error as Error, {
            component: 'RealtimeManager',
            metadata: { subscriptionId },
          })

          if (options.onError) {
            options.onError(error as Error)
          }
        }
      }
    )

    return channel
  }

  /**
   * Subscribe to a channel
   */
  private subscribeChannel(
    subscriptionId: string,
    channel: RealtimeChannel,
    options: RealtimeSubscriptionOptions
  ): void {
    channel.subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        logger.info('Realtime subscription active', {
          component: 'RealtimeManager',
          metadata: { subscriptionId },
        })

        // Reset reconnect attempts on successful subscription
        const metadata = this.subscriptions.get(subscriptionId)
        if (metadata) {
          metadata.reconnectAttempts = 0
        }
      } else if (status === 'CLOSED') {
        logger.info('Realtime subscription closed', {
          component: 'RealtimeManager',
          metadata: { subscriptionId },
        })
      } else if (status === 'CHANNEL_ERROR') {
        logger.error('Realtime subscription error', error, {
          component: 'RealtimeManager',
          metadata: { subscriptionId },
        })

        if (options.onError) {
          options.onError(error || new Error('Channel error'))
        }

        // Attempt reconnection if enabled
        if (options.autoReconnect !== false) {
          this.scheduleReconnect(subscriptionId)
        }
      } else if (status === 'TIMED_OUT') {
        logger.warn('Realtime subscription timed out', {
          component: 'RealtimeManager',
          metadata: { subscriptionId },
        })

        // Attempt reconnection if enabled
        if (options.autoReconnect !== false) {
          this.scheduleReconnect(subscriptionId)
        }
      }
    })
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(subscriptionId: string): void {
    const metadata = this.subscriptions.get(subscriptionId)
    if (!metadata || !metadata.isActive) return

    const maxAttempts = metadata.options.maxReconnectAttempts || 5
    const delay = metadata.options.reconnectDelay || 2000

    if (metadata.reconnectAttempts >= maxAttempts) {
      logger.error('Max reconnection attempts reached', undefined, {
        component: 'RealtimeManager',
        metadata: {
          subscriptionId,
          attempts: metadata.reconnectAttempts,
        },
      })

      errorService.showError(
        'فشل إعادة الاتصال بالتحديثات المباشرة. يرجى تحديث الصفحة.'
      )

      return
    }

    // Clear existing timer
    const existingTimer = this.reconnectTimers.get(subscriptionId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Schedule reconnection
    const timer = setTimeout(() => {
      this.attemptReconnect(subscriptionId)
    }, delay)

    this.reconnectTimers.set(subscriptionId, timer)
  }

  /**
   * Attempt to reconnect a subscription
   */
  private async attemptReconnect(subscriptionId: string): Promise<void> {
    const metadata = this.subscriptions.get(subscriptionId)
    if (!metadata || !metadata.isActive) return

    metadata.reconnectAttempts++

    logger.info('Attempting to reconnect subscription', {
      component: 'RealtimeManager',
      metadata: {
        subscriptionId,
        attempt: metadata.reconnectAttempts,
      },
    })

    // Remove old channel
    await supabase.removeChannel(metadata.channel)

    // Create new channel
    const newChannel = this.createChannel(
      subscriptionId,
      metadata.callback,
      metadata.options
    )

    // Update metadata
    metadata.channel = newChannel

    // Subscribe to new channel
    this.subscribeChannel(subscriptionId, newChannel, metadata.options)
  }

  /**
   * Unsubscribe from a subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const metadata = this.subscriptions.get(subscriptionId)
    if (!metadata) return

    logger.info('Unsubscribing from realtime', {
      component: 'RealtimeManager',
      metadata: { subscriptionId },
    })

    // Mark as inactive
    metadata.isActive = false

    // Clear reconnect timer
    const timer = this.reconnectTimers.get(subscriptionId)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(subscriptionId)
    }

    // Remove channel
    await supabase.removeChannel(metadata.channel)

    // Remove from subscriptions
    this.subscriptions.delete(subscriptionId)
  }

  /**
   * Unsubscribe from all subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    logger.info('Unsubscribing from all realtime subscriptions', {
      component: 'RealtimeManager',
    })

    const subscriptionIds = Array.from(this.subscriptions.keys())
    await Promise.all(subscriptionIds.map(id => this.unsubscribe(id)))
  }

  /**
   * Handle connection restoration
   */
  private handleReconnection(): void {
    logger.info('Connection restored, resubscribing to realtime', {
      component: 'RealtimeManager',
    })

    // Resubscribe all active subscriptions
    this.subscriptions.forEach((metadata, subscriptionId) => {
      if (metadata.isActive) {
        this.attemptReconnect(subscriptionId)
      }
    })
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(): void {
    logger.warn('Connection lost, realtime subscriptions may be affected', {
      component: 'RealtimeManager',
    })
  }

  /**
   * Get active subscription count
   */
  getActiveSubscriptionCount(): number {
    return Array.from(this.subscriptions.values()).filter(m => m.isActive).length
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(subscriptionId: string): {
    exists: boolean
    isActive: boolean
    reconnectAttempts: number
  } | null {
    const metadata = this.subscriptions.get(subscriptionId)
    if (!metadata) return null

    return {
      exists: true,
      isActive: metadata.isActive,
      reconnectAttempts: metadata.reconnectAttempts,
    }
  }

  /**
   * Cleanup all subscriptions (call on app unmount)
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up realtime manager', {
      component: 'RealtimeManager',
    })

    await this.unsubscribeAll()

    // Clear all timers
    this.reconnectTimers.forEach(timer => clearTimeout(timer))
    this.reconnectTimers.clear()
  }
}

// Create singleton instance
export const realtimeManager = new RealtimeManager()

// Export for use in other modules
export default realtimeManager

