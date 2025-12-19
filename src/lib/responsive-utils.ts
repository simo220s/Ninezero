/**
 * Mobile Responsiveness Utilities
 * 
 * Comprehensive utilities for:
 * - Breakpoint management
 * - Touch optimization
 * - Viewport detection
 * - Responsive helpers
 * 
 * Task: Mobile Responsiveness Verification and Fixes
 */

// Tailwind breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

/**
 * Detect current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint | null {
  if (typeof window === 'undefined') return null

  const width = window.innerWidth

  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  
  return null // mobile
}

/**
 * Check if mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoints.md
}

/**
 * Check if tablet device
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg
}

/**
 * Check if desktop device
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= breakpoints.lg
}

/**
 * Check if touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Responsive class configurations
export const responsiveClasses = {
  // Container widths
  container: 'w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
  containerFluid: 'w-full px-4 sm:px-6 lg:px-8',
  
  // Grid systems
  gridAuto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  gridCards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  gridList: 'grid grid-cols-1 gap-3 sm:gap-4',
  
  // Flex layouts
  flexRow: 'flex flex-col sm:flex-row gap-4',
  flexRowReverse: 'flex flex-col-reverse sm:flex-row gap-4',
  flexCenter: 'flex flex-col sm:flex-row items-center justify-center gap-4',
  flexBetween: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
  
  // Spacing
  padding: 'p-4 sm:p-6 lg:p-8',
  paddingX: 'px-4 sm:px-6 lg:px-8',
  paddingY: 'py-4 sm:py-6 lg:py-8',
  margin: 'm-4 sm:m-6 lg:m-8',
  marginX: 'mx-4 sm:mx-6 lg:mx-8',
  marginY: 'my-4 sm:my-6 lg:my-8',
  gap: 'gap-3 sm:gap-4 lg:gap-6',
  
  // Typography
  heading: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
  subheading: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
  title: 'text-lg sm:text-xl font-semibold',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',
  
  // Buttons
  button: 'px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base',
  buttonSmall: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm',
  buttonLarge: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg',
  
  // Cards
  card: 'rounded-lg p-4 sm:p-6',
  cardCompact: 'rounded-lg p-3 sm:p-4',
  
  // Touch targets (minimum 44x44px for accessibility)
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Hide/show based on breakpoint
  hideOnMobile: 'hidden sm:block',
  hideOnTablet: 'hidden lg:block',
  showOnMobile: 'block sm:hidden',
  showOnTablet: 'hidden sm:block lg:hidden',
}

/**
 * Generate responsive grid classes
 */
export function createResponsiveGrid(config: {
  base?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  gap?: string
}): string {
  const { base = 1, sm, md, lg, xl, gap = 'gap-4' } = config
  
  const classes = ['grid', gap]
  
  classes.push(`grid-cols-${base}`)
  if (sm) classes.push(`sm:grid-cols-${sm}`)
  if (md) classes.push(`md:grid-cols-${md}`)
  if (lg) classes.push(`lg:grid-cols-${lg}`)
  if (xl) classes.push(`xl:grid-cols-${xl}`)
  
  return classes.join(' ')
}

/**
 * Mobile-first table wrapper
 */
export const responsiveTable = {
  wrapper: 'overflow-x-auto -mx-4 sm:mx-0',
  table: 'min-w-full divide-y divide-gray-200',
  thead: 'bg-gray-50 hidden sm:table-header-group',
  tbody: 'bg-white divide-y divide-gray-200',
  tr: 'block sm:table-row border-b sm:border-none',
  th: 'px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider',
  td: 'block sm:table-cell px-3 py-2 sm:py-4 text-sm text-gray-900 before:content-[attr(data-label)] before:float-left before:font-bold before:sm:hidden',
}

/**
 * Mobile menu classes
 */
export const mobileMenu = {
  overlay: 'fixed inset-0 bg-black/50 z-40 lg:hidden',
  sidebar: `
    fixed inset-y-0 right-0 z-50 w-full sm:w-80
    bg-white shadow-xl
    transform transition-transform duration-300 ease-in-out
    lg:hidden
  `,
  sidebarOpen: 'translate-x-0',
  sidebarClosed: 'translate-x-full',
}

/**
 * Optimize for touch interactions
 */
export function optimizeTouch(element: HTMLElement) {
  // Prevent double-tap zoom
  element.style.touchAction = 'manipulation'
  
  // Add active state for better feedback
  element.addEventListener('touchstart', () => {
    element.classList.add('active')
  })
  
  element.addEventListener('touchend', () => {
    element.classList.remove('active')
  })
  
  element.addEventListener('touchcancel', () => {
    element.classList.remove('active')
  })
}

/**
 * Detect viewport height (accounting for mobile browsers)
 */
export function getActualViewportHeight(): number {
  if (typeof window === 'undefined') return 0
  return window.innerHeight
}

/**
 * Set CSS custom property for viewport height
 */
export function setViewportHeight() {
  if (typeof document === 'undefined') return
  
  const vh = getActualViewportHeight() * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
  
  // Update on resize
  window.addEventListener('resize', () => {
    const vh = getActualViewportHeight() * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  })
}

/**
 * Mobile-friendly modal config
 */
export const mobileModal = {
  overlay: 'fixed inset-0 bg-black/50 z-50',
  content: `
    fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2
    sm:-translate-x-1/2 sm:-translate-y-1/2
    w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh]
    bg-white rounded-t-2xl sm:rounded-lg
    overflow-y-auto z-50
  `,
}

/**
 * Responsive image loading
 */
export function getResponsiveImageSize(): 'small' | 'medium' | 'large' {
  if (typeof window === 'undefined') return 'medium'
  
  const width = window.innerWidth
  if (width < breakpoints.sm) return 'small'
  if (width < breakpoints.lg) return 'medium'
  return 'large'
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Lazy load on scroll (for mobile performance)
 */
export function lazyLoadOnScroll(
  elements: HTMLElement[],
  callback: (element: HTMLElement) => void,
  threshold = 100
) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: `${threshold}px`,
    }
  )

  elements.forEach((element) => observer.observe(element))

  return () => observer.disconnect()
}

/**
 * Mobile-friendly number input (prevent zoom on iOS)
 */
export function preventIOSZoom(input: HTMLInputElement) {
  input.style.fontSize = '16px' // Prevents iOS zoom
}

/**
 * Get safe area insets (for notched devices)
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 }
  
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  }
}

export default {
  breakpoints,
  getCurrentBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  responsiveClasses,
  createResponsiveGrid,
  responsiveTable,
  mobileMenu,
  optimizeTouch,
  getActualViewportHeight,
  setViewportHeight,
  mobileModal,
  getResponsiveImageSize,
  isInViewport,
  lazyLoadOnScroll,
  preventIOSZoom,
  getSafeAreaInsets,
}

