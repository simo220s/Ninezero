/**
 * RTL (Right-to-Left) Utility Functions
 * Helper functions for RTL-aware styling and layout
 * 
 * @version 1.0.0
 * @description Provides utilities for handling RTL layouts in Arabic/Hebrew interfaces
 */

/**
 * Determines if the current direction is RTL
 * Can be used with context or passed explicitly
 */
export function isRTL(): boolean {
  if (typeof document !== 'undefined') {
    return document.documentElement.dir === 'rtl' || 
           document.documentElement.lang === 'ar' ||
           document.documentElement.lang === 'he'
  }
  return true // Default to RTL for this Arabic-first application
}

/**
 * Returns the appropriate class based on text direction
 * @param ltrClass - Class to use for LTR layout
 * @param rtlClass - Class to use for RTL layout
 * @param direction - Optional explicit direction (defaults to auto-detect)
 */
export function rtlClass(
  ltrClass: string, 
  rtlClass: string, 
  direction?: 'ltr' | 'rtl'
): string {
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  return isRtl ? rtlClass : ltrClass
}

/**
 * Returns RTL-aware text alignment class
 * @param align - Desired alignment ('start', 'end', 'center')
 * @param direction - Optional explicit direction
 */
export function textAlign(
  align: 'start' | 'end' | 'center' = 'start',
  direction?: 'ltr' | 'rtl'
): string {
  if (align === 'center') return 'text-center'
  
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  
  if (align === 'start') {
    return isRtl ? 'text-right' : 'text-left'
  } else {
    return isRtl ? 'text-left' : 'text-right'
  }
}

/**
 * Returns RTL-aware flexbox justify class
 * @param justify - Desired justification ('start', 'end', 'center', 'between', 'around')
 * @param direction - Optional explicit direction
 */
export function flexJustify(
  justify: 'start' | 'end' | 'center' | 'between' | 'around' = 'start',
  direction?: 'ltr' | 'rtl'
): string {
  if (['center', 'between', 'around'].includes(justify)) {
    return `justify-${justify}`
  }
  
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  
  if (justify === 'start') {
    return isRtl ? 'justify-end' : 'justify-start'
  } else {
    return isRtl ? 'justify-start' : 'justify-end'
  }
}

/**
 * Returns RTL-aware flexbox items alignment class
 * @param align - Desired alignment ('start', 'end', 'center')
 * @param direction - Optional explicit direction
 */
export function flexItems(
  align: 'start' | 'end' | 'center' = 'start',
  direction?: 'ltr' | 'rtl'
): string {
  if (align === 'center') return 'items-center'
  
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  
  if (align === 'start') {
    return isRtl ? 'items-end' : 'items-start'
  } else {
    return isRtl ? 'items-start' : 'items-end'
  }
}

/**
 * Returns RTL-aware margin class
 * @param side - Side to apply margin ('start', 'end')
 * @param size - Size value (e.g., '2', '4', '6')
 * @param direction - Optional explicit direction
 */
export function margin(
  side: 'start' | 'end',
  size: string,
  direction?: 'ltr' | 'rtl'
): string {
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  
  if (side === 'start') {
    return isRtl ? `me-${size}` : `ms-${size}`
  } else {
    return isRtl ? `ms-${size}` : `me-${size}`
  }
}

/**
 * Returns RTL-aware padding class
 * @param side - Side to apply padding ('start', 'end')
 * @param size - Size value (e.g., '2', '4', '6')
 * @param direction - Optional explicit direction
 */
export function padding(
  side: 'start' | 'end',
  size: string,
  direction?: 'ltr' | 'rtl'
): string {
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  
  if (side === 'start') {
    return isRtl ? `pe-${size}` : `ps-${size}`
  } else {
    return isRtl ? `ps-${size}` : `pe-${size}`
  }
}

/**
 * Returns RTL-aware border class
 * @param side - Side to apply border ('start', 'end')
 * @param width - Border width (e.g., '', '2', '4')
 * @param direction - Optional explicit direction
 */
export function border(
  side: 'start' | 'end',
  width: string = '',
  direction?: 'ltr' | 'rtl'
): string {
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  const widthSuffix = width ? `-${width}` : ''
  
  if (side === 'start') {
    return isRtl ? `border-r${widthSuffix}` : `border-l${widthSuffix}`
  } else {
    return isRtl ? `border-l${widthSuffix}` : `border-r${widthSuffix}`
  }
}

