/**
 * Enhanced Class Countdown Timer Component
 * 
 * Shows countdown to upcoming classes with:
 * - Real-time updates
 * - Arabic time format
 * - Visual indicators (urgent, soon, scheduled)
 * - Auto-refresh when time expires
 * 
 * High Priority Task 3: Enhance and Integrate Class Countdown Timers
 */

import { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { logger } from '@/lib/logger'

export interface ClassInfo {
  id: string
  title: string
  student_name: string
  start_time: string // ISO format
  duration: number // in minutes
  meeting_link?: string
}

export interface ClassCountdownTimerProps {
  classInfo: ClassInfo
  onExpired?: () => void
  showDetails?: boolean
  compact?: boolean
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

export default function ClassCountdownTimer({
  classInfo,
  onExpired,
  showDetails = true,
  compact = false,
}: ClassCountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)
  const [isSoon, setIsSoon] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const classTime = new Date(classInfo.start_time).getTime()
      const diff = classTime - now

      if (diff <= 0) {
        // Class has started or passed
        if (timeRemaining && timeRemaining.totalSeconds > 0) {
          // Just expired
          logger.log('Class countdown expired:', classInfo.id)
          onExpired?.()
        }
        setTimeRemaining(null)
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      const days = Math.floor(totalSeconds / (24 * 3600))
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      setTimeRemaining({ days, hours, minutes, seconds, totalSeconds })

      // Set urgency levels
      setIsUrgent(totalSeconds <= 300) // Less than 5 minutes
      setIsSoon(totalSeconds <= 3600) // Less than 1 hour
    }

    // Initial calculation
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [classInfo.start_time, classInfo.id, onExpired])

  if (!timeRemaining) {
    return null // Class has started or expired
  }

  const formatTimeUnit = (value: number, label: string): string => {
    return `${value} ${label}`
  }

  const getTimeDisplay = (): string => {
    const { days, hours, minutes, seconds } = timeRemaining

    if (days > 0) {
      return `${formatTimeUnit(days, 'يوم')} ${formatTimeUnit(hours, 'ساعة')}`
    }
    if (hours > 0) {
      return `${formatTimeUnit(hours, 'ساعة')} ${formatTimeUnit(minutes, 'دقيقة')}`
    }
    if (minutes > 0) {
      return `${formatTimeUnit(minutes, 'دقيقة')} ${formatTimeUnit(seconds, 'ثانية')}`
    }
    return `${formatTimeUnit(seconds, 'ثانية')}`
  }

  const getStatusColor = (): string => {
    if (isUrgent) return 'text-red-600 bg-red-50'
    if (isSoon) return 'text-orange-600 bg-orange-50'
    return 'text-blue-600 bg-blue-50'
  }

  const getStatusIcon = () => {
    if (isUrgent) return <AlertCircle className="w-4 h-4 text-red-600" />
    return <Clock className="w-4 h-4" />
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="arabic-text">{getTimeDisplay()}</span>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${isUrgent ? 'border-red-300 bg-red-50' : isSoon ? 'border-orange-300 bg-orange-50' : 'border-blue-300 bg-blue-50'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1">
          {showDetails && (
            <>
              <h3 className="arabic-text font-semibold text-gray-900 mb-1">
                {classInfo.title}
              </h3>
              <p className="arabic-text text-sm text-gray-600 mb-2">
                مع {classInfo.student_name}
              </p>
            </>
          )}
          
          <div className="flex items-center gap-2">
            <span className="arabic-text text-xs text-gray-500">
              {isUrgent ? 'يبدأ خلال:' : isSoon ? 'يبدأ قريباً:' : 'يبدأ بعد:'}
            </span>
            <span className={`arabic-text font-bold ${isUrgent ? 'text-red-700' : isSoon ? 'text-orange-700' : 'text-blue-700'}`}>
              {getTimeDisplay()}
            </span>
          </div>

          {isUrgent && classInfo.meeting_link && (
            <a
              href={classInfo.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span className="arabic-text">الانضمام الآن</span>
            </a>
          )}
        </div>
      </div>

      {isUrgent && (
        <div className="mt-2 pt-2 border-t border-red-200">
          <p className="text-xs text-red-700 arabic-text flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            تذكير: الحصة ستبدأ خلال {timeRemaining.minutes} دقيقة!
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Compact timer for use in lists
 */
export function CompactCountdownTimer({ classInfo }: { classInfo: ClassInfo }) {
  return <ClassCountdownTimer classInfo={classInfo} compact showDetails={false} />
}

/**
 * Timer with alert for imminent classes
 */
export function UrgentClassTimer({ classInfo, onJoinClass }: { 
  classInfo: ClassInfo
  onJoinClass?: () => void 
}) {
  return (
    <ClassCountdownTimer 
      classInfo={classInfo} 
      onExpired={() => {
        logger.log('Class started:', classInfo.id)
        onJoinClass?.()
      }}
    />
  )
}

