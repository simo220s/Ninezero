import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import SubscriptionManagement from '@/features/dashboard/components/SubscriptionManagement'
import SubscriptionCancellationFlow from '@/features/dashboard/components/SubscriptionCancellationFlow'
import Footer from '@/components/Footer'
import { ArrowRight, Receipt, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react'
import { getStudentClasses, getUserCredits } from '@/lib/database'
import { logger } from '@/lib/logger'
import type { ClassCredits } from '@/types'
import { SubscriptionPageSkeleton } from '@/components/skeletons'
import { PageErrorBoundary } from '@/components/ui/page-error-boundary'
import { CardError } from '@/components/ui/error-display'
import { handleApiError, ErrorMessages } from '@/lib/errors'
import { useSubscriptionSync } from '@/hooks/useSubscriptionSync'

interface PaymentRecord {
  id: string
  date: string
  amount: number
  credits: number
  status: 'completed' | 'pending' | 'failed'
  description: string
}

interface NotificationState {
  show: boolean
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
}

function RegularDashboardSubscriptionContent() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<ClassCredits | null>(null)
  const [completedClasses, setCompletedClasses] = useState(0)
  const [scheduledClasses, setScheduledClasses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showNotification = (type: NotificationState['type'], title: string, message: string) => {
    setNotification({ show: true, type, title, message })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  // Placeholder payment history - will be replaced with real data when backend is ready
  const paymentHistory: PaymentRecord[] = [
    // {
    //   id: '1',
    //   date: '2024-01-15',
    //   amount: 800,
    //   credits: 8,
    //   status: 'completed',
    //   description: 'باقة 8 حصص'
    // }
  ]

  // Real-time subscription sync
  useSubscriptionSync(user?.id, {
    onSubscriptionChange: (change) => {
      logger.log('Real-time subscription change detected', { type: change.type })
      // Reload subscription data when changes occur
      loadSubscriptionData()
    },
    onDiscountApplied: (data) => {
      logger.log('Discount applied in real-time', data)
      showNotification('success', 'تم تطبيق الخصم', 'تم تطبيق الخصم على اشتراكك بنجاح')
      loadSubscriptionData()
    },
    onDiscountRemoved: (data) => {
      logger.log('Discount removed in real-time', data)
      showNotification('info', 'تم إزالة الخصم', 'تم إزالة الخصم من اشتراكك')
      loadSubscriptionData()
    },
    onCancellationRequested: (data) => {
      logger.log('Cancellation requested in real-time', data)
      showNotification('warning', 'طلب إلغاء الاشتراك', 'سيتم تفعيل الإلغاء خلال 24 ساعة')
      loadSubscriptionData()
    },
    onCancellationCancelled: (data) => {
      logger.log('Cancellation cancelled in real-time', data)
      showNotification('success', 'تم إلغاء طلب الإلغاء', 'اشتراكك لا يزال نشطاً')
      loadSubscriptionData()
    },
    onCancellationCompleted: (data) => {
      logger.log('Cancellation completed in real-time', data)
      showNotification('error', 'تم إلغاء اشتراكك', 'شكراً لاستخدامك خدماتنا')
      loadSubscriptionData()
    }
  })

  useEffect(() => {
    // Scroll to top when component mounts
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

  const handleCancelSubscription = () => {
    setShowCancelModal(true)
  }

  const handleCancellationComplete = (action: 'cancelled' | 'discount-accepted') => {
    setShowCancelModal(false)
    
    if (action === 'cancelled') {
      // Show success message or redirect
      logger.info('Subscription cancellation confirmed')
      // Optionally reload subscription data to reflect changes
      loadSubscriptionData()
    } else if (action === 'discount-accepted') {
      // Show success message and reload data
      logger.info('Retention discount accepted')
      // Reload subscription data to show new pricing
      loadSubscriptionData()
    }
  }

  const handleCancellationClose = () => {
    setShowCancelModal(false)
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
                إدارة الاشتراك
              </h1>
              <p className="text-lg text-gray-600 arabic-text text-right">
                عرض تفاصيل اشتراكك وإدارة رصيدك
              </p>
            </div>
          </div>

          {/* Loading Skeleton */}
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

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      {/* Real-time Notification */}
      {notification.show && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300" dir="rtl">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 shadow-lg ${getNotificationStyles()}`}>
            {getNotificationIcon()}
            <div className="text-right" dir="rtl">
              <p className="font-semibold arabic-text text-right">{notification.title}</p>
              <p className="text-sm arabic-text text-right">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

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
              إدارة الاشتراك
            </h1>
            <p className="text-lg text-gray-600 arabic-text text-right">
              عرض تفاصيل اشتراكك وإدارة رصيدك
            </p>
          </div>
        </div>

        {/* Subscription Management Component */}
        <div className="mb-8" dir="rtl">
          <SubscriptionManagement
            credits={credits}
            completedClasses={completedClasses}
            scheduledClasses={scheduledClasses}
          />
        </div>

        {/* Payment History Section */}
        <div className="mb-8" dir="rtl">
          <Card dir="rtl">
            <CardHeader dir="rtl">
              <CardTitle className="arabic-text flex items-center text-xl text-right" dir="rtl">
                <Receipt className="w-6 h-6 ms-2 text-indigo-600" />
                سجل المدفوعات
              </CardTitle>
            </CardHeader>
            <CardContent dir="rtl">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-12" dir="rtl">
                  <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 arabic-text text-right">لا توجد مدفوعات سابقة</p>
                  <p className="text-sm text-gray-400 arabic-text mt-2 text-right">
                    سيظهر هنا سجل جميع عمليات الشراء والدفع
                  </p>
                </div>
              ) : (
                <div className="space-y-3" dir="rtl">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      dir="rtl"
                    >
                      <div className="flex-1 text-right" dir="rtl">
                        <p className="font-semibold text-gray-900 arabic-text text-right">
                          {payment.description}
                        </p>
                        <p className="text-sm text-gray-500 arabic-text text-right">
                          {new Date(payment.date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div className="text-left" dir="ltr">
                        <p className="font-bold text-gray-900">{payment.amount} ريال</p>
                        <p className="text-sm text-gray-500 arabic-text">
                          {payment.credits} حصة
                        </p>
                      </div>
                      <div className="mr-4" dir="rtl">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {payment.status === 'completed'
                            ? 'مكتمل'
                            : payment.status === 'pending'
                            ? 'قيد المعالجة'
                            : 'فشل'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cancel Subscription Section - De-emphasized */}
        <div className="mb-8 flex justify-center" dir="rtl">
          <button
            onClick={handleCancelSubscription}
            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors arabic-text"
          >
            إلغاء الاشتراك
          </button>
        </div>

        {/* Subscription Cancellation Flow Modal */}
        <SubscriptionCancellationFlow
          isOpen={showCancelModal}
          onClose={handleCancellationClose}
          onComplete={handleCancellationComplete}
          currentPrice={100}
          subscriptionId={user?.id}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center" dir="rtl">
          <Button asChild size="lg" className="arabic-text">
            <Link to="/#pricing" className="flex items-center gap-2 flex-row-reverse">
              <Receipt className="w-5 h-5" />
              إضافة رصيد
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

export default function RegularDashboardSubscription() {
  return (
    <PageErrorBoundary pageName="Regular Dashboard Subscription">
      <RegularDashboardSubscriptionContent />
    </PageErrorBoundary>
  )
}
