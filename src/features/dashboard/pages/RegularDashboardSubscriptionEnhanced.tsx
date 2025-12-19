import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { 
  ArrowRight, 
  CreditCard, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  Ban,
  Receipt,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react'
import { getStudentClasses, getUserCredits } from '@/lib/database'
import { logger } from '@/lib/logger'
import type { ClassCredits } from '@/types'
import { SubscriptionPageSkeleton } from '@/components/skeletons'
import { PageErrorBoundary } from '@/components/ui/page-error-boundary'
import { CardError } from '@/components/ui/error-display'
import { handleApiError, ErrorMessages } from '@/lib/errors'
import { cn } from '@/lib/utils'

interface SubscriptionAction {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
  variant: 'primary' | 'outline' | 'danger'
  available: boolean
  colorScheme: string
}

function RegularDashboardSubscriptionEnhancedContent() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<ClassCredits | null>(null)
  const [completedClasses, setCompletedClasses] = useState(0)
  const [scheduledClasses, setScheduledClasses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      
      const { data: creditsData, error: creditsError } = await getUserCredits(user.id)
      if (creditsError) {
        logger.error('Error loading credits:', creditsError)
        handleApiError(creditsError, 'loadSubscriptionData')
        setError(ErrorMessages.LOAD_SUBSCRIPTION_ERROR)
        return
      }
      setCredits(creditsData)

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
    logger.log('Postpone subscription requested')
    // TODO: Implement postpone logic
  }

  const handlePauseSubscription = () => {
    logger.log('Pause subscription requested')
    // TODO: Implement pause logic
  }

  const handleResumeSubscription = () => {
    logger.log('Resume subscription requested')
    // TODO: Implement resume logic
  }

  const handleCancelSubscription = () => {
    logger.log('Cancel subscription requested')
    // TODO: Implement cancel logic
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100" dir="rtl">
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50 shadow-sm" dir="rtl">
          <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto" dir="rtl">
            <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
              <span className="text-gray-800 arabic-text font-bold text-lg">الأستاذ أحمد</span>
            </div>
            <Button asChild variant="ghost" size="sm" className="arabic-text">
              <Link to="/dashboard/student" className="flex items-center gap-2 flex-row-reverse">
                <ArrowRight className="w-4 h-4" />
                العودة
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <CardError message={error} onRetry={loadSubscriptionData} />
        </div>
      </div>
    )
  }

  const currentCredits = credits?.credits || 0
  const totalClasses = completedClasses + currentCredits
  const progressPercentage = totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0

  const subscriptionActions: SubscriptionAction[] = [
    {
      id: 'postpone',
      title: 'تأجيل الحصص',
      description: 'تأجيل جميع الحصص المجدولة لفترة محددة مع الحفاظ على الرصيد',
      icon: Clock,
      action: handlePostponeSubscription,
      variant: 'outline',
      available: scheduledClasses > 0,
      colorScheme: 'primary'
    },
    {
      id: 'pause',
      title: 'إيقاف مؤقت',
      description: 'إيقاف الاشتراك مؤقتاً مع الحفاظ على الرصيد والعودة متى شئت',
      icon: Pause,
      action: handlePauseSubscription,
      variant: 'outline',
      available: true,
      colorScheme: 'muted'
    },
    {
      id: 'resume',
      title: 'استئناف الاشتراك',
      description: 'إعادة تفعيل الاشتراك المتوقف واستكمال رحلة التعلم',
      icon: Play,
      action: handleResumeSubscription,
      variant: 'primary',
      available: false,
      colorScheme: 'muted'
    },
    {
      id: 'cancel',
      title: 'إلغاء الاشتراك',
      description: 'إلغاء الاشتراك نهائياً (يمكن استرجاع الرصيد المتبقي)',
      icon: Ban,
      action: handleCancelSubscription,
      variant: 'danger',
      available: true,
      colorScheme: 'danger'
    }
  ]

  const firstName = user?.user_metadata?.first_name || 'ط'
  const initials = firstName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100" dir="rtl">
      {/* Enhanced Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50 shadow-sm" dir="rtl">
        <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto" dir="rtl">
          <div className="flex items-center gap-3 flex-row-reverse" dir="rtl">
            <Avatar className="h-8 w-8 border-2 border-primary-200">
              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-800 arabic-text font-bold text-lg">الأستاذ أحمد</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="arabic-text">
            <Link to="/dashboard/student" className="flex items-center gap-2 flex-row-reverse">
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">العودة للوحة التحكم</span>
              <span className="sm:hidden">العودة</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24 space-y-6" dir="rtl">
        {/* Page Header */}
        <div className="text-right" dir="rtl">
          <div className="flex items-center gap-2 mb-2 flex-row-reverse" dir="rtl">
            <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-200 arabic-text">
              <TrendingUp className="w-3 h-3 ml-1" />
              إدارة الاشتراك
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 arabic-text">
            إدارة اشتراكك
          </h1>
          <p className="text-lg text-gray-600 arabic-text">
            عرض تفاصيل اشتراكك وإدارة رصيدك والحصص بكل سهولة
          </p>
        </div>

        {/* Subscription Overview - Enhanced Stats */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100" dir="rtl">
          <CardContent className="p-6" dir="rtl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
              {/* Status */}
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow" dir="rtl">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-600/30">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600 arabic-text mb-1">الحالة</p>
                <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-200 arabic-text">نشط</Badge>
              </div>

              {/* Credits */}
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow" dir="rtl">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-600/30">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600 arabic-text mb-1">الرصيد المتبقي</p>
                <p className="text-2xl font-bold text-primary-700">{currentCredits}</p>
                <p className="text-xs text-gray-500 arabic-text">حصة</p>
              </div>

              {/* Completed */}
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow" dir="rtl">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-600/30">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600 arabic-text mb-1">حصص مكتملة</p>
                <p className="text-2xl font-bold text-primary-700">{completedClasses}</p>
                <p className="text-xs text-gray-500 arabic-text">حصة</p>
              </div>

              {/* Scheduled */}
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow" dir="rtl">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-600/30">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600 arabic-text mb-1">حصص مجدولة</p>
                <p className="text-2xl font-bold text-primary-700">{scheduledClasses}</p>
                <p className="text-xs text-gray-500 arabic-text">حصة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management Actions */}
        <Card className="shadow-lg border-gray-200" dir="rtl">
          <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-blue-50" dir="rtl">
            <CardTitle className="arabic-text flex items-center text-xl flex-row-reverse">
              <TrendingUp className="w-6 h-6 ml-2 text-primary-600" />
              إدارة الاشتراك
            </CardTitle>
            <CardDescription className="arabic-text text-right">
              اختر الإجراء المناسب لإدارة اشتراكك
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
              {subscriptionActions.map((action) => {
                const Icon = action.icon
                const colorClasses = {
                  primary: 'bg-primary-100 text-primary-700 border-primary-200',
                  muted: 'bg-slate-100 text-slate-600 border-slate-200',
                  danger: 'bg-red-100 text-red-600 border-red-200'
                }
                
                return (
                  <Card 
                    key={action.id}
                    className={cn(
                      "hover:shadow-md transition-all duration-300 border-2",
                      !action.available && 'opacity-50 cursor-not-allowed'
                    )}
                    dir="rtl"
                  >
                    <CardContent className="p-5" dir="rtl">
                      <div className="flex items-start gap-4 flex-row-reverse mb-4" dir="rtl">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0",
                          colorClasses[action.colorScheme as keyof typeof colorClasses]
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-right" dir="rtl">
                          <h3 className="font-bold text-gray-900 arabic-text mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 arabic-text leading-relaxed">
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
        <Card className="shadow-lg border-gray-200" dir="rtl">
          <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-blue-50" dir="rtl">
            <CardTitle className="arabic-text flex items-center text-xl flex-row-reverse">
              <CreditCard className="w-6 h-6 ml-2 text-primary-600" />
              إدارة الرصيد
            </CardTitle>
            <CardDescription className="arabic-text text-right">
              تتبع استخدامك للرصيد وأضف المزيد عند الحاجة
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6" dir="rtl">
            {/* Progress Section */}
            <div dir="rtl">
              <div className="flex justify-between items-center mb-3 flex-row-reverse" dir="rtl">
                <span className="text-sm font-semibold text-gray-700 arabic-text">استخدام الرصيد</span>
                <Badge variant="secondary" className="arabic-text">
                  {completedClasses} / {totalClasses} حصة
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-3 mb-2" />
              <p className="text-xs text-gray-500 arabic-text text-right">
                تم إنجاز {progressPercentage.toFixed(0)}% من إجمالي الحصص المتاحة
              </p>
            </div>

            {/* Low Credit Warning */}
            {currentCredits < 2 && (
              <Card className="border-primary-200 bg-gradient-to-r from-primary-50 to-blue-100 shadow-md" dir="rtl">
                <CardContent className="p-4" dir="rtl">
                  <div className="flex items-start gap-3 flex-row-reverse" dir="rtl">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-right" dir="rtl">
                      <h4 className="text-sm font-bold text-primary-900 arabic-text mb-1">
                        ⚠️ رصيدك منخفض!
                      </h4>
                      <p className="text-sm text-primary-800 arabic-text">
                        رصيدك الحالي أقل من حصتين. يُنصح بإضافة رصيد لضمان استمرارية الحصص.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Credit Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
              <Button asChild size="lg" className="arabic-text h-14 shadow-md">
                <Link to="/#pricing" className="flex items-center justify-center gap-2 flex-row-reverse">
                  <CreditCard className="w-5 h-5" />
                  <span>إضافة رصيد</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="arabic-text h-14 border-primary-300 text-primary-700 hover:bg-primary-50">
                <Link to="/book-regular" className="flex items-center justify-center gap-2 flex-row-reverse">
                  <Calendar className="w-5 h-5" />
                  <span>حجز حصة</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Placeholder */}
        <Card className="shadow-lg border-gray-200" dir="rtl">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-slate-50" dir="rtl">
            <CardTitle className="arabic-text flex items-center text-xl flex-row-reverse">
              <Receipt className="w-6 h-6 ml-2 text-gray-600" />
              سجل المدفوعات
            </CardTitle>
            <CardDescription className="arabic-text text-right">
              عرض جميع عمليات الشراء والدفع السابقة
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12" dir="rtl">
            <div className="text-center" dir="rtl">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 arabic-text mb-2">
                لا توجد مدفوعات سابقة
              </h3>
              <p className="text-sm text-gray-500 arabic-text">
                سيظهر هنا سجل جميع عمليات الشراء والدفع
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50" dir="rtl">
          <CardHeader className="border-b border-blue-200" dir="rtl">
            <CardTitle className="arabic-text flex items-center text-lg flex-row-reverse">
              <Info className="w-5 h-5 ml-2 text-blue-600" />
              معلومات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6" dir="rtl">
            <ul className="space-y-3 text-sm text-blue-900 arabic-text" dir="rtl">
              {[
                'كل حصة تستهلك 1.0 رصيد (60 دقيقة)',
                'يمكنك حجز حصص متعددة حسب رصيدك المتاح',
                'الرصيد لا ينتهي ويمكن استخدامه في أي وقت',
                'يمكنك إلغاء الحصة قبل 24 ساعة لاسترجاع الرصيد',
                'عند تأجيل الاشتراك، يتم الحفاظ على جميع الرصيد',
                'خدمة الدعم متاحة على مدار الساعة للإجابة على استفساراتك'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 flex-row-reverse" dir="rtl">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 text-right">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4" dir="rtl">
          <Button asChild size="lg" className="arabic-text shadow-lg">
            <Link to="/#pricing" className="flex items-center gap-2 flex-row-reverse">
              <Sparkles className="w-5 h-5" />
              <span>إضافة رصيد</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="arabic-text">
            <Link to="/dashboard/student/classes" className="flex items-center gap-2 flex-row-reverse">
              <Calendar className="w-5 h-5" />
              <span>عرض جميع الحصص</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="arabic-text">
            <Link to="/dashboard/student">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function RegularDashboardSubscriptionEnhanced() {
  return (
    <PageErrorBoundary pageName="Regular Dashboard Subscription">
      <RegularDashboardSubscriptionEnhancedContent />
    </PageErrorBoundary>
  )
}
