import { z } from 'zod';

/**
 * Common validation schemas
 */

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .transform((val) => val.toLowerCase().trim());

// Name validation (supports Arabic and English)
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .transform((val) => val.trim());

// Phone validation
export const phoneSchema = z
  .string()
  .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
  .max(20, 'Phone number too long')
  .optional();

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048, 'URL too long')
  .refine(
    (url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Only HTTP and HTTPS protocols are allowed' }
  );

// Date validation (YYYY-MM-DD)
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
  .refine(
    (date) => {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    },
    { message: 'Invalid date' }
  );

// Time validation (HH:MM)
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)');

// Positive integer validation
export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be positive');

// Non-negative integer validation
export const nonNegativeIntSchema = z
  .number()
  .int('Must be an integer')
  .nonnegative('Must be non-negative');

// Positive number validation
export const positiveNumberSchema = z
  .number()
  .positive('Must be positive');

// Pagination validation
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// Search query validation
export const searchQuerySchema = z
  .string()
  .max(200, 'Search query too long')
  .transform((val) => val.trim());

// Role validation
export const roleSchema = z.enum(['admin', 'teacher', 'student'], {
  message: 'Invalid role',
});

// Status validation for classes
export const classStatusSchema = z.enum(
  ['scheduled', 'in_progress', 'completed', 'cancelled'],
  {
    message: 'Invalid class status',
  }
);

// Credit amount validation
export const creditAmountSchema = z
  .number()
  .min(0.5, 'Minimum credit amount is 0.5')
  .max(100, 'Maximum credit amount is 100')
  .multipleOf(0.5, 'Credit amount must be in increments of 0.5');

// Rating validation
export const ratingSchema = z
  .number()
  .int('Rating must be an integer')
  .min(1, 'Minimum rating is 1')
  .max(5, 'Maximum rating is 5');

// Duration validation (in minutes)
export const durationSchema = z
  .number()
  .int('Duration must be an integer')
  .min(15, 'Minimum duration is 15 minutes')
  .max(180, 'Maximum duration is 180 minutes');

/**
 * User profile validation
 */
export const userProfileSchema = z.object({
  email: emailSchema,
  first_name: nameSchema,
  last_name: nameSchema,
  phone: phoneSchema,
  role: roleSchema.optional(),
});

/**
 * Class session validation
 */
export const classSessionSchema = z.object({
  student_id: uuidSchema,
  teacher_id: uuidSchema,
  date: dateSchema,
  time: timeSchema,
  duration: durationSchema,
  meeting_link: urlSchema,
  is_trial: z.boolean().optional(),
});

/**
 * Credit adjustment validation
 */
export const creditAdjustmentSchema = z.object({
  user_id: uuidSchema,
  amount: z.number().min(-100).max(100),
  reason: z.string().min(1).max(500),
});

/**
 * Review validation
 */
export const reviewSchema = z.object({
  lesson_id: uuidSchema,
  rating: ratingSchema,
  comment: z.string().max(1000).optional(),
});

/**
 * Settings update validation
 */
export const settingsUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(1000),
  description: z.string().max(500).optional(),
});
