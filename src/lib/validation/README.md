# Form Validation System

## Overview

This directory contains comprehensive form validation schemas and utilities for the LMS application. All validation is built using [Zod](https://zod.dev/) for type-safe schema validation and [react-hook-form](https://react-hook-form.com/) for form state management.

## Quick Start

### Basic Form with Validation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-validation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate when user leaves field
    reValidateMode: 'onChange', // Re-validate on change after first error
  })

  const onSubmit = async (data: LoginFormData) => {
    // Handle form submission
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="البريد الإلكتروني"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        disabled={isSubmitting}
      />

      <Input
        label="كلمة المرور"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        disabled={isSubmitting || Object.keys(errors).length > 0}
      >
        {isSubmitting ? 'جاري التحميل...' : 'تسجيل الدخول'}
      </Button>
    </form>
  )
}
```

## Available Validation Schemas

### Auth Validation (`auth-validation.ts`)

#### Login Schema
```tsx
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-validation'

// Validates:
// - email: Valid email format
// - password: Required field
// - rememberMe: Optional boolean
```

#### Signup Schema
```tsx
import { signupSchema, type SignupFormData } from '@/lib/validation/auth-validation'

// Validates:
// - name: 2-100 characters
// - email: Valid email format
// - password: 8+ chars, uppercase, lowercase, number
// - role: Optional enum (student, teacher, parent)
```

#### Password Reset Request Schema
```tsx
import { passwordResetRequestSchema, type PasswordResetRequestData } from '@/lib/validation/auth-validation'

// Validates:
// - email: Valid email format
```

#### Password Reset Schema
```tsx
import { passwordResetSchema, type PasswordResetData } from '@/lib/validation/auth-validation'

// Validates:
// - password: 8+ chars, uppercase, lowercase, number
// - confirmPassword: Must match password
```

#### Change Password Schema
```tsx
import { changePasswordSchema, type ChangePasswordData } from '@/lib/validation/auth-validation'

// Validates:
// - currentPassword: Required
// - newPassword: 8+ chars, uppercase, lowercase, number
// - confirmPassword: Must match newPassword
```

### Booking Validation (`booking-validation.ts`)

#### Trial Booking Schema
```tsx
import { trialBookingSchema, type TrialBookingData } from '@/lib/validation/booking-validation'

// Validates:
// - studentName: 2-100 characters
// - parentName: Optional, 2-100 characters
// - phone: Saudi format (05XXXXXXXX)
// - email: Optional, valid email
// - date: Future date only
// - time: Valid time format (HH:MM)
// - notes: Optional, max 500 characters
```

#### Regular Booking Schema
```tsx
import { regularBookingSchema, type RegularBookingData } from '@/lib/validation/booking-validation'

// Validates:
// - date: Future date only
// - time: Valid time format
// - duration: 30-120 minutes
// - classType: 'individual' or 'group'
// - notes: Optional, max 500 characters
```

#### Reschedule Schema
```tsx
import { rescheduleSchema, type RescheduleData } from '@/lib/validation/booking-validation'

// Validates:
// - classId: Required string
// - newDate: Future date only
// - newTime: Valid time format
// - reason: Required, max 500 characters
```

#### Cancel Class Schema
```tsx
import { cancelClassSchema, type CancelClassData } from '@/lib/validation/booking-validation'

// Validates:
// - classId: Required string
// - reason: Required, max 500 characters
// - refundRequested: Optional boolean
```

#### Contact Form Schema
```tsx
import { contactFormSchema, type ContactFormData } from '@/lib/validation/booking-validation'

// Validates:
// - name: 2-100 characters
// - email: Valid email format
// - phone: Optional, Saudi format
// - subject: Required, max 200 characters
// - message: 10-1000 characters
```

### Reusable Validation Utilities (`form-validation.ts`)

#### Basic Schemas
```tsx
import {
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  nameSchema,
  phoneSchema,
  optionalPhoneSchema,
  futureDateSchema,
  timeSchema,
  positiveNumberSchema,
} from '@/lib/validation/form-validation'

// Use these to build custom validation schemas
const customSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  phone: optionalPhoneSchema,
})
```

#### Validation Messages
```tsx
import { ValidationMessages } from '@/lib/validation/form-validation'

// All error messages in Arabic
ValidationMessages.REQUIRED // "هذا الحقل مطلوب"
ValidationMessages.INVALID_EMAIL // "البريد الإلكتروني غير صحيح"
ValidationMessages.PASSWORD_MIN_LENGTH // "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
// ... and many more
```

#### Helper Functions
```tsx
import {
  validateField,
  validateForm,
  isValidSaudiPhone,
  isValidEmail,
  getPasswordStrength,
  sanitizeInput,
  formatPhoneNumber,
} from '@/lib/validation/form-validation'

// Validate a single field
const result = validateField(emailSchema, 'test@example.com')
if (!result.success) {
  console.log(result.error) // Arabic error message
}

// Validate entire form
const formResult = validateForm(loginSchema, formData)
if (!formResult.success) {
  console.log(formResult.errors) // { email: "...", password: "..." }
}

// Check password strength
const strength = getPasswordStrength('MyPassword123')
console.log(strength.score) // 0-5
console.log(strength.message) // "قوية"

