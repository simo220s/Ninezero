import { Users, Clock, Star } from 'lucide-react'

const STATS = [
  { 
    value: '+500', 
    label: 'طالب متفوق', 
    description: 'حققوا أهدافهم في تعلم الإنجليزية', 
    icon: Users 
  },
  { 
    value: '8+', 
    label: 'سنوات خبرة', 
    description: 'في تعليم الأطفال والمراهقين', 
    icon: Clock 
  },
  { 
    value: '5.0', 
    label: 'تقييم ممتاز', 
    description: 'من 5 نجوم لأكثر من 200 تقييم', 
    icon: Star 
  },
]

export default function StatsSection() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STATS.map((stat, idx) => (
            <div key={idx} className="flex items-center p-4">
              <div className="p-3 bg-accent-50 rounded-xl text-accent-500 ml-4">
                <stat.icon size={32} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 font-english">{stat.value}</div>
                <div className="font-bold text-gray-800 arabic-text">{stat.label}</div>
                <div className="text-sm text-gray-500 arabic-text">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
