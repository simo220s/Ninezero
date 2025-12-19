/**
 * Currency formatting utilities for Saudi Riyal
 */

/**
 * Format amount in Saudi Riyals with Arabic numerals
 * @param amount - The amount to format
 * @param locale - The locale (default: 'ar-SA')
 * @returns Formatted string like "150 ر.س"
 */
export function formatCurrency(
  amount: number,
  locale: string = 'ar-SA'
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
  
  return `${formatted} ر.س`
}
