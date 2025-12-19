import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatDate, formatTime } from '@/lib/formatters'

interface ClassSession {
  id: string
  student_name: string
  student_email: string
  appointment_type: 'trial' | 'regular'
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
  appointment_date: string
  duration: number
  notes?: string
}

export default function ClassSchedule() {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      // In real app, this would fetch from the database
      const mockSessions: ClassSession[] = [
        {
          id: '1',
          student_name: 'عبدالله أحمد',
          student_email: 'abdullah@example.com',
          appointment_type: 'regular',
          status: 'scheduled',
          appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration: 60,
          notes: 'مراجعة القواعد الأساسية'
        },
        {
          id: '2',
          student_name: 'فاطمة محمد',
          student_email: 'fatima@example.com',
          appointment_type: 'trial',
          status: 'scheduled',
          appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          duration: 25,
          notes: 'جلسة تقييم أولية'
        },
        {
          id: '3',
          student_name: 'محمد علي',
          student_email: 'mohammed@example.com',
          appointment_type: 'regular',
          status: 'completed',
          appointment_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          duration: 60,
          notes: 'ممتاز في المحادثة'
        }
      ]
      
      setSessions(mockSessions)
    } catch (err) {
      setError('حدث خطأ في تحميل جدول الحصص')
      logger.error('Sessions loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-600'
      case 'in_progress':
        return 'bg-green-100 text-green-600'
      case 'completed':
        return 'bg-gray-100 text-gray-600'
      case 'cancelled':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدولة'
      case 'in_progress':
        return 'جارية'
      case 'completed':
        return 'مكتملة'
      case 'cancelled':
        return 'ملغية'
      default:
        return 'غير محدد'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'trial' ? 'bg-yellow-100 text-yellow-600' : 'bg-primary-100 text-primary-600'
  }

  const getTypeText = (type: string) => {
    return type === 'trial' ? 'تجريبية' : 'منتظمة'
  }

  const markAsCompleted = async (sessionId: string) => {
    try {
      // Import the completeLesson function dynamically to avoid circular imports
      const { completeLesson } = await import('@/lib/database')
      
      const { error } = await completeLesson(sessionId)
      if (error) {
        logger.error('Error completing lesson:', error)
        alert('حدث خطأ في إنهاء الحصة')
      } else {
        // Update local state
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'completed' as const }
            : session
        ))
        alert('تم إنهاء الحصة بنجاح وتم معالجة مكافآت الإحالة')
      }
    } catch (error) {
      logger.error('Error completing lesson:', error)
      alert('حدث خطأ غير متوقع')
    }
  }

  const markAsInProgress = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'in_progress' as const }
        : session
    ))
  }

  const cancelSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'cancelled' as const }
        : session
    ))
  }

  const getUpcomingSessions = () => {
    return sessions
      .filter(session => new Date(session.appointment_date) > new Date() && session.status === 'scheduled')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
  }

  const getTodaySessions = () => {
    const today = new Date()
    return sessions.filter(session => {
      const sessionDate = new Date(session.appointment_date)
      return sessionDate.toDateString() === today.toDateString()
    })
  }



  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">جدول الحصص</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-text-secondary arabic-text">جاري تحميل جدول الحصص...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">جدول الحصص</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 arabic-text mb-4">{error}</p>
            <Button onClick={loadSessions} variant="outline" className="arabic-text">
              المحاولة مرة أخرى
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const upcomingSessions = getUpcomingSessions()
  const todaySessions = getTodaySessions()

  return (
    <div className="space-y-6">
      {/* Today's Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="arabic-text flex items-center">
              <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              حصص اليوم ({todaySessions.length})
            </CardTitle>
            <Button size="sm" className="arabic-text" onClick={() => alert('ميزة جدولة الحصص قيد التطوير. يرجى استخدام نظام الحجز الحالي.')}>
              إضافة حصة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-text-secondary arabic-text">لا توجد حصص مجدولة اليوم</p>
              <p className="text-sm text-text-secondary arabic-text mt-1">استمتع بيومك!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySessions.map((session) => (
                <div key={session.id} className="border border-border-light rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <h4 className="font-semibold text-text-primary arabic-text">
                          {session.student_name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(session.appointment_type)}`}>
                          {getTypeText(session.appointment_type)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-text-secondary">
                        <span className="arabic-text">{formatTime(session.appointment_date)}</span>
                        <span className="arabic-text">{session.duration} دقيقة</span>
                        <span>{session.student_email}</span>
                      </div>
                      
                      {session.notes && (
                        <p className="text-sm text-text-secondary arabic-text mt-2">
                          📝 {session.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {session.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => markAsInProgress(session.id)}
                            className="arabic-text"
                          >
                            بدء الحصة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelSession(session.id)}
                            className="arabic-text text-red-600 border-red-200 hover:bg-red-50"
                          >
                            إلغاء
                          </Button>
                        </>
                      )}
                      
                      {session.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => markAsCompleted(session.id)}
                          className="arabic-text"
                        >
                          إنهاء الحصة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text flex items-center">
            <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            الحصص القادمة ({upcomingSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-text-secondary arabic-text">لا توجد حصص مجدولة قادمة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="border border-border-light rounded-lg p-4 hover:shadow-custom-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <h4 className="font-semibold text-text-primary arabic-text">
                          {session.student_name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(session.appointment_type)}`}>
                          {getTypeText(session.appointment_type)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-text-secondary">
                        <div className="flex items-center space-x-2 space-x-reverse arabic-text">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(session.appointment_date)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse arabic-text">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(session.appointment_date)} ({session.duration} دقيقة)</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span>{session.student_email}</span>
                        </div>
                        
                        {session.notes && (
                          <div className="flex items-start space-x-2 space-x-reverse arabic-text">
                            <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{session.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button size="sm" variant="outline" className="arabic-text">
                        تعديل
                      </Button>
                      <Button size="sm" variant="outline" className="arabic-text">
                        إرسال تذكير
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingSessions.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" className="arabic-text">
                    عرض جميع الحصص القادمة
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {sessions.filter(s => s.status === 'scheduled').length}
            </div>
            <p className="text-blue-600 text-sm arabic-text">حصص مجدولة</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <p className="text-green-600 text-sm arabic-text">حصص مكتملة</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {sessions.filter(s => s.appointment_type === 'trial').length}
            </div>
            <p className="text-yellow-600 text-sm arabic-text">جلسات تجريبية</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
