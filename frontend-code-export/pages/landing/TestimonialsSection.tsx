import { Card, CardContent } from '@/components/ui/card'
import { RTLArrow } from '@/components/RTLArrow'

const testimonials = [
  {
    id: 1,
    name: 'أم عبدالله',
    relationship: 'والدة عبدالله (12 سنة)',
    rating: 5,
    text: 'تحسن ملحوظ في شهرين فقط! الأستاذ أحمد صبور جداً ويعرف كيف يتعامل مع الأطفال. ابني أصبح يحب اللغة الإنجليزية ويتحدث بثقة أكبر.',
    avatar: '👩‍💼',
    location: 'الرياض'
  },
  {
    id: 2,
    name: 'والد فاطمة',
    relationship: 'والد فاطمة (14 سنة)',
    rating: 5,
    text: 'معلم صبور ومتمكن من مادته. فاطمة كانت تخاف من التحدث بالإنجليزية، الآن تتحدث بطلاقة وثقة. شكراً أستاذ أحمد على الجهد المبذول.',
    avatar: '👨‍💼',
    location: 'جدة'
  },
  {
    id: 3,
    name: 'أم محمد',
    relationship: 'والدة محمد (10 سنوات)',
    rating: 5,
    text: 'أفضل استثمار لمستقبل ابني! الأستاذ أحمد يستخدم طرق تعليم ممتعة وفعالة. محمد يتطلع لكل حصة ويطبق ما يتعلمه في حياته اليومية.',
    avatar: '👩‍🏫',
    location: 'الدمام'
  },
  {
    id: 4,
    name: 'أبو سارة',
    relationship: 'والد سارة (13 سنة)',
    rating: 5,
    text: 'نتائج رائعة في وقت قصير. سارة تحسنت كثيراً في النطق والقواعد. الأستاذ أحمد يتابع التقدم باستمرار ويعطي تمارين مناسبة لمستوى الطالب.',
    avatar: '👨‍🎓',
    location: 'مكة المكرمة'
  },
  {
    id: 5,
    name: 'أم أحمد',
    relationship: 'والدة أحمد (11 سنة)',
    rating: 5,
    text: 'معلم محترف ومتفهم لاحتياجات الطفل. أحمد كان يواجه صعوبة في الإنجليزية، الآن أصبح من المتفوقين في المدرسة. ننصح بالأستاذ أحمد بقوة.',
    avatar: '👩‍⚕️',
    location: 'المدينة المنورة'
  },
  {
    id: 6,
    name: 'والد يوسف',
    relationship: 'والد يوسف (15 سنة)',
    rating: 5,
    text: 'خبرة تعليمية ممتازة! يوسف أصبح يحب اللغة الإنجليزية ويتحدث بها مع أصدقائه. الأستاذ أحمد يجعل التعلم ممتعاً وليس مملاً كما في المدرسة.',
    avatar: '👨‍💻',
    location: 'الخبر'
  }
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center space-x-1 space-x-reverse">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${
            i < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-bg-light">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary arabic-text mb-4">
            ماذا يقول أولياء الأمور؟
          </h2>
          <p className="text-text-secondary arabic-text max-w-2xl mx-auto mb-6">
            آراء حقيقية من أولياء أمور الطلاب الذين حققوا نتائج رائعة مع الأستاذ أحمد
          </p>
          
          {/* Overall Rating */}
          <div className="inline-flex items-center bg-yellow-50 text-yellow-600 px-6 py-3 rounded-full">
            <StarRating rating={5} />
            <span className="me-3 font-semibold arabic-text">5.0 من 5</span>
            <span className="me-2 text-sm arabic-text">(+200 تقييم)</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover-scale transition-all duration-300">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-text-primary arabic-text mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary arabic-text">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-text-secondary arabic-text">
                      {testimonial.relationship}
                    </div>
                    <div className="text-xs text-text-secondary arabic-text">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-custom-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
              <div className="text-text-secondary arabic-text text-sm">نسبة رضا الأهالي</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-success-600 mb-2">+500</div>
              <div className="text-text-secondary arabic-text text-sm">طالب ناجح</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">5.0</div>
              <div className="text-text-secondary arabic-text text-sm">متوسط التقييم</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">3</div>
              <div className="text-text-secondary arabic-text text-sm">أشهر للطلاقة</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-text-secondary arabic-text mb-4">
            انضم إلى مئات الأهالي الراضين عن خدماتنا
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors arabic-text shadow-custom-md hover:shadow-custom-lg min-h-[44px]"
            >
              <RTLArrow direction="forward" size={20} />
              ابدأ الآن مجاناً
            </a>
            <button
              onClick={() => window.open('https://wa.me/966564084838', '_blank')}
              className="inline-flex items-center justify-center px-6 py-3 bg-whatsapp hover:bg-[#128C7E] text-white rounded-xl font-semibold transition-colors arabic-text shadow-custom-md hover:shadow-custom-lg min-h-[44px]"
            >
              <svg className="w-5 h-5 ms-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
              </svg>
              اقرأ المزيد من التقييمات
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
