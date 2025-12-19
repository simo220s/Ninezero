import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RegularStudentDashboard from '../RegularStudentDashboard'
import * as authContext from '@/lib/auth-context'
import * as database from '@/lib/database'

// Mock the auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn()
}))

// Mock database functions
vi.mock('@/lib/database', () => ({
  getUserCredits: vi.fn(),
  getUserProfile: vi.fn(),
  getStudentClasses: vi.fn()
}))

// Mock child components
vi.mock('../PendingReviews', () => ({
  default: () => <div data-testid="pending-reviews">Pending Reviews</div>
}))

vi.mock('../ClassScheduleTable', () => ({
  default: () => <div data-testid="class-schedule-table">Class Schedule Table</div>
}))

vi.mock('../UpcomingClassesSection', () => ({
  default: () => <div data-testid="upcoming-classes-section">Upcoming Classes Section</div>
}))

vi.mock('../SubscriptionManagement', () => ({
  default: () => <div data-testid="subscription-management">Subscription Management</div>
}))

vi.mock('../MobileNavigation', () => ({
  default: () => <div data-testid="mobile-navigation">Mobile Navigation</div>
}))

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

vi.mock('@/components/DashboardNav', () => ({
  default: () => <div data-testid="dashboard-nav">Dashboard Nav</div>
}))

describe('RegularStudentDashboard RTL Support', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      first_name: 'أحمد',
      last_name: 'محمد'
    },
    created_at: '2024-01-01T00:00:00Z'
  }

  const mockCredits = {
    credits: 5,
    user_id: 'test-user-id'
  }

  const mockProfile = {
    first_name: 'أحمد',
    last_name: 'محمد',
    user_id: 'test-user-id'
  }

  const mockClasses = [
    {
      id: '1',
      date: '2024-12-01',
      time: '10:00',
      duration: 60,
      meeting_link: 'https://meet.example.com/1',
      status: 'scheduled'
    },
    {
      id: '2',
      date: '2024-11-15',
      time: '14:00',
      duration: 60,
      status: 'completed'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup auth mock
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: mockUser,
      signOut: vi.fn(),
      loading: false
    } as any)

    // Setup database mocks
    vi.mocked(database.getUserCredits).mockResolvedValue({
      data: mockCredits,
      error: null
    } as any)

    vi.mocked(database.getUserProfile).mockResolvedValue({
      data: mockProfile,
      error: null
    } as any)

    vi.mocked(database.getStudentClasses).mockResolvedValue({
      data: mockClasses,
      error: null
    } as any)
  })

  it('should have dir="rtl" on the main container', async () => {
    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for loading to complete
    await screen.findByText(/مرحباً بك في رحلة التعلم!/i)

    // Check main container has RTL direction
    const mainContainer = container.querySelector('.min-h-screen')
    expect(mainContainer).toHaveAttribute('dir', 'rtl')
  })

  it('should have dir="rtl" on the header', async () => {
    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    await screen.findByText(/مرحباً بك في رحلة التعلم!/i)

    const header = container.querySelector('header')
    expect(header).toHaveAttribute('dir', 'rtl')
  })

  it('should have dir="rtl" on the main content area', async () => {
    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    await screen.findByText(/مرحباً بك في رحلة التعلم!/i)

    const main = container.querySelector('main')
    expect(main).toHaveAttribute('dir', 'rtl')
  })

  it('should have text-right alignment on card content', async () => {
    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    await screen.findByText(/مرحباً بك في رحلة التعلم!/i)

    // Check that cards have text-right class
    const cardContents = container.querySelectorAll('[class*="text-right"]')
    expect(cardContents.length).toBeGreaterThan(0)
  })

  it('should have dir="rtl" on all cards', async () => {
    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    await screen.findByText(/مرحباً بك في رحلة التعلم!/i)

    // Find cards with dir="rtl"
    const cards = container.querySelectorAll('[dir="rtl"]')
    expect(cards.length).toBeGreaterThan(5) // Multiple cards should have RTL
  })

  it('should have flex-row-reverse for icon and text layouts', async () => {
    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    await screen.findByText(/مرحباً بك في رحلة التعلم!/i)

    // Check for flex-row-reverse classes
    const flexReverse = container.querySelectorAll('[class*="flex-row-reverse"]')
    expect(flexReverse.length).toBeGreaterThan(0)
  })

  it('should display Arabic text properly aligned', async () => {
    render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for Arabic text to appear
    const arabicText = await screen.findByText(/مرحباً بك في رحلة التعلم!/i)
    expect(arabicText).toBeInTheDocument()

    // Check that the parent has text-right
    const parent = arabicText.closest('[class*="text-right"]')
    expect(parent).toBeInTheDocument()
  })

  it('should have RTL support in loading state', () => {
    // Mock loading state
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: mockUser,
      signOut: vi.fn(),
      loading: true
    } as any)

    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Check loading skeleton has RTL
    const loadingContainer = container.querySelector('.min-h-screen')
    expect(loadingContainer).toHaveAttribute('dir', 'rtl')
  })

  it('should have RTL support in error state', async () => {
    // Mock error state
    vi.mocked(database.getUserCredits).mockResolvedValue({
      data: null,
      error: new Error('Test error')
    } as any)

    const { container } = render(
      <BrowserRouter>
        <RegularStudentDashboard />
      </BrowserRouter>
    )

    // Wait for error to appear
    await screen.findByText(/خطأ في التحميل/i)

    // Check error container has RTL
    const errorContainer = container.querySelector('.min-h-screen')
    expect(errorContainer).toHaveAttribute('dir', 'rtl')
  })
})
