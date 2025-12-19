/**
 * Date and time formatting utilities for Arabic locale
 */

/**
 * Format date in Arabic locale
 * @param date - Date to format
 * @param locale - Locale (default: 'ar-SA')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
}

/**
 * Format time in Arabic locale
 * @param date - Date to format
 * @param locale - Locale (default: 'ar-SA')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options
  }
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
}

/**
 * Convert Western numerals to Arabic numerals
 * @param num - Number or string to convert
 * @returns String with Arabic numerals
 */
export function toArabicNumerals(num: number | string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(num).replace(/\d/g, (d) => arabicNumerals[parseInt(d)])
}

/**
 * Get relative time string (e.g., "منذ يومين")
 * @param date - Date to compare
 * @returns Relative time string in Arabic
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${toArabicNumerals(diffDays)} أيام`
  if (diffDays < 30) return `منذ ${toArabicNumerals(Math.floor(diffDays / 7))} أسابيع`
  if (diffDays < 365) return `منذ ${toArabicNumerals(Math.floor(diffDays / 30))} أشهر`
  return `منذ ${toArabicNumerals(Math.floor(diffDays / 365))} سنوات`
}
