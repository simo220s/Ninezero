import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

interface NavItem {
  label: string
  icon: ReactNode
  path: string
  badge?: string
}

interface DashboardNavProps {
  items: NavItem[]
}

export default function DashboardNav({ items }: DashboardNavProps) {
  const location = useLocation()

  // Check if current path matches or starts with the item path
  // This ensures proper highlighting for nested routes
  const isActiveRoute = (itemPath: string) => {
    // Exact match for home page
    if (itemPath === '/dashboard/student') {
      return location.pathname === itemPath
    }
    // For other routes, check if current path starts with item path
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/')
  }

  return (
    <nav className="bg-white border-b border-border-light sticky top-0 z-10 shadow-sm" aria-label="لوحة التحكم" dir="rtl">
      <div className="max-w-7xl mx-auto px-4" dir="rtl">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 flex-row-reverse" dir="rtl">
          {items.map((item) => {
            const isActive = isActiveRoute(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-all duration-200
                  whitespace-nowrap leading-none min-h-[44px] text-sm sm:text-base text-right
                  flex-row-reverse
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:rounded-md
                  ${isActive 
                    ? 'border-primary-600 text-primary-600 bg-primary-50 font-semibold' 
                    : 'border-transparent text-gray-700 hover:text-primary-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
                dir="rtl"
              >
                <span className="arabic-text font-medium text-right">{item.label}</span>
                <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? 'text-primary-600' : 'text-gray-700'}`}>
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full font-semibold min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
