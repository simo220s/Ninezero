/**
 * Error Handling Utilities
 * Centralized error handling with Arabic error messages
 */

import { logger } from './logger'
import { toast } from '@/components/ui/toast'

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  code?: string
  statusCode?: number
  details?: unknown

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Error types and their Arabic messages
 */
export const ErrorMessages = {
  // Network errors
  NETWORK_ERROR: 'خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى',
  TIMEOUT_ERROR: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى',
  SERVER_ERROR: 'خطأ في الخادم. يرجى المحاولة لاحقاً',
  
  // Authentication errors
  AUTH_REQUIRED: 'يرجى تسجيل الدخول للمتابعة',
  AUTH_INVALID: 'بيانات تسجيل الدخول غير صحيحة',
  AUTH_EXPIRED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
  AUTH_UNAUTHORIZED: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
  
  // Data loading errors
  LOAD_ERROR: 'حدث خطأ في تحميل البيانات',
  LOAD_CLASSES_ERROR: 'حدث خطأ في تحميل الحصص',
  LOAD_SUBSCRIPTION_ERROR: 'حدث خطأ في تحميل بيانات الاشتراك',
  LOAD_CREDITS_ERROR: 'حدث خطأ في تحميل بيانات الرصيد',
  LOAD_PROFILE_ERROR: 'حدث خطأ في تحميل بيانات الملف الشخصي',
  
  // Form validation errors
  VALIDATION_ERROR: 'يرجى التحقق من البيانات المدخلة',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  PASSWORD_TOO_SHORT: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  PASSWORDS_DONT_MATCH: 'كلمات المرور غير متطابقة',
  
  // Booking errors
  BOOKING_ERROR: 'حدث خطأ في حجز الحصة',
  BOOKING_CONFLICT: 'يوجد حجز آخر في نفس الوقت',
  INSUFFICIENT_CREDITS: 'رصيدك غير كافٍ لحجز هذه الحصة',
  SLOT_UNAVAILABLE: 'هذا الموعد غير متاح',
  
  // Subscription errors
  SUBSCRIPTION_ERROR: 'حدث خطأ في معالجة الاشتراك',
  PAYMENT_ERROR: 'حدث خطأ في معالجة الدفع',
  CANCELLATION_ERROR: 'حدث خطأ في إلغاء الاشتراك',
  DISCOUNT_ERROR: 'حدث خطأ في تطبيق الخصم',
  
  // Generic errors
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
  NOT_FOUND: 'الصفحة المطلوبة غير موجودة',
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا المحتوى',
} as const

/**
 * Error codes mapping
 */
export const ErrorCodes = {
  // HTTP status codes
  400: 'VALIDATION_ERROR',
  401: 'AUTH_REQUIRED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  408: 'TIMEOUT_ERROR',
  500: 'SERVER_ERROR',
  503: 'SERVER_ERROR',
  
  // Custom error codes
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
} as const

/**
 * Get Arabic error message for error code
 */
export function getErrorMessage(code: string | number): string {
  // Handle HTTP status codes
  if (typeof code === 'number') {
    const errorCode = ErrorCodes[code as keyof typeof ErrorCodes]
    if (errorCode && errorCode in ErrorMessages) {
      return ErrorMessages[errorCode as keyof typeof ErrorMessages]
    }
  }
  
  // Handle custom error codes
  if (typeof code === 'string' && code in ErrorMessages) {
    return ErrorMessages[code as keyof typeof ErrorMessages]
  }
  
  return ErrorMessages.UNKNOWN_ERROR
}

/**
 * Handle API errors and show appropriate toast messages
 */
export function handleApiError(error: unknown, context?: string): void {
  logger.error(`API Error${context ? ` in ${context}` : ''}:`, error)
  
  let message: string = ErrorMessages.UNKNOWN_ERROR
  
  if (error instanceof AppError) {
    message = error.message
  } else if (error && typeof error === 'object') {
    // Handle Supabase errors
    if ('message' in error && typeof error.message === 'string') {
      // Check if it's a known error pattern
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        message = ErrorMessages.NETWORK_ERROR
      } else if (errorMsg.includes('timeout')) {
        message = ErrorMessages.TIMEOUT_ERROR
      } else if (errorMsg.includes('unauthorized') || errorMsg.includes('auth')) {
        message = ErrorMessages.AUTH_REQUIRED
      } else if (errorMsg.includes('not found')) {
        message = ErrorMessages.NOT_FOUND
      } else {
        message = ErrorMessages.UNKNOWN_ERROR
      }
    }
    
    // Handle HTTP status codes
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      const statusMessage = getErrorMessage(error.statusCode)
      if (statusMessage) {
        message = statusMessage
      }
    }
  }
  
  toast.error(message)
}

/**
 * Handle form validation errors
 */
export function handleValidationError(field: string, error: string): string {
  logger.warn(`Validation error for ${field}:`, error)
  
  // Map common validation errors to Arabic messages
  if (error.includes('required')) {
    return ErrorMessages.REQUIRED_FIELD
  } else if (error.includes('email')) {
    return ErrorMessages.INVALID_EMAIL
  } else if (error.includes('phone')) {
    return ErrorMessages.INVALID_PHONE
  } else if (error.includes('password')) {
    if (error.includes('short') || error.includes('length')) {
      return ErrorMessages.PASSWORD_TOO_SHORT
    } else if (error.includes('match')) {
      return ErrorMessages.PASSWORDS_DONT_MATCH
    }
  }
  
  return ErrorMessages.VALIDATION_ERROR
}

/**
 * Retry mechanism for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error)
      
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
  }
  
  // All retries failed
  throw lastError
}

/**
 * Safe async operation wrapper with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const message = getErrorMessage('UNKNOWN_ERROR')
    handleApiError(error, errorContext)
    return { data: null, error: message }
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      const msg = error.message.toLowerCase()
      return msg.includes('network') || msg.includes('fetch') || msg.includes('connection')
    }
  }
  return false
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('statusCode' in error && error.statusCode === 401) {
      return true
    }
    if ('message' in error && typeof error.message === 'string') {
      const msg = error.message.toLowerCase()
      return msg.includes('unauthorized') || msg.includes('auth') || msg.includes('token')
    }
  }
  return false
}
