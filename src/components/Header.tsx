import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import MobileNav from '@/components/MobileNav'
import { useAuth } from '@/lib/auth-context'
import { Menu, MessageCircle } from 'lucide-react'
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Simplified Text-Based */}
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
          <nav
            id="navigation"
            className="hidden md:flex items-center space-x-8 space-x-reverse"
            role="navigation"
            aria-label="التنقل الرئيسي"
          >
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
            >
              الرئيسية
            </Link>
            <Link
              to="/tutor"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
            >
              من نحن
            </Link>
            <Link
              to="/#pricing"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
            >
              الأسعار
            </Link>
            <Link
              to="/#faq"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors arabic-text"
            >
              تواصل معنا
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
            
            {user ? (
              <>
                <Link 
                  to={user.email === 'selem.vet@gmail.com' ? '/dashboard/teacher' : '/dashboard/student'}
                  className="text-primary-600 font-semibold hover:text-primary-700 arabic-text"
                >
                  لوحة التحكم
                </Link>
                <Button variant="danger" size="sm" onClick={handleSignOut}>
                  <span className="arabic-text">تسجيل الخروج</span>
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-primary-600 font-semibold hover:text-primary-700 arabic-text"
                >
                  تسجيل دخول
                </Link>
                <Button 
                  asChild 
                  size="sm"
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-700 transition-transform transform hover:-translate-y-0.5 shadow-lg shadow-primary-600/20"
                >
                  <Link to="/signup" className="flex items-center justify-center text-white hover:text-white">
                    <span className="arabic-text">احجز مجاناً</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleMobileMenu()
                }
              }}
              className="inline-flex p-2 text-gray-600 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
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
      <MobileNav isOpen={isMobileMenuOpen} onClose={(open) => setIsMobileMenuOpen(open !== undefined ? open : false)} />
    </header>
  )
}
