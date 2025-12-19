/**
 * Booking Form Validation Schemas
 * Validation for class booking forms
 */

import { z } from 'zod'
import {
  nameSchema,
  phoneSchema,
  optionalPhoneSchema,
  futureDateSchema,
  timeSchema,
  ValidationMessages,
} from './form-validation'

/**
 * Trial class booking schema
 */
export const trialBookingSchema = z.object({
  studentName: nameSchema,
  parentName: nameSchema.optional(),
  phone: phoneSchema,
  email: z.string().email(ValidationMessages.INVALID_EMAIL).optional(),
  date: futureDateSchema,
  time: timeSchema,
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
})

/**
 * Regular class booking schema
 */
export const regularBookingSchema = z.object({
  date: futureDateSchema,
  time: timeSchema,
  duration: z.number().min(30, 'المدة يجب أن تكون 30 دقيقة على الأقل').max(120, 'المدة يجب أن تكون 120 دقيقة كحد أقصى'),
  classType: z.enum(['individual', 'group'], {
    message: ValidationMessages.REQUIRED_SELECTION,
  }),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
})

/**
 * Reschedule class schema
 */
export const rescheduleSchema = z.object({
  classId: z.string().min(1, ValidationMessages.REQUIRED),
  newDate: futureDateSchema,
  newTime: timeSchema,
  reason: z.string().min(1, 'يرجى ذكر سبب إعادة الجدولة').max(500, 'السبب طويل جداً'),
})

/**
 * Cancel class schema
 */
export const cancelClassSchema = z.object({
  classId: z.string().min(1, ValidationMessages.REQUIRED),
  reason: z.string().min(1, 'يرجى ذكر سبب الإلغاء').max(500, 'السبب طويل جداً'),
  refundRequested: z.boolean().optional(),
})

/**
 * Contact form schema (for booking inquiries)
 */
export const contactFormSchema = z.object({
  name: nameSchema,
  email: z.string().email(ValidationMessages.INVALID_EMAIL),
  phone: optionalPhoneSchema,
  subject: z.string().min(1, 'الموضوع مطلوب').max(200, 'الموضوع طويل جداً'),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل').max(1000, 'الرسالة طويلة جداً'),
})

/**
 * Type exports
 */
export type TrialBookingData = z.infer<typeof trialBookingSchema>
export type RegularBookingData = z.infer<typeof regularBookingSchema>
export type RescheduleData = z.infer<typeof rescheduleSchema>
export type CancelClassData = z.infer<typeof cancelClassSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
