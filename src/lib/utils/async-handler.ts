/**
 * Async Operation Handlers
 * Utilities for handling async operations with error handling and retry logic
 */

import { errorHandler, CategorizedError, ErrorCategoryEnum } from './error-handler'
import { logger } from './logger'
import { toast } from '@/components/ui/toast'

/**
 * Options for async handlers
 */
export interface AsyncHandlerOptions {
  showToast?: boolean
  toastMessage?: string
  logError?: boolean
  attemptRecovery?: boolean
  context?: Record<string, unknown>
}

/**
 * Result type for safe async operations
 */
export interface AsyncResult<T> {
  data: T | null
  error: CategorizedError | null
  success: boolean
}

/**
 * Handle async operations with automatic error handling
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  options: AsyncHandlerOptions = {}
): Promise<T | null> {
  try {
    const result = await operation()
    return result
  } catch (error) {
    await errorHandler.handleError(error, {
      showToast: options.showToast ?? true,
      logError: options.logError ?? true,
      attemptRecovery: options.attemptRecovery ?? false,
      context: options.context,
    })
    return null
  }
}

/**
 * Safe async operation that returns result object
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  options: AsyncHandlerOptions = {}
): Promise<AsyncResult<T>> {
  try {
    const data = await operation()
    return {
      data,
      error: null,
      success: true,
    }
  } catch (error) {
    const categorizedError = await errorHandler.handleError(error, {
      showToast: options.showToast ?? false,
      logError: options.logError ?? true,
      attemptRecovery: options.attemptRecovery ?? false,
      context: options.context,
    })
    
    return {
      data: null,
      error: categorizedError,
      success: false,
    }
  }
}

/**
 * Validation function type
 */
export type ValidationFunction = () => true | string

/**
 * Validate before executing async operation
 */
export async function validateAndExecute<T>(
  validate: ValidationFunction,
  operation: () => Promise<T>,
  options: AsyncHandlerOptions = {}
): Promise<T | null> {
  const validationResult = validate()
  
  if (validationResult !== true) {
    new CategorizedError(
      ErrorCategoryEnum.VALIDATION,
      validationResult,
      {
        userMessage: validationResult,
        recoverable: false,
      }
    )
    
    if (options.showToast !== false) {
      toast.error(validationResult)
    }
    
    if (options.logError !== false) {
      logger.warn('Validation failed', { metadata: { message: validationResult } })
    }
    
    return null
  }
  
  return handleAsync(operation, options)
}

/**
 * Retry configuration
 */
export interface RetryOptions {
  maxRetries?: number
  delayMs?: number
  backoffMultiplier?: number
  shouldRetry?: (error: CategorizedError, attempt: number) => boolean
  onRetry?: (attempt: number, error: CategorizedError) => void
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    shouldRetry,
    onRetry,
  } = options

  let lastError: CategorizedError | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = errorHandler.categorizeError(error)
      
      // Check if we should retry
      const defaultShouldRetry = 
        lastError.category === ErrorCategoryEnum.NETWORK ||
        lastError.category === ErrorCategoryEnum.DATABASE
      
      const willRetry = shouldRetry 
        ? shouldRetry(lastError, attempt)
        : defaultShouldRetry && attempt < maxRetries
      
      if (!willRetry) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1)
      
      // Call retry callback
      if (onRetry) {
        onRetry(attempt, lastError)
      } else {
        logger.info(`Retrying operation (attempt ${attempt}/${maxRetries})`, {
          metadata: { delay, error: lastError.message },
        })
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Execute multiple async operations in parallel with error handling
 */
export async function parallelAsync<T>(
  operations: Array<() => Promise<T>>,
  options: AsyncHandlerOptions = {}
): Promise<AsyncResult<T>[]> {
  const promises = operations.map(op => safeAsync(op, options))
  return Promise.all(promises)
}

/**
 * Execute async operations in sequence with error handling
 */
export async function sequentialAsync<T>(
  operations: Array<() => Promise<T>>,
  options: AsyncHandlerOptions & { stopOnError?: boolean } = {}
): Promise<AsyncResult<T>[]> {
  const results: AsyncResult<T>[] = []
  
  for (const operation of operations) {
    const result = await safeAsync(operation, options)
    results.push(result)
    
    if (!result.success && options.stopOnError) {
      break
    }
  }
  
  return results
}

/**
 * Debounced async operation
 */
export function debounceAsync<T extends unknown[]>(
  operation: (...args: T) => Promise<unknown>,
  delayMs: number
): (...args: T) => Promise<void> {
  let timeoutId: NodeJS.Timeout | null = null
  
  return async (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        await operation(...args)
        resolve()
      }, delayMs)
    })
  }
}

/**
 * Throttled async operation
 */
export function throttleAsync<T extends unknown[]>(
  operation: (...args: T) => Promise<unknown>,
  delayMs: number
): (...args: T) => Promise<void> {
  let lastRun = 0
  let timeoutId: NodeJS.Timeout | null = null
  
  return async (...args: T) => {
    const now = Date.now()
    
    if (now - lastRun >= delayMs) {
      lastRun = now
      await operation(...args)
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(async () => {
        lastRun = Date.now()
        await operation(...args)
      }, delayMs - (now - lastRun))
    }
  }
}

/**
 * Timeout wrapper for async operations
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'انتهت مهلة العملية'
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new CategorizedError(
          ErrorCategoryEnum.NETWORK,
          'Operation timeout',
          {
            userMessage: timeoutMessage,
            recoverable: true,
          }
        ))
      }, timeoutMs)
    }),
  ])
}

