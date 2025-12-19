/**
 * useSubscriptionSync Hook
 * 
 * React hook for subscribing to real-time subscription changes.
 * Automatically handles subscription/unsubscription on mount/unmount.
 * 
 * @example
 * ```typescript
 * function SubscriptionPage() {
 *   const { user } = useAuth()
 *   const [subscription, setSubscription] = useState(null)
 * 
 *   useSubscriptionSync(user?.id, (change) => {
 *     console.log('Subscription changed:', change.type)
 *     // Refetch subscription data
 *     refetchSubscription()
 *   })
 * 
 *   return <div>...</div>
 * }
 * ```
 */

import { useEffect, useRef } from 'react'
import { subscribeToSubscriptionChanges, type SubscriptionChangeCallback } from '@/lib/services/subscription-sync-service'
import { logger } from '@/lib/logger'

export interface UseSubscriptionSyncOptions {
  /**
   * Whether to enable the subscription sync
   * @default true
   */
  enabled?: boolean

  /**
   * Callback to execute when subscription changes
   */
  onSubscriptionChange?: SubscriptionChangeCallback

  /**
   * Callback to execute when discount is applied
   */
  onDiscountApplied?: (data: any) => void

  /**
   * Callback to execute when discount is removed
   */
  onDiscountRemoved?: (data: any) => void

  /**
   * Callback to execute when cancellation is requested
   */
  onCancellationRequested?: (data: any) => void

  /**
   * Callback to execute when cancellation is cancelled
   */
  onCancellationCancelled?: (data: any) => void

  /**
   * Callback to execute when cancellation is completed
   */
  onCancellationCompleted?: (data: any) => void
}

/**
 * Hook for subscribing to real-time subscription changes
 * 
 * @param userId - The user's unique identifier
 * @param options - Configuration options and callbacks
 * @returns void
 */
export function useSubscriptionSync(
  userId: string | undefined,
  options: UseSubscriptionSyncOptions = {}
): void {
  const {
    enabled = true,
    onSubscriptionChange,
    onDiscountApplied,
    onDiscountRemoved,
    onCancellationRequested,
    onCancellationCancelled,
    onCancellationCompleted
  } = options

  // Use refs to avoid re-subscribing when callbacks change
  const callbacksRef = useRef({
    onSubscriptionChange,
    onDiscountApplied,
    onDiscountRemoved,
    onCancellationRequested,
    onCancellationCancelled,
    onCancellationCompleted
  })

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onSubscriptionChange,
      onDiscountApplied,
      onDiscountRemoved,
      onCancellationRequested,
      onCancellationCancelled,
      onCancellationCompleted
    }
  }, [
    onSubscriptionChange,
    onDiscountApplied,
    onDiscountRemoved,
    onCancellationRequested,
    onCancellationCancelled,
    onCancellationCompleted
  ])

  useEffect(() => {
    // Don't subscribe if disabled or no user ID
    if (!enabled || !userId) {
      return
    }

    logger.log('Setting up subscription sync', { userId })

    // Subscribe to changes
    const unsubscribe = subscribeToSubscriptionChanges(userId, (change) => {
      logger.log('Subscription change received', { type: change.type, userId })

      // Call the general callback
      if (callbacksRef.current.onSubscriptionChange) {
        callbacksRef.current.onSubscriptionChange(change)
      }

      // Call specific callbacks based on change type
      switch (change.type) {
        case 'discount_applied':
          if (callbacksRef.current.onDiscountApplied) {
            callbacksRef.current.onDiscountApplied(change.data)
          }
          break

        case 'discount_removed':
          if (callbacksRef.current.onDiscountRemoved) {
            callbacksRef.current.onDiscountRemoved(change.data)
          }
          break

        case 'cancellation_requested':
          if (callbacksRef.current.onCancellationRequested) {
            callbacksRef.current.onCancellationRequested(change.data)
          }
          break

        case 'cancellation_cancelled':
          if (callbacksRef.current.onCancellationCancelled) {
            callbacksRef.current.onCancellationCancelled(change.data)
          }
          break

        case 'cancellation_completed':
          if (callbacksRef.current.onCancellationCompleted) {
            callbacksRef.current.onCancellationCompleted(change.data)
          }
          break
      }
    })

    // Cleanup on unmount
    return () => {
      logger.log('Cleaning up subscription sync', { userId })
      unsubscribe()
    }
  }, [userId, enabled])
}

/**
 * Simplified hook that just refetches data on any change
 * 
 * @param userId - The user's unique identifier
 * @param refetchFn - Function to call when subscription changes
 * @param enabled - Whether to enable the subscription sync
 * 
 * @example
 * ```typescript
 * function SubscriptionPage() {
 *   const { user } = useAuth()
 *   const { data, refetch } = useQuery(['subscription'], fetchSubscription)
 * 
 *   useSubscriptionSyncRefetch(user?.id, refetch)
 * 
 *   return <div>...</div>
 * }
 * ```
 */
export function useSubscriptionSyncRefetch(
  userId: string | undefined,
  refetchFn: () => void,
  enabled: boolean = true
): void {
  useSubscriptionSync(userId, {
    enabled,
    onSubscriptionChange: () => {
      logger.log('Subscription changed, refetching data')
      refetchFn()
    }
  })
}
