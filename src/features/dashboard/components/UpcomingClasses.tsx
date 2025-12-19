import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getUserAppointments } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Link } from 'react-router-dom'
import type { ClassSession } from '@/types'
import { RTLArrow } from '@/components/RTLArrow'
import { UpcomingClassCard, type ClassInfo } from '@/components/UpcomingClassCard'

export default function UpcomingClasses() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadClasses()
    }
  }, [user])

  const loadClasses = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await getUserAppointments(user.id)
      
      if (error) {
        setError('حدث خطأ في تحميل الحصص')
        logger.error('Error loading classes:', error)
      } else {
        // Filter upcoming classes (future dates)
        const upcomingClasses = (data || [])
          .filter(cls => new Date(cls.appointment_date) > new Date())
          .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        
        setClasses(upcomingClasses)
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      logger.error('Classes loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!user) return

    if (confirm('هل أنت متأكد من إلغاء هذه الحصة؟')) {
      try {
        // Update appointment status to cancelled
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appointmentId)
        if (updateError) throw updateError

        // Refund credit for regular appointments
        const { data: appointment } = await supabase
          .from('appointments')
          .select('appointment_type')
          .eq('id', appointmentId)
          .single()

        if (appointment?.appointment_type === 'regular') {
          const { error: creditError } = await supabase.rpc('add_credits', {
            user_id: user.id,
            amount: 1.0
          })
          if (creditError) throw creditError
        }

        // Reload classes to reflect the change
        loadClasses()
        alert('تم إلغاء الحصة بنجاح')
      } catch (error) {
        logger.error('Error cancelling appointment:', error)
        alert('حدث خطأ في إلغاء الحصة')
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">الحصص القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">الحصص القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 arabic-text mb-4">{error}</p>
            <Button onClick={loadClasses} variant="outline" size="sm" className="arabic-text">
              المحاولة مرة أخرى
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="arabic-text flex items-center">
            <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            الحصص القادمة ({classes.length})
          </CardTitle>
          <Button asChild size="sm" className="arabic-text">
            <Link to="/book-regular" className="flex items-center gap-2">
              <RTLArrow direction="forward" size={16} />
              احجز حصة جديدة
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-text-secondary arabic-text mb-4">
              لا توجد حصص مجدولة حالياً
            </p>
            <p className="text-sm text-text-secondary arabic-text mb-6">
              احجز حصتك الأولى الآن وابدأ رحلة تعلم الإنجليزية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="arabic-text">
                <Link to="/book-trial" className="flex items-center gap-2">
                  <RTLArrow direction="forward" size={20} />
                  احجز جلسة تجريبية مجانية
                </Link>
              </Button>
              <Button asChild variant="outline" className="arabic-text">
                <Link to="/book-regular" className="flex items-center gap-2">
                  <RTLArrow direction="forward" size={20} />
                  احجز حصة منتظمة
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => {
              const classInfo: ClassInfo = {
                id: cls.id,
                title: 'حصة مع الأستاذ أحمد',
                start_time: cls.appointmentDate.toISOString(),
                duration: cls.duration,
                google_meet_link: undefined,
                teacher_name: 'الأستاذ أحمد',
                status: cls.status,
                type: cls.appointmentType
              }

              return (
                <UpcomingClassCard
                  key={cls.id}
                  classInfo={classInfo}
                  showCountdown={true}
                  onCancel={handleCancelAppointment}
                />
              )
            })}
            
            {/* Show more button if there are many classes */}
            {classes.length > 3 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" className="arabic-text">
                  عرض جميع الحصص
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
