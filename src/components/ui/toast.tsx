/**
 * Toast Notification Component
 * Simple toast notification system for user feedback
 */

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

const Toast = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border-2 shadow-xl w-full animate-slide-in ${getStyles()}`}
      role="alert"
    >
      {getIcon()}
      <p className="flex-1 font-medium arabic-text text-sm sm:text-base break-words">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onClose: (id: string) => void
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed top-20 md:top-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4 sm:px-6">
      <div className="pointer-events-auto flex flex-col gap-2 w-full max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}

// Toast Manager Hook
let toastListeners: ((toast: ToastMessage) => void)[] = []

export const useToast = (): { toasts: ToastMessage[]; removeToast: (id: string) => void } => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast])
    }

    toastListeners.push(listener)

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const removeToast = (id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, removeToast }
}

// Global toast functions
const showToast = (type: ToastType, message: string, duration?: number): void => {
  const toast: ToastMessage = {
    id: `toast-${Date.now()}-${Math.random()}`,
    type,
    message,
    duration
  }

  toastListeners.forEach((listener) => listener(toast))
}

export const toast = {
  success: (message: string, duration?: number) => showToast('success', message, duration),
  error: (message: string, duration?: number) => showToast('error', message, duration),
  warning: (message: string, duration?: number) => showToast('warning', message, duration),
  info: (message: string, duration?: number) => showToast('info', message, duration)
}
