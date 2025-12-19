import { Link } from 'react-router-dom'
import { Clock, CheckCircle, GraduationCap, Globe } from 'lucide-react'

const JOURNEY_STEPS = [
  {
    title: 'احجز حصة تجريبية',
    description: 'مدة 25 دقيقة مجاناً عبر Google Meet، بدون أي التزامات.',
    icon: Clock
  },
  {
    title: 'نقيّم مستوى ولدك',
    description: 'نحدد نقاط القوة والضعف بدقة ونعرف مستواه الحالي.',
    icon: CheckCircle
  },
  {
    title: 'نجهز خطة مخصصة',
    description: 'خطة تعليمية تناسب عمره، اهتماماته، ومستواه الدراسي.',
    icon: GraduationCap
  },
  {
    title: 'نبدأ الرحلة',
    description: 'حصص منتظمة، ممتعة، وتفاعلية لكسر حاجز الخوف.',
    icon: Globe
  }
]

export default function JourneySection() {
  return (
    <section className="py-16 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 arabic-text">رحلة الطالب معنا</h2>
          <p className="mt-2 text-gray-600 arabic-text">خطوات بسيطة تبدأ بتجربة مجانية وتنتهي بالتفوق</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-12 right-0 left-0 h-1 bg-gray-200 w-full -z-10 transform -translate-y-1/2"></div>
          
          {JOURNEY_STEPS.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm relative z-10 h-full">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg border-4 border-primary-50">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 arabic-text">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed arabic-text">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/signup" 
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors arabic-text"
          >
            ابدأ من الحصة التجريبية
          </Link>
        </div>
      </div>
    </section>
  )
}
