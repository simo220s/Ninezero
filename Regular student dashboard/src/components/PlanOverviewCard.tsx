import { BookOpen, Calendar, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { toast } from "sonner@2.0.3";

export default function PlanOverviewCard() {
  const plan = {
    name: "حصص فردية",
    totalSessions: 20,
    completedSessions: 12,
    nextSession: "الأربعاء، 6 نوفمبر - 04:00 مساءً"
  };

  const progressPercentage = (plan.completedSessions / plan.totalSessions) * 100;

  const handleSettings = () => {
    toast.info("فتح إعدادات الخطة");
  };

  const handleBookSession = () => {
    toast.success("جاري فتح صفحة الحجز...");
  };

  const handleViewSchedule = () => {
    toast.info("عرض الجدول الكامل");
  };

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <BookOpen className="h-5 w-5 text-blue-500" />
        <h3 className="text-gray-900 arabic-text text-right">خطتي</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={handleSettings} className="hover:bg-gray-100 rounded-full">
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
          <span className="text-gray-900 arabic-text text-right">{plan.name}</span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 arabic-text">
              {plan.completedSessions} / {plan.totalSessions} حصة
            </span>
            <span className="text-gray-600 arabic-text text-right">التقدم</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3 justify-end text-right">
            <div className="text-right">
              <p className="text-gray-600 arabic-text text-right">الحصة الجاية</p>
              <p className="text-gray-900 arabic-text mt-1 text-right">{plan.nextSession}</p>
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
          <span className="arabic-text">احجز حصة جديدة</span>
        </Button>
        <Button 
          onClick={handleViewSchedule}
          variant="outline" 
          className="w-full rounded-2xl border-gray-300 hover:bg-gray-50 active:scale-95 transition-all h-12"
        >
          <span className="arabic-text">شوف الجدول</span>
        </Button>
      </div>
    </Card>
  );
}
