import { useAuth } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'
import { useStudentType } from '../hooks/useStudentType'
import EnhancedTrialDashboard from './enhanced/EnhancedTrialDashboard'
import NewRegularDashboard from './regular-new/NewRegularDashboard'

/**
 * Router component that determines which dashboard to show based on student type
 * - Trial students see TrialStudentDashboard (trial-focused features)
 * - Regular students see RegularStudentDashboard (full features with subscription management)
 */
export default function StudentDashboardRouter() {
  const { user } = useAuth()
  const { studentType, loading, error } = useStudentType(user?.id)

  // Show loading state while determining student type
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-secondary arabic-text">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  // Show error state if there was an error determining student type
  if (error) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2 arabic-text">
              خطأ في التحميل
            </h3>
            <p className="text-red-700 mb-4 arabic-text">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors arabic-text"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on student type
  if (studentType === 'trial') {
    return <EnhancedTrialDashboard />
  }

  // Default to the new shadcn-powered regular student dashboard
  return <NewRegularDashboard />
}
