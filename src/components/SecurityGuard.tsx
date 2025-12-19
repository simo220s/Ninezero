import { useEffect, useState, type ReactNode, type ComponentType } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/hooks/useRTL'
import { Spinner } from '@/components/ui/spinner'
import { logger } from '@/lib/logger'

interface SecurityGuardProps {
  children: ReactNode
  level: 'basic' | 'enhanced' | 'critical'
  operation?: string
  onSecurityViolation?: (violation: SecurityViolation) => void
}

interface SecurityViolation {
  type: 'unauthorized_access' | 'invalid_teacher' | 'suspicious_activity' | 'rate_limit_exceeded'
  email?: string
  timestamp: string
  operation?: string
  details?: unknown
}

export default function SecurityGuard({ 
  children, 
  level = 'basic',
  operation,
  onSecurityViolation 
}: SecurityGuardProps) {
  const { user, isTeacherEmail, getUserRole } = useAuth()
  const { language } = useLanguage()
  const [isSecure, setIsSecure] = useState<boolean | null>(null)
  const [violation, setViolation] = useState<SecurityViolation | null>(null)

  useEffect(() => {
    const performSecurityCheck = async () => {
      if (!user) {
        setIsSecure(false)
        return
      }

      const userRole = getUserRole()
      
      try {
        // Basic security check
        if (level === 'basic') {
          setIsSecure(true)
          return
        }

        // Enhanced security check for teacher operations
        if (level === 'enhanced' || level === 'critical') {
          if (userRole === 'teacher') {
            const isValidTeacher = isTeacherEmail(user.email)
            
            if (!isValidTeacher) {
              const violationData: SecurityViolation = {
                type: 'invalid_teacher',
                email: user.email || 'unknown',
                timestamp: new Date().toISOString(),
                operation,
                details: { level, userRole }
              }
              
              setViolation(violationData)
              onSecurityViolation?.(violationData)
              setIsSecure(false)
              return
            }
          }
        }

        // Critical security check with additional validations
        if (level === 'critical') {
          // Check for suspicious patterns
          const suspiciousPatterns = [
            /admin/i,
            /root/i,
            /test/i,
            /demo/i
          ]

          const email = user.email || ''
          const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(email))
          
          if (isSuspicious && userRole === 'teacher') {
            const violationData: SecurityViolation = {
              type: 'suspicious_activity',
              email: user.email || 'unknown',
              timestamp: new Date().toISOString(),
              operation,
              details: { level, suspiciousPattern: true }
            }
            
            setViolation(violationData)
            onSecurityViolation?.(violationData)
            setIsSecure(false)
            return
          }

          // Rate limiting check (simplified) - 100ms to prevent rapid abuse
          const lastAccess = localStorage.getItem(`security_check_${user.id}_${operation}`)
          const now = Date.now()
          
          if (lastAccess && now - parseInt(lastAccess) < 100) { // 100ms rate limit
            const violationData: SecurityViolation = {
              type: 'rate_limit_exceeded',
              email: user.email || 'unknown',
              timestamp: new Date().toISOString(),
              operation,
              details: { level, rateLimitMs: now - parseInt(lastAccess) }
            }
            
            setViolation(violationData)
            onSecurityViolation?.(violationData)
            setIsSecure(false)
            return
          }

          localStorage.setItem(`security_check_${user.id}_${operation}`, now.toString())
        }

        setIsSecure(true)
      } catch (error) {
        logger.error('Security check failed:', error)
        setIsSecure(false)
      }
    }

    performSecurityCheck()
  }, [user, level, operation, getUserRole, isTeacherEmail, onSecurityViolation])

  // Loading state
  if (isSecure === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="sm" />
        <span className="ms-2 text-sm text-gray-600">
          {language === 'ar' ? 'فحص الأمان...' : 'Security check...'}
        </span>
      </div>
    )
  }

  // Security violation
  if (violation) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-red-800 font-medium">
              {language === 'ar' ? 'انتهاك أمني' : 'Security Violation'}
            </h4>
            <p className="text-red-700 text-sm">
              {language === 'ar' 
                ? 'تم رفض الوصول لأسباب أمنية. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.'
                : 'Access denied for security reasons. Please try again or contact support.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Security check failed
  if (!isSecure) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-yellow-800 font-medium">
              {language === 'ar' ? 'فشل التحقق الأمني' : 'Security Check Failed'}
            </h4>
            <p className="text-yellow-700 text-sm">
              {language === 'ar' 
                ? 'لا يمكن التحقق من صلاحياتك الأمنية. يرجى تسجيل الدخول مرة أخرى.'
                : 'Unable to verify your security credentials. Please log in again.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for securing teacher operations
export function withTeacherSecurity<P extends object>(
  Component: ComponentType<P>,
  securityLevel: 'basic' | 'enhanced' | 'critical' = 'enhanced'
) {
  return function SecuredComponent(props: P) {
    return (
      <SecurityGuard level={securityLevel} operation={Component.displayName || Component.name}>
        <Component {...props} />
      </SecurityGuard>
    )
  }
}

// Hook for security operations
export function useSecurity() {
  const { user, isTeacherEmail, getUserRole } = useAuth()
  
  const checkTeacherAccess = (operation?: string): boolean => {
    if (!user) return false
    
    const userRole = getUserRole()
    if (userRole !== 'teacher') return false
    
    // Log the operation for audit purposes
    if (operation) {
      logger.log(`Teacher access check for operation: ${operation}`)
    }
    
    return isTeacherEmail(user.email)
  }

  const logSecurityEvent = (event: SecurityViolation) => {
    // In production, this would send to a security monitoring service
    logger.warn('Security Event:', event)
    
    // Store locally for debugging
    const events = JSON.parse(localStorage.getItem('security_events') || '[]')
    events.push(event)
    localStorage.setItem('security_events', JSON.stringify(events.slice(-50))) // Keep last 50 events
  }

  return {
    checkTeacherAccess,
    logSecurityEvent,
    isTeacher: getUserRole() === 'teacher',
    isValidTeacher: checkTeacherAccess()
  }
}
