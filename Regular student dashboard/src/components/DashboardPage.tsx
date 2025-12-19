import { useState } from "react";
import { BookOpen, Flame, GraduationCap } from "lucide-react";
import UpcomingClassCard from "./UpcomingClassCard";
import QuickStatsCard from "./QuickStatsCard";
import CreditsCard from "./CreditsCard";
import PlanOverviewCard from "./PlanOverviewCard";
import RecentActivityCard from "./RecentActivityCard";
import AddCreditsModal from "./AddCreditsModal";
import { toast } from "sonner@2.0.3";

export default function DashboardPage() {
  const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false);

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8 animate-fade-in text-right">
          <h1 className="text-gray-900 mb-2 arabic-text text-right">هلا، أحمد! 👋</h1>
          <p className="text-gray-600 arabic-text text-right">هذا ملخص نشاطك اليوم</p>
        </div>

        {/* Upcoming Class - First as requested */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <UpcomingClassCard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in">
          <QuickStatsCard
            title="الحصص المكتملة"
            value="24"
            icon={BookOpen}
            trend="+3 هالأسبوع"
            onClick={() => toast.info("عرض كل الحصص المكتملة")}
          />
          <QuickStatsCard
            title="سلسلة الأيام"
            value="12 يوم"
            icon={Flame}
            iconColor="text-orange-500"
            onClick={() => toast.success("ماشاء الله! استمر 🔥")}
          />
          <QuickStatsCard
            title="الرصيد المتبقي"
            value="450 رصيد"
            icon={GraduationCap}
            onClick={() => setIsAddCreditsModalOpen(true)}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Credits Card - Moved here since Upcoming Class is now top */}
          <div className="lg:col-span-2 animate-fade-in">
             <CreditsCard onAddCredits={() => setIsAddCreditsModalOpen(true)} />
          </div>

          {/* Plan Overview */}
          <div className="animate-fade-in">
            <PlanOverviewCard />
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 animate-fade-in">
            <RecentActivityCard />
          </div>
        </div>
      </div>

      {/* Add Credits Modal */}
      <AddCreditsModal
        open={isAddCreditsModalOpen}
        onClose={() => setIsAddCreditsModalOpen(false)}
      />
    </div>
  );
}
