/**
 * UI/UX Enhancement Utilities
 * 
 * Centralized utilities for:
 * - Animation configurations
 * - Transition effects
 * - Loading states
 * - Modal improvements
 * - Accessibility helpers
 * 
 * Task: UI/UX Audit and Improvements
 */

// Animation configurations
export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  fadeInUp: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
  fadeInDown: 'animate-in fade-in slide-in-from-top-4 duration-300',
  
  // Slide animations
  slideInRight: 'animate-in slide-in-from-right duration-300',
  slideInLeft: 'animate-in slide-in-from-left duration-300',
  slideOutRight: 'animate-out slide-out-to-right duration-200',
  slideOutLeft: 'animate-out slide-out-to-left duration-200',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
  
  // Bounce animation
  bounce: 'animate-bounce',
  
  // Pulse animation
  pulse: 'animate-pulse',
  
  // Spin animation
  spin: 'animate-spin',
}

// Transition configurations
export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  
  colors: 'transition-colors duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
  shadow: 'transition-shadow duration-200 ease-in-out',
}

// Loading state classes
export const loadingStates = {
  skeleton: 'animate-pulse bg-gray-200 rounded',
  shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
  spinner: 'animate-spin rounded-full border-2 border-gray-200 border-t-primary-600',
}

// Modal improvements
export const modalClasses = {
  overlay: `
    fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
    data-[state=open]:${animations.fadeIn}
    data-[state=closed]:${animations.fadeOut}
  `,
  content: `
    fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
    w-full max-w-lg max-h-[85vh] overflow-y-auto
    bg-white rounded-lg shadow-xl
    data-[state=open]:${animations.fadeInUp}
    data-[state=closed]:${animations.fadeOut}
    focus:outline-none focus:ring-2 focus:ring-primary-500
  `,
  closeButton: `
    absolute right-4 top-4 rounded-sm opacity-70
    ring-offset-white transition-opacity
    hover:opacity-100 focus:outline-none focus:ring-2
    focus:ring-primary-500 focus:ring-offset-2
    disabled:pointer-events-none
  `,
}

// Button hover effects
export const buttonEffects = {
  lift: 'hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
  glow: 'hover:shadow-lg hover:shadow-primary-500/50',
  scale: 'hover:scale-105 active:scale-95',
  shine: 'relative overflow-hidden after:absolute after:inset-0 after:translate-x-[-100%] hover:after:translate-x-[100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:transition-transform after:duration-700',
}

// Card hover effects
export const cardEffects = {
  lift: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
  glow: 'hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-200',
  border: 'hover:border-primary-300 transition-colors duration-200',
  scale: 'hover:scale-[1.02] transition-transform duration-200',
}

// Focus states for accessibility
export const focusStates = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  ringInset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500',
  underline: 'focus:outline-none focus:border-b-2 focus:border-primary-500',
}

// Text visibility improvements
export const textContrast = {
  highContrast: 'text-gray-900 dark:text-white',
  mediumContrast: 'text-gray-700 dark:text-gray-200',
  lowContrast: 'text-gray-600 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-400',
}

// Status indicators with proper colors
export const statusColors = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
}

// Responsive padding/margin
export const spacing = {
  section: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
  card: 'p-4 sm:p-6',
  cardHeader: 'px-4 pt-4 sm:px-6 sm:pt-6',
  cardContent: 'px-4 pb-4 sm:px-6 sm:pb-6',
}

// Typography scales
export const typography = {
  h1: 'text-3xl sm:text-4xl font-bold',
  h2: 'text-2xl sm:text-3xl font-bold',
  h3: 'text-xl sm:text-2xl font-semibold',
  h4: 'text-lg sm:text-xl font-semibold',
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
}

// Accessibility helpers
export const a11y = {
  srOnly: 'sr-only',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded',
  ariaLive: {
    polite: 'aria-live="polite"',
    assertive: 'aria-live="assertive"',
    off: 'aria-live="off"',
  },
}

/**
 * Apply smooth scroll behavior
 */
export function enableSmoothScroll() {
  if (typeof document !== 'undefined') {
    document.documentElement.style.scrollBehavior = 'smooth'
  }
}

/**
 * Create loading skeleton
 */
export function createSkeleton(count: number = 1, className: string = ''): string {
  return Array(count).fill(`${loadingStates.skeleton} ${className}`).join(' ')
}

/**
 * Get status color classes
 */
export function getStatusClass(status: 'success' | 'warning' | 'error' | 'info', type: 'bg' | 'text' | 'border' | 'badge' = 'badge'): string {
  return statusColors[status][type]
}

/**
 * Combine classes with proper spacing
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Create responsive grid classes
 */
export function responsiveGrid(cols: { sm?: number; md?: number; lg?: number; xl?: number } = {}): string {
  const classes = ['grid']
  
  if (cols.sm) classes.push(`grid-cols-${cols.sm}`)
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)
  
  return classes.join(' ')
}

/**
 * Announce to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return

  const announcer = document.createElement('div')
  announcer.setAttribute('role', 'status')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.className = 'sr-only'
  announcer.textContent = message

  document.body.appendChild(announcer)

  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

/**
 * Trap focus within an element (for modals)
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

export default {
  animations,
  transitions,
  loadingStates,
  modalClasses,
  buttonEffects,
  cardEffects,
  focusStates,
  textContrast,
  statusColors,
  spacing,
  typography,
  a11y,
  enableSmoothScroll,
  createSkeleton,
  getStatusClass,
  cn,
  responsiveGrid,
  announce,
  trapFocus,
}

