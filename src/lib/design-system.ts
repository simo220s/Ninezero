/**
 * Design System Constants
 * 
 * Centralized design tokens for consistent styling across the application.
 * These values should be used instead of hardcoded Tailwind classes.
 */

export const DesignSystem = {
  // Background Patterns
  backgrounds: {
    dashboard: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    light: 'bg-bg-light',
    white: 'bg-white',
    primary: 'bg-primary-50',
  },

  // Container Widths
  containers: {
    narrow: 'max-w-4xl',    // Trial dashboard, forms
    standard: 'max-w-6xl',  // Default pages
    wide: 'max-w-7xl',      // Regular dashboard pages
  },

  // Header Styles
  headers: {
    fixed: 'fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50',
    static: 'bg-white shadow-sm border-b border-gray-200',
  },

  // Card Styles
  cards: {
    base: 'bg-white rounded-lg shadow-sm border border-gray-100',
    elevated: 'bg-white rounded-lg shadow-md border border-gray-100',
    highlighted: 'bg-white rounded-lg shadow-lg border-2 border-primary-600',
    gradient: 'bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-lg shadow-md border border-primary-200',
  },

  // Spacing Scale
  spacing: {
    section: {
      mobile: 'py-4',
      tablet: 'sm:py-6',
      desktop: 'md:py-8',
      combined: 'py-4 sm:py-6 md:py-8',
    },
    container: {
      mobile: 'px-4',
      tablet: 'md:px-6',
      combined: 'px-4 md:px-6',
    },
    card: {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8',
      responsive: 'p-4 sm:p-6 md:p-8',
    },
    gap: {
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
    margin: {
      xs: 'mb-2',
      sm: 'mb-4',
      md: 'mb-6',
      lg: 'mb-8',
      responsive: 'mb-4 sm:mb-6 md:mb-8',
    },
  },

  // Typography Scale
  typography: {
    pageTitle: 'text-3xl md:text-4xl font-bold text-gray-900',
    sectionTitle: 'text-2xl md:text-3xl font-bold text-gray-900',
    cardTitle: 'text-xl md:text-2xl font-bold text-gray-900',
    subtitle: 'text-lg text-gray-600',
    body: 'text-base text-gray-700',
    small: 'text-sm text-gray-600',
    tiny: 'text-xs text-gray-500',
  },

  // Color Classes (using design tokens)
  colors: {
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
      white: 'text-white',
    },
    bg: {
      light: 'bg-gray-50',
      white: 'bg-white',
      primary: 'bg-primary-50',
      success: 'bg-success-50',
      warning: 'bg-warning-50',
      error: 'bg-error-50',
    },
    border: {
      light: 'border-gray-200',
      medium: 'border-gray-300',
      dark: 'border-gray-400',
      primary: 'border-primary-600',
    },
  },

  // Shadow Classes
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },

  // Border Radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: 'max-w-[767px]',
    tablet: 'min-w-[768px] max-w-[1023px]',
    desktop: 'min-w-[1024px]',
  },

  // Common Patterns
  patterns: {
    dashboardPage: 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    dashboardMain: 'max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24',
    dashboardMainNoHeader: 'max-w-7xl mx-auto px-4 md:px-6 py-4 sm:py-8',
    pageHeader: 'mb-6 md:mb-8',
    cardSpacing: 'mb-6 md:mb-8',
    buttonGroup: 'mt-8 flex flex-col sm:flex-row gap-4 justify-center',
  },
} as const

/**
 * Helper function to combine design system classes
 */
export function ds(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Common component class builders
 */
export const buildClasses = {
  dashboardPage: () => DesignSystem.patterns.dashboardPage,
  
  dashboardHeader: (fixed = true) => 
    fixed ? DesignSystem.headers.fixed : DesignSystem.headers.static,
  
  dashboardMain: (hasFixedHeader = true) =>
    hasFixedHeader 
      ? DesignSystem.patterns.dashboardMain 
      : DesignSystem.patterns.dashboardMainNoHeader,
  
  card: (variant: 'base' | 'elevated' | 'highlighted' | 'gradient' = 'base') =>
    DesignSystem.cards[variant],
  
  pageTitle: () => 
    `${DesignSystem.typography.pageTitle} arabic-text text-right`,
  
  subtitle: () =>
    `${DesignSystem.typography.subtitle} arabic-text text-right`,
}
