import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { getUserCredits, getUserProfile, getStudentClasses } from '@/lib/database'
import { Link, useLocation } from 'react-router-dom'
import type { ClassCredits } from '@/types'
import MobileNavigation from './MobileNavigation'
import Footer from '@/components/Footer'
import { formatDate } from '@/lib/formatters'
import { Calendar, Menu, BookOpen, Target, TrendingUp, Award } from 'lucide-react'
import { DashboardCardSkeleton } from '@/components/skeletons'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MiniCalendar from './enhanced/MiniCalendar'

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
  classes: ClassSession[]
}

export default function RegularStudentDashboard() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Persist current page in localStorage
  useEffect(() => {
    const currentPath = location.pathname
    localStorage.setItem('lastVisitedDashboardPage', currentPath)
  }, [location.pathname])

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    const firstName = user?.user_metadata?.first_name || dashboardData?.profile?.first_name || 'طالب'

    if (hour < 12) return `صباح الخير يا ${firstName}`
    if (hour < 17) return `مساء الخير يا ${firstName}`
    return `مساء الخير يا ${firstName}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
        <DashboardCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 arabic-text mb-4">{error}</p>
            <Button onClick={loadDashboardData}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      {/* REGULAR STUDENT BANNER - VERY VISIBLE */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-4 text-center shadow-xl border-b-4 border-indigo-700" dir="rtl">
        <div className="max-w-7xl mx-auto text-right" dir="rtl">
          <div className="flex items-center justify-center gap-3 mb-2 flex-row-reverse" dir="rtl">
            <span className="text-3xl">⭐</span>
            <h2 className="text-xl sm:text-2xl font-black arabic-text uppercase text-right">
              طالب منتظم - REGULAR STUDENT
            </h2>
            <span className="px-4 py-1.5 bg-white/30 rounded-full text-base font-black">
              💎 PREMIUM
            </span>
          </div>
          <p className="text-white/90 text-sm arabic-text font-semibold text-right">
            عضوية كاملة مع جميع المميزات
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-custom-sm border-b-4 border-indigo-300" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-4" dir="rtl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right" dir="rtl">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-row-reverse" dir="rtl">
              {/* Hamburger Menu Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileNavOpen(true)}
                className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 p-0"
                aria-label="فتح القائمة"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1 text-right" dir="rtl">
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 arabic-text text-right">
                  {getGreeting()} 💎 (منتظم)
                </h1>
                <p className="text-sm sm:text-base text-indigo-700 arabic-text font-semibold text-right">
                  مرحباً بك في لوحة التحكم الخاصة بك - طالب منتظم مميز
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-row-reverse" dir="rtl">
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

      {/* Mobile Navigation */}
      <MobileNavigation
        user={user}
        profile={dashboardData?.profile}
        onSignOut={handleSignOut}
        isOpen={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />

      {/* Dashboard Navigation - Placeholder for future implementation */}
      {/* TODO: Implement DashboardNav component in task 13 */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8" dir="rtl">
        {/* Learning Progress Overview */}
        <Card className="mb-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200" dir="rtl">
          <CardContent className="p-6 text-right" dir="rtl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6" dir="rtl">
              <div className="flex items-start gap-4 flex-row-reverse" dir="rtl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="text-right" dir="rtl">
                  <h3 className="text-xl font-bold text-gray-900 arabic-text mb-2 text-right">
                    مرحباً بك في رحلة التعلم!
                  </h3>
                  <p className="text-gray-600 arabic-text text-sm sm:text-base mb-3 text-right">
                    استمر في التقدم وحقق أهدافك التعليمية مع الأستاذ أحمد
                  </p>
                  <div className="flex items-center gap-4 text-sm flex-row-reverse" dir="rtl">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 arabic-text text-right">نشط</span>
                    </div>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600 arabic-text text-right">مستوى متقدم</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-row-reverse" dir="rtl">
                <Button asChild className="arabic-text">
                  <Link to="/book-regular">حجز حصة جديدة</Link>
                </Button>
                {(!dashboardData?.credits || dashboardData.credits.credits < 2) && (
                  <Button asChild variant="outline" className="arabic-text">
                    <Link to="/#pricing">إضافة رصيد</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8" dir="rtl">
          {/* Credits Card */}
          <Card className="bg-success-50 border-success-200 hover-scale transition-all" dir="rtl">
            <CardHeader className="pb-3 text-right" dir="rtl">
              <CardTitle className="text-success-600 arabic-text flex items-center text-base sm:text-lg flex-row-reverse text-right">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ms-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                رصيد الحصص
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-right" dir="rtl">
              <div className="text-2xl sm:text-3xl font-bold text-success-600 mb-2 text-right">
                {dashboardData?.credits?.credits || '0.5'}
              </div>
              <p className="text-success-600 text-xs sm:text-sm arabic-text mb-3 sm:mb-4 text-right">رصيد الحصص المتبقي</p>
              <Button asChild size="sm" className="arabic-text w-full min-h-[44px]">
                <Link to="/#pricing">إضافة رصيد</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="hover-scale transition-all" dir="rtl">
            <CardHeader className="pb-3 text-right" dir="rtl">
              <CardTitle className="arabic-text flex items-center text-base sm:text-lg flex-row-reverse text-right">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ms-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-right" dir="rtl">
              <div className="space-y-2 text-right" dir="rtl">
                <p className="text-text-primary arabic-text font-medium text-sm sm:text-base text-right">
                  {dashboardData?.profile?.first_name} {dashboardData?.profile?.last_name}
                </p>
                <p className="text-text-secondary text-xs sm:text-sm break-all text-right">{user?.email}</p>
                <p className="text-xs text-text-secondary arabic-text text-right">
                  عضو منذ {formatDate(user?.created_at || '')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="bg-primary-50 border-primary-200 hover-scale transition-all" dir="rtl">
            <CardHeader className="pb-3 text-right" dir="rtl">
              <CardTitle className="text-primary-600 arabic-text flex items-center text-base sm:text-lg flex-row-reverse text-right">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ms-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                الدعم
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-right" dir="rtl">
              <p className="text-primary-600 text-xs sm:text-sm arabic-text mb-3 sm:mb-4 text-right">
                متاح 24/7 عبر واتساب
              </p>
              <Button
                variant="whatsapp"
                size="sm"
                className="arabic-text w-full min-h-[44px]"
                onClick={() => window.open('https://wa.me/966564084838', '_blank')}
              >
                تواصل عبر واتساب
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Learning Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" dir="rtl">
          {/* Learning Progress */}
          <Card className="lg:col-span-2" dir="rtl">
            <CardHeader className="text-right" dir="rtl">
              <CardTitle className="arabic-text flex items-center flex-row-reverse text-right">
                <TrendingUp className="w-6 h-6 ms-2 text-primary-600" />
                تقدمك التعليمي
              </CardTitle>
            </CardHeader>
            <CardContent className="text-right" dir="rtl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-right" dir="rtl">
                <div className="text-center text-right p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200" dir="rtl">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {dashboardData?.classes?.filter(c => c.status === 'completed').length || 0}
                  </div>
                  <p className="text-blue-700 text-sm arabic-text font-medium text-right">حصص مكتملة</p>
                </div>
                <div className="text-center text-right p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200" dir="rtl">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {dashboardData?.classes?.filter(c => c.status === 'scheduled').length || 0}
                  </div>
                  <p className="text-green-700 text-sm arabic-text font-medium text-right">حصص قادمة</p>
                </div>
                <div className="text-center text-right p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200" dir="rtl">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round(((dashboardData?.classes?.filter(c => c.status === 'completed').length || 0) / Math.max(dashboardData?.classes?.length || 1, 1)) * 100)}%
                  </div>
                  <p className="text-purple-700 text-sm arabic-text font-medium text-right">نسبة الحضور</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-4 text-right" dir="rtl">
                <div className="text-right" dir="rtl">
                  <div className="flex justify-between text-sm mb-2 text-right flex-row-reverse" dir="rtl">
                    <span className="text-gray-700 arabic-text font-medium text-right">التقدم الإجمالي</span>
                    <span className="text-primary-600 font-semibold">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3" dir="rtl">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="text-right" dir="rtl">
                  <div className="flex justify-between text-sm mb-2 text-right flex-row-reverse" dir="rtl">
                    <span className="text-gray-700 arabic-text font-medium text-right">مهارات المحادثة</span>
                    <span className="text-green-600 font-semibold">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3" dir="rtl">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="text-right" dir="rtl">
                  <div className="flex justify-between text-sm mb-2 text-right flex-row-reverse" dir="rtl">
                    <span className="text-gray-700 arabic-text font-medium text-right">القواعد</span>
                    <span className="text-blue-600 font-semibold">70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3" dir="rtl">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mini Calendar */}
          <Card dir="rtl">
            <CardHeader className="text-right" dir="rtl">
              <CardTitle className="arabic-text flex items-center flex-row-reverse text-right">
                <Calendar className="w-6 h-6 ms-2 text-primary-600" />
                التقويم
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0" dir="rtl">
              <MiniCalendar classes={dashboardData?.classes || []} />
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div className="mb-8" dir="rtl">
          <Card dir="rtl">
            <CardHeader className="text-right" dir="rtl">
              <CardTitle className="arabic-text flex items-center flex-row-reverse text-right">
                <Award className="w-6 h-6 ms-2 text-yellow-600" />
                الإنجازات
              </CardTitle>
            </CardHeader>
            <CardContent className="text-right" dir="rtl">
              <div className="space-y-4 text-right" dir="rtl">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex-row-reverse" dir="rtl">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right" dir="rtl">
                    <p className="font-semibold text-yellow-800 arabic-text text-sm text-right">طالب مجتهد</p>
                    <p className="text-yellow-600 text-xs arabic-text text-right">حضور 10 حصص متتالية</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 flex-row-reverse" dir="rtl">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right" dir="rtl">
                    <p className="font-semibold text-green-800 arabic-text text-sm text-right">محقق الأهداف</p>
                    <p className="text-green-600 text-xs arabic-text text-right">إكمال مستوى كامل</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex-row-reverse" dir="rtl">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right" dir="rtl">
                    <p className="font-semibold text-blue-800 arabic-text text-sm text-right">متقدم سريع</p>
                    <p className="text-blue-600 text-xs arabic-text text-right">تحسن ملحوظ في الأداء</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-8" dir="rtl">
          {/* Upcoming Classes Section - Placeholder */}
          {dashboardData?.classes && dashboardData.classes.length > 0 && (
            <Card dir="rtl">
              <CardHeader className="text-right" dir="rtl">
                <CardTitle className="arabic-text text-right">الحصص القادمة</CardTitle>
              </CardHeader>
              <CardContent dir="rtl">
                <div className="space-y-3" dir="rtl">
                  {dashboardData.classes
                    .filter(c => c.status === 'scheduled')
                    .slice(0, 3)
                    .map((classItem) => (
                      <div
                        key={classItem.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-right"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-between flex-row-reverse" dir="rtl">
                          <div className="text-right" dir="rtl">
                            <p className="font-semibold text-gray-900 arabic-text text-right">
                              {classItem.date}
                            </p>
                            <p className="text-sm text-gray-600 arabic-text text-right">
                              {classItem.time} - {classItem.duration} دقيقة
                            </p>
                          </div>
                          <Calendar className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
            <Card className="hover-scale cursor-pointer transition-all" onClick={() => window.location.href = '/book-regular'} dir="rtl">
              <CardContent className="p-6 text-center text-right" dir="rtl">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 arabic-text mb-1 text-right">حجز حصة</h3>
                <p className="text-sm text-gray-600 arabic-text text-right">احجز حصتك القادمة</p>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer transition-all" onClick={() => window.location.href = '/#pricing'} dir="rtl">
              <CardContent className="p-6 text-center text-right" dir="rtl">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 arabic-text mb-1 text-right">شراء رصيد</h3>
                <p className="text-sm text-gray-600 arabic-text text-right">أضف المزيد من الحصص</p>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer transition-all" onClick={() => window.open('https://wa.me/966564084838', '_blank')} dir="rtl">
              <CardContent className="p-6 text-center text-right" dir="rtl">
                <div className="w-12 h-12 bg-whatsapp/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-whatsapp" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 arabic-text mb-1 text-right">تواصل معنا</h3>
                <p className="text-sm text-gray-600 arabic-text text-right">دعم فوري عبر واتساب</p>
              </CardContent>
            </Card>
          </div>

          {/* Class Schedule Table - Placeholder for future implementation */}
          {/* TODO: Implement ClassScheduleTable component in task 15 */}

          {/* Subscription Management - Placeholder */}
          <Card dir="rtl">
            <CardHeader className="text-right" dir="rtl">
              <CardTitle className="arabic-text text-right">إدارة الاشتراك</CardTitle>
            </CardHeader>
            <CardContent dir="rtl">
              <div className="space-y-4 text-right" dir="rtl">
                <div className="flex items-center justify-between flex-row-reverse" dir="rtl">
                  <span className="text-gray-700 arabic-text text-right">رصيد الحصص:</span>
                  <span className="font-bold text-primary-600">
                    {dashboardData?.credits?.credits || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-row-reverse" dir="rtl">
                  <span className="text-gray-700 arabic-text text-right">الحصص المكتملة:</span>
                  <span className="font-bold text-green-600">
                    {dashboardData?.classes?.filter(c => c.status === 'completed').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-row-reverse" dir="rtl">
                  <span className="text-gray-700 arabic-text text-right">الحصص القادمة:</span>
                  <span className="font-bold text-blue-600">
                    {dashboardData?.classes?.filter(c => c.status === 'scheduled').length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
