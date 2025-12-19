/**
 * Empty state components for better UX when no data is available
 */

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Base empty state component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/20',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-slate-500">{icon}</div>
      )}
      <h3 className="text-xl font-bold text-gray-900 dark:text-slate-50">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-base text-gray-600 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * Empty classes state
 */
export function EmptyClasses() {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl">event_busy</span>
      }
      title="لا توجد فصول قادمة"
      description="استمتع بوقتك! سنقوم بإعلامك عند جدولة فصول جديدة."
    />
  );
}

/**
 * Empty students state
 */
export function EmptyStudents({ onAddStudent }: { onAddStudent?: () => void }) {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl">
          person_off
        </span>
      }
      title="لا يوجد طلاب"
      description="ابدأ بإضافة طلاب جدد لإدارة فصولهم."
      action={
        onAddStudent && (
          <button
            onClick={onAddStudent}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
          >
            <span className="material-symbols-outlined">add</span>
            <span>إضافة طالب</span>
          </button>
        )
      }
    />
  );
}

/**
 * Empty notifications state
 */
export function EmptyNotifications() {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl">
          notifications_off
        </span>
      }
      title="لا توجد إشعارات"
      description="ستظهر الإشعارات الجديدة هنا."
      className="p-8"
    />
  );
}

/**
 * Empty search results state
 */
export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl">search_off</span>
      }
      title="لا توجد نتائج"
      description={
        query
          ? `لم نجد أي نتائج لـ "${query}"`
          : 'جرب البحث بكلمات مختلفة'
      }
    />
  );
}

/**
 * Empty reviews state
 */
export function EmptyReviews() {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl">rate_review</span>
      }
      title="لا توجد تقييمات"
      description="ستظهر تقييمات الطلاب هنا بعد إكمال الفصول."
    />
  );
}

/**
 * Empty transactions state
 */
export function EmptyTransactions() {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl">receipt_long</span>
      }
      title="لا توجد معاملات"
      description="سجل المعاملات فارغ حالياً."
    />
  );
}

/**
 * No data available state
 */
export function NoData({ message }: { message?: string }) {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl">
          folder_off
        </span>
      }
      title="لا توجد بيانات"
      description={message || 'لا توجد بيانات متاحة للعرض.'}
    />
  );
}

/**
 * Error state
 */
export function ErrorState({
  title = 'حدث خطأ',
  description = 'عذراً، حدث خطأ أثناء تحميل البيانات.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={
        <span className="material-symbols-outlined text-6xl text-error-500">
          error
        </span>
      }
      title={title}
      description={description}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span>إعادة المحاولة</span>
          </button>
        )
      }
    />
  );
}
