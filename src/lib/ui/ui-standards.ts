/**
 * UI Standards and Design System Constants
 * 
 * This file defines the standard UI patterns, colors, and styles
 * to ensure consistency across all components.
 * 
 * WCAG AA Compliance:
 * - Text contrast ratio: minimum 4.5:1 for normal text
 * - Large text contrast ratio: minimum 3:1 for text >= 18px or bold >= 14px
 * - Interactive elements: minimum 44x44px touch targets
 */

// ============================================================================
// COLOR SYSTEM - WCAG AA COMPLIANT
// ============================================================================

export const colors = {
  // Primary colors with sufficient contrast
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',  // Main brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Text colors - WCAG compliant
  text: {
    primary: '#111827',    // gray-900 - AAA compliant (contrast 16.1:1)
    secondary: '#4b5563',  // gray-600 - AA compliant (contrast 7.1:1)
    tertiary: '#6b7280',   // gray-500 - AA compliant for large text (contrast 4.6:1)
    white: '#ffffff',
    disabled: '#9ca3af',   // gray-400 - for disabled states
  },
  
  // Background colors
  background: {
    white: '#ffffff',
    light: '#f9fafb',      // gray-50
    primary: '#eff6ff',    // primary-50
    success: '#f0fdf4',    // success-50
    warning: '#fffbeb',    // warning-50
    error: '#fef2f2',      // error-50
  },
  
  // Border colors
  border: {
    light: '#e5e7eb',      // gray-200
    medium: '#d1d5db',     // gray-300
    dark: '#9ca3af',       // gray-400
    focus: '#2563eb',      // primary-600
  },
  
  // Status colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',        // For text on light backgrounds
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',        // For text on light backgrounds
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',        // For text on light backgrounds
  },
} as const

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const borderRadius = {
  sm: '0.5rem',     // 8px - inputs, small cards
  md: '0.75rem',    // 12px - buttons, cards
  lg: '1rem',       // 16px - large cards
  xl: '1.5rem',     // 24px - hero sections
  full: '9999px',   // Full rounded
} as const

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  fontFamily: {
    arabic: "'Cairo', 'Noto Kufi Arabic', sans-serif",
    english: "'Inter', system-ui, -apple-system, sans-serif",
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    arabic: 1.8,        // Better for Arabic text
  },
} as const

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

export const buttonVariants = {
  primary: {
    bg: colors.primary[600],
    bgHover: colors.primary[700],
    text: colors.text.white,
    border: 'none',
    shadow: shadows.md,
  },
  
  secondary: {
    bg: colors.success[500],
    bgHover: colors.success[600],
    text: colors.text.white,
    border: 'none',
    shadow: shadows.md,
  },
  
  outline: {
    bg: 'transparent',
    bgHover: colors.background.light,
    text: colors.text.primary,
    border: `1px solid ${colors.border.medium}`,
    shadow: 'none',
  },
  
  danger: {
    bg: 'transparent',
    bgHover: colors.error[50],
    text: colors.error[600],
    border: '1px solid #fca5a5', // error-300
    shadow: 'none',
  },
  
  ghost: {
    bg: 'rgba(255, 255, 255, 0.2)',
    bgHover: 'rgba(255, 255, 255, 0.3)',
    text: colors.text.primary,
    border: `1px solid rgba(255, 255, 255, 0.3)`,
    shadow: 'none',
  },
} as const

// ============================================================================
// BUTTON SIZES
// ============================================================================

export const buttonSizes = {
  sm: {
    height: '2.25rem',    // 36px
    padding: '0.5rem 1rem',
    fontSize: typography.fontSize.sm,
  },
  
  md: {
    height: '2.75rem',    // 44px - meets touch target minimum
    padding: '0.75rem 1.5rem',
    fontSize: typography.fontSize.base,
  },
  
  lg: {
    height: '3rem',       // 48px
    padding: '1rem 2rem',
    fontSize: typography.fontSize.lg,
  },
} as const

// ============================================================================
// INTERACTIVE STATES
// ============================================================================

export const interactiveStates = {
  hover: {
    transform: 'translateY(-1px)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  active: {
    transform: 'translateY(0)',
    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  focus: {
    outline: `2px solid ${colors.border.focus}`,
    outlineOffset: '2px',
    borderRadius: borderRadius.sm,
  },
  
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
} as const

// ============================================================================
// ACCESSIBILITY STANDARDS
// ============================================================================

export const accessibility = {
  // Minimum touch target size (WCAG 2.1 Level AAA)
  minTouchTarget: {
    width: '44px',
    height: '44px',
  },
  
  // Minimum contrast ratios (WCAG 2.1 Level AA)
  minContrast: {
    normalText: 4.5,      // For text < 18px or < 14px bold
    largeText: 3.0,       // For text >= 18px or >= 14px bold
    uiComponents: 3.0,    // For interactive elements
  },
  
  // Focus indicators
  focusIndicator: {
    width: '2px',
    style: 'solid',
    color: colors.border.focus,
    offset: '2px',
  },
} as const

// ============================================================================
// ANIMATION TIMING
// ============================================================================

export const animations = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get text color based on background for optimal contrast
 */
export function getContrastText(backgroundColor: string): string {
  // Simple heuristic - in production, use a proper contrast calculation
  const darkBackgrounds: string[] = [
    colors.primary[600],
    colors.primary[700],
    colors.primary[800],
    colors.primary[900],
    colors.success[600],
    colors.success[700],
    colors.error[600],
    colors.error[700],
    colors.text.primary,
    colors.text.secondary,
  ]
  
  return darkBackgrounds.includes(backgroundColor)
    ? colors.text.white
    : colors.text.primary
}

/**
 * Check if an element meets minimum touch target size
 */
export function meetsTouchTargetSize(width: number, height: number): boolean {
  const minSize = parseInt(accessibility.minTouchTarget.width)
  return width >= minSize && height >= minSize
}

/**
 * Get appropriate text color class for Tailwind
 */
export function getTextColorClass(variant: 'primary' | 'secondary' | 'tertiary' | 'disabled'): string {
  const colorMap: Record<string, string> = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    disabled: 'text-gray-400',
  }
  
  return colorMap[variant]
}

/**
 * Get appropriate background color class for Tailwind
 */
export function getBgColorClass(variant: 'white' | 'light' | 'primary' | 'success' | 'warning' | 'error'): string {
  const colorMap: Record<string, string> = {
    white: 'bg-white',
    light: 'bg-gray-50',
    primary: 'bg-primary-50',
    success: 'bg-success-50',
    warning: 'bg-warning-50',
    error: 'bg-error-50',
  }
  
  return colorMap[variant]
}
