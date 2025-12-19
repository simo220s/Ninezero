/**
 * Real-time Class Countdown Timer Service
 * 
 * Provides real-time countdown functionality for upcoming classes
 * Requirements: 14.1 - Real-time class countdown timers
 */

import { useState, useEffect } from 'react'

export interface ClassCountdown {
  classId: string
  classDate: Date
  classTime: string
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isStartingSoon: boolean // Within 15 minutes
  isToday: boolean
  hasStarted: boolean
  formattedTime: string
}

/**
 * Calculate countdown for a class
 */
export function calculateCountdown(classDate: Date, classTime: string): ClassCountdown {
  const now = new Date()
  const classDateTime = new Date(`${classDate.toISOString().split('T')[0]}T${classTime}`)
  
  const diff = classDateTime.getTime() - now.getTime()
  const totalSeconds = Math.floor(diff / 1000)
  
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60
  
  const isStartingSoon = totalSeconds > 0 && totalSeconds <= 15 * 60 // 15 minutes
  const isToday = days === 0 && totalSeconds > 0
  const hasStarted = totalSeconds <= 0
  
  let formattedTime = ''
  if (hasStarted) {
    formattedTime = 'بدأت الحصة'
  } else if (isStartingSoon) {
    formattedTime = `تبدأ خلال ${minutes} دقيقة`
  } else if (isToday) {
    formattedTime = `اليوم الساعة ${classTime}`
  } else if (days === 1) {
    formattedTime = `غداً الساعة ${classTime}`
  } else {
    formattedTime = `خلال ${days} يوم`
  }
  
  return {
    classId: '',
    classDate,
    classTime,
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalSeconds: Math.max(0, totalSeconds),
    isStartingSoon,
    isToday,
    hasStarted,
    formattedTime,
  }
}

/**
 * React hook for real-time countdown
 */
export function useClassCountdown(classDate: Date, classTime: string): ClassCountdown {
  const [countdown, setCountdown] = useState<ClassCountdown>(() =>
    calculateCountdown(classDate, classTime)
  )

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(classDate, classTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [classDate, classTime])

  return countdown
}

/**
 * React hook for multiple class countdowns
 */
export function useMultipleClassCountdowns(
  classes: Array<{ id: string; date: Date; time: string }>
): Map<string, ClassCountdown> {
  const [countdowns, setCountdowns] = useState<Map<string, ClassCountdown>>(new Map())

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns = new Map<string, ClassCountdown>()
      
      classes.forEach(cls => {
        const countdown = calculateCountdown(cls.date, cls.time)
        countdown.classId = cls.id
        newCountdowns.set(cls.id, countdown)
      })
      
      setCountdowns(newCountdowns)
    }

    // Initial update
    updateCountdowns()

    // Update every second
    const interval = setInterval(updateCountdowns, 1000)

    return () => clearInterval(interval)
  }, [classes])

  return countdowns
}

/**
 * Format countdown for display
 */
export function formatCountdownDisplay(countdown: ClassCountdown, language: 'ar' | 'en' = 'ar'): string {
  if (countdown.hasStarted) {
    return language === 'ar' ? 'بدأت الحصة' : 'Class Started'
  }

  if (countdown.isStartingSoon) {
    return language === 'ar' 
      ? `تبدأ خلال ${countdown.minutes}:${countdown.seconds.toString().padStart(2, '0')}`
      : `Starts in ${countdown.minutes}:${countdown.seconds.toString().padStart(2, '0')}`
  }

  if (countdown.isToday) {
    return language === 'ar'
      ? `اليوم - ${countdown.hours}س ${countdown.minutes}د`
      : `Today - ${countdown.hours}h ${countdown.minutes}m`
  }

  if (countdown.days === 1) {
    return language === 'ar' ? 'غداً' : 'Tomorrow'
  }

  return language === 'ar'
    ? `خلال ${countdown.days} يوم`
    : `In ${countdown.days} days`
}

/**
 * Get countdown color based on urgency
 */
export function getCountdownColor(countdown: ClassCountdown): string {
  if (countdown.hasStarted) {
    return 'text-gray-500'
  }
  
  if (countdown.isStartingSoon) {
    return 'text-red-600 font-bold animate-pulse'
  }
  
  if (countdown.isToday) {
    return 'text-orange-600 font-semibold'
  }
  
  return 'text-blue-600'
}

/**
 * Get countdown badge variant
 */
export function getCountdownBadgeVariant(countdown: ClassCountdown): 'danger' | 'warning' | 'info' | 'default' {
  if (countdown.hasStarted) {
    return 'default'
  }
  
  if (countdown.isStartingSoon) {
    return 'danger'
  }
  
  if (countdown.isToday) {
    return 'warning'
  }
  
  return 'info'
}

/**
 * Check if notification should be shown
 */
export function shouldShowNotification(countdown: ClassCountdown, lastNotificationTime?: Date): boolean {
  if (!countdown.isStartingSoon) {
    return false
  }
  
  // Show notification at 15min, 10min, 5min, 1min
  const notificationMinutes = [15, 10, 5, 1]
  const currentMinutes = countdown.minutes
  
  if (!notificationMinutes.includes(currentMinutes)) {
    return false
  }
  
  // Prevent duplicate notifications within the same minute
  if (lastNotificationTime) {
    const timeSinceLastNotification = Date.now() - lastNotificationTime.getTime()
    if (timeSinceLastNotification < 60000) { // Less than 1 minute
      return false
    }
  }
  
  return true
}

export default {
  calculateCountdown,
  useClassCountdown,
  useMultipleClassCountdowns,
  formatCountdownDisplay,
  getCountdownColor,
  getCountdownBadgeVariant,
  shouldShowNotification,
}
