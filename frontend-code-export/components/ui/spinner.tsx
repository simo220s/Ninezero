/**
 * Loading spinner components
 */

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

/**
 * Circular loading spinner
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-300 border-t-primary-600 dark:border-slate-600 dark:border-t-primary-500',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="جاري التحميل"
    >
      <span className="sr-only">جاري التحميل...</span>
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600 dark:text-slate-400">جاري التحميل...</p>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner with text
 */
export function LoadingText({
  text = 'جاري التحميل...',
  size = 'sm',
}: {
  text?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} />
      <span className="text-gray-600 dark:text-slate-400">{text}</span>
    </div>
  );
}

/**
 * Button loading spinner
 */
export function ButtonSpinner() {
  return <Spinner size="sm" className="border-white border-t-white/30" />;
}

/**
 * Overlay loading spinner
 */
export function OverlaySpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80">
      <Spinner size="lg" />
    </div>
  );
}
