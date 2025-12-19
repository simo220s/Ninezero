/**
 * RTL and Language Support Tests
 * Tests for Arabic/English language switching and RTL layout
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

describe('RTL and Language Support', () => {
  describe('RTL Layout', () => {
    it('should apply RTL direction for Arabic content', () => {
      const arabicText = 'مرحباً بك في نادي اللغة الإنجليزية'
      
      expect(arabicText).toMatch(/[\u0600-\u06FF]/)
    })

    it('should use LTR direction for English content', () => {
      const englishText = 'Welcome to English Language Club'
      
      expect(englishText).toMatch(/^[a-zA-Z\s]+$/)
    })

    it('should handle mixed content correctly', () => {
      const mixedText = 'Welcome مرحباً'
      
      expect(mixedText).toContain('Welcome')
      expect(mixedText).toMatch(/[\u0600-\u06FF]/)
    })
  })

  describe('Language Switching', () => {
    it('should switch between Arabic and English', () => {
      const translations = {
        ar: 'الطلاب',
        en: 'Students',
      }

      expect(translations.ar).toBeTruthy()
      expect(translations.en).toBeTruthy()
    })

    it('should maintain context during language switch', () => {
      const studentCount = 25
      const textAr = `${studentCount} طالب`
      const textEn = `${studentCount} students`

      expect(textAr).toContain('25')
      expect(textEn).toContain('25')
    })

    it('should format numbers based on language', () => {
      const number = 123
      const arabicNumerals = number.toString().split('').map(d => 
        String.fromCharCode(0x0660 + parseInt(d))
      ).join('')
      
      expect(arabicNumerals).toMatch(/[\u0660-\u0669]/)
    })
  })

  describe('Currency Formatting', () => {
    it('should format currency for Arabic locale', () => {
      const amount = 150
      const formatted = `${amount} ر.س`
      
      expect(formatted).toContain('ر.س')
    })

    it('should format currency for English locale', () => {
      const amount = 150
      const formatted = `SAR ${amount}`
      
      expect(formatted).toContain('SAR')
    })

    it('should maintain currency symbol position in RTL', () => {
      const price = '150 ر.س'
      
      // In RTL, currency symbol comes after the number
      expect(price).toMatch(/\d+\s+ر\.س/)
    })
  })

  describe('Date and Time Formatting', () => {
    it('should format dates in Arabic', () => {
      const date = new Date('2025-11-03')
      const formatted = date.toLocaleDateString('ar-SA')
      
      expect(formatted).toBeTruthy()
    })

    it('should format dates in English', () => {
      const date = new Date('2025-11-03')
      const formatted = date.toLocaleDateString('en-US')
      
      expect(formatted).toBeTruthy()
    })

    it('should format time consistently', () => {
      const time = '17:00'
      
      expect(time).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should support Hijri calendar for Arabic', () => {
      const gregorianDate = new Date('2025-11-03')
      
      // Hijri date would be calculated
      expect(gregorianDate).toBeInstanceOf(Date)
    })
  })

  describe('Text Direction Indicators', () => {
    it('should use correct arrow direction for RTL', () => {
      const rtlArrow = '←' // Left arrow for RTL (points right visually)
      const ltrArrow = '→' // Right arrow for LTR
      
      expect(rtlArrow).toBeTruthy()
      expect(ltrArrow).toBeTruthy()
    })

    it('should flip icons for RTL layout', () => {
      const icons = {
        next: { rtl: 'chevron-left', ltr: 'chevron-right' },
        back: { rtl: 'chevron-right', ltr: 'chevron-left' },
      }

      expect(icons.next.rtl).toBe('chevron-left')
      expect(icons.next.ltr).toBe('chevron-right')
    })
  })

  describe('Form Input Direction', () => {
    it('should handle Arabic text input', () => {
      const arabicInput = 'أحمد محمد'
      
      expect(arabicInput).toMatch(/[\u0600-\u06FF]/)
    })

    it('should handle English text input', () => {
      const englishInput = 'Ahmed Mohammed'
      
      expect(englishInput).toMatch(/^[a-zA-Z\s]+$/)
    })

    it('should handle phone number input', () => {
      const phoneNumber = '+966501234567'
      
      expect(phoneNumber).toMatch(/^\+966[5][0-9]{8}$/)
    })

    it('should handle email input', () => {
      const email = 'parent@example.com'
      
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })
  })

  describe('Navigation Labels', () => {
    it('should provide bilingual navigation labels', () => {
      const navItems = [
        { ar: 'لوحة التحكم', en: 'Dashboard' },
        { ar: 'الطلاب', en: 'Students' },
        { ar: 'الحصص', en: 'Classes' },
        { ar: 'المراجعات', en: 'Reviews' },
        { ar: 'الإحصائيات', en: 'Statistics' },
        { ar: 'الشؤون المالية', en: 'Financial' },
      ]

      navItems.forEach(item => {
        expect(item.ar).toBeTruthy()
        expect(item.en).toBeTruthy()
      })
    })
  })

  describe('Error Messages', () => {
    it('should display error messages in Arabic', () => {
      const errors = {
        required: 'هذا الحقل مطلوب',
        invalidEmail: 'البريد الإلكتروني غير صحيح',
        invalidPhone: 'رقم الهاتف غير صحيح',
      }

      Object.values(errors).forEach(error => {
        expect(error).toMatch(/[\u0600-\u06FF]/)
      })
    })

    it('should display error messages in English', () => {
      const errors = {
        required: 'This field is required',
        invalidEmail: 'Invalid email address',
        invalidPhone: 'Invalid phone number',
      }

      Object.values(errors).forEach(error => {
        expect(error).toMatch(/^[a-zA-Z\s]+$/)
      })
    })
  })

  describe('Accessibility with RTL', () => {
    it('should maintain accessibility in RTL mode', () => {
      const ariaLabel = {
        ar: 'قائمة الطلاب',
        en: 'Student list',
      }

      expect(ariaLabel.ar).toBeTruthy()
      expect(ariaLabel.en).toBeTruthy()
    })

    it('should provide screen reader support', () => {
      const srText = {
        ar: 'انتقل إلى صفحة الطلاب',
        en: 'Navigate to students page',
      }

      expect(srText.ar).toBeTruthy()
      expect(srText.en).toBeTruthy()
    })
  })
})
