# Form Validation Quick Reference

## Quick Start

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: LoginFormData) => {
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="البريد الإلكتروني"
        {...register('email')}
        error={errors.email?.message}
        disabled={isSubmitting}
      />
      
      <Button
        type="submit"
        disabled={isSubmitting || Object.keys(errors).length > 0}
      >
        {isSubmitting ? 'جاري التحميل...' : 'إرسال'}
      </Button>
    </form>
  )
}
```

## Available Schemas

### Auth
```typescript
import {
  loginSchema,              // Email + password
  signupSchema,             // Name + email + strong password
  passwordResetRequestSchema, // Email only
  passwordResetSchema,      // Password + confirmation
  changePasswordSchema,     // Current + new + confirmation
} from '@/lib/validation'
```

### Booking
```typescript
import {
  trialBookingSchema,       // Trial class booking
  regularBookingSchema,     // Regular class booking
  rescheduleSchema,         // Reschedule class
  cancelClassSchema,        // Cancel class
  contactFormSchema,        // Contact form
} from '@/lib/validation'
```

### Profile
```typescript
import {
  profileUpdateSchema,      // User profile updates
} from '@/lib/validation'
```

## Base Schemas

```typescript
import {
  emailSchema,              // Email validation
  passwordSchema,           // Basic password
  strongPasswordSchema,     // Strong password (8+ chars, upper, lower, number)
  nameSchema,               // Name (2-100 chars)
  phoneSchema,              // Saudi phone (05XXXXXXXX)
  optionalPhoneSchema,      // Optional phone
  futureDateSchema,         // Future dates only
  timeSchema,               // Time (HH:MM)
  positiveNumberSchema,     // Positive numbers
} from '@/lib/validation'
```

## Helper Functions

```typescript
import {
  validateField,            // Validate single field
  validateForm,             // Validate entire form
  isValidSaudiPhone,        // Check phone format
  isValidEmail,             // Check email format
  getPasswordStrength,      // Calculate password strength
  sanitizeInput,            // Remove dangerous characters
  formatPhoneNumber,        // Format phone for display
} from '@/lib/validation'
```

## Validation Messages

```typescript
import { ValidationMessages } from '@/lib/validation'

ValidationMessages.REQUIRED              // "هذا الحقل مطلوب"
ValidationMessages.INVALID_EMAIL         // "البريد الإلكتروني غير صحيح"
ValidationMessages.PASSWORD_MIN_LENGTH   // "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
ValidationMessages.PASSWORDS_DONT_MATCH  // "كلمات المرور غير متطابقة"
```

## Common Patterns

### Password with Confirmation
```typescript
const schema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, ValidationMessages.REQUIRED_PASSWORD),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  })
```

### Optional Field
```typescript
const schema = z.object({
  phone: optionalPhoneSchema,
  bio: z.string().max(500).optional(),
})
```

### Custom Validation
```typescript
const schema = z.object({
  age: z.number().min(18, 'يجب أن يكون العمر 18 سنة على الأقل'),
})
```

### Conditional Validation
```typescript
const schema = z.object({
  hasPhone: z.boolean(),
  phone: z.string().optional(),
}).refine(
  (data) => !data.hasPhone || (data.phone && data.phone.length > 0),
  {
    message: 'رقم الهاتف مطلوب',
    path: ['phone'],
  }
)
```

## Form Setup Checklist

- [ ] Import `useForm` from 'react-hook-form'
- [ ] Import `zodResolver` from '@hookform/resolvers/zod'
- [ ] Import or create validation schema
- [ ] Import TypeScript type from schema
- [ ] Setup form with `mode: 'onBlur'` and `reValidateMode: 'onChange'`
- [ ] Use `{...register('fieldName')}` on inputs
- [ ] Pass `error={errors.fieldName?.message}` to inputs
- [ ] Disable submit button when `isSubmitting` or errors exist
- [ ] Show loading state during submission

## Input Component Props

```typescript
<Input
  label="Field Label"           // Optional label
  type="text"                   // Input type
  placeholder="Placeholder"     // Optional placeholder
  {...register('fieldName')}    // Register with react-hook-form
  error={errors.fieldName?.message}  // Error message
  helperText="Helper text"      // Optional helper text
  disabled={isSubmitting}       // Disable during submission
/>
```

## Submit Button Pattern

```typescript
<Button
  type="submit"
  disabled={isSubmitting || Object.keys(errors).length > 0}
>
  {isSubmitting ? (
    <div className="flex items-center gap-2">
      <ButtonSpinner />
      <span>جاري التحميل...</span>
    </div>
  ) : (
    'إرسال'
  )}
</Button>
```

## Error Display Pattern

```typescript
{error && (
  <div 
    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
    role="alert"
    aria-live="polite"
  >
    {error}
  </div>
)}
```

## Testing

### Unit Test
```typescript
import { loginSchema } from '@/lib/validation'

it('should validate correct data', () => {
  const result = loginSchema.safeParse({
    email: 'test@example.com',
    password: 'password123',
  })
  expect(result.success).toBe(true)
})
```

### Integration Test
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

it('should show error for invalid email', async () => {
  render(<LoginForm />)
  
  const emailInput = screen.getByLabelText('البريد الإلكتروني')
  fireEvent.blur(emailInput, { target: { value: 'invalid' } })
  
  await waitFor(() => {
    expect(screen.getByText('البريد الإلكتروني غير صحيح')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Error not showing
- Check that you're using `{...register('fieldName')}`
- Check that you're passing `error={errors.fieldName?.message}`
- Check validation mode is set to 'onBlur' or 'onChange'

### Submit button not disabling
- Check `disabled={isSubmitting || Object.keys(errors).length > 0}`
- Make sure you're using `formState: { errors, isSubmitting }`

### Type errors
- Make sure you're importing the type: `type LoginFormData`
- Use the type in `useForm<LoginFormData>`
- Use the type in `onSubmit = async (data: LoginFormData) => {}`

### Validation not triggering
- Check `mode: 'onBlur'` is set in useForm config
- Check `resolver: zodResolver(schema)` is set
- Make sure schema is imported correctly

## Resources

- Full Documentation: `src/lib/validation/README.md`
- Example Component: `src/examples/FormValidationExample.tsx`
- Zod Docs: https://zod.dev/
- React Hook Form Docs: https://react-hook-form.com/

## Support

For questions or issues:
1. Check this quick reference
2. Review full README in `src/lib/validation/README.md`
3. Check example component in `src/examples/FormValidationExample.tsx`
4. Review existing forms in `src/features/auth/components/`
