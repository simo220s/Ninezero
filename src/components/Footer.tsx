import { Link } from 'react-router-dom'
import { Mail, MessageCircle } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand Section */}
          <div>
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl arabic-text" aria-hidden="true">أ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold arabic-text">
                  الأستاذ أحمد
                </span>
                <span className="text-xs text-gray-400 arabic-text">
                  معلم اللغة الإنجليزية
                </span>
              </div>
            </div>
            <p className="text-gray-400 arabic-text leading-relaxed text-sm">
              معلم لغة إنجليزية معتمد من جامعة أريزونا الأمريكية بشهادة TESOL. خبرة أكثر من 8 سنوات في تعليم الأطفال والمراهقين السعوديين من عمر 10-18 سنة.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 arabic-text">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-white transition-colors text-sm arabic-text"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link 
                  to="/tutor" 
                  className="text-gray-400 hover:text-white transition-colors text-sm arabic-text"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link 
                  to="/#pricing" 
                  className="text-gray-400 hover:text-white transition-colors text-sm arabic-text"
                >
                  الأسعار
                </Link>
              </li>
              <li>
                <Link 
                  to="/#faq" 
                  className="text-gray-400 hover:text-white transition-colors text-sm arabic-text"
                >
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className="text-gray-400 hover:text-white transition-colors text-sm arabic-text"
                >
                  التسجيل
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 arabic-text">تواصل معنا</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://wa.me/966564084838" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 space-x-reverse text-gray-400 hover:text-white transition-colors text-sm"
                  aria-label="تواصل عبر واتساب"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="arabic-text">واتساب</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:saudienglishclub@gmail.com" 
                  className="flex items-center space-x-3 space-x-reverse text-gray-400 hover:text-white transition-colors text-sm"
                  aria-label="البريد الإلكتروني"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="arabic-text">saudienglishclub@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm arabic-text">
            © {currentYear} الأستاذ أحمد. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}
