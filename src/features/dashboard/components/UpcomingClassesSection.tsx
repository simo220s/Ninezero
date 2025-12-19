import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, MapPin } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meeting_link?: string
  meetingLink?: string // Support both formats
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
}

interface UpcomingClassesSectionProps {
  classes: ClassSession[]
  loading?: boolean
}

export default function UpcomingClassesSection({ classes, loading }: UpcomingClassesSectionProps) {
  // Filter and sort upcoming classes (next 7 days)
  const upcomingClasses = useMemo(() => {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return classes
      .filter(cls => {
        if (cls.status !== 'scheduled') return false
        const classDateTime = new Date(`${cls.date}T${cls.time}`)
        return classDateTime >= now && classDateTime <= sevenDaysFromNow
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 3) // Show only next 3 classes
  }, [classes])

  // Check if class can be joined (10 minutes before)
  const canJoinClass = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 10 && diffMinutes > -60
  }

  // Get time until class
  const getTimeUntilClass = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diffMs = classDateTime.getTime() - now.getTime()
    
    if (diffMs < 0) return 'الآن'
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `بعد ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`
    if (diffHours > 0) return `بعد ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`
    if (diffMinutes > 0) return `بعد ${diffMinutes} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`
    return 'الآن'
  }

  if (loading) {
    return (
      <Card dir="rtl">
        <CardHeader dir="rtl">
          <CardTitle className="arabic-text flex items-center gap-2 flex-row-reverse text-right">
            الحصص القادمة
            <Calendar className="w-5 h-5" />
          </CardTitle>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (upcomingClasses.length === 0) {
    return (
      <Card dir="rtl">
        <CardHeader dir="rtl">
          <CardTitle className="arabic-text flex items-center gap-2 flex-row-reverse text-right">
            الحصص القادمة
            <Calendar className="w-5 h-5" />
          </CardTitle>
        </CardHeader>
        <CardContent dir="rtl">
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="لا توجد حصص قادمة"
            description="لم يتم جدولة أي حصص خلال الأيام السبعة القادمة"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary-200 shadow-lg" dir="rtl">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100" dir="rtl">
        <CardTitle className="arabic-text flex items-center gap-2 flex-row-reverse text-primary-900 text-right">
          <span className="text-sm font-normal text-primary-700">
            ({upcomingClasses.length} {upcomingClasses.length === 1 ? 'حصة' : 'حصص'})
          </span>
          الحصص القادمة
          <Calendar className="w-5 h-5" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6" dir="rtl">
        <div className="space-y-4">
          {upcomingClasses.map((classSession, index) => {
            const canJoin = canJoinClass(classSession.date, classSession.time)
            const timeUntil = getTimeUntilClass(classSession.date, classSession.time)
            const isNext = index === 0
            const meetingLink = classSession.meeting_link || classSession.meetingLink

            return (
              <div
                key={classSession.id}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
                  ${isNext 
                    ? 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-300 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-primary-200 hover:shadow-sm'
                  }
                `}
                dir="rtl"
              >
                {/* Next Class Badge */}
                {isNext && (
                  <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold arabic-text shadow-sm">
                    الحصة القادمة
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" dir="rtl">
                  {/* Class Info */}
                  <div className="flex-1 space-y-3 w-full sm:w-auto" dir="rtl">
                    {/* Date and Time */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4" dir="rtl">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <div className="text-right">
                          <p className={`font-semibold arabic-text ${isNext ? 'text-primary-900' : 'text-gray-900'} text-right`}>
                            {new Date(classSession.date).toLocaleDateString('ar-SA', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className={`text-sm arabic-text ${isNext ? 'text-primary-700' : 'text-gray-600'} text-right`}>
                            {timeUntil}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg ${isNext ? 'bg-primary-200' : 'bg-gray-100'}`}>
                          <Calendar className={`w-5 h-5 ${isNext ? 'text-primary-700' : 'text-gray-600'}`} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-row-reverse">
                        <div className="text-right">
                          <p className={`font-semibold ${isNext ? 'text-primary-900' : 'text-gray-900'} text-right`}>
                            {classSession.time}
                          </p>
                          <p className={`text-sm arabic-text ${isNext ? 'text-primary-700' : 'text-gray-600'} text-right`}>
                            {classSession.duration} دقيقة
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg ${isNext ? 'bg-primary-200' : 'bg-gray-100'}`}>
                          <Clock className={`w-5 h-5 ${isNext ? 'text-primary-700' : 'text-gray-600'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Meeting Link Status */}
                    {meetingLink && (
                      <div className="flex items-center gap-2 flex-row-reverse text-right">
                        <span className={`text-sm arabic-text ${isNext ? 'text-primary-700' : 'text-gray-600'} text-right`}>
                          {canJoin ? 'جاهز للانضمام' : 'سيتم تفعيل الرابط قبل الحصة بـ 10 دقائق'}
                        </span>
                        <MapPin className={`w-4 h-4 ${isNext ? 'text-primary-600' : 'text-gray-500'}`} />
                      </div>
                    )}
                  </div>

                  {/* Join Button */}
                  {meetingLink && (
                    <Button
                      size={isNext ? 'md' : 'sm'}
                      disabled={!canJoin}
                      onClick={() => window.open(meetingLink, '_blank')}
                      className={`
                        arabic-text w-full sm:w-auto min-h-[44px]
                        ${isNext 
                          ? 'bg-primary-600 hover:bg-primary-700 shadow-lg' 
                          : ''
                        }
                        ${!canJoin ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <span className="flex items-center gap-2 flex-row-reverse">
                        {canJoin ? 'الانضمام الآن' : 'قريباً'}
                        <Video className="w-4 h-4" />
                      </span>
                    </Button>
                  )}
                </div>

                {/* Countdown for next class */}
                {isNext && canJoin && (
                  <div className="mt-4 pt-4 border-t border-primary-200" dir="rtl">
                    <div className="flex items-center justify-center gap-2 text-primary-700 flex-row-reverse">
                      <span className="text-sm font-semibold arabic-text text-right">
                        الحصة جاهزة - يمكنك الانضمام الآن!
                      </span>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* View All Link */}
        {classes.length > 3 && (
          <div className="mt-6 text-center" dir="rtl">
            <Button variant="outline" className="arabic-text" asChild>
              <a href="#all-classes">
                عرض جميع الحصص ({classes.length})
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
