import { BookOpen, Flame, GraduationCap } from "lucide-react"
import { Card } from "@/components/ui/card"

interface QuickStatsCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
  iconColor?: string
  onClick?: () => void
}

function QuickStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  iconColor = "text-blue-500",
  onClick
}: QuickStatsCardProps) {
  return (
    <Card 
      onClick={onClick}
      className="p-4 md:p-6 hover:shadow-lg active:scale-95 transition-all duration-200 bg-white border border-gray-200 cursor-pointer rounded-2xl"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 bg-blue-50 rounded-2xl ${iconColor}`}>
          <Icon className="h-6 w-6 md:h-8 md:w-8" />
        </div>
        <div className="text-right">
          <p className="text-sm md:text-base text-gray-600 mb-2 arabic-text text-right">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 text-right">{value}</p>
          {trend && (
            <p className="text-xs md:text-sm text-gray-500 mt-1 text-right arabic-text">{trend}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

interface EnhancedQuickStatsProps {
  completedClasses: number
  currentStreak: number
  credits: number
  onAddCredits: () => void
}

export default function EnhancedQuickStats({
  completedClasses,
  currentStreak,
  credits,
  onAddCredits
}: EnhancedQuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in">
      <QuickStatsCard
        title="الحصص المكتملة"
        value={completedClasses}
        icon={BookOpen}
        trend={`+${Math.min(completedClasses, 3)} هالأسبوع`}
      />
      <QuickStatsCard
        title="سلسلة الأيام"
        value={`${currentStreak} يوم`}
        icon={Flame}
        iconColor="text-orange-500"
      />
      <QuickStatsCard
        title="الرصيد المتبقي"
        value={`${credits} رصيد`}
        icon={GraduationCap}
        onClick={onAddCredits}
      />
    </div>
  )
}
