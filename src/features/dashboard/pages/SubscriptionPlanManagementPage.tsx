/**
 * Subscription Plan Management Page
 * 
 * Teacher dashboard page for managing subscription plans
 * Requirement 9.1: Interface to create and modify subscription plans
 */

import { useAuth } from '@/lib/auth-context'
import { Navigate, Link } from 'react-router-dom'
import SubscriptionPlanManagement from '../components/SubscriptionPlanManagement'
import Footer from '@/components/Footer'
import TeacherSidebar from '../components/TeacherSidebar'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function SubscriptionPlanManagementPage() {
  const { user, getUserRole } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Redirect if not a teacher
  if (!user || getUserRole() !== 'teacher') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Sidebar */}
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-custom-sm border-b border-border-light sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary arabic-text">
                    إدارة باقات الاشتراك
                  </h1>
                  <p className="text-sm text-text-secondary arabic-text hidden sm:block">
                    إنشاء وتعديل باقات الاشتراك للطلاب
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="arabic-text">
                <Link to="/dashboard/teacher" className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  العودة للوحة التحكم
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <SubscriptionPlanManagement />
        </main>
        
        <Footer />
      </div>
    </div>
  )
}
