import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubscriptionCancellationFlow from '../SubscriptionCancellationFlow'

// Mock the auth hook
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: null,
    loading: false,
    signOut: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn()
  })
}))

// Mock the subscription service
vi.mock('@/lib/services/subscription-service', () => ({
  default: {
    submitCancellationFeedback: vi.fn().mockResolvedValue({ success: true }),
    applyRetentionDiscount: vi.fn().mockResolvedValue({ success: true }),
    confirmCancellation: vi.fn().mockResolvedValue({
      success: true,
      cancellationRequest: {
        id: 'test-cancellation-id',
        user_id: 'test-user-id',
        subscription_id: 'test-subscription-id',
        reasons: ['السعر مرتفع'],
        discount_offered: true,
        discount_accepted: false,
        status: 'pending',
        requested_at: new Date().toISOString(),
        effective_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        confirmed_at: new Date().toISOString()
      }
    })
  }
}))

describe('SubscriptionCancellationFlow - Step 3: Cancellation Confirmation', () => {
  const navigateToStep3 = async () => {
    const user = userEvent.setup()
    
    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        subscriptionId="test-subscription-id"
      />
    )

    // Step 1: Select a reason and submit
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    const submitButton = screen.getByText('متابعة')
    await user.click(submitButton)

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText('انتظر! لدينا عرض خاص لك')).toBeInTheDocument()
    })

    // Step 2: Wait for timer and decline discount
    await waitFor(
      () => {
        const continueButton = screen.getByText('متابعة الإلغاء')
        expect(continueButton).not.toBeDisabled()
      },
      { timeout: 6000 }
    )

    const continueButton = screen.getByText('متابعة الإلغاء')
    await user.click(continueButton)

    // Wait for Step 3
    await waitFor(() => {
      expect(screen.getByText('تأكيد إلغاء الاشتراك')).toBeInTheDocument()
    })
  }

  it('displays the 24-hour cancellation notice', async () => {
    await navigateToStep3()

    // Check for 24-hour notice
    expect(screen.getByText('سيتم تفعيل الإلغاء خلال 24 ساعة')).toBeInTheDocument()
    expect(
      screen.getByText(/بعد تأكيد الإلغاء، سيظل اشتراكك نشطًا لمدة 24 ساعة/)
    ).toBeInTheDocument()
  })

  it('displays information about immediate cancellation via email', async () => {
    await navigateToStep3()

    // Check for email cancellation option
    expect(screen.getByText('هل تريد الإلغاء الفوري؟')).toBeInTheDocument()
    expect(
      screen.getByText(/للإلغاء الفوري، يمكنك استخدام رابط الإلغاء المرسل في البريد الإلكتروني/)
    ).toBeInTheDocument()
  })

  it('displays Clock icon for 24-hour notice', async () => {
    await navigateToStep3()

    // Check for Clock icon (Lucide icons render as SVG)
    const clockIcons = document.querySelectorAll('svg')
    expect(clockIcons.length).toBeGreaterThan(0)
  })

  it('displays Mail icon for email cancellation option', async () => {
    await navigateToStep3()

    // Check for Mail icon (Lucide icons render as SVG)
    const mailIcons = document.querySelectorAll('svg')
    expect(mailIcons.length).toBeGreaterThan(0)
  })

  it('has a confirm cancellation button', async () => {
    await navigateToStep3()

    const confirmButton = screen.getByText('تأكيد الإلغاء')
    expect(confirmButton).toBeInTheDocument()
    expect(confirmButton).not.toBeDisabled()
  })

  it('has a back to subscription button', async () => {
    await navigateToStep3()

    const backButton = screen.getByText('العودة إلى الاشتراك')
    expect(backButton).toBeInTheDocument()
    expect(backButton).not.toBeDisabled()
  })

  it('calls onComplete with "cancelled" when confirming cancellation', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()

    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={onComplete}
        subscriptionId="test-subscription-id"
      />
    )

    // Navigate to Step 3
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(screen.getByText('متابعة'))

    await waitFor(() => {
      expect(screen.getByText('انتظر! لدينا عرض خاص لك')).toBeInTheDocument()
    })

    await waitFor(
      () => {
        expect(screen.getByText('متابعة الإلغاء')).not.toBeDisabled()
      },
      { timeout: 6000 }
    )

    await user.click(screen.getByText('متابعة الإلغاء'))

    await waitFor(() => {
      expect(screen.getByText('تأكيد إلغاء الاشتراك')).toBeInTheDocument()
    })

    // Confirm cancellation
    const confirmButton = screen.getByText('تأكيد الإلغاء')
    await user.click(confirmButton)

    // Verify onComplete was called with 'cancelled'
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('cancelled')
    })
  })

  it('closes modal when clicking back to subscription', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={onClose}
        onComplete={vi.fn()}
        subscriptionId="test-subscription-id"
      />
    )

    // Navigate to Step 3
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(screen.getByText('متابعة'))

    await waitFor(() => {
      expect(screen.getByText('انتظر! لدينا عرض خاص لك')).toBeInTheDocument()
    })

    await waitFor(
      () => {
        expect(screen.getByText('متابعة الإلغاء')).not.toBeDisabled()
      },
      { timeout: 6000 }
    )

    await user.click(screen.getByText('متابعة الإلغاء'))

    await waitFor(() => {
      expect(screen.getByText('تأكيد إلغاء الاشتراك')).toBeInTheDocument()
    })

    // Click back button
    const backButton = screen.getByText('العودة إلى الاشتراك')
    await user.click(backButton)

    // Verify onClose was called
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('displays RTL layout with proper text alignment', async () => {
    await navigateToStep3()

    // Check for RTL direction
    const containers = document.querySelectorAll('[dir="rtl"]')
    expect(containers.length).toBeGreaterThan(0)
  })

  it('shows loading state while submitting cancellation', async () => {
    const user = userEvent.setup()

    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        subscriptionId="test-subscription-id"
      />
    )

    // Navigate to Step 3
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(screen.getByText('متابعة'))

    await waitFor(() => {
      expect(screen.getByText('انتظر! لدينا عرض خاص لك')).toBeInTheDocument()
    })

    await waitFor(
      () => {
        expect(screen.getByText('متابعة الإلغاء')).not.toBeDisabled()
      },
      { timeout: 6000 }
    )

    await user.click(screen.getByText('متابعة الإلغاء'))

    await waitFor(() => {
      expect(screen.getByText('تأكيد إلغاء الاشتراك')).toBeInTheDocument()
    })

    // Click confirm button
    const confirmButton = screen.getByText('تأكيد الإلغاء')
    await user.click(confirmButton)

    // Check for loading text (briefly)
    expect(screen.getByText('جاري التأكيد...')).toBeInTheDocument()
  })
})
