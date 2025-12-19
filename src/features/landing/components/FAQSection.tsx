import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    id: 1,
    question: 'هل الجلسة التجريبية مجانية حقاً؟',
    answer: 'ابشر، الجلسة التجريبية مجانية تماماً ولا تشيل هم من أي رسوم خفية. الجلسة 25 دقيقة مع الأستاذ أحمد لتقييم مستوى ولدك ووضع خطة مناسبة له.'
  },
  {
    id: 2,
    question: 'ماذا لو لم يناسبني الوقت المحجوز؟',
    answer: 'لا تشيل هم! تقدر تغير الموعد حتى 24 ساعة قبل الحصة. عندنا مرونة كاملة في الجدولة تناسب وقتك.'
  },
  {
    id: 3,
    question: 'كيف يتم الدفع؟',
    answer: 'نقبل كل طرق الدفع المتاحة: مدى، فيزا، ماستركارد، وأبل باي. الدفع آمن ومحمي بأعلى معايير الأمان.'
  },
  {
    id: 4,
    question: 'هل توجد ضمانات؟',
    answer: 'ابشر، عندنا ضمان استرجاع الرصيد غير المستخدم. إذا ما استخدمت الرصيد، تقدر تسترجعه خلال أول 30 يوم من الاشتراك.'
  },
  {
    id: 5,
    question: 'ما هي أعمار الطلاب المناسبة؟',
    answer: 'نتخصص في تعليم الأطفال من عمر 10 إلى 18 سنة. الأستاذ أحمد عنده خبرة واسعة في التعامل مع هالفئة العمرية.'
  },
  {
    id: 6,
    question: 'كم عدد الحصص المطلوبة لرؤية النتائج؟',
    answer: 'عادة نشوف تحسن بسيط خلال أول 50 حصة. للوصول للطلاقة الكاملة، باذن الله نحتاج حوالي 500 ساعة موزعة على 12-24 شهر حسب مستوى الطالب والتزامه.'
  }
]

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null) // No FAQ open by default

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <section id="faq" className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary arabic-text mb-3">
            الأسئلة الشائعة
          </h2>
          <p className="text-text-secondary arabic-text">
            إجابات سريعة على أكثر الأسئلة شيوعاً
          </p>
        </div>

        {/* FAQ Accordion - Clean & Simple */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full p-5 text-right flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                aria-expanded={openFAQ === faq.id}
              >
                <h3 className="text-base font-semibold text-gray-900 arabic-text flex-1 text-right">
                  {faq.question}
                </h3>
                <ChevronDown 
                  className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-200 ${
                    openFAQ === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openFAQ === faq.id && (
                <div className="px-5 pb-5 pt-0">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 arabic-text leading-relaxed text-sm">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Card */}
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-primary-600 arabic-text mb-2">
              لم تجد إجابة لسؤالك؟
            </h3>
            
            <p className="text-primary-600 arabic-text mb-6">
              تواصل مع الأستاذ أحمد مباشرة عبر واتساب. الله يسعدك، متاحين خلال ساعات العمل للإجابة على كل استفساراتك
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="whatsapp"
                onClick={() => window.open('https://wa.me/966564084838', '_blank')}
                className="arabic-text"
              >
                <svg className="w-5 h-5 ms-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                </svg>
                تواصل عبر واتساب
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open('mailto:saudienglishclub@gmail.com', '_blank')}
                className="arabic-text border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                <svg className="w-5 h-5 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                راسلنا عبر الإيميل
              </Button>
            </div>
            
            {/* Response Time */}
            <div className="mt-6 flex items-center justify-center space-x-4 space-x-reverse text-sm text-primary-600">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="arabic-text">متاح الآن</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="arabic-text">رد خلال ساعتين</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
