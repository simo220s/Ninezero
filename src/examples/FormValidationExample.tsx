/**
 * Form Validation Example
 * 
 * This example demonstrates how to use the comprehensive form validation system
 * with react-hook-form and Zod schemas.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  emailSchema,
  strongPasswordSchema,
  nameSchema,
  phoneSchema,
  ValidationMessages,
} from '@/lib/validation/form-validation'

// Example 1: Simple Contact Form
const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export function ContactFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur', // Validate when user leaves field
    reValidateMode: 'onChange', // Re-validate on change after first error
  })

  const onSubmit = async (_data: ContactFormData) => {
    // Form submitted successfully
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('تم إرسال الرسالة بنجاح!')
    reset()
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="arabic-text">نموذج اتصال</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <Input
            label="الاسم"
            type="text"
            placeholder="أدخل اسمك"
            {...register('name')}
            error={errors.name?.message}
            disabled={isSubmitting}
          />

          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            {...register('email')}
            error={errors.email?.message}
            disabled={isSubmitting}
          />

          <Input
            label="رقم الهاتف (اختياري)"
            type="tel"
            placeholder="05XXXXXXXX"
            {...register('phone')}
            error={errors.phone?.message}
            disabled={isSubmitting}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary arabic-text">
              الرسالة
            </label>
            <textarea
              {...register('message')}
              placeholder="اكتب رسالتك هنا"
              disabled={isSubmitting}
              className="flex w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base transition-all duration-200 placeholder:text-text-secondary placeholder:text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/20 focus-visible:border-primary-600 disabled:cursor-not-allowed disabled:opacity-50 text-right arabic-text"
              rows={4}
              dir="rtl"
            />
            {errors.message && (
              <p className="text-sm text-red-600 arabic-text text-right">
                {errors.message.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Example 2: Password Change Form with Confirmation
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, ValidationMessages.REQUIRED_PASSWORD),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, ValidationMessages.REQUIRED_PASSWORD),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  })

type PasswordChangeData = z.infer<typeof passwordChangeSchema>

export function PasswordChangeExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (_formData: PasswordChangeData) => {
    // Password change submitted successfully
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('تم تغيير كلمة المرور بنجاح!')
    reset()
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="arabic-text">تغيير كلمة المرور</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <Input
            label="كلمة المرور الحالية"
            type="password"
            placeholder="أدخل كلمة المرور الحالية"
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
            disabled={isSubmitting}
          />

          <Input
            label="كلمة المرور الجديدة"
            type="password"
            placeholder="أدخل كلمة المرور الجديدة"
            {...register('newPassword')}
            error={errors.newPassword?.message}
            helperText="يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم"
            disabled={isSubmitting}
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            placeholder="أعد إدخال كلمة المرور الجديدة"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Example 3: Custom Validation with Async Check
const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(20, 'اسم المستخدم طويل جداً')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
})

type UsernameData = z.infer<typeof usernameSchema>

export function UsernameValidationExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<UsernameData>({
    resolver: zodResolver(usernameSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const checkUsernameAvailability = async (username: string) => {
    // Simulate API call to check username
    await new Promise(resolve => setTimeout(resolve, 500))
    const takenUsernames = ['admin', 'user', 'test']
    return !takenUsernames.includes(username.toLowerCase())
  }

  const onSubmit = async (formData: UsernameData) => {
    // Check username availability
    const isAvailable = await checkUsernameAvailability(formData.username)
    
    if (!isAvailable) {
      setError('username', {
        type: 'manual',
        message: 'اسم المستخدم مستخدم بالفعل',
      })
      return
    }

    clearErrors('username')
    alert('اسم المستخدم متاح!')
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="arabic-text">التحقق من اسم المستخدم</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <Input
            label="اسم المستخدم"
            type="text"
            placeholder="اختر اسم مستخدم"
            {...register('username')}
            error={errors.username?.message}
            helperText="3-20 حرف، أحرف وأرقام فقط"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? 'جاري التحقق...' : 'التحقق من التوفر'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Example 4: All Examples Combined
export default function FormValidationExamples() {
  return (
    <div className="min-h-screen bg-bg-light py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary arabic-text mb-2">
            أمثلة على التحقق من النماذج
          </h1>
          <p className="text-text-secondary arabic-text">
            أمثلة شاملة لاستخدام نظام التحقق من النماذج
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <ContactFormExample />
          <PasswordChangeExample />
          <UsernameValidationExample />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">ميزات نظام التحقق</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-text-secondary arabic-text" dir="rtl">
              <li>✅ التحقق الفوري عند مغادرة الحقل</li>
              <li>✅ إعادة التحقق عند كل تغيير بعد أول خطأ</li>
              <li>✅ رسائل خطأ واضحة بالعربية</li>
              <li>✅ تعطيل زر الإرسال عند وجود أخطاء</li>
              <li>✅ حالات التحميل أثناء الإرسال</li>
              <li>✅ دعم كامل للغة العربية (RTL)</li>
              <li>✅ التحقق من قوة كلمة المرور</li>
              <li>✅ التحقق من تطابق كلمات المرور</li>
              <li>✅ التحقق من صيغة البريد الإلكتروني</li>
              <li>✅ التحقق من رقم الهاتف السعودي</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
