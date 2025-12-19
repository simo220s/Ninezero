# Realtime Subscription Management Guide

This guide explains how to use the realtime subscription manager for handling Supabase realtime subscriptions with automatic cleanup, reconnection, and error handling.

## Overview

The realtime manager provides:

- ✅ Automatic subscription cleanup on component unmount
- ✅ Automatic reconnection on connection failures
- ✅ Centralized subscription tracking
- ✅ Error handling with user-friendly messages
- ✅ Connection status monitoring
- ✅ Comprehensive logging

## Quick Start

### Using the React Hook (Recommended)

The easiest way to use realtime subscriptions in React components is with the `useRealtimeSubscription` hook:

```typescript
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

function UserList() {
  const [users, setUsers] = useState([])

  useRealtimeSubscription(
    'user-list-subscription',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setUsers(prev => [...prev, payload.new])
      } else if (payload.eventType === 'UPDATE') {
        setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u))
      } else if (payload.eventType === 'DELETE') {
        setUsers(prev => prev.filter(u => u.id !== payload.old.id))
      }
    },
    {
      table: 'users',
      event: '*',
    }
  )

  return <div>...</div>
}
```

### Using the Manager Directly

For non-React code or more control, use the realtime manager directly:

```typescript
import { realtimeManager } from '@/lib/supabase'

// Subscribe to changes
const unsubscribe = realtimeManager.subscribe(
  'my-subscription-id',
  (payload) => {
    console.log('Change detected:', payload)
  },
  {
    table: 'users',
    event: 'INSERT',
  }
)

// Later, unsubscribe
unsubscribe()
```

## Subscription Options

### Basic Options

```typescript
{
  table: 'users',              // Required: table name
  event: '*',                  // INSERT | UPDATE | DELETE | * (default: *)
  schema: 'public',            // Schema name (default: 'public')
  filter: 'id=eq.123',         // Optional filter
}
```

### Advanced Options

```typescript
{
  table: 'users',
  event: '*',
  autoReconnect: true,         // Enable auto-reconnection (default: true)
  maxReconnectAttempts: 5,     // Max reconnection attempts (default: 5)
  reconnectDelay: 2000,        // Delay between reconnects in ms (default: 2000)
  onError: (error) => {        // Error callback
    console.error('Subscription error:', error)
  },
}
```

## Common Use Cases

### 1. Subscribe to All Changes on a Table

```typescript
useRealtimeSubscription(
  'all-users',
  (payload) => {
    console.log('User changed:', payload.eventType, payload.new || payload.old)
  },
  {
    table: 'users',
    event: '*',
  }
)
```

### 2. Subscribe to Specific Events

```typescript
useRealtimeSubscription(
  'new-users',
  (payload) => {
    console.log('New user:', payload.new)
  },
  {
    table: 'users',
    event: 'INSERT',
  }
)
```

### 3. Subscribe with Filter

```typescript
useRealtimeSubscription(
  'user-123-updates',
  (payload) => {
    console.log('User 123 updated:', payload.new)
  },
  {
    table: 'users',
    event: 'UPDATE',
    filter: 'id=eq.123',
  }
)
```

### 4. Conditional Subscription

```typescript
const { user } = useAuth()

useRealtimeSubscription(
  'my-profile',
  (payload) => {
    console.log('Profile updated:', payload.new)
  },
  {
    table: 'profiles',
    event: '*',
    filter: user ? `id=eq.${user.id}` : undefined,
    enabled: !!user, // Only subscribe when user is logged in
  }
)
```

### 5. Refetch Data on Changes

```typescript
import { useRealtimeRefetch } from '@/hooks/useRealtimeSubscription'

function UserList() {
  const { data, refetch } = useQuery(['users'], fetchUsers)

  useRealtimeRefetch(
    'user-list-refetch',
    refetch,
    {
      table: 'users',
      event: '*',
    }
  )

  return <div>...</div>
}
```

### 6. Multiple Subscriptions

```typescript
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscription'

function Dashboard() {
  useRealtimeSubscriptions([
    {
      id: 'users-subscription',
      callback: (payload) => console.log('User change:', payload),
      options: { table: 'users', event: '*' },
    },
    {
      id: 'posts-subscription',
      callback: (payload) => console.log('Post change:', payload),
      options: { table: 'posts', event: '*' },
    },
  ])

  return <div>...</div>
}
```

## Payload Structure

The callback receives a payload with the following structure:

```typescript
{
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  schema: 'public',
  table: 'users',
  commit_timestamp: '2024-01-01T00:00:00Z',
  new: { /* new row data (INSERT, UPDATE) */ },
  old: { /* old row data (UPDATE, DELETE) */ },
  errors: null,
}
```

### Accessing Data

```typescript
useRealtimeSubscription(
  'user-changes',
  (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        console.log('New row:', payload.new)
        break
      case 'UPDATE':
        console.log('Old row:', payload.old)
        console.log('New row:', payload.new)
        break
      case 'DELETE':
        console.log('Deleted row:', payload.old)
        break
    }
  },
  { table: 'users', event: '*' }
)
```

## Error Handling

### Using onError Callback

```typescript
useRealtimeSubscription(
  'users-with-error-handling',
  (payload) => {
    console.log('Change:', payload)
  },
  {
    table: 'users',
    event: '*',
    onError: (error) => {
      console.error('Subscription error:', error)
      // Show user-friendly error message
      toast.error('Failed to sync data. Please refresh the page.')
    },
  }
)
```

