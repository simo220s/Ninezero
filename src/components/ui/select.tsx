import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id || generatedId
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={selectId}
            className="text-sm font-medium text-text-primary arabic-text text-right block"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "flex w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-gray-900 transition-all duration-200",
            "border-gray-300 hover:border-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300",
            "cursor-pointer",
            "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pe-10",
            error && "border-red-500 hover:border-red-600 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-sm text-red-600 arabic-text text-right" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-text-secondary arabic-text text-right">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
