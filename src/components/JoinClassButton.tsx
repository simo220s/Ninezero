import { useState, useEffect } from 'react';

interface JoinClassButtonProps {
  classDate: string; // ISO date string (YYYY-MM-DD)
  classTime: string; // HH:MM format
  meetingLink: string;
  joinWindowMinutes?: number; // Minutes before class when join becomes available
  className?: string;
}

export default function JoinClassButton({
  classDate,
  classTime,
  meetingLink,
  joinWindowMinutes = 10,
  className = '',
}: JoinClassButtonProps) {
  const [canJoin, setCanJoin] = useState(false);
  const [timeUntilJoin, setTimeUntilJoin] = useState<string>('');

  useEffect(() => {
    const checkJoinAvailability = () => {
      // Parse target date and time
      const [year, month, day] = classDate.split('-').map(Number);
      const [hours, minutes] = classTime.split(':').map(Number);
      
      const classDateTime = new Date(year, month - 1, day, hours, minutes);
      const joinWindowStart = new Date(
        classDateTime.getTime() - joinWindowMinutes * 60 * 1000
      );
      const now = new Date();

      // Check if we're within the join window
      const isWithinWindow = now >= joinWindowStart && now <= classDateTime;
      setCanJoin(isWithinWindow);

      // Calculate time until join window opens
      if (!isWithinWindow && now < joinWindowStart) {
        const diff = joinWindowStart.getTime() - now.getTime();
        const minutesRemaining = Math.ceil(diff / (1000 * 60));
        
        if (minutesRemaining < 60) {
          setTimeUntilJoin(`يمكنك الانضمام خلال ${minutesRemaining} دقيقة`);
        } else {
          const hoursRemaining = Math.floor(minutesRemaining / 60);
          const minsRemaining = minutesRemaining % 60;
          setTimeUntilJoin(
            `يمكنك الانضمام خلال ${hoursRemaining} ساعة و ${minsRemaining} دقيقة`
          );
        }
      } else if (now > classDateTime) {
        setTimeUntilJoin('انتهى وقت الانضمام');
      } else {
        setTimeUntilJoin('');
      }
    };

    // Initial check
    checkJoinAvailability();

    // Update every 10 seconds
    const interval = setInterval(checkJoinAvailability, 10000);

    return () => clearInterval(interval);
  }, [classDate, classTime, joinWindowMinutes]);

  const handleJoinClick = () => {
    if (canJoin && meetingLink) {
      // Open meeting link in new tab
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleJoinClick}
        disabled={!canJoin}
        className={`
          flex items-center justify-center gap-2 h-11 px-6 rounded-lg
          text-base font-bold transition-all duration-200
          ${
            canJoin
              ? 'bg-secondary text-white shadow-md hover:shadow-lg hover:scale-105 cursor-pointer animate-pulse'
              : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed'
          }
          ${className}
        `}
        aria-label={canJoin ? 'انضم إلى الفصل' : 'لم يبدأ بعد'}
      >
        <span className="material-symbols-outlined">
          {canJoin ? 'videocam' : 'schedule'}
        </span>
        <span className="truncate">
          {canJoin ? 'انضم إلى الفصل الآن' : 'لم يبدأ بعد'}
        </span>
      </button>

      {/* Time until join message */}
      {timeUntilJoin && !canJoin && (
        <p className="text-xs text-center text-slate-600 dark:text-slate-400">
          {timeUntilJoin}
        </p>
      )}

      {/* Active join indicator */}
      {canJoin && (
        <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>يمكنك الانضمام الآن</span>
        </div>
      )}
    </div>
  );
}
