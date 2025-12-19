import { Bell, User, Menu, LogOut, Settings, HelpCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import MobileNavigation from '../MobileNavigation'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import notificationService from '@/lib/services/notification-service'
import { logger } from '@/lib/logger'

interface DashboardHeaderProps {
  user: any
  profile: any
  onSignOut: () => void
}

export default function DashboardHeader({ user, profile, onSignOut }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    text: string
    time: string
    unread: boolean
  }>>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      
      // Subscribe to real-time notifications
      const channel = notificationService.subscribeToNotifications(
        user.id,
        (notification) => {
          // Add new notification to the list
          setNotifications(prev => [{
            id: notification.id,
            text: notification.message,
            time: formatTime(notification.created_at),
            unread: !notification.read
          }, ...prev])
          setUnreadCount(prev => prev + 1)
          logger.log('New notification received:', notification)
        },
        (error) => {
          logger.error('Real-time notification error:', error)
        }
      )

      return () => {
        notificationService.unsubscribeFromNotifications()
      }
    }
  }, [user?.id])

  const loadNotifications = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await notificationService.getNotifications(user.id)
      
      if (error) {
        logger.error('Error loading notifications:', error)
        return
      }

      if (data) {
        const formattedNotifications = data.slice(0, 10).map(notif => ({
          id: notif.id,
          text: notif.message,
          time: formatTime(notif.created_at),
          unread: !notif.read
        }))
        setNotifications(formattedNotifications)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch (err) {
      logger.error('Error loading notifications:', err)
    }
  }

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`
    if (diffHours < 24) return `قبل ${diffHours} ساعة`
    if (diffDays < 7) return `قبل ${diffDays} يوم`
    return date.toLocaleDateString('ar-SA')
  }

  const handleNotificationClick = async (notificationId: string) => {
    const { success } = await notificationService.markAsRead(notificationId)
    if (success) {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, unread: false } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const firstName = profile?.first_name || user?.user_metadata?.first_name || 'طالب'
  const lastName = profile?.last_name || user?.user_metadata?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = firstName.substring(0, 2)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Consistent with landing page */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center cursor-pointer"
            aria-label="الأستاذ أحمد - معلم اللغة الإنجليزية"
          >
            <h1 className="text-2xl font-bold text-primary-700">
              الأستاذ <span className="text-accent-600">أحمد</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link 
              to="/dashboard/student"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
            >
              لوحة التحكم
            </Link>
            <Link 
              to="/book-regular"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
            >
              حجز حصة
            </Link>
            <Link 
              to="/#pricing"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
            >
              شراء رصيد
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {/* WhatsApp Link */}
            <a 
              href="https://wa.me/966564084838" 
              target="_blank" 
              rel="noreferrer"
              className="text-gray-500 hover:text-green-600 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>

            {/* Notifications */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full hover:bg-gray-100 w-10 h-10 p-0">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80" dir="rtl">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-gray-900 arabic-text text-right font-semibold">الإشعارات</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 arabic-text text-right">لا توجد إشعارات</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <DropdownMenuItem 
                      key={notif.id} 
                      className="p-4 cursor-pointer"
                      onClick={() => notif.unread && handleNotificationClick(notif.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        {notif.unread && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>}
                        <div className="flex-1 text-right">
                          <p className="text-gray-900 arabic-text text-sm">{notif.text}</p>
                          <p className="text-gray-500 arabic-text mt-1 text-xs">{notif.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-1 hover:bg-gray-100">
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" dir="rtl">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-gray-900 arabic-text text-right font-medium">{fullName}</p>
                  <p className="text-gray-500 arabic-text text-right text-sm truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/dashboard/student/profile" className="flex items-center justify-end w-full">
                    <span className="arabic-text">الملف الشخصي</span>
                    <User className="ml-2 h-4 w-4 flex-shrink-0" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/dashboard/student/settings" className="flex items-center justify-end w-full">
                    <span className="arabic-text">الإعدادات</span>
                    <Settings className="ml-2 h-4 w-4 flex-shrink-0" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center justify-end"
                  onClick={() => window.open('https://wa.me/966564084838', '_blank')}
                >
                  <span className="arabic-text">المساعدة</span>
                  <HelpCircle className="ml-2 h-4 w-4 flex-shrink-0" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600 flex items-center justify-end">
                  <span className="arabic-text">تسجيل الخروج</span>
                  <LogOut className="ml-2 h-4 w-4 flex-shrink-0" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex p-2 text-gray-600 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              ) : (
                <Menu className="w-7 h-7" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation
        user={user}
        profile={profile}
        onSignOut={onSignOut}
        isOpen={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </header>
  )
}
