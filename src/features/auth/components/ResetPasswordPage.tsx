import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ButtonSpinner } from '@/components/ui/spinner'
import { logger } from '@/lib/logger'
import Footer from '@/components/Footer'
import { passwordResetSchema, type PasswordResetData } from '@/lib/validation/auth-validation'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      logger.info('[ResetPasswordPage] Checking session')
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        logger.error('[ResetPasswordPage] Session error', error)
        setError('رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية')
      }
    }

    handleAuthCallback()
  }, [])

  const onSubmit = async (data: PasswordResetData) => {
    setIsLoading(true)
    setError(null)

    try {
      logger.info('[ResetPasswordPage] Updating password')
      const { error } = await updatePassword(data.password)

      if (error) {
        logger.error('[ResetPasswordPage] Password update error', error)
        const message = error?.message || ''
        
        // Provide specific error messages
        if (message.includes('Same password') || message.includes('same_password')) {
          setError('كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة')
        } else if (message.includes('Password should be at least') || message.includes('password_too_short')) {
          setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        } else if (message.includes('weak') || message.includes('strength')) {
          setError('كلمة المرور ضعيفة. يرجى استخدام أحرف وأرقام ورموز')
        } else if (message.includes('Session') || message.includes('token')) {
          setError('انتهت صلاحية الرابط. يرجى طلب رابط جديد')
        } else if (message.includes('Network') || message.includes('fetch')) {
          setError('خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى')
        } else {
          setError('حدث خطأ في تحديث كلمة المرور. يرجى المحاولة مرة أخرى')
        }
      } else {
        logger.info('[ResetPasswordPage] Password updated successfully')
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      logger.error('[ResetPasswordPage] Unexpected error', err as Error)
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <div className="min-h-screen bg-bg-light flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-success-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-text-primary arabic-text">
                تم تحديث كلمة المرور
              </CardTitle>
              <p className="text-text-secondary arabic-text">
                تم تحديث كلمة المرور بنجاح. سيتم توجيهك لصفحة تسجيل الدخول
              </p>
            </CardHeader>
            
            <CardContent>
              <Button asChild className="w-full arabic-text">
                <Link to="/login">تسجيل الدخول الآن</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-bg-light flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-text-primary arabic-text">
              إعادة تعيين كلمة المرور
            </CardTitle>
            <p className="text-text-secondary arabic-text">
              أدخل كلمة المرور الجديدة
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm arabic-text">
                  {error}
                </div>
              )}

              <Input
                label="كلمة المرور الجديدة"
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
              />

              <Input
                label="تأكيد كلمة المرور"
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full arabic-text"
                disabled={isLoading || isSubmitting || Object.keys(errors).length > 0}
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <ButtonSpinner />
                    <span>جاري التحديث...</span>
                  </div>
                ) : (
                  'تحديث كلمة المرور'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  )
}
