import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStudentClasses } from '@/lib/database'
import { logger } from '@/lib/logger'
import { Calendar, Clock, Video, CheckCircle2, XCircle, MinusCircle, ArrowRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { Badge } from '@/components/ui/badge'
import ClassDetailsModal from '../components/ClassDetailsModal'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meeting_link?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  teacher_name?: string
  subject?: string
  price?: number
  student_id?: string
}

type FilterType = 'all' | 'scheduled' | 'completed' | 'cancelled'

export default function StudentClassesPage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    if (user) {
      loadClasses()
    }
  }, [user])

  const loadClasses = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data: classSessions, error: classSessionsError } = await getStudentClasses(user.id)
      
      if (classSessionsError) {
        logger.error('Error loading class sessions:', classSessionsError)
        setError('حدث خطأ في تحميل الحصص')
        return
      }

      const mappedClasses: ClassSession[] = (classSessions || []).map(session => ({
        id: session.id,
        date: session.date,
        time: session.time,
        duration: session.duration,
        meeting_link: session.meeting_link,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
        teacher_name: session.teacher_name || 'الأستاذ أحمد',
        subject: session.subject || 'اللغة الإنجليزية',
        price: session.price,
        student_id: session.student_id || user.id
      }))

      // Sort by date - upcoming first, then past
      const sortedClasses = mappedClasses.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        const now = new Date()
        
        const aIsFuture = dateA >= now
        const bIsFuture = dateB >= now
        
        // Future classes come first, sorted ascending
        if (aIsFuture && !bIsFuture) return -1
        if (!aIsFuture && bIsFuture) return 1
        if (aIsFuture && bIsFuture) return dateA.getTime() - dateB.getTime()
        // Past classes sorted descending (most recent first)
        return dateB.getTime() - dateA.getTime()
      })

      setClasses(sortedClasses)
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات')
      logger.error('Dashboard loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-primary-500" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-primary-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'no-show':
        return <MinusCircle className="w-5 h-5 text-slate-500" />
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدولة'
      case 'completed':
        return 'مكتملة'
      case 'cancelled':
        return 'ملغية'
      case 'no-show':
        return 'غياب'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary-50 text-primary-700 border-primary-200'
      case 'completed':
        return 'bg-primary-100 text-primary-800 border-primary-300'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'no-show':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const canJoinClass = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 10 && diffMinutes > -60
  }

  const filteredClasses = classes.filter(cls => {
    if (filter === 'all') return true
    return cls.status === filter
  })

  const upcomingClass = classes.find(cls => {
    if (cls.status !== 'scheduled') return false
    const classDateTime = new Date(`${cls.date}T${cls.time}`)
    return classDateTime >= new Date()
  })

  const openClassDetails = (classSession: ClassSession) => {
    setSelectedClass(classSession)
    setDetailsOpen(true)
  }

  const closeClassDetails = () => {
    setDetailsOpen(false)
    setSelectedClass(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50"></div>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600 arabic-text">جاري تحميل الجدول...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2 arabic-text">خطأ في التحميل</h3>
            <p className="text-red-700 mb-4 arabic-text">{error}</p>
            <Button
              onClick={loadClasses}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors arabic-text"
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100" dir="rtl">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-primary-100 z-50">
        <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-gray-800 arabic-text font-bold text-lg">الأستاذ أحمد</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="arabic-text">
            <Link to="/dashboard/student" className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">العودة للوحة التحكم</span>
              <span className="sm:hidden">العودة</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24 space-y-6">
        <div className="text-right">
          <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-200 arabic-text mb-3">
            جدول الحصص
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 arabic-text">
            كل حصصك في مكان واحد
          </h1>
          <p className="text-lg text-gray-600 arabic-text">
            تابع حصصك القادمة، راجع الماضي، وأدر كل التفاصيل بسهولة
          </p>
        </div>

        {upcomingClass ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
            <div className="p-6 sm:p-8 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent)]" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <Badge className="bg-white/20 text-white border-white/30 arabic-text mb-3">
                      الحصة القادمة
                    </Badge>
                    <h2 className="text-2xl font-bold arabic-text">حصة {upcomingClass.subject}</h2>
                    <p className="text-white/80 arabic-text mt-1">{upcomingClass.teacher_name}</p>
                  </div>
                  <div className="bg-white/15 rounded-2xl px-4 py-3 border border-white/25 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm arabic-text whitespace-nowrap">{upcomingClass.time}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-white/90 text-sm arabic-text">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Calendar className="w-4 h-4" />
                    {new Date(`${upcomingClass.date}T${upcomingClass.time}`).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Clock className="w-4 h-4" />
                    {upcomingClass.duration} دقيقة
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {upcomingClass.meeting_link && (
                    <Button
                      className="flex-1 bg-white text-primary-600 hover:bg-gray-100 arabic-text"
                      size="lg"
                      onClick={() => window.open(upcomingClass.meeting_link!, '_blank')}
                    >
                      <Video className="w-5 h-5 ms-2" />
                      دخول الحصة
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-white/40 text-white hover:bg-white/10 arabic-text"
                    onClick={() => openClassDetails(upcomingClass)}
                  >
                    <Info className="w-5 h-5 ms-2" />
                    تفاصيل الحصة
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border border-dashed border-primary-200 bg-white/70">
            <div className="p-8 text-center space-y-4">
              <Calendar className="w-12 h-12 text-primary-400 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 arabic-text">لا توجد حصص قادمة</h3>
              <p className="text-gray-600 arabic-text">
                احجز حصتك التالية الآن وابدأ التقدم
              </p>
              <Button asChild className="arabic-text">
                <Link to="/book-regular">
                  <Calendar className="w-4 h-4 ms-2" />
                  حجز حصة جديدة
                </Link>
              </Button>
            </div>
          </Card>
        )}

        <div className="bg-white/70 border border-primary-100 rounded-2xl p-4">
          <div className="flex flex-wrap gap-2 justify-end">
            {[
              { id: 'all', label: 'الكل', count: classes.length },
              { id: 'scheduled', label: 'المجدولة', count: classes.filter(c => c.status === 'scheduled').length },
              { id: 'completed', label: 'المكتملة', count: classes.filter(c => c.status === 'completed').length },
              { id: 'cancelled', label: 'الملغية', count: classes.filter(c => c.status === 'cancelled').length }
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id as FilterType)}
                className={`px-4 py-2 rounded-xl border font-medium arabic-text transition-colors ${
                  filter === id
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-gray-700 border-primary-100 hover:bg-primary-50'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {filteredClasses.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 border border-dashed border-primary-200">
            <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2 arabic-text">
              لا توجد حصص
            </h3>
            <p className="text-gray-500 arabic-text mb-6">
              {filter === 'all'
                ? 'لم يتم جدولة أي حصص بعد'
                : `لا توجد حصص ${getStatusText(filter)}`}
            </p>
            <Button asChild className="arabic-text">
              <Link to="/book-regular">احجز حصة جديدة</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredClasses.map((cls) => {
              const classDateTime = new Date(`${cls.date}T${cls.time}`)
              const canJoin = canJoinClass(cls.date, cls.time) && cls.meeting_link
              const isPast = classDateTime < new Date()

              return (
                <Card key={cls.id} className="p-4 md:p-6 border border-primary-100 bg-white/90 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3 text-right">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        {getStatusIcon(cls.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(cls.status)} arabic-text`}>
                          {getStatusText(cls.status)}
                        </span>
                        {!isPast && cls.status === 'scheduled' && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-100 arabic-text">
                            قادمة
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-900">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Calendar className="w-5 h-5 text-primary-500" />
                          <span className="font-medium arabic-text">
                            {classDateTime.toLocaleDateString('ar-SA', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Clock className="w-5 h-5 text-primary-500" />
                          <span className="font-medium">{cls.time}</span>
                          <span className="text-gray-600 text-sm arabic-text">
                            ({cls.duration} دقيقة)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 arabic-text">
                        <span>المعلم: {cls.teacher_name}</span>
                        <span>المادة: {cls.subject}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-[200px]">
                      {cls.meeting_link && cls.status === 'scheduled' && (
                        <Button
                          disabled={!canJoin}
                          onClick={() => window.open(cls.meeting_link!, '_blank')}
                          className="w-full arabic-text min-h-[44px]"
                        >
                          {canJoin ? (
                            <>
                              <Video className="w-4 h-4 ms-2" />
                              الانضمام الآن
                            </>
                          ) : (
                            'قريباً'
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full arabic-text min-h-[44px]"
                        onClick={() => openClassDetails(cls)}
                      >
                        تفاصيل الحصة
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="arabic-text shadow-md">
            <Link to="/book-regular">
              <Calendar className="w-5 h-5 ms-2" />
              احجز حصة جديدة
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="arabic-text">
            <Link to="/dashboard/student">
              العودة للوحة التحكم
            </Link>
          </Button>
        </div>
      </main>

      <Footer />

      {selectedClass && (
        <ClassDetailsModal
          isOpen={detailsOpen}
          onClose={closeClassDetails}
          onSuccess={() => {
            loadClasses()
            closeClassDetails()
          }}
          userRole="student"
          classData={{
            id: selectedClass.id,
            date: selectedClass.date,
            time: selectedClass.time,
            duration: selectedClass.duration,
            meeting_link: selectedClass.meeting_link,
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
