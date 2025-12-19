/**
 * Quick Navigation Shortcuts Component
 * 
 * Provides quick access to frequently used features
 * Requirements: 10.3 - Quick navigation shortcuts for frequently used features
 */

import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Users, 
  Star, 
  BarChart3, 
  DollarSign,
  Plus,
  Search
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface QuickAction {
  id: string
  title: string
  titleAr: string
  icon: ReactNode
  path?: string
  onClick?: () => void
  color: string
  description?: string
}

interface QuickNavigationProps {
  onAddClass?: () => void
  onAddStudent?: () => void
  onSearch?: () => void
  className?: string
}

export default function QuickNavigation({ 
  onAddClass, 
  onAddStudent, 
  onSearch,
  className = '' 
}: QuickNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const quickActions: QuickAction[] = [
    {
      id: 'add-class',
      title: 'Add Class',
      titleAr: 'إضافة حصة',
      icon: <Plus className="w-5 h-5" />,
      onClick: onAddClass,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'جدولة حصة جديدة'
    },
    {
      id: 'add-student',
      title: 'Add Student',
      titleAr: 'إضافة طالب',
      icon: <Users className="w-5 h-5" />,
      onClick: onAddStudent,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'تسجيل طالب جديد'
    },
    {
      id: 'search',
      title: 'Search',
      titleAr: 'بحث',
      icon: <Search className="w-5 h-5" />,
      onClick: onSearch,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'البحث في النظام'
    },
    {
      id: 'classes',
      title: 'Classes',
      titleAr: 'الحصص',
      icon: <Calendar className="w-5 h-5" />,
      path: '/dashboard/teacher/classes',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'إدارة الحصص'
    },
    {
      id: 'students',
      title: 'Students',
      titleAr: 'الطلاب',
      icon: <Users className="w-5 h-5" />,
      path: '/dashboard/teacher/students',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      description: 'إدارة الطلاب'
    },
    {
      id: 'reviews',
      title: 'Reviews',
      titleAr: 'المراجعات',
      icon: <Star className="w-5 h-5" />,
      path: '/dashboard/teacher/reviews',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'عرض المراجعات'
    },
    {
      id: 'statistics',
      title: 'Statistics',
      titleAr: 'الإحصائيات',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/dashboard/teacher/statistics',
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'التقارير والإحصائيات'
    },
    {
      id: 'financial',
      title: 'Financial',
      titleAr: 'المالية',
      icon: <DollarSign className="w-5 h-5" />,
      path: '/dashboard/teacher/financial',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      description: 'الشؤون المالية'
    },
  ]

  const visibleActions = isExpanded ? quickActions : quickActions.slice(0, 4)

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 arabic-text">
          الوصول السريع
        </h3>
        {quickActions.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 hover:text-primary-700 arabic-text"
          >
            {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {visibleActions.map((action) => {
          const content = (
            <>
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-3 transition-transform group-hover:scale-110`}>
                {action.icon}
              </div>
              <h4 className="font-medium text-gray-900 arabic-text text-sm mb-1">
                {action.titleAr}
              </h4>
              {action.description && (
                <p className="text-xs text-gray-500 arabic-text">
                  {action.description}
                </p>
              )}
            </>
          )

          if (action.path) {
            return (
              <Link
                key={action.id}
                to={action.path}
                className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-primary-300"
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-primary-300 text-right"
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
