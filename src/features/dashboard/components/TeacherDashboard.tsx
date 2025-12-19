import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllStudents, getTeacherClasses } from '@/lib/database'
import { Link } from 'react-router-dom'
import StudentManagement from './StudentManagement'
import ReviewManagement from './ReviewManagement'
import SecurityGuard, { useSecurity } from '@/components/SecurityGuard'
import Footer from '@/components/Footer'
import { toArabicNumerals } from '@/lib/formatters'
import AddClassModal from './AddClassModal'
import ClassScheduleTable from './ClassScheduleTable'
import ConvertStudentModal from './ConvertStudentModal'
import ClassCountdownTimer from '@/components/ClassCountdownTimer'
import { DashboardCardSkeleton } from '@/components/skeletons'
import { EmptyStudentList } from '@/components/empty-states'
import TeacherSidebar from './TeacherSidebar'
import { logger } from '@/lib/logger'
import dashboardStatsService from '@/lib/services/dashboard-stats-service'
import { formatStudentName, getStudentInitials } from '@/lib/utils/student-helpers'
import { CONTENT_SPACING, EMPTY_STATE_SPACING } from '@/lib/constants/spacing'

interface TeacherStats {
  totalStudents: number
  activeStudents: number
  trialStudents: number
  upcomingClasses: number
  completedClasses: number
  thisWeekClasses: number
  successRate: number
  totalEarnings: number
}

interface Student {
  id: string
  name: string
  email: string
  level: string
  is_trial: boolean
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function TeacherDashboard() {
  const { user, signOut } = useAuth()
  const { isValidTeacher, logSecurityEvent } = useSecurity()
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showAllStudents, setShowAllStudents] = useState(false)

