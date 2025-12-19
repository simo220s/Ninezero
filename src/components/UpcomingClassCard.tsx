import { ClassCountdown } from './ClassCountdown'
import { formatDate, formatTime } from '@/lib/formatters'
import { Button } from './ui/button'

export interface ClassInfo {
  id: string
  title?: string
  start_time: string
  duration: number
  google_meet_link?: string
  teacher_name?: string
  status?: string
  type?: string
}

interface UpcomingClassCardProps {
  classInfo: ClassInfo
  showCountdown?: boolean
  className?: string
  onCancel?: (id: string) => void
  onReschedule?: (id: string) => void
}

export function UpcomingClassCard({
  classInfo,
  showCountdown = true,
  className = '',
  onCancel,
  onReschedule
}: UpcomingClassCardProps) {
  const isUpcoming = new Date(classInfo.start_time) > new Date()

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {classInfo.title || 'حصة اللغة الإنجليزية'}
          </h3>
          
          {/* Type Badge */}
          {classInfo.type && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
              classInfo.type === 'trial' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-primary-100 text-primary-700'
            }`}>
              {classInfo.type === 'trial' ? 'جلسة تجريبية' : 'حصة منتظمة'}
            </span>
          )}
        </div>
      </div>

      {/* Class Details */}
      <div className="space-y-3 mb-4">
        {/* Date */}
        <div className="flex items-center gap-3 text-gray-700">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(classInfo.start_time)}</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3 text-gray-700">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(classInfo.start_time)}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-3 text-gray-700">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>المدة: {classInfo.duration} دقيقة</span>
        </div>

        {/* Teacher */}
        {classInfo.teacher_name && (
          <div className="flex items-center gap-3 text-gray-700">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{classInfo.teacher_name}</span>
          </div>
        )}
      </div>

      {/* Countdown */}
      {showCountdown && isUpcoming && (
        <div className="mb-4">
          <ClassCountdown targetDate={classInfo.start_time} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {classInfo.google_meet_link && isUpcoming && (
          <Button
            asChild
            className="flex-1"
          >
            <a href={classInfo.google_meet_link} target="_blank" rel="noopener noreferrer">
              انضم للحصة
            </a>
          </Button>
        )}
        
        {isUpcoming && onReschedule && (
          <Button
            variant="outline"
            onClick={() => onReschedule(classInfo.id)}
            className="flex-1"
          >
            إعادة جدولة
          </Button>
        )}
        
        {isUpcoming && onCancel && (
          <Button
            variant="outline"
            onClick={() => onCancel(classInfo.id)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            إلغاء
          </Button>
        )}
        
        {!isUpcoming && (
          <Button
            variant="outline"
            disabled
            className="flex-1"
          >
            الحصة انتهت
          </Button>
        )}
      </div>
    </div>
  )
}
