import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { getStudentClasses } from '@/lib/database'
import { Link } from 'react-router-dom'
import ClassScheduleTable from '@/features/dashboard/components/ClassScheduleTable'
import Footer from '@/components/Footer'
import { Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { logger } from '@/lib/logger'
import { ClassesPageSkeleton } from '@/components/skeletons'
import { PageErrorBoundary } from '@/components/ui/page-error-boundary'
import { CardError } from '@/components/ui/error-display'
import { handleApiError, ErrorMessages } from '@/lib/errors'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
}

function RegularDashboardClassesContent() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      
      const { data: classSessions, error: classSessionsError } = await getStudentClasses(user.id)
      
      if (classSessionsError) {
        logger.error('Error loading class sessions:', classSessionsError)
        handleApiError(classSessionsError, 'loadClasses')
        setError(ErrorMessages.LOAD_CLASSES_ERROR)
        return
      }

      const mappedClasses: ClassSession[] = (classSessions || []).map(session => ({
        id: session.id,
        date: session.date,
        time: session.time,
        duration: session.duration,
        meetingLink: session.meeting_link,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show'
      }))

      setClasses(mappedClasses)
    } catch (err) {
      const errorMessage = ErrorMessages.LOAD_CLASSES_ERROR
      setError(errorMessage)
      handleApiError(err, 'loadClasses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50" dir="rtl">
          <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto" dir="rtl">
            <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
              <span className="text-gray-800 arabic-text font-bold text-lg text-right">الأستاذ أحمد</span>
            </div>
            <Button asChild variant="ghost" size="sm" className="arabic-text">
              <Link to="/dashboard/student" className="flex items-center gap-2 flex-row-reverse">
                <ArrowRight className="w-4 h-4" />
                العودة للوحة التحكم
              </Link>
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24" dir="rtl">
          {/* Page Header */}
          <div className="mb-6 md:mb-8" dir="rtl">
            <div className="text-right" dir="rtl">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 arabic-text text-right">
                جدول الحصص القادمة
              </h1>
              <p className="text-lg text-gray-600 arabic-text text-right">
                عرض شامل لجميع حصصك المجدولة والسابقة
              </p>
            </div>
          </div>

          {/* Loading Skeleton */}
          <ClassesPageSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <CardError message={error} onRetry={loadClasses} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50" dir="rtl">
        <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto" dir="rtl">
          <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
            <span className="text-gray-800 arabic-text font-bold text-lg text-right">الأستاذ أحمد</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="arabic-text">
            <Link to="/dashboard/student" className="flex items-center gap-2 flex-row-reverse">
              <ArrowRight className="w-4 h-4" />
              العودة للوحة التحكم
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24" dir="rtl">
        {/* Page Header */}
        <div className="mb-6 md:mb-8" dir="rtl">
          <div className="text-right" dir="rtl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 arabic-text text-right">
              جدول الحصص القادمة
            </h1>
            <p className="text-lg text-gray-600 arabic-text text-right">
              عرض شامل لجميع حصصك المجدولة والسابقة
            </p>
          </div>
        </div>

        {/* Class Schedule Table */}
        {classes.length === 0 ? (
          <Card dir="rtl">
            <CardContent className="p-12 text-center text-right" dir="rtl">
              <div className="flex flex-col items-center" dir="rtl">
                <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2 arabic-text text-right">
                  لا توجد حصص قادمة
                </h3>
                <p className="text-gray-500 arabic-text mb-6 text-right">
                  لم يتم جدولة أي حصص بعد. احجز حصتك الأولى الآن!
                </p>
                <Button asChild className="arabic-text">
                  <Link to="/book-regular">احجز حصة جديدة</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div dir="rtl">
            <ClassScheduleTable
              classes={classes}
              userRole="student"
              loading={loading}
              onRefresh={loadClasses}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center" dir="rtl">
          <Button asChild size="lg" className="arabic-text">
            <Link to="/book-regular" className="flex items-center gap-2 flex-row-reverse">
              <Calendar className="w-5 h-5" />
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
    </div>
  )
}

export default function RegularDashboardClasses() {
  return (
    <PageErrorBoundary pageName="Regular Dashboard Classes">
      <RegularDashboardClassesContent />
    </PageErrorBoundary>
  )
}
