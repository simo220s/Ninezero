import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RegularStudentDashboard from '../RegularStudentDashboard'
import { useAuth } from '@/lib/auth-context'

// Mock dependencies
vi.mock('@/lib/auth-context')
vi.mock('@/lib/database', () => ({
  getUserCredits: vi.fn().mockResolvedValue({ data: { credits: 5 }, error: null }),
  getUserProfile: vi.fn().mockResolvedValue({ 
    data: { first_name: 'أحمد', last_name: 'محمد' }, 
    error: null 
  }),
  getStudentClasses: vi.fn().mockResolvedValue({ data: [], error: null })
}))
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    first_name: 'أحمد',
    last_name: 'محمد'
  },
  created_at: '2024-01-01T00:00:00Z'
}

const mockSignOut = vi.fn()

describe('RegularStudentDashboard - Hamburger Menu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      loading: false,
      session: null,
      signIn: vi.fn(),
      signUp: vi.fn()
    })
  })

  it('should display hamburger menu button', async () => {
    render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/جاري التحميل/i)).not.toBeInTheDocument()
    })

    // Check for hamburger menu button by aria-label
    const hamburgerButton = screen.getByLabelText('فتح القائمة')
    expect(hamburgerButton).toBeInTheDocument()
  })

  it('should open mobile navigation when hamburger button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/جاري التحميل/i)).not.toBeInTheDocument()
    })

    // Click hamburger button
    const hamburgerButton = screen.getByLabelText('فتح القائمة')
    await user.click(hamburgerButton)

    // Check if mobile navigation is visible
    await waitFor(() => {
      expect(screen.getByText('القائمة')).toBeInTheDocument()
    })
  })

  it('should display navigation items in mobile menu', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/جاري التحميل/i)).not.toBeInTheDocument()
    })

    // Open mobile navigation
    const hamburgerButton = screen.getByLabelText('فتح القائمة')
    await user.click(hamburgerButton)

    // Check for navigation items
    await waitFor(() => {
      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument()
      expect(screen.getByText('حجز حصة')).toBeInTheDocument()
      expect(screen.getByText('شراء رصيد')).toBeInTheDocument()
    })
  })

  it('should close mobile navigation when close button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/جاري التحميل/i)).not.toBeInTheDocument()
    })

    // Open mobile navigation
    const hamburgerButton = screen.getByLabelText('فتح القائمة')
    await user.click(hamburgerButton)

    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText('القائمة')).toBeInTheDocument()
    })

    // Find and click close button (X icon)
    const closeButtons = screen.getAllByRole('button')
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('svg') && btn.className.includes('rounded-full')
    )
    
    if (closeButton) {
      await user.click(closeButton)

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText('القائمة')).not.toBeInTheDocument()
      })
    }
  })

  it('should display user profile information in mobile menu', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/جاري التحميل/i)).not.toBeInTheDocument()
    })

    // Open mobile navigation
    const hamburgerButton = screen.getByLabelText('فتح القائمة')
    await user.click(hamburgerButton)

    // Check for user profile info
    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })
})
