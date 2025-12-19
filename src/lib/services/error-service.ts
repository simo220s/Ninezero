/**
 * Error Service
 * Centralized error handling service that integrates all error handling utilities
 */

import { 
  errorHandler, 
  CategorizedError, 
  ErrorCategoryEnum,
  ErrorSeverityEnum,
  type ErrorCategory,
  type ErrorSeverity,
  type RecoveryStrategy 
} from '@/lib/utils/error-handler'
import { logger, type LogContext } from '@/lib/utils/logger'
import { 
  handleAsync, 
  safeAsync, 
  validateAndExecute, 
  retryAsync,
  type AsyncHandlerOptions,
  type AsyncResult,
  type ValidationFunction,
  type RetryOptions 
} from '@/lib/utils/async-handler'
import { toast } from '@/components/ui/toast'

/**
 * Error Service Class
 * Provides a unified interface for error handling across the application
 */
class ErrorService {
  /**
   * Handle an error with full error handling pipeline
   */
  async handle(
    error: unknown,
    options?: AsyncHandlerOptions
  ): Promise<CategorizedError> {
    return errorHandler.handleError(error, options)
  }

  /**
   * Categorize an error
   */
  categorize(error: unknown): CategorizedError {
    return errorHandler.categorizeError(error)
  }

  /**
   * Create a custom error
   */
  createError(
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
  ): CategorizedError {
    return new CategorizedError(category, message, options)
  }

  /**
   * Register a custom recovery strategy
   */
  registerRecovery(strategy: RecoveryStrategy): void {
    errorHandler.registerRecoveryStrategy(strategy)
  }

  /**
   * Log an error
   */
  log(
    message: string,
    error?: Error,
    context?: LogContext
  ): void {
    logger.error(message, error, context)
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext): void {
    logger.warn(message, context)
  }

  /**
   * Log info
   */
  info(message: string, context?: LogContext): void {
    logger.info(message, context)
  }

  /**
   * Log debug
   */
  debug(message: string, context?: LogContext): void {
    logger.debug(message, context)
  }

  /**
   * Show error toast
   */
  showError(message: string, duration?: number): void {
    toast.error(message, duration)
  }

  /**
   * Show success toast
   */
  showSuccess(message: string, duration?: number): void {
    toast.success(message, duration)
  }

  /**
   * Show warning toast
   */
  showWarning(message: string, duration?: number): void {
    toast.warning(message, duration)
  }

  /**
   * Show info toast
   */
  showInfo(message: string, duration?: number): void {
    toast.info(message, duration)
  }

  /**
   * Handle async operation
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    options?: AsyncHandlerOptions
  ): Promise<T | null> {
    return handleAsync(operation, options)
  }

  /**
   * Safe async operation
   */
  async safeAsync<T>(
    operation: () => Promise<T>,
    options?: AsyncHandlerOptions
  ): Promise<AsyncResult<T>> {
    return safeAsync(operation, options)
  }

  /**
   * Validate and execute
   */
  async validateAndExecute<T>(
    validate: ValidationFunction,
    operation: () => Promise<T>,
    options?: AsyncHandlerOptions
  ): Promise<T | null> {
    return validateAndExecute(validate, operation, options)
  }

  /**
   * Retry async operation
   */
  async retry<T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    return retryAsync(operation, options)
  }

  /**
   * Get recent error logs
   */
  getRecentLogs(count?: number) {
    return logger.getRecentLogs(count)
  }

  /**
   * Export error logs
   */
  exportLogs(): string {
    return logger.exportLogs()
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    logger.clearLogs()
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * Common error scenarios
   */
  errors = {
    /**
     * Network error
     */
    network: (originalError?: unknown) => {
      return this.createError(
        ErrorCategoryEnum.NETWORK,
        'Network error occurred',
        {
          userMessage: 'خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
          originalError,
          severity: ErrorSeverityEnum.HIGH,
          recoverable: true,
        }
      )
    },

    /**
     * Authentication error
     */
    auth: (originalError?: unknown) => {
      return this.createError(
        ErrorCategoryEnum.AUTHENTICATION,
        'Authentication error occurred',
        {
          userMessage: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
          originalError,
          severity: ErrorSeverityEnum.HIGH,
          recoverable: true,
        }
      )
    },

    /**
     * Authorization error
     */
    unauthorized: (originalError?: unknown) => {
      return this.createError(
        ErrorCategoryEnum.AUTHORIZATION,
        'Authorization error occurred',
        {
          userMessage: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
          originalError,
          severity: ErrorSeverityEnum.MEDIUM,
          recoverable: false,
        }
      )
    },

    /**
     * Validation error
     */
    validation: (message: string, originalError?: unknown) => {
      return this.createError(
        ErrorCategoryEnum.VALIDATION,
        message,
        {
          userMessage: message,
          originalError,
          severity: ErrorSeverityEnum.LOW,
          recoverable: false,
        }
      )
    },

    /**
     * Database error
     */
    database: (originalError?: unknown) => {
      return this.createError(
        ErrorCategoryEnum.DATABASE,
        'Database error occurred',
        {
          userMessage: 'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
          originalError,
          severity: ErrorSeverityEnum.HIGH,
          recoverable: true,
        }
      )
    },

    /**
     * Business logic error
     */
    business: (message: string, originalError?: unknown) => {
      return this.createError(
        ErrorCategoryEnum.BUSINESS_LOGIC,
        message,
        {
          userMessage: message,
          originalError,
          severity: ErrorSeverityEnum.MEDIUM,
          recoverable: false,
        }
      )
    },

    /**
     * Unknown error
     */
    unknown: (originalError?: unknown) => {
      return this.createError(
        ErrorCategoryEnum.UNKNOWN,
        'Unknown error occurred',
        {
          userMessage: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
          originalError,
          severity: ErrorSeverityEnum.MEDIUM,
          recoverable: true,
        }
      )
    },
  }
}

// Export singleton instance
export const errorService = new ErrorService()

// Export types
export type {
  CategorizedError,
  RecoveryStrategy,
  AsyncHandlerOptions,
  AsyncResult,
  ValidationFunction,
  RetryOptions,
  LogContext,
}

// Re-export error category and severity
export { ErrorCategoryEnum, ErrorSeverityEnum } from '@/lib/utils/error-handler'
export type { ErrorCategory, ErrorSeverity } from '@/lib/utils/error-handler'

// Also export as values for backward compatibility
export const ErrorCategory = ErrorCategoryEnum
export const ErrorSeverity = ErrorSeverityEnum
