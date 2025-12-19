import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 leading-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md active:scale-95 focus-visible:ring-primary-300",
        secondary: "bg-success-500 text-white hover:bg-success-600 hover:shadow-md active:scale-95 focus-visible:ring-success-300",
        outline: "border-2 border-primary-600 bg-white text-primary-600 hover:bg-primary-50 hover:shadow-md active:scale-95",
        ghost: "text-primary-600 hover:bg-primary-50 hover:shadow-sm active:scale-95",
        whatsapp: "bg-whatsapp text-white hover:bg-[#128C7E] hover:shadow-md active:scale-95 [&_svg]:text-white",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-13 px-8 text-lg",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  href?: string
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, href, loading, disabled, onClick, children, ...props }, ref) => {
    const [isProcessing, setIsProcessing] = React.useState(false)

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent action if disabled or loading
      if (disabled || loading || isProcessing) {
        e.preventDefault()
        return
      }

      // Handle navigation if href is provided (simple fallback without router)
      if (href) {
        e.preventDefault()
        window.location.href = href
        return
      }

      // Handle async onClick
      if (onClick) {
        try {
          setIsProcessing(true)
          const result = onClick(e) as unknown
          
          // If onClick returns a promise, wait for it
          if (result && typeof result === 'object' && 'then' in result) {
            await (result as Promise<unknown>)
          }
        } catch (error) {
          console.error('Button action failed:', error)
        } finally {
          setIsProcessing(false)
        }
      }
    }

    const isDisabled = disabled || loading || isProcessing
    const showLoading = loading || isProcessing

    // If asChild is true, render children directly (for Link components)
    if (asChild) {
      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {showLoading ? (
          <>
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>جاري المعالجة...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
