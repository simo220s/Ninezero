import { Link } from 'react-router-dom'

/**
 * Simple header component for authentication pages (login/signup)
 * Displays a clickable logo that links to the home page
 * Positioned absolutely so it doesn't affect form centering
 */
export default function AuthHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-border-light" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex items-center justify-center sm:justify-start">
          {/* Logo - Clickable link to home */}
          <Link
            to="/"
            className="flex items-center space-x-3 space-x-reverse hover:opacity-80 transition-opacity"
            aria-label="الأستاذ أحمد - معلم اللغة الإنجليزية - العودة للصفحة الرئيسية"
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
        </div>
      </div>
    </header>
  )
}

