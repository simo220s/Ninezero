import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { getUserCredits, getUserProfile, getStudentClasses } from '@/lib/database'
import { Link } from 'react-router-dom'
import type { ClassCredits } from '@/types'
import MobileNavigation from './MobileNavigation'
import Footer from '@/components/Footer'
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
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Home,
  MoreVertical
} from 'lucide-react'
import { DashboardCardSkeleton } from '@/components/skeletons'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import MiniCalendar from './enhanced/MiniCalendar'
import ClassDetailsModal from './ClassDetailsModal'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  subject?: string
  price?: number
  student_id?: string
}

interface UserProfile {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
}

interface DashboardData {
  credits: ClassCredits | null
  profile: UserProfile | null
  classes: ClassSession[]
}

const LOW_CREDIT_THRESHOLD = 2

export default function RegularStudentDashboardEnhanced() {
  const { user, signOut } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const megaMenuRef = useRef<HTMLDivElement | null>(null)

  const loadDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data: credits, error: creditsError } = await getUserCredits(user.id)
      if (creditsError) {
        logger.error('Error loading credits:', creditsError)
        setError('حدث خطأ في تحميل بيانات الرصيد')
      }

      const { data: profile, error: profileError } = await getUserProfile(user.id)
      if (profileError) {
        logger.error('Error loading profile:', profileError)
        if (!error) setError('حدث خطأ في تحميل بيانات الملف الشخصي')
      }

      const { data: classSessions, error: classSessionsError } = await getStudentClasses(user.id)
      if (classSessionsError) {
        logger.error('Error loading class sessions:', classSessionsError)
        if (!error) setError('حدث خطأ في تحميل بيانات الحصص')
      }

      const classes: ClassSession[] = (classSessions || []).map(session => ({
        id: session.id,
        date: session.date,
        time: session.time,
        duration: session.duration,
        meetingLink: session.meeting_link,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
        subject: session.subject || 'حصة اللغة الإنجليزية',
        price: session.price,
        student_id: session.student_id || user.id
      }))

      setDashboardData({
        credits,
        profile,
        classes
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات'
      setError(errorMessage)
      logger.error('Dashboard loading error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, loadDashboardData])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-mega-menu-trigger]')
      ) {
        setMegaMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMegaMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])


  const handleSignOut = async () => {
    await signOut()
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const firstName = user?.user_metadata?.first_name || dashboardData?.profile?.first_name || 'طالب'

    if (hour < 12) return `صباح الخير، ${firstName}`
    if (hour < 17) return `مساء الخير، ${firstName}`
    return `مساء الخير، ${firstName}`
  }, [user?.user_metadata?.first_name, dashboardData?.profile?.first_name])

  const nextClass = useMemo(() => {
    if (!dashboardData?.classes) return null
    const scheduled = dashboardData.classes
      .filter(c => c.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA.getTime() - dateB.getTime()
      })
    return scheduled[0] || null
  }, [dashboardData?.classes])

  const getTimeUntilClass = useCallback((classDate: string, classTime: string) => {
    try {
      const classDateTime = new Date(`${classDate}T${classTime}`)
      const now = new Date()
      const diff = classDateTime.getTime() - now.getTime()
      
      if (diff < 0) return 'الآن'
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) return `بعد ${days} ${days === 1 ? 'يوم' : 'أيام'}`
      if (hours > 0) return `بعد ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`
      return `بعد ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`
    } catch (err) {
      logger.error('Error calculating time until class:', err)
      return 'قريباً'
    }
  }, [])

  const handleOpenClassDetails = (classSession: ClassSession) => {
    setSelectedClass(classSession)
    setIsDetailsModalOpen(true)
  }

  const handleCloseClassDetails = () => {
    setIsDetailsModalOpen(false)
    setSelectedClass(null)
  }

  // All hooks must be called before any conditional returns
  const stats = useMemo(() => {
    const currentCredits = dashboardData?.credits?.credits || 0
    const completedClasses = dashboardData?.classes?.filter(c => c.status === 'completed').length || 0
    const scheduledClasses = dashboardData?.classes?.filter(c => c.status === 'scheduled').length || 0
    const totalScheduled = scheduledClasses + completedClasses
    const progressPercentage = totalScheduled > 0 ? (completedClasses / totalScheduled) * 100 : 0

    const firstName = user?.user_metadata?.first_name || dashboardData?.profile?.first_name || 'طالب'
    const initials = firstName.charAt(0).toUpperCase()

    return {
      currentCredits,
      completedClasses,
      scheduledClasses,
      progressPercentage,
      firstName,
      initials
    }
  }, [dashboardData, user])

  const { currentCredits, completedClasses, scheduledClasses, progressPercentage, initials } = stats

  const formattedNextClassDate = useMemo(() => {
    if (!nextClass?.date) return ''
    try {
      return new Date(nextClass.date).toLocaleDateString('ar-SA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (err) {
      logger.error('Error formatting date:', err)
      return nextClass.date
    }
  }, [nextClass?.date])

  const megaMenuSections = [
    {
      title: 'لوحة الطالب',
      description: 'الوصول السريع لجميع الصفحات الرئيسية',
      links: [
        { label: 'الصفحة الرئيسية', to: '/dashboard/student', icon: Home },
        { label: 'الحصص القادمة', to: '/dashboard/student/classes', icon: Calendar },
        { label: 'إدارة الاشتراك', to: '/dashboard/student/subscription', icon: TrendingUp },
      ],
    },
    {
      title: 'الإجراءات',
      description: 'نفّذ أهم الإجراءات بخطوة واحدة',
      links: [
        { label: 'حجز حصة جديدة', to: '/book-regular', icon: BookOpen },
        { label: 'شراء رصيد', to: '/#pricing', icon: CreditCard },
        { label: 'الجدول الكامل', to: '/dashboard/student/classes', icon: Calendar },
      ],
    },
    {
      title: 'الدعم والتواصل',
      description: 'خيارات المساعدة السريعة',
      links: [
        { label: 'تواصل عبر واتساب', to: 'https://wa.me/966564084838', icon: MessageCircle, external: true },
        { label: 'طلب مساعدة', to: '/support', icon: AlertCircle },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
        <DashboardCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full border-red-200 shadow-lg">
          <CardContent className="p-8 text-center" dir="rtl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 arabic-text">حدث خطأ</h3>
            <p className="text-red-600 arabic-text mb-6 text-sm">{error}</p>
            <Button onClick={loadDashboardData} className="arabic-text w-full">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100" dir="rtl">
      {/* Enhanced Header with shadcn/ui components */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
          <div className="flex items-center justify-between h-16 relative" dir="rtl">
            {/* Right side - User info */}
            <div className="flex items-center gap-3 flex-row-reverse" dir="rtl">
              {/* Desktop User Info */}
              <div className="hidden lg:flex items-center gap-3 flex-row-reverse" dir="rtl">
                <Avatar className="h-10 w-10 border-2 border-primary-200 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right flex-shrink-0" dir="rtl">
                  <h1 className="text-base font-semibold text-gray-900 arabic-text leading-tight">
                    {greeting}
                  </h1>
                  <Badge variant="secondary" className="text-xs arabic-text mt-0.5">
                    طالب منتظم
                  </Badge>
                </div>
              </div>

              {/* Mobile greeting */}
              <div className="lg:hidden text-right flex-shrink-0" dir="rtl">
                <h1 className="text-sm font-semibold text-gray-900 arabic-text">
                  {greeting}
                </h1>
              </div>
            </div>

            {/* Left side - Actions */}
            <div className="flex items-center gap-2 flex-row-reverse flex-shrink-0" dir="rtl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMegaMenuOpen(prev => !prev)}
                className="arabic-text h-9 hidden lg:flex items-center gap-2"
                data-mega-menu-trigger
                aria-expanded={megaMenuOpen}
                aria-controls="mega-menu"
                aria-label="فتح القائمة الرئيسية"
              >
                <Menu className="h-4 w-4" />
                القائمة الرئيسية
              </Button>

              {/* Mobile Menu Button - on the left */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden h-9 w-9"
                aria-label="فتح القائمة"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Home Button - Icon only */}
              <Button 
                asChild 
                variant="ghost" 
                className="hidden sm:flex h-9 w-9"
                aria-label="الرئيسية"
              >
                <Link to="/" className="flex items-center justify-center">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
              
              {/* Logout Button - Desktop only */}
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleSignOut} 
                className="arabic-text h-9 hidden sm:flex"
              >
                <span>تسجيل الخروج</span>
              </Button>
            </div>

            {megaMenuOpen && (
              <div
                ref={megaMenuRef}
                id="mega-menu"
                className="absolute top-full right-0 left-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 hidden lg:block z-[60]"
                dir="rtl"
                role="menu"
                aria-label="القائمة الرئيسية"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
                  {megaMenuSections.map(section => (
                    <div
                      key={section.title}
                      className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-primary-50/40 to-white space-y-4"
                    >
                      <div className="text-right space-y-1">
                        <p className="text-lg font-semibold text-primary-800 arabic-text">{section.title}</p>
                        <p className="text-sm text-primary-600 arabic-text">{section.description}</p>
                      </div>
                      <div className="space-y-3" dir="rtl">
                        {section.links.map(link => {
                          const Icon = link.icon
                          if (link.external) {
                            return (
                              <a
                                key={link.label}
                                href={link.to}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-primary-50 transition-all flex-row-reverse text-right text-primary-800 arabic-text"
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                <div className="flex items-center gap-3 flex-row-reverse">
                                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{link.label}</p>
                                  </div>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-primary-500" />
                              </a>
                            )
                          }

                          return (
                            <Link
                              key={link.label}
                              to={link.to}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-primary-50 transition-all flex-row-reverse text-right text-primary-800 arabic-text"
                              onClick={() => setMegaMenuOpen(false)}
                            >
                              <div className="flex items-center gap-3 flex-row-reverse">
                                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{link.label}</p>
                                </div>
                              </div>
                              <ArrowLeft className="w-4 h-4 text-primary-500" />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" dir="rtl">
        {/* Next Class Card - Hero Section */}
        {nextClass ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden" dir="rtl">
            <CardContent className="p-8 sm:p-10 md:p-12 relative" dir="rtl">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10 space-y-8" dir="rtl">
                <div className="flex items-start justify-between flex-row-reverse gap-6" dir="rtl">
                  <div className="flex-1 text-right min-w-0" dir="rtl">
                    <Badge className="bg-white/30 hover:bg-white/40 border-white/40 text-white mb-5 arabic-text inline-flex items-center gap-1.5 flex-row-reverse shadow-sm" dir="rtl">
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      <span>الحصة القادمة</span>
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 arabic-text">
                      {nextClass.subject || 'حصة اللغة الإنجليزية'}
                    </h2>
                    <div className="space-y-3" dir="rtl">
                      <div className="flex items-center gap-2.5 text-white" dir="rtl">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm md:text-base arabic-text">
                          {formattedNextClassDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white" dir="rtl">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm md:text-base arabic-text">{nextClass.time} • {nextClass.duration} دقيقة</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/30 flex-shrink-0" dir="rtl">
                    <div className="text-center" dir="rtl">
                      <Clock className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm font-bold arabic-text whitespace-nowrap">
                        {getTimeUntilClass(nextClass.date, nextClass.time)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-row-reverse pt-4" dir="rtl">
                  {/* Details Button - Icon only, on the left */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white h-10 w-10 flex-shrink-0"
                    onClick={() => handleOpenClassDetails(nextClass)}
                    aria-label="تفاصيل الحصة"
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </Button>
                  
                  {/* Enter Class Button - Main, takes remaining space */}
                  {nextClass.meetingLink ? (
                    <Button 
                      asChild
                      size="lg"
                      className="flex-1 bg-white text-primary-600 hover:bg-gray-50 shadow-lg arabic-text h-12 md:h-14"
                    >
                      <a 
                        href={nextClass.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center gap-2 flex-row-reverse"
                      >
                        <Video className="w-5 h-5" />
                        <span className="text-base md:text-lg">دخول الحصة الآن</span>
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="flex-1 bg-white/20 text-white hover:bg-white/30 border border-white/30 arabic-text h-12 md:h-14"
                      disabled
                    >
                      <span className="flex items-center justify-center gap-2 flex-row-reverse">
                        <Clock className="w-5 h-5" />
                        <span className="text-base md:text-lg">قريباً</span>
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50" dir="rtl">
            <CardContent className="p-8 text-center" dir="rtl">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 arabic-text mb-2">
                لا توجد حصص قادمة
              </h3>
              <p className="text-gray-500 arabic-text mb-4 text-sm">
                احجز حصتك القادمة الآن وابدأ رحلة التعلم
              </p>
              <Button asChild className="arabic-text">
                <Link to="/book-regular" className="flex items-center justify-center gap-2 flex-row-reverse">
                  <Calendar className="w-4 h-4" />
                  <span>حجز حصة جديدة</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid with shadcn/ui Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" dir="rtl">
          {/* Credits Card */}
          <Card className="border-primary-100 bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 hover:shadow-lg transition-all duration-300" dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="flex items-center justify-end gap-4 mb-4" dir="rtl">
                <div className="text-right flex-1 min-w-0" dir="rtl">
                  <p className="text-sm font-medium text-primary-800 arabic-text mb-1">رصيد الحصص</p>
                  <p className="text-3xl font-bold text-primary-700" aria-label={`${currentCredits} حصة متاحة`}>{currentCredits}</p>
                  <p className="text-xs text-primary-600 arabic-text mt-1">حصة متاحة</p>
                </div>
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30 flex-shrink-0" aria-hidden="true">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <Button asChild size="sm" className="w-full arabic-text bg-primary-600 hover:bg-primary-700">
                <Link to="/#pricing" className="flex items-center justify-center gap-2 flex-row-reverse">
                  <CreditCard className="w-4 h-4" />
                  <span>إضافة رصيد</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Completed Classes Card */}
          <Card className="border-primary-100 bg-gradient-to-br from-primary-50 to-blue-50 hover:shadow-lg transition-all duration-300" dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="flex items-center justify-end gap-4 mb-4" dir="rtl">
                <div className="text-right flex-1 min-w-0" dir="rtl">
                  <p className="text-sm font-medium text-primary-800 arabic-text mb-1">حصص مكتملة</p>
                  <p className="text-3xl font-bold text-primary-700" aria-label={`${completedClasses} حصة مكتملة`}>{completedClasses}</p>
                  <p className="text-xs text-primary-600 arabic-text mt-1">حصة منجزة</p>
                </div>
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30 flex-shrink-0" aria-hidden="true">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-primary-100" style={{ ['--progress-background' as string]: 'rgb(37 99 235)' }} />
              <p className="text-xs text-primary-600 arabic-text mt-2 text-right">
                {progressPercentage.toFixed(0)}% من إجمالي الحصص
              </p>
            </CardContent>
          </Card>

          {/* Scheduled Classes Card */}
          <Card className="border-primary-100 bg-gradient-to-br from-primary-50 to-blue-100 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1" dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="flex items-center justify-end gap-4 mb-4" dir="rtl">
                <div className="text-right flex-1 min-w-0" dir="rtl">
                  <p className="text-sm font-medium text-primary-800 arabic-text mb-1">حصص قادمة</p>
                  <p className="text-3xl font-bold text-primary-700" aria-label={`${scheduledClasses} حصة مجدولة`}>{scheduledClasses}</p>
                  <p className="text-xs text-primary-600 arabic-text mt-1">حصة مجدولة</p>
                </div>
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30 flex-shrink-0" aria-hidden="true">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="w-full arabic-text border-primary-300 text-primary-700 hover:bg-primary-50">
                <Link to="/dashboard/student/classes" className="flex items-center justify-center gap-2 flex-row-reverse">
                  <Calendar className="w-4 h-4" />
                  <span>عرض الجدول</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Low Credit Alert with shadcn/ui */}
        {currentCredits < LOW_CREDIT_THRESHOLD && (
          <Card className="border-primary-200 bg-gradient-to-r from-primary-50 via-blue-50 to-primary-100 shadow-lg" dir="rtl">
            <CardContent className="p-4" dir="rtl">
              <div className="flex items-start gap-4 sm:gap-6 flex-row-reverse" dir="rtl">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-right" dir="rtl">
                  <h4 className="font-semibold text-primary-900 arabic-text mb-1">
                    ⚠️ رصيدك منخفض!
                  </h4>
                  <p className="text-sm text-primary-800 arabic-text mb-3">
                    رصيدك الحالي أقل من حصتين. أضف رصيد الآن لضمان استمرارية الحصص وعدم انقطاع التعلم.
                  </p>
                  <Button asChild size="sm" className="arabic-text bg-primary-600 hover:bg-primary-700">
                    <Link to="/#pricing" className="flex items-center justify-center gap-2 flex-row-reverse">
                      <CreditCard className="w-4 h-4" />
                      <span>إضافة رصيد الآن</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
          {/* Left Column - Calendar and Subscription */}
          <div className="lg:col-span-2 space-y-6" dir="rtl">
            {/* Calendar Card */}
            <Card className="shadow-lg border-gray-200" dir="rtl">
              <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-blue-50" dir="rtl">
                <CardTitle className="arabic-text flex items-center justify-end gap-2 text-lg text-primary-800">
                  <Calendar className="w-5 h-5 text-primary-700" />
                  <span>التقويم الشهري</span>
                </CardTitle>
                <CardDescription className="arabic-text text-right text-primary-600">
                  عرض جميع الحصص المجدولة والمكتملة
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4" dir="rtl">
                <MiniCalendar classes={dashboardData?.classes || []} />
              </CardContent>
            </Card>

            {/* Subscription Status Card */}
            <Card className="shadow-lg border-gray-200" dir="rtl">
              <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-blue-50" dir="rtl">
                <CardTitle className="arabic-text flex items-center justify-end text-lg text-primary-800 gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-700" />
                  <span>خطة الاشتراك</span>
                </CardTitle>
                <CardDescription className="arabic-text text-right text-primary-600">
                  حالة اشتراكك ومعلومات الرصيد
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4" dir="rtl">
                <div className="flex items-center justify-end gap-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100" dir="rtl">
                  <div className="text-right" dir="rtl">
                    <p className="text-sm text-primary-700 arabic-text mb-1">حالة الاشتراك</p>
                    <p className="text-xl font-bold text-primary-800 arabic-text">نشط</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner border border-primary-200">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3" dir="rtl">
                  <div className="text-right p-4 bg-gray-50 rounded-xl border border-gray-200" dir="rtl">
                    <p className="text-xs text-gray-600 arabic-text mb-1">الرصيد المتبقي</p>
                    <p className="text-2xl font-bold text-gray-900">{currentCredits}</p>
                    <p className="text-xs text-gray-500 arabic-text">حصة</p>
                  </div>
                  <div className="text-right p-4 bg-gray-50 rounded-xl border border-gray-200" dir="rtl">
                    <p className="text-xs text-gray-600 arabic-text mb-1">حصص مجدولة</p>
                    <p className="text-2xl font-bold text-gray-900">{scheduledClasses}</p>
                    <p className="text-xs text-gray-500 arabic-text">حصة</p>
                  </div>
                </div>

                <Button asChild className="w-full arabic-text border-primary-300 text-primary-700 hover:bg-primary-50" variant="outline">
                  <Link to="/dashboard/student/subscription" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <TrendingUp className="w-4 h-4" />
                    <span>إدارة الاشتراك</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6" dir="rtl">
            {/* Quick Actions Card */}
            <Card className="shadow-lg border-gray-200" dir="rtl">
              <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-blue-50" dir="rtl">
                <CardTitle className="arabic-text text-lg text-right text-primary-800">إجراءات سريعة</CardTitle>
                <CardDescription className="arabic-text text-right text-primary-600">
                  الوصول السريع للميزات الأساسية
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3" dir="rtl">
                <Button asChild className="w-full arabic-text h-12 shadow-md" size="lg">
                  <Link to="/book-regular" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <Calendar className="w-5 h-5" />
                    <span>حجز حصة جديدة</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full arabic-text h-12 border-primary-300 text-primary-700 hover:bg-primary-50" size="lg">
                  <Link to="/#pricing" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <CreditCard className="w-5 h-5" />
                    <span>شراء رصيد</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full arabic-text h-12 border-primary-300 text-primary-700 hover:bg-primary-50" size="lg">
                  <Link to="/dashboard/student/classes" className="flex items-center justify-center gap-2 flex-row-reverse">
                    <BookOpen className="w-5 h-5" />
                    <span>جميع الحصص</span>
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full arabic-text h-12 border-primary-300 text-primary-700 hover:bg-primary-50" 
                  size="lg"
                  onClick={() => window.open('https://wa.me/966564084838', '_blank')}
                >
                  <span className="flex items-center justify-center gap-2 flex-row-reverse">
                    <MessageCircle className="w-5 h-5" />
                    <span>تواصل معنا</span>
                  </span>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      <Footer />

      {selectedClass && (
        <ClassDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseClassDetails}
          onSuccess={() => {
            loadDashboardData()
            handleCloseClassDetails()
          }}
          userRole="student"
          classData={{
            id: selectedClass.id,
            date: selectedClass.date,
            time: selectedClass.time,
            duration: selectedClass.duration,
            meeting_link: selectedClass.meetingLink,
            status: selectedClass.status,
            subject: selectedClass.subject,
            price: selectedClass.price,
            student_id: selectedClass.student_id || user?.id || ''
          }}
        />
      )}
    </div>
  )
}
