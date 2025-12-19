import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface MobileNavigationProps {
  user: any
  profile: any
  onSignOut: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function MobileNavigation({
  user,
  profile,
  onSignOut,
  isOpen,
  onOpenChange,
}: MobileNavigationProps) {
  const navigationItems = [
    {
      label: 'الصفحة الرئيسية',
      path: '/dashboard/student',
    },
    {
      label: 'الحصص القادمة',
      path: '/dashboard/student/classes',
    },
    {
      label: 'الاشتراكات',
      path: '/dashboard/student/subscription',
    },
  ]

  // Using window.location because useLocation might not be available if not in Router context? 
  // Assuming Router context is present.
  const currentPath = window.location.pathname

  return (
    <div
      className={`
        absolute top-[100%] left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100
        transition-all duration-300 ease-in-out origin-top overflow-hidden md:hidden
        ${isOpen ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
      `}
      dir="rtl"
    >
      <nav className="flex flex-col p-4 space-y-2">
        {navigationItems.map((item) => {
          const active = currentPath === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onOpenChange(false)}
              className={`
                w-full p-4 rounded-xl arabic-text text-right font-medium text-lg transition-all flex items-center justify-between group
                ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span>{item.label}</span>
              {active && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
            </Link>
          )
        })}

        <Button
          variant="ghost"
          className="w-full p-4 rounded-xl arabic-text text-right font-medium text-lg transition-all flex items-center justify-between text-red-600 hover:bg-red-50 hover:text-red-700 mt-4"
          onClick={() => {
            onOpenChange(false)
            onSignOut()
          }}
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </span>
        </Button>
      </nav>
    </div>
  )
}
