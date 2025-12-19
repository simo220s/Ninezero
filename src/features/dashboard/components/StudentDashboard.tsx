import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserCredits, getUserProfile, getUserReferrals, getStudentClasses } from '@/lib/database'
import { Link } from 'react-router-dom'
import type { ClassCredits, ReferralStats } from '@/types'
import PendingReviews from './PendingReviews'
import ClassScheduleTable from './ClassScheduleTable'
import UpcomingClassesSection from './UpcomingClassesSection'
import Footer from '@/components/Footer'
import DashboardNav from '@/components/DashboardNav'
import { formatDate } from '@/lib/formatters'
import { Home, Calendar, User, Copy, Share2, TrendingUp } from 'lucide-react'
import { DashboardCardSkeleton } from '@/components/skeletons'
import { logger } from '@/lib/logger'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
}

interface DashboardData {
  credits: ClassCredits | null
  profile: any
  referralStats: ReferralStats
  classes: ClassSession[]
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load user credits
      const { data: credits, error: creditsError } = await getUserCredits(user.id)
      if (creditsError) {
        logger.error('Error loading credits:', creditsError)
      }

      // Load user profile
      const { data: profile, error: profileError } = await getUserProfile(user.id)
      if (profileError) {
        logger.error('Error loading profile:', profileError)
      }

