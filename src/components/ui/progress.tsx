import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    // Check if RTL is enabled (defaults to RTL for Arabic-first app)
    const isRTL = typeof document !== 'undefined' && 
      (document.documentElement.dir === 'rtl' || 
       document.documentElement.lang === 'ar' ||
       !document.documentElement.dir) // Default to RTL if not specified
    
    const progressValue = Math.min(100, Math.max(0, value))
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-primary-600 transition-all duration-300 ease-in-out",
            isRTL && "origin-right"
          )}
          style={{ 
            width: `${progressValue}%`,
            ...(isRTL ? { 
              marginLeft: 'auto',
              marginRight: 0,
              transformOrigin: 'right'
            } : {
              transformOrigin: 'left'
            })
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
