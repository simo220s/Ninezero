import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { ButtonSpinner } from '@/components/ui/spinner'
import Footer from '@/components/Footer'

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(data.email)

      if (error) {
        setError('حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('حدث خطأ غير متوقع')
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
                تم إرسال الرابط
              </CardTitle>
              <p className="text-text-secondary arabic-text">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="bg-success-50 text-success-600 px-4 py-3 rounded-lg text-sm arabic-text">
                  يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور
                </div>

                <Button asChild className="w-full arabic-text">
                  <Link to="/login">العودة لتسجيل الدخول</Link>
                </Button>
              </div>
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
              نسيت كلمة المرور؟
            </CardTitle>
            <p className="text-text-secondary arabic-text">
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
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
                label="البريد الإلكتروني"
                type="email"
                placeholder="example@email.com"
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full arabic-text"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <ButtonSpinner />
                    <span>جاري الإرسال...</span>
                  </div>
                ) : (
                  'إرسال رابط إعادة التعيين'
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 text-sm arabic-text"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  )
}
