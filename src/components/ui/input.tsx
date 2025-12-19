import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-xl border-2 border-solid bg-white px-4 py-3 text-base transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary placeholder:text-right focus:outline-none focus:ring-2 focus:ring-offset-0 focus:rounded-xl disabled:cursor-not-allowed disabled:opacity-50 text-right",
  {
    variants: {
      variant: {
        default: "border-gray-300 hover:border-gray-400 focus:ring-primary-600/20 focus:border-primary-600",
        error: "border-red-500 hover:border-red-600 focus:ring-red-500/20 focus:border-red-500",
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
  ({ className, variant, size, label, error, helperText, type, onFocus, onBlur, ...props }, ref) => {
    const inputId = React.useId()
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const isPasswordField = type === 'password'
    const inputType = isPasswordField && showPassword ? 'text' : type
    const currentVariant = error ? "error" : variant

    return (
      <div className="space-y-2" dir="rtl">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary arabic-text block text-right w-full"
            style={{ direction: 'rtl', textAlign: 'right' }}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full" dir="rtl">
          <input
            id={inputId}
            type={inputType}
            dir="rtl"
            className={cn(
              inputVariants({
                variant: currentVariant,
                size,
              }),
              "arabic-text w-full",
              isPasswordField && "pe-12",
              className
            )}
            style={{ 
              direction: 'rtl', 
              textAlign: 'right', 
              unicodeBidi: 'plaintext',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: error ? '#ef4444' : isFocused ? '#2563eb' : '#d1d5db'
            }}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            ref={ref}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded p-1"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 arabic-text text-right w-full" role="alert" style={{ direction: 'rtl', textAlign: 'right' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-text-secondary arabic-text text-right w-full" style={{ direction: 'rtl', textAlign: 'right' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
