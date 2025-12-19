/**
 * useRealtimeSubscription Hook
 * 
 * React hook for managing Supabase realtime subscriptions with automatic cleanup.
 * Wraps the realtime manager for easier use in React components.
 * 
 * @example
 * ```typescript
 * function UserList() {
 *   const [users, setUsers] = useState([])
 * 
 *   useRealtimeSubscription(
 *     'user-list',
 *     (payload) => {
 *       if (payload.eventType === 'INSERT') {
 *         setUsers(prev => [...prev, payload.new])
 *       }
 *     },
 *     {
 *       table: 'users',
 *       event: '*',
 *     }
 *   )
 * 
 *   return <div>...</div>
 * }
 * ```
 */

import { useEffect, useRef } from 'react'
import { realtimeManager, type RealtimeCallback, type RealtimeSubscriptionOptions } from '@/lib/supabase/realtime-manager'
import { logger } from '@/lib/utils/logger'

export interface UseRealtimeSubscriptionOptions extends Omit<RealtimeSubscriptionOptions, 'onError'> {
  /**
   * Whether to enable the subscription
   * @default true
   */
  enabled?: boolean

  /**
   * Error callback
   */
  onError?: (error: Error) => void
}

/**
 * Hook for managing realtime subscriptions with automatic cleanup
 * 
 * @param subscriptionId - Unique identifier for this subscription
 * @param callback - Function to call when realtime events occur
 * @param options - Subscription configuration options
 * 
 * @example
 * ```typescript
 * // Subscribe to all changes on a table
 * useRealtimeSubscription(
 *   'my-subscription',
 *   (payload) => console.log('Change:', payload),
 *   { table: 'users', event: '*' }
 * )
 * 
 * // Subscribe to specific events with filter
 * useRealtimeSubscription(
 *   'user-123-subscription',
 *   (payload) => console.log('User updated:', payload),
 *   {
 *     table: 'users',
 *     event: 'UPDATE',
 *     filter: 'id=eq.123',
 *   }
 * )
 * 
 * // Conditionally enable subscription
 * useRealtimeSubscription(
 *   'conditional-subscription',
 *   (payload) => console.log('Change:', payload),
 *   {
 *     table: 'users',
 *     enabled: isAuthenticated,
 *   }
 * )
 * ```
 */
export function useRealtimeSubscription<T extends Record<string, any> = Record<string, any>>(
  subscriptionId: string,
  callback: RealtimeCallback<T>,
  options: UseRealtimeSubscriptionOptions
): void {
  const { enabled = true, onError, ...realtimeOptions } = options

  // Use ref to avoid re-subscribing when callback changes
  const callbackRef = useRef(callback)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    callbackRef.current = callback
    onErrorRef.current = onError
  }, [callback, onError])

  useEffect(() => {
    // Don't subscribe if disabled
    if (!enabled) {
      logger.debug('Realtime subscription disabled', {
        component: 'useRealtimeSubscription',
        metadata: { subscriptionId },
      })
      return
    }

    logger.info('Setting up realtime subscription', {
      component: 'useRealtimeSubscription',
      metadata: {
        subscriptionId,
        table: realtimeOptions.table,
        event: realtimeOptions.event || '*',
      },
    })

    // Subscribe using realtime manager
    const unsubscribe = realtimeManager.subscribe<T>(
      subscriptionId,
      (payload: any) => {
        callbackRef.current(payload)
      },
      {
        ...realtimeOptions,
        onError: (error: Error) => {
          if (onErrorRef.current) {
            onErrorRef.current(error)
          }
        },
      }
    )

    // Cleanup on unmount
    return () => {
      logger.info('Cleaning up realtime subscription', {
        component: 'useRealtimeSubscription',
        metadata: { subscriptionId },
      })
      unsubscribe()
    }
  }, [subscriptionId, enabled, realtimeOptions.table, realtimeOptions.event, realtimeOptions.filter])
}

/**
 * Hook for subscribing to a table with automatic data refetching
 * 
 * @param subscriptionId - Unique identifier for this subscription
 * @param refetchFn - Function to call to refetch data
 * @param options - Subscription configuration options
 * 
 * @example
 * ```typescript
 * function UserList() {
 *   const { data, refetch } = useQuery(['users'], fetchUsers)
 * 
 *   useRealtimeRefetch(
 *     'user-list-refetch',
 *     refetch,
 *     { table: 'users', event: '*' }
 *   )
 * 
 *   return <div>...</div>
 * }
 * ```
 */
export function useRealtimeRefetch(
  subscriptionId: string,
  refetchFn: () => void,
  options: UseRealtimeSubscriptionOptions
): void {
  useRealtimeSubscription(
    subscriptionId,
    (payload: any) => {
      logger.debug('Realtime event received, refetching data', {
        component: 'useRealtimeRefetch',
        metadata: {
          subscriptionId,
          eventType: payload.eventType,
        },
      })
      refetchFn()
    },
    options
  )
}

/**
 * Hook for subscribing to multiple tables
 * 
 * @param subscriptions - Array of subscription configurations
 * 
 * @example
 * ```typescript
 * function Dashboard() {
 *   useRealtimeSubscriptions([
 *     {
 *       id: 'users-subscription',
 *       callback: (payload) => console.log('User change:', payload),
 *       options: { table: 'users', event: '*' },
 *     },
 *     {
 *       id: 'posts-subscription',
 *       callback: (payload) => console.log('Post change:', payload),
 *       options: { table: 'posts', event: '*' },
 *     },
 *   ])
 * 
 *   return <div>...</div>
 * }
 * ```
 */
export function useRealtimeSubscriptions(
  subscriptions: Array<{
    id: string
    callback: RealtimeCallback
    options: UseRealtimeSubscriptionOptions
  }>
): void {
  subscriptions.forEach(({ id, callback, options }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRealtimeSubscription(id, callback, options)
  })
}
