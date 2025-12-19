/**
 * Validation Schemas Index
 * 
 * Central export point for all validation schemas
 * Makes imports cleaner and more organized
 */

// Auth validation schemas
export {
  loginSchema,
  signupSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  type LoginFormData,
  type SignupFormData,
  type PasswordResetRequestData,
  type PasswordResetData,
  type ChangePasswordData,
} from './auth-validation'

// Form validation schemas
export {
  // Common field validations
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  nameSchema,
  phoneSchema,
  optionalPhoneSchema,
  futureDateSchema,
  timeSchema,
  positiveNumberSchema,
  
  // Validation messages
  ValidationMessages,
  
  // Helper functions
  validateField,
  validateForm,
  isValidSaudiPhone,
  isValidEmail,
  getPasswordStrength,
  sanitizeInput,
  formatPhoneNumber,
  
  // Profile schema
  profileUpdateSchema,
  type ProfileUpdateData,
} from './form-validation'

// Booking validation schemas
export {
  trialBookingSchema,
  regularBookingSchema,
  rescheduleSchema,
  cancelClassSchema,
  contactFormSchema,
  type TrialBookingData,
  type RegularBookingData,
  type RescheduleData,
  type CancelClassData,
  type ContactFormData,
} from './booking-validation'
