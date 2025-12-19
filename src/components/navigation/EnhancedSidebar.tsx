/**
 * Enhanced Sidebar Navigation Component
 * 
 * Features:
 * - Arabic/English bilingual support
 * - Active state indicators
 * - Collapsible sections
 * - Mobile responsive
 * - Quick actions
 * 
 * Requirements: 10.1 - Enhanced sidebar navigation with Arabic/English support
 */

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState, type ReactNode } from 'react'
import { 
  Home, 
  Users, 
  Calendar, 
  Star, 
  BarChart3, 
  DollarSign,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Bell,
  X
} from 'lucide-react'
import { MANAGEMENT_ROUTES } from '@/lib/routes/management-routes'

interface EnhancedSidebarProps {
  isOpen: boolean
  onClose: () => void
  language?: 'ar' | 'en'
}

interface NavigationSection {
  id: string
  title: string
  titleAr: string
  items: NavigationItem[]
  collapsible?: boolean
}

interface NavigationItem {
  id: string
  title: string
  titleAr: string
  path: string
  icon: ReactNode
  badge?: number
  permissions: string[]
}

export default function EnhancedSidebar({ isOpen, onClose, language = 'ar' }: EnhancedSidebarProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [expandedSections, setExpandedSections] = useState<string[]>(['main'])
  const unreadNotifications = 3

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const getIcon = (iconName: string) => {
    const icons: Record<string, ReactNode> = {
      dashboard: <Home className="w-5 h-5" />,
      users: <Users className="w-5 h-5" />,
      calendar: <Calendar className="w-5 h-5" />,
      star: <Star className="w-5 h-5" />,
      chart: <BarChart3 className="w-5 h-5" />,
      money: <DollarSign className="w-5 h-5" />,
    }
    return icons[iconName] || <Home className="w-5 h-5" />
  }

  // Build navigation sections from routes
  const navigationSections: NavigationSection[] = [
    {
      id: 'main',
      title: 'Main Navigation',
      titleAr: 'القائمة الرئيسية',
      items: MANAGEMENT_ROUTES.map(route => ({
        id: route.path,
        title: route.title,
        titleAr: route.titleAr,
        path: route.path.replace('/teacher/', '/dashboard/teacher/'), // Convert to dashboard path
        icon: getIcon(route.icon),
        permissions: route.permissions,
      })),
    },
    {
      id: 'settings',
      title: 'Settings',
      titleAr: 'الإعدادات',
      collapsible: true,
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          titleAr: 'الإشعارات',
          path: '/dashboard/teacher/notifications',
          icon: <Bell className="w-5 h-5" />,
          badge: unreadNotifications,
          permissions: ['teacher', 'super-admin'],
        },
        {
          id: 'settings',
          title: 'Settings',
          titleAr: 'الإعدادات',
          path: '/dashboard/teacher/settings',
          icon: <Settings className="w-5 h-5" />,
          permissions: ['teacher', 'super-admin'],
        },
      ],
    },
  ]

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const isActive = (path: string) => {
    // Convert /teacher/ paths to /dashboard/teacher/ for comparison
    const dashboardPath = path.replace('/teacher/', '/dashboard/teacher/')
    
    if (path === '/teacher/dashboard') {
      return location.pathname === '/dashboard/teacher' || location.pathname === '/dashboard/teacher/'
    }
    return location.pathname === dashboardPath || location.pathname.startsWith(dashboardPath)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const displayText = (text: string, textAr: string) => {
    return language === 'ar' ? textAr : text
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-none`}
        style={{ position: 'fixed' }}
        role="navigation"
        aria-label={language === 'ar' ? 'القائمة الرئيسية' : 'Main navigation'}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {user?.user_metadata?.first_name?.charAt(0) || 'أ'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 arabic-text">
                    {user?.user_metadata?.first_name || 'أستاذ'} {user?.user_metadata?.last_name || 'أحمد'}
                  </p>
                  <p className="text-sm text-gray-500 arabic-text">معلم لغة إنجليزية</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.id}>
                {/* Section Header */}
                {section.collapsible ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span className="arabic-text">{displayText(section.title, section.titleAr)}</span>
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider arabic-text">
                    {displayText(section.title, section.titleAr)}
                  </h3>
                )}

                {/* Section Items */}
                {(!section.collapsible || expandedSections.includes(section.id)) && (
                  <div className="space-y-1 mt-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                          isActive(item.path)
                            ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <span className={isActive(item.path) ? 'text-primary-600' : 'text-gray-400'}>
                            {item.icon}
                          </span>
                          <span className="arabic-text">{displayText(item.title, item.titleAr)}</span>
                        </div>
                        {item.badge && item.badge > 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="arabic-text">{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
            <div className="text-xs text-gray-500 text-center arabic-text pt-2">
              © 2024 موقع الأستاذ أحمد
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
