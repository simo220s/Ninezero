import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

interface MobileNavProps {
  isOpen: boolean
  onClose: (open?: boolean) => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    onClose(false)
  }

  const handleLinkClick = () => {
    onClose(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="md:hidden absolute top-20 w-full bg-white border-b border-gray-100 shadow-lg animate-fade-in-down"
      id="mobile-navigation"
      dir="rtl"
    >
      <div className="px-4 pt-2 pb-6 space-y-2">
        <Link 
          to="/" 
          onClick={handleLinkClick}
          className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 arabic-text"
        >
          الرئيسية
        </Link>
        <Link 
          to="/tutor" 
          onClick={handleLinkClick}
          className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 arabic-text"
        >
          من نحن
        </Link>
        <Link 
          to="/#pricing" 
          onClick={handleLinkClick}
          className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 arabic-text"
        >
          الأسعار
        </Link>
        <Link 
          to="/#faq" 
          onClick={handleLinkClick}
          className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 arabic-text"
        >
          تواصل معنا
        </Link>

        <div className="pt-4 border-t border-gray-100 mt-2 space-y-3">
          {user ? (
            <>
              <Link 
                to={user.email === 'selem.vet@gmail.com' ? '/dashboard/teacher' : '/dashboard/student'}
                onClick={handleLinkClick}
                className="block text-center text-primary-600 font-bold arabic-text"
              >
                لوحة التحكم
              </Link>
              <Button 
                variant="danger" 
                size="lg" 
                className="w-full justify-center" 
                onClick={handleSignOut}
              >
                <span className="arabic-text">تسجيل الخروج</span>
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                onClick={handleLinkClick}
                className="block text-center text-primary-600 font-bold arabic-text"
              >
                تسجيل دخول للأعضاء
              </Link>
              <button 
                onClick={() => {
                  handleLinkClick()
                  window.location.href = '/signup'
                }}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold shadow-md arabic-text"
              >
                احجز الحصة التجريبية
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
