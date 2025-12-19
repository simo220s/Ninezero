import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ClassSession {
  id: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  subject?: string
}

interface Activity {
  id: string
  title: string
  time: string
  type: 'completed' | 'upcoming' | 'cancelled'
}

interface RecentActivityCardProps {
  classes: ClassSession[]
}

export default function RecentActivityCard({ classes }: RecentActivityCardProps) {
  // Convert classes to activities
  const activities: Activity[] = classes
    .slice(0, 5)
    .map(cls => {
      const classDate = new Date(`${cls.date}T${cls.time}`)
      const now = new Date()
      const isPast = classDate < now
      
      let type: Activity['type'] = 'upcoming'
      let title = cls.subject || 'درس اللغة العربية'
      
      if (cls.status === 'completed') {
        type = 'completed'
        title = `خلصت ${title}`
      } else if (cls.status === 'cancelled') {
        type = 'cancelled'
        title = `انلغت ${title}`
      } else if (cls.status === 'scheduled' && !isPast) {
        type = 'upcoming'
        title = `${title} الجاية`
      }

      const timeText = isPast 
        ? `قبل ${Math.floor((now.getTime() - classDate.getTime()) / (1000 * 60 * 60))} ساعة`
        : classDate.toLocaleDateString('ar-SA', { weekday: 'long', hour: '2-digit', minute: '2-digit' })

      return {
        id: cls.id,
        title,
        time: timeText,
        type
      }
    })

  // Add some mock achievements if we have few activities
  if (activities.length < 3) {
    activities.push({
      id: 'achievement-1',
      title: 'حصلت على شارة التميز',
      time: 'قبل 3 ساعات',
      type: 'completed'
    })
  }

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'upcoming':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 arabic-text text-right">آخر النشاطات</h3>
      
      <ScrollArea className="h-[300px] md:h-[400px] pl-4">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 flex-row-reverse cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
            >
              <div className="mt-1">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-gray-900 arabic-text text-right">{activity.title}</p>
                <p className="text-xs text-gray-500 arabic-text mt-1 text-right">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
