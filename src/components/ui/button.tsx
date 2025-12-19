import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ios-button inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 leading-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none",
  {
    variants: {
      variant: {
        primary: "ios-button-primary bg-primary-600 text-white hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] active:bg-primary-800 shadow-md hover:shadow-lg focus-visible:ring-primary-600 disabled:bg-gray-300 disabled:text-gray-500",
        secondary: "ios-button-primary bg-success-500 text-white hover:bg-success-600 hover:scale-[1.02] active:scale-[0.98] active:bg-success-700 shadow-md hover:shadow-lg focus-visible:ring-success-600 disabled:bg-gray-300 disabled:text-gray-500",
        outline: "ios-button-secondary border-2 border-gray-300 bg-transparent text-text-primary hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02] active:scale-[0.98] active:bg-gray-100 focus-visible:ring-primary-600 focus-visible:border-primary-600 disabled:border-gray-200 disabled:text-gray-400",
        danger: "ios-button-secondary border-2 border-error-300 bg-transparent text-error-600 hover:bg-error-50 hover:border-error-400 hover:scale-[1.02] active:scale-[0.98] active:bg-error-100 focus-visible:ring-error-600 focus-visible:border-error-600 disabled:border-gray-200 disabled:text-gray-400",
        ghost: "ios-button-glass bg-white/20 backdrop-blur-md hover:bg-white/30 hover:scale-[1.02] active:scale-[0.98] active:bg-white/40 border border-white/30 text-text-primary focus-visible:ring-primary-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200",
        whatsapp: "ios-button-primary bg-[#25D366] text-white hover:bg-[#128C7E] hover:scale-[1.02] active:scale-[0.98] active:bg-[#0F6B5E] shadow-md hover:shadow-lg focus-visible:ring-[#25D366] [&_svg]:text-white disabled:bg-gray-300 disabled:text-gray-500",
      },
      size: {
        sm: "h-9 min-h-[36px] px-4 text-sm rounded-lg",
        md: "h-11 min-h-[44px] px-6 text-base rounded-xl",
        lg: "h-12 min-h-[48px] px-8 text-lg rounded-xl",
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
  (
    { 
      className, 
      variant, 
      size, 
      asChild = false, 
      href, 
      loading, 
      disabled, 
      onClick, 
      children, 
      type = "button",
      ...props 
    }, 
    ref
  ) => {
    const [isProcessing, setIsProcessing] = React.useState(false)
    const Comp = asChild ? Slot : "button"

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement | HTMLElement>) => {
      if (disabled || loading || isProcessing) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (href) {
        e.preventDefault()
        window.location.href = href
        return
      }

      if (onClick) {
        try {
          setIsProcessing(true)
          const result = onClick(e as React.MouseEvent<HTMLButtonElement>)

          if (result && typeof result === "object" && "then" in result) {
            await (result as Promise<unknown>)
          }
        } catch (error) {
          console.error("Button action failed:", error)
        } finally {
          setIsProcessing(false)
        }
      }
    }

    const isDisabled = disabled || loading || isProcessing
    const showLoading = loading || isProcessing

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as React.Ref<any>}
        onClick={handleClick}
        disabled={!asChild ? isDisabled : undefined}
        aria-disabled={asChild ? isDisabled : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        type={!asChild ? type : undefined}
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
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
