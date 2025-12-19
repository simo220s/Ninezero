# Supabase Integration Module

Comprehensive Supabase integration with connection management, error handling, and retry logic.

## Features

- ✅ Connection health checks and monitoring
- ✅ Automatic reconnection on connection failures
- ✅ Query error handling with retry logic
- ✅ Realtime subscription management
- ✅ User-friendly error messages
- ✅ Comprehensive logging

## Components

### 1. Connection Manager

Manages Supabase connection with health checks and automatic reconnection.

```typescript
import { connectionManager, ConnectionStatus } from '@/lib/supabase'

// Check connection status
const isConnected = connectionManager.isConnected()

// Get connection status
const status = connectionManager.getStatus()

// Subscribe to status changes
const unsubscribe = connectionManager.onStatusChange((status) => {
  console.log('Connection status:', status)
})

// Manual reconnection
await connectionManager.reconnect()

// Get last health check result
const healthCheck = connectionManager.getLastHealthCheck()
```

### 2. Query Handler

Wraps Supabase queries with error handling and retry logic.

```typescript
import { executeQuery, executeMutation } from '@/lib/supabase'

// Execute a query with automatic retry
const result = await executeQuery(
  () => supabase.from('users').select('*'),
  {
    retryOnFailure: true,
    maxRetries: 3,
    showErrorToast: true,
  }
)

if (result.success) {
  console.log('Data:', result.data)
} else {
  console.error('Error:', result.error)
}

// Execute a mutation (no retry by default)
const mutationResult = await executeMutation(
  () => supabase.from('users').insert({ name: 'John' })
)

// Silent query (no error toast)
const silentResult = await executeSilentQuery(
  () => supabase.from('users').select('*')
)

// Batch queries
const batchResult = await executeBatch([
  () => supabase.from('users').select('*'),
  () => supabase.from('posts').select('*'),
])
```

### 3. Realtime Manager

Manages realtime subscriptions with automatic cleanup and reconnection.

#### Using the React Hook (Recommended)

```typescript
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

function UserList() {
  const [users, setUsers] = useState([])

  useRealtimeSubscription(
    'user-list-subscription',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setUsers(prev => [...prev, payload.new])
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

#### Using the Manager Directly

```typescript
import { realtimeManager } from '@/lib/supabase'

// Subscribe to realtime changes
const unsubscribe = realtimeManager.subscribe(
  'my-subscription-id',
  (payload) => {
    console.log('Realtime event:', payload)
  },
  {
    table: 'users',
    event: 'INSERT',
    filter: 'id=eq.123',
    autoReconnect: true,
    maxReconnectAttempts: 5,
    onError: (error) => {
      console.error('Subscription error:', error)
    },
  }
)

// Unsubscribe
unsubscribe()

// Or unsubscribe by ID
await realtimeManager.unsubscribe('my-subscription-id')

// Unsubscribe from all
await realtimeManager.unsubscribeAll()

// Get subscription status
const status = realtimeManager.getSubscriptionStatus('my-subscription-id')

// Cleanup on unmount
await realtimeManager.cleanup()
```

For detailed usage examples, see [REALTIME_USAGE_GUIDE.md](./REALTIME_USAGE_GUIDE.md)

## Usage Examples

### Basic Query with Error Handling

```typescript
import { executeQuery } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

async function fetchUsers() {
  const result = await executeQuery(
    () => supabase.from('users').select('*')
  )

  if (result.success) {
    return result.data
  } else {
    // Error is already logged and toast shown
    return []
  }
}
```

### Query with Custom Options

```typescript
import { executeQuery } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

async function fetchUserById(id: string) {
  const result = await executeQuery(
    () => supabase.from('users').select('*').eq('id', id).single(),
    {
      retryOnFailure: true,
      maxRetries: 3,
      retryDelay: 1000,
      showErrorToast: true,
      logError: true,
      context: { userId: id },
    }
  )

  return result
}
```

### Mutation with Error Handling

```typescript
import { executeMutation } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

async function createUser(userData: any) {
  const result = await executeMutation(
    () => supabase.from('users').insert(userData).select().single()
  )

  if (result.success) {
    console.log('User created:', result.data)
    return result.data
  } else {
    console.error('Failed to create user:', result.error)
    return null
  }
}
```

### Realtime Subscription in React Component

```typescript
import { useEffect } from 'react'
import { realtimeManager } from '@/lib/supabase'

