import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStudentClasses } from '@/lib/database'
import { logger } from '@/lib/logger'
import { Link } from 'react-router-dom'
import EnhancedHeader from './EnhancedHeader'
import { useToast, ToastContainer } from '@/components/ui/toast'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, Gift, Sparkles, Target, Trophy, MapPin, Smile, GraduationCap, Award, Users, Star } from 'lucide-react'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meeting_link?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  is_trial?: boolean
}

export default function EnhancedTrialDashboard() {
  const { user, signOut } = useAuth()
  const { toasts, removeToast } = useToast()
  const [trialClass, setTrialClass] = useState<ClassSession | null>(null)
  const [allClasses, setAllClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [daysRemaining, setDaysRemaining] = useState<number>(7)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (user) {
      loadTrialClass()
      calculateDaysRemaining()
    }
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      setShowBanner(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const calculateDaysRemaining = () => {
    if (!user?.created_at) {
      setDaysRemaining(7)
      return
    }
    const createdAt = new Date(user.created_at)
    const now = new Date()
    const diffTime = 7 * 24 * 60 * 60 * 1000 - (now.getTime() - createdAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysRemaining(Math.max(0, diffDays))
  }

  const loadTrialClass = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data: classSessions, error } = await getStudentClasses(user.id)
      if (error) {
        logger.error('Error loading class sessions:', error)
        return
      }
      setAllClasses(classSessions || [])
      const trial = classSessions?.find(s => s.is_trial && s.status === 'scheduled')
      setTrialClass(trial || null)
    } catch (err) {
      logger.error('Trial class loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFirstName = () => {
    return user?.user_metadata?.first_name || 'طالب'
  }

  const handleBookNow = () => {
    window.location.href = '/booking'
  }

  const handleJoinClass = () => {
    if (trialClass?.meeting_link) {
      window.open(trialClass.meeting_link, '_blank')
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Countdown Banner */}
      {showBanner && daysRemaining > 0 && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-2.5 md:py-3">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-1.5 md:gap-2 flex-1">
                <Clock className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                <span className="text-xs md:text-base">
                  باقي <span className="font-black text-base md:text-xl mx-1 animate-pulse">{daysRemaining}</span> أيام لحجز الحصة المجانية!
                </span>
              </div>
              <Button 
                onClick={handleBookNow}
                size="sm"
                className="bg-white text-orange-600 hover:bg-orange-50 text-xs md:text-sm h-8 md:h-9"
              >
                احجز الحين!
              </Button>
            </div>
          </div>
        </div>
      )}

      <EnhancedHeader
        currentPage="dashboard"
        onNavigate={() => {}}
        userName={getFirstName()}
        userEmail={user?.email || ''}
        onSignOut={signOut}
      />

      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <div className="space-y-6 md:space-y-8">
            
            {/* Hero CTA */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-6 md:p-12 shadow-2xl animate-fade-in">
              <Badge className="absolute top-3 left-3 md:top-4 md:left-4 bg-green-500 text-white border-0 px-3 md:px-4 py-1.5 md:py-2">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                100% مجاني
              </Badge>
              <div className="relative z-10 text-center text-white">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">لا تفوّت الفرصة!</h1>
                <p className="text-base md:text-xl mb-2 opacity-95">احجز حصة تجريبية مجانية لولدك الحين</p>
                <p className="text-sm md:text-base mb-4 opacity-90">(للأعمار من 10 إلى 18 سنة)</p>
                <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
                  <span className="line-through text-base md:text-lg">99 ريال</span>
                  <span className="text-2xl md:text-3xl font-bold">0 ريال</span>
                </div>
                <div className="mb-6 md:mb-8 space-y-2 text-sm md:text-base">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">✓</span>
                    <span>25 دقيقة كاملة مع معلم خبير</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">✓</span>
                    <span>تقييم مستوى مجاني</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">✓</span>
                    <span>بدون التزام أو بطاقة ائتمان</span>
                  </div>
                </div>
                <Button 
                  onClick={handleBookNow}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all shadow-2xl h-12 md:h-14 px-8 md:px-12 rounded-2xl w-full md:w-auto"
                >
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  احجز حصة ولدك الحين!
                </Button>
                <p className="mt-3 md:mt-4 text-xs md:text-sm opacity-90">⏱️ الحجز يأخذ دقيقتين فقط</p>
              </div>
            </div>

            {/* Gift Card + Value */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <Card className="rounded-3xl bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 p-6 md:p-7 border-2 border-blue-300 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 md:p-4 shadow-lg">
                    <Gift className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-black text-blue-900 mb-4 text-right">هديتك: حصة مجانية لولدك</h3>
                    <div className="space-y-3">
                      <div className="bg-white rounded-xl px-4 py-3 border-2 border-blue-200 shadow-sm">
                        <p className="text-xs md:text-sm text-blue-600 text-right font-semibold">الرصيد</p>
                        <p className="text-base md:text-lg font-black text-blue-900 text-right">0.5 رصيد (25 دقيقة)</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-xl px-4 py-3 border-2 border-orange-300 shadow-sm">
                        <p className="text-sm md:text-base text-right font-black">⏰ باقي {daysRemaining} أيام - احجز الحين!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="md:col-span-2 p-6 md:p-8 bg-white">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-right">ليش تختار الأستاذ أحمد؟</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {[
                    { icon: '🎯', text: 'خبرة 10+ سنوات في تعليم الأطفال' },
                    { icon: '⭐', text: 'تقييم 5/5 من أولياء الأمور' },
                    { icon: '🎓', text: 'معتمد CELTA من جامعة كامبريدج' },
                    { icon: '💡', text: 'أسلوب تدريس ممتع وفعّال' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-right">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm md:text-base text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* What to Expect */}
            <Card className="p-6 md:p-8 bg-white animate-fade-in">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 text-gray-900">إيش تتوقع من الحصة التجريبية؟</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                  { icon: Target, title: 'تقييم مستوى ولدك', desc: 'نحدد مستوى ولدك بدقة عشان نبدأ من النقطة الصحيحة', color: 'blue' },
                  { icon: Trophy, title: 'تحديد الأهداف', desc: 'نحدد الأهداف اللي تبغى ولدك يوصل لها', color: 'green' },
                  { icon: MapPin, title: 'خطة على كيف ولدك', desc: 'خطة تعليمية مخصصة تناسب احتياجات ولدك', color: 'orange' },
                  { icon: Smile, title: 'يجرب الحصة بنفسه', desc: 'ولدك يجرب حصة حقيقية ويشوف كيف بنتعلم', color: 'purple' }
                ].map((item, i) => {
                  const Icon = item.icon
                  const bgColor = item.color === 'blue' ? 'bg-blue-100 text-blue-600' : item.color === 'green' ? 'bg-green-100 text-green-600' : item.color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-5 md:p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className={`${bgColor} w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4`}>
                        <Icon className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <h3 className="text-base md:text-lg font-bold mb-2 text-gray-900 text-right">{item.title}</h3>
                      <p className="text-sm md:text-base text-gray-600 text-right">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Teacher Profile */}
            <Card className="overflow-hidden animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-56 md:h-auto bg-gradient-to-br from-blue-100 to-indigo-100">
                  <img 
                    src="https://i.postimg.cc/Pxk53c04/photo-5864035878953928423-y-1.jpg"
                    alt="الأستاذ أحمد"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white rounded-full px-3 md:px-4 py-1.5 md:py-2 shadow-lg">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900 text-sm md:text-base">5.0/5</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900 text-right">الأستاذ أحمد</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-right">معلم لغة إنجليزية معتمد مع خبرة أكثر من 10 سنوات في تعليم الأطفال. متخصص في جعل التعلم ممتع وفعّال.</p>
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xl md:text-2xl font-bold text-blue-900">10+</p>
                      <p className="text-xs text-blue-600">سنوات خبرة</p>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xl md:text-2xl font-bold text-green-900">500+</p>
                      <p className="text-xs text-green-600">طالب</p>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-orange-50 rounded-lg">
                      <Award className="w-5 h-5 md:w-6 md:h-6 text-orange-600 mx-auto mb-1" />
                      <p className="text-xl md:text-2xl font-bold text-orange-900">TESOL</p>
                      <p className="text-xs text-orange-600">معتمد</p>
                    </div>
                  </div>
                  <Link to="/tutor">
                    <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold">
                      تعرف على الأستاذ أحمد
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 md:p-12 text-center text-white shadow-xl animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">جاهز تبدأ؟</h2>
              <p className="text-base md:text-lg mb-4 md:mb-6 opacity-95">احجز الحصة التجريبية المجانية الحين - باقي {daysRemaining} أيام فقط!</p>
              <Button 
                onClick={handleBookNow}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all shadow-2xl h-12 md:h-14 px-8 md:px-12 rounded-2xl w-full md:w-auto"
              >
                احجز حصة ولدك الحين!
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl md:hidden z-40">
        <Button 
          onClick={handleBookNow}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl shadow-lg font-semibold"
        >
          احجز الحصة المجانية الحين!
        </Button>
      </div>
      <div className="h-20 md:hidden"></div>

      <Footer />
    </div>
  )
}
