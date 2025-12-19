import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RiyalPrice } from '../RiyalPrice'

describe('RiyalPrice', () => {
  it('should render price with ر.س symbol by default', () => {
    const { container } = render(<RiyalPrice amount={150} />)
    expect(container.textContent).toContain('ر.س')
  })

  it('should render price without symbol when showSymbol is false', () => {
    const { container } = render(<RiyalPrice amount={150} showSymbol={false} />)
    expect(container.textContent).not.toContain('ر.س')
  })

  it('should apply custom className', () => {
    const { container } = render(<RiyalPrice amount={150} className="custom-class" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('custom-class')
  })

  it('should format decimal amounts correctly', () => {
    const { container } = render(<RiyalPrice amount={99.99} />)
    expect(container.textContent).toContain('ر.س')
  })

  it('should handle zero amount', () => {
    const { container } = render(<RiyalPrice amount={0} />)
    expect(container.textContent).toContain('ر.س')
  })

  it('should handle large amounts', () => {
    const { container } = render(<RiyalPrice amount={10000} />)
    expect(container.textContent).toContain('ر.س')
  })
})
