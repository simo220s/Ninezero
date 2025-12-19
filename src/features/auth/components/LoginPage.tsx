import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { ButtonSpinner } from '@/components/ui/spinner'
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
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur (when user leaves the field)
    reValidateMode: 'onChange', // Re-validate on change after first error
  })

  // Handle redirect after user state is populated
  useEffect(() => {
    if (user && isLoading) {
      logger.log('[LoginPage] User state updated after login, redirecting...')
      const role = getUserRole()
      logger.log('[LoginPage] User role:', role)
      
      // Check for stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        logger.log('[LoginPage] Redirecting to stored path:', redirectPath)
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath, { replace: true })
        setIsLoading(false)
        return
      }
      
      // Default redirects based on role
      if (role === 'teacher') {
        logger.log('[LoginPage] Redirecting to teacher dashboard')
        navigate('/dashboard/teacher', { replace: true })
        setIsLoading(false)
      } else if (role === 'admin') {
        logger.log('[LoginPage] Redirecting to admin dashboard')
        navigate('/dashboard/admin', { replace: true })
        setIsLoading(false)
      } else {
        logger.log('[LoginPage] Redirecting to student dashboard')
        navigate('/dashboard/student', { replace: true })
        setIsLoading(false)
      }
    }
  }, [user, isLoading, getUserRole, navigate])

  // Timeout fallback to reset loading state if redirect doesn't happen
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        logger.warn('[LoginPage] Redirect timeout - resetting loading state')
        setIsLoading(false)
      }, 5000) // 5 second timeout

      return () => clearTimeout(timeout)
    }
  }, [isLoading])

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
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى')
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: any): string => {
    const message = error?.message || ''
    
    // Authentication errors
    if (message.includes('Invalid login credentials') || 
        message.includes('Invalid email or password')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    }
    
    // Email verification
    if (message.includes('Email not confirmed') || 
        message.includes('email_not_confirmed')) {
      return 'يرجى تأكيد البريد الإلكتروني أولاً. تحقق من بريدك الوارد'
    }
    
    // Rate limiting
    if (message.includes('Too many requests') || 
        message.includes('rate_limit')) {
      return 'محاولات كثيرة. يرجى الانتظار قليلاً والمحاولة مرة أخرى'
    }
    
    // Session errors
    if (message.includes('Failed to create session') || 
        message.includes('session')) {
      return 'فشل في إنشاء الجلسة. يرجى المحاولة مرة أخرى'
    }
    
    // Network errors
    if (message.includes('Network') || 
        message.includes('fetch') || 
        message.includes('Failed to fetch') ||
        message.includes('NetworkError')) {
      return 'خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى'
    }
    
    // User not found
    if (message.includes('User not found') || 
        message.includes('user_not_found')) {
      return 'الحساب غير موجود. يرجى التسجيل أولاً'
    }
    
    // Account locked/disabled
    if (message.includes('Account locked') || 
        message.includes('Account disabled')) {
      return 'تم تعطيل الحساب. يرجى التواصل مع الدعم'
    }
    
    // Timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى'
    }
    
    logger.error('[LoginPage] Unhandled error message:', message)
    return 'حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى'
  }

  return (
    <>
      <div className="min-h-screen bg-bg-light flex items-center justify-center py-12 px-4 sm:px-6" dir="rtl">
        <div className="max-w-md w-full mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-text-primary arabic-text">
              سجّل الدخول
            </CardTitle>
            <p className="text-text-secondary arabic-text mt-2">
              مرحباً بك في{' '}
              <Link
                to="/"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                أستاذ أحمد
              </Link>
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
          
          <CardContent dir="rtl">
            {/* Social Auth - Google & Apple Sign-In - Official Standards */}
            <div className="mb-6 space-y-3">
              {/* Google Sign-In Button - Official Design */}
              <button
                type="button"
                onClick={() => {
                  logger.log('Google Sign-In clicked')
                  setError('تسجيل الدخول عبر جوجل غير متاح حالياً. يرجى استخدام البريد الإلكتروني وكلمة المرور.')
                }}
                disabled={isLoading}
                className="w-full h-11 bg-white hover:bg-gray-50 border border-[#DADCE0] rounded-xl text-[#3C4043] font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md arabic-text"
                title="قريباً: تسجيل الدخول عبر جوجل"
                aria-label="تسجيل الدخول عبر جوجل (غير متاح حالياً)"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
                <span>أكمل عن طريق جوجل</span>
              </button>

              {/* Apple Sign-In Button - Official Design */}
              <button
                type="button"
                onClick={() => {
                  logger.log('Apple Sign-In clicked')
                  setError('تسجيل الدخول عبر Apple غير متاح حالياً. يرجى استخدام البريد الإلكتروني وكلمة المرور.')
                }}
                disabled={isLoading}
                className="w-full h-11 bg-black hover:bg-[#1a1a1a] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed arabic-text"
                title="قريباً: تسجيل الدخول عبر Apple"
                aria-label="تسجيل الدخول عبر Apple (غير متاح حالياً)"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z"/>
                </svg>
                <span>متابعة عن طريق Apple</span>
              </button>

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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              {error && (
                <div 
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm arabic-text flex items-start gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
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
                disabled={isLoading || isSubmitting || Object.keys(errors).length > 0}
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <ButtonSpinner />
                    <span className="arabic-text">جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <span className="arabic-text">سجّل الدخول</span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center" dir="rtl">
              <p className="text-text-secondary arabic-text text-sm">
                نسيت كلمة المرور؟{' '}
                <Link
                  to="/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  إعادة تعيين
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  )
}
