import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface Activity {
  id: string;
  title: string;
  time: string;
  type: "completed" | "upcoming" | "cancelled";
}

export default function RecentActivityCard() {
  const activities: Activity[] = [
    {
      id: "1",
      title: "خلصت درس الرياضيات",
      time: "قبل ساعتين",
      type: "completed"
    },
    {
      id: "2",
      title: "حصة العلوم الجاية",
      time: "بكرة الساعة 3:00 عصراً",
      type: "upcoming"
    },
    {
      id: "3",
      title: "حصلت على شارة التميز",
      time: "قبل 3 ساعات",
      type: "completed"
    },
    {
      id: "4",
      title: "خلصت واجب الإنجليزي",
      time: "أمس",
      type: "completed"
    },
    {
      id: "5",
      title: "انلغت حصة التاريخ",
      time: "أمس",
      type: "cancelled"
    }
  ];

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "upcoming":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <h3 className="text-gray-900 mb-4 arabic-text text-right">آخر النشاطات</h3>
      
      <ScrollArea className="h-[300px] md:h-[400px] pl-4">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 flex-row-reverse cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
              <div className="mt-1">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 text-right">
                <p className="text-gray-900 arabic-text text-right">{activity.title}</p>
                <p className="text-gray-500 arabic-text mt-1 text-right">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
