/**
 * Tests for Error Handling utilities
 */

import { describe, it, expect } from 'vitest'
import {
  AppError,
  ErrorType,
  handleError,
  parseSupabaseError,
  ERROR_MESSAGES,
} from '../error-handling'

describe('Error Handling', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(
        ErrorType.VALIDATION,
        'INVALID_EMAIL',
        'البريد الإلكتروني غير صحيح'
      )

      expect(error.type).toBe(ErrorType.VALIDATION)
      expect(error.code).toBe('INVALID_EMAIL')
      expect(error.userMessage).toBe('البريد الإلكتروني غير صحيح')
      expect(error.name).toBe('AppError')
    })

    it('should use default message from ERROR_MESSAGES', () => {
      const error = new AppError(ErrorType.NETWORK, 'NETWORK_ERROR')

      expect(error.userMessage).toBe(ERROR_MESSAGES.NETWORK_ERROR)
    })

    it('should store original error', () => {
      const originalError = new Error('Original')
      const error = new AppError(
        ErrorType.DATABASE,
        'DATABASE_ERROR',
        undefined,
        originalError
      )

      expect(error.originalError).toBe(originalError)
    })
  })

  describe('handleError', () => {
    it('should return user message from AppError', () => {
      const error = new AppError(
        ErrorType.VALIDATION,
        'INVALID_EMAIL',
        'البريد الإلكتروني غير صحيح'
      )

      const message = handleError(error)
      expect(message).toBe('البريد الإلكتروني غير صحيح')
    })

    it('should parse unknown errors', () => {
      const error = new Error('Unknown error')
      const message = handleError(error)
      
      expect(message).toBeTruthy()
      expect(typeof message).toBe('string')
    })

    it('should handle null/undefined errors', () => {
      const message = handleError(null)
      expect(message).toBe(ERROR_MESSAGES.UNKNOWN_ERROR)
    })
  })

  describe('parseSupabaseError', () => {
    it('should parse network errors', () => {
      const error = { message: 'Failed to fetch' }
      const parsed = parseSupabaseError(error)

      expect(parsed.type).toBe(ErrorType.NETWORK)
      expect(parsed.code).toBe('NETWORK_ERROR')
    })

    it('should parse authentication errors', () => {
      const error = { status: 401 }
      const parsed = parseSupabaseError(error)

      expect(parsed.type).toBe(ErrorType.AUTHENTICATION)
      expect(parsed.code).toBe('UNAUTHORIZED')
    })

    it('should parse authorization errors', () => {
      const error = { status: 403 }
      const parsed = parseSupabaseError(error)

      expect(parsed.type).toBe(ErrorType.AUTHORIZATION)
    })

    it('should parse conflict errors', () => {
      const error = { status: 409 }
      const parsed = parseSupabaseError(error)

      expect(parsed.type).toBe(ErrorType.DATABASE)
      expect(parsed.code).toBe('CLASS_CONFLICT')
    })

    it('should parse database constraint violations', () => {
      const error = { code: '23505' }
      const parsed = parseSupabaseError(error)

      expect(parsed.type).toBe(ErrorType.DATABASE)
    })

    it('should parse server errors', () => {
      const error = { status: 500 }
      const parsed = parseSupabaseError(error)

      expect(parsed.type).toBe(ErrorType.DATABASE)
      expect(parsed.code).toBe('SERVER_ERROR')
    })

    it('should handle unknown errors', () => {
      const error = { message: 'Something went wrong' }
      const parsed = parseSupabaseError(error)

      expect(parsed.type).toBe(ErrorType.UNKNOWN)
      expect(parsed.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have Arabic messages', () => {
      expect(ERROR_MESSAGES.NETWORK_ERROR).toContain('خطأ')
      expect(ERROR_MESSAGES.UNAUTHORIZED).toContain('غير مصرح')
      expect(ERROR_MESSAGES.NO_CREDITS).toContain('رصيد')
    })

    it('should have all required error codes', () => {
      const requiredCodes = [
        'NETWORK_ERROR',
        'UNAUTHORIZED',
        'INVALID_EMAIL',
        'NO_CREDITS',
        'DATABASE_ERROR',
        'UNKNOWN_ERROR',
      ]

      requiredCodes.forEach((code) => {
        expect(ERROR_MESSAGES[code]).toBeTruthy()
      })
    })
  })
})
