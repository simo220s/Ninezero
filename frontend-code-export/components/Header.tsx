import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import MobileNav from '@/components/MobileNav'
import { useAuth } from '@/lib/auth-context'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm border-b border-border-light" role="banner">
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

          {/* Navigation */}
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
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="text-text-secondary hover:text-primary-600 transition-colors arabic-text cursor-pointer"
            >
              الأسعار
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="text-text-secondary hover:text-primary-600 transition-colors arabic-text cursor-pointer"
            >
              الأسئلة الشائعة
            </a>
            <Link
              to="/tutor"
              className="text-text-secondary hover:text-primary-600 transition-colors arabic-text"
            >
              الأستاذ أحمد
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3 space-x-reverse">
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to={user.email === 'selem.vet@gmail.com' ? '/dashboard/teacher' : '/dashboard/student'} className="flex items-center justify-center">
                      <span className="arabic-text">لوحة التحكم</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <span className="arabic-text">تسجيل الخروج</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login" className="flex items-center justify-center"><span className="arabic-text">تسجيل الدخول</span></Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/signup" className="flex items-center justify-center text-white hover:text-white"><span className="arabic-text">إنشاء حساب</span></Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle - Only visible on mobile (< 768px) */}
            <button
              onClick={toggleMobileMenu}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleMobileMenu()
                }
              }}
              className="inline-flex md:!hidden p-2 text-text-secondary hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
              aria-label="فتح القائمة"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  )
}