  useEffect(() => {
    // Additional security check on component mount
    if (!isValidTeacher) {
      logSecurityEvent({
        type: 'unauthorized_access',
        timestamp: new Date().toISOString(),
        operation: 'teacher_dashboard_access',
        details: { component: 'TeacherDashboard' }
      })
      return
    }
    
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load all students
      const { data: studentsData, error: studentsError } = await getAllStudents()
      if (studentsError) {
        logger.error('Error loading students:', studentsError)
        setError('حدث خطأ في تحميل بيانات الطلاب')
        return
      }

      const studentsList = studentsData || []
      setStudents(studentsList)

      // Load teacher's classes
      if (user?.id) {
        const { data: classesData, error: classesError } = await getTeacherClasses(user.id)
        if (classesError) {
          logger.error('Error loading classes:', classesError)
        } else {
          // Transform to match ClassScheduleTable format
          const transformedClasses = (classesData || []).map((cls: any) => ({
            id: cls.id,
            date: cls.date,
            time: cls.time,
            duration: cls.duration,
            meetingLink: cls.meeting_link,
            status: cls.status,
            studentName: cls.student ? `${cls.student.first_name} ${cls.student.last_name}` : 'غير محدد'
          }))
          setClasses(transformedClasses)
        }
      }

      // Fetch real stats from database
      if (user?.id) {
        const { data: statsData, error: statsError } = await dashboardStatsService.getTeacherStats(user.id)
        
        if (statsError) {
          logger.error('Error loading teacher stats:', statsError)
          // Use basic counts from student list as fallback
          const fallbackStats: TeacherStats = {
            totalStudents: studentsList.length,
            activeStudents: studentsList.filter(s => !s.is_trial).length,
            trialStudents: studentsList.filter(s => s.is_trial).length,
            upcomingClasses: 0,
            completedClasses: 0,
            thisWeekClasses: 0,
            successRate: 0,
            totalEarnings: 0
          }
          setStats(fallbackStats)
        } else {
          setStats(statsData)
        }
      }
    } catch (err) {
      logger.error('Dashboard loading error:', err)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleClassCreated = () => {
    // Refresh the dashboard data after a class is created
    loadDashboardData()
  }

  const handleConvertStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsConvertModalOpen(true)
  }

  const handleConversionSuccess = () => {
    // Refresh the dashboard data after conversion
    loadDashboardData()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير أستاذ أحمد'
    if (hour < 17) return 'مساء الخير أستاذ أحمد'
    return 'مساء الخير أستاذ أحمد'
  }



  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg-light">
        {/* Sidebar */}
        <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <header className="bg-white shadow-custom-sm border-b border-border-light">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="animate-pulse h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className={`flex-1 ${CONTENT_SPACING.main} overflow-auto`}>
            {/* Today's Schedule Skeleton */}
            <Card className="mb-8">
              <CardHeader>
                <div className="animate-pulse h-6 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <DashboardCardSkeleton count={3} />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <DashboardCardSkeleton count={4} />
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-bg-light">
        <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Sidebar */}
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Header - Consistent with landing page */}
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo - Consistent with landing page */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="فتح القائمة"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <Link
                  to="/"
                  className="flex-shrink-0 flex items-center cursor-pointer"
                  aria-label="الأستاذ أحمد - معلم اللغة الإنجليزية"
                >
                  <h1 className="text-2xl font-bold text-primary-700">
                    الأستاذ <span className="text-accent-600">أحمد</span>
                  </h1>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
                <Link 
                  to="/dashboard/teacher"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors arabic-text"
                >
                  لوحة التحكم
                </Link>
                <Link 
                  to="/"
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
                >
                  الصفحة الرئيسية
                </Link>
              </nav>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                <Button variant="danger" onClick={handleSignOut} className="arabic-text">
                  تسجيل الخروج
                </Button>
              </div>

              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <Button variant="danger" onClick={handleSignOut} className="arabic-text text-sm">
                  خروج
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 ${CONTENT_SPACING.main} overflow-auto pb-8`}>
        {/* Pending Actions Alert */}
        {(students.filter(s => s.is_trial).length > 0 || stats?.upcomingClasses || 0 > 0) && (
          <Card className="mb-4 sm:mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-yellow-800 arabic-text mb-1.5 text-sm sm:text-base">
                    الإجراءات المعلقة
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-yellow-700 arabic-text">
                    {students.filter(s => s.is_trial).length > 0 && (
                      <li className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span className="break-words">
                          {students.filter(s => s.is_trial).length} طالب تجريبي بانتظار التحويل
                        </span>
                      </li>
                    )}
                    {(stats?.upcomingClasses || 0) > 0 && (
                      <li className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="break-words">
                          {stats?.upcomingClasses} حصة قادمة تحتاج للمراجعة
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Schedule Section */}
        <Card className="mb-4 sm:mb-6 bg-gradient-to-br from-primary-50 to-white border-primary-200">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="arabic-text text-lg sm:text-xl flex items-center text-primary-600">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ms-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                جدول اليوم
              </CardTitle>
              <Button 
                onClick={() => setIsAddClassModalOpen(true)}
                size="sm"
                className="arabic-text w-full sm:w-auto"
              >
                + إضافة حصة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {classes.filter(cls => {
              const today = new Date().toISOString().split('T')[0]
              return cls.date === today && cls.status === 'scheduled'
            }).length > 0 ? (
              <div className="space-y-3">
                {classes
                  .filter(cls => {
                    const today = new Date().toISOString().split('T')[0]
                    return cls.date === today && cls.status === 'scheduled'
                  })
                  .map((cls) => {
                    // Create start time as ISO string
                    const startDateTime = new Date(`${cls.date}T${cls.time}`)
                    
                    return (
                    <div key={cls.id} className="space-y-3">
                      {/* Countdown Timer */}
                      <ClassCountdownTimer
                        classInfo={{
                          id: cls.id,
                          title: 'حصة اللغة الإنجليزية',
                          student_name: cls.studentName || 'طالب',
                          start_time: startDateTime.toISOString(),
                          duration: cls.duration,
                          meeting_link: cls.meetingLink,
                        }}
                        onExpired={() => {
                          logger.log('Class started, refreshing dashboard')
                          loadDashboardData()
                        }}
                      />
                      
                      {/* Original Class Card */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-lg border border-primary-200 hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 arabic-text text-sm sm:text-base truncate">
                              {cls.studentName || 'طالب'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {cls.time} • {cls.duration} دقيقة
                            </p>
                          </div>
                        </div>
                        {cls.meetingLink && (
                          <Button
                            size="sm"
                            onClick={() => window.open(cls.meetingLink, '_blank')}
                            className="arabic-text w-full sm:w-auto"
                          >
                            <svg className="w-4 h-4 ms-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            انضم
                          </Button>
                        )}
                      </div>
                    </div>
                    )
                  })}
              </div>
            ) : (
              <div className={`text-center py-6 sm:py-8`}>
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-gray-600 arabic-text mb-3 sm:mb-4">
                  لا توجد حصص مجدولة اليوم
                </p>
                <Button 
                  onClick={() => setIsAddClassModalOpen(true)}
                  size="sm"
                  variant="outline"
                  className="arabic-text"
                >
                  إضافة حصة جديدة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="hover-scale transition-all cursor-pointer" onClick={() => setIsAddClassModalOpen(true)}>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 arabic-text mb-1 text-sm">إضافة حصة</h3>
              <p className="text-xs text-gray-600 arabic-text">جدولة حصة جديدة</p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 arabic-text mb-1 text-sm">إدارة الطلاب</h3>
              <p className="text-xs text-gray-600 arabic-text">عرض وإدارة الطلاب</p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all cursor-pointer sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 arabic-text mb-1 text-sm">المراجعات</h3>
              <p className="text-xs text-gray-600 arabic-text">إدارة تقييمات الطلاب</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Enhanced Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Total Students */}
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-primary-700 arabic-text mb-1 sm:mb-2">إجمالي الطلاب</h3>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
                {stats?.totalStudents || 0}
              </div>
              <p className="text-xs text-primary-600 arabic-text leading-tight">
                {stats?.activeStudents || 0} نشط • {stats?.trialStudents || 0} تجريبي
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Classes */}
          <Card className="bg-gradient-to-br from-success-50 to-success-100/50 border-success-200 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-400 to-success-600"></div>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-success-700 arabic-text mb-1 sm:mb-2">الحصص القادمة</h3>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-success-900 mb-1">
                {stats?.upcomingClasses || 0}
              </div>
              <p className="text-xs text-success-600 arabic-text leading-tight">
                {stats?.thisWeekClasses || 0} هذا الأسبوع
              </p>
            </CardContent>
          </Card>

          {/* Completed Classes */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-yellow-700 arabic-text mb-1 sm:mb-2">الحصص المكتملة</h3>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900 mb-1">
                {toArabicNumerals(stats?.completedClasses?.toLocaleString('ar-SA') || '0')}
              </div>
              <p className="text-xs text-yellow-600 arabic-text leading-tight">إجمالي الحصص</p>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-green-700 arabic-text mb-1 sm:mb-2">نسبة النجاح</h3>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 mb-1">
                {stats?.successRate || 0}%
              </div>
              <p className="text-xs text-green-600 arabic-text leading-tight">معدل رضا الطلاب</p>
            </CardContent>
          </Card>
        </div>

        {/* Trial Students Section */}
        {students.filter(s => s.is_trial).length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="arabic-text text-yellow-800 flex items-center">
                <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                الطلاب التجريبيون ({students.filter(s => s.is_trial).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.filter(s => s.is_trial).map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-700 font-semibold text-lg">
                          {getStudentInitials(student)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 arabic-text">
                          {formatStudentName(student)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.profiles?.email || student.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConvertStudent(student)}
                      className="arabic-text bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      تحويل إلى طالب نظامي
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Action: Add Credits - VERY PROMINENT */}
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-green-900 arabic-text mb-1">
                    إضافة رصيد للطلاب 💰
                  </h3>
                  <p className="text-xs sm:text-sm text-green-700 arabic-text">
                    أضف حصص لطلابك بسرعة وسهولة - ابدأ من 0.5 حصة
                  </p>
                </div>
              </div>
              <Button 
                asChild
                size="lg"
                className="arabic-text bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md text-base sm:text-lg px-4 sm:px-6 lg:px-8 w-full sm:w-auto min-w-[160px] sm:min-w-[200px]"
              >
                <Link to="/dashboard/teacher/credits" className="flex items-center justify-center gap-2 text-white hover:text-white">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">إضافة رصيد الآن</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Students Overview */}
        <Card className="mb-4 sm:mb-6" data-section="all-students">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="arabic-text text-lg sm:text-xl flex items-center text-primary-600">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ms-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                جميع الطلاب ({students.length})
              </CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="arabic-text bg-green-50 border-green-300 hover:bg-green-100 text-green-700 w-full sm:w-auto"
              >
                <Link to="/dashboard/teacher/credits" className="flex items-center justify-center">
                  <svg className="w-4 h-4 ms-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  ➕ إضافة رصيد للطلاب
                </Link>
              </Button>
              <Button 
                onClick={() => setIsAddClassModalOpen(true)}
                size="sm"
                className="arabic-text w-full sm:w-auto"
              >
                + إضافة حصة
              </Button>
            </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {students.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-gray-600 arabic-text">لا توجد بيانات طلاب حالياً</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-3">
                  {(showAllStudents ? students : students.slice(0, 5)).map((student) => (
                    <div 
                      key={student.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          student.is_trial ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <span className={`font-semibold text-base sm:text-lg ${
                            student.is_trial ? 'text-yellow-700' : 'text-green-700'
                          }`}>
                            {getStudentInitials(student)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 arabic-text text-sm sm:text-base truncate">
                            {formatStudentName(student)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {student.profiles?.email || student.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                              student.is_trial 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'bg-green-100 text-green-600'
                            }`}>
                              {student.is_trial ? 'تجريبي' : 'نشط'}
                            </span>
                            <span className="text-xs text-gray-500">
                              عضو منذ {new Date(student.created_at).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {student.is_trial && (
                          <Button
                            onClick={() => handleConvertStudent(student)}
                            className="arabic-text bg-green-600 hover:bg-green-700 text-sm flex-1 sm:flex-none"
                            size="sm"
                          >
                            تحويل إلى نظامي
                          </Button>
                        )}
                        <Button
                          onClick={() => setIsAddClassModalOpen(true)}
                          variant="outline"
                          size="sm"
                          className="arabic-text text-sm flex-1 sm:flex-none"
                        >
                          إضافة حصة
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Show More/Less Button */}
                {students.length > 5 && (
                  <div className="mt-3 sm:mt-4 flex justify-center">
                    <button
                      onClick={() => setShowAllStudents(!showAllStudents)}
                      className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border-2 border-primary-600 bg-white text-primary-600 hover:bg-primary-50 hover:shadow-md active:scale-95 h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base arabic-text w-full sm:w-auto"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className={`transition-transform duration-300 ${showAllStudents ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        <path d="M12 5v14"></path>
                        <path d="m19 12-7 7-7-7"></path>
                      </svg>
                      {showAllStudents ? 'عرض أقل من الطلاب' : 'عرض المزيد من الطلاب'}
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Sections */}
        <div className="space-y-4 sm:space-y-6">
          {/* Class Schedule Table with Add Button */}
          <SecurityGuard level="enhanced" operation="view_class_schedule">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary arabic-text">إدارة الحصص</h2>
                <Button 
                  onClick={() => setIsAddClassModalOpen(true)}
                  className="arabic-text w-full sm:w-auto"
                  size="sm"
                >
                  + إضافة حصة جديدة
                </Button>
              </div>
              <ClassScheduleTable 
                classes={classes} 
                userRole="teacher"
                loading={loading}
                onRefresh={loadDashboardData}
                onEdit={(classId) => {
                  // TODO: Implement edit functionality
                  logger.log('Edit class:', classId)
                }}
              />
            </div>
          </SecurityGuard>
          
          {/* Review Management */}
          <SecurityGuard level="enhanced" operation="manage_reviews">
            <ReviewManagement />
          </SecurityGuard>
          
          {/* Student Management */}
          <SecurityGuard level="enhanced" operation="manage_students">
            <StudentManagement />
          </SecurityGuard>
        </div>

        {/* Add Class Modal */}
        <AddClassModal 
          isOpen={isAddClassModalOpen}
          onClose={() => setIsAddClassModalOpen(false)}
          onSuccess={handleClassCreated}
        />

        {/* Convert Student Modal */}
        <ConvertStudentModal
          student={selectedStudent}
          isOpen={isConvertModalOpen}
          onClose={() => {
            setIsConvertModalOpen(false)
            setSelectedStudent(null)
          }}
          onSuccess={handleConversionSuccess}
        />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Students */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="arabic-text">الطلاب الجدد</CardTitle>
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="arabic-text"
                >
                  <Link to="/dashboard/teacher/students">عرض الكل</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <EmptyStudentList 
                  message="لا توجد بيانات طلاب حالياً. سيظهر الطلاب الجدد هنا بمجرد التسجيل."
                />
              ) : (
                <div className="space-y-4">
                  {students.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-bg-light rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {getStudentInitials(student)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary arabic-text">
                            {formatStudentName(student)}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {student.profiles?.email || student.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.is_trial ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {student.is_trial ? 'تجريبي' : 'نشط'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">نظرة عامة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Total Students */}
                <div className="bg-primary-50 p-4 rounded-lg">
                  <p className="text-primary-600 text-xs sm:text-sm font-medium arabic-text mb-1">إجمالي الطلاب</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-700">{stats?.totalStudents || 0}</p>
                </div>

                {/* Active Students */}
                <div className="bg-success-50 p-4 rounded-lg">
                  <p className="text-success-600 text-xs sm:text-sm font-medium arabic-text mb-1">طلاب نشطون</p>
                  <p className="text-2xl sm:text-3xl font-bold text-success-700">{stats?.activeStudents || 0}</p>
                </div>

                {/* Trial Students */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-600 text-xs sm:text-sm font-medium arabic-text mb-1">طلاب تجريبيون</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-700">{stats?.trialStudents || 0}</p>
                </div>

                {/* Upcoming Classes */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 text-xs sm:text-sm font-medium arabic-text mb-1">الحصص القادمة</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">{stats?.upcomingClasses || 0}</p>
                </div>

                {/* Completed Classes */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-600 text-xs sm:text-sm font-medium arabic-text mb-1">الحصص المكتملة</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">{stats?.completedClasses || 0}</p>
                </div>

                {/* This Week Classes */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-indigo-600 text-xs sm:text-sm font-medium arabic-text mb-1">حصص هذا الأسبوع</p>
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-700">{stats?.thisWeekClasses || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}
