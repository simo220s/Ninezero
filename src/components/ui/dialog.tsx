import * as React from "react"
import { useEffect } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      
      // Focus trap: Focus first focusable element
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus()
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <>
      {/* Backdrop - covers whole page with proper z-index */}
      <div
        className="fixed inset-0 z-[1300] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      
      {/* Dialog Content */}
      <div 
        className="fixed inset-0 z-[1400] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
      >
        <div 
          ref={dialogRef}
          className="pointer-events-auto w-full max-w-md animate-in zoom-in-95 duration-200"
        >
          {children}
        </div>
      </div>
    </>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  dir?: 'ltr' | 'rtl'
}

export function DialogContent({ children, className = '', dir }: DialogContentProps) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto border border-gray-200 ${className}`} 
      dir={dir}
      role="document"
      tabIndex={-1}
    >
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps & { className?: string }) {
  return (
    <div className={`p-6 pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h2 
      className={`text-xl font-bold text-text-primary leading-tight ${className}`}
      id="dialog-title"
    >
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-text-secondary mt-2 leading-relaxed ${className}`}>
      {children}
    </p>
  )
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`p-6 pt-4 mt-4 border-t border-gray-200 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  )
}