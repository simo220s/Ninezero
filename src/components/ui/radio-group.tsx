import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined)

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export function RadioGroup({ 
  value: controlledValue, 
  onValueChange,
  defaultValue,
  className,
  ...props 
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "")
  
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue)
    } else {
      setUncontrolledValue(newValue)
    }
  }

  return (
    <RadioGroupContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("grid gap-2", className)} {...props} />
    </RadioGroupContext.Provider>
  )
}

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    if (!context) throw new Error("RadioGroupItem must be used within RadioGroup")

    return (
      <input
        ref={ref}
        type="radio"
        className={cn(
          "h-4 w-4 rounded-full border-2 border-gray-300 text-blue-600 transition-all duration-200",
          "hover:border-blue-400 hover:shadow-sm",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none",
          "active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300",
          "cursor-pointer",
          className
        )}
        checked={context.value === value}
        onChange={() => context.onValueChange(value)}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"
