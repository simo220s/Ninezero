/**
 * Error Message Components
 * Reusable components for displaying error messages with Arabic text
 */

import { AlertCircle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

/**
 * Inline error message for forms and small sections
 */
export const InlineError = ({ message, className = '' }: ErrorMessageProps) => {
  return (
    <div className={`flex items-center gap-2 text-red-600 text-sm ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="arabic-text">{message}</span>
    </div>
  )
}

/**
 * Card error message for larger sections
 */
export const ErrorCard = ({ message, onRetry, className = '' }: ErrorMessageProps) => {
  return (
    <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-900 font-medium arabic-text">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              المحاولة مرة أخرى
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Full page error message
 */
export const ErrorPage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2 arabic-text">
            حدث خطأ
          </h2>
          <p className="text-text-secondary arabic-text">{message}</p>
        </div>

        <div className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 ml-2" />
              المحاولة مرة أخرى
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="w-full"
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state with optional error context
 */
interface EmptyStateProps {
  title: string
  message: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState = ({
  title,
  message,
  icon,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-2 arabic-text">
        {title}
      </h3>
      <p className="text-text-secondary mb-6 arabic-text">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Network error message
 */
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorCard
      message="خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
      onRetry={onRetry}
    />
  )
}

/**
 * Not found error message
 */
export const NotFoundError = ({ resourceName }: { resourceName: string }) => {
  return (
    <EmptyState
      title="غير موجود"
      message={`${resourceName} غير موجود أو تم حذفه.`}
      action={{
        label: 'العودة',
        onClick: () => window.history.back(),
      }}
    />
  )
}

/**
 * Permission error message
 */
export const PermissionError = () => {
  return (
    <ErrorPage message="ليس لديك صلاحية للوصول إلى هذه الصفحة." />
  )
}
