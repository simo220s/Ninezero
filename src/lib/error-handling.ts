// Error handling utilities for the Saudi English Club platform

import { logger } from './utils/logger'

export interface ErrorMessage {
  code: string
  message: string
}

// Arabic error messages
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  NETWORK_ERROR: 'خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
  TIMEOUT_ERROR: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
  
  // Authentication errors
  UNAUTHORIZED: 'غير مصرح لك بهذا الإجراء. يرجى تسجيل الدخول.',
  SESSION_EXPIRED: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة.',
  
  // Class management errors
  CLASS_CONFLICT: 'يوجد حصة أخرى في نفس الوقت.',
  STUDENT_NOT_FOUND: 'الطالب غير موجود.',
  TEACHER_NOT_FOUND: 'المعلم غير موجود.',
  CLASS_NOT_FOUND: 'الحصة غير موجودة.',
  INVALID_DATE: 'التاريخ غير صحيح.',
  PAST_DATE: 'لا يمكن حجز حصة في الماضي.',
  INVALID_TIME: 'الوقت غير صحيح.',
  INVALID_DURATION: 'المدة غير صحيحة.',
  INVALID_MEETING_LINK: 'رابط الاجتماع غير صحيح.',
  
  // Credits errors
  NO_CREDITS: 'رصيد الحصص غير كافٍ.',
  INSUFFICIENT_CREDITS: 'رصيدك الحالي غير كافٍ لإتمام هذه العملية.',
  CREDIT_DEDUCTION_FAILED: 'فشل خصم الرصيد. يرجى المحاولة مرة أخرى.',
  
  // Validation errors
  REQUIRED_FIELD: 'هذا الحقل مطلوب.',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح.',
  INVALID_PHONE: 'رقم الهاتف غير صحيح.',
  INVALID_URL: 'الرابط غير صحيح.',
  
  // Student conversion errors
  CONVERSION_FAILED: 'فشل تحويل الطالب. يرجى المحاولة مرة أخرى.',
  ALREADY_CONVERTED: 'تم تحويل هذا الطالب مسبقاً.',
  NOT_TRIAL_STUDENT: 'هذا الطالب ليس طالباً تجريبياً.',
  
  // Booking errors
  BOOKING_FAILED: 'فشل حجز الحصة. يرجى المحاولة مرة أخرى.',
  APPOINTMENT_NOT_FOUND: 'الموعد غير موجود.',
  CANCELLATION_FAILED: 'فشل إلغاء الحصة. يرجى المحاولة مرة أخرى.',
  
  // Database errors
  DATABASE_ERROR: 'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
  QUERY_FAILED: 'فشل تنفيذ العملية. يرجى المحاولة مرة أخرى.',
  
  // Generic errors
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  OPERATION_FAILED: 'فشلت العملية. يرجى المحاولة مرة أخرى.',
}

// Error types
export const ErrorTypeEnum = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  DATABASE: 'DATABASE',
  BUSINESS_LOGIC: 'BUSINESS_LOGIC',
  UNKNOWN: 'UNKNOWN',
} as const

export type ErrorType = typeof ErrorTypeEnum[keyof typeof ErrorTypeEnum]

export class AppError extends Error {
  type: ErrorType
  code: string
  userMessage: string
  originalError?: unknown

  constructor(
    type: ErrorType,
    code: string,
    userMessage?: string,
    originalError?: unknown
  ) {
    super(userMessage || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR)
    this.type = type
    this.code = code
    this.userMessage = userMessage || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR
    this.originalError = originalError
    this.name = 'AppError'
  }
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
  shouldRetry?: (error: unknown) => boolean
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error) => {
    // Retry on network errors and 5xx server errors
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return true
    }
    if (error?.status >= 500 && error?.status < 600) {
      return true
    }
    return false
  }
}

// Retry mechanism with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: unknown
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Check if we should retry
      const shouldRetry = finalConfig.shouldRetry?.(error) ?? false
      
      if (!shouldRetry || attempt === finalConfig.maxAttempts) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = finalConfig.delayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1)
      
      logger.log(`Retry attempt ${attempt}/${finalConfig.maxAttempts} after ${delay}ms`)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Parse Supabase errors
export function parseSupabaseError(error: unknown): AppError {
  if (!error) {
    return new AppError(ErrorTypeEnum.UNKNOWN, 'UNKNOWN_ERROR')
  }

  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return new AppError(ErrorTypeEnum.NETWORK, 'NETWORK_ERROR', undefined, error)
  }

  // Authentication errors
  if (error.message?.includes('JWT') || error.message?.includes('token')) {
    return new AppError(ErrorTypeEnum.AUTHENTICATION, 'SESSION_EXPIRED', undefined, error)
  }

  if (error.status === 401) {
    return new AppError(ErrorTypeEnum.AUTHENTICATION, 'UNAUTHORIZED', undefined, error)
  }

  // Authorization errors
  if (error.status === 403) {
    return new AppError(ErrorTypeEnum.AUTHORIZATION, 'UNAUTHORIZED', undefined, error)
  }

  // Conflict errors (409)
  if (error.status === 409 || error.code === '409') {
    return new AppError(ErrorTypeEnum.DATABASE, 'CLASS_CONFLICT', 'يوجد حصة أخرى في نفس الوقت أو تعارض في البيانات', error)
  }

  // Database errors
  if (error.code?.startsWith('23')) {
    // PostgreSQL constraint violations
    if (error.code === '23505') {
      return new AppError(ErrorTypeEnum.DATABASE, 'CLASS_CONFLICT', 'يوجد تعارض في البيانات', error)
    }
    if (error.code === '23503') {
      return new AppError(ErrorTypeEnum.DATABASE, 'STUDENT_NOT_FOUND', 'الطالب أو المعلم غير موجود', error)
    }
    return new AppError(ErrorTypeEnum.DATABASE, 'DATABASE_ERROR', undefined, error)
  }

  // Server errors
  if (error.status >= 500) {
    return new AppError(ErrorTypeEnum.DATABASE, 'SERVER_ERROR', undefined, error)
  }

  // Default to unknown error
  return new AppError(
    ErrorTypeEnum.UNKNOWN,
    'UNKNOWN_ERROR',
    error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    error
  )
}

// Handle errors and return user-friendly messages
export function handleError(error: unknown): string {
  logger.error('Error occurred:', error)

  if (error instanceof AppError) {
    return error.userMessage
  }

  const parsedError = parseSupabaseError(error)
  return parsedError.userMessage
}

// Validation helpers
export function validateMeetingLink(link: string): boolean {
  try {
    const url = new URL(link)
    return url.hostname.includes('meet.google.com')
  } catch {
    return false
  }
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date > now && !isNaN(date.getTime())
}

export function validateTime(timeString: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeString)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Network status checker
export function isOnline(): boolean {
  return navigator.onLine
}

// Show user-friendly error notification
export function showErrorNotification(error: unknown, fallbackMessage?: string): void {
  const message = handleError(error) || fallbackMessage || ERROR_MESSAGES.UNKNOWN_ERROR
  
  // You can integrate with a toast notification library here
  // For now, we'll use alert as a fallback
  if (typeof window !== 'undefined') {
    // Check if a toast library is available
    // Otherwise fall back to console.error
    logger.error('Error:', message)
  }
}
