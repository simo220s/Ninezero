/**
 * Color Constants for Consistent Styling
 * Centralized color class definitions to ensure consistent text visibility
 * and styling across the application
 */

export const TEXT_COLORS = {
  // Primary colors
  primary: 'text-blue-600',
  primaryDark: 'text-blue-700',
  primaryLight: 'text-blue-500',
  
  // Secondary colors
  secondary: 'text-gray-600',
  secondaryDark: 'text-gray-700',
  
  // Text hierarchy
  heading: 'text-gray-900',
  subheading: 'text-gray-800',
  body: 'text-gray-700',
  label: 'text-gray-700',
  value: 'text-gray-900',
  placeholder: 'text-gray-400',
  muted: 'text-gray-500',
  
  // Status colors
  error: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  
  // Interactive elements
  link: 'text-blue-600 hover:text-blue-700',
  linkVisited: 'text-purple-600',
  
  // Special cases
  white: 'text-white',
  black: 'text-black',
} as const;

export const BG_COLORS = {
  // Primary backgrounds
  primary: 'bg-blue-600',
  primaryHover: 'bg-blue-700',
  primaryLight: 'bg-blue-50',
  
  // Secondary backgrounds
  secondary: 'bg-gray-100',
  secondaryHover: 'bg-gray-200',
  
  // Base backgrounds
  white: 'bg-white',
  gray: 'bg-gray-50',
  
  // Status backgrounds
  error: 'bg-red-50',
  errorDark: 'bg-red-600',
  success: 'bg-green-50',
  successDark: 'bg-green-600',
  warning: 'bg-yellow-50',
  warningDark: 'bg-yellow-600',
  info: 'bg-blue-50',
  infoDark: 'bg-blue-600',
} as const;

export const BORDER_COLORS = {
  // Default borders
  default: 'border-gray-200',
  defaultHover: 'border-gray-300',
  
  // Primary borders
  primary: 'border-blue-600',
  primaryLight: 'border-blue-200',
  
  // Status borders
  error: 'border-red-200',
  success: 'border-green-200',
  warning: 'border-yellow-200',
  info: 'border-blue-200',
} as const;

/**
 * Button color combinations for consistent button styling
 */
export const BUTTON_COLORS = {
  primary: {
    bg: BG_COLORS.primary,
    bgHover: BG_COLORS.primaryHover,
    text: TEXT_COLORS.white,
  },
  secondary: {
    bg: BG_COLORS.secondary,
    bgHover: BG_COLORS.secondaryHover,
    text: TEXT_COLORS.heading,
  },
  success: {
    bg: BG_COLORS.successDark,
    bgHover: 'bg-green-700',
    text: TEXT_COLORS.white,
  },
  error: {
    bg: BG_COLORS.errorDark,
    bgHover: 'bg-red-700',
    text: TEXT_COLORS.white,
  },
} as const;

/**
 * Helper function to get text color class
 */
export const getTextColor = (variant: keyof typeof TEXT_COLORS): string => {
  return TEXT_COLORS[variant];
};

/**
 * Helper function to get background color class
 */
export const getBgColor = (variant: keyof typeof BG_COLORS): string => {
  return BG_COLORS[variant];
};

/**
 * Helper function to get border color class
 */
export const getBorderColor = (variant: keyof typeof BORDER_COLORS): string => {
  return BORDER_COLORS[variant];
};
