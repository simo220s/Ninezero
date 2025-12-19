/**
 * Mobile Navigation Component
 * 
 * Responsive bottom navigation for mobile devices
 * Requirements: 10.4 - Mobile-responsive navigation for tablet/phone access
 */

import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Calendar, BarChart3, Menu } from 'lucide-react'
import type { ReactNode } from 'react'

interface MobileNavigationProps {
  onMenuClick: () => void
  className?: string
}

interface NavItem {
  id: string
  title: string
  titleAr: string
  path: string
  icon: ReactNode
}

export default function MobileNavigation({ onMenuClick, className = '' }: MobileNavigationProps) {
  const location = useLocation()

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      titleAr: 'الرئيسية',
      path: '/dashboard/teacher',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'students',
      title: 'Students',
      titleAr: 'الطلاب',
      path: '/dashboard/teacher/students',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'classes',
      title: 'Classes',
      titleAr: 'الحصص',
      path: '/dashboard/teacher/classes',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'stats',
      title: 'Stats',
      titleAr: 'إحصائيات',
      path: '/dashboard/teacher/statistics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard/teacher') {
      return location.pathname === '/dashboard/teacher'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden ${className}`}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all min-w-[60px] ${
              isActive(item.path)
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className={`mb-1 ${isActive(item.path) ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </span>
            <span className="text-xs font-medium arabic-text">
              {item.titleAr}
            </span>
          </Link>
        ))}
        
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all min-w-[60px]"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium arabic-text">المزيد</span>
        </button>
      </div>
    </nav>
  )
}