      // Load referral stats
      const { data: referrals, error: referralsError } = await getUserReferrals(user.id)
      if (referralsError) {
        logger.error('Error loading referrals:', referralsError)
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
        meetingLink: session.meeting_link,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show'
      }))

      // Calculate referral stats
      const referralStats: ReferralStats = {
        totalReferrals: referrals?.length || 0,
        pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0,
        completedReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
        totalCreditsEarned: referrals?.reduce((sum, r) => sum + (r.credits_awarded || 0), 0) || 0,
        referralCode: profile?.referral_code || 'LOADING...',
        shareableLink: `${window.location.origin}/signup?ref=${profile?.referral_code || ''}`
      }

      setDashboardData({
        credits,
        profile,
        referralStats,
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    const firstName = user?.user_metadata?.first_name || dashboardData?.profile?.first_name || 'طالب'

    if (hour < 12) return `صباح الخير يا ${firstName}`
    if (hour < 17) return `مساء الخير يا ${firstName}`
    return `مساء الخير يا ${firstName}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light" dir="rtl">
        {/* Header Skeleton */}
        <header className="bg-white shadow-custom-sm border-b border-border-light">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="animate-pulse space-y-2 w-full sm:w-auto">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="animate-pulse h-10 bg-gray-200 rounded flex-1 sm:flex-none sm:w-32"></div>
                <div className="animate-pulse h-10 bg-gray-200 rounded flex-1 sm:flex-none sm:w-32"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Navigation Skeleton */}
        <nav className="bg-white border-b border-border-light">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-4 overflow-x-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-2 px-4 py-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          {/* Quick Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <DashboardCardSkeleton count={3} />
          </div>

          {/* Dashboard Sections Skeleton */}
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary arabic-text mb-2">خطأ في التحميل</h3>
            <p className="text-text-secondary arabic-text mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="arabic-text">المحاولة مرة أخرى</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-custom-sm border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary arabic-text">
                {getGreeting()}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary arabic-text">
                مرحباً بك في لوحة التحكم الخاصة بك
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button asChild variant="outline" className="arabic-text flex-1 sm:flex-none text-sm sm:text-base h-10 sm:h-11">
                <Link to="/" className="flex items-center justify-center">الصفحة الرئيسية</Link>
              </Button>
              <Button variant="danger" onClick={handleSignOut} className="arabic-text flex-1 sm:flex-none text-sm sm:text-base h-10 sm:h-11">
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Navigation */}
      <DashboardNav
        items={[
          {
            label: 'الصفحة الرئيسية',
            icon: <Home className="w-5 h-5" />,
            path: '/dashboard/student'
          },
          {
            label: 'الحصص القادمة',
            icon: <Calendar className="w-5 h-5" />,
            path: '/dashboard/student/classes',
            badge: dashboardData?.classes?.filter(c => c.status === 'scheduled').length.toString() || '0'
          },
          {
            label: 'الملف الشخصي',
            icon: <User className="w-5 h-5" />,
            path: '/dashboard/student/profile'
          },
        ]}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Subscription Plan Banner */}
        {(!dashboardData?.credits || dashboardData.credits.credits < 2) && (
          <Card className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900 arabic-text mb-1 text-base sm:text-lg">
                      رصيدك منخفض!
                    </h3>
                    <p className="text-primary-700 arabic-text text-sm sm:text-base">
                      احصل على المزيد من الحصص واستمر في رحلة التعلم
                    </p>
                  </div>
                </div>
                <Button asChild className="arabic-text w-full sm:w-auto whitespace-nowrap">
                  <Link to="/#pricing">اشترِ خطة</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Credits Card */}
          <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200 hover-scale transition-all shadow-md hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-success-700 arabic-text flex items-center justify-between text-base sm:text-lg">
                <span className="flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  رصيد الحصص
                </span>
                <TrendingUp className="w-5 h-5 text-success-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl sm:text-4xl font-bold text-success-700 mb-2">
                {dashboardData?.credits?.credits || '0.5'}
              </div>
              <p className="text-success-700 text-xs sm:text-sm arabic-text mb-3 sm:mb-4">رصيد الحصص المتبقي</p>
              <Button asChild size="sm" className="arabic-text w-full min-h-[44px] shadow-sm hover:shadow-md transition-shadow">
                <Link to="/#pricing">إضافة رصيد</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="hover-scale transition-all shadow-md hover:shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="arabic-text flex items-center text-blue-900 text-base sm:text-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-text-primary arabic-text font-medium text-sm sm:text-base">
                  {dashboardData?.profile?.first_name} {dashboardData?.profile?.last_name}
                </p>
                <p className="text-text-secondary text-xs sm:text-sm break-all">{user?.email}</p>
                <p className="text-xs text-text-secondary arabic-text">
                  عضو منذ {formatDate(user?.created_at || '')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="bg-gradient-to-br from-whatsapp/10 to-green-50 border-green-200 hover-scale transition-all shadow-md hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-700 arabic-text flex items-center text-base sm:text-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                الدعم الفني
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-green-700 text-xs sm:text-sm arabic-text mb-3 sm:mb-4">
                متاح 24/7 عبر واتساب
              </p>
              <Button
                variant="whatsapp"
                size="sm"
                className="arabic-text w-full min-h-[44px] shadow-sm hover:shadow-md transition-shadow"
                onClick={() => window.open('https://wa.me/966564084838', '_blank')}
              >
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382" />
                </svg>
                تواصل معنا
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Learning Progress */}
        <Card className="mb-6 sm:mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="arabic-text flex items-center">
              <svg className="w-6 h-6 ml-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              تقدمك التعليمي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {dashboardData?.classes?.filter(c => c.status === 'completed').length || 0}
                </div>
                <p className="text-blue-700 text-sm arabic-text">حصص مكتملة</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {dashboardData?.classes?.filter(c => c.status === 'scheduled').length || 0}
                </div>
                <p className="text-green-700 text-sm arabic-text">حصص قادمة</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {Math.round(((dashboardData?.classes?.filter(c => c.status === 'completed').length || 0) / Math.max(dashboardData?.classes?.length || 1, 1)) * 100)}%
                </div>
                <p className="text-purple-700 text-sm arabic-text">نسبة الحضور</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Sections */}
        <div className="space-y-8">
          {/* Upcoming Classes Section - Prominent Display */}
          <UpcomingClassesSection
            classes={dashboardData?.classes || []}
            loading={loading}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover-scale cursor-pointer transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-primary-200" onClick={() => window.location.href = '/book-regular'}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 arabic-text mb-1">حجز حصة</h3>
                <p className="text-sm text-gray-600 arabic-text">احجز حصتك القادمة</p>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-success-200" onClick={() => window.location.href = '/#pricing'}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-success-100 to-success-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 arabic-text mb-1">شراء رصيد</h3>
                <p className="text-sm text-gray-600 arabic-text">أضف المزيد من الحصص</p>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-green-200" onClick={() => window.open('https://wa.me/966564084838', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-whatsapp/10 to-whatsapp/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-whatsapp" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.
