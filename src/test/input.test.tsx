/**
 * Input Component Tests
 * 
 * Tests for form input visibility and accessibility
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '@/components/ui/input'

describe('Input Component - Visibility and Accessibility', () => {
  describe('Border Styles', () => {
    it('renders with visible default border (2px solid gray-300)', () => {
      render(<Input placeholder="Test input" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      
      // Check that border classes are applied
      expect(input).toHaveClass('border-2')
      expect(input).toHaveClass('border-gray-300')
    })

    it('renders with error border (2px solid red-500)', () => {
      render(
        <Input 
          placeholder="Test input" 
          error="This field is required"
          data-testid="test-input" 
        />
      )
      const input = screen.getByTestId('test-input')
      
      // Check that error border classes are applied
      expect(input).toHaveClass('border-2')
      expect(input).toHaveClass('border-red-500')
    })

    it('has focus-visible ring styles for primary state', () => {
      render(<Input placeholder="Test input" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      
      // Check that focus ring classes are present
      expect(input).toHaveClass('focus-visible:ring-2')
      expect(input).toHaveClass('focus-visible:border-primary-600')
    })

    it('has focus-visible ring styles for error state', () => {
      render(
        <Input 
          placeholder="Test input" 
          error="Error message"
          data-testid="test-input" 
        />
      )
      const input = screen.getByTestId('test-input')
      
      // Check that error focus ring classes are present
      expect(input).toHaveClass('focus-visible:ring-2')
      expect(input).toHaveClass('focus-visible:border-red-500')
    })
  })

  describe('Label and Error Message Visibility', () => {
    it('renders label when provided', () => {
      render(<Input label="Email Address" placeholder="Enter email" />)
      
      expect(screen.getByText('Email Address')).toBeInTheDocument()
    })

    it('renders error message when error prop is provided', () => {
      render(
        <Input 
          label="Email" 
          error="البريد الإلكتروني غير صحيح"
          placeholder="Enter email"
        />
      )
      
      expect(screen.getByText('البريد الإلكتروني غير صحيح')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('renders helper text when provided and no error', () => {
      render(
        <Input 
          label="Password" 
          helperText="Must be at least 8 characters"
          placeholder="Enter password"
        />
      )
      
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
    })

    it('does not render helper text when error is present', () => {
      render(
        <Input 
          label="Password" 
          error="Password is required"
          helperText="Must be at least 8 characters"
          placeholder="Enter password"
        />
      )
      
      expect(screen.getByText('Password is required')).toBeInTheDocument()
      expect(screen.queryByText('Must be at least 8 characters')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('associates label with input using htmlFor', () => {
      render(<Input label="Email Address" placeholder="Enter email" />)
      
      const label = screen.getByText('Email Address')
      const input = screen.getByPlaceholderText('Enter email')
      
      expect(label).toHaveAttribute('for')
      expect(input).toHaveAttribute('id')
    })

    it('marks error message with role="alert"', () => {
      render(
        <Input 
          label="Email" 
          error="Invalid email"
          placeholder="Enter email"
        />
      )
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Invalid email')
    })

    it('applies disabled state correctly', () => {
      render(<Input label="Email" disabled placeholder="Enter email" />)
      
      const input = screen.getByPlaceholderText('Enter email')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Password Field', () => {
    it('renders password toggle button for password type', () => {
      render(<Input type="password" label="Password" placeholder="Enter password" />)
      
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-label')
    })

    it('renders as text input for non-password types', () => {
      render(<Input type="email" label="Email" placeholder="Enter email" />)
      
      const input = screen.getByPlaceholderText('Enter email')
      expect(input).toHaveAttribute('type', 'email')
    })
  })

  describe('Variants and Sizes', () => {
    it('applies default variant classes', () => {
      render(<Input placeholder="Test" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      
      expect(input).toHaveClass('border-gray-300')
    })

    it('applies medium size by default', () => {
      render(<Input placeholder="Test" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      
      expect(input).toHaveClass('h-12')
      expect(input).toHaveClass('px-4')
      expect(input).toHaveClass('py-3')
    })

    it('applies small size when specified', () => {
      render(<Input size="sm" placeholder="Test" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      
      expect(input).toHaveClass('h-9')
    })

    it('applies large size when specified', () => {
      render(<Input size="lg" placeholder="Test" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      
      expect(input).toHaveClass('h-14')
    })
  })
})
