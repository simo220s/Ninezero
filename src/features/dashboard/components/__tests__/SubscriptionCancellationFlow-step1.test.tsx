import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubscriptionCancellationFlow from '../SubscriptionCancellationFlow'

describe('SubscriptionCancellationFlow - Step 1: Feedback Form', () => {
  it('renders the feedback form with all cancellation reasons', () => {
    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    )

    // Check title
    expect(screen.getByText('لماذا تريد إلغاء الاشتراك؟')).toBeInTheDocument()

    // Check all 6 cancellation reasons are present
    expect(screen.getByText('السعر مرتفع')).toBeInTheDocument()
    expect(screen.getByText('لا أستخدم الخدمة بشكل كافٍ')).toBeInTheDocument()
    expect(screen.getByText('جودة الحصص لا تلبي التوقعات')).toBeInTheDocument()
    expect(screen.getByText('وجدت بديل أفضل')).toBeInTheDocument()
    expect(screen.getByText('مشاكل تقنية')).toBeInTheDocument()
    expect(screen.getByText('أخرى')).toBeInTheDocument()
  })

  it('shows validation error when submitting without selecting a reason', async () => {
    const user = userEvent.setup()
    
    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    )

    // Click submit button without selecting any reason
    const submitButton = screen.getByText('متابعة')
    await user.click(submitButton)

    // Check validation error appears
    expect(screen.getByText('يرجى اختيار سبب واحد على الأقل')).toBeInTheDocument()
  })

  it('allows selecting multiple cancellation reasons', async () => {
    const user = userEvent.setup()
    
    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    )

    // Get checkboxes
    const checkboxes = screen.getAllByRole('checkbox')

    // Select first two reasons
    await user.click(checkboxes[0])
    await user.click(checkboxes[1])

    // Verify they are checked
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).toBeChecked()
  })

  it('clears validation error when user selects a reason', async () => {
    const user = userEvent.setup()
    
    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    )

    // Try to submit without selection to trigger error
    const submitButton = screen.getByText('متابعة')
    await user.click(submitButton)

    // Verify error is shown
    expect(screen.getByText('يرجى اختيار سبب واحد على الأقل')).toBeInTheDocument()

    // Select a reason
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // Verify error is cleared
    await waitFor(() => {
      expect(screen.queryByText('يرجى اختيار سبب واحد على الأقل')).not.toBeInTheDocument()
    })
  })

  it('progresses to step 2 after valid submission', async () => {
    const user = userEvent.setup()
    
    render(
      <SubscriptionCancellationFlow
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    )

    // Select a reason
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // Submit form
    const submitButton = screen.getByText('متابعة')
    await user.click(submitButton)

    // Verify step 2 placeholder is shown
    await waitFor(() => {
      expect(screen.getByText(/المرحلة 2: عرض الاحتفاظ/)).toBeInTheDocument()
    })
  })
})
