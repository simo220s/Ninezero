/**
 * RiyalPrice Component
 * Displays prices in Saudi Riyals with the official Riyal symbol
 * 
 * Following Official Saudi Riyal Symbol Guidelines:
 * 1. Position: Symbol on the LEFT of numeral (appears RIGHT in RTL)
 * 2. Spacing: Required space between symbol and numeral
 * 3. Alignment: Symbol height aligned with text height
 * 4. Direction: Symbol direction matches text direction (RTL)
 * 5. Proportions: Symbol shape maintained
 * 6. Contrast: Inherits color for sufficient contrast
 */

interface RiyalPriceProps {
  amount: number
  className?: string
  showSymbol?: boolean
}

export function RiyalPrice({
  amount,
  className = '',
  showSymbol = true
}: RiyalPriceProps) {
  // Format number with Arabic locale
  const formattedNumber = new Intl.NumberFormat('ar-SA').format(amount)

  if (!showSymbol) {
    return <span className={className}>{formattedNumber}</span>
  }

  // Official Guidelines Implementation:
  // - Symbol positioned to LEFT of numeral (RIGHT in RTL)
  // - Space between symbol and numeral (ms-1)
  // - Symbol inherits font-size, font-weight, and color from parent
  // - Aligned with text baseline
  return (
    <span className={`inline-flex items-baseline ${className}`} dir="rtl">
      <span>{formattedNumber}</span>
      <span
        className="icon-saudi_riyal ms-1"
        style={{
          color: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'normal',
          lineHeight: 'inherit'
        }}
        aria-label="ريال سعودي"
      ></span>
    </span>
  )
}
