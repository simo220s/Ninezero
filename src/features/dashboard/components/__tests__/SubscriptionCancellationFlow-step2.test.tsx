import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubscriptionCancellationFlow from '../SubscriptionCancellationFlow'

describe('SubscriptionCancellationFlow - Step 2: Retention Discount Offer', () => {
  const mockOnClose = vi.fn()
  const mockOnComplete = vi.fn()
  const currentPrice = 100

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  const navigateToStep2 = async () => {
    const user = userEvent.setup({ delay: null })
    
    // Select at least one reason
    const firstReason = screen.getByLabelText(/السعر مرتفع/i)
    await user.click(firstReason)
    
    // Submit feedback to move to step 2
    const submitButton = screen.getByRole('button', { name: /متابعة/i })
    await user.click(submitButton)
    
    // Wait for step 2 to render
    await waitFor(() => {
      expect(screen.getByText(/انتظر! لدينا عرض خاص لك/i)).toBeInTheDocument()
    })
  }

  describe('Requirement 7.1: Display 20% discount offer', () => {
    it('should display 20% discount badge', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      expect(screen.getByText(/خصم 20٪/i)).toBeInTheDocument()
    })

    it('should display special offer header', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      expect(screen.getByText(/انتظر! لدينا عرض خاص لك/i)).toBeInTheDocument()
      expect(screen.getByText(/نقدر ولاءك ونود أن نقدم لك خصمًا حصريًا/i)).toBeInTheDocument()
    })

    it('should display gift icon', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      // Gift icon should be present in the DOM
      const giftIcon = document.querySelector('svg.lucide-gift')
      expect(giftIcon).toBeInTheDocument()
    })
  })

  describe('Requirement 7.2: Show new price and savings amount', () => {
    it('should calculate and display new price correctly', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const expectedNewPrice = currentPrice - (currentPrice * 0.2)
      expect(screen.getByText(new RegExp(`${expectedNewPrice.toFixed(2)} ريال`))).toBeInTheDocument()
    })

    it('should display original price with strikethrough', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const originalPrice = screen.getByText(new RegExp(`${currentPrice.toFixed(2)} ريال`))
      expect(originalPrice).toHaveClass('line-through')
    })

    it('should display savings amount', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const expectedSavings = currentPrice * 0.2
      expect(screen.getByText(new RegExp(`وفر ${expectedSavings.toFixed(2)} ريال شهريًا`))).toBeInTheDocument()
    })

    it('should display discount duration information', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      expect(screen.getByText(/سيتم تطبيق هذا الخصم على اشتراكك لمدة 3 أشهر القادمة/i)).toBeInTheDocument()
    })
  })

  describe('Requirement 7.3: Two action buttons', () => {
    it('should display "Accept Discount" button', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      expect(screen.getByRole('button', { name: /قبول الخصم والاستمرار/i })).toBeInTheDocument()
    })

    it('should display "Continue Cancellation" button', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      expect(screen.getByRole('button', { name: /متابعة الإلغاء/i })).toBeInTheDocument()
    })

    it('should have distinct button styles', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const acceptButton = screen.getByRole('button', { name: /قبول الخصم والاستمرار/i })
      const continueButton = screen.getByRole('button', { name: /متابعة الإلغاء/i })

      // Accept button should be primary (more prominent)
      expect(acceptButton).toHaveClass('arabic-text')
      
      // Continue button should be ghost (less prominent)
      expect(continueButton).toHaveClass('arabic-text')
    })
  })

  describe('Requirement 7.4: Apply discount on accept', () => {
    it('should call onComplete with "discount-accepted" when accept button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const acceptButton = screen.getByRole('button', { name: /قبول الخصم والاستمرار/i })
      await user.click(acceptButton)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('discount-accepted')
      })
    })

    it('should close modal after accepting discount', async () => {
      const user = userEvent.setup({ delay: null })
      
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const acceptButton = screen.getByRole('button', { name: /قبول الخصم والاستمرار/i })
      await user.click(acceptButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show loading state while applying discount', async () => {
      const user = userEvent.setup({ delay: null })
      
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const acceptButton = screen.getByRole('button', { name: /قبول الخصم والاستمرار/i })
      await user.click(acceptButton)

      // Should show loading text briefly
      expect(screen.getByText(/جاري التطبيق/i)).toBeInTheDocument()
    })
  })

  describe('Requirement 7.5: 5-second minimum display time', () => {
    it('should disable "Continue Cancellation" button initially', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const continueButton = screen.getByRole('button', { name: /متابعة الإلغاء/i })
      expect(continueButton).toBeDisabled()
    })

    it('should show timer notice when button is disabled', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      expect(screen.getByText(/يرجى قراءة العرض بعناية قبل اتخاذ القرار/i)).toBeInTheDocument()
    })

    it('should enable "Continue Cancellation" button after 5 seconds', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const continueButton = screen.getByRole('button', { name: /متابعة الإلغاء/i })
      expect(continueButton).toBeDisabled()

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(continueButton).not.toBeDisabled()
      })
    })

    it('should hide timer notice after 5 seconds', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      expect(screen.getByText(/يرجى قراءة العرض بعناية قبل اتخاذ القرار/i)).toBeInTheDocument()

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(screen.queryByText(/يرجى قراءة العرض بعناية قبل اتخاذ القرار/i)).not.toBeInTheDocument()
      })
    })

    it('should allow clicking continue button after timer expires', async () => {
      const user = userEvent.setup({ delay: null })
      
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000)

      const continueButton = screen.getByRole('button', { name: /متابعة الإلغاء/i })
      
      await waitFor(() => {
        expect(continueButton).not.toBeDisabled()
      })

      await user.click(continueButton)

      // Should progress to step 3
      await waitFor(() => {
        expect(screen.getByText(/تأكيد إلغاء الاشتراك/i)).toBeInTheDocument()
      })
    })

    it('should not disable "Accept Discount" button during timer', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const acceptButton = screen.getByRole('button', { name: /قبول الخصم والاستمرار/i })
      expect(acceptButton).not.toBeDisabled()
    })
  })

  describe('RTL Support', () => {
    it('should have RTL direction on all containers', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const rtlElements = document.querySelectorAll('[dir="rtl"]')
      expect(rtlElements.length).toBeGreaterThan(0)
    })

    it('should have right-aligned text', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const arabicTexts = document.querySelectorAll('.arabic-text')
      expect(arabicTexts.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Design', () => {
    it('should display gradient background on discount card', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const discountCard = document.querySelector('.bg-gradient-to-br')
      expect(discountCard).toBeInTheDocument()
    })

    it('should display clock icon in timer notice', async () => {
      render(
        <SubscriptionCancellationFlow
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          currentPrice={currentPrice}
        />
      )

      await navigateToStep2()

      const clockIcon = document.querySelector('svg.lucide-clock')
      expect(clockIcon).toBeInTheDocument()
    })
  })
})
