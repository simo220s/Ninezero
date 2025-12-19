import CountdownTimer from './CountdownTimer';
import JoinClassButton from './JoinClassButton';

interface ClassCardProps {
  classSession: {
    id: string;
    title?: string;
    date: string;
    time: string;
    duration: number;
    meeting_link: string;
    is_trial?: boolean;
    teacher?: {
      first_name: string;
      last_name: string;
    };
    student?: {
      first_name: string;
      last_name: string;
    };
  };
  userRole?: 'student' | 'teacher' | 'admin';
  showJoinButton?: boolean;
  onStatusChange?: (status: 'upcoming' | 'active' | 'completed') => void;
}

export default function ClassCard({
  classSession,
  userRole = 'student',
  showJoinButton = true,
  onStatusChange,
}: ClassCardProps) {
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  const getTitle = (): string => {
    if (classSession.title) return classSession.title;
    if (classSession.is_trial) return 'حصة تجريبية';
    return 'حصة اللغة الإنجليزية';
  };

  const getParticipantName = (): string => {
    if (userRole === 'teacher' && classSession.student) {
      return `${classSession.student.first_name} ${classSession.student.last_name}`;
    } else if (userRole === 'student' && classSession.teacher) {
      return `${classSession.teacher.first_name} ${classSession.teacher.last_name}`;
    }
    return '';
  };

  const getParticipantLabel = (): string => {
    if (userRole === 'teacher') return 'الطالب';
    if (userRole === 'student') return 'المدرس';
    return '';
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-background-dark p-5 shadow-sm transition-shadow hover:shadow-lg">
      {/* Header with Icon */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-600/20 text-primary-600">
          <span className="material-symbols-outlined">
            {classSession.is_trial ? 'school' : 'menu_book'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text-primary dark:text-slate-50">
            {getTitle()}
          </h3>
          {classSession.is_trial && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              مجانية
            </span>
          )}
        </div>
      </div>

      {/* Date and Time */}
      <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400">
          <span className="material-symbols-outlined text-base">calendar_today</span>
          <span>{formatDate(classSession.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400">
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>@ {formatTime(classSession.time)}</span>
          <span className="text-xs">({classSession.duration} دقيقة)</span>
        </div>
        {getParticipantName() && (
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400">
            <span className="material-symbols-outlined text-base">person</span>
            <span>
              {getParticipantLabel()}: {getParticipantName()}
            </span>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
        <CountdownTimer
          targetDate={classSession.date}
          targetTime={classSession.time}
          duration={classSession.duration}
          onStatusChange={onStatusChange}
        />
      </div>

      {/* Join Button */}
      {showJoinButton && classSession.meeting_link && (
        <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
          <JoinClassButton
            classDate={classSession.date}
            classTime={classSession.time}
            meetingLink={classSession.meeting_link}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
