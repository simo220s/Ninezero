import { BookOpen, Calendar, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/toast"

interface EnhancedPlanOverviewProps {
  totalSessions: number
  completedSessions: number
  nextSession?: {
    date: string
    time: string
  } | null
}

export default function EnhancedPlanOverview({
  totalSessions,
  completedSessions,
  nextSession
}: EnhancedPlanOverviewProps) {
  const progressPercentage = (completedSessions / totalSessions) * 100

  const handleSettings = () => {
    toast.info("فتح إعدادات الخطة")
  }

  const handleBookSession = () => {
    window.location.href = '/book-regular'
  }

  const handleViewSchedule = () => {
    toast.info("عرض الجدول الكامل")
  }

  const formatNextSession = () => {
    if (!nextSession) return 'لا توجد حصص مجدولة'
    
    const date = new Date(`${nextSession.date}T${nextSession.time}`)
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }) + ' - ' + date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <BookOpen className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900 arabic-text text-right">خطتي</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={handleSettings} className="hover:bg-gray-100 rounded-full w-8 h-8 p-0">
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
          <span className="font-semibold text-gray-900 arabic-text text-right">حصص فردية</span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 arabic-text">
              {completedSessions} / {totalSessions} حصة
            </span>
            <span className="text-sm text-gray-600 arabic-text text-right">التقدم</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3 justify-end text-right">
            <div className="text-right">
              <p className="text-sm text-gray-600 arabic-text text-right">الحصة الجاية</p>
              <p className="text-sm font-medium text-gray-900 arabic-text mt-1 text-right">
                {formatNextSession()}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleBookSession}
          className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/20 transition-all"
        >
          <span className="arabic-text text-white font-semibold">احجز حصة جديدة</span>
        </Button>
        <Button 
          onClick={handleViewSchedule}
          variant="outline" 
          className="w-full rounded-2xl border-blue-300 text-blue-500 hover:bg-white hover:text-blue-600 active:scale-95 transition-all h-12"
        >
          <span className="arabic-text font-semibold">شوف الجدول</span>
        </Button>
      </div>
    </Card>
  )
}
