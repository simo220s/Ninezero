import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/lib/auth-context'
import { RTLProvider } from '@/lib/rtl'
import ErrorBoundary from '@/components/ui/error-boundary'
import { ToastContainer, useToast } from '@/components/ui/toast'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import WebVitals from '@/components/WebVitals'
import { AuthRedirect, StudentRoute, TeacherRoute, AdminRoute } from '@/components/ProtectedRoute'
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp'

// Lazy load components for better performance
import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { createLandingPageRoute, createDashboardRoute, createAuthRoute } from '@/components/LazyRoute'

// Landing page
const HomePage = createLandingPageRoute(() => import('@/features/landing/components/HomePage'))
const TutorProfilePage = createLandingPageRoute(() => import('@/features/tutor/components/TutorProfilePage'))

// Auth pages
const SignupPage = createAuthRoute(() => import('@/features/auth/components/SignupPage'))
const LoginPage = createAuthRoute(() => import('@/features/auth/components/LoginPage'))
const ForgotPasswordPage = createAuthRoute(() => import('@/features/auth/components/ForgotPasswordPage'))
const ResetPasswordPage = createAuthRoute(() => import('@/features/auth/components/ResetPasswordPage'))

// Dashboard pages
const StudentDashboardRouter = createDashboardRoute(() => import('@/features/dashboard/components/StudentDashboardRouter'))
const TeacherDashboard = createDashboardRoute(() => import('@/features/dashboard/components/TeacherDashboard'))
const AdminDashboard = createDashboardRoute(() => import('@/features/admin/components/AdminDashboard'))

// Admin pages
const AdminOverview = createDashboardRoute(() => import('@/features/admin/components/AdminOverview'))
const UserManagement = createDashboardRoute(() => import('@/features/admin/components/UserManagement'))
const ClassManagement = createDashboardRoute(() => import('@/features/admin/components/ClassManagement'))
const CreditManagement = createDashboardRoute(() => import('@/features/admin/components/CreditManagement'))
const AdminReviewManagement = createDashboardRoute(() => import('@/features/admin/components/ReviewManagement'))
const SystemSettings = createDashboardRoute(() => import('@/features/admin/components/SystemSettings'))
const RegularStudentsPage = createDashboardRoute(() => import('@/features/admin/pages/RegularStudentsPage'))
const DiscountManagement = createDashboardRoute(() => import('@/features/admin/components/DiscountManagement'))
const SubscriptionOverviewPage = createDashboardRoute(() => import('@/features/admin/pages/SubscriptionOverviewPage'))

// Booking pages
const BookTrialPage = createDashboardRoute(() => import('@/features/booking/components/BookTrialPage'))
const BookRegularPage = createDashboardRoute(() => import('@/features/booking/components/BookRegularPage'))

// Student pages
const RegularDashboardClasses = createDashboardRoute(() => import('@/features/dashboard/pages/RegularDashboardClasses'))
const RegularDashboardSubscription = createDashboardRoute(() => import('@/features/dashboard/pages/RegularDashboardSubscription'))

// Teacher Management pages
const CreditManagementPage = createDashboardRoute(() => import('@/features/dashboard/pages/CreditManagementPage'))
const UserManagementPage = createDashboardRoute(() => import('@/features/dashboard/pages/UserManagementPage'))
const StudentManagementPage = createDashboardRoute(() => import('@/features/dashboard/pages/StudentManagementPage'))
const ClassManagementPage = createDashboardRoute(() => import('@/features/dashboard/pages/ClassManagementPage'))
const ReviewsManagementPage = createDashboardRoute(() => import('@/features/dashboard/pages/ReviewsManagementPage'))
const StatisticsPage = createDashboardRoute(() => import('@/features/dashboard/pages/StatisticsPage'))
const FinancialManagementPage = createDashboardRoute(() => import('@/features/dashboard/pages/FinancialManagementPage'))
const SubscriptionPlanManagementPage = createDashboardRoute(() => import('@/features/dashboard/pages/SubscriptionPlanManagementPage'))
const CustomPricingPage = createDashboardRoute(() => import('@/features/dashboard/pages/CustomPricingPage'))

