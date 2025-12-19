import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { getUserCredits, getUserProfile, getStudentClasses } from '@/lib/database'
import { Link, useNavigate } from 'react-router-dom'
import type { ClassCredits } from '@/types'
import MobileNavigation from './MobileNavigation'
import Footer from '@/components/Footer'
import { formatDate } from '@/lib/formatters'
import { 
  Calendar, 
  Menu, 
  CreditCard, 
  Clock, 
  Video,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
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

export default function RegularStudentDashboardNew() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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

  const getNextClass = () => {
    if (!dashboardData?.classes) return null
    const scheduled = dashboardData.classes
      .filter(c => c.status === 'scheduled')
      .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
    return scheduled[0] || null
  }

  const getTimeUntilClass = (classDate: string, classTime: string) => {
    const classDateTime = new Date(classDate + ' ' + classTime)
    const now = new Date()
    const diff = classDateTime.getTime() - now.getTime()
    
    if (diff < 0) return 'الآن'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `بعد ${days} يوم`
    if (hours > 0) return `بعد ${hours} ساعة`
    return `بعد ${minutes} دقيقة`
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
          <CardContent className="p-6 text-center text-right" dir="rtl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 arabic-text mb-4 text-right">{error}</p>
            <Button onClick={loadDashboardData} className="arabic-text">إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextClass = getNextClass()
  const currentCredits = dashboardData?.credits?.credits || 0
  const completedClasses = dashboardData?.classes?.filter(c => c.status === 'completed').length || 0
  const scheduledClasses = dashboardData?.classes?.filter(c => c.status === 'scheduled').length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-4" dir="rtl">
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-3 flex-row-reverse" dir="rtl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileNavOpen(true)}
                className="h-10 w-10 p-0"
                aria-label="فتح القائمة"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="text-right" dir="rtl">
                <h1 className="text-xl font-bold text-gray-900 arabic-text text-right">
                  {getGreeting()}
                </h1>
                <p className="text-sm text-gray-600 arabic-text text-right">
                  طالب منتظم
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
              <Button asChild variant="outline" size="sm" className="arabic-text">
                <Link to="/">الصفحة الرئيسية</Link>
              </Button>
              <Button variant="danger" size="sm" onClick={handleSignOut} className="arabic-text">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6" dir="rtl">
        {/* Next Class Card - Prominent */}
        {nextClass && (
          <Card className="mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl" dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="flex items-start justify-between flex-row-reverse mb-4" dir="rtl">
                <div className="text-right flex-1" dir="rtl">
                  <p className="text-blue-100 text-sm mb-1 arabic-text text-right">الحصة القادمة</p>
                  <h2 className="text-2xl font-bold mb-2 arabic-text text-right">حصة اللغة الإنجليزية</h2>
                  <div className="flex items-center gap-4 flex-row-reverse flex-wrap" dir="rtl">
                    <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm arabic-text">{new Date(nextClass.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm arabic-text">{nextClass.time}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2" dir="rtl">
                  <p className="text-sm font-semibold arabic-text text-right">{getTimeUntilClass(nextClass.date, nextClass.time)}</p>
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse" dir="rtl">
                {nextClass.meetingLink && (
                  <Button 
                    asChild
                    className="flex-1 bg-white text-blue-600 hover:bg-blue-50 arabic-text"
                  >
                    <a href={nextClass.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 flex-row-reverse">
                      <Video className="w-4 h-4" />
                      <span>دخول الحصة</span>
                    </a>
                  </Button>
                )}
                <Button 
                  asChild
                  variant="outline" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 arabic-text"
                >
                  <Link to="/dashboard/student/classes" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <Calendar className="w-4 h-4" />
                    <span>جميع الحصص</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" dir="rtl">
          {/* Credits Card */}
          <Card className="hover:shadow-lg transition-shadow" dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="flex items-center justify-between flex-row-reverse mb-4" dir="rtl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right flex-1 mr-4" dir="rtl">
                  <p className="text-sm text-gray-600 arabic-text text-right mb-1">رصيد الحصص</p>
                  <p className="text-3xl font-bold text-green-600 text-right">{currentCredits}</p>
                </div>
              </div>
              <Button asChild size="sm" className="w-full arabic-text">
                <Link to="/#pricing">إضافة رصيد</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Completed Classes Card */}
          <Card className="hover:shadow-lg transition-shadow" dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="flex items-center justify-between flex-row-reverse mb-4" dir="rtl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right flex-1 mr-4" dir="rtl">
                  <p className="text-sm text-gray-600 arabic-text text-right mb-1">حصص مكتملة</p>
                  <p className="text-3xl font-bold text-blue-600 text-right">{completedClasses}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 arabic-text text-right">
                إجمالي الحصص المنجزة
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Classes Card */}
          <Card className="hover:shadow-lg transition-shadow" dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="flex items-center justify-between flex-row-reverse mb-4" dir="rtl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right flex-1 mr-4" dir="rtl">
                  <p className="text-sm text-gray-600 arabic-text text-right mb-1">حصص قادمة</p>
                  <p className="text-3xl font-bold text-purple-600 text-right">{scheduledClasses}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 arabic-text text-right">
                حصص مجدولة
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" dir="rtl">
          {/* Left Column - Calendar and Subscription */}
          <div className="lg:col-span-2 space-y-6" dir="rtl">
            {/* Calendar */}
            <Card dir="rtl">
              <CardHeader className="text-right" dir="rtl">
                <CardTitle className="arabic-text flex items-center flex-row-reverse text-right">
                  <Calendar className="w-6 h-6 ml-2 text-primary-600" />
                  التقويم
                </CardTitle>
              </CardHeader>
              <CardContent dir="rtl">
                <MiniCalendar classes={dashboardData?.classes || []} />
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card dir="rtl">
              <CardHeader className="text-right" dir="rtl">
                <CardTitle className="arabic-text flex items-center flex-row-reverse text-right">
                  <TrendingUp className="w-6 h-6 ml-2 text-primary-600" />
                  خطة الاشتراك
                </CardTitle>
              </CardHeader>
              <CardContent dir="rtl">
                <div className="space-y-4" dir="rtl">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex-row-reverse" dir="rtl">
                    <div className="text-right" dir="rtl">
                      <p className="text-sm text-gray-600 arabic-text text-right">الحالة</p>
                      <p className="text-lg font-bold text-blue-600 arabic-text text-right">نشط</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4" dir="rtl">
                    <div className="text-right p-3 bg-gray-50 rounded-lg" dir="rtl">
                      <p className="text-xs text-gray-600 arabic-text text-right mb-1">الرصيد المتبقي</p>
                      <p className="text-xl font-bold text-gray-900 text-right">{currentCredits} حصة</p>
                    </div>
                    <div className="text-right p-3 bg-gray-50 rounded-lg" dir="rtl">
                      <p className="text-xs text-gray-600 arabic-text text-right mb-1">الحصص المجدولة</p>
                      <p className="text-xl font-bold text-gray-900 text-right">{scheduledClasses} حصة</p>
                    </div>
                  </div>

                  <Button asChild className="w-full arabic-text" variant="outline">
                    <Link to="/dashboard/student/subscription" className="flex items-center justify-center gap-2 flex-row-reverse">
                      <span>إدارة الاشتراك</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6" dir="rtl">
            {/* Quick Actions */}
            <Card dir="rtl">
              <CardHeader className="text-right" dir="rtl">
                <CardTitle className="arabic-text text-right">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3" dir="rtl">
                <Button asChild className="w-full arabic-text h-12" size="lg">
                  <Link to="/book-regular" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <Calendar className="w-5 h-5" />
                    <span>حجز حصة جديدة</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full arabic-text h-12" size="lg">
                  <Link to="/#pricing" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <CreditCard className="w-5 h-5" />
                    <span>شراء رصيد</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full arabic-text h-12" size="lg">
                  <Link to="/dashboard/student/classes" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <BookOpen className="w-5 h-5" />
                    <span>جميع الحصص</span>
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full arabic-text h-12" 
                  size="lg"
                  onClick={() => window.open('https://wa.me/966564084838', '_blank')}
                >
                  <span className="flex items-center justify-center gap-2 flex-row-reverse">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382" />
                    </svg>
                    <span>تواصل معنا</span>
                  </span>
                </Button>
              </CardContent>
            </Card>

            {/* Low Credit Warning */}
            {currentCredits < 2 && (
              <Card className="border-orange-200 bg-orange-50" dir="rtl">
                <CardContent className="p-4" dir="rtl">
                  <div className="flex items-start gap-3 flex-row-reverse" dir="rtl">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-right flex-1" dir="rtl">
                      <p className="font-semibold text-orange-900 arabic-text text-right mb-1">
                        رصيدك منخفض!
                      </p>
                      <p className="text-sm text-orange-700 arabic-text text-right mb-3">
                        رصيدك الحالي أقل من حصتين. أضف رصيد لضمان استمرارية الحصص.
                      </p>
                      <Button asChild size="sm" className="w-full arabic-text">
                        <Link to="/#pricing">إضافة رصيد الآن</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
