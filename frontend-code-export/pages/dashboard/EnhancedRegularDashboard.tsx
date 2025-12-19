import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getUserCredits, getUserProfile, getStudentClasses } from '@/lib/database'
import { logger } from '@/lib/logger'
import EnhancedHeader from './EnhancedHeader'
import EnhancedQuickStats from './EnhancedQuickStats'
import EnhancedUpcomingClass from './EnhancedUpcomingClass'
import EnhancedPlanOverview from './EnhancedPlanOverview'
import EnhancedCreditsCard from './EnhancedCreditsCard'
import EnhancedRecentActivity from './EnhancedRecentActivity'
import EnhancedAccomplishments from './EnhancedAccomplishments'
import EnhancedAddCreditsModal from './EnhancedAddCreditsModal'
import Footer from '@/components/Footer'
import { DashboardCardSkeleton } from '@/components/skeletons'
import { useToast, ToastContainer } from '@/components/ui/toast'
import type { ClassCredits } from '@/types'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  teacher_name?: string
  subject?: string
}

interface DashboardData {
  credits: ClassCredits | null
  profile: any
  classes: ClassSession[]
}

export default function EnhancedRegularDashboard() {
  const { user, signOut } = useAuth()
  const { toasts, removeToast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data: credits, error: creditsError } = await getUserCredits(user.id)
      if (creditsError) {
        logger.error('Error loading credits:', creditsError)
      }

      const { data: profile, error: profileError } = await getUserProfile(user.id)
      if (profileError) {
        logger.error('Error loading profile:', profileError)
      }

      const { data: classSessions, error: classSessionsError } = await getStudentClasses(user.id)
      if (classSessionsError) {
        logger.error('Error loading class sessions:', classSessionsError)
      }

      const classes: ClassSession[] = (classSessions || []).map(session => ({
        id: session.id,
        date: session.date,
        time: session.time,
        duration: session.duration,
        meetingLink: session.meeting_link,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
        teacher_name: session.teacher_name || 'الأستاذ أحمد',
        subject: session.subject || 'اللغة الإنجليزية'
      }))

      setDashboardData({
        credits,
        profile,
        classes
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

  const getFirstName = () => {
    return user?.user_metadata?.first_name || dashboardData?.profile?.first_name || 'أحمد'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50"></div>
        <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <DashboardCardSkeleton count={3} />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2 arabic-text">خطأ في التحميل</h3>
            <p className="text-red-700 mb-4 arabic-text">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors arabic-text"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  const upcomingClass = dashboardData?.classes?.find(c => c.status === 'scheduled')
  const completedClasses = dashboardData?.classes?.filter(c => c.status === 'completed').length || 0
  const scheduledClasses = dashboardData?.classes?.filter(c => c.status === 'scheduled').length || 0

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <EnhancedHeader
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userName={getFirstName()}
        userEmail={user?.email || ''}
        onSignOut={handleSignOut}
      />

      <main className="pt-20 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Welcome Section */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <div className="text-right">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 arabic-text">
                هلا، {getFirstName()}! 👋
              </h1>
              <p className="text-lg text-gray-600 arabic-text">هذا ملخص نشاطك اليوم</p>
            </div>
          </div>

          {/* Quick Stats */}
          <EnhancedQuickStats
            completedClasses={completedClasses}
            currentStreak={12}
            credits={dashboardData?.credits?.credits || 0}
            onAddCredits={() => setIsAddCreditsModalOpen(true)}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2 animate-fade-in">
              <EnhancedUpcomingClass upcomingClass={upcomingClass} />
            </div>
            <div className="animate-fade-in">
              <EnhancedPlanOverview
                totalSessions={20}
                completedSessions={completedClasses}
                nextSession={upcomingClass}
              />
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2 animate-fade-in">
              <EnhancedCreditsCard
                currentBalance={dashboardData?.credits?.credits || 0}
                onAddCredits={() => setIsAddCreditsModalOpen(true)}
              />
            </div>
            <div className="animate-fade-in">
              <EnhancedRecentActivity classes={dashboardData?.classes || []} />
            </div>
          </div>

          {/* Accomplishments */}
          <div className="animate-fade-in">
            <EnhancedAccomplishments completedClasses={completedClasses} />
          </div>
        </div>
      </main>

      <EnhancedAddCreditsModal
        open={isAddCreditsModalOpen}
        onClose={() => setIsAddCreditsModalOpen(false)}
      />

      <Footer />
    </div>
  )
}
