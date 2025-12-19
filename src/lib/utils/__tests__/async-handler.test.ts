/**
 * Tests for Async Handler utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleAsync,
  safeAsync,
  validateAndExecute,
  retryAsync,
} from '../async-handler'
import { toast } from '@/components/ui/toast'

// Mock toast
vi.mock('@/components/ui/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Async Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleAsync', () => {
    it('should return result on success', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const result = await handleAsync(operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalled()
    })

    it('should return null on error', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Failed'))
      const result = await handleAsync(operation, { showToast: false })
      
      expect(result).toBeNull()
    })

    it('should show toast on error', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Failed'))
      await handleAsync(operation, { showToast: true })
      
      expect(toast.error).toHaveBeenCalled()
    })

    it('should call onError callback', async () => {
      const onError = vi.fn()
      const operation = vi.fn().mockRejectedValue(new Error('Failed'))
      
      await handleAsync(operation, { onError, showToast: false })
      
      expect(onError).toHaveBeenCalled()
    })

    it('should rethrow error if requested', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Failed'))
      
      await expect(
        handleAsync(operation, { rethrow: true, showToast: false })
      ).rejects.toThrow('Failed')
    })
  })

  describe('safeAsync', () => {
    it('should return data on success', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const { data, error } = await safeAsync(operation)
      
      expect(data).toBe('success')
      expect(error).toBeNull()
    })

    it('should return error on failure', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Failed'))
      const { data, error } = await safeAsync(operation)
      
      expect(data).toBeNull()
      expect(error).toBeInstanceOf(Error)
      expect(error?.message).toBe('Failed')
    })
  })

  describe('validateAndExecute', () => {
    it('should execute operation when validation passes', async () => {
      const validation = vi.fn().mockReturnValue(true)
      const operation = vi.fn().mockResolvedValue('success')
      
      const result = await validateAndExecute(validation, operation, {
        showToast: false,
      })
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalled()
    })

    it('should not execute when validation fails', async () => {
      const validation = vi.fn().mockReturnValue(false)
      const operation = vi.fn().mockResolvedValue('success')
      
      const result = await validateAndExecute(validation, operation, {
        showToast: false,
      })
      
      expect(result).toBeNull()
      expect(operation).not.toHaveBeenCalled()
    })

    it('should show error message from validation', async () => {
      const validation = vi.fn().mockReturnValue('Validation failed')
      const operation = vi.fn().mockResolvedValue('success')
      
      await validateAndExecute(validation, operation)
      
      expect(toast.error).toHaveBeenCalledWith('Validation failed')
      expect(operation).not.toHaveBeenCalled()
    })
  })

  describe('retryAsync', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const result = await retryAsync(operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue('success')
      
      const result = await retryAsync(operation, {
        maxRetries: 2,
        delayMs: 10,
      })
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('should throw after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Failed'))
      
      await expect(
        retryAsync(operation, { maxRetries: 2, delayMs: 10 })
      ).rejects.toThrow('Failed')
      
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn()
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue('success')
      
      await retryAsync(operation, {
        maxRetries: 2,
        delayMs: 10,
        onRetry,
      })
      
      expect(onRetry).toHaveBeenCalledWith(1)
    })
  })
})
