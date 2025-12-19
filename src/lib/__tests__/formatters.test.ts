import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, getRelativeTime, toArabicNumerals } from '../formatters'

describe('formatDate', () => {
  it('should format Date object with Arabic locale', () => {
    const date = new Date('2025-10-12T10:30:00')
    const result = formatDate(date)
    
    expect(result).toBeTruthy()
    expect(result).toContain('2025')
  })

  it('should format date string', () => {
    const dateStr = '2025-10-12'
    const result = formatDate(dateStr)
    
    expect(result).toBeTruthy()
  })

  it('should format with custom locale', () => {
    const date = new Date('2025-10-12')
    const result = formatDate(date, 'en-US')
    
    expect(result).toMatch(/2025|Oct|October/)
  })
})

describe('formatTime', () => {
  it('should format time from Date object', () => {
    const date = new Date('2025-10-12T10:30:00')
    const result = formatTime(date)
    
    expect(result).toMatch(/10.*30/)
  })

  it('should format time from string', () => {
    const dateStr = '2025-10-12T15:45:00'
    const result = formatTime(dateStr)
    
    expect(result).toMatch(/15.*45|3.*45/) // 24h or 12h format
  })

  it('should format with 12-hour format', () => {
    const date = new Date('2025-10-12T14:30:00')
    const result = formatTime(date, 'en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
    
    expect(result).toMatch(/2:30|PM/)
  })
})

describe('toArabicNumerals', () => {
  it('should convert Western numerals to Arabic numerals', () => {
    expect(toArabicNumerals(0)).toBe('٠')
    expect(toArabicNumerals(1)).toBe('١')
    expect(toArabicNumerals(5)).toBe('٥')
    expect(toArabicNumerals(9)).toBe('٩')
  })

  it('should convert multi-digit numbers', () => {
    expect(toArabicNumerals(123)).toBe('١٢٣')
    expect(toArabicNumerals(2025)).toBe('٢٠٢٥')
  })

  it('should handle string input', () => {
    expect(toArabicNumerals('42')).toBe('٤٢')
  })
})

describe('getRelativeTime', () => {
  it('should return "اليوم" for today', () => {
    const today = new Date()
    const result = getRelativeTime(today)
    
    expect(result).toBe('اليوم')
  })

  it('should return "أمس" for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const result = getRelativeTime(yesterday)
    
    expect(result).toBe('أمس')
  })

  it('should return days ago for recent dates', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const result = getRelativeTime(threeDaysAgo)
    
    expect(result).toContain('منذ')
    expect(result).toContain('أيام')
  })

  it('should return weeks ago for dates within a month', () => {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const result = getRelativeTime(twoWeeksAgo)
    
    expect(result).toContain('منذ')
    expect(result).toContain('أسابيع')
  })

  it('should return months ago for dates within a year', () => {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const result = getRelativeTime(twoMonthsAgo)
    
    expect(result).toContain('منذ')
    expect(result).toContain('أشهر')
  })

  it('should return years ago for old dates', () => {
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const result = getRelativeTime(twoYearsAgo)
    
    expect(result).toContain('منذ')
    expect(result).toContain('سنوات')
  })
})
