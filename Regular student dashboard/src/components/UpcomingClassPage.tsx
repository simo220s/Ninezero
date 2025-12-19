import { Calendar, Clock, Video, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Calendar as CalendarUI } from "./ui/calendar";
import { toast } from "sonner@2.0.3";
import { useState } from "react";

interface ClassSession {
  id: string;
  title: string;
  teacher: string;
  date: Date;
  time: string;
  duration: string;
  subject: string;
  meetingLink: string;
}

export default function UpcomingClassPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const upcomingClass: ClassSession = {
    id: "1",
    title: "Advanced English Grammar",
    teacher: "Ms. Sarah Johnson",
    date: new Date(2025, 10, 6, 16, 0), // November 6, 2025, 4:00 PM
    time: "04:00 مساءً",
    duration: "60 دقيقة",
    subject: "English",
    meetingLink: "#"
  };

  const nextClasses: ClassSession[] = [
    {
      id: "2",
      title: "English Conversation Practice",
      teacher: "Mr. John Smith",
      date: new Date(2025, 10, 8, 15, 0),
      time: "03:00 مساءً",
      duration: "45 دقيقة",
      subject: "English",
      meetingLink: "#"
    },
    {
      id: "3",
      title: "IELTS Preparation",
      teacher: "Ms. Emily Brown",
      date: new Date(2025, 10, 10, 17, 0),
      time: "05:00 مساءً",
      duration: "90 دقيقة",
      subject: "English",
      meetingLink: "#"
    },
    {
      id: "4",
      title: "Business English",
      teacher: "Ms. Sarah Johnson",
      date: new Date(2025, 10, 12, 16, 0),
      time: "04:00 مساءً",
      duration: "60 دقيقة",
      subject: "English",
      meetingLink: "#"
    }
  ];

  // Dates that have classes scheduled
  const classDates = [upcomingClass, ...nextClasses].map(c => c.date);

  const handleJoinClass = () => {
    toast.success("جاري الدخول للحصة...");
    setTimeout(() => {
      window.open(upcomingClass.meetingLink, '_blank');
    }, 500);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Upcoming Class */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 rounded-3xl shadow-2xl">
              <div className="text-right mb-6">
                <Badge className="bg-white/20 backdrop-blur-sm hover:bg-white/30 mb-4 text-white border-white/30">
                  الحصة الجاية
                </Badge>
                <h1 className="text-white mb-3 text-right">{upcomingClass.title}</h1>
                <div className="flex items-center gap-3 justify-end text-blue-50">
                  <span className="arabic-text">{upcomingClass.teacher}</span>
                  <User className="h-5 w-5" />
                </div>
              </div>

              {/* Class Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 justify-end text-white/90">
                  <span className="arabic-text">{formatDate(upcomingClass.date)}</span>
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-3 justify-end text-white/90">
                  <span className="arabic-text">{upcomingClass.time} • {upcomingClass.duration}</span>
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              {/* Time Remaining */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
                <p className="text-center text-white arabic-text">
                  <span className="text-2xl">⏰</span>
                  <span className="block mt-2">باقي على بداية الحصة</span>
                  <span className="block mt-1">ساعتين و 15 دقيقة</span>
                </p>
              </div>

              {/* Join Button */}
              <Button 
                onClick={handleJoinClass}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 active:scale-95 rounded-2xl h-14 shadow-xl transition-all"
                size="lg"
              >
                <Video className="h-5 w-5 ml-2" />
                <span className="arabic-text">ادخل الحصة الحين</span>
              </Button>
            </Card>

            {/* Next Classes */}
            <Card className="p-6 md:p-8 bg-white border border-gray-200 rounded-3xl">
              <h2 className="text-gray-900 mb-6 arabic-text text-right">الحصص الجاية</h2>
              
              <div className="space-y-4">
                {nextClasses.map((classSession) => (
                  <div 
                    key={classSession.id}
                    className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => toast.info("عرض التفاصيل")}
                      >
                        <span className="arabic-text">التفاصيل</span>
                      </Button>
                      <div className="flex-1 text-right">
                        <h3 className="text-gray-900 mb-2">{classSession.title}</h3>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex items-center gap-2 justify-end arabic-text">
                            <span>{classSession.teacher}</span>
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex items-center gap-2 justify-end arabic-text">
                            <span>{formatDate(classSession.date)}</span>
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="flex items-center gap-2 justify-end arabic-text">
                            <span>{classSession.time}</span>
                            <Clock className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Calendar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white border border-gray-200 rounded-3xl sticky top-24">
              <h2 className="text-gray-900 mb-4 arabic-text text-right">التقويم</h2>
              
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-2xl border-0"
                modifiers={{
                  booked: classDates
                }}
                modifiersStyles={{
                  booked: {
                    backgroundColor: '#DBEAFE',
                    color: '#2563EB',
                    fontWeight: 'bold'
                  }
                }}
              />
              
              <div className="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-gray-700 arabic-text">الأيام الملونة فيها حصص مجدولة</span>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