// Error pages
const UnauthorizedPage = createAuthRoute(() => import('@/components/UnauthorizedPage'))

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Loading fallback component
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-text-secondary arabic-text">جاري التحميل...</p>
      </div>
    </div>
  )
}

function AppContent() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="App min-h-screen bg-white">
        <PerformanceMonitor />
        <WebVitals reportToAnalytics={import.meta.env.PROD} />
        <FloatingWhatsApp />
        <Suspense fallback={<RouteLoadingFallback />}>
                    <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/tutor" element={<TutorProfilePage />} />

                    {/* Auth routes - redirect if already authenticated */}
                    <Route path="/signup" element={
                      <AuthRedirect>
                        <SignupPage />
                      </AuthRedirect>
                    } />
                    <Route path="/login" element={
                      <AuthRedirect>
                        <LoginPage />
                      </AuthRedirect>
                    } />
                    <Route path="/forgot-password" element={
                      <AuthRedirect>
                        <ForgotPasswordPage />
                      </AuthRedirect>
                    } />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected student routes */}
                    <Route path="/dashboard/student" element={
                      <StudentRoute>
                        <StudentDashboardRouter />
                      </StudentRoute>
                    } />
                    <Route path="/dashboard/student/classes" element={
                      <StudentRoute>
                        <RegularDashboardClasses />
                      </StudentRoute>
                    } />
                    <Route path="/dashboard/student/subscription" element={
                      <StudentRoute>
                        <RegularDashboardSubscription />
                      </StudentRoute>
                    } />
                    <Route path="/booking" element={
                      <StudentRoute>
                        <BookTrialPage />
                      </StudentRoute>
                    } />
                    <Route path="/book-trial" element={
                      <StudentRoute>
                        <BookTrialPage />
                      </StudentRoute>
                    } />
                    <Route path="/book-regular" element={
                      <StudentRoute>
                        <BookRegularPage />
                      </StudentRoute>
                    } />

                    {/* Protected teacher routes */}
                    <Route path="/dashboard/teacher" element={
                      <TeacherRoute>
                        <TeacherDashboard />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/students" element={
                      <TeacherRoute>
                        <StudentManagementPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/classes" element={
                      <TeacherRoute>
                        <ClassManagementPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/reviews" element={
                      <TeacherRoute>
                        <ReviewsManagementPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/statistics" element={
                      <TeacherRoute>
                        <StatisticsPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/financial" element={
                      <TeacherRoute>
                        <FinancialManagementPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/credits" element={
                      <TeacherRoute>
                        <CreditManagementPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/users" element={
                      <TeacherRoute>
                        <UserManagementPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/subscriptions" element={
                      <TeacherRoute>
                        <SubscriptionPlanManagementPage />
                      </TeacherRoute>
                    } />
                    <Route path="/dashboard/teacher/custom-pricing" element={
                      <TeacherRoute>
                        <CustomPricingPage />
                      </TeacherRoute>
                    } />

                    {/* Protected admin routes */}
                    <Route path="/dashboard/admin" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }>
                      <Route index element={<AdminOverview />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="classes" element={<ClassManagement />} />
                      <Route path="subscriptions" element={<SubscriptionOverviewPage />} />
                      <Route path="credits" element={<CreditManagement />} />
                      <Route path="discounts" element={<DiscountManagement />} />
                      <Route path="reviews" element={<AdminReviewManagement />} />
                      <Route path="regular-students" element={<RegularStudentsPage />} />
                      <Route path="settings" element={<SystemSettings />} />
                    </Route>

                    {/* Error pages */}
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
      </div>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <RTLProvider defaultDirection="rtl">
            <Router>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Router>
          </RTLProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
