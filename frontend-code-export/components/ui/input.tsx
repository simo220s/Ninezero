import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-xl border-2 bg-white px-4 py-3 text-base transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:rounded-xl disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 hover:border-gray-400 focus-visible:ring-primary-600/20 focus-visible:border-primary-600",
        error: "border-red-500 hover:border-red-600 focus-visible:ring-red-500/20 focus-visible:border-red-500",
      },
      size: {
        sm: "h-9 px-3 py-2 text-sm",
        md: "h-12 px-4 py-3 text-base",
        lg: "h-14 px-6 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, helperText, type, ...props }, ref) => {
    const inputId = React.useId()
    const [showPassword, setShowPassword] = React.useState(false)
    const isPasswordField = type === 'password'
    const inputType = isPasswordField && showPassword ? 'text' : type
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary arabic-text text-right block"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            type={inputType}
            className={cn(
              inputVariants({ 
                variant: error ? "error" : variant, 
                size, 
                className 
              }),
              "arabic-text",
              isPasswordField && "ps-12"
            )}
            ref={ref}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute start-3 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded p-1"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 arabic-text" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-text-secondary arabic-text">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
