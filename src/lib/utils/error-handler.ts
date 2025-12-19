/**
 * Centralized Error Handler
 * Provides error categorization, recovery mechanisms, and user-friendly messages
 */

import { logger } from './logger'
import { toast } from '@/components/ui/toast'

/**
 * Error categories for better error handling
 */
export const ErrorCategoryEnum = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  DATABASE: 'DATABASE',
  BUSINESS_LOGIC: 'BUSINESS_LOGIC',
  RUNTIME: 'RUNTIME',
  UNKNOWN: 'UNKNOWN',
} as const

export type ErrorCategory = typeof ErrorCategoryEnum[keyof typeof ErrorCategoryEnum]

/**
 * Error severity levels
 */
export const ErrorSeverityEnum = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export type ErrorSeverity = typeof ErrorSeverityEnum[keyof typeof ErrorSeverityEnum]

/**
 * Enhanced AppError with categorization
 */
export class CategorizedError extends Error {
  category: ErrorCategory
  severity: ErrorSeverity
  code?: string
  userMessage: string
  originalError?: unknown
  recoverable: boolean
  context?: Record<string, unknown>

  constructor(
    category: ErrorCategory,
    message: string,
    options?: {
      code?: string
      userMessage?: string
      originalError?: unknown
      severity?: ErrorSeverity
      recoverable?: boolean
      context?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'CategorizedError'
    this.category = category
    this.code = options?.code
    this.userMessage = options?.userMessage || message
    this.originalError = options?.originalError
    this.severity = options?.severity || ErrorSeverityEnum.MEDIUM
    this.recoverable = options?.recoverable ?? true
    this.context = options?.context
  }
}

/**
 * Error recovery strategies
 */
export interface RecoveryStrategy {
  canRecover: (error: CategorizedError) => boolean
  recover: (error: CategorizedError) => Promise<void> | void
  description: string
}

/**
 * Error Handler Service
 */
class ErrorHandler {
  private recoveryStrategies: RecoveryStrategy[] = []

