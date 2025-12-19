import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Link } from "react-router-dom"
import MobileNav from "@/components/MobileNav"

interface EnhancedHeaderProps {
  currentPage?: string
  onNavigate?: (page: string) => void
  userName?: string
  userEmail?: string
  onSignOut: () => void
}

export default function EnhancedHeader({
  onSignOut
}: EnhancedHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-border-light" role="banner" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 space-x-reverse"
            aria-label="الأستاذ أحمد - معلم اللغة الإنجليزية"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl arabic-text" aria-hidden="true">أ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-text-primary arabic-text">
                الأستاذ أحمد
              </span>
              <span className="text-xs text-text-secondary arabic-text">
                معلم اللغة الإنجليزية
              </span>
            </div>
          </Link>

          {/* Navigation - Same as index page */}
          <nav
            id="navigation"
            className="hidden md:flex items-center space-x-6 space-x-reverse"
            role="navigation"
            aria-label="التنقل الرئيسي"
          >
            <Link
              to="/"
              className="text-text-secondary hover:text-primary-600 transition-colors arabic-text"
            >
              الرئيسية
            </Link>
            <Link
              to="/tutor"
              className="text-text-secondary hover:text-primary-600 transition-colors arabic-text"
            >
              من نحن
            </Link>
            <Link
              to="/#pricing"
              className="text-text-secondary hover:text-primary-600 transition-colors arabic-text"
            >
              الأسعار
            </Link>
            <Link
              to="/#faq"
              className="text-text-secondary hover:text-primary-600 transition-colors arabic-text"
            >
              تواصل معنا
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3 space-x-reverse">
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/student" className="flex items-center justify-center">
                  <span className="arabic-text">لوحة التحكم</span>
                </Link>
              </Button>
              <Button variant="danger" size="sm" onClick={onSignOut}>
                <span className="arabic-text">تسجيل الخروج</span>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setMobileMenuOpen(true)
                }
              }}
              className="inline-flex md:!hidden p-2 text-text-secondary hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
              aria-label="فتح القائمة"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Use the same MobileNav component as index */}
      <MobileNav isOpen={mobileMenuOpen} onClose={(open) => setMobileMenuOpen(open !== undefined ? open : false)} />
    </header>
  )
}
