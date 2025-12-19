import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { toast } from "sonner@2.0.3";

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  iconColor?: string;
  onClick?: () => void;
}

export default function QuickStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  iconColor = "text-blue-500",
  onClick
}: QuickStatsCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast.info(`عرض تفاصيل ${title}`);
    }
  };

  return (
    <Card 
      onClick={handleClick}
      className="p-4 md:p-6 hover:shadow-lg active:scale-95 transition-all duration-200 bg-white border border-gray-200 cursor-pointer rounded-2xl"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 bg-blue-50 rounded-2xl ${iconColor}`}>
          <Icon className="h-6 w-6 md:h-8 md:w-8" />
        </div>
        <div className="text-right">
          <p className="text-gray-600 mb-2 arabic-text text-right">{title}</p>
          <p className="text-blue-600 text-right">{value}</p>
          {trend && (
            <p className="text-gray-500 mt-1 text-right arabic-text">{trend}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
