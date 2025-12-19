/**
 * Day.js utility functions for date formatting
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'

// Extend dayjs with plugins
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

/**
 * Format date in a readable format
 */
export const formatDate = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format('MMM DD, YYYY')
}

/**
 * Format time in 12-hour format
 */
export const formatTime = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format('h:mm A')
}

/**
 * Format date and time together
 */
export const formatDateTime = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format('MMM DD, YYYY h:mm A')
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).fromNow()
}

/**
 * Get day name (e.g., "Monday")
 */
export const getDayName = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format('dddd')
}

/**
 * Get month name (e.g., "January")
 */
export const getMonthName = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format('MMMM')
}

/**
 * Check if date is today
 */
export const isToday = (date: string | Date | dayjs.Dayjs): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * Check if date is tomorrow
 */
export const isTomorrow = (date: string | Date | dayjs.Dayjs): boolean => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day')
}

/**
 * Check if date is in the past
 */
export const isPast = (date: string | Date | dayjs.Dayjs): boolean => {
  return dayjs(date).isBefore(dayjs())
}

/**
 * Check if date is in the future
 */
export const isFuture = (date: string | Date | dayjs.Dayjs): boolean => {
  return dayjs(date).isAfter(dayjs())
}

export default dayjs