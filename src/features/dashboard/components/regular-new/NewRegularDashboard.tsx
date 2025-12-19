import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getUserCredits, getUserProfile, getStudentClasses } from '@/lib/database'
import { Spinner } from '@/components/ui/spinner'
import { logger } from '@/lib/logger'
import DashboardHeader from './DashboardHeader'
import DashboardContent from './DashboardContent'
import Footer from '@/components/Footer'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meeting_link?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  teacher_name?: string
  subject?: string
}

export interface DashboardData {
  credits: number
  profile: any
  classes: ClassSession[]
  completedClasses: number
  scheduledClasses: number
  attendanceRate: number
}

export default function NewRegularDashboard() {
  const { user, signOut } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Load user credits
      const { data: creditsData, error: creditsError } = await getUserCredits(user.id)
      if (creditsError) {
        logger.error('Error loading credits:', creditsError)
      }

      // Load user profile
      const { data: profile, error: profileError } = await getUserProfile(user.id)
      if (profileError) {
        logger.error('Error loading profile:', profileError)
      }

      // Load class sessions
      const { data: classSessions, error: classSessionsError } = await getStudentClasses(user.id)
      if (classSessionsError) {
        logger.error('Error loading class sessions:', classSessionsError)
      }

      // Transform class sessions to the expected format
      const classes: ClassSession[] = (classSessions || []).map(session => ({
        id: session.id,
        date: session.date,
        time: session.time,
        duration: session.duration,
        meeting_link: session.meeting_link,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
        teacher_name: session.teacher_name || 'أ. أحمد',
        subject: session.subject || 'اللغة العربية'
      }))

      const completedClasses = classes.filter(c => c.status === 'completed').length
      const scheduledClasses = classes.filter(c => c.status === 'scheduled').length
      const attendanceRate = classes.length > 0 
        ? Math.round((completedClasses / classes.length) * 100) 
        : 0

      setDashboardData({
        credits: creditsData?.credits || 0,
        profile,
        classes,
        completedClasses,
        scheduledClasses,
        attendanceRate
      })
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات')
      logger.error('Dashboard loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-right">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 arabic-text text-right">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-right max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-end w-12 h-12 ms-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2 arabic-text text-right">خطأ في التحميل</h3>
            <p className="text-red-700 mb-4 arabic-text text-right">{error}</p>
            <div className="flex justify-end">
              <button
                onClick={loadDashboardData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors arabic-text"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user}
        profile={dashboardData?.profile}
        onSignOut={handleSignOut}
      />
      
      <main className="pt-20 md:pt-24">
        <DashboardContent 
          dashboardData={dashboardData}
          onRefresh={loadDashboardData}
        />
      </main>

      <Footer />
    </div>
  )
}
