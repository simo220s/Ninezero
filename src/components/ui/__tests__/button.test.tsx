import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Button } from '../button'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Button Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders button with children', () => {
    const { getByText } = render(<Button>Click me</Button>)
    expect(getByText('Click me')).toBeDefined()
  })

  it('handles onClick event', () => {
    const handleClick = vi.fn()
    const { getByText } = render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = getByText('Click me')
    button.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles async onClick event', async () => {
    const asyncClick = vi.fn().mockResolvedValue(undefined)
    const { getByText } = render(<Button onClick={asyncClick}>Async Click</Button>)
    
    const button = getByText('Async Click')
    button.click()
    
    // Wait a bit for async to complete
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(asyncClick).toHaveBeenCalledTimes(1)
  })

  it('navigates when href is provided', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Button href="/test-route">Navigate</Button>
      </BrowserRouter>
    )
    
    const button = getByText('Navigate')
    button.click()
    
    expect(mockNavigate).toHaveBeenCalledWith('/test-route')
  })

  it('shows loading state', () => {
    const { getByText, queryByText } = render(<Button loading>Loading Button</Button>)
    
    expect(getByText('جاري المعالجة...')).toBeDefined()
    expect(queryByText('Loading Button')).toBeNull()
  })

  it('disables button when disabled prop is true', () => {
    const handleClick = vi.fn()
    const { getByText } = render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = getByText('Disabled') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    
    button.click()
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('disables button when loading', () => {
    const handleClick = vi.fn()
    const { getByText } = render(<Button loading onClick={handleClick}>Loading</Button>)
    
    const button = getByText('جاري المعالجة...') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    const button = container.querySelector('button')
    
    expect(button?.className).toContain('border-2')
    expect(button?.className).toContain('border-primary-600')
  })

  it('applies size classes correctly', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    const button = container.querySelector('button')
    
    expect(button?.className).toContain('h-9')
    expect(button?.className).toContain('px-4')
  })

  it('handles asChild prop for Link components', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      </BrowserRouter>
    )
    
    expect(getByText('Link Button')).toBeDefined()
  })

  it('prevents action when disabled and clicked', () => {
    const handleClick = vi.fn()
    const { getByText } = render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = getByText('Disabled')
    button.click()
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows processing state during async operation', async () => {
    const slowAsyncClick = vi.fn(() => new Promise(resolve => setTimeout(resolve, 50)))
    const { getByText, findByText } = render(<Button onClick={slowAsyncClick}>Async</Button>)
    
    const button = getByText('Async')
    button.click()
    
    // Should show loading state immediately
    const loadingText = await findByText('جاري المعالجة...')
    expect(loadingText).toBeDefined()
    
    // Should complete after async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    const completedButton = await findByText('Async')
    expect(completedButton).toBeDefined()
  })
})
