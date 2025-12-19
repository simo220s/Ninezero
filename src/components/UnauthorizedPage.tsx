import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/hooks/useRTL'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'

interface UnauthorizedPageProps {
  reason?: 'not_authenticated' | 'insufficient_permissions' | 'invalid_teacher' | 'security_violation'
  message?: string
}

export default function UnauthorizedPage({ 
  reason = 'insufficient_permissions',
  message 
}: UnauthorizedPageProps) {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { user, signOut } = useAuth()

  const getReasonMessage = () => {
    switch (reason) {
      case 'not_authenticated':
        return language === 'ar' 
          ? 'يجب تسجيل الدخول للوصول إلى هذه الصفحة'
          : 'You must be logged in to access this page'
      
      case 'insufficient_permissions':
        return language === 'ar'
          ? 'ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة'
          : 'You do not have sufficient permissions to access this page'
      
      case 'invalid_teacher':
        return language === 'ar'
          ? 'الوصول مقتصر على المعلم المعتمد فقط'
          : 'Access is restricted to authorized teacher only'
      
      case 'security_violation':
        return language === 'ar'
          ? 'تم رفض الوصول لأسباب أمنية'
          : 'Access denied for security reasons'
      
      default:
        return language === 'ar'
          ? 'غير مصرح لك بالوصول إلى هذه الصفحة'
          : 'You are not authorized to access this page'
    }
  }

  const getIcon = () => {
    switch (reason) {
      case 'not_authenticated':
        return (
          <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      
      case 'security_violation':
        return (
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      
      default:
        return (
          <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {getIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'وصول غير مصرح به' : 'Unauthorized Access'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message || getReasonMessage()}
          </p>

          {/* Additional info for teacher access */}
          {reason === 'invalid_teacher' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                {language === 'ar'
                  ? 'إذا كنت الأستاذ أحمد، يرجى التأكد من تسجيل الدخول بالبريد الإلكتروني الصحيح: selem.vet@gmail.com'
                  : 'If you are Teacher Ahmad, please ensure you are logged in with the correct email: selem.vet@gmail.com'
                }
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!user && (
              <Button 
                onClick={handleLogin}
                className="w-full"
                variant="primary"
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Button>
            )}

            {user && (
              <Button 
                onClick={handleLogout}
                className="w-full"
                variant="outline"
              >
                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </Button>
            )}

            <Button 
              onClick={handleGoHome}
              className="w-full"
              variant="secondary"
            >
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Go to Home'}
            </Button>
          </div>

          {/* Contact info for security issues */}
          {reason === 'security_violation' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {language === 'ar'
                  ? 'إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني'
                  : 'If you believe this is an error, please contact technical support'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}

// Specific unauthorized page components
export function NotAuthenticatedPage() {
  return <UnauthorizedPage reason="not_authenticated" />
}

export function InsufficientPermissionsPage() {
  return <UnauthorizedPage reason="insufficient_permissions" />
}

export function InvalidTeacherPage() {
  return <UnauthorizedPage reason="invalid_teacher" />
}

export function SecurityViolationPage() {
  return <UnauthorizedPage reason="security_violation" />
}
