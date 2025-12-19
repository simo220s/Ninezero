import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Helmet } from 'react-helmet-async'
import { RTLArrow } from '@/components/RTLArrow'
import AllReviewsSection from './AllReviewsSection'

export default function TutorProfilePage() {

  return (
    <>
      <Helmet>
        <title>الأستاذ أحمد - معلم اللغة الإنجليزية المعتمد</title>
        <meta name="description" content="تعرف على الأستاذ أحمد، معلم اللغة الإنجليزية المعتمد من جامعة أريزونا مع أكثر من 5 سنوات من الخبرة" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        <main>
          {/* Video Hero Section */}
          <section className="py-16 bg-gradient-to-b from-white to-bg-light">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-text-primary arabic-text mb-4">
                  تعرف على الأستاذ أحمد
                </h1>
                <p className="text-xl text-text-secondary arabic-text">
                  معلم لغة إنجليزية معتمد من جامعة أريزونا
                </p>
              </div>
              
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="تعريف بالأستاذ أحمد"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-text-primary arabic-text mb-6">
                من هو الأستاذ أحمد؟
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-text-secondary arabic-text leading-relaxed mb-4">
                  مرحباً! أنا الأستاذ أحمد، معلم لغة إنجليزية معتمد من جامعة أريزونا الأمريكية بشهادة TESOL. 
                  لدي شغف كبير بتعليم اللغة الإنجليزية ومساعدة الطلاب على تحقيق أهدافهم اللغوية.
                </p>
                <p className="text-text-secondary arabic-text leading-relaxed mb-4">
                  على مدار أكثر من 5 سنوات، ساعدت أكثر من 500 طالب على تحسين مهاراتهم في اللغة الإنجليزية، 
                  سواء كان ذلك للدراسة، العمل، أو السفر. أؤمن بأن كل طالب فريد من نوعه ويحتاج إلى منهج تعليمي 
                  مخصص يناسب احتياجاته وأهدافه.
                </p>
                <p className="text-text-secondary arabic-text leading-relaxed">
                  أستخدم أحدث الطرق التعليمية التفاعلية التي تجعل تعلم اللغة الإنجليزية ممتعاً وفعالاً. 
                  هدفي هو مساعدتك على التحدث بثقة وطلاقة في أي موقف.
                </p>
              </div>
            </div>
          </section>

          {/* Qualifications Section */}
          <section className="py-16 bg-bg-light">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-text-primary arabic-text mb-8">
                المؤهلات والشهادات
              </h2>
              <div className="grid gap-6">
                <div className="bg-white rounded-xl p-6 shadow-custom-md">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-primary arabic-text mb-2">
                        شهادة TESOL من جامعة أريزونا
                      </h3>
                      <p className="text-text-secondary arabic-text mb-2">
                        جامعة أريزونا، الولايات المتحدة الأمريكية
                      </p>
                      <p className="text-sm text-text-secondary arabic-text">
                        شهادة معتمدة دولياً في تدريس اللغة الإنجليزية للناطقين بلغات أخرى
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-custom-md">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-primary arabic-text mb-2">
                        خبرة 5+ سنوات في التدريس
                      </h3>
                      <p className="text-text-secondary arabic-text mb-2">
                        تدريس اللغة الإنجليزية عبر الإنترنت
                      </p>
                      <p className="text-sm text-text-secondary arabic-text">
                        خبرة واسعة في تدريس جميع المستويات من المبتدئين إلى المتقدمين
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-custom-md">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-primary arabic-text mb-2">
                        تقييم 5 نجوم من الطلاب
                      </h3>
                      <p className="text-text-secondary arabic-text mb-2">
                        أكثر من 500 طالب راضٍ
                      </p>
                      <p className="text-sm text-text-secondary arabic-text">
                        نسبة نجاح 98% في تحقيق أهداف الطلاب اللغوية
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Teaching Approach Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-text-primary arabic-text mb-8">
                منهجي في التدريس
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-custom-md border border-border-light">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary arabic-text mb-3">
                    تعليم تفاعلي
                  </h3>
                  <p className="text-text-secondary arabic-text leading-relaxed">
                    أستخدم أساليب تعليمية تفاعلية تشجع على المشاركة الفعالة والممارسة المستمرة للغة
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-custom-md border border-border-light">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary arabic-text mb-3">
                    منهج مخصص
                  </h3>
                  <p className="text-text-secondary arabic-text leading-relaxed">
                    كل طالب لديه احتياجات مختلفة، لذا أقوم بتخصيص الدروس لتناسب مستواك وأهدافك الشخصية
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-custom-md border border-border-light">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary arabic-text mb-3">
                    تركيز على المحادثة
                  </h3>
                  <p className="text-text-secondary arabic-text leading-relaxed">
                    أركز على تطوير مهارات المحادثة والنطق الصحيح لتتمكن من التواصل بثقة
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-custom-md border border-border-light">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary arabic-text mb-3">
                    مواد تعليمية متنوعة
                  </h3>
                  <p className="text-text-secondary arabic-text leading-relaxed">
                    استخدام مواد تعليمية حديثة ومتنوعة تشمل الفيديوهات، المقالات، والتمارين التفاعلية
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Success Stories Section */}
          <section className="py-16 bg-bg-light">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-text-primary arabic-text mb-8">
                قصص نجاح الطلاب
              </h2>
              <div className="grid gap-6">
                <div className="bg-white rounded-xl p-6 shadow-custom-md">
                  <div className="flex items-start space-x-4 space-x-reverse mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold text-lg">م</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary arabic-text">محمد العتيبي</h4>
                      <p className="text-sm text-text-secondary arabic-text">طالب جامعي</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-text-secondary arabic-text leading-relaxed">
                    "الأستاذ أحمد معلم رائع! ساعدني في تحسين مستواي في اللغة الإنجليزية بشكل كبير. 
                    الآن أستطيع التحدث بثقة وحصلت على درجة عالية في اختبار IELTS. شكراً جزيلاً!"
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-custom-md">
                  <div className="flex items-start space-x-4 space-x-reverse mb-4">
                    <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-success-600 font-bold text-lg">س</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary arabic-text">سارة أحمد</h4>
                      <p className="text-sm text-text-secondary arabic-text">موظفة في شركة دولية</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-text-secondary arabic-text leading-relaxed">
                    "بفضل الأستاذ أحمد، تحسنت مهاراتي في اللغة الإنجليزية بشكل ملحوظ. 
                    الدروس ممتعة وتفاعلية، والأستاذ صبور ويشرح بطريقة واضحة. أنصح به بشدة!"
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-custom-md">
                  <div className="flex items-start space-x-4 space-x-reverse mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-600 font-bold text-lg">ع</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary arabic-text">عبدالله الشمري</h4>
                      <p className="text-sm text-text-secondary arabic-text">رجل أعمال</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-text-secondary arabic-text leading-relaxed">
                    "احتجت لتحسين لغتي الإنجليزية للتواصل مع عملائي الدوليين. 
                    الأستاذ أحمد ساعدني كثيراً في تطوير مهارات المحادثة والكتابة. معلم محترف جداً!"
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* All Reviews Section */}
          <AllReviewsSection />

          {/* CTA Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white arabic-text mb-4">
                  هل أنت مستعد لبدء رحلتك في تعلم اللغة الإنجليزية؟
                </h2>
                <p className="text-xl text-white text-opacity-90 arabic-text mb-8">
                  احجز حصتك التجريبية المجانية الآن وابدأ في تحقيق أهدافك اللغوية
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="bg-white text-primary-600 hover:bg-gray-50 border-white shadow-custom-lg"
                  >
                    <Link to="/signup" className="flex items-center justify-center gap-2">
                      <RTLArrow direction="forward" size={20} />
                      احجز حصة تجريبية مجانية
                    </Link>
                  </Button>
                  <Button 
                    variant="whatsapp" 
                    size="lg" 
                    className="shadow-custom-lg hover:shadow-custom-xl"
                    onClick={() => window.open('https://wa.me/966564084838', '_blank')}
                  >
                    <svg className="w-5 h-5 ms-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                    </svg>
                    تواصل عبر واتساب
                  </Button>
                </div>
                <p className="text-white text-opacity-80 arabic-text mt-6 text-sm">
                  ✓ حصة تجريبية مجانية 30 دقيقة  ✓ بدون التزام  ✓ ضمان استرجاع الأموال
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  )
}
