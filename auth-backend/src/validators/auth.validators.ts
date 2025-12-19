import { z } from 'zod';

/**
 * Register schema with Arabic error messages
 */
export const registerSchema = z.object({
  email: z
    .string({ message: 'البريد الإلكتروني مطلوب' })
    .email('البريد الإلكتروني غير صحيح'),
  password: z
    .string({ message: 'كلمة المرور مطلوبة' })
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  name: z
    .string({ message: 'الاسم مطلوب' })
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  role: z
    .enum(['student', 'teacher'], { message: 'الدور يجب أن يكون طالب أو معلم' })
    .optional()
    .default('student'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login schema with Arabic error messages
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'البريد الإلكتروني مطلوب' })
    .email('البريد الإلكتروني غير صحيح'),
  password: z
    .string({ message: 'كلمة المرور مطلوبة' })
    .min(1, 'كلمة المرور مطلوبة'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Refresh token schema with Arabic error messages
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ message: 'رمز التحديث مطلوب' })
    .min(1, 'رمز التحديث مطلوب'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Forgot password schema with Arabic error messages
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: 'البريد الإلكتروني مطلوب' })
    .email('البريد الإلكتروني غير صحيح'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema with Arabic error messages
 */
export const resetPasswordSchema = z.object({
  token: z
    .string({ message: 'رمز إعادة التعيين مطلوب' })
    .min(1, 'رمز إعادة التعيين مطلوب'),
  newPassword: z
    .string({ message: 'كلمة المرور الجديدة مطلوبة' })
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Verify email schema with Arabic error messages
 */
export const verifyEmailSchema = z.object({
  token: z
    .string({ message: 'رمز التحقق مطلوب' })
    .min(1, 'رمز التحقق مطلوب'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
