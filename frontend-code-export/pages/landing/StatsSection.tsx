import { Card, CardContent } from '@/components/ui/card'

const stats = [
  {
    number: '+500',
    label: 'طلاب ناجحون',
    description: 'حققوا أهدافهم في تعلم الإنجليزية',
    icon: (
      <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
    color: 'primary',
    bgColor: 'bg-primary-50',
    textColor: 'text-primary-600'
  },
  {
    number: '5+',
    label: 'سنوات خبرة',
    description: 'في تعليم الأطفال السعوديين',
    icon: (
      <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
    color: 'success',
    bgColor: 'bg-success-50',
    textColor: 'text-success-600'
  },
  {
    number: '98%',
    label: 'نسبة النجاح',
    description: 'من الطلاب يحققون أهدافهم',
    icon: (
      <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  {
    number: '24/7',
    label: 'دعم متواصل',
    description: 'متاح عبر واتساب في أي وقت',
    icon: (
      <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
    ),
    color: 'success',
    bgColor: 'bg-success-50',
    textColor: 'text-success-600'
  }
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-bg-light">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary arabic-text mb-4">
            أرقام تتحدث عن نفسها
          </h2>
          <p className="text-text-secondary arabic-text max-w-2xl mx-auto">
            نفتخر بالنتائج التي حققناها مع طلابنا على مدار السنوات الماضية
          </p>
        </div>

        {/* Stats Grid - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`text-center hover-scale cursor-pointer transition-all duration-300 ${stat.bgColor} border-2 border-transparent hover:border-${stat.color}-200`}
            >
              <CardContent className="pt-4 pb-4 px-2 md:pt-8 md:pb-6 md:px-6">
                {/* Icon */}
                <div className="flex justify-center mb-2 md:mb-4">
                  <div className={`w-10 h-10 md:w-16 md:h-16 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <div className="scale-75 md:scale-100">
                      {stat.icon}
                    </div>
                  </div>
                </div>

                {/* Number */}
                <div className={`text-2xl md:text-4xl font-bold ${stat.textColor} mb-1 md:mb-2`}>
                  {stat.number}
                </div>

                {/* Label */}
                <div className={`text-sm md:text-lg font-semibold ${stat.textColor} arabic-text mb-1 md:mb-2`}>
                  {stat.label}
                </div>

                {/* Description - Hidden on mobile */}
                <p className="hidden md:block text-sm text-text-secondary arabic-text leading-relaxed">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {/* University Certification */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-text-primary arabic-text">معتمد TESOL</div>
                <div className="text-xs text-text-secondary arabic-text">جامعة أريزونا</div>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-text-primary arabic-text">ضمان الأموال</div>
                <div className="text-xs text-text-secondary arabic-text">30 يوم</div>
              </div>
            </div>

            {/* Free Trial */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-text-primary arabic-text">جلسة مجانية</div>
                <div className="text-xs text-text-secondary arabic-text">25 دقيقة</div>
              </div>
            </div>

            {/* Flexible Schedule */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-text-primary arabic-text">جدولة مرنة</div>
                <div className="text-xs text-text-secondary arabic-text">حسب وقتك</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
