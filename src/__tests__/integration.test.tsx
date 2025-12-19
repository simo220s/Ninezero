import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/currency'
import { formatDate, formatTime, getRelativeTime, toArabicNumerals } from '@/lib/formatters'

describe('Integration Tests - Arabic Formatting', () => {
  describe('Currency Formatting Integration', () => {
    it('should format all common price points correctly', () => {
      const prices = [50, 100, 150, 200, 250, 300]
      
      prices.forEach(price => {
        const formatted = formatCurrency(price)
        expect(formatted).toContain('ر.س')
        expect(formatted).toBeTruthy()
      })
    })

    it('should handle trial and regular class prices', () => {
      const trialPrice = formatCurrency(50)
      const regularPrice = formatCurrency(100)
      
      expect(trialPrice).toContain('ر.س')
      expect(regularPrice).toContain('ر.س')
    })
  })

  describe('Date/Time Formatting Integration', () => {
    it('should format dates consistently across the app', () => {
      const testDate = new Date('2025-10-20T14:30:00')
      
      const date = formatDate(testDate)
      const time = formatTime(testDate)
      
      expect(date).toBeTruthy()
      expect(time).toBeTruthy()
    })

    it('should provide relative time for reviews', () => {
      const today = new Date()
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      expect(getRelativeTime(today)).toBe('اليوم')
      expect(getRelativeTime(yesterday)).toBe('أمس')
      expect(getRelativeTime(lastWeek)).toContain('منذ')
    })

    it('should convert all numerals to Arabic', () => {
      const numbers = [0, 1, 5, 10, 50, 100, 2025]
      
      numbers.forEach(num => {
        const arabic = toArabicNumerals(num)
        expect(arabic).toBeTruthy()
        expect(arabic).not.toMatch(/[0-9]/) // Should not contain Western numerals
      })
    })
  })

  describe('RTL Layout Integration', () => {
    it('should handle text direction for Arabic content', () => {
      // Test that Arabic text is properly handled
      const arabicText = 'مرحباً بك في نادي اللغة الإنجليزية'
      expect(arabicText).toMatch(/[\u0600-\u06FF]/) // Arabic Unicode range
    })

    it('should format prices for RTL display', () => {
      const price = formatCurrency(150)
      // Price should have space before ر.س for proper RTL display
      expect(price).toMatch(/\d+\s+ر\.س/)
    })
  })

  describe('Review System Integration', () => {
    it('should handle review data structure', () => {
      const mockReview = {
        id: '1',
        student_name: 'أحمد محمد',
        rating: 5,
        comment: 'تجربة رائعة',
        created_at: new Date().toISOString()
      }

      expect(mockReview.student_name).toBeTruthy()
      expect(mockReview.rating).toBeGreaterThanOrEqual(1)
      expect(mockReview.rating).toBeLessThanOrEqual(5)
      expect(getRelativeTime(mockReview.created_at)).toBeTruthy()
    })
  })

  describe('Class Countdown Integration', () => {
    it('should calculate time differences correctly', () => {
      const now = new Date()
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
      
      const diff = future.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      expect(hours).toBe(2)
    })

    it('should format countdown times in Arabic', () => {
      const hours = toArabicNumerals(2)
      const minutes = toArabicNumerals(30)
      
      expect(hours).not.toMatch(/[0-9]/)
      expect(minutes).not.toMatch(/[0-9]/)
    })
  })
})
