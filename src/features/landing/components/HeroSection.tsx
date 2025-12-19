import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { RTLArrow } from '@/components/RTLArrow'
import { Play, Star, ShieldCheck, MessageCircle } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content - Order 2 on mobile, Order 1 on desktop */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            {/* Animated Free Session Badge */}
            <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6 animate-pulse arabic-text">
              🔥 الحصة الأولى مجانية لفترة محدودة
            </div>
            
            {/* Main Title with Underline Decoration */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 arabic-text">
              ولدك اللي عمره بين 10-18 سنة.. <br />
              <span className="text-primary-600 relative inline-block">
                خايف يتكلم انجليزي؟
                <svg className="absolute w-full h-3 -bottom-1 right-0 text-yellow-300/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 arabic-text">
              معلم معتمد من جامعة أريزونا الأمريكية بشهادة TESOL وخبرة 8+ سنوات في تعليم الأطفال السعوديين، بأسلوب يكسر حاجز الخوف ويبني الثقة.
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/signup" 
                className="inline-flex justify-center items-center px-8 py-4 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 transition-all transform hover:-translate-y-1 shadow-xl shadow-primary-600/30 arabic-text"
              >
                احجز الحصة التجريبية مجاناً
                <RTLArrow direction="forward" size={20} className="mr-2" />
              </Link>
              <Button 
                variant="whatsapp" 
                size="lg" 
                className="shadow-custom-lg hover:shadow-custom-xl transition-all arabic-text"
                onClick={() => window.open('https://wa.me/966564084838', '_blank')}
              >
                <svg className="w-5 h-5 ms-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                </svg>
                تواصل عبر واتساب
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 text-sm md:text-base text-gray-500 font-medium">
              <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 text-primary-500 ml-1" />
                <span className="arabic-text">معتمد TESOL</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 ml-1" />
                <span className="arabic-text">تقييم 5 نجوم</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 text-green-500 ml-1" />
                <span className="arabic-text">ضمان استرجاع</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Video Card - Order 1 on mobile, Order 2 on desktop */}
          <div className="relative order-1 lg:order-2 mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="aspect-[4/3] md:aspect-[3/2] relative group cursor-pointer">
                {/* Overlay */}
                <Link to="/tutor" className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-600 fill-current ml-1" />
                  </div>
                  <span className="mt-4 text-white font-bold text-lg drop-shadow-md arabic-text">شاهد فيديو تعريفي (3 دقائق)</span>
                </Link>
                <img 
                  src="https://i.postimg.cc/Pxk53c04/photo-5864035878953928423-y-1.jpg" 
                  alt="الأستاذ أحمد - معلم اللغة الإنجليزية المعتمد" 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
