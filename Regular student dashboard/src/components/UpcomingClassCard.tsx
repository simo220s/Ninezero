import { Calendar, Clock, Video, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";

interface UpcomingClass {
  id: string;
  title: string;
  teacher: string;
  date: string;
  time: string;
  duration: string;
  subject: string;
  meetingLink: string;
}

export default function UpcomingClassCard() {
  // Mock data
  const upcomingClass: UpcomingClass = {
    id: "1",
    title: "درس اللغة العربية المتقدم",
    teacher: "أ. محمد أحمد",
    date: "الأربعاء، 6 نوفمبر 2025",
    time: "04:00 مساءً",
    duration: "60 دقيقة",
    subject: "اللغة العربية",
    meetingLink: "#"
  };

  const handleJoinClass = () => {
    toast.success("جاري الدخول للحصة...");
    setTimeout(() => {
      window.open(upcomingClass.meetingLink, '_blank');
    }, 500);
  };

  const handleViewDetails = () => {
    toast.info("عرض تفاصيل الحصة");
  };

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 rounded-3xl">
      <div className="flex items-start justify-between mb-4">
        <div className="text-right flex-1">
          <Badge className="bg-blue-500 hover:bg-blue-600 mb-2 arabic-text">الحصة الجاية</Badge>
          <h2 className="text-gray-900 mb-2 arabic-text text-right">{upcomingClass.title}</h2>
          <div className="flex items-center gap-2 text-gray-600 justify-end">
            <span className="arabic-text">{upcomingClass.teacher}</span>
            <User className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm">
          <Video className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-700 justify-end">
          <span className="arabic-text text-right">{upcomingClass.date}</span>
          <div className="bg-white rounded-xl p-2 shadow-sm">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-700 justify-end">
          <span className="arabic-text text-right">{upcomingClass.time} • {upcomingClass.duration}</span>
          <div className="bg-white rounded-xl p-2 shadow-sm">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleJoinClass}
          className="flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/30 transition-all"
        >
          <Video className="h-4 w-4 ml-2" />
          <span className="arabic-text">ادخل الحصة</span>
        </Button>
        <Button 
          onClick={handleViewDetails}
          variant="outline" 
          className="rounded-2xl border-blue-300 hover:bg-white active:scale-95 transition-all h-12"
        >
          <span className="arabic-text">التفاصيل</span>
        </Button>
      </div>

      {/* Time remaining indicator */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-center text-blue-700 arabic-text">
          <span>⏰</span> باقي ساعتين
        </p>
      </div>
    </Card>
  );
}
