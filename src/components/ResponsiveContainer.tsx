import { type ReactNode, type JSX } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: keyof JSX.IntrinsicElements
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl'
}

export default function ResponsiveContainer({
  children,
  className = '',
  maxWidth = '7xl',
  padding = 'md',
  as = 'div'
}: ResponsiveContainerProps) {
  const Component = as as keyof JSX.IntrinsicElements
  const { isMobile, isTablet } = useResponsive()

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'px-4' : 'px-6',
    md: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8',
    lg: isMobile ? 'px-6' : isTablet ? 'px-8' : 'px-12'
  }

  const containerClasses = [
    'mx-auto',
    'w-full',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ')

  return (
    <Component className={containerClasses}>
      {children}
    </Component>
  )
}

// Specialized containers for common use cases
export function SectionContainer({ 
  children, 
  className = '', 
  ...props 
}: Omit<ResponsiveContainerProps, 'as'>) {
  const { isMobile, isTablet } = useResponsive()
  
  const sectionPadding = isMobile ? 'py-12' : isTablet ? 'py-16' : 'py-20'
  
  return (
    <section className={`${sectionPadding} ${className}`}>
      <ResponsiveContainer {...props}>
        {children}
      </ResponsiveContainer>
    </section>
  )
}

export function HeroContainer({ 
  children, 
  className = '', 
  ...props 
}: Omit<ResponsiveContainerProps, 'as'>) {
  const { isMobile, isTablet } = useResponsive()
  
  const heroPadding = isMobile ? 'py-16' : isTablet ? 'py-20' : 'py-24'
  
  return (
    <section className={`${heroPadding} ${className}`}>
      <ResponsiveContainer {...props}>
        {children}
      </ResponsiveContainer>
    </section>
  )
}
