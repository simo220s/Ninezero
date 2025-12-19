import { BookOpen, Flame, GraduationCap } from 'lucide-react'
import QuickStatsCard from './QuickStatsCard'
import UpcomingClassCard from './UpcomingClassCard'
import PlanOverviewCard from './PlanOverviewCard'
import CreditsCard from './CreditsCard'
import RecentActivityCard from './RecentActivityCard'
import AddCreditsModal from './AddCreditsModal'
import { useState } from 'react'
import type { DashboardData } from './NewRegularDashboard'

interface DashboardContentProps {
  dashboardData: DashboardData | null
  onRefresh: () => void
}

export default function DashboardContent({ dashboardData, onRefresh }: DashboardContentProps) {
  const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false)

  const firstName = dashboardData?.profile?.first_name || 'طالب'

  // Calculate streak (mock for now - can be enhanced with real data)
  const streak = 12

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8 animate-fade-in text-right">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 arabic-text text-right">
            هلا، {firstName}! 👋
          </h1>
          <p className="text-lg text-gray-600 arabic-text text-right">هذا ملخص نشاطك اليوم</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in">
          <QuickStatsCard
            title="الحصص المكتملة"
            value={dashboardData?.completedClasses || 0}
            icon={BookOpen}
            trend={`+${Math.min(dashboardData?.completedClasses || 0, 3)} هالأسبوع`}
          />
          <QuickStatsCard
            title="سلسلة الأيام"
            value={`${streak} يوم`}
            icon={Flame}
            iconColor="text-orange-500"
          />
          <QuickStatsCard
            title="الرصيد المتبقي"
            value={`${dashboardData?.credits || 0} رصيد`}
            icon={GraduationCap}
            onClick={() => setIsAddCreditsModalOpen(true)}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Upcoming Class - Full width on mobile, spans 2 columns on desktop */}
          <div className="lg:col-span-2 animate-fade-in">
            <UpcomingClassCard 
              classes={dashboardData?.classes || []}
              studentId={dashboardData?.profile?.id}
            />
          </div>

          {/* Plan Overview */}
          <div className="animate-fade-in">
            <PlanOverviewCard 
              completedClasses={dashboardData?.completedClasses || 0}
              scheduledClasses={dashboardData?.scheduledClasses || 0}
              classes={dashboardData?.classes || []}
            />
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Credits Card */}
          <div className="lg:col-span-2 animate-fade-in">
            <CreditsCard 
              currentBalance={dashboardData?.credits || 0}
              onAddCredits={() => setIsAddCreditsModalOpen(true)} 
            />
          </div>

          {/* Recent Activity */}
          <div className="animate-fade-in">
            <RecentActivityCard 
              classes={dashboardData?.classes || []}
            />
          </div>
        </div>
      </div>

      {/* Add Credits Modal */}
      <AddCreditsModal
        open={isAddCreditsModalOpen}
        onClose={() => setIsAddCreditsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  )
}
