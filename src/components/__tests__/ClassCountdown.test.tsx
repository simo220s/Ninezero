import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { ClassCountdown } from '../ClassCountdown'

describe('ClassCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render countdown for future date', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    const { container } = render(<ClassCountdown targetDate={futureDate.toISOString()} />)
    
    // Should show countdown elements
    expect(container.textContent).toBeTruthy()
  })

  it('should show "الحصة الآن" for current time', () => {
    const now = new Date()
    const { container } = render(<ClassCountdown targetDate={now.toISOString()} />)
    
    expect(container.textContent).toContain('الحصة الآن')
  })

  it('should show "انتهت الحصة" for past time', () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    const { container } = render(<ClassCountdown targetDate={pastDate.toISOString()} />)
    
    expect(container.textContent).toContain('انتهت الحصة')
  })

  it('should apply custom className', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000)
    const { container } = render(
      <ClassCountdown targetDate={futureDate.toISOString()} className="custom-class" />
    )
    
    const element = container.firstChild as HTMLElement
    expect(element.className).toContain('custom-class')
  })

  it('should display Arabic numerals in countdown', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000)
    const { container } = render(<ClassCountdown targetDate={futureDate.toISOString()} />)
    
    // Should contain Arabic text for time units
    expect(container.textContent).toMatch(/ساعة|دقيقة|ثانية/)
  })
})
