import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStudentClasses } from '@/lib/database'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { ClassCountdown } from '@/components/ClassCountdown'
import UpcomingClassesSection from './UpcomingClassesSection'
import { Calendar, Clock, Video } from 'lucide-react'
import { logger } from '@/lib/logger'
import { PageErrorBoundary } from '@/components/ui/page-error-boundary'
import { CardError } from '@/components/ui/error-display'
import { handleApiError, ErrorMessages } from '@/lib/errors'
import { useSubscriptionSync } from '@/hooks/useSubscriptionSync'

interface TrialClass {
  id: string
  appointmentDate: Date
  duration: number
  meetingLink?: string
  status: string
}

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meeting_link?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
}

function TrialStudentDashboardContent() {
  const { user, signOut } = useAuth()
  const [trialClass, setTrialClass] = useState<TrialClass | null>(null)
  const [allClasses, setAllClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(7)

  // Real-time subscription sync for trial students
  useSubscriptionSync(user?.id, {
    onSubscriptionChange: (change) => {
      logger.log('Real-time subscription change detected for trial student', { type: change.type })
      // Reload class data when subscription changes (e.g., converted to regular)
      loadTrialClass()
    }
  })

  useEffect(() => {
    if (user) {
      loadTrialClass()
      calculateDaysRemaining()
    }
  }, [user])

  const calculateDaysRemaining = () => {
    if (!user?.user_metadata?.created_at) {
      setDaysRemaining(7)
      return
    }

    const createdAt = new Date(user.user_metadata.created_at)
    const now = new Date()
    const diffTime = 7 * 24 * 60 * 60 * 1000 - (now.getTime() - createdAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysRemaining(Math.max(0, diffDays))
  }

  const loadTrialClass = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      // Load trial class session
      const { data: classSessions, error: classSessionsError } = await getStudentClasses(user.id)
      
      if (classSessionsError) {
        logger.error('Error loading class sessions:', classSessionsError)
        handleApiError(classSessionsError, 'loadTrialClass')
        setError(ErrorMessages.LOAD_CLASSES_ERROR)
        return
      }

      // Store all classes for the upcoming classes section
      setAllClasses(classSessions || [])
      
      // Find the trial class session
      const trial = classSessions?.find(session => session.is_trial && session.status === 'scheduled')
      
      if (trial) {
        // Combine date and time to create a full datetime
        const dateTime = new Date(`${trial.date}T${trial.time}`)
        
        setTrialClass({
          id: trial.id,
          appointmentDate: dateTime,
          duration: trial.duration,
          meetingLink: trial.meeting_link,
          status: trial.status
        })
      }
    } catch (err) {
      const errorMessage = ErrorMessages.LOAD_CLASSES_ERROR
      setError(errorMessage)
      handleApiError(err, 'loadTrialClass')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getFirstName = () => {
    return user?.user_metadata?.first_name || 'طالب'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
        {/* Header Skeleton */}
        <header className="bg-white shadow-sm border-b border-gray-200" dir="rtl">
          <div className="max-w-4xl mx-auto px-4 py-4" dir="rtl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" dir="rtl">
              <div className="animate-pulse space-y-2 text-right">
                <div className="h-6 bg-gray-200 rounded w-48 ms-auto"></div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-row-reverse">
                <div className="animate-pulse h-10 bg-gray-200 rounded flex-1 sm:flex-none sm:w-32"></div>
                <div className="animate-pulse h-10 bg-gray-200 rounded flex-1 sm:flex-none sm:w-32"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 sm:py-8" dir="rtl">
          {/* Progress Indicator Skeleton */}
          <div className="animate-pulse mb-6 md:mb-8" dir="rtl">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Welcome Section Skeleton */}
          <Card className="mb-6 md:mb-8" dir="rtl">
            <CardContent className="p-4 sm:p-8" dir="rtl">
              <div className="animate-pulse space-y-4 text-right">
                <div className="h-8 bg-gray-200 rounded w-3/4 ms-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 ms-auto"></div>
              </div>
            </CardContent>
          </Card>

          {/* Trial Class Card Skeleton */}
          <Card className="mb-6 md:mb-8" dir="rtl">
            <CardHeader className="bg-primary-600" dir="rtl">
              <div className="animate-pulse h-6 bg-primary-500 rounded w-32 ms-auto"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-8" dir="rtl">
              <div className="animate-pulse space-y-6 text-right">
                <div className="flex justify-end gap-6 flex-row-reverse">
                  <div className="h-5 bg-gray-200 rounded w-40"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-48 ms-auto"></div>
              </div>
            </CardContent>
          </Card>

          {/* What to Expect Skeleton */}
          <Card className="mb-6 md:mb-8" dir="rtl">
            <CardHeader dir="rtl">
              <div className="animate-pulse h-6 bg-gray-200 rounded w-48 ms-auto"></div>
            </CardHeader>
            <CardContent dir="rtl">
              <div className="animate-pulse space-y-4 text-right">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade CTA Skeleton */}
          <Card dir="rtl">
            <CardContent className="p-6 sm:p-8" dir="rtl">
              <div className="animate-pulse space-y-4 text-right">
                <div className="h-8 bg-gray-200 rounded w-2/3 ms-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 ms-auto"></div>
                <div className="h-10 bg-gray-200 rounded w-48 ms-auto"></div>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <CardError message={error} onRetry={loadTrialClass} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-4" dir="rtl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" dir="rtl">
            <div className="text-right">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 arabic-text text-right">
                أهلاً وسهلاً {getFirstName()}! 👋
              </h1>
              <p className="text-sm text-gray-600 arabic-text mt-1 text-right">
                متحمسين نبدأ معك رحلة تعلم الإنجليزي
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-row-reverse">
              <Button variant="danger" onClick={handleSignOut} className="arabic-text flex-1 sm:flex-none text-sm sm:text-base h-10 sm:h-11">
                تسجيل الخروج
              </Button>
              <Button asChild variant="outline" className="arabic-text flex-1 sm:flex-none text-sm sm:text-base h-10 sm:h-11">
                <Link to="/" className="flex items-center gap-2 flex-row-reverse">الصفحة الرئيسية</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 sm:py-8" dir="rtl">

        {/* Compact Stats Card - Optimized for Conversion */}
        <Card className="mb-6 md:mb-8 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md" dir="rtl">
          <CardContent className="p-4 sm:p-5" dir="rtl">
            <div className="text-right space-y-3" dir="rtl">
              {/* Gift Section - Compact */}
              <div className="text-right" dir="rtl">
                <div className="text-4xl mb-2 text-right">🎁</div>
                <h3 className="text-base sm:text-lg font-bold text-blue-900 arabic-text mb-1 text-right">
                  هديتك: حصة مجانية لولدك
                </h3>
                <div className="flex items-center justify-end gap-2 flex-row-reverse">
                  <span className="text-sm sm:text-base font-semibold text-blue-700 arabic-text">رصيد (25 دقيقة)</span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-600">0.5</span>
                </div>
              </div>

              {/* Divider - Slim */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-blue-200"></div>
                <Clock className="w-4 h-4 text-orange-500" />
                <div className="flex-1 h-px bg-blue-200"></div>
              </div>

              {/* Countdown Section - Compact */}
              <div className="text-right" dir="rtl">
                <p className="text-lg sm:text-xl font-bold text-gray-900 arabic-text text-right">
                  باقي {daysRemaining} {daysRemaining === 1 ? 'يوم' : 'أيام'}
                </p>
                <p className="text-sm sm:text-base text-orange-600 arabic-text font-bold text-right">
                  احجز الحين!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Card - Book Now - MOVED TO TOP */}
        <Card className="mb-6 md:mb-8 bg-gradient-to-br from-orange-50 to-orange-100/30 border-2 border-orange-200 shadow-lg" dir="rtl">
          <CardContent className="p-6 sm:p-8" dir="rtl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 arabic-text mb-3 text-right">
              لا تفوّت الفرصة!
            </h2>
            <p className="text-gray-700 arabic-text text-base sm:text-lg max-w-2xl ms-auto mb-6 text-right">
              استفد من الحصة المجانية لولدك وشوف بنفسك كيف الأستاذ أحمد بيساعده يتقن الإنجليزي بطريقة ممتعة وفعّالة
            </p>
            <div className="flex justify-end">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 min-h-[56px] text-lg font-bold"
              >
                <Link to="/booking" className="flex items-center gap-2 flex-row-reverse text-white hover:text-white">
                  احجز حصة ولدك الحين!
                  <Calendar className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Classes Section - Show all booked classes */}
        {allClasses.length > 0 && (
          <div dir="rtl">
            <UpcomingClassesSection 
              classes={allClasses} 
              loading={loading}
            />
          </div>
        )}

        {/* Trial Class Card - Prominent */}
        {trialClass && (
          <Card className="mb-6 md:mb-8 border-2 border-primary-600 shadow-xl" dir="rtl">
            <CardHeader className="bg-primary-600 text-white" dir="rtl">
              <CardTitle className="arabic-text text-xl sm:text-2xl flex items-center justify-end flex-row-reverse">
                حصتك التجريبية
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 me-2" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8" dir="rtl">
              <div className="space-y-4 sm:space-y-6" dir="rtl">
                {/* Date and Time */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 sm:gap-6 text-base sm:text-lg" dir="rtl">
                  <div className="flex items-center min-h-[44px] flex-row-reverse">
                    <span className="arabic-text font-semibold text-right">
                      {trialClass.appointmentDate.toLocaleDateString('ar-SA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <Calendar className="w-5 h-5 text-primary-600 me-2 flex-shrink-0" />
                  </div>
                  <div className="flex items-center min-h-[44px] flex-row-reverse">
                    <span className="arabic-text font-semibold text-right">
                      {trialClass.appointmentDate.toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <Clock className="w-5 h-5 text-primary-600 me-2 flex-shrink-0" />
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="bg-primary-50 rounded-lg p-4 sm:p-6" dir="rtl">
                  <ClassCountdown targetDate={trialClass.appointmentDate} />
                </div>

                {/* Join Button */}
                {trialClass.meetingLink && (
                  <div className="text-right" dir="rtl">
                    <div className="flex justify-end">
                      <Button 
                        size="lg" 
                        className="arabic-text w-full sm:w-auto sm:px-12 min-h-[44px]"
                        onClick={() => window.open(trialClass.meetingLink, '_blank')}
                      >
                        <span className="flex items-center gap-2 flex-row-reverse">
                          الانضمام للحصة
                          <Video className="w-5 h-5" />
                        </span>
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary arabic-text mt-2 text-right">
                      يمكنك الانضمام قبل 10 دقائق من موعد الحصة
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}



        {/* What to Expect Section - Parent-directed */}
        <Card className="mb-6 md:mb-8 border border-gray-200 shadow-md" dir="rtl">
          <CardHeader className="bg-gray-50 border-b border-gray-200" dir="rtl">
            <CardTitle className="arabic-text text-xl sm:text-2xl text-gray-900 text-right">
              إيش تتوقع في حصة ولدك التجريبية؟
            </CardTitle>
            <p className="text-sm text-gray-600 arabic-text mt-2 text-right">
              هذي الحصة فرصتكم تتعرفون على منهجنا وطريقة تدريس الأستاذ أحمد
            </p>
          </CardHeader>
          <CardContent className="p-6" dir="rtl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all flex-row-reverse" dir="rtl">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 arabic-text mb-1 text-right">تقييم مستوى ولدك</h3>
                  <p className="text-sm text-gray-600 arabic-text text-right">
                    بنشوف مستوى ولدك الحالي في الإنجليزي
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all flex-row-reverse" dir="rtl">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 arabic-text mb-1 text-right">تحديد الأهداف</h3>
                  <p className="text-sm text-gray-600 arabic-text text-right">
                    بنتكلم عن أهداف ولدك في التعلم وإيش حابين يوصله
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all flex-row-reverse" dir="rtl">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 arabic-text mb-1 text-right">خطة على كيف ولدك</h3>
                  <p className="text-sm text-gray-600 arabic-text text-right">
                    بنجهز خطة دراسة خاصة لولدك تناسب احتياجاته بالضبط
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all flex-row-reverse" dir="rtl">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 arabic-text mb-1 text-right">يجرب الحصة بنفسه</h3>
                  <p className="text-sm text-gray-600 arabic-text text-right">
                    ولدك بيعيش تجربة كاملة للحصة وبيشوف كيف طريقتنا
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Profile Card */}
        <Card className="mb-6 md:mb-8 overflow-hidden shadow-lg" dir="rtl">
          <div className="flex flex-col md:flex-row md:flex-row-reverse" dir="rtl">
            {/* Teacher Image - Fixed cropping issue */}
            <div className="relative w-full md:w-64 h-80 md:h-auto flex-shrink-0" style={{ minHeight: '20rem' }}>
              <img 
                src="https://i.postimg.cc/Pxk53c04/photo-5864035878953928423-y-1.jpg"
                alt="الأستاذ أحمد"
                className="absolute inset-0 w-full h-full object-contain md:object-cover"
                style={{ objectPosition: 'center top' }}
              />
            </div>
            <CardContent className="flex-1 p-6" dir="rtl">
              <h3 className="text-xl font-bold text-gray-900 arabic-text mb-2 text-right">
                تعلّم مع خبير اللغة، الأستاذ أحمد
              </h3>
              <p className="text-gray-600 arabic-text text-sm mb-4 text-right">
                الأستاذ أحمد متخصص في تدريس اللغة الإنجليزية للأطفال بخبرة طويلة وأساليب مبتكرة تضمن أفضل النتائج
              </p>
              <div className="flex justify-end">
                <Button 
                  asChild 
                  variant="outline" 
                  className="arabic-text border-primary-200 text-primary-600 hover:bg-primary-50"
                >
                  <Link to="/tutor" className="inline-flex items-center gap-2">
                    تعرف على الأستاذ أحمد
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Testimonial Card */}
        <Card className="mb-6 md:mb-8 bg-gradient-to-br from-primary-50 to-primary-100/30 border-primary-200 shadow-md relative" dir="rtl">
          <CardContent className="p-6 sm:p-8" dir="rtl">
            <div className="absolute top-4 right-4 text-primary-300 opacity-30">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
              </svg>
            </div>
            <blockquote className="text-lg font-medium text-gray-700 arabic-text mb-4 relative z-10 text-right">
              "كانت تجربة رائعة! أصبحت أكثر ثقة في تحدث الإنجليزية بفضل الأستاذ أحمد. أنصح فيه بشدة"
            </blockquote>
            <cite className="text-sm font-bold text-gray-900 arabic-text text-right block">
              - أحد الطلاب السابقين
            </cite>
          </CardContent>
        </Card>


      </main>
      
      <Footer />
    </div>
  )
}

export default function TrialStudentDashboard() {
  return (
    <PageErrorBoundary pageName="Trial Student Dashboard">
      <TrialStudentDashboardContent />
    </PageErrorBoundary>
  )
}
