import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { RTLArrow } from '@/components/RTLArrow'

export default function HeroSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-bg-light">
      <div className="max-w-6xl mx-auto">
        <div className="hero-grid items-center">
          {/* Text Content - Order 2 on mobile, Order 1 on desktop */}
          <div className="space-y-8 animate-fadeIn order-2 md:order-1">
            <div className="space-y-4">
              {/* Certification Badge */}
              <div className="inline-flex items-center bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium border border-primary-200 arabic-text">
                <svg className="w-4 h-4 ms-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                معتمد من جامعة أريزونا
              </div>

              {/* Main Title */}
              <h1 className="text-responsive-xl font-bold text-text-primary leading-tight arabic-text">
                تعلم اللغة الإنجليزية
                <span className="block text-primary-600">مع الأستاذ أحمد</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-text-secondary max-w-2xl leading-relaxed arabic-text">
                معلم معتمد من جامعة أريزونا الأمريكية مع خبرة 5+ سنوات
              </p>
            </div>
            
            {/* Key Benefits */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-primary font-medium arabic-text">معلم معتمد TESOL</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-primary font-medium arabic-text">خبرة 5+ سنوات</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-primary font-medium arabic-text">نسبة نجاح 98%</span>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="shadow-custom-lg hover:shadow-custom-xl transition-all arabic-text">
                <Link to="/signup" className="flex items-center justify-center gap-2 text-white hover:text-white">
                  <RTLArrow direction="forward" size={20} />
                  ابدأ الآن
                </Link>
              </Button>
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

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-sm text-text-secondary arabic-text">تقييم 5 نجوم</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-text-secondary arabic-text">ضمان استرجاع الأموال</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-text-secondary arabic-text">جدولة مرنة</span>
              </div>
            </div>
          </div>

          {/* Teacher Image with Floating Elements - Order 1 on mobile, Order 2 on desktop */}
          <div className="relative animate-fadeIn order-1 md:order-2">
            <div className="relative max-w-md mx-auto">
              {/* Main Teacher Image - Clickable */}
              <Link to="/tutor" className="block relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-custom-xl" style={{ aspectRatio: '4/5' }}>
                  <img
                    src="https://i.postimg.cc/Pxk53c04/photo-5864035878953928423-y-1.jpg"
                    alt="الأستاذ أحمد - معلم اللغة الإنجليزية المعتمد من جامعة أريزونا"
                    className="w-full h-full object-cover hover-scale"
                    loading="eager"
                    style={{ display: 'block' }}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  
                  {/* Play Button - Always Visible */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-100">
                      <svg className="w-10 h-10 text-primary-600 ms-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Floating Success Badge */}
              <div className="absolute -top-4 -end-4 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-custom-lg animate-pulse">
                98% نسبة النجاح
              </div>

              {/* Floating Student Count Badge */}
              <div className="absolute -bottom-4 -start-4 bg-success-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-custom-lg">
                +500 طالب
              </div>

              {/* Video Preview Badge */}
              <div className="absolute top-4 start-4 bg-white bg-opacity-90 text-primary-600 px-3 py-1 rounded-full text-xs font-medium shadow-custom-md">
                شاهد فيديو تعريفي (3 دقائق)
              </div>

              {/* Certification Badge */}
              <div className="absolute bottom-4 end-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-custom-md">
                TESOL معتمد
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute -z-10 top-10 end-10 w-32 h-32 bg-primary-100 rounded-full opacity-50"></div>
            <div className="absolute -z-10 bottom-10 start-10 w-24 h-24 bg-success-100 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
