import { useEffect, useState } from 'react'
import { toArabicNumerals } from '../lib/formatters'

interface ClassCountdownProps {
  targetDate: Date | string
  onComplete?: () => void
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

/**
 * ClassCountdown component displays a countdown timer for upcoming classes
 * Uses Arabic text and numerals for display
 */
export function ClassCountdown({ 
  targetDate, 
  onComplete, 
  className = '' 
}: ClassCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(targetDate)
  )

  useEffect(() => {
    // Calculate initial time remaining
    const initialTime = calculateTimeRemaining(targetDate)
    setTimeRemaining(initialTime)

    // If already completed, call onComplete immediately
    if (initialTime.total <= 0 && onComplete) {
      onComplete()
      return
    }

    // Update countdown every second
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining(targetDate)
      setTimeRemaining(remaining)

      // Call onComplete when countdown reaches zero
      if (remaining.total <= 0) {
        clearInterval(intervalId)
        if (onComplete) {
          onComplete()
        }
      }
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [targetDate, onComplete])

  // If countdown is complete, show completion message
  if (timeRemaining.total <= 0) {
    return (
      <div className={`text-center ${className}`} dir="rtl">
        <p className="text-lg font-semibold text-primary-600 text-right">
          حان وقت الحصة!
        </p>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`} dir="rtl">
      <p className="text-sm text-gray-600 mb-2 text-right">الوقت المتبقي للحصة القادمة</p>
      <div className="flex justify-center gap-4 flex-wrap flex-row-reverse">
        {timeRemaining.days > 0 && (
          <TimeUnit value={timeRemaining.days} label="يوم" />
        )}
        <TimeUnit value={timeRemaining.hours} label="ساعة" />
        <TimeUnit value={timeRemaining.minutes} label="دقيقة" />
        <TimeUnit value={timeRemaining.seconds} label="ثانية" />
      </div>
    </div>
  )
}

/**
 * TimeUnit component displays a single time unit (days, hours, minutes, seconds)
 */
function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center" dir="rtl">
      <span className="text-2xl font-bold text-primary-600">
        {toArabicNumerals(value)}
      </span>
      <span className="text-xs text-gray-500 text-center">{label}</span>
    </div>
  )
}

/**
 * Calculate time remaining until target date
 * @param targetDate - The target date/time
 * @returns Object with days, hours, minutes, seconds, and total milliseconds
 */
function calculateTimeRemaining(targetDate: Date | string): TimeRemaining {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const now = new Date()
  const total = target.getTime() - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}