### Automatic Reconnection

The manager automatically attempts to reconnect on connection failures:

- Default: 5 reconnection attempts
- Default delay: 2 seconds between attempts
- Exponential backoff is NOT used (constant delay)

```typescript
useRealtimeSubscription(
  'users-with-reconnection',
  (payload) => {
    console.log('Change:', payload)
  },
  {
    table: 'users',
    event: '*',
    autoReconnect: true,
    maxReconnectAttempts: 10,
    reconnectDelay: 3000, // 3 seconds
  }
)
```

## Best Practices

### 1. Use Unique Subscription IDs

Each subscription needs a unique ID. Use descriptive names:

```typescript
// Good
useRealtimeSubscription('user-profile-123', ...)
useRealtimeSubscription('dashboard-users-list', ...)

// Bad
useRealtimeSubscription('subscription-1', ...)
useRealtimeSubscription('sub', ...)
```

### 2. Clean Up Subscriptions

When using the manager directly (not the hook), always clean up:

```typescript
// In React component
useEffect(() => {
  const unsubscribe = realtimeManager.subscribe(...)
  return () => unsubscribe()
}, [])

// In vanilla JS
const unsubscribe = realtimeManager.subscribe(...)
// Later...
unsubscribe()
```

### 3. Use Filters for Performance

Filter subscriptions to only receive relevant changes:

```typescript
// Good - only receive changes for current user
useRealtimeSubscription(
  'my-notifications',
  (payload) => { ... },
  {
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }
)

// Bad - receive all notifications
useRealtimeSubscription(
  'all-notifications',
  (payload) => {
    if (payload.new.user_id === userId) {
      // Process notification
    }
  },
  {
    table: 'notifications',
  }
)
```

### 4. Handle All Event Types

When subscribing to all events (`event: '*'`), handle all types:

```typescript
useRealtimeSubscription(
  'users',
  (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        // Handle insert
        break
      case 'UPDATE':
        // Handle update
        break
      case 'DELETE':
        // Handle delete
        break
    }
  },
  { table: 'users', event: '*' }
)
```

### 5. Use Refs for Callbacks

When using the manager directly in React, use refs to avoid re-subscribing:

```typescript
function MyComponent() {
  const callbackRef = useRef((payload) => {
    // Handle payload
  })

  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe(
      'my-subscription',
      (payload) => callbackRef.current(payload),
      { table: 'users' }
    )
    return () => unsubscribe()
  }, []) // Empty deps - won't re-subscribe
}
```

### 6. Monitor Subscription Status

Check subscription status for debugging:

```typescript
const status = realtimeManager.getSubscriptionStatus('my-subscription')
console.log('Subscription status:', status)
// { exists: true, isActive: true, reconnectAttempts: 0 }
```

### 7. Cleanup on Logout

Clean up all subscriptions when user logs out:

```typescript
function logout() {
  // Logout logic...
  
  // Cleanup all realtime subscriptions
  await realtimeManager.unsubscribeAll()
}
```

## Troubleshooting

### Subscription Not Receiving Events

1. **Check RLS policies**: Ensure your Row Level Security policies allow realtime access
2. **Verify table name**: Make sure the table name is correct
3. **Check filter syntax**: Verify the filter syntax is correct (`column=eq.value`)
4. **Enable realtime in Supabase**: Ensure realtime is enabled for the table in Supabase dashboard

### Connection Issues

1. **Check connection status**: Use `connectionManager.getStatus()`
2. **View subscription status**: Use `realtimeManager.getSubscriptionStatus(id)`
3. **Check browser console**: Look for error messages
4. **Verify environment variables**: Ensure Supabase URL and keys are correct

### Performance Issues

1. **Use filters**: Filter subscriptions to reduce data transfer
2. **Limit subscriptions**: Don't create too many subscriptions
3. **Debounce updates**: Debounce UI updates if receiving many events
4. **Unsubscribe when not needed**: Clean up subscriptions when components unmount

## Migration from Direct Supabase Usage

### Before (Old Code)

```typescript
useEffect(() => {
  const channel = supabase
    .channel('my-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users',
    }, (payload) => {
      console.log('Change:', payload)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### After (New Code)

```typescript
useRealtimeSubscription(
  'my-subscription',
  (payload) => {
    console.log('Change:', payload)
  },
  {
    table: 'users',
    event: '*',
  }
)
```

## API Reference

### realtimeManager.subscribe()

```typescript
subscribe<T>(
  subscriptionId: string,
  callback: RealtimeCallback<T>,
  options: RealtimeSubscriptionOptions
): () => void
```

### realtimeManager.unsubscribe()

```typescript
unsubscribe(subscriptionId: string): Promise<void>
```

### realtimeManager.unsubscribeAll()

```typescript
unsubscribeAll(): Promise<void>
```

### realtimeManager.getSubscriptionStatus()

```typescript
getSubscriptionStatus(subscriptionId: string): {
  exists: boolean
  isActive: boolean
  reconnectAttempts: number
} | null
```

### realtimeManager.getActiveSubscriptionCount()

```typescript
getActiveSubscriptionCount(): number
```

### realtimeManager.cleanup()

```typescript
cleanup(): Promise<void>
```

## Examples

See `src/examples/SupabaseIntegrationExample.tsx` for complete working examples.

## Support

For issues or questions:

1. Check the browser console for error messages
2. Review the logs (search for "RealtimeManager" in console)
3. Verify your Supabase configuration
4. Check the Supabase dashboard for realtime settings
