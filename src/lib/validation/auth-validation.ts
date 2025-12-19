import { z } from 'zod'
import {
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  nameSchema,
  ValidationMessages,
} from './form-validation'

/**
 * Login form validation schema
 * Used for both student and teacher login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
})

/**
 * Signup form validation schema
 * Enhanced with comprehensive validation
 */
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
  role: z.enum(['student', 'teacher', 'parent'], {
    message: ValidationMessages.REQUIRED_SELECTION,
  }).optional(),
})

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

/**
 * Password reset schema (with confirmation)
 */
export const passwordResetSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, ValidationMessages.REQUIRED_PASSWORD),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  })

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, ValidationMessages.REQUIRED_PASSWORD),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  })

/**
 * Type exports for form data
 */
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetData = z.infer<typeof passwordResetSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>