  /**
   * Register a recovery strategy
   */
  registerRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy)
  }

  /**
   * Categorize an error
   */
  categorizeError(error: unknown): CategorizedError {
    // Already categorized
    if (error instanceof CategorizedError) {
      return error
    }

    // Network errors
    if (this.isNetworkError(error)) {
      return new CategorizedError(
        ErrorCategoryEnum.NETWORK,
        'Network error occurred',
        {
          userMessage: 'خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
          originalError: error,
          severity: ErrorSeverityEnum.HIGH,
          recoverable: true,
        }
      )
    }

    // Authentication errors
    if (this.isAuthError(error)) {
      return new CategorizedError(
        ErrorCategoryEnum.AUTHENTICATION,
        'Authentication error occurred',
        {
          userMessage: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
          originalError: error,
          severity: ErrorSeverityEnum.HIGH,
          recoverable: true,
        }
      )
    }

    // Authorization errors
    if (this.isAuthorizationError(error)) {
      return new CategorizedError(
        ErrorCategoryEnum.AUTHORIZATION,
        'Authorization error occurred',
        {
          userMessage: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
          originalError: error,
          severity: ErrorSeverityEnum.MEDIUM,
          recoverable: false,
        }
      )
    }

    // Database errors
    if (this.isDatabaseError(error)) {
      return new CategorizedError(
        ErrorCategoryEnum.DATABASE,
        'Database error occurred',
        {
          userMessage: 'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
          originalError: error,
          severity: ErrorSeverityEnum.HIGH,
          recoverable: true,
        }
      )
    }

    // Runtime errors
    if (error instanceof Error) {
      return new CategorizedError(
        ErrorCategoryEnum.RUNTIME,
        error.message,
        {
          userMessage: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
          originalError: error,
          severity: ErrorSeverityEnum.MEDIUM,
          recoverable: true,
        }
      )
    }

    // Unknown errors
    return new CategorizedError(
      ErrorCategoryEnum.UNKNOWN,
      'Unknown error occurred',
      {
        userMessage: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
        originalError: error,
        severity: ErrorSeverityEnum.MEDIUM,
        recoverable: true,
      }
    )
  }

  /**
   * Handle an error with logging, user notification, and recovery
   */
  async handleError(
    error: unknown,
    options?: {
      showToast?: boolean
      logError?: boolean
      attemptRecovery?: boolean
      context?: Record<string, unknown>
    }
  ): Promise<CategorizedError> {
    const categorizedError = this.categorizeError(error)
    
    // Add context if provided
    if (options?.context) {
      categorizedError.context = {
        ...categorizedError.context,
        ...options.context,
      }
    }

    // Log the error
    if (options?.logError !== false) {
      this.logError(categorizedError)
    }

    // Show toast notification
    if (options?.showToast !== false) {
      toast.error(categorizedError.userMessage)
    }

    // Attempt recovery
    if (options?.attemptRecovery !== false && categorizedError.recoverable) {
      await this.attemptRecovery(categorizedError)
    }

    return categorizedError
  }

  /**
   * Log an error with appropriate level
   */
  private logError(error: CategorizedError): void {
    const logContext = {
      component: 'ErrorHandler',
      metadata: {
        category: error.category,
        severity: error.severity,
        code: error.code,
        recoverable: error.recoverable,
        context: error.context,
      },
    }

    switch (error.severity) {
      case ErrorSeverityEnum.CRITICAL:
        logger.fatal(error.message, error.originalError as Error, logContext)
        break
      case ErrorSeverityEnum.HIGH:
        logger.error(error.message, error.originalError as Error, logContext)
        break
      case ErrorSeverityEnum.MEDIUM:
        logger.warn(error.message, logContext)
        break
      case ErrorSeverityEnum.LOW:
        logger.info(error.message, logContext)
        break
    }
  }

  /**
   * Attempt to recover from an error
   */
  private async attemptRecovery(error: CategorizedError): Promise<void> {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(error)) {
        try {
          logger.info(`Attempting recovery: ${strategy.description}`)
          await strategy.recover(error)
          logger.info('Recovery successful')
          return
        } catch (recoveryError) {
          logger.error('Recovery failed', recoveryError as Error)
        }
      }
    }
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: unknown): boolean {
    if (!error) return false
    
    const errorStr = String(error).toLowerCase()
    const messageStr = (error as Error).message?.toLowerCase() || ''
    
    return (
      errorStr.includes('network') ||
      errorStr.includes('fetch') ||
      errorStr.includes('connection') ||
      messageStr.includes('network') ||
      messageStr.includes('fetch') ||
      messageStr.includes('failed to fetch') ||
      messageStr.includes('networkerror')
    )
  }

  /**
   * Check if error is an authentication error
   */
  private isAuthError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    
    const err = error as Record<string, unknown>
    const messageStr = (err.message as string)?.toLowerCase() || ''
    
    return (
      err.status === 401 ||
      err.statusCode === 401 ||
      messageStr.includes('unauthorized') ||
      messageStr.includes('authentication') ||
      messageStr.includes('jwt') ||
      messageStr.includes('token')
    )
  }

  /**
   * Check if error is an authorization error
   */
  private isAuthorizationError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    
    const err = error as Record<string, unknown>
    const messageStr = (err.message as string)?.toLowerCase() || ''
    
    return (
      err.status === 403 ||
      err.statusCode === 403 ||
      messageStr.includes('forbidden') ||
      messageStr.includes('permission')
    )
  }

  /**
   * Check if error is a database error
   */
  private isDatabaseError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    
    const err = error as Record<string, unknown>
    const messageStr = (err.message as string)?.toLowerCase() || ''
    const code = err.code as string
    
    return (
      code?.startsWith('23') || // PostgreSQL constraint violations
      code?.startsWith('42') || // PostgreSQL syntax errors
      messageStr.includes('database') ||
      messageStr.includes('query') ||
      messageStr.includes('postgres')
    )
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

// Register default recovery strategies
errorHandler.registerRecoveryStrategy({
  canRecover: (error) => error.category === ErrorCategoryEnum.AUTHENTICATION,
  recover: () => {
    // Redirect to login page
    window.location.href = '/login'
  },
  description: 'Redirect to login page for authentication errors',
})

errorHandler.registerRecoveryStrategy({
  canRecover: (error) => error.category === ErrorCategoryEnum.NETWORK,
  recover: async () => {
    // Wait a moment and check if network is back
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (navigator.onLine) {
      toast.info('تم استعادة الاتصال بالإنترنت')
    }
  },
  description: 'Check network connectivity',
})

