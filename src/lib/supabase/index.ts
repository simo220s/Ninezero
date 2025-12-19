/**
 * Supabase Integration Module
 * 
 * Centralized exports for all Supabase-related functionality:
 * - Connection management
 * - Query error handling
 * - Retry logic
 * - Health checks
 */

// Core client
export { supabase } from '../supabase'

// Connection management
export {
  connectionManager,
  ConnectionStatus,
  type HealthCheckResult,
  type ConnectionManagerConfig,
} from './connection-manager'

// Query handling
export {
  executeQuery,
  executeMutation,
  executeSilentQuery,
  executeBatch,
  wrapQuery,
  type QueryResult,
  type QueryOptions,
  type PostgrestError,
  type PostgrestResponse,
  type PostgrestSingleResponse,
} from './query-handler'

// Re-export realtime manager
export {
  realtimeManager,
  type RealtimeSubscriptionOptions,
  type RealtimeCallback,
} from './realtime-manager'
