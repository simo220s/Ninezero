import { Bell, User, Menu, X, LogOut, Settings, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, text: "حصتك القادمة بعد ساعتين", time: "قبل دقيقتين", unread: true },
    { id: 2, text: "تم إضافة 100 رصيد لحسابك", time: "قبل ساعة", unread: true },
    { id: 3, text: "حصلت على شارة التميز", time: "أمس", unread: false },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50">
      <div className="h-full px-4 md:px-6 flex items-center justify-between relative">
        {/* Logo - Right side for RTL */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-gray-800 arabic-text font-bold text-lg">منصة التعليم</span>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-xl">📚</span>
          </div>
        </div>

        {/* Navigation - Center (Desktop only) */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavigate('upcoming')}
            className={`transition-colors font-medium text-base arabic-text ${currentPage === 'upcoming' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            الحصة القادمة
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors font-medium text-base arabic-text ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            لوحة التحكم
          </button>
        </nav>

        {/* Profile & Notifications - Left side for RTL */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" dir="rtl">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold arabic-text text-right">الإشعارات</h3>
              </div>
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                  <div className="flex items-start gap-3 w-full">
                    {notif.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>}
                    <div className="flex-1 text-right">
                      <p className="text-gray-900 font-medium arabic-text text-sm">{notif.text}</p>
                      <p className="text-gray-500 arabic-text text-xs mt-1">{notif.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-blue-100 transition-colors">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                    أح
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" dir="rtl">
              <div className="p-3 border-b border-gray-100">
                <p className="text-gray-900 font-bold arabic-text text-right">أحمد محمد</p>
                <p className="text-gray-500 text-sm arabic-text text-right">ahmad@example.com</p>
              </div>
              <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer text-right gap-2">
                <Settings className="h-4 w-4" />
                <span className="arabic-text">الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-right gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="arabic-text">المساعدة</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 text-right gap-2 hover:text-red-700 hover:bg-red-50 focus:bg-red-50">
                <LogOut className="h-4 w-4" />
                <span className="arabic-text">تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown - Shift Style */}
      <div 
        className={`
          absolute top-[100%] left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100 
          transition-all duration-300 ease-in-out origin-top overflow-hidden md:hidden
          ${mobileMenuOpen ? 'max-h-[400px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
        `}
        dir="rtl"
      >
        <nav className="flex flex-col p-4 space-y-2">
          <button 
            onClick={() => handleNavigate('upcoming')}
            className={`
              w-full p-4 rounded-xl arabic-text text-right font-medium text-lg transition-all flex items-center justify-between group
              ${currentPage === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <span>الحصة القادمة</span>
            {currentPage === 'upcoming' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
          
          <button 
            onClick={() => handleNavigate('dashboard')}
            className={`
              w-full p-4 rounded-xl arabic-text text-right font-medium text-lg transition-all flex items-center justify-between group
              ${currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <span>لوحة التحكم</span>
            {currentPage === 'dashboard' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
