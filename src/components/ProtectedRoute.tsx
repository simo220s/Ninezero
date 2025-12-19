import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'
import { useLanguage } from '@/hooks/useRTL'
import { logger } from '@/lib/logger'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('student' | 'teacher' | 'admin')[]
  requireAuth?: boolean
  strictTeacherCheck?: boolean // Enhanced security for teacher routes
  strictAdminCheck?: boolean // Enhanced security for admin routes
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['student', 'teacher'],
  requireAuth = true,
  strictTeacherCheck = false,
  strictAdminCheck = false
}: ProtectedRouteProps) {
  const { user, loading, getUserRole, isTeacherEmail, isAdminEmail } = useAuth()
  const { language } = useLanguage()
  const location = useLocation()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [securityViolation, setSecurityViolation] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!requireAuth) {
        setIsAuthorized(true)
        return
      }

      if (!user) {
        setIsAuthorized(false)
        // Store current location for redirect after login
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
          sessionStorage.setItem('redirectAfterLogin', location.pathname)
        }
        return
      }

      const userRole = getUserRole()
      const hasPermission = allowedRoles.includes(userRole)

      // Enhanced security check for teacher routes
      if (strictTeacherCheck && userRole === 'teacher') {
        const isValidTeacher = isTeacherEmail(user.email)
        if (!isValidTeacher) {
          setSecurityViolation('unauthorized_teacher_access')
          setIsAuthorized(false)
          // Log security violation
          logger.warn('Security violation: Unauthorized teacher access attempt', {
            email: user.email,
            timestamp: new Date().toISOString(),
            location: location.pathname
          })
          return
        }
      }

      // Additional security checks for teacher
      if (userRole === 'teacher' && allowedRoles.includes('teacher')) {
        // Double-check teacher email even for non-strict routes
        const isValidTeacher = isTeacherEmail(user.email)
        if (!isValidTeacher) {
          setSecurityViolation('invalid_teacher_email')
          setIsAuthorized(false)
          return
        }
      }

      // Enhanced security check for admin routes
      if (strictAdminCheck && userRole === 'admin') {
        const isValidAdmin = isAdminEmail(user.email)
        if (!isValidAdmin) {
          setSecurityViolation('unauthorized_admin_access')
          setIsAuthorized(false)
          logger.warn('Security violation: Unauthorized admin access attempt', {
            email: user.email,
            timestamp: new Date().toISOString(),
            location: location.pathname
          })
          return
        }
      }

      // Additional security checks for admin
      if (userRole === 'admin' && allowedRoles.includes('admin')) {
        const isValidAdmin = isAdminEmail(user.email)
        if (!isValidAdmin) {
          setSecurityViolation('invalid_admin_email')
          setIsAuthorized(false)
          return
        }
      }

      setIsAuthorized(hasPermission)
    }
  }, [user, loading, allowedRoles, requireAuth, getUserRole, isTeacherEmail, isAdminEmail, strictTeacherCheck, strictAdminCheck, location.pathname])

  // Show loading spinner while checking authentication
  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-secondary arabic-text">
            {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
          </p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user && requireAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Handle security violations
  if (securityViolation) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {language === 'ar' ? 'وصول غير مصرح به' : 'Unauthorized Access'}
            </h3>
            <p className="text-red-700 mb-4">
              {language === 'ar' 
                ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.'
                : 'You do not have permission to access this page. Please contact administration if you believe this is an error.'
              }
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to appropriate dashboard if not authorized for this role
  if (user && !isAuthorized) {
    const userRole = getUserRole()
    let redirectPath = '/dashboard/student'
    if (userRole === 'teacher') redirectPath = '/dashboard/teacher'
    if (userRole === 'admin') redirectPath = '/dashboard/admin'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}

// Specific route guards for common use cases
export function StudentRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      {children}
    </ProtectedRoute>
  )
}

export function TeacherRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['teacher']} strictTeacherCheck={true}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']} strictAdminCheck={true}>
      {children}
    </ProtectedRoute>
  )
}

export function PublicRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  )
}

// Auth redirect component - redirects authenticated users away from auth pages
export function AuthRedirect({ children }: { children: ReactNode }) {
  const { user, loading, getUserRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // If user is already authenticated, redirect to appropriate dashboard
  if (user) {
    const userRole = getUserRole()
    let redirectPath = '/dashboard/student'
    if (userRole === 'teacher') redirectPath = '/dashboard/teacher'
    if (userRole === 'admin') redirectPath = '/dashboard/admin'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
