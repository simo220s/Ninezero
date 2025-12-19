import { type ReactNode, type JSX } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  as?: keyof JSX.IntrinsicElements
}

export default function ResponsiveGrid({
  children,
  className = '',
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 3, '2xl': 3 },
  gap = 'md',
  as = 'div'
}: ResponsiveGridProps) {
  const Component = as as keyof JSX.IntrinsicElements
  const { currentBreakpoint } = useResponsive()

  // Get the appropriate number of columns for current breakpoint
  const getColumns = () => {
    const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i]
      if (cols[bp] !== undefined) {
        return cols[bp]
      }
    }
    return 1
  }

  const columns = getColumns()
  
  const gridColsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  const gridClasses = [
    'grid',
    gridColsClasses[columns as keyof typeof gridColsClasses] || 'grid-cols-1',
    gapClasses[gap],
    className
  ].filter(Boolean).join(' ')

  return (
    <Component className={gridClasses}>
      {children}
    </Component>
  )
}

// Specialized grid components
export function PricingGrid({ children, className = '', ...props }: Omit<ResponsiveGridProps, 'cols'>) {
  return (
    <ResponsiveGrid
      cols={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3, '2xl': 3 }}
      gap="lg"
      className={className}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  )
}

export function StatsGrid({ children, className = '', ...props }: Omit<ResponsiveGridProps, 'cols'>) {
  return (
    <ResponsiveGrid
      cols={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4, '2xl': 4 }}
      gap="md"
      className={className}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  )
}

export function TestimonialsGrid({ children, className = '', ...props }: Omit<ResponsiveGridProps, 'cols'>) {
  return (
    <ResponsiveGrid
      cols={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3, '2xl': 3 }}
      gap="lg"
      className={className}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  )
}

export function DashboardGrid({ children, className = '', ...props }: Omit<ResponsiveGridProps, 'cols'>) {
  return (
    <ResponsiveGrid
      cols={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3, '2xl': 3 }}
      gap="md"
      className={className}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  )
}
