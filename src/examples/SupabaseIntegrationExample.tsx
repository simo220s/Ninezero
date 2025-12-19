/**
 * Supabase Integration Example
 * 
 * Demonstrates how to use the new Supabase connection manager,
 * query handler, and realtime manager.
 */

import { useEffect, useState } from 'react'
import {
  connectionManager,
  ConnectionStatus,
  executeQuery,
  executeMutation,
  realtimeManager,
  supabase,
} from '@/lib/supabase'

/**
 * Example 1: Connection Status Monitoring
 */
export function ConnectionStatusExample() {
  const [status, setStatus] = useState(connectionManager.getStatus())
  const [healthCheck, setHealthCheck] = useState(connectionManager.getLastHealthCheck())

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = connectionManager.onStatusChange((newStatus: ConnectionStatus) => {
      setStatus(newStatus)
      setHealthCheck(connectionManager.getLastHealthCheck())
    })

    return unsubscribe
  }, [])

  const handleReconnect = async () => {
    await connectionManager.reconnect()
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Connection Status</h3>
      <div className="space-y-2">
        <p>
          Status:{' '}
          <span
            className={
              status === ConnectionStatus.CONNECTED
                ? 'text-green-600'
                : status === ConnectionStatus.ERROR
                ? 'text-red-600'
                : 'text-yellow-600'
            }
          >
            {status}
          </span>
        </p>
        {healthCheck && (
          <>
            <p>Healthy: {healthCheck.isHealthy ? 'Yes' : 'No'}</p>
            {healthCheck.latency && <p>Latency: {healthCheck.latency}ms</p>}
            <p>Last Check: {healthCheck.timestamp.toLocaleTimeString()}</p>
          </>
        )}
        {status === ConnectionStatus.ERROR && (
          <button
            onClick={handleReconnect}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reconnect
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Example 2: Query with Error Handling
 */
export function QueryExample() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)

    const result = await executeQuery(
      async () => await supabase.from('profiles').select('*').limit(10),
      {
        retryOnFailure: true,
        maxRetries: 3,
        showErrorToast: true,
        context: { action: 'fetchUsers' },
      }
    )

    setLoading(false)

    if (result.success && result.data) {
      setUsers(result.data)
    }
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Query Example</h3>
      <button
        onClick={fetchUsers}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Fetch Users'}
      </button>
      <div className="mt-4">
        <p>Users: {users.length}</p>
        <ul className="list-disc list-inside">
          {users.slice(0, 5).map((user) => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Example 3: Mutation with Error Handling
 */
export function MutationExample() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const createProfile = async () => {
    if (!name) return

    setLoading(true)
    setResult('')

    const mutationResult = await executeMutation(
      async () =>
        await supabase
          .from('profiles')
          .insert({ first_name: name, last_name: 'Test' })
          .select()
          .single(),
      {
        showErrorToast: true,
        context: { action: 'createProfile', name },
      }
    )

    setLoading(false)

    if (mutationResult.success) {
      setResult('Profile created successfully!')
      setName('')
    } else {
      setResult('Failed to create profile')
    }
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Mutation Example</h3>
      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          className="px-3 py-2 border rounded w-full"
        />
        <button
          onClick={createProfile}
          disabled={loading || !name}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Profile'}
        </button>
        {result && <p className="text-sm">{result}</p>}
      </div>
    </div>
  )
}

/**
 * Example 4: Realtime Subscription
 */
export function RealtimeExample() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    // Subscribe to profile changes
    const unsubscribe = realtimeManager.subscribe(
      'profile-changes-example',
      (payload: any) => {
        setEvents((prev) => [
          {
            type: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date(),
          },
          ...prev.slice(0, 9), // Keep last 10 events
        ])
      },
      {
        table: 'profiles',
        event: '*',
        autoReconnect: true,
        maxReconnectAttempts: 5,
        onError: (error: Error) => {
          console.error('Realtime error:', error)
        },
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Realtime Example</h3>
      <p className="text-sm text-gray-600 mb-2">
        Listening for profile changes...
      </p>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No events yet</p>
        ) : (
          events.map((event, index) => (
            <div key={index} className="p-2 bg-gray-100 rounded text-sm">
              <p className="font-semibold">{event.type}</p>
              <p className="text-xs text-gray-600">
                {event.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Main Example Component
 */
export function SupabaseIntegrationExample() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Supabase Integration Examples</h1>
      <p className="text-gray-600">
        These examples demonstrate the new Supabase connection manager, query
        handler, and realtime manager.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConnectionStatusExample />
        <QueryExample />
        <MutationExample />
        <RealtimeExample />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">Features</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Automatic connection health checks</li>
          <li>Automatic reconnection on failures</li>
          <li>Query retry logic for transient errors</li>
          <li>User-friendly error messages</li>
          <li>Comprehensive logging</li>
          <li>Realtime subscription management</li>
        </ul>
      </div>
    </div>
  )
}

export default SupabaseIntegrationExample
