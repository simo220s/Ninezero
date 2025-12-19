/**
 * Async Action Hook
 * 
 * Manages loading states for async button actions with proper
 * error handling and user feedback
 */

import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/toast'

export interface AsyncActionOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface AsyncActionResult<T extends (...args: any[]) => Promise<any>> {
  execute: T
  isLoading: boolean
  error: Error | null
  reset: () => void
}

/**
 * Hook for managing async actions with loading states
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: AsyncActionOptions = {}
): AsyncActionResult<T> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await action(...args)

        if (options.successMessage) {
          toast.success(options.successMessage)
        }

        options.onSuccess?.()

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('حدث خطأ غير متوقع')
        setError(error)

        if (options.errorMessage) {
          toast.error(options.errorMessage)
        } else {
          toast.error(error.message)
        }

        options.onError?.(error)

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [action, options]
  ) as T

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    reset,
  }
}

/**
 * Hook for managing multiple async actions
 */
export function useAsyncActions<T extends Record<string, (...args: any[]) => Promise<any>>>(
  actions: T
): {
  [K in keyof T]: AsyncActionResult<T[K]>
} {
  const results = {} as {
    [K in keyof T]: AsyncActionResult<T[K]>
  }

  for (const key in actions) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key] = useAsyncAction(actions[key])
  }

  return results
}

/**
 * Hook for debounced async actions (useful for search)
 */
export function useDebouncedAsyncAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  delay: number = 300,
  options: AsyncActionOptions = {}
): AsyncActionResult<T> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      setIsLoading(true)
      setError(null)

      return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
        const id = setTimeout(async () => {
          try {
            const result = await action(...args)

            if (options.successMessage) {
              toast.success(options.successMessage)
            }

            options.onSuccess?.()
            resolve(result)
          } catch (err) {
            const error = err instanceof Error ? err : new Error('حدث خطأ غير متوقع')
            setError(error)

            if (options.errorMessage) {
              toast.error(options.errorMessage)
            } else {
              toast.error(error.message)
            }

            options.onError?.(error)
            reject(error)
          } finally {
            setIsLoading(false)
          }
        }, delay)

        setTimeoutId(id)
      })
    },
    [action, delay, options, timeoutId]
  ) as T

  const reset = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    setIsLoading(false)
    setError(null)
  }, [timeoutId])

  return {
    execute,
    isLoading,
    error,
    reset,
  }
}
