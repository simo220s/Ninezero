/**
 * Centralized Error Handling System
 * 
 * This module provides a comprehensive error handling system with:
 * - Error categorization (network, validation, auth, runtime, etc.)
 * - Error logging with different log levels
 * - User-friendly error messages in Arabic
 * - Error recovery mechanisms
 * - Async operation handlers with retry logic
 * - Global error boundary for React components
 * 
 * @example
 * ```typescript
 * import { errorService } from '@/lib/error-handling'
 * 
 * // Handle async operations
 * const data = await errorService.handleAsync(
 *   async () => await fetchData(),
 *   { showToast: true }
 * )
 * 
 * // With validation
 * await errorService.validateAndExecute(
 *   () => email ? true : 'البريد الإلكتروني مطلوب',
 *   async () => await sendEmail(email)
 * )
 * 
 * // With retry
 * const result = await errorService.retry(
 *   () => unstableOperation(),
 *   { maxRetries: 3 }
 * )
 * ```
 */

// Main error service (recommended)
export { errorService } from '@/lib/services/error-service'

// Core utilities
export { logger } from '@/lib/utils/logger'
export { errorHandler } from '@/lib/utils/error-handler'
export {
  handleAsync,
  safeAsync,
  validateAndExecute,
  retryAsync,
  parallelAsync,
  sequentialAsync,
  debounceAsync,
  throttleAsync,
  withTimeout,
} from '@/lib/utils/async-handler'

// Types
export type {
  CategorizedError,
  RecoveryStrategy,
  AsyncHandlerOptions,
  AsyncResult,
  ValidationFunction,
  RetryOptions,
  LogContext,
} from '@/lib/services/error-service'

export type { LogEntry } from '@/lib/utils/logger'

// Re-export error categories and severities
export { ErrorCategory, ErrorSeverity } from '@/lib/utils/error-handler'
export type { ErrorCategory as ErrorCategoryType, ErrorSeverity as ErrorSeverityType } from '@/lib/utils/error-handler'

// UI Components
export { default as ErrorBoundary } from '@/components/ui/error-boundary'
export { PageErrorBoundary } from '@/components/ui/page-error-boundary'
export {
  InlineError,
  ErrorCard,
  ErrorPage,
  EmptyState,
  NetworkError,
  NotFoundError,
  PermissionError,
  ErrorMessage,
} from '@/components/ui/error-message'
export {
  InlineError as InlineErrorDisplay,
  CardError,
  FullPageError,
  EmptyState as EmptyStateDisplay,
  FormFieldError,
} from '@/components/ui/error-display'

// Toast notifications
export { toast, useToast, ToastContainer } from '@/components/ui/toast'
export type { ToastType, ToastMessage } from '@/components/ui/toast'

// Legacy exports for backward compatibility
export { ERROR_MESSAGES, ErrorType, AppError } from '@/lib/error-handling.ts'
export { ErrorMessages, ErrorCodes, AppError as LegacyAppError } from '@/lib/errors'