function UserList() {
  useEffect(() => {
    // Subscribe to user changes
    const unsubscribe = realtimeManager.subscribe(
      'user-list-subscription',
      (payload) => {
        console.log('User changed:', payload)
        // Update UI
      },
      {
        table: 'users',
        event: '*',
        autoReconnect: true,
      }
    )

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  return <div>User List</div>
}
```

### Connection Status Monitoring

```typescript
import { useEffect, useState } from 'react'
import { connectionManager, ConnectionStatus } from '@/lib/supabase'

function ConnectionIndicator() {
  const [status, setStatus] = useState(connectionManager.getStatus())

  useEffect(() => {
    const unsubscribe = connectionManager.onStatusChange(setStatus)
    return unsubscribe
  }, [])

  return (
    <div>
      Status: {status}
      {status === ConnectionStatus.ERROR && (
        <button onClick={() => connectionManager.reconnect()}>
          Reconnect
        </button>
      )}
    </div>
  )
}
```

## Error Handling

All queries are automatically wrapped with error handling that:

1. **Categorizes errors** - Network, auth, database, validation, etc.
2. **Provides user-friendly messages** - In Arabic for better UX
3. **Logs errors** - With context for debugging
4. **Retries transient failures** - Network errors, timeouts, etc.
5. **Shows toast notifications** - Optional, can be disabled

### Retryable Errors

The following errors are automatically retried:

- Network errors (fetch failed, connection lost)
- Timeout errors
- PostgreSQL connection errors (08xxx codes)
- Serialization failures (40001)
- Deadlock detected (40P01)
- Too many connections (53300)

### Non-Retryable Errors

The following errors are NOT retried:

- Authentication errors (401)
- Authorization errors (403)
- Validation errors (constraint violations)
- Business logic errors

## Configuration

### Connection Manager Config

```typescript
import { connectionManager } from '@/lib/supabase'

// Default configuration
{
  healthCheckInterval: 30000, // 30 seconds
  healthCheckTimeout: 5000, // 5 seconds
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 2000, // 2 seconds
}
```

### Query Options

```typescript
{
  retryOnFailure: true, // Enable retry logic
  maxRetries: 3, // Maximum retry attempts
  retryDelay: 1000, // Delay between retries (ms)
  showErrorToast: true, // Show error toast notification
  logError: true, // Log errors
  context: {}, // Additional context for logging
}
```

### Realtime Subscription Options

```typescript
{
  table: 'users', // Required: table name
  event: '*', // INSERT | UPDATE | DELETE | *
  schema: 'public', // Default: 'public'
  filter: 'id=eq.123', // Optional filter
  autoReconnect: true, // Enable auto-reconnection
  maxReconnectAttempts: 5, // Max reconnection attempts
  reconnectDelay: 2000, // Delay between reconnects (ms)
  onError: (error) => {}, // Error callback
}
```

## Best Practices

1. **Always use executeQuery/executeMutation** instead of raw Supabase calls
2. **Use executeSilentQuery** for background operations that shouldn't show errors
3. **Provide context** in query options for better debugging
4. **Clean up subscriptions** in useEffect cleanup functions
5. **Monitor connection status** in critical components
6. **Handle errors gracefully** - the system provides good defaults but you can customize

## Migration Guide

### Before (Old Code)

```typescript
const { data, error } = await supabase.from('users').select('*')

if (error) {
  console.error(error)
  toast.error('Failed to fetch users')
  return
}

// Use data
```

### After (New Code)

```typescript
const result = await executeQuery(
  () => supabase.from('users').select('*')
)

if (result.success) {
  // Use result.data
}
// Error handling is automatic!
```

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1. Check the connection status: `connectionManager.getStatus()`
2. View last health check: `connectionManager.getLastHealthCheck()`
3. Manually reconnect: `await connectionManager.reconnect()`
4. Check browser console for detailed logs

### Subscription Issues

If realtime subscriptions aren't working:

1. Check subscription status: `realtimeManager.getSubscriptionStatus(id)`
2. Verify table name and filter are correct
3. Check Supabase dashboard for realtime configuration
4. Ensure RLS policies allow realtime access

### Query Failures

If queries are failing:

1. Check error logs in browser console
2. Verify error category and message
3. Check if error is retryable
4. Verify RLS policies and permissions

## API Reference

See individual module files for detailed API documentation:

- `connection-manager.ts` - Connection management
- `query-handler.ts` - Query error handling
- `realtime-manager.ts` - Realtime subscriptions
