/**
 * Subscription Sync Examples
 * 
 * This file demonstrates how to use the real-time subscription sync
 * functionality in different scenarios.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSubscriptionSync, useSubscriptionSyncRefetch } from '@/hooks/useSubscriptionSync'
import { getUserSubscription } from '@/lib/services/subscription-service'
import { logger } from '@/lib/logger'

// ============================================================================
// Example 1: Basic Usage with Callbacks
// ============================================================================

export function BasicSubscriptionSyncExample() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)

  // Subscribe to all subscription changes
  useSubscriptionSync(user?.id, {
    onSubscriptionChange: (change) => {
      logger.log('Subscription changed:', change.type)
      // Refetch subscription data
      loadSubscription()
    }
  })

  const loadSubscription = async () => {
    if (!user) return
    const result = await getUserSubscription(user.id)
    if (result.success) {
      setSubscription(result.data)
    }
  }

  useEffect(() => {
    loadSubscription()
  }, [user])

  return (
    <div>
      <h2>Current Subscription</h2>
      {subscription && (
        <div>
          <p>Status: {subscription.status}</p>
          <p>Credits: {subscription.credits}</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 2: Specific Event Handlers
// ============================================================================

export function SpecificEventHandlersExample() {
  const { user } = useAuth()
  const [discountActive, setDiscountActive] = useState(false)
  const [cancellationPending, setCancellationPending] = useState(false)

  useSubscriptionSync(user?.id, {
    onDiscountApplied: (data) => {
      logger.log('Discount applied:', data)
      setDiscountActive(true)
      // Show success notification
      alert('تم تطبيق خصم 20% على اشتراكك!')
    },
    
    onDiscountRemoved: (data) => {
      logger.log('Discount removed:', data)
      setDiscountActive(false)
      // Show info notification
      alert('انتهى الخصم من اشتراكك')
    },
    
    onCancellationRequested: (data) => {
      logger.log('Cancellation requested:', data)
      setCancellationPending(true)
      // Show warning notification
      alert('تم تقديم طلب إلغاء الاشتراك. سيتم تفعيله خلال 24 ساعة')
    },
    
    onCancellationCancelled: (data) => {
      logger.log('Cancellation cancelled:', data)
      setCancellationPending(false)
      // Show success notification
      alert('تم إلغاء طلب الإلغاء. اشتراكك لا يزال نشطاً')
    },
    
    onCancellationCompleted: (data) => {
      logger.log('Cancellation completed:', data)
      setCancellationPending(false)
      // Show error notification and redirect
      alert('تم إلغاء اشتراكك')
      // Redirect to home or pricing page
    }
  })

  return (
    <div>
      <h2>Subscription Status</h2>
      {discountActive && (
        <div className="bg-green-100 p-4 rounded">
          <p>✓ لديك خصم نشط على اشتراكك</p>
        </div>
      )}
      {cancellationPending && (
        <div className="bg-yellow-100 p-4 rounded">
          <p>⚠ لديك طلب إلغاء قيد المعالجة</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 3: Simplified Refetch Pattern
// ============================================================================

export function SimplifiedRefetchExample() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)

  const loadSubscription = async () => {
    if (!user) return
    const result = await getUserSubscription(user.id)
    if (result.success) {
      setSubscription(result.data)
    }
  }

  // Automatically refetch when any subscription change occurs
  useSubscriptionSyncRefetch(user?.id, loadSubscription)

  useEffect(() => {
    loadSubscription()
  }, [user])

  return (
    <div>
      <h2>Subscription (Auto-Refreshing)</h2>
      {subscription && (
        <div>
          <p>Status: {subscription.status}</p>
          <p>Credits: {subscription.credits}</p>
          <p className="text-sm text-gray-500">
            This data automatically updates when changes occur
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 4: Conditional Sync (Enable/Disable)
// ============================================================================

export function ConditionalSyncExample() {
  const { user } = useAuth()
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [changeCount, setChangeCount] = useState(0)

  useSubscriptionSync(user?.id, {
    enabled: syncEnabled, // Only sync when enabled
    onSubscriptionChange: () => {
      setChangeCount(prev => prev + 1)
    }
  })

  return (
    <div>
      <h2>Conditional Sync</h2>
      <p>Changes detected: {changeCount}</p>
      <button onClick={() => setSyncEnabled(!syncEnabled)}>
        {syncEnabled ? 'Disable' : 'Enable'} Real-time Sync
      </button>
      <p className="text-sm text-gray-500">
        {syncEnabled 
          ? 'Real-time sync is active' 
          : 'Real-time sync is paused'}
      </p>
    </div>
  )
}

// ============================================================================
// Example 5: Multiple Components Syncing
// ============================================================================

// Component 1: Subscription Details
export function SubscriptionDetailsComponent() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)

  useSubscriptionSync(user?.id, {
    onSubscriptionChange: async () => {
      const result = await getUserSubscription(user.id!)
      if (result.success) {
        setSubscription(result.data)
      }
    }
  })

  return (
    <div className="border p-4 rounded">
      <h3>Subscription Details</h3>
      {subscription && <p>Status: {subscription.status}</p>}
    </div>
  )
}

// Component 2: Credits Display
export function CreditsDisplayComponent() {
  const { user } = useAuth()
  const [credits, setCredits] = useState(0)

  useSubscriptionSync(user?.id, {
    onSubscriptionChange: async () => {
      const result = await getUserSubscription(user.id!)
      if (result.success) {
        setCredits(result.data.credits)
      }
    }
  })

  return (
    <div className="border p-4 rounded">
      <h3>Available Credits</h3>
      <p className="text-2xl font-bold">{credits}</p>
    </div>
  )
}

// Parent component using both
export function MultiComponentSyncExample() {
  return (
    <div>
      <h2>Multiple Components Syncing</h2>
      <p className="text-sm text-gray-500 mb-4">
        Both components below will update automatically when subscription changes
      </p>
      <div className="grid grid-cols-2 gap-4">
        <SubscriptionDetailsComponent />
        <CreditsDisplayComponent />
      </div>
    </div>
  )
}

// ============================================================================
// Example 6: Testing Real-time Sync
// ============================================================================

export function TestingSyncExample() {
  const { user } = useAuth()
  const [lastChange, setLastChange] = useState<string>('')

  useSubscriptionSync(user?.id, {
    onSubscriptionChange: (change) => {
      setLastChange(`${change.type} at ${new Date(change.timestamp).toLocaleTimeString()}`)
    }
  })

  return (
    <div>
      <h2>Real-time Sync Testing</h2>
      <p>Last change: {lastChange || 'No changes yet'}</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm">To test:</p>
        <ol className="text-sm list-decimal list-inside">
          <li>Open this page in two browser windows</li>
          <li>Make a subscription change in one window (e.g., apply discount)</li>
          <li>Watch this component update in both windows automatically</li>
        </ol>
      </div>
    </div>
  )
}

// ============================================================================
// Usage Notes
// ============================================================================

/**
 * IMPORTANT NOTES:
 * 
 * 1. The hook automatically handles subscription/unsubscription on mount/unmount
 * 2. Multiple components can subscribe to the same user's changes
 * 3. Changes are detected across browser tabs and devices
 * 4. Connection failures are handled with automatic reconnection (up to 5 attempts)
 * 5. All callbacks are optional - use only what you need
 * 6. The hook uses refs internally to avoid re-subscribing when callbacks change
 * 
 * PERFORMANCE TIPS:
 * 
 * 1. Use the simplified `useSubscriptionSyncRefetch` when you just need to refetch data
 * 2. Disable sync when not needed using the `enabled` option
 * 3. Avoid heavy operations in callbacks - keep them lightweight
 * 4. Consider debouncing refetch operations if they're expensive
 * 
 * SECURITY NOTES:
 * 
 * 1. Supabase RLS policies control what data users can see
 * 2. Users can only subscribe to their own subscription changes
 * 3. All database changes are validated server-side
 * 4. Real-time subscriptions are automatically cleaned up on logout
 */
