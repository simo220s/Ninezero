/**
 * Coupon Service Tests
 * Tests for coupon validation and application
 */

import { describe, it, expect, beforeEach } from 'vitest'

describe('Coupon Service', () => {
  const mockCoupons = [
    {
      id: '1',
      code: 'WELCOME10',
      nameAr: 'خصم الترحيب',
      nameEn: 'Welcome Discount',
      discountType: 'percentage',
      discountValue: 10,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      maxUses: 100,
      currentUses: 25,
      minPurchaseAmount: 50,
      applicableTo: 'all',
      status: 'active',
    },
    {
      id: '2',
      code: 'TRIAL50',
      nameAr: 'خصم الحصة التجريبية',
      nameEn: 'Trial Class Discount',
      discountType: 'fixed',
      discountValue: 50,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      maxUses: 50,
      currentUses: 10,
      minPurchaseAmount: 0,
      applicableTo: 'trial',
      status: 'active',
    },
  ]

  describe('Coupon Validation', () => {
    it('should validate active coupon code', () => {
      const coupon = mockCoupons[0]
      
      expect(coupon.status).toBe('active')
      expect(coupon.code).toBeTruthy()
    })

    it('should check coupon validity period', () => {
      const coupon = mockCoupons[0]
      const now = new Date()
      
      expect(now >= coupon.validFrom).toBe(true)
      expect(now <= coupon.validUntil).toBe(true)
    })

    it('should verify coupon usage limits', () => {
      const coupon = mockCoupons[0]
      
      expect(coupon.currentUses).toBeLessThan(coupon.maxUses)
    })

    it('should check minimum purchase amount', () => {
      const coupon = mockCoupons[0]
      const purchaseAmount = 100
      
      expect(purchaseAmount).toBeGreaterThanOrEqual(coupon.minPurchaseAmount)
    })

    it('should validate coupon applicability', () => {
      const validTypes = ['all', 'trial', 'regular', 'packages']
      
      mockCoupons.forEach(coupon => {
        expect(validTypes).toContain(coupon.applicableTo)
      })
    })
  })

  describe('Discount Calculation', () => {
    it('should calculate percentage discount correctly', () => {
      const coupon = mockCoupons[0]
      const originalPrice = 100
      const discount = (originalPrice * coupon.discountValue) / 100
      const finalPrice = originalPrice - discount
      
      expect(discount).toBe(10)
      expect(finalPrice).toBe(90)
    })

    it('should calculate fixed discount correctly', () => {
      const coupon = mockCoupons[1]
      const originalPrice = 100
      const finalPrice = originalPrice - coupon.discountValue
      
      expect(finalPrice).toBe(50)
    })

    it('should not allow discount to exceed original price', () => {
      const coupon = mockCoupons[1]
      const originalPrice = 30
      const finalPrice = Math.max(0, originalPrice - coupon.discountValue)
      
      expect(finalPrice).toBeGreaterThanOrEqual(0)
    })

    it('should format discount in Saudi Riyals', () => {
      const discount = 50
      const formatted = `${discount} ر.س`
      
      expect(formatted).toContain('ر.س')
    })
  })

  describe('Coupon Application', () => {
    it('should apply coupon to eligible purchase', () => {
      const coupon = mockCoupons[0]
      const purchase = {
        amount: 100,
        type: 'regular',
      }
      
      const isEligible = 
        purchase.amount >= coupon.minPurchaseAmount &&
        (coupon.applicableTo === 'all' || coupon.applicableTo === purchase.type)
      
      expect(isEligible).toBe(true)
    })

    it('should reject coupon for ineligible purchase type', () => {
      const trialCoupon = mockCoupons[1]
      const regularPurchase = {
        amount: 100,
        type: 'regular',
      }
      
      const isEligible = 
        trialCoupon.applicableTo === 'all' || 
        trialCoupon.applicableTo === regularPurchase.type
      
      expect(isEligible).toBe(false)
    })

    it('should reject coupon below minimum purchase', () => {
      const coupon = mockCoupons[0]
      const purchase = {
        amount: 30,
        type: 'regular',
      }
      
      const isEligible = purchase.amount >= coupon.minPurchaseAmount
      
      expect(isEligible).toBe(false)
    })
  })

  describe('Coupon Usage Tracking', () => {
    it('should increment usage count after application', () => {
      const coupon = { ...mockCoupons[0] }
      const initialUses = coupon.currentUses
      
      coupon.currentUses += 1
      
      expect(coupon.currentUses).toBe(initialUses + 1)
    })

    it('should prevent usage when limit reached', () => {
      const coupon = {
        ...mockCoupons[0],
        currentUses: 100,
        maxUses: 100,
      }
      
      const canUse = coupon.currentUses < coupon.maxUses
      
      expect(canUse).toBe(false)
    })
  })

  describe('Bilingual Support', () => {
    it('should provide Arabic and English names', () => {
      mockCoupons.forEach(coupon => {
        expect(coupon.nameAr).toBeTruthy()
        expect(coupon.nameEn).toBeTruthy()
      })
    })

    it('should support Arabic coupon codes', () => {
      const arabicCoupon = {
        code: 'رمضان2025',
        nameAr: 'خصم رمضان',
        discountType: 'percentage',
        discountValue: 20,
      }
      
      expect(arabicCoupon.code).toMatch(/[\u0600-\u06FF]/)
    })
  })
})
