/**
 * Date Helper Utilities
 * 
 * Centralized date manipulation and formatting functions.
 * Provides consistent date handling across services.
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Arabic month names
 */
export const ARABIC_MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
] as const;

/**
 * English month names
 */
export const ENGLISH_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

// ============================================================================
// Month Key Generation
// ============================================================================

/**
 * Generate a unique month key from a date
 * 
 * Creates a sortable string key in format "YYYY-M" for grouping data by month.
 * 
 * @param date - The date to generate key from
 * @returns Month key string (e.g., "2024-0" for January 2024)
 * 
 * @example
 * ```typescript
 * const key = getMonthKey(new Date('2024-01-15'));
 * // Returns: "2024-0"
 * 
 * // Use for grouping data
 * const monthlyData: Record<string, any> = {};
 * sessions.forEach(session => {
 *   const key = getMonthKey(new Date(session.date));
 *   if (!monthlyData[key]) {
 *     monthlyData[key] = { revenue: 0, count: 0 };
 *   }
 *   monthlyData[key].revenue += session.amount;
 * });
 * ```
 */
export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/**
 * Get Arabic month name from date
 * 
 * @param date - The date to get month name from
 * @returns Arabic month name
 * 
 * @example
 * ```typescript
 * const monthName = getArabicMonthName(new Date('2024-01-15'));
 * // Returns: "يناير"
 * ```
 */
export function getArabicMonthName(date: Date): string {
  return ARABIC_MONTH_NAMES[date.getMonth()];
}

/**
 * Get English month name from date
 * 
 * @param date - The date to get month name from
 * @returns English month name
 * 
 * @example
 * ```typescript
 * const monthName = getEnglishMonthName(new Date('2024-01-15'));
 * // Returns: "January"
 * ```
 */
export function getEnglishMonthName(date: Date): string {
  return ENGLISH_MONTH_NAMES[date.getMonth()];
}

/**
 * Get month name from date (defaults to Arabic)
 * 
 * @param date - The date to get month name from
 * @param locale - Locale for month name ('ar' or 'en', default: 'ar')
 * @returns Month name in specified locale
 * 
 * @example
 * ```typescript
 * const arabicMonth = getMonthName(new Date('2024-01-15'), 'ar');
 * const englishMonth = getMonthName(new Date('2024-01-15'), 'en');
 * ```
 */
export function getMonthName(date: Date, locale: 'ar' | 'en' = 'ar'): string {
  return locale === 'ar' ? getArabicMonthName(date) : getEnglishMonthName(date);
}

// ============================================================================
// Date Calculations
// ============================================================================

/**
 * Add months to a date
 * 
 * Safely adds a specified number of months to a date.
 * 
 * @param date - The starting date
 * @param months - Number of months to add
 * @returns New date with months added
 * 
 * @example
 * ```typescript
 * const futureDate = addMonths(new Date('2024-01-15'), 3);
 * // Returns: Date for 2024-04-15
 * ```
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add hours to a date
 * 
 * Safely adds a specified number of hours to a date.
 * 
 * @param date - The starting date
 * @param hours - Number of hours to add
 * @returns New date with hours added
 * 
 * @example
 * ```typescript
 * const futureDate = addHours(new Date(), 24);
 * // Returns: Date 24 hours from now
 * ```
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add days to a date
 * 
 * Safely adds a specified number of days to a date.
 * 
 * @param date - The starting date
 * @param days - Number of days to add
 * @returns New date with days added
 * 
 * @example
 * ```typescript
 * const futureDate = addDays(new Date(), 7);
 * // Returns: Date 7 days from now
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================================
// Date Range Calculations
// ============================================================================

/**
 * Get start date for a time range
 * 
 * Calculates the start date based on a time range specification.
 * 
 * @param range - Time range ('week' | 'month' | 'quarter' | 'year')
 * @param fromDate - Reference date (default: now)
 * @returns Start date for the range
 * 
 * @example
 * ```typescript
 * const weekStart = getStartDateForRange('week');
 * const monthStart = getStartDateForRange('month');
 * const quarterStart = getStartDateForRange('quarter');
 * ```
 */
export function getStartDateForRange(
  range: 'week' | 'month' | 'quarter' | 'year',
  fromDate: Date = new Date()
): Date {
  const startDate = new Date(fromDate);
  
  switch (range) {
    case 'week':
      startDate.setDate(fromDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(fromDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(fromDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(fromDate.getFullYear() - 1);
      break;
  }
  
  return startDate;
}

/**
 * Get start of month
 * 
 * Returns a date representing the first day of the month at 00:00:00.
 * 
 * @param date - Reference date (default: now)
 * @returns Date at start of month
 * 
 * @example
 * ```typescript
 * const monthStart = getStartOfMonth(new Date('2024-01-15'));
 * // Returns: 2024-01-01 00:00:00
 * ```
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of month
 * 
 * Returns a date representing the last day of the month at 23:59:59.
 * 
 * @param date - Reference date (default: now)
 * @returns Date at end of month
 * 
 * @example
 * ```typescript
 * const monthEnd = getEndOfMonth(new Date('2024-01-15'));
 * // Returns: 2024-01-31 23:59:59
 * ```
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format date to ISO date string (YYYY-MM-DD)
 * 
 * @param date - The date to format
 * @returns ISO date string
 * 
 * @example
 * ```typescript
 * const dateStr = toISODateString(new Date('2024-01-15T10:30:00'));
 * // Returns: "2024-01-15"
 * ```
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date to ISO datetime string
 * 
 * @param date - The date to format
 * @returns ISO datetime string
 * 
 * @example
 * ```typescript
 * const dateTimeStr = toISODateTimeString(new Date());
 * // Returns: "2024-01-15T10:30:00.000Z"
 * ```
 */
export function toISODateTimeString(date: Date): string {
  return date.toISOString();
}

// ============================================================================
// Date Comparison
// ============================================================================

/**
 * Check if a date is in the past
 * 
 * @param date - The date to check
 * @param referenceDate - Reference date (default: now)
 * @returns True if date is in the past
 * 
 * @example
 * ```typescript
 * const isPast = isDateInPast(new Date('2023-01-01'));
 * // Returns: true (if current year is 2024)
 * ```
 */
export function isDateInPast(date: Date, referenceDate: Date = new Date()): boolean {
  return date.getTime() < referenceDate.getTime();
}

/**
 * Check if a date is in the future
 * 
 * @param date - The date to check
 * @param referenceDate - Reference date (default: now)
 * @returns True if date is in the future
 * 
 * @example
 * ```typescript
 * const isFuture = isDateInFuture(new Date('2025-01-01'));
 * // Returns: true (if current year is 2024)
 * ```
 */
export function isDateInFuture(date: Date, referenceDate: Date = new Date()): boolean {
  return date.getTime() > referenceDate.getTime();
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Constants
  ARABIC_MONTH_NAMES,
  ENGLISH_MONTH_NAMES,
  
  // Month key generation
  getMonthKey,
  getArabicMonthName,
  getEnglishMonthName,
  getMonthName,
  
  // Date calculations
  addMonths,
  addHours,
  addDays,
  
  // Date range calculations
  getStartDateForRange,
  getStartOfMonth,
  getEndOfMonth,
  
  // Date formatting
  toISODateString,
  toISODateTimeString,
  
  // Date comparison
  isDateInPast,
  isDateInFuture,
};
