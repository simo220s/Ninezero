import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const SheetContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function Sheet({ open: controlledOpen, onOpenChange, children }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setUncontrolledOpen(newOpen)
    }
  }

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

export function SheetTrigger({ children, asChild: _asChild, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const { setOpen } = React.useContext(SheetContext)
  
  return (
    <div onClick={() => setOpen(true)} {...props}>
      {children}
    </div>
  )
}

export function SheetContent({ 
  children, 
  className,
  side = "right",
  dir = "ltr",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" | "top" | "bottom"; dir?: "rtl" | "ltr" }) {
  const { open, setOpen } = React.useContext(SheetContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [open])

  if (!mounted || !open) return null

  const sideClasses = {
    left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r",
    right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l",
    top: "inset-x-0 top-0 h-auto border-b",
    bottom: "inset-x-0 bottom-0 h-auto border-t"
  }

  const content = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-in-out"
        onClick={() => setOpen(false)}
      />
      
      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 bg-white shadow-lg",
          sideClasses[side],
          className
        )}
        dir={dir}
        style={{
          animation: side === 'left' 
            ? 'slideInLeft 0.3s ease-out' 
            : side === 'right' 
            ? 'slideInRight 0.3s ease-out'
            : side === 'top'
            ? 'slideInTop 0.3s ease-out'
            : 'slideInBottom 0.3s ease-out',
        }}
        {...props}
      >
        <button
          onClick={() => setOpen(false)}
          className={cn(
            "absolute top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 z-10",
            dir === 'rtl' ? "left-4" : "right-4"
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  )

  return createPortal(content, document.body)
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-center sm:text-left p-6", className)}
      {...props}
    />
  )
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    />
  )
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
}