// Validate phone number
if (isValidSaudiPhone('0501234567')) {
  console.log('Valid Saudi phone number')
}

// Format phone for display
const formatted = formatPhoneNumber('0501234567')
console.log(formatted) // "0501 234 567"
```

## Creating Custom Validation Schemas

### Simple Custom Schema
```tsx
import { z } from 'zod'
import { emailSchema, nameSchema } from '@/lib/validation/form-validation'

const myCustomSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  age: z.number().min(18, 'يجب أن يكون العمر 18 سنة على الأقل'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),
})

type MyCustomFormData = z.infer<typeof myCustomSchema>
```

### Schema with Password Confirmation
```tsx
import { z } from 'zod'
import { strongPasswordSchema, ValidationMessages } from '@/lib/validation/form-validation'

const signupWithConfirmSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, ValidationMessages.REQUIRED_PASSWORD),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'], // Error will be on confirmPassword field
  })
```

### Schema with Conditional Validation
```tsx
import { z } from 'zod'

const conditionalSchema = z.object({
  hasPhone: z.boolean(),
  phone: z.string().optional(),
}).refine(
  (data) => {
    // If hasPhone is true, phone must be provided
    if (data.hasPhone) {
      return data.phone && data.phone.length > 0
    }
    return true
  },
  {
    message: 'رقم الهاتف مطلوب',
    path: ['phone'],
  }
)
```

## Validation Modes

### onBlur (Recommended)
Validates when user leaves the field. Best for UX as it doesn't interrupt typing.

```tsx
useForm({
  mode: 'onBlur',
})
```

### onChange
Validates on every keystroke. Can be annoying for users.

```tsx
useForm({
  mode: 'onChange',
})
```

### onSubmit (Default)
Only validates when form is submitted. Not recommended for better UX.

```tsx
useForm({
  mode: 'onSubmit',
})
```

### Recommended Configuration
```tsx
useForm({
  mode: 'onBlur', // Validate when user leaves field
  reValidateMode: 'onChange', // Re-validate on change after first error
})
```

## Best Practices

### 1. Always Disable Submit Button During Errors
```tsx
<Button
  type="submit"
  disabled={isSubmitting || Object.keys(errors).length > 0}
>
  Submit
</Button>
```

### 2. Show Loading State During Submission
```tsx
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'جاري التحميل...' : 'إرسال'}
</Button>
```

### 3. Display Field-Level Errors
```tsx
<Input
  {...register('email')}
  error={errors.email?.message}
/>
```

### 4. Use Proper TypeScript Types
```tsx
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-validation'

const {
  register,
  handleSubmit,
} = useForm<LoginFormData>({ // Type-safe form data
  resolver: zodResolver(loginSchema),
})

const onSubmit = async (data: LoginFormData) => {
  // data is fully typed
}
```

### 5. Handle Async Validation
```tsx
const onSubmit = async (data: FormData) => {
  // Check if email is already taken
  const isAvailable = await checkEmailAvailability(data.email)
  
  if (!isAvailable) {
    setError('email', {
      type: 'manual',
      message: 'البريد الإلكتروني مستخدم بالفعل',
    })
    return
  }

  // Proceed with submission
}
```

## Error Messages

All error messages are in Arabic and follow these patterns:

### Required Fields
- "هذا الحقل مطلوب"
- "الاسم مطلوب"
- "البريد الإلكتروني مطلوب"
- "كلمة المرور مطلوبة"

### Format Errors
- "البريد الإلكتروني غير صحيح"
- "رقم الهاتف غير صحيح"
- "التاريخ غير صحيح"
- "الوقت غير صحيح"

### Length Errors
- "الاسم يجب أن يكون حرفين على الأقل"
- "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
- "الرسالة طويلة جداً"

### Password Errors
- "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل"
- "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل"
- "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل"
- "كلمات المرور غير متطابقة"

## Testing Validation

### Unit Testing Schemas
```tsx
import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/validation/auth-validation'

describe('loginSchema', () => {
  it('should validate correct data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })
})
```

### Integration Testing Forms
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from './LoginForm'

it('should show error for invalid email', async () => {
  render(<LoginForm />)
  
  const emailInput = screen.getByLabelText('البريد الإلكتروني')
  fireEvent.blur(emailInput, { target: { value: 'invalid' } })
  
  await waitFor(() => {
    expect(screen.getByText('البريد الإلكتروني غير صحيح')).toBeInTheDocument()
  })
})
```

## Performance Considerations

- Validation runs synchronously (< 1ms per field)
- Zod schemas are compiled once and reused
- No unnecessary re-renders with react-hook-form
- Efficient error state management

## Accessibility

- All inputs have proper labels
- Error messages use `role="alert"` and `aria-live="polite"`
- Keyboard navigation fully supported
- Screen reader friendly error announcements

## Examples

See `src/examples/FormValidationExample.tsx` for complete working examples of:
- Contact form with validation
- Password change form with confirmation
- Username validation with async check

## Support

For questions or issues with validation:
1. Check this README
2. Review example components in `src/examples/`
3. Check Zod documentation: https://zod.dev/
4. Check react-hook-form documentation: https://react-hook-form.com/

## License

This validation system is part of the LMS application and follows the same license.
