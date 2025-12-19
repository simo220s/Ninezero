import { Bell, Menu, LogOut, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Link } from "react-router-dom"

interface EnhancedHeaderProps {
  currentPage: string
  onNavigate: (page: string) => void
  userName: string
  userEmail: string
  onSignOut: () => void
}

export default function EnhancedHeader({ 
  currentPage, 
  onNavigate, 
  userName, 
  userEmail,
  onSignOut 
}: EnhancedHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const notifications = [
    { id: 1, text: "حصتك القادمة بعد ساعتين", time: "قبل دقيقتين", unread: true },
    { id: 2, text: "تم إضافة رصيد لحسابك", time: "قبل ساعة", unread: true },
    { id: 3, text: "حصلت على شارة التميز", time: "أمس", unread: false },
  ]

  const getInitials = () => {
    return userName.substring(0, 2)
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Logo - Right side for RTL */}
        <div className="flex items-center gap-2">
          <span className="text-gray-800 arabic-text font-bold text-lg">الأستاذ أحمد</span>
        </div>

        {/* Navigation - Center (Desktop only) */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate('upcoming')}
            className={`transition-colors arabic-text font-medium ${
              currentPage === 'upcoming' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            الحصة القادمة
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors arabic-text font-medium ${
              currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            لوحة التحكم
          </button>
          <button 
            onClick={() => onNavigate('accomplishments')}
            className={`transition-colors arabic-text font-medium ${
              currentPage === 'accomplishments' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            الإنجازات
          </button>
        </nav>

        {/* Profile & Notifications - Left side for RTL */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative rounded-full hover:bg-gray-100 w-10 h-10 p-0">
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80" dir="rtl">
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 arabic-text text-right">الإشعارات</h3>
              </div>
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="p-4 cursor-pointer">
                  <div className="flex items-start gap-3 w-full">
                    {notif.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                    <div className="flex-1 text-right">
                      <p className="text-sm text-gray-900 arabic-text">{notif.text}</p>
                      <p className="text-xs text-gray-500 arabic-text mt-1">{notif.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" dir="rtl">
              <div className="p-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900 arabic-text text-right">{userName}</p>
                <p className="text-sm text-gray-500 arabic-text text-right truncate">{userEmail}</p>
              </div>
              <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer text-right">
                <Settings className="ml-2 h-4 w-4" />
                <span className="arabic-text">الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-right">
                <Link to="/">
                  <HelpCircle className="ml-2 h-4 w-4" />
                  <span className="arabic-text">المساعدة</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600 text-right">
                <LogOut className="ml-2 h-4 w-4" />
                <span className="arabic-text">تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger className="md:hidden">
              <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" dir="rtl">
              <nav className="flex flex-col gap-4 mt-8">
                <button 
                  onClick={() => { onNavigate('upcoming'); setMobileMenuOpen(false); }}
                  className={`p-3 rounded-xl arabic-text text-right transition-colors ${
                    currentPage === 'upcoming' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  الحصة القادمة
                </button>
                <button 
                  onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                  className={`p-3 rounded-xl arabic-text text-right transition-colors ${
                    currentPage === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  لوحة التحكم
                </button>
                <button 
                  onClick={() => { onNavigate('accomplishments'); setMobileMenuOpen(false); }}
                  className={`p-3 rounded-xl arabic-text text-right transition-colors ${
                    currentPage === 'accomplishments' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  الإنجازات
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
