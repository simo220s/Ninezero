/**
 * Error Display Components
 * Reusable components for displaying errors in different contexts
 */

import React from 'react'
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'

interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
  className?: string
}

/**
 * Inline Error Display
 * Small error message for inline display
 */
export function InlineError({ message, onRetry, className = '' }: ErrorDisplayProps) {
  return (
    <div 
      className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
      dir="rtl"
      role="alert"
    >
      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      <p className="flex-1 text-sm text-red-800 arabic-text text-right">{message}</p>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

/**
 * Card Error Display
 * Error message in a card format for page-level errors
 */
export function CardError({ message, onRetry, className = '' }: ErrorDisplayProps) {
  return (
    <Card className={className} dir="rtl">
      <CardContent className="p-8 text-center" dir="rtl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 arabic-text text-right">
          خطأ في التحميل
        </h3>
        <p className="text-gray-600 mb-4 arabic-text text-right">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="arabic-text">
            المحاولة مرة أخرى
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Full Page Error Display
 * Error message that takes up the full page
 */
export function FullPageError({ message, onRetry, className = '' }: ErrorDisplayProps) {
  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 ${className}`}
      dir="rtl"
    >
      <div className="max-w-md w-full">
        <CardError message={message} onRetry={onRetry} />
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Empty State Display
 * Display when there's no data to show (not an error)
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`} dir="rtl">
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-700 mb-2 arabic-text text-right">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 arabic-text mb-6 text-right">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="arabic-text">
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface FormFieldErrorProps {
  message?: string
  className?: string
}

/**
 * Form Field Error
 * Error message for form fields
 */
export function FormFieldError({ message, className = '' }: FormFieldErrorProps) {
  if (!message) return null
  
  return (
    <p 
      className={`text-sm text-red-600 mt-1 arabic-text text-right flex items-center gap-1 ${className}`}
      dir="rtl"
      role="alert"
    >
      <XCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </p>
  )
}
