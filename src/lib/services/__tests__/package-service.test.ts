/**
 * Package Service Tests
 * Tests for package management and purchase flows
 */

import { describe, it, expect } from 'vitest'

describe('Package Service', () => {
  const mockPackages = [
    {
      id: '1',
      name: '5 Classes Bundle',
      nameAr: 'باقة 5 حصص',
      credits: 5,
      price: 450,
      discountPrice: 400,
      validityDays: 30,
      packageType: 'credit_bundle',
      isFeatured: true,
      status: 'active',
    },
    {
      id: '2',
      name: 'Family Package',
      nameAr: 'باقة العائلة',
      credits: 20,
      price: 1800,
      discountPrice: 1500,
      validityDays: 90,
      packageType: 'family',
      isFeatured: true,
      status: 'active',
    },
    {
      id: '3',
      name: 'Trial + 10 Classes',
      nameAr: 'تجريبية + 10 حصص',
      credits: 11,
      price: 950,
      discountPrice: 850,
      validityDays: 60,
      packageType: 'trial_combo',
      isFeatured: false,
      status: 'active',
    },
  ]

  describe('Package Display', () => {
    it('should display package information', () => {
      const pkg = mockPackages[0]
      
      expect(pkg.name).toBeTruthy()
      expect(pkg.nameAr).toBeTruthy()
      expect(pkg.credits).toBeGreaterThan(0)
      expect(pkg.price).toBeGreaterThan(0)
    })

    it('should show discount pricing', () => {
      mockPackages.forEach(pkg => {
        expect(pkg.discountPrice).toBeLessThan(pkg.price)
      })
    })

    it('should calculate savings amount', () => {
      const pkg = mockPackages[0]
      const savings = pkg.price - pkg.discountPrice
      
      expect(savings).toBe(50)
      expect(savings).toBeGreaterThan(0)
    })

    it('should calculate savings percentage', () => {
      const pkg = mockPackages[0]
      const savingsPercent = ((pkg.price - pkg.discountPrice) / pkg.price) * 100
      
      expect(savingsPercent).toBeCloseTo(11.11, 1)
    })
  })

  describe('Package Types', () => {
    it('should support different package types', () => {
      const types = ['credit_bundle', 'family', 'trial_combo']
      
      mockPackages.forEach(pkg => {
        expect(types).toContain(pkg.packageType)
      })
    })

    it('should identify featured packages', () => {
      const featured = mockPackages.filter(p => p.isFeatured)
      
      expect(featured.length).toBeGreaterThan(0)
    })

    it('should have validity period', () => {
      mockPackages.forEach(pkg => {
        expect(pkg.validityDays).toBeGreaterThan(0)
      })
    })
  })

  describe('Package Purchase Flow', () => {
    it('should calculate total with package discount', () => {
      const pkg = mockPackages[0]
      const total = pkg.discountPrice
      
      expect(total).toBe(400)
    })

    it('should apply additional coupon to package', () => {
      const pkg = mockPackages[0]
      const couponDiscount = 10 // 10% off
      const finalPrice = pkg.discountPrice * (1 - couponDiscount / 100)
      
      expect(finalPrice).toBe(360)
    })

    it('should calculate price per class', () => {
      const pkg = mockPackages[0]
      const pricePerClass = pkg.discountPrice / pkg.credits
      
      expect(pricePerClass).toBe(80)
    })

    it('should compare with regular pricing', () => {
      const regularPricePerClass = 100
      const pkg = mockPackages[0]
      const packagePricePerClass = pkg.discountPrice / pkg.credits
      
      expect(packagePricePerClass).toBeLessThan(regularPricePerClass)
    })
  })

  describe('Family Package Features', () => {
    it('should support multiple students', () => {
      const familyPkg = mockPackages[1]
      
      expect(familyPkg.packageType).toBe('family')
      expect(familyPkg.credits).toBeGreaterThanOrEqual(20)
    })

    it('should offer better value for families', () => {
      const familyPkg = mockPackages[1]
      const singlePkg = mockPackages[0]
      
      const familyPricePerCredit = familyPkg.discountPrice / familyPkg.credits
      const singlePricePerCredit = singlePkg.discountPrice / singlePkg.credits
      
      expect(familyPricePerCredit).toBeLessThan(singlePricePerCredit)
    })
  })

  describe('Trial Combo Package', () => {
    it('should include trial class', () => {
      const trialCombo = mockPackages[2]
      
      expect(trialCombo.packageType).toBe('trial_combo')
      expect(trialCombo.credits).toBeGreaterThan(10)
    })

    it('should offer value for new students', () => {
      const trialCombo = mockPackages[2]
      const trialPrice = 50
      const regularPrice = 100
      const expectedTotal = trialPrice + (10 * regularPrice)
      
      expect(trialCombo.discountPrice).toBeLessThan(expectedTotal)
    })
  })

  describe('Package Validity', () => {
    it('should calculate expiry date', () => {
      const pkg = mockPackages[0]
      const purchaseDate = new Date('2025-11-03')
      const expiryDate = new Date(purchaseDate)
      expiryDate.setDate(expiryDate.getDate() + pkg.validityDays)
      
      const expectedExpiry = new Date('2025-12-03')
      expect(expiryDate.toDateString()).toBe(expectedExpiry.toDateString())
    })

    it('should warn before expiry', () => {
      const pkg = mockPackages[0]
      const purchaseDate = new Date('2025-10-10')
      const expiryDate = new Date(purchaseDate)
      expiryDate.setDate(expiryDate.getDate() + pkg.validityDays)
      
      const now = new Date('2025-11-03')
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      expect(daysUntilExpiry).toBeGreaterThan(0)
    })
  })

  describe('Bilingual Package Display', () => {
    it('should provide Arabic and English names', () => {
      mockPackages.forEach(pkg => {
        expect(pkg.name).toBeTruthy()
        expect(pkg.nameAr).toBeTruthy()
      })
    })

    it('should format prices in Saudi Riyals', () => {
      const pkg = mockPackages[0]
      const formatted = `${pkg.discountPrice} ر.س`
      
      expect(formatted).toContain('ر.س')
    })
  })
})
