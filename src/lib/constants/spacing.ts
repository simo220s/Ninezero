/**
 * Responsive Spacing Constants
 * 
 * Optimized spacing values for desktop, tablet, and mobile layouts
 * Reduces excessive padding on desktop while maintaining mobile usability
 */

export const SPACING = {
  // Mobile spacing (default)
  mobile: {
    section: 'py-4 px-4',
    sectionY: 'py-4',
    sectionX: 'px-4',
    card: 'p-4',
    cardY: 'py-4',
    cardX: 'px-4',
    gap: 'gap-4',
    gapY: 'gap-y-4',
    gapX: 'gap-x-4',
    margin: 'm-4',
    marginY: 'my-4',
    marginX: 'mx-4',
  },
  
  // Tablet spacing
  tablet: {
    section: 'md:py-6 md:px-6',
    sectionY: 'md:py-6',
    sectionX: 'md:px-6',
    card: 'md:p-6',
    cardY: 'md:py-6',
    cardX: 'md:px-6',
    gap: 'md:gap-6',
    gapY: 'md:gap-y-6',
    gapX: 'md:gap-x-6',
    margin: 'md:m-6',
    marginY: 'md:my-6',
    marginX: 'md:mx-6',
  },
  
  // Desktop spacing (optimized - reduced from py-12/py-16)
  desktop: {
    section: 'lg:py-6 lg:px-8',
    sectionY: 'lg:py-6',
    sectionX: 'lg:px-8',
    card: 'lg:p-6',
    cardY: 'lg:py-6',
    cardX: 'lg:px-8',
    gap: 'lg:gap-6',
    gapY: 'lg:gap-y-6',
    gapX: 'lg:gap-x-6',
    margin: 'lg:m-6',
    marginY: 'lg:my-6',
    marginX: 'lg:mx-8',
  },
} as const

/**
 * Combined responsive spacing classes
 * Use these for consistent spacing across all breakpoints
 */
export const RESPONSIVE_SPACING = {
  // Page sections
  section: `${SPACING.mobile.section} ${SPACING.tablet.section} ${SPACING.desktop.section}`,
  sectionY: `${SPACING.mobile.sectionY} ${SPACING.tablet.sectionY} ${SPACING.desktop.sectionY}`,
  sectionX: `${SPACING.mobile.sectionX} ${SPACING.tablet.sectionX} ${SPACING.desktop.sectionX}`,
  
  // Cards
  card: `${SPACING.mobile.card} ${SPACING.tablet.card} ${SPACING.desktop.card}`,
  cardY: `${SPACING.mobile.cardY} ${SPACING.tablet.cardY} ${SPACING.desktop.cardY}`,
  cardX: `${SPACING.mobile.cardX} ${SPACING.tablet.cardX} ${SPACING.desktop.cardX}`,
  
  // Gaps
  gap: `${SPACING.mobile.gap} ${SPACING.tablet.gap} ${SPACING.desktop.gap}`,
  gapY: `${SPACING.mobile.gapY} ${SPACING.tablet.gapY} ${SPACING.desktop.gapY}`,
  gapX: `${SPACING.mobile.gapX} ${SPACING.tablet.gapX} ${SPACING.desktop.gapX}`,
  
  // Margins
  margin: `${SPACING.mobile.margin} ${SPACING.tablet.margin} ${SPACING.desktop.margin}`,
  marginY: `${SPACING.mobile.marginY} ${SPACING.tablet.marginY} ${SPACING.desktop.marginY}`,
  marginX: `${SPACING.mobile.marginX} ${SPACING.tablet.marginX} ${SPACING.desktop.marginX}`,
} as const

/**
 * Empty state spacing (centered content)
 */
export const EMPTY_STATE_SPACING = {
  container: 'py-8 md:py-10 lg:py-12',
  icon: 'mb-4',
  text: 'mb-2',
} as const

/**
 * Loading state spacing
 */
export const LOADING_STATE_SPACING = {
  container: 'py-8 md:py-10 lg:py-12',
  spinner: 'mb-4',
} as const

/**
 * Header spacing
 */
export const HEADER_SPACING = {
  container: 'py-3 px-4 lg:py-4 lg:px-6',
  sticky: 'sticky top-0 z-30',
} as const

/**
 * Content spacing
 */
export const CONTENT_SPACING = {
  main: 'py-4 px-4 md:py-6 md:px-6 lg:py-6 lg:px-8',
  maxWidth: 'max-w-7xl mx-auto',
  section: 'space-y-6',
} as const

/**
 * Grid spacing
 */
export const GRID_SPACING = {
  cols1: 'grid grid-cols-1 gap-4 md:gap-6',
  cols2: 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6',
  cols3: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6',
  cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',
} as const

/**
 * Helper function to combine spacing classes
 */
export function combineSpacing(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get spacing for specific breakpoint
 */
export function getSpacing(
  type: keyof typeof SPACING.mobile,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'mobile'
): string {
  return SPACING[breakpoint][type]
}
