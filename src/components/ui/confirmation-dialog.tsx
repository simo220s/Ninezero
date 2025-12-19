import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent } from './dialog'
import { Button } from './button'

/**
 * Confirmation Dialog Component
 * 
 * A reusable confirmation dialog for destructive or important actions.
 * Fully RTL-compatible with Arabic text support.
 * 
 * Features:
 * - Multiple severity levels (danger, warning, info, success)
 * - RTL support with dir="rtl"
 * - Keyboard navigation (Escape to cancel, Enter to confirm)
 * - Accessible with ARIA labels
 * - Customizable buttons and messages
 */

export type ConfirmationDialogVariant = 'danger' | 'warning' | 'info' | 'success'

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Callback when user confirms the action */
  onConfirm: () => void | Promise<void>
  /** Dialog title */
  title: string
  /** Dialog description/message */
  description: string
  /** Confirm button text (default: "تأكيد") */
  confirmText?: string
  /** Cancel button text (default: "إلغاء") */
  cancelText?: string
  /** Variant/severity level (default: "danger") */
  variant?: ConfirmationDialogVariant
  /** Whether the confirm action is loading */
  loading?: boolean
  /** RTL direction (default: "rtl") */
  dir?: 'ltr' | 'rtl'
  /** Additional details or warnings to display */
  details?: string
}

const variantConfig = {
  danger: {
    icon: AlertCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
    titleColor: 'text-red-900'
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    titleColor: 'text-amber-900'
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    titleColor: 'text-blue-900'
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confirmButtonClass: 'bg-green-600 hover:bg-green-700 text-white',
    titleColor: 'text-green-900'
  }
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  loading = false,
  dir = 'rtl',
  details
}: ConfirmationDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
    // Don't auto-close - let the parent component handle it
    // This allows for error handling in the parent
  }

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  // Handle Enter key for confirmation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir} className="p-6">
        <div className="space-y-4" dir={dir} onKeyDown={handleKeyDown}>
          {/* Icon */}
          <div className={`flex ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
            <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h2 
            className={`text-xl font-bold ${config.titleColor} ${dir === 'rtl' ? 'text-right' : 'text-left'} arabic-text`}
            id="confirmation-dialog-title"
          >
            {title}
          </h2>

          {/* Description */}
          <p 
            className={`text-gray-700 ${dir === 'rtl' ? 'text-right' : 'text-left'} arabic-text leading-relaxed`}
            id="confirmation-dialog-description"
          >
            {description}
          </p>

          {/* Additional Details */}
          {details && (
            <div 
              className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              dir={dir}
            >
              <p className="text-sm text-gray-600 arabic-text">
                {details}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div 
            className={`flex gap-3 pt-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
            dir={dir}
          >
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 arabic-text ${config.confirmButtonClass}`}
              aria-label={confirmText}
            >
              {loading ? 'جاري المعالجة...' : confirmText}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="outline"
              className="flex-1 arabic-text"
              aria-label={cancelText}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook for managing confirmation dialog state
 * 
 * @example
 * const { isOpen, open, close, confirm } = useConfirmationDialog(async () => {
 *   await deleteItem()
 * })
 * 
 * return (
 *   <>
 *     <Button onClick={open}>Delete</Button>
 *     <ConfirmationDialog
 *       open={isOpen}
 *       onOpenChange={close}
 *       onConfirm={confirm}
 *       title="حذف العنصر"
 *       description="هل أنت متأكد من حذف هذا العنصر؟"
 *     />
 *   </>
 * )
 */
export function useConfirmationDialog(onConfirmAction: () => void | Promise<void>) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const open = () => setIsOpen(true)
  const close = () => {
    if (!loading) {
      setIsOpen(false)
    }
  }

  const confirm = async () => {
    try {
      setLoading(true)
      await onConfirmAction()
      setIsOpen(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
      // Don't close dialog on error - let user retry or cancel
    } finally {
      setLoading(false)
    }
  }

  return {
    isOpen,
    loading,
    open,
    close,
    confirm
  }
}

// Import React for the hook
import React from 'react'
