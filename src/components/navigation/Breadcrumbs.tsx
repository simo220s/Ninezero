/**
 * Breadcrumb Navigation Component
 * 
 * Provides hierarchical navigation with Arabic/English support
 * Requirements: 10.2 - Breadcrumb navigation for all management pages
 */

import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import { getBreadcrumbs, type Breadcrumb } from '@/lib/routes/management-routes'

interface BreadcrumbsProps {
  customBreadcrumbs?: Breadcrumb[]
  className?: string
}

export default function Breadcrumbs({ customBreadcrumbs, className = '' }: BreadcrumbsProps) {
  const location = useLocation()
  const breadcrumbs = customBreadcrumbs || getBreadcrumbs(location.pathname)

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 space-x-reverse text-sm ${className}`}
    >
      {/* Home Icon */}
      <Link
        to={breadcrumbs[0]?.path || '/'}
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="الصفحة الرئيسية"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <div key={crumb.path} className="flex items-center space-x-2 space-x-reverse">
            {/* Separator */}
            <ChevronLeft className="w-4 h-4 text-gray-400" aria-hidden="true" />

            {/* Breadcrumb Link or Text */}
            {isLast ? (
              <span className="text-gray-900 font-medium arabic-text" aria-current="page">
                {crumb.titleAr}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-gray-500 hover:text-gray-700 transition-colors arabic-text"
              >
                {crumb.titleAr}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
