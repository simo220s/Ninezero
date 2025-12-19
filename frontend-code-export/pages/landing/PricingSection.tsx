import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { RiyalPrice } from '@/components/RiyalPrice'

export default function PricingSection() {
  const pricingPlans = [
    {
      id: 'trial',
      name: 'جلسة تجريبية مجانية',
      price: 'مجاناً',
      originalPrice: null,
      duration: '25 دقيقة',
      description: 'جلسة تقييم مجانية مع الأستاذ أحمد',
      features: [
        'تقييم شامل لمستوى طفلك',
        'خطة تعليمية مخصصة',
        'تعرف على أسلوب التدريس',
        'بدون أي التزامات مالية'
      ],
      buttonText: 'احجز جلستك المجانية',
      buttonVariant: 'primary' as const,
      popular: false,
      highlight: false,
      bgColor: 'bg-white',
      borderColor: 'border-border-light'
    },
    {
      id: 'individual',
      name: 'حصص فردية',
      price: 35,
      originalPrice: null,
      duration: 'الحصة',
      description: 'حصص خصوصية فردية مع الأستاذ أحمد',
      features: [
        'حصص خصوصية 1:1',
        'جدول مرن يناسبك',
        'متابعة مستمرة للتقدم',
        'مواد تعليمية مخصصة',
        'دعم عبر واتساب'
      ],
      buttonText: 'ابدأ الآن',
      buttonVariant: 'primary' as const,
      popular: true,
      highlight: true,
      bgColor: 'bg-white',
      borderColor: 'border-primary-600'
    },
    {
      id: 'group',
      name: 'حصص جماعية',
      price: 25,
      originalPrice: null,
      duration: 'الحصة',
      description: 'مجموعات صغيرة من 3-5 طلاب',
      features: [
        'مجموعات صغيرة (3-5 طلاب)',
        'تفاعل مع أقران',
        'أسعار مخفضة',
        'جو تعليمي ممتع',
        'تحفيز جماعي'
      ],
      buttonText: 'انضم للمجموعة',
      buttonVariant: 'secondary' as const,
      popular: false,
      highlight: false,
      bgColor: 'bg-white',
      borderColor: 'border-border-light'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            الباقات والأسعار
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-6">
            اختر الباقة المناسبة لك ولطفلك. جميع الباقات تشمل ضمان استرجاع الأموال خلال 30 يوم
          </p>
          
          {/* Trust Badge */}
          <div className="inline-flex items-center bg-success-50 text-success-600 px-4 py-2 rounded-full text-sm font-medium arabic-text">
            <svg className="w-4 h-4 ms-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            ضمان استرجاع الأموال خلال 30 يوم
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-custom-lg ${
                plan.highlight 
                  ? 'scale-105 shadow-custom-lg border-2 border-primary-600' 
                  : 'hover:scale-102 border border-border-light'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 start-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium arabic-text">
                    الأكثر شهرة
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                {/* Plan Name */}
                <CardTitle className="text-xl font-bold text-text-primary arabic-text mb-2">
                  {plan.name}
                </CardTitle>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-center space-x-1 space-x-reverse">
                    {typeof plan.price === 'number' ? (
                      <RiyalPrice 
                        amount={plan.price}
                        className={`text-4xl font-bold ${
                          plan.id === 'trial' ? 'text-success-600' : 
                          plan.id === 'individual' ? 'text-primary-600' : 'text-success-600'
                        }`}
                      />
                    ) : (
                      <span className={`text-4xl font-bold ${
                        plan.id === 'trial' ? 'text-success-600' : 
                        plan.id === 'individual' ? 'text-primary-600' : 'text-success-600'
                      }`}>
                        {plan.price}
                      </span>
                    )}
                    {plan.duration && typeof plan.price === 'number' && (
                      <span className="text-text-secondary arabic-text">/ {plan.duration}</span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-text-secondary line-through arabic-text">
                      {typeof plan.originalPrice === 'number' ? (
                        <RiyalPrice amount={plan.originalPrice} />
                      ) : (
                        plan.originalPrice
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-text-secondary arabic-text text-sm">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3 space-x-reverse">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        plan.id === 'trial' ? 'bg-success-500' :
                        plan.id === 'individual' ? 'bg-primary-600' : 'bg-success-500'
                      }`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-text-primary arabic-text text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  asChild
                  variant={plan.id === 'group' ? 'secondary' : 'primary'}
                  className="w-full arabic-text shadow-custom-md hover:shadow-custom-lg transition-all"
                  size="lg"
                >
                  <Link to="/signup" className="flex items-center justify-center text-white hover:text-white">
                    {plan.buttonText}
                  </Link>
                </Button>

                {/* Additional Info */}
                {plan.id === 'trial' && (
                  <p className="text-xs text-text-secondary arabic-text text-center mt-3">
                    لا توجد التزامات • إلغاء مجاني في أي وقت
                  </p>
                )}
                {plan.id === 'individual' && (
                  <p className="text-xs text-text-secondary arabic-text text-center mt-3">
                    أشهر باقة • نتائج مضمونة • دعم مستمر
                  </p>
                )}
                {plan.id === 'group' && (
                  <p className="text-xs text-text-secondary arabic-text text-center mt-3">
                    توفير في التكلفة • تعلم جماعي ممتع
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 text-center">
          {/* FAQ Link */}
          <p className="text-text-secondary arabic-text mb-6">
            لديك أسئلة حول الباقات؟{' '}
            <a href="#faq" className="text-primary-600 hover:text-primary-700 font-medium">
              اطلع على الأسئلة الشائعة
            </a>
          </p>

          {/* Contact Support */}
          <div className="bg-bg-light rounded-2xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-text-primary arabic-text mb-2">
              تحتاج مساعدة في الاختيار؟
            </h3>
            <p className="text-text-secondary arabic-text text-sm mb-4">
              تحدث مع الأستاذ أحمد مباشرة لاختيار الباقة المناسبة
            </p>
            <Button 
              variant="whatsapp" 
              className="arabic-text"
              onClick={() => window.open('https://wa.me/966564084838', '_blank')}
            >
              <svg className="w-4 h-4 ms-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
              </svg>
              تواصل عبر واتساب
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
