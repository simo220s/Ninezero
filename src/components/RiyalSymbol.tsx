/**
 * RiyalSymbol Component
 * Displays the Saudi Riyal currency symbol with customizable styling
 */

interface RiyalSymbolProps {
  className?: string
  size?: number
}

export function RiyalSymbol({ className = '', size = 20 }: RiyalSymbolProps) {
  return (
    <span 
      className={`inline-block ${className}`}
      style={{ fontSize: size }}
    >
      ر.س
    </span>
  )
}
