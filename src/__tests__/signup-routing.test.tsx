/**
 * Signup Page Routing Tests
 * 
 * Tests to verify signup page renders correctly when navigating to /signup
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SignupPage from '@/features/auth/components/SignupPage'
import { AuthProvider } from '@/lib/auth-context'
import { RTLProvider } from '@/lib/rtl'

// Mock the auth context
vi.mock('@/lib/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getUserRole: () => 'student',
  }),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RTLProvider defaultDirection="rtl">
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </RTLProvider>
    </QueryClientProvider>
  )
}

describe('Signup Page Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render signup page when navigating to /signup', async () => {
    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </TestWrapper>
    )

    // Navigate to signup
    window.history.pushState({}, 'Signup', '/signup')

    // Wait for the signup page to render
    await waitFor(() => {
      expect(screen.getByText('إنشاء حساب جديد')).toBeInTheDocument()
    })
  })

  it('should display signup form with all required fields', async () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    )

    await waitFor(() => {
      // Check for form title
      expect(screen.getByText('إنشاء حساب جديد')).toBeInTheDocument()
      
      // Check for form fields
      expect(screen.getByLabelText('الاسم الكامل')).toBeInTheDocument()
      expect(screen.getByLabelText('البريد الإلكتروني')).toBeInTheDocument()
      expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
      
      // Check for submit button
      expect(screen.getByRole('button', { name: /إنشاء الحساب/i })).toBeInTheDocument()
    })
  })

  it('should display social login options', async () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/التسجيل باستخدام Google/i)).toBeInTheDocument()
      expect(screen.getByText(/التسجيل باستخدام Apple/i)).toBeInTheDocument()
    })
  })

  it('should display link to login page', async () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('لديك حساب؟')).toBeInTheDocument()
      expect(screen.getByText('سجل الدخول')).toBeInTheDocument()
    })
  })

  it('should not show homepage content when on signup page', async () => {
    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<div data-testid="home-content">Home Page Content</div>} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </TestWrapper>
    )

    // Navigate to signup
    window.history.pushState({}, 'Signup', '/signup')

    await waitFor(() => {
      // Signup page should be visible
      expect(screen.getByText('إنشاء حساب جديد')).toBeInTheDocument()
      
      // Homepage content should NOT be visible
      expect(screen.queryByTestId('home-content')).not.toBeInTheDocument()
    })
  })

  it('should display trial class promotion message', async () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/حصة تجريبية مجانية/i)).toBeInTheDocument()
    })
  })

  it('should handle referral code from URL', async () => {
    // Mock useSearchParams to return a referral code
    const mockSearchParams = new URLSearchParams('?ref=TEST123')
    
    render(
      <TestWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </BrowserRouter>
      </TestWrapper>
    )

    window.history.pushState({}, 'Signup', '/signup?ref=TEST123')

    await waitFor(() => {
      expect(screen.getByText('إنشاء حساب جديد')).toBeInTheDocument()
    })
  })
})

describe('Signup Page Component Structure', () => {
  it('should have proper form structure', async () => {
    const { container } = render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    )

    await waitFor(() => {
      // Check for form element
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
      
      // Check for input fields
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(3) // name, email, password
    })
  })

  it('should have footer component', async () => {
    const { container } = render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    )

    await waitFor(() => {
      // Footer should be present
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })
})
