import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { 
  ArrowRight, 
  CreditCard, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pause,
  Play,
  Ban,
  Receipt,
  TrendingUp
} from 'lucide-react'
import { getStudentClasses, getUserCredits } from '@/lib/database'
import { logger } from '@/lib/logger'
import type { ClassCredits } from '@/types'
import { SubscriptionPageSkeleton } from '@/components/skeletons'
import { PageErrorBoundary } from '@/components/ui/page-error-boundary'
import { CardError } from '@/components/ui/error-display'
import { handleApiError, ErrorMessages } from '@/lib/errors'

interface SubscriptionAction {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
  variant: 'default' | 'outline' | 'danger'
  available: boolean
}

function RegularDashboardSubscriptionContent() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<ClassCredits | null>(null)
  const [completedClasses, setCompletedClasses] = useState(0)
  const [scheduledClasses, setScheduledClasses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_showPostponeDialog, _setShowPostponeDialog] = useState(false)
  const [_showCancelDialog, _setShowCancelDialog] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      // Load credits
      const { data: creditsData, error: creditsError } = await getUserCredits(user.id)
      if (creditsError) {
        logger.error('Error loading credits:', creditsError)
        handleApiError(creditsError, 'loadSubscriptionData')
        setError(ErrorMessages.LOAD_SUBSCRIPTION_ERROR)
        return
      }
      setCredits(creditsData)

      // Load classes to calculate completed and scheduled counts
      const { data: classSessions, error: classSessionsError } = await getStudentClasses(user.id)
      if (classSessionsError) {
        logger.error('Error loading class sessions:', classSessionsError)
        handleApiError(classSessionsError, 'loadSubscriptionData')
      } else {
        const completed = (classSessions || []).filter(c => c.status === 'completed').length
        const scheduled = (classSessions || []).filter(c => c.status === 'scheduled').length
        setCompletedClasses(completed)
        setScheduledClasses(scheduled)
      }
    } catch (err) {
      const errorMessage = ErrorMessages.LOAD_SUBSCRIPTION_ERROR
      setError(errorMessage)
      handleApiError(err, 'loadSubscriptionData')
    } finally {
      setLoading(false)
    }
  }

  const handlePostponeSubscription = () => {
    setShowPostponeDialog(true)
    // TODO: Implement postpone logic
    logger.log('Postpone subscription requested')
  }

  const handlePauseSubscription = () => {
    // TODO: Implement pause logic
    logger.log('Pause subscription requested')
  }

  const handleResumeSubscription = () => {
    // TODO: Implement resume logic
    logger.log('Resume subscription requested')
  }

  const handleCancelSubscription = () => {
    setShowCancelDialog(true)
    // TODO: Implement cancel logic
    logger.log('Cancel subscription requested')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
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
          <SubscriptionPageSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <CardError message={error} onRetry={loadSubscriptionData} />
        </div>
      </div>
    )
  }

  const currentCredits = credits?.credits || 0
  const subscriptionActions: SubscriptionAction[] = [
    {
      id: 'postpone',
      title: 'تأجيل الحصص',
      description: 'تأجيل جميع الحصص المجدولة لفترة محددة',
      icon: Clock,
      action: handlePostponeSubscription,
      variant: 'outline',
      available: scheduledClasses > 0
    },
    {
      id: 'pause',
      title: 'إيقاف مؤقت',
      description: 'إيقاف الاشتراك مؤقتاً مع الحفاظ على الرصيد',
      icon: Pause,
      action: handlePauseSubscription,
      variant: 'outline',
      available: true
    },
    {
      id: 'resume',
      title: 'استئناف الاشتراك',
      description: 'إعادة تفعيل الاشتراك المتوقف',
      icon: Play,
      action: handleResumeSubscription,
      variant: 'default',
      available: false // Will be true when subscription is paused
    },
    {
      id: 'cancel',
      title: 'إلغاء الاشتراك',
      description: 'إلغاء الاشتراك نهائياً (يمكن استرجاع الرصيد)',
      icon: Ban,
      action: handleCancelSubscription,
      variant: 'danger',
      available: true
    }
  ]

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
        <div className="mb-8" dir="rtl">
          <div className="text-right" dir="rtl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 arabic-text text-right">
              إدارة الاشتراك
            </h1>
            <p className="text-lg text-gray-600 arabic-text text-right">
              عرض تفاصيل اشتراكك وإدارة رصيدك والحصص
            </p>
          </div>
        </div>

        {/* Subscription Overview */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" dir="rtl">
          <CardContent className="p-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
              {/* Status */}
              <div className="text-center text-right p-4 bg-white rounded-xl shadow-sm" dir="rtl">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 arabic-text text-right mb-1">الحالة</p>
                <p className="text-xl font-bold text-green-600 arabic-text text-right">نشط</p>
              </div>

              {/* Credits */}
              <div className="text-center text-right p-4 bg-white rounded-xl shadow-sm" dir="rtl">
                <div className="flex items-center justify-center mb-2">
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600 arabic-text text-right mb-1">الرصيد المتبقي</p>
                <p className="text-xl font-bold text-blue-600 text-right">{currentCredits} حصة</p>
              </div>

              {/* Completed */}
              <div className="text-center text-right p-4 bg-white rounded-xl shadow-sm" dir="rtl">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-sm text-gray-600 arabic-text text-right mb-1">حصص مكتملة</p>
                <p className="text-xl font-bold text-purple-600 text-right">{completedClasses}</p>
              </div>

              {/* Scheduled */}
              <div className="text-center text-right p-4 bg-white rounded-xl shadow-sm" dir="rtl">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm text-gray-600 arabic-text text-right mb-1">حصص مجدولة</p>
                <p className="text-xl font-bold text-orange-600 text-right">{scheduledClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management Actions */}
        <Card className="mb-8" dir="rtl">
          <CardHeader dir="rtl">
            <CardTitle className="arabic-text flex items-center text-xl text-right flex-row-reverse" dir="rtl">
              <TrendingUp className="w-6 h-6 ml-2 text-indigo-600" />
              إدارة الاشتراك
            </CardTitle>
          </CardHeader>
          <CardContent dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
              {subscriptionActions.map((action) => {
                const Icon = action.icon
                return (
                  <Card 
                    key={action.id}
                    className={`hover:shadow-md transition-shadow ${!action.available ? 'opacity-50' : ''}`}
                    dir="rtl"
                  >
                    <CardContent className="p-6" dir="rtl">
                      <div className="flex items-start gap-4 flex-row-reverse mb-4" dir="rtl">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          action.variant === 'danger' ? 'bg-red-100' :
                          action.variant === 'default' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            action.variant === 'danger' ? 'text-red-600' :
                            action.variant === 'default' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 text-right" dir="rtl">
                          <h3 className="font-semibold text-gray-900 arabic-text text-right mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 arabic-text text-right">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={action.variant}
                        className="w-full arabic-text"
                        onClick={action.action}
                        disabled={!action.available}
                      >
                        {action.title}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Credit Management */}
        <Card className="mb-8" dir="rtl">
          <CardHeader dir="rtl">
            <CardTitle className="arabic-text flex items-center text-xl text-right flex-row-reverse" dir="rtl">
              <CreditCard className="w-6 h-6 ml-2 text-indigo-600" />
              إدارة الرصيد
            </CardTitle>
          </CardHeader>
          <CardContent dir="rtl">
            <div className="space-y-4" dir="rtl">
              {/* Progress Bar */}
              <div dir="rtl">
                <div className="flex justify-between text-sm mb-2 text-right flex-row-reverse" dir="rtl">
                  <span className="text-gray-700 arabic-text font-medium text-right">استخدام الرصيد</span>
                  <span className="text-primary-600 font-semibold">
                    {completedClasses} / {completedClasses + currentCredits} حصة
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3" dir="ltr">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((completedClasses / (completedClasses + currentCredits)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Low Credit Warning */}
              {currentCredits < 2 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" dir="rtl">
                  <div className="flex items-start gap-3 flex-row-reverse" dir="rtl">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-right" dir="rtl">
                      <h4 className="text-sm font-semibold text-amber-900 arabic-text mb-1 text-right">
                        رصيدك منخفض!
                      </h4>
                      <p className="text-sm text-amber-700 arabic-text text-right">
                        رصيدك الحالي أقل من حصتين. يُنصح بإضافة رصيد لضمان استمرارية الحصص.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Credit Button */}
              <Button asChild className="w-full arabic-text h-12" size="lg">
                <Link to="/#pricing" className="flex items-center justify-center gap-2 flex-row-reverse">
                  <CreditCard className="w-5 h-5" />
                  إضافة رصيد
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="mb-8" dir="rtl">
          <CardHeader dir="rtl">
            <CardTitle className="arabic-text flex items-center text-xl text-right flex-row-reverse" dir="rtl">
              <Receipt className="w-6 h-6 ml-2 text-indigo-600" />
              سجل المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent dir="rtl">
            <div className="text-center py-12" dir="rtl">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 arabic-text text-right">لا توجد مدفوعات سابقة</p>
              <p className="text-sm text-gray-400 arabic-text mt-2 text-right">
                سيظهر هنا سجل جميع عمليات الشراء والدفع
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-8 bg-blue-50 border-blue-200" dir="rtl">
          <CardContent className="p-6" dir="rtl">
            <h3 className="font-semibold text-blue-900 arabic-text mb-3 text-right">
              💡 معلومات مهمة
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 arabic-text text-right" dir="rtl">
              <li className="flex items-start gap-2 flex-row-reverse" dir="rtl">
                <span>•</span>
                <span>كل حصة تستهلك 1.0 رصيد (60 دقيقة)</span>
              </li>
              <li className="flex items-start gap-2 flex-row-reverse" dir="rtl">
                <span>•</span>
                <span>يمكنك حجز حصص متعددة حسب رصيدك المتاح</span>
              </li>
              <li className="flex items-start gap-2 flex-row-reverse" dir="rtl">
                <span>•</span>
                <span>الرصيد لا ينتهي ويمكن استخدامه في أي وقت</span>
              </li>
              <li className="flex items-start gap-2 flex-row-reverse" dir="rtl">
                <span>•</span>
                <span>يمكنك إلغاء الحصة قبل 24 ساعة لاسترجاع الرصيد</span>
              </li>
              <li className="flex items-start gap-2 flex-row-reverse" dir="rtl">
                <span>•</span>
                <span>عند تأجيل الاشتراك، يتم الحفاظ على جميع الرصيد</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center" dir="rtl">
          <Button asChild size="lg" className="arabic-text">
            <Link to="/#pricing" className="flex items-center gap-2 flex-row-reverse">
              <CreditCard className="w-5 h-5" />
              إضافة رصيد
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="arabic-text">
            <Link to="/dashboard/student/classes" className="flex items-center gap-2 flex-row-reverse">
              <Calendar className="w-5 h-5" />
              عرض جميع الحصص
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

export default function RegularDashboardSubscriptionNew() {
  return (
    <PageErrorBoundary pageName="Regular Dashboard Subscription">
      <RegularDashboardSubscriptionContent />
    </PageErrorBoundary>
  )
}
