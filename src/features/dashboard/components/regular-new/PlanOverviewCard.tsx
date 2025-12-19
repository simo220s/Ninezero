import { BookOpen, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'

interface ClassSession {
  id: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
}

interface PlanOverviewCardProps {
  completedClasses: number
  scheduledClasses: number
  classes: ClassSession[]
}

export default function PlanOverviewCard({ completedClasses, scheduledClasses, classes }: PlanOverviewCardProps) {
  const totalSessions = completedClasses + scheduledClasses
  const progressPercentage = totalSessions > 0 ? (completedClasses / totalSessions) * 100 : 0

  // Find next session
  const nextSession = classes
    .filter(c => c.status === 'scheduled')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })[0]

  const nextSessionText = nextSession 
    ? new Date(`${nextSession.date}T${nextSession.time}`).toLocaleDateString('ar-SA', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'لا توجد حصص مجدولة'

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 arabic-text flex-1 text-right">خطتي</h3>
        <BookOpen className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base text-gray-900 arabic-text text-right">حصص فردية</span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 arabic-text flex-1 text-right">
              {completedClasses} / {totalSessions} حصة
            </span>
            <span className="text-sm text-gray-600 arabic-text">التقدم</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-600 arabic-text">الحصة الجاية</p>
              <p className="text-sm text-gray-900 arabic-text mt-1">{nextSessionText}</p>
            </div>
            <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          asChild
          className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
        >
          <Link to="/book-regular">
            <span className="arabic-text">احجز حصة جديدة</span>
          </Link>
        </Button>
        <Button 
          asChild
          variant="outline" 
          className="w-full rounded-2xl border-blue-300 text-blue-500 hover:bg-white hover:text-blue-600 active:scale-95 transition-all h-12 flex items-center justify-center"
        >
          <Link to="/dashboard/student/classes">
            <span className="arabic-text">شوف الجدول</span>
          </Link>
        </Button>
      </div>
    </Card>
  )
}
