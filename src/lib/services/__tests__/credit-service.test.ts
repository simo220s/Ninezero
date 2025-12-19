/**
 * Credit Service Tests
 * 
 * Tests for the credit management service
 * Task 5: Implement Credit Management Workflow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreditService } from '../credit-service'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { credits: 10 }, error: null })),
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null }))
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({ error: null }))
  }
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

describe('CreditService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addCredits', () => {
    it('should add credits successfully', async () => {
      const result = await CreditService.addCredits({
        studentId: 'student-123',
        teacherId: 'teacher-456',
        amount: 5,
        reason: 'Test credit addition'
      })

      expect(result.success).toBe(true)
      expect(result.newBalance).toBe(15) // 10 + 5
    })

    it('should reject negative amounts', async () => {
      const result = await CreditService.addCredits({
        studentId: 'student-123',
        teacherId: 'teacher-456',
        amount: -5,
        reason: 'Invalid amount'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('أكبر من صفر')
    })

    it('should reject amounts over 100', async () => {
      const result = await CreditService.addCredits({
        studentId: 'student-123',
        teacherId: 'teacher-456',
        amount: 150,
        reason: 'Too many credits'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('100')
    })
  })

  describe('getStudentCredits', () => {
    it('should return student credits', async () => {
      const result = await CreditService.getStudentCredits('student-123')

      expect(result.credits).toBe(10)
      expect(result.error).toBeUndefined()
    })
  })

  describe('getCreditHistory', () => {
    it('should return credit history', async () => {
      const result = await CreditService.getCreditHistory({
        studentId: 'student-123'
      })

      expect(result.transactions).toBeDefined()
      expect(Array.isArray(result.transactions)).toBe(true)
    })

    it('should apply filters correctly', async () => {
      const result = await CreditService.getCreditHistory({
        studentId: 'student-123',
        type: 'add',
        limit: 10
      })

      expect(result.transactions).toBeDefined()
    })
  })

  describe('deductCredits', () => {
    it('should deduct credits successfully', async () => {
      const result = await CreditService.deductCredits({
        studentId: 'student-123',
        teacherId: 'teacher-456',
        amount: 3,
        reason: 'Class booking'
      })

      expect(result.success).toBe(true)
      expect(result.newBalance).toBe(7) // 10 - 3
    })

    it('should reject negative amounts', async () => {
      const result = await CreditService.deductCredits({
        studentId: 'student-123',
        teacherId: 'teacher-456',
        amount: -3,
        reason: 'Invalid deduction'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('أكبر من صفر')
    })
  })

  describe('getCreditStats', () => {
    it('should return credit statistics', async () => {
      const result = await CreditService.getCreditStats('student-123')

      expect(result.totalAdded).toBeDefined()
      expect(result.totalDeducted).toBeDefined()
      expect(result.totalRefunded).toBeDefined()
      expect(result.transactionCount).toBeDefined()
    })
  })
})