/**
 * Returns RTL-aware rounded corner class
 * @param corner - Corner to round ('start-start', 'start-end', 'end-start', 'end-end')
 * @param size - Size value (e.g., 'sm', 'md', 'lg')
 * @param direction - Optional explicit direction
 */
export function rounded(
  corner: 'start-start' | 'start-end' | 'end-start' | 'end-end',
  size: string = '',
  direction?: 'ltr' | 'rtl'
): string {
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  const sizeSuffix = size ? `-${size}` : ''
  
  const cornerMap = {
    'start-start': isRtl ? 'rounded-tr' : 'rounded-tl',
    'start-end': isRtl ? 'rounded-tl' : 'rounded-tr',
    'end-start': isRtl ? 'rounded-br' : 'rounded-bl',
    'end-end': isRtl ? 'rounded-bl' : 'rounded-br',
  }
  
  return `${cornerMap[corner]}${sizeSuffix}`
}

/**
 * Returns RTL-aware transform class for positioning
 * @param direction - Optional explicit direction
 */
export function transformRTL(direction?: 'ltr' | 'rtl'): string {
  const isRtl = direction === 'rtl' || (direction === undefined && isRTL())
  return isRtl ? 'scale-x-[-1]' : ''
}

/**
 * Combines multiple class names, filtering out empty strings
 * @param classes - Array of class names or conditional classes
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Returns the appropriate direction attribute value
 */
export function getDirection(): 'ltr' | 'rtl' {
  return isRTL() ? 'rtl' : 'ltr'
}

/**
 * Hook-like function to get RTL-aware classes for common patterns
 */
export const rtlClasses = {
  // Text alignment
  textStart: () => textAlign('start'),
  textEnd: () => textAlign('end'),
  textCenter: () => 'text-center',
  
  // Flexbox
  justifyStart: () => flexJustify('start'),
  justifyEnd: () => flexJustify('end'),
  justifyCenter: () => 'justify-center',
  justifyBetween: () => 'justify-between',
  
  itemsStart: () => flexItems('start'),
  itemsEnd: () => flexItems('end'),
  itemsCenter: () => 'items-center',
  
  // Common spacing
  ms2: () => margin('start', '2'),
  ms4: () => margin('start', '4'),
  me2: () => margin('end', '2'),
  me4: () => margin('end', '4'),
  
  ps4: () => padding('start', '4'),
  ps6: () => padding('start', '6'),
  pe4: () => padding('end', '4'),
  pe6: () => padding('end', '6'),
  
  // Borders
  borderStart: () => border('start'),
  borderEnd: () => border('end'),
}

/**
 * Utility to create RTL-aware inline styles
 * @param styles - Style object with logical properties
 */
export function rtlStyle(styles: {
  marginStart?: string | number
  marginEnd?: string | number
  paddingStart?: string | number
  paddingEnd?: string | number
  borderStartWidth?: string | number
  borderEndWidth?: string | number
  [key: string]: any
}): React.CSSProperties {
  const isRtl = isRTL()
  const result: React.CSSProperties = { ...styles }
  
  // Convert logical properties to physical properties
  if (styles.marginStart !== undefined) {
    result[isRtl ? 'marginRight' : 'marginLeft'] = styles.marginStart
    delete result.marginStart
  }
  if (styles.marginEnd !== undefined) {
    result[isRtl ? 'marginLeft' : 'marginRight'] = styles.marginEnd
    delete result.marginEnd
  }
  if (styles.paddingStart !== undefined) {
    result[isRtl ? 'paddingRight' : 'paddingLeft'] = styles.paddingStart
    delete result.paddingStart
  }
  if (styles.paddingEnd !== undefined) {
    result[isRtl ? 'paddingLeft' : 'paddingRight'] = styles.paddingEnd
    delete result.paddingEnd
  }
  if (styles.borderStartWidth !== undefined) {
    result[isRtl ? 'borderRightWidth' : 'borderLeftWidth'] = styles.borderStartWidth
    delete result.borderStartWidth
  }
  if (styles.borderEndWidth !== undefined) {
    result[isRtl ? 'borderLeftWidth' : 'borderRightWidth'] = styles.borderEndWidth
    delete result.borderEndWidth
  }
  
  return result
}


