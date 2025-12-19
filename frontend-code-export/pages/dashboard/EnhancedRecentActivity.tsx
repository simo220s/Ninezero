import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClassSession {
  id: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  subject?: string
}

interface EnhancedRecentActivityProps {
  classes: ClassSession[]
}

export default function EnhancedRecentActivity({ classes }: EnhancedRecentActivityProps) {
  const getActivityType = (status: string): 'completed' | 'upcoming' | 'cancelled' => {
    if (status === 'completed') return 'completed'
    if (status === 'scheduled') return 'upcoming'
    return 'cancelled'
  }

  const getActivityTitle = (classSession: ClassSession) => {
    const type = getActivityType(classSession.status)
    const subject = classSession.subject || 'الإنجليزية'
    
    if (type === 'completed') return `خلصت درس ${subject}`
    if (type === 'upcoming') return `حصة ${subject} الجاية`
    return `انلغت حصة ${subject}`
  }

  const getActivityTime = (classSession: ClassSession) => {
    const date = new Date(`${classSession.date}T${classSession.time}`)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 1) return `بعد ${diffDays} أيام`
    if (diffDays === 1) return 'بكرة'
    if (diffHours > 0) return `بعد ${diffHours} ساعات`
    if (diffHours < 0 && diffHours > -24) return 'أمس'
    if (diffHours <= -24) return `قبل ${Math.abs(diffDays)} أيام`
    return 'اليوم'
  }

  const getIcon = (type: 'completed' | 'upcoming' | 'cancelled') => {
    switch (type) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "upcoming":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  // Sort classes by date
  const sortedClasses = [...classes]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 5)

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <h3 className="text-lg font-bold text-gray-900 mb-4 arabic-text text-right">آخر النشاطات</h3>
      
      <ScrollArea className="h-[300px] md:h-[400px] pl-4">
        <div className="space-y-4">
          {sortedClasses.length > 0 ? (
            sortedClasses.map((classSession) => {
              const type = getActivityType(classSession.status)
              return (
                <div 
                  key={classSession.id} 
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 flex-row-reverse cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                >
                  <div className="mt-1">
                    {getIcon(type)}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-gray-900 arabic-text text-right">
                      {getActivityTitle(classSession)}
                    </p>
                    <p className="text-xs text-gray-500 arabic-text mt-1 text-right">
                      {getActivityTime(classSession)}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 arabic-text">لا توجد نشاطات حالياً</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
