import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react'

/**
 * Props for RTLArrow component
 */
interface RTLArrowProps {
  /** Direction of the arrow: 'forward' | 'back' | 'up' | 'down' */
  direction: 'forward' | 'back' | 'up' | 'down'
  /** Optional CSS class name */
  className?: string
  /** Size of the arrow icon in pixels (default: 20) */
  size?: number
}

/**
 * RTLArrow Component
 * 
 * Automatically flips arrow direction for RTL layout.
 * - 'forward' → ArrowLeft in RTL (ArrowRight in LTR)
 * - 'back' → ArrowRight in RTL (ArrowLeft in LTR)
 * - 'up' → ArrowUp (no change)
 * - 'down' → ArrowDown (no change)
 * 
 * @example
 * ```tsx
 * <RTLArrow direction="forward" className="text-primary-600" />
 * <RTLArrow direction="back" size={24} />
 * ```
 */
export function RTLArrow({ direction, className = '', size = 20 }: RTLArrowProps) {
  // Since the app is Arabic-only and always RTL, we can simplify the logic
  // In RTL: forward = left, back = right
  
  const getArrowIcon = () => {
    switch (direction) {
      case 'forward':
        // In RTL, forward means left
        return <ArrowLeft className={className} size={size} />
      case 'back':
        // In RTL, back means right
        return <ArrowRight className={className} size={size} />
      case 'up':
        return <ArrowUp className={className} size={size} />
      case 'down':
        return <ArrowDown className={className} size={size} />
      default:
        return <ArrowLeft className={className} size={size} />
    }
  }

  return getArrowIcon()
}

export default RTLArrow
