import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { ButtonSpinner } from '@/components/ui/spinner'
import Footer from '@/components/Footer'
import { logger } from '@/lib/logger'
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-validation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, getUserRole, user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit', // Only validate on form submission, not on change
  })

  // Handle redirect after user state is populated
  useEffect(() => {
    if (user && isLoading) {
      logger.log('[LoginPage] User state updated after login, redirecting...')
      const role = getUserRole()
      logger.log('[LoginPage] User role:', role)
      
      if (role === 'teacher') {
        logger.log('[LoginPage] Redirecting to teacher dashboard')
        navigate('/dashboard/teacher', { replace: true })
      } else if (role === 'admin') {
        logger.log('[LoginPage] Redirecting to admin dashboard')
        navigate('/dashboard/admin', { replace: true })
      } else {
        logger.log('[LoginPage] Redirecting to student dashboard')
        navigate('/dashboard/student', { replace: true })
      }
    }
  }, [user, isLoading, getUserRole, navigate])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      logger.log('[LoginPage] Attempting login')
      const { error } = await signIn(data.email, data.password)

      if (error) {
        logger.error('[LoginPage] Login failed:', error)
        setError(getErrorMessage(error))
        setIsLoading(false)
        return
      }

      logger.log('[LoginPage] Login successful, waiting for user state to update')
      
      // The actual redirect will be handled by the useEffect below
      // which watches for user state changes
      // Don't set isLoading to false here - let the redirect happen first
    } catch (err) {
      logger.error('[LoginPage] Unexpected error:', err)
      setError('حدث خطأ غير متوقع')
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: any): string => {
    const message = error?.message || ''
    
    if (message.includes('Invalid login credentials')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    }
    if (message.includes('Email not confirmed')) {
      return 'يرجى تأكيد البريد الإلكتروني أولاً'
    }
    if (message.includes('Too many requests')) {
      return 'محاولات كثيرة. يرجى المحاولة لاحقاً'
    }
    if (message.includes('Failed to create session')) {
      return 'فشل في إنشاء الجلسة. يرجى المحاولة مرة أخرى'
    }
    if (message.includes('Network') || message.includes('fetch')) {
      return 'خطأ في الاتصال. يرجى التحقق من الإنترنت'
    }
    if (message.includes('User not found')) {
      return 'المستخدم غير موجود'
    }
    
    logger.error('[LoginPage] Unhandled error message:', message)
    return 'حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى'
  }

  return (
    <>
      <div className="min-h-screen bg-bg-light flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-text-primary arabic-text">
              سجّل الدخول
            </CardTitle>
            <p className="text-text-secondary arabic-text mt-4">
              مرحباً بك في أستاذ أحمد
            </p>
            
            <div className="text-center mt-4">
              <p className="text-text-secondary arabic-text text-sm">
                هل أنت جديد في أستاذ أحمد؟{' '}
                <Link
                  to="/signup"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  أنشئ حسابًا
                </Link>
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Social Auth - Google & Apple Sign-In - Storytel Style */}
            <div className="mb-6 space-y-3">
              <Button
                variant="outline"
                className="w-full arabic-text bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 font-medium h-12"
                onClick={() => {
                  // TODO: Implement Google Sign-In
                  logger.log('Google Sign-In clicked')
                }}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 ms-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                أكمل عن طريق جوجل
              </Button>

              <Button
                variant="outline"
                className="w-full arabic-text bg-black hover:bg-gray-900 text-white border-black hover:border-gray-900 h-12"
                onClick={() => {
                  // TODO: Implement Apple Sign-In
                  logger.log('Apple Sign-In clicked')
                }}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 ms-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                متابعة عن طريق Apple
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-text-secondary arabic-text">
                    أو يدوياً
                  </span>
                </div>
              </div>
            </div>

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

              <Input
                label="كلمة المرور"
                type="password"
                placeholder="أدخل كلمة المرور"
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <ButtonSpinner />
                    <span className="arabic-text">جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <span className="arabic-text">سجّل الدخول</span>
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-text-secondary arabic-text text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </p>
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
