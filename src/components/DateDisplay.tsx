/**
 * Date Display Components
 * Arabic-formatted date and time displays
 */

import React from 'react';
import { formatDate, formatTime, formatDateTime, getRelativeTime, getDayName, getMonthName } from '@/lib/dayjs';
import { Calendar, Clock } from 'lucide-react';

interface DateDisplayProps {
  date: Date | string;
  format?: 'date' | 'time' | 'datetime' | 'relative';
  showIcon?: boolean;
  className?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'date',
  showIcon = false,
  className = '',
}) => {
  const getFormattedDate = () => {
    switch (format) {
      case 'date':
        return formatDate(date);
      case 'time':
        return formatTime(date);
      case 'datetime':
        return formatDateTime(date);
      case 'relative':
        return getRelativeTime(date);
      default:
        return formatDate(date);
    }
  };

  const Icon = format === 'time' ? Clock : Calendar;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Icon className="w-4 h-4 text-gray-500" />}
      <span>{getFormattedDate()}</span>
    </div>
  );
};

interface DayMonthDisplayProps {
  date: Date | string;
  showDay?: boolean;
  showMonth?: boolean;
  className?: string;
}

export const DayMonthDisplay: React.FC<DayMonthDisplayProps> = ({
  date,
  showDay = true,
  showMonth = true,
  className = '',
}) => {
  return (
    <div className={`text-center ${className}`}>
      {showDay && (
        <div className="text-sm text-gray-600">{getDayName(date)}</div>
      )}
      {showMonth && (
        <div className="text-lg font-semibold">{getMonthName(date)}</div>
      )}
    </div>
  );
};
