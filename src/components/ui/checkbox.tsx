import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId()
    const checkboxId = id || generatedId
    
    return (
      <div className="flex items-start gap-2">
        <input
          id={checkboxId}
          type="checkbox"
          ref={ref}
          className={cn(
            "w-5 h-5 rounded border-2 border-gray-300 text-primary-600 transition-all duration-200",
            "hover:border-primary-400 hover:shadow-sm",
            "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none",
            "active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300",
            "cursor-pointer",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {label && (
          <label 
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium cursor-pointer select-none",
              error ? "text-red-600" : "text-gray-900",
              props.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
