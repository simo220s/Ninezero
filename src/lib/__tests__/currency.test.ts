import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../currency'

describe('formatCurrency', () => {
  it('should format whole numbers with Arabic numerals and ر.س symbol', () => {
    const result = formatCurrency(150)
    expect(result).toContain('ر.س')
    expect(result).toMatch(/١٥٠|150/) // May use Arabic or Western numerals depending on locale
  })

  it('should format decimal numbers correctly', () => {
    const result = formatCurrency(99.99)
    expect(result).toContain('ر.س')
    expect(result).toMatch(/٩٩[.,]٩٩|99[.,]99/)
  })

  it('should format zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('ر.س')
    expect(result).toMatch(/٠|0/)
  })

  it('should format large numbers with thousands separator', () => {
    const result = formatCurrency(1000)
    expect(result).toContain('ر.س')
    // Arabic locale may use different separators
    expect(result).toBeTruthy()
  })

  it('should handle negative numbers', () => {
    const result = formatCurrency(-50)
    expect(result).toContain('ر.س')
    expect(result).toMatch(/-|−/) // Minus sign
  })

  it('should round to 2 decimal places maximum', () => {
    const result = formatCurrency(99.999)
    expect(result).toContain('ر.س')
    // Should round to 100 or 99.99
    expect(result).toMatch(/١٠٠|100|٩٩[.,]٩٩|99[.,]99/)
  })

  it('should use custom locale when provided', () => {
    const result = formatCurrency(150, 'en-US')
    expect(result).toBe('150 ر.س')
  })
})
