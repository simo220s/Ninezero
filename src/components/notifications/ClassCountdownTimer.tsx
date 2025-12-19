/**
 * Class Countdown Timer Component
 * 
 * Displays real-time countdown for upcoming classes
 * Requirements: 14.1 - Real-time class countdown timers
 */

import { useClassCountdown, formatCountdownDisplay, getCountdownColor, getCountdownBadgeVariant } from '@/lib/services/countdown-timer'
import { Clock, Calendar, Video } from 'lucide-react'

interface ClassCountdownTimerProps {
  classDate: Date
  classTime: string
  studentName?: string
  meetingLink?: string
  showDetails?: boolean
  compact?: boolean
  language?: 'ar' | 'en'
}

export default function ClassCountdownTimer({
  classDate,
  classTime,
  studentName,
  meetingLink,
  showDetails = false,
  compact = false,
  language = 'ar',
}: ClassCountdownTimerProps) {
  const countdown = useClassCountdown(classDate, classTime)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${getCountdownColor(countdown)}`} />
        <span className={`text-sm ${getCountdownColor(countdown)}`}>
          {formatCountdownDisplay(countdown, language)}
        </span>
      </div>
    )
  }

  const getBadgeStyles = () => {
    const variant = getCountdownBadgeVariant(countdown)
    switch (variant) {
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      {studentName && (
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900 arabic-text">
            حصة مع {studentName}
          </h3>
        </div>
      )}

      {/* Countdown Display */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getBadgeStyles()}`}>
        <Clock className="w-5 h-5" />
        <span className="font-semibold arabic-text">
          {formatCountdownDisplay(countdown, language)}
        </span>
      </div>

      {/* Detailed Countdown */}
      {showDetails && !countdown.hasStarted && countdown.totalSeconds > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {/* Days */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{countdown.days}</div>
            <div className="text-xs text-gray-600 arabic-text">يوم</div>
          </div>

          {/* Hours */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{countdown.hours}</div>
            <div className="text-xs text-gray-600 arabic-text">ساعة</div>
          </div>

          {/* Minutes */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{countdown.minutes}</div>
            <div className="text-xs text-gray-600 arabic-text">دقيقة</div>
          </div>

          {/* Seconds */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{countdown.seconds}</div>
            <div className="text-xs text-gray-600 arabic-text">ثانية</div>
          </div>
        </div>
      )}

      {/* Meeting Link */}
      {meetingLink && countdown.isStartingSoon && (
        <div className="mt-4">
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors animate-pulse"
          >
            <Video className="w-5 h-5" />
            <span className="arabic-text">انضم للحصة الآن</span>
          </a>
        </div>
      )}

      {/* Class Started Message */}
      {countdown.hasStarted && meetingLink && (
        <div className="mt-4">
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Video className="w-5 h-5" />
            <span className="arabic-text">انضم للحصة</span>
          </a>
        </div>
      )}

      {/* Class Info */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 arabic-text">التاريخ:</span>
            <span className="text-gray-900 font-medium" dir="ltr">
              {classDate.toLocaleDateString('ar-SA')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 arabic-text">الوقت:</span>
            <span className="text-gray-900 font-medium" dir="ltr">
              {classTime}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact countdown badge for lists
 */
export function CountdownBadge({
  classDate,
  classTime,
  language = 'ar',
}: {
  classDate: Date
  classTime: string
  language?: 'ar' | 'en'
}) {
  const countdown = useClassCountdown(classDate, classTime)
  const variant = getCountdownBadgeVariant(countdown)

  const getBadgeStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getBadgeStyles()}`}>
      <Clock className="w-3 h-3" />
      {formatCountdownDisplay(countdown, language)}
    </span>
  )
}

/**
 * Countdown timer for today's schedule
 */
export function TodayScheduleCountdown({
  classes,
}: {
  classes: Array<{
    id: string
    date: Date
    time: string
    studentName: string
    meetingLink: string
  }>
}) {
  // Filter classes for today
  const today = new Date().toDateString()
  const todayClasses = classes.filter(cls => cls.date.toDateString() === today)

  if (todayClasses.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 arabic-text">لا توجد حصص اليوم</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todayClasses.map(cls => (
        <ClassCountdownTimer
          key={cls.id}
          classDate={cls.date}
          classTime={cls.time}
          studentName={cls.studentName}
          meetingLink={cls.meetingLink}
          showDetails={true}
        />
      ))}
    </div>
  )
}
