/**
 * Supabase Connection Manager
 * 
 * Provides centralized connection management with:
 * - Health checks
 * - Connection validation
 * - Automatic reconnection
 * - Connection state monitoring
 */

import { type SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logger } from '../utils/logger'
import { errorService } from '../services/error-service'

/**
 * Connection status
 */
export const ConnectionStatusEnum = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  ERROR: 'ERROR',
} as const

export type ConnectionStatus = typeof ConnectionStatusEnum[keyof typeof ConnectionStatusEnum]

/**
 * Connection health check result
 */
export interface HealthCheckResult {
  isHealthy: boolean
  latency?: number
  error?: Error
  timestamp: Date
}

/**
 * Connection manager configuration
 */
export interface ConnectionManagerConfig {
  healthCheckInterval?: number // milliseconds
  healthCheckTimeout?: number // milliseconds
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectDelay?: number // milliseconds
}

/**
 * Supabase Connection Manager
 */
class SupabaseConnectionManager {
  private client: SupabaseClient
  private status: ConnectionStatus = ConnectionStatusEnum.DISCONNECTED
  private healthCheckInterval: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private lastHealthCheck: HealthCheckResult | null = null
  private listeners: Set<(status: ConnectionStatus) => void> = new Set()

  private config: Required<ConnectionManagerConfig> = {
    healthCheckInterval: 30000, // 30 seconds
    healthCheckTimeout: 5000, // 5 seconds
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000, // 2 seconds
  }

  constructor(client: SupabaseClient, config?: ConnectionManagerConfig) {
    this.client = client
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Initialize the connection manager
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Supabase connection manager')

    try {
      // Perform initial health check
      const healthCheck = await this.checkHealth()

      if (healthCheck.isHealthy) {
        this.setStatus(ConnectionStatusEnum.CONNECTED)
        logger.info('Supabase connection established', {
          component: 'SupabaseConnectionManager',
          metadata: { latency: healthCheck.latency },
        })
      } else {
        this.setStatus(ConnectionStatusEnum.ERROR)
        logger.error('Supabase connection failed', healthCheck.error, {
          component: 'SupabaseConnectionManager',
        })

        if (this.config.autoReconnect) {
          await this.attemptReconnect()
        }
      }

      // Start periodic health checks
      this.startHealthChecks()
    } catch (error) {
      logger.error('Failed to initialize connection manager', error as Error, {
        component: 'SupabaseConnectionManager',
      })
      this.setStatus(ConnectionStatusEnum.ERROR)
      throw error
    }
  }

  /**
   * Check connection health
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Health check timeout'))
        }, this.config.healthCheckTimeout)
      })

      // Perform a simple query to check connection
      const healthCheckPromise = this.client
        .from('profiles')
        .select('id')
        .limit(1)
        .single()

      // Race between health check and timeout
      await Promise.race([healthCheckPromise, timeoutPromise])

      const latency = Date.now() - startTime

      this.lastHealthCheck = {
        isHealthy: true,
        latency,
        timestamp: new Date(),
      }

      return this.lastHealthCheck
    } catch (error) {
      const latency = Date.now() - startTime

      this.lastHealthCheck = {
        isHealthy: false,
        latency,
        error: error as Error,
        timestamp: new Date(),
      }

      return this.lastHealthCheck
    }
  }

  /**
   * Validate connection on startup
   */
  async validateConnection(): Promise<boolean> {
    logger.info('Validating Supabase connection')

    try {
      const healthCheck = await this.checkHealth()

      if (!healthCheck.isHealthy) {
        logger.error('Connection validation failed', healthCheck.error, {
          component: 'SupabaseConnectionManager',
        })

        errorService.showError(
          'فشل الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت.'
        )

        return false
      }

      logger.info('Connection validation successful', {
        component: 'SupabaseConnectionManager',
        metadata: { latency: healthCheck.latency },
      })

      return true
    } catch (error) {
      logger.error('Connection validation error', error as Error, {
        component: 'SupabaseConnectionManager',
      })
      return false
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      const healthCheck = await this.checkHealth()

      if (!healthCheck.isHealthy && this.status === ConnectionStatusEnum.CONNECTED) {
        logger.warn('Health check failed, connection may be lost', {
          component: 'SupabaseConnectionManager',
        })
        this.setStatus(ConnectionStatusEnum.ERROR)

        if (this.config.autoReconnect) {
          await this.attemptReconnect()
        }
      } else if (healthCheck.isHealthy && this.status !== ConnectionStatusEnum.CONNECTED) {
        logger.info('Connection restored', {
          component: 'SupabaseConnectionManager',
        })
        this.setStatus(ConnectionStatusEnum.CONNECTED)
        this.reconnectAttempts = 0
      }
    }, this.config.healthCheckInterval)
  }

  /**
   * Stop health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * Attempt to reconnect
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached', undefined, {
        component: 'SupabaseConnectionManager',
        metadata: { attempts: this.reconnectAttempts },
      })

      errorService.showError(
        'فشل إعادة الاتصال بقاعدة البيانات. يرجى تحديث الصفحة.'
      )

      return
    }

    this.reconnectAttempts++
    this.setStatus(ConnectionStatusEnum.CONNECTING)

    logger.info('Attempting to reconnect', {
      component: 'SupabaseConnectionManager',
      metadata: { attempt: this.reconnectAttempts },
    })

    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, this.config.reconnectDelay))

    const healthCheck = await this.checkHealth()

    if (healthCheck.isHealthy) {
      this.setStatus(ConnectionStatusEnum.CONNECTED)
      this.reconnectAttempts = 0
      logger.info('Reconnection successful', {
        component: 'SupabaseConnectionManager',
      })
      errorService.showSuccess('تم إعادة الاتصال بنجاح')
    } else {
      this.setStatus(ConnectionStatusEnum.ERROR)
      // Try again
      await this.attemptReconnect()
    }
  }

  /**
   * Set connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status
      this.notifyListeners(status)
    }
  }

  /**
   * Notify status change listeners
   */
  private notifyListeners(status: ConnectionStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        logger.error('Error in connection status listener', error as Error, {
          component: 'SupabaseConnectionManager',
        })
      }
    })
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * Get last health check result
   */
  getLastHealthCheck(): HealthCheckResult | null {
    return this.lastHealthCheck
  }

  /**
   * Get the Supabase client
   */
  getClient(): SupabaseClient {
    return this.client
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.status === ConnectionStatusEnum.CONNECTED
  }

  /**
   * Manually trigger reconnection
   */
  async reconnect(): Promise<void> {
    logger.info('Manual reconnection triggered', {
      component: 'SupabaseConnectionManager',
    })

    this.reconnectAttempts = 0
    await this.attemptReconnect()
  }

  /**
   * Cleanup and stop all operations
   */
  cleanup(): void {
    logger.info('Cleaning up connection manager', {
      component: 'SupabaseConnectionManager',
    })

    this.stopHealthChecks()
    this.listeners.clear()
    this.setStatus(ConnectionStatusEnum.DISCONNECTED)
  }
}

// Create singleton instance
export const connectionManager = new SupabaseConnectionManager(supabase, {
  healthCheckInterval: 30000, // 30 seconds
  healthCheckTimeout: 5000, // 5 seconds
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 2000, // 2 seconds
})

// Export for use in other modules
export default connectionManager


