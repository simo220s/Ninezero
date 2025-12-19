import { Calendar, Clock, Video, User, AlarmClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import ClassDetailsModal from '../ClassDetailsModal'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meeting_link?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  teacher_name?: string
  subject?: string
}

interface UpcomingClassCardProps {
  classes: ClassSession[]
  studentId?: string
}

export default function UpcomingClassCard({ classes, studentId }: UpcomingClassCardProps) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  
  // Find the next upcoming class
  const upcomingClass = classes
    .filter(c => c.status === 'scheduled')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })[0]

  if (!upcomingClass) {
    return (
      <Card className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-3xl">
        <div className="text-right py-8">
          <Calendar className="h-12 w-12 text-gray-400 ms-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 arabic-text mb-2 text-right">
            لا توجد حصص قادمة
          </h3>
          <p className="text-gray-500 arabic-text mb-4 text-right">
            احجز حصتك القادمة الآن
          </p>
          <div className="flex justify-end">
            <Button asChild className="arabic-text">
              <Link to="/book-regular">حجز حصة جديدة</Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const classDate = new Date(`${upcomingClass.date}T${upcomingClass.time}`)
  const formattedDate = classDate.toLocaleDateString('ar-SA', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const formattedTime = classDate.toLocaleTimeString('ar-SA', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  // Calculate time remaining
  const now = new Date()
  const timeRemaining = classDate.getTime() - now.getTime()
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  let timeRemainingText = ''
  if (hoursRemaining > 24) {
    const daysRemaining = Math.floor(hoursRemaining / 24)
    timeRemainingText = `باقي ${daysRemaining} يوم`
  } else if (hoursRemaining > 0) {
    timeRemainingText = `باقي ${hoursRemaining} ساعة`
  } else if (minutesRemaining > 0) {
    timeRemainingText = `باقي ${minutesRemaining} دقيقة`
  } else {
    timeRemainingText = 'الحصة الآن!'
  }

  const handleJoinClass = () => {
    if (upcomingClass.meeting_link) {
      window.open(upcomingClass.meeting_link, '_blank')
    }
  }

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 rounded-3xl" dir="rtl">
      <div className="flex items-start justify-between mb-4 flex-row-reverse" dir="rtl">
        <div className="text-right flex-1" dir="rtl">
          <Badge className="bg-blue-500 hover:bg-blue-600 mb-2 arabic-text">الحصة الجاية</Badge>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 arabic-text text-right">
            {upcomingClass.subject || 'درس اللغة العربية'}
          </h2>
          <div className="flex items-center gap-2 text-gray-600 justify-end flex-row-reverse" dir="rtl">
            <span className="arabic-text">{upcomingClass.teacher_name || 'أ. أحمد'}</span>
            <User className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm">
          <Video className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
        </div>
      </div>

      <div className="space-y-3 mb-6" dir="rtl">
        <div className="flex items-center gap-3 text-gray-700 justify-end flex-row-reverse" dir="rtl">
          <span className="arabic-text text-right">{formattedDate}</span>
          <div className="bg-white rounded-xl p-2 shadow-sm">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-700 justify-end flex-row-reverse" dir="rtl">
          <span className="arabic-text text-right">{formattedTime} • {upcomingClass.duration} دقيقة</span>
          <div className="bg-white rounded-xl p-2 shadow-sm">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-row-reverse" dir="rtl">
        {upcomingClass.meeting_link && (
          <Button 
            onClick={handleJoinClass}
            className="flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center"
          >
            <span className="arabic-text flex items-center gap-2 flex-row-reverse">
              <Video className="h-4 w-4" />
              <span>ادخل الحصة</span>
            </span>
          </Button>
        )}
        <Button 
          onClick={() => setIsDetailsModalOpen(true)}
          variant="outline" 
          className="rounded-2xl border-blue-300 hover:bg-white active:scale-95 transition-all h-12 flex items-center justify-center text-blue-600 hover:text-blue-700"
        >
          <span className="arabic-text font-semibold">التفاصيل</span>
        </Button>
      </div>

      {/* Time remaining indicator */}
      <div className="mt-4 pt-4 border-t border-blue-200" dir="rtl">
        <p className="text-right text-blue-700 arabic-text font-medium flex items-center justify-end gap-2">
          <span>{timeRemainingText}</span>
          <AlarmClock className="w-5 h-5 animate-pulse text-orange-500" />
        </p>
      </div>

      {/* Class Details Modal */}
      {upcomingClass && (
        <ClassDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onSuccess={() => {
            setIsDetailsModalOpen(false)
            // Refresh data if needed
          }}
          classData={{
            id: upcomingClass.id,
            date: upcomingClass.date,
            time: upcomingClass.time,
            duration: upcomingClass.duration,
            meeting_link: upcomingClass.meeting_link,
            status: upcomingClass.status,
            student_id: studentId || upcomingClass.id
          }}
          userRole="student"
        />
      )}
    </Card>
  )
}
