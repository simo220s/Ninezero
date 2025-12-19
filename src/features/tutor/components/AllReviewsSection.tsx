import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    id: 1,
    name: 'Alaa',
    rating: 5,
    text: 'درس ممتع جدًا وشخص متفهم عرف ايش بالضبط مشكلتي وايش قصدي وباذن الله اشترك معاه لانه كسر لي حاجز الخوف🙏🏼 اعطاني مجال اعبر واجمع افكاري وماقاطعني او استعجلني🙏🏼',
    date: 'مارس 18، 2025'
  },
  {
    id: 2,
    name: 'Alanod',
    rating: 5,
    text: 'شكرا أستاذ احمد، كنت جدًا متفهم لبنتي، وصبور معها، وشجعتها وعطيتها ثقة في نفسها رغم أنها مبتدئة. طريقتك مريحة وتفاعلية، وبنتي كانت سعيده. أشكرك على تعاملك الرائع',
    date: 'يوليو 17، 2025'
  },
  {
    id: 3,
    name: 'hadeel',
    rating: 5,
    text: 'ماشاء لله تبارك الرحمن كان ممتاز جداً مع اخوي وجداً متفهم وطريقه شرحه وترجمة له و توصيل المعلومة ممتاز 🤍🤍',
    date: 'أغسطس 13، 2025'
  },
  {
    id: 4,
    name: 'huda',
    rating: 5,
    text: 'قدم الأستاذ أحمد مجهود جبار ومميز ورائع في هذة الدورة من ناحية الشرح والقدرة على توصيل المعنى وسلاسة أسلوبه وصبره وتحفيزه المستمر وله القدره على تحديد مستواي في اللغه الانجليزيه وله جزيل الشكر والتحيه والتقدير، وماشاء الله عليه دايم يشجعني حتى لو غلطت وانصح فيه لصغير والكبير',
    date: 'سبتمبر 8، 2025'
  },
  {
    id: 5,
    name: 'Najm',
    rating: 5,
    text: 'الصراحه أستاذ أحمد إنسان متواضع وممتاز جداً في التعليم وصبور ويعلمك كل كبيره وكل صغيره تقيمي له 5 نجوم ولو فيه زياده أعطيته ❤️',
    date: 'سبتمبر 20، 2025'
  },
  {
    id: 6,
    name: 'بتال',
    rating: 5,
    text: 'مدرس خلوق ومتعاون جدا وشرحه جداً ممتاز درس ولدي مناهج انترناشونال وتقدم مستواه شكراً استاذ احمد وبالتوفيق لك',
    date: 'أكتوبر 8، 2025'
  },
  {
    id: 7,
    name: 'Ahmed',
    rating: 5,
    text: 'The teacher Ahmed is one of the best tutors on Preply. He is educated, kind, and knows how to keep the conversation flowing. of course, I highly recommend him',
    date: 'أغسطس 24، 2024'
  },
  {
    id: 8,
    name: 'Ayob',
    rating: 5,
    text: 'صراحه يستمع لك المدرس فاهم الله يسعده',
    date: 'نوفمبر 27، 2024'
  },
  {
    id: 9,
    name: 'Saud',
    rating: 5,
    text: 'السلام عليكم ورحمة الله وبركاته انا طالب مع الاستاذ احمد الصراحه من افضل المدرسين الي درست معهم انا مستمر معه بإذن الله بكمل شهر تقريبا الان وانا معه والحمدلله مستفيد وتقدر تقوله عن اي قاعده ودك تفهمها وهو بيشرحها لك بإذن الله',
    date: 'ديسمبر 10، 2024'
  },
  {
    id: 10,
    name: 'abdulaziz',
    rating: 5,
    text: 'The teacher Ahmed is one of the best tutors on preply. Knows music, movies, I understood and loved the lessons.',
    date: 'فبراير 21، 2025'
  },
  {
    id: 11,
    name: 'Mohamed',
    rating: 5,
    text: 'THIS IS HERO',
    date: 'يونيو 30، 2025'
  },
  {
    id: 12,
    name: 'Arej',
    rating: 5,
    text: 'استاذ متفهم. يساعد الطالب تجربه ممتازه تحسن فيها قراتي وتحسن فيها التفهم يعطي واجبات كثير لأكن واجبات مفيده وتحسن الطالب وتحسن فيها الريدنق',
    date: 'يوليو 19، 2025'
  },
  {
    id: 13,
    name: 'Anas',
    rating: 5,
    text: 'شرح ممتاز وممتع لطلاب مستمتع يوسف معاه',
    date: 'أكتوبر 1، 2025'
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

export default function AllReviewsSection() {
  const totalReviews = 200
  const averageRating = 5.0

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-text-primary arabic-text mb-4">
          ايش يقولون طلابنا
        </h2>
        <p className="text-text-secondary arabic-text mb-8">
          تقييمات طلاب وأولياء أمور
        </p>

        {/* Rating Summary */}
        <div className="bg-yellow-50 rounded-xl p-8 mb-8 text-center">
          <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-sm">
            <StarRating rating={5} />
            <span className="me-3 font-semibold arabic-text text-gray-900">5.0 من 5</span>
            <span className="me-2 text-sm arabic-text text-gray-600">(+{totalReviews} تقييم)</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover-scale transition-all duration-300 rounded-md">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="mb-2">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Testimonial Text */}
                <p className="text-text-primary arabic-text mb-6 leading-relaxed text-sm">
                  {testimonial.text}
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-medium text-text-primary text-sm">
                      {testimonial.name}
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {testimonial.date}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
