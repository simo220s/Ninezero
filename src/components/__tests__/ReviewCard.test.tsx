import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ReviewCard } from '../ReviewCard'
import type { Review } from '../ReviewCard'

describe('ReviewCard', () => {
  const mockReview: Review = {
    id: '1',
    student_name: 'أحمد محمد',
    rating: 5,
    comment: 'تجربة رائعة جداً مع الأستاذ',
    created_at: new Date().toISOString()
  }

  it('should render student name', () => {
    const { container } = render(<ReviewCard review={mockReview} />)
    expect(container.textContent).toContain('أحمد محمد')
  })

  it('should render comment', () => {
    const { container } = render(<ReviewCard review={mockReview} />)
    expect(container.textContent).toContain('تجربة رائعة جداً مع الأستاذ')
  })

  it('should render rating stars', () => {
    const { container } = render(<ReviewCard review={mockReview} />)
    // StarRating component should be rendered
    const stars = container.querySelectorAll('svg')
    expect(stars.length).toBeGreaterThan(0)
  })

  it('should render relative time', () => {
    const { container } = render(<ReviewCard review={mockReview} />)
    // Should contain Arabic relative time text
    expect(container.textContent).toMatch(/اليوم|أمس|منذ/)
  })

  it('should render student initial in avatar', () => {
    const { container } = render(<ReviewCard review={mockReview} />)
    expect(container.textContent).toContain('أ') // First letter of أحمد
  })

  it('should apply custom className', () => {
    const { container } = render(<ReviewCard review={mockReview} className="custom-class" />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('custom-class')
  })

  it('should handle different ratings', () => {
    const review3Star = { ...mockReview, rating: 3 }
    const { container } = render(<ReviewCard review={review3Star} />)
    expect(container).toBeTruthy()
  })
})
