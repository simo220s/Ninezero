import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO date string
  targetTime: string; // HH:MM format
  duration?: number; // Class duration in minutes
  onStatusChange?: (status: 'upcoming' | 'active' | 'completed') => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimer({
  targetDate,
  targetTime,
  duration = 60,
  onStatusChange,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [status, setStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming');

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      // Parse target date and time
      const [year, month, day] = targetDate.split('-').map(Number);
      const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
      
      const targetDateTime = new Date(year, month - 1, day, targetHours, targetMinutes);
      const now = new Date();
      const endDateTime = new Date(targetDateTime.getTime() + duration * 60 * 1000);

      // Calculate difference in milliseconds
      const diff = targetDateTime.getTime() - now.getTime();
      const endDiff = endDateTime.getTime() - now.getTime();

      // Determine status
      let newStatus: 'upcoming' | 'active' | 'completed' = 'upcoming';
      if (diff <= 0 && endDiff > 0) {
        newStatus = 'active';
      } else if (endDiff <= 0) {
        newStatus = 'completed';
      }

      if (newStatus !== status) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }

      // If class is active or completed, return zeros
      if (newStatus !== 'upcoming') {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      // Calculate time components
      const total = Math.max(0, diff);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((total % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes: mins,
        seconds: secs,
        total,
      };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, targetTime, duration, status, onStatusChange]);

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // Render based on status
  if (status === 'active') {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-sm font-bold">الحصة جارية الآن</span>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-base">check_circle</span>
        <span className="text-sm">انتهت الحصة</span>
      </div>
    );
  }

  // Upcoming - show countdown
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <span className="material-symbols-outlined text-base">schedule</span>
        <span className="text-sm">تبدأ خلال:</span>
      </div>
      
      <div className="flex items-center gap-2" dir="ltr">
        {/* Days */}
        {timeRemaining.days > 0 && (
          <div className="flex flex-col items-center min-w-[50px] px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatNumber(timeRemaining.days)}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {timeRemaining.days === 1 ? 'يوم' : 'أيام'}
            </span>
          </div>
        )}

        {/* Hours */}
        {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
          <div className="flex flex-col items-center min-w-[50px] px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatNumber(timeRemaining.hours)}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {timeRemaining.hours === 1 ? 'ساعة' : 'ساعات'}
            </span>
          </div>
        )}

        {/* Minutes */}
        <div className="flex flex-col items-center min-w-[50px] px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatNumber(timeRemaining.minutes)}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">دقيقة</span>
        </div>

        {/* Seconds - only show if less than 1 hour remaining */}
        {timeRemaining.days === 0 && timeRemaining.hours === 0 && (
          <div className="flex flex-col items-center min-w-[50px] px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatNumber(timeRemaining.seconds)}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">ثانية</span>
          </div>
        )}
      </div>
    </div>
  );
}
