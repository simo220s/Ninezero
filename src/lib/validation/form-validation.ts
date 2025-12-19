/**
 * Form Validation Utilities
 * Comprehensive validation functions with Arabic error messages
 */

import { z } from 'zod'

/**
 * Common validation error messages in Arabic
 */
export const ValidationMessages = {
  // Required fields
  REQUIRED: 'هذا الحقل مطلوب',
  REQUIRED_NAME: 'الاسم مطلوب',
  REQUIRED_EMAIL: 'البريد الإلكتروني مطلوب',
  REQUIRED_PASSWORD: 'كلمة المرور مطلوبة',
  REQUIRED_PHONE: 'رقم الهاتف مطلوب',
  REQUIRED_DATE: 'التاريخ مطلوب',
  REQUIRED_TIME: 'الوقت مطلوب',
  
  // Email validation
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  EMAIL_FORMAT: 'يرجى إدخال بريد إلكتروني صحيح',
  
  // Password validation
  PASSWORD_MIN_LENGTH: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  PASSWORD_WEAK: 'كلمة المرور ضعيفة. يجب أن تحتوي على حرف كبير وحرف صغير ورقم',
  PASSWORD_NO_NUMBER: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل',
  PASSWORD_NO_UPPERCASE: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل',
  PASSWORD_NO_LOWERCASE: 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل',
  PASSWORDS_DONT_MATCH: 'كلمات المرور غير متطابقة',
  
  // Name validation
  NAME_MIN_LENGTH: 'الاسم يجب أن يكون حرفين على الأقل',
  NAME_MAX_LENGTH: 'الاسم طويل جداً',
  NAME_INVALID_CHARS: 'الاسم يحتوي على أحرف غير صالحة',
  
  // Phone validation
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  PHONE_FORMAT: 'يرجى إدخال رقم هاتف صحيح (مثال: 0501234567)',
  PHONE_MIN_LENGTH: 'رقم الهاتف قصير جداً',
  PHONE_MAX_LENGTH: 'رقم الهاتف طويل جداً',
  
  // Date and time validation
  INVALID_DATE: 'التاريخ غير صحيح',
  DATE_IN_PAST: 'التاريخ يجب أن يكون في المستقبل',
  DATE_TOO_FAR: 'التاريخ بعيد جداً',
  INVALID_TIME: 'الوقت غير صحيح',
  
  // Number validation
  INVALID_NUMBER: 'يرجى إدخال رقم صحيح',
  NUMBER_TOO_SMALL: 'الرقم صغير جداً',
  NUMBER_TOO_LARGE: 'الرقم كبير جداً',
  NUMBER_POSITIVE: 'الرقم يجب أن يكون موجباً',
  
  // Selection validation
  REQUIRED_SELECTION: 'يرجى اختيار خيار',
  INVALID_SELECTION: 'الخيار المحدد غير صالح',
  
  // File validation
  FILE_REQUIRED: 'يرجى اختيار ملف',
  FILE_TOO_LARGE: 'حجم الملف كبير جداً',
  FILE_INVALID_TYPE: 'نوع الملف غير مدعوم',
  
  // General validation
  INVALID_FORMAT: 'التنسيق غير صحيح',
  TOO_SHORT: 'القيمة قصيرة جداً',
  TOO_LONG: 'القيمة طويلة جداً',
} as const

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, ValidationMessages.REQUIRED_EMAIL)
  .email(ValidationMessages.INVALID_EMAIL)
  .toLowerCase()
  .trim()

/**
 * Password validation schema (basic - for login)
 */
export const passwordSchema = z
  .string()
  .min(1, ValidationMessages.REQUIRED_PASSWORD)

/**
 * Strong password validation schema (for signup/change password)
 */
export const strongPasswordSchema = z
  .string()
  .min(1, ValidationMessages.REQUIRED_PASSWORD)
  .min(8, ValidationMessages.PASSWORD_MIN_LENGTH)
  .regex(/[0-9]/, ValidationMessages.PASSWORD_NO_NUMBER)
  .regex(/[a-z]/, ValidationMessages.PASSWORD_NO_LOWERCASE)
  .regex(/[A-Z]/, ValidationMessages.PASSWORD_NO_UPPERCASE)

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, ValidationMessages.REQUIRED_NAME)
  .min(2, ValidationMessages.NAME_MIN_LENGTH)
  .max(100, ValidationMessages.NAME_MAX_LENGTH)
  .trim()

/**
 * Phone number validation schema (Saudi format)
 */
export const phoneSchema = z
  .string()
  .min(1, ValidationMessages.REQUIRED_PHONE)
  .regex(/^(05|5)[0-9]{8}$/, ValidationMessages.PHONE_FORMAT)
  .trim()

/**
 * Optional phone number validation schema
 */
export const optionalPhoneSchema = z
  .string()
  .regex(/^(05|5)[0-9]{8}$/, ValidationMessages.PHONE_FORMAT)
  .trim()
  .optional()
  .or(z.literal(''))

/**
 * Date validation schema (future dates only)
 */
export const futureDateSchema = z
  .string()
  .min(1, ValidationMessages.REQUIRED_DATE)
  .refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }, ValidationMessages.DATE_IN_PAST)

/**
 * Time validation schema
 */
export const timeSchema = z
  .string()
  .min(1, ValidationMessages.REQUIRED_TIME)
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, ValidationMessages.INVALID_TIME)

/**
 * Positive number validation schema
 */
export const positiveNumberSchema = z
  .number()
  .positive(ValidationMessages.NUMBER_POSITIVE)

/**
 * Validate password confirmation
 */
export function createPasswordConfirmationSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  return schema.refine(
    (data: any) => data.password === data.confirmPassword,
    {
      message: ValidationMessages.PASSWORDS_DONT_MATCH,
      path: ['confirmPassword'],
    }
  )
}

/**
 * Real-time validation helper
 * Returns validation result with Arabic error message
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: boolean; error?: string } {
  const result = schema.safeParse(value)
  
  if (result.success) {
    return { success: true }
  }
  
  const firstError = result.error.issues[0]
  return {
    success: false,
    error: firstError?.message || ValidationMessages.INVALID_FORMAT,
  }
}

/**
 * Validate entire form
 * Returns object with field errors
 */
export function validateForm<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): { success: boolean; errors?: Record<string, string> } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true }
  }
  
  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue: z.ZodIssue) => {
    const path = issue.path.join('.')
    errors[path] = issue.message
  })
  
  return { success: false, errors }
}

/**
 * Custom validation functions
 */

/**
 * Validate Saudi phone number
 */
export function isValidSaudiPhone(phone: string): boolean {
  return /^(05|5)[0-9]{8}$/.test(phone)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Check password strength
 */
export function getPasswordStrength(password: string): {
  score: number
  message: string
} {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  const messages = [
    'ضعيفة جداً',
    'ضعيفة',
    'متوسطة',
    'جيدة',
    'قوية',
    'قوية جداً',
  ]
  
  return {
    score,
    message: messages[Math.min(score, messages.length - 1)],
  }
}

/**
 * Sanitize input (remove dangerous characters)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as: 05XX XXX XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  bio: z.string().max(500, 'السيرة الذاتية طويلة جداً').optional(),
  avatar: z.string().url('رابط الصورة غير صحيح').optional(),
})

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
