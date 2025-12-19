import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface QuickStatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  iconColor?: string
  onClick?: () => void
}

export default function QuickStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  iconColor = 'text-blue-500',
  onClick
}: QuickStatsCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={`p-4 md:p-6 hover:shadow-lg active:scale-95 transition-all duration-200 bg-white border border-gray-200 rounded-2xl ${onClick ? 'cursor-pointer' : ''}`}
      dir="rtl"
    >
      <div className="flex items-center justify-between flex-row-reverse">
        <div className={`p-3 bg-blue-50 rounded-2xl ${iconColor} flex-shrink-0 mr-4`}>
          <Icon className="h-6 w-6 md:h-8 md:w-8" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm text-gray-600 mb-2 arabic-text">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1 arabic-text">{trend}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
