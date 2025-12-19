import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Star, 
  Settings,
  Menu,
  X,
  LogOut,
  Home,
  Percent
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ReactNode
  path: string
  badge?: string
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems: NavItem[] = [
    { label: 'لوحة التحكم', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard/admin' },
    { label: 'إدارة المستخدمين', icon: <Users className="w-5 h-5" />, path: '/dashboard/admin/users' },
    { label: 'إدارة الحصص', icon: <Calendar className="w-5 h-5" />, path: '/dashboard/admin/classes' },
    { label: 'نظرة عامة على الاشتراكات', icon: <CreditCard className="w-5 h-5" />, path: '/dashboard/admin/subscriptions' },
    { label: 'إدارة الرصيد', icon: <CreditCard className="w-5 h-5" />, path: '/dashboard/admin/credits' },
    { label: 'إدارة الخصومات', icon: <Percent className="w-5 h-5" />, path: '/dashboard/admin/discounts' },
    { label: 'إدارة التقييمات', icon: <Star className="w-5 h-5" />, path: '/dashboard/admin/reviews' },
    { label: 'إعدادات النظام', icon: <Settings className="w-5 h-5" />, path: '/dashboard/admin/settings' },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const isActivePath = (path: string) => {
    if (path === '/dashboard/admin') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-border-light
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary arabic-text">لوحة الإدارة</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.user_metadata?.first_name || 'مدير النظام'}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                arabic-text text-sm font-medium
                ${isActivePath(item.path)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                }
              `}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light space-y-2">
          <Button
            asChild
            variant="outline"
            className="w-full arabic-text justify-start"
            size="sm"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              الصفحة الرئيسية
            </Link>
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full arabic-text justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            size="sm"
          >
            <LogOut className="w-4 h-4 ms-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 lg:flex-none">
            <h1 className="text-xl font-bold text-text-primary arabic-text">
              {navItems.find(item => isActivePath(item.path))?.label || 'لوحة التحكم'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell placeholder */}
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
