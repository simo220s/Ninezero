import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import NeetoCalWidget from '@/components/NeetoCalWidget'
import { createAppointment, getUserCredits, deductCredits, convertTrialStudent, getUserProfile } from '@/lib/database'
import Footer from '@/components/Footer'
import { RiyalPrice } from '@/components/RiyalPrice'
import { handleError, isOnline } from '@/lib/error-handling'
import { logger } from '@/lib/utils/logger'

export default function BookRegularPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [selectedType] = useState<'individual' | 'group'>('individual')
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    loadUserCredits()
  }, [user])

  const loadUserCredits = async () => {
    if (!user) return

    // Check network connectivity
    if (!isOnline()) {
      setLoadError('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك.')
      setLoading(false)
      return
    }

    try {
      setLoadError(null)
      const { data, error } = await getUserCredits(user.id)
      if (error) {
        throw error
      }
      setCredits(data?.credits || 0)
    } catch (error) {
      logger.error('Error loading credits:', error)
      const errorMessage = handleError(error)
      setLoadError(errorMessage || 'فشل تحميل بيانات الرصيد. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingComplete = async (bookingData: any) => {
    if (!user || !credits || credits < 1.0) {
      setBookingError('رصيدك غير كافٍ لحجز حصة منتظمة.')
      return
    }

    // Check network connectivity
    if (!isOnline()) {
      setBookingError('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.')
      return
    }

    try {
      setBookingError(null)

      // Check if user is a trial student and convert them
      const { data: profile } = await getUserProfile(user.id)
      if (profile?.is_trial) {
        logger.log('[BookRegularPage] Converting trial student to regular')
        const { error: conversionError } = await convertTrialStudent(user.id)
        if (conversionError) {
          throw conversionError
        }
      }

      // Deduct 1.0 credit
      const { error: deductError } = await deductCredits(user.id, 1.0)
      if (deductError) {
        throw deductError
      }

      // Create appointment record
      const { error: appointmentError } = await createAppointment({
        userId: user.id,
        studentName: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
        appointmentType: 'regular',
        status: 'scheduled',
        appointmentDate: new Date(bookingData.start_time),
        duration: 60,
        notes: `حصة منتظمة - ${selectedType === 'individual' ? 'فردية' : 'جماعية'}`
      })

      if (appointmentError) {
        throw appointmentError
      }

      setIsBookingComplete(true)
      
      // Redirect to regular student dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard/student', { replace: true })
      }, 3000)
    } catch (error) {
      logger.error('Error completing booking:', error)
      const errorMessage = handleError(error)
      setBookingError(errorMessage || 'حدث خطأ أثناء حجز الحصة. يرجى المحاولة مرة أخرى.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-secondary arabic-text">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary arabic-text mb-2">
              حدث خطأ
            </h3>
            <p className="text-text-secondary arabic-text mb-6">
              {loadError}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={loadUserCredits} className="arabic-text">
                إعادة المحاولة
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard/student')} className="arabic-text">
                العودة للوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isBookingComplete) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary arabic-text mb-2">
              تم حجز حصتك بنجاح!
            </h3>
            <p className="text-text-secondary arabic-text mb-4">
              تم خصم 1.0 رصيد من حسابك
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-700 text-sm arabic-text font-medium">
                🎉 مبروك! تم تحويلك إلى طالب نظامي
              </p>
              <p className="text-blue-600 text-xs arabic-text mt-1">
                يمكنك الآن الوصول إلى جميع مزايا لوحة التحكم الكاملة
              </p>
            </div>
            <p className="text-sm text-text-secondary arabic-text">
              سيتم توجيهك إلى لوحة التحكم خلال ثوانٍ...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasEnoughCredits = credits !== null && credits >= 1.0

  return (
    <div className="min-h-screen bg-bg-light py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary arabic-text mb-4">
            احجز حصة منتظمة
          </h1>
          <p className="text-text-secondary arabic-text">
            حصة لمدة 60 دقيقة مع الأستاذ أحمد
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Widget */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">اختر الوقت المناسب</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="assertive">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-red-700 arabic-text">{bookingError}</p>
                        <button
                          type="button"
                          onClick={() => setBookingError(null)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 underline arabic-text"
                          aria-label="إغلاق رسالة الخطأ"
                        >
                          إغلاق
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {hasEnoughCredits ? (
                  <NeetoCalWidget
                    embedUrl="https://neetocal.com/regular-lesson-60-mins"
                    duration={60}
                    appointmentType="regular"
                    onBookingComplete={handleBookingComplete}
                  />
                ) : (
                  <div className="bg-yellow-50 p-8 rounded-lg text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-600 arabic-text mb-2">
                      رصيد غير كافي
                    </h3>
                    <p className="text-yellow-600 arabic-text mb-4">
                      تحتاج إلى 1.0 رصيد لحجز حصة منتظمة
                    </p>
                    <p className="text-sm text-yellow-600 arabic-text">
                      رصيدك الحالي: {credits?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className={`${hasEnoughCredits ? 'bg-success-50 border-success-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <CardHeader>
                <CardTitle className={`${hasEnoughCredits ? 'text-success-600' : 'text-yellow-600'} arabic-text`}>
                  رصيدك الحالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${hasEnoughCredits ? 'text-success-600' : 'text-yellow-600'} mb-2`}>
                    {credits?.toFixed(1) || '0.0'}
                  </div>
                  <p className={`${hasEnoughCredits ? 'text-success-600' : 'text-yellow-600'} text-sm arabic-text mb-4`}>
                    رصيد متاح
                  </p>
                  <p className={`text-xs ${hasEnoughCredits ? 'text-success-600' : 'text-yellow-600'} arabic-text`}>
                    {hasEnoughCredits ? 'رصيد كافي للحجز' : 'تحتاج 1.0 رصيد لحجز حصة منتظمة'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">أنواع الحصص</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-bg-light rounded-lg">
                    <h4 className="font-semibold text-text-primary arabic-text mb-2">
                      حصة فردية (1:1)
                    </h4>
                    <p className="text-sm text-text-secondary arabic-text mb-2">
                      حصة خصوصية مع الأستاذ أحمد
                    </p>
                    <p className="text-primary-600 font-semibold">
                      <RiyalPrice amount={35} /> / الساعة
                    </p>
                  </div>
                  
                  <div className="p-4 bg-bg-light rounded-lg">
                    <h4 className="font-semibold text-text-primary arabic-text mb-2">
                      حصة جماعية (3-5 طلاب)
                    </h4>
                    <p className="text-sm text-text-secondary arabic-text mb-2">
                      مجموعة صغيرة مع تفاعل ممتع
                    </p>
                    <p className="text-success-600 font-semibold">
                      <RiyalPrice amount={25} /> / الساعة
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">ما ستحصل عليه</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-text-secondary arabic-text">حصة كاملة 60 دقيقة</span>
                  </li>
                  <li className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-text-secondary arabic-text">مواد تعليمية مجانية</span>
                  </li>
                  <li className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-text-secondary arabic-text">متابعة شخصية</span>
                  </li>
                  <li className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-text-secondary arabic-text">تسجيل الحصة</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {!hasEnoughCredits && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 arabic-text">كيفية الحصول على رصيد</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-red-600 arabic-text">
                    <li>• ادع أصدقاءك واحصل على رصيد مجاني</li>
                    <li>• اشترك في الباقات الشهرية</li>
                    <li>• تواصل معنا لمعرفة العروض الحالية</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 arabic-text"
                    onClick={() => navigate('/dashboard/student')}
                  >
                    العودة للوحة التحكم
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
