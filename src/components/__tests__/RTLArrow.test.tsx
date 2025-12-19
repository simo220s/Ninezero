import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RTLArrow } from '../RTLArrow'

describe('RTLArrow', () => {
  it('should render forward arrow', () => {
    const { container } = render(<RTLArrow direction="forward" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should render back arrow', () => {
    const { container } = render(<RTLArrow direction="back" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should render up arrow', () => {
    const { container } = render(<RTLArrow direction="up" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should render down arrow', () => {
    const { container } = render(<RTLArrow direction="down" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should apply custom className', () => {
    const { container } = render(<RTLArrow direction="forward" className="custom-class" />)
    const svg = container.querySelector('svg')
    expect(svg?.className.baseVal).toContain('custom-class')
  })

  it('should apply custom size', () => {
    const { container } = render(<RTLArrow direction="forward" size={32} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
  })

  it('should have RTL transform for forward direction', () => {
    const { container } = render(<RTLArrow direction="forward" />)
    const svg = container.querySelector('svg')
    // Forward arrow should be rotated 180deg for RTL
    expect(svg?.style.transform).toContain('rotate(180deg)')
  })

  it('should have RTL transform for back direction', () => {
    const { container } = render(<RTLArrow direction="back" />)
    const svg = container.querySelector('svg')
    // Back arrow should be rotated 180deg for RTL
    expect(svg?.style.transform).toContain('rotate(180deg)')
  })
})
