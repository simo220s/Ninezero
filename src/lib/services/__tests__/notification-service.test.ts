/**
 * Notification Service Tests
 * 
 * Tests for the notification system functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import notificationService from '../notification-service'
import { calculateCountdown, formatCountdownDisplay } from '../countdown-timer'
import { formatSaudiPhoneNumber, validateSaudiPhoneNumber, WhatsAppTemplates } from '../whatsapp-integration'

describe('Notification Service', () => {
  describe('Notification Preferences', () => {
    it('should return default preferences for new users', async () => {
      const userId = 'test-user-id'
      const prefs = await notificationService.getNotificationPreferences(userId)
      
      expect(prefs).toBeDefined()
      if (prefs) {
        expect(prefs.email).toBe(true)
        expect(prefs.whatsapp).toBe(true)
        expect(prefs.inApp).toBe(true)
        expect(prefs.classReminders).toBe(true)
        expect(prefs.language).toBe('ar')
        expect(prefs.reminderTimings).toContain('24h')
        expect(prefs.reminderTimings).toContain('1h')
        expect(prefs.reminderTimings).toContain('15min')
      }
    })
  })

  describe('Class Reminders', () => {
    it('should calculate reminder times correctly', () => {
      const classDate = new Date('2024-01-15T17:00:00')
      
      // 24 hours before
      const reminder24h = new Date(classDate)
      reminder24h.setHours(reminder24h.getHours() - 24)
      expect(reminder24h.getTime()).toBeLessThan(classDate.getTime())
      
      // 1 hour before
      const reminder1h = new Date(classDate)
      reminder1h.setHours(reminder1h.getHours() - 1)
      expect(reminder1h.getTime()).toBeLessThan(classDate.getTime())
      
      // 15 minutes before
      const reminder15min = new Date(classDate)
      reminder15min.setMinutes(reminder15min.getMinutes() - 15)
      expect(reminder15min.getTime()).toBeLessThan(classDate.getTime())
    })
  })
})

describe('Countdown Timer', () => {
  describe('calculateCountdown', () => {
    it('should calculate countdown correctly for future class', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(17, 0, 0, 0)
      
      const countdown = calculateCountdown(tomorrow, '17:00')
      
      expect(countdown.days).toBeGreaterThanOrEqual(0)
      expect(countdown.hours).toBeGreaterThanOrEqual(0)
      expect(countdown.minutes).toBeGreaterThanOrEqual(0)
      expect(countdown.seconds).toBeGreaterThanOrEqual(0)
      expect(countdown.hasStarted).toBe(false)
    })

    it('should detect class starting soon (within 15 minutes)', () => {
      const soon = new Date()
      soon.setMinutes(soon.getMinutes() + 10)
      const time = `${soon.getHours().toString().padStart(2, '0')}:${soon.getMinutes().toString().padStart(2, '0')}`
      
      const countdown = calculateCountdown(soon, time)
      
      expect(countdown.isStartingSoon).toBe(true)
      expect(countdown.totalSeconds).toBeLessThanOrEqual(15 * 60)
    })

    it('should detect if class has started', () => {
      const past = new Date()
      past.setHours(past.getHours() - 1)
      const time = `${past.getHours().toString().padStart(2, '0')}:00`
      
      const countdown = calculateCountdown(past, time)
      
      expect(countdown.hasStarted).toBe(true)
      expect(countdown.totalSeconds).toBe(0)
    })

    it('should detect if class is today', () => {
      const today = new Date()
      today.setHours(23, 59, 0, 0)
      
      const countdown = calculateCountdown(today, '23:59')
      
      expect(countdown.isToday).toBe(true)
      expect(countdown.days).toBe(0)
    })
  })

  describe('formatCountdownDisplay', () => {
    it('should format countdown in Arabic', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const countdown = calculateCountdown(tomorrow, '17:00')
      const formatted = formatCountdownDisplay(countdown, 'ar')
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('should show "بدأت الحصة" for started classes', () => {
      const past = new Date()
      past.setHours(past.getHours() - 1)
      
      const countdown = calculateCountdown(past, '10:00')
      const formatted = formatCountdownDisplay(countdown, 'ar')
      
      expect(formatted).toBe('بدأت الحصة')
    })
  })
})

describe('WhatsApp Integration', () => {
  describe('formatSaudiPhoneNumber', () => {
    it('should format Saudi phone number with country code', () => {
      expect(formatSaudiPhoneNumber('0501234567')).toBe('+966501234567')
      expect(formatSaudiPhoneNumber('501234567')).toBe('+966501234567')
      expect(formatSaudiPhoneNumber('+966501234567')).toBe('+966501234567')
      expect(formatSaudiPhoneNumber('966501234567')).toBe('+966501234567')
    })

    it('should handle phone numbers with spaces and dashes', () => {
      expect(formatSaudiPhoneNumber('050 123 4567')).toBe('+966501234567')
      expect(formatSaudiPhoneNumber('050-123-4567')).toBe('+966501234567')
    })
  })

  describe('validateSaudiPhoneNumber', () => {
    it('should validate correct Saudi phone numbers', () => {
      expect(validateSaudiPhoneNumber('0501234567')).toBe(true)
      expect(validateSaudiPhoneNumber('501234567')).toBe(true)
      expect(validateSaudiPhoneNumber('+966501234567')).toBe(true)
      expect(validateSaudiPhoneNumber('966501234567')).toBe(true)
    })

    it('should reject invalid Saudi phone numbers', () => {
      expect(validateSaudiPhoneNumber('0401234567')).toBe(false) // Doesn't start with 5
      expect(validateSaudiPhoneNumber('050123456')).toBe(false) // Too short
      expect(validateSaudiPhoneNumber('05012345678')).toBe(false) // Too long
      expect(validateSaudiPhoneNumber('1234567890')).toBe(false) // Wrong format
    })
  })

  describe('WhatsApp Templates', () => {
    it('should generate class reminder 24h template', () => {
      const message = WhatsAppTemplates.classReminder24h(
        'أحمد',
        'المعلم محمد',
        'غداً',
        '5:00 مساءً',
        'https://meet.google.com/xxx'
      )
      
      expect(message).toContain('أحمد')
      expect(message).toContain('المعلم محمد')
      expect(message).toContain('24 ساعة')
      expect(message).toContain('https://meet.google.com/xxx')
    })

    it('should generate class reminder 1h template', () => {
      const message = WhatsAppTemplates.classReminder1h(
        'سارة',
        'المعلمة فاطمة',
        '3:00 مساءً',
        'https://meet.google.com/yyy'
      )
      
      expect(message).toContain('سارة')
      expect(message).toContain('المعلمة فاطمة')
      expect(message).toContain('ساعة واحدة')
      expect(message).toContain('https://meet.google.com/yyy')
    })

    it('should generate class reminder 15min template', () => {
      const message = WhatsAppTemplates.classReminder15min(
        'محمد',
        'https://meet.google.com/zzz'
      )
      
      expect(message).toContain('محمد')
      expect(message).toContain('15 دقيقة')
      expect(message).toContain('https://meet.google.com/zzz')
    })

    it('should generate parent message template', () => {
      const message = WhatsAppTemplates.parentMessage(
        'علي',
        'المعلم أحمد',
        'تقدم ممتاز في الحصة اليوم!'
      )
      
      expect(message).toContain('علي')
      expect(message).toContain('المعلم أحمد')
      expect(message).toContain('تقدم ممتاز')
    })

    it('should generate progress report template', () => {
      const message = WhatsAppTemplates.progressReport(
        'خالد',
        'متوسط',
        15,
        'الأسبوع القادم'
      )
      
      expect(message).toContain('خالد')
      expect(message).toContain('متوسط')
      expect(message).toContain('15')
      expect(message).toContain('الأسبوع القادم')
    })

    it('should generate welcome message template', () => {
      const message = WhatsAppTemplates.welcomeMessage(
        'نورة',
        'أم نورة',
        'غداً',
        '4:00 مساءً',
        'https://meet.google.com/welcome'
      )
      
      expect(message).toContain('نورة')
      expect(message).toContain('أم نورة')
      expect(message).toContain('الحصة التجريبية')
      expect(message).toContain('https://meet.google.com/welcome')
    })

    it('should generate class cancelled template', () => {
      const message = WhatsAppTemplates.classCancelled(
        'يوسف',
        'المعلم عبدالله',
        'غداً',
        '6:00 مساءً',
        'ظرف طارئ'
      )
      
      expect(message).toContain('يوسف')
      expect(message).toContain('المعلم عبدالله')
      expect(message).toContain('إلغاء')
      expect(message).toContain('ظرف طارئ')
    })

    it('should generate class rescheduled template', () => {
      const message = WhatsAppTemplates.classRescheduled(
        'ريم',
        'المعلمة هدى',
        'اليوم',
        '5:00 مساءً',
        'غداً',
        '6:00 مساءً',
        'https://meet.google.com/new'
      )
      
      expect(message).toContain('ريم')
      expect(message).toContain('المعلمة هدى')
      expect(message).toContain('تغيير موعد')
      expect(message).toContain('https://meet.google.com/new')
    })
  })
})
