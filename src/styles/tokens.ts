/**
 * Design Tokens - Single Source of Truth
 * Centralized design system tokens for the LMS Dashboard
 * 
 * @version 1.0.0
 * @description All visual design decisions should reference these tokens
 */

export const tokens = {
  /**
   * Color System - Semantic color palette
   * All colors follow WCAG 2.1 AA contrast requirements
   */
  colors: {
    // Primary Brand Colors
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
    
    // Secondary Colors
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#ff9f43',  // Main secondary (orange)
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    
    // Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // Main success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // Main error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main info
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Neutral/Gray Scale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Text Colors (WCAG compliant)
    text: {
      primary: '#111827',      // gray-900 - AAA compliant on white
      secondary: '#4b5563',    // gray-600 - AA compliant on white
      tertiary: '#6b7280',     // gray-500 - AA compliant on white
      disabled: '#9ca3af',     // gray-400
      inverse: '#ffffff',      // white text on dark backgrounds
      link: '#2563eb',         // primary-600
      linkHover: '#1d4ed8',    // primary-700
    },
    
    // Surface/Background Colors
    surface: {
      base: '#ffffff',         // Main background
      elevated: '#f9fafb',     // Elevated cards/sections
      overlay: 'rgba(0, 0, 0, 0.5)',  // Modal backdrop
      hover: '#f3f4f6',        // Hover state
      pressed: '#e5e7eb',      // Pressed state
      disabled: '#f9fafb',     // Disabled background
    },
    
    // Border Colors
    border: {
      light: '#e5e7eb',        // gray-200 - Subtle borders
      medium: '#d1d5db',       // gray-300 - Default borders
      dark: '#9ca3af',         // gray-400 - Strong borders
      focus: '#2563eb',        // primary-600 - Focus ring
      error: '#dc2626',        // error-600 - Error borders
    },
    
    // Special Purpose
    whatsapp: '#25d366',
    facebook: '#1877f2',
    twitter: '#1da1f2',
    instagram: '#e4405f',
  },

  /**
   * Typography Scale
   * Based on 8px rhythm with responsive considerations
   */
  typography: {
    // Font Sizes
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },
    
    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    // Line Heights
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
      arabic: 1.8,         // Optimized for Arabic text
      arabicRelaxed: 2,    // Extra relaxed for Arabic
    },
    
    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    
    // Font Families
    fontFamily: {
      sans: ['Cairo', 'Noto Kufi Arabic', 'system-ui', 'sans-serif'],
      arabic: ['Cairo', 'Noto Kufi Arabic', 'sans-serif'],
      inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
  },

  /**
   * Spacing Scale
   * Based on 4px/8px rhythm for consistent spacing
   */
  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
  },

  /**
   * Border Radius
   * Unified rounding system
   */
  radius: {
    none: '0',
    sm: '0.5rem',      // 8px - Small elements (badges, tags)
    md: '0.75rem',     // 12px - Buttons, inputs, cards
    lg: '1rem',        // 16px - Large cards, sections
    xl: '1.5rem',      // 24px - Hero sections, modals
    '2xl': '2rem',     // 32px - Extra large sections
    full: '9999px',    // Pills, avatars, circular elements
  },

  /**
   * Shadows
   * Elevation system for depth perception
   */
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  /**
   * Z-Index Scale
   * Layering system for overlays
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    toast: 1700,
  },

  /**
   * Motion/Animation
   * Timing and easing for smooth interactions
   */
  motion: {
    // Duration
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    
    // Easing Functions
    easing: {
      linear: 'linear',
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  /**
   * Breakpoints
   * Responsive design breakpoints
   */
  breakpoints: {
    xs: '475px',     // Large mobile
    sm: '640px',     // Mobile landscape / Small tablet
    md: '768px',     // Tablet
    lg: '1024px',    // Desktop
    xl: '1280px',    // Large desktop
    '2xl': '1536px', // Extra large desktop
  },

  /**
   * Component Sizes
   * Standardized sizes for common components
   */
  components: {
    // Button Heights
    button: {
      sm: '2.5rem',    // 40px
      md: '2.75rem',   // 44px
      lg: '3rem',      // 48px
    },
    
    // Input Heights
    input: {
      sm: '2.5rem',    // 40px
      md: '2.75rem',   // 44px
      lg: '3rem',      // 48px
    },
    
    // Icon Sizes
    icon: {
      xs: '1rem',      // 16px
      sm: '1.25rem',   // 20px
      md: '1.5rem',    // 24px
      lg: '2rem',      // 32px
      xl: '2.5rem',    // 40px
    },
    
    // Avatar Sizes
    avatar: {
      xs: '1.5rem',    // 24px
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
      xl: '4rem',      // 64px
    },
  },

  /**
   * Container Widths
   * Max widths for content containers
   */
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

/**
 * Type-safe token access
 */
export type Tokens = typeof tokens

/**
 * Helper function to get nested token values
 */
export function getToken<T extends keyof Tokens>(
  category: T,
  ...path: string[]
): any {
  let value: any = tokens[category]
  for (const key of path) {
    value = value?.[key]
  }
  return value
}

/**
 * Export individual token categories for convenience
 */
export const {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  zIndex,
  motion,
  breakpoints,
  components,
  container,
} = tokens


