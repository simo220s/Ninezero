import { Link } from 'react-router-dom'

export default function FinalCTASection() {
  return (
    <section className="bg-primary-700 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 arabic-text">
          جاهز تشوف الفرق في مستوى ولدك؟
        </h2>
        <p className="text-lg mb-8 text-white/90 arabic-text">
          احجز المقعد الآن، الأماكن محدودة هذا الشهر.
        </p>
        <Link 
          to="/signup"
          className="inline-block bg-white text-primary-700 font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-colors shadow-lg arabic-text"
        >
          احجز الحصة التجريبية
        </Link>
      </div>
    </section>
  )
}
