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
import MiniCalendar from './MiniCalendar'
import Footer from '@/components/Footer'
import { DashboardCardSkeleton } from '@/components/skeletons'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, BookOpen, CreditCard, AlertCircle } from 'lucide-react'
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
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelStep, setCancelStep] = useState(1)

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
  const scheduledClasses = dashboardData?.classes?.filter(c => c.status === 'scheduled') || []

  // Render different pages based on navigation
  const renderUpcomingClassesPage = () => (
    <div className="space-y-6">
      <div className="text-right">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 arabic-text">الحصص القادمة</h2>
        <p className="text-gray-600 arabic-text">جدول حصصك المجدولة</p>
      </div>

      {scheduledClasses.length === 0 ? (
        <Card className="p-8 text-center" dir="rtl">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 arabic-text">لا توجد حصص مجدولة</h3>
          <p className="text-gray-600 arabic-text mb-4">احجز حصتك القادمة الآن</p>
          <Button className="arabic-text">احجز حصة</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Classes Table */}
          <Card className="overflow-hidden" dir="rtl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 arabic-text">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 arabic-text">الوقت</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 arabic-text">المدة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 arabic-text">المعلم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 arabic-text">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 arabic-text">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scheduledClasses.map((classItem) => (
                    <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 arabic-text">{classItem.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 arabic-text">{classItem.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 arabic-text">{classItem.duration} دقيقة</td>
                      <td className="px-6 py-4 text-sm text-gray-900 arabic-text">{classItem.teacher_name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 arabic-text">
                          مجدولة
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button size="sm" className="arabic-text">انضم للحصة</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )

  const renderSubscriptionPage = () => (
    <div className="space-y-6">
      <div className="text-right">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 arabic-text">الاشتراك والدفع</h2>
        <p className="text-gray-600 arabic-text">إدارة اشتراكك وخطط الدفع</p>
      </div>

      {/* Current Plan */}
      <Card className="p-6" dir="rtl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 arabic-text">الخطة الحالية</h3>
            <p className="text-gray-600 arabic-text">خطة شهرية - 8 حصص</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">800 ريال</p>
            <p className="text-sm text-gray-600 arabic-text">شهرياً</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-right">
            <p className="text-sm text-gray-600 arabic-text mb-1">الحصص المتبقية</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData?.credits?.credits || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-right">
            <p className="text-sm text-gray-600 arabic-text mb-1">الحصص المكتملة</p>
            <p className="text-2xl font-bold text-gray-900">{completedClasses}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-right">
            <p className="text-sm text-gray-600 arabic-text mb-1">تاريخ التجديد</p>
            <p className="text-lg font-semibold text-gray-900 arabic-text">15 ديسمبر 2024</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 arabic-text" onClick={() => setIsAddCreditsModalOpen(true)}>
            <CreditCard className="w-4 h-4 ml-2" />
            إضافة رصيد
          </Button>
          <Button 
            variant="outline" 
            className="arabic-text text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowCancelModal(true)}
          >
            إلغاء الاشتراك
          </Button>
        </div>
      </Card>

      {/* Available Plans */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 arabic-text text-right">الخطط المتاحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'خطة أساسية', sessions: 4, price: 450, perSession: 112.5 },
            { name: 'خطة شهرية', sessions: 8, price: 800, perSession: 100, popular: true },
            { name: 'خطة مكثفة', sessions: 12, price: 1080, perSession: 90 },
          ].map((plan) => (
            <Card key={plan.name} className={`p-6 ${plan.popular ? 'border-2 border-blue-500' : ''}`} dir="rtl">
              {plan.popular && (
                <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3 arabic-text">
                  الأكثر شعبية
                </div>
              )}
              <h4 className="text-lg font-bold text-gray-900 mb-2 arabic-text">{plan.name}</h4>
              <p className="text-3xl font-bold text-gray-900 mb-1">{plan.price} ريال</p>
              <p className="text-sm text-gray-600 arabic-text mb-4">{plan.sessions} حصص - {plan.perSession} ريال للحصة</p>
              <Button className="w-full arabic-text">اختر هذه الخطة</Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6" dir="rtl">
            {cancelStep === 1 && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4 arabic-text text-right">لماذا تريد إلغاء الاشتراك؟</h3>
                <div className="space-y-2 mb-6">
                  {['الأسعار مرتفعة', 'لا أحتاج المزيد من الحصص', 'جودة التعليم', 'أسباب شخصية', 'أخرى'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => {
                        setCancelReason(reason)
                        setCancelStep(2)
                      }}
                      className="w-full text-right p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors arabic-text"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <Button variant="outline" className="w-full arabic-text" onClick={() => setShowCancelModal(false)}>
                  إلغاء
                </Button>
              </>
            )}

            {cancelStep === 2 && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 arabic-text">انتظر! عرض خاص لك</h3>
                  <p className="text-gray-600 arabic-text mb-4">نقدر وجودك معنا. احصل على خصم 20% على اشتراكك القادم</p>
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                    <p className="text-2xl font-bold text-green-700 mb-1">خصم 20%</p>
                    <p className="text-sm text-green-700 arabic-text">وفر 160 ريال على الخطة الشهرية</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button className="w-full arabic-text" onClick={() => {
                    setShowCancelModal(false)
                    setCancelStep(1)
                  }}>
                    احصل على الخصم
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full arabic-text text-red-600"
                    onClick={() => setCancelStep(3)}
                  >
                    أكمل الإلغاء
                  </Button>
                </div>
              </>
            )}

            {cancelStep === 3 && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 arabic-text">تأكيد الإلغاء</h3>
                  <p className="text-gray-600 arabic-text mb-4">سيتم إلغاء اشتراكك خلال 24 ساعة</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
                    <p className="text-sm text-blue-800 arabic-text">
                      <strong>ملاحظة:</strong> إذا كنت تريد الإلغاء الفوري، يمكنك إلغاء الاشتراك عبر الرابط في البريد الإلكتروني الأول الذي أرسلناه لك.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button 
                    className="w-full arabic-text bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      // Handle cancellation
                      setShowCancelModal(false)
                      setCancelStep(1)
                    }}
                  >
                    تأكيد الإلغاء
                  </Button>
                  <Button variant="outline" className="w-full arabic-text" onClick={() => {
                    setShowCancelModal(false)
                    setCancelStep(1)
                  }}>
                    العودة
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )

  const renderDashboardHome = () => (
    <>
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
        <div className="space-y-4 animate-fade-in">
          <EnhancedRecentActivity classes={dashboardData?.classes || []} />
          <MiniCalendar classes={dashboardData?.classes || []} />
        </div>
      </div>
    </>
  )

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <EnhancedHeader onSignOut={handleSignOut} />

      <main className="pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          {currentPage === 'dashboard' && renderDashboardHome()}
          {currentPage === 'upcoming' && renderUpcomingClassesPage()}
          {currentPage === 'accomplishments' && (
            <div className="animate-fade-in">
              <EnhancedAccomplishments completedClasses={completedClasses} />
            </div>
          )}
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
