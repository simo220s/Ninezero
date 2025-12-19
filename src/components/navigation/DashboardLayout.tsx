/**
 * Dashboard Layout Component
 * 
 * Unified layout wrapper that integrates all navigation components
 * Requirements: 10.1-10.8 - Complete navigation system integration
 */

import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import EnhancedSidebar from './EnhancedSidebar'
import MobileNavigation from './MobileNavigation'
import Breadcrumbs from './Breadcrumbs'
import NotificationSystem from './NotificationSystem'
import QuickNavigation from './QuickNavigation'
import { HEADER_SPACING, CONTENT_SPACING } from '@/lib/constants/spacing'

interface DashboardLayoutProps {
  children: ReactNode
  showBreadcrumbs?: boolean
  showQuickNav?: boolean
  onAddClass?: () => void
  onAddStudent?: () => void
  onSearch?: () => void
  className?: string
}

export default function DashboardLayout({
  children,
  showBreadcrumbs = true,
  showQuickNav = false,
  onAddClass,
  onAddStudent,
  onSearch,
  className = '',
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <EnhancedSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:mr-72">
        {/* Top Bar */}
        <header className={`${HEADER_SPACING.sticky} bg-white border-b border-gray-200 shadow-sm`}>
          <div className={`flex items-center justify-between ${HEADER_SPACING.container}`}>
            {/* Left Side - Menu Button & Breadcrumbs */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="فتح القائمة"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              {showBreadcrumbs && (
                <div className="hidden md:block flex-1 min-w-0">
                  <Breadcrumbs />
                </div>
              )}
            </div>

            {/* Right Side - Notifications */}
            <div className="flex items-center gap-2">
              <NotificationSystem />
            </div>
          </div>

          {/* Mobile Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="md:hidden px-4 pb-3">
              <Breadcrumbs />
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className={`pb-20 lg:pb-6 ${className}`}>
          {/* Quick Navigation (optional) */}
          {showQuickNav && (
            <div className={`${CONTENT_SPACING.main} bg-white border-b border-gray-200`}>
              <QuickNavigation
                onAddClass={onAddClass}
                onAddStudent={onAddStudent}
                onSearch={onSearch}
              />
            </div>
          )}

          {/* Main Content */}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation onMenuClick={() => setIsSidebarOpen(true)} />
    </div>
  )
}
